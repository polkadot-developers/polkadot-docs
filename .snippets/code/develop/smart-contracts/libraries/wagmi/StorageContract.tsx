'use client'

import { useState } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

const CONTRACT_ADDRESS = '0xabBd46Ef74b88E8B1CDa49BeFb5057710443Fd29' as `0x${string}`

export function StorageContract() {
  const [number, setNumber] = useState<string>('42')
  
  // Contract ABI (should match your compiled contract)
  const abi = [
    {
      "inputs": [],
      "name": "storedNumber",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_newNumber", "type": "uint256"}],
      "name": "setNumber",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

  // Read the current stored number
  const { data: storedNumber, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'storedNumber',
  })

  // Write to the contract
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  // Wait for transaction to be mined
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({
      hash,
    })

  const handleSetNumber = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'setNumber',
      args: [BigInt(number)],
    })
  }

  return (
    <div>
      <h2>Storage Contract Interaction</h2>
      <div>
        <p>Contract Address: {CONTRACT_ADDRESS}</p>
        <p>Current Stored Number: {storedNumber?.toString() || 'Loading...'}</p>
      </div>

      <div>
        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          disabled={isPending || isConfirming}
        />
        <button 
          onClick={handleSetNumber}
          disabled={isPending || isConfirming}
        >
          {isPending ? 'Waiting for approval...' : 
           isConfirming ? 'Confirming...' : 'Set Number'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          Error: {error.message}
        </div>
      )}

      {isConfirmed && (
        <div className="success-message">
          Successfully updated! <button onClick={() => refetch()}>Refresh</button>
        </div>
      )}
    </div>
  )
}