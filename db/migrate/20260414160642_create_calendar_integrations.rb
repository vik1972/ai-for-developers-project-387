class CreateCalendarIntegrations < ActiveRecord::Migration[7.2]
  def change
    create_table :calendar_integrations do |t|
      t.references :owner, null: false, foreign_key: true
      t.string :provider
      t.string :access_token
      t.string :refresh_token
      t.datetime :expires_at
      t.string :calendar_id
      t.boolean :is_active

      t.timestamps
    end
  end
end
