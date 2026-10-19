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

// ==================================================
// CONSTANTS
// ==================================================

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

// ==================================================
// INITIAL FORM
// ==================================================

const initialForm = {
  name: "",
  description: "",
  status: "draft",

  fields: {
    name: {
      enabled: true,
      required: true,
      label: "Name",
      placeholder: "Enter your name",
    },

    phone: {
      enabled: true,
      required: true,
      label: "Phone",
      placeholder: "Enter phone number",
    },

    email: {
      enabled: true,
      required: false,
      label: "Email",
      placeholder: "Enter email address",
    },

    companyName: {
      enabled: false,
      required: false,
      label: "Company",
      placeholder: "Enter company name",
    },

    subject: {
      enabled: false,
      required: false,
      label: "Subject",
      placeholder: "Enter subject",
    },

    message: {
      enabled: false,
      required: false,
      label: "Message",
      placeholder: "Enter your message",
    },
  },

  customFields: [],

  leadConfig: {
    source: "website",
    status: "new",
    priority: "medium",
    assignedTo: null,
    tag: null,
    product: null,
  },

  webhook: {
    enabled: false,
    url: "",
    secret: "",
  },

  settings: {
    successMessage: "Thank you! We will contact you shortly.",
    redirectUrl: "",
    duplicateCheck: true,
    captchaEnabled: false,
  },

  embed: {
    mode: "both",
    allowedDomains: [],
  },
};

// ==================================================
// COMPONENT
// ==================================================

