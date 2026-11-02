import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Workflow,
  Zap,
  MoreVertical,
  Play,
  Pause,
  Pencil,
  Trash2,
  Copy,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  RefreshCw,
  Filter,
  ChevronRight,
  X,
} from "lucide-react";

import api from "../../api/axios";

const Automation = () => {
  const navigate = useNavigate();

  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH AUTOMATIONS
  // --------------------------------------------------

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/automations");

      const result =
        response.data?.data?.automations ||
        response.data?.data ||
        response.data?.automations ||
        [];

      setAutomations(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Automation fetch error:", err);

      setError(err.response?.data?.message || "Unable to load automations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  // --------------------------------------------------
  // STATUS UPDATE
  // --------------------------------------------------

  const updateStatus = async (automation, status) => {
    try {
      setActionLoading(automation._id);

      await api.patch(`/automations/${automation._id}/status`, {
        status,
      });

      await fetchAutomations();
      setOpenMenu(null);
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to update automation status.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // --------------------------------------------------
  // DELETE AUTOMATION
  // --------------------------------------------------

  const deleteAutomation = async (automation) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${automation.name}"?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(automation._id);

      await api.delete(`/automations/${automation._id}`);

      setAutomations((prev) =>
        prev.filter((item) => item._id !== automation._id),
      );

      setOpenMenu(null);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete automation.");
    } finally {
      setActionLoading(null);
    }
  };

  // --------------------------------------------------
  // DUPLICATE AUTOMATION
  // --------------------------------------------------

  const duplicateAutomation = async (automation) => {
    try {
      setActionLoading(automation._id);

      const payload = {
        name: `${automation.name} (Copy)`,
        description: automation.description || "",
        trigger: automation.trigger,
        steps: (automation.steps || []).map((step, index) => ({
          id: step.id || `step-${index + 1}`,
          type: step.type,
          title: step.title,
          order: index,
          config: step.config || {},
          isActive: step.isActive !== false,
        })),
        status: "draft",
        timezone: automation.timezone || "Asia/Kolkata",
      };

      await api.post("/automations", payload);
      await fetchAutomations();
      setOpenMenu(null);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to duplicate automation.");
    } finally {
      setActionLoading(null);
    }
  };

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredAutomations = automations.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getStatusStyle = (status) => {
    const styles = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      paused: "bg-amber-50 text-amber-700 border-amber-200",
      draft: "bg-gray-100 text-gray-600 border-gray-200",
      archived: "bg-red-50 text-red-600 border-red-200",
    };

    return styles[status] || styles.draft;
  };

  const getTriggerName = (event) => {
    const names = {
      lead_created: "Lead Created",
      lead_updated: "Lead Updated",
      lead_assigned: "Lead Assigned",
      lead_status_changed: "Lead Status Changed",
      lead_source_received: "Lead Source Received",
      lead_no_activity: "Lead No Activity",
      lead_birthday: "Lead Birthday",
      deal_created: "Deal Created",
      deal_stage_changed: "Deal Stage Changed",
      customer_created: "Customer Created",
      order_created: "Order Created",
    };

    return names[event] || event?.replaceAll("_", " ") || "Custom Trigger";
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalExecutions = automations.reduce(
    (sum, item) => sum + (item.stats?.totalExecutions || 0),
    0,
  );

  const successfulExecutions = automations.reduce(
    (sum, item) => sum + (item.stats?.successfulExecutions || 0),
    0,
  );

  const failedExecutions = automations.reduce(
    (sum, item) => sum + (item.stats?.failedExecutions || 0),
    0,
  );

  const activeCount = automations.filter(
    (item) => item.status === "active",
  ).length;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f7f8fc] p-4 md:p-7">
      {/* HEADER */}

      <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <span>CRM</span>
            <ChevronRight size={14} />
            <span className="font-medium text-gray-800">Automations</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Automations
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Automate repetitive work and manage your business workflows.
          </p>
        </div>

        <button
          onClick={() => navigate("/marketing/automation/create")}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
        >
          <Plus size={19} />
          Create Automation
        </button>
      </div>

      {/* STATS */}

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Workflow size={21} />}
          label="Total Automations"
          value={automations.length}
          color="indigo"
        />

        <StatCard
          icon={<Zap size={21} />}
          label="Active Automations"
          value={activeCount}
          color="emerald"
        />

        <StatCard
          icon={<Activity size={21} />}
          label="Total Executions"
          value={totalExecutions}
          color="blue"
        />

        <StatCard
          icon={<CheckCircle2 size={21} />}
          label="Successful Executions"
          value={successfulExecutions}
          color="purple"
          subtitle={`${failedExecutions} failed`}
        />
      </div>

      {/* AUTOMATION LIST */}

      <div className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* TOOLBAR */}

        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">All Workflows</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage and monitor your automation workflows.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search automations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white sm:w-64"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-8 text-sm outline-none focus:border-indigo-400 sm:w-40"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <button
              onClick={fetchAutomations}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="m-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3">
            <RefreshCw size={28} className="animate-spin text-indigo-600" />
            <p className="text-sm text-gray-500">Loading automations...</p>
          </div>
        ) : filteredAutomations.length === 0 ? (
          /* EMPTY STATE */

          <div className="flex min-h-80 flex-col items-center justify-center px-5 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Workflow size={30} />
            </div>

            <h3 className="text-lg font-bold text-gray-900">
              {search || statusFilter !== "all"
                ? "No automations found"
                : "Create your first automation"}
            </h3>

            <p className="mt-2 max-w-md text-sm text-gray-500">
              {search || statusFilter !== "all"
                ? "Try changing your search or filter."
                : "Build workflows that automatically assign leads, create tasks, send notifications and manage your CRM."}
            </p>

            {!search && statusFilter === "all" && (
              <button
                onClick={() => navigate("/marketing/automation/create")}
                className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus size={18} />
                Create Automation
              </button>
            )}
          </div>
        ) : (
          /* TABLE */

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">Automation</th>
                  <th className="px-6 py-4">Trigger</th>
                  <th className="px-6 py-4">Actions</th>
                  <th className="px-6 py-4">Executions</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredAutomations.map((item) => (
                  <tr key={item._id} className="transition hover:bg-gray-50/70">
                    {/* AUTOMATION */}

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Workflow size={21} />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.name}
                          </p>

                          <p className="mt-1 max-w-[220px] truncate text-xs text-gray-500">
                            {item.description || "No description added"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* TRIGGER */}

                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium capitalize text-gray-700">
                        <Zap size={14} className="text-amber-500" />
                        {getTriggerName(item.trigger?.event)}
                      </div>
                    </td>

                    {/* STEPS */}

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                          {(item.steps || []).length}
                        </span>
                        <span className="text-sm text-gray-600">Actions</span>
                      </div>
                    </td>

                    {/* EXECUTIONS */}

                    <td className="px-6 py-5">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.stats?.totalExecutions || 0}
                        </p>
                        <p className="mt-1 text-xs text-emerald-600">
                          {item.stats?.successfulExecutions || 0} successful
                        </p>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(item.status)}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {item.status || "draft"}
                      </span>
                    </td>

                    {/* DATE */}

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={15} />
                        {formatDate(item.updatedAt || item.createdAt)}
                      </div>
                    </td>

                    {/* ACTIONS */}

                    <td className="relative px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === "active" ? (
                          <button
                            onClick={() => updateStatus(item, "paused")}
                            disabled={actionLoading === item._id}
                            title="Pause"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50"
                          >
                            <Pause size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStatus(item, "active")}
                            disabled={actionLoading === item._id}
                            title="Activate"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          >
                            <Play size={16} />
                          </button>
                        )}

                        <button
                          onClick={() =>
                            navigate(`/marketing/automation/${item._id}/edit`)
                          }
                          title="Edit"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                        >
                          <Pencil size={16} />
                        </button>

                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenu(
                                openMenu === item._id ? null : item._id,
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                          >
                            <MoreVertical size={17} />
                          </button>

                          {openMenu === item._id && (
                            <div className="absolute right-0 top-11 z-30 w-48 rounded-xl border border-gray-200 bg-white p-1.5 text-left shadow-xl">
                              <button
                                onClick={() => duplicateAutomation(item)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Copy size={15} />
                                Duplicate
                              </button>

                              <button
                                onClick={() => deleteAutomation(item)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FOOTER */}

        {!loading && filteredAutomations.length > 0 && (
          <div className="flex flex-col justify-between gap-2 border-t border-gray-100 px-6 py-4 text-xs text-gray-500 sm:flex-row sm:items-center">
            <span>
              Showing {filteredAutomations.length} of {automations.length}{" "}
              automations
            </span>
            <span>{activeCount} active workflows</span>
          </div>
        )}
      </div>
    </div>
  );
};

// --------------------------------------------------
// STAT CARD
// --------------------------------------------------

const StatCard = ({ icon, label, value, color, subtitle }) => {
  const colorStyles = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorStyles[color]}`}
        >
          {icon}
        </div>
        <span className="text-xs font-medium text-gray-400">AvstoMart CRM</span>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-gray-500">{label}</p>

        <h3 className="mt-1 text-2xl font-bold text-gray-900">
          {value.toLocaleString("en-IN")}
        </h3>

        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Automation;
