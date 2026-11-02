import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Play,
  Zap,
  Users,
  Mail,
  MessageCircle,
  Smartphone,
  Bell,
  Clock,
  GitBranch,
  Tag,
  ListTodo,
  CircleDot,
  Trash2,
  X,
  Settings2,
  Workflow,
  MoreHorizontal,
  Plus,
  Check,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import api from "../../api/axios";

// ======================================================
// TRIGGERS
// ======================================================

const triggers = [
  {
    type: "lead_created",
    label: "Lead Created",
    icon: Users,
    description: "When a new lead is created",
  },
  {
    type: "lead_updated",
    label: "Lead Updated",
    icon: Users,
    description: "When lead information changes",
  },
  {
    type: "lead_assigned",
    label: "Lead Assigned",
    icon: Users,
    description: "When a lead is assigned",
  },
  {
    type: "lead_status_changed",
    label: "Lead Status Changed",
    icon: CircleDot,
    description: "When lead status changes",
  },
  {
    type: "order_created",
    label: "Order Created",
    icon: Zap,
    description: "When a new order is created",
  },
  {
    type: "deal_created",
    label: "Deal Created",
    icon: Workflow,
    description: "When a deal is created",
  },
];

// ======================================================
// ACTIONS
// ======================================================

const actions = [
  {
    type: "assign",
    label: "Assign Lead",
    icon: Users,
    description: "Assign lead to a team member",
    color: "blue",
  },
  {
    type: "notification",
    label: "Notification",
    icon: Bell,
    description: "Create in-app notification",
    color: "violet",
  },
  {
    type: "task",
    label: "Create Task",
    icon: ListTodo,
    description: "Create a follow-up task",
    color: "cyan",
  },
  {
    type: "tag",
    label: "Add Tag",
    icon: Tag,
    description: "Add a lead tag",
    color: "amber",
  },
  {
    type: "status",
    label: "Change Status",
    icon: CircleDot,
    description: "Update lead status",
    color: "emerald",
  },
  {
    type: "delay",
    label: "Wait",
    icon: Clock,
    description: "Wait before next action",
    color: "slate",
  },
  {
    type: "condition",
    label: "If / Condition",
    icon: GitBranch,
    description: "Check a condition",
    color: "purple",
  },
  {
    type: "email",
    label: "Send Email",
    icon: Mail,
    description: "Send an email",
    color: "red",
  },
  {
    type: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    description: "Send WhatsApp message",
    color: "green",
  },
  {
    type: "sms",
    label: "Send SMS",
    icon: Smartphone,
    description: "Send SMS message",
    color: "teal",
  },
];

// ======================================================
// DEFAULT CONFIG
// ======================================================

const defaultConfig = (type) => {
  const configs = {
    assign: { userId: "" },
    notification: {
      title: "New Lead Follow-up",
      message: "",
    },
    task: {
      title: "Follow-up Task",
      message: "",
      reminderAt: "",
    },
    tag: { tag: "" },
    status: { status: "new" },
    delay: {
      amount: 30,
      unit: "minutes",
    },
    condition: {
      field: "source",
      operator: "equals",
      value: "",
      falseBehavior: "stop",
    },
    email: {
      subject: "",
      message: "",
    },
    whatsapp: { message: "" },
    sms: { message: "" },
  };

  return configs[type] || {};
};

// ======================================================
// NODE HELPERS
// ======================================================

const getNodeInfo = (type) =>
  [...triggers, ...actions].find((item) => item.type === type);

const createNode = (type) => {
  const item = getNodeInfo(type);

  return {
    id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    title: item?.label || type,
    config: defaultConfig(type),
    isActive: true,
  };
};

