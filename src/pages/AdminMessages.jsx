import React from "react";
import AdminLayout from "../components/AdminLayout";

export default function AdminMessages() {

  return (

    <AdminLayout title="Messages">

      <div className="bg-white rounded-3xl border border-slate-200 p-8">

        <h2 className="text-2xl font-black">

          Messages reçus

        </h2>

        <p className="text-slate-500 mt-3">

          Tous les formulaires de contact arriveront ici.

        </p>

      </div>

    </AdminLayout>

  );

}