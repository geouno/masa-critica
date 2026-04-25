import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Navigate,
  Outlet,
} from "@tanstack/react-router";
import { useAccount } from "wagmi";

import { ConnectWalletButton } from "./components/ConnectWalletButton";
import { getDisconnectPreference } from "./lib/disconnectPreference";

function RootLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}

function HomePage() {
  const { isConnected } = useAccount();
  const isLoggedIn = isConnected && !getDisconnectPreference();

  return (
    <div className="page-stack">
      <ConnectWalletButton />
      {isLoggedIn ? (
        <Link className="text-link" to="/app">
          Open app
        </Link>
      ) : null}
    </div>
  );
}

function AppPage() {
  const { isConnected, isReconnecting } = useAccount();

  if (isReconnecting && !getDisconnectPreference()) {
    return <div className="app-shell">Checking wallet...</div>;
  }

  if (!isConnected || getDisconnectPreference()) {
    return <Navigate replace to="/" />;
  }

  return <div className="app-shell">Logged in app page</div>;
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: AppPage,
});

const routeTree = rootRoute.addChildren([indexRoute, appRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
