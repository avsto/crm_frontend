import React, { useEffect, useState } from "react";

import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Webhook,
  Globe,
  Save,
  Loader2,
  Users,
  Tag,
  Package,
} from "lucide-react";

import formApi from "../../api/form.api";
import teamApi from "../../api/team.api";
import crmApi from "../../api/crm.api";
import productApi from "../../api/product.api.js";

const LEAD_SOURCES = [
  { value: "website", label: "Website" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "google", label: "Google" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "referral", label: "Referral" },
  { value: "manual", label: "Manual" },
  { value: "import", label: "Import" },
  { value: "campaign", label: "Campaign" },
  { value: "api", label: "API" },
  { value: "other", label: "Other" },
];

const LEAD_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "follow_up", label: "Follow Up" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "junk", label: "Junk" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const FORM_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
  { value: "url", label: "URL" },
];

const EMBED_MODES = [
  { value: "iframe", label: "Iframe Only" },
  { value: "javascript", label: "JavaScript Only" },
  { value: "both", label: "Iframe + JavaScript" },
];

const FormEdit = () => {
  const formId = window.location.pathname.split("/")[2];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(null);

  const [teamMembers, setTeamMembers] = useState([]);
  const [tags, setTags] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingTeam, setLoadingTeam] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [newField, setNewField] = useState({
    key: "",
    label: "",
    type: "text",
    required: false,
    placeholder: "",
    options: [],
  });

  const [domain, setDomain] = useState("");

  // ==================================================
  // FETCH FORM
  // ==================================================

  const fetchForm = async () => {
    try {
      setLoading(true);

      const response = await formApi.getForm(formId);

      if (response?.success) {
        const data = response.data || {};

        setForm({
          ...data,

          fields: {
            name: {
              enabled: true,
              required: true,
              label: "Name",
              placeholder: "Enter your name",
              ...(data.fields?.name || {}),
            },

            phone: {
              enabled: true,
              required: true,
              label: "Phone",
              placeholder: "Enter phone number",
              ...(data.fields?.phone || {}),
            },

            email: {
              enabled: true,
              required: false,
              label: "Email",
              placeholder: "Enter email address",
              ...(data.fields?.email || {}),
            },

            companyName: {
              enabled: false,
              required: false,
              label: "Company Name",
              placeholder: "Enter company name",
              ...(data.fields?.companyName || {}),
            },

            subject: {
              enabled: false,
              required: false,
              label: "Subject",
              placeholder: "Enter subject",
              ...(data.fields?.subject || {}),
            },

            message: {
              enabled: false,
              required: false,
              label: "Message",
              placeholder: "Enter your message",
              ...(data.fields?.message || {}),
            },
          },

          customFields: Array.isArray(data.customFields)
            ? data.customFields
            : [],

          leadConfig: {
            source: "website",
            status: "new",
            priority: "medium",
            assignedTo: null,
            tag: null,
            product: null,
            ...(data.leadConfig || {}),
          },

          webhook: {
            enabled: false,
            url: "",
            secret: "",
            ...(data.webhook || {}),
          },

          settings: {
            successMessage: "Thank you! We will contact you shortly.",
            redirectUrl: "",
            duplicateCheck: true,
            captchaEnabled: false,
            ...(data.settings || {}),
          },

          embed: {
            mode: "both",
            allowedDomains: [],
            ...(data.embed || {}),
          },
        });
      } else {
        alert(response?.message || "Form not found");
        window.location.href = "/forms";
      }
    } catch (error) {
      console.error("Fetch form error:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load form",
      );

      window.location.href = "/forms";
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD TEAM
  // ==================================================

  const loadTeamMembers = async () => {
    try {
      setLoadingTeam(true);

      const response = await teamApi.getTeamMembers();

      const list =
        response?.data?.members ||
        response?.data?.data ||
        response?.members ||
        response?.data ||
        [];

      setTeamMembers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Load team members error:", error);
      setTeamMembers([]);
    } finally {
      setLoadingTeam(false);
    }
  };

  // ==================================================
  // LOAD TAGS
  // ==================================================

  const loadTags = async () => {
    try {
      setLoadingTags(true);

      const response = await crmApi.getTags();

      const list =
        response?.data?.data ||
        response?.data?.tags ||
        response?.tags ||
        response?.data ||
        [];

      setTags(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Load tags error:", error);
      setTags([]);
    } finally {
      setLoadingTags(false);
    }
  };

  // ==================================================
  // LOAD PRODUCTS
  // ==================================================

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);

      const response = await productApi.getProducts({
        params: {
          page: 1,
          limit: 100,
        },
      });

      const list =
        response?.data?.data ||
        response?.data?.products ||
        response?.products ||
        response?.data ||
        [];

      setProducts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Load products error:", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // ==================================================
  // INIT
  // ==================================================

  useEffect(() => {
    if (!formId) {
      window.location.href = "/forms";
      return;
    }

    fetchForm();
    loadTeamMembers();
    loadTags();
    loadProducts();
  }, [formId]);

  // ==================================================
  // BASIC UPDATE
  // ==================================================

  const updateBasic = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ==================================================
  // STANDARD FIELD UPDATE
  // ==================================================

  const updateField = (key, property, value) => {
    setForm((prev) => ({
      ...prev,

      fields: {
        ...(prev.fields || {}),

        [key]: {
          ...(prev.fields?.[key] || {}),
          [property]: value,
        },
      },
    }));
  };

  // ==================================================
  // LEAD CONFIG UPDATE
  // ==================================================

  const updateLeadConfig = (key, value) => {
    setForm((prev) => ({
      ...prev,

      leadConfig: {
        ...(prev.leadConfig || {}),
        [key]: value,
      },
    }));
  };

  // ==================================================
  // CUSTOM FIELD UPDATE
  // ==================================================

  const updateCustomField = (index, key, value) => {
    setForm((prev) => ({
      ...prev,

      customFields: (prev.customFields || []).map((field, i) =>
        i === index
          ? {
              ...field,
              [key]: value,
            }
          : field,
      ),
    }));
  };

  // ==================================================
  // CUSTOM FIELD OPTIONS
  // ==================================================

  const updateCustomFieldOptions = (index, value) => {
    const options = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    updateCustomField(index, "options", options);
  };

  const updateNewFieldOptions = (value) => {
    const options = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setNewField((prev) => ({
      ...prev,
      options,
    }));
  };

  // ==================================================
  // ADD CUSTOM FIELD
  // ==================================================

  const addCustomField = () => {
    const label = newField.label.trim();

    if (!label) {
      alert("Field label is required");
      return;
    }

    let key =
      newField.key.trim() ||
      label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

    if (!key) {
      alert("Please enter a valid field key");
      return;
    }

    const exists = (form.customFields || []).some(
      (field) => String(field.key).toLowerCase() === key.toLowerCase(),
    );

    if (exists) {
      key = `${key}_${Date.now()}`;
    }

    const field = {
      key,
      label,
      type: newField.type,
      required: Boolean(newField.required),
      placeholder: newField.placeholder || "",
      options: newField.options || [],
      order: (form.customFields || []).length + 1,
    };

    setForm((prev) => ({
      ...prev,

      customFields: [...(prev.customFields || []), field],
    }));

    setNewField({
      key: "",
      label: "",
      type: "text",
      required: false,
      placeholder: "",
      options: [],
    });
  };

  // ==================================================
  // REMOVE CUSTOM FIELD
  // ==================================================

  const removeCustomField = (index) => {
    setForm((prev) => ({
      ...prev,

      customFields: (prev.customFields || [])
        .filter((_, i) => i !== index)
        .map((field, i) => ({
          ...field,
          order: i + 1,
        })),
    }));
  };

  // ==================================================
  // ADD DOMAIN
  // ==================================================

  const addDomain = () => {
    let value = domain.trim().toLowerCase();

    if (!value) return;

    value = value.replace(/^https?:\/\//, "").replace(/\/+$/, "");

    if (!value) return;

    const domains = form.embed?.allowedDomains || [];

    if (!domains.includes(value)) {
      setForm((prev) => ({
        ...prev,

        embed: {
          ...(prev.embed || {}),
          allowedDomains: [...(prev.embed?.allowedDomains || []), value],
        },
      }));
    }

    setDomain("");
  };

  // ==================================================
  // REMOVE DOMAIN
  // ==================================================

  const removeDomain = (value) => {
    setForm((prev) => ({
      ...prev,

      embed: {
        ...(prev.embed || {}),
        allowedDomains: (prev.embed?.allowedDomains || []).filter(
          (item) => item !== value,
        ),
      },
    }));
  };

  // ==================================================
  // SAVE
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name?.trim()) {
      alert("Form name is required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        description: form.description || "",
        status: form.status || "draft",

        fields: {
          ...(form.fields || {}),
        },

        customFields: (form.customFields || []).map((field, index) => ({
          ...field,

          key:
            String(field.key || "")
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9_]+/g, "_")
              .replace(/^_+|_+$/g, "") || `field_${index + 1}`,

          label: String(field.label || "").trim(),

          required: Boolean(field.required),

          options: Array.isArray(field.options) ? field.options : [],

          order: index + 1,
        })),

        leadConfig: {
          source: form.leadConfig?.source || "website",

          status: form.leadConfig?.status || "new",

          priority: form.leadConfig?.priority || "medium",

          assignedTo: form.leadConfig?.assignedTo || null,

          tag: form.leadConfig?.tag || null,

          product: form.leadConfig?.product || null,
        },

        webhook: {
          enabled: Boolean(form.webhook?.enabled),

          url: form.webhook?.url?.trim() || "",

          secret: form.webhook?.secret || "",
        },

        settings: {
          successMessage:
            form.settings?.successMessage ||
            "Thank you! We will contact you shortly.",

          redirectUrl: form.settings?.redirectUrl || "",

          duplicateCheck: Boolean(form.settings?.duplicateCheck),

          captchaEnabled: Boolean(form.settings?.captchaEnabled),
        },

        embed: {
          mode: form.embed?.mode || "both",

          allowedDomains: form.embed?.allowedDomains || [],
        },
      };

      const response = await formApi.updateForm(formId, payload);

      if (response?.success) {
        window.location.href = "/forms";
      } else {
        alert(response?.message || "Failed to update form");
      }
    } catch (error) {
      console.error("Update form error:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update form",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 size={22} className="animate-spin" />
          Loading form...
        </div>
      </div>
    );
  }

  // ==================================================
  // SAFE DEFAULTS
  // ==================================================

  const fields = form.fields || {};

  const customFields = Array.isArray(form.customFields)
    ? form.customFields
    : [];

  const leadConfig = {
    source: "website",
    status: "new",
    priority: "medium",
    assignedTo: null,
    tag: null,
    product: null,
    ...(form.leadConfig || {}),
  };

  const webhook = {
    enabled: false,
    url: "",
    secret: "",
    ...(form.webhook || {}),
  };

  const settings = {
    successMessage: "Thank you! We will contact you shortly.",
    redirectUrl: "",
    duplicateCheck: true,
    captchaEnabled: false,
    ...(form.settings || {}),
  };

  const embed = {
    mode: "both",
    allowedDomains: [],
    ...(form.embed || {}),
  };

  // ==================================================
  // SELECTED DATA
  // ==================================================

  const selectedUser = teamMembers.find(
    (user) => String(user?._id || user?.id) === String(leadConfig.assignedTo),
  );

  const selectedTag = tags.find(
    (tag) => String(tag?._id || tag?.id) === String(leadConfig.tag),
  );

  const selectedProduct = products.find(
    (product) =>
      String(product?._id || product?.id) === String(leadConfig.product),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1500px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => (window.location.href = "/forms")}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
              >
                <ArrowLeft size={19} />
              </button>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Edit Form
                  </h1>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      form.status === "active"
                        ? "bg-green-50 text-green-700"
                        : form.status === "inactive"
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {form.status || "draft"}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-1">{form.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => (window.location.href = "/forms")}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="form-edit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
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
        </div>
      </div>

      {/* ==================================================
          FORM
      ================================================== */}

      <form
        id="form-edit"
        onSubmit={handleSubmit}
        className="max-w-[1500px] mx-auto p-6"
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          {/* ==================================================
              LEFT
          ================================================== */}

          <div className="space-y-6">
            {/* ==================================================
                BASIC INFORMATION
            ================================================== */}

            <section className="bg-white border border-gray-200 rounded-xl">
              <SectionHeader
                icon={Settings}
                title="Basic Information"
                description="Update your form name and description."
              />

              <div className="p-5 space-y-5">
                <Input
                  label="Form Name"
                  required
                  value={form.name || ""}
                  onChange={(e) => updateBasic("name", e.target.value)}
                  placeholder="e.g. Get a Quote"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>

                  <textarea
                    value={form.description || ""}
                    onChange={(e) => updateBasic("description", e.target.value)}
                    rows={3}
                    placeholder="Describe this form..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>

                <Select
                  label="Status"
                  value={form.status || "draft"}
                  onChange={(e) => updateBasic("status", e.target.value)}
                >
                  {FORM_STATUSES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </div>
            </section>

            {/* ==================================================
                STANDARD FIELDS
            ================================================== */}

            <section className="bg-white border border-gray-200 rounded-xl">
              <SectionHeader
                icon={GripVertical}
                title="Standard Fields"
                description="Manage the default lead fields."
              />

              <div className="divide-y divide-gray-100">
                {Object.entries(fields).map(([key, field]) => (
                  <div key={key} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="pt-1 text-gray-300">
                        <GripVertical size={20} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {field?.label || key}
                            </h3>

                            <p className="text-xs text-gray-400 mt-0.5">
                              {key}
                            </p>
                          </div>

                          <Toggle
                            checked={Boolean(field?.enabled)}
                            onChange={(value) =>
                              updateField(key, "enabled", value)
                            }
                          />
                        </div>

                        {field?.enabled && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <Input
                              label="Label"
                              value={field?.label || ""}
                              onChange={(e) =>
                                updateField(key, "label", e.target.value)
                              }
                            />

                            <Input
                              label="Placeholder"
                              value={field?.placeholder || ""}
                              onChange={(e) =>
                                updateField(key, "placeholder", e.target.value)
                              }
                            />

                            <label className="flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={Boolean(field?.required)}
                                onChange={(e) =>
                                  updateField(key, "required", e.target.checked)
                                }
                                className="rounded border-gray-300 text-blue-600"
                              />
                              Required
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ==================================================
                CUSTOM FIELDS
            ================================================== */}

            <section className="bg-white border border-gray-200 rounded-xl">
              <SectionHeader
                icon={Plus}
                title="Custom Fields"
                description="Edit or add additional form fields."
              />

              <div className="p-5">
                {customFields.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {customFields.map((field, index) => {
                      const needsOptions = [
                        "select",
                        "radio",
                        "checkbox",
                      ].includes(field?.type);

                      return (
                        <div
                          key={`${field?.key || "field"}-${index}`}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start gap-3">
                            <GripVertical
                              size={18}
                              className="text-gray-300 mt-2 shrink-0"
                            />

                            <div className="flex-1">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input
                                  label="Label"
                                  value={field?.label || ""}
                                  onChange={(e) =>
                                    updateCustomField(
                                      index,
                                      "label",
                                      e.target.value,
                                    )
                                  }
                                />

                                <Input
                                  label="Field Key"
                                  value={field?.key || ""}
                                  onChange={(e) =>
                                    updateCustomField(
                                      index,
                                      "key",
                                      e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9_]/g, "_"),
                                    )
                                  }
                                />

                                <Select
                                  label="Type"
                                  value={field?.type || "text"}
                                  onChange={(e) =>
                                    updateCustomField(
                                      index,
                                      "type",
                                      e.target.value,
                                    )
                                  }
                                >
                                  {FIELD_TYPES.map((item) => (
                                    <option key={item.value} value={item.value}>
                                      {item.label}
                                    </option>
                                  ))}
                                </Select>

                                <Input
                                  label="Placeholder"
                                  value={field?.placeholder || ""}
                                  onChange={(e) =>
                                    updateCustomField(
                                      index,
                                      "placeholder",
                                      e.target.value,
                                    )
                                  }
                                />

                                {needsOptions && (
                                  <div className="md:col-span-2">
                                    <Input
                                      label="Options"
                                      value={(field?.options || []).join(", ")}
                                      onChange={(e) =>
                                        updateCustomFieldOptions(
                                          index,
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Option 1, Option 2, Option 3"
                                    />

                                    <p className="text-xs text-gray-400 mt-1">
                                      Separate options with commas.
                                    </p>
                                  </div>
                                )}

                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(field?.required)}
                                    onChange={(e) =>
                                      updateCustomField(
                                        index,
                                        "required",
                                        e.target.checked,
                                      )
                                    }
                                    className="rounded border-gray-300 text-blue-600"
                                  />
                                  Required
                                </label>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeCustomField(index)}
                              className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 shrink-0"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ADD CUSTOM FIELD */}

                <div className="border border-dashed border-gray-300 rounded-xl p-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Add Custom Field
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Field Label"
                      value={newField.label}
                      onChange={(e) =>
                        setNewField((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                      placeholder="e.g. Budget"
                    />

                    <Input
                      label="Field Key"
                      value={newField.key}
                      onChange={(e) =>
                        setNewField((prev) => ({
                          ...prev,
                          key: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, "_"),
                        }))
                      }
                      placeholder="e.g. budget"
                    />

                    <Select
                      label="Field Type"
                      value={newField.type}
                      onChange={(e) =>
                        setNewField((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                    >
                      {FIELD_TYPES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </Select>

                    <Input
                      label="Placeholder"
                      value={newField.placeholder}
                      onChange={(e) =>
                        setNewField((prev) => ({
                          ...prev,
                          placeholder: e.target.value,
                        }))
                      }
                      placeholder="Enter placeholder"
                    />
                  </div>

                  {["select", "radio", "checkbox"].includes(newField.type) && (
                    <div className="mt-4">
                      <Input
                        label="Options"
                        value={newField.options.join(", ")}
                        onChange={(e) => updateNewFieldOptions(e.target.value)}
                        placeholder="Option 1, Option 2, Option 3"
                      />

                      <p className="text-xs text-gray-400 mt-1">
                        Separate options with commas.
                      </p>
                    </div>
                  )}

                  <label className="flex items-center gap-2 text-sm text-gray-700 mt-4">
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={(e) =>
                        setNewField((prev) => ({
                          ...prev,
                          required: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600"
                    />
                    Required field
                  </label>

                  <button
                    type="button"
                    onClick={addCustomField}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                  >
                    <Plus size={16} />
                    Add Field
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* ==================================================
              RIGHT SIDEBAR
          ================================================== */}

          <div className="space-y-5">
            {/* ==================================================
                LEAD CONFIGURATION
            ================================================== */}

            <SidebarSection icon={Users} title="Lead Configuration">
              <Select
                label="Lead Source"
                value={leadConfig.source}
                onChange={(e) => updateLeadConfig("source", e.target.value)}
              >
                {LEAD_SOURCES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>

              <Select
                label="Lead Status"
                value={leadConfig.status}
                onChange={(e) => updateLeadConfig("status", e.target.value)}
              >
                {LEAD_STATUSES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>

              <Select
                label="Priority"
                value={leadConfig.priority}
                onChange={(e) => updateLeadConfig("priority", e.target.value)}
              >
                {PRIORITIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>

              {/* ASSIGNED TO */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={14} />
                    Assign To
                  </span>
                </label>

                <select
                  value={leadConfig.assignedTo || ""}
                  onChange={(e) =>
                    updateLeadConfig("assignedTo", e.target.value || null)
                  }
                  disabled={loadingTeam}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                >
                  <option value="">
                    {loadingTeam ? "Loading team..." : "Unassigned"}
                  </option>

                  {teamMembers.map((user) => {
                    const id = user?._id || user?.id;

                    const name =
                      user?.name ||
                      user?.fullName ||
                      user?.username ||
                      user?.email ||
                      "Unnamed User";

                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>

                {selectedUser && (
                  <p className="text-xs text-gray-400 mt-1">
                    Selected:{" "}
                    {selectedUser?.name ||
                      selectedUser?.fullName ||
                      selectedUser?.email}
                  </p>
                )}
              </div>

              {/* TAG */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <Tag size={14} />
                    Lead Tag
                  </span>
                </label>

                <select
                  value={leadConfig.tag || ""}
                  onChange={(e) =>
                    updateLeadConfig("tag", e.target.value || null)
                  }
                  disabled={loadingTags}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                >
                  <option value="">
                    {loadingTags ? "Loading tags..." : "No Tag"}
                  </option>

                  {tags.map((tag) => {
                    const id = tag?._id || tag?.id;

                    const name =
                      tag?.name || tag?.label || tag?.title || "Unnamed Tag";

                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>

                {selectedTag && (
                  <p className="text-xs text-gray-400 mt-1">
                    Selected:{" "}
                    {selectedTag?.name ||
                      selectedTag?.label ||
                      selectedTag?.title}
                  </p>
                )}
              </div>

              {/* PRODUCT */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <Package size={14} />
                    Product
                  </span>
                </label>

                <select
                  value={leadConfig.product || ""}
                  onChange={(e) =>
                    updateLeadConfig("product", e.target.value || null)
                  }
                  disabled={loadingProducts}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                >
                  <option value="">
                    {loadingProducts ? "Loading products..." : "No Product"}
                  </option>

                  {products.map((product) => {
                    const id = product?._id || product?.id;

                    const name =
                      product?.name ||
                      product?.productName ||
                      product?.title ||
                      product?.code ||
                      product?.sku ||
                      "Unnamed Product";

                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>

                {selectedProduct && (
                  <p className="text-xs text-gray-400 mt-1">
                    Selected:{" "}
                    {selectedProduct?.name ||
                      selectedProduct?.productName ||
                      selectedProduct?.title ||
                      selectedProduct?.code}
                  </p>
                )}
              </div>

              {/* SUMMARY */}

              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                <div className="text-xs font-medium text-gray-700 mb-2">
                  Automatic Lead Setup
                </div>

                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex justify-between gap-3">
                    <span>Source</span>
                    <span className="font-medium text-gray-700">
                      {LEAD_SOURCES.find((x) => x.value === leadConfig.source)
                        ?.label || leadConfig.source}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>Status</span>
                    <span className="font-medium text-gray-700">
                      {LEAD_STATUSES.find((x) => x.value === leadConfig.status)
                        ?.label || leadConfig.status}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>Priority</span>
                    <span className="font-medium text-gray-700">
                      {PRIORITIES.find((x) => x.value === leadConfig.priority)
                        ?.label || leadConfig.priority}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>Assigned</span>
                    <span className="font-medium text-gray-700 truncate">
                      {selectedUser
                        ? selectedUser?.name ||
                          selectedUser?.fullName ||
                          selectedUser?.email
                        : "Unassigned"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>Tag</span>
                    <span className="font-medium text-gray-700 truncate">
                      {selectedTag
                        ? selectedTag?.name ||
                          selectedTag?.label ||
                          selectedTag?.title
                        : "No Tag"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>Product</span>
                    <span className="font-medium text-gray-700 truncate">
                      {selectedProduct
                        ? selectedProduct?.name ||
                          selectedProduct?.productName ||
                          selectedProduct?.title ||
                          selectedProduct?.code
                        : "No Product"}
                    </span>
                  </div>
                </div>
              </div>
            </SidebarSection>

            {/* ==================================================
                WEBHOOK
            ================================================== */}

            <SidebarSection icon={Webhook} title="Webhook">
              <ToggleRow
                label="Enable Webhook"
                description="Send new form submissions to an external URL."
                checked={webhook.enabled}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,

                    webhook: {
                      ...(prev.webhook || {}),
                      enabled: value,
                    },
                  }))
                }
              />

              {webhook.enabled && (
                <div className="space-y-4">
                  <Input
                    label="Webhook URL"
                    type="url"
                    value={webhook.url}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,

                        webhook: {
                          ...(prev.webhook || {}),
                          url: e.target.value,
                        },
                      }))
                    }
                    placeholder="https://example.com/webhook"
                  />

                  <Input
                    label="Webhook Secret"
                    type="password"
                    value={webhook.secret}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,

                        webhook: {
                          ...(prev.webhook || {}),
                          secret: e.target.value,
                        },
                      }))
                    }
                    placeholder="Optional secret"
                  />
                </div>
              )}
            </SidebarSection>

            {/* ==================================================
                FORM SETTINGS
            ================================================== */}

            <SidebarSection icon={Settings} title="Form Settings">
              <Input
                label="Success Message"
                value={settings.successMessage}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,

                    settings: {
                      ...(prev.settings || {}),
                      successMessage: e.target.value,
                    },
                  }))
                }
              />

              <Input
                label="Redirect URL"
                type="url"
                value={settings.redirectUrl}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,

                    settings: {
                      ...(prev.settings || {}),
                      redirectUrl: e.target.value,
                    },
                  }))
                }
                placeholder="https://example.com/thank-you"
              />

              <ToggleRow
                label="Duplicate Check"
                description="Prevent duplicate submissions"
                checked={settings.duplicateCheck}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,

                    settings: {
                      ...(prev.settings || {}),
                      duplicateCheck: value,
                    },
                  }))
                }
              />

              <ToggleRow
                label="Captcha"
                description="Protect the form from spam"
                checked={settings.captchaEnabled}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,

                    settings: {
                      ...(prev.settings || {}),
                      captchaEnabled: value,
                    },
                  }))
                }
              />
            </SidebarSection>

            {/* ==================================================
                EMBED
            ================================================== */}

            <SidebarSection icon={Globe} title="Website & Embed">
              <Select
                label="Embed Mode"
                value={embed.mode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,

                    embed: {
                      ...(prev.embed || {}),
                      mode: e.target.value,
                    },
                  }))
                }
              >
                {EMBED_MODES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Allowed Domains
                </label>

                <div className="flex gap-2">
                  <input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addDomain();
                      }
                    }}
                    placeholder="example.com"
                    className="flex-1 min-w-0 px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={addDomain}
                    className="px-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                  >
                    <Plus size={17} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {embed.allowedDomains.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700"
                    >
                      {item}

                      <button
                        type="button"
                        onClick={() => removeDomain(item)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </SidebarSection>
          </div>
        </div>
      </form>
    </div>
  );
};

