import React from "react";
import AdminLayout from "../components/AdminLayout";

export default function AdminSettings() {

  return (

    <AdminLayout title="Paramètres">

      <div className="bg-white rounded-3xl border border-slate-200 p-8">

        <h2 className="text-2xl font-black">

          Paramètres QEH OUTLET

        </h2>

        <p className="text-slate-500 mt-3">

          Ici seront configurés Stripe, les coordonnées,
          les transporteurs, les e-mails, etc.

        </p>

      </div>

    </AdminLayout>

  );

}