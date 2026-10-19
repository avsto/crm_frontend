import React, { useEffect, useState } from "react";

import {
  ArrowLeft,
  Bell,
  Building2,
  Check,
  Globe,
  Lock,
  RefreshCw,
  Receipt,
  Save,
  Settings,
  Shield,
  Users,
  Wallet,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import businessApi from "../../api/business.api";

/*
|--------------------------------------------------------------------------
| DEFAULT SETTINGS
|--------------------------------------------------------------------------
*/

const defaultSettings = {
  currency: "USD",
  timezone: "UTC",
  language: "en",

  emailNotifications: true,
  orderNotifications: true,
  leadNotifications: true,
  marketingNotifications: false,

  publicProfile: true,
  businessDirectory: true,

  twoFactorRequired: false,
  allowStaffAccess: true,

  invoicePrefix: "INV",
  orderPrefix: "ORD",

  taxEnabled: false,
  gstEnabled: false,
};

/*
|--------------------------------------------------------------------------
| DEFAULT BUSINESS
|--------------------------------------------------------------------------
*/

const defaultBusiness = {
  _id: "",
  name: "",
  legalName: "",
  businessType: "",
  industry: "",
  description: "",
  email: "",
  phone: "",
  website: "",
  logo: null,
  owner: null,

  subscription: {
    plan: "free",
    status: "trial",
    billingCycle: "monthly",
    amount: 0,
    currency: "USD",
    trialStartDate: null,
    trialEndDate: null,
    startDate: null,
    endDate: null,
    nextBillingDate: null,
    provider: "none",
    autoRenew: true,
  },

  limits: {
    users: 1,
    products: 100,
    orders: 100,
    leads: 100,
    websites: 0,
    whatsappMessages: 0,
    automation: false,
    customDomain: false,
  },

  settings: defaultSettings,

  status: "active",

  createdBy: null,
  updatedBy: null,

  isDeleted: false,
  deletedAt: null,

  createdAt: null,
  updatedAt: null,
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

const BusinessSettings = () => {
  const navigate = useNavigate();

  const [business, setBusiness] = useState(defaultBusiness);

  const [form, setForm] = useState(defaultSettings);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [activeSection, setActiveSection] = useState("general");

  /*
  |--------------------------------------------------------------------------
  | LOAD SETTINGS
  |--------------------------------------------------------------------------
  */

  const loadSettings = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccess("");

      const response = await businessApi.getProfile();

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load business profile");
      }

      /*
      |--------------------------------------------------------------------------
      | API RESPONSE:
      |
      | {
      |   success: true,
      |   message: "...",
      |   data: {
      |      _id,
      |      name,
      |      subscription,
      |      limits,
      |      settings
      |   }
      | }
      |--------------------------------------------------------------------------
      */

      const data = response?.data || {};

      const settings = data?.settings || {};

      setBusiness({
        ...defaultBusiness,
        ...data,

        subscription: {
          ...defaultBusiness.subscription,
          ...(data?.subscription || {}),
        },

        limits: {
          ...defaultBusiness.limits,
          ...(data?.limits || {}),
        },

        settings: {
          ...defaultSettings,
          ...settings,
        },
      });

      setForm({
        ...defaultSettings,
        ...settings,
      });
    } catch (err) {
      console.error("Business settings load error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load business settings",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadSettings();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CHANGE FIELD
  |--------------------------------------------------------------------------
  */

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    try {
      setSaving(true);

      setError("");
      setSuccess("");

      const payload = {
        settings: {
          currency: form.currency,

          timezone: form.timezone,

          language: form.language,

          emailNotifications: form.emailNotifications,

          orderNotifications: form.orderNotifications,

          leadNotifications: form.leadNotifications,

          marketingNotifications: form.marketingNotifications,

          publicProfile: form.publicProfile,

          businessDirectory: form.businessDirectory,

          twoFactorRequired: form.twoFactorRequired,

          allowStaffAccess: form.allowStaffAccess,

          invoicePrefix: form.invoicePrefix,

          orderPrefix: form.orderPrefix,

          taxEnabled: form.taxEnabled,

          gstEnabled: form.gstEnabled,
        },
      };

      const response = await businessApi.updateProfile(payload);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to update business settings",
        );
      }

      const updatedBusiness = response?.data || business;

      const updatedSettings = updatedBusiness?.settings || form;

      setBusiness((previous) => ({
        ...previous,
        ...updatedBusiness,

        subscription: {
          ...previous.subscription,
          ...(updatedBusiness?.subscription || {}),
        },

        limits: {
          ...previous.limits,
          ...(updatedBusiness?.limits || {}),
        },

        settings: {
          ...defaultSettings,
          ...updatedSettings,
        },
      }));

      setForm({
        ...defaultSettings,
        ...updatedSettings,
      });

      setSuccess("Business settings updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Business settings save error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update business settings",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESET
  |--------------------------------------------------------------------------
  */

  const handleReset = () => {
    setForm({
      ...defaultSettings,
      ...(business?.settings || {}),
    });

    setError("");
    setSuccess("");
  };

  /*
  |--------------------------------------------------------------------------
  | WEBSITE URL
  |--------------------------------------------------------------------------
  */

  const websiteUrl = (() => {
    if (!business?.website) {
      return "";
    }

    if (
      business.website.startsWith("http://") ||
      business.website.startsWith("https://")
    ) {
      return business.website;
    }

    return `https://${business.website}`;
  })();

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    try {
      return new Date(date).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SECTIONS
  |--------------------------------------------------------------------------
  */

  const sections = [
    {
      key: "general",
      label: "General",
      icon: Settings,
    },

    {
      key: "documents",
      label: "Documents",
      icon: Receipt,
    },

    {
      key: "notifications",
      label: "Notifications",
      icon: Bell,
    },

    {
      key: "visibility",
      label: "Visibility",
      icon: Globe,
    },

    {
      key: "tax",
      label: "Tax & Billing",
      icon: Wallet,
    },

    {
      key: "security",
      label: "Security & Access",
      icon: Shield,
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <RefreshCw size={18} className="animate-spin" />
          Loading business settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------------------------ */}

      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/business")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                title="Back"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-xl font-semibold text-slate-900">
                    Business Settings
                  </h1>

                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-700">
                    {business.status || "active"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your business preferences and workspace settings.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => loadSettings(true)}
                disabled={refreshing}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="hidden rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:block"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ALERTS */}
      {/* ------------------------------------------------------------------ */}

      <div className="px-6 pt-5">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <Check size={16} />

            {success}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CONTENT */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-1 gap-6 px-6 pb-8 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        {/* ---------------------------------------------------------------- */}
        {/* LEFT NAV */}
        {/* ---------------------------------------------------------------- */}

        <aside>
          <div className="rounded-xl border border-slate-200 bg-white p-2">
            {sections.map((section) => {
              const Icon = section.icon;

              const active = activeSection === section.key;

              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={17} />

                  {section.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ---------------------------------------------------------------- */}
        {/* MAIN */}
        {/* ---------------------------------------------------------------- */}

        <main>
          {/* ============================================================= */}
          {/* GENERAL */}
          {/* ============================================================= */}

          {activeSection === "general" && (
            <div className="space-y-6">
              {/* GENERAL SETTINGS */}

              <SettingCard
                icon={Settings}
                title="General Settings"
                description="Configure language, currency and timezone."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <SelectField
                    label="Currency"
                    value={form.currency}
                    onChange={(value) => handleChange("currency", value)}
                  >
                    <option value="USD">USD - US Dollar</option>

                    <option value="INR">INR - Indian Rupee</option>

                    <option value="EUR">EUR - Euro</option>

                    <option value="GBP">GBP - British Pound</option>

                    <option value="AED">AED - UAE Dirham</option>
                  </SelectField>

                  <SelectField
                    label="Language"
                    value={form.language}
                    onChange={(value) => handleChange("language", value)}
                  >
                    <option value="en">English</option>

                    <option value="hi">हिन्दी</option>

                    <option value="ar">العربية</option>

                    <option value="fr">Français</option>
                  </SelectField>

                  <div className="md:col-span-2">
                    <SelectField
                      label="Timezone"
                      value={form.timezone}
                      onChange={(value) => handleChange("timezone", value)}
                    >
                      <option value="UTC">UTC</option>

                      <option value="Asia/Kolkata">Asia/Kolkata</option>

                      <option value="Asia/Dubai">Asia/Dubai</option>

                      <option value="Asia/Singapore">Asia/Singapore</option>

                      <option value="Europe/London">Europe/London</option>

                      <option value="Europe/Paris">Europe/Paris</option>

                      <option value="America/New_York">America/New_York</option>

                      <option value="America/Los_Angeles">
                        America/Los_Angeles
                      </option>
                    </SelectField>
                  </div>
                </div>
              </SettingCard>

              {/* BUSINESS INFORMATION */}

              <SettingCard
                icon={Building2}
                title="Business Information"
                description="Basic information associated with your business."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <InfoItem label="Business Name" value={business.name} />

                  <InfoItem label="Legal Name" value={business.legalName} />

                  <InfoItem
                    label="Business Type"
                    value={business.businessType}
                  />

                  <InfoItem label="Industry" value={business.industry} />

                  <InfoItem label="Email" value={business.email} />

                  <InfoItem label="Phone" value={business.phone} />

                  <InfoItem
                    label="Website"
                    value={business.website}
                    link={websiteUrl}
                  />

                  <InfoItem label="Business ID" value={business._id} mono />
                </div>

                {business.description && (
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Description
                    </p>

                    <p className="text-sm leading-6 text-slate-700">
                      {business.description}
                    </p>
                  </div>
                )}

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => navigate("/business/profile")}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Edit Business Profile
                  </button>
                </div>
              </SettingCard>
            </div>
          )}

          {/* ============================================================= */}
          {/* DOCUMENTS */}
          {/* ============================================================= */}

          {activeSection === "documents" && (
            <SettingCard
              icon={Receipt}
              title="Document Settings"
              description="Configure document numbering prefixes."
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InputField
                  label="Invoice Prefix"
                  value={form.invoicePrefix}
                  onChange={(value) => handleChange("invoicePrefix", value)}
                  placeholder="INV"
                />

                <InputField
                  label="Order Prefix"
                  value={form.orderPrefix}
                  onChange={(value) => handleChange("orderPrefix", value)}
                  placeholder="ORD"
                />
              </div>

              <div className="mt-5 rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Preview
                </p>

                <div className="mt-2 flex flex-wrap gap-3">
                  <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800">
                    {form.invoicePrefix || "INV"}
                    -000001
                  </span>

                  <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800">
                    {form.orderPrefix || "ORD"}
                    -000001
                  </span>
                </div>
              </div>
            </SettingCard>
          )}

          {/* ============================================================= */}
          {/* NOTIFICATIONS */}
          {/* ============================================================= */}

          {activeSection === "notifications" && (
            <SettingCard
              icon={Bell}
              title="Notifications"
              description="Choose which business notifications you want to receive."
            >
              <ToggleRow
                label="Email Notifications"
                description="Receive important business notifications by email."
                value={form.emailNotifications}
                onChange={(value) => handleChange("emailNotifications", value)}
              />

              <ToggleRow
                label="Order Notifications"
                description="Get notified when orders are created or updated."
                value={form.orderNotifications}
                onChange={(value) => handleChange("orderNotifications", value)}
              />

              <ToggleRow
                label="Lead Notifications"
                description="Get notified about new and updated leads."
                value={form.leadNotifications}
                onChange={(value) => handleChange("leadNotifications", value)}
              />

              <ToggleRow
                label="Marketing Notifications"
                description="Receive marketing and campaign updates."
                value={form.marketingNotifications}
                onChange={(value) =>
                  handleChange("marketingNotifications", value)
                }
              />
            </SettingCard>
          )}

          {/* ============================================================= */}
          {/* VISIBILITY */}
          {/* ============================================================= */}

          {activeSection === "visibility" && (
            <SettingCard
              icon={Globe}
              title="Business Visibility"
              description="Control how your business appears across the platform."
            >
              <ToggleRow
                label="Public Profile"
                description="Allow customers to view your public business profile."
                value={form.publicProfile}
                onChange={(value) => handleChange("publicProfile", value)}
              />

              <ToggleRow
                label="Business Directory"
                description="Show your business in the AvstoMart business directory."
                value={form.businessDirectory}
                onChange={(value) => handleChange("businessDirectory", value)}
              />
            </SettingCard>
          )}

          {/* ============================================================= */}
          {/* TAX */}
          {/* ============================================================= */}

          {activeSection === "tax" && (
            <SettingCard
              icon={Wallet}
              title="Tax & Billing"
              description="Configure tax and billing preferences."
            >
              <ToggleRow
                label="Enable Tax"
                description="Enable tax calculations for orders and invoices."
                value={form.taxEnabled}
                onChange={(value) => handleChange("taxEnabled", value)}
              />

              <ToggleRow
                label="Enable GST"
                description="Enable GST-related calculations and documents."
                value={form.gstEnabled}
                onChange={(value) => handleChange("gstEnabled", value)}
              />
            </SettingCard>
          )}

          {/* ============================================================= */}
          {/* SECURITY */}
          {/* ============================================================= */}

          {activeSection === "security" && (
            <SettingCard
              icon={Shield}
              title="Security & Access"
              description="Manage staff access and security requirements."
            >
              <ToggleRow
                label="Require Two-Factor Authentication"
                description="Require team members to use two-factor authentication."
                value={form.twoFactorRequired}
                onChange={(value) => handleChange("twoFactorRequired", value)}
              />

              <ToggleRow
                label="Allow Staff Access"
                description="Allow staff members to access business resources."
                value={form.allowStaffAccess}
                onChange={(value) => handleChange("allowStaffAccess", value)}
              />
            </SettingCard>
          )}
        </main>

        {/* ---------------------------------------------------------------- */}
        {/* RIGHT SIDEBAR */}
        {/* ---------------------------------------------------------------- */}

        <aside className="space-y-5">
          {/* BUSINESS CARD */}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-50 text-blue-600">
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.name || "Business"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 size={21} />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {business.name || "Your Business"}
                </p>

                <p className="text-xs text-slate-500">Business account</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <ContactRow
                label="Email"
                value={business.email || "Not available"}
              />

              <ContactRow
                label="Phone"
                value={business.phone || "Not available"}
              />

              <ContactRow
                label="Industry"
                value={business.industry || "Not specified"}
              />
            </div>
          </div>

          {/* SUBSCRIPTION */}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <Wallet size={19} />
              </div>

              <div>
                <p className="font-semibold text-slate-900">Subscription</p>

                <p className="text-xs text-slate-500">Current plan</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <SideRow
                label="Plan"
                value={business.subscription?.plan || "free"}
                capitalize
              />

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Status</span>

                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium capitalize text-emerald-700">
                  {business.subscription?.status || "trial"}
                </span>
              </div>

              <SideRow
                label="Billing"
                value={business.subscription?.billingCycle || "monthly"}
                capitalize
              />

              <SideRow
                label="Amount"
                value={`${business.subscription?.currency || "USD"} ${
                  business.subscription?.amount ?? 0
                }`}
              />

              {business.subscription?.trialEndDate && (
                <SideRow
                  label="Trial Ends"
                  value={formatDate(business.subscription.trialEndDate)}
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate("/settings/billing")}
              className="mt-5 flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Manage Billing
            </button>
          </div>

          {/* PLAN LIMITS */}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Users size={19} />
              </div>

              <div>
                <p className="font-semibold text-slate-900">Plan Limits</p>

                <p className="text-xs text-slate-500">Current plan limits</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <LimitRow label="Users" value={business.limits?.users} />

              <LimitRow label="Products" value={business.limits?.products} />

              <LimitRow label="Orders" value={business.limits?.orders} />

              <LimitRow label="Leads" value={business.limits?.leads} />

              <LimitRow label="Websites" value={business.limits?.websites} />

              <LimitRow
                label="WhatsApp"
                value={business.limits?.whatsappMessages}
              />

              <LimitRow
                label="Automation"
                value={business.limits?.automation ? "Enabled" : "Disabled"}
              />

              <LimitRow
                label="Custom Domain"
                value={business.limits?.customDomain ? "Enabled" : "Disabled"}
              />
            </div>
          </div>

          {/* ACCOUNT */}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Lock size={17} className="text-slate-500" />

              <p className="font-semibold text-slate-900">Account</p>
            </div>

            <div className="space-y-3">
              <SideRow label="Created" value={formatDate(business.createdAt)} />

              <SideRow label="Updated" value={formatDate(business.updatedAt)} />

              <SideRow
                label="Status"
                value={business.status || "active"}
                capitalize
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| SETTING CARD
|--------------------------------------------------------------------------
*/

const SettingCard = ({ icon: Icon, title, description, children }) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon size={18} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">{title}</h2>

            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
};

/*
|--------------------------------------------------------------------------
| SELECT FIELD
|--------------------------------------------------------------------------
*/

const SelectField = ({ label, value, onChange, children }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| INPUT FIELD
|--------------------------------------------------------------------------
*/

const InputField = ({ label, value, onChange, placeholder }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="text"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| TOGGLE
|--------------------------------------------------------------------------
*/

const ToggleRow = ({ label, description, value, onChange }) => {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-slate-100 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{label}</p>

        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          value ? "bg-blue-600" : "bg-slate-300"
        }`}
        aria-label={label}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            value ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| INFO ITEM
|--------------------------------------------------------------------------
*/

const InfoItem = ({ label, value, link, mono = false }) => {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      {link && value ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="break-all text-sm font-medium text-blue-600 hover:underline"
        >
          {value}
        </a>
      ) : (
        <p
          className={`break-all text-sm font-medium text-slate-900 ${
            mono ? "font-mono text-xs" : ""
          }`}
        >
          {value || "Not available"}
        </p>
      )}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| CONTACT ROW
|--------------------------------------------------------------------------
*/

const ContactRow = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-0.5 break-all text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| SIDE ROW
|--------------------------------------------------------------------------
*/

const SideRow = ({ label, value, capitalize = false }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-500">{label}</span>

      <span
        className={`text-right text-sm font-medium text-slate-900 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| LIMIT ROW
|--------------------------------------------------------------------------
*/

const LimitRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="text-sm font-medium text-slate-900">
        {value === undefined || value === null ? "—" : value}
      </span>
    </div>
  );
};

export default BusinessSettings;
