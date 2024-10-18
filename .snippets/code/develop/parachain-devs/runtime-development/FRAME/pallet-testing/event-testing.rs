#[test]
fn it_emits_events_on_success() {
    new_test_ext().execute_with(|| {
        // Call an extrinsic or function
        assert_ok!(TemplateModule::some_function(Origin::signed(1), valid_param));

        // Verify that the expected event was emitted
        assert!(System::events().iter().any(|record| {
            record.event == Event::TemplateModule(TemplateEvent::SomeEvent)
        }));
    });
}