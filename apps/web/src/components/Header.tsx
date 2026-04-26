import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";

import { getDisconnectPreference } from "../lib/disconnectPreference";
import { ConnectWalletButton } from "./ConnectWalletButton";

export function Header() {
  const { isConnected } = useAccount();
  const canOpenApp = isConnected && !getDisconnectPreference();

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span className="logo-mark" aria-hidden="true" />
        <span>Masa Critica</span>
      </Link>
      <nav className="header-nav" aria-label="Main navigation">
        <Link activeProps={{ className: "active" }} to="/">
          Home
        </Link>
        <a href="/#thesis">Thesis</a>
      </nav>
      <div className="header-actions">
        <ConnectWalletButton compact />
        <Link
          className={canOpenApp ? "app-button app-button-live" : "app-button"}
          to="/app"
        >
          Go to App
        </Link>
      </div>
    </header>
  );
}
