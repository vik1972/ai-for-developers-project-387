class Api::PublicController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_owner, only: [ :owner_profile, :owner_events ]

  # GET /api/public/:slug - Get public owner profile
  def owner_profile
    unless @owner&.is_public
      return render json: { error: "Profile not found" }, status: :not_found
    end

    render json: @owner.public_profile
  end

  # GET /api/public/:slug/events - Get public events for an owner
  def owner_events
    unless @owner&.is_public
      return render json: { error: "Profile not found" }, status: :not_found
    end

    @events = @owner.events
    render json: @events
  end

  # Get all public event types for guests
  def events
    @events = Event.all.includes(:owner)
    render json: @events
  end

  # Get a specific event details for guests
  def event
    @event = Event.find(params[:id])
    render json: @event
  end

  # Create a new booking for guest
  def create_booking
    @booking = Booking.new(booking_params)

    if @booking.save
      # Send confirmation emails
      send_booking_emails(@booking)

      render json: @booking, status: :created
    else
      render json: @booking.errors, status: :unprocessable_entity
    end
  end

  private

  def send_booking_emails(booking)
    return unless booking.guest_email.present?

    begin
      # Email to guest
      BookingMailer.booking_created_guest(booking).deliver_later

      # Email to owner
      BookingMailer.booking_created_owner(booking).deliver_later
    rescue => e
      Rails.logger.error("Failed to send booking emails: #{e.message}")
      # Don't fail the booking if email fails
    end
  end

  private

  def set_owner
    @owner = Owner.find_by(slug: params[:slug])
  end

  def booking_params
    params.permit(
      :event_id, :slot, :guest_name, :guest_email, :guest_phone, :notes,
      :location_type, :guests_count, custom_fields: {}
    )
  end
end
