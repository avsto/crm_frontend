import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Save,
  Eye,
  Mail,
  MessageCircle,
  Smartphone,
  Bell,
  Variable,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Upload,
  Phone,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import marketingTemplateApi from "../../api/marketingTemplate.api";
import MediaManager from "../../components/media/MediaManager";

const TEMPLATE_TYPES = [
  {
    id: "whatsapp",
    channel: "whatsapp",
    label: "WhatsApp",
    description: "WhatsApp message template",
    icon: MessageCircle,
  },
  {
    id: "email",
    channel: "email",
    label: "Email",
    description: "Email marketing template",
    icon: Mail,
  },
  {
    id: "sms",
    channel: "sms",
    label: "SMS",
    description: "Short message template",
    icon: Smartphone,
  },
  {
    id: "notification",
    channel: "notification",
    label: "Notification",
    description: "CRM notification",
    icon: Bell,
  },
];

const VARIABLES = [
  {
    key: "{{name}}",
    label: "Customer Name",
  },
  {
    key: "{{phone}}",
    label: "Phone",
  },
  {
    key: "{{email}}",
    label: "Email",
  },
  {
    key: "{{companyName}}",
    label: "Company Name",
  },
  {
    key: "{{productName}}",
    label: "Product Name",
  },
  {
    key: "{{businessName}}",
    label: "Business Name",
  },
  {
    key: "{{orderNumber}}",
    label: "Order Number",
  },
];

const CATEGORIES = [
  {
    value: "marketing",
    label: "Marketing",
  },
  {
    value: "transactional",
    label: "Transactional",
  },
  {
    value: "lead",
    label: "Lead Management",
  },
  {
    value: "sales",
    label: "Sales",
  },
  {
    value: "order",
    label: "Order",
  },
  {
    value: "customer",
    label: "Customer",
  },
];

const LANGUAGES = [
  {
    value: "en_US",
    label: "English (US)",
  },
  {
    value: "en_GB",
    label: "English (UK)",
  },
  {
    value: "hi",
    label: "Hindi",
  },
  {
    value: "en",
    label: "English",
  },
  {
    value: "hinglish",
    label: "Hinglish",
  },
];

const STATUSES = [
  {
    value: "active",
    label: "Active",
  },
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "inactive",
    label: "Inactive",
  },
];

const BUTTON_TYPES = [
  {
    value: "QUICK_REPLY",
    label: "Quick Reply",
    description: "Customer can send a predefined reply.",
  },
  {
    value: "URL",
    label: "Visit Website",
    description: "Open a website URL.",
  },
  {
    value: "PHONE_NUMBER",
    label: "Call Phone Number",
    description: "Call a phone number.",
  },
];

const PREVIEW_VALUES = {
  "{{name}}": "Rahul",
  "{{phone}}": "+91 98765 43210",
  "{{email}}": "rahul@example.com",
  "{{companyName}}": "ABC Enterprises",
  "{{productName}}": "Premium Product",
  "{{businessName}}": "Brielix",
  "{{orderNumber}}": "#ORD-1024",
};

const createButton = (type = "QUICK_REPLY") => ({
  id: `${Date.now()}-${Math.random()}`,
  type,
  text: "",
  url: "",
  urlExample: "",
  phone_number: "",
});

const TemplateEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [templateType, setTemplateType] = useState("whatsapp");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("marketing");
  const [language, setLanguage] = useState("en_US");
  const [status, setStatus] = useState("draft");

  // ---------------------------------------------------
  // MEDIA
  // ---------------------------------------------------

  const [mediaOpen, setMediaOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaUploadError, setMediaUploadError] = useState("");
  const [mediaUploadSuccess, setMediaUploadSuccess] = useState("");

  // ---------------------------------------------------
  // BUTTONS
  // ---------------------------------------------------

  const [buttons, setButtons] = useState([]);

  // ---------------------------------------------------
  // PREVIEW
  // ---------------------------------------------------

  const [previewOpen, setPreviewOpen] = useState(false);

  // ---------------------------------------------------
  // ERRORS
  // ---------------------------------------------------

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // =====================================================
  // SELECTED TYPE
  // =====================================================

  const selectedType = useMemo(() => {
    return (
      TEMPLATE_TYPES.find((item) => item.id === templateType) ||
      TEMPLATE_TYPES[0]
    );
  }, [templateType]);

  // =====================================================
  // API ERROR
  // =====================================================

  const getApiError = (err, fallback = "Something went wrong") => {
    const responseData = err?.response?.data;

    if (responseData?.errors) {
      const firstError = Object.values(responseData.errors)
        .flat()
        ?.find(Boolean);

      if (firstError) {
        return firstError;
      }
    }

    return (
      responseData?.message || responseData?.error || err?.message || fallback
    );
  };

  // =====================================================
  // MEDIA HANDLE
  // =====================================================

  const getTemplateMediaHandle = (media) => {
    return (
      media?.whatsapp_template_handle ||
      media?.whatsappTemplateHandle ||
      media?.template_media_handle ||
      media?.templateMediaHandle ||
      media?.header_handle ||
      media?.headerHandle ||
      media?.media_handle ||
      media?.mediaHandle ||
      media?.handle ||
      null
    );
  };

  // =====================================================
  // NORMALIZE MEDIA
  // =====================================================

  const normalizeMedia = (media) => {
    if (!media) return null;

    return {
      ...media,

      source_id: media?.source_id || media?._id || media?.id || null,

      source_path: media?.source_path || media?.path || null,

      source_url: media?.source_url || media?.url || null,

      name: media?.name || media?.originalName || "template-image",

      originalName: media?.originalName || media?.name || "template-image",

      mimeType: media?.mimeType || media?.mime_type || "image/png",

      size: media?.size || 0,

      whatsapp_template_handle: getTemplateMediaHandle(media),
    };
  };

  // =====================================================
  // MEDIA PREVIEW URL
  // =====================================================

  const getMediaPreviewUrl = (media) => {
    if (!media) return "";

    return (
      media?.source_url ||
      media?.url ||
      media?.previewUrl ||
      media?.preview_url ||
      ""
    );
  };

  // =====================================================
  // LOAD TEMPLATE
  // =====================================================

  useEffect(() => {
    if (!id) {
      setError("Template ID is missing");
      setLoading(false);
      return;
    }

    loadTemplate();
  }, [id]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await marketingTemplateApi.getTemplate(id);

      console.log("GET TEMPLATE RESPONSE:", response);

      const template = response?.data?.data || response?.data || response;

      if (!template) {
        throw new Error("Template data was not returned by server");
      }

      // ---------------------------------------------------
      // CHANNEL
      // ---------------------------------------------------

      const channel = String(template.channel || "whatsapp")
        .trim()
        .toLowerCase();

      const supportedChannel = TEMPLATE_TYPES.some(
        (item) => item.id === channel,
      );

      setTemplateType(supportedChannel ? channel : "whatsapp");

      // ---------------------------------------------------
      // BASIC DATA
      // ---------------------------------------------------

      const backendType = template.category || template.type || "marketing";

      const validCategory = CATEGORIES.some(
        (item) => item.value === backendType,
      );

      setCategory(validCategory ? backendType : "marketing");

      setName(template.name || "");
      setSubject(template.subject || "");
      setContent(template.content || "");

      const templateLanguage =
        template.language || template?.whatsapp?.language || "en_US";

      setLanguage(templateLanguage);

      setStatus(
        template.status &&
          STATUSES.some((item) => item.value === template.status)
          ? template.status
          : "draft",
      );

      // ===================================================
      // WHATSAPP DATA
      // ===================================================

      const whatsapp = template?.whatsapp;

      if (whatsapp) {
        const components = Array.isArray(whatsapp.components)
          ? whatsapp.components
          : [];

        // -------------------------------------------------
        // HEADER
        // -------------------------------------------------

        const header = components.find(
          (component) => component?.type === "HEADER",
        );

        if (header && String(header.format || "").toUpperCase() === "IMAGE") {
          const headerHandle = header?.example?.header_handle?.[0] || null;

          /*
           * Important:
           * Meta header_handle is NOT the media-library _id.
           */

          const loadedImage = normalizeMedia({
            whatsapp_template_handle: headerHandle,

            template_media_handle: headerHandle,

            header_handle: headerHandle,

            handle: headerHandle,

            // If backend later stores these fields,
            // they will also be used.
            source_url:
              header?.example?.header_url || header?.example?.url || null,

            source_path: header?.example?.source_path || null,

            name: header?.example?.file_name || "WhatsApp Header Image",
          });

          setImage(loadedImage);
        } else {
          setImage(null);
        }

        // -------------------------------------------------
        // BODY
        // -------------------------------------------------

        const body = components.find((component) => component?.type === "BODY");

        if (body?.text !== undefined) {
          setContent(body.text || "");
        }

        // -------------------------------------------------
        // BUTTONS
        // -------------------------------------------------

        const buttonsComponent = components.find(
          (component) => component?.type === "BUTTONS",
        );

        if (buttonsComponent && Array.isArray(buttonsComponent.buttons)) {
          const loadedButtons = buttonsComponent.buttons.map(
            (button, index) => ({
              id: button?.id || `existing-${index}-${Date.now()}`,

              type: button?.type || "QUICK_REPLY",

              text: button?.text || "",

              url: button?.url || "",

              urlExample: Array.isArray(button?.example)
                ? button.example[0] || ""
                : button?.example?.[0] || button?.url_example || "",

              phone_number: button?.phone_number || "",
            }),
          );

          setButtons(loadedButtons);
        } else {
          setButtons([]);
        }
      }
    } catch (err) {
      console.error("Load marketing template error:", err);

      setError(getApiError(err, "Unable to load marketing template"));
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHANGE TYPE
  // =====================================================

  const handleTemplateTypeChange = (type) => {
    setTemplateType(type);

    if (type !== "email") {
      setSubject("");
    }

    if (type !== "whatsapp") {
      setImage(null);
      setButtons([]);
    }

    setError("");
    setFieldErrors({});
  };

  // =====================================================
  // PREVIEW TEXT
  // =====================================================

  const previewText = useMemo(() => {
    let value = content || "";

    Object.entries(PREVIEW_VALUES).forEach(([variable, replacement]) => {
      value = value.split(variable).join(replacement);
    });

    return value;
  }, [content]);

  // =====================================================
  // VARIABLE COUNT
  // =====================================================

  const variableCount = useMemo(() => {
    const matches = content.match(/\{\{[^}]+\}\}/g);

    return matches ? matches.length : 0;
  }, [content]);

  // =====================================================
  // INSERT VARIABLE
  // =====================================================

  const insertVariable = (variable) => {
    setContent((prev) => `${prev}${variable}`);

    if (fieldErrors.content) {
      setFieldErrors((prev) => ({
        ...prev,
        content: "",
      }));
    }
  };

  // =====================================================
  // INSERT IMAGE
  // =====================================================

  const insertImage = () => {
    setContent((prev) => `${prev}\n\n[Image URL]\n`);
  };

  // =====================================================
  // INSERT LINK
  // =====================================================

  const insertLink = () => {
    setContent((prev) => `${prev}\n\n[Click Here](https://example.com)\n`);
  };

  // =====================================================
  // MEDIA SELECT
  // =====================================================

  const handleMediaSelect = async (media) => {
    console.log("SELECTED MEDIA:", media);

    const normalized = normalizeMedia(media);

    if (!normalized) {
      return;
    }

    setImage(normalized);
    setMediaOpen(false);

    setMediaUploadError("");
    setMediaUploadSuccess("");

    const existingHandle = getTemplateMediaHandle(normalized);

    // -----------------------------------------------
    // Already uploaded to WhatsApp
    // -----------------------------------------------

    if (existingHandle) {
      setImage((prev) => ({
        ...prev,
        whatsapp_template_handle: existingHandle,

        template_media_handle: existingHandle,

        header_handle: existingHandle,
      }));

      setMediaUploadSuccess("Image is already ready for WhatsApp.");

      return;
    }

    // -----------------------------------------------
    // Upload selected media to WhatsApp
    // -----------------------------------------------

    await uploadSelectedMediaToWhatsApp(normalized);
  };

  // =====================================================
  // UPLOAD MEDIA TO WHATSAPP
  // =====================================================

  const uploadSelectedMediaToWhatsApp = async (mediaToUpload = image) => {
    if (!mediaToUpload) {
      return;
    }

    const payload = {
      mediaId:
        mediaToUpload?.source_id ||
        mediaToUpload?._id ||
        mediaToUpload?.id ||
        null,

      filePath: mediaToUpload?.source_path || mediaToUpload?.path || null,

      fileUrl: mediaToUpload?.source_url || mediaToUpload?.url || null,

      fileName:
        mediaToUpload?.name || mediaToUpload?.originalName || "template-image",

      mimeType:
        mediaToUpload?.mimeType || mediaToUpload?.mime_type || "image/png",

      size: mediaToUpload?.size || 0,
    };

    console.log("UPLOAD MEDIA TO WHATSAPP PAYLOAD:", payload);

    if (!payload.filePath && !payload.fileUrl) {
      setMediaUploadError("Selected media does not have a file path or URL.");

      return;
    }

    try {
      setUploadingMedia(true);
      setMediaUploadError("");
      setMediaUploadSuccess("");

      const response =
        await marketingTemplateApi.uploadMediaToWhatsApp(payload);

      console.log("UPLOAD MEDIA RESPONSE:", response);

      const data = response?.data?.data || response?.data || response;

      const templateHandle =
        getTemplateMediaHandle(data) ||
        getTemplateMediaHandle(data?.media) ||
        getTemplateMediaHandle(data?.result);

      if (!templateHandle) {
        throw new Error(
          "WhatsApp template media handle was not returned by server.",
        );
      }

      setImage((prev) => ({
        ...(prev || mediaToUpload),

        whatsapp_template_handle: templateHandle,

        whatsappTemplateHandle: templateHandle,

        template_media_handle: templateHandle,

        templateMediaHandle: templateHandle,

        header_handle: templateHandle,

        headerHandle: templateHandle,

        media_handle: templateHandle,

        mediaHandle: templateHandle,

        handle: templateHandle,
      }));

      setMediaUploadSuccess("Image uploaded to WhatsApp successfully.");
    } catch (err) {
      console.error("WhatsApp template media upload error:", err);

      setMediaUploadError(
        getApiError(err, "Unable to upload image to WhatsApp"),
      );
    } finally {
      setUploadingMedia(false);
    }
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const handleRemoveImage = () => {
    setImage(null);
    setMediaUploadError("");
    setMediaUploadSuccess("");
  };

  // =====================================================
  // BUTTONS
  // =====================================================

  const addButton = () => {
    setButtons((prev) => [...prev, createButton("QUICK_REPLY")]);

    setFieldErrors((prev) => ({
      ...prev,
      buttons: "",
    }));
  };

  const removeButton = (buttonId) => {
    setButtons((prev) => prev.filter((button) => button.id !== buttonId));
  };

  const updateButton = (buttonId, field, value) => {
    setButtons((prev) =>
      prev.map((button) =>
        button.id === buttonId
          ? {
              ...button,
              [field]: value,
            }
          : button,
      ),
    );

    if (fieldErrors.buttons) {
      setFieldErrors((prev) => ({
        ...prev,
        buttons: "",
      }));
    }
  };

  const changeButtonType = (buttonId, type) => {
    setButtons((prev) =>
      prev.map((button) => {
        if (button.id !== buttonId) {
          return button;
        }

        return {
          ...button,
          type,
          url: type === "URL" ? button.url || "" : "",
          urlExample: type === "URL" ? button.urlExample || "" : "",
          phone_number:
            type === "PHONE_NUMBER" ? button.phone_number || "" : "",
        };
      }),
    );
  };

  // =====================================================
  // VALIDATE BUTTONS
  // =====================================================

  const validateButtons = () => {
    if (templateType !== "whatsapp" || buttons.length === 0) {
      return true;
    }

    for (let index = 0; index < buttons.length; index++) {
      const button = buttons[index];

      if (!button.text?.trim()) {
        setFieldErrors((prev) => ({
          ...prev,
          buttons: `Button ${index + 1} text is required.`,
        }));

        return false;
      }

      if (button.type === "URL") {
        const url = button.url?.trim() || "";

        if (!url) {
          setFieldErrors((prev) => ({
            ...prev,
            buttons: `Button ${index + 1} URL is required.`,
          }));

          return false;
        }

        const hasVariable = /\{\{[^}]+\}\}/.test(url);

        if (!hasVariable) {
          if (!/^https?:\/\/.+/i.test(url)) {
            setFieldErrors((prev) => ({
              ...prev,
              buttons: `Button ${
                index + 1
              } must contain a valid http:// or https:// URL.`,
            }));

            return false;
          }
        } else {
          if (!button.urlExample?.trim()) {
            setFieldErrors((prev) => ({
              ...prev,
              buttons: `Button ${
                index + 1
              } URL example is required for dynamic URLs.`,
            }));

            return false;
          }
        }
      }

      if (button.type === "PHONE_NUMBER") {
        if (!button.phone_number?.trim()) {
          setFieldErrors((prev) => ({
            ...prev,
            buttons: `Button ${index + 1} phone number is required.`,
          }));

          return false;
        }
      }
    }

    return true;
  };

  // =====================================================
  // VALIDATE
  // =====================================================

  const validate = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Template name is required";
    }

    if (!content.trim()) {
      errors.content = "Template content is required";
    }

    if (templateType === "email" && !subject.trim()) {
      errors.subject = "Email subject is required";
    }

    // -----------------------------------------------
    // WhatsApp image
    // -----------------------------------------------

    if (templateType === "whatsapp" && image) {
      const handle = getTemplateMediaHandle(image);

      if (!handle) {
        errors.image = "Please upload this image to WhatsApp before saving.";
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return false;
    }

    if (!validateButtons()) {
      return false;
    }

    return true;
  };

  // =====================================================
  // BUILD WHATSAPP COMPONENTS
  // =====================================================

  const buildWhatsAppComponents = () => {
    const components = [];

    // ---------------------------------------------------
    // HEADER IMAGE
    // ---------------------------------------------------

    if (image) {
      const templateHandle = getTemplateMediaHandle(image);

      if (templateHandle) {
        components.push({
          type: "HEADER",
          format: "IMAGE",
          text: "",
          example: {
            header_handle: [templateHandle],
          },
        });
      }
    }

    // ---------------------------------------------------
    // BODY
    // ---------------------------------------------------

    const bodyVariables = content.match(/\{\{[^}]+\}\}/g) || [];

    const bodyComponent = {
      type: "BODY",
      text: content.trim(),
    };

    if (bodyVariables.length > 0) {
      bodyComponent.example = {
        body_text: [bodyVariables.map(() => "Example")],
      };
    }

    components.push(bodyComponent);

    // ---------------------------------------------------
    // BUTTONS
    // ---------------------------------------------------

    if (buttons.length > 0) {
      const formattedButtons = buttons.map((button) => {
        const formatted = {
          type: button.type,
          text: button.text?.trim() || "",
        };

        if (button.type === "URL") {
          formatted.url = button.url?.trim() || "";

          const hasVariable = /\{\{[^}]+\}\}/.test(formatted.url);

          if (hasVariable && button.urlExample?.trim()) {
            formatted.example = [button.urlExample.trim()];
          }
        }

        if (button.type === "PHONE_NUMBER") {
          formatted.phone_number = button.phone_number?.trim() || "";
        }

        return formatted;
      });

      components.push({
        type: "BUTTONS",
        buttons: formattedButtons,
      });
    }

    return components;
  };

  // =====================================================
  // UPDATE TEMPLATE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!validate()) {
      return;
    }

    const whatsappComponents =
      templateType === "whatsapp" ? buildWhatsAppComponents() : [];

    const payload = {
      name: name.trim(),

      type: category,

      channel: selectedType.channel,

      category,

      language,

      subject: templateType === "email" ? subject.trim() : "",

      content: content.trim(),

      status,

      variables: content.match(/\{\{[^}]+\}\}/g) || [],

      htmlContent: "",

      whatsapp:
        templateType === "whatsapp"
          ? {
              name: name.trim(),

              language,

              category: category.toUpperCase(),

              components: whatsappComponents,
            }
          : {},

      email: {},

      sms: {},

      notification: {},

      media:
        templateType === "whatsapp" && image
          ? {
              source_id: image?.source_id || null,

              source_path: image?.source_path || null,

              source_url: image?.source_url || null,

              name: image?.name || null,

              mimeType: image?.mimeType || null,

              whatsapp_template_handle: getTemplateMediaHandle(image),
            }
          : {},

      buttons:
        templateType === "whatsapp"
          ? buttons.map((button) => ({
              type: button.type,
              text: button.text?.trim() || "",

              ...(button.type === "URL"
                ? {
                    url: button.url?.trim() || "",

                    ...(button.urlExample?.trim()
                      ? {
                          urlExample: button.urlExample.trim(),
                        }
                      : {}),
                  }
                : {}),

              ...(button.type === "PHONE_NUMBER"
                ? {
                    phone_number: button.phone_number?.trim() || "",
                  }
                : {}),
            }))
          : [],
    };

    console.log("UPDATE TEMPLATE PAYLOAD:", payload);

    try {
      setSaving(true);

      const response = await marketingTemplateApi.updateTemplate(id, payload);

      console.log("UPDATE TEMPLATE RESPONSE:", response);

      navigate("/marketing/templates");
    } catch (err) {
      console.error("Update marketing template error:", err);

      setError(getApiError(err, "Unable to update template"));
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    if (saving) return;

    navigate("/marketing/templates");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 size={20} className="animate-spin text-blue-600" />

          <span className="text-sm text-gray-600">Loading template...</span>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1500px] p-4 sm:p-6">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="
                mt-1 flex h-9 w-9 shrink-0
                items-center justify-center rounded-lg
                border border-gray-200 bg-white
                text-gray-500 transition
                hover:bg-gray-50 hover:text-gray-900
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Edit Template
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Update your marketing template.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="
                inline-flex items-center gap-2
                rounded-lg border border-gray-200
                bg-white px-4 py-2.5
                text-sm font-medium text-gray-700
                transition hover:bg-gray-50
              "
            >
              <Eye size={17} />
              Preview
            </button>

            <button
              type="submit"
              form="template-form"
              disabled={saving}
              className="
                inline-flex items-center gap-2
                rounded-lg bg-blue-600
                px-4 py-2.5 text-sm
                font-medium text-white
                transition hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-800">
                Unable to process template
              </p>

              <p className="mt-0.5 text-sm text-red-700">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <form
          id="template-form"
          onSubmit={handleSubmit}
          className="
            grid grid-cols-1 gap-5
            xl:grid-cols-[minmax(0,1fr)_360px]
          "
        >
          <div className="space-y-5">
            {/* =================================================
                TEMPLATE TYPE
            ================================================= */}

            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-900">
                  Template Type
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Select where this template will be used.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {TEMPLATE_TYPES.map((type) => {
                  const Icon = type.icon;

                  const active = templateType === type.id;

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleTemplateTypeChange(type.id)}
                      className={`
                          relative rounded-xl
                          border p-4 text-left transition
                          ${
                            active
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }
                        `}
                    >
                      {active && (
                        <CheckCircle2
                          size={17}
                          className="
                              absolute right-3 top-3
                              text-blue-600
                            "
                        />
                      )}

                      <div
                        className={`
                            mb-3 flex h-10 w-10
                            items-center justify-center
                            rounded-lg
                            ${
                              active
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-500"
                            }
                          `}
                      >
                        <Icon size={19} />
                      </div>

                      <p className="text-sm font-semibold text-gray-900">
                        {type.label}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-gray-900">
                  Basic Information
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Configure the basic information of your template.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Template Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);

                      if (fieldErrors.name) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          name: "",
                        }));
                      }
                    }}
                    placeholder="e.g. New Lead Welcome"
                    className={`
                      h-11 w-full rounded-lg
                      border px-3 text-sm
                      outline-none transition
                      ${
                        fieldErrors.name
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      }
                    `}
                  />

                  {fieldErrors.name && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* CATEGORY */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Category / Type
                  </label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="
                      h-11 w-full rounded-lg
                      border border-gray-200
                      bg-white px-3 text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LANGUAGE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Language
                  </label>

                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="
                      h-11 w-full rounded-lg
                      border border-gray-200
                      bg-white px-3 text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  >
                    {LANGUAGES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* STATUS */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="
                      h-11 w-full rounded-lg
                      border border-gray-200
                      bg-white px-3 text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  >
                    {STATUSES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* =================================================
                WHATSAPP IMAGE
            ================================================= */}

            {templateType === "whatsapp" && (
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      WhatsApp Header Image
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Select an image and upload it to WhatsApp for this
                      template.
                    </p>
                  </div>

                  <ImageIcon size={19} className="text-gray-400" />
                </div>

                {image ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      {/* IMAGE */}

                      <div className="relative h-32 w-full overflow-hidden rounded-lg border border-gray-200 bg-white sm:w-40">
                        {getMediaPreviewUrl(image) ? (
                          <img
                            src={getMediaPreviewUrl(image)}
                            alt={image?.name || "WhatsApp header"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400">
                            Image preview unavailable
                          </div>
                        )}
                      </div>

                      {/* INFO */}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {image?.name ||
                            image?.originalName ||
                            "Selected image"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {image?.mimeType || "Image"}
                        </p>

                        {/* HANDLE */}

                        <div className="mt-3">
                          {getTemplateMediaHandle(image) ? (
                            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                              <CheckCircle2
                                size={15}
                                className="shrink-0 text-green-600"
                              />

                              <span className="text-xs font-medium text-green-700">
                                Ready for WhatsApp
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2">
                              <AlertCircle
                                size={15}
                                className="shrink-0 text-yellow-600"
                              />

                              <span className="text-xs font-medium text-yellow-700">
                                Image needs WhatsApp upload
                              </span>
                            </div>
                          )}
                        </div>

                        {/* ACTIONS */}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {/* CHANGE IMAGE */}

                          <button
                            type="button"
                            onClick={() => setMediaOpen(true)}
                            disabled={uploadingMedia}
                            className="
                              inline-flex items-center
                              gap-2 rounded-lg
                              border border-gray-200
                              bg-white px-3 py-2
                              text-xs font-medium
                              text-gray-700
                              hover:bg-gray-100
                              disabled:opacity-50
                            "
                          >
                            <RefreshCw size={14} />
                            Change Image
                          </button>

                          {/* UPLOAD */}

                          {!getTemplateMediaHandle(image) && (
                            <button
                              type="button"
                              onClick={() =>
                                uploadSelectedMediaToWhatsApp(image)
                              }
                              disabled={uploadingMedia}
                              className="
                                inline-flex items-center
                                gap-2 rounded-lg
                                bg-blue-600 px-3 py-2
                                text-xs font-medium
                                text-white
                                hover:bg-blue-700
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                              "
                            >
                              {uploadingMedia ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Upload size={14} />
                              )}

                              {uploadingMedia
                                ? "Uploading..."
                                : "Upload to WhatsApp"}
                            </button>
                          )}

                          {/* REMOVE */}

                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={uploadingMedia}
                            className="
                              inline-flex items-center
                              gap-2 rounded-lg
                              border border-red-200
                              bg-white px-3 py-2
                              text-xs font-medium
                              text-red-600
                              hover:bg-red-50
                              disabled:opacity-50
                            "
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* UPLOAD ERROR */}

                    {mediaUploadError && (
                      <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                        <AlertCircle
                          size={15}
                          className="mt-0.5 shrink-0 text-red-600"
                        />

                        <p className="text-xs text-red-700">
                          {mediaUploadError}
                        </p>
                      </div>
                    )}

                    {/* SUCCESS */}

                    {mediaUploadSuccess && (
                      <div className="mt-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                        <CheckCircle2
                          size={15}
                          className="mt-0.5 shrink-0 text-green-600"
                        />

                        <p className="text-xs text-green-700">
                          {mediaUploadSuccess}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMediaOpen(true)}
                    className="
                      flex w-full flex-col
                      items-center justify-center
                      rounded-xl border-2
                      border-dashed border-gray-200
                      bg-gray-50 px-6 py-10
                      text-center transition
                      hover:border-blue-300
                      hover:bg-blue-50
                    "
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                      <ImageIcon size={22} className="text-gray-500" />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-gray-800">
                      Select Header Image
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Choose an image from your media library.
                    </p>

                    <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white">
                      <Plus size={14} />
                      Choose Image
                    </span>
                  </button>
                )}

                {fieldErrors.image && (
                  <p className="mt-2 text-xs text-red-600">
                    {fieldErrors.image}
                  </p>
                )}
              </section>
            )}

            {/* =================================================
                EMAIL SUBJECT
            ================================================= */}

            {templateType === "email" && (
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Subject
                </label>

                <input
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);

                    if (fieldErrors.subject) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        subject: "",
                      }));
                    }
                  }}
                  placeholder="e.g. Welcome to {{businessName}}"
                  className={`
                    h-11 w-full rounded-lg
                    border px-3 text-sm
                    outline-none transition
                    ${
                      fieldErrors.subject
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    }
                  `}
                />

                {fieldErrors.subject && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {fieldErrors.subject}
                  </p>
                )}
              </section>
            )}

            {/* =================================================
                CONTENT
            ================================================= */}

            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Template Content
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Write the message that will be sent to customers.
                  </p>
                </div>

                <span className="shrink-0 text-xs text-gray-400">
                  {content.length} characters
                </span>
              </div>

              <div
                className={`
                  overflow-hidden rounded-xl border
                  ${fieldErrors.content ? "border-red-300" : "border-gray-200"}
                `}
              >
                {/* TOOLBAR */}

                <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
                  <button
                    type="button"
                    onClick={() => insertVariable("{{name}}")}
                    className="
                      inline-flex items-center
                      gap-1.5 rounded-lg
                      px-2.5 py-2
                      text-xs font-medium
                      text-gray-600
                      hover:bg-white
                    "
                  >
                    <Variable size={14} />
                    Variable
                  </button>

                  <button
                    type="button"
                    onClick={insertImage}
                    className="
                      inline-flex items-center
                      gap-1.5 rounded-lg
                      px-2.5 py-2
                      text-xs font-medium
                      text-gray-600
                      hover:bg-white
                    "
                  >
                    <ImageIcon size={14} />
                    Image
                  </button>

                  <button
                    type="button"
                    onClick={insertLink}
                    className="
                      inline-flex items-center
                      gap-1.5 rounded-lg
                      px-2.5 py-2
                      text-xs font-medium
                      text-gray-600
                      hover:bg-white
                    "
                  >
                    <LinkIcon size={14} />
                    Link
                  </button>
                </div>

                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);

                    if (fieldErrors.content) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        content: "",
                      }));
                    }
                  }}
                  rows={12}
                  placeholder="Write your template..."
                  className="
                    block w-full resize-y
                    border-0 px-4 py-4
                    text-sm leading-6
                    text-gray-800
                    outline-none
                    focus:ring-0
                  "
                />
              </div>

              {fieldErrors.content && (
                <p className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.content}
                </p>
              )}

              {/* VARIABLES */}

              <div className="mt-4">
                <div className="mb-2 flex items-center gap-2">
                  <Variable size={15} className="text-blue-600" />

                  <span className="text-xs font-semibold text-gray-700">
                    Available Variables
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {VARIABLES.map((variable) => (
                    <button
                      key={variable.key}
                      type="button"
                      onClick={() => insertVariable(variable.key)}
                      title={variable.label}
                      className="
                          inline-flex items-center
                          gap-1 rounded-lg
                          border border-gray-200
                          bg-gray-50 px-2.5 py-1.5
                          font-mono text-xs
                          text-gray-600
                          transition
                          hover:border-blue-300
                          hover:bg-blue-50
                          hover:text-blue-700
                        "
                    >
                      <Plus size={12} />

                      {variable.key}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* =================================================
                WHATSAPP BUTTONS
            ================================================= */}

            {templateType === "whatsapp" && (
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      WhatsApp Buttons
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Add quick replies, website links, or phone call buttons.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addButton}
                    className="
                      inline-flex items-center gap-2
                      rounded-lg bg-blue-600
                      px-3 py-2
                      text-xs font-medium
                      text-white
                      hover:bg-blue-700
                    "
                  >
                    <Plus size={14} />
                    Add Button
                  </button>
                </div>

                {fieldErrors.buttons && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                    <AlertCircle
                      size={15}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <p className="text-xs text-red-700">
                      {fieldErrors.buttons}
                    </p>
                  </div>
                )}

                {buttons.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                      <Plus size={18} className="text-gray-400" />
                    </div>

                    <p className="mt-3 text-sm font-medium text-gray-700">
                      No buttons added
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Add a button to your WhatsApp template.
                    </p>

                    <button
                      type="button"
                      onClick={addButton}
                      className="
                        mt-4 inline-flex
                        items-center gap-2
                        rounded-lg border
                        border-gray-200
                        bg-white px-3 py-2
                        text-xs font-medium
                        text-gray-700
                        hover:bg-gray-100
                      "
                    >
                      <Plus size={14} />
                      Add Button
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {buttons.map((button, index) => (
                      <div
                        key={button.id}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              Button {index + 1}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                              {
                                BUTTON_TYPES.find(
                                  (item) => item.value === button.type,
                                )?.label
                              }
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeButton(button.id)}
                            className="
                                flex h-8 w-8
                                items-center justify-center
                                rounded-lg
                                text-gray-400
                                hover:bg-red-50
                                hover:text-red-600
                              "
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {/* TYPE */}

                          <div>
                            <label className="mb-2 block text-xs font-medium text-gray-700">
                              Button Type
                            </label>

                            <select
                              value={button.type}
                              onChange={(e) =>
                                changeButtonType(button.id, e.target.value)
                              }
                              className="
                                  h-10 w-full
                                  rounded-lg
                                  border
                                  border-gray-200
                                  bg-white
                                  px-3 text-sm
                                  outline-none
                                  focus:border-blue-500
                                  focus:ring-2
                                  focus:ring-blue-100
                                "
                            >
                              {BUTTON_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* TEXT */}

                          <div>
                            <label className="mb-2 block text-xs font-medium text-gray-700">
                              Button Text
                            </label>

                            <input
                              type="text"
                              value={button.text}
                              onChange={(e) =>
                                updateButton(button.id, "text", e.target.value)
                              }
                              placeholder={
                                button.type === "QUICK_REPLY"
                                  ? "e.g. Get Started"
                                  : button.type === "URL"
                                    ? "e.g. Visit Website"
                                    : "e.g. Call Us"
                              }
                              className="
                                  h-10 w-full
                                  rounded-lg
                                  border
                                  border-gray-200
                                  bg-white
                                  px-3 text-sm
                                  outline-none
                                  focus:border-blue-500
                                  focus:ring-2
                                  focus:ring-blue-100
                                "
                            />
                          </div>

                          {/* URL */}

                          {button.type === "URL" && (
                            <>
                              <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-medium text-gray-700">
                                  Website URL
                                </label>

                                <input
                                  type="text"
                                  value={button.url}
                                  onChange={(e) =>
                                    updateButton(
                                      button.id,
                                      "url",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="https://example.com"
                                  className="
                                      h-10 w-full
                                      rounded-lg
                                      border
                                      border-gray-200
                                      bg-white
                                      px-3 text-sm
                                      outline-none
                                      focus:border-blue-500
                                      focus:ring-2
                                      focus:ring-blue-100
                                    "
                                />
                              </div>

                              {/\{\{[^}]+\}\}/.test(button.url || "") && (
                                <div className="md:col-span-2">
                                  <label className="mb-2 block text-xs font-medium text-gray-700">
                                    URL Example
                                  </label>

                                  <input
                                    type="text"
                                    value={button.urlExample}
                                    onChange={(e) =>
                                      updateButton(
                                        button.id,
                                        "urlExample",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="https://example.com/product/123"
                                    className="
                                        h-10 w-full
                                        rounded-lg
                                        border
                                        border-gray-200
                                        bg-white
                                        px-3 text-sm
                                        outline-none
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-100
                                      "
                                  />

                                  <p className="mt-1.5 text-[11px] text-gray-500">
                                    Required when the URL contains a dynamic
                                    variable.
                                  </p>
                                </div>
                              )}
                            </>
                          )}

                          {/* PHONE */}

                          {button.type === "PHONE_NUMBER" && (
                            <div className="md:col-span-2">
                              <label className="mb-2 block text-xs font-medium text-gray-700">
                                Phone Number
                              </label>

                              <div className="relative">
                                <Phone
                                  size={15}
                                  className="
                                      absolute left-3
                                      top-1/2
                                      -translate-y-1/2
                                      text-gray-400
                                    "
                                />

                                <input
                                  type="text"
                                  value={button.phone_number}
                                  onChange={(e) =>
                                    updateButton(
                                      button.id,
                                      "phone_number",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="+919876543210"
                                  className="
                                      h-10 w-full
                                      rounded-lg
                                      border
                                      border-gray-200
                                      bg-white
                                      pl-9 pr-3
                                      text-sm
                                      outline-none
                                      focus:border-blue-500
                                      focus:ring-2
                                      focus:ring-blue-100
                                    "
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="flex items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="
                  rounded-lg border border-gray-200
                  px-4 py-2.5 text-sm font-medium
                  text-gray-700 hover:bg-gray-50
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="
                  inline-flex items-center gap-2
                  rounded-lg bg-blue-600
                  px-5 py-2.5 text-sm
                  font-medium text-white
                  hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {saving ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-5">
            {/* =================================================
                LIVE PREVIEW
            ================================================= */}

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Live Preview
                  </h3>

                  <p className="text-xs text-gray-400">Preview your template</p>
                </div>

                <Eye size={17} className="text-gray-400" />
              </div>

              <div className="bg-gray-100 p-4">
                {/* WHATSAPP */}

                {templateType === "whatsapp" ? (
                  <div className="mx-auto max-w-[300px]">
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                      {/* IMAGE */}

                      {image && getMediaPreviewUrl(image) && (
                        <img
                          src={getMediaPreviewUrl(image)}
                          alt="WhatsApp header"
                          className="h-40 w-full object-cover"
                        />
                      )}

                      <div className="p-3">
                        <div className="mb-2 flex items-center gap-2 border-b border-gray-100 pb-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
                            <MessageCircle
                              size={15}
                              className="text-green-600"
                            />
                          </div>

                          <span className="text-xs font-semibold text-gray-700">
                            {name || "WhatsApp Template"}
                          </span>
                        </div>

                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                          {previewText ||
                            "Your message preview will appear here."}
                        </p>

                        {/* BUTTONS */}

                        {buttons.length > 0 && (
                          <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
                            {buttons.map((button) => (
                              <div
                                key={button.id}
                                className="
                                    flex items-center
                                    justify-center
                                    gap-2
                                    border-t
                                    border-gray-100
                                    px-3 py-2.5
                                    text-xs
                                    font-medium
                                    text-blue-600
                                    first:border-t-0
                                  "
                              >
                                {button.type === "PHONE_NUMBER" && (
                                  <Phone size={13} />
                                )}

                                {button.type === "URL" && (
                                  <LinkIcon size={13} />
                                )}

                                {button.type === "QUICK_REPLY" && (
                                  <MessageCircle size={13} />
                                )}

                                {button.text || "Button"}
                              </div>
                            ))}
                          </div>
                        )}

                        <p className="mt-2 text-right text-[10px] text-gray-400">
                          10:42 AM
                        </p>
                      </div>
                    </div>
                  </div>
                ) : templateType === "email" ? (
                  <div className="mx-auto max-w-[330px] overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="border-b border-gray-100 p-4">
                      <p className="text-xs text-gray-400">Subject</p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {subject || "Email subject"}
                      </p>
                    </div>

                    <div className="whitespace-pre-wrap p-4 text-sm leading-6 text-gray-700">
                      {previewText || "Your email preview will appear here."}
                    </div>
                  </div>
                ) : templateType === "sms" ? (
                  <div className="mx-auto max-w-[300px] rounded-xl bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <Smartphone size={17} className="text-blue-600" />

                      <span className="text-xs font-semibold text-gray-700">
                        SMS
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                      {previewText || "Your SMS preview will appear here."}
                    </p>
                  </div>
                ) : (
                  <div className="mx-auto max-w-[300px] rounded-xl bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <Bell size={17} className="text-blue-600" />

                      <span className="text-xs font-semibold text-gray-700">
                        {name || "Notification"}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                      {previewText ||
                        "Your notification preview will appear here."}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                DETAILS
            ================================================= */}

            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-900">
                Template Details
              </h3>

              <div className="mt-4 space-y-4">
                <DetailRow label="Type" value={category} />

                <DetailRow label="Channel" value={selectedType.channel} />

                <DetailRow label="Language" value={language} />

                <DetailRow label="Status" value={status} />

                <DetailRow label="Characters" value={content.length} />

                <DetailRow label="Variables" value={variableCount} />

                {templateType === "whatsapp" && (
                  <>
                    <DetailRow label="Buttons" value={buttons.length} />

                    <DetailRow
                      label="Header Image"
                      value={image ? "Yes" : "No"}
                    />
                  </>
                )}
              </div>
            </section>

            {/* =================================================
                TIPS
            ================================================= */}

            <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
              <h3 className="text-sm font-semibold text-blue-900">
                Template Tips
              </h3>

              <ul className="mt-3 space-y-2 text-xs leading-5 text-blue-800">
                <li>• Keep your message short and easy to understand.</li>

                <li>• Use variables for personalized messages.</li>

                <li>• Verify your WhatsApp image before saving.</li>

                <li>• Use Quick Reply buttons for simple actions.</li>

                <li>• Use URL buttons for website actions.</li>

                <li>• Always verify dynamic variables before publishing.</li>
              </ul>
            </section>
          </aside>
        </form>
      </div>

      {/* =====================================================
          MEDIA MANAGER
      ===================================================== */}

      {mediaOpen && (
        <MediaManager
          open={mediaOpen}
          onClose={() => setMediaOpen(false)}
          onSelect={handleMediaSelect}
        />
      )}

      {/* =====================================================
          PREVIEW MODAL
      ===================================================== */}

      {previewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div
            className="absolute inset-0"
            onClick={() => setPreviewOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Template Preview
                </h3>

                <p className="mt-0.5 text-xs text-gray-400">
                  {name || "Untitled Template"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="
                  flex h-8 w-8
                  items-center justify-center
                  rounded-lg text-gray-500
                  hover:bg-gray-100
                "
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-100 p-6">
              {templateType === "whatsapp" ? (
                <div className="mx-auto max-w-[330px] overflow-hidden rounded-xl bg-white shadow-sm">
                  {/* IMAGE */}

                  {image && getMediaPreviewUrl(image) && (
                    <img
                      src={getMediaPreviewUrl(image)}
                      alt="WhatsApp header"
                      className="h-44 w-full object-cover"
                    />
                  )}

                  <div className="p-5">
                    <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                        <MessageCircle size={18} className="text-green-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {name || "WhatsApp Template"}
                        </p>

                        <p className="text-xs text-gray-400">WhatsApp</p>
                      </div>
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                      {previewText || "No content yet."}
                    </p>

                    {/* BUTTONS */}

                    {buttons.length > 0 && (
                      <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
                        {buttons.map((button) => (
                          <div
                            key={button.id}
                            className="
                                flex items-center
                                justify-center
                                gap-2
                                border-t
                                border-gray-100
                                px-3 py-3
                                text-xs
                                font-medium
                                text-blue-600
                                first:border-t-0
                              "
                          >
                            {button.type === "PHONE_NUMBER" && (
                              <Phone size={14} />
                            )}

                            {button.type === "URL" && <LinkIcon size={14} />}

                            {button.type === "QUICK_REPLY" && (
                              <MessageCircle size={14} />
                            )}

                            {button.text || "Button"}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : templateType === "email" ? (
                <div className="mx-auto max-w-[400px] overflow-hidden rounded-xl bg-white shadow-sm">
                  <div className="border-b border-gray-100 p-5">
                    <p className="text-xs text-gray-400">Subject</p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {subject || "Email Subject"}
                    </p>
                  </div>

                  <div className="whitespace-pre-wrap break-words p-5 text-sm leading-6 text-gray-700">
                    {previewText || "No content yet."}
                  </div>
                </div>
              ) : templateType === "sms" ? (
                <div className="mx-auto max-w-[330px] rounded-xl bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <Smartphone size={18} className="text-blue-600" />

                    <span className="text-sm font-semibold text-gray-900">
                      SMS Preview
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                    {previewText || "No content yet."}
                  </p>
                </div>
              ) : (
                <div className="mx-auto max-w-[330px] rounded-xl bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <Bell size={18} className="text-blue-600" />

                    <span className="text-sm font-semibold text-gray-900">
                      {name || "Notification"}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                    {previewText || "No content yet."}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="
                  rounded-lg bg-blue-600
                  px-4 py-2 text-sm
                  font-medium text-white
                  hover:bg-blue-700
                "
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================
// DETAIL ROW
// =====================================================

const DetailRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-500">{label}</span>

      <span className="max-w-[180px] truncate text-right text-xs font-medium capitalize text-gray-800">
        {value !== undefined && value !== null && value !== ""
          ? String(value)
          : "-"}
      </span>
    </div>
  );
};

export default TemplateEdit;
