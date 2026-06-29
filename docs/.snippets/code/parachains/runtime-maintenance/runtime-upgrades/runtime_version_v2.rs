#[sp_version::runtime_version]
pub const VERSION: RuntimeVersion = RuntimeVersion {
	spec_name: alloc::borrow::Cow::Borrowed("parachain-template-runtime"),
	impl_name: alloc::borrow::Cow::Borrowed("parachain-template-runtime"),
	authoring_version: 1,
	spec_version: 2,
	impl_version: 0,
	apis: apis::RUNTIME_API_VERSIONS,
	transaction_version: 1,
	system_version: 1,
};
