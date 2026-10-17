"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Award,
  BookOpen,
  FileText,
  Users,
  Clock,
  Star,
  ExternalLink,
  Lightbulb,
  Microscope,
  Beaker,
  Code,
  Brain,
  Leaf,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { GridPattern } from "@/components/ui/grid-pattern";
import { MagicCard } from "@/components/ui/magic-card";

const researchIcons = {
  award: Award,
  beaker: Beaker,
  "book-open": BookOpen,
  brain: Brain,
  code: Code,
  filetext: FileText,
  "file-text": FileText,
  leaf: Leaf,
  lightbulb: Lightbulb,
  microscope: Microscope,
};

export default function ResearchPage() {
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDomain, setSelectedDomain] = useState("all");

  useEffect(() => {
    const controller = new AbortController();
    const loadResearch = async () => {
      try {
        const response = await fetch("/api/research", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Research could not be loaded.");
        const data = await response.json();
        setResearch(Array.isArray(data.research) ? data.research : []);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError("Research could not be loaded. Please try again later.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadResearch();
    return () => controller.abort();
  }, []);

  const filteredResearch = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return research.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.services || []).some((service) =>
          service.toLowerCase().includes(query)
        );
      return (
        matchesSearch &&
        (selectedCategory === "all" || item.category === selectedCategory) &&
        (selectedDomain === "all" || item.domain === selectedDomain)
      );
    });
  }, [research, searchTerm, selectedCategory, selectedDomain]);

  const categories = ["all", ...new Set(research.map((item) => item.category))];

  const domains = ["all", ...new Set(research.map((item) => item.domain))];

  const formatServices = (services) => {
    if (!services || services.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {services.slice(0, 3).map((service) => (
          <Badge key={service} variant="secondary" className="max-w-full whitespace-normal break-words text-xs">
            {service}
          </Badge>
        ))}
        {services.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{services.length - 3} more
          </Badge>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading research services...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Research & Development | GEE INNOVIXUS</title>
        <meta
          name="description"
          content="Publication support, patents, plagiarism check, manuscript prep, PhD assistance, and prototyping services by GEE INNOVIXUS."
        />
        <link
          rel="canonical"
          href={(process.env.APP_URL || "http://localhost:3000") + "/research"}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: process.env.APP_URL || "http://localhost:3000",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Research & Development",
                  item:
                    (process.env.APP_URL || "http://localhost:3000") +
                    "/research",
                },
              ],
            }),
          }}
        />
      </Head>
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 overflow-hidden">
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className="absolute inset-0 stroke-white/10 [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedGradientText>
            <span className="inline-flex animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent text-4xl md:text-6xl font-bold mb-6">
              Research & Development
            </span>
          </AnimatedGradientText>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90">
            Professional research support services including publications,
            patents, and academic assistance
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <ShimmerButton className="text-lg px-8 py-1 text-white">
              Get Started
            </ShimmerButton>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 border-white text-blue-500 hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              View Portfolio
            </Button>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 sm:py-8 bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="w-full">
              <div className="relative max-w-md mx-auto sm:mx-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search research services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:max-w-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="w-full sm:max-w-xs">
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain === "all" ? "All Domains" : domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Research Services Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
            {filteredResearch.map((item) => {
              const Icon =
                researchIcons[item.icon?.trim().toLowerCase()] || Lightbulb;
              return (
                <MagicCard
                    key={item._id}
                    className="h-fit border border-gray-200/50 bg-white/80 p-6 backdrop-blur-sm"
                    gradientColor="rgba(59, 130, 246, 0.1)"
                    borderColor="rgba(59, 130, 246, 0.2)"
                    spotlightColor="rgba(59, 130, 246, 0.1)"
                  >
                <div className="mb-4 flex w-full items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start space-x-3">
                    <Icon aria-hidden="true" className="h-8 w-8 text-blue-600" />
                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <Badge variant="secondary" className="mt-1 max-w-full whitespace-normal break-words">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {item.rating}
                    </span>
                  </div>
                </div>

                <p className="mb-4 break-words text-sm text-gray-600">{item.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      Delivery: {item.deliveryTime}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-sm text-gray-900">
                    Services:
                  </h4>
                  {formatServices(item.services)}
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-sm text-gray-900">
                    Features:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {(item.features || []).slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="max-w-full whitespace-normal break-words text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {(item.features || []).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <WhatsAppButton
                  subject={`Research Service Inquiry: ${item.title}`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Chat on WhatsApp
                </WhatsAppButton>
                </MagicCard>
              );
            })}
          </div>

          {error && (
            <p role="alert" className="py-16 text-center text-red-700">
              {error}
            </p>
          )}

          {!error && filteredResearch.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No research services found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 overflow-hidden">
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className="absolute inset-0 stroke-white/10 [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Research?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Contact us today to discuss your research requirements and get
            professional support.
          </p>
          <div className="flex justify-center">
            <WhatsAppButton
              subject="Research Consultation"
              className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3"
            >
              Contact on WhatsApp
            </WhatsAppButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
