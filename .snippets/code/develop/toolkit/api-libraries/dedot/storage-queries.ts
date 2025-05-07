const balance = await client.query.system.account(<address>);
console.log('Balance:', balance.data.free);