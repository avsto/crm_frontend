import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Folder,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Image as ImageIcon,
  Save,
  Star,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import categoryApi from "../../api/category.api";
import MediaManager from "../../components/media/MediaManager";

const EMPTY_FORM = {
  name: "",
  description: "",
  image: "",
  parent: "",
  sortOrder: 0,
  status: "active",
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
};

const CategoryManagement = () => {
  const navigate = useNavigate();

  // ======================================================
  // STATE
  // ======================================================

  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(
    localStorage.getItem("selectedStoreId") ||
      localStorage.getItem("activeStoreId") ||
      localStorage.getItem("storeId") ||
      "",
  );

  const [loading, setLoading] = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Media Manager
  const [mediaOpen, setMediaOpen] = useState(false);

  // Current editing category
  const [editingCategory, setEditingCategory] = useState(null);

  // Form
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD STORES
  // ======================================================

  const loadStores = async () => {
    try {
      setLoadingStores(true);
      const storedStores = JSON.parse(localStorage.getItem("stores") || "[]");

      if (Array.isArray(storedStores) && storedStores.length > 0) {
        setStores(storedStores);

        if (!selectedStoreId) {
          const firstId = storedStores[0]?._id || storedStores[0]?.id || "";
          setSelectedStoreId(firstId);
          if (firstId) {
            localStorage.setItem("selectedStoreId", firstId);
            localStorage.setItem("activeStoreId", firstId);
          }
        }
      }
    } catch (err) {
      console.error("STORE LOAD ERROR:", err);
    } finally {
      setLoadingStores(false);
    }
  };

  // ======================================================
  // LOAD CATEGORIES
  // ======================================================

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await categoryApi.getCategories({
        search: search.trim(),
        storeId: selectedStoreId || undefined,
        limit: 200,
        sort: "sortOrder",
        order: "asc",
      });

      const data =
        response?.data?.data ||
        response?.data?.categories ||
        response?.data ||
        [];

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load Categories Error:", err);
      setError(err?.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [search, selectedStoreId]);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCategories();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadCategories]);

  // ======================================================
  // STORE CHANGE
  // ======================================================

  const handleStoreChange = (storeId) => {
    setSelectedStoreId(storeId);
    localStorage.setItem("selectedStoreId", storeId);
    localStorage.setItem("activeStoreId", storeId);
  };

  // ======================================================
  // CATEGORY DESCENDANTS (Prevent Circular Selection)
  // ======================================================

  const getDescendantIds = useCallback(
    (categoryId) => {
      const result = new Set();
      const findChildren = (parentId) => {
        categories.forEach((category) => {
          const currentParentId =
            category.parent?._id || category.parent || null;

          if (String(currentParentId) === String(parentId)) {
            result.add(category._id || category.id);
            findChildren(category._id || category.id);
          }
        });
      };

      findChildren(categoryId);
      return result;
    },
    [categories],
  );

  // ======================================================
  // PARENT OPTIONS
  // ======================================================

  const parentOptions = useMemo(() => {
    if (!editingCategory) return categories;

    const currentId = editingCategory._id || editingCategory.id;
    const excludedIds = getDescendantIds(currentId);
    excludedIds.add(currentId);

    return categories.filter(
      (category) => !excludedIds.has(category._id || category.id),
    );
  }, [categories, editingCategory, getDescendantIds]);

  // ======================================================
  // ACTIONS
  // ======================================================

  const openCreateDrawer = () => {
    setEditingCategory(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setDrawerOpen(true);
  };

  const openEditDrawer = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
      parent: category.parent?._id || category.parent || "",
      sortOrder: category.sortOrder || 0,
      status: category.status || "active",
      isFeatured: category.isFeatured || false,
      seoTitle: category.seoTitle || "",
      seoDescription: category.seoDescription || "",
      seoKeywords: category.seoKeywords || "",
    });
    setError("");
    setDrawerOpen(true);
  };

  const handleDelete = async (category) => {
    const categoryId = category?._id || category?.id;
    if (!categoryId) return;

    const confirmed = window.confirm(
      `Delete category "${category.name || "this category"}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(categoryId);
      await categoryApi.deleteCategory(categoryId);
      setCategories((prev) =>
        prev.filter((item) => (item._id || item.id) !== categoryId),
      );
    } catch (err) {
      console.error("DELETE CATEGORY ERROR:", err);
      alert(err?.response?.data?.message || "Unable to delete category.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        storeId: selectedStoreId || undefined,
        parent: form.parent || null,
      };

      if (editingCategory) {
        const id = editingCategory._id || editingCategory.id;
        await categoryApi.updateCategory(id, payload);
      } else {
        await categoryApi.createCategory(payload);
      }

      setDrawerOpen(false);
      loadCategories();
    } catch (err) {
      console.error("SAVE CATEGORY ERROR:", err);
      setError(err?.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // FILTER & STATS
  // ======================================================

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const name = category?.name || "";
      const matchesSearch =
        !search || name.toLowerCase().includes(search.toLowerCase());

      const catStatus = category?.status || "active";
      const matchesStatus = status === "all" || catStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, status]);

  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter(
      (cat) => (cat?.status || "active") === "active",
    ).length;
    const inactive = categories.filter(
      (cat) => cat?.status === "inactive",
    ).length;

    return { total, active, inactive };
  }, [categories]);

  // ======================================================
  // STATUS BADGE
  // ======================================================

  const StatusBadge = ({ category }) => {
    const catStatus = category?.status || "active";

    if (catStatus === "active") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
        <XCircle className="h-3 w-3" />
        Inactive
      </span>
    );
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ======================================================
          HEADER
      ====================================================== */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-5 py-5 md:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* LEFT */}
            <div>
              {/* Breadcrumb */}
              <div className="mb-2.5 flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1.5 text-gray-500 transition hover:text-gray-800"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <span className="text-gray-300">/</span>
                <span className="text-gray-500">Business</span>
                <span className="text-gray-300">/</span>
                <span className="font-medium text-gray-800">Categories</span>
              </div>

              <h1 className="text-1xl font-bold tracking-tight text-gray-900">
                Categories
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Create, manage and organize your product categories.
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex flex-wrap gap-2">
              {/* STORE */}
              {!loadingStores && stores.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedStoreId}
                    onChange={(e) => handleStoreChange(e.target.value)}
                    className="h-10 appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-gray-700 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-100"
                  >
                    {stores.map((store) => (
                      <option
                        key={store._id || store.id}
                        value={store._id || store.id}
                      >
                        {store.name || store.businessName || "Store"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>
              )}

              {/* REFRESH */}
              <button
                type="button"
                onClick={loadCategories}
                disabled={loading}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              {/* CREATE */}
              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-black"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          CONTENT
      ====================================================== */}
      <div className="px-5 py-6 md:px-7">
        <div className="mx-auto max-w-[1450px]">
          {/* ERROR */}
          {error && (
            <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
              <button
                type="button"
                onClick={loadCategories}
                className="ml-auto font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* LIBRARY CARD */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {/* CARD HEADER */}
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className=" flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStatus("all")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      status === "all"
                        ? "bg-[#111827] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All ({stats.total})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("active")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      status === "active"
                        ? "bg-[#111827] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Active ({stats.active})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("inactive")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      status === "inactive"
                        ? "bg-[#111827] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Inactive ({stats.inactive})
                  </button>
                </div>

                {/* SEARCH & FILTERS */}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative w-full sm:w-[280px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search categories..."
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-100"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-xs font-medium text-gray-700 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-100 sm:w-[145px]"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* TABS */}
            </div>

            {/* TABLE */}
            {loading ? (
              <LoadingState />
            ) : filteredCategories.length === 0 ? (
              <EmptyState search={search} onCreate={openCreateDrawer} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/70">
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Parent Category
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Order
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Featured
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                      <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredCategories.map((category) => {
                      const categoryId = category._id || category.id;
                      const parentName =
                        category.parent?.name ||
                        categories.find(
                          (c) =>
                            (c._id || c.id) ===
                            (category.parent?._id || category.parent),
                        )?.name ||
                        "-";

                      return (
                        <tr
                          key={categoryId}
                          className="transition hover:bg-gray-50/70"
                        >
                          {/* CATEGORY */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                {category.image ? (
                                  <img
                                    src={category.image}
                                    alt={category.name || "Category"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Folder className="h-4 w-4 text-gray-300" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-gray-900">
                                  {category.name || "Unnamed Category"}
                                </p>
                                <p className="mt-0.5 truncate text-[11px] text-gray-500">
                                  {category.description || "No description"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* PARENT */}
                          <td className="px-4 py-3.5 text-xs text-gray-600">
                            {parentName}
                          </td>

                          {/* SORT ORDER */}
                          <td className="px-4 py-3.5 text-xs font-semibold text-gray-900">
                            {category.sortOrder ?? 0}
                          </td>

                          {/* FEATURED */}
                          <td className="px-4 py-3.5">
                            {category.isFeatured ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                                Featured
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>

                          {/* STATUS */}
                          <td className="px-4 py-3.5">
                            <StatusBadge category={category} />
                          </td>

                          {/* ACTIONS */}
                          <td className="px-5 py-3.5">
                            <div className="flex justify-end gap-0.5">
                              <button
                                type="button"
                                title="Edit"
                                onClick={() => openEditDrawer(category)}
                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                title="Delete"
                                disabled={deletingId === categoryId}
                                onClick={() => handleDelete(category)}
                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                              >
                                {deletingId === categoryId ? (
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* COUNT */}
            {!loading && filteredCategories.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-3 text-[11px] text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {filteredCategories.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {categories.length}
                </span>{" "}
                categories
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================
          SLIDE-OVER DRAWER (CREATE / EDIT)
      ====================================================== */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div className="flex w-full max-w-lg flex-col bg-white shadow-2xl">
            {/* DRAWER HEADER */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingCategory ? "Edit Category" : "Create Category"}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingCategory
                    ? "Update category information and settings."
                    : "Add a new category to organize your products."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* DRAWER FORM */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col justify-between overflow-y-auto px-6 py-5"
            >
              <div className="space-y-4">
                {/* NAME */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Footwear"
                    className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-100"
                  />
                </div>

                {/* PARENT CATEGORY */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Parent Category
                  </label>
                  <div className="relative mt-1">
                    <select
                      value={form.parent}
                      onChange={(e) =>
                        setForm({ ...form, parent: e.target.value })
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-100"
                    >
                      <option value="">None (Top Level Category)</option>
                      {parentOptions.map((cat) => (
                        <option
                          key={cat._id || cat.id}
                          value={cat._id || cat.id}
                        >
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* IMAGE */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Category Image
                  </label>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      {form.image ? (
                        <img
                          src={form.image}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setMediaOpen(true)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      Select Image
                    </button>
                    {form.image && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: "" })}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Briefly describe this category..."
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-800 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* SORT ORDER */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sortOrder: Number(e.target.value),
                        })
                      }
                      className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-100"
                    />
                  </div>

                  {/* STATUS */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">
                      Status
                    </label>
                    <div className="relative mt-1">
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                        className="h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-100"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* FEATURED */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm({ ...form, isFeatured: e.target.checked })
                    }
                    className="h-4 w-4 rounded-sm border-gray-300 text-gray-900 focus:ring-gray-400"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="text-xs font-medium text-gray-700"
                  >
                    Mark as Featured Category
                  </label>
                </div>
              </div>

              {/* DRAWER FOOTER */}
              <div className="mt-6 flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#111827] px-4 text-xs font-semibold text-white transition hover:bg-black disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDIA MANAGER MODAL */}
      {mediaOpen && (
        <MediaManager
          open={mediaOpen}
          onClose={() => setMediaOpen(false)}
          onSelect={(url) => {
            setForm((prev) => ({ ...prev, image: url?.url }));
            setMediaOpen(false);
          }}
        />
      )}
    </div>
  );
};

// ============================================================
// LOADING STATE
// ============================================================

const LoadingState = () => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-10 text-center">
      <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      <p className="mt-3 text-xs font-medium text-gray-500">
        Loading categories...
      </p>
    </div>
  );
};

// ============================================================
// EMPTY STATE
// ============================================================

const EmptyState = ({ search, onCreate }) => {
  return (
    <div className="flex min-h-[330px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Layers className="h-6 w-6 text-gray-400" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-900">
        No categories found
      </h3>

      <p className="mt-1 max-w-sm text-xs text-gray-500">
        {search
          ? "Try changing your search or filters."
          : "Create your first category to get started."}
      </p>

      {!search && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 text-xs font-semibold text-white transition hover:bg-black"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Category
        </button>
      )}
    </div>
  );
};

export default CategoryManagement;
