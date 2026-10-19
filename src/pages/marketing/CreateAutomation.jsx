import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  MarkerType,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";

import {
  ArrowLeft,
  Bot,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Copy,
  Database,
  GitBranch,
  Globe,
  Mail,
  MessageCircle,
  MoreHorizontal,
  MousePointer2,
  Play,
  Plus,
  Save,
  Search,
  Settings2,
  Trash2,
  UserPlus,
  Users,
  Webhook,
  X,
  Zap,
  Bell,
  RefreshCw,
  Filter,
  ListChecks,
  FileText,
  CircleHelp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import "@xyflow/react/dist/style.css";

/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_KEY = "avstomart-automation-draft";

const NODE_TYPES = {
  trigger: "trigger",
  action: "action",
  condition: "condition",
  delay: "delay",
  code: "code",
};

/* =========================================================
   ICON MAP
========================================================= */

const ICONS = {
  zap: Zap,
  webhook: Webhook,
  users: Users,
  userPlus: UserPlus,
  message: MessageCircle,
  mail: Mail,
  task: ListChecks,
  database: Database,
  clock: Clock3,
  branch: GitBranch,
  code: Code2,
  bell: Bell,
  globe: Globe,
  bot: Bot,
  filter: Filter,
};

/* =========================================================
   HELPERS
========================================================= */

const getIcon = (iconKey) => {
  return ICONS[iconKey] || Zap;
};

const createId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const defaultNodeData = {
  trigger: {
    label: "Lead Created",
    description: "Starts when a new lead is created",
    iconKey: "users",
    color: "emerald",
    category: "Trigger",
    config: {
      event: "lead.created",
    },
  },

  action: {
    label: "Send WhatsApp",
    description: "Send a WhatsApp message",
    iconKey: "message",
    color: "green",
    category: "Action",
    config: {
      recipient: "{{lead.phone}}",
      message:
        "Hi {{lead.name}}, thank you for your interest. How can we help you?",
    },
  },

  condition: {
    label: "IF Condition",
    description: "Check a condition and branch",
    iconKey: "branch",
    color: "amber",
    category: "Logic",
    config: {
      field: "lead.status",
      operator: "equals",
      value: "new",
    },
  },

  delay: {
    label: "Wait",
    description: "Wait before continuing",
    iconKey: "clock",
    color: "violet",
    category: "Action",
    config: {
      duration: 1,
      unit: "hours",
    },
  },

  code: {
    label: "Code",
    description: "Run custom JavaScript",
    iconKey: "code",
    color: "slate",
    category: "Action",
    config: {
      code: `// Write your JavaScript here

return {
  success: true
};`,
    },
  },
};

/* =========================================================
   NODE CATALOG
========================================================= */

const NODE_CATALOG = [
  {
    id: "lead-created",
    type: "trigger",
    label: "Lead Created",
    description: "When a new lead is created",
    iconKey: "users",
    color: "emerald",
    category: "Triggers",
  },
  {
    id: "form-submitted",
    type: "trigger",
    label: "Form Submitted",
    description: "When a website form is submitted",
    iconKey: "file",
    color: "blue",
    category: "Triggers",
  },
  {
    id: "webhook",
    type: "trigger",
    label: "Webhook",
    description: "Receive an HTTP webhook",
    iconKey: "webhook",
    color: "orange",
    category: "Triggers",
  },
  {
    id: "send-whatsapp",
    type: "action",
    label: "Send WhatsApp",
    description: "Send WhatsApp message",
    iconKey: "message",
    color: "green",
    category: "Actions",
  },
  {
    id: "send-email",
    type: "action",
    label: "Send Email",
    description: "Send an email",
    iconKey: "mail",
    color: "blue",
    category: "Actions",
  },
  {
    id: "create-task",
    type: "action",
    label: "Create Task",
    description: "Create a CRM task",
    iconKey: "task",
    color: "indigo",
    category: "Actions",
  },
  {
    id: "assign-lead",
    type: "action",
    label: "Assign Lead",
    description: "Assign lead to a team member",
    iconKey: "userPlus",
    color: "purple",
    category: "Actions",
  },
  {
    id: "update-lead",
    type: "action",
    label: "Update Lead",
    description: "Update lead fields",
    iconKey: "database",
    color: "cyan",
    category: "Actions",
  },
  {
    id: "notification",
    type: "action",
    label: "Notification",
    description: "Send internal notification",
    iconKey: "bell",
    color: "yellow",
    category: "Actions",
  },
  {
    id: "wait",
    type: "delay",
    label: "Wait",
    description: "Wait before next step",
    iconKey: "clock",
    color: "violet",
    category: "Actions",
  },
  {
    id: "if-condition",
    type: "condition",
    label: "IF Condition",
    description: "Create true / false branches",
    iconKey: "branch",
    color: "amber",
    category: "Logic",
  },
  {
    id: "code",
    type: "code",
    label: "Code",
    description: "Run custom JavaScript",
    iconKey: "code",
    color: "slate",
    category: "Actions",
  },
];

/* =========================================================
   COLOR HELPERS
========================================================= */

const colorMap = {
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "bg-emerald-100 text-emerald-600",
    text: "text-emerald-700",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "bg-blue-100 text-blue-600",
    text: "text-blue-700",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "bg-green-100 text-green-600",
    text: "text-green-700",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: "bg-orange-100 text-orange-600",
    text: "text-orange-700",
  },
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    icon: "bg-indigo-100 text-indigo-600",
    text: "text-indigo-700",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: "bg-purple-100 text-purple-600",
    text: "text-purple-700",
  },
  cyan: {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    icon: "bg-cyan-100 text-cyan-600",
    text: "text-cyan-700",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: "bg-yellow-100 text-yellow-600",
    text: "text-yellow-700",
  },
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: "bg-violet-100 text-violet-600",
    text: "text-violet-700",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "bg-amber-100 text-amber-600",
    text: "text-amber-700",
  },
  slate: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    icon: "bg-slate-100 text-slate-600",
    text: "text-slate-700",
  },
};

