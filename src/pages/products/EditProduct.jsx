
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Package,
  Image as ImageIcon,
  X,
  FolderTree,
  Loader2,
  Trash2,
} from "lucide-react";

import productApi from "../../api/product.api";
import categoryApi from "../../api/category.api";
import MediaManager from "../../components/media/MediaManager";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // PAGE STATE
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // CATEGORY STATE
  // =====================================================

  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // =====================================================
  // MEDIA STATE
  // =====================================================

  const [mediaOpen, setMediaOpen] = useState(false);

  // =====================================================
  // FORM
  // =====================================================

  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    shortDescription: "",
    category: "",
    brand: "",
    price: "",
    salePrice: "",
    costPrice: "",
    stock: "",
    lowStockThreshold: 5,
    unit: "piece",
    status: "active",
    visibility: "public",
    featured: false,
    images: [],
  });

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }

    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadCategories(),
        loadProduct(),
      ]);
    } catch (err) {
      console.error("INITIAL LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH CATEGORIES
  // Same structure as CreateProduct
  // =====================================================

  const loadCategories = async () => {
    try {
      setCategoryLoading(true);

      const response = await categoryApi.getCategories({
        limit: 200,
        sort: "sortOrder",
        order: "asc",
        status: "active",
      });

      console.log("CATEGORY RESPONSE:", response);

      const responseData =
        response?.data?.data ??
        response?.data ??
        response;

      let list = [];

      if (Array.isArray(responseData)) {
        list = responseData;
      } else if (Array.isArray(responseData?.categories)) {
        list = responseData.categories;
      } else if (Array.isArray(responseData?.items)) {
        list = responseData.items;
      } else if (Array.isArray(responseData?.results)) {
        list = responseData.results;
      } else if (Array.isArray(responseData?.data)) {
        list = responseData.data;
      }

      setCategories(list);
    } catch (err) {
      console.error("FETCH CATEGORIES ERROR:", err);

      setCategories([]);

      /*
       * Do not overwrite product error if product itself
       * failed. Category error is still useful.
       */
      if (!error) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load categories."
        );
      }
    } finally {
      setCategoryLoading(false);
    }
  };

  // =====================================================
  // CATEGORY HELPERS
  // =====================================================

  const getCategoryId = (category) => {
    return (
      category?._id ||
      category?.id ||
      category?.value ||
      category?.categoryId ||
      ""
    );
  };

  const getCategoryName = (category) => {
    return (
      category?.name ||
      category?.title ||
      category?.label ||
      category?.categoryName ||
      "Unnamed Category"
    );
  };

  const getCategoryParentId = (category) => {
    const parent =
      category?.parent ??
      category?.parentId ??
      category?.parentCategory ??
      null;

    if (!parent) {
      return "";
    }

    if (typeof parent === "object") {
      return (
        parent?._id ||
        parent?.id ||
        parent?.value ||
        ""
      );
    }

    return parent;
  };

  // =====================================================
  // CATEGORY OPTIONS
  // =====================================================

  const categoryOptions = useMemo(() => {
    if (
      !Array.isArray(categories) ||
      !categories.length
    ) {
      return [];
    }

    const byParent = new Map();

    categories.forEach((category) => {
      const parentId =
        getCategoryParentId(category) ||
        "__root__";

      if (!byParent.has(parentId)) {
        byParent.set(parentId, []);
      }

      byParent.get(parentId).push(category);
    });

    // Sort categories
    byParent.forEach((items) => {
      items.sort((a, b) => {
        const orderA = Number(
          a?.sortOrder ??
            a?.order ??
            a?.position ??
            0
        );

        const orderB = Number(
          b?.sortOrder ??
            b?.order ??
            b?.position ??
            0
        );

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return getCategoryName(a).localeCompare(
          getCategoryName(b)
        );
      });
    });

    const result = [];
    const visited = new Set();

    const walk = (parentId, level = 0) => {
      const children =
        byParent.get(parentId) || [];

      children.forEach((category) => {
        const categoryId =
          getCategoryId(category);

        if (
          !categoryId ||
          visited.has(String(categoryId))
        ) {
          return;
        }

        visited.add(String(categoryId));

        result.push({
          ...category,
          __level: level,
        });

        walk(categoryId, level + 1);
      });
    };

    // Root categories
    walk("__root__", 0);

    // Add orphan categories
    categories.forEach((category) => {
      const categoryId =
        getCategoryId(category);

      if (
        categoryId &&
        !visited.has(String(categoryId))
      ) {
        result.push({
          ...category,
          __level: 0,
        });
      }
    });

    // Fallback
    if (!result.length) {
      return categories.map((category) => ({
        ...category,
        __level: 0,
      }));
    }

    return result;
  }, [categories]);

  // =====================================================
  // SELECTED CATEGORY
  // =====================================================

  const selectedCategory = useMemo(() => {
    return categories.find(
      (category) =>
        String(getCategoryId(category)) ===
        String(form.category)
    );
  }, [categories, form.category]);

  // =====================================================
  // LOAD PRODUCT
  // =====================================================

  const loadProduct = async () => {
    try {
      setError("");

      const response =
        await productApi.getProduct(id);

      console.log(
        "GET PRODUCT RESPONSE:",
        response
      );

      const product =
        response?.data?.data ||
        response?.data?.product ||
        response?.data;

      if (!product?._id) {
        throw new Error("Product not found.");
      }

      // =================================================
      // CATEGORY
      // =================================================

      let categoryValue = "";

      if (
        product.category &&
        typeof product.category === "object"
      ) {
        categoryValue =
          product.category?._id ||
          product.category?.id ||
          product.category?.value ||
          "";
      } else {
        categoryValue =
          product.category || "";
      }

      // =================================================
      // IMAGES
      //
      // Existing images are converted to the same
      // structure used by MediaManager selections.
      // =================================================

      const normalizedImages =
        Array.isArray(product.images)
          ? product.images
              .map((image) => {
                const url =
                  getMediaUrl(image);

                if (!url) {
                  return null;
                }

                if (typeof image === "string") {
                  return {
                    url,
                    existing: true,
                  };
                }

                return {
                  ...image,
                  url,
                  existing: true,
                };
              })
              .filter(Boolean)
          : [];

      setForm({
        name: product.name || "",

        sku: product.sku || "",

        description:
          product.description || "",

        shortDescription:
          product.shortDescription || "",

        category: categoryValue,

        brand:
          typeof product.brand === "object"
            ? product.brand?.name || ""
            : product.brand || "",

        price:
          product.price !== undefined &&
          product.price !== null
            ? product.price
            : "",

        salePrice:
          product.salePrice !== undefined &&
          product.salePrice !== null
            ? product.salePrice
            : "",

        costPrice:
          product.costPrice !== undefined &&
          product.costPrice !== null
            ? product.costPrice
            : "",

        stock:
          product.stock !== undefined &&
          product.stock !== null
            ? product.stock
            : "",

        lowStockThreshold:
          product.lowStockThreshold !== undefined &&
          product.lowStockThreshold !== null
            ? product.lowStockThreshold
            : 5,

        unit: product.unit || "piece",

        status:
          product.status || "active",

        visibility:
          product.visibility || "public",

        featured:
          Boolean(product.featured),

        images: normalizedImages,
      });
    } catch (err) {
      console.error(
        "LOAD PRODUCT ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load product."
      );
    }
  };

  // =====================================================
  // MEDIA URL HELPER
  // Same as CreateProduct
  // =====================================================

  const getMediaUrl = (media) => {
    if (!media) {
      return "";
    }

    if (typeof media === "string") {
      return media;
    }

    return (
      media?.url ||
      media?.secure_url ||
      media?.fileUrl ||
      media?.src ||
      media?.path ||
      media?.location ||
      media?.cdnUrl ||
      ""
    );
  };

  // =====================================================
  // UPDATE FIELD
  // =====================================================

  const updateField = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // MEDIA SELECT
  // Same logic as CreateProduct
  // =====================================================

  const handleMediaSelect = (
    selected
  ) => {
    const selectedItems = Array.isArray(
      selected
    )
      ? selected
      : [selected];

    const validItems = selectedItems
      .map((item) => {
        const url = getMediaUrl(item);

        if (!url) {
          return null;
        }

        if (typeof item === "string") {
          return {
            url,
          };
        }

        return {
          ...item,
          url,
        };
      })
      .filter(Boolean);

    if (!validItems.length) {
      return;
    }

    setForm((prev) => {
      const existingUrls = new Set(
        prev.images
          .map((image) =>
            getMediaUrl(image)
          )
          .filter(Boolean)
      );

      const newImages =
        validItems.filter(
          (image) =>
            !existingUrls.has(
              getMediaUrl(image)
            )
        );

      return {
        ...prev,
        images: [
          ...prev.images,
          ...newImages,
        ],
      };
    });

    setMediaOpen(false);
    setError("");
    setSuccess("");
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = (index) => {
    setForm((prev) => {
      const images = [
        ...prev.images,
      ];

      images.splice(index, 1);

      return {
        ...prev,
        images,
      };
    });

    setError("");
    setSuccess("");
  };

  // =====================================================
  // MAKE IMAGE MAIN
  // =====================================================

  const makeMainImage = (index) => {
    setForm((prev) => {
      if (
        index < 0 ||
        index >= prev.images.length
      ) {
        return prev;
      }

      const images = [
        ...prev.images,
      ];

      const [selectedImage] =
        images.splice(index, 1);

      images.unshift(selectedImage);

      return {
        ...prev,
        images,
      };
    });

    setError("");
    setSuccess("");
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validate = () => {
    if (!form.name.trim()) {
      setError(
        "Product name is required."
      );
      return false;
    }

    if (
      form.price === "" ||
      Number.isNaN(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      setError(
        "Valid product price is required."
      );
      return false;
    }

    if (
      form.salePrice !== "" &&
      (
        Number.isNaN(
          Number(form.salePrice)
        ) ||
        Number(form.salePrice) < 0
      )
    ) {
      setError(
        "Sale price must be a valid positive number."
      );
      return false;
    }

    if (
      form.salePrice !== "" &&
      Number(form.salePrice) >
        Number(form.price)
    ) {
      setError(
        "Sale price cannot be greater than regular price."
      );
      return false;
    }

    if (
      form.costPrice !== "" &&
      (
        Number.isNaN(
          Number(form.costPrice)
        ) ||
        Number(form.costPrice) < 0
      )
    ) {
      setError(
        "Cost price must be a valid positive number."
      );
      return false;
    }

    if (
      form.stock === "" ||
      Number.isNaN(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      setError(
        "Valid stock quantity is required."
      );
      return false;
    }

    if (
      form.lowStockThreshold === "" ||
      Number.isNaN(
        Number(form.lowStockThreshold)
      ) ||
      Number(form.lowStockThreshold) < 0
    ) {
      setError(
        "Low stock threshold must be valid."
      );
      return false;
    }

    return true;
  };

  // =====================================================
  // UPDATE PRODUCT
  // =====================================================

  const updateProduct = async (
    event
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /*
       * IMPORTANT:
       *
       * No storeId is sent.
       *
       * Backend should identify business from:
       *
       * req.user.business
       * OR
       * req.businessId
       */

      const images = form.images
        .map((image) =>
          getMediaUrl(image)
        )
        .filter(Boolean);

      const payload = {
        name: form.name.trim(),

        sku: form.sku.trim(),

        description:
          form.description.trim(),

        shortDescription:
          form.shortDescription.trim(),

        /*
         * Category ID
         */
        category:
          form.category || null,

        brand:
          form.brand.trim(),

        price:
          Number(form.price),

        salePrice:
          form.salePrice === ""
            ? null
            : Number(form.salePrice),

        costPrice:
          form.costPrice === ""
            ? null
            : Number(form.costPrice),

        stock:
          Number(form.stock),

        lowStockThreshold:
          Number(
            form.lowStockThreshold || 5
          ),

        unit:
          form.unit,

        status:
          form.status,

        visibility:
          form.visibility,

        featured:
          Boolean(form.featured),

        /*
         * Media library URLs
         */
        images,
      };

      console.log(
        "UPDATE PRODUCT PAYLOAD:",
        payload
      );

      const response =
        await productApi.updateProduct(
          id,
          payload
        );

      console.log(
        "UPDATE PRODUCT RESPONSE:",
        response
      );

      const responseData =
        response?.data;

      if (!responseData?.success) {
        throw new Error(
          responseData?.message ||
            "Failed to update product."
        );
      }

      setSuccess(
        "Product updated successfully."
      );

      setTimeout(() => {
        navigate(
          `/products/${id}/edit`
        );
      }, 700);
    } catch (err) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  const deleteProduct = async () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response =
        await productApi.deleteProduct(
          id
        );

      if (!response?.data?.success) {
        throw new Error(
          response?.data?.message ||
            "Failed to delete product."
        );
      }

      navigate("/products");
    } catch (err) {
      console.error(
        "DELETE PRODUCT ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to delete product."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />

            <p className="mt-4 text-sm text-gray-500">
              Loading product...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate("/products")
          }
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Products
        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Product
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Update your product information.
              </p>
            </div>
          </div>

          {/* DELETE */}

          <button
            type="button"
            disabled={
              deleting || saving
            }
            onClick={deleteProduct}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />

            {deleting
              ? "Deleting..."
              : "Delete Product"}
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={updateProduct}
        >
          <div className="grid gap-6 lg:grid-cols-3">

            {/* =================================================
                LEFT
            ================================================= */}

            <div className="space-y-6 lg:col-span-2">

              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-base font-semibold text-gray-900">
                  Basic Information
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Update the basic product information.
                </p>

                <div className="mt-6 space-y-5">

                  {/* PRODUCT NAME */}

                  <Field
                    label="Product Name"
                    required
                    value={form.name}
                    onChange={(value) =>
                      updateField(
                        "name",
                        value
                      )
                    }
                    placeholder="Product name"
                  />

                  {/* SKU / BRAND */}

                  <div className="grid gap-5 md:grid-cols-2">

                    <Field
                      label="SKU"
                      value={form.sku}
                      onChange={(value) =>
                        updateField(
                          "sku",
                          value.toUpperCase()
                        )
                      }
                      placeholder="SKU"
                    />

                    <Field
                      label="Brand"
                      value={form.brand}
                      onChange={(value) =>
                        updateField(
                          "brand",
                          value
                        )
                      }
                      placeholder="Brand"
                    />

                  </div>

                  {/* =================================================
                      CATEGORY
                  ================================================= */}

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FolderTree className="h-4 w-4 text-gray-400" />
                      Category
                    </label>

                    <div className="relative">
                      <select
                        value={
                          form.category
                        }
                        onChange={(e) =>
                          updateField(
                            "category",
                            e.target.value
                          )
                        }
                        disabled={
                          categoryLoading
                        }
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                      >
                        <option value="">
                          {categoryLoading
                            ? "Loading categories..."
                            : "Select category"}
                        </option>

                        {categoryOptions.map(
                          (category) => {
                            const categoryId =
                              getCategoryId(
                                category
                              );

                            return (
                              <option
                                key={
                                  categoryId
                                }
                                value={
                                  categoryId
                                }
                              >
                                {category.__level
                                  ? `${"— ".repeat(
                                      category.__level
                                    )}${getCategoryName(
                                      category
                                    )}`
                                  : getCategoryName(
                                      category
                                    )}
                              </option>
                            );
                          }
                        )}
                      </select>

                      {categoryLoading && (
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>

                    {selectedCategory && (
                      <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                        Selected:{" "}
                        <span className="font-semibold">
                          {getCategoryName(
                            selectedCategory
                          )}
                        </span>
                      </div>
                    )}

                    {!categoryLoading &&
                      categories.length ===
                        0 && (
                        <p className="mt-2 text-xs text-gray-400">
                          No active categories found.
                        </p>
                      )}
                  </div>

                  {/* SHORT DESCRIPTION */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Short Description
                    </label>

                    <input
                      type="text"
                      maxLength={250}
                      value={
                        form.shortDescription
                      }
                      onChange={(e) =>
                        updateField(
                          "shortDescription",
                          e.target.value
                        )
                      }
                      placeholder="Short description"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <div className="mt-1 text-right text-[11px] text-gray-400">
                      {
                        form
                          .shortDescription
                          .length
                      }
                      /250
                    </div>
                  </div>

                  {/* DESCRIPTION */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Description
                    </label>

                    <textarea
                      rows={7}
                      value={
                        form.description
                      }
                      onChange={(e) =>
                        updateField(
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Product description..."
                      className="w-full resize-y rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                </div>
              </div>

              {/* =================================================
                  PRICING
              ================================================= */}

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-base font-semibold text-gray-900">
                  Pricing
                </h2>

                <div className="mt-6 grid gap-5 md:grid-cols-3">

                  <Field
                    label="Regular Price"
                    required
                    type="number"
                    value={form.price}
                    onChange={(value) =>
                      updateField(
                        "price",
                        value
                      )
                    }
                    placeholder="0"
                  />

                  <Field
                    label="Sale Price"
                    type="number"
                    value={
                      form.salePrice
                    }
                    onChange={(value) =>
                      updateField(
                        "salePrice",
                        value
                      )
                    }
                    placeholder="0"
                  />

                  <Field
                    label="Cost Price"
                    type="number"
                    value={
                      form.costPrice
                    }
                    onChange={(value) =>
                      updateField(
                        "costPrice",
                        value
                      )
                    }
                    placeholder="0"
                  />

                </div>
              </div>

              {/* =================================================
                  INVENTORY
              ================================================= */}

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-base font-semibold text-gray-900">
                  Inventory
                </h2>

                <div className="mt-6 grid gap-5 md:grid-cols-3">

                  <Field
                    label="Stock"
                    required
                    type="number"
                    value={form.stock}
                    onChange={(value) =>
                      updateField(
                        "stock",
                        value
                      )
                    }
                    placeholder="0"
                  />

                  <Field
                    label="Low Stock Threshold"
                    type="number"
                    value={
                      form.lowStockThreshold
                    }
                    onChange={(value) =>
                      updateField(
                        "lowStockThreshold",
                        value
                      )
                    }
                    placeholder="5"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Unit
                    </label>

                    <select
                      value={form.unit}
                      onChange={(e) =>
                        updateField(
                          "unit",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="piece">
                        Piece
                      </option>

                      <option value="kg">
                        Kilogram
                      </option>

                      <option value="gram">
                        Gram
                      </option>

                      <option value="liter">
                        Liter
                      </option>

                      <option value="meter">
                        Meter
                      </option>

                      <option value="box">
                        Box
                      </option>

                      <option value="pack">
                        Pack
                      </option>
                    </select>
                  </div>

                </div>
              </div>

              {/* =================================================
                  PRODUCT MEDIA
              ================================================= */}

              <div className="rounded-xl border border-gray-200 bg-white p-6">

                {/* MEDIA HEADER */}

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Product Images
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Select and manage images from your media library.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setMediaOpen(true)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <ImageIcon className="h-4 w-4" />

                    Select Media
                  </button>

                </div>

                {/* IMAGE GRID */}

                <div className="mt-6">

                  {form.images.length >
                  0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">

                      {form.images.map(
                        (
                          image,
                          index
                        ) => {
                          const imageUrl =
                            getMediaUrl(
                              image
                            );

                          return (
                            <div
                              key={`${imageUrl}-${index}`}
                              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                            >

                              {/* IMAGE */}

                              {imageUrl ? (
                                <img
                                  src={
                                    imageUrl
                                  }
                                  alt={`Product ${
                                    index +
                                    1
                                  }`}
                                  className="h-36 w-full object-cover transition duration-200 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-36 items-center justify-center text-xs text-gray-400">
                                  Image unavailable
                                </div>
                              )}

                              {/* MAIN IMAGE */}

                              {index ===
                                0 && (
                                <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
                                  Main Image
                                </span>
                              )}

                              {/* REMOVE */}

                              <button
                                type="button"
                                onClick={() =>
                                  removeImage(
                                    index
                                  )
                                }
                                className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-red-500 opacity-0 shadow transition group-hover:opacity-100 hover:bg-red-50"
                                title="Remove image"
                              >
                                <X className="h-4 w-4" />
                              </button>

                              {/* MAKE MAIN */}

                              {index !==
                                0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    makeMainImage(
                                      index
                                    )
                                  }
                                  className="absolute bottom-2 left-2 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold text-gray-700 opacity-0 shadow transition group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600"
                                >
                                  Make Main
                                </button>
                              )}

                            </div>
                          );
                        }
                      )}

                    </div>
                  ) : (
                    /* EMPTY STATE */

                    <button
                      type="button"
                      onClick={() =>
                        setMediaOpen(true)
                      }
                      className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center transition hover:border-blue-300 hover:bg-blue-50/30"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                        <ImageIcon className="h-7 w-7 text-gray-400" />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-gray-700">
                        Select images from Media Library
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Choose one or multiple existing uploaded images
                      </p>
                    </button>
                  )}

                </div>

                {/* IMAGE COUNT */}

                {form.images.length >
                  0 && (
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">

                    <p className="text-xs text-gray-500">
                      {form.images.length}{" "}
                      {form.images.length ===
                      1
                        ? "image"
                        : "images"}{" "}
                      selected
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setMediaOpen(true)
                      }
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Add More
                    </button>

                  </div>
                )}

              </div>

            </div>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}

            <div className="space-y-6">

              {/* =================================================
                  STATUS
              ================================================= */}

              <div className="rounded-xl border border-gray-200 bg-white p-6">

                <h2 className="text-base font-semibold text-gray-900">
                  Product Status
                </h2>

                <div className="mt-5 space-y-5">

                  {/* STATUS */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Status
                    </label>

                    <select
                      value={
                        form.status
                      }
                      onChange={(e) =>
                        updateField(
                          "status",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="active">
                        Active
                      </option>

                      <option value="draft">
                        Draft
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>
                    </select>
                  </div>

                  {/* VISIBILITY */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Visibility
                    </label>

                    <select
                      value={
                        form.visibility
                      }
                      onChange={(e) =>
                        updateField(
                          "visibility",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="public">
                        Public
                      </option>

                      <option value="private">
                        Private
                      </option>
                    </select>
                  </div>

                  {/* FEATURED */}

                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50">

                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Featured Product
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Show as featured.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={
                        form.featured
                      }
                      onChange={(e) =>
                        updateField(
                          "featured",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                  </label>

                </div>
              </div>

              {/* =================================================
                  SUMMARY
              ================================================= */}

              <div className="rounded-xl border border-gray-200 bg-white p-6">

                <h2 className="text-base font-semibold text-gray-900">
                  Product Summary
                </h2>

                <div className="mt-5 space-y-3">

                  <SummaryRow
                    label="Category"
                    value={
                      selectedCategory
                        ? getCategoryName(
                            selectedCategory
                          )
                        : "—"
                    }
                  />

                  <SummaryRow
                    label="Price"
                    value={
                      form.price !== ""
                        ? `₹${form.price}`
                        : "—"
                    }
                  />

                  <SummaryRow
                    label="Sale Price"
                    value={
                      form.salePrice !==
                      ""
                        ? `₹${form.salePrice}`
                        : "—"
                    }
                  />

                  <SummaryRow
                    label="Stock"
                    value={
                      form.stock !== ""
                        ? `${form.stock} ${form.unit}`
                        : "—"
                    }
                  />

                  <SummaryRow
                    label="Images"
                    value={
                      form.images.length
                    }
                  />

                  <SummaryRow
                    label="Status"
                    value={
                      form.status
                    }
                  />

                </div>
              </div>

              {/* =================================================
                  SAVE
              ================================================= */}

              <button
                type="submit"
                disabled={
                  saving || deleting
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              {/* =================================================
                  CANCEL
              ================================================= */}

              <button
                type="button"
                disabled={
                  saving ||
                  deleting
                }
                onClick={() =>
                  navigate(
                    `/products/${id}`
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

            </div>
          </div>
        </form>

        {/* =================================================
            MEDIA MANAGER
        ================================================= */}

        <MediaManager
          open={mediaOpen}
          onClose={() =>
            setMediaOpen(false)
          }
          onSelect={
            handleMediaSelect
          }
        />

      </div>
    </div>
  );
};

// ======================================================
// FIELD
// ======================================================

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value ?? ""}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={
          placeholder
        }
        min={
          type === "number"
            ? "0"
            : undefined
        }
        step={
          type === "number"
            ? "any"
            : undefined
        }
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
};

// ======================================================
// SUMMARY ROW
// ======================================================

const SummaryRow = ({
  label,
  value,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-gray-500">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-right text-sm font-semibold capitalize text-gray-900">
        {value}
      </span>
    </div>
  );
};

export default EditProduct;
