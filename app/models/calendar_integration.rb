class CalendarIntegration < ApplicationRecord
  belongs_to :owner

  validates :provider, presence: true, inclusion: { in: %w[google zoom] }
  validates :access_token, presence: true

  scope :active, -> { where(is_active: true) }
  scope :google, -> { where(provider: "google") }
  scope :zoom, -> { where(provider: "zoom") }

  def expired?
    expires_at.present? && expires_at < Time.now
  end

  def google?
    provider == "google"
  end

  def zoom?
    provider == "zoom"
  end
end
