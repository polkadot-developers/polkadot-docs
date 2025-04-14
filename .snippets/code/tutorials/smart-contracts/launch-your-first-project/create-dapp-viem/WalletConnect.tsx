"use client";

import React, { useState, useEffect } from "react";
import { assetHub } from "../utils/viem";

interface WalletConnectProps {
  onConnect: (account: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user already has an authorized wallet connection
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // eth_accounts doesn't trigger the wallet popup
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          }) as string[];
          
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const chainIdHex = await window.ethereum.request({
              method: 'eth_chainId',
            }) as string;
            setChainId(parseInt(chainIdHex, 16));
            onConnect(accounts[0]);
          }
        } catch (err) {
          console.error('Error checking connection:', err);
          setError('Failed to check wallet connection');
        }
      }
    };

    checkConnection();

    if (typeof window !== 'undefined' && window.ethereum) {
      // Setup wallet event listeners
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
        if (accounts[0]) onConnect(accounts[0]);
      });

      window.ethereum.on('chainChanged', (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
      });
    }

    return () => {
      // Cleanup event listeners
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [onConnect]);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError(
        'MetaMask not detected! Please install MetaMask to use this dApp.'
      );
      return;
    }

    try {
      // eth_requestAccounts triggers the wallet popup
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];
      
      setAccount(accounts[0]);

      const chainIdHex = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string;
      
      const currentChainId = parseInt(chainIdHex, 16);
      setChainId(currentChainId);

      // Prompt user to switch networks if needed
      if (currentChainId !== assetHub.id) {
        await switchNetwork();
      }

      onConnect(accounts[0]);
    } catch (err) {
      console.error('Error connecting to wallet:', err);
      setError('Failed to connect wallet');
    }
  };

  const switchNetwork = async () => {
    console.log('Switch network')
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${assetHub.id.toString(16)}` }],
      });
    } catch (switchError: any) {
      // Error 4902 means the chain hasn't been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${assetHub.id.toString(16)}`,
                chainName: assetHub.name,
                rpcUrls: [assetHub.rpcUrls.default.http[0]],
                nativeCurrency: {
                  name: assetHub.nativeCurrency.name,
                  symbol: assetHub.nativeCurrency.symbol,
                  decimals: assetHub.nativeCurrency.decimals,
                },
              },
            ],
          });
        } catch (addError) {
          setError('Failed to add network to wallet');
        }
      } else {
        setError('Failed to switch network');
      }
    }
  };

  // UI-only disconnection - MetaMask doesn't support programmatic disconnection
  const disconnectWallet = () => {
    setAccount(null);
  };

  return (
    <div className="border border-pink-500 rounded-lg p-4 shadow-md bg-white text-pink-500 max-w-sm mx-auto">
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {!account ? (
        <button
          onClick={connectWallet}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex flex-col items-center">
          <span className="text-sm font-mono bg-pink-100 px-2 py-1 rounded-md text-pink-700">
            {`${account.substring(0, 6)}...${account.substring(38)}`}
          </span>
          <button
            onClick={disconnectWallet}
            className="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-pink-500 py-2 px-4 rounded-lg transition"
          >
            Disconnect
          </button>
          {chainId !== assetHub.id && (
            <button
              onClick={switchNetwork}
              className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Switch to Asset Hub
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;