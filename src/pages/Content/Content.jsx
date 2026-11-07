// src/pages/content/Content.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  FileText,
  LayoutDashboard,
  Loader2,
  MoreHorizontal,
  PenLine,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
  AlertCircle,
  Archive,
  BarChart3,
  ChevronDown,
  BookOpen,
  Globe,
  Image,
  Video,
  Mail,
} from "lucide-react";

import contentApi from "../../api/content.api";

// ======================================================
// STATUS CONFIGURATION
// ======================================================

const STATUS_CONFIG = {
  Published: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },

  Scheduled: {
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: Clock3,
  },

  Draft: {
    className: "border-slate-200 bg-slate-50 text-slate-600",
    icon: PenLine,
  },

  Archived: {
    className: "border-slate-200 bg-slate-100 text-slate-500",
    icon: Archive,
  },
};

// ======================================================
// CONTENT TYPE CONFIGURATION
// ======================================================

const TYPE_LABELS = {
  blog: "Blog",
  article: "Article",
  social: "Social",
  page: "Page",
  landing_page: "Landing Page",
  email: "Email",
  seo: "SEO",
  video: "Video",
  image: "Image",
};

const TYPE_ICONS = {
  Blog: BookOpen,
  Article: FileText,
  Social: Sparkles,
  Page: LayoutDashboard,
  "Landing Page": Globe,
  Email: Mail,
  SEO: BarChart3,
  Video: Video,
  Image: Image,
};

// ======================================================
// DATE FORMATTER
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
// NORMALIZE STATUS
// ======================================================

const normalizeStatus = (item) => {
  const status = String(
    item?.status || item?.contentStatus || "draft",
  ).toLowerCase();

  if (["published", "publish", "live"].includes(status)) {
    return "Published";
  }

  if (["scheduled", "schedule"].includes(status)) {
    return "Scheduled";
  }

  if (["archived", "archive"].includes(status)) {
    return "Archived";
  }

  return "Draft";
};

// ======================================================
// NORMALIZE TYPE
// ======================================================

