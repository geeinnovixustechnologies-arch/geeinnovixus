"use client";

import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  ArrowUp,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: "AI & Machine Learning", href: "/services/ai-ml" },
      { name: "Blockchain Development", href: "/services/blockchain" },
      { name: "Web Development", href: "/services/web-development" },
      { name: "Research Publication", href: "/services/research" },
      { name: "Assignment Writing", href: "/services/assignment" },
      { name: "Consulting", href: "/services/consulting" },
    ],
    projects: [
      { name: "AI Projects", href: "/projects?category=AI/ML" },
      { name: "Blockchain Projects", href: "/projects?category=Blockchain" },
      { name: "Web Development", href: "/projects?category=Web Development" },
      { name: "Mobile Apps", href: "/projects?category=Mobile Development" },
      { name: "IoT Projects", href: "/projects?category=IoT" },
      { name: "Data Science", href: "/projects?category=Data Science" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Team", href: "/team" },
      { name: "Success Stories", href: "/success-stories" },
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "FAQ", href: "/faq" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Refund Policy", href: "/refund" },
      { name: "Support", href: "/support" },
    ],
  };

  const socialLinks = [
    { name: "Facebook", href: "#", icon: Facebook },
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "LinkedIn", href: "#", icon: Linkedin },
    { name: "Instagram", href: "#", icon: Instagram },
    { name: "GitHub", href: "#", icon: Github },
  ];

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 z-50"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                GEE INNOVIXUS
              </h2>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md text-sm sm:text-base">
              Leading academic project consultancy and research publication
              services. We transform ideas into groundbreaking solutions with
              cutting-edge technology.
            </p>

            <div className="space-y-3 text-sm sm:text-base">
              <div className="flex items-center text-gray-300">
                <Mail className="h-5 w-5 mr-3 text-blue-400" />
                <a
                  href="mailto:info@geeinnovixus.com"
                  className="hover:text-blue-400 transition-colors"
                >
                  info@geeinnovixus.com
                </a>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="h-5 w-5 mr-3 text-blue-400" />
                <span>Available on WhatsApp</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-5 w-5 mr-3 text-blue-400" />
                <span className="text-sm sm:text-base">
                  18-78/A, Flat No 304, Kamala Nivas, Saroornagar,
                  Dilsukhnagar, Hyderabad – 500060
                </span>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="bg-gray-800 p-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm sm:text-base">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Projects</h3>
            <ul className="space-y-2 text-sm sm:text-base">
              {footerLinks.projects.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 mb-6 text-sm sm:text-base">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm sm:text-base">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Subscribe to our newsletter for updates and insights.
            </p>
            <div className="flex flex-col sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="mt-3 sm:mt-0 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-l-none sm:rounded-r-lg hover:from-blue-700 hover:to-purple-700 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div>© {currentYear} GEE INNOVIXUS. All rights reserved.</div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-blue-400">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-blue-400">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-blue-400">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
