
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  BarChart3,
  Pause,
  Play,
  XCircle,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Mail,
  Smartphone,
  Bell,
  CalendarDays,
  Loader2,
  Send,
  ArrowUpRight,
  Clock3,
  X,
  Filter,
  Megaphone,
  CheckCircle2,
} from "lucide-react";

import campaignApi from "../../api/campaign.api";

const CHANNELS = {
  whatsapp: {
    label: "WhatsApp",
    icon: MessageCircle,
    style: "bg-emerald-50 text-emerald-700",
  },
  email: {
    label: "Email",
    icon: Mail,
    style: "bg-blue-50 text-blue-700",
  },
  sms: {
    label: "SMS",
    icon: Smartphone,
    style: "bg-violet-50 text-violet-700",
  },
  notification: {
    label: "Notification",
    icon: Bell,
    style: "bg-orange-50 text-orange-700",
  },
};

const STATUSES = [
  "draft",
  "scheduled",
  "running",
  "paused",
  "completed",
  "cancelled",
  "failed",
];

const STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-600",
  scheduled: "bg-blue-50 text-blue-700",
  running: "bg-amber-50 text-amber-700",
  paused: "bg-orange-50 text-orange-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-500",
  failed: "bg-red-50 text-red-700",
};

const STATUS_DOTS = {
  draft: "bg-slate-400",
  scheduled: "bg-blue-500",
  running: "bg-amber-500",
  paused: "bg-orange-500",
  completed: "bg-emerald-500",
  cancelled: "bg-slate-400",
  failed: "bg-red-500",
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

const formatLabel = (value) => {
  if (!value) return "Unknown";

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (date, includeTime = false) => {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  return value.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  });
};

const ActionItem = ({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5",
      "text-left text-xs font-medium transition",
      danger
        ? "text-red-600 hover:bg-red-50"
        : "text-slate-700 hover:bg-slate-50"
    )}
  >
    <Icon size={15} />
    {label}
  </button>
);

