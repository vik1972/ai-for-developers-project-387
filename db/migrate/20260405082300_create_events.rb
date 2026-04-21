class CreateEvents < ActiveRecord::Migration[7.2]
  def change
    create_table :events do |t|
      t.string :name
      t.string :description
      t.integer :duration
      t.references :owner, null: false, foreign_key: true

      t.timestamps
    end
  end
end
