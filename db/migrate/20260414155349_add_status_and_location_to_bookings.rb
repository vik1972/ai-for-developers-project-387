class AddStatusAndLocationToBookings < ActiveRecord::Migration[7.2]
  def change
    add_column :bookings, :status, :string
    add_column :bookings, :location_type, :string
    add_column :bookings, :location_url, :string
    add_column :bookings, :guests_count, :integer
    add_column :bookings, :cancelled_at, :datetime
    add_column :bookings, :cancellation_reason, :text
    add_column :bookings, :rescheduled_from, :datetime
  end
end
