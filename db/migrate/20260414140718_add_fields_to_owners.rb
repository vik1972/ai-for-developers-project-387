class AddFieldsToOwners < ActiveRecord::Migration[7.2]
  def change
    add_column :owners, :slug, :string
    add_index :owners, :slug, unique: true
    add_column :owners, :avatar_url, :string
    add_column :owners, :bio, :text
    add_column :owners, :timezone, :string, default: 'Europe/Moscow'
    add_column :owners, :working_hours, :string, default: '{}'
    add_column :owners, :is_public, :boolean, default: true
  end
end
