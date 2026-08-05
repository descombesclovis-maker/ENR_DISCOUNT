import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import AdminLayout from "../components/AdminLayout";

export default function AdminCustomerDetail() {

  const { id } = useParams();

  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  async function loadCustomer() {

    const { data } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("id", id)
      .single();

    setCustomer(data);

  }

  if (!customer) {

    return (

      <AdminLayout title="Chargement...">

        <div className="p-10">

          Chargement du client...

        </div>

      </AdminLayout>

    );

  }

  return (

    <AdminLayout title="Fiche client">

      <div className="grid lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 bg-white rounded-3xl border p-8">

          <h1 className="text-4xl font-black">

            {customer.first_name} {customer.last_name}

          </h1>

          <div className="space-y-5 mt-8">

            <p className="flex items-center gap-3">

              <Mail className="w-5 h-5 text-[#ff5a00]" />

              {customer.email || "-"}

            </p>

            <p className="flex items-center gap-3">

              <Phone className="w-5 h-5 text-[#ff5a00]" />

              {customer.phone || "-"}

            </p>

            <p className="flex items-center gap-3">

              <Building2 className="w-5 h-5 text-[#ff5a00]" />

              {customer.company || "-"}

            </p>

            <p className="flex items-center gap-3">

              <MapPin className="w-5 h-5 text-[#ff5a00]" />

              {customer.address}

              {customer.address2
                ? ` ${customer.address2}`
                : ""}

              <br/>

              {customer.postal_code}

              {" "}

              {customer.city}

            </p>

          </div>

        </div>

        <div className="space-y-6">

          <div className="bg-white rounded-3xl border p-8">

            <User className="w-10 h-10 text-[#ff5a00]" />

            <h2 className="font-black text-2xl mt-4">

              Informations

            </h2>

            <p className="mt-6">

              Pays

              <br/>

              <strong>

                {customer.country}

              </strong>

            </p>

            <p className="mt-5">

              Inscription

              <br/>

              <strong>

                {new Date(customer.created_at).toLocaleDateString("fr-FR")}

              </strong>

            </p>

          </div>

        </div>

      </div>

    </AdminLayout>

  );

}