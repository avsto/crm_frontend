import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
  Pencil,
  Phone,
  Mail,
  Building2,
  UserRound,
  CalendarDays,
  Clock3,
  Tag,
  BriefcaseBusiness,
  Copy,
  Check,
  StickyNote,
  UserCheck,
  MessageCircle
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import ActivityTabs from "./activities/ActivityTabs";
import ActivityTab from "./activities/ActivityTab";
import WhatsAppActivity from "./activities/WhatsAppActivity";
import EmailActivity from "./activities/EmailActivity";
import CallActivity from "./activities/CallActivity";
import NoteActivity from "./activities/NoteActivity";
import FileActivity from "./activities/FileActivity";

const LeadDetailsDrawer = ({
  lead,
  open,
  onClose,
  onEdit,
}) => {
  const navigate = useNavigate();

  const [localLead, setLocalLead] =
    useState(null);

  const [copiedField, setCopiedField] =
    useState("");

  const [activeActivityTab, setActiveActivityTab] =
    useState("all");

  useEffect(() => {
    if (!lead) {
      setLocalLead(null);
      return;
    }

    setLocalLead(lead);
    setCopiedField("");
    setActiveActivityTab("all");
  }, [lead]);

  const phoneNumber = useMemo(() => {
    if (!localLead?.phone) return "";

    const countryCode = String(
      localLead.phoneCountryCode || "+91"
    ).replace(/\D/g, "");

    const phone = String(
      localLead.phone
    ).replace(/\D/g, "");

    return `${countryCode}${phone}`;
  }, [localLead]);

  const phoneHref = localLead?.phone
    ? `tel:+${phoneNumber}`
    : "#";

  const whatsappHref = localLead?.phone
    ? `https://wa.me/${phoneNumber}`
    : "#";

  const emailHref = localLead?.email
    ? `mailto:${localLead.email}`
    : "#";

  const alternatePhoneHref =
    localLead?.alternatePhone
      ? `tel:${String(
          localLead.alternatePhone
        ).replace(/\D/g, "")}`
      : "#";

  const copyText = async (
    value,
    field
  ) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(
        String(value)
      );

      setCopiedField(field);

      setTimeout(() => {
        setCopiedField("");
      }, 1500);
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatStatus = (status) => {
    if (!status) return "—";

    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatPriority = (priority) => {
    if (!priority) return "—";

    return String(priority)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatSource = (source) => {
    if (!source) return "—";

    return String(source)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const activities =
    localLead?.activities || [];

  const activityCounts = useMemo(() => {
    return {
      all: activities.length,

      whatsapp: activities.filter(
        (item) =>
          item?.type === "whatsapp"
      ).length,

      email: activities.filter(
        (item) =>
          item?.type === "email"
      ).length,

      call: activities.filter(
        (item) =>
          item?.type === "call"
      ).length,

      file: activities.filter(
        (item) =>
          item?.type === "file"
      ).length,

      note: activities.filter(
        (item) =>
          item?.type === "note"
      ).length,
    };
  }, [activities]);

  const filteredActivities =
    useMemo(() => {
      switch (activeActivityTab) {
        case "call":
          return activities.filter(
            (activity) =>
              activity?.type === "call"
          );

        case "email":
          return activities.filter(
            (activity) =>
              activity?.type === "email"
          );

        case "file":
          return activities.filter(
            (activity) =>
              activity?.type === "file"
          );

        case "note":
          return activities.filter(
            (activity) =>
              activity?.type === "note"
          );

        case "whatsapp":
          return activities.filter(
            (activity) =>
              activity?.type ===
              "whatsapp"
          );

        default:
          return activities;
      }
    }, [
      activities,
      activeActivityTab,
    ]);

  if (!open || !localLead) {
    return null;
  }

  const hasPhone = Boolean(
    localLead.phone
  );

  const hasEmail = Boolean(
    localLead.email
  );

  const initials =
    localLead.name
      ?.split(" ")
      ?.filter(Boolean)
      ?.slice(0, 2)
      ?.map((item) =>
        item.charAt(0).toUpperCase()
      )
      ?.join("") || "L";

  const renderActivityContent = () => {
    switch (activeActivityTab) {
      case "whatsapp":
        return (
          <WhatsAppActivity
            lead={localLead}
            formatDateTime={
              formatDateTime
            }
          />
        );

      case "email":
        return (
          <EmailActivity
            lead={localLead}
            formatDateTime={
              formatDateTime
            }
          />
        );

      case "call":
        return (
          <CallActivity
            activities={
              filteredActivities
            }
            formatDateTime={
              formatDateTime
            }
          />
        );

      case "note":
        return (
          <NoteActivity
            activities={
              filteredActivities
            }
            formatDateTime={
              formatDateTime
            }
          />
        );

      case "file":
        return (
          <FileActivity
            activities={
              filteredActivities
            }
            formatDateTime={
              formatDateTime
            }
          />
        );

      default:
        return (
          <ActivityTab
            activities={
              filteredActivities
            }
            formatDateTime={
              formatDateTime
            }
            formatStatus={
              formatStatus
            }
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 flex w-full justify-end">
        <div className="flex h-full w-full max-w-[1080px] flex-col overflow-hidden bg-slate-50 shadow-2xl">
          {/* HEADER */}
          <div className="shrink-0 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                  {initials}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-base font-semibold text-slate-900">
                      {localLead.name ||
                        "Unnamed Lead"}
                    </h2>

                    {localLead.status && (
                      <span className="hidden rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 sm:inline-flex">
                        {formatStatus(
                          localLead.status
                        )}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {localLead.companyName ||
                      "No company"}
                  </p>
                </div>
              </div>

              <div className="ml-3 flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/crm/leads/${localLead._id}/edit`
                    )
                  }
                  title="Edit lead"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  title="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="border-t border-slate-100 px-5 py-3">
              <div className="flex flex-wrap items-center gap-4">
                {hasPhone && (
                  <a
                    href={phoneHref}
                    className="flex items-center gap-2 text-xs font-medium text-slate-600 transition hover:text-slate-900"
                  >
                    <Phone className="h-3.5 w-3.5" />

                    <span>
                      {localLead.phoneCountryCode ||
                        "+91"}{" "}
                      {localLead.phone}
                    </span>
                  </a>
                )}

                {hasEmail && (
                  <a
                    href={emailHref}
                    className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-600 transition hover:text-slate-900"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" />

                    <span className="max-w-[280px] truncate">
                      {localLead.email}
                    </span>
                  </a>
                )}

                {localLead.source && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Tag className="h-3.5 w-3.5" />

                    <span>
                      {formatSource(
                        localLead.source
                      )}
                    </span>
                  </div>
                )}

                {hasPhone && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-medium text-green-600 transition hover:text-green-700"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </span>

                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid min-h-full lg:grid-cols-[320px_minmax(0,1fr)]">
              {/* LEFT */}
              <div className="space-y-4 border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
                {/* Contact */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-slate-500" />

                    <h3 className="text-sm font-semibold text-slate-900">
                      Contact Information
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Email */}
                    <div>
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Email
                      </p>

                      <div className="flex items-center gap-2">
                        <a
                          href={emailHref}
                          className={`min-w-0 flex-1 truncate text-sm ${
                            hasEmail
                              ? "text-slate-700 hover:text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {localLead.email ||
                            "Not provided"}
                        </a>

                        {hasEmail && (
                          <button
                            type="button"
                            onClick={() =>
                              copyText(
                                localLead.email,
                                "email"
                              )
                            }
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            {copiedField ===
                            "email" ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Phone
                      </p>

                      <div className="flex items-center gap-2">
                        <a
                          href={phoneHref}
                          className={`min-w-0 flex-1 truncate text-sm ${
                            hasPhone
                              ? "text-slate-700 hover:text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {hasPhone
                            ? `${
                                localLead.phoneCountryCode ||
                                "+91"
                              } ${
                                localLead.phone
                              }`
                            : "Not provided"}
                        </a>

                        {hasPhone && (
                          <button
                            type="button"
                            onClick={() =>
                              copyText(
                                `${
                                  localLead.phoneCountryCode ||
                                  "+91"
                                }${localLead.phone}`,
                                "phone"
                              )
                            }
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            {copiedField ===
                            "phone" ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Alternate Phone */}
                    <div>
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Alternate Phone
                      </p>

                      <div className="flex items-center gap-2">
                        <a
                          href={
                            alternatePhoneHref
                          }
                          className={`min-w-0 flex-1 truncate text-sm ${
                            localLead.alternatePhone
                              ? "text-slate-700 hover:text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {localLead.alternatePhone ||
                            "Not provided"}
                        </a>

                        {localLead.alternatePhone && (
                          <button
                            type="button"
                            onClick={() =>
                              copyText(
                                localLead.alternatePhone,
                                "alternatePhone"
                              )
                            }
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            {copiedField ===
                            "alternatePhone" ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Company */}
                    <div>
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Company
                      </p>

                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 shrink-0 text-slate-400" />

                        <p className="truncate text-sm text-slate-700">
                          {localLead.companyName ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead Information */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4 text-slate-500" />

                    <h3 className="text-sm font-semibold text-slate-900">
                      Lead Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Status
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatStatus(
                          localLead.status
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Priority
                      </p>

                      <p
                        className={`mt-1 text-sm font-medium ${
                          localLead.priority ===
                          "urgent"
                            ? "text-red-600"
                            : localLead.priority ===
                              "high"
                            ? "text-orange-600"
                            : "text-slate-800"
                        }`}
                      >
                        {formatPriority(
                          localLead.priority
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Source
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatSource(
                          localLead.source
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Created
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatDate(
                          localLead.createdAt
                        )}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Last Contacted
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {localLead.lastContactedAt
                          ? formatDateTime(
                              localLead.lastContactedAt
                            )
                          : "Not contacted yet"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inquiry */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-slate-500" />

                    <h3 className="text-sm font-semibold text-slate-900">
                      Inquiry
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Subject
                      </p>

                      <p className="text-sm font-semibold text-slate-800">
                        {localLead.subject ||
                          "No subject"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Message
                      </p>

                      <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {localLead.message ||
                            "No message"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-slate-500" />

                    <h3 className="text-sm font-semibold text-slate-900">
                      Assigned To
                    </h3>
                  </div>

                  {localLead.assignedTo ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                        {localLead.assignedTo.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "U"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {
                            localLead.assignedTo
                              .name
                          }
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {localLead.assignedTo
                            .email ||
                            "No email"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-slate-50 px-3 py-3">
                      <p className="text-sm text-slate-400">
                        Unassigned
                      </p>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Created At
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {formatDateTime(
                            localLead.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Updated At
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {formatDateTime(
                            localLead.updatedAt
                          )}
                        </p>
                      </div>
                    </div>

                    {localLead.nextFollowUpAt && (
                      <div className="flex items-start gap-3">
                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Next Follow Up
                          </p>

                          <p className="mt-1 text-sm font-medium text-blue-700">
                            {formatDateTime(
                              localLead.nextFollowUpAt
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="min-w-0 space-y-4 p-4">
                <div className="rounded-xl border border-slate-200 bg-white">
                  {/* Activity Header */}
                  <div className="border-b border-slate-200 px-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Activity
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Lead history and interactions
                        </p>
                      </div>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                        {activeActivityTab ===
                        "whatsapp"
                          ? "WhatsApp"
                          : activeActivityTab ===
                            "email"
                          ? "Email"
                          : activityCounts[
                              activeActivityTab
                            ] || 0}
                      </span>
                    </div>

                    {/* Tabs */}
                    <div className="mt-4">
                      <ActivityTabs
                        activeTab={
                          activeActivityTab
                        }
                        onChange={
                          setActiveActivityTab
                        }
                        counts={
                          activityCounts
                        }
                      />
                    </div>
                  </div>

                  {/* Content */}
                 <div className="h-[calc(100vh-120px)] min-h-0">
                    {renderActivityContent()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-3">
            <div className="flex items-center justify-between">
              <p className="truncate text-xs text-slate-400">
                Lead ID:{" "}
                <span className="font-medium text-slate-500">
                  {localLead._id}
                </span>
              </p>

              <button
                type="button"
                onClick={onClose}
                className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsDrawer;