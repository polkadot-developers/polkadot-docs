#[test]
fn test_storage_update_on_extrinsic_call() {
    new_test_ext().execute_with(|| {
        // Check the initial storage state (before the call)
        assert_eq!(Something::<Test>::get(), None);

        // Dispatch a signed extrinsic, which modifies storage
        assert_ok!(TemplateModule::do_something(RuntimeOrigin::signed(1), 42));

        // Validate that the storage has been updated as expected (after the call)
        assert_eq!(Something::<Test>::get(), Some(42));
    });
}
