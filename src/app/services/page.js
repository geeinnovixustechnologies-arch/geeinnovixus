"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  Search,
  Filter,
  Star,
  Clock,
  Tag,
  Briefcase,
  BookOpen,
  PenTool,
  Users,
  GraduationCap,
  Headphones,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Head from "next/head";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { GridPattern } from "@/components/ui/grid-pattern";
import { MagicCard } from "@/components/ui/magic-card";

const serviceIcons = {
  briefcase: Briefcase,
  book: BookOpen,
  "pen-tool": PenTool,
  users: Users,
  "graduation-cap": GraduationCap,
  headphones: Headphones,
};

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/services?limit=100", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Services could not be loaded.");
        const data = await response.json();
        setServices(Array.isArray(data.services) ? data.services : []);
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") {
          setError("Services could not be loaded. Please try again later.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const filteredServices = useMemo(() => {
    const query = searchTerm.toLowerCase();
    const filtered = services.filter((service) => {
      const matchesSearch =
        !query ||
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query);
      return matchesSearch && (selectedCategory === "all" || service.category === selectedCategory);
    });
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return (b.orderCount || 0) - (a.orderCount || 0);
        case "rating":
          return (b.rating?.average || 0) - (a.rating?.average || 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "delivery":
          return a.deliveryTime.localeCompare(b.deliveryTime);
        default:
          return 0;
      }
    });
  }, [services, searchTerm, selectedCategory, sortBy]);

  const categories = [
    "all",
    ...new Set(services.map((service) => service.category)),
  ];

  const formatDomains = (domains) => {
    if (!domains || domains.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {domains.slice(0, 3).map((domain) => (
          <Badge key={domain} variant="secondary" className="text-xs">
            {domain}
          </Badge>
        ))}
        {domains.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{domains.length - 3} more
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
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Engineering Services | GEE INNOVIXUS</title>
        <meta
          name="description"
          content="Civil, Mechanical, Electrical, Computer Science, R&D, and Training services from GEE INNOVIXUS. Expert guidance, projects, and publication support."
        />
        <link
          rel="canonical"
          href={(process.env.APP_URL || "http://localhost:3000") + "/services"}
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
                  name: "Services",
                  item:
                    (process.env.APP_URL || "http://localhost:3000") +
                    "/services",
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
              Our Services
            </span>
          </AnimatedGradientText>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90">
            Publication, patents, plagiarism checks, manuscript prep, PhD
            assistance, and rapid prototyping
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
                  placeholder="Search services..."
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

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:max-w-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="delivery">Delivery Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredServices.map((service) => {
              const Icon =
                serviceIcons[service.icon?.trim().toLowerCase()] || Briefcase;
              return (
                <MagicCard
                  key={service._id}
                  className="h-full p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50"
                  gradientColor="rgba(59, 130, 246, 0.1)"
                  borderColor="rgba(59, 130, 246, 0.2)"
                  spotlightColor="rgba(59, 130, 246, 0.1)"
                >
                  <div className="flex items-center justify-between w-full mb-4">
                    <div className="flex items-center space-x-3">
                      <Icon
                        aria-hidden="true"
                        className="h-8 w-8 shrink-0 text-blue-600"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {service.name}
                        </h3>
                        <Badge variant="secondary" className="mt-1">
                          {service.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {service.rating?.average ?? 0}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 text-sm">
                    {service.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600 font-medium">
                        Domains:
                      </span>
                    </div>
                    {formatDomains(service.tags || service.features)}

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        Delivery: {service.deliveryTime}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-sm text-gray-900">
                      Key Features:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {(service.features || [])
                        .slice(0, 4)
                        .map((feature, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      {(service.features || []).length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{service.features.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <WhatsAppButton
                    subject={`Service Inquiry: ${service.name}`}
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
          {!error && filteredServices.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No services found matching your criteria.
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
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Contact us to discuss your service requirements and get a custom
            quote.
          </p>
          <div className="flex justify-center">
            <WhatsAppButton
              subject="Service Consultation"
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
