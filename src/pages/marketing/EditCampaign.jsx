import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  Image as ImageIcon,
  Loader2,
  Mail,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  Smartphone,
  Users,
  X,
} from "lucide-react";

import crmApi from "../../api/crm.api";
import campaignApi from "../../api/campaign.api";
import marketingTemplateApi from "../../api/marketingTemplate.api";
import MediaManager from "../../components/media/MediaManager";

// ============================================================
// CONSTANTS
// ============================================================

const CHANNELS = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "email", label: "Email", icon: Mail },
  { value: "sms", label: "SMS", icon: Smartphone },
  { value: "notification", label: "Notification", icon: Bell },
];

const DEFAULT_FORM = {
  name: "",
  description: "",
  channel: "whatsapp",
  audienceType: "tag",
  tag: "",
  leads: [],
  template: "",
  subject: "",
  body: "",
  sendType: "now",
  scheduledAt: "",
  batchSize: 50,
  delayBetweenBatches: 1000,
  integration: "",
  notes: "",
};

const getResponseData = (response) =>
  response?.data?.data ?? response?.data ?? null;

const getId = (item) => String(item?._id || item?.id || "");

const getLeadId = (lead) => getId(lead);

const getLeadName = (lead) =>
  lead?.name ||
  [lead?.firstName, lead?.lastName].filter(Boolean).join(" ") ||
  lead?.fullName ||
  "Unnamed Lead";

const getLeadPhone = (lead) =>
  lead?.phone || lead?.mobile || lead?.alternatePhone || "";

const getLeadEmail = (lead) => lead?.email || "";

const getLeadCompany = (lead) => lead?.companyName || lead?.company || "";

const getTemplateName = (template) =>
  template?.whatsapp?.name ||
  template?.name ||
  template?.title ||
  "Unnamed Template";

const getTemplateLanguage = (template) =>
  template?.whatsapp?.language ||
  template?.language ||
  template?.whatsapp?.languageCode ||
  "en_US";

const getTemplateComponents = (template) =>
  template?.whatsapp?.components || template?.components || [];

const getTemplateComponent = (template, type) =>
  getTemplateComponents(template).find(
    (component) =>
      String(component?.type || "").toUpperCase() ===
      String(type).toUpperCase(),
  );

const getTemplateHeader = (template) =>
  getTemplateComponent(template, "HEADER");

const getTemplateBody = (template) => getTemplateComponent(template, "BODY");

const getTemplateFooter = (template) =>
  getTemplateComponent(template, "FOOTER");

const getTemplateButtons = (template) => {
  const component = getTemplateComponent(template, "BUTTONS");
  return Array.isArray(component?.buttons) ? component.buttons : [];
};

const getTemplateHeaderFormat = (template) =>
  String(getTemplateHeader(template)?.format || "").toUpperCase();

const getTemplateBodyText = (template) => {
  const body = getTemplateBody(template);
  return (
    body?.text ||
    template?.body ||
    template?.content?.body ||
    template?.content?.text ||
    template?.message ||
    ""
  );
};

const getTemplateHeaderText = (template) =>
  getTemplateHeader(template)?.text || "";

const getTemplateFooterText = (template) =>
  getTemplateFooter(template)?.text || "";

const formatDateTimeLocal = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);

  return local.toISOString().slice(0, 16);
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

// ============================================================
// COMPONENT
// ============================================================

