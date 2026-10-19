"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  Calendar,
  DollarSign,
  Tag,
  MoreVertical,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function AdminServicesPage() {
  const { data: session, status } = useSession();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const categories = [
    "Academic Projects",
    "Research Publication",
    "Assignment Writing",
    "Consulting",
    "Training",
    "Support",
  ];

  const statuses = ["active", "inactive", "popular"];

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchServices();
    }
  }, [
    session,
    status,
    searchTerm,
    selectedCategory,
    selectedStatus,
    sortBy,
    sortOrder,
    currentPage,
  ]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
        ...(selectedCategory &&
          selectedCategory !== "all" && { category: selectedCategory }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/services?${params}`);
      const data = await response.json();

      if (response.ok) {
        setServices(data.services || []);
        setTotalPages(Math.ceil((data.totalServices || 0) / 10));
      } else {
        toast.error("Failed to fetch services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Error fetching services");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Service deleted successfully");
        fetchServices();
        setShowDeleteModal(false);
        setServiceToDelete(null);
      } else {
        toast.error("Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Error deleting service");
    }
  };

  const handleToggleStatus = async (serviceId, currentStatus) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        toast.success(
          `Service ${!currentStatus ? "activated" : "deactivated"} successfully`
        );
        fetchServices();
      } else {
        toast.error("Failed to update service status");
      }
    } catch (error) {
      console.error("Error updating service status:", error);
      toast.error("Error updating service status");
    }
  };

  const handleTogglePopular = async (serviceId, currentPopular) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPopular: !currentPopular,
        }),
      });

      if (response.ok) {
        toast.success(
          `Service ${
            !currentPopular ? "marked as popular" : "removed from popular"
          } successfully`
        );
        fetchServices();
      } else {
        toast.error("Failed to update service popular status");
      }
    } catch (error) {
      console.error("Error updating service popular status:", error);
      toast.error("Error updating service popular status");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-8">
            You need admin privileges to access this page.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Services Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all services in the system
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/services" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
                Preview public services
              </Link>
              <Link href="/admin/services/new">
                <Button>
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Service
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
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
                    <SelectItem value="createdAt-desc">Newest First</SelectItem>
                    <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="pricing.startingPrice-asc">
                      Price Low to High
                    </SelectItem>
                    <SelectItem value="pricing.startingPrice-desc">
                      Price High to Low
                    </SelectItem>
                    <SelectItem value="orderCount-desc">
                      Most Popular
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-12"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="animate-pulse h-8 bg-gray-200 rounded w-8"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : services.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan="7"
                    className="text-center py-12 text-gray-500"
                  >
                    No services found
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service._id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div
                            className={`h-12 w-12 rounded-lg bg-gradient-to-r ${
                              service.color === "blue"
                                ? "from-blue-500 to-blue-600"
                                : service.color === "green"
                                ? "from-green-500 to-green-600"
                                : service.color === "purple"
                                ? "from-purple-500 to-purple-600"
                                : service.color === "orange"
                                ? "from-orange-500 to-orange-600"
                                : "from-gray-500 to-gray-600"
                            } flex items-center justify-center`}
                          >
                            <Tag className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {service.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {service.shortDescription}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{service.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium">
                          {service.pricing.customPricing ? (
                            <span className="text-gray-500">Custom</span>
                          ) : (
                            `$${service.pricing.startingPrice}`
                          )}
                        </span>
                      </div>
                      {service.pricing.pricingModel !== "fixed" && (
                        <div className="text-xs text-gray-500">
                          /{service.pricing.pricingModel}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        {service.orderCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <Badge
                          variant={service.isActive ? "default" : "destructive"}
                        >
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {service.isPopular && (
                          <Badge
                            variant="outline"
                            className="text-yellow-600 border-yellow-600"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {new Date(service.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href="/services"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Preview public services"
                            aria-label={`Preview public services for ${service.name}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/admin/services/${service._id}/edit`}
                            title="Edit Service"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleStatus(service._id, service.isActive)
                          }
                          className={
                            service.isActive
                              ? "text-red-600 hover:text-red-900"
                              : "text-green-600 hover:text-green-900"
                          }
                          title={service.isActive ? "Deactivate" : "Activate"}
                        >
                          {service.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleTogglePopular(service._id, service.isPopular)
                          }
                          className={
                            service.isPopular
                              ? "text-yellow-600 hover:text-yellow-900"
                              : "text-gray-600 hover:text-gray-900"
                          }
                          title={
                            service.isPopular
                              ? "Remove from Popular"
                              : "Add to Popular"
                          }
                        >
                          <Star
                            className={`h-4 w-4 ${
                              service.isPopular ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setServiceToDelete(service);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Service"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={page === currentPage}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{serviceToDelete?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setServiceToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteService(serviceToDelete._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
