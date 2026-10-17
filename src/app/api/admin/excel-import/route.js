import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import connectDB from "@/lib/mongodb.js";
import * as XLSX from "xlsx";
import Project from "@/models/Project.js";
import Service from "@/models/Service.js";
import { projectValidation, serviceValidation } from "@/lib/validations.js";

// POST /api/admin/excel-import - Import data from Excel file
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file");
    const importType = formData.get("type");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    if (
      !importType ||
      !["projects", "services"].includes(importType)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid import type" },
        { status: 400 }
      );
    }

    // Read Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return NextResponse.json(
        { success: false, message: "No data found in the file" },
        { status: 400 }
      );
    }

    let results = {
      successful: [],
      failed: [],
      totalProcessed: 0,
    };

    // Process data based on import type
    switch (importType) {
      case "projects":
        results = await importProjects(data);
        break;
      case "services":
        results = await importServices(data);
        break;
      default:
        return NextResponse.json(
          { success: false, message: "Invalid import type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Import completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      data: results,
    });
  } catch (error) {
    console.error("Error importing Excel file:", error);
    return NextResponse.json(
      { success: false, message: "Failed to import file" },
      { status: 500 }
    );
  }
}

// Import projects from Excel data
async function importProjects(data) {
  const results = {
    successful: [],
    failed: [],
    totalProcessed: 0,
  };

  for (const item of data) {
    try {
      // Transform Excel data to match our schema
      const projectData = {
        title: item.title || item.Title,
        description: item.description || item.Description,
        shortDescription:
          item.shortDescription ||
          item["Short Description"] ||
          item.description?.substring(0, 300),
        category: item.category || item.Category,
        domain: item.domain
          ? Array.isArray(item.domain)
            ? item.domain
            : [item.domain]
          : [],
        technologies: item.technologies
          ? Array.isArray(item.technologies)
            ? item.technologies
            : item.technologies.split(",").map((t) => t.trim())
          : [],
        pricing: {
          basePrice: parseFloat(
            item.basePrice ||
              item["Base Price"] ||
              item.price ||
              item.Price ||
              0
          ),
          currency: item.currency || item.Currency || "USD",
          discountedPrice: item.discountedPrice
            ? parseFloat(item.discountedPrice)
            : undefined,
          isOnSale: item.isOnSale === "true" || item.isOnSale === true,
        },
        features: item.features
          ? Array.isArray(item.features)
            ? item.features
            : item.features.split(",").map((f) => f.trim())
          : [],
        difficulty: item.difficulty || item.Difficulty || "intermediate",
        estimatedTime:
          item.estimatedTime || item["Estimated Time"] || "Not specified",
        requirements: item.requirements
          ? Array.isArray(item.requirements)
            ? item.requirements
            : item.requirements.split(",").map((r) => r.trim())
          : [],
        deliverables: item.deliverables
          ? Array.isArray(item.deliverables)
            ? item.deliverables
            : item.deliverables.split(",").map((d) => d.trim())
          : [],
        demoUrl: item.demoUrl || item["Demo URL"],
        downloadUrl: item.downloadUrl || item["Download URL"],
        tags: item.tags
          ? Array.isArray(item.tags)
            ? item.tags
            : item.tags.split(",").map((t) => t.trim().toLowerCase())
          : [],
        isActive: item.isActive !== "false" && item.isActive !== false,
        isFeatured: item.isFeatured === "true" || item.isFeatured === true,
      };

      // Validate data
      const validation = projectValidation.create.validate(projectData);
      if (!validation.isValid) {
        results.failed.push({
          data: item,
          error: `Validation failed: ${validation.errors
            .map((e) => e.message)
            .join(", ")}`,
        });
        results.totalProcessed++;
        continue;
      }

      // Check for duplicates
      const existingProject = await Project.findOne({
        title: projectData.title,
      });
      if (existingProject) {
        results.failed.push({
          data: item,
          error: "Project with this title already exists",
        });
        results.totalProcessed++;
        continue;
      }

      // Create project
      const project = new Project(validation.data);
      await project.save();

      results.successful.push(project);
      results.totalProcessed++;
    } catch (error) {
      results.failed.push({
        data: item,
        error: error.message,
      });
      results.totalProcessed++;
    }
  }

  return results;
}

// Import services from Excel data
async function importServices(data) {
  const results = {
    successful: [],
    failed: [],
    totalProcessed: 0,
  };

  for (const item of data) {
    try {
      // Transform Excel data to match our schema
      const serviceData = {
        name: item.name || item.Name,
        description: item.description || item.Description,
        shortDescription:
          item.shortDescription ||
          item["Short Description"] ||
          item.description?.substring(0, 300),
        category: item.category || item.Category,
        subcategory: item.subcategory || item.Subcategory,
        pricing: {
          startingPrice: parseFloat(
            item.startingPrice ||
              item["Starting Price"] ||
              item.price ||
              item.Price ||
              0
          ),
          currency: item.currency || item.Currency || "USD",
          pricingModel: item.pricingModel || item["Pricing Model"] || "fixed",
          customPricing:
            item.customPricing === "true" || item.customPricing === true,
        },
        features: item.features
          ? Array.isArray(item.features)
            ? item.features
            : item.features.split(",").map((f) => f.trim())
          : [],
        deliveryTime:
          item.deliveryTime || item["Delivery Time"] || "Not specified",
        requirements: item.requirements
          ? Array.isArray(item.requirements)
            ? item.requirements
            : item.requirements.split(",").map((r) => r.trim())
          : [],
        deliverables: item.deliverables
          ? Array.isArray(item.deliverables)
            ? item.deliverables
            : item.deliverables.split(",").map((d) => d.trim())
          : [],
        tags: item.tags
          ? Array.isArray(item.tags)
            ? item.tags
            : item.tags.split(",").map((t) => t.trim().toLowerCase())
          : [],
        isActive: item.isActive !== "false" && item.isActive !== false,
        isPopular: item.isPopular === "true" || item.isPopular === true,
      };

      // Validate data
      const validation = serviceValidation.create.validate(serviceData);
      if (!validation.isValid) {
        results.failed.push({
          data: item,
          error: `Validation failed: ${validation.errors
            .map((e) => e.message)
            .join(", ")}`,
        });
        results.totalProcessed++;
        continue;
      }

      // Check for duplicates
      const existingService = await Service.findOne({ name: serviceData.name });
      if (existingService) {
        results.failed.push({
          data: item,
          error: "Service with this name already exists",
        });
        results.totalProcessed++;
        continue;
      }

      // Create service
      const service = new Service(validation.data);
      await service.save();

      results.successful.push(service);
      results.totalProcessed++;
    } catch (error) {
      results.failed.push({
        data: item,
        error: error.message,
      });
      results.totalProcessed++;
    }
  }

  return results;
}

