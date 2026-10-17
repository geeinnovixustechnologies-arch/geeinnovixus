"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyForm = {
  title: "",
  description: "",
  category: "",
  domain: "",
  services: "",
  features: "",
  deliveryTime: "",
  popularity: "",
  rating: "",
  icon: "",
  color: "primary",
};

function splitEntries(value) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function AdminResearchPage() {
  const { data: session, status } = useSession();
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRecords = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load research.");
      setRecords(Array.isArray(data.research) ? data.research : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") return;
    let active = true;
    fetch("/api/research", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load research.");
        if (active) setRecords(Array.isArray(data.research) ? data.research : []);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [session, status]);

  const editRecord = (record) => {
    setEditingId(record._id);
    setMessage("");
    setForm({
      title: record.title || "",
      description: record.description || "",
      category: record.category || "",
      domain: record.domain || "",
      services: (record.services || []).join(", "),
      features: (record.features || []).join(", "),
      deliveryTime: record.deliveryTime || "",
      popularity: record.popularity ?? "",
      rating: record.rating ?? "",
      icon: record.icon || "",
      color: record.color || "primary",
    });
  };

  const resetForm = () => {
    setEditingId("");
    setForm(emptyForm);
    setError("");
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      domain: form.domain.trim(),
      services: splitEntries(form.services),
      features: splitEntries(form.features),
      deliveryTime: form.deliveryTime.trim(),
      icon: form.icon.trim(),
      color: form.color,
    };
    if (form.popularity !== "") payload.popularity = Number(form.popularity);
    if (form.rating !== "") payload.rating = Number(form.rating);

    try {
      const response = await fetch(
        editingId ? `/api/research/${editingId}` : "/api/research",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save research.");
      setMessage(editingId ? "Research updated." : "Research created.");
      resetForm();
      await loadRecords();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (record) => {
    if (!window.confirm(`Permanently delete "${record.title}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(record._id);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/research/${record._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to remove research.");
      if (editingId === record._id) resetForm();
      setMessage("Research permanently deleted.");
      await loadRecords();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingId("");
    }
  };

  const deactivateRecord = async (id) => {
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/research/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to deactivate research.");
      setMessage("Research deactivated.");
      await loadRecords();
    } catch (deactivateError) {
      setError(deactivateError.message);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <main className="p-8 text-center" aria-live="polite">Loading research management…</main>;
  }

  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return (
      <main className="min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="my-4">Administrator access is required.</p>
        <Link href="/auth/signin">Sign in</Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <header>
          <h1 className="text-3xl font-bold">Research Management</h1>
          <p className="mt-2 text-gray-600">Manage the public R&amp;D listings.</p>
        </header>
        <form onSubmit={saveRecord} className="space-y-4 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">{editingId ? "Edit research" : "Add research"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["title", "Title", 200],
              ["category", "Category", 100],
              ["domain", "Domain", 100],
              ["deliveryTime", "Delivery time", 100],
              ["icon", "Icon", 50],
            ].map(([key, label, maxLength]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  value={form[key]}
                  maxLength={maxLength}
                  required={["title", "category", "domain"].includes(key)}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [key]: event.target.value }))
                  }
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="popularity">Popularity (0–100)</Label>
              <Input id="popularity" type="number" min="0" max="100" value={form.popularity}
                onChange={(event) => setForm((current) => ({ ...current, popularity: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0–5)</Label>
              <Input id="rating" type="number" min="0" max="5" step="0.1" value={form.rating}
                onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <select id="color" value={form.color}
                onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3">
                {["primary", "secondary", "success", "warning", "info"].map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" required maxLength={2000} value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-24 w-full rounded-md border border-input bg-background p-3" />
          </div>
          {[
            ["services", "Services (comma separated)"],
            ["features", "Features (comma separated)"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input id={key} value={form[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} />
            </div>
          ))}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="text-sm text-green-700">{message}</p>}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Create research"}</Button>
            {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel edit</Button>}
          </div>
        </form>
        <section aria-labelledby="research-list-heading" className="space-y-4">
          <h2 id="research-list-heading" className="text-xl font-semibold">Existing research</h2>
          {!records.length && !loading && <p className="rounded-lg bg-white p-6 text-gray-600">No research records yet.</p>}
          <div className="grid gap-4 md:grid-cols-2">
            {records.map((record) => (
              <article key={record._id} className="space-y-3 rounded-xl bg-white p-5 shadow">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold">{record.title}</h3>
                  <span className={record.isActive ? "text-green-700" : "text-gray-500"}>
                    {record.isActive ? "Published" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{record.category} · {record.domain}</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => editRecord(record)}>Edit</Button>
                  {record.isActive && <Button type="button" variant="destructive" onClick={() => deactivateRecord(record._id)}>Deactivate</Button>}
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deletingId === record._id}
                    onClick={() => deleteRecord(record)}
                  >
                    {deletingId === record._id ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
