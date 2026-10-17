"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CheckCircle2, ChevronLeft, FileBadge, Pencil } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EMPTY_DETAILS = {
  studentName: "",
  domain: "",
  duration: "",
  startDate: "",
  endDate: "",
  issuedAt: "",
  provider: "Gee Innovixus Technologies (OPC) Pvt Ltd",
  certificateId: "",
};
const FIELD_DEFINITIONS = [
  ["studentName", "Student name", "text"],
  ["domain", "Domain", "text"],
  ["duration", "Duration", "text"],
  ["startDate", "Start date", "date"],
  ["endDate", "End date", "date"],
  ["issuedAt", "Issue date", "date"],
  ["provider", "Provider", "text"],
  ["certificateId", "Certificate ID", "text"],
];
const EMPTY_FILTERS = { search: "", issuedFrom: "", issuedTo: "" };

export default function AdminCertificatePage() {
  const { data: session, status } = useSession();
  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [error, setError] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterDraft, setFilterDraft] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [activeTab, setActiveTab] = useState("generate");

  const loadCertificates = useCallback(async (requestedPage = 1) => {
    setListLoading(true);
    setListError("");
    try {
      const query = new URLSearchParams({ page: String(requestedPage) });
      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim()) query.set(key, value.trim());
      });
      const response = await fetch(`/api/certificates?${query}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not load certificates.");
      setCertificates(result.certificates || []);
      setPage(result.page || requestedPage);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (loadError) {
      setListError(loadError.message);
    } finally {
      setListLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      loadCertificates(page);
    }
  }, [status, session?.user?.role, page, loadCertificates]);

  function beginEdit(item) {
    setActiveTab("generate");
    setEditingId(item.certificateId);
    setDetails({
      studentName: item.studentName,
      domain: item.domain,
      duration: item.duration,
      startDate: new Date(item.startDate).toISOString().slice(0, 10),
      endDate: new Date(item.endDate).toISOString().slice(0, 10),
      issuedAt: new Date(item.issuedAt).toISOString().slice(0, 10),
      provider: item.provider,
      certificateId: item.certificateId,
    });
    setCertificate(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId("");
    setDetails(EMPTY_DETAILS);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setCertificate(null);
    setSaving(true);
    try {
      const response = await fetch(
        editingId ? `/api/certificates?id=${encodeURIComponent(editingId)}` : "/api/certificates",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(details),
        }
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Could not generate certificate.");
      setCertificate(result.certificate);
      setEditingId("");
      setDetails(EMPTY_DETAILS);
      if (page === 1) await loadCertificates(1);
      else setPage(1);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading")
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p role="status">Loading administrator access…</p>
      </main>
    );
  if (!session || session.user?.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              {session ? "Administrator access required" : "Sign in required"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sign in with an administrator account to access certificate tools.
            </p>
            <Button asChild className="mt-5">
              <Link href={session ? "/" : "/auth/signin"}>
                {session ? "Go to home" : "Admin sign in"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          Admin dashboard
        </Link>
        <div className="mb-8 mt-5 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Administration
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Certificate generation
          </h1>
          <p className="mt-3 text-slate-600">
            Generate a certificate PDF and save its verification details.
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mx-auto max-w-6xl">
          <TabsList className="mb-4 grid h-auto w-full max-w-md grid-cols-2">
            <TabsTrigger value="generate">Generate Certificate</TabsTrigger>
            <TabsTrigger value="records">Generated Certificates</TabsTrigger>
          </TabsList>
          <TabsContent value="generate">
        {error ? (
          <p
            role="alert"
            className="mx-auto mb-5 max-w-3xl rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900"
          >
            {error}
          </p>
        ) : null}
        {certificate ? (
          <div
            role="status"
            className="mx-auto mb-5 flex max-w-3xl items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950"
          >
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Certificate generated and saved</p>
              <p className="mt-1 text-sm">
                Certificate ID: {certificate.certificateId}
              </p>
              <a
                className="mt-2 inline-block text-sm font-medium underline"
                href={certificate.certificateUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open generated certificate
              </a>
            </div>
          </div>
        ) : null}
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{editingId ? "Edit certificate" : "Certificate details"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter the information to appear on the certificate and its
                verification record.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                {FIELD_DEFINITIONS.map(([name, label, type]) => (
                  <div className="space-y-2" key={name}>
                    <Label htmlFor={`certificate-${name}`}>
                      {label}
                      <span className="ml-1 text-rose-700" aria-hidden="true">
                        *
                      </span>
                    </Label>
                    <Input
                      id={`certificate-${name}`}
                      name={name}
                      type={type}
                      required
                      maxLength={name === "certificateId" ? 64 : 160}
                      value={details[name]}
                      onChange={(event) =>
                        setDetails({ ...details, [name]: event.target.value })
                      }
                      placeholder={
                        name === "certificateId"
                          ? "e.g. GI-2025-MR01"
                          : undefined
                      }
                    />
                  </div>
                ))}
                <Button
                  disabled={saving}
                  type="submit"
                  className="w-full sm:w-auto sm:col-span-2"
                >
                  <FileBadge aria-hidden="true" className="size-4" />
                  {saving
                    ? editingId ? "Saving and regenerating…" : "Generating certificate…"
                    : editingId ? "Save changes and regenerate" : "Generate certificate"}
                </Button>
                {editingId ? (
                  <Button type="button" variant="outline" disabled={saving} onClick={cancelEdit} className="w-full sm:w-auto sm:col-span-2">
                    Cancel edit
                  </Button>
                ) : null}
              </form>
            </CardContent>
          </Card>
        </div>
          </TabsContent>
          <TabsContent value="records">
        <section className="mx-auto mt-10 max-w-5xl" aria-labelledby="issued-certificates-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="issued-certificates-heading" className="text-2xl font-bold text-slate-950">Generated certificates</h2>
              <p className="mt-1 text-sm text-slate-600">Edit details and regenerate a PDF if a certificate needs correction.</p>
            </div>
            <Button type="button" variant="outline" onClick={() => loadCertificates(page)} disabled={listLoading}>
              {listLoading ? "Refreshing…" : "Refresh list"}
            </Button>
          </div>
          <form
            className="mb-5 grid grid-cols-1 gap-3 rounded-xl border bg-white p-4 shadow-sm md:grid-cols-[minmax(220px,2fr)_minmax(150px,1fr)_minmax(150px,1fr)_auto_auto] md:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setFilters({ ...filterDraft });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="certificate-search">Search</Label>
              <Input
                id="certificate-search"
                type="search"
                placeholder="Name, domain, provider, or ID"
                value={filterDraft.search}
                onChange={(event) => setFilterDraft({ ...filterDraft, search: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issued-from">Issued from</Label>
              <Input id="issued-from" type="date" value={filterDraft.issuedFrom} onChange={(event) => setFilterDraft({ ...filterDraft, issuedFrom: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issued-to">Issued to</Label>
              <Input id="issued-to" type="date" value={filterDraft.issuedTo} onChange={(event) => setFilterDraft({ ...filterDraft, issuedTo: event.target.value })} />
            </div>
            <Button type="submit" disabled={listLoading}>Apply filters</Button>
            <Button
              type="button"
              variant="outline"
              disabled={listLoading && certificates.length === 0}
              onClick={() => {
                setFilterDraft(EMPTY_FILTERS);
                setFilters(EMPTY_FILTERS);
                setPage(1);
              }}
            >
              Clear
            </Button>
          </form>
          {listError ? <p role="alert" className="mb-4 rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">{listError}</p> : null}
          {listLoading && certificates.length === 0 ? <p role="status" className="py-8 text-center text-sm text-slate-600">Loading certificates…</p> : null}
          {!listLoading && certificates.length === 0 && !listError ? <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">{filters.search || filters.issuedFrom || filters.issuedTo ? "No certificates match these filters." : "No generated certificates yet."}</CardContent></Card> : null}
          {certificates.length > 0 ? (
            <>
              <div className="rounded-xl border bg-white shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Certificate ID</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>PDF</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">{item.studentName}</TableCell>
                        <TableCell>{item.domain}</TableCell>
                        <TableCell className="font-mono text-xs">{item.certificateId}</TableCell>
                        <TableCell>{new Date(item.issuedAt).toLocaleDateString()}</TableCell>
                        <TableCell><a href={item.certificateUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline">Open PDF</a></TableCell>
                        <TableCell className="text-right">
                          <Button type="button" size="sm" variant="outline" onClick={() => beginEdit(item)}>
                            <Pencil aria-hidden="true" className="mr-1 size-4" />Edit and regenerate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} certificates</p>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" disabled={page <= 1 || listLoading} onClick={() => setPage(page - 1)}>Previous</Button>
                  <span className="min-w-24 text-center text-sm text-slate-600">Page {page} of {totalPages}</span>
                  <Button type="button" variant="outline" disabled={page >= totalPages || listLoading} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
              </div>
            </>
          ) : null}
        </section>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