export default function EditCampaign() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(DEFAULT_FORM);

  const [campaign, setCampaign] = useState(null);
  const [tags, setTags] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [tagLeads, setTagLeads] = useState([]);

  const [selectedLeadMap, setSelectedLeadMap] = useState({});
  const [leadSearch, setLeadSearch] = useState("");
  const [leadSelectionMode, setLeadSelectionMode] = useState("manual");

  const [leadPagination, setLeadPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingTagLeads, setLoadingTagLeads] = useState(false);

  const [error, setError] = useState("");

  // WhatsApp media
  const [mediaOpen, setMediaOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [whatsappMediaId, setWhatsappMediaId] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState("");

  // ============================================================
  // FORM HELPERS
  // ============================================================

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============================================================
  // LOAD TAGS
  // ============================================================

  useEffect(() => {
    let active = true;

    const loadTags = async () => {
      try {
        setLoadingTags(true);

        const response = await crmApi.getTags({
          page: 1,
          limit: 1000,
        });

        const data = getResponseData(response);

        if (active) {
          setTags(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load tags:", err);
        if (active) setTags([]);
      } finally {
        if (active) setLoadingTags(false);
      }
    };

    loadTags();

    return () => {
      active = false;
    };
  }, []);

  // ============================================================
  // LOAD TEMPLATES
  // ============================================================

  useEffect(() => {
    let active = true;

    const loadTemplates = async () => {
      try {
        setLoadingTemplates(true);

        const response = await marketingTemplateApi.getTemplates({
          page: 1,
          limit: 1000,
        });

        const data = getResponseData(response);

        if (active) {
          setTemplates(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
        if (active) setTemplates([]);
      } finally {
        if (active) setLoadingTemplates(false);
      }
    };

    loadTemplates();

    return () => {
      active = false;
    };
  }, []);

  // ============================================================
  // LOAD CAMPAIGN
  // ============================================================

  useEffect(() => {
    let active = true;

    const loadCampaign = async () => {
      try {
        setLoadingCampaign(true);
        setError("");

        // This method should return the campaign by ID.
        const response = await campaignApi.getCampaignById(id);

        const result = getResponseData(response);
        const item = result?.campaign || result;

        if (!item) {
          throw new Error("Campaign not found.");
        }

        if (!active) return;

        setCampaign(item);

        const content = item?.content || {};
        const whatsapp = item?.whatsapp || {};
        const selectedLeads = Array.isArray(item?.leads)
          ? item.leads
              .map((lead) =>
                typeof lead === "object" ? getLeadId(lead) : String(lead),
              )
              .filter(Boolean)
          : [];

        const scheduleValue =
          item?.scheduledAt || item?.schedule?.scheduledAt || "";

        setForm({
          ...DEFAULT_FORM,
          name: item?.name || "",
          description: item?.description || "",
          channel: item?.channel || "whatsapp",
          audienceType: item?.audienceType || "tag",
          tag:
            typeof item?.tag === "object"
              ? getId(item.tag)
              : String(item?.tag || ""),
          leads: selectedLeads,
          template:
            typeof item?.template === "object"
              ? getId(item.template)
              : String(item?.template || ""),
          subject: content?.subject || item?.subject || "",
          body:
            content?.body || content?.text || item?.body || item?.message || "",
          sendType: item?.sendType || (scheduleValue ? "scheduled" : "now"),
          scheduledAt: formatDateTimeLocal(scheduleValue),
          batchSize: item?.batchSize ?? 50,
          delayBetweenBatches: item?.delayBetweenBatches ?? 1000,
          integration:
            typeof item?.integration === "object"
              ? getId(item.integration)
              : item?.integration || "",
          notes: item?.notes || "",
        });

        const media = whatsapp?.media || item?.content?.media || null;
        const mediaId =
          whatsapp?.headerMediaId ||
          content?.headerMediaId ||
          item?.headerMediaId ||
          "";

        if (media) setSelectedMedia(media);
        if (mediaId) setWhatsappMediaId(String(mediaId));

        const initialMap = {};
        selectedLeads.forEach((leadId) => {
          initialMap[leadId] = true;
        });

        setSelectedLeadMap(initialMap);
        setLeadSelectionMode("manual");
      } catch (err) {
        console.error("Failed to load campaign:", err);

        if (active) {
          setError(getErrorMessage(err, "Failed to load campaign."));
        }
      } finally {
        if (active) setLoadingCampaign(false);
      }
    };

    if (id) loadCampaign();

    return () => {
      active = false;
    };
  }, [id]);

  // ============================================================
  // LOAD LEADS BY TAG WITH SERVER-SIDE SEARCH
  // ============================================================

  const loadTagLeads = useCallback(async () => {
    if (!form.tag) {
      setTagLeads([]);
      setLeadPagination({
        page: 1,
        limit: 50,
        total: 0,
        pages: 1,
      });
      return;
    }

    try {
      setLoadingTagLeads(true);

      const response = await crmApi.getLeads({
        page: 1,
        limit: 50,
        tag: form.tag,
        search: leadSearch.trim() || undefined,
      });

      const payload = response?.data;

      const leads = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      setTagLeads(leads);

      const pagination =
        payload?.pagination ||
        payload?.meta ||
        response?.data?.pagination ||
        {};

      setLeadPagination({
        page: Number(pagination?.page || 1),
        limit: Number(pagination?.limit || 50),
        total: Number(
          pagination?.total ?? pagination?.totalItems ?? leads.length,
        ),
        pages: Number(pagination?.pages ?? pagination?.totalPages ?? 1),
      });
    } catch (err) {
      console.error("Failed to fetch tag leads:", err);
      setTagLeads([]);
      setError(getErrorMessage(err, "Failed to load leads for this tag."));
    } finally {
      setLoadingTagLeads(false);
    }
  }, [form.tag, leadSearch]);

  useEffect(() => {
    if (!form.tag || loadingCampaign) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) return;
      await loadTagLeads();
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.tag, leadSearch, loadingCampaign, loadTagLeads]);

  // ============================================================
  // LEAD SELECTION
  // ============================================================

  const currentLeadIds = useMemo(
    () => tagLeads.map(getLeadId).filter(Boolean),
    [tagLeads],
  );

  const selectedLeadIds = useMemo(
    () => (form.leads || []).map((leadId) => String(leadId)),
    [form.leads],
  );

  const selectedCount = selectedLeadIds.length;

  const handleTagChange = (tagId) => {
    updateForm("tag", tagId);
    updateForm("leads", []);
    setLeadSearch("");
    setTagLeads([]);
    setSelectedLeadMap({});
    setLeadSelectionMode("manual");
  };

  const selectAllTagLeads = () => {
    if (!tagLeads.length) return;

    setLeadSelectionMode("all");

    setSelectedLeadMap((prev) => {
      const next = { ...prev };
      currentLeadIds.forEach((leadId) => {
        next[leadId] = true;
      });
      return next;
    });

    setForm((prev) => {
      const existing = new Set(
        (prev.leads || []).map((leadId) => String(leadId)),
      );

      currentLeadIds.forEach((leadId) => existing.add(leadId));

      return {
        ...prev,
        leads: Array.from(existing),
      };
    });
  };

  const enableManualSelection = () => {
    setLeadSelectionMode("manual");

    setSelectedLeadMap((prev) => {
      const next = { ...prev };

      currentLeadIds.forEach((leadId) => {
        if (!(leadId in next)) next[leadId] = false;
      });

      return next;
    });
  };

  const toggleTagLead = (leadId) => {
    if (!leadId) return;

    setLeadSelectionMode("manual");

    setForm((prev) => {
      const current = new Set((prev.leads || []).map((value) => String(value)));

      if (current.has(leadId)) {
        current.delete(leadId);
      } else {
        current.add(leadId);
      }

      return {
        ...prev,
        leads: Array.from(current),
      };
    });

    setSelectedLeadMap((prev) => ({
      ...prev,
      [leadId]: !prev[leadId],
    }));
  };

  const removeSelectedLead = (leadId) => {
    const idToRemove = String(leadId);

    setForm((prev) => ({
      ...prev,
      leads: (prev.leads || []).filter((value) => String(value) !== idToRemove),
    }));

    setSelectedLeadMap((prev) => ({
      ...prev,
      [idToRemove]: false,
    }));

    setLeadSelectionMode("manual");
  };

  const selectedVisibleLeads = useMemo(() => {
    const selected = new Set(selectedLeadIds);
    return tagLeads.filter((lead) => selected.has(getLeadId(lead)));
  }, [tagLeads, selectedLeadIds]);

  // ============================================================
  // TEMPLATE SELECTION
  // ============================================================

  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => getId(template) === String(form.template)) ||
      null,
    [templates, form.template],
  );

  const selectedHeader = selectedTemplate
    ? getTemplateHeader(selectedTemplate)
    : null;

  const selectedBody = selectedTemplate
    ? getTemplateBody(selectedTemplate)
    : null;

  const selectedFooter = selectedTemplate
    ? getTemplateFooter(selectedTemplate)
    : null;

  const selectedButtons = selectedTemplate
    ? getTemplateButtons(selectedTemplate)
    : [];

  const headerFormat = selectedTemplate
    ? getTemplateHeaderFormat(selectedTemplate)
    : "";

  const requiresImage =
    form.channel === "whatsapp" &&
    Boolean(form.template) &&
    headerFormat === "IMAGE";

  const handleTemplateChange = (templateId) => {
    const template = templates.find(
      (item) => getId(item) === String(templateId),
    );

    setMediaError("");
    setSelectedMedia(null);
    setWhatsappMediaId("");

    if (!templateId || !template) {
      setForm((prev) => ({
        ...prev,
        template: "",
        subject: "",
        body: "",
      }));
      return;
    }

    const content = template?.content || {};

    setForm((prev) => ({
      ...prev,
      template: templateId,
      subject: template?.subject || content?.subject || "",
      body:
        getTemplateBodyText(template) ||
        template?.body ||
        content?.body ||
        content?.text ||
        template?.message ||
        "",
    }));
  };

  // ============================================================
  // MEDIA MANAGER
  // ============================================================

  const handleOpenMediaManager = () => {
    setMediaError("");
    setMediaOpen(true);
  };

  const uploadSelectedMediaToWhatsApp = async (media) => {
    if (!media) {
      throw new Error("No media selected.");
    }

    const payload = {
      mediaId: media?.source_id || media?._id || media?.id || null,
      filePath: media?.source_path || media?.path || null,
      fileUrl: media?.source_url || media?.url || media?.previewUrl || null,
      fileName:
        media?.name ||
        media?.originalName ||
        media?.filename ||
        "whatsapp-image",
      mimeType:
        media?.mimeType || media?.mime_type || media?.type || "image/jpeg",
      size: media?.size || 0,
    };

    const response = await marketingTemplateApi.uploadMediaToWhatsApp(payload);

    const result = response?.data || response || {};
    const data = result?.data || result;

    const mediaId = data?.mediaId || data?.id || data?.whatsappMediaId || null;

    if (!mediaId) {
      throw new Error("WhatsApp media ID was not returned.");
    }

    return String(mediaId);
  };

  const handleMediaSelect = async (media) => {
    if (!media) return;

    try {
      setUploadingMedia(true);
      setMediaError("");
      setSelectedMedia(media);

      const mediaId = await uploadSelectedMediaToWhatsApp(media);

      setWhatsappMediaId(mediaId);
      setMediaOpen(false);
    } catch (err) {
      console.error("Media upload error:", err);
      setSelectedMedia(null);
      setWhatsappMediaId("");
      setMediaError(
        getErrorMessage(err, "Unable to upload image to WhatsApp."),
      );
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeSelectedMedia = () => {
    setSelectedMedia(null);
    setWhatsappMediaId("");
    setMediaError("");
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Campaign name is required.";
    }

    if (!form.channel) {
      return "Please select a channel.";
    }

    if (!form.tag) {
      return "Please select a tag.";
    }

    if (!form.leads.length) {
      return "Please select at least one lead.";
    }

    if (form.sendType === "scheduled") {
      if (!form.scheduledAt) {
        return "Please select a scheduled date and time.";
      }

      const scheduledTime = new Date(form.scheduledAt);

      if (
        Number.isNaN(scheduledTime.getTime()) ||
        scheduledTime <= new Date()
      ) {
        return "Scheduled time must be in the future.";
      }
    }

    if (!form.template && !form.body.trim()) {
      return "Please select a template or enter message content.";
    }

    if (form.channel === "email" && !form.template && !form.subject.trim()) {
      return "Email subject is required.";
    }

    if (requiresImage && !whatsappMediaId) {
      return "Please select an image for the WhatsApp template header.";
    }

    return "";
  };

  // ============================================================
  // UPDATE CAMPAIGN
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        channel: form.channel,
        audienceType: "tag",
        leads: form.leads.map(String),
        tag: form.tag,
        filters: {},
        template: form.template || null,

        content: {
          subject: form.subject.trim(),
          body: form.body.trim(),
          ...(requiresImage ? { headerMediaId: String(whatsappMediaId) } : {}),
        },

        ...(requiresImage
          ? {
              whatsapp: {
                headerMediaId: String(whatsappMediaId),
                media: selectedMedia
                  ? {
                      id: selectedMedia?._id || selectedMedia?.id || null,
                      source_id: selectedMedia?.source_id || null,
                      name:
                        selectedMedia?.name ||
                        selectedMedia?.originalName ||
                        selectedMedia?.filename ||
                        "",
                      mimeType:
                        selectedMedia?.mimeType ||
                        selectedMedia?.mime_type ||
                        selectedMedia?.type ||
                        "",
                      url:
                        selectedMedia?.url ||
                        selectedMedia?.source_url ||
                        selectedMedia?.previewUrl ||
                        null,
                      path:
                        selectedMedia?.path ||
                        selectedMedia?.source_path ||
                        null,
                    }
                  : null,
              },
            }
          : {}),

        sendType: form.sendType,
        scheduledAt: form.sendType === "scheduled" ? form.scheduledAt : null,
        batchSize: Number(form.batchSize) || 50,
        delayBetweenBatches: Number(form.delayBetweenBatches) || 1000,
        integration: form.integration || null,
        notes: form.notes.trim(),
      };

      await campaignApi.updateCampaign(id, payload);

      navigate(`/marketing/campaigns/${id}`);
    } catch (err) {
      console.error("Update campaign error:", err);
      setError(getErrorMessage(err, "Failed to update campaign."));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // TEMPLATE PREVIEW
  // ============================================================

  const renderTemplatePreview = () => {
    if (!selectedTemplate) {
      return (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
          <MessageCircle size={24} className="mx-auto text-gray-300" />
          <p className="mt-2 text-[11px] font-medium text-gray-500">
            Select a template to preview
          </p>
          <p className="mt-1 text-[10px] text-gray-400">
            The WhatsApp message preview will appear here.
          </p>
        </div>
      );
    }

    const headerText = getTemplateHeaderText(selectedTemplate);
    const bodyText = getTemplateBodyText(selectedTemplate);
    const footerText = getTemplateFooterText(selectedTemplate);
    const buttons = getTemplateButtons(selectedTemplate);

    const imageUrl =
      selectedMedia?.url ||
      selectedMedia?.source_url ||
      selectedMedia?.previewUrl;

    return (
      <div className="rounded-lg border border-gray-200 bg-[#efeae2] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-700">
              Template Preview
            </p>
            <p className="mt-0.5 text-[9px] text-gray-400">
              WhatsApp message preview
            </p>
          </div>

          <span className="rounded-full bg-white px-2 py-1 text-[9px] font-medium text-gray-500 shadow-sm">
            {getTemplateLanguage(selectedTemplate)}
          </span>
        </div>

        <div className="mx-auto max-w-[360px]">
          <div className="overflow-hidden rounded-xl bg-[#d9fdd3] shadow-sm">
            {headerFormat === "IMAGE" && (
              <div className="border-b border-black/5 bg-gray-100">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Template header"
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={28} />
                    <span className="mt-2 text-[10px]">Header image</span>
                  </div>
                )}
              </div>
            )}

            {headerFormat === "TEXT" && headerText && (
              <div className="px-3 pt-3">
                <p className="whitespace-pre-wrap break-words text-[12px] font-semibold text-gray-800">
                  {headerText}
                </p>
              </div>
            )}

            <div className="px-3 py-2.5">
              <p className="whitespace-pre-wrap break-words text-[12px] leading-5 text-gray-700">
                {bodyText || "Template message"}
              </p>

              {footerText && (
                <p className="mt-2 text-[9px] text-gray-400">{footerText}</p>
              )}

              <div className="mt-1 flex justify-end">
                <span className="text-[8px] text-gray-400">10:30 AM</span>
              </div>
            </div>

            {buttons.length > 0 && (
              <div className="border-t border-black/5 bg-white/70">
                {buttons.map((button, index) => (
                  <div
                    key={`${button?.text || "button"}-${index}`}
                    className="border-b border-gray-100 px-3 py-2 text-center last:border-b-0"
                  >
                    <span className="text-[10px] font-medium text-blue-600">
                      {button?.text || button?.title || "Button"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loadingCampaign) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          Loading campaign...
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <form onSubmit={handleSubmit}>
        {/* HEADER */}
        <div className="sticky top-0 z-30 border-b border-gray-200 bg-white">
          <div className="flex h-14 items-center justify-between px-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/campaigns/${id}`)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <ArrowLeft size={16} />
              </button>

              <div>
                <h1 className="text-[15px] font-semibold text-gray-900">
                  Edit Campaign
                </h1>
                <p className="text-[11px] text-gray-400">
                  Update campaign details and audience
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/campaigns/${id}`)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || uploadingMedia}
                className="flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mx-5 mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5">
            <X size={15} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-[12px] text-red-600">{error}</p>
          </div>
        )}

        <div className="mx-auto max-w-[1180px] px-5 py-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              {/* CAMPAIGN DETAILS */}
              <section className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h2 className="text-[13px] font-semibold text-gray-800">
                    Campaign Details
                  </h2>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Basic campaign information
                  </p>
                </div>

                <div className="space-y-4 p-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                      Campaign Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) =>
                        updateForm("name", event.target.value)
                      }
                      placeholder="Enter campaign name"
                      className="h-9 w-full rounded-md border border-gray-200 px-3 text-[12px] outline-none focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        updateForm("description", event.target.value)
                      }
                      rows={3}
                      placeholder="Optional campaign description"
                      className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
              </section>

              {/* CHANNEL */}
              <section className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h2 className="text-[13px] font-semibold text-gray-800">
                    Channel
                  </h2>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Select where this campaign will be sent
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-4 md:grid-cols-4">
                  {CHANNELS.map((channel) => {
                    const Icon = channel.icon;
                    const active = form.channel === channel.value;

                    return (
                      <button
                        key={channel.value}
                        type="button"
                        onClick={() => {
                          updateForm("channel", channel.value);
                          updateForm("template", "");
                          updateForm("subject", "");
                          updateForm("body", "");
                          setSelectedMedia(null);
                          setWhatsappMediaId("");
                        }}
                        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left transition ${
                          active
                            ? "border-gray-900 bg-gray-50 text-gray-900"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <Icon size={15} />
                        <span className="text-[11px] font-medium">
                          {channel.label}
                        </span>
                        {active && <Check size={13} className="ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* AUDIENCE */}
              <section className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-gray-500" />
                    <div>
                      <h2 className="text-[13px] font-semibold text-gray-800">
                        Audience
                      </h2>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        Select a tag and choose the leads
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                    Lead Tag <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={form.tag}
                    onChange={(event) => handleTagChange(event.target.value)}
                    disabled={loadingTags}
                    className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none focus:border-gray-400 disabled:bg-gray-50"
                  >
                    <option value="">
                      {loadingTags ? "Loading tags..." : "Select a tag"}
                    </option>
                    {tags.map((tag) => (
                      <option key={getId(tag)} value={getId(tag)}>
                        {tag?.name || tag?.label || tag?.title || "Unnamed Tag"}
                      </option>
                    ))}
                  </select>

                  {form.tag && (
                    <div className="mt-4 rounded-md border border-gray-200">
                      <div className="border-b border-gray-100 p-3">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-[11px] font-semibold text-gray-700">
                              Leads
                            </p>
                            <p className="mt-0.5 text-[10px] text-gray-400">
                              {leadPagination.total} leads found
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={selectAllTagLeads}
                              disabled={!tagLeads.length || loadingTagLeads}
                              className={`rounded-md px-2.5 py-1.5 text-[10px] font-medium ${
                                leadSelectionMode === "all"
                                  ? "bg-gray-900 text-white"
                                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                              } disabled:opacity-50`}
                            >
                              All Select
                            </button>

                            <button
                              type="button"
                              onClick={enableManualSelection}
                              disabled={!tagLeads.length || loadingTagLeads}
                              className={`rounded-md px-2.5 py-1.5 text-[10px] font-medium ${
                                leadSelectionMode === "manual"
                                  ? "bg-gray-900 text-white"
                                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                              } disabled:opacity-50`}
                            >
                              Manual Select
                            </button>
                          </div>
                        </div>

                        <div className="relative mt-3">
                          <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="text"
                            value={leadSearch}
                            onChange={(event) =>
                              setLeadSearch(event.target.value)
                            }
                            placeholder="Search name, email, phone or company..."
                            className="h-8 w-full rounded-md border border-gray-200 pl-8 pr-9 text-[11px] outline-none focus:border-gray-400"
                          />
                          {loadingTagLeads && (
                            <Loader2
                              size={13}
                              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
                            />
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">
                            Server-side search
                          </span>
                          <span className="text-[10px] font-medium text-gray-600">
                            {selectedCount} selected
                          </span>
                        </div>
                      </div>

                      <div className="max-h-[430px] overflow-y-auto">
                        {loadingTagLeads ? (
                          <div className="flex items-center justify-center py-10">
                            <Loader2
                              size={18}
                              className="animate-spin text-gray-400"
                            />
                          </div>
                        ) : tagLeads.length === 0 ? (
                          <div className="px-4 py-10 text-center">
                            <Users
                              size={22}
                              className="mx-auto text-gray-300"
                            />
                            <p className="mt-2 text-[11px] font-medium text-gray-500">
                              No leads found
                            </p>
                            <p className="mt-1 text-[10px] text-gray-400">
                              Try another search or tag.
                            </p>
                          </div>
                        ) : (
                          tagLeads.map((lead) => {
                            const leadId = getLeadId(lead);
                            const checked = selectedLeadIds.includes(leadId);

                            return (
                              <label
                                key={leadId}
                                className={`flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-2.5 last:border-b-0 hover:bg-gray-50 ${
                                  checked ? "bg-gray-50" : ""
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleTagLead(leadId)}
                                  className="h-3.5 w-3.5 rounded border-gray-300"
                                />

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate text-[11px] font-medium text-gray-700">
                                      {getLeadName(lead)}
                                    </p>
                                    {getLeadCompany(lead) && (
                                      <span className="truncate text-[9px] text-gray-400">
                                        {getLeadCompany(lead)}
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-0.5 flex flex-wrap gap-x-3">
                                    {getLeadPhone(lead) && (
                                      <span className="text-[9px] text-gray-400">
                                        {getLeadPhone(lead)}
                                      </span>
                                    )}
                                    {getLeadEmail(lead) && (
                                      <span className="truncate text-[9px] text-gray-400">
                                        {getLeadEmail(lead)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {checked && (
                                  <Check
                                    size={14}
                                    className="shrink-0 text-gray-700"
                                  />
                                )}
                              </label>
                            );
                          })
                        )}
                      </div>

                      {!loadingTagLeads && tagLeads.length > 0 && (
                        <div className="border-t border-gray-100 px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-gray-400">
                              Showing {tagLeads.length} of{" "}
                              {leadPagination.total}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              Page {leadPagination.page} of{" "}
                              {leadPagination.pages}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* MESSAGE */}
              <section className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h2 className="text-[13px] font-semibold text-gray-800">
                    Message
                  </h2>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Choose a template or edit the message content
                  </p>
                </div>

                <div className="space-y-4 p-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                      Template
                    </label>
                    <select
                      value={form.template}
                      onChange={(event) =>
                        handleTemplateChange(event.target.value)
                      }
                      disabled={loadingTemplates}
                      className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none focus:border-gray-400 disabled:bg-gray-50"
                    >
                      <option value="">
                        {loadingTemplates
                          ? "Loading templates..."
                          : "Select template"}
                      </option>

                      {templates
                        .filter((template) => {
                          const templateChannel = template?.channel;
                          return (
                            !templateChannel || templateChannel === form.channel
                          );
                        })
                        .map((template) => (
                          <option key={getId(template)} value={getId(template)}>
                            {getTemplateName(template)}
                          </option>
                        ))}
                    </select>
                  </div>

                  {form.channel === "whatsapp" && form.template && (
                    <div>{renderTemplatePreview()}</div>
                  )}

                  {requiresImage && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <ImageIcon size={14} className="text-gray-500" />
                            <p className="text-[11px] font-semibold text-gray-700">
                              Header Image
                            </p>
                          </div>
                          <p className="mt-1 text-[10px] text-gray-400">
                            This WhatsApp template requires an image header.
                          </p>
                        </div>

                        {whatsappMediaId && (
                          <span className="rounded-full bg-green-50 px-2 py-1 text-[9px] font-medium text-green-600">
                            Uploaded
                          </span>
                        )}
                      </div>

                      {selectedMedia ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-2">
                          <div className="flex items-center gap-3">
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                              {selectedMedia?.url ||
                              selectedMedia?.source_url ||
                              selectedMedia?.previewUrl ? (
                                <img
                                  src={
                                    selectedMedia?.url ||
                                    selectedMedia?.source_url ||
                                    selectedMedia?.previewUrl
                                  }
                                  alt="Selected media"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <ImageIcon
                                    size={22}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[11px] font-medium text-gray-700">
                                {selectedMedia?.name ||
                                  selectedMedia?.originalName ||
                                  selectedMedia?.filename ||
                                  "Selected image"}
                              </p>
                              <p className="mt-1 text-[9px] text-gray-400">
                                {selectedMedia?.mimeType ||
                                  selectedMedia?.mime_type ||
                                  selectedMedia?.type ||
                                  "Image"}
                              </p>
                              {whatsappMediaId && (
                                <p className="mt-1 truncate text-[9px] text-green-600">
                                  WhatsApp Media ID: {whatsappMediaId}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={removeSelectedMedia}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:text-red-500"
                            >
                              <X size={13} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleOpenMediaManager}
                            disabled={uploadingMedia || loading}
                            className="mt-2 flex h-8 w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white text-[10px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Paperclip size={13} />
                            Change Image
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleOpenMediaManager}
                          disabled={uploadingMedia || loading}
                          className="flex h-28 w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {uploadingMedia ? (
                            <>
                              <Loader2 size={20} className="animate-spin" />
                              <span className="mt-2 text-[10px]">
                                Uploading to WhatsApp...
                              </span>
                            </>
                          ) : (
                            <>
                              <ImageIcon size={22} className="text-gray-400" />
                              <span className="mt-2 text-[10px] font-medium">
                                Select Image
                              </span>
                              <span className="mt-0.5 text-[9px] text-gray-400">
                                Choose from Media Manager
                              </span>
                            </>
                          )}
                        </button>
                      )}

                      {mediaError && (
                        <div className="mt-2 rounded-md border border-red-100 bg-red-50 px-3 py-2">
                          <p className="text-[10px] text-red-600">
                            {mediaError}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {form.channel === "email" && (
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(event) =>
                          updateForm("subject", event.target.value)
                        }
                        placeholder="Email subject"
                        className="h-9 w-full rounded-md border border-gray-200 px-3 text-[12px] outline-none focus:border-gray-400"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                      Message
                    </label>
                    <textarea
                      value={form.body}
                      onChange={(event) =>
                        updateForm("body", event.target.value)
                      }
                      rows={7}
                      placeholder="Enter campaign message..."
                      className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-[12px] leading-5 outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
              </section>

              {/* SENDING */}
              <section className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h2 className="text-[13px] font-semibold text-gray-800">
                    Sending
                  </h2>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Choose when the campaign should run
                  </p>
                </div>

                <div className="space-y-4 p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateForm("sendType", "now")}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2.5 ${
                        form.sendType === "now"
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200"
                      }`}
                    >
                      <Send size={14} />
                      <div className="text-left">
                        <p className="text-[11px] font-medium">Send Now</p>
                        <p className="text-[9px] text-gray-400">
                          Start immediately
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateForm("sendType", "scheduled")}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2.5 ${
                        form.sendType === "scheduled"
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200"
                      }`}
                    >
                      <CalendarDays size={14} />
                      <div className="text-left">
                        <p className="text-[11px] font-medium">Schedule</p>
                        <p className="text-[9px] text-gray-400">
                          Send at a specific time
                        </p>
                      </div>
                    </button>
                  </div>

                  {form.sendType === "scheduled" && (
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                        Scheduled Date & Time
                        <span className="ml-1 text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        min={formatDateTimeLocal(new Date())}
                        value={form.scheduledAt}
                        onChange={(event) =>
                          updateForm("scheduledAt", event.target.value)
                        }
                        className="h-9 w-full rounded-md border border-gray-200 px-3 text-[12px] outline-none focus:border-gray-400"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                        Batch Size
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={form.batchSize}
                        onChange={(event) =>
                          updateForm("batchSize", event.target.value)
                        }
                        className="h-9 w-full rounded-md border border-gray-200 px-3 text-[12px] outline-none focus:border-gray-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                        Delay Between Batches (ms)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.delayBetweenBatches}
                        onChange={(event) =>
                          updateForm("delayBetweenBatches", event.target.value)
                        }
                        className="h-9 w-full rounded-md border border-gray-200 px-3 text-[12px] outline-none focus:border-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* NOTES */}
              <section className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h2 className="text-[13px] font-semibold text-gray-800">
                    Notes
                  </h2>
                </div>
                <div className="p-4">
                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      updateForm("notes", event.target.value)
                    }
                    rows={3}
                    placeholder="Optional internal notes..."
                    className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-gray-400"
                  />
                </div>
              </section>
            </div>

            {/* RIGHT SUMMARY */}
            <div className="lg:sticky lg:top-[74px] lg:h-fit">
              <section className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h2 className="text-[13px] font-semibold text-gray-800">
                    Campaign Summary
                  </h2>
                </div>

                <div className="space-y-4 p-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-gray-400">
                      Campaign
                    </p>
                    <p className="mt-1 break-words text-[12px] font-medium text-gray-700">
                      {form.name || "Untitled Campaign"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border border-gray-100 p-2.5">
                      <p className="text-[9px] text-gray-400">Channel</p>
                      <p className="mt-1 text-[11px] font-medium capitalize text-gray-700">
                        {form.channel}
                      </p>
                    </div>

                    <div className="rounded-md border border-gray-100 p-2.5">
                      <p className="text-[9px] text-gray-400">Audience</p>
                      <p className="mt-1 text-[11px] font-medium text-gray-700">
                        By Tag
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md border border-gray-100 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">
                        Selected Leads
                      </span>
                      <span className="text-[14px] font-semibold text-gray-800">
                        {selectedCount}
                      </span>
                    </div>
                    {form.tag && (
                      <p className="mt-1 text-[9px] text-gray-400">
                        Leads from selected tag
                      </p>
                    )}
                  </div>

                  {selectedTemplate && (
                    <div className="rounded-md border border-gray-100 p-3">
                      <p className="text-[9px] uppercase tracking-wide text-gray-400">
                        Template
                      </p>
                      <p className="mt-1 truncate text-[11px] font-medium text-gray-700">
                        {getTemplateName(selectedTemplate)}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[9px] text-gray-400">
                          Language
                        </span>
                        <span className="text-[9px] font-medium text-gray-600">
                          {getTemplateLanguage(selectedTemplate)}
                        </span>
                      </div>

                      {requiresImage && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[9px] text-gray-400">
                            Header Image
                          </span>
                          <span
                            className={`text-[9px] font-medium ${
                              whatsappMediaId
                                ? "text-green-600"
                                : "text-orange-500"
                            }`}
                          >
                            {whatsappMediaId ? "Selected" : "Required"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rounded-md border border-gray-100 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">
                        Send Type
                      </span>
                      <span className="text-[10px] font-medium capitalize text-gray-700">
                        {form.sendType === "scheduled" ? "Scheduled" : "Now"}
                      </span>
                    </div>

                    {form.sendType === "scheduled" && form.scheduledAt && (
                      <p className="mt-1 text-[9px] text-gray-400">
                        {new Date(form.scheduledAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {selectedVisibleLeads.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[10px] font-medium text-gray-600">
                          Selected Leads
                        </p>
                        <span className="text-[9px] text-gray-400">
                          {selectedVisibleLeads.length}
                        </span>
                      </div>

                      <div className="max-h-[250px] space-y-1 overflow-y-auto">
                        {selectedVisibleLeads.map((lead) => {
                          const leadId = getLeadId(lead);

                          return (
                            <div
                              key={leadId}
                              className="flex items-center gap-2 rounded-md border border-gray-100 px-2 py-1.5"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[10px] font-medium text-gray-700">
                                  {getLeadName(lead)}
                                </p>
                                <p className="truncate text-[9px] text-gray-400">
                                  {getLeadPhone(lead) || getLeadEmail(lead)}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeSelectedLead(leadId)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="rounded-md bg-gray-50 p-3">
                    <p className="text-[9px] leading-4 text-gray-500">
                      Search is performed on the server after selecting a tag.
                      Selected leads are retained while you edit the campaign.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </form>

      {/* MEDIA MANAGER */}
      {mediaOpen && (
        <MediaManager
          open={mediaOpen}
          onClose={() => setMediaOpen(false)}
          onSelect={handleMediaSelect}
        />
      )}
    </div>
  );
}
