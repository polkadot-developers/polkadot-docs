const unsub = await client.events.system.NewAccount.watch((events) => {
  console.log('New Account Created', events)
})