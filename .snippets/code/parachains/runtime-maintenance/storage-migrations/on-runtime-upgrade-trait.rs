pub trait OnRuntimeUpgrade {
    fn on_runtime_upgrade() -> Weight { ... }
    fn try_on_runtime_upgrade(checks: bool) -> Result<Weight, TryRuntimeError> { ... }
    fn pre_upgrade() -> Result<Vec<u8>, TryRuntimeError> { ... }
    fn post_upgrade(_state: Vec<u8>) -> Result<(), TryRuntimeError> { ... }
}