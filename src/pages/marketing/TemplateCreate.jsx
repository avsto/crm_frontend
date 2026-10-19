import React, { useMemo, useState } from "react";

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
  Check,
  Phone,
  MousePointerClick,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import marketingTemplateApi from "../../api/marketingTemplate.api";
import MediaManager from "../../components/media/MediaManager";

// ==================================================
// CHANNELS
// ==================================================

const CHANNELS = [
  {
    value: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
  },
  {
    value: "email",
    label: "Email",
    icon: Mail,
  },
  {
    value: "sms",
    label: "SMS",
    icon: Smartphone,
  },
  {
    value: "notification",
    label: "Notification",
    icon: Bell,
  },
];

// ==================================================
// CATEGORIES
// ==================================================

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
    label: "Lead",
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

// ==================================================
// LANGUAGES
// ==================================================

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
];

// ==================================================
// BUTTON TYPES
// ==================================================

const BUTTON_TYPES = [
  {
    value: "QUICK_REPLY",
    label: "Quick Reply",
    description: "User sends a predefined reply",
    icon: MousePointerClick,
  },
  {
    value: "URL",
    label: "Visit Website",
    description: "Open a website URL",
    icon: LinkIcon,
  },
  {
    value: "PHONE_NUMBER",
    label: "Call Phone Number",
    description: "Call a phone number",
    icon: Phone,
  },
];

// ==================================================
// GET TEMPLATE MEDIA HANDLE
// ==================================================

