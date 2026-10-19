// src/pages/crm/Lead.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Tag,
  Upload,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import crmApi from "../../api/crm.api";

import LeadDetailsDrawer from "./LeadDetailsDrawer";
import LeadImportDrawer from "./LeadImportDrawer";

const Lead = () => {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState("");
  const [error, setError] = useState("");

  const [importDrawerOpen, setImportDrawerOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ============================================================
  // BULK SELECTION
  // ============================================================

  const [selectedIds, setSelectedIds] = useState([]);

  // ============================================================
  // DROPDOWNS
  // ============================================================

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");

  // ============================================================
  // COLUMN CONFIG
  // ============================================================

  const defaultColumns = {
    name: true,
    phone: true,
    status: true,
    createdAt: true,
    source: true,
    tag: true,
    remarks: true,
    optIn: true,
    assignedAt: true,
    assignedTo: true,
  };

  const [visibleColumns, setVisibleColumns] = useState(defaultColumns);

  const columnOptions = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "createdAt",
      label: "Created",
    },
    {
      key: "source",
      label: "Source",
    },
    {
      key: "tag",
      label: "Tags",
    },
    {
      key: "remarks",
      label: "Remarks",
    },
    {
      key: "optIn",
      label: "Opt In",
    },
    {
      key: "assignedAt",
      label: "Assigned At",
    },
    {
      key: "assignedTo",
      label: "Assigned To",
    },
  ];

  // ============================================================
  // STATUS OPTIONS
  // ============================================================

  const statusOptions = [
    {
      value: "",
      label: "All Status",
    },
    {
      value: "new",
      label: "New",
    },
    {
      value: "contacted",
      label: "Contacted",
    },
    {
      value: "qualified",
      label: "Qualified",
    },
    {
      value: "follow_up",
      label: "Follow Up",
    },
    {
      value: "proposal_sent",
      label: "Proposal Sent",
    },
    {
      value: "negotiation",
      label: "Negotiation",
    },
    {
      value: "won",
      label: "Won",
    },
    {
      value: "lost",
      label: "Lost",
    },
    {
      value: "junk",
      label: "Junk",
    },
  ];

  // ============================================================
  // HELPERS
  // ============================================================

  const getInitials = (name = "") => {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (!words.length) {
      return "L";
    }

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

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

  const formatTimeAgo = (date) => {
    if (!date) {
      return "-";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "-";
    }

    const diff = Date.now() - value.getTime();

    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    return formatDate(date);
  };

  const getSourceLabel = (source) => {
    if (!source) {
      return "-";
    }

    return source
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getTagName = (tag) => {
    if (!tag) {
      return "-";
    }

    if (typeof tag === "string") {
      return tag;
    }

    return tag?.name || tag?.title || tag?.label || "-";
  };

  const getAssignedName = (assignedTo) => {
    if (!assignedTo) {
      return "Not Assigned";
    }

    if (typeof assignedTo === "string") {
      return assignedTo;
    }

    return assignedTo?.name || assignedTo?.email || "Assigned";
  };

  const isAssigned = (lead) => {
    return Boolean(lead?.assignedTo);
  };

  const getStatusLabel = (status) => {
    return (
      statusOptions.find((item) => item.value === status)?.label ||
      getSourceLabel(status) ||
      "New"
    );
  };

  const getStatusClass = (status) => {
    const classes = {
      new: "border-blue-200 bg-blue-50 text-blue-700",

      contacted: "border-slate-200 bg-slate-50 text-slate-600",

      qualified: "border-violet-200 bg-violet-50 text-violet-700",

      follow_up: "border-amber-200 bg-amber-50 text-amber-700",

      proposal_sent: "border-indigo-200 bg-indigo-50 text-indigo-700",

      negotiation: "border-orange-200 bg-orange-50 text-orange-700",

      won: "border-emerald-200 bg-emerald-50 text-emerald-700",

      lost: "border-red-200 bg-red-50 text-red-600",

      junk: "border-slate-200 bg-slate-100 text-slate-500",
    };

    return classes[status] || "border-slate-200 bg-slate-50 text-slate-600";
  };

  // ============================================================
  // FETCH LEADS
  // ============================================================

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await crmApi.getLeads({
        page,
        limit,
        search: submittedSearch,
        status: statusFilter,
      });

      const result = response?.data;

      setLeads(result?.data || []);

      setPagination(
        result?.pagination || {
          total: 0,
          page: 1,
          limit,
          totalPages: 1,
        },
      );
    } catch (err) {
      console.error("Fetch leads error:", err);

      setError(err?.response?.data?.message || "Failed to load leads");

      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, submittedSearch, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = () => {
    setPage(1);
    setSubmittedSearch(search.trim());
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // ============================================================
  // STATUS FILTER
  // ============================================================

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  // ============================================================
  // COLUMN TOGGLE
  // ============================================================

  const toggleColumn = (key) => {
    setVisibleColumns((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const resetColumns = () => {
    setVisibleColumns(defaultColumns);
  };

  const filteredColumnOptions = useMemo(() => {
    const query = columnSearch.trim().toLowerCase();

    if (!query) {
      return columnOptions;
    }

    return columnOptions.filter((column) =>
      column.label.toLowerCase().includes(query),
    );
  }, [columnSearch]);

  // ============================================================
  // SELECT ALL
  // ============================================================

  const currentPageIds = useMemo(
    () => leads.map((lead) => lead?._id).filter(Boolean),
    [leads],
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

  // ============================================================
  // SINGLE SELECT
  // ============================================================

  const toggleSelectLead = (id) => {
    if (!id) {
      return;
    }

    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  const handleStatusChange = async (lead, newStatus) => {
    if (!lead?._id) {
      return;
    }

    if (!newStatus || newStatus === lead.status) {
      return;
    }

    try {
      setError("");
      setUpdatingStatus(lead._id);

      await crmApi.updateLeadStatus(lead._id, {
        status: newStatus,
      });

      setLeads((currentLeads) =>
        currentLeads.map((item) =>
          item._id === lead._id
            ? {
                ...item,
                status: newStatus,
              }
            : item,
        ),
      );

      setSelectedLead((current) => {
        if (!current || current._id !== lead._id) {
          return current;
        }

        return {
          ...current,
          status: newStatus,
        };
      });
    } catch (err) {
      console.error("Update lead status error:", err);

      setError(err?.response?.data?.message || "Failed to update lead status");
    } finally {
      setUpdatingStatus("");
    }
  };

  // ============================================================
  // DRAWER
  // ============================================================

  const handleOpenLead = (lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedLead(null);
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (lead) => {
    if (!lead?._id) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${lead.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(lead._id);
      setError("");

      await crmApi.deleteLead(lead._id);

      setSelectedIds((current) => current.filter((id) => id !== lead._id));

      if (leads.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        await fetchLeads();
      }

      if (selectedLead?._id === lead._id) {
        handleCloseDrawer();
      }
    } catch (err) {
      console.error("Delete lead error:", err);

      setError(err?.response?.data?.message || "Failed to delete lead");
    } finally {
      setDeleting("");
    }
  };

  // ============================================================
  // BULK ACTIONS
  // ============================================================

  const handleAssign = () => {
    if (!selectedIds.length) {
      window.alert("Please select at least one lead.");
      return;
    }

    console.log("Assign selected leads:", selectedIds);
  };

  const handleAssignTag = () => {
    if (!selectedIds.length) {
      window.alert("Please select at least one lead.");
      return;
    }

    console.log("Assign tag to selected leads:", selectedIds);
  };

  // ============================================================
  // EXPORT
  // ============================================================

  const handleExport = () => {
    if (!leads.length) {
      return;
    }

    const headers = [
      "Name",
      "Phone",
      "Email",
      "Created",
      "Source",
      "Tag",
      "Assigned To",
    ];

    const rows = leads.map((lead) => [
      lead.name || "",

      `${lead.phoneCountryCode || "+91"}${lead.phone || ""}`,

      lead.email || "",

      lead.createdAt ? formatDate(lead.createdAt) : "",

      getSourceLabel(lead.source),

      getTagName(lead.tag),

      getAssignedName(lead.assignedTo),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    setSearch("");
    setSubmittedSearch("");
    setStatusFilter("");
    setPage(1);
    setFiltersOpen(false);
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.max(1, Number(pagination?.totalPages || 1));

  const currentPage = Number(pagination?.page || page || 1);

  const total = Number(pagination?.total || 0);

  const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;

  const endItem = Math.min(currentPage * limit, total);

  const canPrevious = currentPage > 1;

  const canNext = currentPage < totalPages;

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

  // ============================================================
  // TABLE COLUMN COUNT
  // ============================================================

  const visibleColumnCount =
    Object.values(visibleColumns).filter(Boolean).length;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <header className="border-b border-slate-200 bg-white">
        <div className="flex min-h-[60px] items-center justify-between gap-4 px-5">
          {/* LEFT */}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <span className="text-slate-300">/</span>

            <span className="text-sm font-semibold text-slate-900">
              Contacts
            </span>

            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {total}
            </span>
          </div>

          {/* ACTIONS */}

          <div className="flex items-center gap-1.5">
            {selectedIds.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleAssign}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <UsersRound className="h-3.5 w-3.5" />
                  Assign
                </button>

                <button
                  type="button"
                  onClick={handleAssignTag}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Tag className="h-3.5 w-3.5" />
                  Tag
                </button>

                <span className="mx-1 h-5 w-px bg-slate-200" />
              </>
            )}

            <button
              type="button"
              onClick={fetchLeads}
              disabled={loading}
              title="Refresh"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={() => setImportDrawerOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Upload className="h-3.5 w-3.5" />
              Import
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={!leads.length}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>

            <button
              type="button"
              onClick={() => navigate("/crm/leads/create")}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-3 text-[11px] font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Lead
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================
          TOOLBAR
      ======================================================= */}

      <div className="border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* SEARCH */}

          <div className="flex h-9 w-full max-w-[460px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search name, phone or email..."
                className="h-full w-full rounded-l-md border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex w-[78px] items-center justify-center gap-1.5 rounded-r-md border border-l-0 border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          </div>

          {/* CONTROLS */}

          <div className="flex items-center gap-1.5">
            {/* FILTER */}

            <div className="relative">
              <button
                type="button"
                onClick={() => setFiltersOpen((value) => !value)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-semibold transition ${
                  filtersOpen || statusFilter
                    ? "border-slate-300 bg-slate-100 text-slate-900"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
                {statusFilter && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[9px] text-white">
                    1
                  </span>
                )}
              </button>

              {filtersOpen && (
                <div className="absolute right-0 top-11 z-50 w-[250px] rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      Filter Contacts
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
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-slate-400"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value || "all"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-3 w-full rounded-md border border-slate-200 py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* RESET */}

            {(search || submittedSearch || statusFilter) && (
              <button
                type="button"
                onClick={handleReset}
                title="Clear filters"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* COLUMNS */}

            <div className="relative">
              <button
                type="button"
                onClick={() => setColumnsOpen((value) => !value)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-semibold transition ${
                  columnsOpen
                    ? "border-slate-300 bg-slate-100 text-slate-900"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Columns
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {columnsOpen && (
                <div className="absolute right-0 top-11 z-50 w-[260px] rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
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
                      onChange={(e) => setColumnSearch(e.target.value)}
                      placeholder="Search columns..."
                      className="h-8 w-full bg-transparent text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={resetColumns}
                    className="mb-2 w-full border-b border-slate-100 pb-2 text-left text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Reset columns
                  </button>

                  <div className="max-h-[280px] space-y-0.5 overflow-y-auto">
                    {filteredColumnOptions.map((column) => (
                      <button
                        key={column.key}
                        type="button"
                        onClick={() => toggleColumn(column.key)}
                        className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition hover:bg-slate-50"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            visibleColumns[column.key]
                              ? "border-slate-900 bg-slate-900"
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

      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-5 py-2.5 text-xs text-red-700">
          <div className="flex items-center justify-between">
            <span>{error}</span>

            <button
              type="button"
              onClick={fetchLeads}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          TABLE
      ======================================================= */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] border-collapse">
          {/* HEADER */}

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {/* SELECT */}

              <th className="w-[48px] px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                    allCurrentSelected
                      ? "border-slate-900 bg-slate-900"
                      : "border-slate-300 bg-white hover:border-slate-500"
                  }`}
                >
                  {allCurrentSelected && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
              </th>

              {/* NAME */}

              {visibleColumns.name && (
                <th className="px-3 py-3 text-left">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <UserRound className="h-3.5 w-3.5" />
                    Name
                  </div>
                </th>
              )}

              {/* PHONE */}

              {visibleColumns.phone && (
                <th className="px-3 py-3 text-left">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </div>
                </th>
              )}

              {/* STATUS */}

              {visibleColumns.status && (
                <th className="px-3 py-3 text-left">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </div>
                </th>
              )}

              {/* CREATED */}

              {visibleColumns.createdAt && (
                <th className="px-3 py-3 text-left">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Created
                  </div>
                </th>
              )}

              {/* SOURCE */}

              {visibleColumns.source && (
                <th className="px-3 py-3 text-left">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <Share2 className="h-3.5 w-3.5" />
                    Source
                  </div>
                </th>
              )}

              {/* TAG */}

              {visibleColumns.tag && (
                <th className="px-3 py-3 text-left">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <Tag className="h-3.5 w-3.5" />
                    Tags
                  </div>
                </th>
              )}

              {/* REMARKS */}

              {visibleColumns.remarks && (
                <th className="px-3 py-3 text-left">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Remarks
                  </div>
                </th>
              )}

              {/* OPT IN */}

              {visibleColumns.optIn && (
                <th className="px-3 py-3 text-left">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Opt In
                  </div>
                </th>
              )}

              {/* ASSIGNED AT */}

              {visibleColumns.assignedAt && (
                <th className="px-3 py-3 text-left">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Assigned
                  </div>
                </th>
              )}

              {/* ASSIGNED TO */}

              {visibleColumns.assignedTo && (
                <th className="px-3 py-3 text-left">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <UsersRound className="h-3.5 w-3.5" />
                    Assigned To
                  </div>
                </th>
              )}
            </tr>
          </thead>

          {/* BODY */}

          <tbody>
            {/* LOADING */}

            {loading ? (
              Array.from({
                length: 8,
              }).map((_, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="px-4 py-4">
                    <div className="h-4 w-4 animate-pulse rounded border border-slate-200 bg-slate-100" />
                  </td>

                  {Object.entries(visibleColumns).map(
                    ([key, visible]) =>
                      visible && (
                        <td key={key} className="px-3 py-4">
                          <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
                        </td>
                      ),
                  )}
                </tr>
              ))
            ) : leads.length === 0 ? (
              /* EMPTY */

              <tr>
                <td
                  colSpan={visibleColumnCount + 1}
                  className="px-5 py-20 text-center"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    <UsersRound className="h-4 w-4 text-slate-400" />
                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-800">
                    No contacts found
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Try changing your search or filters.
                  </p>
                </td>
              </tr>
            ) : (
              /* DATA */

              leads.map((lead) => {
                const selected = selectedIds.includes(lead._id);

                return (
                  <tr
                    key={lead._id}
                    className={`border-b border-slate-100 transition ${
                      selected ? "bg-slate-50" : "hover:bg-slate-50/70"
                    }`}
                  >
                    {/* SELECT */}

                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleSelectLead(lead._id)}
                        className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                          selected
                            ? "border-slate-900 bg-slate-900"
                            : "border-slate-300 bg-white hover:border-slate-500"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 text-white" />}
                      </button>
                    </td>

                    {/* NAME */}

                    {visibleColumns.name && (
                      <td className="px-3 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleOpenLead(lead)}
                          className="flex max-w-[230px] items-center gap-2 text-left"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-700">
                            {getInitials(lead.name)}
                          </span>

                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold text-slate-800 hover:text-slate-600">
                              {lead.name || "Unnamed"}
                            </span>

                            {lead.email && (
                              <span className="block max-w-[180px] truncate text-[11px] text-slate-400">
                                {lead.email}
                              </span>
                            )}
                          </span>
                        </button>
                      </td>
                    )}

                    {/* PHONE */}

                    {visibleColumns.phone && (
                      <td className="px-3 py-3.5">
                        <span className="whitespace-nowrap text-xs text-slate-600">
                          {lead.phone ? (
                            <>
                              {lead.phoneCountryCode || "+91"} {lead.phone}
                            </>
                          ) : (
                            "-"
                          )}
                        </span>
                      </td>
                    )}

                    {/* STATUS */}

                    {visibleColumns.status && (
                      <td className="px-3 py-3.5">
                        <div className="relative w-fit">
                          <select
                            value={lead.status || "new"}
                            disabled={updatingStatus === lead._id}
                            onChange={(e) =>
                              handleStatusChange(lead, e.target.value)
                            }
                            title={getStatusLabel(lead.status)}
                            className={`h-7 appearance-none rounded-full border py-0 pl-2.5 pr-7 text-[11px] font-medium outline-none transition ${getStatusClass(
                              lead.status,
                            )} ${
                              updatingStatus === lead._id
                                ? "cursor-wait opacity-60"
                                : "cursor-pointer"
                            }`}
                          >
                            {statusOptions
                              .filter((item) => item.value)
                              .map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                          </select>

                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-50" />
                        </div>
                      </td>
                    )}

                    {/* CREATED */}

                    {visibleColumns.createdAt && (
                      <td className="px-3 py-3.5">
                        <div>
                          <span className="block whitespace-nowrap text-xs text-slate-600">
                            {formatTimeAgo(lead.createdAt)}
                          </span>

                          <span className="block text-[11px] text-slate-400">
                            {formatDate(lead.createdAt)}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* SOURCE */}

                    {visibleColumns.source && (
                      <td className="px-3 py-3.5">
                        <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
                          {getSourceLabel(lead.source)}
                        </span>
                      </td>
                    )}

                    {/* TAG */}

                    {visibleColumns.tag && (
                      <td className="px-3 py-3.5">
                        {lead.tag ? (
                          <span className="inline-flex max-w-[150px] items-center gap-1.5 text-xs text-slate-600">
                            <Tag className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                            <span className="truncate">
                              {getTagName(lead.tag)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    )}

                    {/* REMARKS */}

                    {visibleColumns.remarks && (
                      <td className="px-3 py-3.5">
                        <span className="block max-w-[200px] truncate text-xs text-slate-500">
                          {lead.message || lead.subject || "-"}
                        </span>
                      </td>
                    )}

                    {/* OPT IN */}

                    {visibleColumns.optIn && (
                      <td className="px-3 py-3.5">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                            lead.optIn === false
                              ? "border-slate-200 bg-slate-50 text-slate-500"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {lead.optIn === false ? "No" : "Yes"}
                        </span>
                      </td>
                    )}

                    {/* ASSIGNED AT */}

                    {visibleColumns.assignedAt && (
                      <td className="px-3 py-3.5">
                        <span className="whitespace-nowrap text-xs text-slate-500">
                          {lead.assignedAt
                            ? formatTimeAgo(lead.assignedAt)
                            : "-"}
                        </span>
                      </td>
                    )}

                    {/* ASSIGNED TO */}

                    {visibleColumns.assignedTo && (
                      <td className="px-3 py-3.5">
                        {isAssigned(lead) ? (
                          <span className="inline-flex max-w-[160px] items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            <span className="truncate">
                              {getAssignedName(lead.assignedTo)}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Not Assigned
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================
          PAGINATION
      ======================================================= */}

      {!loading && leads.length > 0 && (
        <div className="flex min-h-[54px] items-center justify-between border-t border-slate-200 bg-white px-5">
          {/* LEFT */}

          <div className="text-[11px] text-slate-500">
            {selectedIds.length > 0 ? (
              <>
                <span className="font-semibold text-slate-900">
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

          {/* RIGHT */}

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!canPrevious}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
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
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {number}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={!canNext}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="ml-2 h-7 rounded-md border border-slate-200 bg-white px-2 text-[10px] font-medium text-slate-600 outline-none focus:border-slate-400"
            >
              <option value={10}>10 / page</option>

              <option value={20}>20 / page</option>

              <option value={50}>50 / page</option>

              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>
      )}

      {/* ======================================================
          DRAWERS
      ======================================================= */}

      <LeadDetailsDrawer
        lead={selectedLead}
        open={drawerOpen}
        onClose={handleCloseDrawer}
      />

      <LeadImportDrawer
        open={importDrawerOpen}
        onClose={() => setImportDrawerOpen(false)}
        onImported={async () => {
          setPage(1);
          clearSelection();
          await fetchLeads();
        }}
      />
    </div>
  );
};

export default Lead;
