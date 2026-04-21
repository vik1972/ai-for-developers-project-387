class Booking < ApplicationRecord
  belongs_to :event
  has_one :owner, through: :event

  validates :event_id, presence: true
  validates :slot, presence: true
  validates :guest_email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true

  validate :slot_not_booked

  # Status constants
  STATUSES = %w[pending confirmed cancelled completed no_show].freeze
  LOCATION_TYPES = %w[zoom google_meet phone in_person].freeze

  # Default status
  after_initialize :set_default_status, if: :new_record?

  # Scopes
  scope :upcoming, -> { where("slot > ?", Time.now).where.not(status: "cancelled") }
  scope :past, -> { where("slot < ?", Time.now).where.not(status: "cancelled") }
  scope :cancelled, -> { where(status: "cancelled") }
  scope :confirmed, -> { where(status: "confirmed") }
  scope :pending, -> { where(status: "pending") }

  # Status transitions
  def confirm!
    update!(status: "confirmed") if status == "pending"
  end

  def cancel!(reason = nil)
    update!(
      status: "cancelled",
      cancelled_at: Time.now,
      cancellation_reason: reason
    ) unless status == "cancelled"
  end

  def complete!
    update!(status: "completed") if %w[pending confirmed].include?(status)
  end

  def mark_no_show!
    update!(status: "no_show") if %w[pending confirmed].include?(status)
  end

  def reschedule!(new_slot)
    old_slot = slot
    update!(
      slot: new_slot,
      rescheduled_from: old_slot,
      status: "confirmed"
    )
  end

  def upcoming?
    slot > Time.now && !cancelled?
  end

  def past?
    slot < Time.now
  end

  def cancelled?
    status == "cancelled"
  end

  def confirmed?
    status == "confirmed"
  end

  # Custom fields JSON handling
  def custom_fields_data
    JSON.parse(custom_fields || "{}")
  rescue JSON::ParserError
    {}
  end

  def custom_fields_data=(data)
    self.custom_fields = data.to_json
  end

  def as_json(options = {})
    options[:except] ||= []
    # Exclude fields that we add manually
    options[:except] = Array(options[:except]) + [ :custom_fields ]

    super(options).tap do |json|
      json[:guest_name] = guest_name if guest_name.present?
      json[:guest_email] = guest_email if guest_email.present?
      json[:guest_phone] = guest_phone if guest_phone.present?
      json[:notes] = notes if notes.present?
      json[:custom_fields] = custom_fields_data if custom_fields.present?
      json[:event] = event&.as_json if event.present?
    end
  end

  private

  def set_default_status
    self.status ||= "confirmed"
    self.guests_count ||= 1
  end

  def slot_not_booked
    # Skip validation for cancelled bookings being moved
    return if status == "cancelled"

    existing_booking = Booking.where(slot: slot)
                             .where.not(id: id)
                             .where.not(status: "cancelled")
                             .first
    if existing_booking
      errors.add(:slot, "This time slot is already booked")
    end
  end
end
