// src/pages/website/Websites.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  LayoutDashboard,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  AlertCircle,
  XCircle,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  CalendarDays,
  Monitor,
  FileText,
  MoreVertical,
} from "lucide-react";

import websiteApi from "../../api/website.api";

// ======================================================
// FORMAT DATE
// ======================================================

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

// ======================================================
// NORMALIZE WEBSITE
// ======================================================

const normalizeWebsite = (item) => {
  const theme = item?.theme;

  let themeName = "Default";

  if (typeof theme === "string") {
    themeName = theme;
  } else if (theme && typeof theme === "object") {
    themeName =
      theme?.name || theme?.title || theme?.type || theme?.slug || "Default";
  }

  const rawStatus = String(
    item?.status || item?.websiteStatus || "draft",
  ).toLowerCase();

  let status = "Draft";

  if (
    rawStatus === "published" ||
    rawStatus === "active" ||
    rawStatus === "live"
  ) {
    status = "Published";
  } else if (rawStatus === "scheduled") {
    status = "Scheduled";
  } else if (rawStatus === "inactive") {
    status = "Inactive";
  }

  const pages = Array.isArray(item?.pages)
    ? item.pages.length
    : Number(item?.pageCount || 0);

  return {
    id: item?._id || item?.id,
    name: item?.name || item?.title || item?.siteName || "Untitled Website",
    slug: item?.slug || "",
    domain: item?.customDomain || item?.domain || "",
    theme: themeName,
    status,
    pages,
    domainVerified: Boolean(item?.domainVerified),
    sslEnabled: Boolean(item?.sslEnabled),
    updatedAt: formatDate(item?.updatedAt || item?.createdAt),
    createdAt: formatDate(item?.createdAt),
    raw: item,
  };
};

// ======================================================
// STATUS BADGE
// ======================================================

const StatusBadge = ({ status }) => {
  const config = {
    Published: {
      icon: CheckCircle2,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    Scheduled: {
      icon: Clock3,
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    Inactive: {
      icon: XCircle,
      className: "border-red-200 bg-red-50 text-red-700",
    },
    Draft: {
      icon: Clock3,
      className: "border-slate-200 bg-slate-50 text-slate-600",
    },
  };

  const current = config[status] || config.Draft;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${current.className}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
};

// ======================================================
// DOMAIN STATUS
// ======================================================

const DomainStatus = ({ website }) => {
  if (website.domainVerified) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
        <CheckCircle2 size={12} />
        Verified
      </span>
    );
  }

  if (website.domain) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600">
        <Clock3 size={12} />
        Pending Verification
      </span>
    );
  }

  return (
    <span className="text-[10px] font-medium mt-muted">Not configured</span>
  );
};

// ======================================================
// SSL STATUS
// ======================================================

