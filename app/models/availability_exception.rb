class AvailabilityException < ApplicationRecord
  belongs_to :owner

  validates :date, presence: true
  validates :date, uniqueness: { scope: :owner_id }

  def available_slots_data
    JSON.parse(available_slots || "[]")
  rescue JSON::ParserError
    []
  end

  def available_slots_data=(slots)
    self.available_slots = slots.to_json
  end

  def full_day_off?
    !is_available
  end

  def partial_availability?
    is_available && available_slots_data.present?
  end
end
