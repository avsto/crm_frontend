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
} from "lucide-react";
import contentApi from "../../api/content.api";

const STATUS_CONFIG = {
  Published: {
    className: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  Scheduled: {
    className: "border border-blue-200 bg-blue-50 text-blue-700",
    icon: Clock3,
  },
  Draft: {
    className: "border border-gray-200 bg-gray-100 text-gray-600",
    icon: PenLine,
  },
  Archived: {
    className: "border border-gray-200 bg-gray-100 text-gray-500",
    icon: FileText,
  },
};

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

const normalizeStatus = (item) => {
  const status = String(
    item?.status || item?.contentStatus || "draft",
  ).toLowerCase();
  if (["published", "publish", "live"].includes(status)) return "Published";
  if (["scheduled", "schedule"].includes(status)) return "Scheduled";
  if (["archived", "archive"].includes(status)) return "Archived";
  return "Draft";
};

const normalizeType = (item) => {
  const type = String(
    item?.type || item?.contentType || item?.format || "blog",
  ).toLowerCase();
  return (
    TYPE_LABELS[type] ||
    type.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

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

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Draft;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-600">
      {type}
    </span>
  );
}

function EmptyState({ hasFilters, onClear, onCreate }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400">
        <FileText size={22} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">
        No content found
      </h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
        {hasFilters
          ? "No content matches your current filters. Try adjusting your search."
          : "Get started by creating your first article, blog, page, or social post."}
      </p>
      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Clear filters
        </button>
      ) : (
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-black"
        >
          <Plus size={14} />
          Create Content
        </button>
      )}
    </div>
  );
}

