/**
 * Script Properties required:
 *   CERTIFICATE_TEMPLATE_ID Google Slides template file ID
 *   CERTIFICATE_FOLDER_ID   Drive folder ID for generated PDFs
 *
 * Google Slides template placeholders:
 *   {{studentName}}, {{domain}}, {{duration}}, {{startDate}}, {{endDate}},
 *   {{issuedAt}}, {{provider}}, {{certificateId}}, {{certificateUrl}}
 *
 * First run testCertificateGeneration() from the Apps Script editor. Once the
 * sample PDF is correct, deploy this project as a Web App and use its URL as
 * CERTIFICATE_APPS_SCRIPT_URL in the Next.js server environment.
 */

function doPost(event) {
  try {
    var input = JSON.parse(
      (event && event.postData && event.postData.contents) || "{}"
    );
    var result = generateCertificate(input);
    return jsonResponse({ success: true, certificateUrl: result.certificateUrl });
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return jsonResponse({
      success: false,
      message: error && error.message ? error.message : "Certificate generation failed",
      details: error && error.stack ? String(error.stack).slice(0, 3000) : undefined
    });
  }
}

/** Run this function manually in Apps Script to test setup and template. */
function testCertificateGeneration() {
  var samplePayload = {
    studentName: "Sample Student",
    domain: "Full Stack Development",
    duration: "90+ Hours (Oct 1st 2025 - Nov 2025)",
    startDate: "2025-10-01",
    endDate: "2025-11-01",
    issuedAt: "2025-11-06",
    provider: "Gee Innovixus Technologies (OPC) Pvt Ltd",
    certificateId: "GI-TEST-001",
    certificateUrl: "https://geeinnovixus.com/verify/GI-TEST-001"
  };

  var result = generateCertificate(samplePayload);
  console.log("Test PDF created: " + result.certificateUrl);
  return result.certificateUrl;
}

function generateCertificate(input) {
  var fields = [
    "studentName",
    "domain",
    "duration",
    "startDate",
    "endDate",
    "issuedAt",
    "provider",
    "certificateId",
    "certificateUrl"
  ];

  if (!input || typeof input !== "object") {
    throw new Error("Request body must be a JSON object");
  }

  fields.forEach(function (field) {
    if (typeof input[field] !== "string" || !input[field].trim()) {
      throw new Error("Missing required field: " + field);
    }
  });

  var properties = PropertiesService.getScriptProperties();
  var templateId = properties.getProperty("CERTIFICATE_TEMPLATE_ID");
  var folderId = properties.getProperty("CERTIFICATE_FOLDER_ID");
  if (!templateId) throw new Error("Set CERTIFICATE_TEMPLATE_ID in Script Properties");
  if (!folderId) throw new Error("Set CERTIFICATE_FOLDER_ID in Script Properties");

  var folder = DriveApp.getFolderById(folderId);
  var template = DriveApp.getFileById(templateId);
  var baseName = input.certificateId.trim() + " - " + input.studentName.trim();
  var workingCopy = template.makeCopy(baseName, folder);

  try {
    var presentation = SlidesApp.openById(workingCopy.getId());
    fields.forEach(function (field) {
      presentation.replaceAllText(
        "{{" + field + "}}",
        String(input[field]).trim()
      );
    });
    presentation.saveAndClose();

    var pdfBlob = workingCopy.getAs(MimeType.PDF).setName(baseName + ".pdf");
    var pdfFile = folder.createFile(pdfBlob);
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return { certificateUrl: pdfFile.getUrl() };
  } finally {
    // Keep the output folder clean; the PDF remains, while the temporary Doc is removed.
    workingCopy.setTrashed(true);
  }
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
