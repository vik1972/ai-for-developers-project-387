class CreateAvailabilityExceptions < ActiveRecord::Migration[7.2]
  def change
    create_table :availability_exceptions do |t|
      t.references :owner, null: false, foreign_key: true
      t.date :date
      t.boolean :is_available
      t.text :available_slots
      t.string :reason

      t.timestamps
    end
  end
end
