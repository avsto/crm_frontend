
import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Workflow,
  MoreHorizontal,
  Play,
  Pause,
  Pencil,
  Trash2,
  Copy,
  Eye,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Users,
  MessageSquare,
  Mail,
  ChevronDown,
  Filter,
  RefreshCw,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

/* ======================================================
   DEMO DATA
====================================================== */

const INITIAL_AUTOMATIONS = [
  {
    id: 1,
    name: "New Lead Welcome",
    description: "Send a welcome message when a new lead is created.",
    trigger: "Lead Created",
    channel: "WhatsApp",
    status: "active",
    contacts: 248,
    runs: 1248,
    success: 1189,
    lastRun: "2 hours ago",
    updatedAt: "Sep 5, 2026",
  },
  {
    id: 2,
    name: "Follow-up Reminder",
    description: "Automatically follow up with leads after 24 hours.",
    trigger: "Lead No Response",
    channel: "WhatsApp",
    status: "active",
    contacts: 96,
    runs: 642,
    success: 611,
    lastRun: "5 hours ago",
    updatedAt: "Sep 4, 2026",
  },
  {
    id: 3,
    name: "Order Confirmation",
    description: "Send order confirmation after a successful purchase.",
    trigger: "Order Created",
    channel: "Email",
    status: "active",
    contacts: 512,
    runs: 2145,
    success: 2110,
    lastRun: "18 minutes ago",
    updatedAt: "Sep 3, 2026",
  },
  {
    id: 4,
    name: "Inactive Customer",
    description: "Re-engage customers who have not purchased recently.",
    trigger: "Customer Inactive",
    channel: "Email",
    status: "paused",
    contacts: 73,
    runs: 321,
    success: 289,
    lastRun: "3 days ago",
    updatedAt: "Aug 30, 2026",
  },
  {
    id: 5,
    name: "High Value Lead Alert",
    description: "Notify the sales team when a high-value lead arrives.",
    trigger: "Lead Score Updated",
    channel: "Internal",
    status: "draft",
    contacts: 0,
    runs: 0,
    success: 0,
    lastRun: "Never",
    updatedAt: "Aug 28, 2026",
  },
];

/* ======================================================
   HELPERS
====================================================== */

const statusConfig = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  paused: {
    label: "Paused",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Pause,
  },
  draft: {
    label: "Draft",
    className: "bg-slate-50 text-slate-600 border-slate-200",
    icon: Pencil,
  },
};

const channelConfig = {
  WhatsApp: {
    icon: MessageSquare,
  },
  Email: {
    icon: Mail,
  },
  Internal: {
    icon: Zap,
  },
};

/* ======================================================
   STATUS BADGE
====================================================== */

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
    >
      <Icon size={12} strokeWidth={2.2} />
      {config.label}
    </span>
  );
};

/* ======================================================
   CHANNEL BADGE
====================================================== */

const ChannelBadge = ({ channel }) => {
  const config = channelConfig[channel] || channelConfig.Internal;
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500">
        <Icon size={13} />
      </span>
      {channel}
    </span>
  );
};

/* ======================================================
   AUTOMATION CARD
====================================================== */

