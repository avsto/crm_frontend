import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  Megaphone,
  MessageCircle,
  Mail,
  Smartphone,
  Bell,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  Pause,
  Play,
  XCircle,
  BarChart3,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Loader2,
  Send,
} from "lucide-react";

import campaignApi from "../../api/campaign.api";

// ======================================================
// HELPERS
// ======================================================

const getResponseData = (response) =>
  response?.data?.data ?? response?.data ?? response ?? {};

const getCampaignId = (campaign) => campaign?._id || campaign?.id;

const getStatus = (status = "") =>
  String(status).toLowerCase().replace(/\s+/g, "_");

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

const getChannelIcon = (channel) => {
  switch (String(channel || "").toLowerCase()) {
    case "whatsapp":
      return MessageCircle;
    case "email":
      return Mail;
    case "sms":
      return Smartphone;
    case "notification":
      return Bell;
    default:
      return Send;
  }
};

const getStatusStyle = (status) => {
  const styles = {
    draft: "bg-slate-100 text-slate-600",
    scheduled: "bg-blue-50 text-blue-700",
    running: "bg-emerald-50 text-emerald-700",
    active: "bg-emerald-50 text-emerald-700",
    paused: "bg-amber-50 text-amber-700",
    completed: "bg-violet-50 text-violet-700",
    cancelled: "bg-rose-50 text-rose-700",
    failed: "bg-red-50 text-red-700",
  };

  return styles[getStatus(status)] || "bg-slate-100 text-slate-600";
};

const getStatusIcon = (status) => {
  switch (getStatus(status)) {
    case "completed":
      return CheckCircle2;
    case "scheduled":
      return CalendarDays;
    case "running":
    case "active":
      return Play;
    case "paused":
      return Pause;
    case "failed":
      return AlertCircle;
    default:
      return Clock3;
  }
};

const getCampaignsFromResponse = (response) => {
  const data = getResponseData(response);

  if (Array.isArray(data)) return data;

  return data?.campaigns || data?.results || data?.items || data?.data || [];
};

// ======================================================
// SMALL COMPONENTS
// ======================================================

