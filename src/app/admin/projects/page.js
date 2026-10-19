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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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

export default function AdminProjectsPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

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

  const statuses = ["active", "inactive", "featured"];

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchProjects();
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

  const fetchProjects = async () => {
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

      const response = await fetch(`/api/projects?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects || []);
        setTotalPages(Math.ceil((data.totalProjects || 0) / 10));
      } else {
        toast.error("Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Error fetching projects");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Project deleted successfully");
        fetchProjects();
        setShowDeleteModal(false);
        setProjectToDelete(null);
      } else {
        toast.error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Error deleting project");
    }
  };

  const handleToggleStatus = async (projectId, currentStatus) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
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
          `Project ${!currentStatus ? "activated" : "deactivated"} successfully`
        );
        fetchProjects();
      } else {
        toast.error("Failed to update project status");
      }
    } catch (error) {
      console.error("Error updating project status:", error);
      toast.error("Error updating project status");
    }
  };

  const handleToggleFeatured = async (projectId, currentFeatured) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isFeatured: !currentFeatured,
        }),
      });

      if (response.ok) {
        toast.success(
          `Project ${!currentFeatured ? "featured" : "unfeatured"} successfully`
        );
        fetchProjects();
      } else {
        toast.error("Failed to update project featured status");
      }
    } catch (error) {
      console.error("Error updating project featured status:", error);
      toast.error("Error updating project featured status");
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
                Projects Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all projects in the system
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/projects" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
                Preview public projects
              </Link>
              <Link href="/admin/projects/new">
                <Button>
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Project
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
                    placeholder="Search projects..."
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
                    <SelectItem value="featured">Featured</SelectItem>
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
                    <SelectItem value="title-asc">Title A-Z</SelectItem>
                    <SelectItem value="title-desc">Title Z-A</SelectItem>
                    <SelectItem value="pricing.basePrice-asc">
                      Price Low to High
                    </SelectItem>
                    <SelectItem value="pricing.basePrice-desc">
                      Price High to Low
                    </SelectItem>
                    <SelectItem value="views-desc">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
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
                      <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-12"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="animate-pulse h-8 bg-gray-200 rounded w-8"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan="7"
                    className="text-center py-12 text-gray-500"
                  >
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {project.images && project.images.length > 0 ? (
                            <Image
                              className="h-12 w-12 rounded-lg object-cover"
                              src={project.images[0].url}
                              alt={project.title}
                              width={48}
                              height={48}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Tag className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {project.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {project.shortDescription}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{project.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        {project.pricing.isOnSale ? (
                          <div>
                            <div className="text-sm font-medium text-green-600">
                              ${project.pricing.discountedPrice}
                            </div>
                            <div className="text-xs text-gray-500 line-through">
                              ${project.pricing.basePrice}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm font-medium">
                            ${project.pricing.basePrice}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <Badge
                          variant={project.isActive ? "default" : "destructive"}
                        >
                          {project.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {project.isFeatured && (
                          <Badge
                            variant="outline"
                            className="text-yellow-600 border-yellow-600"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 text-gray-400 mr-1" />
                        {project.views || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/projects/${project._id}`}
                            title="Preview as a visitor"
                            aria-label={`Preview ${project.title} as a visitor`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/admin/projects/${project._id}/edit`}
                            title="Edit Project"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleStatus(project._id, project.isActive)
                          }
                          className={
                            project.isActive
                              ? "text-red-600 hover:text-red-900"
                              : "text-green-600 hover:text-green-900"
                          }
                          title={project.isActive ? "Deactivate" : "Activate"}
                        >
                          {project.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleFeatured(
                              project._id,
                              project.isFeatured
                            )
                          }
                          className={
                            project.isFeatured
                              ? "text-yellow-600 hover:text-yellow-900"
                              : "text-gray-600 hover:text-gray-900"
                          }
                          title={
                            project.isFeatured
                              ? "Remove from Featured"
                              : "Add to Featured"
                          }
                        >
                          <Star
                            className={`h-4 w-4 ${
                              project.isFeatured ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setProjectToDelete(project);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Project"
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
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{projectToDelete?.title}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setProjectToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteProject(projectToDelete._id)}
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
