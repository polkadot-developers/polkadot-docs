'use client'

import React from 'react'
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export function ConnectWallet() {
  const { connect } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div>
        <div>Connected to {address}</div>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  }

  return (
    <button onClick={() => connect({ connector: injected() })}>
      Connect Wallet
    </button>
  )
}