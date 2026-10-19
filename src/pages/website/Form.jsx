import React, { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {

  Plus,

  Search,

  MoreVertical,

  Pencil,

  Trash2,

  Eye,

  Copy,

  FileText,

  CheckCircle2,

  XCircle,

  Loader2,

  RefreshCw,

  ChevronLeft,

  ChevronRight,

  Users,

  Tag,

  Package,

  Globe,

  Webhook,

  ExternalLink,

  SlidersHorizontal,

  CalendarDays,

} from "lucide-react";

import formApi from "../../api/form.api";

const LEAD_SOURCES = {

  website: "Website",

  whatsapp: "WhatsApp",

  facebook: "Facebook",

  instagram: "Instagram",

  email: "Email",

  phone: "Phone",

  google: "Google",

  linkedin: "LinkedIn",

  referral: "Referral",

  manual: "Manual",

  import: "Import",

  campaign: "Campaign",

  api: "API",

  other: "Other",

};

const LEAD_STATUSES = {

  new: "New",

  contacted: "Contacted",

  qualified: "Qualified",

  follow_up: "Follow Up",

  proposal_sent: "Proposal Sent",

  negotiation: "Negotiation",

  won: "Won",

  lost: "Lost",

  junk: "Junk",

};

const PRIORITIES = {

  low: "Low",

  medium: "Medium",

  high: "High",

  urgent: "Urgent",

};

const EMBED_MODES = {

  iframe: "iFrame",

  javascript: "JavaScript",

  both: "Both",

};

const formatNumber = (value) =>

  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const formatDate = (date) => {

  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {

    day: "2-digit",

    month: "short",

    year: "numeric",

  }).format(parsed);

};

const getDisplayName = (value) => {

  if (!value) return "-";

  if (typeof value === "string") {

    if (value.length > 18) {

      return `${value.slice(0, 8)}...${value.slice(-6)}`;

    }

    return value;

  }

  return (

    value.name ||

    value.label ||

    value.title ||

    value.fullName ||

    value.productName ||

    value.tagName ||

    value.email ||

    value.phone ||

    (value._id

      ? `${String(value._id).slice(0, 8)}...${String(value._id).slice(-4)}`

      : "-")

  );

};

const getFieldCount = (form) => {

  let standardFields = 0;

  const fields = form?.fields || {};

  Object.values(fields).forEach((field) => {

    if (field?.enabled) {

      standardFields += 1;

    }

  });

  const customFields = Array.isArray(form?.customFields)

    ? form.customFields.length

    : 0;

  return {

    standard: standardFields,

    custom: customFields,

    total: standardFields + customFields,

  };

};

const StatusBadge = ({ status }) => {

  const config = {

    active: {

      label: "Active",

      icon: CheckCircle2,

      className: "bg-emerald-50 text-emerald-700 border-emerald-200",

    },

    draft: {

      label: "Draft",

      icon: FileText,

      className: "bg-gray-50 text-gray-600 border-gray-200",

    },

    inactive: {

      label: "Inactive",

      icon: XCircle,

      className: "bg-red-50 text-red-700 border-red-200",

    },

  };

  const item = config[status] || config.draft;

  const Icon = item.icon;

  return (

    <span

      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.className}`}

    >

      <Icon size={12} />

      {item.label}

    </span>

  );

};

const PriorityBadge = ({ priority }) => {

  const config = {

    low: "bg-gray-50 text-gray-600 border-gray-200",

    medium: "bg-blue-50 text-blue-700 border-blue-200",

    high: "bg-orange-50 text-orange-700 border-orange-200",

    urgent: "bg-red-50 text-red-700 border-red-200",

  };

  return (

    <span

      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${

        config[priority] || config.medium

      }`}

    >

      {PRIORITIES[priority] || "Medium"}

    </span>

  );

};

