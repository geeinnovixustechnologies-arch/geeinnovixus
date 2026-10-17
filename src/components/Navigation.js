"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Home,
  Briefcase,
  FileText,
  MessageSquare,
  Shield,
  Search,
  BookOpen,
  Images,
} from "lucide-react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "R & D", href: "/research", icon: Search },
    { name: "Projects", href: "/projects", icon: Briefcase },
    { name: "Services", href: "/services", icon: FileText },
    { name: "Learning Hub", href: "/learning-hub", icon: BookOpen },
    { name: "Gallery", href: "/gallery", icon: Images },
    { name: "Contact", href: "/contact", icon: MessageSquare },
  ];

  const adminNavigation = [
    { name: "Dashboard", href: "/admin", icon: Shield },
    { name: "R & D", href: "/admin/research", icon: Search },
    { name: "Projects", href: "/admin/projects", icon: Briefcase },
    { name: "Services", href: "/admin/services", icon: FileText },
    { name: "Learning Hub", href: "/admin/learning-hub", icon: BookOpen },
    { name: "Gallery", href: "/admin/gallery", icon: Images },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                GEE INNOVIXUS
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {status === "loading" ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              ) : session ? (
                <div className="relative group">
                  <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    {session.user.image ? (
                      <Image
                        className="h-8 w-8 rounded-full"
                        src={session.user.image}
                        alt={session.user.name}
                        width={32}
                        height={32}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {session.user.role === "admin" && (
                      <>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Admin Panel
                        </div>
                        {adminNavigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <item.icon className="h-4 w-4 mr-3" />
                            {item.name}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100 my-1"></div>
                      </>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Link>
                    <button
                      onClick={() => signOut()}
                      disabled
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth/signin"
                    aria-label="Click to sign in as admin"
                    title="Click to sign in as admin"
                    className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-700 transition-colors hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <Shield aria-hidden="true" className="h-5 w-5" />
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-max rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      Click to sign in as admin
                    </span>
                  </Link>
                  <Link
                    href="/"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}

              {/* Mobile Auth */}
              <div className="border-t border-gray-200 pt-4">
                {status === "loading" ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>
                ) : session ? (
                  <div className="space-y-2">
                    <div className="flex items-center px-3 py-2">
                      {session.user.image ? (
                        <Image
                          className="h-8 w-8 rounded-full mr-3"
                          src={session.user.image}
                          alt={session.user.name}
                          width={32}
                          height={32}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    {session.user.role === "admin" && (
                      <div className="pl-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Admin Panel
                        </div>
                        {adminNavigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm"
                            onClick={() => setIsOpen(false)}
                          >
                            <item.icon className="h-4 w-4 mr-3" />
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    <Link
                      href="/profile"
                      className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/signin"
                      aria-label="Click to sign in as admin"
                      title="Click to sign in as admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center w-full rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                      <Shield aria-hidden="true" className="mr-3 h-5 w-5" />
                      Admin sign in
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
