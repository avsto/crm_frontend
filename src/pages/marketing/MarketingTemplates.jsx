
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Eye,
  Copy,
  Pencil,
  Trash2,
  MessageSquare,
  Mail,
  Smartphone,
  Bell,
  LayoutTemplate,
  X,
  ChevronDown,
  CheckCircle2,
  Clock3,
  Archive,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import marketingTemplateApi from "../../api/marketingTemplate.api";

/* =========================================================
   CHANNEL CONFIG
========================================================= */

const CHANNEL_CONFIG = {
  whatsapp: {
    label: "WhatsApp",
    icon: MessageSquare,
    className: "bg-emerald-50 text-emerald-600",
  },

  email: {
    label: "Email",
    icon: Mail,
    className: "bg-blue-50 text-blue-600",
  },

  sms: {
    label: "SMS",
    icon: Smartphone,
    className: "bg-violet-50 text-violet-600",
  },

  notification: {
    label: "Notification",
    icon: Bell,
    className: "bg-orange-50 text-orange-600",
  },
};

/* =========================================================
   HELPERS
========================================================= */

const getChannelConfig = (channel) => {
  const key = String(channel || "")
    .toLowerCase()
    .trim();

  return (
    CHANNEL_CONFIG[key] || {
      label: channel || "Unknown",
      icon: LayoutTemplate,
      className: "bg-gray-50 text-gray-600",
    }
  );
};

const getStatusConfig = (status) => {
  const value = String(status || "")
    .toLowerCase()
    .trim();

  if (value === "active" || value === "approved") {
    return {
      label: value === "approved" ? "Approved" : "Active",
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
      dotClass: "bg-emerald-500",
      icon: CheckCircle2,
    };
  }

  if (value === "draft") {
    return {
      label: "Draft",
      className: "bg-gray-50 text-gray-600 border-gray-200",
      dotClass: "bg-gray-400",
      icon: FileText,
    };
  }

  if (value === "pending") {
    return {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-100",
      dotClass: "bg-amber-500",
      icon: Clock3,
    };
  }

  if (value === "inactive") {
    return {
      label: "Inactive",
      className: "bg-amber-50 text-amber-700 border-amber-100",
      dotClass: "bg-amber-500",
      icon: Clock3,
    };
  }

  if (value === "archived") {
    return {
      label: "Archived",
      className: "bg-gray-50 text-gray-500 border-gray-200",
      dotClass: "bg-gray-400",
      icon: Archive,
    };
  }

  return {
    label: status || "Draft",
    className: "bg-gray-50 text-gray-600 border-gray-200",
    dotClass: "bg-gray-400",
    icon: FileText,
  };
};

/* =========================================================
   NORMALIZE API RESPONSE
========================================================= */

const normalizeTemplatesResponse = (response) => {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.templates)) {
    return payload.templates;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload?.data?.items)) {
    return payload.data.items;
  }

  if (Array.isArray(payload?.data?.templates)) {
    return payload.data.templates;
  }

  return [];
};

/* =========================================================
   NORMALIZE TEMPLATE
========================================================= */

