const DRIVE_FILE_ID_PATTERN = /^[a-zA-Z0-9_-]{10,200}$/;

function getGoogleDriveFileId(value) {
  if (typeof value !== "string" || value.length > 2048) return null;

  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "drive.google.com" ||
      url.port ||
      url.username ||
      url.password
    ) {
      return null;
    }

    const filePathMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
    const fileId = filePathMatch?.[1] || url.searchParams.get("id");
    if (!fileId || !DRIVE_FILE_ID_PATTERN.test(fileId)) return null;

    return fileId;
  } catch {
    return null;
  }
}

export function isGoogleDriveFileId(value) {
  return typeof value === "string" && DRIVE_FILE_ID_PATTERN.test(value);
}

export function getGoogleDriveImageUrl(value) {
  const fileId = getGoogleDriveFileId(value);
  if (!fileId) return null;

  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600`;
}

export function getGoogleDriveImageProxyUrl(value) {
  const fileId = getGoogleDriveFileId(value);
  if (!fileId) return null;

  return `/api/gallery/image/${encodeURIComponent(fileId)}`;
}
