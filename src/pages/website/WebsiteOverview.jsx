import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Globe,
  ExternalLink,
  Edit3,
  Eye,
  Settings,
  FileText,
  Palette,
  Link2,
  Search,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

import websiteApi from "../../api/website.api";

const WebsiteOverview = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();

  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD WEBSITE
  // ======================================================

  useEffect(() => {
    if (!websiteId) {
      setError("Website ID is missing.");
      setLoading(false);
      return;
    }

    loadWebsite();
  }, [websiteId]);

  const loadWebsite = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await websiteApi.getWebsite(websiteId);

      /*
       * API may return:
       *
       * {
       *   success: true,
       *   data: {...}
       * }
       *
       * OR
       *
       * {
       *   data: {
       *      website: {...}
       *   }
       * }
       */

      const responseData = response?.data;

      const websiteData =
        responseData?.data?.website ||
        responseData?.data ||
        responseData?.website ||
        responseData;

      if (!websiteData || typeof websiteData !== "object") {
        throw new Error("Website data not found.");
      }

      setWebsite(websiteData);
    } catch (err) {
      console.error("Load website error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load website.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading website...
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="min-h-[500px] p-6">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate("/website")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Websites
          </button>

          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />

              <div>
                <h3 className="text-sm font-semibold text-red-900">
                  Unable to load website
                </h3>

                <p className="mt-1 text-sm text-red-700">{error}</p>

                <button
                  type="button"
                  onClick={loadWebsite}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // SAFE WEBSITE DATA
  // ======================================================

  const websiteName = website?.name || "Untitled Website";

  const websiteSlug = website?.slug || "";

  const websiteDomain =
    website?.domain ||
    website?.primaryDomain?.domain ||
    website?.primaryDomain?.name ||
    "";

  const websiteStatus = website?.status || "draft";

  const websiteTheme =
    website?.themeName || website?.theme?.name || website?.theme || "Default";

  const pages = Array.isArray(website?.pages) ? website.pages : [];

  const navigation = Array.isArray(website?.navigation)
    ? website.navigation
    : [];

  const seo = website?.seo || {};

  const settings = website?.settings || {};

  // ======================================================
  // STATUS
  // ======================================================

  const isPublished =
    websiteStatus === "published" || websiteStatus === "active";

  // ======================================================
  // ACTIONS
  // ======================================================

  const openWebsite = () => {
    if (websiteDomain) {
      window.open(
        `https://${websiteDomain.replace(/^https?:\/\//, "")}`,
        "_blank",
      );
      return;
    }

    if (websiteSlug) {
      window.open(`/site/${websiteSlug}`, "_blank");
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/website")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Websites
          </button>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Globe className="h-5 w-5" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {websiteName}
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    {websiteDomain
                      ? websiteDomain
                      : websiteSlug
                        ? `/${websiteSlug}`
                        : "No domain connected"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openWebsite}
                disabled={!websiteDomain && !websiteSlug}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>

              <button
                type="button"
                onClick={() => navigate(`/website/${websiteId}/settings`)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* STATUS */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Website Status
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isPublished ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />

                <span className="text-sm font-semibold text-gray-900">
                  {isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Theme:{" "}
              <span className="font-semibold text-gray-900">
                {websiteTheme}
              </span>
            </div>
          </div>
        </div>

        {/* KPI */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={FileText} title="Pages" value={pages.length} />

          <StatCard
            icon={Link2}
            title="Navigation Items"
            value={navigation.length}
          />

          <StatCard icon={Palette} title="Theme" value={websiteTheme} />

          <StatCard
            icon={Globe}
            title="Domain"
            value={websiteDomain ? "Connected" : "Not Connected"}
          />
        </div>

        {/* MAIN GRID */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT */}

          <div className="space-y-6 lg:col-span-2">
            {/* QUICK ACTIONS */}

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-gray-900">
                  Website Management
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Manage your website from here.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ActionCard
                  icon={FileText}
                  title="Pages"
                  description="Create and manage website pages."
                  onClick={() => navigate(`/website/${websiteId}/pages`)}
                />

                <ActionCard
                  icon={Palette}
                  title="Theme"
                  description="Customize your website theme."
                  onClick={() => navigate(`/website/${websiteId}/theme`)}
                />

                <ActionCard
                  icon={Link2}
                  title="Domain"
                  description="Connect your custom domain."
                  onClick={() => navigate(`/website/${websiteId}/domain`)}
                />

                <ActionCard
                  icon={Search}
                  title="SEO"
                  description="Manage SEO settings."
                  onClick={() => navigate(`/website/${websiteId}/seo`)}
                />

                <ActionCard
                  icon={Edit3}
                  title="Navigation"
                  description="Manage website navigation."
                  onClick={() => navigate(`/website/${websiteId}/navigation`)}
                />

                <ActionCard
                  icon={Settings}
                  title="Settings"
                  description="Configure website settings."
                  onClick={() => navigate(`/website/${websiteId}/settings`)}
                />
              </div>
            </div>

            {/* PAGES */}

            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Website Pages
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Pages currently available on this website.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/website/${websiteId}/pages`)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Manage
                </button>
              </div>

              {pages.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="mx-auto h-8 w-8 text-gray-300" />

                  <p className="mt-3 text-sm font-medium text-gray-700">
                    No pages found
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Create your first website page.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pages.slice(0, 5).map((page, index) => (
                    <div
                      key={page?._id || page?.id || index}
                      className="flex items-center justify-between px-5 py-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {page?.title || "Untitled Page"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {page?.slug || "/"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          page?.published
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {page?.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}

          <div className="space-y-6">
            {/* WEBSITE INFO */}

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-base font-semibold text-gray-900">
                Website Information
              </h2>

              <div className="mt-5 space-y-4">
                <InfoRow label="Name" value={websiteName} />

                <InfoRow label="Slug" value={websiteSlug || "-"} />

                <InfoRow
                  label="Domain"
                  value={websiteDomain || "Not connected"}
                />

                <InfoRow label="Theme" value={websiteTheme} />

                <InfoRow
                  label="Status"
                  value={isPublished ? "Published" : "Draft"}
                />
              </div>
            </div>

            {/* SEO */}

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-600" />

                <h2 className="text-base font-semibold text-gray-900">SEO</h2>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium text-gray-400">TITLE</p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {seo?.title || websiteName}
                </p>

                <p className="mt-4 text-xs font-medium text-gray-400">
                  DESCRIPTION
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {seo?.description || "No SEO description configured."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/website/${websiteId}/seo`)}
                className="mt-5 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Manage SEO
              </button>
            </div>

            {/* SETTINGS */}

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-600" />

                <h2 className="text-base font-semibold text-gray-900">
                  Settings
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                <InfoRow
                  label="Maintenance Mode"
                  value={settings?.maintenanceMode ? "Enabled" : "Disabled"}
                />

                <InfoRow
                  label="Powered By"
                  value={settings?.showPoweredBy ? "Visible" : "Hidden"}
                />
              </div>

              <button
                type="button"
                onClick={() => navigate(`/website/${websiteId}/settings`)}
                className="mt-5 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Manage Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ======================================================
// STAT CARD
// ======================================================

const StatCard = ({ icon: Icon, title, value }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-4 text-xs font-medium text-gray-400">{title}</p>

      <p className="mt-1 truncate text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

// ======================================================
// ACTION CARD
// ======================================================

const ActionCard = ({ icon: Icon, title, description, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/30"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

          <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );
};

// ======================================================
// INFO ROW
// ======================================================

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-medium text-gray-400">{label}</span>

      <span className="max-w-[60%] break-words text-right text-xs font-semibold text-gray-800">
        {value || "-"}
      </span>
    </div>
  );
};

export default WebsiteOverview;