const SSLStatus = ({ website }) => {
  if (website.sslEnabled) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
        <ShieldCheck size={12} />
        SSL Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium mt-muted">
      <ShieldAlert size={12} />
      SSL Not Active
    </span>
  );
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function Websites() {
  const navigate = useNavigate();

  // ====================================================
  // STATES
  // ====================================================

  const [websites, setWebsites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [error, setError] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // ====================================================
  // THEME STYLES
  // ====================================================

  const themeStyles = `
    .websites-page {
      min-height: 100vh;
      background: var(--app-bg, #f8fafc);
      color: var(--app-heading, #111827);
    }

    .websites-page .mt-card {
      background: var(--app-surface, #ffffff);
      border-color: var(--app-border, #e5e7eb);
      color: var(--app-heading, #111827);
    }

    .websites-page .mt-heading {
      color: var(--app-heading, #111827);
    }

    .websites-page .mt-muted {
      color: var(--app-muted, #6b7280);
    }

    .websites-page .mt-primary {
      color: var(--theme-primary, #4f46e5);
    }

    .websites-page .mt-primary-bg {
      background: var(--theme-primary, #4f46e5);
      color: #ffffff;
    }

    .websites-page .mt-primary-bg:hover {
      filter: brightness(.94);
    }

    .websites-page .mt-primary-soft {
      background: var(--theme-primary-soft, #eef2ff);
      color: var(--theme-primary, #4f46e5);
      border-color: var(--theme-primary-border, #c7d2fe);
    }

    .websites-page .mt-input {
      background: var(--app-surface, #ffffff);
      color: var(--app-heading, #111827);
      border: 1px solid var(--app-border, #e5e7eb);
    }

    .websites-page .mt-input:focus {
      border-color: var(--theme-primary, #4f46e5);
      box-shadow: 0 0 0 3px var(--theme-primary-soft, #eef2ff);
      outline: none;
    }

    .websites-page .mt-input::placeholder {
      color: var(--app-muted, #9ca3af);
    }

    .websites-page .mt-hover:hover {
      background: var(--app-hover, #f3f4f6);
    }

    .websites-page .mt-subtle {
      background: var(--app-hover, #f9fafb);
      border-color: var(--app-border, #e5e7eb);
    }

    .websites-page .mt-divider {
      border-color: var(--app-border, #e5e7eb);
    }

    .websites-page .website-table th {
      background: var(--app-hover, #f9fafb);
      color: var(--app-muted, #6b7280);
    }

    .websites-page .website-table tbody tr {
      border-color: var(--app-border, #e5e7eb);
    }

    .websites-page .website-table tbody tr:hover {
      background: var(--app-hover, #f9fafb);
    }

    .websites-page .website-dropdown {
      background: var(--app-surface, #ffffff);
      border-color: var(--app-border, #e5e7eb);
      color: var(--app-heading, #111827);
      box-shadow: 0 12px 30px rgba(0,0,0,.10);
    }

    .websites-page .website-stat-icon {
      background: var(--theme-primary-soft, #eef2ff);
      color: var(--theme-primary, #4f46e5);
    }

    .websites-page .website-icon {
      background: var(--theme-primary-soft, #eef2ff);
      color: var(--theme-primary, #4f46e5);
    }

    .websites-page .mt-focus:focus-visible {
      outline: 2px solid var(--theme-primary, #4f46e5);
      outline-offset: 2px;
    }

    .websites-page button:disabled {
      cursor: not-allowed;
    }
  `;

  // ====================================================
  // GET WEBSITE URL
  // ====================================================

  const getWebsiteUrl = useCallback((website) => {
    if (!website?.domain) return null;

    if (
      website.domain.startsWith("http://") ||
      website.domain.startsWith("https://")
    ) {
      return website.domain;
    }

    return `https://${website.domain}`;
  }, []);

  // ====================================================
  // FETCH WEBSITES
  // ====================================================

  const fetchWebsites = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      setError("");

      const response = await websiteApi.getWebsites();

      const data = response?.data;

      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.websites)) {
        list = data.websites;
      } else if (Array.isArray(data?.items)) {
        list = data.items;
      } else if (Array.isArray(data?.results)) {
        list = data.results;
      }

      const normalized = list.map(normalizeWebsite).filter((item) => item.id);

      setWebsites(normalized);
    } catch (err) {
      console.error("FETCH WEBSITES ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load websites.",
      );

      setWebsites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  // ====================================================
  // CLOSE MENU ON OUTSIDE CLICK
  // ====================================================

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

  // ====================================================
  // HANDLERS
  // ====================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchWebsites({ silent: true });
    } finally {
      setRefreshing(false);
    }
  };

  const handleManage = (website) => {
    if (!website?.id) return;

    setOpenMenuId(null);
    navigate(`/website/${website.id}`);
  };

  const handleOpenWebsite = (website) => {
    const url = getWebsiteUrl(website);

    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ====================================================
  // DELETE WEBSITE
  // ====================================================

  const handleDelete = async (website) => {
    if (!website?.id) return;

    if (!window.confirm(`Are you sure you want to delete "${website.name}"?`)) {
      return;
    }

    try {
      setActionLoading(`delete-${website.id}`);
      setOpenMenuId(null);

      await websiteApi.deleteWebsite(website.id);

      setWebsites((current) =>
        current.filter((item) => item.id !== website.id),
      );
    } catch (err) {
      console.error("DELETE WEBSITE ERROR:", err);

      window.alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete website.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ====================================================
  // PUBLISH / UNPUBLISH
  // ====================================================

  const handlePublishToggle = async (website) => {
    if (!website?.id) return;

    const isPublished = website.status === "Published";

    try {
      setActionLoading(`publish-${website.id}`);
      setOpenMenuId(null);

      if (isPublished) {
        if (typeof websiteApi.unpublishWebsite !== "function") {
          throw new Error("Unpublish API is not available.");
        }

        await websiteApi.unpublishWebsite(website.id);
      } else {
        if (typeof websiteApi.publishWebsite !== "function") {
          throw new Error("Publish API is not available.");
        }

        await websiteApi.publishWebsite(website.id);
      }

      await fetchWebsites({ silent: true });
    } catch (err) {
      console.error("PUBLISH WEBSITE ERROR:", err);

      window.alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update website status.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ====================================================
  // DUPLICATE WEBSITE
  // ====================================================

  const handleDuplicate = async (website) => {
    if (!website?.id) return;

    try {
      setActionLoading(`duplicate-${website.id}`);
      setOpenMenuId(null);

      if (typeof websiteApi.duplicateWebsite !== "function") {
        throw new Error("Duplicate API is not available.");
      }

      await websiteApi.duplicateWebsite(website.id);

      await fetchWebsites({ silent: true });
    } catch (err) {
      console.error("DUPLICATE WEBSITE ERROR:", err);

      window.alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to duplicate website.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ====================================================
  // SUMMARY
  // ====================================================

  const summary = useMemo(() => {
    const total = websites.length;

    const published = websites.filter(
      (item) => item.status === "Published",
    ).length;

    const draft = websites.filter((item) => item.status === "Draft").length;

    const scheduled = websites.filter(
      (item) => item.status === "Scheduled",
    ).length;

    const inactive = websites.filter(
      (item) => item.status === "Inactive",
    ).length;

    const verified = websites.filter((item) => item.domainVerified).length;

    return {
      total,
      published,
      draft,
      scheduled,
      inactive,
      verified,
    };
  }, [websites]);

  // ====================================================
  // FILTERED WEBSITES
  // ====================================================

  const filteredWebsites = useMemo(() => {
    const query = search.trim().toLowerCase();

    return websites.filter((website) => {
      const matchesSearch =
        !query ||
        website.name.toLowerCase().includes(query) ||
        website.slug.toLowerCase().includes(query) ||
        website.domain.toLowerCase().includes(query) ||
        website.theme.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || website.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [websites, search, statusFilter]);

  // ====================================================
  // FILTER TABS
  // ====================================================

  const statusTabs = [
    { value: "All", label: "All", count: summary.total },
    {
      value: "Published",
      label: "Published",
      count: summary.published,
    },
    {
      value: "Draft",
      label: "Draft",
      count: summary.draft,
    },
    {
      value: "Scheduled",
      label: "Scheduled",
      count: summary.scheduled,
    },
    {
      value: "Inactive",
      label: "Inactive",
      count: summary.inactive,
    },
  ];

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="websites-page">
      <style>{themeStyles}</style>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <header className="mt-card border-b mt-divider">
        <div className="px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* LEFT */}

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

                <span>Business</span>

                <span>/</span>

                <span className="font-medium mt-primary">Websites</span>

                <span className="rounded-full border mt-divider mt-subtle px-2 py-0.5 text-[10px] font-semibold">
                  {summary.total}
                </span>
              </div>

              <div className="mt-3">
                <h1 className="text-xl font-bold tracking-tight mt-heading">
                  Websites
                </h1>

                <p className="mt-1 text-xs mt-muted">
                  Create, manage and publish your business websites and landing
                  pages.
                </p>
              </div>
            </div>

            {/* RIGHT ACTIONS */}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
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
                onClick={() => navigate("/website/create")}
                className="inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-semibold mt-primary-bg transition"
              >
                <Plus size={15} />
                Create Website
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main className="space-y-4 px-5 py-5">
        {/* ERROR ALERT */}

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={17} className="shrink-0 text-red-600" />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-red-800">
                Unable to load websites
              </p>

              <p className="mt-0.5 break-words text-xs text-red-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchWebsites()}
              className="shrink-0 text-xs font-semibold text-red-700 underline"
            >
              Retry
            </button>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-md p-1 text-red-600 transition hover:bg-red-100"
            >
              <X size={15} />
            </button>
          </div>
        )}


        {/* ====================================================
            WEBSITE TABLE CARD
        ==================================================== */}

        <section className="mt-card overflow-visible rounded-xl border shadow-sm">
          {/* TOOLBAR */}

          <div className="border-b mt-divider p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              {/* STATUS TABS */}

              <div className="flex flex-wrap items-center gap-1.5">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                      statusFilter === tab.value
                        ? "mt-primary-bg"
                        : "mt-subtle mt-muted border border-transparent hover:mt-heading"
                    }`}
                  >
                    {tab.label}

                    <span className="ml-1 opacity-75">{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* SEARCH AND FILTER */}

              <div className="flex flex-col gap-2 sm:flex-row">
                {/* SEARCH */}

                <div className="relative w-full sm:w-[280px]">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 mt-muted"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, domain or theme..."
                    className="mt-input h-9 w-full rounded-lg pl-9 pr-9 text-xs"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 mt-muted transition mt-hover"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* STATUS FILTER */}

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="mt-input h-9 w-full appearance-none rounded-lg pl-3 pr-9 text-xs font-medium sm:w-[145px]"
                  >
                    <option value="All">All Status</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 mt-muted"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TABLE */}

          {loading ? (
            <LoadingState />
          ) : filteredWebsites.length === 0 ? (
            <EmptyState
              search={search}
              statusFilter={statusFilter}
              onCreate={() => navigate("/website/create")}
              onReset={() => {
                setSearch("");
                setStatusFilter("All");
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="website-table w-full min-w-[1100px] border-collapse">
                {/* TABLE HEADER */}

                <thead>
                  <tr className="border-b mt-divider">
                    <th className="px-5 py-3 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Website
                      </span>
                    </th>

                    <th className="px-4 py-3 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Custom Domain
                      </span>
                    </th>

                    <th className="px-4 py-3 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Status
                      </span>
                    </th>

                    <th className="px-4 py-3 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Theme
                      </span>
                    </th>

                    <th className="px-4 py-3 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Pages
                      </span>
                    </th>

                    <th className="px-4 py-3 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        SSL
                      </span>
                    </th>

                    <th className="px-4 py-3 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Updated
                      </span>
                    </th>

                    <th className="px-5 py-3 text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>

                {/* TABLE BODY */}

                <tbody>
                  {filteredWebsites.map((website) => {
                    const isPublished = website.status === "Published";

                    const isDeleting = actionLoading === `delete-${website.id}`;

                    const isPublishing =
                      actionLoading === `publish-${website.id}`;

                    const isDuplicating =
                      actionLoading === `duplicate-${website.id}`;

                    const busy = isDeleting || isPublishing || isDuplicating;

                    const menuOpen = openMenuId === website.id;

                    const websiteUrl = getWebsiteUrl(website);

                    return (
                      <tr key={website.id} className="border-b transition">
                        {/* WEBSITE */}

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="website-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                              <Globe size={18} />
                            </div>

                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => handleManage(website)}
                                className="block max-w-[220px] truncate text-left text-xs font-bold mt-heading transition hover:mt-primary"
                              >
                                {website.name}
                              </button>

                              <div className="mt-1 flex items-center gap-1.5 text-[10px] mt-muted">
                                {website.slug ? (
                                  <>
                                    <span className="max-w-[140px] truncate">
                                      /{website.slug}
                                    </span>

                                    <span>·</span>
                                  </>
                                ) : null}

                                <span>
                                  {website.pages}{" "}
                                  {website.pages === 1 ? "page" : "pages"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* DOMAIN */}

                        <td className="px-4 py-3.5">
                          {website.domain ? (
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => handleOpenWebsite(website)}
                                className="inline-flex max-w-[210px] items-center gap-1.5 text-left text-xs font-semibold mt-heading transition hover:mt-primary"
                              >
                                <span className="truncate">
                                  {website.domain}
                                </span>

                                <ExternalLink
                                  size={12}
                                  className="shrink-0 mt-muted"
                                />
                              </button>

                              <div className="mt-1">
                                <DomainStatus website={website} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs mt-muted">
                              No domain configured
                            </span>
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-3.5">
                          <StatusBadge status={website.status} />
                        </td>

                        {/* THEME */}

                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-2 text-xs mt-heading">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md mt-subtle border mt-divider">
                              <Monitor size={12} className="mt-muted" />
                            </span>

                            {website.theme}
                          </span>
                        </td>

                        {/* PAGES */}

                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold mt-heading">
                            <LayoutDashboard size={13} className="mt-muted" />

                            {website.pages}
                          </span>
                        </td>

                        {/* SSL */}

                        <td className="px-4 py-3.5">
                          <SSLStatus website={website} />
                        </td>

                        {/* UPDATED */}

                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs mt-muted">
                            <CalendarDays size={13} />

                            {website.updatedAt}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td className="relative px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {/* VIEW */}

                            {websiteUrl && (
                              <button
                                type="button"
                                title="View website"
                                onClick={() => handleOpenWebsite(website)}
                                className="rounded-lg p-2 mt-muted transition mt-hover hover:mt-primary"
                              >
                                <Eye size={15} />
                              </button>
                            )}

                            {/* EDIT */}

                            <button
                              type="button"
                              title="Manage website"
                              onClick={() => handleManage(website)}
                              className="rounded-lg p-2 mt-muted transition mt-hover hover:mt-primary"
                            >
                              <Pencil size={15} />
                            </button>

                            {/* MENU */}

                            <div
                              className="relative"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <button
                                type="button"
                                disabled={busy}
                                title="More actions"
                                onClick={() =>
                                  setOpenMenuId(menuOpen ? null : website.id)
                                }
                                className="rounded-lg p-2 mt-muted transition mt-hover hover:mt-primary disabled:opacity-50"
                              >
                                {busy ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <MoreHorizontal size={16} />
                                )}
                              </button>

                              {menuOpen && (
                                <div className="website-dropdown absolute right-0 top-9 z-40 w-48 overflow-hidden rounded-xl border p-1.5">
                                  {/* MANAGE */}

                                  <button
                                    type="button"
                                    onClick={() => handleManage(website)}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition mt-hover"
                                  >
                                    <Pencil size={14} className="mt-muted" />
                                    Edit / Manage
                                  </button>

                                  {/* DUPLICATE */}

                                  {typeof websiteApi.duplicateWebsite ===
                                    "function" && (
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicate(website)}
                                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition mt-hover"
                                    >
                                      <Copy size={14} className="mt-muted" />
                                      Duplicate Site
                                    </button>
                                  )}

                                  {/* PUBLISH */}

                                  {(typeof websiteApi.publishWebsite ===
                                    "function" ||
                                    typeof websiteApi.unpublishWebsite ===
                                      "function") && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handlePublishToggle(website)
                                      }
                                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition mt-hover"
                                    >
                                      {isPublished ? (
                                        <>
                                          <EyeOff
                                            size={14}
                                            className="text-amber-600"
                                          />
                                          Unpublish Site
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle2
                                            size={14}
                                            className="text-emerald-600"
                                          />
                                          Publish Site
                                        </>
                                      )}
                                    </button>
                                  )}

                                  {/* DELETE */}

                                  <div className="my-1 border-t mt-divider" />

                                  <button
                                    type="button"
                                    onClick={() => handleDelete(website)}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-red-600 transition hover:bg-red-50"
                                  >
                                    <Trash2 size={14} />
                                    Delete Site
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ====================================================
              TABLE FOOTER
          ==================================================== */}

          {!loading && filteredWebsites.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t mt-divider px-4 py-3">
              <p className="text-[10px] mt-muted">
                Showing{" "}
                <span className="font-bold mt-heading">
                  {filteredWebsites.length}
                </span>{" "}
                of{" "}
                <span className="font-bold mt-heading">{websites.length}</span>{" "}
                websites
              </p>

              <div className="flex items-center gap-2">
                {search || statusFilter !== "All" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All");
                    }}
                    className="text-[10px] font-semibold mt-primary"
                  >
                    Clear filters
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold mt-muted transition hover:mt-primary disabled:opacity-50"
                >
                  <RefreshCw
                    size={12}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Refresh list
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ======================================================
// SUMMARY CARD
// ======================================================

const SummaryCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClass = "",
}) => {
  return (
    <div className="mt-card rounded-xl border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold mt-muted">{title}</p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight mt-heading">
            {value}
          </h3>

          <p className="mt-1 text-[10px] mt-muted">{description}</p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            iconClass || "website-stat-icon"
          }`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
};

// ======================================================
// LOADING STATE
// ======================================================

const LoadingState = () => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="website-stat-icon flex h-12 w-12 items-center justify-center rounded-xl">
        <RefreshCw size={21} className="animate-spin" />
      </div>

      <p className="mt-4 text-xs font-semibold mt-heading">Loading websites</p>

      <p className="mt-1 text-[10px] mt-muted">
        Please wait while we load your website library.
      </p>
    </div>
  );
};

// ======================================================
// EMPTY STATE
// ======================================================

const EmptyState = ({ search, statusFilter, onCreate, onReset }) => {
  const hasFilters = Boolean(search || statusFilter !== "All");

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="website-stat-icon flex h-14 w-14 items-center justify-center rounded-2xl">
        <Globe size={25} />
      </div>

      <h3 className="mt-4 text-sm font-bold mt-heading">No websites found</h3>

      <p className="mt-2 max-w-sm text-xs mt-muted">
        {hasFilters
          ? "No websites match your current search or status filter. Try changing your filters."
          : "You haven't created any websites yet. Create your first business website to get started."}
      </p>

      {hasFilters ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 h-9 rounded-lg border mt-divider mt-card px-4 text-xs font-semibold mt-heading transition mt-hover"
        >
          Clear Filters
        </button>
      ) : (
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-semibold mt-primary-bg"
        >
          <Plus size={14} />
          Create Website
        </button>
      )}
    </div>
  );
};
