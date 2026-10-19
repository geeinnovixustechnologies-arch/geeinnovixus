"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GridPattern } from "@/components/ui/grid-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [failedImages, setFailedImages] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const visibleImages = selectedCategory === "all"
    ? images
    : images.filter((image) => image.category === selectedCategory);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/gallery?limit=100", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load gallery");
        setImages(data.images);
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Unable to load gallery");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  function markUnavailable(id) {
    setFailedImages((current) => new Set(current).add(id));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        <section className="relative isolate overflow-hidden bg-slate-950 py-16 text-white sm:py-20">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.34),transparent_48%),radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,0.22),transparent_42%)]" />
          <GridPattern
            width={40}
            height={40}
            x={-1}
            y={-1}
            className="absolute inset-0 stroke-white/10 [mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
          />
          <div className="container relative z-10 mx-auto px-4 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              A look inside our community
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Gallery
            </h1>
            <p className="mx-auto mb-8 mt-5 max-w-3xl text-lg text-white/90 sm:text-xl">
              Explore the people, projects, and moments behind our courses and
              community events.
            </p>
            <a
              href="#gallery-items"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Explore the gallery
            </a>
          </div>
        </section>
        <section
          id="gallery-items"
          className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
        >
          {loading && (
            <div className="text-center" role="status" aria-busy="true">
              <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600" />
              <p className="mt-4 text-gray-600">Loading gallery...</p>
            </div>
          )}
          {!loading && error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800"
            >
              {error}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="ml-2 font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Try again
              </button>
            </div>
          )}
          {!loading && !error && images.length === 0 && (
            <div className="py-16 text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Gallery updates are coming soon
              </h2>
              <p className="mt-2 text-gray-600">
                There are no published event or course images yet.
              </p>
            </div>
          )}
          {!loading && !error && images.length > 0 && (
            <>
              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-sm text-slate-600" aria-live="polite">
                  Showing <span className="font-semibold text-slate-900">{visibleImages.length}</span> of {images.length} {images.length === 1 ? "moment" : "moments"}
                </p>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter gallery by category">
                  {[
                    { id: "all", label: "All moments", count: images.length },
                    { id: "event", label: "Events", count: images.filter((image) => image.category === "event").length },
                    { id: "course", label: "Courses", count: images.filter((image) => image.category === "course").length },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      aria-pressed={selectedCategory === filter.id}
                      onClick={() => setSelectedCategory(filter.id)}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${selectedCategory === filter.id ? "border-slate-950 bg-slate-950 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"}`}
                    >
                      {filter.label}<span className={selectedCategory === filter.id ? "text-slate-300" : "text-slate-400"}>{filter.count}</span>
                    </button>
                  ))}
                </div>
              </div>
              {visibleImages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <p className="font-semibold text-slate-900">No {selectedCategory} moments yet</p>
                  <p className="mt-2 text-sm text-slate-600">Choose another filter to see more gallery moments.</p>
                  <button type="button" onClick={() => setSelectedCategory("all")} className="mt-4 font-semibold text-blue-700 hover:text-blue-900">Show all moments</button>
                </div>
              ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7 2xl:grid-cols-4">
                {visibleImages.map((image) => (
                  <MagicCard
                    key={image._id}
                    className="h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-sm transition-shadow duration-300 hover:shadow-xl"
                    gradientColor="rgba(59, 130, 246, 0.1)"
                  >
                    <figure className="overflow-hidden rounded-[inherit]">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            aria-label={`View image: ${image.altText}`}
                            className="group block w-full overflow-hidden rounded-t-[inherit] bg-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                          >
                            <div className="relative aspect-[4/3] w-full bg-slate-100">
                              {failedImages.has(image._id) || !image.displayUrl ? (
                                <div
                                  className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-600"
                                  role="img"
                                  aria-label={`${image.altText} (image unavailable)`}
                                >
                                  This image is currently unavailable.
                                </div>
                              ) : (
                                <Image
                                  src={image.displayUrl}
                                  alt={image.altText}
                                  fill
                                  sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, (max-width: 1535px) 33vw, 25vw"
                                  quality={75}
                                  loading="lazy"
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                                  onError={() => markUnavailable(image._id)}
                                />
                              )}
                              {!failedImages.has(image._id) && image.displayUrl && (
                                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
                              )}
                            </div>
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[95dvh] w-[calc(100vw-1rem)] max-w-6xl overflow-y-auto p-4 sm:p-6">
                          <DialogHeader className="pr-8">
                            <DialogTitle>{image.altText}</DialogTitle>
                            <DialogDescription>
                              {image.category}: {image.caption}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="relative flex h-[min(72dvh,48rem)] min-h-48 w-full items-center justify-center rounded-lg bg-slate-950">
                            {failedImages.has(image._id) || !image.displayUrl ? (
                              <p role="status" className="px-6 text-center text-white">
                                This image is currently unavailable.
                              </p>
                            ) : (
                              <Image
                                src={image.displayUrl}
                                alt={image.altText}
                                fill
                                sizes="96vw"
                                quality={75}
                                className="object-contain"
                                onError={() => markUnavailable(image._id)}
                              />
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <figcaption className="min-h-24 p-4 sm:p-5">
                        <Badge variant="secondary" className="max-w-full truncate whitespace-nowrap capitalize" title={image.category}>
                          {image.category}
                        </Badge>
                        <p className="mt-2 line-clamp-2 leading-6 text-gray-700">
                          {image.caption}
                        </p>
                      </figcaption>
                    </figure>
                  </MagicCard>
                ))}
              </div>
              )}
            </>
          )}
        </section>
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white">
          <GridPattern
            width={40}
            height={40}
            x={-1}
            y={-1}
            className="absolute inset-0 stroke-white/10 [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
          />
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Be part of our next moment
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 sm:text-xl">
              Connect with us to learn about upcoming courses, workshops, and
              events.
            </p>
            <WhatsAppButton
              subject="Gallery and Events Inquiry"
              className="bg-green-600 px-8 py-3 text-lg text-white hover:bg-green-700"
            >
              Contact on WhatsApp
            </WhatsAppButton>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
