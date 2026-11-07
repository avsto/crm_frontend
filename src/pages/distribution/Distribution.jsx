// src/pages/content/Distribution.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";

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
  X,
  XCircle,
  BarChart3,
  Eye,
  Radio,
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
// STATUS CONFIGURATION
// ======================================================

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
  },

  processing: {
    label: "Processing",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: Loader2,
  },

  published: {
    label: "Published",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },

  failed: {
    label: "Failed",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: XCircle,
  },

  skipped: {
    label: "Skipped",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: AlertCircle,
  },

  draft: {
    label: "Draft",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: FileText,
  },
};

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "published",
  "failed",
  "skipped",
  "draft",
];

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
      className: "border-slate-200 bg-slate-100 text-slate-600",
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

const getContentId = (content) => {
  return content?.contentId || content?._id || content?.id;
};

const getRetryId = (item) => {
  return item?._id || item?.id || item?.contentId;
};

const getLogId = (log) => {
  return log?._id || log?.id;
};

// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({ status }) {
  const normalizedStatus = normalizeStatus(status);
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${config.className}`}
    >
      <Icon
        size={12}
        className={normalizedStatus === "processing" ? "animate-spin" : ""}
      />

      {config.label}
    </span>
  );
}

// ======================================================
// CHANNEL BADGE
// ======================================================

function ChannelBadge({ channelKey }) {
  const channel = getChannelByKey(channelKey);
  const Icon = channel.icon;

  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold mt-heading">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg border mt-divider mt-subtle">
        <Icon size={14} />
      </span>

      {channel.label}
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
            iconClass || "distribution-stat-icon"
          }`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

// ======================================================
// CHANNEL STATUS ITEM
// ======================================================

