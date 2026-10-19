
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MessageCircle,
  Mail,
  Smartphone,
  Bell,
  Users,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  MousePointerClick,
  Reply,
  XCircle,
  Pause,
  Play,
  Pencil,
  RefreshCw,
  Loader2,
  BarChart3,
  UserRound,
  FileText,
} from "lucide-react";

import campaignApi from "../../api/campaign.api";

const CampaignView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ============================================================
  // LOAD CAMPAIGN
  // ============================================================

  const loadCampaign = useCallback(
    async (refresh = false) => {
      if (!id) return;

      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await campaignApi.getCampaignById(id);

        const data = response?.data;

        setCampaign(
          data?.campaign ||
            data?.data ||
            data ||
            null
        );
      } catch (error) {
        console.error(
          "Failed to load campaign:",
          error
        );

        setCampaign(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  // ============================================================
  // HELPERS
  // ============================================================

  const stats = campaign?.stats || {};

  const channelInfo = {
    whatsapp: {
      label: "WhatsApp",
      icon: MessageCircle,
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

  const statusClasses = {
    draft:
      "bg-gray-50 text-gray-600 border-gray-200",

    scheduled:
      "bg-blue-50 text-blue-600 border-blue-200",

    running:
      "bg-amber-50 text-amber-600 border-amber-200",

    paused:
      "bg-orange-50 text-orange-600 border-orange-200",

    completed:
      "bg-green-50 text-green-600 border-green-200",

    cancelled:
      "bg-gray-50 text-gray-500 border-gray-200",

    failed:
      "bg-red-50 text-red-600 border-red-200",
  };

  const statusLabel = (value) => {
    if (!value) return "-";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "-";
    }

    return value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "-";
    }

    return value.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const channel =
    channelInfo[campaign?.channel] ||
    channelInfo.notification;

  const ChannelIcon = channel.icon;

  const total = stats.total ?? 0;
  const pending = stats.pending ?? 0;
  const queued = stats.queued ?? 0;
  const sent = stats.sent ?? 0;
  const delivered = stats.delivered ?? 0;
  const read = stats.read ?? 0;
  const failed = stats.failed ?? 0;
  const cancelled = stats.cancelled ?? 0;
  const replied = stats.replied ?? 0;
  const clicked = stats.clicked ?? 0;

  const sentPercentage =
    total > 0
      ? Math.round((sent / total) * 100)
      : 0;

  const deliveredPercentage =
    total > 0
      ? Math.round((delivered / total) * 100)
      : 0;

  const readPercentage =
    total > 0
      ? Math.round((read / total) * 100)
      : 0;

  const failedPercentage =
    total > 0
      ? Math.round((failed / total) * 100)
      : 0;

  // ============================================================
  // ACTIONS
  // ============================================================

  const handlePause = async () => {
    try {
      await campaignApi.pauseCampaign(id);
      await loadCampaign(true);
    } catch (error) {
      console.error(
        "Failed to pause campaign:",
        error
      );
    }
  };

  const handleResume = async () => {
    try {
      await campaignApi.resumeCampaign(id);
      await loadCampaign(true);
    } catch (error) {
      console.error(
        "Failed to resume campaign:",
        error
      );
    }
  };

  const handleCancel = async () => {
    const confirmed = window.confirm(
      `Cancel campaign "${
        campaign?.name || "this campaign"
      }"?`
    );

    if (!confirmed) return;

    try {
      await campaignApi.cancelCampaign(id);
      await loadCampaign(true);
    } catch (error) {
      console.error(
        "Failed to cancel campaign:",
        error
      );
    }
  };

  // ============================================================
  // RECIPIENT STATUS
  // ============================================================

  const recipientStats = useMemo(() => {
    const recipients =
      campaign?.recipients || [];

    return recipients.reduce(
      (result, recipient) => {
        const status =
          recipient?.status || "pending";

        if (result[status] !== undefined) {
          result[status] += 1;
        }

        return result;
      },
      {
        pending: 0,
        queued: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        cancelled: 0,
      }
    );
  }, [campaign]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="w-full min-h-[500px] bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={20}
            className="mx-auto animate-spin text-gray-400"
          />

          <p className="text-[12px] text-gray-500 mt-2">
            Loading campaign...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // NOT FOUND
  // ============================================================

  if (!campaign) {
    return (
      <div className="w-full min-h-[500px] bg-white">
        <div className="px-5 py-4 border-b border-gray-200">
          <button
            type="button"
            onClick={() =>
              navigate("/marketing/campaigns")
            }
            className="inline-flex items-center gap-1.5 text-[12px] text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={14} />
            Back to Campaigns
          </button>
        </div>

        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle
              size={25}
              className="mx-auto text-gray-400"
            />

            <p className="text-[13px] font-medium text-gray-700 mt-3">
              Campaign not found
            </p>

            <p className="text-[11px] text-gray-500 mt-1">
              The campaign may have been deleted or
              you don't have access to it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="w-full bg-white text-gray-900">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="px-5 py-3.5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate("/marketing/campaigns")
              }
              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
              title="Back"
            >
              <ArrowLeft size={14} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] font-semibold text-gray-900">
                  {campaign.name ||
                    "Untitled Campaign"}
                </h1>

                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium ${
                    statusClasses[
                      campaign.status
                    ] ||
                    "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {statusLabel(
                    campaign.status
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <ChannelIcon size={12} />
                  {channel.label}
                </span>

                <span className="text-gray-300">
                  •
                </span>

                <span className="text-[11px] text-gray-500">
                  Created{" "}
                  {formatDate(
                    campaign.createdAt
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Refresh */}

            <button
              type="button"
              onClick={() =>
                loadCampaign(true)
              }
              disabled={refreshing}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                size={14}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

            {/* Edit */}

            {![
              "running",
              "completed",
              "cancelled",
            ].includes(campaign.status) && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/marketing/campaigns/${id}/edit`
                  )
                }
                className="h-8 px-2.5 inline-flex items-center gap-1.5 border border-gray-200 rounded-md text-[11px] text-gray-700 hover:bg-gray-50"
              >
                <Pencil size={13} />
                Edit
              </button>
            )}

            {/* Pause */}

            {campaign.status === "running" && (
              <button
                type="button"
                onClick={handlePause}
                className="h-8 px-2.5 inline-flex items-center gap-1.5 border border-gray-200 rounded-md text-[11px] text-gray-700 hover:bg-gray-50"
              >
                <Pause size={13} />
                Pause
              </button>
            )}

            {/* Resume */}

            {campaign.status === "paused" && (
              <button
                type="button"
                onClick={handleResume}
                className="h-8 px-2.5 inline-flex items-center gap-1.5 border border-gray-200 rounded-md text-[11px] text-gray-700 hover:bg-gray-50"
              >
                <Play size={13} />
                Resume
              </button>
            )}

            {/* Cancel */}

            {[
              "draft",
              "scheduled",
              "running",
              "paused",
            ].includes(campaign.status) && (
              <button
                type="button"
                onClick={handleCancel}
                className="h-8 px-2.5 inline-flex items-center gap-1.5 border border-red-200 rounded-md text-[11px] text-red-600 hover:bg-red-50"
              >
                <XCircle size={13} />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* DESCRIPTION */}
      {/* ====================================================== */}

      {campaign.description && (
        <div className="px-5 py-3 border-b border-gray-200">
          <p className="text-[12px] text-gray-600">
            {campaign.description}
          </p>
        </div>
      )}

      {/* ====================================================== */}
      {/* STATS */}
      {/* ====================================================== */}

      <div className="grid grid-cols-5 border-b border-gray-200">
        <StatCard
          icon={Users}
          label="Total"
          value={total}
        />

        <StatCard
          icon={Send}
          label="Sent"
          value={sent}
          sub={`${sentPercentage}%`}
        />

        <StatCard
          icon={CheckCircle2}
          label="Delivered"
          value={delivered}
          sub={`${deliveredPercentage}%`}
        />

        <StatCard
          icon={Eye}
          label="Read"
          value={read}
          sub={`${readPercentage}%`}
        />

        <StatCard
          icon={AlertCircle}
          label="Failed"
          value={failed}
          sub={`${failedPercentage}%`}
          last
        />
      </div>

      {/* ====================================================== */}
      {/* MAIN CONTENT */}
      {/* ====================================================== */}

      <div className="p-5">
        <div className="grid grid-cols-12 gap-4">
          {/* ================================================== */}
          {/* LEFT */}
          {/* ================================================== */}

          <div className="col-span-8 space-y-4">
            {/* Delivery overview */}

            <div className="border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[13px] font-semibold text-gray-800">
                      Delivery Overview
                    </h2>

                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Campaign delivery performance
                    </p>
                  </div>

                  <BarChart3
                    size={15}
                    className="text-gray-400"
                  />
                </div>
              </div>

              <div className="p-4">
                <ProgressRow
                  label="Pending"
                  value={pending}
                  total={total}
                />

                <ProgressRow
                  label="Queued"
                  value={queued}
                  total={total}
                />

                <ProgressRow
                  label="Sent"
                  value={sent}
                  total={total}
                />

                <ProgressRow
                  label="Delivered"
                  value={delivered}
                  total={total}
                />

                <ProgressRow
                  label="Read"
                  value={read}
                  total={total}
                />

                <ProgressRow
                  label="Failed"
                  value={failed}
                  total={total}
                />

                <ProgressRow
                  label="Cancelled"
                  value={cancelled}
                  total={total}
                  last
                />
              </div>
            </div>

            {/* Engagement */}

            <div className="border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-[13px] font-semibold text-gray-800">
                  Engagement
                </h2>

                <p className="text-[10px] text-gray-400 mt-0.5">
                  Recipient interaction
                </p>
              </div>

              <div className="grid grid-cols-2">
                <EngagementCard
                  icon={Reply}
                  label="Replies"
                  value={replied}
                />

                <EngagementCard
                  icon={MousePointerClick}
                  label="Clicks"
                  value={clicked}
                  last
                />
              </div>
            </div>

            {/* Content */}

            <div className="border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FileText
                    size={14}
                    className="text-gray-400"
                  />

                  <h2 className="text-[13px] font-semibold text-gray-800">
                    Campaign Content
                  </h2>
                </div>
              </div>

              <div className="p-4">
                {campaign.template && (
                  <div className="mb-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                      Template
                    </p>

                    <p className="text-[12px] text-gray-700 mt-1">
                      {typeof campaign.template ===
                      "object"
                        ? campaign.template.name ||
                          campaign.template._id
                        : campaign.template}
                    </p>
                  </div>
                )}

                <ContentPreview
                  content={campaign.content}
                />
              </div>
            </div>

            {/* Recipients */}

            {campaign.recipients?.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-[13px] font-semibold text-gray-800">
                        Recipients
                      </h2>

                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Campaign recipient status
                      </p>
                    </div>

                    <span className="text-[11px] text-gray-500">
                      {campaign.recipients.length}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400">
                          Lead
                        </th>

                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400">
                          Channel
                        </th>

                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400">
                          Status
                        </th>

                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400">
                          Sent
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {campaign.recipients
                        .slice(0, 50)
                        .map(
                          (
                            recipient,
                            index
                          ) => {
                            const recipientLead =
                              recipient.lead;

                            const recipientChannel =
                              channelInfo[
                                recipient.channel
                              ] ||
                              channelInfo.notification;

                            const RecipientIcon =
                              recipientChannel.icon;

                            return (
                              <tr
                                key={
                                  recipient._id ||
                                  index
                                }
                                className="border-b border-gray-50"
                              >
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                      <UserRound
                                        size={12}
                                        className="text-gray-500"
                                      />
                                    </div>

                                    <div>
                                      <p className="text-[11px] font-medium text-gray-700">
                                        {typeof recipientLead ===
                                        "object"
                                          ? recipientLead.name ||
                                            recipientLead.email ||
                                            recipientLead.phone ||
                                            "Unknown Lead"
                                          : recipientLead ||
                                            "Unknown Lead"}
                                      </p>

                                      {typeof recipientLead ===
                                        "object" &&
                                        recipientLead.email && (
                                          <p className="text-[9px] text-gray-400">
                                            {
                                              recipientLead.email
                                            }
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-2.5">
                                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-600">
                                    <RecipientIcon
                                      size={11}
                                    />
                                    {
                                      recipientChannel.label
                                    }
                                  </span>
                                </td>

                                <td className="px-4 py-2.5">
                                  <RecipientStatus
                                    status={
                                      recipient.status
                                    }
                                  />
                                </td>

                                <td className="px-4 py-2.5">
                                  <span className="text-[10px] text-gray-500">
                                    {formatDateTime(
                                      recipient.sentAt
                                    )}
                                  </span>
                                </td>
                              </tr>
                            );
                          }
                        )}
                    </tbody>
                  </table>
                </div>

                {campaign.recipients.length >
                  50 && (
                  <div className="px-4 py-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400">
                      Showing first 50 of{" "}
                      {
                        campaign.recipients
                          .length
                      }{" "}
                      recipients.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================================================== */}
          {/* RIGHT */}
          {/* ================================================== */}

          <div className="col-span-4 space-y-4">
            {/* Campaign Details */}

            <div className="border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-[13px] font-semibold text-gray-800">
                  Campaign Details
                </h2>
              </div>

              <div className="p-4 space-y-3">
                <DetailRow
                  label="Channel"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <ChannelIcon size={12} />
                      {channel.label}
                    </span>
                  }
                />

                <DetailRow
                  label="Status"
                  value={
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium ${
                        statusClasses[
                          campaign.status
                        ] ||
                        "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {statusLabel(
                        campaign.status
                      )}
                    </span>
                  }
                />

                <DetailRow
                  label="Audience"
                  value={statusLabel(
                    campaign.audienceType
                  )}
                />

                <DetailRow
                  label="Send Type"
                  value={statusLabel(
                    campaign.sendType
                  )}
                />

                <DetailRow
                  label="Batch Size"
                  value={
                    campaign.batchSize ?? "-"
                  }
                />

                <DetailRow
                  label="Batch Delay"
                  value={
                    campaign.delayBetweenBatches !=
                    null
                      ? `${campaign.delayBetweenBatches} ms`
                      : "-"
                  }
                />
              </div>
            </div>

            {/* Schedule */}

            <div className="border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={14}
                    className="text-gray-400"
                  />

                  <h2 className="text-[13px] font-semibold text-gray-800">
                    Schedule
                  </h2>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <DetailRow
                  label="Scheduled At"
                  value={formatDateTime(
                    campaign.scheduledAt
                  )}
                />

                <DetailRow
                  label="Started At"
                  value={formatDateTime(
                    campaign.startedAt
                  )}
                />

                <DetailRow
                  label="Completed At"
                  value={formatDateTime(
                    campaign.completedAt
                  )}
                />

                <DetailRow
                  label="Cancelled At"
                  value={formatDateTime(
                    campaign.cancelledAt
                  )}
                />
              </div>
            </div>

            {/* Audience */}

            <div className="border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Users
                    size={14}
                    className="text-gray-400"
                  />

                  <h2 className="text-[13px] font-semibold text-gray-800">
                    Audience
                  </h2>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <DetailRow
                  label="Type"
                  value={statusLabel(
                    campaign.audienceType
                  )}
                />

                <DetailRow
                  label="Leads"
                  value={
                    campaign.leads?.length ??
                    total ??
                    0
                  }
                />

                {campaign.tag && (
                  <DetailRow
                    label="Tag"
                    value={
                      typeof campaign.tag ===
                      "object"
                        ? campaign.tag.name ||
                          campaign.tag._id
                        : campaign.tag
                    }
                  />
                )}
              </div>
            </div>

            {/* Recipient summary */}

            <div className="border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-[13px] font-semibold text-gray-800">
                  Recipient Summary
                </h2>
              </div>

              <div className="grid grid-cols-2">
                <MiniStat
                  label="Pending"
                  value={
                    recipientStats.pending
                  }
                />

                <MiniStat
                  label="Queued"
                  value={
                    recipientStats.queued
                  }
                />

                <MiniStat
                  label="Sent"
                  value={
                    recipientStats.sent
                  }
                />

                <MiniStat
                  label="Delivered"
                  value={
                    recipientStats.delivered
                  }
                />

                <MiniStat
                  label="Read"
                  value={
                    recipientStats.read
                  }
                />

                <MiniStat
                  label="Failed"
                  value={
                    recipientStats.failed
                  }
                  last
                />
              </div>
            </div>

            {/* Notes */}

            {campaign.notes && (
              <div className="border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h2 className="text-[13px] font-semibold text-gray-800">
                    Notes
                  </h2>
                </div>

                <div className="p-4">
                  <p className="text-[11px] leading-5 text-gray-600 whitespace-pre-wrap">
                    {campaign.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  last,
}) => {
  return (
    <div
      className={`px-5 py-3.5 ${
        !last
          ? "border-r border-gray-200"
          : ""
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Icon
          size={13}
          className="text-gray-400"
        />

        <span className="text-[10px] text-gray-500">
          {label}
        </span>
      </div>

      <div className="flex items-end gap-1.5 mt-1">
        <span className="text-[18px] font-semibold text-gray-800">
          {value}
        </span>

        {sub && (
          <span className="text-[10px] text-gray-400 mb-0.5">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================================
// PROGRESS ROW
// ============================================================

const ProgressRow = ({
  label,
  value,
  total,
  last = false,
}) => {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div
      className={`${
        !last
          ? "pb-3 mb-3 border-b border-gray-100"
          : ""
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-gray-600">
          {label}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500">
            {value}
          </span>

          <span className="text-[10px] text-gray-400 w-8 text-right">
            {percentage}%
          </span>
        </div>
      </div>

      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-700 rounded-full transition-all"
          style={{
            width: `${Math.min(
              100,
              percentage
            )}%`,
          }}
        />
      </div>
    </div>
  );
};

// ============================================================
// ENGAGEMENT CARD
// ============================================================

const EngagementCard = ({
  icon: Icon,
  label,
  value,
  last,
}) => {
  return (
    <div
      className={`px-4 py-4 ${
        !last
          ? "border-r border-gray-200"
          : ""
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Icon
          size={13}
          className="text-gray-400"
        />

        <span className="text-[10px] text-gray-500">
          {label}
        </span>
      </div>

      <p className="text-[18px] font-semibold text-gray-800 mt-1">
        {value}
      </p>
    </div>
  );
};

// ============================================================
// DETAIL ROW
// ============================================================

const DetailRow = ({
  label,
  value,
}) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[10px] text-gray-400">
        {label}
      </span>

      <span className="text-[11px] text-gray-700 text-right max-w-[190px] break-words">
        {value}
      </span>
    </div>
  );
};

// ============================================================
// MINI STAT
// ============================================================

const MiniStat = ({
  label,
  value,
  last = false,
}) => {
  return (
    <div
      className={`px-4 py-3 ${
        !last
          ? "border-r border-b border-gray-100"
          : "border-b border-gray-100"
      }`}
    >
      <p className="text-[10px] text-gray-400">
        {label}
      </p>

      <p className="text-[14px] font-semibold text-gray-700 mt-0.5">
        {value}
      </p>
    </div>
  );
};

// ============================================================
// RECIPIENT STATUS
// ============================================================

const RecipientStatus = ({
  status,
}) => {
  const classes = {
    pending:
      "bg-gray-50 text-gray-600 border-gray-200",

    queued:
      "bg-blue-50 text-blue-600 border-blue-200",

    sent:
      "bg-indigo-50 text-indigo-600 border-indigo-200",

    delivered:
      "bg-green-50 text-green-600 border-green-200",

    read:
      "bg-purple-50 text-purple-600 border-purple-200",

    failed:
      "bg-red-50 text-red-600 border-red-200",

    cancelled:
      "bg-gray-50 text-gray-500 border-gray-200",
  };

  return (
    <span
      className={`inline-flex px-1.5 py-0.5 rounded border text-[9px] font-medium ${
        classes[status] ||
        "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {status
        ? status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) =>
              letter.toUpperCase()
            )
        : "Pending"}
    </span>
  );
};

// ============================================================
// CONTENT PREVIEW
// ============================================================

const ContentPreview = ({
  content,
}) => {
  if (!content) {
    return (
      <div className="text-[11px] text-gray-400">
        No campaign content.
      </div>
    );
  }

  if (typeof content === "string") {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50/50 p-3">
        <p className="text-[11px] leading-5 text-gray-700 whitespace-pre-wrap">
          {content}
        </p>
      </div>
    );
  }

  const entries = Object.entries(
    content
  ).filter(
    ([, value]) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

  if (!entries.length) {
    return (
      <div className="text-[11px] text-gray-400">
        No campaign content.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 divide-y divide-gray-100">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="px-3 py-2.5"
        >
          <p className="text-[9px] text-gray-400 uppercase tracking-wide">
            {key.replace(/_/g, " ")}
          </p>

          <p className="text-[11px] text-gray-700 mt-0.5 whitespace-pre-wrap break-words">
            {typeof value === "object"
              ? JSON.stringify(
                  value,
                  null,
                  2
                )
              : String(value)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CampaignView;
