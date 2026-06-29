const balance = await client.query.system.account('INSERT_ADDRESS');
console.log('Balance:', balance.data.free);
