'use client';

import { useState } from 'react';
import { getSignedContract } from '../utils/contract';
import { ethers } from 'ethers';

const WriteContract = ({ account }) => {
  const [newNumber, setNewNumber] = useState('');
  const [status, setStatus] = useState({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!account) {
      setStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    if (!newNumber || isNaN(Number(newNumber))) {
      setStatus({ type: 'error', message: 'Please enter a valid number' });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus({ type: 'info', message: 'Initiating transaction...' });

      // Get a signer from the connected wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = await getSignedContract(signer);

      // Send transaction to blockchain and wait for user confirmation in wallet
      setStatus({
        type: 'info',
        message: 'Please confirm the transaction in your wallet...',
      });

      // Call the contract's setNumber function
      const tx = await contract.setNumber(newNumber);

      // Wait for transaction to be mined
      setStatus({
        type: 'info',
        message: 'Transaction submitted. Waiting for confirmation...',
      });
      const receipt = await tx.wait();

      setStatus({
        type: 'success',
        message: `Transaction confirmed! Transaction hash: ${receipt.hash}`,
      });
      setNewNumber('');
    } catch (err) {
      console.error('Error updating number:', err);

      // Error code 4001 is MetaMask's code for user rejection
      if (err.code === 4001) {
        setStatus({ type: 'error', message: 'Transaction rejected by user.' });
      } else {
        setStatus({
          type: 'error',
          message: `Error: ${err.message || 'Failed to send transaction'}`,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-pink-500 rounded-lg p-4 shadow-md bg-white text-pink-500 max-w-sm mx-auto space-y-4">
      <h2 className="text-lg font-bold">Update Stored Number</h2>
      {status.message && (
        <div
          className={`p-2 rounded-md break-words h-fit text-sm ${
            status.type === 'error'
              ? 'bg-red-100 text-red-500'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {status.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          placeholder="New Number"
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          disabled={isSubmitting || !account}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <button
          type="submit"
          disabled={isSubmitting || !account}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-300"
        >
          {isSubmitting ? 'Updating...' : 'Update'}
        </button>
      </form>
      {!account && (
        <p className="text-sm text-gray-500">
          Connect your wallet to update the stored number.
        </p>
      )}
    </div>
  );
};

export default WriteContract;
