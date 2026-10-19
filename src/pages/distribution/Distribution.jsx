import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import distributionApi from "../../api/distribution.api";

// ======================================================
// CHANNELS
// ======================================================

const CHANNELS = [
  {
    key: "facebook",
    label: "Facebook",
    icon: FaFacebook,
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: FaInstagram,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedin,
  },
  {
    key: "website",
    label: "Website",
    icon: Globe,
  },
  {
    key: "backlink",
    label: "Backlink",
    icon: ExternalLink,
  },
  {
    key: "newsletter",
    label: "Newsletter",
    icon: Mail,
  },
];

// ======================================================
// STATUS CONFIG
// ======================================================

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock3,
  },

  processing: {
    label: "Processing",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Loader2,
  },

  published: {
    label: "Published",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },

  failed: {
    label: "Failed",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },

  skipped: {
    label: "Skipped",
    className: "bg-gray-50 text-gray-600 border-gray-200",
    icon: AlertCircle,
  },

  draft: {
    label: "Draft",
    className: "bg-gray-50 text-gray-600 border-gray-200",
    icon: FileText,
  },
};

// ======================================================
// HELPERS
// ======================================================

const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const normalizeStatus = (value) => {
  return String(value || "pending").toLowerCase();
};

const getStatusConfig = (status) => {
  const normalizedStatus = normalizeStatus(status);

  return (
    STATUS_CONFIG[normalizedStatus] || {
      label: status || "Unknown",
      className: "bg-gray-50 text-gray-600 border-gray-200",
      icon: AlertCircle,
    }
  );
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getChannelByKey = (channel) => {
  const key = String(channel || "").toLowerCase();

  return (
    CHANNELS.find((item) => item.key === key) || {
      key,
      label: channel || "Unknown",
      icon: FileText,
    }
  );
};

// ======================================================
// STATUS BADGE
// ======================================================

const StatusBadge = ({ status }) => {
  const normalizedStatus = normalizeStatus(status);
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon
        size={13}
        className={normalizedStatus === "processing" ? "animate-spin" : ""}
      />

      {config.label}
    </span>
  );
};

// ======================================================
// CHANNEL STATUS ITEM
// ======================================================

