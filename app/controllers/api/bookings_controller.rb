class Api::BookingsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_booking, only: [ :show, :destroy, :update_status, :cancel, :reschedule ]

  # GET /api/bookings - List bookings with filters
  def index
    bookings = Booking.includes(:event)

    # Apply filters
    if params[:status].present?
      bookings = bookings.where(status: params[:status])
    end

    if params[:event_id].present?
      bookings = bookings.where(event_id: params[:event_id])
    end

    if params[:from_date].present? && params[:to_date].present?
      bookings = bookings.where(slot: params[:from_date]..params[:to_date])
    elsif params[:from_date].present?
      bookings = bookings.where("slot >= ?", params[:from_date])
    elsif params[:to_date].present?
      bookings = bookings.where("slot <= ?", params[:to_date])
    end

    # Filter by upcoming/past
    case params[:time_filter]
    when "upcoming"
      bookings = bookings.upcoming
    when "past"
      bookings = bookings.past
    when "today"
      bookings = bookings.where("DATE(slot) = ?", Date.today)
    end

    # Search by guest name or email
    if params[:search].present?
      search = "%#{params[:search]}%"
      bookings = bookings.where(
        "guest_name ILIKE ? OR guest_email ILIKE ? OR notes ILIKE ?",
        search, search, search
      )
    end

    # Sorting
    sort_by = params[:sort_by] || "slot"
    sort_order = params[:sort_order] || "asc"
    bookings = bookings.order(sort_by => sort_order)

    # Pagination
    page = (params[:page] || 1).to_i
    per_page = (params[:per_page] || 20).to_i
    per_page = [ per_page, 100 ].min # Max 100 per page

    total_count = bookings.count
    paginated_bookings = bookings.limit(per_page).offset((page - 1) * per_page)

    render json: {
      bookings: paginated_bookings.as_json,
      meta: {
        total_count: total_count,
        page: page,
        per_page: per_page,
        total_pages: (total_count.to_f / per_page).ceil
      }
    }
  end

  # GET /api/bookings/:id
  def show
    render json: @booking
  end

  def create
    @booking = Booking.new(booking_params)

    if @booking.save
      render json: @booking, status: :created
    else
      render json: @booking.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @booking.destroy
    head :no_content
  end

  # PATCH /api/bookings/:id/status
  def update_status
    new_status = params[:status]

    unless Booking::STATUSES.include?(new_status)
      return render json: { error: "Invalid status" }, status: :bad_request
    end

    case new_status
    when "confirmed"
      @booking.confirm!
    when "completed"
      @booking.complete!
    when "no_show"
      @booking.mark_no_show!
    when "cancelled"
      # Use cancel endpoint instead
      return render json: { error: "Use cancel endpoint to cancel booking" }, status: :bad_request
    end

    render json: @booking
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  # POST /api/bookings/:id/cancel
  def cancel
    @booking.cancel!(params[:reason])

    # Send cancellation email to guest
    if @booking.guest_email.present?
      begin
        BookingMailer.booking_cancelled_guest(@booking).deliver_later
      rescue => e
        Rails.logger.error("Failed to send cancellation email: #{e.message}")
      end
    end

    render json: @booking
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  # POST /api/bookings/:id/reschedule
  def reschedule
    new_slot = params[:new_slot]

    if new_slot.blank?
      return render json: { error: "new_slot is required" }, status: :bad_request
    end

    @booking.reschedule!(new_slot)

    # Send reschedule email to guest
    if @booking.guest_email.present?
      begin
        BookingMailer.booking_rescheduled_guest(@booking).deliver_later
      rescue => e
        Rails.logger.error("Failed to send reschedule email: #{e.message}")
      end
    end

    render json: @booking
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  # POST /api/bookings/bulk_cancel
  def bulk_cancel
    ids = params[:ids]
    reason = params[:reason]

    if ids.blank? || !ids.is_a?(Array)
      return render json: { error: "ids array is required" }, status: :bad_request
    end

    bookings = Booking.where(id: ids)
    cancelled_count = 0

    bookings.each do |booking|
      begin
        booking.cancel!(reason)
        cancelled_count += 1
      rescue ActiveRecord::RecordInvalid
        # Skip if can't cancel
      end
    end

    render json: {
      cancelled: cancelled_count,
      failed: bookings.count - cancelled_count,
      message: "#{cancelled_count} bookings cancelled"
    }
  end

  # POST /api/bookings/bulk_update_status
  def bulk_update_status
    ids = params[:ids]
    new_status = params[:status]

    if ids.blank? || !ids.is_a?(Array)
      return render json: { error: "ids array is required" }, status: :bad_request
    end

    unless Booking::STATUSES.include?(new_status)
      return render json: { error: "Invalid status" }, status: :bad_request
    end

    bookings = Booking.where(id: ids)
    updated_count = 0

    bookings.each do |booking|
      begin
        booking.update!(status: new_status)
        updated_count += 1
      rescue ActiveRecord::RecordInvalid
        # Skip if can't update
      end
    end

    render json: {
      updated: updated_count,
      failed: bookings.count - updated_count,
      message: "#{updated_count} bookings updated"
    }
  end

  private

  def set_booking
    @booking = Booking.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Booking not found" }, status: :not_found
  end

  def booking_params
    params.require(:booking).permit(
      :event_id, :slot, :guest_name, :guest_email, :guest_phone, :notes,
      :location_type, :guests_count, custom_fields: {}
    )
  end
end
