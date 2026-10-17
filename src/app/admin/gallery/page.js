"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

async function fetchGalleryImages() {
  const response = await fetch("/api/gallery?includeInactive=true&limit=100", {
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to load gallery");
  return data.images;
}

export default function AdminGalleryPage() {
  const { data: session, status } = useSession();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState({
    url: "",
    altText: "",
    caption: "",
    category: "event",
  });

  const loadImages = useCallback(async () => {
    try {
      const galleryImages = await fetchGalleryImages();
      setError("");
      setImages(galleryImages);
    } catch (fetchError) {
      setError(fetchError.message || "Unable to load gallery");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") return;

    let active = true;
    fetchGalleryImages()
      .then((galleryImages) => {
        if (!active) return;
        setError("");
        setImages(galleryImages);
      })
      .catch((fetchError) => {
        if (active) setError(fetchError.message || "Unable to load gallery");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [status, session?.user?.role]);

  async function submitEntry(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const response = await fetch(
        editingId ? `/api/gallery/${editingId}` : "/api/gallery",
        {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to add gallery entry");
      setNotice(editingId ? "Gallery entry updated." : "Gallery entry published.");
      setEditingId("");
      setForm({ url: "", altText: "", caption: "", category: "event" });
      await loadImages();
    } catch (submitError) {
      setError(submitError.message || "Unable to add gallery entry");
    } finally {
      setSubmitting(false);
    }
  }

  function editImage(image) {
    setEditingId(image._id);
    setError("");
    setNotice("");
    setForm({
      url: image.url || "",
      altText: image.altText || "",
      caption: image.caption || "",
      category: image.category || "event",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId("");
    setForm({ url: "", altText: "", caption: "", category: "event" });
    setError("");
  }

  async function deleteImage(image) {
    const confirmed = window.confirm(
      "Remove this entry from the public gallery? The image will remain in Google Drive."
    );
    if (!confirmed) return;
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/gallery/${image._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to delete image");
      setNotice("Gallery entry removed. The image remains in Google Drive.");
      await loadImages();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete image");
      await loadImages();
    }
  }

  if (
    status === "loading" ||
    (status === "authenticated" && session?.user?.role === "admin" && loading)
  ) {
    return <div className="flex min-h-screen items-center justify-center text-slate-700" role="status">Loading gallery administration…</div>;
  }
  if (session?.user?.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Admin access required</h1>
          <p className="mt-3 text-slate-600">Sign in with an administrator account to manage gallery images.</p>
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
            <h1 className="mt-1 text-3xl font-bold text-slate-950">Gallery</h1>
            <p className="mt-2 text-slate-600">Publish real images with useful descriptions and course or event context.</p>
          </div>
          <Link href="/gallery" className="font-medium text-blue-700 hover:text-blue-900">View public gallery</Link>
        </div>

        {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">{error}</p>}
        {notice && <p role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">{notice}</p>}

        <form onSubmit={submitEntry} className="mb-10 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-7">
          <h2 className="text-xl font-semibold text-slate-900 sm:col-span-2">{editingId ? "Edit gallery image" : "Add a gallery image"}</h2>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Public Google Drive image URL
            <input
              type="url"
              value={form.url}
              onChange={(event) => setForm((value) => ({ ...value, url: event.target.value }))}
              required
              maxLength={2048}
              placeholder="https://drive.google.com/file/d/…/view"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <span className="mt-1 block font-normal text-slate-600">
              Set sharing to “Anyone with the link” so visitors can view the image.
            </span>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Alternative text
            <input value={form.altText} onChange={(event) => setForm((value) => ({ ...value, altText: event.target.value }))} required maxLength={300} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Context
            <select value={form.category} onChange={(event) => setForm((value) => ({ ...value, category: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
              <option value="event">Event</option>
              <option value="course">Course</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Caption (identify the event or course)
            <textarea value={form.caption} onChange={(event) => setForm((value) => ({ ...value, caption: event.target.value }))} required maxLength={500} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <button disabled={submitting} type="submit" className="w-fit rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-60 sm:col-span-2">
            {submitting ? "Saving…" : editingId ? "Save changes" : "Publish image"}
          </button>
          {editingId && <button type="button" onClick={cancelEdit} className="w-fit rounded-lg border px-5 py-2.5 font-semibold sm:col-span-2">Cancel edit</button>}
        </form>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Published images</h2>
          {images.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">No gallery images have been added yet.</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <article key={image._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-slate-100">
                  {image.displayUrl && (
                    <Image src={image.displayUrl} alt={image.altText} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" unoptimized className="object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-600">{image.category} · {image.isActive ? "Published" : "Hidden"}</p>
                  <p className="mt-2 font-medium text-slate-900">{image.caption}</p>
                  <p className="mt-1 text-sm text-slate-600">Alt: {image.altText}</p>
                  <button type="button" onClick={() => editImage(image)} className="mt-4 rounded-md border border-blue-300 px-3 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-50">
                    Edit details
                  </button>
                  <button type="button" onClick={() => deleteImage(image)} className="mt-4 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-50">
                    Remove entry
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
