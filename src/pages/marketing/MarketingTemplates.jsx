import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Eye,
  Copy,
  Pencil,
  Trash2,
  MessageSquare,
  Mail,
  Smartphone,
  Bell,
  LayoutTemplate,
  X,
  ChevronDown,
  CheckCircle2,
  Clock3,
  Archive,
  FileText,
  SlidersHorizontal,
  Upload,
  RefreshCcw,
  Power,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import marketingTemplateApi from "../../api/marketingTemplate.api";

/* =========================================================
   CHANNEL CONFIG
========================================================= */

const CHANNEL_CONFIG = {
  whatsapp: {
    label: "WhatsApp",
    icon: MessageSquare,
  },
  email: {
    label: "Email",
    icon: Mail,
  },
  sms: {
    label: "SMS",
    icon: Smartphone,
  },
  notification: {
    label: "Notification",
    icon: Bell,
  },
};

/* =========================================================
   HELPERS
========================================================= */

const getChannelConfig = (channel) => {
  const key = String(channel || "")
    .toLowerCase()
    .trim();

  return (
    CHANNEL_CONFIG[key] || {
      label: channel || "Unknown",
      icon: LayoutTemplate,
    }
  );
};

const getStatusConfig = (status) => {
  const value = String(status || "draft").toLowerCase();

  if (value === "active" || value === "approved") {
    return {
      label: value === "approved" ? "Approved" : "Active",
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
      dotClass: "bg-emerald-500",
      icon: CheckCircle2,
    };
  }

  if (value === "pending") {
    return {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-100",
      dotClass: "bg-amber-500",
      icon: Clock3,
    };
  }

  if (value === "inactive") {
    return {
      label: "Inactive",
      className: "bg-amber-50 text-amber-700 border-amber-100",
      dotClass: "bg-amber-500",
      icon: Clock3,
    };
  }

  if (value === "archived") {
    return {
      label: "Archived",
      className: "bg-gray-100 text-gray-600 border-gray-200",
      dotClass: "bg-gray-400",
      icon: Archive,
    };
  }

  return {
    label: "Draft",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    dotClass: "bg-gray-400",
    icon: FileText,
  };
};

/* =========================================================
   NORMALIZE API RESPONSE
========================================================= */

const normalizeTemplatesResponse = (response) => {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.templates)) return payload.templates;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.templates)) return payload.data.templates;

  return [];
};

/* =========================================================
   NORMALIZE TEMPLATE
========================================================= */

