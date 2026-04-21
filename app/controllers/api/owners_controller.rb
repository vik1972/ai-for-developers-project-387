class Api::OwnersController < ApplicationController
  before_action :set_owner, only: [ :show, :dashboard ]

  def show
    render json: @owner
  end

  def dashboard
    @events = @owner.events.includes(:bookings)
    @all_bookings = @owner.bookings.order(:slot)

    render json: {
      owner: @owner,
      events: @events,
      bookings: @all_bookings
    }
  end

  private

  def set_owner
    @owner = Owner.predefined_owner
  end
end
