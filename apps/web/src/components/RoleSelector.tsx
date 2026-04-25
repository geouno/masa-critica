import { Link } from "@tanstack/react-router";
import type { Role } from "../lib/role";

export function RoleSelector({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div className="role-selector">
      <button
        className="role-card"
        onClick={() => onSelect("distributor")}
        type="button"
      >
        <span className="role-emoji">🏪</span>
        <span className="role-title">Soy Distribuidor</span>
        <span className="role-sub">
          Accede a volumen de compra que antes era inalcanzable
        </span>
      </button>
      <button className="role-card" onClick={() => onSelect("supplier")} type="button">
        <span className="role-emoji">🍋</span>
        <span className="role-title">Soy Proveedor</span>
        <span className="role-sub">Unlock exposure like never before</span>
      </button>
    </div>
  );
}

export function Navbar({ onSettings }: { onSettings: () => void }) {
  return (
    <nav className="navbar">
      <Link className="navbar-brand" to="/app">
        Masa Crítica
      </Link>
      <button className="btn-ghost" onClick={onSettings} type="button">
        ⚙️
      </button>
    </nav>
  );
}