function ChannelStatusItem({ channelKey, data }) {
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
    <div className="rounded-xl border mt-divider mt-subtle p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="distribution-channel-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border mt-divider">
            <Icon size={17} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-bold mt-heading">
              {channel.label}
            </p>

            <p className="mt-1 text-[10px] mt-muted">
              {enabled ? "Connected target" : "Not enabled"}
            </p>
          </div>
        </div>

        <StatusBadge status={channelStatus} />
      </div>

      {enabled && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border mt-divider mt-card p-2.5">
            <p className="text-[10px] mt-muted">Total</p>

            <p className="mt-1 text-sm font-bold mt-heading">{total}</p>
          </div>

          <div className="rounded-lg border mt-divider mt-card p-2.5">
            <p className="text-[10px] mt-muted">Published</p>

            <p className="mt-1 text-sm font-bold text-emerald-600">
              {published}
            </p>
          </div>

          <div className="rounded-lg border mt-divider mt-card p-2.5">
            <p className="text-[10px] mt-muted">Pending</p>

            <p className="mt-1 text-sm font-bold text-amber-600">{pending}</p>
          </div>

          <div className="rounded-lg border mt-divider mt-card p-2.5">
            <p className="text-[10px] mt-muted">Failed</p>

            <p className="mt-1 text-sm font-bold text-red-600">{failed}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================
// DISTRIBUTION LOG ROW
// ======================================================

function DistributionLogRow({ log, retryingId, onRetry }) {
  const channel = getChannelByKey(log?.channel);
  const ChannelIcon = channel.icon;

  const logId = getLogId(log);

  const status = normalizeStatus(log?.status);

  const isRetrying = retryingId === logId;

  return (
    <div className="rounded-xl border mt-divider mt-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="distribution-channel-icon flex h-8 w-8 items-center justify-center rounded-lg border mt-divider">
                <ChannelIcon size={15} />
              </div>

              <span className="text-xs font-bold mt-heading">
                {channel.label}
              </span>
            </div>

            <StatusBadge status={log?.status} />
          </div>

          <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2 xl:grid-cols-4">
            {/* TARGET */}

            <div className="min-w-0">
              <p className="text-[10px] mt-muted">Target</p>

              <p className="mt-1 truncate font-semibold mt-heading">
                {log?.targetName || log?.targetId || "-"}
              </p>
            </div>

            {/* TARGET URL */}

            <div className="min-w-0">
              <p className="text-[10px] mt-muted">URL</p>

              {log?.targetUrl ? (
                <a
                  href={log.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex max-w-full items-center gap-1 font-semibold mt-primary hover:underline"
                >
                  <span className="truncate">{log.targetUrl}</span>

                  <ExternalLink size={11} className="shrink-0" />
                </a>
              ) : (
                <p className="mt-1 font-semibold mt-heading">-</p>
              )}
            </div>

            {/* EXTERNAL POST */}

            <div className="min-w-0">
              <p className="text-[10px] mt-muted">External Post</p>

              {log?.externalUrl ? (
                <a
                  href={log.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 font-semibold mt-primary hover:underline"
                >
                  View Post
                  <ExternalLink size={11} />
                </a>
              ) : (
                <p className="mt-1 truncate font-semibold mt-heading">
                  {log?.externalPostId || "-"}
                </p>
              )}
            </div>

            {/* PUBLISHED */}

            <div>
              <p className="text-[10px] mt-muted">Published</p>

              <p className="mt-1 font-semibold mt-heading">
                {formatDate(log?.publishedAt)}
              </p>
            </div>
          </div>

          {/* ERROR */}

          {status === "failed" && log?.error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <span className="font-bold">Error:</span> {log.error}
            </div>
          )}
        </div>

        {/* RETRY */}

        {status === "failed" && (
          <button
            type="button"
            onClick={() => onRetry(log)}
            disabled={isRetrying}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border mt-divider mt-card px-3.5 py-2 text-xs font-semibold mt-heading transition mt-hover disabled:opacity-50"
          >
            {isRetrying ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

// ======================================================
// CONTENT DISTRIBUTION CARD
// ======================================================

function ContentCard({
  content,
  expanded,
  onToggle,
  distributing,
  onDistribute,
  retryingId,
  onRetry,
}) {
  const totalTargets = Number(content?.totalTargets) || 0;

  const publishedTargets = Number(content?.publishedTargets) || 0;

  const failedTargets = Number(content?.failedTargets) || 0;

  const pendingTargets = Number(content?.pendingTargets) || 0;

  const progress =
    totalTargets > 0
      ? Math.min(100, Math.round((publishedTargets / totalTargets) * 100))
      : 0;

  const logs = safeArray(content?.logs);

  const contentId = getContentId(content);

  const retryId = getRetryId(content);

  const isRetrying = retryingId === retryId;

  const contentStatus = normalizeStatus(content?.status);

  return (
    <article className="mt-card overflow-hidden rounded-xl border shadow-sm">
      {/* ==================================================
          CARD HEADER
      ================================================== */}

      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          {/* CONTENT INFO */}

          <div className="flex min-w-0 flex-1 gap-3">
            <button
              type="button"
              onClick={onToggle}
              aria-label={
                expanded ? "Collapse distribution" : "Expand distribution"
              }
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border mt-divider mt-subtle transition mt-hover"
            >
              {expanded ? (
                <ChevronDown size={17} />
              ) : (
                <ChevronRight size={17} />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-bold mt-heading">
                  {content?.title || "Untitled Content"}
                </h3>

                <StatusBadge status={content?.status} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] mt-muted">
                {content?.type && (
                  <span>
                    Type:{" "}
                    <span className="font-semibold mt-heading">
                      {content.type}
                    </span>
                  </span>
                )}

                {content?.keyword && (
                  <span>
                    Keyword:{" "}
                    <span className="font-semibold mt-heading">
                      {content.keyword}
                    </span>
                  </span>
                )}

                {contentId && (
                  <span>
                    ID:{" "}
                    <span className="font-mono mt-heading">{contentId}</span>
                  </span>
                )}

                {content?.publishedAt && (
                  <span>
                    Published:{" "}
                    <span className="font-semibold mt-heading">
                      {formatDate(content.publishedAt)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex shrink-0 flex-wrap items-center gap-2 pl-12 xl:pl-0">
            {failedTargets > 0 && (
              <button
                type="button"
                onClick={() => onRetry(content)}
                disabled={isRetrying}
                className="inline-flex h-9 items-center gap-2 rounded-lg border mt-divider mt-card px-3 text-xs font-semibold mt-heading transition mt-hover disabled:opacity-50"
              >
                {isRetrying ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Retry Failed
              </button>
            )}

            <button
              type="button"
              onClick={() => onDistribute(contentId)}
              disabled={distributing || !contentId}
              className="inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-semibold mt-primary-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {distributing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Distribute
            </button>
          </div>
        </div>

        {/* ==================================================
            PROGRESS
        ================================================== */}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold mt-muted">
              Distribution Progress
            </span>

            <span className="text-[11px] font-bold mt-heading">
              {publishedTargets}/{totalTargets} published
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full mt-subtle">
            <div
              className="h-full rounded-full mt-primary-bg transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[10px] mt-muted">
            <span>
              Total: <strong className="mt-heading">{totalTargets}</strong>
            </span>

            <span>
              Published:{" "}
              <strong className="text-emerald-600">{publishedTargets}</strong>
            </span>

            <span>
              Pending:{" "}
              <strong className="text-amber-600">{pendingTargets}</strong>
            </span>

            <span>
              Failed: <strong className="text-red-600">{failedTargets}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================
          EXPANDED CONTENT
      ================================================== */}

      {expanded && (
        <div className="border-t mt-divider mt-subtle p-4 sm:p-5">
          {/* CHANNELS */}

          <div>
            <div className="mb-3">
              <h4 className="text-xs font-bold mt-heading">
                Distribution Channels
              </h4>

              <p className="mt-1 text-[10px] mt-muted">
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
              <h4 className="text-xs font-bold mt-heading">
                Distribution Targets
              </h4>

              <p className="mt-1 text-[10px] mt-muted">
                Detailed publishing activity for this content.
              </p>
            </div>

            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <DistributionLogRow
                    key={getLogId(log) || `${contentId}-${index}`}
                    log={log}
                    retryingId={retryingId}
                    onRetry={onRetry}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed mt-divider mt-card px-5 py-10 text-center">
                <div className="distribution-stat-icon mx-auto flex h-10 w-10 items-center justify-center rounded-xl">
                  <Send size={17} />
                </div>

                <p className="mt-3 text-xs font-bold mt-heading">
                  No distribution activity yet
                </p>

                <p className="mt-1 text-[10px] mt-muted">
                  Start distribution to publish this content across your
                  connected channels.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

// ======================================================
// LOADING STATE
// ======================================================

function LoadingState() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
      <div className="distribution-stat-icon flex h-12 w-12 items-center justify-center rounded-xl">
        <Loader2 size={22} className="animate-spin" />
      </div>

      <p className="mt-4 text-xs font-bold mt-heading">
        Loading distribution reports
      </p>

      <p className="mt-1 text-[10px] mt-muted">
        Please wait while we load your distribution data.
      </p>
    </div>
  );
}

// ======================================================
// EMPTY STATE
// ======================================================

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed mt-divider mt-subtle px-6 text-center">
      <div className="distribution-stat-icon flex h-12 w-12 items-center justify-center rounded-xl">
        <Radio size={21} />
      </div>

      <h3 className="mt-4 text-sm font-bold mt-heading">
        No distribution records found
      </h3>

      <p className="mt-2 max-w-md text-xs leading-5 mt-muted">
        {hasFilters
          ? "Try changing your search or filters to find distribution records."
          : "Distribution records will appear here once content is sent to your connected channels."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 h-9 rounded-lg border mt-divider mt-card px-4 text-xs font-semibold mt-heading transition mt-hover"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function Distribution() {
  const navigate = useNavigate();

  // ====================================================
  // STATES
  // ====================================================

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
  // THEME STYLES
  // ====================================================

  const themeStyles = `
    .distribution-page {
      min-height: 100vh;
      background: var(--app-bg, #f8fafc);
      color: var(--app-heading, #111827);
    }

    .distribution-page .mt-card {
      background: var(--app-surface, #ffffff);
      border-color: var(--app-border, #e5e7eb);
      color: var(--app-heading, #111827);
    }

    .distribution-page .mt-heading {
      color: var(--app-heading, #111827);
    }

    .distribution-page .mt-muted {
      color: var(--app-muted, #6b7280);
    }

    .distribution-page .mt-primary {
      color: var(--theme-primary, #4f46e5);
    }

    .distribution-page .mt-primary-bg {
      background: var(--theme-primary, #4f46e5);
      color: #ffffff;
    }

    .distribution-page .mt-primary-bg:hover {
      filter: brightness(.94);
    }

    .distribution-page .mt-primary-soft {
      background: var(--theme-primary-soft, #eef2ff);
      color: var(--theme-primary, #4f46e5);
      border-color: var(--theme-primary-border, #c7d2fe);
    }

    .distribution-page .mt-input {
      background: var(--app-surface, #ffffff);
      color: var(--app-heading, #111827);
      border: 1px solid var(--app-border, #e5e7eb);
    }

    .distribution-page .mt-input:focus {
      border-color: var(--theme-primary, #4f46e5);
      box-shadow: 0 0 0 3px var(--theme-primary-soft, #eef2ff);
      outline: none;
    }

    .distribution-page .mt-input::placeholder {
      color: var(--app-muted, #9ca3af);
    }

    .distribution-page .mt-hover:hover {
      background: var(--app-hover, #f3f4f6);
    }

    .distribution-page .mt-subtle {
      background: var(--app-hover, #f9fafb);
      border-color: var(--app-border, #e5e7eb);
    }

    .distribution-page .mt-divider {
      border-color: var(--app-border, #e5e7eb);
    }

    .distribution-page .distribution-stat-icon {
      background: var(--theme-primary-soft, #eef2ff);
      color: var(--theme-primary, #4f46e5);
    }

    .distribution-page .distribution-channel-icon {
      background: var(--app-surface, #ffffff);
      color: var(--app-muted, #6b7280);
    }

    .distribution-page button:disabled {
      cursor: not-allowed;
    }

    .distribution-page select option {
      background: var(--app-surface, #ffffff);
      color: var(--app-heading, #111827);
    }
  `;

  // ====================================================
  // LOAD REPORTS
  // ====================================================

  const loadReports = useCallback(async (showLoader = true) => {
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
          "Failed to load distribution reports.",
      );

      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadReports(true);
  }, [loadReports]);

  // ====================================================
  // SUMMARY
  // ====================================================

  const summary = useMemo(() => {
    return reports.reduce(
      (result, content) => {
        result.total += 1;

        const status = normalizeStatus(content?.status);

        if (status === "published") result.published += 1;
        if (status === "pending") result.pending += 1;
        if (status === "processing") result.processing += 1;
        if (status === "failed") result.failed += 1;

        result.totalTargets += Number(content?.totalTargets) || 0;

        result.publishedTargets += Number(content?.publishedTargets) || 0;

        result.failedTargets += Number(content?.failedTargets) || 0;

        return result;
      },
      {
        total: 0,
        published: 0,
        pending: 0,
        processing: 0,
        failed: 0,
        totalTargets: 0,
        publishedTargets: 0,
        failedTargets: 0,
      },
    );
  }, [reports]);

  // ====================================================
  // FILTERED REPORTS
  // ====================================================

  const filteredReports = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return reports.filter((content) => {
      const title = String(content?.title || "").toLowerCase();

      const keyword = String(content?.keyword || "").toLowerCase();

      const contentId = String(
        content?.contentId || content?._id || "",
      ).toLowerCase();

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
  // FILTER HELPERS
  // ====================================================

  const hasFilters = Boolean(
    search.trim() || statusFilter !== "all" || channelFilter !== "all",
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setChannelFilter("all");
  };

  // ====================================================
  // REFRESH
  // ====================================================

  const handleRefresh = () => {
    if (!refreshing) {
      loadReports(false);
    }
  };

  // ====================================================
  // DISTRIBUTE
  // ====================================================

  const handleDistribute = async (contentId) => {
    if (!contentId || distributingContentId) return;

    try {
      setDistributingContentId(contentId);

      await distributionApi.distribute(contentId);

      await loadReports(false);
    } catch (err) {
      console.error("DISTRIBUTE ERROR:", err?.response?.data || err);

      window.alert(
        err?.response?.data?.message || err?.message || "Distribution failed.",
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

    if (!contentId || retryingId) return;

    const retryId = getRetryId(item);

    try {
      setRetryingId(retryId);

      await distributionApi.retry(contentId);

      await loadReports(false);
    } catch (err) {
      console.error("RETRY DISTRIBUTION ERROR:", err?.response?.data || err);

      window.alert(
        err?.response?.data?.message || err?.message || "Retry failed.",
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
    <div className="distribution-page">
      <style>{themeStyles}</style>

      {/* ==================================================
          HEADER
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

                <span className="font-semibold mt-primary">Distribution</span>

                <span className="rounded-full border mt-divider mt-subtle px-2 py-0.5 text-[10px] font-semibold">
                  {summary.total}
                </span>
              </div>

              <div className="mt-3">
                <h1 className="text-xl font-bold tracking-tight mt-heading">
                  Distribution
                </h1>

                <p className="mt-1 text-xs mt-muted">
                  Monitor and manage content distribution across your connected
                  channels.
                </p>
              </div>
            </div>

            {/* RIGHT */}

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
                Unable to load distribution
              </p>

              <p className="mt-0.5 break-words text-xs text-red-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => loadReports(true)}
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
            description="Distribution records"
            icon={FileText}
          />

          <SummaryCard
            title="Published"
            value={summary.published}
            description="Successfully published"
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            title="Pending"
            value={summary.pending + summary.processing}
            description="Waiting or processing"
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            title="Failed"
            value={summary.failed}
            description="Records needing attention"
            icon={XCircle}
            iconClass="bg-red-50 text-red-600"
          />
        </section>

        {/* ==================================================
            DISTRIBUTION OVERVIEW
        ================================================== */}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="mt-card rounded-xl border p-4">
            <div className="flex items-center gap-2">
              <div className="distribution-stat-icon flex h-8 w-8 items-center justify-center rounded-lg">
                <Radio size={16} />
              </div>

              <p className="text-[11px] font-semibold mt-muted">
                Total Targets
              </p>
            </div>

            <p className="mt-3 text-xl font-bold mt-heading">
              {summary.totalTargets.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="mt-card rounded-xl border p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={16} />
              </div>

              <p className="text-[11px] font-semibold mt-muted">
                Published Targets
              </p>
            </div>

            <p className="mt-3 text-xl font-bold text-emerald-600">
              {summary.publishedTargets.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="mt-card rounded-xl border p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <AlertCircle size={16} />
              </div>

              <p className="text-[11px] font-semibold mt-muted">
                Failed Targets
              </p>
            </div>

            <p className="mt-3 text-xl font-bold text-red-600">
              {summary.failedTargets.toLocaleString("en-IN")}
            </p>
          </div>
        </section>

        {/* ==================================================
            DISTRIBUTION LIST
        ================================================== */}

        <section className="mt-card overflow-hidden rounded-xl border shadow-sm">
          {/* TOOLBAR */}

          <div className="border-b mt-divider p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              {/* TITLE */}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold mt-heading">
                    Distribution Reports
                  </h2>

                  <span className="rounded-full border mt-divider mt-subtle px-2 py-0.5 text-[10px] font-semibold mt-muted">
                    {filteredReports.length}
                  </span>
                </div>

                <p className="mt-1 text-[10px] mt-muted">
                  Track publishing activity and channel performance.
                </p>
              </div>

              {/* SEARCH AND FILTERS */}

              <div className="flex flex-col gap-2 sm:flex-row">
                {/* SEARCH */}

                <div className="relative w-full sm:w-[230px]">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 mt-muted"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search content..."
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

                {/* STATUS */}

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="mt-input h-9 w-full appearance-none rounded-lg pl-3 pr-8 text-xs font-medium sm:w-[145px]"
                  >
                    <option value="all">All Status</option>

                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_CONFIG[status].label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 mt-muted"
                  />
                </div>

                {/* CHANNEL */}

                <div className="relative">
                  <select
                    value={channelFilter}
                    onChange={(event) => setChannelFilter(event.target.value)}
                    className="mt-input h-9 w-full appearance-none rounded-lg pl-3 pr-8 text-xs font-medium sm:w-[150px]"
                  >
                    <option value="all">All Channels</option>

                    {CHANNELS.map((channel) => (
                      <option key={channel.key} value={channel.key}>
                        {channel.label}
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

            {/* ACTIVE FILTERS */}

            {hasFilters && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[10px] mt-muted">Filters are active</p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[10px] font-semibold mt-primary"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* ==================================================
              CONTENT LIST
          ================================================== */}

          <div className="p-4 sm:p-5">
            {loading ? (
              <LoadingState />
            ) : error && reports.length === 0 ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                <AlertCircle size={22} className="text-red-500" />

                <p className="mt-3 text-xs font-semibold mt-heading">
                  Could not load distribution reports
                </p>

                <button
                  type="button"
                  onClick={() => loadReports(true)}
                  className="mt-3 text-xs font-semibold mt-primary"
                >
                  Try again
                </button>
              </div>
            ) : filteredReports.length === 0 ? (
              <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
            ) : (
              <>
                <div className="space-y-3">
                  {filteredReports.map((content, index) => {
                    const contentId =
                      getContentId(content) || `content-${index}`;

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

                {/* FOOTER */}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t mt-divider pt-4">
                  <p className="text-[10px] mt-muted">
                    Showing{" "}
                    <span className="font-bold mt-heading">
                      {filteredReports.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold mt-heading">
                      {reports.length}
                    </span>{" "}
                    distribution records
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
          </div>
        </section>
      </main>
    </div>
  );
}
