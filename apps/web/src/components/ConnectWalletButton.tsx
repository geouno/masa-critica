import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

import {
  clearDisconnectPreference,
  getDisconnectPreference,
  setDisconnectPreference,
} from "../lib/disconnectPreference";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [userDisconnected, setUserDisconnected] = useState(getDisconnectPreference);

  useEffect(() => {
    if (userDisconnected && isConnected) {
      disconnect();
    }
  }, [disconnect, isConnected, userDisconnected]);

  const showConnected = isConnected && !userDisconnected;

  function connectWallet(connector: (typeof connectors)[number]) {
    clearDisconnectPreference();
    setUserDisconnected(false);
    connect({ connector });
  }

  function disconnectWallet() {
    setDisconnectPreference();
    setUserDisconnected(true);
    disconnect();
  }

  if (showConnected && address) {
    return (
      <div className="wallet">
        <span>Connected {shortAddress(address)}</span>
        <button type="button" onClick={disconnectWallet}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="wallet">
      {connectors.map((connector) => (
        <button
          disabled={isPending}
          key={connector.uid}
          onClick={() => connectWallet(connector)}
          type="button"
        >
          {isPending ? "Connecting..." : `Connect ${connector.name}`}
        </button>
      ))}
      {connectors.length === 0 ? <p>No injected wallet found.</p> : null}
      {error ? <p className="error">{error.message}</p> : null}
    </div>
  );
}
