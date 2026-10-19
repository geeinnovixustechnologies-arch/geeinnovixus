"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  Eye,
  Download,
  ExternalLink,
  Calendar,
  Tag,
  ArrowRight,
  Lightbulb,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Head from "next/head";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { GridPattern } from "@/components/ui/grid-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const categories = [
    "AI/ML",
    "Blockchain",
    "Web Development",
    "Mobile Development",
    "IoT",
    "Data Science",
    "Cybersecurity",
    "Cloud Computing",
    "Other",
  ];

  const domains = [
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Computer Vision",
    "NLP",
    "Blockchain",
    "Web3",
    "Frontend",
    "Backend",
    "Full Stack",
    "Mobile",
    "IoT",
    "Data Analytics",
    "Cybersecurity",
    "Cloud",
    "DevOps",
  ];

  const difficulties = ["beginner", "intermediate", "advanced"];

  const sortOptions = [
    { value: "createdAt", label: "Newest First" },
    { value: "title", label: "Title A-Z" },
    { value: "pricing.basePrice", label: "Price Low to High" },
    { value: "views", label: "Most Popular" },
    { value: "rating.average", label: "Highest Rated" },
  ];

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/projects", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Projects could not be loaded.");
        const data = await response.json();
        setProjects(Array.isArray(data.projects) ? data.projects : []);
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") {
          setError("Projects could not be loaded. Please try again later.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.shortDescription
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      project.technologies.some((tech) =>
        tech.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || project.category === selectedCategory;
    const matchesDomain =
      selectedDomain === "all" || project.domain.includes(selectedDomain);
    const matchesDifficulty =
      selectedDifficulty === "all" || project.difficulty === selectedDifficulty;

    return (
      matchesSearch && matchesCategory && matchesDomain && matchesDifficulty
    );
  });

  const formatDomains = (domains) => {
    if (!domains || domains.length === 0) return null;

    return (
      <div className="flex min-w-0 flex-nowrap gap-1 overflow-hidden">
        {domains.slice(0, 2).map((domain) => (
          <Badge key={domain} variant="secondary" className="max-w-[46%] truncate whitespace-nowrap text-xs" title={domain} tabIndex={0} aria-label={domain}>
            {domain}
          </Badge>
        ))}
        {domains.length > 2 && (
          <Badge variant="secondary" className="shrink-0 whitespace-nowrap text-xs" title={domains.slice(2).join(", ")} tabIndex={0} aria-label={`More domains: ${domains.slice(2).join(", ")}`}>
            +{domains.length - 2} more
          </Badge>
        )}
      </div>
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Create custom project inquiry message
  const createCustomProjectMessage = () => {
    const searchQuery = searchTerm ? ` for "${searchTerm}"` : "";
    const categoryQuery =
      selectedCategory !== "all" ? ` in ${selectedCategory}` : "";
    const domainQuery =
      selectedDomain !== "all" ? ` (${selectedDomain} domain)` : "";
    const difficultyQuery =
      selectedDifficulty !== "all" ? ` (${selectedDifficulty} level)` : "";

    return `Hi! I'm looking for a custom project${searchQuery}${categoryQuery}${domainQuery}${difficultyQuery}. Could you please help me with this? I'd like to discuss the requirements and pricing.`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Engineering Projects | GEE INNOVIXUS</title>
        <meta
          name="description"
          content="Browse AI/ML, Blockchain, Web, IoT and more engineering projects with source, docs and guidance from GEE INNOVIXUS."
        />
        <link
          rel="canonical"
          href={(process.env.APP_URL || "http://localhost:3000") + "/projects"}
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
                  name: "Projects",
                  item:
                    (process.env.APP_URL || "http://localhost:3000") +
                    "/projects",
                },
              ],
            }),
          }}
        />
      </Head>
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 py-20 overflow-hidden">
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className="absolute inset-0 stroke-white/10 [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <AnimatedGradientText>
              <span className="inline-flex animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent text-4xl md:text-5xl font-bold mb-4">
                Our Engineering Projects
              </span>
            </AnimatedGradientText>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Explore our comprehensive collection of engineering projects
              across Civil, Mechanical, Electrical, and Computer Science
              domains.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Domain Filter */}
            <div className="lg:w-48">
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger>
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {domains.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Filter */}
            <div className="lg:w-48">
              <Select
                value={selectedDifficulty}
                onValueChange={setSelectedDifficulty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={`${option.value}-desc`}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Project Request Banner */}
      <section className="py-6 bg-gradient-to-r from-green-50 to-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Lightbulb className="h-6 w-6 text-yellow-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Need a Custom Project?
                </h3>
                <p className="text-sm text-gray-600">
                  We can create any project tailored to your specific
                  requirements
                </p>
              </div>
            </div>
            <WhatsAppButton
              subject={createCustomProjectMessage()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Contact Admin
            </WhatsAppButton>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex space-x-2 mb-4">
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p role="alert" className="py-16 text-center text-red-700">
              {error}
            </p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredProjects.length} Projects Found
                </h2>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No projects found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We couldn&apos;t find any projects matching your criteria.
                    Don&apos;t worry - we can create a custom project for you!
                  </p>

                  {/* Custom Project Request Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 max-w-md mx-auto">
                    <div className="flex items-center justify-center mb-4">
                      <Lightbulb className="h-8 w-8 text-yellow-500 mr-2" />
                      <h4 className="text-lg font-semibold text-gray-900">
                        Can&apos;t find what you&apos;re looking for?
                      </h4>
                    </div>
                    <p className="text-gray-600 mb-6">
                      We specialize in creating custom projects tailored to your
                      specific needs. Contact us and we&apos;ll help you build
                      exactly what you need!
                    </p>
                    <WhatsAppButton
                      subject={createCustomProjectMessage()}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      Contact Admin on WhatsApp
                    </WhatsAppButton>
                    <p className="text-xs text-gray-500 mt-3">
                      We&apos;ll discuss your requirements and provide a custom
                      quote
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7 2xl:grid-cols-4">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-fit"
                    >
                      <MagicCard
                        className="h-fit border border-slate-200/80 bg-white p-4 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-lg sm:p-5"
                        gradientColor="rgba(59, 130, 246, 0.1)"
                        borderColor="rgba(59, 130, 246, 0.2)"
                        spotlightColor="rgba(59, 130, 246, 0.1)"
                      >
                        {/* Project Image */}
                        <div className="relative mb-3 h-28 overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 sm:h-32">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-4xl text-gray-300">
                              {project.category === "AI/ML" && "🤖"}
                              {project.category === "Blockchain" && "⛓️"}
                              {project.category === "Web Development" && "🌐"}
                              {project.category === "Mobile Development" &&
                                "📱"}
                              {project.category === "IoT" && "🔗"}
                              {project.category === "Data Science" && "📊"}
                              {project.category === "Cybersecurity" && "🔒"}
                              {project.category === "Cloud Computing" && "☁️"}
                              {![
                                "AI/ML",
                                "Blockchain",
                                "Web Development",
                                "Mobile Development",
                                "IoT",
                                "Data Science",
                                "Cybersecurity",
                                "Cloud Computing",
                              ].includes(project.category) && "💻"}
                            </div>
                          </div>
                          {project.pricing.isOnSale && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Sale
                            </div>
                          )}
                          <div className="absolute top-4 right-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                                project.difficulty
                              )}`}
                            >
                              {project.difficulty}
                            </span>
                          </div>
                        </div>

                        {/* Project Content */}
                        <div className="space-y-2.5">
                          <div className="flex min-w-0 items-center justify-between gap-2">
                            <Badge variant="secondary" className="max-w-[70%] truncate whitespace-nowrap" title={project.category}>
                              {project.category}
                            </Badge>
                            <div className="flex shrink-0 items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm text-gray-600">
                                {project.rating.average} ({project.rating.count}
                                )
                              </span>
                            </div>
                          </div>

                          <h3 className="line-clamp-2 min-h-12 break-words text-base font-semibold leading-6 text-slate-900 sm:text-lg">
                            {project.title}
                          </h3>

                          <p className="line-clamp-2 min-h-10 break-words text-sm leading-5 text-slate-600">
                            {project.shortDescription}
                          </p>

                          {/* Technologies */}
                          <div className="flex h-7 flex-nowrap gap-1.5 overflow-hidden">
                            {project.technologies.slice(0, 2).map((tech) => (
                              <Badge
                                key={tech}
                                variant="outline"
                                className="max-w-[42%] shrink truncate whitespace-nowrap text-xs"
                                title={tech}
                                tabIndex={0}
                                aria-label={tech}
                              >
                                {tech}
                              </Badge>
                            ))}
                            {project.technologies.length > 2 && (
                              <Badge variant="outline" className="shrink-0 whitespace-nowrap text-xs" title={project.technologies.slice(2).join(", ")} tabIndex={0} aria-label={`More technologies: ${project.technologies.slice(2).join(", ")}`}>
                                +{project.technologies.length - 2} more
                              </Badge>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="flex h-6 items-center justify-between gap-2 overflow-hidden text-xs text-gray-500">
                            <div className="flex min-w-0 items-center truncate">
                              <Eye className="h-4 w-4 mr-1" />
                              <span className="truncate">{project.views} views</span>
                            </div>
                            <div className="flex min-w-0 items-center truncate">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span className="truncate" title={project.estimatedTime}>{project.estimatedTime}</span>
                            </div>
                          </div>

                          {/* Domains */}
                          <div className="h-10 overflow-hidden">
                            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                              Domains:
                            </div>
                            {formatDomains(project.domain)}
                          </div>

                          {/* Quick Actions */}
                          <div className="grid grid-cols-[auto,minmax(0,1fr)] items-center gap-2 border-t border-slate-100 pt-2">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <WhatsAppButton
                                project={project}
                                type="purchase"
                                variant="outline"
                                buttonProps={{ size: "sm" }}
                                className="h-9 shrink-0 whitespace-nowrap border-green-600 px-2.5 text-green-700 hover:bg-green-50"
                              >
                                Chat
                              </WhatsAppButton>
                              {Boolean(project.demoUrl || project.downloadUrl) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label={`More actions for ${project.title}`}
                                      className="h-9 w-9 shrink-0 text-slate-500"
                                    >
                                      <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    <DropdownMenuLabel>Project links</DropdownMenuLabel>
                                    {project.demoUrl && (
                                      <DropdownMenuItem asChild>
                                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                                          <ExternalLink aria-hidden="true" /> View demo
                                        </a>
                                      </DropdownMenuItem>
                                    )}
                                    {project.downloadUrl && (
                                      <DropdownMenuItem asChild>
                                        <a href={project.downloadUrl}>
                                          <Download aria-hidden="true" /> Download
                                        </a>
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                            <Link
                              href={`/projects/${project._id}`}
                              className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                            >
                              <span className="truncate">View details</span>
                              <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                            </Link>
                          </div>
                        </div>
                      </MagicCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
