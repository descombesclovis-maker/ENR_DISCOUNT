import React, { useEffect, useState } from "react";

import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Boxes,
  Building2,
  ClipboardList,
  Factory,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  MessageSquare,
  PackageOpen,
  Settings,
  ShoppingCart,
  Sun,
  UsersRound,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const groups = [
  {
    id: "outlet",
    label: "QEH OUTLET",
    color: "#ff5a00",
    links: [
      {
        to: "/admin/produits",
        label: "Produits",
        icon: Boxes,
      },
      {
        to: "/admin/clients",
        label: "Clients",
        icon: UsersRound,
      },
      {
        to: "/admin/commandes",
        label: "Commandes",
        icon: ShoppingCart,
      },
      {
        to: "/admin/categories",
        label: "Catégories",
        icon: PackageOpen,
      },
    ],
  },
  {
    id: "energies",
    label: "QEH ÉNERGIES",
    color: "#69b72d",
    links: [
      {
        to: "/admin/energies/demandes",
        label: "Demandes locales",
        icon: ClipboardList,
      },
      {
        to: "/admin/energies/producteurs",
        label: "Producteurs",
        icon: Sun,
      },
      {
        to: "/admin/energies/carte",
        label: "Carte solaire",
        icon: MapPinned,
      },
    ],
  },
  {
    id: "partner",
    label: "QEH PARTNER",
    color: "#c99532",
    links: [
      {
        to: "/admin/partner/franchises",
        label: "Franchises",
        icon: Building2,
      },
      {
        to: "/admin/partner/production",
        label: "Production",
        icon: Factory,
      },
      {
        to: "/admin/partner/produits",
        label: "Matériel Pro",
        icon: PackageOpen,
      },
      {
        to: "/admin/partner/commandes",
        label: "Commandes Pro",
        icon: ShoppingCart,
      },
    ],
  },
];

function BrandMark() {
  return (
    <div className="relative flex h-12 w-[94px] items-center justify-center overflow-hidden rounded-xl bg-[#020711] shadow-lg">
      <span className="absolute inset-x-3 top-2 h-px bg-gradient-to-r from-[#17649e] via-white to-[#69b72d]" />

      <span className="font-display text-2xl font-black tracking-[0.08em] text-white">
        QEH
      </span>

      <span className="absolute inset-x-3 bottom-2 h-px bg-gradient-to-r from-[#ff5a00] via-[#c99532] to-[#69b72d]" />
    </div>
  );
}

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();

    navigate("/admin/login", {
      replace: true,
    });
  }

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/admin"
        onClick={onNavigate}
        className="flex items-center gap-3 px-4 py-5"
      >
        <BrandMark />

        <div className="min-w-0">
          <p className="truncate font-display text-sm font-black text-white">
            Administration
          </p>

          <p className="truncate text-[11px] font-semibold text-slate-500">
            Console centrale
          </p>
        </div>
      </Link>

      <div className="mx-4 h-px bg-white/10" />

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavLink
          to="/admin"
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            `mb-5 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-black transition ${
              isActive
                ? "bg-white text-[#020711] shadow-lg"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`
          }
        >
          <LayoutDashboard className="h-5 w-5" />

          Tableau de bord
        </NavLink>

        <div className="space-y-5">
          {groups.map((group) => (
            <section key={group.id}>
              <div className="mb-2 flex items-center gap-2 px-3">
                <span
                  className="h-2 w-2 rounded-full shadow-[0_0_12px_currentColor]"
                  style={{
                    color: group.color,
                    backgroundColor: group.color,
                  }}
                />

                <p
                  className="text-[10px] font-black uppercase tracking-[0.18em]"
                  style={{
                    color: group.color,
                  }}
                >
                  {group.label}
                </p>
              </div>

              <div className="space-y-1">
                {group.links.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                          isActive
                            ? "bg-white/12 text-white"
                            : "text-slate-400 hover:bg-white/[0.07] hover:text-slate-200"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className="h-4 w-4"
                            style={{
                              color: isActive
                                ? group.color
                                : undefined,
                            }}
                          />

                          <span className="flex-1">
                            {item.label}
                          </span>

                          {isActive ? (
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  group.color,
                              }}
                            />
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <NavLink
          to="/admin/messages"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
        >
          <MessageSquare className="h-4 w-4" />

          Messages
        </NavLink>

        <NavLink
          to="/admin/parametres"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              isActive
                ? "bg-white/12 text-white"
                : "text-slate-400 hover:bg-white/[0.07] hover:text-white"
            }`
          }
        >
          <Settings className="h-4 w-4" />

          Paramètres
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />

          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default function AdminCentralLayout() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f2f5f9]">
      <aside className="fixed inset-y-0 left-0 z-[60] hidden w-[270px] bg-[#050b16] shadow-[14px_0_45px_rgba(2,7,17,0.12)] lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-50 flex min-h-[70px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl lg:hidden">
        <Link
          to="/admin"
          className="flex items-center gap-3"
        >
          <BrandMark />

          <span className="font-display text-sm font-black">
            Administration
          </span>
        </Link>

        <button
          type="button"
          onClick={() =>
            setMobileOpen((current) => !current)
          }
          className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-[#020711]"
          aria-label={
            mobileOpen
              ? "Fermer le menu"
              : "Ouvrir le menu"
          }
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </header>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[70] bg-black/55 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
          />

          <aside className="fixed inset-y-0 left-0 z-[80] w-[286px] bg-[#050b16] shadow-2xl lg:hidden">
            <SidebarContent
              onNavigate={() =>
                setMobileOpen(false)
              }
            />
          </aside>
        </>
      ) : null}

      <div className="min-h-screen lg:pl-[270px]">
        <Outlet />
      </div>
    </div>
  );
}