const ChannelStatusItem = ({ channelKey, data }) => {
  const channel = getChannelByKey(channelKey);
  const Icon = channel.icon;

  const enabled = data?.enabled === true;

  const total = Number(data?.total) || 0;
  const published = Number(data?.published) || 0;
  const pending = Number(data?.pending) || 0;
  const failed = Number(data?.failed) || 0;

  const channelStatus =
    data?.status ||
    (failed > 0
      ? "failed"
      : published > 0 && pending === 0
        ? "published"
        : pending > 0
          ? "pending"
          : enabled
            ? "pending"
            : "skipped");

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700">
            <Icon size={17} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {channel.label}
            </p>

            <p className="mt-0.5 text-xs text-gray-500">
              {enabled ? "Connected target" : "Not enabled"}
            </p>
          </div>
        </div>

        <StatusBadge status={channelStatus} />
      </div>

      {enabled && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-2.5">
            <p className="text-[11px] text-gray-500">Total</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{total}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-2.5">
            <p className="text-[11px] text-gray-500">Published</p>
            <p className="mt-1 text-sm font-semibold text-green-700">
              {published}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-2.5">
            <p className="text-[11px] text-gray-500">Pending</p>
            <p className="mt-1 text-sm font-semibold text-amber-700">
              {pending}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-2.5">
            <p className="text-[11px] text-gray-500">Failed</p>
            <p className="mt-1 text-sm font-semibold text-red-700">{failed}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ======================================================
// DISTRIBUTION LOG ROW
// ======================================================

const DistributionLogRow = ({ log, retryingId, onRetry }) => {
  const channel = getChannelByKey(log?.channel);
  const ChannelIcon = channel.icon;

  const logId = log?._id || log?.id;

  const status = normalizeStatus(log?.status);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700">
                <ChannelIcon size={15} />
              </div>

              <span className="text-sm font-semibold text-gray-900">
                {channel.label}
              </span>
            </div>

            <StatusBadge status={log?.status} />
          </div>

          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs text-gray-400">Target</p>
              <p className="mt-0.5 truncate font-medium text-gray-700">
                {log?.targetName || log?.targetId || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">URL</p>

              {log?.targetUrl ? (
                <a
                  href={log.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate font-medium text-gray-700 hover:text-gray-900 hover:underline"
                >
                  <span className="truncate">{log.targetUrl}</span>

                  <ExternalLink size={12} className="shrink-0" />
                </a>
              ) : (
                <p className="mt-0.5 text-gray-700">-</p>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-400">External Post</p>

              {log?.externalUrl ? (
                <a
                  href={log.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900 hover:underline"
                >
                  View Post
                  <ExternalLink size={12} />
                </a>
              ) : (
                <p className="mt-0.5 truncate text-gray-700">
                  {log?.externalPostId || "-"}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-400">Published</p>

              <p className="mt-0.5 text-gray-700">
                {formatDate(log?.publishedAt)}
              </p>
            </div>
          </div>

          {status === "failed" && log?.error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <span className="font-semibold">Error:</span> {log.error}
            </div>
          )}
        </div>

        {/* ACTION */}
        {status === "failed" && (
          <button
            type="button"
            onClick={() => onRetry(log)}
            disabled={retryingId === logId}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {retryingId === logId ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <RefreshCw size={15} />
            )}
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

// ======================================================
// CONTENT CARD
// ======================================================

const ContentCard = ({
  content,
  expanded,
  onToggle,
  distributing,
  onDistribute,
  retryingId,
  onRetry,
}) => {
  const totalTargets = Number(content?.totalTargets) || 0;

  const publishedTargets = Number(content?.publishedTargets) || 0;

  const failedTargets = Number(content?.failedTargets) || 0;

  const pendingTargets = Number(content?.pendingTargets) || 0;

  const progress =
    totalTargets > 0
      ? Math.min(100, Math.round((publishedTargets / totalTargets) * 100))
      : 0;

  const logs = safeArray(content?.logs);

  const contentId = content?.contentId;

  const contentStatus = normalizeStatus(content?.status);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          {/* CONTENT INFO */}
          <div className="flex min-w-0 flex-1 gap-3">
            <button
              type="button"
              onClick={onToggle}
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              aria-label={
                expanded ? "Collapse distribution" : "Expand distribution"
              }
            >
              {expanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-semibold text-gray-900">
                  {content?.title || "Untitled Content"}
                </h3>

                <StatusBadge status={content?.status} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                {content?.type && (
                  <span>
                    Type:{" "}
                    <span className="font-medium text-gray-700">
                      {content.type}
                    </span>
                  </span>
                )}

                {content?.keyword && (
                  <span>
                    Keyword:{" "}
                    <span className="font-medium text-gray-700">
                      {content.keyword}
                    </span>
                  </span>
                )}

                {contentId && (
                  <span>
                    ID:{" "}
                    <span className="font-mono text-gray-700">{contentId}</span>
                  </span>
                )}

                {content?.publishedAt && (
                  <span>
                    Published:{" "}
                    <span className="font-medium text-gray-700">
                      {formatDate(content.publishedAt)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {failedTargets > 0 && (
              <button
                type="button"
                onClick={() => onRetry(content)}
                disabled={retryingId === (content?._id || contentId)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {retryingId === (content?._id || contentId) ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <RefreshCw size={15} />
                )}
                Retry Failed
              </button>
            )}

            <button
              type="button"
              onClick={() => onDistribute(contentId)}
              disabled={distributing || !contentId}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {distributing ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              Distribute
            </button>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-gray-600">
              Distribution Progress
            </span>

            <span className="text-xs font-semibold text-gray-900">
              {publishedTargets}/{totalTargets} published
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gray-900 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
            <span>
              Total: <strong className="text-gray-700">{totalTargets}</strong>
            </span>

            <span>
              Published:{" "}
              <strong className="text-green-700">{publishedTargets}</strong>
            </span>

            <span>
              Pending:{" "}
              <strong className="text-amber-700">{pendingTargets}</strong>
            </span>

            <span>
              Failed: <strong className="text-red-700">{failedTargets}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* EXPANDED */}
      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50/60 p-5">
          {/* CHANNELS */}
          <div>
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-900">
                Distribution Channels
              </h4>

              <p className="mt-1 text-xs text-gray-500">
                Current status across all connected distribution channels.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {CHANNELS.map((channel) => (
                <ChannelStatusItem
                  key={channel.key}
                  channelKey={channel.key}
                  data={content?.channels?.[channel.key]}
                />
              ))}
            </div>
          </div>

          {/* LOGS */}
          <div className="mt-6">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-900">
                Distribution Targets
              </h4>

              <p className="mt-1 text-xs text-gray-500">
                Detailed publishing activity for this content.
              </p>
            </div>

            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <DistributionLogRow
                    key={log?._id || log?.id || `${contentId}-${index}`}
                    log={log}
                    retryingId={retryingId}
                    onRetry={onRetry}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <Send size={18} />
                </div>

                <p className="mt-3 text-sm font-medium text-gray-900">
                  No distribution activity yet
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Start distribution to publish this content across your
                  connected channels.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const Distribution = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [channelFilter, setChannelFilter] = useState("all");

  const [expandedContent, setExpandedContent] = useState(null);

  const [retryingId, setRetryingId] = useState(null);

  const [distributingContentId, setDistributingContentId] = useState(null);

  // ====================================================
  // LOAD REPORTS
  // ====================================================

  const loadReports = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await distributionApi.getReports({
        page: 1,
        limit: 100,
      });

      const items = Array.isArray(response?.data?.items)
        ? response.data.items
        : Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response?.data)
            ? response.data
            : [];

      setReports(items);
    } catch (err) {
      console.error("DISTRIBUTION REPORT ERROR:", err?.response?.data || err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load distribution reports",
      );

      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadReports(true);
  }, []);

  // ====================================================
  // FILTERED REPORTS
  // ====================================================

  const filteredReports = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return reports.filter((content) => {
      const title = String(content?.title || "").toLowerCase();

      const keyword = String(content?.keyword || "").toLowerCase();

      const contentId = String(content?.contentId || "").toLowerCase();

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        keyword.includes(searchValue) ||
        contentId.includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        normalizeStatus(content?.status) === statusFilter;

      let matchesChannel = true;

      if (channelFilter !== "all") {
        const channelData = content?.channels?.[channelFilter];

        matchesChannel =
          channelData?.enabled === true || Number(channelData?.total) > 0;
      }

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [reports, search, statusFilter, channelFilter]);

  // ====================================================
  // CLEAR FILTERS
  // ====================================================

  const hasFilters =
    search.trim() !== "" || statusFilter !== "all" || channelFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setChannelFilter("all");
  };

  // ====================================================
  // DISTRIBUTE
  // ====================================================

  const handleDistribute = async (contentId) => {
    if (!contentId) return;

    try {
      setDistributingContentId(contentId);

      await distributionApi.distribute(contentId);

      await loadReports(false);
    } catch (err) {
      console.error("DISTRIBUTE ERROR:", err?.response?.data || err);

      window.alert(
        err?.response?.data?.message || err?.message || "Distribution failed",
      );
    } finally {
      setDistributingContentId(null);
    }
  };

  // ====================================================
  // RETRY
  // ====================================================

  const handleRetry = async (item) => {
    const contentId = item?.contentId || item?.content?.contentId;

    if (!contentId) return;

    const retryId = item?._id || item?.id || contentId;

    try {
      setRetryingId(retryId);

      await distributionApi.retry(contentId);

      await loadReports(false);
    } catch (err) {
      console.error("RETRY DISTRIBUTION ERROR:", err?.response?.data || err);

      window.alert(
        err?.response?.data?.message || err?.message || "Retry failed",
      );
    } finally {
      setRetryingId(null);
    }
  };

  // ====================================================
  // TOGGLE CONTENT
  // ====================================================

  const toggleContent = (contentId) => {
    setExpandedContent((current) => (current === contentId ? null : contentId));
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* LEFT */}
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
                <span className="font-medium text-gray-800">Distribution</span>
              </div>

              <h1 className="text-1xl font-bold tracking-tight text-gray-900">
                Distribution
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Monitor and manage content distribution across connected
                channels.
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => loadReports(false)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="mx-auto max-w-[1600px] px-6 py-6">
        {/* ERROR */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-800">
                Unable to load distribution
              </p>

              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* ==================================================
            CONTENT LIBRARY STYLE SECTION
        ================================================== */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* SECTION HEADER */}
          <div className="border-b border-gray-200 px-5 pt-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              {/* TITLE + COUNT */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                
                  {/* COUNT */}
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 text-xs font-medium text-gray-600">
                    {filteredReports.length}{" "}
                    {filteredReports.length === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>

              {/* FILTERS */}
              <div className="flex flex-col gap-2 sm:flex-row">
                {/* SEARCH */}
                <div className="relative min-w-0 sm:w-64">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search content..."
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                  />
                </div>

                {/* STATUS */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                >
                  <option value="all">All Status</option>

                  <option value="pending">Pending</option>

                  <option value="processing">Processing</option>

                  <option value="published">Published</option>

                  <option value="failed">Failed</option>

                  <option value="skipped">Skipped</option>

                  <option value="draft">Draft</option>
                </select>

                {/* CHANNEL */}
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                >
                  <option value="all">All Channels</option>

                  {CHANNELS.map((channel) => (
                    <option key={channel.key} value={channel.key}>
                      {channel.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* COUNT / ACTIVE FILTER */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-gray-600 transition hover:text-gray-900 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* ==================================================
              CONTENT LIST
          ================================================== */}

          <div className="p-5">
            {/* LOADING */}
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex flex-col items-center">
                  <Loader2 size={24} className="animate-spin text-gray-500" />

                  <p className="mt-3 text-sm text-gray-500">
                    Loading distribution...
                  </p>
                </div>
              </div>
            ) : filteredReports.length === 0 ? (
              /* EMPTY */
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <Send size={20} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-gray-900">
                  No distribution records found
                </h3>

                <p className="mt-1 max-w-md text-sm text-gray-500">
                  {hasFilters
                    ? "Try changing your search or filters to find distribution records."
                    : "Distribution records will appear here once content is sent to connected channels."}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              /* LIST */
              <div className="space-y-4">
                {filteredReports.map((content, index) => {
                  const contentId =
                    content?.contentId || content?._id || `content-${index}`;

                  return (
                    <ContentCard
                      key={contentId}
                      content={content}
                      expanded={expandedContent === contentId}
                      onToggle={() => toggleContent(contentId)}
                      distributing={
                        distributingContentId === content?.contentId
                      }
                      onDistribute={handleDistribute}
                      retryingId={retryingId}
                      onRetry={handleRetry}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Distribution;