const normalizeTemplate = (template) => {
  const channel =
    template?.channel ||
    template?.platform ||
    template?.type ||
    "notification";

  const whatsappData = template?.whatsapp || {};

  return {
    ...template,

    id:
      template?._id ||
      template?.id ||
      template?.templateId ||
      whatsappData?.templateId,

    name:
      template?.name ||
      template?.title ||
      whatsappData?.name ||
      "Untitled Template",

    description: template?.description || "",

    category:
      template?.category ||
      whatsappData?.category ||
      "marketing",

    channel,

    status:
      template?.status ||
      whatsappData?.status ||
      "draft",

    language:
      template?.language ||
      whatsappData?.language ||
      "en",

    usage: Number(
      template?.usage ??
        template?.usageCount ??
        template?.usedCount ??
        template?.stats?.usage ??
        0
    ),

    content:
      template?.content ||
      template?.body ||
      template?.email?.content ||
      template?.sms?.message ||
      template?.notification?.message ||
      whatsappData?.components?.find(
        (component) => component.type === "BODY"
      )?.text ||
      "",
  };
};

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const MarketingTemplates = () => {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [channel, setChannel] = useState("All Channels");
  const [statusTab, setStatusTab] = useState("all");

  const [openMenu, setOpenMenu] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  /* =======================================================
     FETCH
  ======================================================= */

  const fetchTemplates = async (showLoader = false) => {
    try {
      setError("");

      if (showLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response =
        await marketingTemplateApi.getTemplates();

      const list = normalizeTemplatesResponse(response).map(
        normalizeTemplate
      );

      setTemplates(list);
    } catch (err) {
      console.error(
        "Failed to fetch marketing templates:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load marketing templates."
      );

      setTemplates([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     REFRESH / IMPORT
  ======================================================= */

  const handleRefresh = async () => {
    try {
      setError("");
      setRefreshing(true);

      await marketingTemplateApi.importWhatsAppTemplates();

      const response =
        await marketingTemplateApi.getTemplates();

      const list = normalizeTemplatesResponse(response).map(
        normalizeTemplate
      );

      setTemplates(list);
    } catch (err) {
      console.error(
        "Failed to refresh/import templates:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to refresh templates."
      );

      try {
        const response =
          await marketingTemplateApi.getTemplates();

        const list =
          normalizeTemplatesResponse(response).map(
            normalizeTemplate
          );

        setTemplates(list);
      } catch (fetchError) {
        console.error(
          "Failed to load local templates:",
          fetchError
        );
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  /* =======================================================
     DYNAMIC FILTERS
  ======================================================= */

  const categories = useMemo(() => {
    const values = templates
      .map((template) => template.category)
      .filter(Boolean)
      .map((value) => String(value));

    return [
      "All Categories",
      ...Array.from(new Set(values)),
    ];
  }, [templates]);

  const channels = useMemo(() => {
    const values = templates
      .map((template) => template.channel)
      .filter(Boolean)
      .map((value) => String(value));

    return [
      "All Channels",
      ...Array.from(new Set(values)),
    ];
  }, [templates]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredTemplates = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return templates.filter((template) => {
      const matchesSearch =
        !searchValue ||
        String(template.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(template.description || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(template.category || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(template.channel || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        category === "All Categories" ||
        String(template.category) === String(category);

      const matchesChannel =
        channel === "All Channels" ||
        String(template.channel) === String(channel);

      const templateStatus = String(
        template.status || "draft"
      ).toLowerCase();

      let matchesStatus = true;

      if (statusTab === "active") {
        matchesStatus =
          templateStatus === "active" ||
          templateStatus === "approved";
      }

      if (statusTab === "draft") {
        matchesStatus =
          templateStatus === "draft" ||
          templateStatus === "pending";
      }

      if (statusTab === "archived") {
        matchesStatus =
          templateStatus === "archived";
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesChannel &&
        matchesStatus
      );
    });
  }, [
    templates,
    search,
    category,
    channel,
    statusTab,
  ]);

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleEdit = (template) => {
    if (!template?.id) return;

    setOpenMenu(null);

    navigate(
      `/marketing/templates/${template.id}/edit`
    );
  };

  const handleDuplicate = async (template) => {
    try {
      if (!template?.id) return;

      setOpenMenu(null);

      await marketingTemplateApi.duplicateTemplate(
        template.id
      );

      await fetchTemplates(true);
    } catch (err) {
      console.error(
        "Failed to duplicate template:",
        err
      );

      window.alert(
        err?.response?.data?.message ||
          "Failed to duplicate template."
      );
    }
  };

  const handleDelete = async (template) => {
    try {
      if (!template?.id) return;

      const confirmed = window.confirm(
        `Are you sure you want to delete "${template.name}"?`
      );

      if (!confirmed) return;

      setOpenMenu(null);

      await marketingTemplateApi.deleteTemplate(
        template.id
      );

      setTemplates((prev) =>
        prev.filter(
          (item) => item.id !== template.id
        )
      );

      if (
        previewTemplate?.id === template.id
      ) {
        setPreviewTemplate(null);
      }
    } catch (err) {
      console.error(
        "Failed to delete template:",
        err
      );

      window.alert(
        err?.response?.data?.message ||
          "Failed to delete template."
      );
    }
  };

  const handleUseTemplate = (template) => {
    if (!template?.id) return;

    navigate(
      `/marketing/templates/create?template=${encodeURIComponent(
        template.id
      )}`
    );
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setChannel("All Channels");
    setStatusTab("all");
  };

  const hasFilters =
    search ||
    category !== "All Categories" ||
    channel !== "All Channels" ||
    statusTab !== "all";

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200">
          <div className="px-5 py-4">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />

            <div className="mt-3 h-7 w-56 animate-pulse rounded bg-gray-200" />

            <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="h-10 animate-pulse rounded-lg bg-gray-100" />

          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
            <div className="h-11 bg-gray-50" />

            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-[76px] border-t border-gray-100 bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-gray-200">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1.5 hover:text-gray-700"
                >
                  <ArrowLeft size={13} />
                  Back
                </button>

                <span>/</span>

                <span>Marketing</span>

                <span>/</span>

                <span className="text-gray-600">
                  Templates
                </span>
              </div>

              <div className="mt-3">
                <h1 className="text-[20px] font-semibold tracking-tight text-gray-900">
                  Templates
                </h1>

                <p className="mt-1 text-[12px] text-gray-500">
                  Create and manage reusable marketing
                  message templates.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-[12px] font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                {refreshing ? (
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCw size={13} />
                )}

                {refreshing
                  ? "Refreshing"
                  : "Refresh"}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/marketing/templates/create"
                  )
                }
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-gray-900 px-3 text-[12px] font-medium text-white transition hover:bg-gray-800"
              >
                <Plus size={14} />
                Create Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="px-5 py-4">
        {/* ERROR */}

        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-red-800">
                Unable to refresh templates
              </p>

              <p className="mt-0.5 truncate text-[11px] text-red-600">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 xl:flex-row xl:items-center">
            {/* Search */}

            <div className="relative w-full xl:max-w-[330px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search templates..."
                className="h-8 w-full rounded-md border border-gray-200 bg-white pl-8 pr-3 text-[12px] outline-none transition placeholder:text-gray-400 focus:border-gray-400"
              />
            </div>

            {/* Status */}

            <div className="flex items-center gap-1 rounded-md bg-gray-100 p-1">
              {[
                ["all", "All"],
                ["active", "Active"],
                ["draft", "Draft"],
                ["archived", "Archived"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setStatusTab(value)
                  }
                  className={`h-6 rounded px-2.5 text-[11px] font-medium transition ${
                    statusTab === value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Filter */}

            <button
              type="button"
              onClick={() =>
                setShowFilters((prev) => !prev)
              }
              className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-2.5 text-[11px] font-medium transition ${
                showFilters || hasFilters
                  ? "border-gray-300 bg-gray-50 text-gray-800"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={13} />
              Filters
            </button>

            {/* Clear */}

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-8 rounded-md px-2 text-[11px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              >
                Clear
              </button>
            )}
          </div>

          {/* =================================================
              FILTER PANEL
          ================================================= */}

          {showFilters && (
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50/50 px-4 py-3">
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="h-8 min-w-[150px] appearance-none rounded-md border border-gray-200 bg-white px-2.5 pr-8 text-[11px] text-gray-600 outline-none focus:border-gray-400"
                >
                  {categories.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>

              <div className="relative">
                <select
                  value={channel}
                  onChange={(e) =>
                    setChannel(e.target.value)
                  }
                  className="h-8 min-w-[140px] appearance-none rounded-md border border-gray-200 bg-white px-2.5 pr-8 text-[11px] text-gray-600 outline-none focus:border-gray-400"
                >
                  {channels.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          )}

          {/* =================================================
              TABLE HEADER
          ================================================= */}

          <div className="hidden grid-cols-[minmax(280px,2fr)_150px_140px_130px_120px_50px] border-b border-gray-200 bg-gray-50/60 px-4 py-2.5 lg:grid">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Template
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Channel
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Category
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Status
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Updated
            </div>

            <div />
          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {filteredTemplates.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                <LayoutTemplate
                  size={19}
                  className="text-gray-400"
                />
              </div>

              <h3 className="mt-3 text-[13px] font-semibold text-gray-800">
                {templates.length === 0
                  ? "No templates yet"
                  : "No templates found"}
              </h3>

              <p className="mt-1 max-w-sm text-[11px] leading-5 text-gray-500">
                {templates.length === 0
                  ? "Create your first marketing template to get started."
                  : "Try changing your search or filters."}
              </p>

              {templates.length === 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/marketing/templates/create"
                    )
                  }
                  className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-md bg-gray-900 px-3 text-[11px] font-medium text-white hover:bg-gray-800"
                >
                  <Plus size={13} />
                  Create Template
                </button>
              ) : (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 h-8 rounded-md border border-gray-200 px-3 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP LIST
              ================================================= */}

              <div className="hidden lg:block">
                {filteredTemplates.map((template) => {
                  const channelConfig =
                    getChannelConfig(
                      template.channel
                    );

                  const ChannelIcon =
                    channelConfig.icon;

                  const statusConfig =
                    getStatusConfig(
                      template.status
                    );

                  return (
                    <div
                      key={template.id}
                      className="group grid grid-cols-[minmax(280px,2fr)_150px_140px_130px_120px_50px] items-center border-b border-gray-100 px-4 py-3 transition last:border-b-0 hover:bg-gray-50/60"
                    >
                      {/* Template */}

                      <div className="min-w-0 pr-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${channelConfig.className}`}
                          >
                            <ChannelIcon size={17} />
                          </div>

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewTemplate(
                                  template
                                )
                              }
                              className="block max-w-full truncate text-left text-[12px] font-semibold text-gray-800 hover:text-gray-950"
                            >
                              {template.name}
                            </button>

                            <p className="mt-0.5 max-w-[430px] truncate text-[10px] text-gray-400">
                              {template.description ||
                                template.content ||
                                "No description available."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Channel */}

                      <div>
                        <div className="inline-flex items-center gap-1.5 text-[11px] text-gray-600">
                          <ChannelIcon
                            size={13}
                            className={
                              channelConfig.className.split(
                                " "
                              )[1]
                            }
                          />

                          {channelConfig.label}
                        </div>
                      </div>

                      {/* Category */}

                      <div>
                        <span className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium capitalize text-gray-600">
                          {String(
                            template.category ||
                              "marketing"
                          ).toLowerCase()}
                        </span>
                      </div>

                      {/* Status */}

                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-medium ${statusConfig.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`}
                          />

                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Updated */}

                      <div>
                        <span className="text-[10px] text-gray-400">
                          {formatDate(
                            template.updatedAt ||
                              template.createdAt
                          )}
                        </span>
                      </div>

                      {/* Actions */}

                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu(
                              openMenu ===
                                template.id
                                ? null
                                : template.id
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        >
                          <MoreHorizontal
                            size={15}
                          />
                        </button>

                        {openMenu ===
                          template.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() =>
                                setOpenMenu(null)
                              }
                            />

                            <div className="absolute right-0 top-8 z-50 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewTemplate(
                                    template
                                  );
                                  setOpenMenu(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-gray-700 hover:bg-gray-50"
                              >
                                <Eye size={13} />
                                Preview
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    template
                                  )
                                }
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-gray-700 hover:bg-gray-50"
                              >
                                <Pencil size={13} />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDuplicate(
                                    template
                                  )
                                }
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-gray-700 hover:bg-gray-50"
                              >
                                <Copy size={13} />
                                Duplicate
                              </button>

                              <div className="my-1 border-t border-gray-100" />

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    template
                                  )
                                }
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* =================================================
                  MOBILE
              ================================================= */}

              <div className="divide-y divide-gray-100 lg:hidden">
                {filteredTemplates.map((template) => {
                  const channelConfig =
                    getChannelConfig(
                      template.channel
                    );

                  const ChannelIcon =
                    channelConfig.icon;

                  const statusConfig =
                    getStatusConfig(
                      template.status
                    );

                  return (
                    <div
                      key={template.id}
                      className="p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${channelConfig.className}`}
                        >
                          <ChannelIcon size={17} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewTemplate(
                                  template
                                )
                              }
                              className="min-w-0 truncate text-left text-[12px] font-semibold text-gray-800"
                            >
                              {template.name}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setPreviewTemplate(
                                  template
                                )
                              }
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100"
                            >
                              <Eye size={14} />
                            </button>
                          </div>

                          <p className="mt-0.5 text-[10px] text-gray-400">
                            {channelConfig.label}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-gray-500">
                        {template.description ||
                          template.content ||
                          "No description available."}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium capitalize text-gray-600">
                          {String(
                            template.category ||
                              "marketing"
                          ).toLowerCase()}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-medium ${statusConfig.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`}
                          />

                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                        <span className="text-[10px] text-gray-400">
                          Updated{" "}
                          {formatDate(
                            template.updatedAt ||
                              template.createdAt
                          )}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                template
                              )
                            }
                            className="h-7 rounded-md border border-gray-200 px-2.5 text-[10px] font-medium text-gray-600"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleUseTemplate(
                                template
                              )
                            }
                            className="h-7 rounded-md bg-gray-900 px-2.5 text-[10px] font-medium text-white"
                          >
                            Use
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          {filteredTemplates.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2.5">
              <p className="text-[10px] text-gray-400">
                Showing filtered templates
              </p>

              <p className="text-[10px] text-gray-400">
                {filteredTemplates.length} template
                {filteredTemplates.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          PREVIEW MODAL
      ===================================================== */}

      {previewTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setPreviewTemplate(null)
            }
          />

          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
            {/* Header */}

            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="min-w-0">
                <h2 className="truncate text-[14px] font-semibold text-gray-900">
                  {previewTemplate.name}
                </h2>

                <p className="mt-0.5 text-[10px] text-gray-400">
                  {
                    getChannelConfig(
                      previewTemplate.channel
                    ).label
                  }

                  {" · "}

                  {previewTemplate.category}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPreviewTemplate(null)
                }
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}

            <div className="max-h-[70vh] overflow-y-auto bg-gray-50 p-4">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {(() => {
                      const config =
                        getChannelConfig(
                          previewTemplate.channel
                        );

                      const Icon = config.icon;

                      return (
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.className}`}
                        >
                          <Icon size={17} />
                        </div>
                      );
                    })()}

                    <div>
                      <p className="text-[12px] font-semibold text-gray-900">
                        {previewTemplate.name}
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {
                          getChannelConfig(
                            previewTemplate.channel
                          ).label
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {previewTemplate.content ? (
                    <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-[12px] leading-5 text-gray-700">
                      {typeof previewTemplate.content ===
                      "string"
                        ? previewTemplate.content
                        : JSON.stringify(
                            previewTemplate.content,
                            null,
                            2
                          )}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-gray-50 p-3 text-[12px] text-gray-500">
                      No content available.
                    </div>
                  )}

                  {previewTemplate.variables
                    ?.length > 0 && (
                    <div className="mt-3 rounded-lg border border-dashed border-gray-200 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        Variables
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {previewTemplate.variables.map(
                          (
                            variable,
                            index
                          ) => (
                            <span
                              key={index}
                              className="rounded-md bg-gray-100 px-2 py-1 text-[10px] text-gray-600"
                            >
                              {typeof variable ===
                              "string"
                                ? variable
                                : variable?.key ||
                                  variable?.name ||
                                  `Variable ${
                                    index + 1
                                  }`}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-4 py-3">
              <button
                type="button"
                onClick={() =>
                  setPreviewTemplate(null)
                }
                className="h-8 rounded-md border border-gray-200 px-3 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() =>
                  handleUseTemplate(
                    previewTemplate
                  )
                }
                className="h-8 rounded-md bg-gray-900 px-3 text-[11px] font-medium text-white hover:bg-gray-800"
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingTemplates;