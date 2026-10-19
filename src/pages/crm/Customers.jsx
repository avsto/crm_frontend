import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
  AlertCircle,
  MapPin,
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  Share2,
} from "lucide-react";
import crmApi from "../../api/crm.api";

// ======================================================
// CONSTANTS
// ======================================================

const INITIAL_FORM = {
  name: "",
  customerCode: "",
  customerType: "individual",
  companyName: "",
  designation: "",
  email: "",
  phoneCountryCode: "+91",
  phone: "",
  alternatePhone: "",
  website: "",
  source: "manual",
  status: "active",
  billingAddress: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  },
  shippingAddress: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  },
  sameAsBillingAddress: true,
  taxNumber: "",
  paymentTerms: "due_on_receipt",
  creditLimit: 0,
  notes: "",
};

const STATUS_OPTIONS = [
  { label: "All Customers", value: "All" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Blocked", value: "blocked" },
];

const SOURCE_OPTIONS = [
  { label: "Manual", value: "manual" },
  { label: "Website", value: "website" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Facebook", value: "facebook" },
  { label: "Instagram", value: "instagram" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "Google", value: "google" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Referral", value: "referral" },
  { label: "Lead Conversion", value: "lead_conversion" },
  { label: "Campaign", value: "campaign" },
  { label: "Import", value: "import" },
  { label: "API", value: "api" },
  { label: "Other", value: "other" },
];

const PAYMENT_OPTIONS = [
  { label: "Due on Receipt", value: "due_on_receipt" },
  { label: "Net 7 Days", value: "net_7" },
  { label: "Net 15 Days", value: "net_15" },
  { label: "Net 30 Days", value: "net_30" },
  { label: "Net 45 Days", value: "net_45" },
  { label: "Net 60 Days", value: "net_60" },
  { label: "Custom", value: "custom" },
];

// ======================================================
// HELPERS
// ======================================================

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const getResponseList = (response) => {
  const body = response?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.customers)) return body.customers;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.results)) return body.results;
  return [];
};

const formatDate = (date) => {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value._id || value.id || "";
  return value;
};

const getInitials = (name) =>
  String(name || "C")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const normalizeCustomer = (customer) => ({
  ...customer,
  id: customer?._id || customer?.id,
  name: customer?.name || "Unnamed Customer",
  email: customer?.email || "",
  phone: customer?.phone || "",
  companyName: customer?.companyName || "",
  customerCode: customer?.customerCode || "",
  customerType: customer?.customerType || "individual",
  status: String(customer?.status || "active").toLowerCase(),
  source: customer?.source || "manual",
  assignedTo: customer?.assignedTo || null,
  tag: customer?.tag || null,
  createdAt: customer?.createdAt,
  updatedAt: customer?.updatedAt,
});

// ======================================================
// STATUS BADGE (Linear / Superlist Style)
// ======================================================

const StatusBadge = ({ status }) => {
  const dotColors = {
    active: "bg-emerald-500",
    inactive: "bg-amber-400",
    blocked: "bg-rose-500",
  };

  const label =
    {
      active: "Active",
      inactive: "Inactive",
      blocked: "Blocked",
    }[status] || status;

  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 capitalize">
      <span
        className={`h-2 w-2 rounded-full ${dotColors[status] || "bg-zinc-400"}`}
      />
      {label}
    </span>
  );
};

// ======================================================
// FORM FIELD COMPONENTS
// ======================================================

