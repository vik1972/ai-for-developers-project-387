class Api::AvailableSlotsController < ApplicationController
  def index
    event_id = params[:event_id]
    date = params[:date]

    if event_id.blank? || date.blank?
      render json: { error: "event_id and date are required" }, status: :bad_request
      return
    end

    event = Event.find(event_id)
    owner = event.owner
    requested_date = Date.parse(date)

    # Check availability for this date
    availability = owner.availability_for(requested_date)

    available_slots = case availability[:type]
    when :exception
                        handle_exception_availability(availability[:data], event, requested_date)
    when :schedule
                        handle_schedule_availability(availability[:data], event, requested_date)
    end

    # Get occupied slots from bookings
    occupied_slots = Booking.where(event_id: event_id)
                           .where("DATE(slot) = ?", date)
                           .pluck(:slot)

    # Filter out occupied slots
    final_slots = filter_occupied_slots(available_slots, occupied_slots, event.duration)

    render json: {
      available_slots: final_slots,
      occupied_slots: occupied_slots.map { |s| s.is_a?(String) ? s : s.strftime("%Y-%m-%d %H:%M") }
    }
  rescue ArgumentError => e
    render json: { error: "Invalid date format: #{e.message}" }, status: :bad_request
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Event not found" }, status: :not_found
  end

  private

  # Handle exception availability
  def handle_exception_availability(exception, event, date)
    return [] unless exception.is_available

    # If partial availability with specific slots
    if exception.partial_availability?
      exception.available_slots_data.map do |time_str|
        "#{date} #{time_str}"
      end
    else
      # Full day available - use default business hours
      generate_slots_for_time_range(date, "09:00", "17:00", event.duration)
    end
  end

  # Handle schedule availability
  def handle_schedule_availability(day_schedule, event, date)
    return [] unless day_schedule["enabled"]

    start_time = day_schedule["start"] || "09:00"
    end_time = day_schedule["end"] || "17:00"

    generate_slots_for_time_range(date, start_time, end_time, event.duration)
  end

  # Generate slots for a time range
  def generate_slots_for_time_range(date, start_time_str, end_time_str, duration)
    slots = []
    date_str = date.to_s

    begin
      start_datetime = DateTime.parse("#{date_str} #{start_time_str}")
      end_datetime = DateTime.parse("#{date_str} #{end_time_str}")
      now = DateTime.now
      step = Rational(30, 1440) # 30 minutes as fraction of day

      current_time = start_datetime

      while current_time < end_datetime
        slot_end = current_time + Rational(duration, 1440) # duration in minutes as fraction of day

        # Skip slots that are in the past, but still advance
        if current_time < now
          current_time += step
          next
        end

        # Skip if slot extends beyond end time
        break if slot_end > end_datetime

        slots << current_time.strftime("%Y-%m-%d %H:%M")

        current_time += step
      end

      slots
    rescue ArgumentError => e
      Rails.logger.error("Error generating slots: #{e.message}")
      []
    end
  end

  def filter_occupied_slots(available_slots, occupied_slots, duration)
    return available_slots if occupied_slots.empty?

    occupied_strings = occupied_slots.map { |o| o.is_a?(String) ? o : o.strftime("%Y-%m-%d %H:%M") }

    available_slots.reject do |slot_str|
      occupied_strings.include?(slot_str)
    end
  end
end
