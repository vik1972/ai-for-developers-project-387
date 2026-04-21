Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # API routes
  namespace :api do
    scope "public", as: nil do
      get "events", to: "public#events"
      get "events/:id", to: "public#event"
      post "bookings", to: "public#create_booking"
      get "/:slug", to: "public#owner_profile", constraints: { slug: /[^\/]+/ }
      get "/:slug/events", to: "public#owner_events", constraints: { slug: /[^\/]+/ }
    end

    scope "owner", as: nil do
      get "dashboard", to: "owner#dashboard"
      get "bookings", to: "owner#bookings"
      post "events", to: "owner#create_event"
      delete "events/:id", to: "owner#delete_event"
      delete "bookings/:id", to: "owner#delete_booking"

      # Availability routes
      get "availability/schedules", to: "availability#schedules"
      get "availability/schedules/:id", to: "availability#show_schedule"
      post "availability/schedules", to: "availability#create_schedule"
      put "availability/schedules/:id", to: "availability#update_schedule"
      delete "availability/schedules/:id", to: "availability#delete_schedule"

      get "availability/exceptions", to: "availability#exceptions"
      post "availability/exceptions", to: "availability#create_exception"
      delete "availability/exceptions/:id", to: "availability#delete_exception"

      get "availability/preview", to: "availability#preview"

      # Integrations routes (Google Calendar, Zoom)
      get "integrations", to: "integrations#index"
      get "integrations/:id", to: "integrations#show"
      post "integrations/connect", to: "integrations#connect"
      delete "integrations/:id", to: "integrations#destroy"
      post "integrations/:id/sync", to: "integrations#sync"
      post "integrations/oauth_callback", to: "integrations#oauth_callback"
    end

    resources :events, only: [ :index, :show, :create, :destroy ]
    resources :bookings, only: [ :index, :show, :create, :destroy ] do
      member do
        patch :status, to: "bookings#update_status"
        post :cancel
        post :reschedule
      end
      collection do
        post :bulk_cancel
        post :bulk_update_status
      end
    end
    get "available_slots", to: "available_slots#index"
    get "owner", to: "owners#show"
    get "owner/dashboard", to: "owners#dashboard"
  end

  # Defines the root path route ("/")
  root "static#index"

  # Catch-all route for React SPA (must be last)
  get "*path", to: "static#index", constraints: ->(req) { !req.path.start_with?("/api/", "/up", "/rails/") }
end
