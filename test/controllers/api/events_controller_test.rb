require "test_helper"

class Api::EventsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_events_url
    assert_response :success
  end

  test "should show event" do
    get api_event_url(id: events(:one).id)
    assert_response :success
  end

  test "should create event" do
    assert_difference("Event.count", 1) do
      post api_events_url, params: { event: { name: "Test Event", description: "A test", duration: 30 } }
    end
    assert_response :created
  end

  test "should destroy event" do
    assert_difference("Event.count", -1) do
      delete api_event_url(id: events(:one).id)
    end
    assert_response :no_content
  end
end
