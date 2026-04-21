class CreateBookings < ActiveRecord::Migration[7.2]
  def change
    create_table :bookings do |t|
      t.integer :event_id
      t.datetime :slot

      t.timestamps
    end
  end
end
