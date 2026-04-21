class Event < ApplicationRecord
  belongs_to :owner
  has_many :bookings, dependent: :destroy

  validates :name, presence: true, length: { minimum: 3, maximum: 100 }
  validates :description, presence: true, length: { maximum: 500 }
  validates :duration, presence: true, numericality: { greater_than: 0 }
  validates :owner_id, presence: true
end
