// Updated CertificationDetailPage with requested modifications
"use client";

import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Calendar } from "lucide-react";

export default function CertificationDetailPage({ params }) {
    const certifications = [
        {
            id: "GI-2025-MR01",
            studentName: "Koppera Mithul Reddy",
            domain: "Full Stack Development",
            duration: "90+ Hours (Oct 1st 2025 - Nov 2025)",
            status: "verified",
            startDate: "2025-10-01T00:00:00.000Z",
            endDate: "2025-11-01T00:00:00.000Z",
            issuedAt: "2025-11-06T00:00:00.000Z",
            provider: "Gee Innovixus Technologies (OPC) Pvt Ltd",
            certificateId: "GI-2025-MR01",
        },
        {
            id: "GI-2025-MR02",
            studentName: "Deepak Prajapati",
            domain: "Full Stack Development",
            duration: "90+ Hours (Oct 1st 2025 - Nov 2025)",
            status: "verified",
            startDate: "2025-10-01T00:00:00.000Z",
            endDate: "2025-11-01T00:00:00.000Z",
            issuedAt: "2025-11-06T00:00:00.000Z",
            provider: "Gee Innovixus Technologies (OPC) Pvt Ltd",
            certificateId: "GI-2025-MR02",
        },
        {
            id: "GI-2025-MR03",
            studentName: "J Sai Kiran Reddy",
            domain: "Full Stack Development",
            duration: "90+ Hours (Oct 1st 2025 - Nov 2025)",
            status: "verified",
            startDate: "2025-10-01T00:00:00.000Z",
            endDate: "2025-11-01T00:00:00.000Z",
            issuedAt: "2025-11-06T00:00:00.000Z",
            provider: "Gee Innovixus Technologies (OPC) Pvt Ltd",
            certificateId: "GI-2025-MR03",
        },
        {
            id: "GI-2025-MR04",
            studentName: "Jatoth Akhil",
            domain: "Full Stack Development",
            duration: "90+ Hours (Oct 1st 2025 - Nov 2025)",
            status: "verified",
            startDate: "2025-10-01T00:00:00.000Z",
            endDate: "2025-11-01T00:00:00.000Z",
            issuedAt: "2025-11-06T00:00:00.000Z",
            provider: "Gee Innovixus Technologies (OPC) Pvt Ltd",
            certificateId: "GI-2025-MR04",
        },
        {
            id: "GI-2025-MR05",
            studentName: "Juturi Shreeja",
            domain: "Full Stack Development",
            duration: "90+ Hours (Oct 1st 2025 - Nov 2025)",
            status: "verified",
            startDate: "2025-10-01T00:00:00.000Z",
            endDate: "2025-11-01T00:00:00.000Z",
            issuedAt: "2025-11-06T00:00:00.000Z",
            provider: "Gee Innovixus Technologies (OPC) Pvt Ltd",
            certificateId: "GI-2025-MR05",
        },
        {
            id: "GI-2025-MR06",
            studentName: "Atigadda Abhinaya",
            domain: "Full Stack Development",
            duration: "90+ Hours (Oct 1st 2025 - Nov 2025)",
            status: "verified",
            startDate: "2025-10-01T00:00:00.000Z",
            endDate: "2025-11-01T00:00:00.000Z",
            issuedAt: "2025-11-06T00:00:00.000Z",
            provider: "Gee Innovixus Technologies (OPC) Pvt Ltd",
            certificateId: "GI-2025-MR06",
        },
        {
            id: "GEE/EEE/26001",
            studentName: "Chandhu Anusha",
            domain: "Design Of Electric Vehicles And Matlab Development",
            duration: "90+ Hours (Nov 13 2025 - Feb 10 2026)",
            status: "verified",
            startDate: "2025-11-13T00:00:00.000Z",
            endDate: "2026-02-10T00:00:00.000Z",
            issuedAt: "2026-02-15T00:00:00.000Z",
            provider: "Gee Innovixus Technologies (OPC) Pvt Ltd",
            certificateId: "GEE/EEE/26001",
        },
        {
            id: "GEE-EEE-26001",
            studentName: "Chandhu Anusha",
            domain: "Design Of Electric Vehicles And Matlab Development",
            duration: "90+ Hours (DEC 10 2025 - Feb 10 2026)",
            status: "verified",
            startDate: "2025-12-10T00:00:00.000Z",
            endDate: "2026-02-10T00:00:00.000Z",
            issuedAt: "2026-02-15T00:00:00.000Z",
            provider: "Gee Innovixus Technologies (OPC) Pvt Ltd",
            certificateId: "GEE-EEE-26001",
        },
        {
  "id": "GEE-CSE-26001",
  "studentName": "Gandu Sachin",
  "domain": "Fullstack Web Development",
  "duration": "(Aug 13 2025 - Feb 10 2026)",
  "status": "verified",
  "startDate": "2025-08-13T00:00:00.000Z",
  "endDate": "2026-02-10T00:00:00.000Z",
  "issuedAt": "2026-02-15T00:00:00.000Z",
  "provider": "Gee Innovixus Technologies (OPC) Pvt Ltd",
  "certificateId": "GEE-CSE-26001"
}

    ];

    const cert = certifications.find((c) => c.id === params?.id);

    const formatDate = (d) =>
        d
            ? new Date(d).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            : "N/A";

    const calculateProgress = (start, end, issued) => {
        if (!start || !end || !issued) return 0;
        const totalDuration = new Date(end) - new Date(start);
        const elapsedDuration = new Date(issued) - new Date(start);
        return Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
    };

    const progress = cert ? calculateProgress(cert.startDate, cert.endDate, cert.issuedAt) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
            <Navigation />

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-center">
                <div className="w-full max-w-5xl">
                    <Link href="/certifications">
                        <Button
                            variant="outline"
                            className="mb-8 inline-flex items-center hover:bg-blue-100 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Certifications
                        </Button>
                    </Link>

                    {!cert ? (
                        <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm p-6">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-gray-800">Certificate Not Found</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    We couldn&apos;t find a certification with ID{" "}
                                    <span className="font-semibold text-blue-700">{params?.id}</span>.
                                </p>

                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="shadow-xl border border-blue-100 bg-white/90 backdrop-blur-lg rounded-2xl transition-transform hover:scale-[1.01] duration-200">
                            <CardHeader className="border-b border-gray-100 pb-5">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                                    <div>
                                        <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">
                                            {cert.studentName}
                                        </CardTitle>
                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                            <Badge className="bg-blue-100 text-blue-800 hover:text-blue-800 hover:text-blue-800 font-medium hover px-3 py-1 rounded-full">
                                                {cert.domain}
                                            </Badge>
                                            <Badge className="bg-gray-100 text-gray-700 hover:!bg-gray-100 hover:!text-gray-700 font-medium px-3 py-1 rounded-full">
                                                {cert.duration}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-green-700 font-medium">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Verified</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Certificate ID</p>
                                        <p className="font-mono text-sm font-semibold text-blue-800 bg-blue-50 inline-block px-3 py-1 rounded-md mt-1">
                                            {cert.certificateId}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6 px-6 lg:px-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-2">Internship Provider</h4>
                                        <p className="text-gray-700">{cert.provider}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-2">Start Date</h4>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span>{formatDate(cert.startDate)}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-2">End Date</h4>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span>{formatDate(cert.endDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-10">
                                    <h4 className="font-semibold text-gray-800 mb-3">Internship Timeline</h4>
                                    <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-green-500 transition-all duration-700 ease-out"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-700 mt-2">
                                        <span>Start: {formatDate(cert.startDate)}</span>
                                        <span>End: {formatDate(cert.endDate)}</span>
                                        <span>Issued: {formatDate(cert.issuedAt)}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.2fr] gap-8 items-stretch">
                                    <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
                                        <h4 className="font-semibold text-gray-800 mb-4 text-lg">Certificate Details</h4>
                                        <ul className="list-disc list-inside text-gray-700 space-y-2 pl-2">
                                            <li><span className="font-medium">Student:</span> {cert.studentName}</li>
                                            <li><span className="font-medium">Domain:</span> {cert.domain}</li>
                                            <li><span className="font-medium">Duration:</span> {cert.duration}</li>
                                            <li><span className="font-medium">Start Date:</span> {formatDate(cert.startDate)}</li>
                                            <li><span className="font-medium">End Date:</span> {formatDate(cert.endDate)}</li>
                                            <li><span className="font-medium">Issued On:</span> {formatDate(cert.issuedAt)}</li>
                                            <li><span className="font-medium">Status:</span> Verified ✅</li>
                                        </ul>
                                    </div>

                                    <div className="flex flex-col justify-between">
                                        <div className="p-6 bg-gradient-to-r from-green-50 via-green-100 to-green-50 border border-green-200 rounded-xl flex items-start gap-3 shadow-sm hover:shadow-md transition h-full">
                                            <CheckCircle className="w-6 h-6 text-green-700 mt-1" />
                                            <div>
                                                <p className="font-semibold text-green-800 text-lg">Certificate Verified ✅</p>
                                                <p className="text-sm text-green-700 mt-2">
                                                    This certification has been officially verified by <span className="font-medium text-green-800">Gee Innovixus Technologies</span>.
                                                </p>
                                                <p className="text-sm text-green-700 mt-1">Validate the certificate ID for authenticity.</p>
                                            </div>
                                        </div>
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
