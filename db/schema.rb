# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_04_14_160642) do
  create_table "availability_exceptions", force: :cascade do |t|
    t.integer "owner_id", null: false
    t.date "date"
    t.boolean "is_available"
    t.text "available_slots"
    t.string "reason"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["owner_id"], name: "index_availability_exceptions_on_owner_id"
  end

  create_table "availability_schedules", force: :cascade do |t|
    t.integer "owner_id", null: false
    t.string "name"
    t.boolean "is_default"
    t.string "schedule"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["owner_id"], name: "index_availability_schedules_on_owner_id"
  end

  create_table "bookings", force: :cascade do |t|
    t.integer "event_id"
    t.datetime "slot"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "guest_name"
    t.string "guest_email"
    t.string "guest_phone"
    t.text "notes"
    t.string "status"
    t.string "location_type"
    t.string "location_url"
    t.integer "guests_count"
    t.datetime "cancelled_at"
    t.text "cancellation_reason"
    t.datetime "rescheduled_from"
    t.string "custom_fields"
  end

  create_table "calendar_integrations", force: :cascade do |t|
    t.integer "owner_id", null: false
    t.string "provider"
    t.string "access_token"
    t.string "refresh_token"
    t.datetime "expires_at"
    t.string "calendar_id"
    t.boolean "is_active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["owner_id"], name: "index_calendar_integrations_on_owner_id"
  end

  create_table "events", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.integer "duration"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "owner_id"
  end

  create_table "owners", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug"
    t.string "avatar_url"
    t.text "bio"
    t.string "timezone", default: "Europe/Moscow"
    t.string "working_hours", default: "{}"
    t.boolean "is_public", default: true
    t.index ["slug"], name: "index_owners_on_slug", unique: true
  end

  add_foreign_key "availability_exceptions", "owners"
  add_foreign_key "availability_schedules", "owners"
  add_foreign_key "calendar_integrations", "owners"
  add_foreign_key "events", "owners"
end