const getTemplateMediaHandle = (media) => {
  if (!media) {
    return null;
  }

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

// ==================================================
// NORMALIZE MEDIA
// ==================================================

const normalizeMedia = (media) => {
  if (!media) {
    return null;
  }

  return {
    ...media,

    source_id: media?._id || media?.id || media?.source_id || null,

    source_path: media?.path || media?.source_path || null,

    source_url: media?.url || media?.source_url || null,

    name:
      media?.name ||
      media?.originalName ||
      media?.original_name ||
      "template-image",

    originalName:
      media?.originalName ||
      media?.original_name ||
      media?.name ||
      "template-image",

    mimeType: media?.mimeType || media?.mime_type || "image/png",

    size: media?.size || 0,

    whatsapp_template_handle: getTemplateMediaHandle(media),

    whatsappTemplateHandle: getTemplateMediaHandle(media),

    template_media_handle: getTemplateMediaHandle(media),

    header_handle: getTemplateMediaHandle(media),

    media_handle: getTemplateMediaHandle(media),

    handle: getTemplateMediaHandle(media),
  };
};

// ==================================================
// IMAGE PREVIEW URL
// ==================================================

const getMediaPreviewUrl = (media) => {
  if (!media) {
    return null;
  }

  return (
    media?.url ||
    media?.source_url ||
    media?.previewUrl ||
    media?.preview_url ||
    null
  );
};

// ==================================================
// COMPONENT
// ==================================================

export default function TemplateCreate() {
  const navigate = useNavigate();

  // ==================================================
  // BASIC FORM
  // ==================================================

  const [templateType, setTemplateType] = useState("whatsapp");

  const [name, setName] = useState("");

  const [subject, setSubject] = useState("");

  const [content, setContent] = useState("");

  const [category, setCategory] = useState("marketing");

  const [language, setLanguage] = useState("en_US");

  const [status, setStatus] = useState("draft");

  // ==================================================
  // MEDIA
  // ==================================================

  const [mediaOpen, setMediaOpen] = useState(false);

  const [image, setImage] = useState(null);

  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [mediaUploadError, setMediaUploadError] = useState("");

  const [mediaUploadSuccess, setMediaUploadSuccess] = useState(false);

  // ==================================================
  // BUTTONS
  // ==================================================

  const [buttons, setButtons] = useState([]);

  const [buttonModalOpen, setButtonModalOpen] = useState(false);

  const [buttonType, setButtonType] = useState("QUICK_REPLY");

  const [buttonText, setButtonText] = useState("");

  const [buttonUrl, setButtonUrl] = useState("");

  const [buttonPhone, setButtonPhone] = useState("");

  // ==================================================
  // PREVIEW
  // ==================================================

  const [previewOpen, setPreviewOpen] = useState(false);

  // ==================================================
  // SAVE
  // ==================================================

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  // ==================================================
  // VARIABLES
  // ==================================================

  const variables = useMemo(() => {
    const matches = content.match(/\{\{[^}]+\}\}/g);

    return matches || [];
  }, [content]);

  // ==================================================
  // TEMPLATE HANDLE
  // ==================================================

  const templateHandle = useMemo(() => {
    return getTemplateMediaHandle(image);
  }, [image]);

  // ==================================================
  // IMAGE PREVIEW
  // ==================================================

  const imagePreviewUrl = useMemo(() => {
    return getMediaPreviewUrl(image);
  }, [image]);

  // ==================================================
  // INSERT VARIABLE
  // ==================================================

  const insertVariable = () => {
    setContent((previous) => {
      const count = (previous.match(/\{\{(\d+)\}\}/g) || []).length + 1;

      const variable = `{{${count}}}`;

      return `${previous}${previous ? " " : ""}${variable}`;
    });
  };

  // ==================================================
  // SELECT MEDIA
  // ==================================================

  const handleMediaSelect = async (media) => {
    console.log("======================================");

    console.log("SELECTED MEDIA");

    console.log(media);

    console.log("======================================");

    if (!media) {
      return;
    }

    const normalizedMedia = normalizeMedia(media);

    // SHOW PREVIEW IMMEDIATELY

    setImage(normalizedMedia);

    setMediaOpen(false);

    setMediaUploadError("");

    setMediaUploadSuccess(false);

    // IF ALREADY HAS HANDLE

    const existingHandle = getTemplateMediaHandle(normalizedMedia);

    if (existingHandle) {
      console.log(
        "Image already has WhatsApp template handle:",
        existingHandle,
      );

      setMediaUploadSuccess(true);

      return;
    }

    // AUTO UPLOAD

    await uploadSelectedMediaToWhatsApp(normalizedMedia);
  };

  // ==================================================
  // UPLOAD IMAGE TO WHATSAPP
  // ==================================================

  const uploadSelectedMediaToWhatsApp = async (media = image) => {
    if (!media) {
      setMediaUploadError("Please select an image first.");

      return null;
    }

    const filePath = media?.source_path || media?.path || null;

    const fileUrl = media?.source_url || media?.url || null;

    if (!filePath && !fileUrl) {
      setMediaUploadError(
        "Selected image does not have a valid file path or URL.",
      );

      return null;
    }

    const payload = {
      mediaId: media?.source_id || media?._id || media?.id || null,

      filePath,

      fileUrl,

      fileName: media?.name || media?.originalName || "template-image",

      mimeType: media?.mimeType || media?.mime_type || "image/png",

      size: media?.size || 0,
    };

    console.log("======================================");

    console.log("UPLOAD WHATSAPP MEDIA PAYLOAD");

    console.log(payload);

    console.log("======================================");

    try {
      setUploadingMedia(true);

      setMediaUploadError("");

      setMediaUploadSuccess(false);

      const response =
        await marketingTemplateApi.uploadTemplateMediaToWhatsApp(payload);

      console.log("======================================");

      console.log("WHATSAPP MEDIA UPLOAD RESPONSE");

      console.log(response);

      console.log("======================================");

      const result = response?.data || response || {};

      const responseData = result?.data || result;

      const handle =
        responseData?.whatsapp_template_handle ||
        responseData?.whatsappTemplateHandle ||
        responseData?.template_media_handle ||
        responseData?.templateMediaHandle ||
        responseData?.header_handle ||
        responseData?.headerHandle ||
        responseData?.media_handle ||
        responseData?.mediaHandle ||
        responseData?.handle ||
        null;

      if (!handle) {
        throw new Error(
          "Meta upload completed, but no WhatsApp template media handle was returned.",
        );
      }

      console.log("META TEMPLATE HEADER HANDLE:", handle);

      setImage((previous) => ({
        ...(previous || media),

        whatsapp_template_handle: handle,

        whatsappTemplateHandle: handle,

        template_media_handle: handle,

        templateMediaHandle: handle,

        header_handle: handle,

        headerHandle: handle,

        media_handle: handle,

        mediaHandle: handle,

        handle,
      }));

      setMediaUploadSuccess(true);

      setMediaUploadError("");

      return handle;
    } catch (uploadError) {
      console.error("======================================");

      console.error("WHATSAPP MEDIA UPLOAD ERROR");

      console.error(uploadError?.response?.data || uploadError);

      console.error("======================================");

      const message =
        uploadError?.response?.data?.message ||
        uploadError?.response?.data?.error?.message ||
        uploadError?.message ||
        "Failed to upload image to WhatsApp.";

      setMediaUploadError(message);

      setMediaUploadSuccess(false);

      return null;
    } finally {
      setUploadingMedia(false);
    }
  };

  // ==================================================
  // MANUAL UPLOAD
  // ==================================================

  const handleManualWhatsAppUpload = async () => {
    if (!image) {
      setMediaUploadError("Please select an image first.");

      return;
    }

    await uploadSelectedMediaToWhatsApp(image);
  };

  // ==================================================
  // REMOVE IMAGE
  // ==================================================

  const removeImage = () => {
    setImage(null);

    setMediaUploadError("");

    setMediaUploadSuccess(false);
  };

  // ==================================================
  // CHANGE CHANNEL
  // ==================================================

  const handleTemplateTypeChange = (type) => {
    setTemplateType(type);

    setError("");

    setFieldErrors({});

    if (type !== "whatsapp") {
      setImage(null);

      setButtons([]);

      setMediaUploadError("");

      setMediaUploadSuccess(false);
    }
  };

  // ==================================================
  // BUTTON MODAL RESET
  // ==================================================

  const resetButtonForm = () => {
    setButtonType("QUICK_REPLY");

    setButtonText("");

    setButtonUrl("");

    setButtonPhone("");
  };

  // ==================================================
  // OPEN ADD BUTTON
  // ==================================================

  const openAddButton = () => {
    resetButtonForm();

    setButtonModalOpen(true);
  };

  // ==================================================
  // CLOSE BUTTON MODAL
  // ==================================================

  const closeButtonModal = () => {
    setButtonModalOpen(false);

    resetButtonForm();
  };

  // ==================================================
  // ADD BUTTON
  // ==================================================

  const handleAddButton = () => {
    const text = buttonText.trim();

    if (!text) {
      setError("Button text is required.");

      return;
    }

    if (buttons.length >= 3) {
      setError(
        "WhatsApp templates can have a maximum of 3 buttons in this builder.",
      );

      return;
    }

    if (buttonType === "URL" && !buttonUrl.trim()) {
      setError("Website URL is required.");

      return;
    }

    if (buttonType === "PHONE_NUMBER" && !buttonPhone.trim()) {
      setError("Phone number is required.");

      return;
    }

    const newButton = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,

      type: buttonType,

      text,

      url: buttonType === "URL" ? buttonUrl.trim() : "",

      phone_number: buttonType === "PHONE_NUMBER" ? buttonPhone.trim() : "",
    };

    setButtons((previous) => [...previous, newButton]);

    setError("");

    closeButtonModal();
  };

  // ==================================================
  // REMOVE BUTTON
  // ==================================================

  const removeButton = (id) => {
    setButtons((previous) => previous.filter((button) => button.id !== id));
  };

  // ==================================================
  // VALIDATION
  // ==================================================

  const validate = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Template name is required.";
    }

    if (!category) {
      errors.category = "Category is required.";
    }

    if (!language) {
      errors.language = "Language is required.";
    }

    if (!content.trim()) {
      errors.content = "Template content is required.";
    }

    // WHATSAPP IMAGE

    if (templateType === "whatsapp" && image) {
      const handle = getTemplateMediaHandle(image);

      if (!handle) {
        errors.image =
          "Please upload the image to WhatsApp before saving the template.";
      }
    }

    // BUTTON VALIDATION

    if (templateType === "whatsapp") {
      buttons.forEach((button, index) => {
        if (!button.text?.trim()) {
          errors.buttons = `Button ${index + 1} text is required.`;
        }

        if (button.type === "URL" && !button.url?.trim()) {
          errors.buttons = `Button ${index + 1} URL is required.`;
        }

        if (button.type === "PHONE_NUMBER" && !button.phone_number?.trim()) {
          errors.buttons = `Button ${index + 1} phone number is required.`;
        }
      });
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ==================================================
  // BUILD PAYLOAD
  // ==================================================

  const buildPayload = () => {
    const payload = {
      name: name.trim(),

      channel: templateType,

      subject: templateType === "email" ? subject.trim() : undefined,

      content: content.trim(),

      category,

      language,

      status,
    };

    // ==================================================
    // WHATSAPP
    // ==================================================

    if (templateType === "whatsapp") {
      const handle = getTemplateMediaHandle(image);

      payload.components = [];

      // ==================================================
      // HEADER
      // ==================================================

      if (image) {
        payload.components.push({
          type: "HEADER",

          format: "IMAGE",

          example: {
            header_handle: [handle],
          },
        });
      }

      // ==================================================
      // BODY
      // ==================================================

      payload.components.push({
        type: "BODY",

        text: content.trim(),

        ...(variables.length > 0
          ? {
              example: {
                body_text: [variables.map(() => "Example")],
              },
            }
          : {}),
      });

      // ==================================================
      // BUTTONS
      // ==================================================

      if (buttons.length > 0) {
        payload.components.push({
          type: "BUTTONS",

          buttons: buttons.map((button) => {
            if (button.type === "URL") {
              return {
                type: "URL",

                text: button.text,

                url: button.url,
              };
            }

            if (button.type === "PHONE_NUMBER") {
              return {
                type: "PHONE_NUMBER",

                text: button.text,

                phone_number: button.phone_number,
              };
            }

            return {
              type: "QUICK_REPLY",

              text: button.text,
            };
          }),
        });
      }

      // ==================================================
      // REMOVE UNDEFINED
      // ==================================================

      if (!payload.subject) {
        delete payload.subject;
      }
    }

    return payload;
  };

  // ==================================================
  // SAVE TEMPLATE
  // ==================================================

  const handleSave = async () => {
    setError("");

    setFieldErrors({});

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload();

      console.log("======================================");

      console.log("CREATE TEMPLATE PAYLOAD");

      console.log(JSON.stringify(payload, null, 2));

      console.log("======================================");

      await marketingTemplateApi.createTemplate(payload);

      navigate("/marketing/templates");
    } catch (saveError) {
      console.error(
        "CREATE TEMPLATE ERROR:",
        saveError?.response?.data || saveError,
      );

      const message =
        saveError?.response?.data?.message ||
        saveError?.message ||
        "Failed to create template.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // PREVIEW
  // ==================================================

  const renderPreview = () => {
    // ==================================================
    // WHATSAPP
    // ==================================================

    if (templateType === "whatsapp") {
      return (
        <div className="w-full max-w-sm mx-auto">
          <div className="bg-[#efeae2] rounded-2xl overflow-hidden shadow-xl">
            {/* HEADER */}

            <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={20} />
              </div>

              <div>
                <div className="font-semibold text-sm">WhatsApp</div>

                <div className="text-xs text-white/70">Business</div>
              </div>
            </div>

            {/* MESSAGE */}

            <div className="p-4 min-h-[430px] flex items-end">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-[90%] w-full">
                {/* IMAGE */}

                {imagePreviewUrl && (
                  <img
                    src={imagePreviewUrl}
                    alt="Template"
                    className="w-full max-h-64 object-cover"
                  />
                )}

                {/* BODY */}

                <div className="p-3">
                  {content ? (
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Your message preview will appear here.
                    </p>
                  )}

                  {/* TIME */}

                  <div className="text-[10px] text-gray-400 text-right mt-2">
                    10:30 AM
                  </div>
                </div>

                {/* BUTTONS */}

                {buttons.length > 0 && (
                  <div className="border-t border-gray-100">
                    {buttons.map((button) => (
                      <div
                        key={button.id}
                        className="flex items-center justify-center gap-2 px-3 py-3 border-b last:border-b-0 text-sm font-medium text-[#128c7e]"
                      >
                        {button.type === "URL" && <LinkIcon size={15} />}

                        {button.type === "PHONE_NUMBER" && <Phone size={15} />}

                        {button.type === "QUICK_REPLY" && (
                          <MousePointerClick size={15} />
                        )}

                        {button.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ==================================================
    // EMAIL
    // ==================================================

    if (templateType === "email") {
      return (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="border-b px-5 py-4">
            <div className="text-xs text-gray-500 mb-1">Subject</div>

            <div className="font-semibold text-gray-900">
              {subject || "Your email subject"}
            </div>
          </div>

          <div className="p-5">
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt="Template"
                className="w-full max-h-64 object-cover rounded-lg mb-4"
              />
            )}

            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {content || "Your email content will appear here."}
            </p>
          </div>
        </div>
      );
    }

    // ==================================================
    // SMS
    // ==================================================

    if (templateType === "sms") {
      return (
        <div className="bg-gray-100 rounded-2xl p-5">
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm max-w-[85%]">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {content || "Your SMS content will appear here."}
            </p>
          </div>
        </div>
      );
    }

    // ==================================================
    // NOTIFICATION
    // ==================================================

    return (
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Bell size={20} />
          </div>

          <div>
            <div className="font-semibold text-gray-900">
              {name || "Notification"}
            </div>

            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
              {content || "Your notification content will appear here."}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="sticky top-0 z-30 bg-white border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50"
              >
                <ArrowLeft size={19} />
              </button>

              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Create Template
                </h1>

                <p className="text-sm text-gray-500">
                  Create a new marketing template
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                <Eye size={17} />
                Preview
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}

                {saving ? "Saving..." : "Save Template"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="px-4 sm:px-6 lg:px-8 pt-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />

              <div className="text-sm">{error}</div>

              <button
                type="button"
                onClick={() => setError("")}
                className="ml-auto"
              >
                <X size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-6">
          {/* ==================================================
              LEFT FORM
          ================================================== */}

          <div className="space-y-6">
            {/* ==================================================
                CHANNEL
            ================================================== */}

            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-5 py-4 border-b">
                <h2 className="font-semibold text-gray-900">Channel</h2>

                <p className="text-sm text-gray-500 mt-1">
                  Select where this template will be used.
                </p>
              </div>

              <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                {CHANNELS.map(({ value, label, icon: Icon }) => {
                  const selected = templateType === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleTemplateTypeChange(value)}
                      className={`p-4 rounded-xl border text-left transition ${
                        selected
                          ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <Icon size={21} className="mb-3" />

                      <div className="font-medium text-sm">{label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ==================================================
                BASIC INFORMATION
            ================================================== */}

            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-5 py-4 border-b">
                <h2 className="font-semibold text-gray-900">
                  Basic Information
                </h2>
              </div>

              <div className="p-5 space-y-5">
                {/* NAME */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. welcome_message"
                    className={`w-full px-3.5 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-gray-900/10 ${
                      fieldErrors.name ? "border-red-400" : "border-gray-300"
                    }`}
                  />

                  {fieldErrors.name && (
                    <p className="text-xs text-red-600 mt-1.5">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* CATEGORY + LANGUAGE */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>

                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-gray-900/10"
                    >
                      {CATEGORIES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>

                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-gray-900/10"
                    >
                      {LANGUAGES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* STATUS */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full md:w-1/2 px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-gray-900/10"
                  >
                    <option value="draft">Draft</option>

                    <option value="active">Active</option>

                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ==================================================
                EMAIL SUBJECT
            ================================================== */}

            {templateType === "email" && (
              <div className="bg-white rounded-xl border shadow-sm">
                <div className="px-5 py-4 border-b">
                  <h2 className="font-semibold text-gray-900">Email Subject</h2>
                </div>

                <div className="p-5">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
              </div>
            )}

            {/* ==================================================
                WHATSAPP MEDIA
            ================================================== */}

            {templateType === "whatsapp" && (
              <div className="bg-white rounded-xl border shadow-sm">
                <div className="px-5 py-4 border-b flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Header Image
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Select an image and it will automatically upload to
                      WhatsApp.
                    </p>
                  </div>

                  {templateHandle && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-full">
                      <CheckCircle2 size={14} />
                      Uploaded
                    </div>
                  )}
                </div>

                <div className="p-5">
                  {!image ? (
                    <button
                      type="button"
                      onClick={() => setMediaOpen(true)}
                      className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-gray-500 hover:bg-gray-50 transition"
                    >
                      <div className="w-12 h-12 mx-auto rounded-xl bg-gray-100 flex items-center justify-center">
                        <ImageIcon size={23} className="text-gray-600" />
                      </div>

                      <div className="mt-3 font-medium text-gray-900">
                        Select Image
                      </div>

                      <div className="text-sm text-gray-500 mt-1">
                        Choose an image from Media Manager
                      </div>
                    </button>
                  ) : (
                    <div className="border rounded-xl overflow-hidden">
                      {/* IMAGE */}

                      <div className="relative bg-gray-100">
                        {imagePreviewUrl ? (
                          <img
                            src={imagePreviewUrl}
                            alt={image?.name || "Selected media"}
                            className="w-full max-h-[420px] object-contain"
                          />
                        ) : (
                          <div className="h-60 flex items-center justify-center text-gray-400">
                            No preview available
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-white shadow-md flex items-center justify-center text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      {/* MEDIA INFO */}

                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <ImageIcon size={19} className="text-gray-600" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {image?.name ||
                                image?.originalName ||
                                "Selected image"}
                            </div>

                            <div className="text-xs text-gray-500 mt-1">
                              {image?.mimeType || "image"}
                            </div>
                          </div>
                        </div>

                        {/* UPLOADING */}

                        {uploadingMedia && (
                          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
                            <Loader2 size={17} className="animate-spin" />

                            <span className="text-sm">
                              Uploading image to WhatsApp...
                            </span>
                          </div>
                        )}

                        {/* SUCCESS */}

                        {!uploadingMedia &&
                          templateHandle &&
                          mediaUploadSuccess && (
                            <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
                              <div className="flex items-start gap-2">
                                <CheckCircle2
                                  size={18}
                                  className="text-green-600 mt-0.5"
                                />

                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-green-800">
                                    Image uploaded to WhatsApp
                                  </div>

                                  <div className="text-xs text-green-700 mt-1 break-all">
                                    Template media handle:
                                    {templateHandle}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* ERROR */}

                        {mediaUploadError && (
                          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                            <div className="flex items-start gap-2">
                              <AlertCircle
                                size={18}
                                className="text-red-600 mt-0.5 shrink-0"
                              />

                              <div className="flex-1">
                                <div className="text-sm font-medium text-red-800">
                                  Upload failed
                                </div>

                                <div className="text-xs text-red-700 mt-1">
                                  {mediaUploadError}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* UPLOAD */}

                        {!templateHandle && !uploadingMedia && (
                          <button
                            type="button"
                            onClick={handleManualWhatsAppUpload}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                          >
                            {mediaUploadError ? (
                              <RefreshCw size={17} />
                            ) : (
                              <Upload size={17} />
                            )}

                            {mediaUploadError
                              ? "Retry Upload to WhatsApp"
                              : "Upload to WhatsApp"}
                          </button>
                        )}

                        {/* CHANGE IMAGE */}

                        <button
                          type="button"
                          onClick={() => setMediaOpen(true)}
                          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
                        >
                          <RefreshCw size={16} />
                          Change Image
                        </button>
                      </div>
                    </div>
                  )}

                  {fieldErrors.image && (
                    <div className="mt-3 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle size={16} />

                      {fieldErrors.image}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================================================
                MESSAGE CONTENT
            ================================================== */}

            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Message Content
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Write the message users will receive.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={insertVariable}
                  className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  <Variable size={16} />
                  Add Variable
                </button>
              </div>

              <div className="p-5">
                <textarea
                  rows={9}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={"Hello {{1}},\n\nThank you for contacting us."}
                  className={`w-full px-4 py-3 rounded-xl border resize-y outline-none focus:ring-2 focus:ring-gray-900/10 ${
                    fieldErrors.content ? "border-red-400" : "border-gray-300"
                  }`}
                />

                {fieldErrors.content && (
                  <p className="text-xs text-red-600 mt-1.5">
                    {fieldErrors.content}
                  </p>
                )}

                {/* VARIABLES */}

                {variables.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Variables
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {variables.map((variable, index) => (
                        <span
                          key={`${variable}-${index}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium"
                        >
                          <Variable size={13} />

                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ==================================================
                WHATSAPP BUTTONS
            ================================================== */}

            {templateType === "whatsapp" && (
              <div className="bg-white rounded-xl border shadow-sm">
                <div className="px-5 py-4 border-b flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Template Buttons
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Add quick replies, website links or phone call buttons.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openAddButton}
                    disabled={buttons.length >= 3}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                    Add Button
                  </button>
                </div>

                <div className="p-5">
                  {buttons.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                      <div className="w-11 h-11 mx-auto rounded-xl bg-gray-100 flex items-center justify-center">
                        <MousePointerClick
                          size={20}
                          className="text-gray-500"
                        />
                      </div>

                      <div className="mt-3 text-sm font-medium text-gray-900">
                        No buttons added
                      </div>

                      <div className="text-xs text-gray-500 mt-1">
                        Add a button to make your template interactive.
                      </div>

                      <button
                        type="button"
                        onClick={openAddButton}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        <Plus size={15} />
                        Add Button
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {buttons.map((button, index) => (
                        <div
                          key={button.id}
                          className="flex items-start gap-3 p-4 border rounded-xl"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            {button.type === "URL" ? (
                              <LinkIcon size={18} />
                            ) : button.type === "PHONE_NUMBER" ? (
                              <Phone size={18} />
                            ) : (
                              <MousePointerClick size={18} />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500">
                                Button {index + 1}
                              </span>

                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {button.type}
                              </span>
                            </div>

                            <div className="font-medium text-sm text-gray-900 mt-1">
                              {button.text}
                            </div>

                            {button.type === "URL" && (
                              <div className="text-xs text-gray-500 mt-1 break-all">
                                {button.url}
                              </div>
                            )}

                            {button.type === "PHONE_NUMBER" && (
                              <div className="text-xs text-gray-500 mt-1">
                                {button.phone_number}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeButton(button.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {fieldErrors.buttons && (
                    <div className="mt-3 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle size={16} />

                      {fieldErrors.buttons}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MOBILE PREVIEW */}

            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="xl:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border rounded-xl font-medium"
            >
              <Eye size={18} />
              Preview Template
            </button>
          </div>

          {/* ==================================================
              DESKTOP PREVIEW
          ================================================== */}

          <div className="hidden xl:block">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl border shadow-sm">
                <div className="px-5 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900">Preview</h2>

                      <p className="text-sm text-gray-500 mt-1">
                        See how your template will look.
                      </p>
                    </div>

                    <Eye size={19} className="text-gray-400" />
                  </div>
                </div>

                <div className="p-5">{renderPreview()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          MEDIA MANAGER
      ================================================== */}

      {mediaOpen && (
        <MediaManager
          open={mediaOpen}
          onClose={() => setMediaOpen(false)}
          onSelect={handleMediaSelect}
        />
      )}

      {/* ==================================================
          ADD BUTTON MODAL
      ================================================== */}

      {buttonModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            {/* MODAL HEADER */}

            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Add Template Button
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Choose the type of button you want to add.
                </p>
              </div>

              <button
                type="button"
                onClick={closeButtonModal}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={19} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="p-5 space-y-5">
              {/* BUTTON TYPE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Type
                </label>

                <div className="grid grid-cols-1 gap-2">
                  {BUTTON_TYPES.map(
                    ({ value, label, description, icon: Icon }) => {
                      const selected = buttonType === value;

                      return (
                        <button
                          type="button"
                          key={value}
                          onClick={() => setButtonType(value)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left ${
                            selected
                              ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Icon size={17} />
                          </div>

                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              {label}
                            </div>

                            <div className="text-xs text-gray-500 mt-0.5">
                              {description}
                            </div>
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* BUTTON TEXT */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>

                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  maxLength={25}
                  placeholder={
                    buttonType === "QUICK_REPLY"
                      ? "e.g. Yes, I'm interested"
                      : buttonType === "URL"
                        ? "e.g. Visit Website"
                        : "e.g. Call Us"
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-gray-900/10"
                />

                <div className="text-xs text-gray-400 text-right mt-1">
                  {buttonText.length}
                  /25
                </div>
              </div>

              {/* URL */}

              {buttonType === "URL" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>

                  <div className="relative">
                    <LinkIcon
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={buttonUrl}
                      onChange={(e) => setButtonUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-1.5">
                    You can use a dynamic variable like <code>{"{{1}}"}</code>.
                  </p>
                </div>
              )}

              {/* PHONE */}

              {buttonType === "PHONE_NUMBER" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={buttonPhone}
                      onChange={(e) => setButtonPhone(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-1.5">
                    Include the country code.
                  </p>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}

            <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeButtonModal}
                className="px-4 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddButton}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                <Plus size={16} />
                Add Button
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          PREVIEW MODAL
      ================================================== */}

      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Template Preview
                </h2>

                <p className="text-sm text-gray-500">
                  {name || "Untitled Template"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">{renderPreview()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