/* =========================================================
   INITIAL WORKFLOW
========================================================= */

const initialNodes = [
  {
    id: "trigger-1",
    type: "automationNode",
    position: {
      x: 100,
      y: 220,
    },
    data: {
      ...defaultNodeData.trigger,
      nodeType: "trigger",
    },
  },
];

const initialEdges = [];

/* =========================================================
   CUSTOM NODE
========================================================= */

function AutomationNode({ id, data, selected }) {
  const Icon = getIcon(data.iconKey);
  const colors = colorMap[data.color] || colorMap.blue;

  const isCondition = data.nodeType === NODE_TYPES.condition;

  return (
    <div
      className={[
        "relative w-[245px] rounded-xl border bg-white shadow-sm transition-all",
        selected
          ? "border-blue-500 shadow-lg shadow-blue-100 ring-2 ring-blue-100"
          : "border-slate-200 hover:border-slate-300",
      ].join(" ")}
    >
      {/* INPUT */}
      {data.nodeType !== NODE_TYPES.trigger && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="!h-3 !w-3 !border-2 !border-white !bg-slate-500"
        />
      )}

      {/* HEADER */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors.icon}`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[13px] font-semibold text-slate-800">
              {data.label}
            </p>

            {data.nodeType === NODE_TYPES.trigger && (
              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">
                TRIGGER
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate text-[11px] text-slate-400">
            {data.description}
          </p>
        </div>

        <MoreHorizontal size={16} className="text-slate-400" />
      </div>

      {/* BODY */}
      <div className="px-4 py-3">
        {data.nodeType === NODE_TYPES.trigger && (
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Event
            </p>

            <p className="mt-1 text-[11px] font-medium text-slate-700">
              {data.config?.event || "Select event"}
            </p>
          </div>
        )}

        {data.nodeType === NODE_TYPES.action && (
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="line-clamp-2 text-[11px] text-slate-600">
              {data.config?.message ||
                data.config?.subject ||
                "Configure this action"}
            </p>
          </div>
        )}

        {data.nodeType === NODE_TYPES.delay && (
          <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-violet-700">
            <Clock3 size={14} />
            <span className="text-[11px] font-medium">
              Wait {data.config?.duration || 1} {data.config?.unit || "hours"}
            </span>
          </div>
        )}

        {data.nodeType === NODE_TYPES.condition && (
          <div className="space-y-2">
            <div className="rounded-lg bg-amber-50 px-3 py-2">
              <p className="text-[10px] text-amber-600">IF</p>

              <p className="mt-1 truncate text-[11px] font-medium text-amber-800">
                {data.config?.field || "field"}{" "}
                {data.config?.operator || "equals"}{" "}
                {data.config?.value || "value"}
              </p>
            </div>
          </div>
        )}

        {data.nodeType === NODE_TYPES.code && (
          <div className="rounded-lg bg-slate-900 px-3 py-2">
            <p className="font-mono text-[10px] text-slate-300">JavaScript</p>
          </div>
        )}
      </div>

      {/* CONDITION OUTPUTS */}
      {isCondition ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ top: "38%" }}
            className="!h-3 !w-3 !border-2 !border-white !bg-emerald-500"
          />

          <div className="absolute -right-[47px] top-[calc(38%-7px)] rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">
            TRUE
          </div>

          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: "72%" }}
            className="!h-3 !w-3 !border-2 !border-white !bg-red-500"
          />

          <div className="absolute -right-[50px] top-[calc(72%-7px)] rounded bg-red-50 px-1.5 py-0.5 text-[9px] font-semibold text-red-600">
            FALSE
          </div>
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="!h-3 !w-3 !border-2 !border-white !bg-blue-500"
        />
      )}
    </div>
  );
}

/* =========================================================
   NODE TYPES
========================================================= */

const nodeTypes = {
  automationNode: AutomationNode,
};

/* =========================================================
   NODE PALETTE ITEM
========================================================= */

function NodePaletteItem({ node, onClick }) {
  const Icon = getIcon(node.iconKey);
  const colors = colorMap[node.color] || colorMap.blue;

  const handleDragStart = (event) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(node));

    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <button
      type="button"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(node)}
      className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 text-left transition hover:border-slate-200 hover:bg-slate-50"
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.icon}`}
      >
        <Icon size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-slate-700">
          {node.label}
        </p>

        <p className="truncate text-[10px] text-slate-400">
          {node.description}
        </p>
      </div>

      <Plus
        size={14}
        className="shrink-0 text-slate-300 opacity-0 transition group-hover:opacity-100"
      />
    </button>
  );
}

