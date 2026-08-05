import React from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({
  title,
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex">

      <AdminSidebar />

      <main className="flex-1">

        <header className="bg-white border-b border-slate-200 px-10 py-7 flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-black text-slate-900">
              {title}
            </h1>

            <p className="text-slate-500 mt-1">
              Administration QEH OUTLET
            </p>

          </div>

          <div className="flex items-center gap-4">

            <div className="text-right">

              <p className="font-bold">
                Administrateur
              </p>

              <p className="text-sm text-slate-500">
                QEH OUTLET
              </p>

            </div>

            <div className="w-12 h-12 rounded-full bg-[#0b5ca8] text-white flex items-center justify-center font-black">
              A
            </div>

          </div>

        </header>

        <div className="p-10">

          {children}

        </div>

      </main>

    </div>
  );
}