const normalizeTemplate = (template) => {
  const whatsappData = template?.whatsapp || {};

  const channel =
    template?.channel || template?.platform || template?.type || "notification";

  const components = whatsappData?.components || template?.components || [];

  const bodyComponent = Array.isArray(components)
    ? components.find((item) => item.type === "BODY")
    : null;

  return {
    ...template,

    id:
      template?._id ||
      template?.id ||
      template?.templateId ||
      whatsappData?.templateId,

    name:
      template?.name ||
      template?.title ||
      whatsappData?.name ||
      "Untitled Template",

    description: template?.description || "",

    category: template?.category || whatsappData?.category || "marketing",

    channel,

    status: template?.status || whatsappData?.status || "draft",

    language: template?.language || whatsappData?.language || "en",

    usage: Number(
      template?.usage ??
        template?.usageCount ??
        template?.usedCount ??
        template?.stats?.usage ??
        0,
    ),

    content:
      template?.content ||
      template?.body ||
      template?.email?.content ||
      template?.sms?.message ||
      template?.notification?.message ||
      bodyComponent?.text ||
      "",
  };
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

/* =========================================================
   MAIN COMPONENT
========================================================= */

const MarketingTemplates = () => {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [channel, setChannel] = useState("All Channels");
  const [statusTab, setStatusTab] = useState("all");

  const [openMenu, setOpenMenu] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  /* =======================================================
     FETCH TEMPLATES
  ======================================================= */

  const fetchTemplates = async (showLoader = false) => {
    try {
      setError("");

      if (showLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await marketingTemplateApi.getTemplates();

      const list = normalizeTemplatesResponse(response).map(normalizeTemplate);

      setTemplates(list);
    } catch (err) {
      console.error("Failed to fetch templates:", err);

      setError(getErrorMessage(err, "Failed to load templates."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  /* =======================================================
     IMPORT WHATSAPP TEMPLATES
  ======================================================= */

  const handleImportWhatsApp = async () => {
    try {
      setImporting(true);
      setError("");
      setSuccess("");

      const response = await marketingTemplateApi.importWhatsAppTemplates();

      await fetchTemplates(true);

      setSuccess(
        response?.message || "WhatsApp templates imported successfully.",
      );
    } catch (err) {
      console.error("WhatsApp import failed:", err);

      setError(getErrorMessage(err, "WhatsApp template import failed."));
    } finally {
      setImporting(false);
    }
  };

  /* =======================================================
     SYNC WHATSAPP TEMPLATES
  ======================================================= */

  const handleSyncWhatsApp = async () => {
    try {
      setSyncing(true);
      setError("");
      setSuccess("");

      const response = await marketingTemplateApi.syncWhatsAppTemplates();

      await fetchTemplates(true);

      setSuccess(
        response?.message || "WhatsApp templates synced successfully.",
      );
    } catch (err) {
      console.error("WhatsApp sync failed:", err);

      setError(getErrorMessage(err, "WhatsApp template sync failed."));
    } finally {
      setSyncing(false);
    }
  };

  /* =======================================================
     DYNAMIC FILTERS
  ======================================================= */

  const categories = useMemo(() => {
    const values = templates
      .map((item) => item.category)
      .filter(Boolean)
      .map(String);

    return ["All Categories", ...Array.from(new Set(values))];
  }, [templates]);

  const channels = useMemo(() => {
    const values = templates
      .map((item) => item.channel)
      .filter(Boolean)
      .map(String);

    return ["All Channels", ...Array.from(new Set(values))];
  }, [templates]);

  /* =======================================================
     FILTER TEMPLATES
  ======================================================= */

  const filteredTemplates = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return templates.filter((template) => {
      const matchesSearch =
        !searchValue ||
        String(template.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(template.description || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(template.category || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(template.channel || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        category === "All Categories" || String(template.category) === category;

      const matchesChannel =
        channel === "All Channels" || String(template.channel) === channel;

      const templateStatus = String(template.status || "draft").toLowerCase();

      let matchesStatus = true;

      if (statusTab === "active") {
        matchesStatus =
          templateStatus === "active" || templateStatus === "approved";
      }

      if (statusTab === "draft") {
        matchesStatus =
          templateStatus === "draft" || templateStatus === "pending";
      }

      if (statusTab === "archived") {
        matchesStatus = templateStatus === "archived";
      }

      return (
        matchesSearch && matchesCategory && matchesChannel && matchesStatus
      );
    });
  }, [templates, search, category, channel, statusTab]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    return {
      total: templates.length,

      active: templates.filter((item) =>
        ["active", "approved"].includes(String(item.status).toLowerCase()),
      ).length,

      drafts: templates.filter((item) =>
        ["draft", "pending"].includes(String(item.status).toLowerCase()),
      ).length,

      archived: templates.filter(
        (item) => String(item.status).toLowerCase() === "archived",
      ).length,
    };
  }, [templates]);

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleCreate = () => {
    navigate("/marketing/templates/create");
  };

  const handleEdit = (template) => {
    if (!template?.id) return;

    setOpenMenu(null);

    navigate(`/marketing/templates/${template.id}/edit`);
  };

  const handleUseTemplate = (template) => {
    if (!template?.id) return;

    navigate(
      `/marketing/templates/create?template=${encodeURIComponent(template.id)}`,
    );
  };

  const handleDuplicate = async (template) => {
    if (!template?.id) return;

    try {
      setActionLoading(template.id);
      setOpenMenu(null);
      setError("");
      setSuccess("");

      await marketingTemplateApi.duplicateTemplate(template.id);

      await fetchTemplates(true);

      setSuccess("Template duplicated successfully.");
    } catch (err) {
      console.error("Duplicate failed:", err);

      setError(getErrorMessage(err, "Failed to duplicate template."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (template) => {
    if (!template?.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${template.name}"?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(template.id);
      setOpenMenu(null);
      setError("");

      await marketingTemplateApi.deleteTemplate(template.id);

      setTemplates((previous) =>
        previous.filter((item) => item.id !== template.id),
      );

      if (previewTemplate?.id === template.id) {
        setPreviewTemplate(null);
      }

      setSuccess("Template deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err);

      setError(getErrorMessage(err, "Failed to delete template."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (template) => {
    if (!template?.id) return;

    try {
      setActionLoading(template.id);
      setOpenMenu(null);
      setError("");

      await marketingTemplateApi.toggleTemplateStatus(template.id);

      await fetchTemplates(true);

      setSuccess("Template status updated successfully.");
    } catch (err) {
      console.error("Status update failed:", err);

      setError(getErrorMessage(err, "Failed to update template status."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (template) => {
    if (!template?.id) return;

    try {
      setActionLoading(template.id);
      setOpenMenu(null);
      setError("");

      await marketingTemplateApi.restoreTemplate(template.id);

      await fetchTemplates(true);

      setSuccess("Template restored successfully.");
    } catch (err) {
      console.error("Restore failed:", err);

      setError(getErrorMessage(err, "Failed to restore template."));
    } finally {
      setActionLoading(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setChannel("All Channels");
    setStatusTab("all");
  };

  const hasFilters =
    Boolean(search) ||
    category !== "All Categories" ||
    channel !== "All Channels" ||
    statusTab !== "all";

  /* =======================================================
     THEME STYLES
  ======================================================= */

  const themeStyles = `
    .marketing-templates {
      background: var(--app-bg, #f8fafc);
      color: var(--app-heading, #111827);
      min-height: 100vh;
    }

    .marketing-templates .mt-card {
      background: var(--app-surface, #ffffff);
      border-color: var(--app-border, #e5e7eb);
      color: var(--app-heading, #111827);
    }

    .marketing-templates .mt-heading {
      color: var(--app-heading, #111827);
    }

    .marketing-templates .mt-muted {
      color: var(--app-muted, #6b7280);
    }

    .marketing-templates .mt-primary {
      color: var(--theme-primary, #4f46e5);
    }

    .marketing-templates .mt-primary-bg {
      background: var(--theme-primary, #4f46e5);
      color: #ffffff;
    }

    .marketing-templates .mt-primary-bg:hover {
      filter: brightness(.94);
    }

    .marketing-templates .mt-primary-soft {
      background: var(--theme-primary-soft, #eef2ff);
      color: var(--theme-primary, #4f46e5);
      border-color: var(--theme-primary-border, #c7d2fe);
    }

    .marketing-templates .mt-input {
      background: var(--app-surface, #ffffff);
      color: var(--app-heading, #111827);
      border: 1px solid var(--app-border, #e5e7eb);
    }

    .marketing-templates .mt-input:focus {
      border-color: var(--theme-primary, #4f46e5);
      box-shadow: 0 0 0 3px var(--theme-primary-soft, #eef2ff);
      outline: none;
    }

    .marketing-templates .mt-input::placeholder {
      color: var(--app-muted, #9ca3af);
    }

    .marketing-templates .mt-hover:hover {
      background: var(--app-hover, #f3f4f6);
    }

    .marketing-templates .mt-subtle {
      background: var(--app-hover, #f9fafb);
      border-color: var(--app-border, #e5e7eb);
    }

    .marketing-templates .mt-divider {
      border-color: var(--app-border, #e5e7eb);
    }

    .marketing-templates .mt-channel {
      background: var(--theme-primary-soft, #eef2ff);
      color: var(--theme-primary, #4f46e5);
      border: 1px solid var(--theme-primary-border, #c7d2fe);
    }

    .marketing-templates .mt-segment {
      background: var(--app-hover, #f3f4f6);
    }

    .marketing-templates .mt-segment-active {
      background: var(--app-surface, #ffffff);
      color: var(--theme-primary, #4f46e5);
      box-shadow: 0 1px 3px rgba(0,0,0,.08);
    }

    .marketing-templates .mt-focus:focus-visible {
      outline: 2px solid var(--theme-primary, #4f46e5);
      outline-offset: 2px;
    }
  `;

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <div className="marketing-templates min-h-screen">
        <style>{themeStyles}</style>

        <div className="border-b mt-divider px-5 py-4">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-7 w-56 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-gray-200" />
        </div>

        <div className="px-5 py-4">
          <div className="h-10 animate-pulse rounded-lg bg-gray-200/60" />

          <div className="mt-4 overflow-hidden rounded-xl border mt-divider">
            <div className="h-11 bg-gray-200/50" />

            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-[76px] border-t mt-divider" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="marketing-templates">
      <style>{themeStyles}</style>

      {/* HEADER */}

      <header className="border-b mt-divider mt-card">
        <div className="px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] mt-muted">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1.5 transition mt-hover rounded px-1 py-1"
                >
                  <ArrowLeft size={13} />
                  Back
                </button>

                <span>/</span>
                <span>Marketing</span>
                <span>/</span>

                <span className="mt-primary font-medium">Templates</span>
              </div>

              <div className="mt-3">
                <h1 className="text-xl font-bold tracking-tight mt-heading">
                  Marketing Templates
                </h1>

                <p className="mt-1 text-xs mt-muted">
                  Create, manage and synchronize your marketing message
                  templates.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fetchTemplates(true)}
                disabled={refreshing}
                className="inline-flex h-9 items-center gap-2 rounded-lg border mt-divider mt-card px-3 text-xs font-semibold mt-muted transition mt-hover disabled:opacity-50"
              >
                {refreshing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Refresh
              </button>

              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold mt-primary-bg transition"
              >
                <Plus size={15} />
                Create Template
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <main className="space-y-4 px-5 py-5">
        {/* ALERTS */}

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-red-800">
                Something went wrong
              </p>
              <p className="mt-1 break-words text-xs text-red-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded p-1 text-red-600 hover:bg-red-100"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
              <CheckCircle2 size={15} />
              {success}
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="rounded p-1 text-emerald-600 hover:bg-emerald-100"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* STATISTICS */}


        {/* WHATSAPP ACTIONS */}

        <section className="mt-card overflow-hidden rounded-xl border shadow-sm">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl mt-channel">
                <MessageSquare size={21} />
              </div>

              <div>
                <h3 className="text-sm font-bold mt-heading">
                  WhatsApp Template Management
                </h3>

                <p className="mt-1 max-w-xl text-xs leading-5 mt-muted">
                  Import templates from WhatsApp or synchronize existing
                  templates with your CRM.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleImportWhatsApp}
                disabled={importing || syncing}
                className="inline-flex h-9 items-center gap-2 rounded-lg border mt-divider px-3 text-xs font-semibold mt-heading transition mt-hover disabled:opacity-50"
              >
                {importing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}

                {importing ? "Importing..." : "Import Templates"}
              </button>

              <button
                type="button"
                onClick={handleSyncWhatsApp}
                disabled={syncing || importing}
                className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold mt-primary-bg transition disabled:opacity-50"
              >
                {syncing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCcw size={14} />
                )}

                {syncing ? "Syncing..." : "Sync WhatsApp"}
              </button>
            </div>
          </div>
        </section>

        {/* TEMPLATE LIST */}

        <section className="mt-card overflow-hidden rounded-xl border shadow-sm">
          {/* TOOLBAR */}

          <div className="flex flex-col gap-3 border-b mt-divider p-4 xl:flex-row xl:items-center">
            {/* SEARCH */}

            <div className="relative w-full xl:max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 mt-muted"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search templates..."
                className="mt-input h-10 w-full rounded-lg pl-9 pr-3 text-xs"
              />
            </div>

            {/* STATUS TABS */}

            <div className="mt-segment flex w-fit items-center gap-1 rounded-lg p-1">
              {[
                ["all", "All"],
                ["active", "Active"],
                ["draft", "Draft"],
                ["archived", "Archived"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusTab(value)}
                  className={`rounded-md px-3 py-2 text-[11px] font-semibold transition ${
                    statusTab === value ? "mt-segment-active" : "mt-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
                  showFilters || hasFilters
                    ? "mt-primary-soft"
                    : "mt-divider mt-muted mt-hover"
                }`}
              >
                <SlidersHorizontal size={14} />
                Filters
                <ChevronDown
                  size={13}
                  className={`transition ${showFilters ? "rotate-180" : ""}`}
                />
              </button>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-9 rounded-lg px-3 text-xs font-semibold mt-primary transition mt-hover"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* FILTER PANEL */}

          {showFilters && (
            <div className="flex flex-wrap gap-3 border-b mt-divider p-4">
              <div className="relative">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-input h-9 min-w-44 appearance-none rounded-lg px-3 pr-9 text-xs"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 mt-muted"
                />
              </div>

              <div className="relative">
                <select
                  value={channel}
                  onChange={(event) => setChannel(event.target.value)}
                  className="mt-input h-9 min-w-40 appearance-none rounded-lg px-3 pr-9 text-xs"
                >
                  {channels.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 mt-muted"
                />
              </div>
            </div>
          )}

          {/* TABLE HEADER */}

          <div className="hidden grid-cols-[minmax(250px,2fr)_150px_130px_130px_120px_45px] border-b mt-divider px-4 py-3 lg:grid">
            {["Template", "Channel", "Category", "Status", "Updated", ""].map(
              (item, index) => (
                <div
                  key={index}
                  className="text-[10px] font-bold uppercase tracking-wider mt-muted"
                >
                  {item}
                </div>
              ),
            )}
          </div>

          {/* EMPTY STATE */}

          {filteredTemplates.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl mt-primary-soft">
                <LayoutTemplate size={25} />
              </div>

              <h3 className="mt-4 text-sm font-bold mt-heading">
                {templates.length === 0
                  ? "No templates yet"
                  : "No templates found"}
              </h3>

              <p className="mt-2 max-w-sm text-xs leading-5 mt-muted">
                {templates.length === 0
                  ? "Create your first marketing template or import templates from WhatsApp."
                  : "Try changing your search or filters."}
              </p>

              {templates.length === 0 ? (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-semibold mt-primary-bg"
                >
                  <Plus size={14} />
                  Create Template
                </button>
              ) : (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 h-9 rounded-lg border mt-divider px-4 text-xs font-semibold mt-heading"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden lg:block">
                {filteredTemplates.map((template) => {
                  const channelConfig = getChannelConfig(template.channel);

                  const ChannelIcon = channelConfig.icon;
                  const statusConfig = getStatusConfig(template.status);

                  const isArchived =
                    String(template.status).toLowerCase() === "archived";

                  return (
                    <div
                      key={template.id}
                      className="group grid grid-cols-[minmax(250px,2fr)_150px_130px_130px_120px_45px] items-center border-b mt-divider px-4 py-3 transition last:border-b-0 mt-hover"
                    >
                      {/* TEMPLATE */}

                      <div className="min-w-0 pr-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-channel">
                            <ChannelIcon size={18} />
                          </div>

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setPreviewTemplate(template)}
                              className="block max-w-full truncate text-left text-xs font-bold mt-heading hover:mt-primary"
                            >
                              {template.name}
                            </button>

                            <p className="mt-1 max-w-md truncate text-[10px] mt-muted">
                              {template.description ||
                                template.content ||
                                "No description available."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* CHANNEL */}

                      <div className="flex items-center gap-2 text-xs mt-heading">
                        <ChannelIcon size={14} className="mt-primary" />
                        {channelConfig.label}
                      </div>

                      {/* CATEGORY */}

                      <div>
                        <span className="inline-flex rounded-md px-2.5 py-1 text-[10px] font-semibold capitalize mt-primary-soft">
                          {template.category}
                        </span>
                      </div>

                      {/* STATUS */}

                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusConfig.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`}
                          />
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* DATE */}

                      <div className="text-[10px] mt-muted">
                        {formatDate(template.updatedAt || template.createdAt)}
                      </div>

                      {/* ACTION MENU */}

                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu(
                              openMenu === template.id ? null : template.id,
                            )
                          }
                          disabled={actionLoading === template.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg mt-muted transition mt-hover"
                        >
                          {actionLoading === template.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <MoreHorizontal size={17} />
                          )}
                        </button>

                        {openMenu === template.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenMenu(null)}
                            />

                            <div className="absolute right-0 top-9 z-50 w-48 overflow-hidden rounded-xl border mt-divider mt-card py-1 shadow-xl">
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewTemplate(template);
                                  setOpenMenu(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs mt-heading mt-hover"
                              >
                                <Eye size={14} />
                                Preview
                              </button>

                              <button
                                type="button"
                                onClick={() => handleEdit(template)}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs mt-heading mt-hover"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDuplicate(template)}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs mt-heading mt-hover"
                              >
                                <Copy size={14} />
                                Duplicate
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(template)}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs mt-heading mt-hover"
                              >
                                <Power size={14} />
                                {["active", "approved"].includes(
                                  String(template.status).toLowerCase(),
                                )
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>

                              {isArchived && (
                                <button
                                  type="button"
                                  onClick={() => handleRestore(template)}
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs mt-primary mt-hover"
                                >
                                  <RotateCcw size={14} />
                                  Restore
                                </button>
                              )}

                              <div className="my-1 border-t mt-divider" />

                              <button
                                type="button"
                                onClick={() => handleDelete(template)}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MOBILE CARDS */}

              <div className="divide-y mt-divider lg:hidden">
                {filteredTemplates.map((template) => {
                  const channelConfig = getChannelConfig(template.channel);

                  const ChannelIcon = channelConfig.icon;
                  const statusConfig = getStatusConfig(template.status);

                  return (
                    <div key={template.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-channel">
                          <ChannelIcon size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewTemplate(template)}
                              className="min-w-0 truncate text-left text-xs font-bold mt-heading"
                            >
                              {template.name}
                            </button>

                            <button
                              type="button"
                              onClick={() => setPreviewTemplate(template)}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-muted mt-hover"
                            >
                              <Eye size={15} />
                            </button>
                          </div>

                          <p className="mt-1 text-[10px] mt-muted">
                            {channelConfig.label}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-2 text-xs leading-5 mt-muted">
                        {template.description ||
                          template.content ||
                          "No description available."}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-md px-2 py-1 text-[10px] font-semibold capitalize mt-primary-soft">
                          {template.category}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold ${statusConfig.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`}
                          />
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t mt-divider pt-3">
                        <span className="text-[10px] mt-muted">
                          Updated{" "}
                          {formatDate(template.updatedAt || template.createdAt)}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(template)}
                            className="h-8 rounded-lg border mt-divider px-3 text-[10px] font-semibold mt-heading"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUseTemplate(template)}
                            className="h-8 rounded-lg px-3 text-[10px] font-semibold mt-primary-bg"
                          >
                            Use Template
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* FOOTER */}

          {filteredTemplates.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t mt-divider px-4 py-3">
              <p className="text-[10px] mt-muted">
                Showing {filteredTemplates.length} of {templates.length}{" "}
                templates
              </p>

              <p className="text-[10px] font-semibold mt-primary">
                {filteredTemplates.length} Results
              </p>
            </div>
          )}
        </section>
      </main>

      {/* =====================================================
         PREVIEW MODAL
      ===================================================== */}

      {previewTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setPreviewTemplate(null)}
          />

          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border mt-divider mt-card shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b mt-divider px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold mt-heading">
                  {previewTemplate.name}
                </h2>

                <p className="mt-1 text-[10px] mt-muted">
                  {getChannelConfig(previewTemplate.channel).label}
                  {" · "}
                  {previewTemplate.category}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg mt-muted mt-hover"
              >
                <X size={16} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="rounded-xl border mt-divider p-4">
                <div className="flex items-center gap-3 border-b mt-divider pb-4">
                  {(() => {
                    const config = getChannelConfig(previewTemplate.channel);

                    const Icon = config.icon;

                    return (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl mt-channel">
                        <Icon size={18} />
                      </div>
                    );
                  })()}

                  <div>
                    <p className="text-xs font-bold mt-heading">
                      {previewTemplate.name}
                    </p>

                    <p className="mt-1 text-[10px] mt-muted">
                      {getChannelConfig(previewTemplate.channel).label}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {previewTemplate.content ? (
                    <div className="whitespace-pre-wrap rounded-xl p-4 text-xs leading-6 mt-subtle mt-heading">
                      {typeof previewTemplate.content === "string"
                        ? previewTemplate.content
                        : JSON.stringify(previewTemplate.content, null, 2)}
                    </div>
                  ) : (
                    <div className="rounded-xl p-4 text-xs mt-subtle mt-muted">
                      No content available.
                    </div>
                  )}
                </div>

                {previewTemplate.variables?.length > 0 && (
                  <div className="mt-4 rounded-xl border border-dashed mt-divider p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-muted">
                      Template Variables
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {previewTemplate.variables.map((variable, index) => (
                        <span
                          key={index}
                          className="rounded-lg px-3 py-2 text-[10px] font-medium mt-primary-soft"
                        >
                          {typeof variable === "string"
                            ? variable
                            : variable?.key ||
                              variable?.name ||
                              `Variable ${index + 1}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* DETAILS */}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border mt-divider p-3">
                  <p className="text-[10px] mt-muted">Language</p>
                  <p className="mt-1 text-xs font-semibold mt-heading">
                    {previewTemplate.language || "en"}
                  </p>
                </div>

                <div className="rounded-xl border mt-divider p-3">
                  <p className="text-[10px] mt-muted">Usage</p>
                  <p className="mt-1 text-xs font-semibold mt-heading">
                    {previewTemplate.usage || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="flex items-center justify-end gap-2 border-t mt-divider px-5 py-4">
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="h-9 rounded-lg border mt-divider px-4 text-xs font-semibold mt-heading mt-hover"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleUseTemplate(previewTemplate)}
                className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-semibold mt-primary-bg"
              >
                <Plus size={14} />
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingTemplates;
