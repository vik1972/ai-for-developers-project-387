class BookingMailer < ApplicationMailer
  default from: "bookings@calendar.example.com"

  # Email sent to guest when booking is created
  def booking_created_guest(booking)
    @booking = booking
    @event = booking.event
    @owner = booking.owner

    mail(
      to: booking.guest_email,
      subject: "Бронирование подтверждено: #{@event.name}"
    )
  end

  # Email sent to owner when booking is created
  def booking_created_owner(booking)
    @booking = booking
    @event = booking.event
    @owner = booking.owner

    mail(
      to: @owner.email,
      subject: "Новое бронирование: #{@event.name}"
    )
  end

  # Reminder 24 hours before
  def reminder_24h(booking)
    @booking = booking
    @event = booking.event
    @owner = booking.owner

    mail(
      to: booking.guest_email,
      subject: "Напоминание: #{@event.name} завтра"
    )
  end

  # Reminder 1 hour before
  def reminder_1h(booking)
    @booking = booking
    @event = booking.event

    mail(
      to: booking.guest_email,
      subject: "Напоминание: #{@event.name} через час"
    )
  end

  # Booking cancelled
  def booking_cancelled_guest(booking)
    @booking = booking
    @event = booking.event
    @cancellation_reason = booking.cancellation_reason

    mail(
      to: booking.guest_email,
      subject: "Бронирование отменено: #{@event.name}"
    )
  end

  # Booking rescheduled
  def booking_rescheduled_guest(booking)
    @booking = booking
    @event = booking.event
    @old_slot = booking.rescheduled_from

    mail(
      to: booking.guest_email,
      subject: "Время изменено: #{@event.name}"
    )
  end
end