const StatusBadge = ({ status }) => {
  const Icon = getStatusIcon(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusStyle(
        status,
      )}`}
    >
      <Icon size={12} />
      {String(status || "draft").replace(/_/g, " ")}
    </span>
  );
};

const ChannelBadge = ({ channel }) => {
  const Icon = getChannelIcon(channel);

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-xs font-medium capitalize text-[var(--app-heading)]">
      <Icon size={13} className="text-[var(--theme-primary)]" />
      {channel || "Campaign"}
    </span>
  );
};

const EmptyState = ({ onCreate, search }) => (
  <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--theme-primary-soft)]">
      <Megaphone size={28} className="text-[var(--theme-primary)]" />
    </div>

    <h3 className="text-base font-semibold text-[var(--app-heading)]">
      {search ? "No campaigns found" : "No campaigns yet"}
    </h3>

    <p className="mt-1 max-w-sm text-sm text-[var(--app-muted)]">
      {search
        ? "Try changing your search or filters."
        : "Create your first marketing campaign and start reaching your audience."}
    </p>

    {!search && (
      <button
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--theme-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <Plus size={16} />
        Create Campaign
      </button>
    )}
  </div>
);

// ======================================================
// MAIN COMPONENT
// ======================================================

const Campaign = () => {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ====================================================
  // FETCH CAMPAIGNS
  // ====================================================

  const fetchCampaigns = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await campaignApi.getCampaigns({
        page: 1,
        limit: 1000,
      });

      const list = getCampaignsFromResponse(response);

      setCampaigns(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Fetch campaigns error:", error);
      setCampaigns([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // ====================================================
  // FILTER CAMPAIGNS
  // ====================================================

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const name = String(
        campaign?.name || campaign?.campaignName || "",
      ).toLowerCase();

      const description = String(campaign?.description || "").toLowerCase();

      const channel = String(
        campaign?.channel || campaign?.type || "",
      ).toLowerCase();

      const status = getStatus(campaign?.status);

      const searchMatch =
        !search ||
        name.includes(search.toLowerCase()) ||
        description.includes(search.toLowerCase()) ||
        channel.includes(search.toLowerCase());

      const statusMatch = statusFilter === "all" || status === statusFilter;

      const channelMatch = channelFilter === "all" || channel === channelFilter;

      return searchMatch && statusMatch && channelMatch;
    });
  }, [campaigns, search, statusFilter, channelFilter]);

  // ====================================================
  // PAGINATION
  // ====================================================

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / limit));

  const currentPage = Math.min(page, totalPages);

  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * limit;

    return filteredCampaigns.slice(start, start + limit);
  }, [filteredCampaigns, currentPage, limit]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, channelFilter]);

  // ====================================================
  // STATISTICS
  // ====================================================

  const stats = useMemo(() => {
    const count = (status) =>
      campaigns.filter((item) => getStatus(item?.status) === status).length;

    return {
      total: campaigns.length,
      running: count("running"),
      scheduled: count("scheduled"),
      completed: count("completed"),
    };
  }, [campaigns]);

  // ====================================================
  // NAVIGATION
  // ====================================================

  const handleCreate = () => {
    navigate("/marketing/campaigns/create");
  };

  const handleView = (campaign) => {
    navigate(`/marketing/campaigns/${getCampaignId(campaign)}`);
  };

  const handleEdit = (campaign) => {
    navigate(`/marketing/campaigns/${getCampaignId(campaign)}/edit`);
  };

  const handleStats = (campaign) => {
    navigate(`/marketing/campaigns/${getCampaignId(campaign)}/stats`);
  };

  // ====================================================
  // CAMPAIGN ACTIONS
  // ====================================================

  const runCampaignAction = async (campaign, action) => {
    const id = getCampaignId(campaign);

    if (!id) return;

    try {
      setActionLoading(true);
      setActiveMenu(null);

      if (action === "pause") {
        await campaignApi.pauseCampaign(id);
      } else if (action === "resume") {
        await campaignApi.resumeCampaign(id);
      } else if (action === "cancel") {
        await campaignApi.cancelCampaign(id);
      }

      await fetchCampaigns(true);
    } catch (error) {
      console.error(`Campaign ${action} error:`, error);
      window.alert(
        error?.response?.data?.message ||
          `Unable to ${action} campaign. Please try again.`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (campaign) => {
    setSelectedCampaign(campaign);
    setShowDeleteModal(true);
    setActiveMenu(null);
  };

  const handleDelete = async () => {
    if (!selectedCampaign) return;

    try {
      setActionLoading(true);

      await campaignApi.deleteCampaign(getCampaignId(selectedCampaign));

      setShowDeleteModal(false);
      setSelectedCampaign(null);

      await fetchCampaigns(true);
    } catch (error) {
      console.error("Delete campaign error:", error);

      window.alert(
        error?.response?.data?.message || "Unable to delete campaign.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ====================================================
  // RENDER ACTION MENU
  // ====================================================

  const renderActionMenu = (campaign) => {
    const id = getCampaignId(campaign);
    const status = getStatus(campaign?.status);

    return (
      <div className="absolute right-0 top-9 z-30 w-48 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-1 shadow-xl">
        <button
          onClick={() => handleView(campaign)}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-[var(--app-heading)] hover:bg-[var(--app-hover)]"
        >
          <Eye size={15} />
          View Campaign
        </button>

        <button
          onClick={() => handleEdit(campaign)}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-[var(--app-heading)] hover:bg-[var(--app-hover)]"
        >
          <Edit3 size={15} />
          Edit Campaign
        </button>

        <button
          onClick={() => handleStats(campaign)}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-[var(--app-heading)] hover:bg-[var(--app-hover)]"
        >
          <BarChart3 size={15} />
          View Analytics
        </button>

        <div className="my-1 border-t border-[var(--app-border)]" />

        {status === "running" && (
          <button
            onClick={() => runCampaignAction(campaign, "pause")}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-amber-600 hover:bg-amber-50"
          >
            <Pause size={15} />
            Pause Campaign
          </button>
        )}

        {status === "paused" && (
          <button
            onClick={() => runCampaignAction(campaign, "resume")}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-emerald-600 hover:bg-emerald-50"
          >
            <Play size={15} />
            Resume Campaign
          </button>
        )}

        {["running", "scheduled", "paused"].includes(status) && (
          <button
            onClick={() => runCampaignAction(campaign, "cancel")}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-orange-600 hover:bg-orange-50"
          >
            <XCircle size={15} />
            Cancel Campaign
          </button>
        )}

        <button
          onClick={() => openDeleteModal(campaign)}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 size={15} />
          Delete Campaign
        </button>

        <span className="hidden">{id}</span>
      </div>
    );
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <div
      className="min-h-screen space-y-5 bg-[var(--app-bg)] p-4 sm:p-5 lg:p-6"
      onClick={() => activeMenu && setActiveMenu(null)}
    >
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-[var(--app-muted)]">
            <span>Marketing</span>
            <span>/</span>
            <span className="text-[var(--app-heading)]">Campaigns</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--app-heading)]">
            Campaigns
          </h1>

          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Create, manage and track your marketing campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(event) => {
              event.stopPropagation();
              fetchCampaigns(true);
            }}
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm font-medium text-[var(--app-heading)] transition hover:bg-[var(--app-hover)] disabled:opacity-60"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleCreate}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--theme-primary)] px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Plus size={17} />
            Create Campaign
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          {
            label: "Total Campaigns",
            value: stats.total,
            icon: Megaphone,
            description: "All campaigns",
          },
          {
            label: "Running",
            value: stats.running,
            icon: Play,
            description: "Currently active",
          },
          {
            label: "Scheduled",
            value: stats.scheduled,
            icon: CalendarDays,
            description: "Upcoming campaigns",
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: CheckCircle2,
            description: "Successfully completed",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-[var(--app-muted)] sm:text-sm">
                    {item.label}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-[var(--app-heading)]">
                    {formatNumber(item.value)}
                  </h3>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
                  <Icon size={19} />
                </div>
              </div>

              <p className="mt-2 text-xs text-[var(--app-muted)]">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* MAIN CONTENT */}
      <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]">
        {/* SECTION HEADER */}
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--app-border)] p-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-[var(--app-heading)]">
              All Campaigns
            </h2>

            <p className="mt-0.5 text-xs text-[var(--app-muted)]">
              Manage and monitor all your campaigns in one place.
            </p>
          </div>

          <span className="w-fit rounded-lg bg-[var(--theme-primary-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--theme-primary)]">
            {filteredCampaigns.length} Campaigns
          </span>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col gap-3 border-b border-[var(--app-border)] p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-muted)]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="h-10 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] pl-10 pr-9 text-sm text-[var(--app-heading)] outline-none transition placeholder:text-[var(--app-muted)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-soft)]"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--app-muted)] hover:text-[var(--app-heading)]"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Filter
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-muted)]"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full min-w-[145px] appearance-none rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] pl-9 pr-8 text-sm text-[var(--app-heading)] outline-none focus:border-[var(--theme-primary)] sm:w-auto"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="running">Running</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="h-10 min-w-[145px] rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm text-[var(--app-heading)] outline-none focus:border-[var(--theme-primary)]"
            >
              <option value="all">All Channels</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="notification">Notification</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-[var(--app-muted)]">
              <Loader2
                size={20}
                className="animate-spin text-[var(--theme-primary)]"
              />
              Loading campaigns...
            </div>
          </div>
        ) : paginatedCampaigns.length === 0 ? (
          <EmptyState
            onCreate={handleCreate}
            search={search || statusFilter !== "all" || channelFilter !== "all"}
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-[var(--app-border)] bg-[var(--app-bg)]">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                      Campaign
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                      Channel
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                      Status
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                      Audience
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                      Created
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--app-border)]">
                  {paginatedCampaigns.map((campaign) => {
                    const id = getCampaignId(campaign);

                    const name =
                      campaign?.name ||
                      campaign?.campaignName ||
                      "Untitled Campaign";

                    const channel =
                      campaign?.channel || campaign?.type || "Campaign";

                    const audience =
                      campaign?.audienceCount ??
                      campaign?.totalRecipients ??
                      campaign?.recipientsCount ??
                      campaign?.recipients?.length ??
                      campaign?.audience?.count ??
                      0;

                    return (
                      <tr
                        key={id}
                        className="transition hover:bg-[var(--app-hover)]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
                              {React.createElement(getChannelIcon(channel), {
                                size: 18,
                              })}
                            </div>

                            <div className="min-w-0">
                              <button
                                onClick={() => handleView(campaign)}
                                className="max-w-[260px] truncate text-left text-sm font-semibold text-[var(--app-heading)] hover:text-[var(--theme-primary)]"
                              >
                                {name}
                              </button>

                              <p className="mt-0.5 max-w-[260px] truncate text-xs text-[var(--app-muted)]">
                                {campaign?.description || "Marketing campaign"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <ChannelBadge channel={channel} />
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge status={campaign?.status} />
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-[var(--app-heading)]">
                            {formatNumber(audience)}
                          </span>
                          <p className="mt-0.5 text-xs text-[var(--app-muted)]">
                            Recipients
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-[var(--app-heading)]">
                            {formatDate(
                              campaign?.createdAt || campaign?.created_at,
                            )}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="relative flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(activeMenu === id ? null : id);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-heading)]"
                            >
                              <MoreHorizontal size={19} />
                            </button>

                            {activeMenu === id && (
                              <div onClick={(e) => e.stopPropagation()}>
                                {renderActionMenu(campaign)}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="space-y-3 p-3 md:hidden">
              {paginatedCampaigns.map((campaign) => {
                const id = getCampaignId(campaign);

                const name =
                  campaign?.name ||
                  campaign?.campaignName ||
                  "Untitled Campaign";

                const channel =
                  campaign?.channel || campaign?.type || "Campaign";

                const audience =
                  campaign?.audienceCount ??
                  campaign?.totalRecipients ??
                  campaign?.recipientsCount ??
                  campaign?.recipients?.length ??
                  campaign?.audience?.count ??
                  0;

                return (
                  <div
                    key={id}
                    className="rounded-xl border border-[var(--app-border)] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
                          {React.createElement(getChannelIcon(channel), {
                            size: 18,
                          })}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-[var(--app-heading)]">
                            {name}
                          </h3>

                          <p className="mt-0.5 text-xs text-[var(--app-muted)]">
                            {formatDate(
                              campaign?.createdAt || campaign?.created_at,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="relative shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === id ? null : id);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-muted)] hover:bg-[var(--app-hover)]"
                        >
                          <MoreHorizontal size={19} />
                        </button>

                        {activeMenu === id && (
                          <div onClick={(e) => e.stopPropagation()}>
                            {renderActionMenu(campaign)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <ChannelBadge channel={channel} />
                      <StatusBadge status={campaign?.status} />
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[var(--app-border)] pt-3">
                      <div>
                        <p className="text-xs text-[var(--app-muted)]">
                          Audience
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-[var(--app-heading)]">
                          {formatNumber(audience)} recipients
                        </p>
                      </div>

                      <button
                        onClick={() => handleView(campaign)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--theme-primary)]"
                      >
                        View Details
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* PAGINATION */}
        {!loading && filteredCampaigns.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--app-border)] px-4 py-3 sm:flex-row">
            <p className="text-xs text-[var(--app-muted)]">
              Showing{" "}
              <span className="font-semibold text-[var(--app-heading)]">
                {(currentPage - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-[var(--app-heading)]">
                {Math.min(currentPage * limit, filteredCampaigns.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[var(--app-heading)]">
                {filteredCampaigns.length}
              </span>{" "}
              campaigns
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-heading)] transition hover:bg-[var(--app-hover)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                  (number) =>
                    number === 1 ||
                    number === totalPages ||
                    Math.abs(number - currentPage) <= 1,
                )
                .map((number, index, array) => (
                  <React.Fragment key={number}>
                    {index > 0 && number - array[index - 1] > 1 && (
                      <span className="px-1 text-xs text-[var(--app-muted)]">
                        ...
                      </span>
                    )}

                    <button
                      onClick={() => setPage(number)}
                      className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition ${
                        currentPage === number
                          ? "bg-[var(--theme-primary)] text-white"
                          : "border border-[var(--app-border)] text-[var(--app-heading)] hover:bg-[var(--app-hover)]"
                      }`}
                    >
                      {number}
                    </button>
                  </React.Fragment>
                ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-heading)] transition hover:bg-[var(--app-hover)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            if (!actionLoading) {
              setShowDeleteModal(false);
              setSelectedCampaign(null);
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={21} />
              </div>

              <button
                disabled={actionLoading}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCampaign(null);
                }}
                className="rounded-lg p-1.5 text-[var(--app-muted)] hover:bg-[var(--app-hover)]"
              >
                <X size={19} />
              </button>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[var(--app-heading)]">
              Delete Campaign?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[var(--app-heading)]">
                {selectedCampaign?.name ||
                  selectedCampaign?.campaignName ||
                  "this campaign"}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                disabled={actionLoading}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCampaign(null);
                }}
                className="rounded-lg border border-[var(--app-border)] px-4 py-2.5 text-sm font-medium text-[var(--app-heading)] hover:bg-[var(--app-hover)]"
              >
                Cancel
              </button>

              <button
                disabled={actionLoading}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {actionLoading && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                Delete Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaign;
