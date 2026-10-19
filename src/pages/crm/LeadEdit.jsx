
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  ChevronDown,
  Globe2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Save,
  Tag,
  UserRound,
  UsersRound,
  X,
  RefreshCw,
} from "lucide-react";

import crmApi from "../../api/crm.api";
import teamApi from "../../api/team.api";

// ============================================================
// OPTIONS
// ============================================================

const SOURCE_OPTIONS = [
  { value: "manual", label: "Manual" },
  { value: "website", label: "Website" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "google", label: "Google" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "referral", label: "Referral" },
  { value: "import", label: "Import" },
  { value: "campaign", label: "Campaign" },
  { value: "api", label: "API" },
  { value: "other", label: "Other" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

// ============================================================
// RESPONSE HELPERS
// ============================================================

const extractArray = (response, keys = []) => {
  const root = response?.data ?? response;

  if (Array.isArray(root)) return root;

  if (Array.isArray(root?.data)) return root.data;

  for (const key of keys) {
    if (Array.isArray(root?.[key])) return root[key];
    if (Array.isArray(root?.data?.[key])) return root.data[key];
  }

  return [];
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value._id || value.id || "";
  }
  return "";
};

// ============================================================
// INPUT FIELD
// ============================================================

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  icon: Icon,
  error,
}) => (
  <div>
    <label
      htmlFor={name}
      className="mb-1.5 block text-xs font-semibold text-gray-700"
    >
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <div className="relative">
      {Icon && (
        <Icon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`h-10 w-full rounded-lg border bg-white text-sm text-gray-800 outline-none transition placeholder:text-gray-400 ${
          Icon ? "pl-9 pr-3" : "px-3"
        } ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
        }`}
      />
    </div>

    {error && (
      <p className="mt-1 text-[11px] text-red-500">{error}</p>
    )}
  </div>
);

// ============================================================
// SELECT FIELD
// ============================================================

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  icon: Icon,
  disabled = false,
}) => (
  <div>
    <label
      htmlFor={name}
      className="mb-1.5 block text-xs font-semibold text-gray-700"
    >
      {label}
    </label>

    <div className="relative">
      {Icon && (
        <Icon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white pr-9 text-sm text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-50 ${
          Icon ? "pl-9" : "pl-3"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  </div>
);

// ============================================================
// TEXTAREA
// ============================================================

const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label
      htmlFor={name}
      className="mb-1.5 block text-xs font-semibold text-gray-700"
    >
      {label}
    </label>

    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      rows={6}
      placeholder={placeholder}
      className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
    />
  </div>
);

// ============================================================
// LEAD EDIT
// ============================================================

const LeadEdit = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ==========================================================
  // FORM
  // ==========================================================

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: "+91",
    alternatePhone: "",
    companyName: "",
    subject: "",
    message: "",
    assignedTo: "",
    tag: "",
    source: "manual",
    priority: "medium",
    nextFollowUpAt: "",
  });

  // ==========================================================
  // TEAM
  // ==========================================================

  const [members, setMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState("");

  // ==========================================================
  // TAGS
  // ==========================================================

  const [tags, setTags] = useState([]);
  const [tagLoading, setTagLoading] = useState(false);
  const [tagError, setTagError] = useState("");

  // ==========================================================
  // FORM STATES
  // ==========================================================

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ==========================================================
  // FETCH TEAM
  // ==========================================================

  const fetchTeam = useCallback(async () => {
    try {
      setTeamLoading(true);
      setTeamError("");

      const response = await teamApi.getTeamMembers({
        page: 1,
        limit: 100,
        status: "active",
      });

      setMembers(
        extractArray(response, ["members", "teamMembers", "users"])
      );
    } catch (err) {
      console.error("Fetch team error:", err);
      setTeamError(
        err?.response?.data?.message ||
          "Failed to load team members."
      );
    } finally {
      setTeamLoading(false);
    }
  }, []);

  // ==========================================================
  // FETCH TAGS
  // ==========================================================

  const fetchTags = useCallback(async () => {
    try {
      setTagLoading(true);
      setTagError("");

      const response = await crmApi.getTags({
        page: 1,
        limit: 100,
      });

      const list = extractArray(response, ["tags"]);

      setTags(list);
    } catch (err) {
      console.error("Fetch tags error:", err);

      setTagError(
        err?.response?.data?.message ||
          "Failed to load tags."
      );
    } finally {
      setTagLoading(false);
    }
  }, []);

  // ==========================================================
  // FETCH LEAD
  // ==========================================================

  const fetchLead = useCallback(async () => {
    if (!id) {
      setApiError("Lead ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setApiError("");

      const response = await crmApi.getLead(id);

      const lead =
        response?.data?.data ??
        response?.data?.lead ??
        response?.data;

      if (!lead || typeof lead !== "object" || !lead._id) {
        throw new Error("Lead not found.");
      }

      let nextFollowUpAt = "";

      if (lead.nextFollowUpAt) {
        const date = new Date(lead.nextFollowUpAt);

        if (!Number.isNaN(date.getTime())) {
          // datetime-local needs local time, not UTC time.
          const offset = date.getTimezoneOffset() * 60000;
          nextFollowUpAt = new Date(date.getTime() - offset)
            .toISOString()
            .slice(0, 16);
        }
      }

      setForm({
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        phoneCountryCode: lead.phoneCountryCode || "+91",
        alternatePhone: lead.alternatePhone || "",
        companyName: lead.companyName || "",
        subject: lead.subject || "",
        message: lead.message || "",
        assignedTo: getId(lead.assignedTo),
        tag: getId(lead.tag),
        source: lead.source || "manual",
        priority: lead.priority || "medium",
        nextFollowUpAt,
      });
    } catch (err) {
      console.error("Fetch lead error:", err);

      setApiError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load lead."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    fetchLead();
    fetchTeam();
    fetchTags();
  }, [fetchLead, fetchTeam, fetchTags]);

  // ==========================================================
  // HANDLE CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setApiError("");
    setSuccessMessage("");
  };

  // ==========================================================
  // ASSIGN LEAD
  // ==========================================================

  const handleAssign = async (e) => {
    const assignedTo = e.target.value;
    const previousAssignedTo = form.assignedTo;

    setForm((prev) => ({
      ...prev,
      assignedTo,
    }));

    try {
      setAssigning(true);
      setApiError("");
      setSuccessMessage("");

      await crmApi.assignLead(id, {
        assignedTo: assignedTo || null,
      });

      setSuccessMessage(
        assignedTo
          ? "Lead assigned successfully."
          : "Lead unassigned successfully."
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
    } catch (err) {
      console.error("Assign lead error:", err);

      setForm((prev) => ({
        ...prev,
        assignedTo: previousAssignedTo,
      }));

      setApiError(
        err?.response?.data?.message ||
          "Failed to assign lead."
      );
    } finally {
      setAssigning(false);
    }
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Lead name is required.";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      newErrors.email = "Please enter a valid email.";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    return newErrors;
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setApiError("");
    setSuccessMessage("");

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        phoneCountryCode: form.phoneCountryCode.trim() || "+91",
        alternatePhone: form.alternatePhone.trim() || null,
        companyName: form.companyName.trim() || null,
        subject: form.subject.trim() || null,
        message: form.message.trim() || null,
        source: form.source || "manual",
        priority: form.priority || "medium",

        // Single tag ObjectId or null.
        tag: form.tag || null,

        nextFollowUpAt: form.nextFollowUpAt
          ? new Date(form.nextFollowUpAt).toISOString()
          : null,
      };

      const response = await crmApi.updateLead(id, payload);

      if (onSuccess) {
        onSuccess(response?.data);
        return;
      }

      setSuccessMessage("Lead updated successfully.");

      window.setTimeout(() => {
        navigate("/crm/leads");
      }, 700);
    } catch (err) {
      console.error("Update lead error:", err);

      setApiError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to update lead."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // CANCEL
  // ==========================================================

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    navigate(-1);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          Loading lead...
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* HEADER */}

      <div className="border-b border-gray-200 bg-white">
        <div className="px-5 py-5 md:px-7">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2.5 flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 text-gray-500 transition hover:text-gray-800"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>

                <span className="text-gray-300">/</span>
                <span className="text-gray-500">Business</span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-500">Leads</span>
                <span className="text-gray-300">/</span>
                <span className="font-medium text-gray-800">Edit</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Edit Lead
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Update lead and customer information.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* FORM */}

      <form onSubmit={handleSubmit}>
        <div className="mx-auto max-w-6xl px-5 py-6 md:px-7">
          {apiError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-semibold text-red-700">
                Unable to update lead
              </p>
              <p className="mt-0.5 text-xs text-red-600">{apiError}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm font-semibold text-green-700">
                {successMessage}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
            {/* LEFT COLUMN */}

            <div className="space-y-5">
              {/* BASIC INFORMATION */}

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <UserRound size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">
                        Basic Information
                      </h2>
                      <p className="text-[11px] text-gray-500">
                        Update the lead&apos;s contact details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
                  <InputField
                    label="Lead Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    icon={UserRound}
                    error={errors.name}
                  />

                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    icon={Mail}
                    error={errors.email}
                  />

                  {/* PHONE */}

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Phone <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="flex gap-2">
                      <select
                        name="phoneCountryCode"
                        value={form.phoneCountryCode}
                        onChange={handleChange}
                        aria-label="Phone country code"
                        className="h-10 w-[90px] rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+61">+61</option>
                        <option value="+971">+971</option>
                      </select>

                      <div className="relative flex-1">
                        <Phone
                          size={16}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          className={`h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 ${
                            errors.phone
                              ? "border-red-400"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                    </div>

                    {errors.phone && (
                      <p className="mt-1 text-[11px] text-red-500">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <InputField
                    label="Alternate Phone"
                    name="alternatePhone"
                    value={form.alternatePhone}
                    onChange={handleChange}
                    placeholder="Alternate phone"
                    icon={Phone}
                  />
                </div>
              </div>

              {/* COMPANY INFORMATION */}

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">
                        Company Information
                      </h2>
                      <p className="text-[11px] text-gray-500">
                        Update company details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
                  <InputField
                    label="Company Name"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="ABC Company"
                    icon={Building2}
                  />

                  <InputField
                    label="Subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Lead subject"
                    icon={MessageSquare}
                  />
                </div>
              </div>

              {/* LEAD MESSAGE */}

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">
                        Lead Message
                      </h2>
                      <p className="text-[11px] text-gray-500">
                        Update lead requirements or additional information.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <TextAreaField
                    label="Message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Enter lead message or requirement..."
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}

            <div className="space-y-5">
              {/* LEAD SETTINGS */}

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Lead Settings
                  </h2>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Configure source, priority, tag and follow-up.
                  </p>
                </div>

                <div className="space-y-5 p-5">
                  <SelectField
                    label="Source"
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                    options={SOURCE_OPTIONS}
                    icon={Globe2}
                  />

                  <SelectField
                    label="Priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    options={PRIORITY_OPTIONS}
                    icon={MessageSquare}
                  />

                  {/* ASSIGNED TO */}

                  <div>
                    <label
                      htmlFor="assignedTo"
                      className="mb-1.5 block text-xs font-semibold text-gray-700"
                    >
                      Assigned To
                    </label>

                    <div className="relative">
                      <UsersRound
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <select
                        id="assignedTo"
                        name="assignedTo"
                        value={form.assignedTo}
                        onChange={handleAssign}
                        disabled={teamLoading || assigning}
                        className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                      >
                        <option value="">
                          {teamLoading
                            ? "Loading team members..."
                            : "Unassigned"}
                        </option>

                        {members.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name ||
                              member.email ||
                              "Unnamed User"}
                            {member.email && member.name
                              ? ` - ${member.email}`
                              : ""}
                          </option>
                        ))}
                      </select>

                      {assigning ? (
                        <Loader2
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-purple-500"
                        />
                      ) : (
                        <ChevronDown
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      )}
                    </div>

                    {teamError && (
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-[11px] text-red-500">
                          {teamError}
                        </p>
                        <button
                          type="button"
                          onClick={fetchTeam}
                          className="text-[11px] font-medium text-purple-600 hover:text-purple-700"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {assigning && (
                      <p className="mt-1 text-[11px] text-purple-600">
                        Updating assignment...
                      </p>
                    )}
                  </div>

                  {/* TAG ASSIGNMENT */}

                  <div>
                    <label
                      htmlFor="tag"
                      className="mb-1.5 block text-xs font-semibold text-gray-700"
                    >
                      Lead Tag
                    </label>

                    <div className="relative">
                      <Tag
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <select
                        id="tag"
                        name="tag"
                        value={form.tag}
                        onChange={handleChange}
                        disabled={tagLoading}
                        className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                      >
                        <option value="">
                          {tagLoading ? "Loading tags..." : "No tag"}
                        </option>

                        {tags.map((item) => {
                          const tagId = getId(item);
                          const tagName =
                            item.name || item.label || "Unnamed Tag";

                          if (!tagId) return null;

                          return (
                            <option key={tagId} value={tagId}>
                              {tagName}
                            </option>
                          );
                        })}
                      </select>

                      {tagLoading ? (
                        <Loader2
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-purple-500"
                        />
                      ) : (
                        <ChevronDown
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      )}
                    </div>

                    {tagError && (
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-[11px] text-red-500">
                          {tagError}
                        </p>

                        <button
                          type="button"
                          onClick={fetchTags}
                          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-purple-600 hover:text-purple-700"
                        >
                          <RefreshCw size={11} />
                          Retry
                        </button>
                      </div>
                    )}

                    {!tagLoading && !tagError && tags.length === 0 && (
                      <p className="mt-1 text-[11px] text-gray-400">
                        No tags available. Create a tag first.
                      </p>
                    )}

                    <p className="mt-1 text-[11px] text-gray-400">
                      Select one tag for this lead.
                    </p>
                  </div>

                  {/* NEXT FOLLOW UP */}

                  <div>
                    <label
                      htmlFor="nextFollowUpAt"
                      className="mb-1.5 block text-xs font-semibold text-gray-700"
                    >
                      Next Follow Up
                    </label>

                    <div className="relative">
                      <CalendarClock
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="nextFollowUpAt"
                        name="nextFollowUpAt"
                        type="datetime-local"
                        value={form.nextFollowUpAt}
                        onChange={handleChange}
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* INFORMATION */}

              <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <Building2 size={16} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-purple-900">
                      Lead information
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-purple-700">
                      Business, status, createdBy and activity information
                      are handled by the backend.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Update Lead
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LeadEdit;
