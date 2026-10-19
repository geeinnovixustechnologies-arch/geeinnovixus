"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Award,
  Zap,
  Target,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCounter } from "@/hooks/useCounter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentError, setContentError] = useState(false);

  // Counter hooks for animated statistics
  const projectsCount = useCounter(500, 0, 2000);
  const clientsCount = useCounter(1000, 0, 2000);
  const publicationsCount = useCounter(200, 0, 2000);
  const satisfactionCount = useCounter(98, 0, 2000);

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, testimonialsRes] = await Promise.all([
          fetch("/api/services?limit=4", { cache: "no-store" }),
          fetch("/api/testimonials?limit=3", { cache: "no-store" }),
        ]);
        if (![servicesRes, testimonialsRes].every((res) => res.ok)) {
          throw new Error("Homepage content could not be loaded.");
        }

        const [servicesData, testimonialsData] = await Promise.all([
          servicesRes.json(),
          testimonialsRes.json(),
        ]);

        setServices(servicesData.services || []);
        setTestimonials(testimonialsData.testimonials || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setContentError(true);
        setServices([]);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.35),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,0.24),transparent_45%)]" />
        <div aria-hidden="true" className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.14)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-5xl text-center"
          >
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              Innovating the Future with
              <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                {" "}
                GEE INNOVIXUS
              </span>
            </h1>
            <p className="mx-auto mb-9 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              Leading academic project consultancy and research publication
              services. We transform your ideas into groundbreaking solutions
              with cutting-edge technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/projects"
                className="inline-flex min-h-12 items-center rounded-xl bg-white px-7 py-3.5 font-semibold text-slate-950 shadow-lg shadow-blue-950/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Explore Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 font-semibold text-white backdrop-blur transition duration-200 hover:border-white/40 hover:bg-white/10"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              {
                icon: Target,
                label: "Projects Completed",
                value: projectsCount.count,
                suffix: "+",
                ref: projectsCount.ref,
              },
              {
                icon: Users,
                label: "Students Helped",
                value: clientsCount.count,
                suffix: "+",
                ref: clientsCount.ref,
              },
              {
                icon: Award,
                label: "Publications",
                value: publicationsCount.count,
                suffix: "+",
                ref: publicationsCount.ref,
              },
              {
                icon: Star,
                label: "Satisfaction Rate",
                value: satisfactionCount.count,
                suffix: "%",
                ref: satisfactionCount.ref,
              },
            ].map((stat, index) => (
              <div key={index} ref={stat.ref} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                  {stat.suffix}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive solutions for academic projects, research
              publications, and cutting-edge technology development.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <CardContent className="p-6">
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mb-4"
                    >
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 line-clamp-2 h-14 overflow-hidden text-lg font-semibold leading-7 text-slate-900">
                      {service.name}
                    </h3>
                    <p className="mb-3 line-clamp-3 h-[3.75rem] overflow-hidden text-sm leading-5 text-slate-600">
                      {service.shortDescription || service.description}
                    </p>
                    <ul className="space-y-2">
                      {service.features.slice(0, 3).map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex min-w-0 items-center text-sm text-gray-500"
                        >
                          <CheckCircle className="mr-2 h-4 w-4 shrink-0 text-green-500" />
                          <span className="truncate" title={feature}>{feature}</span>
                        </li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="pt-1 text-xs font-semibold text-blue-700" title={service.features.slice(3).join(", ")} tabIndex={0} aria-label={`More features: ${service.features.slice(3).join(", ")}`}>
                          +{service.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          {!loading && contentError && (
            <p role="alert" className="mt-6 text-center text-red-700">
              Website content could not be loaded. Please try again later.
            </p>
          )}
          {loading && (
            <p role="status" className="mt-6 text-center text-gray-600">
              Loading services…
            </p>
          )}
          {!loading && !contentError && services.length === 0 && (
            <p className="mt-6 text-center text-gray-600">
              No services are currently available.
            </p>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don&apos;t just take our word for it. Here&apos;s what students
              and researchers say about our services.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(Math.min(5, testimonial.rating || 0))].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="mb-4 line-clamp-5 min-h-[7.5rem] text-sm leading-6 text-slate-700 italic">
                  &quot;{testimonial.review}&quot;
                </p>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">
                    {testimonial.clientName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.clientTitle}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.clientCompany}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {testimonial.projectTitle}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {!loading && !contentError && testimonials.length === 0 && (
            <p className="mt-6 text-center text-gray-600">
              No testimonials are currently available.
            </p>
          )}
          {loading && (
            <p role="status" className="mt-6 text-center text-gray-600">
              Loading testimonials…
            </p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of students and researchers who have successfully
              completed their projects with GEE INNOVIXUS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Get Free Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                View Portfolio
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
