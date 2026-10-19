import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
  LayoutTemplate,
  Palette,
  Link2,
  X,
  AlertCircle,
  Info,
} from "lucide-react";

import websiteApi from "../../api/website.api";

// ======================================================
// THEMES
// ======================================================

const themes = [
  {
    id: "modern-commerce",
    name: "Modern Commerce",
    description: "Clean and modern ecommerce website theme.",
  },
  {
    id: "business-pro",
    name: "Business Pro",
    description: "Professional theme for business websites.",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and lightweight website theme.",
  },
];

// ======================================================
// NOTIFICATION
// ======================================================

const Notification = ({ notification, onClose, onUpgrade }) => {
  if (!notification) return null;

  const isLimitError = notification.type === "limit";

  return (
    <div className="fixed right-4 top-4 z-[9999] w-[calc(100%-2rem)] max-w-md">
      <div
        className={`overflow-hidden rounded-xl border bg-white shadow-2xl ${
          isLimitError ? "border-red-200" : "border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isLimitError
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {isLimitError ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <Info className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              {notification.title}
            </h3>

            <p className="mt-1 text-sm leading-5 text-gray-600">
              {notification.message}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Limit Information */}
        {isLimitError && notification.data && (
          <div className="mx-4 mb-4 rounded-lg bg-red-50 p-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase text-gray-500">
                  Plan
                </p>
                <p className="mt-1 text-sm font-bold capitalize text-gray-900">
                  {notification.data.plan || "-"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase text-gray-500">
                  Used
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {notification.data.used ?? 0}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase text-gray-500">
                  Limit
                </p>
                <p className="mt-1 text-sm font-bold text-red-600">
                  {notification.data.limit === -1
                    ? "Unlimited"
                    : (notification.data.limit ?? 0)}
                </p>
              </div>
            </div>

            {notification.data.remaining !== undefined && (
              <div className="mt-3 border-t border-red-100 pt-3">
                <p className="text-xs text-red-700">
                  Remaining websites:{" "}
                  <strong>{notification.data.remaining}</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {isLimitError && (
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onUpgrade}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Upgrade Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ======================================================
// COMPONENT
// ======================================================

const CreateWebsite = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    theme: "minimal",
    domain: "",
  });

  const [errors, setErrors] = useState({});

  const [notification, setNotification] = useState(null);

  // ======================================================
  // SHOW NOTIFICATION
  // ======================================================

  const showNotification = ({
    type = "error",
    title = "Something went wrong",
    message = "",
    data = null,
  }) => {
    setNotification({
      type,
      title,
      message,
      data,
    });
  };

  // ======================================================
  // CLOSE NOTIFICATION
  // ======================================================

  const closeNotification = () => {
    setNotification(null);
  };

  // ======================================================
  // UPGRADE
  // ======================================================

  const handleUpgrade = () => {
    setNotification(null);

    // Apne actual pricing route ke according change kar sakte ho
    navigate("/subscription");
  };

  // ======================================================
  // SLUG GENERATOR
  // ======================================================

  const generateSlug = (value) => {
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setForm((prev) => ({
      ...prev,
      name: value,
      slug,
    }));

    setErrors((prev) => ({
      ...prev,
      name: "",
      slug: "",
    }));

    setNotification(null);
  };

  // ======================================================
  // UPDATE FIELD
  // ======================================================

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setNotification(null);
  };

  // ======================================================
  // VALIDATE
  // ======================================================

  const validate = () => {
    const nextErrors = {};

    if (step === 1) {
      if (!form.name.trim()) {
        nextErrors.name = "Website name is required.";
      }

      if (!form.slug.trim()) {
        nextErrors.slug = "Website slug is required.";
      }
    }

    if (step === 2) {
      if (!form.theme) {
        nextErrors.theme = "Please select a theme.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  // ======================================================
  // NEXT
  // ======================================================

  const nextStep = () => {
    if (!validate()) return;

    setStep((prev) => Math.min(prev + 1, 3));
  };

  // ======================================================
  // BACK
  // ======================================================

  const backStep = () => {
    if (step === 1) {
      navigate("/website");
      return;
    }

    setStep((prev) => prev - 1);
  };

  // ======================================================
  // CREATE WEBSITE
  // ======================================================

  const createWebsite = async () => {
    if (!validate()) return;

    setCreating(true);
    setNotification(null);

    try {
      const selectedTheme = themes.find((theme) => theme.id === form.theme);

      // ==================================================
      // PAYLOAD
      // ==================================================

      const payload = {
        name: form.name.trim(),

        slug: form.slug.trim(),

        theme: selectedTheme?.id || "minimal",

        themeName: selectedTheme?.name || "Minimal",

        domain: form.domain.trim(),

        seo: {
          title: form.name.trim(),
          description: "",
          keywords: "",
        },

        navigation: [
          {
            id: "home",
            label: "Home",
            url: "/",
            type: "page",
            sortOrder: 0,
          },
        ],

        settings: {
          maintenanceMode: false,
          showPoweredBy: true,
        },
      };

      console.log("CREATE WEBSITE PAYLOAD:", payload);

      // ==================================================
      // API
      // ==================================================

      const response = await websiteApi.createWebsite(payload);

      console.log("CREATE WEBSITE RESPONSE:", response);

      const website = response?.data?.data;

      // ==================================================
      // CHECK RESPONSE
      // ==================================================

      if (!website?._id) {
        throw new Error("Website created but website ID was not returned.");
      }

      // ==================================================
      // SUCCESS NOTIFICATION
      // ==================================================

      showNotification({
        type: "success",
        title: "Website created",
        message: "Your website has been created successfully.",
      });

      // Small delay so success notification can be seen
      setTimeout(() => {
        navigate(`/website/${website._id}`);
      }, 700);
    } catch (error) {
      console.error("CREATE WEBSITE ERROR:", error);

      const responseData = error?.response?.data;

      // ==================================================
      // WEBSITE LIMIT ERROR
      // ==================================================

      if (responseData?.code === "WEBSITE_LIMIT_REACHED") {
        showNotification({
          type: "limit",
          title: "Website limit reached",
          message:
            responseData?.message ||
            "You have reached the website limit for your current plan.",
          data: responseData?.data || null,
        });

        return;
      }

      // ==================================================
      // DUPLICATE SLUG
      // ==================================================

      if (error?.response?.status === 409) {
        showNotification({
          type: "error",
          title: "Website already exists",
          message:
            responseData?.message || "A website with this slug already exists.",
        });

        return;
      }

      // ==================================================
      // VALIDATION ERROR
      // ==================================================

      if (error?.response?.status === 400) {
        showNotification({
          type: "error",
          title: "Invalid website details",
          message:
            responseData?.message ||
            "Please check your website details and try again.",
        });

        return;
      }

      // ==================================================
      // DEFAULT ERROR
      // ==================================================

      showNotification({
        type: "error",
        title: "Unable to create website",
        message:
          responseData?.message ||
          responseData?.error ||
          error?.message ||
          "Failed to create website. Please try again.",
      });
    } finally {
      setCreating(false);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* ==================================================
          NOTIFICATION
      ================================================== */}

      <Notification
        notification={notification}
        onClose={closeNotification}
        onUpgrade={handleUpgrade}
      />

      <div className="mx-auto max-w-5xl">
        {/* BACK */}

        <button
          type="button"
          onClick={backStep}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* HEADER */}

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">Create Website</h1>

          <p className="mt-1 text-sm text-gray-500">
            Create your business website in a few simple steps.
          </p>
        </div>

        {/* STEPS */}
        <div className="mb-8 flex items-center">
          <Step
            number={1}
            title="Details"
            active={step >= 1}
            current={step === 1}
          />

          <StepLine active={step >= 2} />

          <Step
            number={2}
            title="Theme"
            active={step >= 2}
            current={step === 2}
          />

          <StepLine active={step >= 3} />

          <Step
            number={3}
            title="Review"
            active={step >= 3}
            current={step === 3}
          />
        </div>

        {/* CARD */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* ==================================================
              STEP 1
          ================================================== */}

          {step === 1 && (
            <div className="p-6 md:p-8">
              <SectionHeader
                icon={Globe}
                title="Website Details"
                description="Enter the basic information for your website."
              />

              <div className="mt-7 max-w-2xl space-y-5">
                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Website Name
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => generateSlug(e.target.value)}
                    placeholder="e.g. Avsto Business Website"
                    className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                      errors.name ? "border-red-400" : "border-gray-200"
                    }`}
                  />

                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* SLUG */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Website Slug
                  </label>

                  <div className="flex">
                    <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                      yourbusiness.com/
                    </span>

                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) =>
                        updateField(
                          "slug",
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-")
                            .replace(/-+/g, "-")
                            .replace(/^-+|-+$/g, ""),
                        )
                      }
                      className={`min-w-0 flex-1 rounded-r-lg border px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                        errors.slug ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                  </div>

                  {errors.slug && (
                    <p className="mt-1 text-xs text-red-600">{errors.slug}</p>
                  )}
                </div>

                {/* DOMAIN */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Custom Domain
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      Optional
                    </span>
                  </label>

                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      value={form.domain}
                      onChange={(e) => updateField("domain", e.target.value)}
                      placeholder="www.example.com"
                      className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    You can connect a domain later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              STEP 2
          ================================================== */}

          {step === 2 && (
            <div className="p-6 md:p-8">
              <SectionHeader
                icon={Palette}
                title="Choose Theme"
                description="Select the starting design for your website."
              />

              <div className="mt-7 grid gap-5 md:grid-cols-3">
                {themes.map((theme) => {
                  const selected = form.theme === theme.id;

                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => updateField("theme", theme.id)}
                      className={`overflow-hidden rounded-xl border text-left transition ${
                        selected
                          ? "border-blue-600 ring-2 ring-blue-100"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100">
                        <LayoutTemplate className="h-12 w-12 text-blue-500" />
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {theme.name}
                          </h3>

                          {selected && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs leading-5 text-gray-500">
                          {theme.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {errors.theme && (
                <p className="mt-3 text-xs text-red-600">{errors.theme}</p>
              )}
            </div>
          )}

          {/* ==================================================
              STEP 3
          ================================================== */}

          {step === 3 && (
            <div className="p-6 md:p-8">
              <SectionHeader
                icon={Check}
                title="Review Website"
                description="Review your website before creating it."
              />

              <div className="mt-7 max-w-2xl overflow-hidden rounded-xl border border-gray-200">
                <ReviewRow label="Website Name" value={form.name} />

                <ReviewRow label="Slug" value={form.slug} />

                <ReviewRow
                  label="Theme"
                  value={
                    themes.find((theme) => theme.id === form.theme)?.name || "-"
                  }
                />

                <ReviewRow
                  label="Domain"
                  value={form.domain || "Will connect later"}
                />
              </div>

              <div className="mt-5 rounded-xl bg-blue-50 p-5">
                <p className="text-sm font-semibold text-blue-900">
                  Ready to create your website
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  After creation you can manage pages, theme, domain,
                  navigation, SEO and settings.
                </p>
              </div>
            </div>
          )}

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={backStep}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={creating}
                onClick={createWebsite}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Create Website
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ======================================================
// SECTION HEADER
// ======================================================

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
      <Icon className="h-5 w-5" />
    </div>

    <div>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>

      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  </div>
);

// ======================================================
// STEP
// ======================================================

const Step = ({ number, title, active, current }) => (
  <div className="flex items-center gap-2">
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
        current
          ? "bg-blue-600 text-white"
          : active
            ? "bg-blue-100 text-blue-600"
            : "bg-gray-100 text-gray-400"
      }`}
    >
      {active && !current ? <Check className="h-4 w-4" /> : number}
    </div>

    <span
      className={`hidden text-xs font-medium sm:block ${
        current ? "text-gray-900" : "text-gray-400"
      }`}
    >
      {title}
    </span>
  </div>
);

// ======================================================
// STEP LINE
// ======================================================

const StepLine = ({ active }) => (
  <div
    className={`mx-2 h-px flex-1 ${active ? "bg-blue-500" : "bg-gray-200"}`}
  />
);

// ======================================================
// REVIEW ROW
// ======================================================

const ReviewRow = ({ label, value }) => (
  <div className="flex flex-col gap-1 border-b border-gray-100 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
    <span className="text-xs font-medium text-gray-500">{label}</span>

    <span className="break-all text-sm font-semibold text-gray-900">
      {value}
    </span>
  </div>
);

export default CreateWebsite;