const Campaign = () => {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [openMenu, setOpenMenu] = useState(null);

  // Close menus when clicking outside.
  useEffect(() => {
    const closeMenu = () => setOpenMenu(null);

    document.addEventListener("click", closeMenu);

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, []);

  // Load campaigns.
  const loadCampaigns = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = {
          page,
          limit,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (statusFilter) {
          params.status = statusFilter;
        }

        if (channelFilter) {
          params.channel = channelFilter;
        }

        const response = await campaignApi.getCampaigns(params);
        const data = response?.data;

        const list = Array.isArray(data)
          ? data
          : data?.campaigns ||
            data?.data ||
            data?.results ||
            [];

        setCampaigns(list);

        const meta = data?.pagination || data?.meta || {};

        const total =
          meta.total ??
          data?.total ??
          list.length;

        const pages =
          meta.pages ??
          data?.pages ??
          Math.max(1, Math.ceil(total / limit));

        setPagination({
          page: meta.page ?? data?.page ?? page,
          limit: meta.limit ?? data?.limit ?? limit,
          total,
          pages: Math.max(1, pages),
        });
      } catch (error) {
        console.error("Failed to load campaigns:", error);

        setCampaigns([]);

        setPagination({
          page: 1,
          limit,
          total: 0,
          pages: 1,
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, statusFilter, channelFilter]
  );

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // Reset page when filters change.
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, channelFilter]);

  // Helpers.
  const getId = (campaign) =>
    campaign?._id || campaign?.id;

  const getStats = (campaign) =>
    campaign?.stats || {};

  const getTotal = (campaign) => {
    const stats = getStats(campaign);

    return (
      stats.total ??
      campaign?.recipients?.length ??
      campaign?.leads?.length ??
      0
    );
  };

  const getSent = (campaign) =>
    getStats(campaign)?.sent ?? 0;

  const getDelivered = (campaign) =>
    getStats(campaign)?.delivered ?? 0;

  const getRead = (campaign) =>
    getStats(campaign)?.read ?? 0;

  const getFailed = (campaign) =>
    getStats(campaign)?.failed ?? 0;

  // Navigation.
  const handleView = (campaign) => {
    const id = getId(campaign);
    if (!id) return;

    setOpenMenu(null);
    navigate(`/marketing/campaigns/${id}`);
  };

  const handleEdit = (campaign) => {
    const id = getId(campaign);
    if (!id) return;

    setOpenMenu(null);
    navigate(`/marketing/campaigns/${id}/edit`);
  };

  const handleStats = (campaign) => {
    const id = getId(campaign);
    if (!id) return;

    setOpenMenu(null);
    navigate(`/marketing/campaigns/${id}/stats`);
  };

  // Campaign actions.
  const runAction = async (campaign, action) => {
    const id = getId(campaign);
    if (!id) return;

    setOpenMenu(null);

    if (
      action === "cancel" &&
      !window.confirm(
        `Cancel campaign "${campaign?.name || "this campaign"}"?`
      )
    ) {
      return;
    }

    if (
      action === "delete" &&
      !window.confirm(
        `Delete campaign "${campaign?.name || "this campaign"}"?`
      )
    ) {
      return;
    }

    try {
      if (action === "pause") {
        await campaignApi.pauseCampaign(id);
      }

      if (action === "resume") {
        await campaignApi.resumeCampaign(id);
      }

      if (action === "cancel") {
        await campaignApi.cancelCampaign(id);
      }

      if (action === "delete") {
        await campaignApi.deleteCampaign(id);
      }

      await loadCampaigns(true);
    } catch (error) {
      console.error(`Failed to ${action} campaign:`, error);

      window.alert(
        `Unable to ${action} campaign. Please try again.`
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setChannelFilter("");
    setPage(1);
  };

  const hasFilters = Boolean(
    search || statusFilter || channelFilter
  );

  const openCreate = () =>
    navigate("/marketing/campaigns/create");

  const renderStatus = (status) => (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap",
        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
        STATUS_STYLES[status] || STATUS_STYLES.draft
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          STATUS_DOTS[status] || "bg-slate-400"
        )}
      />
      {formatLabel(status)}
    </span>
  );

  const renderChannel = (channelValue) => {
    const channel =
      CHANNELS[channelValue] || CHANNELS.notification;

    const Icon = channel.icon;

    return (
      <span className="inline-flex items-center gap-2">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center",
            "rounded-xl",
            channel.style
          )}
        >
          <Icon size={17} />
        </span>

        <span className="text-xs font-medium text-slate-700">
          {channel.label}
        </span>
      </span>
    );
  };

  const renderActions = (campaign) => {
    const id = getId(campaign);
    const status = campaign?.status || "draft";

    return (
      <div
        className="relative"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Campaign actions"
          onClick={() =>
            setOpenMenu((current) =>
              current === id ? null : id
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <MoreHorizontal size={19} />
        </button>

        {openMenu === id && (
          <div className="absolute right-0 top-10 z-40 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/60">
            <ActionItem
              icon={Eye}
              label="View campaign"
              onClick={() => handleView(campaign)}
            />

            {![
              "running",
              "completed",
              "cancelled",
            ].includes(status) && (
              <ActionItem
                icon={Pencil}
                label="Edit campaign"
                onClick={() => handleEdit(campaign)}
              />
            )}

            <ActionItem
              icon={BarChart3}
              label="View statistics"
              onClick={() => handleStats(campaign)}
            />

            {status === "running" && (
              <ActionItem
                icon={Pause}
                label="Pause campaign"
                onClick={() => runAction(campaign, "pause")}
              />
            )}

            {status === "paused" && (
              <ActionItem
                icon={Play}
                label="Resume campaign"
                onClick={() => runAction(campaign, "resume")}
              />
            )}

            {[
              "draft",
              "scheduled",
              "running",
              "paused",
            ].includes(status) && (
              <ActionItem
                icon={XCircle}
                label="Cancel campaign"
                danger
                onClick={() => runAction(campaign, "cancel")}
              />
            )}

            {![
              "running",
              "completed",
            ].includes(status) && (
              <>
                <div className="my-1.5 border-t border-slate-100" />

                <ActionItem
                  icon={Trash2}
                  label="Delete campaign"
                  danger
                  onClick={() => runAction(campaign, "delete")}
                />
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-[#f8fafc] text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
              <Megaphone size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Campaigns
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create, manage and monitor your marketing campaigns.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100"
          >
            <Plus size={17} />
            Create campaign
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1800px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/30 sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search campaigns by name..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-50"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <div className="relative">
                <Filter
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-8 pr-8 text-xs font-medium text-slate-700 outline-none transition hover:bg-slate-50 focus:border-pink-400 sm:w-40 sm:text-sm"
                >
                  <option value="">All statuses</option>

                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={channelFilter}
                onChange={(event) => {
                  setChannelFilter(event.target.value);
                  setPage(1);
                }}
                className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition hover:bg-slate-50 focus:border-pink-400 sm:w-40 sm:text-sm"
              >
                <option value="">All channels</option>

                {Object.entries(CHANNELS).map(
                  ([value, channel]) => (
                    <option key={value} value={value}>
                      {channel.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex items-center gap-2 xl:ml-auto">
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 sm:flex-none sm:text-sm"
                >
                  <X size={15} />
                  Clear filters
                </button>
              )}

              <button
                type="button"
                onClick={() => loadCampaigns(true)}
                disabled={refreshing}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none sm:text-sm"
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Campaign list */}
        <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
          <div className="flex flex-col gap-1 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Campaign list
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                View campaign status, delivery and scheduling details.
              </p>
            </div>

            {hasFilters && (
              <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-medium text-pink-700 sm:mt-0">
                <Filter size={12} />
                Filters applied
              </span>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-4 py-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50">
                <Loader2
                  size={23}
                  className="animate-spin text-pink-600"
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                Loading campaigns
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Please wait while we fetch your campaigns.
              </p>
            </div>
          ) : campaigns.length === 0 ? (
            /* Empty state */
            <div className="flex min-h-72 flex-col items-center justify-center px-5 py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 ring-1 ring-slate-100">
                <Send size={25} />
              </div>

              <h3 className="mt-5 text-base font-bold text-slate-900">
                {hasFilters
                  ? "No matching campaigns"
                  : "Your campaigns start here"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {hasFilters
                  ? "Try changing your search or filters to find what you're looking for."
                  : "Create your first campaign to reach your audience through WhatsApp, email, SMS and more."}
              </p>

              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <X size={15} />
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-pink-600 px-4 text-sm font-semibold text-white transition hover:bg-pink-700"
                >
                  <Plus size={16} />
                  Create campaign
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[960px] border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.09em] text-slate-500">
                        Campaign
                      </th>

                      <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.09em] text-slate-500">
                        Channel
                      </th>

                      <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.09em] text-slate-500">
                        Status
                      </th>

                      <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.09em] text-slate-500">
                        Delivery
                      </th>

                      <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.09em] text-slate-500">
                        Schedule
                      </th>

                      <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.09em] text-slate-500">
                        Created
                      </th>

                      <th className="w-14 px-3 py-3.5" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {campaigns.map((campaign) => {
                      const id = getId(campaign);
                      const status =
                        campaign?.status || "draft";

                      const sent = getSent(campaign);
                      const delivered = getDelivered(campaign);
                      const total = getTotal(campaign);
                      const failed = getFailed(campaign);
                      const read = getRead(campaign);

                      const scheduledText =
                        campaign?.scheduledAt
                          ? formatDate(
                              campaign.scheduledAt,
                              true
                            )
                          : campaign?.sendType === "now"
                          ? "Send immediately"
                          : "Not scheduled";

                      return (
                        <tr
                          key={id}
                          className="group transition-colors hover:bg-slate-50/70"
                        >
                          {/* Campaign */}
                          <td className="max-w-[290px] px-5 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                handleView(campaign)
                              }
                              className="group/name flex max-w-full items-start gap-3 text-left"
                            >
                              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover/name:bg-pink-50 group-hover/name:text-pink-600">
                                <Megaphone size={17} />
                              </span>

                              <span className="min-w-0">
                                <span className="flex items-center gap-1.5">
                                  <span className="truncate text-sm font-semibold text-slate-800 group-hover/name:text-pink-700">
                                    {campaign?.name ||
                                      "Untitled campaign"}
                                  </span>

                                  <ArrowUpRight
                                    size={13}
                                    className="shrink-0 text-slate-300 opacity-0 transition group-hover/name:opacity-100"
                                  />
                                </span>

                                <span className="mt-1 block max-w-[250px] truncate text-xs text-slate-500">
                                  {campaign?.description ||
                                    "Marketing campaign"}
                                </span>
                              </span>
                            </button>
                          </td>

                          {/* Channel */}
                          <td className="whitespace-nowrap px-4 py-4">
                            {renderChannel(campaign?.channel)}
                          </td>

                          {/* Status */}
                          <td className="whitespace-nowrap px-4 py-4">
                            {renderStatus(status)}
                          </td>

                          {/* Delivery */}
                          <td className="px-4 py-4">
                            <div className="min-w-[150px]">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                <span className="font-semibold text-slate-700">
                                  {sent} sent
                                </span>

                                {delivered > 0 && (
                                  <span className="text-emerald-600">
                                    {delivered} delivered
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                                {total > 0 && (
                                  <span>{total} recipients</span>
                                )}

                                {read > 0 && (
                                  <span>{read} read</span>
                                )}

                                {failed > 0 && (
                                  <span className="text-red-500">
                                    {failed} failed
                                  </span>
                                )}

                                {total === 0 && sent === 0 && (
                                  <span>Awaiting delivery</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Schedule */}
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-start gap-2">
                              {campaign?.scheduledAt ? (
                                <CalendarDays
                                  size={15}
                                  className="mt-0.5 shrink-0 text-slate-400"
                                />
                              ) : (
                                <Clock3
                                  size={15}
                                  className="mt-0.5 shrink-0 text-slate-400"
                                />
                              )}

                              <span>
                                <span className="block text-xs font-medium text-slate-700">
                                  {scheduledText}
                                </span>

                                {campaign?.scheduledAt && (
                                  <span className="mt-1 block text-[10px] text-slate-400">
                                    Scheduled
                                  </span>
                                )}
                              </span>
                            </div>
                          </td>

                          {/* Created */}
                          <td className="whitespace-nowrap px-4 py-4">
                            <span className="text-xs text-slate-600">
                              {formatDate(campaign?.createdAt) ||
                                "—"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="relative px-3 py-4">
                            {renderActions(campaign)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {campaigns.map((campaign) => {
                  const id = getId(campaign);
                  const status =
                    campaign?.status || "draft";

                  const sent = getSent(campaign);
                  const delivered = getDelivered(campaign);
                  const total = getTotal(campaign);
                  const failed = getFailed(campaign);

                  return (
                    <article
                      key={id}
                      className="p-4 transition hover:bg-slate-50/60"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                          <Megaphone size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleView(campaign)
                            }
                            className="block max-w-full text-left"
                          >
                            <span className="block truncate text-sm font-bold text-slate-900">
                              {campaign?.name ||
                                "Untitled campaign"}
                            </span>
                          </button>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {campaign?.description ||
                              "Marketing campaign"}
                          </p>
                        </div>

                        {renderActions(campaign)}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {renderStatus(status)}
                        {renderChannel(campaign?.channel)}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Delivery
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-800">
                            {sent} sent
                            {delivered > 0
                              ? ` · ${delivered} delivered`
                              : ""}
                          </p>

                          {failed > 0 && (
                            <p className="mt-1 text-xs text-red-600">
                              {failed} failed
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Schedule
                          </p>

                          <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-slate-700">
                            {campaign?.scheduledAt ? (
                              <CalendarDays
                                size={13}
                                className="mt-0.5 shrink-0 text-slate-400"
                              />
                            ) : (
                              <Clock3
                                size={13}
                                className="mt-0.5 shrink-0 text-slate-400"
                              />
                            )}

                            <span>
                              {campaign?.scheduledAt
                                ? formatDate(
                                    campaign.scheduledAt,
                                    true
                                  )
                                : campaign?.sendType === "now"
                                ? "Send immediately"
                                : "Not scheduled"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-slate-400">
                          Created{" "}
                          {formatDate(campaign?.createdAt) ||
                            "—"}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleView(campaign)
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 hover:text-pink-700"
                        >
                          View details
                          <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {(page - 1) * limit + 1}
                  </span>
                  {" – "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(
                      (page - 1) * limit + campaigns.length,
                      pagination.total
                    )}
                  </span>
                  {" of "}
                  <span className="font-semibold text-slate-700">
                    {pagination.total}
                  </span>
                  {" campaigns"}
                </p>

                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={15} />
                    Previous
                  </button>

                  <span className="whitespace-nowrap px-1 text-xs font-medium text-slate-500">
                    Page {page} of {pagination.pages || 1}
                  </span>

                  <button
                    type="button"
                    disabled={
                      page >= (pagination.pages || 1) ||
                      loading
                    }
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          pagination.pages || 1,
                          current + 1
                        )
                      )
                    }
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Campaign;
