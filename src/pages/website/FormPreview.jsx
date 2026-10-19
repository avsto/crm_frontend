
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const FormPreview = () => {
  const { formId, slug } = useParams();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ==================================================
  // FETCH FORM
  // ==================================================

  useEffect(() => {
    fetchForm();
  }, [formId, slug]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * Recommended:
       * Route should be /forms/:formId
       *
       * If your route currently contains the ID:
       * /forms/6a943499f287c92fb80273d0
       */

      const id = formId || slug;

      if (!id) {
        throw new Error("Form ID is missing");
      }

      const response = await fetch(
        `${API_BASE_URL}/webhooks/form/${id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch form"
        );
      }

      setForm(result.data);

      // Initialize form values
      initializeFormData(result.data);
    } catch (err) {
      console.error("Fetch form error:", err);

      setError(
        err.message || "Unable to load this form"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // INITIALIZE FORM DATA
  // ==================================================

  const initializeFormData = (formDataResponse) => {
    const initialData = {};

    const fields = formDataResponse?.fields || {};

    Object.entries(fields).forEach(
      ([key, field]) => {
        if (field?.enabled) {
          initialData[key] = "";
        }
      }
    );

    const customFields =
      formDataResponse?.customFields || [];

    customFields.forEach((field) => {
      const key =
        field.name ||
        field.key ||
        field.slug;

      if (key) {
        initialData[key] = "";
      }
    });

    setFormData(initialData);
  };

  // ==================================================
  // INPUT CHANGE
  // ==================================================

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form) return;

    try {
      setSubmitting(true);
      setError("");

      /*
       * Submit to the same form endpoint.
       *
       * GET  -> Fetch form
       * POST -> Submit form
       */

      const response = await fetch(
        `${API_BASE_URL}/webhooks/form/${form._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Form submission failed"
        );
      }

      setSubmitted(true);

      // Redirect if configured
      if (form.settings?.redirectUrl) {
        setTimeout(() => {
          window.location.href =
            form.settings.redirectUrl;
        }, 1500);
      }
    } catch (err) {
      console.error("Form submit error:", err);

      setError(
        err.message || "Failed to submit form"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2
            size={22}
            className="animate-spin"
          />
          Loading form...
        </div>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error && !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle
              size={24}
              className="text-red-500"
            />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Form unavailable
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {error}
          </p>

          <button
            onClick={fetchForm}
            className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==================================================
  // SUCCESS
  // ==================================================

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2
              size={30}
              className="text-green-600"
            />
          </div>

          <h2 className="text-xl font-semibold text-gray-900">
            Thank You!
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {form?.settings?.successMessage ||
              "Thank you! We will contact you shortly."}
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // FIELD RENDER
  // ==================================================

  const renderField = (
    key,
    field
  ) => {
    if (!field?.enabled) return null;

    const inputType =
      key === "email"
        ? "email"
        : key === "phone"
          ? "tel"
          : "text";

    return (
      <div
        key={key}
        className="space-y-1.5"
      >
        <label className="block text-sm font-medium text-gray-700">
          {field.label || key}

          {field.required && (
            <span className="text-red-500 ml-1">
              *
            </span>
          )}
        </label>

        {key === "message" ? (
          <textarea
            value={formData[key] || ""}
            onChange={(e) =>
              handleChange(
                key,
                e.target.value
              )
            }
            placeholder={
              field.placeholder || ""
            }
            required={field.required}
            rows={4}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        ) : (
          <input
            type={inputType}
            value={formData[key] || ""}
            onChange={(e) =>
              handleChange(
                key,
                e.target.value
              )
            }
            placeholder={
              field.placeholder || ""
            }
            required={field.required}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        )}
      </div>
    );
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">

        {/* FORM CARD */}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          {/* HEADER */}

          <div className="px-6 py-6 border-b border-gray-100">
            <h1 className="text-2xl font-semibold text-gray-900">
              {form.name}
            </h1>

            {form.description && (
              <p className="text-sm text-gray-500 mt-2">
                {form.description}
              </p>
            )}
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-5"
          >

            {/* ERROR */}

            {error && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700">
                <AlertCircle
                  size={18}
                  className="mt-0.5 flex-shrink-0"
                />

                <p className="text-sm">
                  {error}
                </p>
              </div>
            )}

            {/* STANDARD FIELDS */}

            {Object.entries(
              form.fields || {}
            ).map(
              ([key, field]) =>
                renderField(
                  key,
                  field
                )
            )}

            {/* CUSTOM FIELDS */}

            {Array.isArray(
              form.customFields
            ) &&
              form.customFields.map(
                (field, index) => {
                  const key =
                    field.name ||
                    field.key ||
                    field.slug ||
                    `custom_${index}`;

                  const type =
                    field.type || "text";

                  return (
                    <div
                      key={key}
                      className="space-y-1.5"
                    >
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label ||
                          field.name ||
                          key}

                        {field.required && (
                          <span className="text-red-500 ml-1">
                            *
                          </span>
                        )}
                      </label>

                      {type ===
                      "textarea" ? (
                        <textarea
                          value={
                            formData[key] ||
                            ""
                          }
                          onChange={(e) =>
                            handleChange(
                              key,
                              e.target
                                .value
                            )
                          }
                          placeholder={
                            field.placeholder ||
                            ""
                          }
                          required={
                            field.required
                          }
                          rows={4}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      ) : (
                        <input
                          type={type}
                          value={
                            formData[key] ||
                            ""
                          }
                          onChange={(e) =>
                            handleChange(
                              key,
                              e.target
                                .value
                            )
                          }
                          placeholder={
                            field.placeholder ||
                            ""
                          }
                          required={
                            field.required
                          }
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      )}
                    </div>
                  );
                }
              )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit
                </>
              )}
            </button>

          </form>
        </div>

        {/* BRANDING */}

        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">
            Powered by Brielix
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;
