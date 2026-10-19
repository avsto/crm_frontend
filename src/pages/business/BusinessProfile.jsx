import React, { useEffect, useState } from "react";

import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Save,
  Pencil,
  CheckCircle2,
  CreditCard,
  Hash,
  Landmark,
  User,
  BriefcaseBusiness,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import businessApi from "../../api/business.api";

const initialForm = {
  name: "",
  legalName: "",
  businessType: "",
  industry: "",
  email: "",
  phone: "",
  website: "",
  gstNumber: "",
  panNumber: "",
  registrationNumber: "",
  description: "",

  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",

  facebook: "",
  instagram: "",
  linkedin: "",
  twitter: "",
  youtube: "",

  currency: "INR",
  timezone: "Asia/Kolkata",
  language: "en",
};

const BusinessProfile = () => {
  const [isEditing, setIsEditing] = useState(true);

  const [hasBusiness, setHasBusiness] = useState(false);

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  const [error, setError] = useState("");

  // ======================================================
  // LOAD PROFILE
  // ======================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await businessApi.getProfile();

      const business = response?.data || null;

      // ----------------------------------------------
      // NO BUSINESS YET
      // ----------------------------------------------

      if (!business) {
        setHasBusiness(false);
        setIsEditing(true);
        setForm(initialForm);
        return;
      }

      // ----------------------------------------------
      // BUSINESS EXISTS
      // ----------------------------------------------

      setHasBusiness(true);
      setIsEditing(false);

      setForm({
        name: business.name || "",

        legalName: business.legalName || "",

        businessType: business.businessType || "",

        industry: business.industry || "",

        email: business.email || "",

        phone: business.phone || "",

        website: business.website || "",

        gstNumber: business.gstNumber || "",

        panNumber: business.panNumber || "",

        registrationNumber: business.registrationNumber || "",

        description: business.description || "",

        addressLine1: business.address?.addressLine1 || "",

        addressLine2: business.address?.addressLine2 || "",

        city: business.address?.city || "",

        state: business.address?.state || "",

        country: business.address?.country || "India",

        pincode: business.address?.pincode || "",

        facebook: business.socialLinks?.facebook || "",

        instagram: business.socialLinks?.instagram || "",

        linkedin: business.socialLinks?.linkedin || "",

        twitter: business.socialLinks?.twitter || "",

        youtube: business.socialLinks?.youtube || "",

        currency: business.settings?.currency || "INR",

        timezone: business.settings?.timezone || "Asia/Kolkata",

        language: business.settings?.language || "en",
      });
    } catch (err) {
      console.error("Business profile load error:", err);

      // New user without business
      if (err?.response?.status === 404) {
        setHasBusiness(false);
        setIsEditing(true);
        setForm(initialForm);
        setError("");
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load business profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ======================================================
  // CHANGE
  // ======================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
    setError("");
  };

  // ======================================================
  // SAVE
  // ======================================================

  const handleSave = async () => {
    try {
      if (!form.name.trim()) {
        setError("Business name is required.");
        return;
      }

      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),

        legalName: form.legalName.trim(),

        businessType: form.businessType.trim(),

        industry: form.industry.trim(),

        email: form.email.trim(),

        phone: form.phone.trim(),

        website: form.website.trim(),

        gstNumber: form.gstNumber.trim(),

        panNumber: form.panNumber.trim(),

        registrationNumber: form.registrationNumber.trim(),

        description: form.description.trim(),

        address: {
          addressLine1: form.addressLine1.trim(),

          addressLine2: form.addressLine2.trim(),

          city: form.city.trim(),

          state: form.state.trim(),

          country: form.country.trim(),

          pincode: form.pincode.trim(),
        },

        socialLinks: {
          facebook: form.facebook.trim(),

          instagram: form.instagram.trim(),

          linkedin: form.linkedin.trim(),

          twitter: form.twitter.trim(),

          youtube: form.youtube.trim(),
        },

        settings: {
          currency: form.currency,

          timezone: form.timezone,

          language: form.language,
        },
      };

      let response;

      // ==================================================
      // CREATE / UPDATE
      // ==================================================

      if (hasBusiness) {
        response = await businessApi.updateProfile(payload);
      } else {
        response = await businessApi.createBusiness(payload);

        setHasBusiness(true);
      }

      const business = response?.data || {};

      setForm((prev) => ({
        ...prev,

        name: business.name ?? payload.name,

        legalName: business.legalName ?? payload.legalName,

        businessType: business.businessType ?? payload.businessType,

        industry: business.industry ?? payload.industry,

        email: business.email ?? payload.email,

        phone: business.phone ?? payload.phone,

        website: business.website ?? payload.website,

        gstNumber: business.gstNumber ?? payload.gstNumber,

        panNumber: business.panNumber ?? payload.panNumber,

        registrationNumber:
          business.registrationNumber ?? payload.registrationNumber,
      }));

      setIsEditing(false);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      console.error("Business save error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save business.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // CANCEL
  // ======================================================

  const handleCancel = () => {
    if (!hasBusiness) {
      return;
    }

    setIsEditing(false);
    setError("");

    loadProfile();
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading business profile...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />

            <h1 className="text-2xl font-bold text-gray-900">
              {hasBusiness ? "Business Profile" : "Create Business"}
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            {hasBusiness
              ? "Manage your business information and legal details."
              : "Create your business profile to continue."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Saved successfully
            </div>
          )}

          {!isEditing && hasBusiness ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <>
              {hasBusiness && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving
                  ? "Saving..."
                  : hasBusiness
                    ? "Save Changes"
                    : "Create Business"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Building2 className="h-8 w-8" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {form.name || "Your Business"}
              </h2>

              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                {hasBusiness ? "Business" : "Setup Required"}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {form.legalName || "Legal business name"}
            </p>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {form.email || "—"}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                {form.phone || "—"}
              </span>

              {form.website && (
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  {form.website}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 px-4 py-3">
            <p className="text-xs text-blue-600">Business Type</p>

            <p className="mt-1 font-semibold text-blue-900">
              {form.businessType || "Not specified"}
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* ==================================================
            LEFT
        ================================================== */}

        <div className="space-y-6 xl:col-span-2">
          {/* BASIC INFORMATION */}

          <SectionCard
            icon={Building2}
            title="Basic Information"
            description="General information about your business."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Business Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />

              <Input
                label="Legal Business Name"
                name="legalName"
                value={form.legalName}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <Select
                label="Business Type"
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
                disabled={!isEditing}
                options={[
                  "Sole Proprietorship",
                  "Partnership",
                  "LLP",
                  "Private Limited",
                  "Public Limited",
                  "Other",
                ]}
              />

              <Input
                label="Industry"
                name="industry"
                value={form.industry}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <Input
                label="Business Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={!isEditing}
                type="email"
              />

              <Input
                label="Business Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <div className="md:col-span-2">
                <Input
                  label="Business Website"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Business Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Describe your business..."
                />
              </div>
            </div>
          </SectionCard>

          {/* LEGAL */}

          <SectionCard
            icon={FileText}
            title="Legal & Tax Information"
            description="GST, PAN and company registration information."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="GST Number"
                name="gstNumber"
                value={form.gstNumber}
                onChange={handleChange}
                disabled={!isEditing}
                icon={CreditCard}
              />

              <Input
                label="PAN Number"
                name="panNumber"
                value={form.panNumber}
                onChange={handleChange}
                disabled={!isEditing}
                icon={Hash}
              />

              <div className="md:col-span-2">
                <Input
                  label="CIN / Registration Number"
                  name="registrationNumber"
                  value={form.registrationNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={Landmark}
                />
              </div>
            </div>
          </SectionCard>

          {/* ADDRESS */}

          <SectionCard
            icon={MapPin}
            title="Business Address"
            description="Registered or primary business address."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  label="Address Line 1"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Address Line 2"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <Input
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <Input
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <Input
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <Input
                label="Pincode"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </SectionCard>

          {/* SOCIAL */}

          <SectionCard
            icon={Globe}
            title="Social Links"
            description="Connect your business social media profiles."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Facebook"
                name="facebook"
                value={form.facebook}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <Input
                label="Instagram"
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <Input
                label="LinkedIn"
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <Input
                label="Twitter / X"
                name="twitter"
                value={form.twitter}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <Input
                label="YouTube"
                name="youtube"
                value={form.youtube}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </SectionCard>
        </div>

        {/* ==================================================
            RIGHT
        ================================================== */}

        <div className="space-y-6">
          {/* OWNER */}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Business Owner</h2>

              <p className="mt-1 text-sm text-gray-500">
                Primary owner of this business.
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  <User className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-medium text-gray-900">Account Owner</p>

                  <p className="mt-0.5 text-xs text-gray-500">Owner</p>
                </div>
              </div>

              <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {form.email || "—"}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {form.phone || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* DETAILS */}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Business Details</h2>
            </div>

            <div className="divide-y divide-gray-100">
              <InfoRow
                icon={BriefcaseBusiness}
                label="Business Type"
                value={form.businessType || "—"}
              />

              <InfoRow
                icon={Building2}
                label="Industry"
                value={form.industry || "—"}
              />

              <InfoRow
                icon={MapPin}
                label="Location"
                value={
                  [form.city, form.state].filter(Boolean).join(", ") || "—"
                }
              />

              <InfoRow
                icon={Globe}
                label="Country"
                value={form.country || "India"}
              />
            </div>
          </div>

          {/* VERIFICATION */}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Verification</h2>

              <p className="mt-1 text-sm text-gray-500">
                Business verification status.
              </p>
            </div>

            <div className="space-y-3 p-5">
              <VerificationItem
                label="Email Added"
                verified={Boolean(form.email)}
              />

              <VerificationItem
                label="Phone Added"
                verified={Boolean(form.phone)}
              />

              <VerificationItem
                label="GST Added"
                verified={Boolean(form.gstNumber)}
              />

              <VerificationItem
                label="Business Profile"
                verified={Boolean(form.name)}
              />
            </div>
          </div>

          {/* SETTINGS */}

          <button
            type="button"
            onClick={() => {
              window.location.href = "/settings/business";
            }}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Business Settings
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  Manage advanced settings
                </p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================================================
// SECTION CARD
// ======================================================

const SectionCard = ({ icon: Icon, title, description, children }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>

          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
};

// ======================================================
// INPUT
// ======================================================

const Input = ({
  label,
  name,
  value,
  onChange,
  disabled,
  type = "text",
  icon: Icon,
  required = false,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full rounded-lg border border-gray-200 bg-white py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${
            Icon ? "pl-9 pr-3" : "px-3"
          }`}
        />
      </div>
    </div>
  );
};

// ======================================================
// SELECT
// ======================================================

const Select = ({ label, name, value, onChange, disabled, options }) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
      >
        <option value="">Select {label}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

// ======================================================
// INFO ROW
// ======================================================

const InfoRow = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />

      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400">{label}</p>

        <p className="mt-0.5 truncate text-sm font-medium text-gray-700">
          {value}
        </p>
      </div>
    </div>
  );
};

// ======================================================
// VERIFICATION ITEM
// ======================================================

const VerificationItem = ({ label, verified }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>

      {verified ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Ready
        </span>
      ) : (
        <span className="text-xs text-gray-400">Pending</span>
      )}
    </div>
  );
};

export default BusinessProfile;
