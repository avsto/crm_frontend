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
  Loader2,
  ExternalLink
} from "lucide-react";

import crmApi from "../../api/crm.api";
import LeadDetailsDrawer from "./LeadDetailsDrawer";
import LeadImportDrawer from "./LeadImportDrawer";
import LeadDrawer from "./LeadDrawer";

// ============================================================
// CONFIGURATION
// ============================================================

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },

  { value: "new", label: "New" },
  { value: "attempted", label: "Attempted" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "qualified", label: "Qualified" },
  { value: "unqualified", label: "Unqualified" },

  { value: "demo_requested", label: "Demo Requested" },
  { value: "demo_scheduled", label: "Demo Scheduled" },
  { value: "demo_completed", label: "Demo Completed" },
  { value: "demo_rescheduled", label: "Demo Rescheduled" },
  { value: "demo_no_show", label: "Demo No Show" },

  { value: "appointment_scheduled", label: "Appointment Scheduled" },
  { value: "appointment_completed", label: "Appointment Completed" },

  { value: "follow_up", label: "Follow Up" },
  { value: "awaiting_response", label: "Awaiting Response" },

  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "quotation_sent", label: "Quotation Sent" },
  { value: "negotiation", label: "Negotiation" },

  { value: "on_hold", label: "On Hold" },
  { value: "payment_pending", label: "Payment Pending" },

  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "junk", label: "Junk" },
  { value: "duplicate", label: "Duplicate" },
];

// ============================================================
// HELPERS
// ============================================================

