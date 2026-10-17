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
  "AI/ML",
  "Blockchain",
  "Web Development",
  "Mobile Development",
  "IoT",
  "Data Science",
  "Cybersecurity",
  "Cloud Computing",
  "Other",
];
const domains = [
  "Artificial Intelligence", "Machine Learning", "Deep Learning",
  "Computer Vision", "NLP", "Blockchain", "Web3", "Frontend", "Backend",
  "Full Stack", "Mobile", "IoT", "Data Analytics", "Cybersecurity", "Cloud", "DevOps",
];

function lines(items) {
  return (items || []).join("\n");
}

export default function EditProjectPage() {
  const { data: session, status } = useSession();
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin" || !id) return;
    fetch("/api/projects?limit=100", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load project.");
        const project = data.projects?.find((item) => item._id === id);
        if (!project) throw new Error("Project not found.");
        setForm({
          title: project.title || "",
          description: project.description || "",
          shortDescription: project.shortDescription || "",
          category: project.category || "Other",
          domain: lines(project.domain),
          technologies: lines(project.technologies),
          features: lines(project.features),
          difficulty: project.difficulty || "intermediate",
          estimatedTime: project.estimatedTime || "",
          basePrice: project.pricing?.basePrice ?? 0,
          currency: project.pricing?.currency || "USD",
          isActive: project.isActive !== false,
          isFeatured: Boolean(project.isFeatured),
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
      title: form.title.trim(),
      description: form.description.trim(),
      shortDescription: form.shortDescription.trim(),
      category: form.category,
      domain: valueList(form.domain),
      technologies: valueList(form.technologies),
      features: valueList(form.features),
      difficulty: form.difficulty,
      estimatedTime: form.estimatedTime.trim(),
      pricing: { basePrice: Number(form.basePrice), currency: form.currency },
      isActive: form.isActive,
      isFeatured: form.isFeatured,
    };
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.errors?.map((item) => item.message).join(", ") || data.message || "Could not save project.");
      }
      router.push("/admin/projects");
      router.refresh();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <main className="p-8 text-center" aria-live="polite">Loading project…</main>;
  }
  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return <main className="p-8 text-center"><h1 className="text-2xl font-bold">Access denied</h1><Link href="/auth/signin">Sign in</Link></main>;
  }
  if (!form) {
    return <main className="p-8 text-center"><p role="alert">{error || "Project not found."}</p><Link href="/admin/projects">Back to projects</Link></main>;
  }

  const textFields = [
    ["title", "Title", 200],
    ["shortDescription", "Short description", 300],
    ["estimatedTime", "Estimated time", 100],
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold">Edit project</h1>
          <p className="mt-2 text-gray-600">Changes are saved to the MongoDB project record.</p>
        </div>
        <form onSubmit={save} className="space-y-5 rounded-xl bg-white p-6 shadow">
          {textFields.map(([key, label, maxLength]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input id={key} required maxLength={maxLength} value={form[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" required minLength={50} maxLength={2000} value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="min-h-32 w-full rounded-md border p-3" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="category">Category</Label>
              <select id="category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="h-10 w-full rounded-md border px-3">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label htmlFor="difficulty">Difficulty</Label>
              <select id="difficulty" value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value })} className="h-10 w-full rounded-md border px-3">
                {["beginner", "intermediate", "advanced"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label htmlFor="basePrice">Base price</Label>
              <Input id="basePrice" type="number" min="0" required value={form.basePrice} onChange={(event) => setForm({ ...form, basePrice: event.target.value })} />
            </div>
            <div className="space-y-2"><Label htmlFor="currency">Currency</Label>
              <select id="currency" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} className="h-10 w-full rounded-md border px-3">
                {["USD", "INR", "EUR", "GBP"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>
          {[
            ["domain", "Domains (one per line)"],
            ["technologies", "Technologies (one per line)"],
            ["features", "Features (one per line)"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2"><Label htmlFor={key}>{label}</Label>
              <textarea id={key} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="min-h-24 w-full rounded-md border p-3" />
            </div>
          ))}
          <div className="flex gap-6">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Published</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} /> Featured</label>
          </div>
          {error && <p role="alert" className="text-red-700">{error}</p>}
          <div className="flex gap-3"><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button><Button asChild variant="outline"><Link href="/admin/projects">Cancel</Link></Button></div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
