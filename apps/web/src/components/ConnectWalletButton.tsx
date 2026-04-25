import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const disconnectPreferenceKey = "monad-blitz.wallet-disconnected";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getInitialDisconnectPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(disconnectPreferenceKey) === "true";
}

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [userDisconnected, setUserDisconnected] = useState(
    getInitialDisconnectPreference,
  );

  useEffect(() => {
    if (userDisconnected && isConnected) {
      disconnect();
    }
  }, [disconnect, isConnected, userDisconnected]);

  const showConnected = isConnected && !userDisconnected;

  function connectWallet(connector: (typeof connectors)[number]) {
    window.localStorage.removeItem(disconnectPreferenceKey);
    setUserDisconnected(false);
    connect({ connector });
  }

  function disconnectWallet() {
    window.localStorage.setItem(disconnectPreferenceKey, "true");
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
