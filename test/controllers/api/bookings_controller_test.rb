require "test_helper"

class Api::BookingsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_bookings_url
    assert_response :success
  end

  test "should create booking" do
    assert_difference("Booking.count", 1) do
      post api_bookings_url, params: { booking: { event_id: events(:one).id, slot: "2026-04-06 10:00" } }
    end
    assert_response :created
  end

  test "should show booking" do
    get api_booking_url(id: bookings(:one).id)
    assert_response :success
  end

  test "should destroy booking" do
    assert_difference("Booking.count", -1) do
      delete api_booking_url(id: bookings(:one).id)
    end
    assert_response :no_content
  end
end
