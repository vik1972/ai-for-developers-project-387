class Owner < ApplicationRecord
  has_many :events
  has_many :bookings, through: :events
  has_many :availability_schedules, dependent: :destroy
  has_many :availability_exceptions, dependent: :destroy
  has_many :calendar_integrations, dependent: :destroy

  validates :slug, uniqueness: true, allow_blank: true
  validates :email, presence: true

  after_create :create_default_schedule

  def default_schedule
    availability_schedules.find_by(is_default: true) ||
      availability_schedules.create_default_for(self)
  end

  def availability_for(date)
    # Check for exception first
    exception = availability_exceptions.find_by(date: date)
    if exception
      return { type: :exception, data: exception }
    end

    # Fall back to default schedule
    schedule = default_schedule
    day_schedule = schedule.working_hours_for(date)

    { type: :schedule, data: day_schedule }
  end

  def create_default_schedule
    availability_schedules.create_default_for(self) unless availability_schedules.exists?
  end

  # Working hours stored as JSON string in SQLite
  def working_hours_schedule
    JSON.parse(working_hours || "{}")
  rescue JSON::ParserError
    {}
  end

  def working_hours_schedule=(schedule)
    self.working_hours = schedule.to_json
  end

  # Generate slug from name if not set
  def generate_slug!
    return if slug.present?

    base_slug = name.to_s.parameterize
    unique_slug = base_slug
    counter = 1

    while Owner.exists?(slug: unique_slug)
      unique_slug = "#{base_slug}-#{counter}"
      counter += 1
    end

    update!(slug: unique_slug)
  end

  def public_profile
    {
      slug: slug,
      name: name,
      email: email,
      bio: bio,
      avatar_url: avatar_url,
      timezone: timezone,
      is_public: is_public
    }
  end

  def self.predefined_owner
    owner = first_or_create!(
      name: "Default Owner",
      email: "owner@example.com"
    )
    owner.generate_slug! if owner.slug.blank?
    owner
  end
end
