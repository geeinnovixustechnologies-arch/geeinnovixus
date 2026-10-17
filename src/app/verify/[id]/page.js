"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Calendar } from "lucide-react";

export default function CertificationDetailPage({ params }) {
  const { id } = use(params);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCertificate() {
      setLoading(true);
      setNotFound(false);
      setLoadError("");
      setCertificate(null);
      try {
        const response = await fetch(
          `/api/certificates?id=${encodeURIComponent(id)}`,
          { cache: "no-store", signal: controller.signal }
        );
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Could not load certificate.");
        setCertificate(result.certificate);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Could not load certificate verification record:", error);
          setLoadError("We couldn’t load this certificate right now. Please try again later.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadCertificate();
    return () => controller.abort();
  }, [id]);

  const formatDate = (value) => value
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const calculateProgress = (start, end, issued) => {
    if (!start || !end || !issued) return 0;
    const totalDuration = new Date(end) - new Date(start);
    const elapsedDuration = new Date(issued) - new Date(start);
    if (totalDuration <= 0) return 100;
    return Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
  };

  const progress = certificate
    ? calculateProgress(certificate.startDate, certificate.endDate, certificate.issuedAt)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-center">
        <div className="w-full max-w-5xl">
          <Link href="/">
            <Button variant="outline" className="mb-8 inline-flex items-center hover:bg-blue-100 transition-colors duration-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </Link>

          {loading ? (
            <Card className="p-6"><CardContent><p role="status" className="text-gray-600">Loading certificate verification…</p></CardContent></Card>
          ) : loadError ? (
            <Card className="shadow-lg border border-amber-300 bg-amber-50 p-6"><CardContent><p role="alert" className="text-amber-950">{loadError}</p></CardContent></Card>
          ) : notFound || !certificate ? (
            <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm p-6">
              <CardHeader><CardTitle className="text-xl font-semibold text-gray-800">Certificate Not Found</CardTitle></CardHeader>
              <CardContent><p className="text-gray-600">We couldn&apos;t find a certificate with ID <span className="font-semibold text-blue-700">{id}</span>.</p></CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl border border-blue-100 bg-white/90 backdrop-blur-lg rounded-2xl">
              <CardHeader className="border-b border-gray-100 pb-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                  <div>
                    <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">{certificate.studentName}</CardTitle>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{certificate.domain}</Badge>
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">{certificate.duration}</Badge>
                      <div className="flex items-center gap-1 text-green-700 font-medium"><CheckCircle className="w-4 h-4" /><span>Verified</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Certificate ID</p>
                    <p className="font-mono text-sm font-semibold text-blue-800 bg-blue-50 inline-block px-3 py-1 rounded-md mt-1">{certificate.certificateId}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 px-6 lg:px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  <div className="bg-gray-50 rounded-lg p-4"><h4 className="font-semibold text-gray-800 mb-2">Internship Provider</h4><p className="text-gray-700">{certificate.provider}</p></div>
                  <div className="bg-gray-50 rounded-lg p-4"><h4 className="font-semibold text-gray-800 mb-2">Start Date</h4><div className="flex items-center gap-2 text-gray-700"><Calendar className="w-4 h-4 text-gray-500" /><span>{formatDate(certificate.startDate)}</span></div></div>
                  <div className="bg-gray-50 rounded-lg p-4"><h4 className="font-semibold text-gray-800 mb-2">End Date</h4><div className="flex items-center gap-2 text-gray-700"><Calendar className="w-4 h-4 text-gray-500" /><span>{formatDate(certificate.endDate)}</span></div></div>
                </div>

                <div className="mb-10">
                  <h4 className="font-semibold text-gray-800 mb-3">Internship Timeline</h4>
                  <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner"><div className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-green-500 transition-all duration-700 ease-out" style={{ width: `${progress}%` }} /></div>
                  <div className="flex justify-between text-sm text-gray-700 mt-2"><span>Start: {formatDate(certificate.startDate)}</span><span>End: {formatDate(certificate.endDate)}</span><span>Issued: {formatDate(certificate.issuedAt)}</span></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.2fr] gap-8 items-stretch">
                  <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <h4 className="font-semibold text-gray-800 mb-4 text-lg">Certificate Details</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 pl-2">
                      <li><span className="font-medium">Student:</span> {certificate.studentName}</li>
                      <li><span className="font-medium">Domain:</span> {certificate.domain}</li>
                      <li><span className="font-medium">Duration:</span> {certificate.duration}</li>
                      <li><span className="font-medium">Start Date:</span> {formatDate(certificate.startDate)}</li>
                      <li><span className="font-medium">End Date:</span> {formatDate(certificate.endDate)}</li>
                      <li><span className="font-medium">Issued On:</span> {formatDate(certificate.issuedAt)}</li>
                      <li><span className="font-medium">Status:</span> Verified</li>
                    </ul>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div className="p-6 bg-gradient-to-r from-green-50 via-green-100 to-green-50 border border-green-200 rounded-xl flex items-start gap-3 shadow-sm h-full">
                      <CheckCircle className="w-6 h-6 text-green-700 mt-1" />
                      <div><p className="font-semibold text-green-800 text-lg">Certificate Verified</p><p className="text-sm text-green-700 mt-2">This certification has been officially verified by <span className="font-medium text-green-800">{certificate.provider}</span>.</p><p className="text-sm text-green-700 mt-1">Validate the certificate ID for authenticity.</p></div>
                    </div>
                    {certificate.certificateUrl ? <a href={certificate.certificateUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex justify-center rounded-lg bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-800">View certificate PDF</a> : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