const AutomationCard = ({
  automation,
  onToggle,
  onDelete,
  onDuplicate,
}) => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const successRate =
    automation.runs > 0
      ? Math.round((automation.success / automation.runs) * 100)
      : 0;

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md">
      {/* TOP */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Workflow size={20} strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900">
              {automation.name}
            </h3>

            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
              {automation.description}
            </p>
          </div>
        </div>

        {/* MENU */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              />

              <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(
                      `/marketing/automation/${automation.id}/edit`
                    );
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Pencil size={14} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(
                      `/marketing/automation/${automation.id}`
                    );
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Eye size={14} />
                  View
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDuplicate(automation);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Copy size={14} />
                  Duplicate
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(automation.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* META */}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <ChannelBadge channel={automation.channel} />

        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Zap size={13} />
          {automation.trigger}
        </span>
      </div>

      {/* STATS */}
      <div className="mt-5 grid grid-cols-3 gap-2 border-y border-slate-100 py-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Contacts
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {automation.contacts.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Runs
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {automation.runs.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Success
          </p>
          <p className="mt-1 text-sm font-bold text-emerald-600">
            {successRate}%
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={automation.status} />

          <span className="text-[11px] text-slate-400">
            <Clock3 className="mr-1 inline-block" size={11} />
            {automation.lastRun}
          </span>
        </div>

        {automation.status !== "draft" && (
          <button
            type="button"
            onClick={() => onToggle(automation.id)}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
              automation.status === "active"
                ? "text-amber-600 hover:bg-amber-50"
                : "text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            {automation.status === "active" ? "Pause" : "Activate"}
          </button>
        )}
      </div>
    </div>
  );
};

/* ======================================================
   MAIN COMPONENT
====================================================== */

const Automation = () => {
  const navigate = useNavigate();

  const [automations, setAutomations] = useState(
    INITIAL_AUTOMATIONS
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");

  /* ====================================================
     FILTERED DATA
  ==================================================== */

  const filteredAutomations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return automations.filter((automation) => {
      const matchesSearch =
        !query ||
        automation.name.toLowerCase().includes(query) ||
        automation.description.toLowerCase().includes(query) ||
        automation.trigger.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        automation.status === statusFilter;

      const matchesChannel =
        channelFilter === "all" ||
        automation.channel === channelFilter;

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [automations, search, statusFilter, channelFilter]);

  /* ====================================================
     STATS
  ==================================================== */

  const stats = useMemo(() => {
    const active = automations.filter(
      (item) => item.status === "active"
    ).length;

    const paused = automations.filter(
      (item) => item.status === "paused"
    ).length;

    const totalRuns = automations.reduce(
      (sum, item) => sum + item.runs,
      0
    );

    const totalContacts = automations.reduce(
      (sum, item) => sum + item.contacts,
      0
    );

    return {
      total: automations.length,
      active,
      paused,
      totalRuns,
      totalContacts,
    };
  }, [automations]);

  /* ====================================================
     TOGGLE
  ==================================================== */

  const handleToggle = (id) => {
    setAutomations((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          status:
            item.status === "active"
              ? "paused"
              : "active",
        };
      })
    );
  };

  /* ====================================================
     DELETE
  ==================================================== */

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this automation?"
    );

    if (!confirmed) return;

    setAutomations((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  /* ====================================================
     DUPLICATE
  ==================================================== */

  const handleDuplicate = (automation) => {
    const newAutomation = {
      ...automation,
      id: Date.now(),
      name: `${automation.name} Copy`,
      status: "draft",
      runs: 0,
      success: 0,
      contacts: 0,
      lastRun: "Never",
      updatedAt: "Just now",
    };

    setAutomations((prev) => [
      newAutomation,
      ...prev,
    ]);
  };

  /* ====================================================
     CLEAR FILTERS
  ==================================================== */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setChannelFilter("all");
  };

  /* ====================================================
     RENDER
  ==================================================== */

  return (
    <div className="min-h-full bg-slate-50 p-5 md:p-6 lg:p-7">
      <div className="mx-auto max-w-[1600px]">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Workflow size={19} />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Automations
                </h1>

                <p className="mt-0.5 text-xs text-slate-500">
                  Automate your marketing and customer workflows.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                navigate("/marketing/automation/logs")
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ActivityIcon />
              Logs
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/marketing/automation/create")
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={16} strokeWidth={2.5} />
              Create Automation
            </button>
          </div>
        </div>

        {/* ==================================================
            STATS
        ================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={Workflow}
            label="Total Automations"
            value={stats.total}
          />

          <StatCard
            icon={Play}
            label="Active"
            value={stats.active}
            valueClass="text-emerald-600"
          />

          <StatCard
            icon={Users}
            label="Contacts"
            value={stats.totalContacts.toLocaleString()}
          />

          <StatCard
            icon={RefreshCw}
            label="Total Runs"
            value={stats.totalRuns.toLocaleString()}
          />
        </div>

        {/* ==================================================
            FILTER BAR
        ================================================== */}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* SEARCH */}
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search automations..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* STATUS */}
            <div className="relative">
              <Filter
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="h-10 min-w-[145px] appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs font-medium text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* CHANNEL */}
            <div className="relative">
              <select
                value={channelFilter}
                onChange={(event) =>
                  setChannelFilter(event.target.value)
                }
                className="h-10 min-w-[145px] appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-xs font-medium text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Channels</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="Internal">Internal</option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* CLEAR */}
            {(search ||
              statusFilter !== "all" ||
              channelFilter !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-10 rounded-xl px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ==================================================
            RESULT HEADER
        ================================================== */}

        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700">
              {filteredAutomations.length}{" "}
              {filteredAutomations.length === 1
                ? "automation"
                : "automations"}
            </p>
          </div>

          <div className="hidden items-center gap-1.5 text-[11px] text-slate-400 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {stats.active} active
          </div>
        </div>

        {/* ==================================================
            AUTOMATION GRID
        ================================================== */}

        {filteredAutomations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {filteredAutomations.map((automation) => (
              <AutomationCard
                key={automation.id}
                automation={automation}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            onCreate={() =>
              navigate("/marketing/automation/create")
            }
            onClear={clearFilters}
            hasFilters={
              !!search ||
              statusFilter !== "all" ||
              channelFilter !== "all"
            }
          />
        )}

        {/* ==================================================
            BOTTOM CTA
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Zap size={18} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Build smarter workflows
                </h3>

                <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                  Connect leads, customers, WhatsApp, email and
                  sales events to automatically execute your
                  marketing workflows.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/marketing/automation/create")
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={15} />
              Create Workflow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ======================================================
   STAT CARD
====================================================== */

const StatCard = ({
  icon: Icon,
  label,
  value,
  valueClass = "text-slate-900",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p
            className={`mt-1 text-xl font-bold tracking-tight ${valueClass}`}
          >
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
};

/* ======================================================
   EMPTY STATE
====================================================== */

const EmptyState = ({
  onCreate,
  onClear,
  hasFilters,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Workflow size={25} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">
        {hasFilters
          ? "No automations found"
          : "No automations yet"}
      </h3>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
        {hasFilters
          ? "Try changing your search or filters to find an automation."
          : "Create your first automation to start automating your marketing workflows."}
      </p>

      <div className="mt-5 flex items-center justify-center gap-2">
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Clear Filters
          </button>
        )}

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={15} />
          Create Automation
        </button>
      </div>
    </div>
  );
};

/* ======================================================
   ACTIVITY ICON
====================================================== */

const ActivityIcon = () => {
  return <Activity size={15} />;
};

/* ======================================================
   IMPORT ACTIVITY
====================================================== */

const Activity = ({ size = 18, strokeWidth = 2 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12h4l3-9 4 18 3-9h4" />
    </svg>
  );
};

export default Automation;
