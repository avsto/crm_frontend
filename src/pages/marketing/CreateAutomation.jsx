import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
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
  MousePointer2,
  Check,
  Eye,
  Image,
  Loader2,
  RefreshCw,
  Paperclip,
} from "lucide-react";

import automationApi from "../../api/automation.api";
import teamApi from "../../api/team.api";
import marketingTemplateApi from "../../api/marketingTemplate.api";
import MediaManager from "../../components/media/MediaManager";
import crmApi from "../../api/crm.api";

// ======================================================
// CONSTANTS
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

const defaultConfig = (type) => {
  const configs = {
    assign: { userId: "" },
    notification: {
      title: "",
      message: "",
      templateId: "",
      templateName: "",
    },
    task: { title: "Follow-up Task", message: "", reminderAt: "" },
    tag: { tag: "" },
    status: { status: "new" },
    delay: { amount: 30, unit: "minutes" },
    condition: {
      field: "source",
      operator: "equals",
      value: "",
      falseBehavior: "stop",
    },
    email: {
      subject: "",
      message: "",
      templateId: "",
      templateName: "",
    },
    whatsapp: {
      message: "",
      header: "",
      footer: "",
      buttons: [],
      language: "",
      templateId: "",
      templateName: "",
      mediaId: "",
      mediaUrl: "",
      components: [],
    },
    sms: {
      message: "",
      templateId: "",
      templateName: "",
    },
  };

  return configs[type] || {};
};

const createNode = (type) => {
  const item = [...triggers, ...actions].find((x) => x.type === type);

  return {
    id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    title: item?.label || type,
    config: defaultConfig(type),
    isActive: true,
  };
};

const getNodeInfo = (type) =>
  [...triggers, ...actions].find((item) => item.type === type);

// ======================================================
// TEMPLATE HELPERS
// ======================================================

const unwrapTemplates = (response) => {
  const result =
    response?.data?.data ??
    response?.data?.templates ??
    response?.data ??
    response?.templates ??
    response;

  return Array.isArray(result) ? result : [];
};

const getWhatsAppData = (template) => {
  return template?.whatsapp || template?.content?.whatsapp || {};
};

const getTemplateName = (template) => {
  const whatsapp = getWhatsAppData(template);

  return (
    whatsapp?.name ||
    template?.name ||
    template?.title ||
    template?.templateName ||
    "Untitled Template"
  );
};

const getTemplateLanguage = (template) => {
  const whatsapp = getWhatsAppData(template);

  return (
    whatsapp?.language || template?.language || whatsapp?.languageCode || "en"
  );
};

const getTemplateComponents = (template) => {
  const whatsapp = getWhatsAppData(template);

  const components =
    whatsapp?.components ||
    template?.components ||
    template?.content?.components ||
    [];

  return Array.isArray(components) ? components : [];
};

const getComponentText = (component) => {
  if (!component) return "";

  if (typeof component === "string") return component;

  return component?.text || component?.body || component?.content || "";
};

const getWhatsAppParts = (template) => {
  const components = getTemplateComponents(template);

  const header = components.find(
    (item) => item?.type?.toUpperCase() === "HEADER",
  );

  const body = components.find((item) => item?.type?.toUpperCase() === "BODY");

  const footer = components.find(
    (item) => item?.type?.toUpperCase() === "FOOTER",
  );

  const buttonsComponent = components.find(
    (item) => item?.type?.toUpperCase() === "BUTTONS",
  );

  const buttons = Array.isArray(buttonsComponent?.buttons)
    ? buttonsComponent.buttons
    : [];

  const mediaFormat = header?.format || "";
  const mediaExample =
    header?.example?.header_handle?.[0] || header?.example?.header_url || "";

  return {
    header: getComponentText(header),
    message:
      getComponentText(body) ||
      template?.body?.text ||
      template?.body ||
      template?.content?.body ||
      template?.content?.text ||
      template?.message ||
      "",
    footer: getComponentText(footer),
    buttons,
    mediaFormat,
    mediaExample,
  };
};