const getInitials = (name = "") => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "L";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const formatDate = (date) => {
  if (!date) return "-";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "-";

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTimeAgo = (date) => {
  if (!date) return "-";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "-";

  const diff = Date.now() - value.getTime();

  if (diff < 0) return formatDate(date);

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";

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
  if (!source) return "-";

  return String(source)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getTagName = (tag) => {
  if (!tag) return "-";

  if (typeof tag === "string") return tag;

  return tag?.name || tag?.title || tag?.label || "-";
};

const getAssignedName = (assignedTo) => {
  if (!assignedTo) return "Not Assigned";

  if (typeof assignedTo === "string") return assignedTo;

  return assignedTo?.name || assignedTo?.email || "Assigned";
};

const isAssigned = (lead) => Boolean(lead?.assignedTo);

const getStatusLabel = (status) => {
  return (
    STATUS_OPTIONS.find((item) => item.value === status)?.label ||
    getSourceLabel(status) ||
    "New"
  );
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

// ============================================================
// STATUS COLORS
// ============================================================

const getStatusClass = (status) => {
  const classes = {
    new: "border-blue-200 bg-blue-50 text-blue-700",
    attempted: "border-cyan-200 bg-cyan-50 text-cyan-700",
    contacted: "border-slate-200 bg-slate-50 text-slate-600",
    interested: "border-pink-200 bg-pink-50 text-pink-700",
    qualified: "border-violet-200 bg-violet-50 text-violet-700",
    unqualified: "border-gray-200 bg-gray-50 text-gray-600",

    demo_requested: "border-purple-200 bg-purple-50 text-purple-700",
    demo_scheduled: "border-indigo-200 bg-indigo-50 text-indigo-700",
    demo_completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    demo_rescheduled: "border-amber-200 bg-amber-50 text-amber-700",
    demo_no_show: "border-red-200 bg-red-50 text-red-600",

    appointment_scheduled: "border-indigo-200 bg-indigo-50 text-indigo-700",
    appointment_completed: "border-green-200 bg-green-50 text-green-700",

    follow_up: "border-amber-200 bg-amber-50 text-amber-700",
    awaiting_response: "border-yellow-200 bg-yellow-50 text-yellow-700",

    proposal_sent: "border-indigo-200 bg-indigo-50 text-indigo-700",
    quotation_sent: "border-sky-200 bg-sky-50 text-sky-700",
    negotiation: "border-orange-200 bg-orange-50 text-orange-700",

    on_hold: "border-gray-200 bg-gray-100 text-gray-600",
    payment_pending: "border-amber-200 bg-amber-50 text-amber-700",

    won: "border-emerald-200 bg-emerald-50 text-emerald-700",
    lost: "border-red-200 bg-red-50 text-red-600",
    junk: "border-slate-200 bg-slate-100 text-slate-500",
    duplicate: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return classes[status] || "border-slate-200 bg-slate-50 text-slate-600";
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const Lead = () => {
  const navigate = useNavigate();

  // ============================================================
  // LEAD DRAWER STATES
  // ============================================================

  const [leadDrawerOpen, setLeadDrawerOpen] = useState(false);
  const [leadDrawerMode, setLeadDrawerMode] = useState("schedule");

  const [demoScheduleLead, setDemoScheduleLead] = useState(null);
  const [demoScheduleStatus, setDemoScheduleStatus] =
    useState("demo_scheduled");

  const [demoSaving, setDemoSaving] = useState(false);

  // ============================================================
  // MAIN STATES
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

  const [selectedIds, setSelectedIds] = useState([]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  // ============================================================
  // THEME
  // ============================================================

  const themeStyles = `
    .lead-page {
      min-height: 100vh;
      background: var(--app-bg, #f8fafc);
      color: var(--app-heading, #111827);
    }

    .lead-page .mt-card {
      background: var(--app-surface, #ffffff);
      border-color: var(--app-border, #e5e7eb);
      color: var(--app-heading, #111827);
    }

    .lead-page .mt-heading {
      color: var(--app-heading, #111827);
    }

    .lead-page .mt-muted {
      color: var(--app-muted, #6b7280);
    }

    .lead-page .mt-primary {
      color: var(--theme-primary, #4f46e5);
    }

    .lead-page .mt-primary-bg {
      background: var(--theme-primary, #4f46e5);
      color: #ffffff;
    }

    .lead-page .mt-primary-bg:hover {
      filter: brightness(.94);
    }

    .lead-page .mt-primary-soft {
      background: var(--theme-primary-soft, #eef2ff);
      color: var(--theme-primary, #4f46e5);
      border-color: var(--theme-primary-border, #c7d2fe);
    }

    .lead-page .mt-input {
      background: var(--app-surface, #ffffff);
      color: var(--app-heading, #111827);
      border: 1px solid var(--app-border, #e5e7eb);
    }

    .lead-page .mt-input:focus {
      border-color: var(--theme-primary, #4f46e5);
      box-shadow: 0 0 0 3px var(--theme-primary-soft, #eef2ff);
      outline: none;
    }

    .lead-page .mt-input::placeholder {
      color: var(--app-muted, #9ca3af);
    }

    .lead-page .mt-hover:hover {
      background: var(--app-hover, #f3f4f6);
    }

    .lead-page .mt-subtle {
      background: var(--app-hover, #f9fafb);
      border-color: var(--app-border, #e5e7eb);
    }

    .lead-page .mt-divider {
      border-color: var(--app-border, #e5e7eb);
    }

    .lead-page .lead-table th {
      background: var(--app-hover, #f9fafb);
      color: var(--app-muted, #6b7280);
    }

    .lead-page .lead-table tbody tr {
      border-color: var(--app-border, #e5e7eb);
    }

    .lead-page .lead-table tbody tr:hover {
      background: var(--app-hover, #f9fafb);
    }

    .lead-page .lead-table tbody tr.selected-row {
      background: var(--theme-primary-soft, #eef2ff);
    }

    .lead-page .lead-checkbox {
      accent-color: var(--theme-primary, #4f46e5);
    }

    .lead-page .lead-dropdown {
      background: var(--app-surface, #ffffff);
      border-color: var(--app-border, #e5e7eb);
      color: var(--app-heading, #111827);
      box-shadow: 0 12px 30px rgba(0,0,0,.10);
    }

    .lead-page .lead-pagination-active {
      background: var(--theme-primary, #4f46e5);
      color: #ffffff;
    }

    .lead-page .lead-avatar {
      background: var(--theme-primary-soft, #eef2ff);
      color: var(--theme-primary, #4f46e5);
    }

    .lead-page button:disabled {
      cursor: not-allowed;
    }
  `;

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

      setLeads(Array.isArray(result?.data) ? result.data : []);

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

      setError(getErrorMessage(err, "Failed to load leads."));
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
  // FILTERS
  // ============================================================

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setSubmittedSearch("");
    setStatusFilter("");
    setPage(1);
    setFiltersOpen(false);
  };

  const hasFilters = Boolean(search || submittedSearch || statusFilter);

  // ============================================================
  // SELECTION
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

  const toggleSelectLead = (id) => {
    if (!id) return;

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
  // OPEN DEMO SCHEDULE DRAWER
  // ============================================================

  const openDemoScheduleDrawer = (lead, status) => {
    setDemoScheduleLead(lead);
    setDemoScheduleStatus(status);
    setLeadDrawerMode("schedule");
    setLeadDrawerOpen(true);
  };

  // ============================================================
  // SAVE DEMO SCHEDULE
  // ============================================================

  const handleDemoScheduleSave = async ({ status, nextFollowUpAt, note }) => {
    if (!demoScheduleLead?._id) return;

    try {
      setDemoSaving(true);
      setError("");

      // Complete API payload
      const data = {
        status: status,
        nextFollowUpAt: nextFollowUpAt,
        note: note,
      };

      console.log("Demo Schedule Payload:", data);

      const response = await crmApi.updateLeadStatus(
        demoScheduleLead._id,
        data,
      );

      const updatedLead = response?.data?.data;

      // Update table
      setLeads((previous) =>
        previous.map((item) =>
          item._id === demoScheduleLead._id
            ? {
                ...item,
                ...(updatedLead || {}),
                status,
                nextFollowUpAt,
              }
            : item,
        ),
      );

      // Update selected lead
      setSelectedLead((previous) =>
        previous?._id === demoScheduleLead._id
          ? {
              ...previous,
              ...(updatedLead || {}),
              status,
              nextFollowUpAt,
            }
          : previous,
      );

      setLeadDrawerOpen(false);
      setDemoScheduleLead(null);

      // Refresh current page from backend
      await fetchLeads();
    } catch (err) {
      console.error("Demo schedule error:", err);

      setError(getErrorMessage(err, "Failed to schedule demo."));
    } finally {
      setDemoSaving(false);
    }
  };

  // ============================================================
  // STATUS UPDATE
  // ============================================================

  const handleStatusChange = async (lead, newStatus) => {
    if (!lead?._id || !newStatus || newStatus === lead.status) {
      return;
    }

    // Demo scheduling requires date and time
    if (["demo_scheduled", "demo_rescheduled"].includes(newStatus)) {
      openDemoScheduleDrawer(lead, newStatus);
      return;
    }

    try {
      setError("");
      setUpdatingStatus(lead._id);

      const data = {
        status: newStatus,
      };

      await crmApi.updateLeadStatus(lead._id, data);

      setLeads((current) =>
        current.map((item) =>
          item._id === lead._id ? { ...item, status: newStatus } : item,
        ),
      );

      setSelectedLead((current) => {
        if (!current || current._id !== lead._id) return current;

        return {
          ...current,
          status: newStatus,
        };
      });
    } catch (err) {
      console.error("Update lead status error:", err);

      setError(getErrorMessage(err, "Failed to update lead status."));
    } finally {
      setUpdatingStatus("");
    }
  };

  // ============================================================
  // LEAD DETAILS DRAWER
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
    if (!lead?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${lead.name}"?`,
    );

    if (!confirmed) return;

    try {
      setDeleting(lead._id);
      setError("");

      await crmApi.deleteLead(lead._id);

      setSelectedIds((current) => current.filter((id) => id !== lead._id));

      if (selectedLead?._id === lead._id) {
        handleCloseDrawer();
      }

      if (leads.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        await fetchLeads();
      }
    } catch (err) {
      console.error("Delete lead error:", err);

      setError(getErrorMessage(err, "Failed to delete lead."));
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
    if (!leads.length) return;

    const headers = [
      "Name",
      "Phone",
      "Email",
      "Created",
      "Source",
      "Tag",
      "Assigned To",
      "Status",
    ];

    const rows = leads.map((lead) => [
      lead.name || "",
      `${lead.phoneCountryCode || "+91"}${lead.phone || ""}`,
      lead.email || "",
      lead.createdAt ? formatDate(lead.createdAt) : "",
      getSourceLabel(lead.source),
      getTagName(lead.tag),
      getAssignedName(lead.assignedTo),
      getStatusLabel(lead.status),
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
  // CHECKBOX
  // ============================================================

  const renderCheckbox = (checked, onClick, label = "Select") => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-4 w-4 items-center justify-center rounded border transition ${
        checked
          ? "border-transparent mt-primary-bg"
          : "mt-card mt-divider hover:mt-primary"
      }`}
    >
      {checked && <Check size={11} />}
    </button>
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="lead-page">
      <style>{themeStyles}</style>

      {/* HEADER */}

      <header className="mt-card border-b mt-divider">
        <div className="px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] mt-muted">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1.5 rounded px-1 py-1 transition mt-hover"
                >
                  <ArrowLeft size={13} />
                  Back
                </button>

                <span>/</span>
                <span>CRM</span>
                <span>/</span>

                <span className="mt-primary font-medium">Contacts</span>

                <span className="rounded-full mt-subtle border px-2 py-0.5 text-[10px] font-semibold">
                  {total}
                </span>
              </div>

              <div className="mt-3">
                <h1 className="text-xl font-bold tracking-tight mt-heading">
                  Contacts
                </h1>

                <p className="mt-1 text-xs mt-muted">
                  Manage your leads, track follow-ups and organize customer
                  relationships.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedIds.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleAssign}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border mt-divider mt-card px-3 text-xs font-semibold mt-muted transition mt-hover"
                  >
                    <UsersRound size={14} />
                    Assign ({selectedIds.length})
                  </button>

                  <button
                    type="button"
                    onClick={handleAssignTag}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border mt-divider mt-card px-3 text-xs font-semibold mt-muted transition mt-hover"
                  >
                    <Tag size={14} />
                    Tag
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={fetchLeads}
                disabled={loading}
                title="Refresh"
                className="inline-flex h-9 items-center gap-2 rounded-lg border mt-divider mt-card px-3 text-xs font-semibold mt-muted transition mt-hover disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}

                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => setImportDrawerOpen(true)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border mt-divider mt-card px-3 text-xs font-semibold mt-heading transition mt-hover"
              >
                <Upload size={14} />
                Import
              </button>

              <button
                type="button"
                onClick={handleExport}
                disabled={!leads.length}
                className="inline-flex h-9 items-center gap-2 rounded-lg border mt-divider mt-card px-3 text-xs font-semibold mt-heading transition mt-hover disabled:opacity-40"
              >
                <Download size={14} />
                Export
              </button>

              <button
                type="button"
                onClick={() => navigate("/crm/leads/create")}
                className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold mt-primary-bg transition"
              >
                <Plus size={15} />
                Add Lead
              </button>

              <button
                type="button"
                onClick={() => {
                  setLeadDrawerMode("calendar");
                  setLeadDrawerOpen(true);
                }}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <CalendarDays size={15} />
                Scheduled Demos
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <main className="space-y-4 px-5 py-5">
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-red-800">
                Something went wrong
              </p>

              <p className="mt-1 break-words text-xs text-red-600">{error}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={fetchLeads}
                className="text-xs font-semibold text-red-700 underline"
              >
                Retry
              </button>

              <button
                type="button"
                onClick={() => setError("")}
                className="rounded p-1 text-red-600 hover:bg-red-100"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* LEADS TABLE */}

        <section className="mt-card overflow-visible rounded-xl border shadow-sm">
          {/* TOOLBAR */}

          <div className="flex flex-col gap-3 border-b mt-divider p-4 xl:flex-row xl:items-center">
            <div className="flex w-full gap-2 xl:max-w-md">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 mt-muted"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search name, phone or email..."
                  className="mt-input h-10 w-full rounded-lg pl-9 pr-3 text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold mt-primary-bg transition"
              >
                <Search size={14} />
                Search
              </button>
            </div>

            <div className="flex-1" />

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFiltersOpen((value) => !value)}
                  className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
                    filtersOpen || statusFilter
                      ? "mt-primary-soft"
                      : "mt-divider mt-card mt-muted mt-hover"
                  }`}
                >
                  <Filter size={14} />
                  Filters
                  {statusFilter && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold mt-primary-bg">
                      1
                    </span>
                  )}
                  <ChevronDown
                    size={13}
                    className={`transition ${filtersOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {filtersOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close filter panel"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setFiltersOpen(false)}
                    />

                    <div className="lead-dropdown absolute right-0 top-11 z-50 w-[260px] rounded-xl border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xs font-bold mt-heading">
                          Filter Contacts
                        </h3>

                        <button
                          type="button"
                          onClick={() => setFiltersOpen(false)}
                          className="rounded-md p-1 mt-muted transition mt-hover"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider mt-muted">
                        Lead Status
                      </label>

                      <div className="relative">
                        <select
                          value={statusFilter}
                          onChange={(event) =>
                            handleStatusFilter(event.target.value)
                          }
                          className="mt-input h-10 w-full appearance-none rounded-lg px-3 pr-9 text-xs"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option
                              key={option.value || "all"}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={14}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 mt-muted"
                        />
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={handleReset}
                          className="h-9 flex-1 rounded-lg border mt-divider text-xs font-semibold mt-heading transition mt-hover"
                        >
                          Reset
                        </button>

                        <button
                          type="button"
                          onClick={() => setFiltersOpen(false)}
                          className="h-9 flex-1 rounded-lg text-xs font-semibold mt-primary-bg"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold mt-primary transition mt-hover"
                >
                  <X size={13} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ACTIVE FILTER */}

          {statusFilter && (
            <div className="flex flex-wrap items-center gap-2 border-b mt-divider px-4 py-3">
              <span className="text-[10px] font-semibold mt-muted">
                Active filter:
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-semibold mt-primary-soft">
                Status: {getStatusLabel(statusFilter)}
                <button
                  type="button"
                  onClick={() => handleStatusFilter("")}
                  className="rounded-full"
                  aria-label="Remove status filter"
                >
                  <X size={11} />
                </button>
              </span>
            </div>
          )}

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table className="lead-table w-full min-w-[1350px] border-collapse">
              <thead>
                <tr className="border-b mt-divider">
                  <th className="w-12 px-4 py-3 text-left">
                    {renderCheckbox(
                      allCurrentSelected,
                      toggleSelectAll,
                      "Select all leads",
                    )}
                  </th>

                  <th className="px-3 py-3 text-left">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <UserRound size={13} />
                      Name
                    </div>
                  </th>

                  <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                    Phone
                  </th>

                  <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-3 py-3 text-left">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <CalendarDays size={13} />
                      Created
                    </div>
                  </th>

                  <th className="px-3 py-3 text-left">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <Share2 size={13} />
                      Source
                    </div>
                  </th>

                  <th className="px-3 py-3 text-left">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <Tag size={13} />
                      Tags
                    </div>
                  </th>

                  <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                    Remarks
                  </th>

                  <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                    Opt In
                  </th>

                  <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                    Assigned
                  </th>

                  <th className="px-3 py-3 text-left">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <UsersRound size={13} />
                      Assigned To
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index} className="border-b mt-divider">
                      <td className="px-4 py-4">
                        <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                      </td>

                      {Array.from({ length: 10 }).map((_, columnIndex) => (
                        <td key={columnIndex} className="px-3 py-4">
                          <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200/70" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-20 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl mt-primary-soft">
                        <UsersRound size={24} />
                      </div>

                      <h3 className="mt-4 text-sm font-bold mt-heading">
                        No contacts found
                      </h3>

                      <p className="mt-2 text-xs mt-muted">
                        {hasFilters
                          ? "Try changing your search or filters."
                          : "Create your first lead to get started."}
                      </p>

                      {hasFilters ? (
                        <button
                          type="button"
                          onClick={handleReset}
                          className="mt-4 h-9 rounded-lg border mt-divider px-4 text-xs font-semibold mt-heading transition mt-hover"
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate("/crm/leads/create")}
                          className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-semibold mt-primary-bg"
                        >
                          <Plus size={14} />
                          Add Lead
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const selected = selectedIds.includes(lead._id);

                    return (
                      <tr
                        key={lead._id}
                        className={`border-b transition ${
                          selected ? "selected-row" : ""
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          {renderCheckbox(
                            selected,
                            () => toggleSelectLead(lead._id),
                            `Select ${lead.name || "lead"}`,
                          )}
                        </td>

                        <td className="px-3 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleOpenLead(lead)}
                            className="flex max-w-[240px] items-center gap-2.5 text-left"
                          >
                            <span className="lead-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold">
                              {getInitials(lead.name)}
                            </span>

                            <span className="min-w-0">
                              <span className="block truncate text-xs font-bold mt-heading transition hover:mt-primary">
                                {lead.name || "Unnamed"}
                              </span>

                              {lead.email && (
                                <span className="mt-1 block max-w-[180px] truncate text-[10px] mt-muted">
                                  {lead.email}
                                </span>
                              )}
                            </span>
                          </button>
                        </td>

                        <td className="px-3 py-3.5">
                          <span className="whitespace-nowrap text-xs mt-heading">
                            {lead.phone ? (
                              <>
                                {lead.phoneCountryCode || "+91"} {lead.phone}
                              </>
                            ) : (
                              <span className="mt-muted">-</span>
                            )}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-3 py-3.5">
                          <div className="relative w-fit">
                            <select
                              value={lead.status || "new"}
                              disabled={
                                updatingStatus === lead._id ||
                                (demoSaving &&
                                  demoScheduleLead?._id === lead._id)
                              }
                              onChange={(event) =>
                                handleStatusChange(lead, event.target.value)
                              }
                              title={getStatusLabel(lead.status)}
                              className={`h-7 max-w-[190px] appearance-none rounded-full border py-0 pl-2.5 pr-7 text-[10px] font-semibold outline-none transition ${getStatusClass(
                                lead.status,
                              )} ${
                                updatingStatus === lead._id
                                  ? "cursor-wait opacity-60"
                                  : "cursor-pointer"
                              }`}
                            >
                              {STATUS_OPTIONS.filter((item) => item.value).map(
                                (option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ),
                              )}
                            </select>

                            <ChevronDown
                              size={11}
                              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-50"
                            />
                          </div>

                          {lead.googleMeetLink && (
                            <a
                              href={lead.googleMeetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 mt-1"
                            >
                              <ExternalLink size={12} />
                              Google Meet
                            </a>
                          )}
                        </td>

                        <td className="px-3 py-3.5">
                          <span className="block whitespace-nowrap text-xs mt-heading">
                            {formatTimeAgo(lead.createdAt)}
                          </span>

                          <span className="mt-1 block text-[10px] mt-muted">
                            {formatDate(lead.createdAt)}
                          </span>
                        </td>

                        <td className="px-3 py-3.5">
                          <span className="inline-flex rounded-md border mt-divider mt-subtle px-2.5 py-1 text-[10px] font-semibold mt-heading">
                            {getSourceLabel(lead.source)}
                          </span>
                        </td>

                        <td className="px-3 py-3.5">
                          {lead.tag ? (
                            <span className="inline-flex max-w-[150px] items-center gap-1.5 text-xs mt-heading">
                              <Tag size={13} className="shrink-0 mt-muted" />

                              <span className="truncate">
                                {getTagName(lead.tag)}
                              </span>
                            </span>
                          ) : (
                            <span className="text-xs mt-muted">-</span>
                          )}
                        </td>

                        <td className="px-3 py-3.5">
                          <span className="block max-w-[200px] truncate text-xs mt-muted">
                            {lead.message || lead.subject || "-"}
                          </span>
                        </td>

                        <td className="px-3 py-3.5">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                              lead.optIn === false
                                ? "border-slate-200 bg-slate-50 text-slate-500"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {lead.optIn === false ? "No" : "Yes"}
                          </span>
                        </td>

                        <td className="px-3 py-3.5">
                          <span className="whitespace-nowrap text-xs mt-muted">
                            {lead.assignedAt
                              ? formatTimeAgo(lead.assignedAt)
                              : "-"}
                          </span>
                        </td>

                        <td className="px-3 py-3.5">
                          {isAssigned(lead) ? (
                            <span className="inline-flex max-w-[160px] items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />

                              <span className="truncate">
                                {getAssignedName(lead.assignedTo)}
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              Not Assigned
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          {!loading && leads.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t mt-divider px-4 py-3">
              <div className="text-[10px] mt-muted">
                {selectedIds.length > 0 ? (
                  <>
                    <span className="font-bold mt-heading">
                      {selectedIds.length}
                    </span>{" "}
                    leads selected
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="ml-2 font-semibold mt-primary"
                    >
                      Clear selection
                    </button>
                  </>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold mt-heading">
                      {startItem}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold mt-heading">{endItem}</span>{" "}
                    of <span className="font-semibold mt-heading">{total}</span>{" "}
                    contacts
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  disabled={!canPrevious}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border mt-divider mt-card text-xs mt-muted transition mt-hover disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                </button>

                {pageNumbers.map((number, index) =>
                  number === "..." ? (
                    <span
                      key={`dots-${index}`}
                      className="flex h-8 w-7 items-center justify-center text-xs mt-muted"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={number}
                      type="button"
                      onClick={() => setPage(number)}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[10px] font-bold transition ${
                        currentPage === number
                          ? "lead-pagination-active"
                          : "mt-heading mt-hover"
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
                  className="flex h-8 w-8 items-center justify-center rounded-lg border mt-divider mt-card text-xs mt-muted transition mt-hover disabled:opacity-30"
                >
                  <ChevronRight size={14} />
                </button>

                <select
                  value={limit}
                  onChange={(event) => {
                    setLimit(Number(event.target.value));
                    setPage(1);
                    clearSelection();
                  }}
                  className="mt-input ml-2 h-8 rounded-lg px-2 text-[10px] font-semibold"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </div>
            </div>
          )}

          {!loading && leads.length === 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t mt-divider px-4 py-3">
              <p className="text-[10px] mt-muted">{total} total contacts</p>

              <button
                type="button"
                onClick={fetchLeads}
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold mt-primary"
              >
                <RefreshCw size={12} />
                Refresh list
              </button>
            </div>
          )}
        </section>
      </main>

      {/* DEMO SCHEDULE / CALENDAR DRAWER */}

      <LeadDrawer
        open={leadDrawerOpen}
        mode={leadDrawerMode}
        lead={demoScheduleLead}
        leads={leads}
        status={demoScheduleStatus}
        saving={demoSaving}
        onClose={() => {
          setLeadDrawerOpen(false);
          setDemoScheduleLead(null);
        }}
        onSave={handleDemoScheduleSave}
        onSelectLead={(lead) => {
          setLeadDrawerOpen(false);
          handleOpenLead(lead);
        }}
      />

      {/* LEAD DETAILS DRAWER */}

      <LeadDetailsDrawer
        lead={selectedLead}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onDelete={handleDelete}
        deleting={deleting}
      />

      {/* IMPORT DRAWER */}

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
