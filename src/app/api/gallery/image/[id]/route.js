import { NextResponse } from "next/server";
import { isGoogleDriveFileId } from "@/lib/google-drive-image-url.js";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_REDIRECTS = 4;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function isGoogleImageHost(hostname) {
  return (
    hostname === "drive.google.com" ||
    hostname === "drive.usercontent.google.com" ||
    hostname === "googleusercontent.com" ||
    hostname.endsWith(".googleusercontent.com")
  );
}

function unavailableImage() {
  return NextResponse.json(
    { message: "Gallery image is currently unavailable" },
    { status: 502, headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(_request, { params }) {
  const { id } = await params;
  if (!isGoogleDriveFileId(id)) {
    return NextResponse.json(
      { message: "Gallery image not found" },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  let imageUrl = new URL("https://drive.google.com/thumbnail");
  imageUrl.searchParams.set("id", id);
  imageUrl.searchParams.set("sz", "w1600");

  try {
    let upstream;
    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
      if (
        imageUrl.protocol !== "https:" ||
        imageUrl.port ||
        imageUrl.username ||
        imageUrl.password ||
        !isGoogleImageHost(imageUrl.hostname)
      ) {
        return unavailableImage();
      }

      upstream = await fetch(imageUrl, {
        cache: "no-store",
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
      });

      if (upstream.status < 300 || upstream.status >= 400) break;
      const location = upstream.headers.get("location");
      if (!location || redirectCount === MAX_REDIRECTS) {
        return unavailableImage();
      }
      await upstream.body?.cancel();
      imageUrl = new URL(location, imageUrl);
    }

    if (!upstream?.ok) return unavailableImage();

    const contentType = upstream.headers.get("content-type")?.split(";")[0];
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      await upstream.body?.cancel();
      return unavailableImage();
    }

    const contentLength = Number(upstream.headers.get("content-length"));
    if (contentLength > MAX_IMAGE_BYTES) {
      await upstream.body?.cancel();
      return unavailableImage();
    }

    const reader = upstream.body?.getReader();
    if (!reader) return unavailableImage();
    const chunks = [];
    let imageSize = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      imageSize += value.byteLength;
      if (imageSize > MAX_IMAGE_BYTES) {
        await reader.cancel();
        return unavailableImage();
      }
      chunks.push(value);
    }
    const image = new Uint8Array(imageSize);
    let offset = 0;
    for (const chunk of chunks) {
      image.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return new NextResponse(image, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error fetching gallery image:", error);
    return unavailableImage();
  }
}
