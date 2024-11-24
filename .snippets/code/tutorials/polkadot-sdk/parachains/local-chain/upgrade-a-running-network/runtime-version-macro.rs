#[sp_version::runtime_version]
pub const VERSION: RuntimeVersion = RuntimeVersion {
	spec_name: create_runtime_str!("solochain-template-runtime"),
	impl_name: create_runtime_str!("solochain-template-runtime"),
	authoring_version: 1,
	spec_version: 101,
	impl_version: 1,
	apis: RUNTIME_API_VERSIONS,
	transaction_version: 1,
	state_version: 1,
};