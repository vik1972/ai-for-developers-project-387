require "test_helper"

class Api::AvailableSlotsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_available_slots_url, params: { event_id: events(:one).id, date: "2026-04-05" }
    assert_response :success
  end

  test "should return occupied slots from fixtures" do
    get api_available_slots_url, params: { event_id: events(:one).id, date: "2026-04-05" }
    assert_response :success

    json_response = JSON.parse(response.body)

    # From fixtures, we have 2 bookings on 2026-04-05 at 10:00 and 11:00
    assert json_response["occupied_slots"].present?, "occupied_slots should be present"
    assert_equal 2, json_response["occupied_slots"].length, "should have 2 occupied slots from fixtures"
    assert_includes json_response["occupied_slots"], "2026-04-05 10:00"
    assert_includes json_response["occupied_slots"], "2026-04-05 11:00"
  end

  test "should not return available slots for past dates" do
    yesterday = (Date.today - 1).to_s
    get api_available_slots_url, params: { event_id: events(:one).id, date: yesterday }
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_empty json_response["available_slots"], "should not have available slots for past dates"
  end

  test "should not return past time slots for today" do
    # This test assumes the current time is after 00:00
    today = Date.today.to_s
    get api_available_slots_url, params: { event_id: events(:one).id, date: today }
    assert_response :success

    json_response = JSON.parse(response.body)

    # Check that no slot in the past is returned as available
    # The API returns times in UTC format "2026-04-07 15:00"
    now = Time.now.utc
    json_response["available_slots"].each do |slot_str|
      # Parse as UTC time
      slot_time = Time.parse(slot_str + " UTC")
      assert slot_time >= now, "Slot #{slot_str} (#{slot_time}) should not be before #{now}"
    end
  end
end
