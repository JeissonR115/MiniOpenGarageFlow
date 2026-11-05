"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CarFront, ClipboardList, House, LogOut, UsersRound, Wrench, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { logoutAction } from "./auth-actions";

const navigationItems: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/customers", label: "Clientes", icon: UsersRound },
  { href: "/vehicles", label: "Vehículos", icon: CarFront },
  { href: "/orders", label: "Pedidos", icon: ClipboardList },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname === "/login") return null;

  function closeSidebar() {
    setIsOpen(false);
  }

  return (
    <>
      <header className="mobile-header">
        <button
          aria-controls="primary-navigation"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          className="mobile-menu-toggle"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          {isOpen ? <X aria-hidden="true" /> : <Wrench aria-hidden="true" />}
        </button>
        <span>OpenGarageFlow</span>
      </header>
      {isOpen && (
        <button
          aria-label="Cerrar menú"
          className="sidebar-backdrop"
          onClick={closeSidebar}
          type="button"
        />
      )}
      <aside className={`sidebar${isOpen ? " is-open" : ""}`}>
        <Link aria-label="OpenGarageFlow, ir a Inicio" className="sidebar-brand" href="/" onClick={closeSidebar}>
          <span className="brand-mark">
            <Wrench aria-hidden="true" />
          </span>
          <span className="brand-copy">
            <strong>OpenGarageFlow</strong>
            <span>Gestión de taller</span>
          </span>
        </Link>
        <div className="sidebar-section-label">MENÚ PRINCIPAL</div>
        <nav aria-label="Navegación principal" className="sidebar-navigation" id="primary-navigation">
          {navigationItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`sidebar-link${isActive ? " is-active" : ""}`}
                href={href}
                key={href}
                onClick={closeSidebar}
              >
                <Icon aria-hidden="true" className="sidebar-link-icon" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <span className="status-indicator" />
          <span>Tu taller, en orden</span>
        </div>
        <form action={logoutAction}>
          <button className="sidebar-logout" onClick={closeSidebar} type="submit">
            <LogOut aria-hidden="true" className="sidebar-link-icon" />
            <span>Cerrar sesión</span>
          </button>
        </form>
      </aside>
    </>
  );
}
