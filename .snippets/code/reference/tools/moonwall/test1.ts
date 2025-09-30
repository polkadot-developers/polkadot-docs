import '@polkadot/api-augment';
import { describeSuite, expect } from '@moonwall/cli';
import { Keyring } from '@polkadot/api';

describeSuite({
  id: 'D1',
  title: 'Demo suite',
  foundationMethods: 'dev',
  testCases: ({ it, context, log }) => {
    it({
      id: 'T1',
      title: 'Test Case',
      test: async () => {
        // Set up polkadot.js API and testing accounts
        let api = context.polkadotJs();
        let alice = new Keyring({ type: 'sr25519' }).addFromUri('//Alice');
        let charlie = new Keyring({ type: 'sr25519' }).addFromUri('//Charlie');

        // Query Charlie's account balance before transfer
        const balanceBefore = (await api.query.system.account(charlie.address))
          .data.free;

        // Before transfer, Charlie's account balance should be 0
        expect(balanceBefore.toString()).toEqual('0');
        log('Balance before: ' + balanceBefore.toString());

        // Transfer from Alice to Charlie
        const amount = 1000000000000000;
        await api.tx.balances
          .transferAllowDeath(charlie.address, amount)
          .signAndSend(alice);

        // Wait for the transaction to be included in a block.
        // This is necessary because the balance is not updated immediately.
        // Block time is 6 seconds.
        await new Promise((resolve) => setTimeout(resolve, 6000));

        // Query Charlie's account balance after transfer
        const balanceAfter = (await api.query.system.account(charlie.address))
          .data.free;

        // After transfer, Charlie's account balance should be 1000000000000000
        expect(balanceAfter.toString()).toEqual(amount.toString());
        log('Balance after: ' + balanceAfter.toString());
      },
    });
  },
});
