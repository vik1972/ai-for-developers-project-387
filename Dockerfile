# syntax = docker/dockerfile:1

# Multi-stage Dockerfile for Rails API + React frontend
# Final image serves both from a single port

# ============================================================
# Stage 1: Build frontend (React + Vite)
# ============================================================
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json* frontend/npm-shrinkwrap.json* ./
RUN npm ci || npm install

COPY frontend/ .
RUN npm run build

# ============================================================
# Stage 2: Base Ruby image
# ============================================================
FROM docker.io/library/ruby:3.3.6-slim AS base
ARG RUBY_VERSION=3.3.6
ARG PORT=8080

WORKDIR /rails

# Install base packages including PostgreSQL client
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libjemalloc2 libvips libpq5 && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Set production environment
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development"

# ============================================================
# Stage 3: Build gems and application
# ============================================================
FROM base AS build

# Install packages needed to build gems (including PostgreSQL)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libyaml-dev pkg-config libpq-dev && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install application gems
COPY Gemfile Gemfile.lock ./
RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile

# Copy application code
COPY . .

# Copy built frontend from stage 1
COPY --from=frontend-build /frontend/dist ./frontend/dist

# Precompile bootsnap code for faster boot times
RUN bundle exec bootsnap precompile app/ lib/

# ============================================================
# Stage 4: Final image
# ============================================================
FROM base

# Copy built artifacts: gems, application
COPY --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --from=build /rails /rails

# Copy built frontend into public directory for Rails to serve
RUN mkdir -p public && cp -r frontend/dist/* public/ 2>/dev/null || true

# Run and own only the runtime files as a non-root user for security
RUN groupadd --system --gid 1000 rails && \
    adduser --uid 1000 --gid 1000 --home /home/rails --shell /bin/bash --disabled-password --gecos "" rails && \
    mkdir -p db log storage tmp public && \
    chown -R rails:rails db log storage tmp public
USER 1000:1000

# Entrypoint prepares the database
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start the server by default, this can be overwritten at runtime
ARG PORT=8080
ENV PORT=$PORT
EXPOSE $PORT
CMD ["/bin/sh", "-c", "./bin/rails server -b 0.0.0.0 -p ${PORT:-8080}"]
