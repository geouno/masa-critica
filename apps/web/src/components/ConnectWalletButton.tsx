import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

import {
  clearDisconnectPreference,
  getDisconnectPreference,
  setDisconnectPreference,
} from "../lib/disconnectPreference";

type ConnectWalletButtonProps = {
  connectedAction?: "disconnect" | "app";
  preferredOnly?: boolean;
};

type BrowserWalletProvider = {
  isBraveWallet?: true;
  isMetaMask?: true;
  providers?: BrowserWalletProvider[];
};

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getBrowserWalletProviders() {
  if (typeof window === "undefined") {
    return [];
  }

  const ethereum = (window as Window & { ethereum?: BrowserWalletProvider }).ethereum;
  if (!ethereum) {
    return [];
  }

  return ethereum.providers?.length ? ethereum.providers : [ethereum];
}

function getPreferredConnector(connectors: ReturnType<typeof useConnect>["connectors"]) {
  const providers = getBrowserWalletProviders();
  const hasBrave = providers.some((provider) => provider.isBraveWallet === true);
  const hasMetaMask = providers.some(
    (provider) => provider.isMetaMask === true && provider.isBraveWallet !== true,
  );

  if (hasBrave) {
    return connectors.find((connector) =>
      connector.name.toLowerCase().includes("brave"),
    );
  }

  if (hasMetaMask) {
    return connectors.find((connector) =>
      connector.name.toLowerCase().includes("metamask"),
    );
  }

  return undefined;
}

export function ConnectWalletButton({
  connectedAction = "disconnect",
  preferredOnly = false,
}: ConnectWalletButtonProps) {
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
    if (connectedAction === "app") {
      return (
        <div className="wallet">
          <a className="wallet-app-link" href="/app">
            Go to app
          </a>
        </div>
      );
    }

    return (
      <div className="wallet">
        <span>Connected {shortAddress(address)}</span>
        <button type="button" onClick={disconnectWallet}>
          Disconnect
        </button>
      </div>
    );
  }

  const preferredConnector = getPreferredConnector(connectors);
  const visibleConnectors = preferredOnly
    ? preferredConnector
      ? [preferredConnector]
      : []
    : connectors;

  return (
    <div className="wallet">
      {visibleConnectors.map((connector) => (
        <button
          key={connector.uid}
          disabled={isPending}
          onClick={() => connectWallet(connector)}
          type="button"
        >
          {isPending ? "Connecting..." : `Connect ${connector.name}`}
        </button>
      ))}
      {visibleConnectors.length === 0 ? <p>No injected wallet found.</p> : null}
      {error ? <p className="error">{error.message}</p> : null}
    </div>
  );
}