/* =========================================================
   INSPECTOR
========================================================= */

function NodeInspector({ node, onClose, onChange, onDelete, onDuplicate }) {
  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
          <MousePointer2 size={20} className="text-slate-400" />
        </div>

        <p className="text-sm font-semibold text-slate-700">Select a node</p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Click any node on the canvas to configure its settings.
        </p>
      </div>
    );
  }

  const updateConfig = (key, value) => {
    onChange({
      ...node.data,
      config: {
        ...node.data.config,
        [key]: value,
      },
    });
  };

  const updateData = (key, value) => {
    onChange({
      ...node.data,
      [key]: value,
    });
  };

  const renderTriggerSettings = () => {
    return (
      <div className="space-y-4">
        <Field label="Trigger Event">
          <select
            value={node.data.config?.event || ""}
            onChange={(e) => updateConfig("event", e.target.value)}
            className="input"
          >
            <option value="lead.created">Lead Created</option>
            <option value="lead.updated">Lead Updated</option>
            <option value="lead.status_changed">Lead Status Changed</option>
            <option value="form.submitted">Form Submitted</option>
            <option value="order.created">Order Created</option>
            <option value="webhook.received">Webhook Received</option>
          </select>
        </Field>

        <InfoBox>
          This trigger starts the automation whenever the selected event occurs.
        </InfoBox>
      </div>
    );
  };

  const renderWhatsAppSettings = () => {
    return (
      <div className="space-y-4">
        <Field label="Recipient">
          <input
            value={node.data.config?.recipient || ""}
            onChange={(e) => updateConfig("recipient", e.target.value)}
            placeholder="{{lead.phone}}"
            className="input"
          />
        </Field>

        <Field label="Message">
          <textarea
            value={node.data.config?.message || ""}
            onChange={(e) => updateConfig("message", e.target.value)}
            rows={7}
            className="input resize-none"
            placeholder="Write your WhatsApp message..."
          />
        </Field>

        <VariableHint />
      </div>
    );
  };

  const renderEmailSettings = () => {
    return (
      <div className="space-y-4">
        <Field label="To">
          <input
            value={node.data.config?.recipient || ""}
            onChange={(e) => updateConfig("recipient", e.target.value)}
            placeholder="{{lead.email}}"
            className="input"
          />
        </Field>

        <Field label="Subject">
          <input
            value={node.data.config?.subject || ""}
            onChange={(e) => updateConfig("subject", e.target.value)}
            placeholder="Welcome to our business"
            className="input"
          />
        </Field>

        <Field label="Email Body">
          <textarea
            value={node.data.config?.body || ""}
            onChange={(e) => updateConfig("body", e.target.value)}
            rows={8}
            className="input resize-none"
            placeholder="Write your email..."
          />
        </Field>

        <VariableHint />
      </div>
    );
  };

  const renderConditionSettings = () => {
    return (
      <div className="space-y-4">
        <Field label="Field">
          <input
            value={node.data.config?.field || ""}
            onChange={(e) => updateConfig("field", e.target.value)}
            placeholder="lead.status"
            className="input"
          />
        </Field>

        <Field label="Operator">
          <select
            value={node.data.config?.operator || "equals"}
            onChange={(e) => updateConfig("operator", e.target.value)}
            className="input"
          >
            <option value="equals">Equals</option>
            <option value="not_equals">Does not equal</option>
            <option value="contains">Contains</option>
            <option value="not_contains">Does not contain</option>
            <option value="greater_than">Greater than</option>
            <option value="less_than">Less than</option>
            <option value="exists">Exists</option>
            <option value="not_exists">Does not exist</option>
          </select>
        </Field>

        <Field label="Value">
          <input
            value={node.data.config?.value || ""}
            onChange={(e) => updateConfig("value", e.target.value)}
            placeholder="new"
            className="input"
          />
        </Field>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex gap-2">
            <GitBranch size={15} className="mt-0.5 text-amber-600" />

            <div>
              <p className="text-[11px] font-semibold text-amber-800">
                Branching
              </p>

              <p className="mt-1 text-[10px] leading-4 text-amber-700">
                TRUE and FALSE outputs can be connected to different actions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDelaySettings = () => {
    return (
      <div className="space-y-4">
        <Field label="Duration">
          <input
            type="number"
            min="1"
            value={node.data.config?.duration || 1}
            onChange={(e) => updateConfig("duration", Number(e.target.value))}
            className="input"
          />
        </Field>

        <Field label="Unit">
          <select
            value={node.data.config?.unit || "hours"}
            onChange={(e) => updateConfig("unit", e.target.value)}
            className="input"
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
          </select>
        </Field>
      </div>
    );
  };

  const renderCodeSettings = () => {
    return (
      <div className="space-y-4">
        <Field label="JavaScript">
          <textarea
            value={node.data.config?.code || ""}
            onChange={(e) => updateConfig("code", e.target.value)}
            rows={15}
            spellCheck={false}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-[11px] leading-5 text-slate-200 outline-none focus:border-blue-500"
          />
        </Field>

        <InfoBox>
          Return an object from your code to pass data to the next node.
        </InfoBox>
      </div>
    );
  };

  const renderGenericAction = () => {
    return (
      <div className="space-y-4">
        <Field label="Action Name">
          <input
            value={node.data.label || ""}
            onChange={(e) => updateData("label", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={node.data.description || ""}
            onChange={(e) => updateData("description", e.target.value)}
            rows={4}
            className="input resize-none"
          />
        </Field>

        <InfoBox>
          Configure the action parameters for this workflow step.
        </InfoBox>
      </div>
    );
  };

  const getSettings = () => {
    if (node.data.nodeType === "trigger") {
      return renderTriggerSettings();
    }

    if (
      node.data.iconKey === "message" ||
      node.data.label === "Send WhatsApp"
    ) {
      return renderWhatsAppSettings();
    }

    if (node.data.iconKey === "mail" || node.data.label === "Send Email") {
      return renderEmailSettings();
    }

    if (node.data.nodeType === "condition") {
      return renderConditionSettings();
    }

    if (node.data.nodeType === "delay") {
      return renderDelaySettings();
    }

    if (node.data.nodeType === "code") {
      return renderCodeSettings();
    }

    return renderGenericAction();
  };

  const colors = colorMap[node.data.color] || colorMap.blue;

  const Icon = getIcon(node.data.iconKey);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* INSPECTOR HEADER */}
      <div className="flex h-[58px] shrink-0 items-center gap-3 border-b border-slate-200 px-4">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.icon}`}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-slate-800">
            {node.data.label}
          </p>

          <p className="text-[10px] text-slate-400">{node.data.category}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={16} />
        </button>
      </div>

      {/* INSPECTOR BODY */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Configuration
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Configure how this step behaves.
          </p>
        </div>

        {getSettings()}
      </div>

      {/* INSPECTOR FOOTER */}
      <div className="shrink-0 border-t border-slate-200 p-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDuplicate}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <Copy size={14} />
            Duplicate
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium text-slate-600">
        {label}
      </label>

      {children}
    </div>
  );
}

function InfoBox({ children }) {
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
      <div className="flex gap-2">
        <CircleHelp size={14} className="mt-0.5 shrink-0 text-blue-500" />

        <p className="text-[10px] leading-4 text-blue-700">{children}</p>
      </div>
    </div>
  );
}

function VariableHint() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold text-slate-500">
        Available variables
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {[
          "{{lead.name}}",
          "{{lead.email}}",
          "{{lead.phone}}",
          "{{lead.company}}",
        ].map((item) => (
          <span
            key={item}
            className="rounded bg-white px-1.5 py-1 font-mono text-[9px] text-slate-500"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN BUILDER
========================================================= */

function CreateAutomationBuilder() {
  const reactFlowWrapper = useRef(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const [workflowName, setWorkflowName] = useState("Untitled Automation");

  const [description, setDescription] = useState("New marketing automation");

  const [isActive, setIsActive] = useState(false);

  const [search, setSearch] = useState("");

  const [showInspector, setShowInspector] = useState(true);

  const [saved, setSaved] = useState(false);

  const { screenToFlowPosition, fitView } = useReactFlow();

  /* =======================================================
     SELECTED NODE
  ======================================================= */

  const selectedNode = useMemo(() => {
    return nodes.find((node) => node.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  /* =======================================================
     FILTER NODES
  ======================================================= */

  const filteredCatalog = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return NODE_CATALOG;
    }

    return NODE_CATALOG.filter((node) => {
      return (
        node.label.toLowerCase().includes(value) ||
        node.description.toLowerCase().includes(value) ||
        node.category.toLowerCase().includes(value)
      );
    });
  }, [search]);

  /* =======================================================
     CONNECTION
  ======================================================= */

  const onConnect = useCallback(
    (params) => {
      setEdges((currentEdges) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 16,
              height: 16,
            },
            style: {
              strokeWidth: 1.8,
            },
          },
          currentEdges,
        ),
      );
    },
    [setEdges],
  );

  /* =======================================================
     NODE CLICK
  ======================================================= */

  const handleNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
    setShowInspector(true);
  }, []);

  /* =======================================================
     CANVAS CLICK
  ======================================================= */

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  /* =======================================================
     UPDATE NODE
  ======================================================= */

  const updateSelectedNode = useCallback(
    (data) => {
      if (!selectedNodeId) return;

      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id !== selectedNodeId) {
            return node;
          }

          return {
            ...node,
            data,
          };
        }),
      );
    },
    [selectedNodeId, setNodes],
  );

  /* =======================================================
     DELETE NODE
  ======================================================= */

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;

    setNodes((currentNodes) =>
      currentNodes.filter((node) => node.id !== selectedNodeId),
    );

    setEdges((currentEdges) =>
      currentEdges.filter(
        (edge) =>
          edge.source !== selectedNodeId && edge.target !== selectedNodeId,
      ),
    );

    setSelectedNodeId(null);
  }, [selectedNodeId, setNodes, setEdges]);

  /* =======================================================
     DUPLICATE NODE
  ======================================================= */

  const duplicateSelectedNode = useCallback(() => {
    if (!selectedNode) return;

    const newId = createId();

    const newNode = {
      ...selectedNode,
      id: newId,
      position: {
        x: selectedNode.position.x + 320,
        y: selectedNode.position.y + 80,
      },
      selected: false,
      data: {
        ...selectedNode.data,
        config: {
          ...selectedNode.data.config,
        },
      },
    };

    setNodes((currentNodes) => [
      ...currentNodes.map((node) => ({
        ...node,
        selected: false,
      })),
      newNode,
    ]);

    setSelectedNodeId(newId);
  }, [selectedNode, setNodes]);

  /* =======================================================
     ADD NODE
  ======================================================= */

  const addNode = useCallback(
    (catalogNode, position = null) => {
      const lastNode = nodes[nodes.length - 1];

      const nextPosition =
        position ||
        (lastNode
          ? {
              x: lastNode.position.x + 320,
              y: lastNode.position.y,
            }
          : {
              x: 100,
              y: 200,
            });

      const base = defaultNodeData[catalogNode.type] || defaultNodeData.action;

      const newNode = {
        id: createId(),
        type: "automationNode",
        position: nextPosition,
        data: {
          ...base,
          label: catalogNode.label,
          description: catalogNode.description,
          iconKey: catalogNode.iconKey,
          color: catalogNode.color,
          category:
            catalogNode.category === "Logic"
              ? "Logic"
              : catalogNode.category.replace(/s$/, ""),
          nodeType: catalogNode.type,
          config: {
            ...(base.config || {}),
          },
        },
      };

      setNodes((currentNodes) => [
        ...currentNodes.map((node) => ({
          ...node,
          selected: false,
        })),
        newNode,
      ]);

      setSelectedNodeId(newNode.id);
      setShowInspector(true);

      return newNode;
    },
    [nodes, setNodes],
  );

  /* =======================================================
     AUTO CONNECT
  ======================================================= */

  const addNodeAndConnect = useCallback(
    (catalogNode) => {
      const lastNode = nodes[nodes.length - 1];

      const newNode = addNode(catalogNode);

      if (lastNode && newNode) {
        setEdges((currentEdges) => [
          ...currentEdges,
          {
            id: `edge-${lastNode.id}-${newNode.id}`,
            source: lastNode.id,
            target: newNode.id,
            sourceHandle:
              lastNode.data.nodeType === "condition" ? "true" : "output",
            targetHandle: "input",
            type: "smoothstep",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 16,
              height: 16,
            },
            style: {
              strokeWidth: 1.8,
            },
          },
        ]);
      }
    },
    [nodes, addNode, setEdges],
  );

  /* =======================================================
     DRAG OVER
  ======================================================= */

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  /* =======================================================
     DROP
  ======================================================= */

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const raw = event.dataTransfer.getData("application/reactflow");

      if (!raw) return;

      let catalogNode;

      try {
        catalogNode = JSON.parse(raw);
      } catch {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(catalogNode, position);
    },
    [screenToFlowPosition, addNode],
  );

  /* =======================================================
     SAVE
  ======================================================= */

  const saveWorkflow = useCallback(() => {
    const payload = {
      name: workflowName,
      description,
      active: isActive,
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2000);

    console.log("Automation saved:", payload);
  }, [workflowName, description, isActive, nodes, edges]);

  /* =======================================================
     ACTIVATE
  ======================================================= */

  const activateWorkflow = useCallback(() => {
    setIsActive(true);

    const payload = {
      name: workflowName,
      description,
      active: true,
      nodes,
      edges,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    console.log("Automation activated:", payload);
  }, [workflowName, description, nodes, edges]);

  /* =======================================================
     LOAD DRAFT
  ======================================================= */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) return;

      const parsed = JSON.parse(stored);

      if (parsed.name) {
        setWorkflowName(parsed.name);
      }

      if (parsed.description) {
        setDescription(parsed.description);
      }

      if (typeof parsed.active === "boolean") {
        setIsActive(parsed.active);
      }

      if (Array.isArray(parsed.nodes)) {
        setNodes(parsed.nodes);
      }

      if (Array.isArray(parsed.edges)) {
        setEdges(parsed.edges);
      }
    } catch (error) {
      console.error("Unable to load automation draft", error);
    }
  }, [setNodes, setEdges]);

  /* =======================================================
     FIT VIEW
  ======================================================= */

  const handleFitView = () => {
    fitView({
      padding: 0.2,
      duration: 400,
    });
  };

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-slate-50">
      {/* ===================================================
          TOP HEADER
      =================================================== */}

      <header className="flex h-[62px] shrink-0 items-center border-b border-slate-200 bg-white px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="h-6 w-px bg-slate-200" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="max-w-[300px] border-none bg-transparent p-0 text-sm font-semibold text-slate-800 outline-none"
              />

              {isActive ? (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
                  <CheckCircle2 size={10} />
                  ACTIVE
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                  DRAFT
                </span>
              )}
            </div>

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-0.5 block w-[350px] max-w-full border-none bg-transparent p-0 text-[10px] text-slate-400 outline-none"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {saved && (
            <span className="mr-2 flex items-center gap-1 text-[11px] text-emerald-600">
              <Check size={13} />
              Saved
            </span>
          )}

          <button
            type="button"
            onClick={saveWorkflow}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Save size={14} />
            Save
          </button>

          <button
            type="button"
            onClick={activateWorkflow}
            className="flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <Play size={13} fill="currentColor" />
            Activate
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <MoreHorizontal size={17} />
          </button>
        </div>
      </header>

      {/* ===================================================
          WORKSPACE
      =================================================== */}

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {/* =================================================
            LEFT NODE PANEL
        ================================================= */}

        <aside className="flex h-full w-[270px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-200 p-3">
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-800">Add nodes</p>

              <p className="mt-1 text-[10px] text-slate-400">
                Drag a node onto the canvas or click to add it.
              </p>
            </div>

            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search nodes..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {filteredCatalog.length === 0 ? (
              <div className="px-3 py-10 text-center">
                <Search size={22} className="mx-auto text-slate-300" />

                <p className="mt-2 text-xs font-medium text-slate-500">
                  No nodes found
                </p>
              </div>
            ) : (
              <>
                {["Triggers", "Actions", "Logic"].map((category) => {
                  const items = filteredCatalog.filter(
                    (item) => item.category === category,
                  );

                  if (!items.length) return null;

                  return (
                    <div key={category} className="mb-4">
                      <div className="flex items-center justify-between px-2 py-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          {category}
                        </p>

                        <span className="text-[9px] text-slate-300">
                          {items.length}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        {items.map((item) => (
                          <NodePaletteItem
                            key={item.id}
                            node={item}
                            onClick={addNodeAndConnect}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-200 p-3">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <div className="flex gap-2">
                <Bot size={15} className="mt-0.5 text-blue-500" />

                <div>
                  <p className="text-[10px] font-semibold text-blue-800">
                    Automation Builder
                  </p>

                  <p className="mt-1 text-[9px] leading-4 text-blue-600">
                    Connect triggers, actions and conditions to build your
                    workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* =================================================
            CENTER CANVAS
        ================================================= */}

        <div
          ref={reactFlowWrapper}
          className="relative min-h-0 min-w-0 flex-1 overflow-hidden"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            fitView
            fitViewOptions={{
              padding: 0.2,
            }}
            defaultEdgeOptions={{
              type: "smoothstep",
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            }}
            proOptions={{
              hideAttribution: true,
            }}
            minZoom={0.2}
            maxZoom={2}
          >
            <Background gap={20} size={1} color="#e2e8f0" />

            <Controls showInteractive={false} className="!m-4" />

            <MiniMap
              pannable
              zoomable
              className="!m-4"
              nodeColor={(node) => {
                if (node.data?.nodeType === "trigger") {
                  return "#10b981";
                }

                if (node.data?.nodeType === "condition") {
                  return "#f59e0b";
                }

                return "#3b82f6";
              }}
            />

            {/* CANVAS TOOLBAR */}
            <Panel position="top-left" className="!left-4 !top-4 !m-0">
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={handleFitView}
                  title="Fit workflow"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                >
                  <RefreshCw size={14} />
                </button>

                <div className="h-5 w-px bg-slate-200" />

                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100"
                >
                  <Settings2 size={14} />
                </button>
              </div>
            </Panel>

            {/* DROP HINT */}
            {nodes.length === 1 && (
              <Panel position="bottom-center" className="!bottom-8 !m-0">
                <div className="pointer-events-none rounded-lg border border-dashed border-slate-300 bg-white/90 px-5 py-3 text-center shadow-sm backdrop-blur">
                  <p className="text-xs font-medium text-slate-600">
                    Drag a node here to continue
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Connect your automation steps visually
                  </p>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* =================================================
            RIGHT INSPECTOR
        ================================================= */}

        {showInspector && (
          <aside className="h-full w-[320px] shrink-0 overflow-hidden border-l border-slate-200 bg-white">
            <NodeInspector
              node={selectedNode}
              onClose={() => {
                setShowInspector(false);
                setSelectedNodeId(null);
              }}
              onChange={updateSelectedNode}
              onDelete={deleteSelectedNode}
              onDuplicate={duplicateSelectedNode}
            />
          </aside>
        )}

        {/* Inspector toggle */}
        {!showInspector && (
          <button
            type="button"
            onClick={() => setShowInspector(true)}
            className="absolute right-4 top-[76px] z-10 flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <Settings2 size={14} />
            Settings
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PROVIDER WRAPPER
========================================================= */

export default function CreateAutomation() {
  return (
    <div className="h-full min-h-0 w-full min-w-0 overflow-hidden">
      <ReactFlowProvider>
        <CreateAutomationBuilder />
      </ReactFlowProvider>
    </div>
  );
}