const getTemplateChannel = (template) => {
  const whatsapp = getWhatsAppData(template);

  const raw = [
    template?.channel,
    template?.type,
    template?.platform,
    template?.provider,
    template?.category,
    template?.templateType,
    whatsapp?.name ? "whatsapp" : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (raw.includes("whatsapp")) return "whatsapp";
  if (raw.includes("email")) return "email";
  if (raw.includes("sms")) return "sms";
  if (raw.includes("notification") || raw.includes("push")) {
    return "notification";
  }

  return "";
};

const getEmailParts = (template) => {
  const email = template?.email || template?.content?.email || {};

  return {
    subject:
      email?.subject || template?.subject || template?.content?.subject || "",
    message:
      email?.body ||
      email?.message ||
      template?.body?.text ||
      template?.body ||
      template?.content?.body ||
      template?.content?.text ||
      template?.message ||
      "",
  };
};

const getSimpleMessage = (template) => {
  return (
    template?.message ||
    template?.body?.text ||
    template?.body ||
    template?.content?.message ||
    template?.content?.body ||
    template?.content?.text ||
    ""
  );
};

const replaceVariables = (value = "") => {
  return String(value)
    .replace(/{{name}}/gi, "John Smith")
    .replace(/{{companyName}}/gi, "AvstoMart")
    .replace(/{{email}}/gi, "john@example.com")
    .replace(/{{phone}}/gi, "+91 9876543210");
};

// ======================================================
// PREVIEW COMPONENT
// ======================================================

function TemplatePreview({ type, config }) {
  const c = config || {};

  if (type === "email") {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Mail size={15} className="text-indigo-600" />
            Email Preview
          </div>
        </div>

        <div className="p-4">
          <p className="text-[10px] text-slate-400">Subject</p>
          <p className="mb-4 text-sm font-bold text-slate-800">
            {replaceVariables(c.subject) || "Email subject"}
          </p>

          <div className="min-h-[130px] whitespace-pre-wrap text-xs leading-6 text-slate-600">
            {replaceVariables(c.message) || "Email content preview"}
          </div>

          <div className="mt-4 border-t pt-3 text-[10px] text-slate-400">
            Sent using AvstoMart
          </div>
        </div>
      </div>
    );
  }

  if (type === "whatsapp") {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#e5ddd5]">
        <div className="flex items-center gap-2 bg-[#075e54] p-3 text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <MessageCircle size={16} />
          </div>
          <div>
            <p className="text-xs font-bold">Your Business</p>
            <p className="text-[10px] text-white/70">WhatsApp Preview</p>
          </div>
        </div>

        <div className="min-h-[180px] p-3">
          <div className="ml-auto max-w-[90%] rounded-xl rounded-tr-none bg-[#dcf8c6] p-3 shadow-sm">
            {c.mediaUrl && (
              <img
                src={c.mediaUrl}
                alt="WhatsApp media"
                className="mb-2 max-h-36 w-full rounded-lg object-cover"
              />
            )}

            {c.header && (
              <p className="mb-2 text-xs font-bold text-slate-800">
                {replaceVariables(c.header)}
              </p>
            )}

            <p className="whitespace-pre-wrap text-xs leading-5 text-slate-700">
              {replaceVariables(c.message) || "WhatsApp message preview"}
            </p>

            {c.footer && (
              <p className="mt-2 text-[10px] text-slate-500">
                {replaceVariables(c.footer)}
              </p>
            )}

            <p className="mt-2 text-right text-[9px] text-slate-400">
              10:30 AM ✓✓
            </p>
          </div>

          {Array.isArray(c.buttons) && c.buttons.length > 0 && (
            <div className="ml-auto mt-2 max-w-[90%] space-y-1">
              {c.buttons.map((button, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-white p-2 text-center text-xs font-semibold text-[#168c80]"
                >
                  {button?.text || button?.title || button?.type || "Button"}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === "sms") {
    return (
      <div className="mx-auto max-w-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b bg-slate-50 p-3 text-center">
          <p className="text-xs font-bold text-slate-700">Messages</p>
          <p className="text-[10px] text-slate-400">SMS Preview</p>
        </div>

        <div className="min-h-[160px] bg-white p-4">
          <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-slate-100 p-3">
            <p className="whitespace-pre-wrap text-xs leading-5 text-slate-700">
              {replaceVariables(c.message) || "SMS message preview"}
            </p>
          </div>
          <p className="mt-2 text-[9px] text-slate-400">Now</p>
        </div>
      </div>
    );
  }

  if (type === "notification") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Bell size={17} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">AvstoMart</p>
            <p className="text-[10px] text-slate-400">Just now</p>
          </div>
        </div>

        <p className="text-sm font-bold text-slate-800">
          {replaceVariables(c.title) || "Notification title"}
        </p>

        <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">
          {replaceVariables(c.message) || "Notification message preview"}
        </p>
      </div>
    );
  }

  return null;
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function CreateAutomation() {
  const navigate = useNavigate();

  const [name, setName] = useState("My Workflow");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [panel, setPanel] = useState("trigger");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showPicker, setShowPicker] = useState(false);

  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateError, setTemplateError] = useState("");

  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);

  const selected = nodes.find((node) => node.id === selectedNode);

  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState("");

  const fetchTags = async () => {
    try {
      setTagsLoading(true);
      setTagsError("");

      const response = await crmApi.getTags({
        page: 1,
        limit: 1000,
      });

      const result =
        response?.data?.data?.tags ||
        response?.data?.tags ||
        response?.data?.data ||
        response?.data ||
        response?.tags ||
        [];

      setTags(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Fetch CRM Tags Error:", err);

      setTagsError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load CRM tags.",
      );
    } finally {
      setTagsLoading(false);
    }
  };

  // ----------------------------------------------------
  // FETCH TEAM MEMBERS
  // ----------------------------------------------------

  const fetchTeamMembers = async () => {
    try {
      setTeamLoading(true);

      const response = await teamApi.getTeamMembers();

      const members =
        response?.data?.members ||
        response?.data?.users ||
        response?.members ||
        response?.users ||
        response?.data ||
        [];

      setTeamMembers(Array.isArray(members) ? members : []);
    } catch (err) {
      console.error("Fetch Team Members Error:", err);
    } finally {
      setTeamLoading(false);
    }
  };

  // ----------------------------------------------------
  // FETCH MARKETING TEMPLATES
  // ----------------------------------------------------

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true);
      setTemplateError("");

      const response = await marketingTemplateApi.getTemplates({
        page: 1,
        limit: 1000,
      });

      const list = unwrapTemplates(response);

      setTemplates(list);
    } catch (err) {
      console.error("Fetch Marketing Templates Error:", err);

      setTemplateError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load marketing templates.",
      );
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
    fetchTemplates();
    fetchTags();
  }, []);

  // ----------------------------------------------------
  // FILTER TEMPLATES BY CHANNEL
  // ----------------------------------------------------

  const getTemplatesFor = (type) => {
    return templates.filter((template) => {
      const channel = getTemplateChannel(template);

      if (channel) return channel === type;

      // WhatsApp templates may have WhatsApp-specific components.
      if (type === "whatsapp") {
        return (
          getTemplateComponents(template).length > 0 &&
          !!getWhatsAppData(template)
        );
      }

      return false;
    });
  };

  // ----------------------------------------------------
  // NODE HANDLERS
  // ----------------------------------------------------

  const addTrigger = (item) => {
    setTrigger({
      ...createNode(item.type),
      title: item.label,
    });

    setSelectedNode(null);
    setPanel("trigger");
  };

  const addAction = (type) => {
    const node = createNode(type);

    setNodes((prev) => [...prev, node]);
    setSelectedNode(node.id);
    setPanel("node");
    setShowPicker(false);
  };

  const updateNode = (id, key, value) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, [key]: value } : node)),
    );
  };

  const updateConfig = (id, key, value) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
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

  const updateManyConfig = (id, values) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
          ? {
              ...node,
              config: {
                ...node.config,
                ...values,
              },
            }
          : node,
      ),
    );
  };

  const removeNode = (id) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setSelectedNode(null);
    setPanel("trigger");
  };

  const moveNode = (index, direction) => {
    const target = index + direction;

    if (target < 0 || target >= nodes.length) return;

    const updated = [...nodes];

    [updated[index], updated[target]] = [updated[target], updated[index]];

    setNodes(updated);
  };

  // ----------------------------------------------------
  // SELECT TEMPLATE
  // ----------------------------------------------------

  const selectTemplate = (node, template) => {
    const templateId =
      template?._id || template?.id || template?.templateId || "";

    const templateName = getTemplateName(template);

    if (node.type === "whatsapp") {
      const parts = getWhatsAppParts(template);

      updateManyConfig(node.id, {
        templateId,
        templateName,
        language: getTemplateLanguage(template),
        components: getTemplateComponents(template),
        header: parts.header,
        message: parts.message,
        footer: parts.footer,
        buttons: parts.buttons,
        mediaFormat: parts.mediaFormat,
        mediaExample: parts.mediaExample,
      });

      return;
    }

    if (node.type === "email") {
      const parts = getEmailParts(template);

      updateManyConfig(node.id, {
        templateId,
        templateName,
        subject: parts.subject,
        message: parts.message,
      });

      return;
    }

    if (node.type === "sms") {
      updateManyConfig(node.id, {
        templateId,
        templateName,
        message: getSimpleMessage(template),
      });

      return;
    }

    if (node.type === "notification") {
      updateManyConfig(node.id, {
        templateId,
        templateName,
        title:
          template?.title || template?.name || template?.content?.title || "",
        message: getSimpleMessage(template),
      });
    }
  };

  const clearSelectedTemplate = (node) => {
    updateManyConfig(node.id, {
      templateId: "",
      templateName: "",
    });
  };

  // ----------------------------------------------------
  // WHATSAPP MEDIA MANAGER
  // ----------------------------------------------------

  const handleMediaSelect = async (media) => {
    if (!selected || selected.type !== "whatsapp") return;

    try {
      setMediaUploading(true);
      setError("");

      // MediaManager may return path, url, filePath or fileUrl.
      const filePath = media?.filePath || media?.path || "";
      const fileUrl = media?.fileUrl || media?.url || "";

      if (!filePath && !fileUrl) {
        throw new Error(
          "Selected media does not contain a file path or file URL.",
        );
      }

      const payload = {
        source: media?.source || "media_manager",
        id: media?.id || media?._id || "",
        filePath,
        fileUrl,
        name: media?.name || media?.fileName || "",
        mime: media?.mime || media?.mimeType || media?.type || "",
        mimeType: media?.mimeType || media?.mime || media?.type || "",
        size: media?.size || 0,
      };

      const response =
        await marketingTemplateApi.uploadMediaToWhatsApp(payload);

      const result = response?.data || response || {};
      const data = result?.data || result;

      const mediaId = data?.mediaId || data?.id || data?.whatsappMediaId || "";

      const mediaUrl = data?.url || data?.mediaUrl || fileUrl;

      if (!mediaId) {
        throw new Error("WhatsApp media ID was not returned by the server.");
      }

      updateManyConfig(selected.id, {
        mediaId,
        mediaUrl,
        mediaName: media?.name || data?.name || "",
        mediaMime: media?.mime || media?.mimeType || data?.mime || "",
        mediaPath: filePath,
      });

      setMediaOpen(false);
    } catch (err) {
      console.error("WhatsApp Media Upload Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to upload WhatsApp media.",
      );
    } finally {
      setMediaUploading(false);
    }
  };

  // ----------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------

  const validate = () => {
    if (!name.trim()) return "Workflow name is required.";
    if (!trigger) return "Please select a trigger.";
    if (!nodes.length) return "Please add at least one action.";

    for (const node of nodes) {
      const c = node.config || {};

      if (node.type === "assign" && !c.userId?.trim()) {
        return "Please select a team member for Assign Lead.";
      }

      if (node.type === "tag" && !c.tag?.trim()) {
        return "Please enter a tag name.";
      }

      if (
        node.type === "delay" &&
        (!Number.isFinite(Number(c.amount)) || Number(c.amount) < 0)
      ) {
        return "Please enter a valid delay.";
      }

      if (
        ["notification", "task", "email", "whatsapp", "sms"].includes(
          node.type,
        ) &&
        !c.message?.trim()
      ) {
        return `Please enter a message for ${node.title}.`;
      }

      if (node.type === "email" && !c.subject?.trim()) {
        return "Please enter an email subject.";
      }

      if (
        node.type === "condition" &&
        !["is_empty", "is_not_empty"].includes(c.operator) &&
        !String(c.value || "").trim()
      ) {
        return "Please enter a condition value.";
      }
    }

    return "";
  };

  // ----------------------------------------------------
  // SAVE WORKFLOW
  // ----------------------------------------------------

  const saveWorkflow = async (status = "draft") => {
    setError("");

    const validation = validate();

    if (validation) {
      setError(validation);
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

      const response = await automationApi.create(payload);

      if (response?.success) {
        navigate("/marketing/automation", {
          state: {
            message: "Workflow saved successfully.",
          },
        });
      } else {
        setError(response?.message || "Unable to save workflow.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Unable to save workflow.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // TEMPLATE SELECTOR
  // ====================================================

  const TemplateSelector = ({ node }) => {
    const c = node.config || {};
    const availableTemplates = getTemplatesFor(node.type);

    return (
      <div className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">Select Template</p>
            <p className="mt-1 text-[10px] text-slate-500">
              Choose a saved {node.type} template.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchTemplates}
            disabled={templatesLoading}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-indigo-600 disabled:opacity-50"
            title="Refresh templates"
          >
            <RefreshCw
              size={14}
              className={templatesLoading ? "animate-spin" : ""}
            />
          </button>
        </div>

        <select
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-indigo-400"
          value={c.templateId || ""}
          disabled={templatesLoading}
          onChange={(e) => {
            const template = availableTemplates.find(
              (item) =>
                String(item?._id || item?.id || item?.templateId) ===
                e.target.value,
            );

            if (template) {
              selectTemplate(node, template);
            } else {
              clearSelectedTemplate(node);
            }
          }}
        >
          <option value="">
            {templatesLoading ? "Loading templates..." : "Select a template"}
          </option>

          {availableTemplates.map((template, index) => {
            const id =
              template?._id ||
              template?.id ||
              template?.templateId ||
              `template-${index}`;

            return (
              <option key={id} value={id}>
                {getTemplateName(template)}
              </option>
            );
          })}
        </select>

        {templateError && (
          <p className="text-[11px] text-red-600">{templateError}</p>
        )}

        {!templatesLoading && availableTemplates.length === 0 && (
          <p className="text-[11px] text-slate-500">
            No {node.type} templates found.
          </p>
        )}

        {c.templateName && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white p-2.5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-emerald-700">
                Selected Template
              </p>
              <p className="truncate text-xs font-bold text-slate-700">
                {c.templateName}
              </p>
            </div>

            <button
              type="button"
              onClick={() => clearSelectedTemplate(node)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
              title="Clear template"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ====================================================
  // CONFIGURATION
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
          <Field label="Assign Team Member">
            <select
              className={inputClass}
              value={c.userId || ""}
              onChange={(e) => updateConfig(node.id, "userId", e.target.value)}
              disabled={teamLoading}
            >
              <option value="">
                {teamLoading ? "Loading team members..." : "Select team member"}
              </option>

              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name || member.fullName || member.email}
                  {member.email ? ` (${member.email})` : ""}
                </option>
              ))}
            </select>

            {!teamLoading && teamMembers.length === 0 && (
              <p className="text-xs text-red-500">No team members found.</p>
            )}
          </Field>
        );

      case "notification":
        return (
          <>
            <TemplateSelector node={node} />

            <Field label="Notification Title">
              <input
                className={inputClass}
                value={c.title || ""}
                onChange={(e) => updateConfig(node.id, "title", e.target.value)}
                placeholder="Notification title"
              />
            </Field>

            <Field label="Notification Message">
              <textarea
                rows={4}
                className={inputClass}
                value={c.message || ""}
                onChange={(e) =>
                  updateConfig(node.id, "message", e.target.value)
                }
                placeholder="Write notification..."
              />
            </Field>

            <TemplatePreview type="notification" config={c} />
          </>
        );

      case "task":
        return (
          <>
            <Field label="Title">
              <input
                className={inputClass}
                value={c.title || ""}
                onChange={(e) => updateConfig(node.id, "title", e.target.value)}
                placeholder="Enter task title"
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
                placeholder="Write task details..."
              />
            </Field>

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
          </>
        );

      case "tag":
        return (
          <div className="space-y-3">
            <Field label="Select CRM Tag">
              <select
                className={inputClass}
                value={c.tagId || ""}
                disabled={tagsLoading}
                onChange={(e) => {
                  const selectedTag = tags.find(
                    (tag) => String(tag._id || tag.id) === e.target.value,
                  );

                  updateManyConfig(node.id, {
                    tagId: selectedTag
                      ? String(selectedTag._id || selectedTag.id)
                      : "",
                    tag: selectedTag
                      ? selectedTag.name ||
                        selectedTag.title ||
                        selectedTag.label
                      : "",
                  });
                }}
              >
                <option value="">
                  {tagsLoading ? "Loading CRM tags..." : "Select a tag"}
                </option>

                {tags.map((tag) => {
                  const id = String(tag._id || tag.id);
                  const label =
                    tag.name || tag.title || tag.label || "Untitled Tag";

                  return (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </Field>

            {tagsError && (
              <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 p-3">
                <p className="text-xs text-red-600">{tagsError}</p>

                <button
                  type="button"
                  onClick={fetchTags}
                  disabled={tagsLoading}
                  className="text-xs font-semibold text-red-700 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {!tagsLoading && !tagsError && tags.length === 0 && (
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                <p className="text-xs text-amber-700">
                  No CRM tags found. Please create a tag in CRM first.
                </p>
              </div>
            )}

            {c.tag && (
              <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                <Tag size={15} className="text-indigo-600" />

                <span className="text-xs font-semibold text-indigo-700">
                  Selected: {c.tag}
                </span>
              </div>
            )}
          </div>
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
            <TemplateSelector node={node} />

            <Field label="Email Subject">
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
                rows={6}
                className={inputClass}
                value={c.message || ""}
                onChange={(e) =>
                  updateConfig(node.id, "message", e.target.value)
                }
                placeholder="Write email..."
              />
            </Field>

            <TemplatePreview type="email" config={c} />
          </>
        );

      case "whatsapp":
        return (
          <>
            <TemplateSelector node={node} />

            <Field label="Template Header">
              <input
                className={inputClass}
                value={c.header || ""}
                onChange={(e) =>
                  updateConfig(node.id, "header", e.target.value)
                }
                placeholder="WhatsApp header"
              />
            </Field>

            <Field label="Message Body">
              <textarea
                rows={6}
                className={inputClass}
                value={c.message || ""}
                onChange={(e) =>
                  updateConfig(node.id, "message", e.target.value)
                }
                placeholder="Write WhatsApp message..."
              />
            </Field>

            <Field label="Footer">
              <input
                className={inputClass}
                value={c.footer || ""}
                onChange={(e) =>
                  updateConfig(node.id, "footer", e.target.value)
                }
                placeholder="Footer text"
              />
            </Field>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">
                  WhatsApp Media
                </label>

                <button
                  type="button"
                  onClick={() => setMediaOpen(true)}
                  disabled={mediaUploading}
                  className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                >
                  {mediaUploading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Image size={13} />
                  )}
                  Select Media
                </button>
              </div>

              {c.mediaUrl && (
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
                  <img
                    src={c.mediaUrl}
                    alt="Selected WhatsApp media"
                    className="max-h-40 w-full rounded-lg object-contain"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      updateManyConfig(node.id, {
                        mediaId: "",
                        mediaUrl: "",
                        mediaName: "",
                      })
                    }
                    className="absolute right-3 top-3 rounded-lg bg-white p-1.5 text-red-500 shadow"
                  >
                    <Trash2 size={14} />
                  </button>

                  <p className="mt-2 truncate text-[10px] text-slate-500">
                    {c.mediaName || "Selected media"}
                  </p>
                </div>
              )}

              {c.mediaId && (
                <p className="text-[10px] text-emerald-600">
                  WhatsApp Media ID: {c.mediaId}
                </p>
              )}
            </div>

            {Array.isArray(c.buttons) && c.buttons.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">
                  Template Buttons
                </label>

                {c.buttons.map((button, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700"
                  >
                    {button?.text || button?.title || button?.type}
                  </div>
                ))}
              </div>
            )}

            <TemplatePreview type="whatsapp" config={c} />
          </>
        );

      case "sms":
        return (
          <>
            <TemplateSelector node={node} />

            <Field label="SMS Message">
              <textarea
                rows={6}
                maxLength={1600}
                className={inputClass}
                value={c.message || ""}
                onChange={(e) =>
                  updateConfig(node.id, "message", e.target.value)
                }
                placeholder="Write SMS message..."
              />
            </Field>

            <div className="text-right text-[10px] text-slate-400">
              {(c.message || "").length} characters
            </div>

            <TemplatePreview type="sms" config={c} />
          </>
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
    const active = selectedNode === node.id;

    return (
      <div
        onClick={() => {
          setSelectedNode(node.id);
          setPanel(isTrigger ? "trigger" : "node");
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
  // RENDER
  // ====================================================

  return (
    <div className="flex h-screen min-h-[650px] flex-col overflow-hidden bg-slate-50 text-slate-800">
      {/* TOP TOOLBAR */}

      <header className="z-20 flex h-[65px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/marketing/automation")}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <Workflow size={17} className="text-indigo-600" />

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-52 border-0 bg-transparent text-sm font-bold outline-none focus:ring-0"
                placeholder="Workflow name"
              />
            </div>

            <p className="pl-6 text-[10px] text-slate-400">
              AvstoMart Workflow Builder
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
            {saving ? "Saving..." : "Activate"}
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

            <p className="mb-2 mt-6 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Actions
            </p>

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
                Connect triggers and actions to automate your business.
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
                <MousePointer2 size={18} />
              </div>

              <p className="text-xs font-semibold text-slate-600">
                Workflow Canvas
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                Build your automation visually
              </p>
            </div>

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
                onClick={() => {
                  setPanel("trigger");
                  setSelectedNode(null);
                }}
                className="flex w-[260px] flex-col items-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-5 py-7 text-center transition hover:border-indigo-400 hover:bg-indigo-50"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Zap size={21} />
                </div>

                <p className="text-sm font-bold text-slate-700">Add Trigger</p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Choose what starts this workflow
                </p>

                <span className="mt-4 rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white">
                  Select Trigger
                </span>
              </button>
            )}

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

        {/* RIGHT CONFIG PANEL */}

        <aside className="z-10 flex w-[350px] shrink-0 flex-col border-l border-slate-200 bg-white">
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

                      <div className="border-t border-slate-100 pt-4">
                        <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Parameters
                        </p>

                        {renderConfig(selected)}
                      </div>

                      <div className="border-t border-slate-100 pt-4">
                        <button
                          onClick={() => {
                            const index = nodes.findIndex(
                              (node) => node.id === selected.id,
                            );
                            moveNode(index, -1);
                          }}
                          className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Move Up
                        </button>

                        <button
                          onClick={() => removeNode(selected.id)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
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

      {/* ACTION PICKER */}

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
                  Add Workflow Action
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

      {/* MEDIA MANAGER */}

      <MediaManager
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={handleMediaSelect}
      />

      {/* MEDIA UPLOAD INDICATOR */}

      {mediaUploading && (
        <div className="fixed bottom-5 right-5 z-[70] flex items-center gap-3 rounded-xl border border-indigo-100 bg-white px-4 py-3 shadow-xl">
          <Loader2 size={17} className="animate-spin text-indigo-600" />
          <span className="text-xs font-semibold text-slate-700">
            Uploading WhatsApp media...
          </span>
        </div>
      )}

      {/* ERROR TOAST */}

      {error && (
        <div className="fixed bottom-5 left-1/2 z-[80] w-[min(90%,480px)] -translate-x-1/2 rounded-xl border border-red-200 bg-white p-4 shadow-xl">
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
