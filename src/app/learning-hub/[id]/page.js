"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock3, GraduationCap } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function LearningOfferingPage({ params }) {
  const { id } = use(params);
  const [offering, setOffering] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/learning-offerings/${encodeURIComponent(id)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Offering not found");
        setOffering(data.offering);
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Unable to load this offering");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/learning-hub"
          className="inline-flex items-center gap-2 font-medium text-blue-700 hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to Learning Hub
        </Link>
        {loading && <p role="status" className="py-20 text-center text-slate-600">Loading offering…</p>}
        {!loading && error && (
          <div role="alert" className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Offering unavailable</h1>
            <p className="mt-2 text-slate-700">{error}</p>
          </div>
        )}
        {!loading && offering && (
          <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <GraduationCap aria-hidden="true" className="h-7 w-7" />
              </span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800">
                {offering.category}
              </span>
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {offering.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-700">{offering.description}</p>
            <div className="mt-6 flex flex-wrap gap-5 border-y border-slate-200 py-4 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2">
                <BookOpen aria-hidden="true" className="h-4 w-4 text-blue-700" />
                {offering.level}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 aria-hidden="true" className="h-4 w-4 text-blue-700" />
                {offering.duration}
              </span>
            </div>
            {offering.modules?.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold text-slate-900">Modules and topics</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {offering.modules.map((module, index) => (
                    <li key={`${module}-${index}`} className="rounded-lg bg-slate-50 px-4 py-3 text-slate-700">
                      {module}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {offering.software?.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold text-slate-900">Software and tools</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {offering.software.map((software) => (
                    <li key={software} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-900">
                      {software}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {offering.features?.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold text-slate-900">What&apos;s included</h2>
                <ul className="mt-3 list-inside list-disc space-y-2 text-slate-700">
                  {offering.features.map((feature, index) => (
                    <li key={`${feature}-${index}`}>{feature}</li>
                  ))}
                </ul>
              </section>
            )}
            <div className="mt-9">
              <WhatsAppButton
                subject={`Learning Hub Inquiry: ${offering.title}`}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Enquire about this offering
              </WhatsAppButton>
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
