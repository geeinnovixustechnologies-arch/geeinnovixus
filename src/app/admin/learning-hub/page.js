"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { learningCategories, learningLevels } from "@/lib/learning-offering-options.js";

const emptyForm = {
  title: "",
  description: "",
  shortDescription: "",
  category: learningCategories[0],
  level: learningLevels[0],
  duration: "",
  modules: "",
  software: "",
  features: "",
};

function toForm(offering) {
  return {
    title: offering.title || "",
    description: offering.description || "",
    shortDescription: offering.shortDescription || "",
    category: offering.category || learningCategories[0],
    level: offering.level || learningLevels[0],
    duration: offering.duration || "",
    modules: (offering.modules || []).join("\n"),
    software: (offering.software || []).join("\n"),
    features: (offering.features || []).join("\n"),
  };
}

function lines(value) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

async function fetchLearningOfferings() {
  const response = await fetch("/api/learning-offerings?includeInactive=true&limit=100");
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to load offerings");
  return data.offerings;
}

export default function AdminLearningHubPage() {
  const { data: session, status } = useSession();
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);

  const loadOfferings = useCallback(async () => {
    try {
      const items = await fetchLearningOfferings();
      setError("");
      setOfferings(items);
    } catch (fetchError) {
      setError(fetchError.message || "Unable to load offerings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") return;

    let active = true;
    fetchLearningOfferings()
      .then((items) => {
        if (!active) return;
        setError("");
        setOfferings(items);
      })
      .catch((fetchError) => {
        if (active) setError(fetchError.message || "Unable to load offerings");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [status, session?.user?.role]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function beginEdit(offering) {
    setEditingId(offering._id);
    setForm(toForm(offering));
    setNotice("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId("");
    setForm(emptyForm);
  }

  async function saveOffering(event) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");
    const payload = {
      ...form,
      modules: lines(form.modules),
      software: lines(form.software),
      features: lines(form.features),
    };
    try {
      const response = await fetch(
        editingId
          ? `/api/learning-offerings/${editingId}`
          : "/api/learning-offerings",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save offering");
      resetForm();
      setNotice(editingId ? "Offering updated." : "Offering created.");
      await loadOfferings();
    } catch (saveError) {
      setError(saveError.message || "Unable to save offering");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(offering) {
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/learning-offerings/${offering._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !offering.isActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to update offering");
      setNotice(offering.isActive ? "Offering deactivated." : "Offering reactivated.");
      await loadOfferings();
    } catch (updateError) {
      setError(updateError.message || "Unable to update offering");
    }
  }

  async function deleteOffering(offering) {
    if (!window.confirm(`Permanently delete "${offering.title}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(offering._id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/learning-offerings/${offering._id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to delete offering");
      if (editingId === offering._id) resetForm();
      setNotice("Offering permanently deleted.");
      await loadOfferings();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete offering");
    } finally {
      setDeletingId("");
    }
  }

  if (
    status === "loading" ||
    (status === "authenticated" && session?.user?.role === "admin" && loading)
  ) {
    return <div className="flex min-h-screen items-center justify-center text-slate-700" role="status">Loading Learning Hub administration…</div>;
  }

  if (session?.user?.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Admin access required</h1>
          <p className="mt-3 text-slate-600">Sign in with an administrator account to manage Learning Hub content.</p>
          <Link href="/auth/signin" className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white">Admin sign in</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Administration</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">Learning Hub</h1>
            <p className="mt-2 text-slate-600">Manage courses, training, and workshops in one course-style catalog.</p>
          </div>
          <Link href="/learning-hub" className="font-medium text-blue-700 hover:text-blue-900">View public hub</Link>
        </div>

        {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">{error}</p>}
        {notice && <p role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">{notice}</p>}

        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-semibold text-slate-900">{editingId ? "Edit offering" : "Add an offering"}</h2>
          <form onSubmit={saveOffering} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Title
              <input name="title" value={form.title} onChange={updateField} required maxLength={200} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Category
              <select name="category" value={form.category} onChange={updateField} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
                {learningCategories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Short description
              <textarea name="shortDescription" value={form.shortDescription} onChange={updateField} required maxLength={300} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Full description
              <textarea name="description" value={form.description} onChange={updateField} required maxLength={2000} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Level
              <select name="level" value={form.level} onChange={updateField} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
                {learningLevels.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Duration
              <input name="duration" value={form.duration} onChange={updateField} required maxLength={100} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Modules or topics (one per line)
              <textarea name="modules" value={form.modules} onChange={updateField} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Software or tools (one per line)
              <textarea name="software" value={form.software} onChange={updateField} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Included features (one per line)
              <textarea name="features" value={form.features} onChange={updateField} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button disabled={saving} type="submit" className="rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
                {saving ? "Saving…" : editingId ? "Save changes" : "Create offering"}
              </button>
              {editingId && <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700">Cancel edit</button>}
            </div>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">All offerings</h2>
          {offerings.length === 0 && !error && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">The Learning Hub is empty. Add the first course or workshop above.</p>}
          <div className="grid gap-4 lg:grid-cols-2">
            {offerings.map((offering) => (
              <article key={offering._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{offering.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{offering.category} · {offering.level} · {offering.duration}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${offering.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                    {offering.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{offering.shortDescription}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => beginEdit(offering)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                  <button type="button" onClick={() => toggleActive(offering)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    {offering.isActive ? "Deactivate" : "Reactivate"}
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === offering._id}
                    onClick={() => deleteOffering(offering)}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    {deletingId === offering._id ? "Deleting…" : "Delete"}
                  </button>
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
