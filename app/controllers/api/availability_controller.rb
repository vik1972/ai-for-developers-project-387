class Api::AvailabilityController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_owner

  # GET /api/owner/availability/schedules
  def schedules
    schedules = @owner.availability_schedules.order(:created_at)
    render json: schedules.map { |s| schedule_json(s) }
  end

  # GET /api/owner/availability/schedules/:id
  def show_schedule
    schedule = @owner.availability_schedules.find(params[:id])
    render json: schedule_json(schedule)
  end

  # POST /api/owner/availability/schedules
  def create_schedule
    schedule = @owner.availability_schedules.new(schedule_params)

    if schedule.save
      # If this is the first schedule, make it default
      if @owner.availability_schedules.count == 1
        schedule.update(is_default: true)
      end

      render json: schedule_json(schedule), status: :created
    else
      render json: { errors: schedule.errors }, status: :unprocessable_entity
    end
  end

  # PUT /api/owner/availability/schedules/:id
  def update_schedule
    schedule = @owner.availability_schedules.find(params[:id])

    if schedule.update(schedule_params)
      render json: schedule_json(schedule)
    else
      render json: { errors: schedule.errors }, status: :unprocessable_entity
    end
  end

  # DELETE /api/owner/availability/schedules/:id
  def delete_schedule
    schedule = @owner.availability_schedules.find(params[:id])

    # Don't allow deleting the default schedule
    if schedule.is_default && @owner.availability_schedules.count > 1
      render json: { error: "Cannot delete default schedule. Set another as default first." },
             status: :unprocessable_entity
      return
    end

    schedule.destroy
    head :no_content
  end

  # GET /api/owner/availability/exceptions
  def exceptions
    exceptions = @owner.availability_exceptions
                        .where("date >= ?", Date.today)
                        .order(:date)
    render json: exceptions.map { |e| exception_json(e) }
  end

  # POST /api/owner/availability/exceptions
  def create_exception
    exception = @owner.availability_exceptions.new(exception_params)

    if exception.save
      render json: exception_json(exception), status: :created
    else
      render json: { errors: exception.errors }, status: :unprocessable_entity
    end
  end

  # DELETE /api/owner/availability/exceptions/:id
  def delete_exception
    exception = @owner.availability_exceptions.find(params[:id])
    exception.destroy
    head :no_content
  end

  # GET /api/owner/availability/preview
  def preview
    start_date = Date.parse(params[:start_date] || Date.today.to_s)
    end_date = Date.parse(params[:end_date] || (Date.today + 7).to_s)

    preview = (start_date..end_date).map do |date|
      availability = @owner.availability_for(date)

      case availability[:type]
      when :exception
        {
          date: date.to_s,
          type: "exception",
          is_available: availability[:data].is_available,
          reason: availability[:data].reason
        }
      when :schedule
        {
          date: date.to_s,
          type: "schedule",
          enabled: availability[:data]["enabled"],
          start: availability[:data]["start"],
          end: availability[:data]["end"]
        }
      end
    end

    render json: preview
  end

  private

  def set_owner
    @owner = Owner.predefined_owner
  end

  def schedule_params
    params.require(:schedule).permit(:name, :is_default, schedule: {})
  end

  def exception_params
    params.require(:exception).permit(:date, :is_available, :reason, available_slots: [])
  end

  def schedule_json(schedule)
    {
      id: schedule.id,
      name: schedule.name,
      is_default: schedule.is_default,
      schedule: schedule.schedule_data
    }
  end

  def exception_json(exception)
    {
      id: exception.id,
      date: exception.date.to_s,
      is_available: exception.is_available,
      reason: exception.reason,
      available_slots: exception.available_slots_data
    }
  end
end
