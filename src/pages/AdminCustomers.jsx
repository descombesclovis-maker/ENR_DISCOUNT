import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Search,
  Mail,
  Phone,
  Building2,
  Users,
} from "lucide-react";

export default function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
const [search, setSearch] = useState("");

useEffect(() => {
  loadCustomers();
}, []);

async function loadCustomers() {

 const { data, error } = await supabase
  .from("customer_profiles")
  .select(`
    *,
    orders(
      id,
      total,
      status
    )
  `)
  .order("first_name");

  if (!error) {
    setCustomers(data || []);
  }
}

const filteredCustomers = useMemo(() => {

  return customers.filter((customer) => {

    const text = `${customer.first_name || ""} ${customer.last_name || ""} ${customer.email || ""}`.toLowerCase();

    return text.includes(search.toLowerCase());

  });

}, [customers, search]);
function getCustomerStats(customer) {

  const orders = customer.orders || [];

  const totalSpent = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  return {
    ordersCount: orders.length,
    totalSpent,
  };

}
const stats = getCustomerStats(customer);
  return (

    <AdminLayout title="Clients">

      <div className="bg-white rounded-3xl p-8 border border-slate-200">

<div className="flex justify-between items-center mb-8">

<div>

<h2 className="text-3xl font-black flex items-center gap-3">

<Users className="w-8 h-8 text-[#ff5a00]" />

Clients

</h2>

<p className="text-slate-500 mt-2">

{filteredCustomers.length} client(s)

</p>

</div>

</div>

<div className="relative mb-8">

<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>

<input
placeholder="Rechercher un client..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="w-full h-14 rounded-2xl border pl-12"
/>

</div>

<div className="space-y-5">

{filteredCustomers.map((customer)=>(

<div
key={customer.id}
className="rounded-3xl border p-6 hover:shadow-xl transition">

<div className="flex justify-between items-center">

<div>

<h3 className="text-2xl font-black">

{customer.first_name} {customer.last_name}

</h3>

<div className="space-y-2 mt-4">

<p className="flex items-center gap-2">

<Mail className="w-4 h-4"/>

{customer.email || "-"}

</p>

<p className="flex items-center gap-2">

<Phone className="w-4 h-4"/>

{customer.phone || "-"}

</p>

<p className="flex items-center gap-2">

<Building2 className="w-4 h-4"/>

{customer.company || "-"}

<div className="grid grid-cols-2 gap-4 mt-6">

  <div className="rounded-xl bg-slate-50 p-4">

    <div className="text-sm text-slate-500">
      Commandes
    </div>

    <div className="text-2xl font-black">
      {stats.ordersCount}
    </div>

  </div>

  <div className="rounded-xl bg-slate-50 p-4">

    <div className="text-sm text-slate-500">
      Total dépensé
    </div>

    <div className="text-2xl font-black text-[#ff5a00]">
      {stats.totalSpent.toFixed(2)} €
    </div>

  </div>

</div>

</p>

</div>

</div>


<Link
  to={`/admin/clients/${customer.id}`}
  className="bg-[#ff5a00] text-white px-6 h-11 rounded-xl font-bold flex items-center justify-center"
>

Voir

</Link>

</div>

</div>

))}

{filteredCustomers.length===0 && (

<div className="text-center py-20 text-slate-400">

Aucun client trouvé.

</div>

)}

</div>

</div>

    </AdminLayout>

  );

}