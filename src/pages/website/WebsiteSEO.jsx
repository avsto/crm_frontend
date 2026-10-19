import React, { useEffect, useState } from "react";
import { ArrowLeft, Save, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import websiteApi from "../../api/website.api";

const WebsiteSEO = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    keywords: "",
    ogImage: "",
    canonicalUrl: "",
    robots: "index,follow",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD SEO
  // ======================================================

  const loadSEO = async () => {
    if (!websiteId) {
      setError("Website ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await websiteApi.getSEO(websiteId);

      const data =
        response?.data?.data ||
        response?.data?.seo ||
        response?.data ||
        {};

      setForm({
        title: data?.title || "",
        description: data?.description || "",
        keywords: data?.keywords || "",
        ogImage: data?.ogImage || "",
        canonicalUrl: data?.canonicalUrl || "",
        robots: data?.robots || "index,follow",
      });
    } catch (err) {
      console.error("SEO loading error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load SEO settings."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadSEO();
  }, [websiteId]);

  // ======================================================
  // UPDATE FIELD
  // ======================================================

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ======================================================
  // SAVE SEO
  // ======================================================

  const saveSEO = async () => {
    if (!websiteId) {
      alert("Website ID is missing.");
      return;
    }

    if (form.title.length > 60) {
      alert("SEO title should ideally be within 60 characters.");
      return;
    }

    if (form.description.length > 160) {
      alert(
        "Meta description should ideally be within 160 characters."
      );
      return;
    }

    try {
      setSaving(true);

      await websiteApi.updateSEO(websiteId, {
        title: form.title.trim(),
        description: form.description.trim(),
        keywords: form.keywords.trim(),
        ogImage: form.ogImage.trim(),
        canonicalUrl: form.canonicalUrl.trim(),
        robots: form.robots,
      });

      alert("SEO settings saved successfully.");
    } catch (err) {
      console.error("SEO save error:", err);

      alert(
        err?.response?.data?.message ||
          "Unable to save SEO settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-10">
        <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-10 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />

          <p className="text-sm text-gray-500">
            Loading SEO settings...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => navigate(`/website/${websiteId}`)}
            className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Website
          </button>

          <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <button
              onClick={loadSEO}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">

        {/* BACK */}
        <button
          onClick={() => navigate(`/website/${websiteId}`)}
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Website
        </button>

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Search className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                SEO Settings
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Optimize your website for search engines.
              </p>
            </div>

          </div>
        </div>

        {/* SEO CARD */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">

          <div className="space-y-6">

            {/* SEO TITLE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                SEO Title
              </label>

              <input
                value={form.title}
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
                maxLength={60}
                placeholder="Your business website"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>
                  Recommended: 50–60 characters
                </span>

                <span>
                  {form.title.length}/60
                </span>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Meta Description
              </label>

              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                maxLength={160}
                placeholder="Describe your business, products and services..."
                className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>
                  Recommended: 120–160 characters
                </span>

                <span>
                  {form.description.length}/160
                </span>
              </div>
            </div>

            {/* KEYWORDS */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Keywords
              </label>

              <input
                value={form.keywords}
                onChange={(e) =>
                  updateField("keywords", e.target.value)
                }
                placeholder="business, products, services"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              <p className="mt-1 text-xs text-gray-400">
                Separate keywords using commas.
              </p>
            </div>

            {/* OG IMAGE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Social / Open Graph Image
              </label>

              <input
                value={form.ogImage}
                onChange={(e) =>
                  updateField("ogImage", e.target.value)
                }
                placeholder="https://example.com/og-image.jpg"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              <p className="mt-1 text-xs text-gray-400">
                Image shown when your website is shared on social platforms.
              </p>
            </div>

            {/* CANONICAL */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Canonical URL
              </label>

              <input
                value={form.canonicalUrl}
                onChange={(e) =>
                  updateField(
                    "canonicalUrl",
                    e.target.value
                  )
                }
                placeholder="https://example.com"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              <p className="mt-1 text-xs text-gray-400">
                Leave empty to automatically use the website URL.
              </p>
            </div>

            {/* ROBOTS */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search Engine Robots
              </label>

              <select
                value={form.robots}
                onChange={(e) =>
                  updateField("robots", e.target.value)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="index,follow">
                  Index & Follow
                </option>

                <option value="noindex,nofollow">
                  No Index & No Follow
                </option>

                <option value="index,nofollow">
                  Index & No Follow
                </option>

                <option value="noindex,follow">
                  No Index & Follow
                </option>
              </select>

              <p className="mt-1 text-xs text-gray-400">
                Controls how search engines crawl and index your website.
              </p>
            </div>

          </div>

          {/* SAVE */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">

            <p className="text-xs text-gray-400">
              Changes will apply to your published website.
            </p>

            <button
              disabled={saving}
              onClick={saveSEO}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />

              {saving ? "Saving..." : "Save SEO"}
            </button>

          </div>
        </div>

        {/* SEO PREVIEW */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">

          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Search Preview
          </h2>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">

            <p className="text-sm text-green-700">
              {form.canonicalUrl ||
                "https://yourwebsite.com"}
            </p>

            <h3 className="mt-1 text-lg font-medium text-blue-700">
              {form.title || "Your Website Title"}
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              {form.description ||
                "Your website meta description will appear here in search results."}
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default WebsiteSEO;