import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  MessageSquare,
  Settings,
} from "lucide-react";

const links = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/admin",
  },
  {
    icon: Users,
    label: "Clients",
    path: "/admin/clients",
  },
  {
    icon: ShoppingCart,
    label: "Commandes",
    path: "/admin/commandes",
  },
  {
    icon: MessageSquare,
    label: "Messages",
    path: "/admin/messages",
  },
  {
    icon: Package,
    label: "Produits",
    path: "/admin/produits",
  },
  {
    icon: Settings,
    label: "Paramètres",
    path: "/admin/parametres",
  },
];

export default function AdminSidebar() {
  return (
    <aside className="w-72 bg-[#071423] text-white min-h-screen flex flex-col">

      <div className="p-8 border-b border-white/10">

        <img
          src="/logo-qeh.png"
          alt="QEH OUTLET"
          className="w-16 mb-4"
        />

        <h1 className="font-black text-2xl">
          QEH OUTLET
        </h1>

        <p className="text-sm text-white/60">
          Administration
        </p>

      </div>

      <nav className="flex-1 py-6">

        {links.map((item) => {

          const Icon = item.icon;

          return (

            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-8 py-4 transition ${
                  isActive
                    ? "bg-[#0b5ca8]"
                    : "hover:bg-white/5"
                }`
              }
            >

              <Icon size={20} />

              {item.label}

            </NavLink>

          );

        })}

      </nav>

    </aside>
  );
}