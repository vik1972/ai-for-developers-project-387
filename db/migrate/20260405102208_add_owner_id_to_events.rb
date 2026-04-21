class AddOwnerIdToEvents < ActiveRecord::Migration[7.2]
  def change
    add_column :events, :owner_id, :integer
    add_foreign_key :events, :owners
  end
end
