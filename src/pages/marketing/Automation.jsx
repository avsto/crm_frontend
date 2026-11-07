import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Plus,
  Search,
  Workflow,
  Zap,
  MoreHorizontal,
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
  ChevronLeft,
  X,
  Archive,
  History,
  RotateCcw,
  Eye,
  Loader2,
  AlertCircle,
  CalendarDays,
  ListChecks,
  Timer,
  BarChart3,
} from "lucide-react";

import automationApi from "../../api/automation.api";

// ======================================================
// HELPERS
// ======================================================

const getData = (response) => {
  return response?.data?.data ?? response?.data ?? response ?? {};
};

const getAutomationList = (response) => {
  const data = getData(response);

  if (Array.isArray(data)) return data;

  return data?.automations || data?.results || data?.items || data?.data || [];
};

const getExecutionList = (response) => {
  const data = getData(response);

  if (Array.isArray(data)) return data;

  return (
    data?.executions ||
    data?.results ||
    data?.items ||
    data?.history ||
    data?.data ||
    []
  );
};

const getId = (item) => item?._id || item?.id;

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

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

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatus = (status) => String(status || "draft").toLowerCase();

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

  if (!event) return "Custom Trigger";

  return (
    names[event] ||
    event.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

const getStatusClasses = (status) => {
  const styles = {
    active: "bg-emerald-50 text-emerald-700",
    paused: "bg-amber-50 text-amber-700",
    draft: "bg-slate-100 text-slate-600",
    archived: "bg-red-50 text-red-600",
    completed: "bg-blue-50 text-blue-700",
    success: "bg-emerald-50 text-emerald-700",
    successful: "bg-emerald-50 text-emerald-700",
    failed: "bg-red-50 text-red-700",
    pending: "bg-amber-50 text-amber-700",
    running: "bg-blue-50 text-blue-700",
  };

  return styles[getStatus(status)] || "bg-slate-100 text-slate-600";
};

const getExecutionStatus = (execution) => {
  return (
    execution?.status ||
    execution?.executionStatus ||
    execution?.result ||
    "pending"
  );
};

const getExecutionId = (execution) => execution?._id || execution?.id;

// ======================================================
// STATUS BADGE
// ======================================================

const StatusBadge = ({ status }) => {
  const normalized = getStatus(status);

  const icons = {
    active: CheckCircle2,
    paused: Pause,
    draft: Clock,
    archived: Archive,
    completed: CheckCircle2,
    success: CheckCircle2,
    successful: CheckCircle2,
    failed: XCircle,
    pending: Clock,
    running: Activity,
  };

  const Icon = icons[normalized] || Clock;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(
        normalized,
      )}`}
    >
      <Icon size={12} />
      {normalized}
    </span>
  );
};

// ======================================================
// STAT CARD
// ======================================================

const StatCard = ({ label, value, icon: Icon, description }) => {
  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[var(--app-muted)] sm:text-sm">
            {label}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-[var(--app-heading)]">
            {formatNumber(value)}
          </h3>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
          <Icon size={19} />
        </div>
      </div>

      {description && (
        <p className="mt-2 text-xs text-[var(--app-muted)]">{description}</p>
      )}
    </div>
  );
};

// ======================================================
// EMPTY STATE
// ======================================================

const EmptyState = ({ search, onCreate }) => {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
        <Workflow size={29} />
      </div>

      <h3 className="text-base font-semibold text-[var(--app-heading)]">
        {search ? "No automations found" : "Create your first automation"}
      </h3>

      <p className="mt-2 max-w-sm text-sm text-[var(--app-muted)]">
        {search
          ? "Try changing your search or filters."
          : "Automate repetitive tasks and build smarter business workflows."}
      </p>

      {!search && (
        <button
          onClick={onCreate}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--theme-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={16} />
          Create Automation
        </button>
      )}
    </div>
  );
};

// ======================================================
// CONFIRMATION MODAL
// ======================================================

const ConfirmModal = ({
  open,
  title,
  message,
  confirmText,
  loading,
  danger = false,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={() => !loading && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              danger
                ? "bg-red-50 text-red-600"
                : "bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]"
            }`}
          >
            {danger ? <Trash2 size={21} /> : <Archive size={21} />}
          </div>

          <button
            disabled={loading}
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--app-muted)] hover:bg-[var(--app-hover)]"
          >
            <X size={19} />
          </button>
        </div>

        <h3 className="mt-4 text-lg font-semibold text-[var(--app-heading)]">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            disabled={loading}
            onClick={onClose}
            className="rounded-lg border border-[var(--app-border)] px-4 py-2.5 text-sm font-medium text-[var(--app-heading)] hover:bg-[var(--app-hover)]"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={onConfirm}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[var(--theme-primary)] hover:opacity-90"
            }`}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================================================
// EXECUTION HISTORY MODAL
// ======================================================

const ExecutionHistoryModal = ({
  open,
  onClose,
  executions,
  loading,
  onRetry,
  retryingId,
  onViewDetails,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--app-border)] p-4 sm:p-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--app-heading)]">
              Execution History
            </h2>
            <p className="mt-1 text-xs text-[var(--app-muted)]">
              View automation runs and retry failed executions.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--app-muted)] hover:bg-[var(--app-hover)]"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-[var(--app-muted)]">
              <Loader2
                size={20}
                className="animate-spin text-[var(--theme-primary)]"
              />
              Loading execution history...
            </div>
          ) : executions.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <History size={32} className="mb-3 text-[var(--app-muted)]" />
              <p className="text-sm font-semibold text-[var(--app-heading)]">
                No execution history found
              </p>
              <p className="mt-1 text-xs text-[var(--app-muted)]">
                Automation executions will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="sticky top-0 bg-[var(--app-bg)]">
                  <tr className="border-b border-[var(--app-border)]">
                    {[
                      "Execution",
                      "Automation",
                      "Status",
                      "Started At",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--app-border)]">
                  {executions.map((execution) => {
                    const id = getExecutionId(execution);
                    const status = getExecutionStatus(execution);

                    return (
                      <tr key={id} className="hover:bg-[var(--app-hover)]">
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-[var(--app-heading)]">
                            {String(id || "Execution").slice(-10)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-[var(--app-heading)]">
                            {execution?.automation?.name ||
                              execution?.automationName ||
                              execution?.name ||
                              "Automation"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={status} />
                        </td>

                        <td className="px-5 py-4 text-sm text-[var(--app-muted)]">
                          {formatDateTime(
                            execution?.startedAt ||
                              execution?.createdAt ||
                              execution?.created_at,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onViewDetails(execution)}
                              title="View details"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)] hover:bg-[var(--app-hover)]"
                            >
                              <Eye size={15} />
                            </button>

                            {getStatus(status) === "failed" && (
                              <button
                                onClick={() => onRetry(execution)}
                                disabled={retryingId === id}
                                title="Retry execution"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--theme-primary-border)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary-soft)] disabled:opacity-50"
                              >
                                {retryingId === id ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <RotateCcw size={15} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-[var(--app-border)] p-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--app-border)] px-4 py-2 text-sm font-medium text-[var(--app-heading)] hover:bg-[var(--app-hover)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================================================
// EXECUTION DETAILS MODAL
// ======================================================

const ExecutionDetailsModal = ({ execution, loading, onClose }) => {
  if (!execution && !loading) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--app-border)] p-4">
          <div>
            <h3 className="font-semibold text-[var(--app-heading)]">
              Execution Details
            </h3>
            <p className="mt-1 text-xs text-[var(--app-muted)]">
              Detailed execution information
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--app-muted)] hover:bg-[var(--app-hover)]"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-[var(--app-muted)]">
            <Loader2 size={18} className="animate-spin" />
            Loading details...
          </div>
        ) : (
          <div className="max-h-[65vh] space-y-4 overflow-auto p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--app-border)] p-3">
                <p className="text-xs text-[var(--app-muted)]">Execution ID</p>
                <p className="mt-1 break-all text-sm font-medium text-[var(--app-heading)]">
                  {getExecutionId(execution) || "—"}
                </p>
              </div>

              <div className="rounded-lg border border-[var(--app-border)] p-3">
                <p className="text-xs text-[var(--app-muted)]">Status</p>
                <div className="mt-2">
                  <StatusBadge status={getExecutionStatus(execution)} />
                </div>
              </div>

              <div className="rounded-lg border border-[var(--app-border)] p-3">
                <p className="text-xs text-[var(--app-muted)]">Started At</p>
                <p className="mt-1 text-sm font-medium text-[var(--app-heading)]">
                  {formatDateTime(execution?.startedAt || execution?.createdAt)}
                </p>
              </div>

              <div className="rounded-lg border border-[var(--app-border)] p-3">
                <p className="text-xs text-[var(--app-muted)]">Completed At</p>
                <p className="mt-1 text-sm font-medium text-[var(--app-heading)]">
                  {formatDateTime(execution?.completedAt)}
                </p>
              </div>
            </div>

            {execution?.error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
                  <AlertCircle size={16} />
                  Execution Error
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm text-red-600">
                  {typeof execution.error === "string"
                    ? execution.error
                    : JSON.stringify(execution.error, null, 2)}
                </p>
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--app-heading)]">
                Execution Data
              </p>

              <pre className="max-h-72 overflow-auto rounded-xl bg-[var(--app-bg)] p-4 text-xs leading-5 text-[var(--app-heading)]">
                {JSON.stringify(execution, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const Automation = () => {
  const navigate = useNavigate();

  const [automations, setAutomations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [openMenu, setOpenMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null,
    automation: null,
  });

  const [historyOpen, setHistoryOpen] = useState(false);
  const [executions, setExecutions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [retryingId, setRetryingId] = useState(null);

  const [selectedExecution, setSelectedExecution] = useState(null);
  const [executionDetailsLoading, setExecutionDetailsLoading] = useState(false);

  // ====================================================
  // FETCH AUTOMATIONS
  // ====================================================

  const fetchAutomations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await automationApi.getAll({
        page: 1,
        limit: 1000,
      });

      const result = getAutomationList(response);

      setAutomations(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Automation fetch error:", err);

      setError(err?.response?.data?.message || "Unable to load automations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  // ====================================================
  // FETCH EXECUTION HISTORY
  // ====================================================

  const fetchExecutionHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await automationApi.getExecutionHistory({
        page: 1,
        limit: 100,
      });

      const result = getExecutionList(response);

      setExecutions(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Execution history error:", err);

      window.alert(
        err?.response?.data?.message || "Unable to load execution history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const openExecutionHistory = async () => {
    setHistoryOpen(true);
    await fetchExecutionHistory();
  };

  // ====================================================
  // UPDATE STATUS
  // ====================================================

  const handleStatusUpdate = async (automation, status) => {
    const id = getId(automation);

    if (!id) return;

    try {
      setActionLoading(id);
      setOpenMenu(null);

      await automationApi.updateStatus(id, status);

      await fetchAutomations(true);
    } catch (err) {
      window.alert(
        err?.response?.data?.message || "Unable to update automation status.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ====================================================
  // DUPLICATE AUTOMATION
  // ====================================================

  const handleDuplicate = async (automation) => {
    try {
      const id = getId(automation);

      setActionLoading(id);
      setOpenMenu(null);

      const payload = {
        name: `${automation.name || "Automation"} (Copy)`,
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

      await automationApi.create(payload);

      await fetchAutomations(true);
    } catch (err) {
      window.alert(
        err?.response?.data?.message || "Unable to duplicate automation.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ====================================================
  // DELETE / ARCHIVE CONFIRMATION
  // ====================================================

  const openConfirmModal = (automation, type) => {
    setConfirmModal({
      open: true,
      type,
      automation,
    });

    setOpenMenu(null);
  };

  const closeConfirmModal = () => {
    if (actionLoading) return;

    setConfirmModal({
      open: false,
      type: null,
      automation: null,
    });
  };

  const handleConfirmAction = async () => {
    const { type, automation } = confirmModal;

    if (!automation) return;

    const id = getId(automation);

    try {
      setActionLoading(id);

      if (type === "delete") {
        await automationApi.delete(id);
      } else if (type === "archive") {
        await automationApi.archive(id);
      }

      setConfirmModal({
        open: false,
        type: null,
        automation: null,
      });

      await fetchAutomations(true);
    } catch (err) {
      window.alert(
        err?.response?.data?.message || `Unable to ${type} automation.`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ====================================================
  // EXECUTION DETAILS
  // ====================================================

  const handleViewExecution = async (execution) => {
    const id = getExecutionId(execution);

    if (!id) {
      setSelectedExecution(execution);
      return;
    }

    try {
      setSelectedExecution({});
      setExecutionDetailsLoading(true);

      const response = await automationApi.getExecutionById(id);

      const data = getData(response);

      setSelectedExecution(data?.execution || data);
    } catch (err) {
      console.error("Execution detail error:", err);

      setSelectedExecution(execution);
    } finally {
      setExecutionDetailsLoading(false);
    }
  };

  // ====================================================
  // RETRY EXECUTION
  // ====================================================

  const handleRetryExecution = async (execution) => {
    const id = getExecutionId(execution);

    if (!id) return;

    try {
      setRetryingId(id);

      await automationApi.retryExecution(id);

      await fetchExecutionHistory();
    } catch (err) {
      window.alert(
        err?.response?.data?.message || "Unable to retry execution.",
      );
    } finally {
      setRetryingId(null);
    }
  };

  // ====================================================
  // FILTER AUTOMATIONS
  // ====================================================

  const filteredAutomations = useMemo(() => {
    return automations.filter((item) => {
      const name = String(item?.name || "").toLowerCase();

      const description = String(item?.description || "").toLowerCase();

      const trigger = String(item?.trigger?.event || "").toLowerCase();

      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        description.includes(query) ||
        trigger.includes(query);

      const matchesStatus =
        statusFilter === "all" || getStatus(item?.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [automations, search, statusFilter]);

  // ====================================================
  // PAGINATION
  // ====================================================

  const totalPages = Math.max(1, Math.ceil(filteredAutomations.length / limit));

  const currentPage = Math.min(page, totalPages);

  const paginatedAutomations = useMemo(() => {
    const start = (currentPage - 1) * limit;

    return filteredAutomations.slice(start, start + limit);
  }, [filteredAutomations, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  // ====================================================
  // STATS
  // ====================================================

  const stats = useMemo(() => {
    const totalExecutions = automations.reduce(
      (sum, item) => sum + Number(item?.stats?.totalExecutions || 0),
      0,
    );

    const successfulExecutions = automations.reduce(
      (sum, item) => sum + Number(item?.stats?.successfulExecutions || 0),
      0,
    );

    const failedExecutions = automations.reduce(
      (sum, item) => sum + Number(item?.stats?.failedExecutions || 0),
      0,
    );

    return {
      total: automations.length,

      active: automations.filter((item) => getStatus(item.status) === "active")
        .length,

      totalExecutions,
      successfulExecutions,
      failedExecutions,
    };
  }, [automations]);

  // ====================================================
  // NAVIGATION
  // ====================================================

  const handleCreate = () => {
    navigate("/marketing/automation/create");
  };

  const handleEdit = (automation) => {
    navigate(`/marketing/automation/${getId(automation)}/edit`);
  };

  // ====================================================
  // ACTION MENU
  // ====================================================

  const renderActionMenu = (automation) => {
    const status = getStatus(automation.status);

    return (
      <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-1 shadow-xl">
        <button
          onClick={() => handleEdit(automation)}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-[var(--app-heading)] hover:bg-[var(--app-hover)]"
        >
          <Pencil size={15} />
          Edit Automation
        </button>

        <button
          onClick={() => handleDuplicate(automation)}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-[var(--app-heading)] hover:bg-[var(--app-hover)]"
        >
          <Copy size={15} />
          Duplicate
        </button>

        <div className="my-1 border-t border-[var(--app-border)]" />

        {status === "active" ? (
          <button
            onClick={() => handleStatusUpdate(automation, "paused")}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-amber-600 hover:bg-amber-50"
          >
            <Pause size={15} />
            Pause Automation
          </button>
        ) : status !== "archived" ? (
          <button
            onClick={() => handleStatusUpdate(automation, "active")}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-emerald-600 hover:bg-emerald-50"
          >
            <Play size={15} />
            Activate Automation
          </button>
        ) : (
          <button
            onClick={() => handleStatusUpdate(automation, "active")}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-emerald-600 hover:bg-emerald-50"
          >
            <Play size={15} />
            Restore Automation
          </button>
        )}

        {status !== "archived" && (
          <button
            onClick={() => openConfirmModal(automation, "archive")}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-[var(--app-heading)] hover:bg-[var(--app-hover)]"
          >
            <Archive size={15} />
            Archive
          </button>
        )}

        <button
          onClick={() => openConfirmModal(automation, "delete")}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 size={15} />
          Delete Automation
        </button>
      </div>
    );
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <div
      className="min-h-screen space-y-5 bg-[var(--app-bg)] p-4 sm:p-5 lg:p-6"
      onClick={() => openMenu && setOpenMenu(null)}
    >
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-[var(--app-muted)]">
            <span>CRM</span>
            <ChevronRight size={14} />
            <span className="text-[var(--app-heading)]">Automations</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--app-heading)]">
            Automations
          </h1>

          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Automate repetitive work and manage your business workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openExecutionHistory();
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm font-medium text-[var(--app-heading)] transition hover:bg-[var(--app-hover)]"
          >
            <History size={16} />
            <span>Execution History</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchAutomations(true);
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
            Create Automation
          </button>
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Total Automations"
          value={stats.total}
          icon={Workflow}
          description="All workflows"
        />

        <StatCard
          label="Active Automations"
          value={stats.active}
          icon={Zap}
          description="Currently active"
        />

        <StatCard
          label="Total Executions"
          value={stats.totalExecutions}
          icon={Activity}
          description="All workflow executions"
        />

        <StatCard
          label="Successful Executions"
          value={stats.successfulExecutions}
          icon={CheckCircle2}
          description={`${formatNumber(stats.failedExecutions)} failed executions`}
        />
      </div>

      {/* MAIN CONTENT */}

      <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]">
        {/* SECTION HEADER */}

        <div className="flex flex-col justify-between gap-3 border-b border-[var(--app-border)] p-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-[var(--app-heading)]">
              All Workflows
            </h2>

            <p className="mt-0.5 text-xs text-[var(--app-muted)]">
              Manage and monitor your automation workflows.
            </p>
          </div>

          <span className="w-fit rounded-lg bg-[var(--theme-primary-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--theme-primary)]">
            {filteredAutomations.length} Automations
          </span>
        </div>

        {/* FILTER TOOLBAR */}

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
              placeholder="Search automations..."
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

          <div className="relative">
            <Filter
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-muted)]"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full min-w-[155px] appearance-none rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] pl-9 pr-8 text-sm text-[var(--app-heading)] outline-none focus:border-[var(--theme-primary)]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <button
            onClick={openExecutionHistory}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--app-border)] px-3 text-sm font-medium text-[var(--app-heading)] hover:bg-[var(--app-hover)]"
          >
            <History size={15} />
            History
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="m-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>

            <button onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center gap-2 text-sm text-[var(--app-muted)]">
            <Loader2
              size={20}
              className="animate-spin text-[var(--theme-primary)]"
            />
            Loading automations...
          </div>
        ) : paginatedAutomations.length === 0 ? (
          <EmptyState
            search={search || statusFilter !== "all"}
            onCreate={handleCreate}
          />
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[950px] text-left">
                <thead>
                  <tr className="border-b border-[var(--app-border)] bg-[var(--app-bg)]">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                      Automation
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                      Trigger
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                      Actions
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                      Executions
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                      Status
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                      Last Updated
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--app-border)]">
                  {paginatedAutomations.map((item) => {
                    const id = getId(item);

                    return (
                      <tr
                        key={id}
                        className="transition hover:bg-[var(--app-hover)]"
                      >
                        {/* AUTOMATION */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
                              <Workflow size={19} />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[230px] truncate text-sm font-semibold text-[var(--app-heading)]">
                                {item.name || "Untitled Automation"}
                              </p>

                              <p className="mt-0.5 max-w-[230px] truncate text-xs text-[var(--app-muted)]">
                                {item.description || "No description added"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* TRIGGER */}

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--app-heading)]">
                            <Zap size={13} className="text-amber-500" />
                            {getTriggerName(item.trigger?.event)}
                          </span>
                        </td>

                        {/* STEPS */}

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--theme-primary-soft)] text-xs font-bold text-[var(--theme-primary)]">
                              {(item.steps || []).length}
                            </span>

                            <span className="text-sm text-[var(--app-muted)]">
                              Actions
                            </span>
                          </div>
                        </td>

                        {/* EXECUTIONS */}

                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-[var(--app-heading)]">
                            {formatNumber(item.stats?.totalExecutions)}
                          </p>

                          <p className="mt-0.5 text-xs text-emerald-600">
                            {formatNumber(item.stats?.successfulExecutions)}{" "}
                            successful
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">
                          <StatusBadge status={item.status} />
                        </td>

                        {/* DATE */}

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-[var(--app-heading)]">
                            <CalendarDays
                              size={14}
                              className="text-[var(--app-muted)]"
                            />
                            {formatDate(item.updatedAt || item.createdAt)}
                          </div>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-4">
                          <div className="relative flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                setOpenMenu(openMenu === id ? null : id);
                              }}
                              disabled={actionLoading === id}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-heading)] disabled:opacity-50"
                            >
                              {actionLoading === id ? (
                                <Loader2 size={17} className="animate-spin" />
                              ) : (
                                <MoreHorizontal size={19} />
                              )}
                            </button>

                            {openMenu === id && (
                              <div onClick={(e) => e.stopPropagation()}>
                                {renderActionMenu(item)}
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
              {paginatedAutomations.map((item) => {
                const id = getId(item);

                return (
                  <div
                    key={id}
                    className="rounded-xl border border-[var(--app-border)] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
                          <Workflow size={19} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-[var(--app-heading)]">
                            {item.name || "Untitled Automation"}
                          </h3>

                          <p className="mt-0.5 truncate text-xs text-[var(--app-muted)]">
                            {item.description || "No description added"}
                          </p>
                        </div>
                      </div>

                      <div className="relative shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            setOpenMenu(openMenu === id ? null : id);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-muted)] hover:bg-[var(--app-hover)]"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {openMenu === id && (
                          <div onClick={(e) => e.stopPropagation()}>
                            {renderActionMenu(item)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StatusBadge status={item.status} />

                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] px-2 py-1 text-xs text-[var(--app-heading)]">
                        <Zap size={12} className="text-amber-500" />
                        {getTriggerName(item.trigger?.event)}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[var(--app-border)] pt-3">
                      <div>
                        <p className="text-xs text-[var(--app-muted)]">
                          Executions
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[var(--app-heading)]">
                          {formatNumber(item.stats?.totalExecutions)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[var(--app-muted)]">
                          Workflow Actions
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[var(--app-heading)]">
                          {(item.steps || []).length}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-[var(--app-muted)]">
                        Updated {formatDate(item.updatedAt || item.createdAt)}
                      </span>

                      <button
                        onClick={() => handleEdit(item)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--theme-primary)]"
                      >
                        Edit
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

        {!loading && filteredAutomations.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--app-border)] px-4 py-3 sm:flex-row">
            <p className="text-xs text-[var(--app-muted)]">
              Showing{" "}
              <span className="font-semibold text-[var(--app-heading)]">
                {(currentPage - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-[var(--app-heading)]">
                {Math.min(currentPage * limit, filteredAutomations.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[var(--app-heading)]">
                {filteredAutomations.length}
              </span>{" "}
              automations
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-heading)] hover:bg-[var(--app-hover)] disabled:cursor-not-allowed disabled:opacity-40"
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
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-heading)] hover:bg-[var(--app-hover)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}

      <ConfirmModal
        open={confirmModal.open}
        title={
          confirmModal.type === "delete"
            ? "Delete Automation?"
            : "Archive Automation?"
        }
        message={
          confirmModal.type === "delete"
            ? `Are you sure you want to delete "${confirmModal.automation?.name || "this automation"}"? This action cannot be undone.`
            : `Are you sure you want to archive "${confirmModal.automation?.name || "this automation"}"?`
        }
        confirmText={confirmModal.type === "delete" ? "Delete" : "Archive"}
        danger={confirmModal.type === "delete"}
        loading={actionLoading === getId(confirmModal.automation)}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
      />

      {/* EXECUTION HISTORY */}

      <ExecutionHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        executions={executions}
        loading={historyLoading}
        onRetry={handleRetryExecution}
        retryingId={retryingId}
        onViewDetails={handleViewExecution}
      />

      {/* EXECUTION DETAILS */}

      <ExecutionDetailsModal
        execution={selectedExecution}
        loading={executionDetailsLoading}
        onClose={() => {
          setSelectedExecution(null);
          setExecutionDetailsLoading(false);
        }}
      />
    </div>
  );
};

export default Automation;
