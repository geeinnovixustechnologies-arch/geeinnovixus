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
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white sm:py-20">
          <GridPattern
            width={40}
            height={40}
            x={-1}
            y={-1}
            className="absolute inset-0 stroke-white/10 [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
          />
          <div className="container relative z-10 mx-auto px-4 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              Moments from our work
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Gallery
            </h1>
            <p className="mx-auto mb-8 mt-5 max-w-3xl text-lg text-white/90 sm:text-xl">
              Real moments from our learning programs, courses, and community
              events.
            </p>
            <a
              href="#gallery-items"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 shadow transition hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
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
              <p className="mb-5 text-sm text-gray-600">
                Showing {images.length}{" "}
                {images.length === 1 ? "gallery moment" : "gallery moments"}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
                {images.map((image) => (
                  <MagicCard
                    key={image._id}
                    className="border border-gray-200/50 bg-white/80 p-0 backdrop-blur-sm"
                    gradientColor="rgba(59, 130, 246, 0.1)"
                  >
                    <figure className="overflow-hidden rounded-[inherit]">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            aria-label={`View image: ${image.altText}`}
                            className="block w-full rounded-t-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                          >
                            <div className="relative aspect-[4/3] w-full bg-gray-100">
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
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                  unoptimized
                                  className="object-contain"
                                  onError={() => markUnavailable(image._id)}
                                />
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
                                unoptimized
                                className="object-contain"
                                onError={() => markUnavailable(image._id)}
                              />
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <figcaption className="p-5">
                        <Badge variant="secondary" className="w-fit capitalize">
                          {image.category}
                        </Badge>
                        <p className="mt-3 leading-6 text-gray-700">
                          {image.caption}
                        </p>
                      </figcaption>
                    </figure>
                  </MagicCard>
                ))}
              </div>
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
