class Api::EventsController < ApplicationController
  before_action :set_event, only: [ :show, :destroy ]

  def index
    @events = Event.all
    render json: @events
  end

  def show
    render json: @event
  end

  def create
    @event = Event.new(event_params)
    @event.owner = Owner.predefined_owner

    if @event.save
      render json: @event, status: :created
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @event.destroy
    head :no_content
  end

  private

  def set_event
    @event = Event.find(params[:id])
  end

  def event_params
    params.require(:event).permit(:name, :description, :duration)
  end
end
