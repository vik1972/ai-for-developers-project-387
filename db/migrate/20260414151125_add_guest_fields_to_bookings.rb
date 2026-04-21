class AddGuestFieldsToBookings < ActiveRecord::Migration[7.2]
  def change
    add_column :bookings, :guest_name, :string
    add_column :bookings, :guest_email, :string
    add_column :bookings, :guest_phone, :string
    add_column :bookings, :notes, :text
  end
end