export default function Content() {
  const navigate = useNavigate();
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

  const fetchContent = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError("");
      const response = await contentApi.getAll({ page: 1, limit: 100 });
      let data = response?.data !== undefined ? response.data : response;
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.data)) list = data.data;
      else if (Array.isArray(data?.items)) list = data.items;
      else if (Array.isArray(data?.results)) list = data.results;
      else if (Array.isArray(data?.contents)) list = data.contents;
      else if (Array.isArray(data?.content)) list = data.content;
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

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);
  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    if (openMenuId) document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [openMenuId]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchContent({ silent: true });
    } finally {
      setRefreshing(false);
    }
  };

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

  const availableTypes = useMemo(
    () =>
      [...new Set(contents.map((item) => item.type).filter(Boolean))].sort(),
    [contents],
  );
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

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
  };
  const hasFilters = Boolean(
    search || statusFilter !== "All" || typeFilter !== "All",
  );
  const handleCreateContent = (type) => {
    setShowCreateModal(false);
    navigate(`/content/create?type=${type}`);
  };
  const handleEdit = (content) => {
    if (content?.id) navigate(`/content/${content.id}/edit`);
  };
  const handleView = (content) => {
    if (content?.id) navigate(`/content/${content.id}`);
  };

  const handleDelete = async (content) => {
    if (
      !content?.id ||
      !window.confirm(`Are you sure you want to delete "${content.title}"?`)
    )
      return;
    try {
      setActionLoading(`delete-${content.id}`);
      setOpenMenuId(null);
      if (typeof contentApi.delete !== "function")
        throw new Error("Delete API is not available.");
      await contentApi.delete(content.id);
      setContents((current) =>
        current.filter((item) => item.id !== content.id),
      );
    } catch (err) {
      console.error("DELETE CONTENT ERROR:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete content.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (content) => {
    if (!content?.id) return;
    try {
      setActionLoading(`duplicate-${content.id}`);
      setOpenMenuId(null);
      if (typeof contentApi.duplicate !== "function")
        throw new Error("Duplicate API is not available.");
      await contentApi.duplicate(content.id);
      await fetchContent({ silent: true });
    } catch (err) {
      console.error("DUPLICATE CONTENT ERROR:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to duplicate content.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (content) => {
    if (!content?.id) return;
    try {
      setActionLoading(`publish-${content.id}`);
      setOpenMenuId(null);
      if (typeof contentApi.publish !== "function")
        throw new Error("Publish API is not available.");
      await contentApi.publish(content.id);
      await fetchContent({ silent: true });
    } catch (err) {
      console.error("PUBLISH CONTENT ERROR:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to publish content.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const renderActions = (content, mobile = false) => {
    const isPublished = content.status === "Published";
    const busy = ["delete", "publish", "duplicate"].some(
      (action) => actionLoading === `${action}-${content.id}`,
    );
    const menuOpen = openMenuId === content.id;
    if (mobile)
      return (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleView(content)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <Eye size={13} />
            View
          </button>
          <button
            type="button"
            onClick={() => handleEdit(content)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <PenLine size={13} />
            Edit
          </button>
          {!isPublished && (
            <button
              type="button"
              disabled={busy}
              onClick={() => handlePublish(content)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
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
    return (
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          title="View content"
          onClick={() => handleView(content)}
          className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
        >
          <Eye size={15} />
        </button>
        <button
          type="button"
          title="Edit content"
          onClick={() => handleEdit(content)}
          className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
        >
          <PenLine size={15} />
        </button>
        <div className="relative" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            title="More actions"
            disabled={busy}
            onClick={() => setOpenMenuId(menuOpen ? null : content.id)}
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <MoreHorizontal size={16} />
            )}
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
              <button
                type="button"
                onClick={() => handleView(content)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Eye size={14} className="text-gray-400" />
                View Content
              </button>
              <button
                type="button"
                onClick={() => handleEdit(content)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <PenLine size={14} className="text-gray-400" />
                Edit Content
              </button>
              {!isPublished && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handlePublish(content)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Send size={14} className="text-emerald-600" />
                  Publish
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => handleDuplicate(content)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Copy size={14} className="text-gray-400" />
                Duplicate
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                type="button"
                disabled={busy}
                onClick={() => handleDelete(content)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
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

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="border-b border-gray-200 bg-white">
        <div className="px-5 py-5 md:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2.5 flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1.5 text-gray-500 transition hover:text-gray-800"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
                <span className="text-gray-300">/</span>
                <span className="text-gray-500">Business</span>
                <span className="text-gray-300">/</span>
                <span className="font-medium text-gray-800">Content</span>
              </div>
              <h1 className="text-1xl font-bold tracking-tight text-gray-900">
                Content
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Create, optimize, publish, and manage your content.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
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
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                <CalendarDays size={14} />
                Calendar
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-black"
              >
                <Plus size={14} />
                Create Content
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 md:px-7">
        <div className="mx-auto max-w-[1450px]">
          {error && (
            <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => fetchContent()}
                className="ml-auto font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: "All", value: "All", count: summary.total },
                  {
                    label: "Published",
                    value: "Published",
                    count: summary.published,
                  },
                  { label: "Draft", value: "Draft", count: summary.draft },
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
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === tab.value ? "bg-[#111827] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
                
              </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative w-full sm:w-[260px]">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search title, author, category..."
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-xs text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-100"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-none focus:border-gray-400 sm:w-[145px]"
                  >
                    <option value="All">All Status</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Archived">Archived</option>
                  </select>
                
                </div>
              </div>
             
            </div>

            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-10 text-center">
                <Loader2 size={24} className="animate-spin text-gray-400" />
                <p className="mt-3 text-xs font-medium text-gray-500">
                  Loading content library...
                </p>
              </div>
            ) : error ? (
              <div className="px-5 py-8 text-center text-xs text-gray-500">
                Please retry to load the content library.
              </div>
            ) : filteredContents.length === 0 ? (
              <EmptyState
                hasFilters={hasFilters}
                onClear={clearFilters}
                onCreate={() => setShowCreateModal(true)}
              />
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70">
                        {[
                          ["Content", "text-left"],
                          ["Type", "text-left"],
                          ["Status", "text-left"],
                          ["Author", "text-left"],
                          ["Views", "text-left"],
                          ["Updated", "text-left"],
                          ["Actions", "text-right"],
                        ].map(([label, align]) => (
                          <th
                            key={label}
                            className={`px-5 py-3 ${align} text-[11px] font-semibold uppercase tracking-wide text-gray-500`}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredContents.map((content) => (
                        <tr
                          key={content.id}
                          className="transition hover:bg-gray-50/70"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
                                <FileText size={16} />
                              </div>
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleView(content)}
                                  className="block max-w-[320px] truncate text-left text-xs font-semibold text-gray-900 transition hover:underline"
                                >
                                  {content.title}
                                </button>
                                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500">
                                  {content.slug && (
                                    <>
                                      <span className="max-w-[180px] truncate">
                                        /{content.slug}
                                      </span>
                                      <span>•</span>
                                    </>
                                  )}
                                  <span className="truncate">
                                    {content.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <TypeBadge type={content.type} />
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={content.status} />
                          </td>
                          <td className="px-5 py-3.5 text-xs text-gray-600">
                            {content.author}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700">
                              <Eye size={13} className="text-gray-400" />
                              {content.views.toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-500">
                              <Clock3 size={13} className="text-gray-400" />
                              {content.updatedAt}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {renderActions(content)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="divide-y divide-gray-100 md:hidden">
                  {filteredContents.map((content) => (
                    <article key={content.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handleView(content)}
                            className="line-clamp-2 text-left text-sm font-semibold text-gray-900"
                          >
                            {content.title}
                          </button>
                          {content.slug && (
                            <p className="mt-1 truncate text-[11px] text-gray-500">
                              /{content.slug}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <TypeBadge type={content.type} />
                            <StatusBadge status={content.status} />
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
                              <span className="block text-[10px] uppercase tracking-wide text-gray-400">
                                Author
                              </span>
                              <span className="mt-1 block truncate text-xs font-semibold text-gray-800">
                                {content.author}
                              </span>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
                              <span className="block text-[10px] uppercase tracking-wide text-gray-400">
                                Views
                              </span>
                              <span className="mt-1 block text-xs font-semibold text-gray-800">
                                {content.views.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                          {renderActions(content, true)}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="border-t border-gray-100 px-5 py-3 text-[11px] text-gray-500">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      Showing{" "}
                      <strong className="font-semibold text-gray-700">
                        {filteredContents.length}
                      </strong>{" "}
                      of{" "}
                      <strong className="font-semibold text-gray-700">
                        {contents.length}
                      </strong>{" "}
                      content items
                    </span>
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="self-start font-semibold text-gray-600 hover:text-gray-900 sm:self-auto"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Create Content
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Choose the type of content you want to create.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={17} />
              </button>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {[
                {
                  type: "blog",
                  title: "Blog Post",
                  description: "Create SEO-friendly blog content.",
                  icon: FileText,
                },
                {
                  type: "article",
                  title: "Article",
                  description: "Write long-form content.",
                  icon: PenLine,
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
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => handleCreateContent(option.type)}
                    className="group rounded-lg border border-gray-200 p-4 text-left transition hover:border-gray-400 hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition group-hover:bg-white">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-gray-900">
                          {option.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-5 py-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
