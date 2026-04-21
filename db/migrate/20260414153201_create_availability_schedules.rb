class CreateAvailabilitySchedules < ActiveRecord::Migration[7.2]
  def change
    create_table :availability_schedules do |t|
      t.references :owner, null: false, foreign_key: true
      t.string :name
      t.boolean :is_default
      t.string :schedule

      t.timestamps
    end
  end
end
