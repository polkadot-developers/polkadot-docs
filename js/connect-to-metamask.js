const provider = window.ethereum;
const supportedNetworks = {
  passetHub: {
    name: 'Polkadot Hub TestNet',
    chainId: '0x190F1B46', //Hex value of "420420422"
    chainName: 'Polkadot Hub TestNet',
    rpcUrls: ['https://testnet-passet-hub-eth-rpc.polkadot.io'],
    blockExplorerUrls: ['https://blockscout-passet-hub.parity-testnet.parity.io/'],
    nativeCurrency: {
      name: 'Paseo Token',
      symbol: 'PAS',
      decimals: 18,
    },
  },
  kusamaHub: {
    name: 'Kusama Hub',
    chainId: '0x190f1b42', //Hex value of "420420418"
    chainName: 'Kusama Hub TestNet',
    rpcUrls: ['https://kusama-asset-hub-eth-rpc.polkadot.io'],
    blockExplorerUrls: ['https://blockscout-kusama-asset-hub.parity-chains-scw.parity.io/'],
    nativeCurrency: {
      name: 'Kusama Token',
      symbol: 'KSM',
      decimals: 18,
    },
  }
};

/*
  Add or switch to the specified network, then request accounts
  NOTE: This calls "eth_requestAccounts" at the end, which prompts for wallet connection
 */
const connectNetwork = async (network) => {
  if (!provider) {
    handleError('No Ethereum-compatible wallet found. Please install MetaMask.');
    return;
  }
  try {
    const targetNetwork = { ...supportedNetworks[network] };
    delete targetNetwork.name;

    // Try to switch first, then add if not available
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetNetwork.chainId }],
      });
    } catch (switchError) {
      // 4902 = chain not added
      if (switchError.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [targetNetwork],
        });
      } else if (switchError.code !== 4001 && switchError.code !== -32002) {
        handleError(switchError.message);
        return;
      }
    }
    // Request accounts after switching/adding
    await provider.request({ method: 'eth_requestAccounts' });
  } catch (e) {
    if (e.code !== 4001 && e.code !== -32002) {
      handleError(e.message);
    }
  }
};

// Fix for getConnectedNetwork
const getConnectedNetwork = async () => {
  const chainId = await provider.request({ method: 'eth_chainId' });
  const connectedHubNetwork = Object.values(supportedNetworks).find(
    (network) => network.chainId === chainId
  );
  if (connectedHubNetwork) {
    const connectedNetworkButton = document.querySelector(
      `.connect-network[data-value="${connectedHubNetwork.name}"]`
    );
    return { connectedNetwork: connectedHubNetwork, connectedNetworkButton };
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
  networkButton.disabled = true;
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
        `No Ethereum-compatible wallet found. Please install MetaMask.`
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
    btn.disabled = true;
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