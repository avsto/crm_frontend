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
  if (status === "Published") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Published
      </span>
    );
  }

  if (status === "Scheduled") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
        <Clock3 className="h-3 w-3" />
        Scheduled
      </span>
    );
  }

  if (status === "Inactive") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
        <XCircle className="h-3 w-3" />
        Inactive
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
      <Clock3 className="h-3 w-3" />
      Draft
    </span>
  );
};

// ======================================================
// DOMAIN STATUS
// ======================================================

const DomainStatus = ({ website }) => {
  if (website.domainVerified) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Verified
      </span>
    );
  }

  if (website.domain) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-700">
        <Clock3 className="h-3 w-3" />
        Pending Verification
      </span>
    );
  }

  return <span className="text-[11px] text-gray-400">Not configured</span>;
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
      let data = response?.data;

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

  // Close context dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
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
    navigate(`/website/${website.id}`);
  };

  const handleOpenWebsite = (website) => {
    const url = getWebsiteUrl(website);
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

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
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete website.",
      );
    } finally {
      setActionLoading(null);
    }
  };

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
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update website status.",
      );
    } finally {
      setActionLoading(null);
    }
  };

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
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to duplicate website.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ====================================================
  // COMPUTED
  // ====================================================

  const summary = useMemo(() => {
    const total = websites.length;
    const published = websites.filter((i) => i.status === "Published").length;
    const draft = websites.filter((i) => i.status === "Draft").length;
    const scheduled = websites.filter((i) => i.status === "Scheduled").length;
    const inactive = websites.filter((i) => i.status === "Inactive").length;

    return { total, published, draft, scheduled, inactive };
  }, [websites]);

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

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-5 py-5 md:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* LEFT */}
            <div>
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
                <span className="font-medium text-gray-800">Websites</span>
              </div>

              <h1 className="text-1xl font-bold tracking-tight text-gray-900">
                Websites
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Create, manage, and publish your business websites and landing
                pages.
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => navigate("/website/create")}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-black"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Website
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          CONTENT AREA
      ====================================================== */}
      <div className="px-5 py-6 md:px-7">
        <div className="mx-auto max-w-[1450px]">
          {/* ERROR ALERT */}
          {error && (
            <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => fetchWebsites()}
                className="ml-auto font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* MAIN CARD CONTAINER */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {/* CARD TOP TOOLBAR */}
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  {/* FILTER CHIPS / TABS */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStatusFilter("All")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        statusFilter === "All"
                          ? "bg-[#111827] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      All ({summary.total})
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatusFilter("Published")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        statusFilter === "Published"
                          ? "bg-[#111827] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Published ({summary.published})
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatusFilter("Draft")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        statusFilter === "Draft"
                          ? "bg-[#111827] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Draft ({summary.draft})
                    </button>

                    {summary.scheduled > 0 && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter("Scheduled")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          statusFilter === "Scheduled"
                            ? "bg-[#111827] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Scheduled ({summary.scheduled})
                      </button>
                    )}

                   
                  </div>
                </div>

                {/* SEARCH & FILTERS */}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative w-full sm:w-[280px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search website name or domain..."
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-xs text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-100"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-100 sm:w-[155px]"
                  >
                    <option value="All">All Status</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TABLE STATE RENDER */}
            {loading ? (
              <LoadingState />
            ) : filteredWebsites.length === 0 ? (
              <EmptyState
                search={search}
                onCreate={() => navigate("/website/create")}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/70">
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Website
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Custom Domain
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Theme
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Pages
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Updated
                      </th>
                      <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredWebsites.map((website) => {
                      const isPublished = website.status === "Published";
                      const isDeleting =
                        actionLoading === `delete-${website.id}`;
                      const isPublishing =
                        actionLoading === `publish-${website.id}`;
                      const isDuplicating =
                        actionLoading === `duplicate-${website.id}`;
                      const busy = isDeleting || isPublishing || isDuplicating;
                      const menuOpen = openMenuId === website.id;
                      const websiteUrl = getWebsiteUrl(website);

                      return (
                        <tr
                          key={website.id}
                          className="transition hover:bg-gray-50/70"
                        >
                          {/* WEBSITE */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
                                <Globe className="h-4 w-4" />
                              </div>

                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleManage(website)}
                                  className="truncate text-left text-xs font-semibold text-gray-900 transition hover:underline"
                                >
                                  {website.name}
                                </button>
                                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-500">
                                  {website.slug && (
                                    <>
                                      <span className="truncate max-w-[150px]">
                                        /{website.slug}
                                      </span>
                                      <span>•</span>
                                    </>
                                  )}
                                  <span>
                                    {website.pages} page
                                    {website.pages !== 1 ? "s" : ""}
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
                                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-800 transition hover:underline"
                                >
                                  <span className="truncate max-w-[180px]">
                                    {website.domain}
                                  </span>
                                  <ExternalLink className="h-3 w-3 shrink-0 text-gray-400" />
                                </button>
                                <div className="mt-0.5">
                                  <DomainStatus website={website} />
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No domain
                              </span>
                            )}
                          </td>

                          {/* STATUS */}
                          <td className="px-4 py-3.5">
                            <StatusBadge status={website.status} />
                          </td>

                          {/* THEME */}
                          <td className="px-4 py-3.5 text-xs text-gray-600">
                            {website.theme}
                          </td>

                          {/* PAGES */}
                          <td className="px-4 py-3.5 text-xs font-medium text-gray-700">
                            <span className="inline-flex items-center gap-1">
                              <LayoutDashboard className="h-3.5 w-3.5 text-gray-400" />
                              {website.pages}
                            </span>
                          </td>

                          {/* UPDATED */}
                          <td className="px-4 py-3.5 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1 whitespace-nowrap">
                              <Clock3 className="h-3.5 w-3.5 text-gray-400" />
                              {website.updatedAt}
                            </span>
                          </td>

                          {/* ACTIONS */}
                          <td className="relative px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* VISIT LINK */}
                              {websiteUrl && (
                                <button
                                  type="button"
                                  title="View website"
                                  onClick={() => handleOpenWebsite(website)}
                                  className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              )}

                              {/* EDIT */}
                              <button
                                type="button"
                                title="Edit website"
                                onClick={() => handleManage(website)}
                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              {/* DROPDOWN MENU */}
                              <div
                                className="relative"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    setOpenMenuId(menuOpen ? null : website.id)
                                  }
                                  className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
                                >
                                  {busy ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  )}
                                </button>

                                {menuOpen && (
                                  <div className="absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                                    <button
                                      type="button"
                                      onClick={() => handleManage(website)}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-gray-400" />
                                      Edit / Manage
                                    </button>

                                    {typeof websiteApi.duplicateWebsite ===
                                      "function" && (
                                      <button
                                        type="button"
                                        onClick={() => handleDuplicate(website)}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                                      >
                                        <Copy className="h-3.5 w-3.5 text-gray-400" />
                                        Duplicate Site
                                      </button>
                                    )}

                                    {(typeof websiteApi.publishWebsite ===
                                      "function" ||
                                      typeof websiteApi.unpublishWebsite ===
                                        "function") && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handlePublishToggle(website)
                                        }
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                                      >
                                        {isPublished ? (
                                          <>
                                            <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                                            Unpublish Site
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                            Publish Site
                                          </>
                                        )}
                                      </button>
                                    )}

                                    <div className="my-1 border-t border-gray-100" />

                                    <button
                                      type="button"
                                      onClick={() => handleDelete(website)}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
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

            {/* COUNT FOOTER */}
            {!loading && filteredWebsites.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-3 text-[11px] text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {filteredWebsites.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {websites.length}
                </span>{" "}
                websites
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LOADING STATE COMPONENT
// ============================================================

const LoadingState = () => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-10 text-center">
      <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      <p className="mt-3 text-xs font-medium text-gray-500">
        Loading website library...
      </p>
    </div>
  );
};

// ============================================================
// EMPTY STATE COMPONENT
// ============================================================

const EmptyState = ({ search, onCreate }) => {
  return (
    <div className="flex min-h-[330px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Globe className="h-6 w-6 text-gray-400" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-900">
        No websites found
      </h3>

      <p className="mt-1 max-w-sm text-xs text-gray-500">
        {search
          ? "No websites matched your search filters. Try resetting them."
          : "Get started by creating your first business website or landing page."}
      </p>

      {!search && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 text-xs font-semibold text-white transition hover:bg-black"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Website
        </button>
      )}
    </div>
  );
};
