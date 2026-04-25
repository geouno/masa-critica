const disconnectPreferenceKey = "monad-blitz.wallet-disconnected";

export function getDisconnectPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(disconnectPreferenceKey) === "true";
}

export function clearDisconnectPreference() {
  window.localStorage.removeItem(disconnectPreferenceKey);
}

export function setDisconnectPreference() {
  window.localStorage.setItem(disconnectPreferenceKey, "true");
}
