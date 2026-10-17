import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb.js";
import { authOptions } from "@/lib/auth.js";
import Certificate from "@/models/Certificate.js";

const TEXT_LIMITS = {
  studentName: 120,
  domain: 160,
  duration: 160,
  provider: 160,
  certificateId: 64,
};

function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
    new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
}

function validate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Request body must be an object.";
  for (const [field, limit] of Object.entries(TEXT_LIMITS)) {
    if (typeof body[field] !== "string" || !body[field].trim()) return `${field} is required.`;
    if (body[field].trim().length > limit) return `${field} must be at most ${limit} characters.`;
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(body.certificateId.trim())) return "Certificate ID can contain letters, numbers, hyphens, and underscores only.";
  for (const field of ["startDate", "endDate", "issuedAt"]) {
    if (!validDate(body[field])) return `${field} must be a valid date in YYYY-MM-DD format.`;
  }
  if (body.endDate < body.startDate) return "End date cannot be earlier than start date.";
  if (body.issuedAt < body.endDate) return "Issue date cannot be earlier than end date.";
  return null;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ message: "Admin access required." }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON request body." }, { status: 400 });
  }
  const validationError = validate(body);
  if (validationError) return NextResponse.json({ message: validationError }, { status: 400 });

  const appScriptUrl = process.env.CERTIFICATE_APPS_SCRIPT_URL;
  if (!appScriptUrl) {
    return NextResponse.json({ message: "Certificate generation is not configured. Set the Apps Script URL." }, { status: 503 });
  }

  let phase = "connecting to the certificate database";
  try {
    await connectDB();
    phase = "checking for a duplicate certificate ID";
    if (await Certificate.exists({ certificateId: body.certificateId.trim() })) {
      return NextResponse.json({ message: "A certificate with this ID already exists." }, { status: 409 });
    }

    phase = "calling the Google Apps Script deployment";
    const siteBaseUrl = (process.env.NEXTAUTH_URL || new URL(request.url).origin).replace(/\/$/, "");
    const verificationUrl = `${siteBaseUrl}/verify/${encodeURIComponent(body.certificateId.trim())}`;
    let response;
    try {
      response = await fetch(appScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, certificateUrl: verificationUrl }),
        cache: "no-store",
        signal: AbortSignal.timeout(60000),
      });
    } catch (error) {
      throw new Error(`${error.name === "TimeoutError" ? "Request timed out after 60 seconds" : error.message}`);
    }

    phase = "reading the Google Apps Script response";
    const responseText = await response.text();
    let generated;
    try {
      generated = JSON.parse(responseText);
    } catch {
      const preview = responseText.replace(/\s+/g, " ").slice(0, 800);
      throw new Error(`Apps Script returned non-JSON content (HTTP ${response.status}). Response preview: ${preview || "<empty response>"}`);
    }
    if (!response.ok || !generated?.success || typeof generated.certificateUrl !== "string") {
      const scriptError = [generated?.message, generated?.details].filter(Boolean).join(" — ");
      const message = `Apps Script generation failed (HTTP ${response.status})${scriptError ? `: ${scriptError}` : "."}`;
      console.error(message);
      return NextResponse.json({ message, details: generated }, { status: 502 });
    }
    let parsedUrl;
    try { parsedUrl = new URL(generated.certificateUrl); } catch {}
    if (!parsedUrl || parsedUrl.protocol !== "https:") {
      return NextResponse.json({ message: `Certificate generator returned an invalid link: ${String(generated.certificateUrl).slice(0, 300)}` }, { status: 502 });
    }

    phase = "saving the generated certificate in MongoDB";
    const certificate = await Certificate.create({
      studentName: body.studentName.trim(),
      domain: body.domain.trim(),
      duration: body.duration.trim(),
      status: "verified",
      startDate: new Date(`${body.startDate}T00:00:00.000Z`),
      endDate: new Date(`${body.endDate}T00:00:00.000Z`),
      issuedAt: new Date(`${body.issuedAt}T00:00:00.000Z`),
      provider: body.provider.trim(),
      certificateId: body.certificateId.trim(),
      certificateUrl: generated.certificateUrl,
    });
    return NextResponse.json({ certificate }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) return NextResponse.json({ message: "A certificate with this ID already exists." }, { status: 409 });
    const detail = error?.message || String(error);
    console.error(`Certificate generation failed while ${phase}:`, error);
    return NextResponse.json({
      message: `Certificate generation failed while ${phase}: ${detail}`,
      phase,
      details: { name: error?.name, code: error?.code },
    }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const certificateId = searchParams.get("id")?.trim();
  try {
    await connectDB();
    if (!certificateId) {
      const session = await getServerSession(authOptions);
      if (!session) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
      if (session.user.role !== "admin") return NextResponse.json({ message: "Admin access required." }, { status: 403 });
      const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
      const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
      const limit = 20;
      const query = {};
      const search = searchParams.get("search")?.trim();
      if (search) {
        const matcher = new RegExp(escapeRegex(search), "i");
        query.$or = [
          { studentName: matcher },
          { domain: matcher },
          { provider: matcher },
          { certificateId: matcher },
        ];
      }
      const issuedFrom = searchParams.get("issuedFrom");
      const issuedTo = searchParams.get("issuedTo");
      if (issuedFrom && !validDate(issuedFrom)) {
        return NextResponse.json({ message: "Issue date start filter must be a valid date." }, { status: 400 });
      }
      if (issuedTo && !validDate(issuedTo)) {
        return NextResponse.json({ message: "Issue date end filter must be a valid date." }, { status: 400 });
      }
      if (issuedFrom && issuedTo && issuedFrom > issuedTo) {
        return NextResponse.json({ message: "Issue date start cannot be after issue date end." }, { status: 400 });
      }
      if (issuedFrom) {
        query.issuedAt = { ...query.issuedAt, $gte: new Date(`${issuedFrom}T00:00:00.000Z`) };
      }
      if (issuedTo) {
        const dayAfter = new Date(`${issuedTo}T00:00:00.000Z`);
        dayAfter.setUTCDate(dayAfter.getUTCDate() + 1);
        query.issuedAt = { ...query.issuedAt, $lt: dayAfter };
      }
      const [certificates, total] = await Promise.all([
        Certificate.find(query)
          .sort({ issuedAt: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Certificate.countDocuments(query),
      ]);
      return NextResponse.json({
        certificates,
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      }, { headers: { "Cache-Control": "no-store" } });
    }
    const certificate = await Certificate.findOne({ certificateId }).lean();
    if (!certificate) return NextResponse.json({ message: "Certificate not found." }, { status: 404 });
    return NextResponse.json({ certificate }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return NextResponse.json({ message: "Could not fetch certificate." }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ message: "Admin access required." }, { status: 403 });

  const oldCertificateId = new URL(request.url).searchParams.get("id")?.trim();
  if (!oldCertificateId) return NextResponse.json({ message: "Certificate ID is required for editing." }, { status: 400 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON request body." }, { status: 400 });
  }
  const validationError = validate(body);
  if (validationError) return NextResponse.json({ message: validationError }, { status: 400 });
  if (!process.env.CERTIFICATE_APPS_SCRIPT_URL) {
    return NextResponse.json({ message: "Certificate generation is not configured. Set the Apps Script URL." }, { status: 503 });
  }

  let phase = "connecting to the certificate database";
  try {
    await connectDB();
    const certificate = await Certificate.findOne({ certificateId: oldCertificateId });
    if (!certificate) return NextResponse.json({ message: "Certificate not found." }, { status: 404 });
    if (body.certificateId.trim() !== oldCertificateId && await Certificate.exists({ certificateId: body.certificateId.trim() })) {
      return NextResponse.json({ message: "Another certificate already uses this ID." }, { status: 409 });
    }

    phase = "regenerating the certificate through Google Apps Script";
    const siteBaseUrl = (process.env.NEXTAUTH_URL || new URL(request.url).origin).replace(/\/$/, "");
    const verificationUrl = `${siteBaseUrl}/verify/${encodeURIComponent(body.certificateId.trim())}`;
    const response = await fetch(process.env.CERTIFICATE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, certificateUrl: verificationUrl }),
      cache: "no-store",
      signal: AbortSignal.timeout(60000),
    });
    const responseText = await response.text();
    let generated;
    try {
      generated = JSON.parse(responseText);
    } catch {
      throw new Error(`Apps Script returned non-JSON content (HTTP ${response.status}): ${responseText.replace(/\s+/g, " ").slice(0, 800) || "<empty response>"}`);
    }
    if (!response.ok || !generated?.success || typeof generated.certificateUrl !== "string") {
      const scriptError = [generated?.message, generated?.details].filter(Boolean).join(" — ");
      return NextResponse.json({ message: `Apps Script regeneration failed (HTTP ${response.status})${scriptError ? `: ${scriptError}` : "."}` }, { status: 502 });
    }
    let pdfUrl;
    try { pdfUrl = new URL(generated.certificateUrl); } catch {}
    if (!pdfUrl || pdfUrl.protocol !== "https:") {
      return NextResponse.json({ message: "Apps Script returned an invalid PDF link." }, { status: 502 });
    }

    phase = "updating the certificate record in MongoDB";
    Object.assign(certificate, {
      studentName: body.studentName.trim(),
      domain: body.domain.trim(),
      duration: body.duration.trim(),
      status: "verified",
      startDate: new Date(`${body.startDate}T00:00:00.000Z`),
      endDate: new Date(`${body.endDate}T00:00:00.000Z`),
      issuedAt: new Date(`${body.issuedAt}T00:00:00.000Z`),
      provider: body.provider.trim(),
      certificateId: body.certificateId.trim(),
      certificateUrl: generated.certificateUrl,
    });
    await certificate.save();
    return NextResponse.json({ certificate }, { status: 200 });
  } catch (error) {
    if (error.code === 11000) return NextResponse.json({ message: "Another certificate already uses this ID." }, { status: 409 });
    console.error(`Certificate regeneration failed while ${phase}:`, error);
    return NextResponse.json({ message: `Certificate regeneration failed while ${phase}: ${error?.message || String(error)}` }, { status: 500 });
  }
}
