"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  Search,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GridPattern } from "@/components/ui/grid-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { learningCategories, learningLevels } from "@/lib/learning-offering-options.js";

function CourseLoadingState() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8" aria-busy="true">
        <div className="text-center" role="status">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Loading Learning Hub...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function LearningHubPage() {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/learning-offerings?limit=100", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load offerings");
        setOfferings(data.offerings);
        setError("");
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Unable to load offerings");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const visibleOfferings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return offerings.filter((offering) => {
      const matchesSearch =
        !query ||
        [offering.title, offering.description, offering.shortDescription]
          .join(" ")
          .toLowerCase()
          .includes(query) ||
        (offering.software || []).some((item) =>
          item.toLowerCase().includes(query)
        );

      return (
        matchesSearch &&
        (selectedCategory === "all" ||
          offering.category === selectedCategory) &&
        (selectedLevel === "all" || offering.level === selectedLevel)
      );
    });
  }, [offerings, searchTerm, selectedCategory, selectedLevel]);

  if (loading) return <CourseLoadingState />;

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
              Learn, practice, grow
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Learning Hub
            </h1>
            <p className="mx-auto mb-8 mt-5 max-w-3xl text-lg text-white/90 sm:text-xl">
              Explore courses, hands-on training, and workshops in one place.
              Find the learning program that fits your goals.
            </p>
            <a
              href="#offerings"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 shadow transition hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Browse programs <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section
          aria-label="Search and filter learning programs"
          className="border-b bg-white py-6 sm:py-8"
        >
          <div className="container mx-auto flex flex-col gap-4 px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <label htmlFor="learning-search" className="sr-only">
                Search courses, training, and workshops
              </label>
              <div className="relative max-w-md">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="learning-search"
                  placeholder="Search learning programs..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger
                  aria-label="Filter by category"
                  className="w-full sm:max-w-xs"
                >
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {learningCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger
                  aria-label="Filter by level"
                  className="w-full sm:max-w-xs"
                >
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {learningLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section id="offerings" className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {error && (
              <div
                role="alert"
                className="mb-8 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800"
              >
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-3 font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Try again
                </button>
              </div>
            )}

            {!error && (
              <>
                {visibleOfferings.length > 0 && (
                  <p className="mb-5 text-sm text-gray-600">
                    Showing {visibleOfferings.length}{" "}
                    {visibleOfferings.length === 1
                      ? "learning program"
                      : "learning programs"}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
                  {visibleOfferings.map((offering) => (
                    <MagicCard
                      key={offering._id}
                      className="h-full border border-gray-200/50 bg-white/80 p-6 backdrop-blur-sm"
                      gradientColor="rgba(59, 130, 246, 0.1)"
                    >
                      <div className="flex min-h-full flex-col">
                        <div className="mb-4 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="shrink-0 text-2xl text-blue-700">
                              <GraduationCap
                                aria-hidden="true"
                                className="h-7 w-7"
                              />
                            </span>
                            <div className="min-w-0 flex-1">
                              <h2 className="line-clamp-2 text-base font-semibold text-gray-900 sm:text-lg">
                                {offering.title}
                              </h2>
                              <Badge variant="secondary" className="mt-1 max-w-full">
                                <span className="truncate">{offering.category}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                          {offering.shortDescription || offering.description}
                        </p>

                        <div className="mb-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock
                              aria-hidden="true"
                              className="h-4 w-4 shrink-0 text-blue-600"
                            />
                            <span className="text-xs text-gray-600 sm:text-sm">
                              Duration: {offering.duration}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen
                              aria-hidden="true"
                              className="h-4 w-4 shrink-0 text-blue-600"
                            />
                            <span className="text-xs text-gray-600 sm:text-sm">
                              Level: {offering.level}
                            </span>
                          </div>
                        </div>

                        {offering.software?.length > 0 && (
                          <div className="mb-4">
                            <h3 className="mb-2 text-sm font-semibold text-gray-900">
                              Topics and tools:
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {offering.software.slice(0, 4).map((tool) => (
                                <Badge
                                  key={tool}
                                  variant="secondary"
                                  className="max-w-full text-xs"
                                >
                                  <span className="truncate">{tool}</span>
                                </Badge>
                              ))}
                              {offering.software.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{offering.software.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-auto space-y-3 pt-2">
                          {offering.features?.length > 0 && (
                            <div>
                              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                                Key features:
                              </h3>
                              <div className="flex flex-wrap gap-1">
                                {offering.features.slice(0, 3).map((feature) => (
                                  <Badge
                                    key={feature}
                                    variant="outline"
                                    className="max-w-full text-xs"
                                  >
                                    <span className="truncate">{feature}</span>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <Link
                            href={`/learning-hub/${offering._id}`}
                            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                          >
                            View program
                            <ArrowRight aria-hidden="true" className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </MagicCard>
                  ))}
                </div>
                {visibleOfferings.length === 0 && (
                  <div className="py-16 text-center">
                    <BookOpen
                      aria-hidden="true"
                      className="mx-auto h-10 w-10 text-gray-400"
                    />
                    <p className="mt-4 text-lg text-gray-600">
                      {offerings.length
                        ? "No learning programs found matching your criteria."
                        : "Learning opportunities are coming soon."}
                    </p>
                    {offerings.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("all");
                          setSelectedLevel("all");
                        }}
                        className="mt-3 font-semibold text-blue-700 underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
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
              Ready to Start Learning?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 sm:text-xl">
              Contact us to find the right course, training, or workshop for
              your goals.
            </p>
            <div className="flex justify-center">
              <WhatsAppButton
                subject="Learning Hub Inquiry"
                className="bg-green-600 px-8 py-3 text-lg text-white hover:bg-green-700"
              >
                Contact on WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
