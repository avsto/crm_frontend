import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Download,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Target,
  Trash2,
  Upload,
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
  { value: "discovery", label: "Discovery" },
  { value: "demo", label: "Demo" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const EMPTY_FORM = {
  lead: "",
  name: "",
  description: "",
  stage: "new",
  probability: 0,
  amount: "",
  currency: "INR",
  expectedCloseDate: "",
  assignedTo: "",
  source: "manual",
  notes: "",
};

const DEFAULT_COLUMNS = {
  opportunity: true,
  lead: true,
  stage: true,
  value: true,
  probability: true,
  closeDate: true,
  assignedTo: true,
  action: true,
};

const COLUMN_OPTIONS = [
  { key: "opportunity", label: "Opportunity" },
  { key: "lead", label: "Lead / Account" },
  { key: "stage", label: "Stage" },
  { key: "value", label: "Value" },
  { key: "probability", label: "Probability" },
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
  const words = String(name).trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "OP";

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
    discovery: "border-cyan-200 bg-cyan-50 text-cyan-700",
    demo: "border-indigo-200 bg-indigo-50 text-indigo-700",
    proposal: "border-amber-200 bg-amber-50 text-amber-700",
    negotiation: "border-orange-200 bg-orange-50 text-orange-700",
    won: "border-emerald-200 bg-emerald-50 text-emerald-700",
    lost: "border-red-200 bg-red-50 text-red-700",
  };

  return classes[stage] || "border-slate-200 bg-slate-50 text-slate-600";
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

const getAssignedName = (assignedTo) => {
  if (!assignedTo) {
    return "Not Assigned";
  }

  if (typeof assignedTo === "string") {
    return assignedTo;
  }

  return (
    assignedTo.name || assignedTo.fullName || assignedTo.email || "Assigned"
  );
};

const getAssignedId = (assignedTo) => {
  if (!assignedTo) return "";

  if (typeof assignedTo === "string") {
    return assignedTo;
  }

  return assignedTo._id || assignedTo.id || "";
};

/* =========================================================
   COMPONENT
========================================================= */

const Opportunity = () => {
  const navigate = useNavigate();

  /* =======================================================
     DATA STATE
  ======================================================= */

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  /* =======================================================
     SEARCH / PAGINATION
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
     FILTER / COLUMN UI
  ======================================================= */

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");

  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);

  /* =======================================================
     ASSIGN / TAG / IMPORT MENUS
  ======================================================= */

  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);

  /* =======================================================
     CREATE / EDIT DRAWER
  ======================================================= */

  const [showModal, setShowModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  /* =======================================================
     LEAD SEARCH
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
     DELETE
  ======================================================= */

  const [deleteId, setDeleteId] = useState("");

  /* =======================================================
     FETCH OPPORTUNITIES
  ======================================================= */

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await crmApi.getOpportunities({
        page,
        limit,
        search: submittedSearch || undefined,
        stage: stageFilter || undefined,
      });

      const result = response?.data;

      setOpportunities(result?.data || []);

      setPagination(
        result?.pagination || {
          total: 0,
          page: 1,
          limit,
          totalPages: 1,
        },
      );
    } catch (err) {
      console.error("Fetch opportunities error:", err);

      setError(err?.response?.data?.message || "Failed to load opportunities");

      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
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

      const result = response?.data;

      setTeamMembers(
        result?.data ||
          result?.members ||
          (Array.isArray(result) ? result : []),
      );
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
    () => opportunities.map((item) => item?._id).filter(Boolean),
    [opportunities],
  );

  const allCurrentSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !currentPageIds.includes(id)),
      );

      return;
    }

    setSelectedIds((current) => [...new Set([...current, ...currentPageIds])]);
  };

  const toggleSelectOpportunity = (id) => {
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
          search: leadSearch.trim() || undefined,
        });

        const result = response?.data;

        setLeads(result?.data || []);
      } catch (err) {
        console.error("Lead search error:", err);
        setLeads([]);
      } finally {
        setLeadLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [leadSearch, showModal]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        leadDropdownRef.current &&
        !leadDropdownRef.current.contains(event.target)
      ) {
        setShowLeadDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
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
    setEditingOpportunity(null);
    setForm(EMPTY_FORM);
    setLeadSearch("");
    setLeads([]);
    setShowLeadDropdown(false);
    setShowModal(true);
  };

  const openEditModal = (opportunity) => {
    setEditingOpportunity(opportunity);

    const leadId =
      typeof opportunity?.lead === "object"
        ? opportunity.lead?._id
        : opportunity?.lead || "";

    const assignedId = getAssignedId(opportunity?.assignedTo);

    setForm({
      lead: leadId || "",
      name: opportunity?.name || "",
      description: opportunity?.description || "",
      stage: opportunity?.stage || "new",
      probability: opportunity?.probability ?? 0,
      amount: opportunity?.amount ?? "",
      currency: opportunity?.currency || "INR",
      expectedCloseDate: opportunity?.expectedCloseDate
        ? new Date(opportunity.expectedCloseDate).toISOString().slice(0, 10)
        : "",
      assignedTo: assignedId,
      source: opportunity?.source || "manual",
      notes: opportunity?.notes || "",
    });

    setLeadSearch(opportunity?.lead ? getLeadName(opportunity.lead) : "");

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingOpportunity(null);
    setForm(EMPTY_FORM);
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
      lead: lead?._id || lead?.id || "",
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
      setError("Opportunity name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        name: form.name.trim(),
        amount: form.amount === "" ? 0 : Number(form.amount),
        probability: Number(form.probability || 0),
        lead: form.lead || undefined,
        assignedTo: form.assignedTo || undefined,
      };

      if (editingOpportunity?._id) {
        await crmApi.updateOpportunity(editingOpportunity._id, payload);
      } else {
        await crmApi.createOpportunity(payload);
      }

      closeModal();
      await fetchOpportunities();
    } catch (err) {
      console.error("Save opportunity error:", err);

      setError(err?.response?.data?.message || "Failed to save opportunity");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (opportunity) => {
    if (!opportunity?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${opportunity.name || "this opportunity"}"?`,
    );

    if (!confirmed) return;

    try {
      setDeleteId(opportunity._id);
      setError("");

      await crmApi.deleteOpportunity(opportunity._id);

      setSelectedIds((current) =>
        current.filter((id) => id !== opportunity._id),
      );

      if (opportunities.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        await fetchOpportunities();
      }
    } catch (err) {
      console.error("Delete opportunity error:", err);

      setError(err?.response?.data?.message || "Failed to delete opportunity");
    } finally {
      setDeleteId("");
    }
  };

  /* =======================================================
     STAGE
  ======================================================= */

  const handleStageChange = async (opportunity, newStage) => {
    if (!opportunity?._id) return;

    if (!newStage || newStage === opportunity.stage) {
      return;
    }

    try {
      setActionLoading(opportunity._id);
      setError("");

      await crmApi.updateOpportunityStage(opportunity._id, {
        stage: newStage,
      });

      setOpportunities((current) =>
        current.map((item) =>
          item._id === opportunity._id
            ? {
                ...item,
                stage: newStage,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Update opportunity stage error:", err);

      setError(
        err?.response?.data?.message || "Failed to update opportunity stage",
      );
    } finally {
      setActionLoading("");
    }
  };

  /* =======================================================
     BULK ASSIGN
  ======================================================= */

  const handleAssign = async (memberId) => {
    if (!selectedIds.length) {
      window.alert("Please select at least one opportunity.");
      return;
    }

    if (!memberId) {
      return;
    }

    try {
      setActionLoading("assign");

      for (const id of selectedIds) {
        await crmApi.updateOpportunity(id, {
          assignedTo: memberId,
        });
      }

      setShowAssignMenu(false);
      clearSelection();

      await fetchOpportunities();
    } catch (err) {
      console.error("Assign opportunity error:", err);

      setError(
        err?.response?.data?.message || "Failed to assign opportunities",
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
      window.alert("Please select at least one opportunity.");
      return;
    }

    setShowTagMenu((current) => !current);
  };

  /* =======================================================
     EXPORT
  ======================================================= */

  const handleExport = () => {
    if (!opportunities.length) return;

    const headers = [
      "Opportunity",
      "Lead",
      "Stage",
      "Value",
      "Probability",
      "Expected Close",
      "Assigned To",
      "Source",
    ];

    const rows = opportunities.map((item) => [
      item?.name || "",
      getLeadName(item?.lead),
      getStageLabel(item?.stage),
      item?.amount ?? 0,
      `${item?.probability ?? 0}%`,
      item?.expectedCloseDate ? formatDate(item.expectedCloseDate) : "",
      getAssignedName(item?.assignedTo),
      item?.source || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `opportunities-${new Date()
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
    const total = opportunities.length;

    const totalValue = opportunities.reduce(
      (sum, item) => sum + Number(item?.amount || 0),
      0,
    );

    const wonValue = opportunities
      .filter((item) => item?.stage === "won")
      .reduce((sum, item) => sum + Number(item?.amount || 0), 0);

    const openOpportunities = opportunities.filter(
      (item) => item?.stage !== "won" && item?.stage !== "lost",
    ).length;

    return {
      total,
      totalValue,
      wonValue,
      openOpportunities,
    };
  }, [opportunities]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(1, Number(pagination?.totalPages || 1));

  const currentPage = Number(pagination?.page || page || 1);

  const total = Number(pagination?.total || 0);

  const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;

  const endItem = Math.min(currentPage * limit, total);

  const canPrevious = currentPage > 1;
  const canNext = currentPage < totalPages;

  const pageNumbers = useMemo(() => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);

    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ===================================================
          TOP HEADER
      =================================================== */}

      <div className="border-b border-slate-200 bg-white">
        <div className="flex min-h-[64px] items-center justify-between gap-4 px-5">
          {/* LEFT */}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

            <span className="text-sm font-semibold text-slate-900">
              Opportunities
            </span>

            <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 sm:inline-flex">
              {total}
            </span>
          </div>

          {/* ACTIONS */}

          <div className="flex items-center gap-1.5">
            {/* ASSIGN */}

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!selectedIds.length) {
                    window.alert("Please select at least one opportunity.");
                    return;
                  }

                  setShowAssignMenu((value) => !value);
                  setShowTagMenu(false);
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <UsersRound className="h-3.5 w-3.5" />
                Assign
              </button>

              {showAssignMenu && (
                <div className="absolute right-0 top-10 z-50 w-[240px] rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-slate-900">
                      Assign To
                    </span>

                    <button
                      type="button"
                      onClick={() => setShowAssignMenu(false)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="max-h-[250px] overflow-y-auto">
                    {teamLoading ? (
                      <div className="px-2 py-3 text-[11px] text-slate-400">
                        Loading team...
                      </div>
                    ) : teamMembers.length === 0 ? (
                      <div className="px-2 py-3 text-[11px] text-slate-400">
                        No team members found.
                      </div>
                    ) : (
                      teamMembers.map((member) => {
                        const memberId = member?._id || member?.id;

                        return (
                          <button
                            key={memberId}
                            type="button"
                            onClick={() => handleAssign(memberId)}
                            disabled={actionLoading === "assign"}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-slate-50 disabled:opacity-50"
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-600">
                              {getInitials(member?.name || member?.email)}
                            </span>

                            <span className="min-w-0">
                              <span className="block truncate text-[11px] font-medium text-slate-700">
                                {member?.name ||
                                  member?.fullName ||
                                  "Team Member"}
                              </span>

                              {member?.email && (
                                <span className="block truncate text-[9px] text-slate-400">
                                  {member.email}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ASSIGN TAG */}

            <div className="relative">
              <button
                type="button"
                onClick={handleAssignTag}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Target className="h-3.5 w-3.5" />
                Assign Tag
              </button>

              {showTagMenu && (
                <div className="absolute right-0 top-10 z-50 w-[220px] rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      Assign Tag
                    </span>

                    <button
                      type="button"
                      onClick={() => setShowTagMenu(false)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="mt-2 text-[10px] leading-4 text-slate-400">
                    Tag assignment can be connected to your tag management API.
                  </p>
                </div>
              )}
            </div>

            <div className="mx-1 h-5 w-px bg-slate-200" />

            {/* REFRESH */}

            <button
              type="button"
              onClick={fetchOpportunities}
              disabled={loading}
              title="Refresh"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            {/* IMPORT */}

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowImportMenu((value) => !value)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <Upload className="h-3.5 w-3.5" />
                Import
              </button>

              {showImportMenu && (
                <div className="absolute right-0 top-10 z-50 w-[220px] rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      Import Opportunities
                    </span>

                    <button
                      type="button"
                      onClick={() => setShowImportMenu(false)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="mt-2 text-[10px] leading-4 text-slate-400">
                    Import functionality can be connected to your opportunity
                    import workflow.
                  </p>
                </div>
              )}
            </div>

            {/* EXPORT */}

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>

            {/* ADD */}

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-3 text-[11px] font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Opportunity
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          SUMMARY
      =================================================== */}

      <div className="border-b border-slate-200 bg-white px-5 py-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Opportunities
              </span>

              <Target className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="mt-1 text-sm font-bold text-slate-900">
              {summary.total}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Pipeline Value
              </span>

              <DollarSign className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="mt-1 text-sm font-bold text-slate-900">
              {formatCurrency(summary.totalValue)}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Won Value
              </span>

              <Check className="h-3.5 w-3.5 text-emerald-500" />
            </div>

            <div className="mt-1 text-sm font-bold text-slate-900">
              {formatCurrency(summary.wonValue)}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Open
              </span>

              <UsersRound className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="mt-1 text-sm font-bold text-slate-900">
              {summary.openOpportunities}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          SEARCH / FILTER BAR
      =================================================== */}

      <div className="border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* SEARCH */}

          <div className="flex h-9 w-full max-w-[430px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search opportunities..."
                className="h-full w-full rounded-l-md border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex w-[82px] items-center justify-center gap-1.5 rounded-r-md border border-l-0 border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-1.5">
            {/* FILTER */}

            <div className="relative">
              <button
                type="button"
                onClick={() => setFiltersOpen((value) => !value)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-semibold transition ${
                  filtersOpen || stageFilter
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
                {stageFilter && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] text-white">
                    1
                  </span>
                )}
              </button>

              {filtersOpen && (
                <div className="absolute right-0 top-11 z-50 w-[270px] rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      Filters
                    </span>

                    <button
                      type="button"
                      onClick={() => setFiltersOpen(false)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Stage
                  </label>

                  <select
                    value={stageFilter}
                    onChange={(e) => handleStageFilter(e.target.value)}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-blue-400"
                  >
                    <option value="">All Stages</option>

                    {STAGES.map((stage) => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-3 w-full rounded-md border border-slate-200 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* RESET */}

            <button
              type="button"
              onClick={handleReset}
              title="Reset filters"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* COLUMNS */}

            <div className="relative">
              <button
                type="button"
                onClick={() => setColumnsOpen((value) => !value)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-semibold transition ${
                  columnsOpen
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Columns
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {columnsOpen && (
                <div className="absolute right-0 top-11 z-50 w-[270px] rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      Table Columns
                    </span>

                    <button
                      type="button"
                      onClick={() => setColumnsOpen(false)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mb-2 flex items-center gap-2 rounded-md border border-slate-200 px-2.5">
                    <Search className="h-3.5 w-3.5 text-slate-400" />

                    <input
                      type="text"
                      value={columnSearch}
                      onChange={(e) => setColumnSearch(e.target.value)}
                      placeholder="Search columns..."
                      className="h-8 w-full bg-transparent text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={resetColumns}
                    className="mb-2 w-full border-b border-slate-100 pb-2 text-left text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Reset columns
                  </button>

                  <div className="max-h-[300px] space-y-0.5 overflow-y-auto">
                    {filteredColumnOptions.map((column) => (
                      <button
                        key={column.key}
                        type="button"
                        onClick={() => toggleColumn(column.key)}
                        className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition hover:bg-slate-50"
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded border ${
                            visibleColumns[column.key]
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {visibleColumns[column.key] && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </span>

                        <span className="text-[11px] font-medium text-slate-700">
                          {column.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
              onClick={fetchOpportunities}
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1250px] border-collapse">
          {/* HEADER */}

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {/* SELECT */}

              <th className="w-[48px] px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                    allCurrentSelected
                      ? "border-blue-600 bg-blue-600"
                      : "border-slate-300 bg-white hover:border-blue-500"
                  }`}
                >
                  {allCurrentSelected && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
              </th>

              {/* OPPORTUNITY */}

              {visibleColumns.opportunity && (
                <th className="px-3 py-3 text-left">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    <Target className="h-3.5 w-3.5" />
                    Opportunity
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

              {/* PROBABILITY */}

              {visibleColumns.probability && (
                <th className="px-3 py-3 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Probability
                  </div>
                </th>
              )}

              {/* CLOSE DATE */}

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
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="px-4 py-4">
                    <div className="h-4 w-4 animate-pulse rounded border border-slate-200 bg-slate-100" />
                  </td>

                  {Object.entries(visibleColumns).map(
                    ([key, visible]) =>
                      visible && (
                        <td key={key} className="px-3 py-4">
                          <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
                        </td>
                      ),
                  )}
                </tr>
              ))
            ) : opportunities.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    1 + Object.values(visibleColumns).filter(Boolean).length
                  }
                  className="px-5 py-20 text-center"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    <Target className="h-4 w-4 text-slate-400" />
                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-800">
                    No opportunities found
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Try changing your search or filters.
                  </p>
                </td>
              </tr>
            ) : (
              opportunities.map((opportunity) => {
                const selected = selectedIds.includes(opportunity?._id);

                return (
                  <tr
                    key={opportunity._id}
                    className={`border-b border-slate-100 transition ${
                      selected ? "bg-blue-50/50" : "hover:bg-slate-50/70"
                    }`}
                  >
                    {/* SELECT */}

                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleSelectOpportunity(opportunity._id)}
                        className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                          selected
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-300 bg-white hover:border-blue-500"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 text-white" />}
                      </button>
                    </td>

                    {/* OPPORTUNITY */}

                    {visibleColumns.opportunity && (
                      <td className="px-3 py-3.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(opportunity)}
                          className="flex max-w-[240px] items-center gap-2 text-left"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-700">
                            {getInitials(opportunity?.name)}
                          </span>

                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold text-slate-800 hover:text-blue-600">
                              {opportunity?.name || "Unnamed Opportunity"}
                            </span>

                            {opportunity?.description && (
                              <span className="block max-w-[190px] truncate text-[10px] text-slate-400">
                                {opportunity.description}
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
                            {getLeadName(opportunity?.lead)}
                          </span>

                          {opportunity?.lead?.email && (
                            <span className="block truncate text-[10px] text-slate-400">
                              {opportunity.lead.email}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* STAGE */}

                    {visibleColumns.stage && (
                      <td className="px-3 py-3.5">
                        <select
                          value={opportunity?.stage || "new"}
                          disabled={actionLoading === opportunity?._id}
                          onChange={(e) =>
                            handleStageChange(opportunity, e.target.value)
                          }
                          className={`h-7 rounded-md border px-2 text-[10px] font-semibold outline-none ${getStageClass(
                            opportunity?.stage,
                          )}`}
                        >
                          {STAGES.map((stage) => (
                            <option key={stage.value} value={stage.value}>
                              {stage.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}

                    {/* VALUE */}

                    {visibleColumns.value && (
                      <td className="px-3 py-3.5">
                        <span className="whitespace-nowrap text-xs font-semibold text-slate-700">
                          {formatCurrency(
                            opportunity?.amount,
                            opportunity?.currency || "INR",
                          )}
                        </span>
                      </td>
                    )}

                    {/* PROBABILITY */}

                    {visibleColumns.probability && (
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Number(opportunity?.probability || 0),
                                  ),
                                )}%`,
                              }}
                            />
                          </div>

                          <span className="text-[10px] font-semibold text-slate-600">
                            {Number(opportunity?.probability || 0)}%
                          </span>
                        </div>
                      </td>
                    )}

                    {/* CLOSE DATE */}

                    {visibleColumns.closeDate && (
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                          <span className="text-xs text-slate-600">
                            {formatDate(opportunity?.expectedCloseDate)}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* ASSIGNED */}

                    {visibleColumns.assignedTo && (
                      <td className="px-3 py-3.5">
                        {opportunity?.assignedTo ? (
                          <span className="inline-flex max-w-[160px] items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            <span className="truncate">
                              {getAssignedName(opportunity.assignedTo)}
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
                            onClick={() => openEditModal(opportunity)}
                            title="Edit"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(opportunity)}
                            disabled={deleteId === opportunity?._id}
                            title="Delete"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2
                              className={`h-3.5 w-3.5 ${
                                deleteId === opportunity?._id
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
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ===================================================
          FOOTER / PAGINATION
      =================================================== */}

      {!loading && opportunities.length > 0 && (
        <div className="flex min-h-[56px] items-center justify-between border-t border-slate-200 bg-white px-5">
          {/* LEFT */}

          <div className="text-[11px] text-slate-500">
            {selectedIds.length > 0 ? (
              <span>
                <span className="font-semibold text-blue-600">
                  {selectedIds.length}
                </span>{" "}
                selected
              </span>
            ) : (
              <>
                Showing{" "}
                <span className="font-medium text-slate-700">{startItem}</span>{" "}
                to <span className="font-medium text-slate-700">{endItem}</span>{" "}
                of <span className="font-medium text-slate-700">{total}</span>
              </>
            )}
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!canPrevious}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {pageNumbers.map((number, index) =>
              number === "..." ? (
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
                  onClick={() => setPage(number)}
                  className={`flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-[10px] font-semibold transition ${
                    currentPage === number
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
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="ml-2 h-7 rounded-md border border-slate-200 bg-white px-2 text-[10px] font-medium text-slate-600 outline-none focus:border-blue-400"
            >
              <option value={10}>10 / page</option>

              <option value={20}>20 / page</option>

              <option value={50}>50 / page</option>

              <option value={100}>100 / page</option>
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
            className="absolute inset-0 bg-slate-900/20"
            onClick={closeModal}
          />

          {/* DRAWER */}

          <div className="absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col border-l border-slate-200 bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex min-h-[64px] items-center justify-between border-b border-slate-200 px-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {editingOpportunity ? "Edit Opportunity" : "Add Opportunity"}
                </h2>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  {editingOpportunity
                    ? "Update opportunity details"
                    : "Create a new sales opportunity"}
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

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="space-y-4 p-5">
                {/* NAME */}

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Opportunity Name
                    <span className="text-red-500"> *</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Enter opportunity name"
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />
                </div>

                {/* LEAD */}

                <div ref={leadDropdownRef} className="relative">
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Lead / Contact
                  </label>

                  {form.lead ? (
                    <div className="flex h-9 items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3">
                      <span className="truncate text-xs text-slate-700">
                        {leadSearch || "Selected Lead"}
                      </span>

                      <button
                        type="button"
                        onClick={clearLead}
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
                          value={leadSearch}
                          onFocus={() => setShowLeadDropdown(true)}
                          onChange={(e) => {
                            setLeadSearch(e.target.value);
                            setShowLeadDropdown(true);
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
                          ) : leads.length === 0 ? (
                            <div className="px-3 py-3 text-[11px] text-slate-400">
                              No leads found.
                            </div>
                          ) : (
                            leads.map((lead) => (
                              <button
                                key={lead._id}
                                type="button"
                                onClick={() => selectLead(lead)}
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-slate-50"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-700">
                                  {getInitials(getLeadName(lead))}
                                </span>

                                <span className="min-w-0">
                                  <span className="block truncate text-xs font-medium text-slate-700">
                                    {getLeadName(lead)}
                                  </span>

                                  {lead.email && (
                                    <span className="block truncate text-[10px] text-slate-400">
                                      {lead.email}
                                    </span>
                                  )}
                                </span>
                              </button>
                            ))
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
                    value={form.description}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Enter description"
                    className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />
                </div>

                {/* STAGE / PROBABILITY */}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Stage
                    </label>

                    <select
                      name="stage"
                      value={form.stage}
                      onChange={handleFormChange}
                      className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400"
                    >
                      {STAGES.map((stage) => (
                        <option key={stage.value} value={stage.value}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Probability %
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="probability"
                      value={form.probability}
                      onChange={handleFormChange}
                      className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-700 outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* AMOUNT / CURRENCY */}

                <div className="grid grid-cols-[1fr_110px] gap-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="amount"
                      value={form.amount}
                      onChange={handleFormChange}
                      placeholder="0"
                      className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Currency
                    </label>

                    <select
                      name="currency"
                      value={form.currency}
                      onChange={handleFormChange}
                      className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400"
                    >
                      <option value="INR">INR</option>

                      <option value="USD">USD</option>

                      <option value="EUR">EUR</option>

                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                {/* CLOSE DATE */}

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Expected Close Date
                  </label>

                  <input
                    type="date"
                    name="expectedCloseDate"
                    value={form.expectedCloseDate}
                    onChange={handleFormChange}
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
                    value={form.assignedTo}
                    onChange={handleFormChange}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400"
                  >
                    <option value="">Not Assigned</option>

                    {teamMembers.map((member) => {
                      const memberId = member?._id || member?.id;

                      return (
                        <option key={memberId} value={memberId}>
                          {member?.name ||
                            member?.fullName ||
                            member?.email ||
                            "Team Member"}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* SOURCE */}

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Source
                  </label>

                  <input
                    type="text"
                    name="source"
                    value={form.source}
                    onChange={handleFormChange}
                    placeholder="manual"
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400"
                  />
                </div>

                {/* NOTES */}

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder="Add notes..."
                    className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* FOOTER */}

              <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3">
                <button
                  type="button"
                  onClick={closeModal}
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
                  {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}

                  {editingOpportunity
                    ? "Update Opportunity"
                    : "Create Opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Opportunity;
