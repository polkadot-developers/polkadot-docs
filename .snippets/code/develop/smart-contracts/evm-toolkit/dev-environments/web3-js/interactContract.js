const interactWithContract = async (
  contractName,
  contractAddress,
  privateKey,
  providerConfig,
  numberToSet,
) => {
  try {
    // Setup web3 and contract instance
    const web3 = createProvider(providerConfig);
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);

    const contract = new web3.eth.Contract(
      loadContractAbi(contractName),
      contractAddress,
    );

    // Set the number
    await contract.methods.setNumber(numberToSet).send({
      from: account.address,
      gas: await contract.methods.setNumber(numberToSet).estimateGas(),
    });

    // Read the number back
    const storedNumber = await contract.methods.storedNumber().call();
    console.log(`Stored number: ${storedNumber}`);
  } catch (error) {
    console.error('Error:', error);
  }
};
