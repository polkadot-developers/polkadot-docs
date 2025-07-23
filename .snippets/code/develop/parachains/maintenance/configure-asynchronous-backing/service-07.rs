let fut = aura::run::<Block, sp_consensus_aura::sr25519::AuthorityPair, _, _, _, _, _, _, _, _>(
    params,
);
task_manager.spawn_essential_handle().spawn("aura", None, fut);