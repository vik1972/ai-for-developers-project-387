class Api::IntegrationsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_owner
  before_action :set_integration, only: [ :show, :destroy, :sync ]

  # GET /api/owner/integrations
  def index
    integrations = @owner.calendar_integrations.active
    render json: integrations.map { |i| integration_json(i) }
  end

  # GET /api/owner/integrations/:id
  def show
    render json: integration_json(@integration)
  end

  # POST /api/owner/integrations/connect
  # Start OAuth flow (placeholder - requires actual OAuth setup)
  def connect
    provider = params[:provider]

    unless %w[google zoom].include?(provider)
      return render json: { error: "Invalid provider" }, status: :bad_request
    end

    # This is a placeholder - real implementation requires:
    # 1. OAuth client credentials (Google Cloud Console / Zoom App)
    # 2. OAuth authorization URL generation
    # 3. OAuth callback handling

    render json: {
      message: "OAuth flow not implemented",
      note: "To implement: 1) Register app in #{provider} developer console, 2) Add credentials, 3) Implement OAuth flow",
      provider: provider,
      status: "placeholder"
    }
  end

  # DELETE /api/owner/integrations/:id
  def destroy
    @integration.update!(is_active: false)
    head :no_content
  end

  # POST /api/owner/integrations/:id/sync
  # Sync calendar (placeholder)
  def sync
    render json: {
      message: "Sync not implemented",
      note: "Real implementation would sync busy/free times from external calendar",
      integration: integration_json(@integration)
    }
  end

  # POST /api/owner/integrations/oauth_callback
  # OAuth callback handler (placeholder)
  def oauth_callback
    provider = params[:provider]
    code = params[:code]

    # Placeholder - real implementation would:
    # 1. Exchange code for access_token
    # 2. Store tokens in CalendarIntegration
    # 3. Redirect back to frontend

    render json: {
      message: "OAuth callback not implemented",
      note: "Real implementation would exchange code for tokens and save them",
      provider: provider,
      code_received: code.present?
    }
  end

  private

  def set_owner
    @owner = Owner.predefined_owner
  end

  def set_integration
    @integration = @owner.calendar_integrations.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Integration not found" }, status: :not_found
  end

  def integration_json(integration)
    {
      id: integration.id,
      provider: integration.provider,
      calendar_id: integration.calendar_id,
      is_active: integration.is_active,
      expired: integration.expired?,
      created_at: integration.created_at
    }
  end
end
