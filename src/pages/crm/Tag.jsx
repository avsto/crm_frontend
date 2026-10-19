import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Tag as TagIcon,
  Trash2,
  Users,
  X,
  Upload,
  Download,
  Filter,
  Palette,
  AlertCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import crmApi from "../../api/crm.api";

/* =========================================================
   CONSTANTS
========================================================= */

const COLORS = [
  "#6366f1",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#84cc16",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#a855f7",
  "#64748b",
  "#78716c",
];

const EMPTY_FORM = {
  name: "",
  description: "",
  color: "#6366f1",
  isActive: true,
};

const DEFAULT_COLUMNS = {
  tag: true,
  description: true,
  leads: true,
  status: true,
  created: true,
  action: true,
};

const COLUMN_OPTIONS = [
  {
    key: "tag",
    label: "Tag",
  },
  {
    key: "description",
    label: "Description",
  },
  {
    key: "leads",
    label: "Leads",
  },
  {
    key: "status",
    label: "Status",
  },
  {
    key: "created",
    label: "Created",
  },
  {
    key: "action",
    label: "Actions",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (name = "") => {
  const initials = String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "TG";
};

const formatDate = (date) => {
  if (!date) return "-";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "-";
  }

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Tag = () => {
  const navigate = useNavigate();

  /* =======================================================
     STATE
  ======================================================= */

  const [tags, setTags] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  /* =======================================================
     SELECTION
  ======================================================= */

  const [selectedIds, setSelectedIds] = useState([]);

  /* =======================================================
     FILTER / COLUMNS
  ======================================================= */

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [columnsOpen, setColumnsOpen] = useState(false);

  const [columnSearch, setColumnSearch] = useState("");

  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);

  /* =======================================================
     CREATE / EDIT
  ======================================================= */

  const [showModal, setShowModal] = useState(false);

  const [editingTag, setEditingTag] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  /* =======================================================
     DELETE
  ======================================================= */

  const [deleteTag, setDeleteTag] = useState(null);

  /* =======================================================
     FETCH TAGS
  ======================================================= */

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit,
        search: submittedSearch.trim() || undefined,
      };

      if (statusFilter !== "all") {
        params.isActive = statusFilter;
      }

      const response = await crmApi.getTags(params);

      const result = response?.data;

      setTags(result?.data || []);

      setPagination(
        result?.pagination || {
          page,
          limit,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (err) {
      console.error("Fetch tags error:", err);

      setError(err?.response?.data?.message || "Failed to load tags");
    } finally {
      setLoading(false);
    }
  }, [page, limit, submittedSearch, statusFilter]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  /* =======================================================
     AUTO CLEAR SUCCESS
  ======================================================= */

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalLeads = useMemo(() => {
    return tags.reduce((total, tag) => total + Number(tag?.leadCount || 0), 0);
  }, [tags]);

  const activeTags = useMemo(() => {
    return tags.filter((tag) => tag?.isActive).length;
  }, [tags]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = () => {
    setPage(1);
    setSubmittedSearch(search.trim());
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  /* =======================================================
     FILTER
  ======================================================= */

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = () => {
    setSearch("");
    setSubmittedSearch("");
    setStatusFilter("all");
    setPage(1);
    setFiltersOpen(false);
  };

  /* =======================================================
     COLUMNS
  ======================================================= */

  const toggleColumn = (key) => {
    setVisibleColumns((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const resetColumns = () => {
    setVisibleColumns(DEFAULT_COLUMNS);
    setColumnSearch("");
  };

  const filteredColumnOptions = useMemo(() => {
    const query = columnSearch.trim().toLowerCase();

    if (!query) {
      return COLUMN_OPTIONS;
    }

    return COLUMN_OPTIONS.filter((column) =>
      column.label.toLowerCase().includes(query),
    );
  }, [columnSearch]);

  /* =======================================================
     SELECTION
  ======================================================= */

  const currentPageIds = useMemo(
    () => tags.map((tag) => tag?._id).filter(Boolean),
    [tags],
  );

  const allCurrentSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !currentPageIds.includes(id)),
      );

      return;
    }

    setSelectedIds((current) => [...new Set([...current, ...currentPageIds])]);
  };

  const toggleSelectTag = (id) => {
    if (!id) return;

    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  /* =======================================================
     CREATE
  ======================================================= */

  const openCreateModal = () => {
    setEditingTag(null);

    setForm({
      ...EMPTY_FORM,
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const openEditModal = (tag) => {
    setEditingTag(tag);

    setForm({
      name: tag?.name || "",
      description: tag?.description || "",
      color: tag?.color || "#6366f1",
      isActive: tag?.isActive ?? true,
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  /* =======================================================
     CLOSE DRAWER
  ======================================================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingTag(null);

    setForm({
      ...EMPTY_FORM,
    });

    setError("");
  };

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =======================================================
     SAVE TAG
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setError("Please enter a tag name.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name,
        description: form.description.trim() || null,
        color: form.color,
        ...(editingTag
          ? {
              isActive: form.isActive,
            }
          : {}),
      };

      if (editingTag) {
        await crmApi.updateTag(editingTag._id, payload);

        setSuccess("Tag updated successfully.");
      } else {
        await crmApi.createTag(payload);

        setSuccess("Tag created successfully.");
      }

      setShowModal(false);
      setEditingTag(null);

      setForm({
        ...EMPTY_FORM,
      });

      await fetchTags();
    } catch (err) {
      console.error("Save tag error:", err);

      setError(err?.response?.data?.message || "Failed to save tag.");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async () => {
    if (!deleteTag) return;

    try {
      setLoading(true);
      setError("");

      await crmApi.deleteTag(deleteTag._id);

      setSelectedIds((current) => current.filter((id) => id !== deleteTag._id));

      setDeleteTag(null);

      setSuccess("Tag deleted successfully.");

      await fetchTags();
    } catch (err) {
      console.error("Delete tag error:", err);

      setError(err?.response?.data?.message || "Failed to delete tag.");
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     EXPORT
  ======================================================= */

  const handleExport = () => {
    if (!tags.length) return;

    const headers = ["Tag", "Description", "Leads", "Status", "Created"];

    const rows = tags.map((tag) => [
      tag?.name || "",
      tag?.description || "",
      tag?.leadCount || 0,
      tag?.isActive ? "Active" : "Inactive",
      formatDate(tag?.createdAt),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `tags-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(1, Number(pagination?.totalPages || 1));

  const currentPage = Number(pagination?.page || page || 1);

  const total = Number(pagination?.total || 0);

  const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;

  const endItem = Math.min(currentPage * limit, total);

  const pageNumbers = useMemo(() => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);

    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="border-b border-slate-200 bg-white">
        <div className="flex min-h-[64px] items-center justify-between gap-4 px-5">
          {/* LEFT */}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

            <span className="text-sm font-semibold text-slate-900">Tags</span>

            <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 sm:inline-flex">
              {pagination.total}
            </span>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-1.5">
            {/* ASSIGN */}

            <button
              type="button"
              onClick={() => {
                if (!selectedIds.length) {
                  window.alert("Please select at least one tag.");
                  return;
                }

                window.alert(
                  "Tag assignment can be connected to your tag assignment API.",
                );
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Users className="h-3.5 w-3.5" />
              Assign
            </button>

            {/* ASSIGN TAG */}

            <button
              type="button"
              onClick={() => {
                if (!selectedIds.length) {
                  window.alert("Please select at least one tag.");
                  return;
                }

                window.alert("Assign Tag action is ready for your tag API.");
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <TagIcon className="h-3.5 w-3.5" />
              Assign Tag
            </button>

            <div className="mx-1 h-5 w-px bg-slate-200" />

            {/* REFRESH */}

            <button
              type="button"
              onClick={fetchTags}
              disabled={loading}
              title="Refresh"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            {/* IMPORT */}

            <button
              type="button"
              onClick={() =>
                window.alert(
                  "Import functionality can be connected to your tag import API.",
                )
              }
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <Upload className="h-3.5 w-3.5" />
              Import
            </button>

            {/* EXPORT */}

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>

            {/* ADD */}

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-3 text-[11px] font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Tag
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          SUMMARY
      =================================================== */}

     

      {/* ===================================================
          SUCCESS
      =================================================== */}

      {success && (
        <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-2.5">
          <div className="flex items-center justify-between text-xs text-emerald-700">
            <span className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5" />

              {success}
            </span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="rounded p-1 hover:bg-emerald-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && !showModal && (
        <div className="border-b border-red-100 bg-red-50 px-5 py-2.5">
          <div className="flex items-center justify-between text-xs text-red-700">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />

              {error}
            </span>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded p-1 hover:bg-red-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          SEARCH / FILTER
      =================================================== */}

      <div className="border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* SEARCH */}

          <div className="flex h-9 w-full max-w-[430px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search tags..."
                className="h-full w-full rounded-l-md border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex w-[82px] items-center justify-center gap-1.5 rounded-r-md border border-l-0 border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-1.5">
            {/* FILTER */}

            <div className="relative">
              <button
                type="button"
                onClick={() => setFiltersOpen((value) => !value)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-semibold transition ${
                  filtersOpen || statusFilter !== "all"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
                {statusFilter !== "all" && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] text-white">
                    1
                  </span>
                )}
              </button>

              {filtersOpen && (
                <div className="absolute right-0 top-11 z-50 w-[270px] rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      Filters
                    </span>

                    <button
                      type="button"
                      onClick={() => setFiltersOpen(false)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(event) => handleStatusFilter(event.target.value)}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-blue-400"
                  >
                    <option value="all">All Tags</option>

                    <option value="true">Active</option>

                    <option value="false">Inactive</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-3 w-full rounded-md border border-slate-200 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* RESET */}

            <button
              type="button"
              onClick={handleReset}
              title="Reset"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* COLUMNS */}

            <div className="relative">
              <button
                type="button"
                onClick={() => setColumnsOpen((value) => !value)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-semibold transition ${
                  columnsOpen
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Columns
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {columnsOpen && (
                <div className="absolute right-0 top-11 z-50 w-[270px] rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      Table Columns
                    </span>

                    <button
                      type="button"
                      onClick={() => setColumnsOpen(false)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mb-2 flex items-center gap-2 rounded-md border border-slate-200 px-2.5">
                    <Search className="h-3.5 w-3.5 text-slate-400" />

                    <input
                      type="text"
                      value={columnSearch}
                      onChange={(event) => setColumnSearch(event.target.value)}
                      placeholder="Search columns..."
                      className="h-8 w-full bg-transparent text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={resetColumns}
                    className="mb-2 w-full border-b border-slate-100 pb-2 text-left text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Reset columns
                  </button>

                  <div className="max-h-[300px] space-y-0.5 overflow-y-auto">
                    {filteredColumnOptions.map((column) => (
                      <button
                        key={column.key}
                        type="button"
                        onClick={() => toggleColumn(column.key)}
                        className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition hover:bg-slate-50"
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded border ${
                            visibleColumns[column.key]
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {visibleColumns[column.key] && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </span>

                        <span className="text-[11px] font-medium text-slate-700">
                          {column.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {/* SELECT */}

              <th className="w-[48px] px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                    allCurrentSelected
                      ? "border-blue-600 bg-blue-600"
                      : "border-slate-300 bg-white hover:border-blue-500"
                  }`}
                >
                  {allCurrentSelected && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
              </th>

              {visibleColumns.tag && (
                <th className="px-3 py-3 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Tag
                  </span>
                </th>
              )}

              {visibleColumns.description && (
                <th className="px-3 py-3 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Description
                  </span>
                </th>
              )}

              {visibleColumns.leads && (
                <th className="px-3 py-3 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Leads
                  </span>
                </th>
              )}

              {visibleColumns.status && (
                <th className="px-3 py-3 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </span>
                </th>
              )}

              {visibleColumns.created && (
                <th className="px-3 py-3 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Created
                  </span>
                </th>
              )}

              {visibleColumns.action && (
                <th className="px-3 py-3 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Actions
                  </span>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({
                length: 7,
              }).map((_, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="px-4 py-4">
                    <div className="h-4 w-4 animate-pulse rounded bg-slate-100" />
                  </td>

                  {Object.values(visibleColumns).map(
                    (visible, column) =>
                      visible && (
                        <td key={column} className="px-3 py-4">
                          <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
                        </td>
                      ),
                  )}
                </tr>
              ))
            ) : tags.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    1 + Object.values(visibleColumns).filter(Boolean).length
                  }
                  className="px-5 py-20 text-center"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    <TagIcon className="h-4 w-4 text-slate-400" />
                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-800">
                    No tags found
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Create a tag to organize your leads.
                  </p>

                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create your first tag
                  </button>
                </td>
              </tr>
            ) : (
              tags.map((tag) => {
                const selected = selectedIds.includes(tag?._id);

                const color = tag?.color || "#6366f1";

                return (
                  <tr
                    key={tag._id}
                    className={`border-b border-slate-100 transition ${
                      selected ? "bg-blue-50/50" : "hover:bg-slate-50/70"
                    }`}
                  >
                    {/* SELECT */}

                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleSelectTag(tag._id)}
                        className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                          selected
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-300 bg-white hover:border-blue-500"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 text-white" />}
                      </button>
                    </td>

                    {/* TAG */}

                    {visibleColumns.tag && (
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                            style={{
                              backgroundColor: `${color}18`,
                              color,
                            }}
                          >
                            {getInitials(tag?.name)}
                          </div>

                          <button
                            type="button"
                            onClick={() => openEditModal(tag)}
                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold"
                            style={{
                              backgroundColor: `${color}18`,
                              color,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor: color,
                              }}
                            />

                            {tag?.name || "Unnamed"}
                          </button>
                        </div>
                      </td>
                    )}

                    {/* DESCRIPTION */}

                    {visibleColumns.description && (
                      <td className="px-3 py-3.5">
                        <p className="max-w-[300px] truncate text-xs text-slate-500">
                          {tag?.description || "-"}
                        </p>
                      </td>
                    )}

                    {/* LEADS */}

                    {visibleColumns.leads && (
                      <td className="px-3 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                          <Users className="h-3 w-3 text-slate-400" />

                          {tag?.leadCount || 0}
                        </span>
                      </td>
                    )}

                    {/* STATUS */}

                    {visibleColumns.status && (
                      <td className="px-3 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                            tag?.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              tag?.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />

                          {tag?.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    )}

                    {/* CREATED */}

                    {visibleColumns.created && (
                      <td className="px-3 py-3.5">
                        <span className="whitespace-nowrap text-xs text-slate-500">
                          {formatDate(tag?.createdAt)}
                        </span>
                      </td>
                    )}

                    {/* ACTION */}

                    {visibleColumns.action && (
                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(tag)}
                            title="Edit"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTag(tag)}
                            title="Delete"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ===================================================
          PAGINATION
      =================================================== */}

      {!loading && tags.length > 0 && (
        <div className="flex min-h-[56px] items-center justify-between border-t border-slate-200 bg-white px-5">
          <div className="text-[11px] text-slate-500">
            {selectedIds.length > 0 ? (
              <>
                <span className="font-semibold text-blue-600">
                  {selectedIds.length}
                </span>{" "}
                selected
              </>
            ) : (
              <>
                Showing{" "}
                <span className="font-medium text-slate-700">{startItem}</span>{" "}
                to <span className="font-medium text-slate-700">{endItem}</span>{" "}
                of <span className="font-medium text-slate-700">{total}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {pageNumbers.map((number, index) =>
              number === "..." ? (
                <span
                  key={`dots-${index}`}
                  className="flex h-7 w-7 items-center justify-center text-[10px] text-slate-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  className={`flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-[10px] font-semibold transition ${
                    currentPage === number
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {number}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
              className="ml-2 h-7 rounded-md border border-slate-200 bg-white px-2 text-[10px] font-medium text-slate-600 outline-none focus:border-blue-400"
            >
              <option value={10}>10 / page</option>

              <option value={20}>20 / page</option>

              <option value={50}>50 / page</option>

              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>
      )}

      {/* ===================================================
          CREATE / EDIT DRAWER
      =================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-[100]">
          {/* OVERLAY */}

          <div
            className="absolute inset-0 bg-slate-900/20"
            onClick={closeModal}
          />

          {/* DRAWER */}

          <div className="absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col border-l border-slate-200 bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex min-h-[64px] items-center justify-between border-b border-slate-200 px-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {editingTag ? "Edit Tag" : "Add Tag"}
                </h2>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  {editingTag ? "Update tag details" : "Create a new tag"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4 p-5">
                  {/* ERROR */}

                  {error && (
                    <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] text-red-600">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />

                      <span>{error}</span>
                    </div>
                  )}

                  {/* NAME */}

                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Tag Name
                      <span className="text-red-500"> *</span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="e.g. Hot Lead"
                      required
                      autoFocus
                      className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    />
                  </div>

                  {/* DESCRIPTION */}

                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Describe this tag..."
                      className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    />
                  </div>

                  {/* COLOR */}

                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      <Palette className="h-3.5 w-3.5" />
                      Tag Color
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setForm((previous) => ({
                              ...previous,
                              color,
                            }))
                          }
                          className={`flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-105 ${
                            form.color === color
                              ? "ring-2 ring-slate-900 ring-offset-2"
                              : ""
                          }`}
                          style={{
                            backgroundColor: color,
                          }}
                          title={color}
                        >
                          {form.color === color && (
                            <Check className="h-3.5 w-3.5 text-white" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* PREVIEW */}

                    <div className="mt-3 flex items-center gap-3 rounded-md border border-slate-200 p-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          backgroundColor: `${form.color}18`,
                          color: form.color,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: form.color,
                          }}
                        />

                        {form.name.trim() || "Tag Preview"}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        Preview
                      </span>
                    </div>
                  </div>

                  {/* STATUS */}

                  {editingTag && (
                    <label className="flex cursor-pointer items-center justify-between rounded-md border border-slate-200 p-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Active
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Allow this tag to be used.
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                        className="h-4 w-4 accent-blue-600"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeModal}
                  className="h-8 rounded-md border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-3 text-[11px] font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />

                      {editingTag ? "Save Changes" : "Create Tag"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          DELETE CONFIRMATION
      =================================================== */}

      {deleteTag && (
        <div className="fixed inset-0 z-[110]">
          <div
            className="absolute inset-0 bg-slate-900/20"
            onClick={() => setDeleteTag(null)}
          />

          <div className="absolute left-1/2 top-1/2 w-[calc(100%-32px)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-50 text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Delete Tag
                    </h3>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteTag(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4">
              <p className="text-xs leading-5 text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-800">
                  "{deleteTag.name}"
                </span>
                ?
              </p>

              <p className="mt-2 text-[10px] leading-4 text-slate-400">
                This will remove the tag from{" "}
                <span className="font-semibold text-slate-600">
                  {deleteTag.leadCount || 0} leads
                </span>
                . The leads themselves will not be deleted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
              <button
                type="button"
                onClick={() => setDeleteTag(null)}
                className="h-8 rounded-md border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="h-8 rounded-md bg-red-600 px-3 text-[11px] font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Tag"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tag;
