#[test]
fn it_works_for_valid_input() {
    new_test_ext().execute_with(|| {
        // Call an extrinsic or function
        assert_ok!(TemplateModule::some_function(Origin::signed(1), valid_param));
    });
}

#[test]
fn it_fails_for_invalid_input() {
    new_test_ext().execute_with(|| {
        // Call an extrinsic with invalid input and expect an error
        assert_err!(
            TemplateModule::some_function(Origin::signed(1), invalid_param),
            Error::<Test>::InvalidInput
        );
    });
}