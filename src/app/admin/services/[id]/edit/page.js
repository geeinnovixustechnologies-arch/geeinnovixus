"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const categories = [
  "Academic Projects",
  "Research Publication",
  "Assignment Writing",
  "Consulting",
  "Training",
  "Support",
];

export default function EditServicePage() {
  const { data: session, status } = useSession();
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin" || !id) return;
    fetch("/api/services?limit=100", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load service.");
        const service = data.services?.find((item) => item._id === id);
        if (!service) throw new Error("Service not found.");
        setForm({
          name: service.name || "",
          description: service.description || "",
          shortDescription: service.shortDescription || "",
          category: service.category || categories[0],
          subcategory: service.subcategory || "",
          startingPrice: service.pricing?.startingPrice ?? 0,
          currency: service.pricing?.currency || "USD",
          pricingModel: service.pricing?.pricingModel || "fixed",
          customPricing: Boolean(service.pricing?.customPricing),
          features: (service.features || []).join("\n"),
          deliveryTime: service.deliveryTime || "",
          requirements: (service.requirements || []).join("\n"),
          deliverables: (service.deliverables || []).join("\n"),
          tags: (service.tags || []).join("\n"),
          isActive: service.isActive !== false,
          isPopular: Boolean(service.isPopular),
        });
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [id, session, status]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const valueList = (value) => value.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      shortDescription: form.shortDescription.trim(),
      category: form.category,
      pricing: {
        startingPrice: Number(form.startingPrice),
        currency: form.currency,
        pricingModel: form.pricingModel,
        customPricing: form.customPricing,
      },
      features: valueList(form.features),
      deliveryTime: form.deliveryTime.trim(),
      requirements: valueList(form.requirements),
      deliverables: valueList(form.deliverables),
      tags: valueList(form.tags),
      isActive: form.isActive,
      isPopular: form.isPopular,
    };
    if (form.subcategory.trim()) payload.subcategory = form.subcategory.trim();
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save service.");
      router.push("/admin/services");
      router.refresh();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <main className="p-8 text-center" aria-live="polite">Loading service…</main>;
  }
  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return <main className="p-8 text-center"><h1 className="text-2xl font-bold">Access denied</h1><Link href="/auth/signin">Sign in</Link></main>;
  }
  if (!form) {
    return <main className="p-8 text-center"><p role="alert">{error || "Service not found."}</p><Link href="/admin/services">Back to services</Link></main>;
  }

  const textInputs = [
    ["name", "Name", 200],
    ["shortDescription", "Short description", 300],
    ["subcategory", "Subcategory", 100],
    ["deliveryTime", "Delivery time", 100],
  ];
  const areas = [
    ["description", "Description", 2000],
    ["features", "Features (one per line)", 100],
    ["requirements", "Requirements (one per line)", 200],
    ["deliverables", "Deliverables (one per line)", 200],
    ["tags", "Tags (one per line)", 30],
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold">Edit service</h1>
          <p className="mt-2 text-gray-600">Changes are saved to the MongoDB service record.</p>
        </div>
        <form onSubmit={save} className="space-y-5 rounded-xl bg-white p-6 shadow">
          {textInputs.map(([key, label, maxLength]) => (
            <div key={key} className="space-y-2"><Label htmlFor={key}>{label}</Label>
              <Input id={key} required={key !== "subcategory"} maxLength={maxLength} value={form[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
            </div>
          ))}
          {areas.map(([key, label, maxLength]) => (
            <div key={key} className="space-y-2"><Label htmlFor={key}>{label}</Label>
              <textarea id={key} required={key === "description"} minLength={key === "description" ? 50 : undefined}
                maxLength={maxLength} value={form[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                className="min-h-24 w-full rounded-md border p-3" />
            </div>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="category">Category</Label>
              <select id="category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="h-10 w-full rounded-md border px-3">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label htmlFor="startingPrice">Starting price</Label>
              <Input id="startingPrice" type="number" min="0" required value={form.startingPrice}
                onChange={(event) => setForm({ ...form, startingPrice: event.target.value })} />
            </div>
            <div className="space-y-2"><Label htmlFor="currency">Currency</Label>
              <select id="currency" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} className="h-10 w-full rounded-md border px-3">
                {["USD", "INR", "EUR", "GBP"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label htmlFor="pricingModel">Pricing model</Label>
              <select id="pricingModel" value={form.pricingModel} onChange={(event) => setForm({ ...form, pricingModel: event.target.value })} className="h-10 w-full rounded-md border px-3">
                {["fixed", "hourly", "per_page", "per_project"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            {[
              ["customPricing", "Custom pricing"],
              ["isActive", "Published"],
              ["isPopular", "Popular"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.checked })} />
                {label}
              </label>
            ))}
          </div>
          {error && <p role="alert" className="text-red-700">{error}</p>}
          <div className="flex gap-3"><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button><Button asChild variant="outline"><Link href="/admin/services">Cancel</Link></Button></div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