const Forms = () => {

  const navigate = useNavigate();

  const menuRef = useRef(null);

  const [forms, setForms] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);

  const [limit] = useState(20);

  const [pagination, setPagination] = useState({

    page: 1,

    limit: 20,

    total: 0,

    totalPages: 1,

  });

  const [openMenu, setOpenMenu] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(null);

  const [copyLoading, setCopyLoading] = useState(null);

  /*

   * ----------------------------------------------------------

   * FETCH FORMS

   * ----------------------------------------------------------

   */

  const fetchForms = async (showLoader = true) => {

    try {

      if (showLoader) {

        setLoading(true);

      } else {

        setRefreshing(true);

      }

      const response = await formApi.getForms({

        search: search.trim(),

        status: status || undefined,

        page,

        limit,

      });

      /*

       * Supports both:

       *

       * {

       *   success: true,

       *   data: [],

       *   pagination: {}

       * }

       *

       * and axios style:

       *

       * {

       *   data: {

       *     success: true,

       *     data: [],

       *     pagination: {}

       *   }

       * }

       */

      const payload =

        response?.data?.success !== undefined ? response.data : response;

      let list = [];

      if (Array.isArray(payload?.data)) {

        list = payload.data;

      } else if (Array.isArray(payload?.data?.forms)) {

        list = payload.data.forms;

      } else if (Array.isArray(payload?.forms)) {

        list = payload.forms;

      }

      const paginationData =

        payload?.pagination ||

        payload?.data?.pagination ||

        response?.pagination ||

        {};

      setForms(list);

      setPagination({

        page: Number(paginationData.page) || page,

        limit: Number(paginationData.limit) || limit,

        total: Number(paginationData.total) || list.length,

        totalPages:

          Number(paginationData.totalPages) ||

          Math.max(

            1,

            Math.ceil(

              (Number(paginationData.total) || list.length) / limit

            )

          ),

      });

    } catch (error) {

      console.error("Failed to fetch forms:", error);

      setForms([]);

      setPagination((prev) => ({

        ...prev,

        total: 0,

        totalPages: 1,

      }));

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };

  useEffect(() => {

    fetchForms(true);

  }, [page]);

  useEffect(() => {

    const timer = setTimeout(() => {

      setPage(1);

      fetchForms(true);

    }, 400);

    return () => clearTimeout(timer);

  }, [search, status]);

  /*

   * ----------------------------------------------------------

   * CLOSE MENU

   * ----------------------------------------------------------

   */

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (menuRef.current && !menuRef.current.contains(event.target)) {

        setOpenMenu(null);

      }

    };

    const handleScroll = () => {

      setOpenMenu(null);

    };

    document.addEventListener("mousedown", handleClickOutside);

    window.addEventListener("scroll", handleScroll, true);

    return () => {

      document.removeEventListener("mousedown", handleClickOutside);

      window.removeEventListener("scroll", handleScroll, true);

    };

  }, []);

  /*

   * ----------------------------------------------------------

   * MENU

   * ----------------------------------------------------------

   */

  const handleMenuToggle = (event, id) => {

    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();

    setOpenMenu((prev) => {

      if (prev?.id === id) {

        return null;

      }

      return {

        id,

        top: rect.bottom + 6,

        right: window.innerWidth - rect.right,

      };

    });

  };

  /*

   * ----------------------------------------------------------

   * DELETE

   * ----------------------------------------------------------

   */

  const handleDelete = async (form) => {

    const confirmed = window.confirm(

      `Are you sure you want to delete "${form?.name || "this form"}"?`

    );

    if (!confirmed) return;

    try {

      setDeleteLoading(form._id);

      setOpenMenu(null);

      const response = await formApi.deleteForm(form._id);

      const payload =

        response?.data?.success !== undefined ? response.data : response;

      if (payload?.success === false) {

        throw new Error(payload?.message || "Failed to delete form");

      }

      await fetchForms(false);

    } catch (error) {

      console.error("Delete form error:", error);

      alert(

        error?.response?.data?.message ||

          error?.message ||

          "Failed to delete form"

      );

    } finally {

      setDeleteLoading(null);

    }

  };

  /*

   * ----------------------------------------------------------

   * COPY EMBED CODE

   * ----------------------------------------------------------

   */

  const handleCopyEmbed = async (form) => {

    try {

      setCopyLoading(form._id);

      const baseUrl = (

        import.meta.env.VITE_BASE_URL ||

        window.location.origin

      ).replace(/\/$/, "");

      const embedCode = `<div id="avsto-form-${form._id}"></div>

<script

  src="${baseUrl}/form.js"

  data-form="${form._id}"

  data-target="#avsto-form-${form._id}">

</script>`;

      await navigator.clipboard.writeText(embedCode);

      setOpenMenu(null);

      alert("Embed code copied successfully.");

    } catch (error) {

      console.error("Copy embed error:", error);

      alert("Failed to copy embed code.");

    } finally {

      setCopyLoading(null);

    }

  };

  /*

   * ----------------------------------------------------------

   * COPY FORM URL

   * ----------------------------------------------------------

   */

  const handleCopyUrl = async (form) => {

    try {

      const baseUrl = (

        import.meta.env.VITE_BASE_URL ||

        window.location.origin

      ).replace(/\/$/, "");

      const formUrl = `${baseUrl}/forms/${form._id}`;

      await navigator.clipboard.writeText(formUrl);

      setOpenMenu(null);

      alert("Form URL copied successfully.");

    } catch (error) {

      console.error("Copy URL error:", error);

      alert("Failed to copy form URL.");

    }

  };

  /*

   * ----------------------------------------------------------

   * PREVIEW

   * ----------------------------------------------------------

   */

  const handlePreview = (form) => {

    const baseUrl = (

      import.meta.env.VITE_BASE_URL ||

      window.location.origin

    ).replace(/\/$/, "");

    const url = `${baseUrl}/forms/${form._id}`;

    window.open(url, "_blank", "noopener,noreferrer");

    setOpenMenu(null);

  };

  /*

   * ----------------------------------------------------------

   * SEARCH SUMMARY

   * ----------------------------------------------------------

   */

  const showingText = useMemo(() => {

    if (!pagination.total) {

      return "0 forms";

    }

    const start = (pagination.page - 1) * pagination.limit + 1;

    const end = Math.min(

      pagination.page * pagination.limit,

      pagination.total

    );

    return `${start}-${end} of ${formatNumber(pagination.total)}`;

  }, [pagination]);

  /*

   * ----------------------------------------------------------

   * LOADING

   * ----------------------------------------------------------

   */

  if (loading) {

    return (

      <div className="flex min-h-[420px] items-center justify-center bg-[#f8fafc]">

        <div className="flex flex-col items-center gap-3 text-gray-500">

          <Loader2 size={28} className="animate-spin text-gray-600" />

          <span className="text-sm">Loading forms...</span>

        </div>

      </div>

    );

  }

  /*

   * ----------------------------------------------------------

   * UI

   * ----------------------------------------------------------

   */

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="border-b border-gray-200 bg-white">
        <div className="px-5 py-5 md:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2.5 flex items-center gap-2 text-xs">
                <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-gray-500 transition hover:text-gray-800">
                  <ChevronLeft size={14} /> Back
                </button>
                <span className="text-gray-300">/</span>
                <span className="text-gray-500">Business</span>
                <span className="text-gray-300">/</span>
                <span className="font-medium text-gray-800">Forms</span>
              </div>
              <h1 className="text-1xl font-bold tracking-tight text-gray-900">Forms</h1>
              <p className="mt-1 text-sm text-gray-500">Manage lead forms, submissions and integrations.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => fetchForms(false)} disabled={refreshing} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
              </button>
              <button type="button" onClick={() => navigate("/forms/create")} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-black">
                <Plus size={14} /> Create Form
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 md:px-7">
        <div className="mx-auto max-w-[1450px]">
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">All forms</h2>
                  <p className="mt-1 text-xs text-gray-500">Search and manage your lead capture forms.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-[280px]">
                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search forms..." className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-100" />
                  </div>
                  <div className="relative">
                    <SlidersHorizontal size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 w-full min-w-[145px] appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-xs font-medium text-gray-700 outline-none focus:border-gray-400 sm:w-[155px]">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                 
                </div>
              </div>
            </div>

        {/* ------------------------------------------------ */}

        {/* TABLE */}

        {/* ------------------------------------------------ */}

            <div className="overflow-x-auto">

            <table className="w-full min-w-[1150px] border-collapse">

              <thead>

                <tr className="border-b border-gray-200 bg-gray-50/70">

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">

                    Form

                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">

                    Status

                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">

                    Lead Setup

                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">

                    Fields

                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">

                    Performance

                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">

                    Configuration

                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">

                    Updated

                  </th>

                  <th className="w-[60px] px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">

                    Action

                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {forms.length === 0 ? (

                  <tr>

                    <td colSpan={8} className="px-6 py-16 text-center">

                      <div className="mx-auto flex max-w-sm flex-col items-center">

                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">

                          <FileText

                            size={22}

                            className="text-gray-400"

                          />

                        </div>

                        <h3 className="text-sm font-semibold text-gray-800">

                          No forms found

                        </h3>

                        <p className="mt-1 text-xs text-gray-500">

                          {search || status

                            ? "Try changing your search or filter."

                            : "Create your first form to start collecting leads."}

                        </p>

                        {!search && !status && (

                          <button

                            type="button"

                            onClick={() => navigate("/forms/create")}

                            className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#111827] px-3 text-xs font-medium text-white hover:bg-black"

                          >

                            <Plus size={14} />

                            Create Form

                          </button>

                        )}

                      </div>

                    </td>

                  </tr>

                ) : (

                  forms.map((form) => {

                    const fieldCount = getFieldCount(form);

                    const assignedTo = getDisplayName(

                      form?.leadConfig?.assignedTo

                    );

                    const tag = getDisplayName(form?.leadConfig?.tag);

                    const product = getDisplayName(

                      form?.leadConfig?.product

                    );

                    const source =

                      LEAD_SOURCES[form?.leadConfig?.source] ||

                      form?.leadConfig?.source ||

                      "Website";

                    const leadStatus =

                      LEAD_STATUSES[form?.leadConfig?.status] ||

                      form?.leadConfig?.status ||

                      "New";

                    const priority =

                      form?.leadConfig?.priority || "medium";

                    const embedMode =

                      EMBED_MODES[form?.embed?.mode] ||

                      form?.embed?.mode ||

                      "Both";

                    const views = Number(form?.stats?.views) || 0;

                    const submissions =

                      Number(form?.stats?.submissions) || 0;

                    const leads =

                      Number(form?.stats?.leadsCreated) || 0;

                    return (

                      <tr

                        key={form._id}

                        className="group transition hover:bg-gray-50/70"

                      >

                        {/* FORM */}

                        <td className="px-4 py-4 align-top">

                          <div className="flex min-w-[240px] max-w-[330px] items-start gap-3">

                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600">

                              <FileText size={17} />

                            </div>

                            <div className="min-w-0">

                              <button

                                type="button"

                                onClick={() =>

                                  navigate(`/forms/${form._id}/edit`)

                                }

                                className="block max-w-full truncate text-sm font-semibold text-gray-800 hover:text-gray-600"

                                title={form?.name}

                              >

                                {form?.name || "Untitled Form"}

                              </button>

                              <div className="mt-0.5 truncate text-[11px] text-gray-400">

                                /{form?.slug || form?._id}

                              </div>

                             

                            </div>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4 align-top">

                          <StatusBadge status={form?.status} />

                        </td>

                        {/* LEAD SETUP */}

                        <td className="px-4 py-4 align-top">

                          <div className="min-w-[190px] space-y-1.5">

                            <div className="flex items-center gap-2">

                              <span className="w-[58px] text-[10px] font-medium uppercase tracking-wide text-gray-400">

                                Source

                              </span>

                              <span className="rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-700">

                                {source}

                              </span>

                            </div>

                          
                            <div className="flex items-center gap-2">

                              <span className="w-[58px] text-[10px] font-medium uppercase tracking-wide text-gray-400">

                                Priority

                              </span>

                              <PriorityBadge priority={priority} />

                            </div>

                            {assignedTo !== "-" && (

                              <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-gray-500">

                                <Users size={12} />

                                <span className="max-w-[120px] truncate">

                                  {assignedTo}

                                </span>

                              </div>

                            )}

                            {(tag !== "-" || product !== "-") && (

                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">

                                {tag !== "-" && (

                                  <span className="inline-flex max-w-[100px] items-center gap-1 truncate rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">

                                    <Tag size={10} />

                                    {tag}

                                  </span>

                                )}

                                {product !== "-" && (

                                  <span className="inline-flex max-w-[110px] items-center gap-1 truncate rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-700">

                                    <Package size={10} />

                                    {product}

                                  </span>

                                )}

                              </div>

                            )}

                          </div>

                        </td>

                        {/* FIELDS */}

                        <td className="px-4 py-4 align-top">

                          <div className="min-w-[100px]">

                            <div className="flex items-baseline gap-1">

                              <span className="text-base font-semibold text-gray-800">

                                {fieldCount.total}

                              </span>

                              <span className="text-[11px] text-gray-400">

                                fields

                              </span>

                            </div>

                            <div className="mt-1 flex flex-wrap gap-1.5">

                              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">

                                {fieldCount.standard} standard

                              </span>

                              {fieldCount.custom > 0 && (

                                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700">

                                  {fieldCount.custom} custom

                                </span>

                              )}

                            </div>

                          </div>

                        </td>

                        {/* PERFORMANCE */}

                        <td className="px-4 py-4 align-top">

                          <div className="min-w-[175px]">

                            <div className="grid grid-cols-3 gap-2">

                              <div>

                                <div className="text-[10px] uppercase tracking-wide text-gray-400">

                                  Views

                                </div>

                                <div className="mt-0.5 text-sm font-semibold text-gray-700">

                                  {formatNumber(views)}

                                </div>

                              </div>

                              <div>

                                <div className="text-[10px] uppercase tracking-wide text-gray-400">

                                  Submit

                                </div>

                                <div className="mt-0.5 text-sm font-semibold text-gray-700">

                                  {formatNumber(submissions)}

                                </div>

                              </div>

                              <div>

                                <div className="text-[10px] uppercase tracking-wide text-gray-400">

                                  Leads

                                </div>

                                <div className="mt-0.5 text-sm font-semibold text-emerald-600">

                                  {formatNumber(leads)}

                                </div>

                              </div>

                            </div>

                            {submissions > 0 && (

                              <div className="mt-2">

                                <div className="mb-1 flex items-center justify-between">

                                  <span className="text-[10px] text-gray-400">

                                    Lead conversion

                                  </span>

                                  <span className="text-[10px] font-medium text-gray-500">

                                    {Math.round(

                                      (leads / submissions) * 100

                                    )}

                                    %

                                  </span>

                                </div>

                                <div className="h-1 overflow-hidden rounded-full bg-gray-100">

                                  <div

                                    className="h-full rounded-full bg-emerald-500"

                                    style={{

                                      width: `${Math.min(

                                        100,

                                        (leads / submissions) * 100

                                      )}%`,

                                    }}

                                  />

                                </div>

                              </div>

                            )}

                          </div>

                        </td>

                        {/* CONFIGURATION */}

                        <td className="px-4 py-4 align-top">

                          <div className="min-w-[150px] space-y-1.5">

                            <div className="flex items-center gap-1.5">

                              <Globe

                                size={12}

                                className="text-gray-400"

                              />

                              <span className="text-[11px] text-gray-600">

                                {embedMode}

                              </span>

                            </div>

                            <div className="flex flex-wrap gap-1.5">

                              {form?.webhook?.enabled && (

                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">

                                  <Webhook size={10} />

                                  Webhook

                                </span>

                              )}

                              {form?.settings?.duplicateCheck && (

                                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">

                                  Duplicate Check

                                </span>

                              )}

                              {form?.settings?.captchaEnabled && (

                                <span className="rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">

                                  CAPTCHA

                                </span>

                              )}

                            </div>

                            {Array.isArray(

                              form?.embed?.allowedDomains

                            ) &&

                              form.embed.allowedDomains.length > 0 && (

                                <div className="text-[10px] text-gray-400">

                                  {form.embed.allowedDomains.length} allowed

                                  domain

                                  {form.embed.allowedDomains.length > 1

                                    ? "s"

                                    : ""}

                                </div>

                              )}

                          </div>

                        </td>

                        {/* UPDATED */}

                        <td className="px-4 py-4 align-top">

                          <div className="flex min-w-[100px] items-center gap-1.5 text-xs text-gray-600">

                            <CalendarDays

                              size={13}

                              className="text-gray-400"

                            />

                            <span>

                              {formatDate(

                                form?.updatedAt || form?.createdAt

                              )}

                            </span>

                          </div>

                          {form?.createdAt && (

                            <div className="mt-1 text-[10px] text-gray-400">

                              Created {formatDate(form.createdAt)}

                            </div>

                          )}

                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-4 text-right align-top">

                          <button

                            type="button"

                            onClick={(event) =>

                              handleMenuToggle(event, form._id)

                            }

                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-400 transition hover:border-gray-200 hover:bg-white hover:text-gray-700"

                          >

                            {deleteLoading === form._id ? (

                              <Loader2

                                size={16}

                                className="animate-spin"

                              />

                            ) : (

                              <MoreVertical size={17} />

                            )}

                          </button>

                        </td>

                      </tr>

                    );

                  })

                )}

              </tbody>

            </table>

          </div>

          {/* ------------------------------------------------ */}

          {/* FOOTER / PAGINATION */}

          {/* ------------------------------------------------ */}

          <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="text-xs text-gray-500">

              Showing{" "}

              <span className="font-medium text-gray-700">

                {showingText}

              </span>

            </div>

            <div className="flex items-center gap-1.5">

              <button

                type="button"

                disabled={pagination.page <= 1}

                onClick={() =>

                  setPage((prev) => Math.max(1, prev - 1))

                }

                className="inline-flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"

              >

                <ChevronLeft size={14} />

                Previous

              </button>

              <div className="hidden h-8 items-center rounded-lg bg-gray-50 px-3 text-xs font-medium text-gray-600 sm:flex">

                Page {pagination.page} of {pagination.totalPages}

              </div>

              <button

                type="button"

                disabled={

                  pagination.page >= pagination.totalPages

                }

                onClick={() =>

                  setPage((prev) =>

                    Math.min(pagination.totalPages, prev + 1)

                  )

                }

                className="inline-flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"

              >

                Next

                <ChevronRight size={14} />

              </button>

            </div>

            </div>
          </section>
        </div>
      </main>

      {/* -------------------------------------------------- */}

      {/* ACTION MENU */}

      {/* -------------------------------------------------- */}

      {openMenu && (

        <div

          ref={menuRef}

          className="fixed z-[100] w-52 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-gray-200/50"

          style={{

            top: openMenu.top,

            right: Math.max(openMenu.right, 12),

          }}

        >

          {(() => {

            const selectedForm = forms.find(

              (item) => item._id === openMenu.id

            );

            if (!selectedForm) return null;

            return (

              <>

                <button

                  type="button"

                  onClick={() => {

                    setOpenMenu(null);

                    navigate(`/forms/${selectedForm._id}/edit`);

                  }}

                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:bg-gray-50"

                >

                  <Pencil size={14} className="text-gray-500" />

                  Edit Form

                </button>

                <button

                  type="button"

                  onClick={() => handlePreview(selectedForm)}

                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:bg-gray-50"

                >

                  <Eye size={14} className="text-gray-500" />

                  Preview Form

                  <ExternalLink

                    size={11}

                    className="ml-auto text-gray-400"

                  />

                </button>

                <button

                  type="button"

                  onClick={() => handleCopyEmbed(selectedForm)}

                  disabled={copyLoading === selectedForm._id}

                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"

                >

                  {copyLoading === selectedForm._id ? (

                    <Loader2

                      size={14}

                      className="animate-spin text-gray-500"

                    />

                  ) : (

                    <Copy size={14} className="text-gray-500" />

                  )}

                  Copy Embed Code

                </button>

                <button

                  type="button"

                  onClick={() => handleCopyUrl(selectedForm)}

                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:bg-gray-50"

                >

                  <Globe size={14} className="text-gray-500" />

                  Copy Form URL

                </button>

                <div className="my-1 border-t border-gray-100" />

                <button

                  type="button"

                  onClick={() => handleDelete(selectedForm)}

                  disabled={deleteLoading === selectedForm._id}

                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"

                >

                  {deleteLoading === selectedForm._id ? (

                    <Loader2 size={14} className="animate-spin" />

                  ) : (

                    <Trash2 size={14} />

                  )}

                  Delete Form

                </button>

              </>

            );

          })()}

        </div>

      )}

    </div>

  );

};

export default Forms;