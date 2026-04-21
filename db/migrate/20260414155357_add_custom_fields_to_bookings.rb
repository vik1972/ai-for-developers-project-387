class AddCustomFieldsToBookings < ActiveRecord::Migration[7.2]
  def change
    add_column :bookings, :custom_fields, :string
  end
end