const colorClasses = {
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  violet: "bg-violet-50 text-violet-600 border-violet-200",
  cyan: "bg-cyan-50 text-cyan-600 border-cyan-200",
  amber: "bg-amber-50 text-amber-600 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  red: "bg-red-50 text-red-600 border-red-200",
  green: "bg-green-50 text-green-600 border-green-200",
  teal: "bg-teal-50 text-teal-600 border-teal-200",
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function EditAutomation() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState(null);
  const [nodes, setNodes] = useState([]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [panel, setPanel] = useState("trigger");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showPicker, setShowPicker] = useState(false);

  const selected = nodes.find((node) => node.id === selectedNode);

  // ====================================================
  // LOAD EXISTING AUTOMATION
  // ====================================================

  const fetchAutomation = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/automations/${id}`);

      const automation =
        response.data?.data?.automation ||
        response.data?.data ||
        response.data?.automation;

      if (!automation || !automation._id) {
        throw new Error("Automation not found.");
      }

      setName(automation.name || "");
      setDescription(automation.description || "");

      const triggerEvent = automation.trigger?.event;

      if (triggerEvent) {
        const triggerInfo = getNodeInfo(triggerEvent);

        setTrigger({
          id: "trigger",
          type: triggerEvent,
          title: triggerInfo?.label || triggerEvent,
          config: {},
          isActive: true,
        });
      } else {
        setTrigger(null);
      }

      const existingSteps = Array.isArray(automation.steps)
        ? [...automation.steps]
        : [];

      existingSteps.sort((a, b) => (a.order || 0) - (b.order || 0));

      setNodes(
        existingSteps.map((step, index) => {
          const info = getNodeInfo(step.type);

          return {
            id: step.id || `node_${index}_${Date.now()}`,
            type: step.type,
            title: step.title || info?.label || step.type,
            config: {
              ...defaultConfig(step.type),
              ...(step.config || {}),
            },
            isActive: step.isActive !== false,
          };
        }),
      );
    } catch (err) {
      console.error("Fetch automation error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load automation.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAutomation();
  }, [id]);

  // ====================================================
  // TRIGGER
  // ====================================================

  const addTrigger = (item) => {
    setTrigger({
      id: "trigger",
      type: item.type,
      title: item.label,
      config: {},
      isActive: true,
    });

    setSelectedNode(null);
    setPanel("trigger");
  };

  // ====================================================
  // ADD ACTION
  // ====================================================

  const addAction = (type) => {
    const node = createNode(type);

    setNodes((prev) => [...prev, node]);
    setSelectedNode(node.id);
    setPanel("node");
    setShowPicker(false);
  };

  // ====================================================
  // UPDATE NODE
  // ====================================================

  const updateNode = (nodeId, key, value) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, [key]: value } : node,
      ),
    );
  };

  // ====================================================
  // UPDATE CONFIG
  // ====================================================

  const updateConfig = (nodeId, key, value) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              config: {
                ...node.config,
                [key]: value,
              },
            }
          : node,
      ),
    );
  };

  // ====================================================
  // DELETE NODE
  // ====================================================

  const removeNode = (nodeId) => {
    setNodes((prev) => prev.filter((node) => node.id !== nodeId));

    setSelectedNode(null);
    setPanel("trigger");
  };

  // ====================================================
  // MOVE NODE
  // ====================================================

  const moveNode = (index, direction) => {
    const target = index + direction;

    if (target < 0 || target >= nodes.length) return;

    const updated = [...nodes];

    [updated[index], updated[target]] = [updated[target], updated[index]];

    setNodes(updated);
  };

  // ====================================================
  // VALIDATION
  // ====================================================

  const validate = () => {
    if (!name.trim()) {
      return "Workflow name is required.";
    }

    if (!trigger) {
      return "Please select a trigger.";
    }

    if (!nodes.length) {
      return "Please add at least one action.";
    }

    for (const node of nodes) {
      const config = node.config || {};

      if (node.type === "assign" && !config.userId?.trim()) {
        return "Please enter a User ID for Assign Lead.";
      }

      if (node.type === "tag" && !config.tag?.trim()) {
        return "Please enter a tag name.";
      }

      if (
        node.type === "delay" &&
        (!Number.isFinite(Number(config.amount)) ||
          Number(config.amount) < 0 ||
          config.amount === "")
      ) {
        return "Please enter a valid delay.";
      }

      if (
        ["notification", "task", "email", "whatsapp", "sms"].includes(
          node.type,
        ) &&
        !config.message?.trim()
      ) {
        return `Please enter a message for ${node.title}.`;
      }

      if (node.type === "email" && !config.subject?.trim()) {
        return "Please enter an email subject.";
      }

      if (
        node.type === "condition" &&
        !["is_empty", "is_not_empty"].includes(config.operator) &&
        !String(config.value || "").trim()
      ) {
        return "Please enter a condition value.";
      }
    }

    return "";
  };

  // ====================================================
  // UPDATE AUTOMATION
  // ====================================================

  const saveWorkflow = async (status = "draft") => {
    setError("");

    const validation = validate();

    if (validation) {
      setError(validation);
      return;
    }

    if (
      status === "active" &&
      nodes.some((node) => ["email", "whatsapp", "sms"].includes(node.type))
    ) {
      setError(
        "Email, WhatsApp and SMS sender integrations must be connected in the backend before activation.",
      );
      return;
    }

    const payload = {
      name: name.trim(),
      description,

      trigger: {
        event: trigger.type,
        conditions: [],
        conditionType: "all",
      },

      steps: nodes.map((node, index) => ({
        id: node.id,
        type: node.type,
        title: node.title,
        order: index,
        config: node.config,
        isActive: node.isActive,
      })),

      status,
      timezone: "Asia/Kolkata",
    };

    try {
      setSaving(true);

      // IMPORTANT:
      // Update existing automation. Do not create a new one.
      const response = await api.put(`/automations/${id}`, payload);

      if (response.data?.success !== false) {
        navigate("/marketing/automations", {
          state: {
            message: "Automation updated successfully.",
          },
        });
      } else {
        setError(response.data?.message || "Unable to update automation.");
      }
    } catch (err) {
      console.error("Update automation error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update automation.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // CONFIGURATION PANEL
  // ====================================================

  const renderConfig = (node) => {
    const c = node.config || {};

    const inputClass =
      "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

    const Field = ({ label, children }) => (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">{label}</label>
        {children}
      </div>
    );

    switch (node.type) {
      case "assign":
        return (
          <Field label="Team Member User ID">
            <input
              className={inputClass}
              value={c.userId || ""}
              onChange={(e) => updateConfig(node.id, "userId", e.target.value)}
              placeholder="Enter user ID"
            />
          </Field>
        );

      case "notification":
      case "task":
        return (
          <>
            <Field label="Title">
              <input
                className={inputClass}
                value={c.title || ""}
                onChange={(e) => updateConfig(node.id, "title", e.target.value)}
                placeholder="Enter title"
              />
            </Field>

            <Field label="Message">
              <textarea
                rows={4}
                className={inputClass}
                value={c.message || ""}
                onChange={(e) =>
                  updateConfig(node.id, "message", e.target.value)
                }
                placeholder="Write message..."
              />
            </Field>

            {node.type === "task" && (
              <Field label="Reminder Date">
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={c.reminderAt || ""}
                  onChange={(e) =>
                    updateConfig(node.id, "reminderAt", e.target.value)
                  }
                />
              </Field>
            )}
          </>
        );

      case "tag":
        return (
          <Field label="Tag Name">
            <input
              className={inputClass}
              value={c.tag || ""}
              onChange={(e) => updateConfig(node.id, "tag", e.target.value)}
              placeholder="e.g. Hot Lead"
            />
          </Field>
        );

      case "status":
        return (
          <Field label="Lead Status">
            <select
              className={inputClass}
              value={c.status || "new"}
              onChange={(e) => updateConfig(node.id, "status", e.target.value)}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </Field>
        );

      case "delay":
        return (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duration">
              <input
                type="number"
                min="0"
                className={inputClass}
                value={c.amount ?? 30}
                onChange={(e) =>
                  updateConfig(
                    node.id,
                    "amount",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
            </Field>

            <Field label="Unit">
              <select
                className={inputClass}
                value={c.unit || "minutes"}
                onChange={(e) => updateConfig(node.id, "unit", e.target.value)}
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </Field>
          </div>
        );

      case "condition":
        return (
          <>
            <Field label="Lead Field">
              <select
                className={inputClass}
                value={c.field || "source"}
                onChange={(e) => updateConfig(node.id, "field", e.target.value)}
              >
                <option value="source">Lead Source</option>
                <option value="status">Lead Status</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="name">Name</option>
                <option value="companyName">Company Name</option>
              </select>
            </Field>

            <Field label="Operator">
              <select
                className={inputClass}
                value={c.operator || "equals"}
                onChange={(e) =>
                  updateConfig(node.id, "operator", e.target.value)
                }
              >
                <option value="equals">Is</option>
                <option value="not_equals">Is Not</option>
                <option value="contains">Contains</option>
                <option value="not_contains">Does Not Contain</option>
                <option value="is_empty">Is Empty</option>
                <option value="is_not_empty">Is Not Empty</option>
              </select>
            </Field>

            {!["is_empty", "is_not_empty"].includes(c.operator) && (
              <Field label="Value">
                <input
                  className={inputClass}
                  value={c.value || ""}
                  onChange={(e) =>
                    updateConfig(node.id, "value", e.target.value)
                  }
                  placeholder="Enter value"
                />
              </Field>
            )}

            <Field label="When condition fails">
              <select
                className={inputClass}
                value={c.falseBehavior || "stop"}
                onChange={(e) =>
                  updateConfig(node.id, "falseBehavior", e.target.value)
                }
              >
                <option value="stop">Stop workflow</option>
                <option value="skip_next">Skip next action</option>
              </select>
            </Field>
          </>
        );

      case "email":
        return (
          <>
            <Field label="Subject">
              <input
                className={inputClass}
                value={c.subject || ""}
                onChange={(e) =>
                  updateConfig(node.id, "subject", e.target.value)
                }
                placeholder="Email subject"
              />
            </Field>

            <Field label="Email Body">
              <textarea
                rows={5}
                className={inputClass}
                value={c.message || ""}
                onChange={(e) =>
                  updateConfig(node.id, "message", e.target.value)
                }
                placeholder="Write email..."
              />
            </Field>
          </>
        );

      case "whatsapp":
      case "sms":
        return (
          <Field label="Message">
            <textarea
              rows={5}
              className={inputClass}
              value={c.message || ""}
              onChange={(e) => updateConfig(node.id, "message", e.target.value)}
              placeholder="Write message..."
            />
          </Field>
        );

      default:
        return (
          <p className="text-sm text-slate-400">No configuration required.</p>
        );
    }
  };

  // ====================================================
  // NODE CARD
  // ====================================================

  const NodeCard = ({ node, index, isTrigger = false }) => {
    const info = getNodeInfo(node.type);
    const Icon = info?.icon || Zap;
    const color = colorClasses[info?.color || "blue"];

    const active =
      selectedNode === node.id ||
      (isTrigger && panel === "trigger" && !selectedNode);

    return (
      <div
        onClick={() => {
          if (isTrigger) {
            setSelectedNode(null);
            setPanel("trigger");
          } else {
            setSelectedNode(node.id);
            setPanel("node");
          }
        }}
        className={`group relative w-[250px] cursor-pointer rounded-xl border bg-white shadow-sm transition hover:shadow-md ${
          active
            ? "border-indigo-500 ring-2 ring-indigo-100"
            : "border-slate-200"
        }`}
      >
        <div className="flex items-center gap-3 p-3.5">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg border ${color}`}
          >
            <Icon size={19} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isTrigger ? "Trigger" : `Action ${index + 1}`}
            </p>

            <h3 className="truncate text-sm font-bold text-slate-800">
              {node.title}
            </h3>

            <p className="mt-0.5 truncate text-[11px] text-slate-400">
              {info?.description}
            </p>
          </div>

          <MoreHorizontal size={17} className="text-slate-400" />
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-3.5 py-2">
          <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                node.isActive === false ? "bg-slate-300" : "bg-emerald-500"
              }`}
            />
            {node.isActive === false ? "Disabled" : "Configured"}
          </span>

          {!isTrigger && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNode(node.id);
              }}
              className="rounded p-1 text-slate-400 opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    );
  };

  // ====================================================
  // LOADING SCREEN
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <RefreshCw size={30} className="animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500">Loading automation...</p>
      </div>
    );
  }

  if (error && !trigger && !name) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-5">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-7 text-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">
            Unable to load automation
          </h2>

          <p className="mt-2 text-sm text-red-600">{error}</p>

          <button
            onClick={fetchAutomation}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <div className="flex h-screen min-h-[650px] flex-col overflow-hidden bg-slate-50 text-slate-800">
      {/* TOP TOOLBAR */}

      <header className="z-20 flex h-[65px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
        <div className="flex min-w-0 items-center gap-4">
          <button
            onClick={() => navigate("/marketing/automations")}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Workflow size={17} className="shrink-0 text-indigo-600" />

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-52 border-0 bg-transparent text-sm font-bold outline-none focus:ring-0"
                placeholder="Workflow name"
              />
            </div>

            <p className="pl-6 text-[10px] text-slate-400">
              Edit AvstoMart Workflow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => saveWorkflow("draft")}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <Save size={15} />
            Save Draft
          </button>

          <button
            onClick={() => saveWorkflow("active")}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            <Play size={14} />
            {saving ? "Saving..." : "Update & Activate"}
          </button>
        </div>
      </header>

      {/* WORKSPACE */}

      <div className="flex min-h-0 flex-1">
        {/* LEFT SIDEBAR */}

        <aside className="z-10 flex w-[250px] shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4">
            <p className="text-xs font-bold text-slate-800">Workflow Nodes</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Choose a trigger or action.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Triggers
            </p>

            <div className="space-y-1">
              {triggers.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.type}
                    onClick={() => addTrigger(item)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-indigo-50 ${
                      trigger?.type === item.type
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mb-2 mt-6 px-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Actions
              </p>
            </div>

            <div className="space-y-1">
              {actions.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.type}
                    onClick={() => addAction(item.type)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <Icon size={16} />
                    <span className="text-xs font-medium">{item.label}</span>
                    <Plus size={13} className="ml-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 p-3">
            <div className="rounded-lg bg-indigo-50 p-3">
              <div className="flex items-center gap-2 text-indigo-700">
                <Zap size={15} />
                <span className="text-xs font-bold">Workflow Builder</span>
              </div>
              <p className="mt-1 text-[10px] leading-4 text-indigo-600">
                Update your existing automation workflow.
              </p>
            </div>
          </div>
        </aside>

        {/* CANVAS */}

        <main className="relative min-w-0 flex-1 overflow-auto bg-[#f8fafc]">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative mx-auto flex min-h-full min-w-[520px] flex-col items-center px-12 py-12">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm">
                <Workflow size={18} />
              </div>

              <p className="text-xs font-semibold text-slate-600">
                Workflow Canvas
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Edit your automation visually
              </p>
            </div>

            {/* TRIGGER */}

            {trigger ? (
              <>
                <NodeCard node={trigger} index={0} isTrigger />

                <div className="relative flex h-16 w-px items-center justify-center bg-slate-300">
                  <button
                    onClick={() => setShowPicker(true)}
                    className="absolute z-10 flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 shadow-sm hover:border-indigo-500 hover:text-indigo-600"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setPanel("trigger")}
                className="flex w-[260px] flex-col items-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-5 py-7 text-center hover:border-indigo-400 hover:bg-indigo-50"
              >
                <Zap size={25} className="mb-3 text-amber-500" />
                <p className="text-sm font-bold text-slate-700">Add Trigger</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Choose what starts this workflow
                </p>
              </button>
            )}

            {/* ACTION NODES */}

            {nodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <NodeCard node={node} index={index} />

                <div className="relative flex h-16 w-px items-center justify-center bg-slate-300">
                  <button
                    onClick={() => setShowPicker(true)}
                    className="absolute z-10 flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 shadow-sm hover:border-indigo-500 hover:text-indigo-600"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </React.Fragment>
            ))}

            {/* ADD ACTION */}

            {trigger && (
              <button
                onClick={() => setShowPicker(true)}
                className="flex w-[250px] flex-col items-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-5 text-center transition hover:border-indigo-400 hover:bg-indigo-50"
              >
                <Plus size={20} className="mb-2 text-indigo-500" />
                <span className="text-xs font-bold text-slate-600">
                  Add Action
                </span>
                <span className="mt-1 text-[10px] text-slate-400">
                  Select the next workflow step
                </span>
              </button>
            )}
          </div>
        </main>

        {/* RIGHT CONFIGURATION PANEL */}

        <aside className="z-10 flex w-[320px] shrink-0 flex-col border-l border-slate-200 bg-white">
          <div className="flex h-[58px] items-center justify-between border-b border-slate-100 px-4">
            <div className="flex items-center gap-2">
              <Settings2 size={16} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-800">
                Configuration
              </span>
            </div>

            <button
              onClick={() => {
                setSelectedNode(null);
                setPanel("trigger");
              }}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* TRIGGER CONFIG */}

            {panel === "trigger" ? (
              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Zap size={19} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-800">
                    Trigger Configuration
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Select the event that starts this workflow.
                  </p>
                </div>

                <div className="space-y-2">
                  {triggers.map((item) => {
                    const Icon = item.icon;
                    const active = trigger?.type === item.type;

                    return (
                      <button
                        key={item.type}
                        onClick={() => addTrigger(item)}
                        className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                          active
                            ? "border-indigo-400 bg-indigo-50"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Icon
                          size={17}
                          className={
                            active ? "text-indigo-600" : "text-slate-400"
                          }
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700">
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {item.description}
                          </p>
                        </div>

                        {active && (
                          <Check size={15} className="text-indigo-600" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Workflow Description
                  </label>

                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Describe your workflow..."
                  />
                </div>
              </div>
            ) : selected ? (
              <div className="space-y-5">
                {(() => {
                  const info = getNodeInfo(selected.type);
                  const Icon = info?.icon || Zap;

                  return (
                    <>
                      <div>
                        <div
                          className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl border ${
                            colorClasses[info?.color || "blue"]
                          }`}
                        >
                          <Icon size={20} />
                        </div>

                        <h3 className="text-sm font-bold text-slate-800">
                          {selected.title}
                        </h3>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {info?.description}
                        </p>
                      </div>

                      {/* NODE NAME */}

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">
                          Node Name
                        </label>

                        <input
                          value={selected.title}
                          onChange={(e) =>
                            updateNode(selected.id, "title", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-indigo-400"
                        />
                      </div>

                      {/* ENABLE NODE */}

                      <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-700">
                            Enable Node
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            Run this step in workflow
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            updateNode(
                              selected.id,
                              "isActive",
                              !selected.isActive,
                            )
                          }
                          className={`relative h-5 w-9 rounded-full transition ${
                            selected.isActive ? "bg-indigo-600" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                              selected.isActive ? "left-[18px]" : "left-0.5"
                            }`}
                          />
                        </button>
                      </div>

                      {/* PARAMETERS */}

                      <div className="border-t border-slate-100 pt-4">
                        <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Parameters
                        </p>

                        {renderConfig(selected)}
                      </div>

                      {/* REORDER */}

                      <div className="border-t border-slate-100 pt-4">
                        {(() => {
                          const index = nodes.findIndex(
                            (node) => node.id === selected.id,
                          );

                          return (
                            <div className="mb-3 grid grid-cols-2 gap-2">
                              <button
                                disabled={index <= 0}
                                onClick={() => moveNode(index, -1)}
                                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                              >
                                <ChevronUp size={14} />
                                Move Up
                              </button>

                              <button
                                disabled={index >= nodes.length - 1}
                                onClick={() => moveNode(index, 1)}
                                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                              >
                                <ChevronDown size={14} />
                                Move Down
                              </button>
                            </div>
                          );
                        })()}

                        <button
                          onClick={() => removeNode(selected.id)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Delete Node
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <Settings2 size={21} />
                </div>

                <p className="text-xs font-bold text-slate-600">
                  No Node Selected
                </p>

                <p className="mt-1 max-w-[180px] text-[10px] leading-4 text-slate-400">
                  Select a trigger or action node to configure its settings.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ACTION PICKER MODAL */}

      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onClick={() => setShowPicker(false)}
        >
          <div
            className="w-full max-w-[560px] rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Add Workflow Node
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Choose an action for your workflow.
                </p>
              </div>

              <button
                onClick={() => setShowPicker(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {actions.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.type}
                    onClick={() => addAction(item.type)}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-indigo-400 hover:bg-indigo-50"
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                        colorClasses[item.color]
                      }`}
                    >
                      <Icon size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        {item.label}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="fixed bottom-5 left-1/2 z-[60] w-[min(90%,480px)] -translate-x-1/2 rounded-xl border border-red-200 bg-white p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-red-600">Workflow Error</p>
              <p className="mt-1 text-xs text-slate-600">{error}</p>
            </div>

            <button
              onClick={() => setError("")}
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
