import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  BriefcaseBusiness,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import crmApi from "../../api/crm.api";
import teamApi from "../../api/team.api";

/* =========================================================
   CONSTANTS
========================================================= */

const STAGES = [
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  lead: "",
  value: "",
  currency: "INR",
  stage: "new",
  expectedCloseDate: "",
  assignedTo: "",
};

const DEFAULT_COLUMNS = {
  deal: true,
  lead: true,
  stage: true,
  value: true,
  closeDate: true,
  assignedTo: true,
  action: true,
};

const COLUMN_OPTIONS = [
  { key: "deal", label: "Deal" },
  { key: "lead", label: "Lead / Account" },
  { key: "stage", label: "Stage" },
  { key: "value", label: "Value" },
  { key: "closeDate", label: "Expected Close" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "action", label: "Actions" },
];

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (amount, currency = "INR") => {
  const value = Number(amount || 0);

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString("en-IN")}`;
  }
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

const getInitials = (name = "") => {
  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "DL";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const getStageLabel = (stage) => {
  return (
    STAGES.find((item) => item.value === stage)?.label ||
    String(stage || "New")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

const getStageClass = (stage) => {
  const classes = {
    new: "border-blue-200 bg-blue-50 text-blue-700",
    qualified: "border-violet-200 bg-violet-50 text-violet-700",
    proposal: "border-amber-200 bg-amber-50 text-amber-700",
    negotiation: "border-orange-200 bg-orange-50 text-orange-700",
    won: "border-emerald-200 bg-emerald-50 text-emerald-700",
    lost: "border-red-200 bg-red-50 text-red-700",
  };

  return classes[stage] || "border-slate-200 bg-slate-50 text-slate-600";
};

const getLeadId = (lead) => {
  if (!lead) return "";

  if (typeof lead === "string") {
    return lead;
  }

  return lead._id || lead.id || "";
};

const getLeadName = (lead) => {
  if (!lead) return "-";

  if (typeof lead === "string") {
    return lead;
  }

  return (
    lead.name ||
    lead.fullName ||
    lead.contactName ||
    lead.companyName ||
    lead.email ||
    "-"
  );
};

const getAssignedId = (assignedTo) => {
  if (!assignedTo) return "";

  if (typeof assignedTo === "string") {
    return assignedTo;
  }

  return assignedTo._id || assignedTo.id || "";
};

const getAssignedName = (assignedTo) => {
  if (!assignedTo) {
    return "Not Assigned";
  }

  if (typeof assignedTo === "string") {
    return assignedTo;
  }

  return (
    assignedTo.name ||
    assignedTo.fullName ||
    assignedTo.username ||
    assignedTo.email ||
    "Assigned"
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const Deal = () => {
  const navigate = useNavigate();

  /* =======================================================
     DATA
  ======================================================= */

  const [deals, setDeals] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const [error, setError] = useState("");

  /* =======================================================
     SEARCH / FILTER / PAGINATION
  ======================================================= */

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  /* =======================================================
     SELECTION
  ======================================================= */

  const [selectedIds, setSelectedIds] = useState([]);

  /* =======================================================
     FILTER / COLUMNS
  ======================================================= */

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");

  const [visibleColumns, setVisibleColumns] =
    useState(DEFAULT_COLUMNS);

  /* =======================================================
     HEADER MENUS
  ======================================================= */

  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);

  /* =======================================================
     CREATE / EDIT DRAWER
  ======================================================= */

  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  /* =======================================================
     LEADS
  ======================================================= */

  const [leads, setLeads] = useState([]);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);

  const leadDropdownRef = useRef(null);

  /* =======================================================
     TEAM
  ======================================================= */

  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);

  /* =======================================================
     FETCH DEALS
  ======================================================= */

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await crmApi.getDeals({
        page,
        limit,
        search: submittedSearch || undefined,
        stage: stageFilter || undefined,
      });

      const result = response?.data;

      setDeals(result?.data || []);

      setPagination(
        result?.pagination || {
          total: 0,
          page,
          limit,
          totalPages: 1,
        },
      );
    } catch (err) {
      console.error("Fetch deals error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load deals",
      );

      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [page, limit, submittedSearch, stageFilter]);

  /* =======================================================
     FETCH TEAM
  ======================================================= */

  const fetchTeamMembers = async () => {
    try {
      setTeamLoading(true);

      const response = await teamApi.getTeamMembers({
        page: 1,
        limit: 100,
      });

      const result = response?.data ?? response;

      let members = [];

      if (Array.isArray(result)) {
        members = result;
      } else if (Array.isArray(result?.data)) {
        members = result.data;
      } else if (Array.isArray(result?.members)) {
        members = result.members;
      } else if (Array.isArray(result?.data?.data)) {
        members = result.data.data;
      }

      setTeamMembers(members);
    } catch (err) {
      console.error("Fetch team members error:", err);
      setTeamMembers([]);
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = () => {
    setPage(1);
    setSubmittedSearch(search.trim());
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  /* =======================================================
     FILTER
  ======================================================= */

  const handleStageFilter = (value) => {
    setStageFilter(value);
    setPage(1);
  };

  /* =======================================================
     COLUMNS
  ======================================================= */

  const toggleColumn = (key) => {
    setVisibleColumns((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const resetColumns = () => {
    setVisibleColumns(DEFAULT_COLUMNS);
    setColumnSearch("");
  };

  const filteredColumnOptions = useMemo(() => {
    const query = columnSearch.trim().toLowerCase();

    if (!query) {
      return COLUMN_OPTIONS;
    }

    return COLUMN_OPTIONS.filter((column) =>
      column.label.toLowerCase().includes(query),
    );
  }, [columnSearch]);

  /* =======================================================
     SELECTION
  ======================================================= */

  const currentPageIds = useMemo(
    () =>
      deals
        .map((deal) => deal?._id)
        .filter(Boolean),
    [deals],
  );

  const allCurrentSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) =>
      selectedIds.includes(id),
    );

  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) => !currentPageIds.includes(id),
        ),
      );

      return;
    }

    setSelectedIds((current) => [
      ...new Set([
        ...current,
        ...currentPageIds,
      ]),
    ]);
  };

  const toggleSelectDeal = (id) => {
    if (!id) return;

    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  /* =======================================================
     LEAD SEARCH
  ======================================================= */

  useEffect(() => {
    if (!showModal) return;

    const timer = setTimeout(async () => {
      try {
        setLeadLoading(true);

        const response = await crmApi.getLeads({
          page: 1,
          limit: 20,
          search:
            leadSearch.trim() || undefined,
        });

        const result = response?.data;

        const leadData = Array.isArray(result)
          ? result
          : result?.data || [];

        setLeads(leadData);
      } catch (err) {
        console.error("Lead search error:", err);
        setLeads([]);
      } finally {
        setLeadLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [leadSearch, showModal]);

  /* =======================================================
     OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        leadDropdownRef.current &&
        !leadDropdownRef.current.contains(
          event.target,
        )
      ) {
        setShowLeadDropdown(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  /* =======================================================
     FORM
  ======================================================= */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingDeal(null);
    setForm({ ...EMPTY_FORM });
    setLeadSearch("");
    setLeads([]);
    setShowLeadDropdown(false);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (deal) => {
    setEditingDeal(deal);

    const leadId = getLeadId(deal?.lead);

    const assignedId = getAssignedId(
      deal?.assignedTo,
    );

    setForm({
      name: deal?.name || "",
      description: deal?.description || "",
      lead: leadId,
      value: deal?.value ?? "",
      currency: deal?.currency || "INR",
      stage: deal?.stage || "new",
      expectedCloseDate: deal?.expectedCloseDate
        ? new Date(
            deal.expectedCloseDate,
          )
            .toISOString()
            .slice(0, 10)
        : "",
      assignedTo: assignedId,
    });

    setLeadSearch(
      deal?.lead
        ? getLeadName(deal.lead)
        : "",
    );

    setShowLeadDropdown(false);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingDeal(null);
    setForm({ ...EMPTY_FORM });
    setLeadSearch("");
    setLeads([]);
    setShowLeadDropdown(false);
  };

  /* =======================================================
     LEAD SELECT
  ======================================================= */

  const selectLead = (lead) => {
    setForm((current) => ({
      ...current,
      lead: getLeadId(lead),
    }));

    setLeadSearch(getLeadName(lead));
    setShowLeadDropdown(false);
  };

  const clearLead = () => {
    setForm((current) => ({
      ...current,
      lead: "",
    }));

    setLeadSearch("");
    setShowLeadDropdown(false);
  };

  /* =======================================================
     CREATE / UPDATE
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Deal name is required.");
      return;
    }

    if (!form.lead) {
      setError("Please select a lead.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        description:
          form.description.trim() || null,
        lead: form.lead,
        value:
          form.value === ""
            ? 0
            : Number(form.value),
        currency: form.currency,
        stage: form.stage,
        expectedCloseDate:
          form.expectedCloseDate || null,
        assignedTo:
          form.assignedTo || null,
      };

      if (editingDeal?._id) {
        await crmApi.updateDeal(
          editingDeal._id,
          payload,
        );
      } else {
        await crmApi.createDeal(payload);
      }

      closeModal();

      await fetchDeals();
    } catch (err) {
      console.error(
        "Save deal error:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          "Failed to save deal",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (deal) => {
    if (!deal?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${
        deal?.name || "this deal"
      }"?`,
    );

    if (!confirmed) return;

    try {
      setDeleteId(deal._id);
      setError("");

      await crmApi.deleteDeal(deal._id);

      setSelectedIds((current) =>
        current.filter(
          (id) => id !== deal._id,
        ),
      );

      if (
        deals.length === 1 &&
        page > 1
      ) {
        setPage((current) =>
          Math.max(1, current - 1),
        );
      } else {
        await fetchDeals();
      }
    } catch (err) {
      console.error(
        "Delete deal error:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete deal",
      );
    } finally {
      setDeleteId("");
    }
  };

  /* =======================================================
     STAGE
  ======================================================= */

  const handleStageChange = async (
    deal,
    newStage,
  ) => {
    if (!deal?._id) return;

    if (
      !newStage ||
      newStage === deal.stage
    ) {
      return;
    }

    try {
      setActionLoading(deal._id);
      setError("");

      await crmApi.updateDealStage(
        deal._id,
        {
          stage: newStage,
        },
      );

      setDeals((current) =>
        current.map((item) =>
          item._id === deal._id
            ? {
                ...item,
                stage: newStage,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error(
        "Update deal stage error:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update deal stage",
      );
    } finally {
      setActionLoading("");
    }
  };

  /* =======================================================
     BULK ASSIGN
  ======================================================= */

  const handleAssign = async (
    memberId,
  ) => {
    if (!selectedIds.length) {
      window.alert(
        "Please select at least one deal.",
      );
      return;
    }

    if (!memberId) return;

    try {
      setActionLoading("assign");

      for (const id of selectedIds) {
        await crmApi.updateDeal(id, {
          assignedTo: memberId,
        });
      }

      setShowAssignMenu(false);
      clearSelection();

      await fetchDeals();
    } catch (err) {
      console.error(
        "Assign deal error:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          "Failed to assign deals",
      );
    } finally {
      setActionLoading("");
    }
  };

  /* =======================================================
     ASSIGN TAG
  ======================================================= */

  const handleAssignTag = () => {
    if (!selectedIds.length) {
      window.alert(
        "Please select at least one deal.",
      );
      return;
    }

    setShowTagMenu((current) => !current);
  };

  /* =======================================================
     EXPORT
  ======================================================= */

  const handleExport = () => {
    if (!deals.length) return;

    const headers = [
      "Deal",
      "Lead",
      "Stage",
      "Value",
      "Expected Close",
      "Assigned To",
    ];

    const rows = deals.map((item) => [
      item?.name || "",
      getLeadName(item?.lead),
      getStageLabel(item?.stage),
      item?.value ?? 0,
      item?.expectedCloseDate
        ? formatDate(
            item.expectedCloseDate,
          )
        : "",
      getAssignedName(
        item?.assignedTo,
      ),
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? "",
              ).replace(
                /"/g,
                '""',
              )}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `deals-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = () => {
    setSearch("");
    setSubmittedSearch("");
    setStageFilter("");
    setPage(1);
    setFiltersOpen(false);
  };

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    const total = deals.length;

    const totalValue =
      deals.reduce(
        (sum, deal) =>
          sum +
          Number(
            deal?.value || 0,
          ),
        0,
      );

    const wonValue =
      deals
        .filter(
          (deal) =>
            deal?.stage === "won",
        )
        .reduce(
          (sum, deal) =>
            sum +
            Number(
              deal?.value || 0,
            ),
          0,
        );

    const openDeals =
      deals.filter(
        (deal) =>
          deal?.stage !== "won" &&
          deal?.stage !== "lost",
      ).length;

    return {
      total,
      totalValue,
      wonValue,
      openDeals,
    };
  }, [deals]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Number(
      pagination?.totalPages || 1,
    ),
  );

  const currentPage = Number(
    pagination?.page ||
      page ||
      1,
  );

  const total = Number(
    pagination?.total || 0,
  );

  const startItem =
    total === 0
      ? 0
      : (currentPage - 1) *
          limit +
        1;

  const endItem = Math.min(
    currentPage * limit,
    total,
  );

  const canPrevious =
    currentPage > 1;

  const canNext =
    currentPage < totalPages;

  const pageNumbers = useMemo(() => {
    const pages = [];

    if (totalPages <= 5) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(
      2,
      currentPage - 1,
    );

    const end = Math.min(
      totalPages - 1,
      currentPage + 1,
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    if (
      currentPage <
      totalPages - 2
    ) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  }, [
    currentPage,
    totalPages,
  ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex min-h-[76px] max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">

          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-2.5">

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />

              Back
            </button>

            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

            <span className="text-xs text-slate-500">CRM</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">Deals</div>
              <p className="mt-0.5 hidden text-[11px] text-slate-500 sm:block">Manage and track your deals.</p>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-wrap items-center justify-end gap-1.5">

            {/* REFRESH */}

            <button
              type="button"
              onClick={fetchDeals}
              disabled={loading}
              title="Refresh"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>

            {/* ADD */}

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" />

              Add Deal
            </button>

          </div>
        </div>
      </div>

      {/* ===================================================
          STATUS TABS / SEARCH
      =================================================== */}

      <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 px-3 pt-2 sm:px-4">
            {[{ value: "", label: "All Deals" }, ...STAGES.map((stage) => ({ value: stage.value, label: stage.label }))].map((tab) => {
              const active = stageFilter === tab.value;
              return (
                <button
                  key={tab.value || "all"}
                  type="button"
                  onClick={() => handleStageFilter(tab.value)}
                  className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-xs font-medium transition ${active ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search deals..."
                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-100"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-5 py-2.5 text-xs text-red-700">

          <div className="flex items-center justify-between">

            <span>{error}</span>

            <button
              type="button"
              onClick={fetchDeals}
              className="font-semibold underline"
            >
              Retry
            </button>

          </div>

        </div>
      )}

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="mx-auto mb-6 max-w-[1600px] overflow-x-auto rounded-lg border border-slate-200 bg-white sm:mx-6 lg:mx-auto">

        <table className="w-full min-w-[1000px] border-collapse">

          {/* HEADER */}

          <thead>

            <tr className="border-b border-slate-200 bg-slate-50/80">

              {/* DEAL */}

              {visibleColumns.deal && (
                <th className="px-3 py-3 text-left">

                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">

                    <BriefcaseBusiness className="h-3.5 w-3.5" />

                    Deal

                  </div>

                </th>
              )}

              {/* LEAD */}

              {visibleColumns.lead && (
                <th className="px-3 py-3 text-left">

                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">

                    <UserRound className="h-3.5 w-3.5" />

                    Lead / Account

                  </div>

                </th>
              )}

              {/* STAGE */}

              {visibleColumns.stage && (
                <th className="px-3 py-3 text-left">

                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Stage
                  </div>

                </th>
              )}

              {/* VALUE */}

              {visibleColumns.value && (
                <th className="px-3 py-3 text-left">

                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">

                    <DollarSign className="h-3.5 w-3.5" />

                    Value

                  </div>

                </th>
              )}

              {/* CLOSE */}

              {visibleColumns.closeDate && (
                <th className="px-3 py-3 text-left">

                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">

                    <CalendarDays className="h-3.5 w-3.5" />

                    Expected Close

                  </div>

                </th>
              )}

              {/* ASSIGNED */}

              {visibleColumns.assignedTo && (
                <th className="px-3 py-3 text-left">

                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">

                    <UsersRound className="h-3.5 w-3.5" />

                    Assigned To

                  </div>

                </th>
              )}

              {/* ACTION */}

              {visibleColumns.action && (
                <th className="px-3 py-3 text-right">

                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Actions
                  </div>

                </th>
              )}

            </tr>

          </thead>

          {/* BODY */}

          <tbody>

            {loading ? (
              Array.from({
                length: 8,
              }).map(
                (_, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100"
                  >

                    <td className="px-4 py-4">
                      <div className="h-4 w-4 animate-pulse rounded border border-slate-200 bg-slate-100" />
                    </td>

                    {Object.entries(
                      visibleColumns,
                    ).map(
                      ([key, visible]) =>
                        visible && (
                          <td
                            key={key}
                            className="px-3 py-4"
                          >
                            <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
                          </td>
                        ),
                    )}

                  </tr>
                ),
              )
            ) : deals.length === 0 ? (
              <tr>

                <td
                  colSpan={Object.values(visibleColumns).filter(Boolean).length}
                  className="px-5 py-20 text-center"
                >

                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">

                    <BriefcaseBusiness className="h-4 w-4 text-slate-400" />

                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-800">
                    No deals found
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Try changing your search or filters.
                  </p>

                </td>

              </tr>
            ) : (
              deals.map(
                (deal) => {
                  return (
                    <tr
                      key={
                        deal._id
                      }
                      className="border-b border-slate-100 transition hover:bg-slate-50/70"
                    >

                      {/* DEAL */}

                      {visibleColumns.deal && (
                        <td className="px-3 py-3.5">

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                deal,
                              )
                            }
                            className="flex max-w-[250px] items-center gap-2 text-left"
                          >

                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-700">
                              {getInitials(
                                deal?.name,
                              )}
                            </span>

                            <span className="min-w-0">

                              <span className="block truncate text-xs font-semibold text-slate-800 hover:text-blue-600">
                                {deal?.name ||
                                  "Unnamed Deal"}
                              </span>

                              {deal?.description && (
                                <span className="block max-w-[200px] truncate text-[10px] text-slate-400">
                                  {
                                    deal.description
                                  }
                                </span>
                              )}

                            </span>

                          </button>

                        </td>
                      )}

                      {/* LEAD */}

                      {visibleColumns.lead && (
                        <td className="px-3 py-3.5">

                          <div className="max-w-[190px]">

                            <span className="block truncate text-xs font-medium text-slate-700">
                              {getLeadName(
                                deal?.lead,
                              )}
                            </span>

                            {deal?.lead?.email && (
                              <span className="block truncate text-[10px] text-slate-400">
                                {
                                  deal.lead
                                    .email
                                }
                              </span>
                            )}

                          </div>

                        </td>
                      )}

                      {/* STAGE */}

                      {visibleColumns.stage && (
                        <td className="px-3 py-3.5">

                          <select
                            value={
                              deal?.stage ||
                              "new"
                            }
                            disabled={
                              actionLoading ===
                              deal?._id
                            }
                            onChange={(e) =>
                              handleStageChange(
                                deal,
                                e.target
                                  .value,
                              )
                            }
                            className={`h-7 rounded-md border px-2 text-[10px] font-semibold outline-none ${getStageClass(
                              deal?.stage,
                            )}`}
                          >

                            {STAGES.map(
                              (
                                stage,
                              ) => (
                                <option
                                  key={
                                    stage.value
                                  }
                                  value={
                                    stage.value
                                  }
                                >
                                  {
                                    stage.label
                                  }
                                </option>
                              ),
                            )}

                          </select>

                        </td>
                      )}

                      {/* VALUE */}

                      {visibleColumns.value && (
                        <td className="px-3 py-3.5">

                          <span className="whitespace-nowrap text-xs font-semibold text-slate-700">
                            {formatCurrency(
                              deal?.value,
                              deal?.currency ||
                                "INR",
                            )}
                          </span>

                        </td>
                      )}

                      {/* CLOSE DATE */}

                      {visibleColumns.closeDate && (
                        <td className="px-3 py-3.5">

                          <div className="flex items-center gap-1.5 whitespace-nowrap">

                            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                            <span className="text-xs text-slate-600">
                              {formatDate(
                                deal?.expectedCloseDate,
                              )}
                            </span>

                          </div>

                        </td>
                      )}

                      {/* ASSIGNED */}

                      {visibleColumns.assignedTo && (
                        <td className="px-3 py-3.5">

                          {deal?.assignedTo ? (
                            <span className="inline-flex max-w-[160px] items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">

                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                              <span className="truncate">
                                {getAssignedName(
                                  deal.assignedTo,
                                )}
                              </span>

                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-600">

                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                              Not Assigned

                            </span>
                          )}

                        </td>
                      )}

                      {/* ACTION */}

                      {visibleColumns.action && (
                        <td className="px-3 py-3.5">

                          <div className="flex items-center justify-end gap-1">

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  deal,
                                )
                              }
                              title="Edit"
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  deal,
                                )
                              }
                              disabled={
                                deleteId ===
                                deal?._id
                              }
                              title="Delete"
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >

                              <Trash2
                                className={`h-3.5 w-3.5 ${
                                  deleteId ===
                                  deal?._id
                                    ? "animate-pulse"
                                    : ""
                                }`}
                              />

                            </button>

                          </div>

                        </td>
                      )}

                    </tr>
                  );
                },
              )
            )}

          </tbody>

        </table>
      </div>

      {/* ===================================================
          FOOTER
      =================================================== */}

      {!loading &&
        deals.length > 0 && (
          <div className="flex min-h-[56px] items-center justify-between border-t border-slate-200 bg-white px-5">

            {/* LEFT */}

            <div className="text-[11px] text-slate-500">

              Showing{" "}
              <span className="font-medium text-slate-700">{startItem}</span>{" "}
              to{" "}
              <span className="font-medium text-slate-700">{endItem}</span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">{total}</span>

            </div>

            {/* RIGHT */}

            <div className="flex items-center gap-1">

              <button
                type="button"
                disabled={
                  !canPrevious
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.max(
                        1,
                        current - 1,
                      ),
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {pageNumbers.map(
                (number, index) =>
                  number ===
                  "..." ? (
                    <span
                      key={`dots-${index}`}
                      className="flex h-7 w-7 items-center justify-center text-[10px] text-slate-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={number}
                      type="button"
                      onClick={() =>
                        setPage(
                          number,
                        )
                      }
                      className={`flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-[10px] font-semibold transition ${
                        currentPage ===
                        number
                          ? "bg-blue-600 text-white"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {number}
                    </button>
                  ),
              )}

              <button
                type="button"
                disabled={!canNext}
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.min(
                        totalPages,
                        current + 1,
                      ),
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              <select
                value={limit}
                onChange={(e) => {
                  setLimit(
                    Number(
                      e.target.value,
                    ),
                  );
                  setPage(1);
                }}
                className="ml-2 h-7 rounded-md border border-slate-200 bg-white px-2 text-[10px] font-medium text-slate-600 outline-none focus:border-blue-400"
              >
                <option value={10}>
                  10 / page
                </option>

                <option value={20}>
                  20 / page
                </option>

                <option value={50}>
                  50 / page
                </option>

                <option value={100}>
                  100 / page
                </option>
              </select>

            </div>

          </div>
        )}

      {/* ===================================================
          CREATE / EDIT DRAWER
      =================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-[100]">

          {/* OVERLAY */}

          <div
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]"
            onClick={closeModal}
          />

          {/* DRAWER */}

          <div className="absolute right-0 top-0 flex h-full w-full max-w-[600px] flex-col border-l border-slate-200 bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex min-h-[64px] items-center justify-between border-b border-slate-200 px-5">

              <div>

                <h2 className="text-sm font-semibold text-slate-900">
                  {editingDeal
                    ? "Edit Deal"
                    : "Add Deal"}
                </h2>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  {editingDeal
                    ? "Update deal details"
                    : "Create a new sales deal"}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto"
            >

              <div className="space-y-4 p-5">

                {/* NAME */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Deal Name
                    <span className="text-red-500">
                      {" "}
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={
                      handleFormChange
                    }
                    placeholder="Enter deal name"
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />

                </div>

                {/* LEAD */}

                <div
                  ref={
                    leadDropdownRef
                  }
                  className="relative"
                >

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Lead / Contact
                    <span className="text-red-500">
                      {" "}
                      *
                    </span>
                  </label>

                  {form.lead ? (
                    <div className="flex h-9 items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3">

                      <span className="truncate text-xs text-slate-700">
                        {leadSearch ||
                          "Selected Lead"}
                      </span>

                      <button
                        type="button"
                        onClick={
                          clearLead
                        }
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>

                    </div>
                  ) : (
                    <>
                      <div className="relative">

                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                        <input
                          type="text"
                          value={
                            leadSearch
                          }
                          onFocus={() =>
                            setShowLeadDropdown(
                              true,
                            )
                          }
                          onChange={(e) => {
                            setLeadSearch(
                              e.target
                                .value,
                            );

                            setShowLeadDropdown(
                              true,
                            );
                          }}
                          placeholder="Search lead..."
                          className="h-9 w-full rounded-md border border-slate-200 pl-9 pr-3 text-xs outline-none placeholder:text-slate-400 focus:border-blue-400"
                        />

                      </div>

                      {showLeadDropdown && (
                        <div className="absolute left-0 right-0 top-[62px] z-50 max-h-[220px] overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-xl">

                          {leadLoading ? (
                            <div className="px-3 py-3 text-[11px] text-slate-400">
                              Searching...
                            </div>
                          ) : leads.length ===
                            0 ? (
                            <div className="px-3 py-3 text-[11px] text-slate-400">
                              No leads found.
                            </div>
                          ) : (
                            leads.map(
                              (lead) => (
                                <button
                                  key={
                                    lead._id
                                  }
                                  type="button"
                                  onClick={() =>
                                    selectLead(
                                      lead,
                                    )
                                  }
                                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-slate-50"
                                >

                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-700">
                                    {getInitials(
                                      getLeadName(
                                        lead,
                                      ),
                                    )}
                                  </span>

                                  <span className="min-w-0">

                                    <span className="block truncate text-xs font-medium text-slate-700">
                                      {getLeadName(
                                        lead,
                                      )}
                                    </span>

                                    {lead.email && (
                                      <span className="block truncate text-[10px] text-slate-400">
                                        {
                                          lead.email
                                        }
                                      </span>
                                    )}

                                  </span>

                                </button>
                              ),
                            )
                          )}

                        </div>
                      )}

                    </>
                  )}

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleFormChange
                    }
                    rows={3}
                    placeholder="Enter description"
                    className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />

                </div>

                {/* STAGE / VALUE */}

                <div className="grid grid-cols-2 gap-3">

                  <div>

                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Stage
                    </label>

                    <select
                      name="stage"
                      value={
                        form.stage
                      }
                      onChange={
                        handleFormChange
                      }
                      className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400"
                    >

                      {STAGES.map(
                        (stage) => (
                          <option
                            key={
                              stage.value
                            }
                            value={
                              stage.value
                            }
                          >
                            {
                              stage.label
                            }
                          </option>
                        ),
                      )}

                    </select>

                  </div>

                  <div>

                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Value
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="value"
                      value={
                        form.value
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="0"
                      className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400"
                    />

                  </div>

                </div>

                {/* CURRENCY */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Currency
                  </label>

                  <select
                    name="currency"
                    value={
                      form.currency
                    }
                    onChange={
                      handleFormChange
                    }
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400"
                  >

                    <option value="INR">
                      INR
                    </option>

                    <option value="USD">
                      USD
                    </option>

                    <option value="EUR">
                      EUR
                    </option>

                    <option value="GBP">
                      GBP
                    </option>

                  </select>

                </div>

                {/* CLOSE DATE */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Expected Close Date
                  </label>

                  <input
                    type="date"
                    name="expectedCloseDate"
                    value={
                      form.expectedCloseDate
                    }
                    onChange={
                      handleFormChange
                    }
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-700 outline-none focus:border-blue-400"
                  />

                </div>

                {/* ASSIGNED */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Assigned To
                  </label>

                  <select
                    name="assignedTo"
                    value={
                      form.assignedTo
                    }
                    onChange={
                      handleFormChange
                    }
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400"
                  >

                    <option value="">
                      Not Assigned
                    </option>

                    {teamMembers.map(
                      (member) => {
                        const memberId =
                          member?._id ||
                          member?.id;

                        return (
                          <option
                            key={
                              memberId
                            }
                            value={
                              memberId
                            }
                          >
                            {member?.name ||
                              member?.fullName ||
                              member?.email ||
                              "Team Member"}
                          </option>
                        );
                      },
                    )}

                  </select>

                </div>

              </div>

              {/* FOOTER */}

              <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                  className="h-8 rounded-md border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-3 text-[11px] font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving && (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  )}

                  {editingDeal
                    ? "Update Deal"
                    : "Create Deal"}

                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Deal;