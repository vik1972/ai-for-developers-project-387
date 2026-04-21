class Api::OwnerController < ApplicationController
  before_action :set_owner
  skip_before_action :verify_authenticity_token

  # Get owner information
  def show
    render json: @owner
  end

  # Get owner dashboard with all events and bookings
  def dashboard
    @events = @owner.events.includes(:bookings)
    @all_bookings = @owner.bookings.includes(:event).order(:slot)

    render json: {
      owner: @owner,
      events: @events,
      bookings: @all_bookings
    }
  end

  # Create a new event type
  def create_event
    @event = Event.new(event_params)
    @event.owner = @owner

    if @event.save
      render json: @event, status: :created
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  # Delete an event type
  def delete_event
    @event = @owner.events.find(params[:id])
    @event.destroy
    head :no_content
  end

  # Get all owner bookings
  def bookings
    @bookings = @owner.bookings.includes(:event).order(:slot)
    render json: @bookings
  end

  # Delete a booking
  def delete_booking
    @booking = @owner.bookings.find(params[:id])
    @booking.destroy
    head :no_content
  end

  private

  def set_owner
    @owner = Owner.predefined_owner
  end

  def event_params
    params.permit(:name, :description, :duration)
  end
end