const FormCreate = () => {
  const [form, setForm] = useState(initialForm);

  const [saving, setSaving] = useState(false);

  const [activeSection, setActiveSection] = useState("fields");

  // ==================================================
  // TEAM / TAG / PRODUCT
  // ==================================================

  const [teamMembers, setTeamMembers] = useState([]);
  const [tags, setTags] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingTeam, setLoadingTeam] = useState(false);

  const [loadingTags, setLoadingTags] = useState(false);

  const [loadingProducts, setLoadingProducts] = useState(false);

  // ==================================================
  // CUSTOM FIELD
  // ==================================================

  const [newField, setNewField] = useState({
    key: "",
    label: "",
    type: "text",
    required: false,
    placeholder: "",
    options: [],
  });

  // ==================================================
  // DOMAIN
  // ==================================================

  const [domain, setDomain] = useState("");

  // ==================================================
  // LOAD CONFIG OPTIONS
  // ==================================================

  useEffect(() => {
    loadTeamMembers();
    loadTags();
    loadProducts();
  }, []);

  // ==================================================
  // LOAD TEAM MEMBERS
  // ==================================================

  const loadTeamMembers = async () => {
    try {
      setLoadingTeam(true);

      const response = await teamApi.getTeamMembers();

      const list =
        response?.data || response?.data?.members || response?.members || [];

      setTeamMembers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Load team members error:", error);
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

      console.log(response);

      const list = response?.data?.data || response?.data?.tags || response?.tags || [];

      setTags(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Load tags error:", error);
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

      console.log(response);

      const list =
        response?.data?.data ||
        response?.data?.products ||
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
  // BASIC UPDATE
  // ==================================================

  const updateBasic = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ==================================================
  // LEAD CONFIG UPDATE
  // ==================================================

  const updateLeadConfig = (key, value) => {
    setForm((prev) => ({
      ...prev,

      leadConfig: {
        ...prev.leadConfig,
        [key]: value || null,
      },
    }));
  };

  // ==================================================
  // STANDARD FIELD UPDATE
  // ==================================================

  const updateField = (key, property, value) => {
    setForm((prev) => ({
      ...prev,

      fields: {
        ...prev.fields,

        [key]: {
          ...prev.fields[key],
          [property]: value,
        },
      },
    }));
  };

  // ==================================================
  // ADD CUSTOM FIELD
  // ==================================================

  const addCustomField = () => {
    if (!newField.label.trim()) {
      alert("Field label is required");
      return;
    }

    let key =
      newField.key.trim() ||
      newField.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

    if (!key) {
      alert("Please enter a valid field key");
      return;
    }

    const exists = form.customFields.some((field) => field.key === key);

    if (exists) {
      key = `${key}_${Date.now()}`;
    }

    const field = {
      key,

      label: newField.label.trim(),

      type: newField.type,

      required: newField.required,

      placeholder: newField.placeholder || "",

      options: newField.options || [],

      order: form.customFields.length + 1,
    };

    setForm((prev) => ({
      ...prev,

      customFields: [...prev.customFields, field],
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

      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  // ==================================================
  // UPDATE CUSTOM FIELD
  // ==================================================

  const updateCustomField = (index, key, value) => {
    setForm((prev) => ({
      ...prev,

      customFields: prev.customFields.map((field, i) =>
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
  // ADD DOMAIN
  // ==================================================

  const addDomain = () => {
    const value = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "");

    if (!value) return;

    if (!form.embed.allowedDomains.includes(value)) {
      setForm((prev) => ({
        ...prev,

        embed: {
          ...prev.embed,

          allowedDomains: [...prev.embed.allowedDomains, value],
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
        ...prev.embed,

        allowedDomains: prev.embed.allowedDomains.filter(
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

    if (!form.name.trim()) {
      alert("Form name is required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,

        leadConfig: {
          source: form.leadConfig.source,

          status: form.leadConfig.status,

          priority: form.leadConfig.priority,

          assignedTo: form.leadConfig.assignedTo || null,

          tag: form.leadConfig.tag || null,

          product: form.leadConfig.product || null,
        },

        webhook: {
          enabled: form.webhook.enabled,

          // Backend generates the URL.
          url: "",

          secret: form.webhook.secret || "",
        },

        embed: {
          ...form.embed,

          mode: form.embed.mode,
        },
      };

      const response = await formApi.createForm(payload);

      if (response?.success) {
        window.location.href = "/forms";
      } else {
        alert(response?.message || "Failed to create form");
      }
    } catch (error) {
      console.error("Create form error:", error);

      alert(error?.response?.data?.message || "Failed to create form");
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // SELECTED NAMES
  // ==================================================

  const selectedUser = teamMembers.find(
    (user) =>
      String(user?._id || user?.id) === String(form.leadConfig.assignedTo),
  );

  const selectedTag = tags.find(
    (tag) => String(tag?._id || tag?.id) === String(form.leadConfig.tag),
  );

  const selectedProduct = products.find(
    (product) =>
      String(product?._id || product?.id) === String(form.leadConfig.product),
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
                <h1 className="text-xl font-semibold text-gray-900">
                  Create Form
                </h1>

                <p className="text-sm text-gray-500">
                  Build a form to capture leads into your CRM.
                </p>
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
                form="form-builder"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}

                {saving ? "Saving..." : "Save Form"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <form
        id="form-builder"
        onSubmit={handleSubmit}
        className="max-w-[1500px] mx-auto p-6"
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          {/* ==================================================
              LEFT
          ================================================== */}

          <div className="space-y-6">
            {/* BASIC INFORMATION */}

            <section className="bg-white border border-gray-200 rounded-xl">
              <SectionHeader
                icon={Settings}
                title="Basic Information"
                description="Give your form a name and description."
              />

              <div className="p-5 space-y-5">
                <Input
                  label="Form Name"
                  required
                  value={form.name}
                  onChange={(e) => updateBasic("name", e.target.value)}
                  placeholder="e.g. Get a Quote"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(e) => updateBasic("description", e.target.value)}
                    rows={3}
                    placeholder="Describe what this form is used for..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>

                <Select
                  label="Status"
                  value={form.status}
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

            {/* STANDARD FIELDS */}

            <section className="bg-white border border-gray-200 rounded-xl">
              <SectionHeader
                icon={GripVertical}
                title="Standard Fields"
                description="Choose the fields your customers should fill in."
              />

              <div className="divide-y divide-gray-100">
                {Object.entries(form.fields).map(([key, field]) => (
                  <div key={key} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="pt-1 text-gray-300">
                        <GripVertical size={20} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {field.label}
                            </h3>

                            <p className="text-xs text-gray-400 mt-0.5">
                              {key}
                            </p>
                          </div>

                          <Toggle
                            checked={field.enabled}
                            onChange={(value) =>
                              updateField(key, "enabled", value)
                            }
                          />
                        </div>

                        {field.enabled && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <Input
                              label="Label"
                              value={field.label}
                              onChange={(e) =>
                                updateField(key, "label", e.target.value)
                              }
                            />

                            <Input
                              label="Placeholder"
                              value={field.placeholder}
                              onChange={(e) =>
                                updateField(key, "placeholder", e.target.value)
                              }
                            />

                            <label className="flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) =>
                                  updateField(key, "required", e.target.checked)
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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

            {/* CUSTOM FIELDS */}

            <section className="bg-white border border-gray-200 rounded-xl">
              <SectionHeader
                icon={Plus}
                title="Custom Fields"
                description="Add additional information you want to collect."
              />

              <div className="p-5">
                {form.customFields.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {form.customFields.map((field, index) => (
                      <div
                        key={field.key}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <GripVertical
                            size={18}
                            className="text-gray-300 mt-2"
                          />

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              label="Label"
                              value={field.label}
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
                              value={field.key}
                              onChange={(e) =>
                                updateCustomField(index, "key", e.target.value)
                              }
                            />

                            <Select
                              label="Type"
                              value={field.type}
                              onChange={(e) =>
                                updateCustomField(index, "type", e.target.value)
                              }
                            >
                              <option value="text">Text</option>

                              <option value="textarea">Textarea</option>

                              <option value="number">Number</option>

                              <option value="email">Email</option>

                              <option value="phone">Phone</option>

                              <option value="date">Date</option>

                              <option value="select">Select</option>

                              <option value="radio">Radio</option>

                              <option value="checkbox">Checkbox</option>
                            </Select>

                            <Input
                              label="Placeholder"
                              value={field.placeholder || ""}
                              onChange={(e) =>
                                updateCustomField(
                                  index,
                                  "placeholder",
                                  e.target.value,
                                )
                              }
                            />

                            <label className="flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={field.required}
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

                          <button
                            type="button"
                            onClick={() => removeCustomField(index)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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
                          key: e.target.value,
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
                      <option value="text">Text</option>

                      <option value="textarea">Textarea</option>

                      <option value="number">Number</option>

                      <option value="email">Email</option>

                      <option value="phone">Phone</option>

                      <option value="date">Date</option>

                      <option value="select">Select</option>

                      <option value="radio">Radio</option>

                      <option value="checkbox">Checkbox</option>
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
                value={form.leadConfig.source}
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
                value={form.leadConfig.status}
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
                value={form.leadConfig.priority}
                onChange={(e) => updateLeadConfig("priority", e.target.value)}
              >
                {PRIORITIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>

              {/* ASSIGN USER */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Assign To
                </label>

                <select
                  value={form.leadConfig.assignedTo || ""}
                  onChange={(e) =>
                    updateLeadConfig("assignedTo", e.target.value || null)
                  }
                  disabled={loadingTeam}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                >
                  <option value="">
                    {loadingTeam ? "Loading users..." : "Unassigned"}
                  </option>

                  {teamMembers.map((user) => {
                    const userId = user?._id || user?.id;

                    return (
                      <option key={userId} value={userId}>
                        {user?.name ||
                          user?.fullName ||
                          user?.email ||
                          "Unnamed User"}
                      </option>
                    );
                  })}
                </select>

                {selectedUser && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    New leads from this form will be assigned to{" "}
                    <span className="font-medium text-gray-600">
                      {selectedUser.name ||
                        selectedUser.fullName ||
                        selectedUser.email}
                    </span>
                    .
                  </p>
                )}
              </div>

              {/* TAG */}

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <Tag size={14} className="text-gray-400" />
                  Lead Tag
                </label>

                <select
                  value={form.leadConfig.tag || ""}
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
                    const tagId = tag?._id || tag?.id;

                    return (
                      <option key={tagId} value={tagId}>
                        {tag?.name || tag?.title || "Unnamed Tag"}
                      </option>
                    );
                  })}
                </select>

                {selectedTag && (
                  <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-700">
                    {selectedTag.color && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: selectedTag.color,
                        }}
                      />
                    )}

                    {selectedTag.name || selectedTag.title}
                  </div>
                )}
              </div>

              {/* PRODUCT */}

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <Package size={14} className="text-gray-400" />
                  Product
                </label>

                <select
                  value={form.leadConfig.product || ""}
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
                    const productId = product?._id || product?.id;

                    const productName =
                      product?.name ||
                      product?.productName ||
                      product?.title ||
                      product?.partNumber ||
                      "Unnamed Product";

                    return (
                      <option key={productId} value={productId}>
                        {productName}
                        {product?.partNumber ? ` (${product.partNumber})` : ""}
                      </option>
                    );
                  })}
                </select>

                {selectedProduct && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    This product will be attached to leads created through this
                    form.
                  </p>
                )}
              </div>

              {/* CONFIG SUMMARY */}

              {(form.leadConfig.assignedTo ||
                form.leadConfig.tag ||
                form.leadConfig.product) && (
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                  <p className="text-xs font-semibold text-blue-900 mb-2">
                    Automatic Lead Setup
                  </p>

                  <div className="space-y-1.5 text-xs text-blue-800">
                    {selectedUser && (
                      <div>
                        <span className="font-medium">Assigned:</span>{" "}
                        {selectedUser.name || selectedUser.email}
                      </div>
                    )}

                    {selectedTag && (
                      <div>
                        <span className="font-medium">Tag:</span>{" "}
                        {selectedTag.name || selectedTag.title}
                      </div>
                    )}

                    {selectedProduct && (
                      <div>
                        <span className="font-medium">Product:</span>{" "}
                        {selectedProduct.name ||
                          selectedProduct.productName ||
                          selectedProduct.title ||
                          selectedProduct.partNumber}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </SidebarSection>

            {/* ==================================================
                WEBHOOK
            ================================================== */}

            <SidebarSection icon={Webhook} title="Webhook">
              <ToggleRow
                label="Enable Webhook"
                checked={form.webhook.enabled}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,

                    webhook: {
                      ...prev.webhook,
                      enabled: value,
                    },
                  }))
                }
              />

              {form.webhook.enabled && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">
                      Webhook URL will be generated automatically after the form
                      is created.
                    </p>
                  </div>

                  <Input
                    label="Webhook Secret"
                    type="password"
                    value={form.webhook.secret}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,

                        webhook: {
                          ...prev.webhook,

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
                value={form.settings.successMessage}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,

                    settings: {
                      ...prev.settings,

                      successMessage: e.target.value,
                    },
                  }))
                }
              />

              <Input
                label="Redirect URL"
                value={form.settings.redirectUrl}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,

                    settings: {
                      ...prev.settings,

                      redirectUrl: e.target.value,
                    },
                  }))
                }
                placeholder="https://example.com/thank-you"
              />

              <ToggleRow
                label="Duplicate Check"
                description="Prevent duplicate submissions"
                checked={form.settings.duplicateCheck}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,

                    settings: {
                      ...prev.settings,

                      duplicateCheck: value,
                    },
                  }))
                }
              />

              <ToggleRow
                label="Captcha"
                description="Protect the form from spam submissions"
                checked={form.settings.captchaEnabled}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,

                    settings: {
                      ...prev.settings,

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
                value={form.embed.mode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,

                    embed: {
                      ...prev.embed,

                      mode: e.target.value,
                    },
                  }))
                }
              >
                <option value="both">Embed + Public URL</option>

                <option value="iframe">Iframe Only</option>

                <option value="javascript">JavaScript Only</option>
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
                  {form.embed.allowedDomains.map((item) => (
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

const Select = ({ label, value, onChange, children }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>

      <select
        value={value ?? ""}
        onChange={onChange}
        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

      <Toggle checked={checked} onChange={onChange} />
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

export default FormCreate;