// ====================================================
// INPUT
// ====================================================

const Input = ({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}

          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
};

// ====================================================
// SELECT
// ====================================================

const Select = ({ label, value, onChange, children, disabled = false }) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <select
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
      >
        {children}
      </select>
    </div>
  );
};

// ====================================================
// TOGGLE
// ====================================================

const Toggle = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition ${
          checked ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
};

// ====================================================
// TOGGLE ROW
// ====================================================

const ToggleRow = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>

        {description && (
          <div className="text-xs text-gray-400 mt-0.5">{description}</div>
        )}
      </div>

      <Toggle checked={Boolean(checked)} onChange={onChange} />
    </div>
  );
};

// ====================================================
// SECTION HEADER
// ====================================================

const SectionHeader = ({ icon: Icon, title, description }) => {
  return (
    <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon size={18} className="text-blue-600" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>

        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
};

// ====================================================
// SIDEBAR SECTION
// ====================================================

const SidebarSection = ({ icon: Icon, title, children }) => {
  return (
    <section className="bg-white border border-gray-200 rounded-xl">
      <div className="px-4 py-3.5 border-b border-gray-200 flex items-center gap-2.5">
        <Icon size={17} className="text-blue-600" />

        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="p-4 space-y-4">{children}</div>
    </section>
  );
};

export default FormEdit;