const Field = ({ label, required, children, className = "" }) => (
  <div className={className}>
    <label className="mb-1 block text-xs font-medium text-zinc-600">
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const inputClass =
  "h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-900/5";

const selectClass =
  "h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 text-xs text-zinc-800 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-900/5";

const textareaClass =
  "w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-900/5";

// ======================================================
// CUSTOMER DRAWER
// ======================================================

function CustomerDrawer({ open, customer, onClose, onSaved }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const editing = Boolean(customer);

  useEffect(() => {
    if (!open) return;

    if (customer) {
      setForm({
        ...INITIAL_FORM,
        ...customer,
        billingAddress: {
          ...INITIAL_FORM.billingAddress,
          ...(customer.billingAddress || {}),
        },
        shippingAddress: {
          ...INITIAL_FORM.shippingAddress,
          ...(customer.shippingAddress || {}),
        },
        sameAsBillingAddress: customer.sameAsBillingAddress ?? true,
        assignedTo: getId(customer.assignedTo),
        tag: getId(customer.tag),
        creditLimit: customer.creditLimit ?? 0,
      });
    } else {
      setForm({ ...INITIAL_FORM });
    }

    setError("");
  }, [open, customer]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateAddress = (addressType, field, value) => {
    setForm((current) => ({
      ...current,
      [addressType]: { ...current[addressType], [field]: value },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Customer name is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        customerCode: form.customerCode.trim() || null,
        companyName: form.companyName.trim() || null,
        designation: form.designation.trim() || null,
        alternatePhone: form.alternatePhone.trim() || null,
        website: form.website.trim() || null,
        taxNumber: form.taxNumber.trim() || null,
        notes: form.notes.trim() || null,
        creditLimit: Number(form.creditLimit) || 0,
        shippingAddress: form.sameAsBillingAddress
          ? { ...form.billingAddress }
          : { ...form.shippingAddress },
      };

      if (!payload.phone) {
        payload.phoneCountryCode = form.phoneCountryCode || "+91";
      }

      if (editing) {
        await crmApi.updateCustomer(customer.id, payload);
      } else {
        await crmApi.createCustomer(payload);
      }

      onSaved();
    } catch (err) {
      console.error("SAVE CUSTOMER ERROR:", err);
      setError(getErrorMessage(err, "Failed to save customer."));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-zinc-950/40 backdrop-blur-xs transition-opacity"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-[620px] flex-col bg-white shadow-2xl transition-transform"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
              <UserRound className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="customer-drawer-title"
                className="text-sm font-semibold text-zinc-900"
              >
                {editing ? "Edit Customer Record" : "New Customer"}
              </h2>
              <p className="text-[11px] text-zinc-500">
                {editing
                  ? "Update client record details."
                  : "Add a new client profile."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Basic Info */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Customer Name" required>
                  <input
                    required
                    autoFocus
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Full name"
                    className={inputClass}
                  />
                </Field>

                <Field label="Customer Code">
                  <input
                    value={form.customerCode}
                    onChange={(e) =>
                      updateField("customerCode", e.target.value)
                    }
                    placeholder="e.g. CUST-001"
                    className={inputClass}
                  />
                </Field>

                <Field label="Customer Type">
                  <select
                    value={form.customerType}
                    onChange={(e) =>
                      updateField("customerType", e.target.value)
                    }
                    className={selectClass}
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                  </select>
                </Field>

                <Field label="Company Name">
                  <input
                    value={form.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    placeholder="Company name"
                    className={inputClass}
                  />
                </Field>

                <Field label="Designation">
                  <input
                    value={form.designation}
                    onChange={(e) => updateField("designation", e.target.value)}
                    placeholder="Job title"
                    className={inputClass}
                  />
                </Field>

                <Field label="Website">
                  <input
                    type="text"
                    value={form.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://example.com"
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            <div className="border-t border-zinc-100" />

            {/* Contact Info */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Email Address">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="customer@example.com"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </Field>

                <Field label="Phone Number">
                  <div className="flex gap-2">
                    <input
                      aria-label="Country code"
                      value={form.phoneCountryCode}
                      onChange={(e) =>
                        updateField("phoneCountryCode", e.target.value)
                      }
                      className={`${inputClass} w-[70px] shrink-0 text-center font-medium`}
                    />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="Phone number"
                      className={inputClass}
                    />
                  </div>
                </Field>

                <Field label="Alternate Phone">
                  <input
                    type="tel"
                    value={form.alternatePhone}
                    onChange={(e) =>
                      updateField("alternatePhone", e.target.value)
                    }
                    placeholder="Alternate number"
                    className={inputClass}
                  />
                </Field>

                <Field label="Customer Source">
                  <select
                    value={form.source}
                    onChange={(e) => updateField("source", e.target.value)}
                    className={selectClass}
                  >
                    {SOURCE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            <div className="border-t border-zinc-100" />

            {/* Billing Address */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Billing Address
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Address Line 1" className="sm:col-span-2">
                  <input
                    value={form.billingAddress.addressLine1}
                    onChange={(e) =>
                      updateAddress(
                        "billingAddress",
                        "addressLine1",
                        e.target.value,
                      )
                    }
                    placeholder="Street address"
                    className={inputClass}
                  />
                </Field>

                <Field label="Address Line 2" className="sm:col-span-2">
                  <input
                    value={form.billingAddress.addressLine2}
                    onChange={(e) =>
                      updateAddress(
                        "billingAddress",
                        "addressLine2",
                        e.target.value,
                      )
                    }
                    placeholder="Apartment, suite, unit"
                    className={inputClass}
                  />
                </Field>

                <Field label="City">
                  <input
                    value={form.billingAddress.city}
                    onChange={(e) =>
                      updateAddress("billingAddress", "city", e.target.value)
                    }
                    placeholder="City"
                    className={inputClass}
                  />
                </Field>

                <Field label="State">
                  <input
                    value={form.billingAddress.state}
                    onChange={(e) =>
                      updateAddress("billingAddress", "state", e.target.value)
                    }
                    placeholder="State"
                    className={inputClass}
                  />
                </Field>

                <Field label="Postal Code">
                  <input
                    value={form.billingAddress.postalCode}
                    onChange={(e) =>
                      updateAddress(
                        "billingAddress",
                        "postalCode",
                        e.target.value,
                      )
                    }
                    placeholder="Postal code"
                    className={inputClass}
                  />
                </Field>

                <Field label="Country">
                  <input
                    value={form.billingAddress.country}
                    onChange={(e) =>
                      updateAddress("billingAddress", "country", e.target.value)
                    }
                    placeholder="Country"
                    className={inputClass}
                  />
                </Field>
              </div>

              <label className="mt-2 flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
                <input
                  type="checkbox"
                  checked={form.sameAsBillingAddress}
                  onChange={(e) =>
                    updateField("sameAsBillingAddress", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
                />
                <span className="text-xs font-medium text-zinc-700">
                  Shipping address matches billing address
                </span>
              </label>

              {!form.sameAsBillingAddress && (
                <div className="mt-3 space-y-3 rounded-lg border border-zinc-200 p-3 bg-zinc-50/30">
                  <h4 className="text-xs font-semibold text-zinc-700">
                    Shipping Address
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Address Line 1" className="sm:col-span-2">
                      <input
                        value={form.shippingAddress.addressLine1}
                        onChange={(e) =>
                          updateAddress(
                            "shippingAddress",
                            "addressLine1",
                            e.target.value,
                          )
                        }
                        placeholder="Street address"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Address Line 2" className="sm:col-span-2">
                      <input
                        value={form.shippingAddress.addressLine2}
                        onChange={(e) =>
                          updateAddress(
                            "shippingAddress",
                            "addressLine2",
                            e.target.value,
                          )
                        }
                        placeholder="Apartment, suite, unit"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="City">
                      <input
                        value={form.shippingAddress.city}
                        onChange={(e) =>
                          updateAddress(
                            "shippingAddress",
                            "city",
                            e.target.value,
                          )
                        }
                        placeholder="City"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="State">
                      <input
                        value={form.shippingAddress.state}
                        onChange={(e) =>
                          updateAddress(
                            "shippingAddress",
                            "state",
                            e.target.value,
                          )
                        }
                        placeholder="State"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Postal Code">
                      <input
                        value={form.shippingAddress.postalCode}
                        onChange={(e) =>
                          updateAddress(
                            "shippingAddress",
                            "postalCode",
                            e.target.value,
                          )
                        }
                        placeholder="Postal code"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Country">
                      <input
                        value={form.shippingAddress.country}
                        onChange={(e) =>
                          updateAddress(
                            "shippingAddress",
                            "country",
                            e.target.value,
                          )
                        }
                        placeholder="Country"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              )}
            </section>

            <div className="border-t border-zinc-100" />

            {/* Business & Payment */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Business & Payment Terms
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Tax / GST Number">
                  <input
                    value={form.taxNumber}
                    onChange={(e) => updateField("taxNumber", e.target.value)}
                    placeholder="GSTIN or tax number"
                    className={inputClass}
                  />
                </Field>

                <Field label="Payment Terms">
                  <select
                    value={form.paymentTerms}
                    onChange={(e) =>
                      updateField("paymentTerms", e.target.value)
                    }
                    className={selectClass}
                  >
                    {PAYMENT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Credit Limit">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.creditLimit}
                    onChange={(e) => updateField("creditLimit", e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </Field>

                <Field label="Customer Status">
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                    className={selectClass}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </Field>

                <Field label="Internal Notes" className="sm:col-span-2">
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Add notes about this customer..."
                    className={textareaClass}
                  />
                </Field>
              </div>
            </section>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/50 px-6 py-3.5">
            <span className="text-[11px] text-zinc-400">
              <span className="text-rose-500">*</span> Required fields
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="h-9 rounded-lg border border-zinc-200 bg-white px-3.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create Customer"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}

// ======================================================
// MAIN CUSTOMER PAGE (Superlist / Reference Layout Style)
// ======================================================

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        setError("");

        const params = {};
        if (search.trim()) params.search = search.trim();
        if (statusFilter !== "All") params.status = statusFilter;

        const response = await crmApi.getCustomers(params);
        const list = getResponseList(response);

        setCustomers(
          list.map(normalizeCustomer).filter((customer) => customer.id),
        );
      } catch (err) {
        console.error("FETCH CUSTOMERS ERROR:", err);
        setError(getErrorMessage(err, "Failed to load customers."));
        setCustomers([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      setActionLoading(id);
      await crmApi.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(getErrorMessage(err, "Failed to delete customer."));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Top Header / View Bar matching reference image */}
      <div className="border-b border-zinc-200 px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50">
              <span>All Customers</span>
              <span className="text-zinc-400 font-normal">
                {customers.length}
              </span>
            </button>
            <span className="text-zinc-300">|</span>
            <button
              onClick={() => fetchCustomers({ silent: true })}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition"
              title="Refresh list"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 shadow-2xs">
              <Share2 className="h-3.5 w-3.5 text-zinc-400" />
              <span>Share</span>
            </button>
            <button
              onClick={() => {
                setSelectedCustomer(null);
                setDrawerOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-zinc-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Add Customer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-toolbar with filter tabs and search */}
      <div className="border-b border-zinc-200 bg-zinc-50/50 px-6 py-2.5">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 overflow-x-auto">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                  statusFilter === opt.value
                    ? "bg-zinc-200/80 text-zinc-900 font-semibold"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="h-8 w-full rounded-md border border-zinc-200 bg-white pl-8 pr-3 text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400"
            />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-auto max-w-7xl mt-4 px-6">
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Table Container (Superlist / Reference Style) */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xs">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
              <p className="mt-2 text-xs text-zinc-500">
                Loading customers list...
              </p>
            </div>
          ) : customers.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center p-6 text-center">
              <Users className="h-8 w-8 text-zinc-300" />
              <h3 className="mt-3 text-sm font-semibold text-zinc-800">
                No customers found
              </h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-xs">
                {search
                  ? "No records matched your search query."
                  : "Get started by adding your first customer record."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-semibold text-zinc-500">
                    <th className="py-2.5 pl-4 pr-3">
                      <div className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-800">
                        <span>Customer Name</span>
                        <ArrowUpDown className="h-3 w-3 text-zinc-400" />
                      </div>
                    </th>
                    <th className="px-3 py-2.5">Contact Details</th>
                    <th className="px-3 py-2.5">Company / Code</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Created Date</th>
                    <th className="py-2.5 pl-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs text-zinc-800">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="group transition-colors hover:bg-zinc-50/80"
                    >
                      <td className="py-3 pl-4 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[11px] font-semibold text-zinc-700">
                            {getInitials(customer.name)}
                          </div>
                          <div>
                            <span className="font-medium text-zinc-900 group-hover:underline cursor-pointer">
                              {customer.name}
                            </span>
                            <span className="block text-[10px] text-zinc-400 capitalize">
                              {customer.customerType}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-zinc-600">
                        <div className="font-medium text-zinc-900">
                          {customer.email || "-"}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {customer.phone
                            ? `${customer.phoneCountryCode || ""} ${customer.phone}`
                            : "No phone"}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-zinc-600">
                        <div className="font-medium text-zinc-900">
                          {customer.companyName || "-"}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400">
                          {customer.customerCode || "-"}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <StatusBadge status={customer.status} />
                      </td>

                      <td className="px-3 py-3 text-zinc-500">
                        {formatDate(customer.createdAt)}
                      </td>

                      <td className="py-3 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setDrawerOpen(true);
                            }}
                            className="rounded p-1.5 text-zinc-400 transition hover:bg-zinc-200/60 hover:text-zinc-700"
                            title="Edit customer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            disabled={actionLoading === customer.id}
                            className="rounded p-1.5 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                            title="Delete customer"
                          >
                            {actionLoading === customer.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Drawer Component */}
      <CustomerDrawer
        open={drawerOpen}
        customer={selectedCustomer}
        onClose={() => setDrawerOpen(false)}
        onSaved={() => {
          setDrawerOpen(false);
          fetchCustomers({ silent: true });
        }}
      />
    </div>
  );
}
