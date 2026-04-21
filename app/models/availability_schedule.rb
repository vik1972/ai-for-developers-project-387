class AvailabilitySchedule < ApplicationRecord
  belongs_to :owner

  validates :name, presence: true
  validates :schedule, presence: true

  before_save :set_default_if_needed

  DEFAULT_SCHEDULE = {
    "mon" => { "enabled" => true, "start" => "09:00", "end" => "17:00" },
    "tue" => { "enabled" => true, "start" => "09:00", "end" => "17:00" },
    "wed" => { "enabled" => true, "start" => "09:00", "end" => "17:00" },
    "thu" => { "enabled" => true, "start" => "09:00", "end" => "17:00" },
    "fri" => { "enabled" => true, "start" => "09:00", "end" => "17:00" },
    "sat" => { "enabled" => false, "start" => "09:00", "end" => "17:00" },
    "sun" => { "enabled" => false, "start" => "09:00", "end" => "17:00" }
  }.freeze

  def schedule_data
    JSON.parse(schedule || "{}")
  rescue JSON::ParserError
    DEFAULT_SCHEDULE
  end

  def schedule_data=(data)
    self.schedule = data.to_json
  end

  def self.default_for(owner)
    find_by(owner: owner, is_default: true) || create_default_for(owner)
  end

  def self.create_default_for(owner)
    create!(
      owner: owner,
      name: "Рабочие часы по умолчанию",
      schedule: DEFAULT_SCHEDULE.to_json,
      is_default: true
    )
  end

  def working_hours_for(date)
    day_key = date.strftime("%a").downcase[0..2]
    schedule_data[day_key] || { "enabled" => false }
  end

  private

  def set_default_if_needed
    if is_default && owner
      # Ensure only one default schedule per owner
      owner.availability_schedules.where.not(id: id).update_all(is_default: false)
    end
  end
end