const normalizeType = (item) => {
  const type = String(
    item?.type || item?.contentType || item?.format || "blog",
  ).toLowerCase();

  return (
    TYPE_LABELS[type] ||
    type.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

// ======================================================
// NORMALIZE CONTENT
// ======================================================

const normalizeContent = (item) => ({
  id: item?._id || item?.id,

  title: item?.title || item?.name || item?.headline || "Untitled Content",

  slug: item?.slug || "",

  type: normalizeType(item),

  status: normalizeStatus(item),

  author:
    item?.author?.name || item?.authorName || item?.createdBy?.name || "You",

  category: item?.category?.name || item?.categoryName || item?.category || "-",

  views: Number(item?.views || item?.analytics?.views || 0),

  updatedAt: formatDate(item?.updatedAt || item?.createdAt),

  createdAt: formatDate(item?.createdAt),

  publishedAt: formatDate(item?.publishedAt || item?.scheduledAt),

  raw: item,
});

// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Draft;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${config.className}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

// ======================================================
// TYPE BADGE
// ======================================================

function TypeBadge({ type }) {
  const Icon = TYPE_ICONS[type] || FileText;

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border mt-divider mt-subtle px-2 py-1 text-[10px] font-semibold mt-muted">
      <Icon size={12} />
      {type}
    </span>
  );
}

// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass = "",
}) {
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
            iconClass || "content-stat-icon"
          }`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

// ======================================================
// LOADING STATE
// ======================================================

function LoadingState() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="content-stat-icon flex h-12 w-12 items-center justify-center rounded-xl">
        <RefreshCw size={21} className="animate-spin" />
      </div>

      <p className="mt-4 text-xs font-semibold mt-heading">
        Loading content library
      </p>

      <p className="mt-1 text-[10px] mt-muted">
        Please wait while we load your content.
      </p>
    </div>
  );
}

// ======================================================
// EMPTY STATE
// ======================================================

function EmptyState({ hasFilters, onClear, onCreate }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="content-stat-icon flex h-14 w-14 items-center justify-center rounded-2xl">
        <FileText size={25} />
      </div>

      <h3 className="mt-4 text-sm font-bold mt-heading">No content found</h3>

      <p className="mt-2 max-w-sm text-xs leading-5 mt-muted">
        {hasFilters
          ? "No content matches your current filters. Try adjusting your search or filters."
          : "Get started by creating your first article, blog, page or social post."}
      </p>

      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 h-9 rounded-lg border mt-divider mt-card px-4 text-xs font-semibold mt-heading transition mt-hover"
        >
          Clear filters
        </button>
      ) : (
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-semibold mt-primary-bg"
        >
          <Plus size={14} />
          Create Content
        </button>
      )}
    </div>
  );
}

// ======================================================
// CREATE CONTENT MODAL
// ======================================================

function CreateContentModal({ onClose, onSelect }) {
  const options = [
    {
      type: "blog",
      title: "Blog Post",
      description: "Create SEO-friendly blog content.",
      icon: BookOpen,
    },
    {
      type: "article",
      title: "Article",
      description: "Write long-form content.",
      icon: FileText,
    },
    {
      type: "landing_page",
      title: "Landing Page",
      description: "Build conversion-focused pages.",
      icon: LayoutDashboard,
    },
    {
      type: "social",
      title: "Social Content",
      description: "Create social media posts.",
      icon: Sparkles,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <div
        className="mt-card w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <div className="flex items-center justify-between border-b mt-divider px-5 py-4">
          <div>
            <h2 className="text-sm font-bold mt-heading">Create Content</h2>

            <p className="mt-1 text-xs mt-muted">
              Choose the type of content you want to create.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 mt-muted transition mt-hover"
          >
            <X size={17} />
          </button>
        </div>

        {/* CONTENT TYPES */}

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {options.map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.type}
                type="button"
                onClick={() => onSelect(option.type)}
                className="group rounded-xl border mt-divider p-4 text-left transition mt-hover"
              >
                <div className="flex items-start gap-3">
                  <div className="content-stat-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <Icon size={18} />
                  </div>

                  <div>
                    <h3 className="text-xs font-bold mt-heading transition group-hover:mt-primary">
                      {option.title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 mt-muted">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* FOOTER */}

        <div className="flex justify-end border-t mt-divider px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border mt-divider px-4 text-xs font-semibold mt-heading transition mt-hover"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// MAIN CONTENT COMPONENT
// ======================================================

export default function Content() {
  const navigate = useNavigate();

  // ====================================================
  // STATES
  // ====================================================

  const [contents, setContents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [typeFilter, setTypeFilter] = useState("All");

  const [error, setError] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);

  const [actionLoading, setActionLoading] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  // ====================================================
  // THEME STYLES
  // ====================================================

  const themeStyles = `
    .content-page {
      min-height: 100vh;
      background: var(--app-bg, #f8fafc);
      color: var(--app-heading, #111827);
    }

    .content-page .mt-card {
      background: var(--app-surface, #ffffff);
      border-color: var(--app-border, #e5e7eb);
      color: var(--app-heading, #111827);
    }

    .content-page .mt-heading {
      color: var(--app-heading, #111827);
    }

    .content-page .mt-muted {
      color: var(--app-muted, #6b7280);
    }

    .content-page .mt-primary {
      color: var(--theme-primary, #4f46e5);
    }

    .content-page .mt-primary-bg {
      background: var(--theme-primary, #4f46e5);
      color: #ffffff;
    }

    .content-page .mt-primary-bg:hover {
      filter: brightness(.94);
    }

    .content-page .mt-primary-soft {
      background: var(--theme-primary-soft, #eef2ff);
      color: var(--theme-primary, #4f46e5);
      border-color: var(--theme-primary-border, #c7d2fe);
    }

    .content-page .mt-input {
      background: var(--app-surface, #ffffff);
      color: var(--app-heading, #111827);
      border: 1px solid var(--app-border, #e5e7eb);
    }

    .content-page .mt-input:focus {
      border-color: var(--theme-primary, #4f46e5);
      box-shadow: 0 0 0 3px var(--theme-primary-soft, #eef2ff);
      outline: none;
    }

    .content-page .mt-input::placeholder {
      color: var(--app-muted, #9ca3af);
    }

    .content-page .mt-hover:hover {
      background: var(--app-hover, #f3f4f6);
    }

    .content-page .mt-subtle {
      background: var(--app-hover, #f9fafb);
      border-color: var(--app-border, #e5e7eb);
    }

    .content-page .mt-divider {
      border-color: var(--app-border, #e5e7eb);
    }

    .content-page .content-stat-icon {
      background: var(--theme-primary-soft, #eef2ff);
      color: var(--theme-primary, #4f46e5);
    }

    .content-page .content-icon {
      background: var(--theme-primary-soft, #eef2ff);
      color: var(--theme-primary, #4f46e5);
    }

    .content-page .content-table th {
      background: var(--app-hover, #f9fafb);
      color: var(--app-muted, #6b7280);
    }

    .content-page .content-table tbody tr {
      border-color: var(--app-border, #e5e7eb);
    }

    .content-page .content-table tbody tr:hover {
      background: var(--app-hover, #f9fafb);
    }

    .content-page .content-dropdown {
      background: var(--app-surface, #ffffff);
      border-color: var(--app-border, #e5e7eb);
      color: var(--app-heading, #111827);
      box-shadow: 0 12px 30px rgba(0,0,0,.10);
    }

    .content-page .content-focus:focus-visible {
      outline: 2px solid var(--theme-primary, #4f46e5);
      outline-offset: 2px;
    }

    .content-page button:disabled {
      cursor: not-allowed;
    }
  `;

  // ====================================================
  // FETCH CONTENT
  // ====================================================

  const fetchContent = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      setError("");

      const response = await contentApi.getAll({
        page: 1,
        limit: 100,
      });

      let data = response?.data !== undefined ? response.data : response;

      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.items)) {
        list = data.items;
      } else if (Array.isArray(data?.results)) {
        list = data.results;
      } else if (Array.isArray(data?.contents)) {
        list = data.contents;
      } else if (Array.isArray(data?.content)) {
        list = data.content;
      }

      setContents(list.map(normalizeContent).filter((item) => item.id));
    } catch (err) {
      console.error("FETCH CONTENT ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load content.",
      );

      setContents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ====================================================
  // INITIAL FETCH
  // ====================================================

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // ====================================================
  // CLOSE MENU ON OUTSIDE CLICK
  // ====================================================

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);

    if (openMenuId) {
      document.addEventListener("click", closeMenu);
    }

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [openMenuId]);

  // ====================================================
  // REFRESH
  // ====================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await fetchContent({ silent: true });
    } finally {
      setRefreshing(false);
    }
  };

  // ====================================================
  // SUMMARY
  // ====================================================

  const summary = useMemo(
    () => ({
      total: contents.length,

      published: contents.filter((item) => item.status === "Published").length,

      draft: contents.filter((item) => item.status === "Draft").length,

      scheduled: contents.filter((item) => item.status === "Scheduled").length,

      archived: contents.filter((item) => item.status === "Archived").length,

      totalViews: contents.reduce(
        (sum, item) => sum + Number(item.views || 0),
        0,
      ),
    }),
    [contents],
  );

  // ====================================================
  // AVAILABLE TYPES
  // ====================================================

  const availableTypes = useMemo(
    () =>
      [...new Set(contents.map((item) => item.type).filter(Boolean))].sort(),
    [contents],
  );

  // ====================================================
  // FILTER CONTENT
  // ====================================================

  const filteredContents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return contents.filter((item) => {
      const matchesSearch =
        !query ||
        [item.title, item.slug, item.author, item.category, item.type].some(
          (value) =>
            String(value || "")
              .toLowerCase()
              .includes(query),
        );

      return (
        matchesSearch &&
        (statusFilter === "All" || item.status === statusFilter) &&
        (typeFilter === "All" || item.type === typeFilter)
      );
    });
  }, [contents, search, statusFilter, typeFilter]);

  // ====================================================
  // FILTER HELPERS
  // ====================================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
  };

  const hasFilters = Boolean(
    search || statusFilter !== "All" || typeFilter !== "All",
  );

  // ====================================================
  // CREATE CONTENT
  // ====================================================

  const handleCreateContent = (type) => {
    setShowCreateModal(false);

    navigate(`/content/create?type=${type}`);
  };

  // ====================================================
  // VIEW CONTENT
  // ====================================================

  const handleView = (content) => {
    if (!content?.id) return;

    setOpenMenuId(null);

    navigate(`/content/${content.id}`);
  };

  // ====================================================
  // EDIT CONTENT
  // ====================================================

  const handleEdit = (content) => {
    if (!content?.id) return;

    setOpenMenuId(null);

    navigate(`/content/${content.id}/edit`);
  };

  // ====================================================
  // DELETE CONTENT
  // ====================================================

  const handleDelete = async (content) => {
    if (
      !content?.id ||
      !window.confirm(`Are you sure you want to delete "${content.title}"?`)
    ) {
      return;
    }

    try {
      setActionLoading(`delete-${content.id}`);

      setOpenMenuId(null);

      if (typeof contentApi.delete !== "function") {
        throw new Error("Delete API is not available.");
      }

      await contentApi.delete(content.id);

      setContents((current) =>
        current.filter((item) => item.id !== content.id),
      );
    } catch (err) {
      console.error("DELETE CONTENT ERROR:", err);

      window.alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete content.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ====================================================
  // DUPLICATE CONTENT
  // ====================================================

  const handleDuplicate = async (content) => {
    if (!content?.id) return;

    try {
      setActionLoading(`duplicate-${content.id}`);

      setOpenMenuId(null);

      if (typeof contentApi.duplicate !== "function") {
        throw new Error("Duplicate API is not available.");
      }

      await contentApi.duplicate(content.id);

      await fetchContent({ silent: true });
    } catch (err) {
      console.error("DUPLICATE CONTENT ERROR:", err);

      window.alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to duplicate content.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ====================================================
  // PUBLISH CONTENT
  // ====================================================

  const handlePublish = async (content) => {
    if (!content?.id) return;

    try {
      setActionLoading(`publish-${content.id}`);

      setOpenMenuId(null);

      if (typeof contentApi.publish !== "function") {
        throw new Error("Publish API is not available.");
      }

      await contentApi.publish(content.id);

      await fetchContent({ silent: true });
    } catch (err) {
      console.error("PUBLISH CONTENT ERROR:", err);

      window.alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to publish content.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ====================================================
  // RENDER ACTIONS
  // ====================================================

  const renderActions = (content, mobile = false) => {
    const isPublished = content.status === "Published";

    const busy = ["delete", "publish", "duplicate"].some(
      (action) => actionLoading === `${action}-${content.id}`,
    );

    const menuOpen = openMenuId === content.id;

    // ----------------------------------------------
    // MOBILE ACTIONS
    // ----------------------------------------------

    if (mobile) {
      return (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleView(content)}
            className="inline-flex items-center gap-1.5 rounded-lg border mt-divider px-3 py-2 text-xs font-semibold mt-heading transition mt-hover"
          >
            <Eye size={13} />
            View
          </button>

          <button
            type="button"
            onClick={() => handleEdit(content)}
            className="inline-flex items-center gap-1.5 rounded-lg border mt-divider px-3 py-2 text-xs font-semibold mt-heading transition mt-hover"
          >
            <PenLine size={13} />
            Edit
          </button>

          {!isPublished && (
            <button
              type="button"
              disabled={busy}
              onClick={() => handlePublish(content)}
              className="inline-flex items-center gap-1.5 rounded-lg border mt-divider px-3 py-2 text-xs font-semibold mt-heading transition mt-hover disabled:opacity-50"
            >
              <Send size={13} />
              Publish
            </button>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={() => handleDelete(content)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      );
    }

    // ----------------------------------------------
    // DESKTOP ACTIONS
    // ----------------------------------------------

    return (
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          title="View content"
          onClick={() => handleView(content)}
          className="rounded-lg p-2 mt-muted transition mt-hover hover:mt-primary"
        >
          <Eye size={15} />
        </button>

        <button
          type="button"
          title="Edit content"
          onClick={() => handleEdit(content)}
          className="rounded-lg p-2 mt-muted transition mt-hover hover:mt-primary"
        >
          <PenLine size={15} />
        </button>

        <div className="relative" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            title="More actions"
            disabled={busy}
            onClick={() => setOpenMenuId(menuOpen ? null : content.id)}
            className="rounded-lg p-2 mt-muted transition mt-hover hover:mt-primary disabled:opacity-50"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <MoreHorizontal size={16} />
            )}
          </button>

          {menuOpen && (
            <div className="content-dropdown absolute right-0 top-9 z-40 w-48 overflow-hidden rounded-xl border p-1.5">
              <button
                type="button"
                onClick={() => handleView(content)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition mt-hover"
              >
                <Eye size={14} className="mt-muted" />
                View Content
              </button>

              <button
                type="button"
                onClick={() => handleEdit(content)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition mt-hover"
              >
                <PenLine size={14} className="mt-muted" />
                Edit Content
              </button>

              {!isPublished && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handlePublish(content)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition mt-hover disabled:opacity-50"
                >
                  <Send size={14} className="text-emerald-600" />
                  Publish
                </button>
              )}

              <button
                type="button"
                disabled={busy}
                onClick={() => handleDuplicate(content)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition mt-hover disabled:opacity-50"
              >
                <Copy size={14} className="mt-muted" />
                Duplicate
              </button>

              <div className="my-1 border-t mt-divider" />

              <button
                type="button"
                disabled={busy}
                onClick={() => handleDelete(content)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={14} />
                Delete Content
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="content-page">
      <style>{themeStyles}</style>

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

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

                <span className="font-medium mt-primary">Content</span>

                <span className="rounded-full border mt-divider mt-subtle px-2 py-0.5 text-[10px] font-semibold">
                  {summary.total}
                </span>
              </div>

              <div className="mt-3">
                <h1 className="text-xl font-bold tracking-tight mt-heading">
                  Content
                </h1>

                <p className="mt-1 text-xs mt-muted">
                  Create, optimize, publish and manage your business content.
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
                <RefreshCw
                  size={14}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => navigate("/content/calendar")}
                className="inline-flex h-9 items-center gap-2 rounded-lg border mt-divider mt-card px-3 text-xs font-semibold mt-muted transition mt-hover"
              >
                <CalendarDays size={14} />
                Calendar
              </button>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-semibold mt-primary-bg transition"
              >
                <Plus size={15} />
                Create Content
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="space-y-4 px-5 py-5">
        {/* ERROR ALERT */}

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={17} className="shrink-0 text-red-600" />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-red-800">
                Unable to load content
              </p>

              <p className="mt-0.5 break-words text-xs text-red-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchContent()}
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

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Content"
            value={summary.total}
            description="All content items"
            icon={FileText}
          />

          <SummaryCard
            title="Published"
            value={summary.published}
            description="Live content"
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            title="Drafts"
            value={summary.draft}
            description="Content in progress"
            icon={PenLine}
            iconClass="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            title="Total Views"
            value={summary.totalViews.toLocaleString("en-IN")}
            description="Combined content views"
            icon={Eye}
            iconClass="bg-blue-50 text-blue-600"
          />
        </section>

        {/* ==================================================
            CONTENT TABLE
        ================================================== */}

        <section className="mt-card overflow-visible rounded-xl border shadow-sm">
          {/* TOOLBAR */}

          <div className="border-b mt-divider p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              {/* STATUS TABS */}

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  {
                    label: "All",
                    value: "All",
                    count: summary.total,
                  },
                  {
                    label: "Published",
                    value: "Published",
                    count: summary.published,
                  },
                  {
                    label: "Draft",
                    value: "Draft",
                    count: summary.draft,
                  },
                  {
                    label: "Scheduled",
                    value: "Scheduled",
                    count: summary.scheduled,
                  },
                  {
                    label: "Archived",
                    value: "Archived",
                    count: summary.archived,
                  },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                      statusFilter === tab.value
                        ? "mt-primary-bg"
                        : "mt-subtle mt-muted border border-transparent"
                    }`}
                  >
                    {tab.label}

                    <span className="ml-1 opacity-75">{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* SEARCH AND FILTERS */}

              <div className="flex flex-col gap-2 sm:flex-row">
                {/* SEARCH */}

                <div className="relative w-full sm:w-[260px]">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 mt-muted"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search title, author, category..."
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
                    <option value="Archived">Archived</option>
                  </select>

                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 mt-muted"
                  />
                </div>

                {/* TYPE FILTER */}

                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="mt-input h-9 w-full appearance-none rounded-lg pl-3 pr-9 text-xs font-medium sm:w-[145px]"
                  >
                    <option value="All">All Types</option>

                    {availableTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 mt-muted"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LOADING */}

          {loading ? (
            <LoadingState />
          ) : error ? (
            <div className="px-5 py-10 text-center">
              <AlertCircle size={22} className="mx-auto text-red-500" />

              <p className="mt-3 text-xs font-semibold mt-heading">
                Could not load content
              </p>

              <button
                type="button"
                onClick={() => fetchContent()}
                className="mt-3 text-xs font-semibold mt-primary"
              >
                Try again
              </button>
            </div>
          ) : filteredContents.length === 0 ? (
            <EmptyState
              hasFilters={hasFilters}
              onClear={clearFilters}
              onCreate={() => setShowCreateModal(true)}
            />
          ) : (
            <>
              {/* ==================================================
                  DESKTOP TABLE
              ================================================== */}

              <div className="hidden overflow-x-auto md:block">
                <table className="content-table w-full min-w-[1000px] border-collapse">
                  <thead>
                    <tr className="border-b mt-divider">
                      <th className="px-5 py-3 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Content
                        </span>
                      </th>

                      <th className="px-5 py-3 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Type
                        </span>
                      </th>

                      <th className="px-5 py-3 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Status
                        </span>
                      </th>

                      <th className="px-5 py-3 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Author
                        </span>
                      </th>

                      <th className="px-5 py-3 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Views
                        </span>
                      </th>

                      <th className="px-5 py-3 text-left">
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

                  <tbody>
                    {filteredContents.map((content) => (
                      <tr key={content.id} className="border-b transition">
                        {/* CONTENT */}

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="content-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                              <FileText size={17} />
                            </div>

                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => handleView(content)}
                                className="block max-w-[300px] truncate text-left text-xs font-bold mt-heading transition hover:mt-primary"
                              >
                                {content.title}
                              </button>

                              <div className="mt-1 flex items-center gap-1.5 text-[10px] mt-muted">
                                {content.slug && (
                                  <>
                                    <span className="max-w-[150px] truncate">
                                      /{content.slug}
                                    </span>

                                    <span>·</span>
                                  </>
                                )}

                                <span className="truncate">
                                  {content.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* TYPE */}

                        <td className="px-5 py-3.5">
                          <TypeBadge type={content.type} />
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-3.5">
                          <StatusBadge status={content.status} />
                        </td>

                        {/* AUTHOR */}

                        <td className="px-5 py-3.5">
                          <span className="text-xs font-medium mt-heading">
                            {content.author}
                          </span>
                        </td>

                        {/* VIEWS */}

                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold mt-heading">
                            <Eye size={13} className="mt-muted" />

                            {content.views.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* UPDATED */}

                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs mt-muted">
                            <Clock3 size={13} />

                            {content.updatedAt}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-3.5">
                          {renderActions(content)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ==================================================
                  MOBILE CARDS
              ================================================== */}

              <div className="divide-y mt-divider md:hidden">
                {filteredContents.map((content) => (
                  <article key={content.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="content-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                        <FileText size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleView(content)}
                          className="line-clamp-2 text-left text-sm font-bold mt-heading"
                        >
                          {content.title}
                        </button>

                        {content.slug && (
                          <p className="mt-1 truncate text-[10px] mt-muted">
                            /{content.slug}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <TypeBadge type={content.type} />

                          <StatusBadge status={content.status} />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="rounded-lg border mt-divider mt-subtle p-2.5">
                            <span className="block text-[10px] mt-muted">
                              Author
                            </span>

                            <span className="mt-1 block truncate text-xs font-semibold mt-heading">
                              {content.author}
                            </span>
                          </div>

                          <div className="rounded-lg border mt-divider mt-subtle p-2.5">
                            <span className="block text-[10px] mt-muted">
                              Views
                            </span>

                            <span className="mt-1 block text-xs font-semibold mt-heading">
                              {content.views.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="rounded-lg border mt-divider mt-subtle p-2.5">
                            <span className="block text-[10px] mt-muted">
                              Category
                            </span>

                            <span className="mt-1 block truncate text-xs font-semibold mt-heading">
                              {content.category}
                            </span>
                          </div>

                          <div className="rounded-lg border mt-divider mt-subtle p-2.5">
                            <span className="block text-[10px] mt-muted">
                              Updated
                            </span>

                            <span className="mt-1 block truncate text-xs font-semibold mt-heading">
                              {content.updatedAt}
                            </span>
                          </div>
                        </div>

                        {renderActions(content, true)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* ==================================================
                  FOOTER
              ================================================== */}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t mt-divider px-4 py-3">
                <p className="text-[10px] mt-muted">
                  Showing{" "}
                  <span className="font-bold mt-heading">
                    {filteredContents.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold mt-heading">
                    {contents.length}
                  </span>{" "}
                  content items
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[10px] font-semibold mt-primary"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* ==================================================
          CREATE CONTENT MODAL
      ================================================== */}

      {showCreateModal && (
        <CreateContentModal
          onClose={() => setShowCreateModal(false)}
          onSelect={handleCreateContent}
        />
      )}
    </div>
  );
}
