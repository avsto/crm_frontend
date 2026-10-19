
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
} from "lucide-react";

import crmApi from "../../api/crm.api";
import teamApi from "../../api/team.api";

// ============================================================
// SOURCE OPTIONS
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

// ============================================================
// PRIORITY OPTIONS
// ============================================================

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

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
}) => {
  return (
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
          className={`
            h-10 w-full rounded-lg border bg-white
            text-sm text-gray-800 outline-none transition
            placeholder:text-gray-400
            ${Icon ? "pl-9 pr-3" : "px-3"}
            ${
              error
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            }
          `}
        />
      </div>

      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
};

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
}) => {
  return (
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
          className={`
            h-10 w-full appearance-none rounded-lg
            border border-gray-200 bg-white pr-9
            text-sm text-gray-800 outline-none transition
            focus:border-purple-500 focus:ring-2 focus:ring-purple-100
            disabled:cursor-not-allowed disabled:bg-gray-50
            ${Icon ? "pl-9" : "pl-3"}
          `}
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
};

// ============================================================
// TEXTAREA
// ============================================================

const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
}) => {
  return (
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
        className="
          w-full resize-none rounded-lg border border-gray-200
          bg-white px-3 py-3 text-sm text-gray-800 outline-none
          transition placeholder:text-gray-400
          focus:border-purple-500 focus:ring-2 focus:ring-purple-100
        "
      />
    </div>
  );
};

// ============================================================
// LEAD CREATE
// ============================================================

const LeadCreate = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();

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

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // ==========================================================
  // FETCH TEAM
  // ==========================================================

  const fetchTeam = async () => {
    try {
      setTeamLoading(true);
      setTeamError("");

      const response = await teamApi.getTeamMembers({
        page: 1,
        limit: 100,
        search: undefined,
        role: undefined,
        status: "active",
      });

      const result = response?.data;

      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.members)
            ? result.members
            : [];

      setMembers(list);
    } catch (err) {
      console.error("Fetch team error:", err);

      setTeamError(
        err?.response?.data?.message || "Failed to load team members"
      );
    } finally {
      setTeamLoading(false);
    }
  };

  // ==========================================================
  // FETCH TAGS
  // ==========================================================

  const fetchTags = async () => {
    try {
      setTagLoading(true);
      setTagError("");

      const response = await crmApi.getTags({
        page: 1,
        limit: 100,
      });

      const result = response?.data;

      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.tags)
            ? result.data.tags
            : Array.isArray(result?.tags)
              ? result.tags
              : [];

      setTags(list);
    } catch (err) {
      console.error("Fetch tags error:", err);

      setTagError(
        err?.response?.data?.message || "Failed to load tags"
      );
    } finally {
      setTagLoading(false);
    }
  };

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    fetchTeam();
    fetchTags();
  }, []);

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

    if (apiError) {
      setApiError("");
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
        assignedTo: form.assignedTo || null,
        tag: form.tag || null,
        source: form.source || "manual",
        priority: form.priority || "medium",
        nextFollowUpAt: form.nextFollowUpAt
          ? new Date(form.nextFollowUpAt).toISOString()
          : null,
      };

      console.log("CREATE LEAD PAYLOAD:", payload);

      const response = await crmApi.createLead(payload);

      console.log("CREATE LEAD RESPONSE:", response?.data);

      if (onSuccess) {
        onSuccess(response?.data);
        return;
      }

      navigate("/crm/leads");
    } catch (error) {
      console.error("Create Lead Error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to create lead.";

      setApiError(message);
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
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>

                <span className="text-gray-300">/</span>
                <span className="text-gray-500">Business</span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-500">Leads</span>
                <span className="text-gray-300">/</span>
                <span className="font-medium text-gray-800">Create</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Create Lead
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Add a new lead and customer information.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close"
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
                Unable to create lead
              </p>
              <p className="mt-0.5 text-xs text-red-600">{apiError}</p>
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
                        Enter the lead's contact details.
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
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-xs font-semibold text-gray-700"
                    >
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
                          id="phone"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          className={`
                            h-10 w-full rounded-lg border bg-white
                            pl-9 pr-3 text-sm outline-none
                            placeholder:text-gray-400
                            focus:border-purple-500 focus:ring-2 focus:ring-purple-100
                            ${errors.phone ? "border-red-400" : "border-gray-200"}
                          `}
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
                        Add company details.
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
                        Add lead requirements or additional information.
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
                  {/* SOURCE */}

                  <SelectField
                    label="Source"
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                    options={SOURCE_OPTIONS}
                    icon={Globe2}
                  />

                  {/* PRIORITY */}

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
                        onChange={handleChange}
                        disabled={teamLoading}
                        className="
                          h-10 w-full appearance-none rounded-lg
                          border border-gray-200 bg-white pl-9 pr-9
                          text-sm text-gray-800 outline-none
                          focus:border-purple-500 focus:ring-2 focus:ring-purple-100
                          disabled:cursor-not-allowed disabled:bg-gray-50
                        "
                      >
                        <option value="">
                          {teamLoading
                            ? "Loading team members..."
                            : "Select team member"}
                        </option>

                        {members.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name || member.email || "Unnamed User"}
                            {member.email && member.name
                              ? ` - ${member.email}`
                              : ""}
                          </option>
                        ))}
                      </select>

                      {teamLoading ? (
                        <Loader2
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
                        />
                      ) : (
                        <ChevronDown
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      )}
                    </div>

                    {teamError && (
                      <p className="mt-1 text-[11px] text-red-500">
                        {teamError}
                      </p>
                    )}
                  </div>

                  {/* TAG */}

                  <div>
                    <label
                      htmlFor="tag"
                      className="mb-1.5 block text-xs font-semibold text-gray-700"
                    >
                      Assign Tag
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
                        className="
                          h-10 w-full appearance-none rounded-lg
                          border border-gray-200 bg-white pl-9 pr-9
                          text-sm text-gray-800 outline-none
                          focus:border-purple-500 focus:ring-2 focus:ring-purple-100
                          disabled:cursor-not-allowed disabled:bg-gray-50
                        "
                      >
                        <option value="">
                          {tagLoading ? "Loading tags..." : "No tag"}
                        </option>

                        {tags.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name || item.label || "Unnamed Tag"}
                          </option>
                        ))}
                      </select>

                      {tagLoading ? (
                        <Loader2
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
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
                          className="shrink-0 text-[11px] font-medium text-purple-600 hover:text-purple-800"
                        >
                          Retry
                        </button>
                      </div>
                    )}
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
                        className="
                          h-10 w-full rounded-lg border border-gray-200
                          bg-white pl-9 pr-3 text-sm text-gray-800
                          outline-none focus:border-purple-500
                          focus:ring-2 focus:ring-purple-100
                        "
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
                      Business, status, createdBy and activity information are
                      handled automatically by the backend.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <button
                  type="submit"
                  disabled={submitting}
                  className="
                    flex h-10 w-full items-center justify-center gap-2
                    rounded-lg bg-purple-600 px-4 text-sm font-semibold
                    text-white shadow-sm transition hover:bg-purple-700
                    disabled:cursor-not-allowed disabled:opacity-60
                  "
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Create Lead
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="
                    mt-2 flex h-10 w-full items-center justify-center gap-2
                    rounded-lg border border-gray-200 bg-white px-4
                    text-sm font-semibold text-gray-700 transition
                    hover:bg-gray-50 disabled:opacity-50
                  "
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

export default LeadCreate;
