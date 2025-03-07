const provider = window.ethereum;
const supportedNetworks = {
  westendAssetHub: {
    name: 'Asset-Hub Westend Testnet',
    chainId: '0x190F1B45', //Hex value of "420420421"
    chainName: 'Asset-Hub Westend Testnet',
    rpcUrls: ['https://westend-asset-hub-eth-rpc.polkadot.io'],
    blockExplorerUrls: ['https://westend-asset-hub-eth-explorer.parity.io'],
    nativeCurrency: {
      name: 'Westend Token',
      symbol: 'WND',
      decimals: 18,
    },
  },
};

/*
  Add or switch to the specified network, then request accounts
  NOTE: This calls "eth_requestAccounts" at the end, which prompts for wallet connection
 */
const connectNetwork = async (network) => {
  try {
    const targetNetwork = { ...supportedNetworks[network] };
    delete targetNetwork.name; // remove 'name' property if needed

    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [targetNetwork],
    });
    // This line requests user accounts, which triggers a "connect" prompt if not already connected:
    await provider.request({ method: 'eth_requestAccounts' });
  } catch (e) {
    // 4001: user rejected, -32002: request already pending
    if (e.code !== 4001 && e.code !== -32002) {
      handleError(e.message);
    }
  }
};

// Get the network that the user is currently connected to
const getConnectedNetwork = async () => {
  const chainId = await provider.request({ method: 'eth_chainId' });
  const connectedHubNetwork = Object.values(supportedNetworks).find(
    (network) => network.chainId === chainId
  );
  if (connectedNetwork) {
    const connectedNetworkButton = document.querySelector(
      `.connect-network[data-value="${connectedNetwork.name}"]`
    );
    return { connectedNetwork, connectedNetworkButton };
  } else {
    return {
      connectedNetwork: null,
      connectedNetworkButton: null,
    };
  }
};

/* Updates the button to show the connected network. */
const displayConnectedAccount = async (connectedNetwork, networkButton) => {
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) return;

  const shortenedAccount = `${accounts[0].slice(0, 6)}...${accounts[0].slice(
    -4
  )}`;
  networkButton.innerHTML = `Connected to ${connectedNetwork.chainName}: ${shortenedAccount}`;
  networkButton.className += ' disabled-button';
};

// Displays an error message to the user
const handleError = (message) => {
  const errorModalContainer = document.querySelector('.error-modal-container');
  const errorMessage = document.querySelector('.error-message');
  errorModalContainer.style.display = 'block';
  errorMessage.innerHTML = message;
};

/*
 Handles the logic for the buttons inside of content pages.
 Directly connect to the network specified in 'value'
 */
const connectMetaMaskBodyButtons =
  document.querySelectorAll('.connectMetaMask');
connectMetaMaskBodyButtons.forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!provider) {
      handleError(
        `No EVM-compatible wallet found. Please install MetaMask.`
      );
      return;
    }

    const network = btn.getAttribute('value');
    if (!network || !supportedNetworks[network]) {
      handleError(`The network "${network}" is not supported or not defined.`);
      return;
    }

    await connectNetwork(network);
    //Update the button to reflect the "connected" state
    btn.textContent = 'Connected to ' + supportedNetworks[network]['name'];
    btn.classList.add('disabled-button');
  });
});

if (provider) {
  provider.on('chainChanged', () => {
    window.location.reload();
  });
  provider.on('accountsChanged', async (accounts) => {
    if (accounts.length > 0) {
      const { connectedNetwork, connectedNetworkButton } =
        await getConnectedNetwork();
      if (connectedNetwork) {
        await displayConnectedAccount(
          connectedNetwork,
          connectedNetworkButton
        );
      }
    } else {
      window.location.reload();
    }
  });
}