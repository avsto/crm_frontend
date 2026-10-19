import React, { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  Edit3,
  Eye,
  Calendar,
  Globe,
  FileText,
  Image as ImageIcon,
  Tag,
  Link2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  User,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";

import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

import { useNavigate, useParams } from "react-router-dom";

import contentApi from "../../api/content.api";
import integrationsApi from "../../api/integrations.api";
import websiteApi from "../../api/website.api";

/* =========================================================
   CONTENT TYPES
========================================================= */

const CONTENT_TYPES = [
  {
    value: "blog",
    label: "Blog",
  },
  {
    value: "article",
    label: "Article",
  },
  {
    value: "news",
    label: "News",
  },
  {
    value: "guide",
    label: "Guide",
  },
  {
    value: "landing_page",
    label: "Landing Page",
  },
  {
    value: "press_release",
    label: "Press Release",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const extractError = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"
  );
};

const getApiData = (response) => {
  return response?.data?.data ?? response?.data ?? response ?? {};
};

const getId = (item) => {
  if (!item) return "";

  return (
    item?._id ||
    item?.id ||
    item?.providerAccountId ||
    item?.metadata?.facebookPageId ||
    item?.metadata?.linkedinPageId ||
    item?.metadata?.instagramBusinessAccountId ||
    item?.metadata?.instagramAccountId ||
    ""
  );
};

const getWebsiteId = (website) => {
  return website?._id || website?.id || "";
};

const getWebsiteName = (website) => {
  return (
    website?.name ||
    website?.title ||
    website?.websiteName ||
    website?.domain ||
    website?.url ||
    "Website"
  );
};

const getWebsiteUrl = (website) => {
  return (
    website?.url ||
    website?.websiteUrl ||
    website?.domain ||
    website?.siteUrl ||
    ""
  );
};

const getWebsiteImage = (website) => {
  return (
    website?.logo ||
    website?.logoUrl ||
    website?.favicon ||
    website?.image ||
    website?.featuredImage ||
    ""
  );
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeStatus = (status) => {
  const value = String(status || "Draft").toLowerCase();

  if (value === "published") return "Published";
  if (value === "scheduled") return "Scheduled";
  if (value === "archived") return "Archived";

  return "Draft";
};

const normalizeContent = (data) => {
  const rawContent = data?.content;

  if (typeof rawContent === "string") {
    return {
      title: data?.title || "",
      keyword: data?.keyword || data?.focusKeyword || "",
      secondaryKeywords: normalizeArray(data?.secondaryKeywords),
      content: rawContent,
      excerpt: data?.excerpt || "",
      featuredImage: data?.featuredImage || "",
      publishDate: data?.publishDate || "",
      publishTime: data?.publishTime || "",
    };
  }

  return {
    title: rawContent?.title || data?.title || "",
    keyword:
      rawContent?.keyword || data?.keyword || data?.seo?.focusKeyword || "",
    secondaryKeywords: normalizeArray(
      rawContent?.secondaryKeywords || data?.secondaryKeywords,
    ),
    content: rawContent?.content || data?.body || data?.html || "",
    excerpt: rawContent?.excerpt || data?.excerpt || "",
    featuredImage:
      rawContent?.featuredImage || data?.featuredImage || data?.image || "",
    publishDate: rawContent?.publishDate || data?.publishDate || "",
    publishTime: rawContent?.publishTime || data?.publishTime || "",
  };
};

const normalizeSeo = (data) => {
  return {
    metaTitle: data?.seo?.metaTitle || data?.metaTitle || "",
    metaDescription: data?.seo?.metaDescription || data?.metaDescription || "",
    slug: data?.seo?.slug || data?.slug || "",
    focusKeyword:
      data?.seo?.focusKeyword ||
      data?.focusKeyword ||
      data?.keyword ||
      data?.content?.keyword ||
      "",
  };
};

const normalizeDistribution = (data) => {
  const distribution = data?.distribution || {};

  return {
    website: Boolean(
      distribution.website ||
      distribution.websites ||
      distribution.websiteIds?.length,
    ),

    websiteIds: normalizeArray(
      distribution.websiteIds || distribution.websites || [],
    ),

    facebook: Boolean(
      distribution.facebook || distribution.facebookAccounts?.length,
    ),

    facebookAccounts: normalizeArray(
      distribution.facebookAccounts || distribution.facebookPages || [],
    ),

    instagram: Boolean(
      distribution.instagram || distribution.instagramAccounts?.length,
    ),

    instagramAccounts: normalizeArray(
      distribution.instagramAccounts || distribution.instagramPages || [],
    ),

    linkedin: Boolean(
      distribution.linkedin || distribution.linkedinAccounts?.length,
    ),

    linkedinAccounts: normalizeArray(distribution.linkedinAccounts || []),

    backlink: Boolean(
      distribution.backlink || distribution.backlinkUrls?.length,
    ),

    backlinkUrls: normalizeArray(
      distribution.backlinkUrls || distribution.backlinks || [],
    ),

    newsletter: Boolean(distribution.newsletter),
  };
};

/* =========================================================
   MAIN
========================================================= */

export default function ContentDetail() {
  const navigate = useNavigate();

  const { id, contentId } = useParams();

  const recordId = id || contentId;

  /* =======================================================
     STATE
  ======================================================= */

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [showPreview, setShowPreview] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  const [contentRecord, setContentRecord] = useState(null);

  const [form, setForm] = useState({
    title: "",
    keyword: "",
    secondaryKeywords: [],
    content: "",
    excerpt: "",
    featuredImage: "",
    publishDate: "",
    publishTime: "",
  });

  const [seo, setSeo] = useState({
    metaTitle: "",
    metaDescription: "",
    slug: "",
    focusKeyword: "",
  });

  const [distribution, setDistribution] = useState({
    website: false,
    websiteIds: [],

    facebook: false,
    facebookAccounts: [],

    instagram: false,
    instagramAccounts: [],

    linkedin: false,
    linkedinAccounts: [],

    backlink: false,
    backlinkUrls: [],

    newsletter: false,
  });

  const [type, setType] = useState("blog");

  const [status, setStatus] = useState("Draft");

  const [websiteAccounts, setWebsiteAccounts] = useState([]);

  const [facebookAccounts, setFacebookAccounts] = useState([]);

  const [instagramAccounts, setInstagramAccounts] = useState([]);

  const [linkedinAccounts, setLinkedinAccounts] = useState([]);

  const [integrationLoading, setIntegrationLoading] = useState({
    website: false,
    facebook: false,
    instagram: false,
    linkedin: false,
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  /* =======================================================
     WORD COUNT
  ======================================================= */

  const wordCount = useMemo(() => {
    const text = String(form.content || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text ? text.split(" ").length : 0;
  }, [form.content]);

  /* =======================================================
     SEO SCORE
  ======================================================= */

  const seoScore = useMemo(() => {
    let score = 0;

    if (seo.focusKeyword) score += 20;

    if (seo.metaTitle) score += 20;

    if (seo.metaDescription) score += 20;

    if (seo.slug) score += 15;

    if (wordCount > 500) score += 15;

    if (form.featuredImage) score += 10;

    return Math.min(score, 100);
  }, [seo, wordCount, form.featuredImage]);

  /* =======================================================
     LOAD CONTENT
  ======================================================= */

  const loadContent = async ({ silent = false } = {}) => {
    if (!recordId) {
      setMessage({
        type: "error",
        text: "Content ID is missing.",
      });

      setLoading(false);

      return;
    }

    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setMessage({
        type: "",
        text: "",
      });

      /*
       * Expected API:
       *
       * contentApi.getById(id)
       */

      const response = await contentApi.getById(recordId);

      const data = getApiData(response);

      const record = data?.content || data?.item || data?.result || data;

      if (!record) {
        throw new Error("Content not found.");
      }

      setContentRecord(record);

      const normalizedContent = normalizeContent(record);

      const normalizedSeo = normalizeSeo(record);

      const normalizedDistribution = normalizeDistribution(record);

      setForm(normalizedContent);

      setSeo(normalizedSeo);

      setDistribution(normalizedDistribution);

      setType(record?.type || "blog");

      setStatus(normalizeStatus(record?.status));
    } catch (error) {
      setMessage({
        type: "error",
        text: extractError(error),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadContent();
  }, [recordId]);

  /* =======================================================
     LOAD WEBSITE
  ======================================================= */

  const loadWebsites = async () => {
    try {
      setIntegrationLoading((prev) => ({
        ...prev,
        website: true,
      }));

      const response = await websiteApi.getWebsites();

      const data = getApiData(response);

      let websites = [];

      if (Array.isArray(data)) {
        websites = data;
      } else if (Array.isArray(data?.websites)) {
        websites = data.websites;
      } else if (Array.isArray(data?.items)) {
        websites = data.items;
      } else if (Array.isArray(data?.results)) {
        websites = data.results;
      }

      setWebsiteAccounts(websites);
    } catch (error) {
      setMessage({
        type: "error",
        text: `Unable to load websites: ${extractError(error)}`,
      });
    } finally {
      setIntegrationLoading((prev) => ({
        ...prev,
        website: false,
      }));
    }
  };

  /* =======================================================
     LOAD SOCIAL
  ======================================================= */

  const loadIntegration = async (provider) => {
    try {
      setIntegrationLoading((prev) => ({
        ...prev,
        [provider]: true,
      }));

      const response = await integrationsApi.getIntegration(provider);

      const data = getApiData(response);

      const integrations = Array.isArray(data) ? data : data ? [data] : [];

      const connectedAccounts = integrations
        .filter((integration) => integration?.status === "connected")
        .flatMap((integration) => {
          if (!Array.isArray(integration?.accounts)) {
            return [];
          }

          return integration.accounts.map((account) => ({
            ...account,
            provider: integration.provider || provider,
            integrationId: integration._id,
          }));
        })
        .filter(
          (account) => account?.status === "connected" || !account?.status,
        );

      if (provider === "facebook") {
        setFacebookAccounts(connectedAccounts);
      }

      if (provider === "instagram") {
        setInstagramAccounts(connectedAccounts);
      }

      if (provider === "linkedin") {
        setLinkedinAccounts(connectedAccounts);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `Unable to load ${provider}: ${extractError(error)}`,
      });
    } finally {
      setIntegrationLoading((prev) => ({
        ...prev,
        [provider]: false,
      }));
    }
  };

  /* =======================================================
     LOAD DISTRIBUTION DATA
  ======================================================= */

  useEffect(() => {
    if (activeTab !== "distribution") {
      return;
    }

    if (!websiteAccounts.length) {
      loadWebsites();
    }

    if (!facebookAccounts.length) {
      loadIntegration("facebook");
    }

    if (!instagramAccounts.length) {
      loadIntegration("instagram");
    }

    if (!linkedinAccounts.length) {
      loadIntegration("linkedin");
    }
  }, [activeTab]);

  /* =======================================================
     FIND ACCOUNT
  ======================================================= */

  const findWebsite = (id) => {
    return websiteAccounts.find(
      (website) => String(getWebsiteId(website)) === String(id),
    );
  };

  const findFacebookAccount = (id) => {
    return facebookAccounts.find(
      (account) => String(getId(account)) === String(id),
    );
  };

  const findInstagramAccount = (id) => {
    return instagramAccounts.find(
      (account) => String(getId(account)) === String(id),
    );
  };

  const findLinkedinAccount = (id) => {
    return linkedinAccounts.find(
      (account) => String(getId(account)) === String(id),
    );
  };

  /* =======================================================
     TYPE LABEL
  ======================================================= */

  const typeLabel =
    CONTENT_TYPES.find((item) => item.value === type)?.label || type;

  /* =======================================================
     PUBLISH DATE
  ======================================================= */

  const publishDateTime = useMemo(() => {
    if (
      !form.publishDate &&
      !contentRecord?.publishedAt &&
      !contentRecord?.scheduledAt
    ) {
      return null;
    }

    if (contentRecord?.publishedAt) {
      return contentRecord.publishedAt;
    }

    if (contentRecord?.scheduledAt) {
      return contentRecord.scheduledAt;
    }

    if (form.publishDate) {
      return `${form.publishDate}${
        form.publishTime ? `T${form.publishTime}` : ""
      }`;
    }

    return null;
  }, [form.publishDate, form.publishTime, contentRecord]);

  /* =======================================================
     RENDER LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Loader2 size={25} className="animate-spin" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Loading content...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="sticky top-0 z-40 border-b bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* LEFT */}

            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/content")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft size={19} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="truncate text-xl font-bold text-slate-900">
                    {form.title || "Content Details"}
                  </h1>

                  <StatusBadge status={status} />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {typeLabel} • {wordCount} words
                </p>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  loadContent({
                    silent: true,
                  })
                }
                disabled={refreshing}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                title="Refresh"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Eye size={17} />
                Preview
              </button>

              <button
                type="button"
                onClick={() => navigate(`/content/${recordId}/edit`)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Edit3 size={17} />
                Edit Content
              </button>
            </div>
          </div>
        </div>

        {/* TABS */}

        <div className="px-6">
          <div className="flex gap-7">
            {[
              ["overview", "Overview"],
              ["seo", "SEO"],
              ["distribution", "Distribution"],
            ].map(([key, label]) => (
              <button
                type="button"
                key={key}
                onClick={() => setActiveTab(key)}
                className={`border-b-2 px-1 py-3 text-sm font-semibold ${
                  activeTab === key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===================================================
          MESSAGE
      =================================================== */}

      {message.text && (
        <div className="mx-auto max-w-[1500px] px-6 pt-5">
          <div
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
              message.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}

            {message.text}
          </div>
        </div>
      )}

      {/* ===================================================
          BODY
      =================================================== */}

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          {/* =================================================
              MAIN
          ================================================= */}

          <div className="space-y-6">
            {/* =================================================
                OVERVIEW
            ================================================= */}

            {activeTab === "overview" && (
              <>
                {/* HERO */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {form.featuredImage ? (
                    <img
                      src={form.featuredImage}
                      alt={form.title || "Featured"}
                      className="h-80 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-slate-100">
                      <div className="text-center">
                        <ImageIcon
                          size={35}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-2 text-sm text-slate-400">
                          No featured image
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                        {typeLabel}
                      </span>

                      {form.keyword && (
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                          {form.keyword}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-900">
                      {form.title || "Untitled Content"}
                    </h2>

                    {form.excerpt && (
                      <p className="mt-4 text-base leading-7 text-slate-600">
                        {form.excerpt}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        {wordCount} words
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {formatDate(contentRecord?.createdAt)}
                      </div>

                      {publishDateTime && (
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          {formatDateTime(publishDateTime)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CONTENT */}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-bold text-slate-900">Content</h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Full content body
                        </p>
                      </div>

                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {wordCount} words
                      </span>
                    </div>
                  </div>

                  <div className="p-7">
                    {form.content ? (
                      <div
                        className="prose prose-slate max-w-none leading-7"
                        dangerouslySetInnerHTML={{
                          __html: form.content,
                        }}
                      />
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
                        <FileText
                          size={30}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm text-slate-400">
                          No content available.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* KEYWORDS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Tag size={18} className="text-blue-600" />

                    <h2 className="font-bold text-slate-900">Keywords</h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {form.keyword && (
                      <span className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">
                        {form.keyword}
                      </span>
                    )}

                    {form.secondaryKeywords.map((keyword, index) => (
                      <span
                        key={`${keyword}-${index}`}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700"
                      >
                        {keyword}
                      </span>
                    ))}

                    {!form.keyword && !form.secondaryKeywords.length && (
                      <span className="text-sm text-slate-400">
                        No keywords added.
                      </span>
                    )}
                  </div>
                </div>

                {/* SCHEDULE */}

                {(form.publishDate ||
                  form.publishTime ||
                  contentRecord?.scheduledAt ||
                  contentRecord?.publishedAt) && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Calendar size={19} />
                      </div>

                      <div>
                        <h2 className="font-bold text-slate-900">
                          Publishing Schedule
                        </h2>

                        <p className="text-sm text-slate-500">
                          Publishing information
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <InfoBox label="Status" value={status} />

                      <InfoBox
                        label="Publish Date"
                        value={
                          form.publishDate ? formatDate(form.publishDate) : "—"
                        }
                      />

                      <InfoBox
                        label="Publish Time"
                        value={form.publishTime || "—"}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* =================================================
                SEO
            ================================================= */}

            {activeTab === "seo" && (
              <div className="space-y-6">
                {/* SEO SCORE */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-5">
                    <div>
                      <h2 className="font-bold text-slate-900">
                        SEO Optimization
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Search engine optimization details
                      </p>
                    </div>

                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-blue-100 text-2xl font-bold text-blue-600">
                      {seoScore}
                    </div>
                  </div>

                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${seoScore}%`,
                      }}
                    />
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <SeoCheck done={!!seo.focusKeyword} label="Focus keyword" />

                    <SeoCheck done={!!seo.metaTitle} label="Meta title" />

                    <SeoCheck
                      done={!!seo.metaDescription}
                      label="Meta description"
                    />

                    <SeoCheck done={!!seo.slug} label="SEO slug" />

                    <SeoCheck done={wordCount > 500} label="500+ words" />

                    <SeoCheck
                      done={!!form.featuredImage}
                      label="Featured image"
                    />
                  </div>
                </div>

                {/* SEO DATA */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="font-bold text-slate-900">SEO Details</h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Metadata saved with this content
                    </p>
                  </div>

                  <div className="space-y-5">
                    <DetailField
                      label="Meta Title"
                      value={seo.metaTitle || "Not configured"}
                    />

                    <DetailField
                      label="Meta Description"
                      value={seo.metaDescription || "Not configured"}
                      multiline
                    />

                    <DetailField
                      label="URL Slug"
                      value={seo.slug || "Not configured"}
                    />

                    <DetailField
                      label="Focus Keyword"
                      value={seo.focusKeyword || "Not configured"}
                    />
                  </div>
                </div>

                {/* SEO PREVIEW */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 font-bold text-slate-900">
                    Search Preview
                  </h2>

                  <div className="rounded-xl border border-slate-200 p-5">
                    <div className="text-sm text-emerald-700">
                      {seo.slug ? `example.com/${seo.slug}` : "example.com"}
                    </div>

                    <div className="mt-1 text-xl font-semibold text-blue-700">
                      {seo.metaTitle || form.title || "Content Title"}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {seo.metaDescription ||
                        form.excerpt ||
                        "No meta description configured."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                DISTRIBUTION
            ================================================= */}

            {activeTab === "distribution" && (
              <div className="space-y-6">
                {/* DISTRIBUTION SUMMARY */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="font-bold text-slate-900">Distribution</h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Where this content is configured to be distributed.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DistributionStatus
                      icon={<Globe size={20} />}
                      title="Website"
                      active={distribution.website}
                      count={distribution.websiteIds.length}
                    />

                    <DistributionStatus
                      icon={<FaFacebook />}
                      title="Facebook"
                      active={distribution.facebook}
                      count={distribution.facebookAccounts.length}
                    />

                    <DistributionStatus
                      icon={<FaInstagram />}
                      title="Instagram"
                      active={distribution.instagram}
                      count={distribution.instagramAccounts.length}
                    />

                    <DistributionStatus
                      icon={<FaLinkedin />}
                      title="LinkedIn"
                      active={distribution.linkedin}
                      count={distribution.linkedinAccounts.length}
                    />

                    <DistributionStatus
                      icon={<Link2 size={20} />}
                      title="Backlinks"
                      active={distribution.backlink}
                      count={distribution.backlinkUrls.length}
                    />

                    <DistributionStatus
                      icon={<Mail size={20} />}
                      title="Newsletter"
                      active={distribution.newsletter}
                      count={distribution.newsletter ? 1 : 0}
                    />
                  </div>
                </div>

                {/* WEBSITES */}

                {distribution.website && (
                  <WebsiteDistribution
                    selectedIds={distribution.websiteIds}
                    websites={websiteAccounts}
                    loading={integrationLoading.website}
                    onRefresh={loadWebsites}
                    findWebsite={findWebsite}
                  />
                )}

                {/* FACEBOOK */}

                {distribution.facebook && (
                  <SocialDistribution
                    title="Facebook Pages"
                    icon={<FaFacebook className="text-blue-600" />}
                    ids={distribution.facebookAccounts}
                    accounts={facebookAccounts}
                    loading={integrationLoading.facebook}
                    onRefresh={() => loadIntegration("facebook")}
                    findAccount={findFacebookAccount}
                    renderName={(account) =>
                      account?.name || account?.username || "Facebook Page"
                    }
                    renderSubText={(account) =>
                      account?.metadata?.category ||
                      account?.type ||
                      "Facebook Page"
                    }
                    renderImage={(account) =>
                      account?.metadata?.profilePictureUrl ||
                      account?.picture?.data?.url
                    }
                  />
                )}

                {/* INSTAGRAM */}

                {distribution.instagram && (
                  <SocialDistribution
                    title="Instagram Accounts"
                    icon={<FaInstagram className="text-pink-600" />}
                    ids={distribution.instagramAccounts}
                    accounts={instagramAccounts}
                    loading={integrationLoading.instagram}
                    onRefresh={() => loadIntegration("instagram")}
                    findAccount={findInstagramAccount}
                    renderName={(account) =>
                      account?.username
                        ? `@${account.username}`
                        : account?.name || "Instagram Account"
                    }
                    renderSubText={(account) => {
                      const pageName = account?.metadata?.facebookPageName;

                      return pageName
                        ? `Facebook Page: ${pageName}`
                        : account?.type || "Instagram Business Account";
                    }}
                    renderImage={(account) =>
                      account?.metadata?.profilePictureUrl ||
                      account?.profilePictureUrl
                    }
                  />
                )}

                {/* LINKEDIN */}

                {distribution.linkedin && (
                  <SocialDistribution
                    title="LinkedIn Accounts"
                    icon={<FaLinkedin className="text-blue-700" />}
                    ids={distribution.linkedinAccounts}
                    accounts={linkedinAccounts}
                    loading={integrationLoading.linkedin}
                    onRefresh={() => loadIntegration("linkedin")}
                    findAccount={findLinkedinAccount}
                    renderName={(account) =>
                      account?.name || account?.username || "LinkedIn Account"
                    }
                    renderSubText={(account) =>
                      account?.type || "LinkedIn Account"
                    }
                    renderImage={(account) =>
                      account?.metadata?.profilePictureUrl ||
                      account?.profilePictureUrl
                    }
                  />
                )}

                {/* BACKLINKS */}

                {distribution.backlink && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Link2 size={19} />
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900">
                            Backlink URLs
                          </h3>

                          <p className="text-xs text-slate-500">
                            {distribution.backlinkUrls.length} URLs configured
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {distribution.backlinkUrls.map((url, index) => (
                        <a
                          key={`${url}-${index}`}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Link2
                              size={16}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="truncate text-sm text-slate-700">
                              {url}
                            </span>
                          </div>

                          <ExternalLink
                            size={15}
                            className="shrink-0 text-slate-400"
                          />
                        </a>
                      ))}

                      {!distribution.backlinkUrls.length && (
                        <EmptyState text="No backlink URLs configured." />
                      )}
                    </div>
                  </div>
                )}

                {/* NEWSLETTER */}

                {distribution.newsletter && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Mail size={19} />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">Newsletter</h3>

                        <p className="text-sm text-slate-500">
                          Newsletter distribution is enabled.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <div className="space-y-6">
            {/* STATUS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Content Status</h3>

                  <p className="text-xs text-slate-500">
                    Current publishing state
                  </p>
                </div>

                <StatusBadge status={status} />
              </div>

              <div className="space-y-3">
                <InfoRow
                  icon={<FileText size={16} />}
                  label="Type"
                  value={typeLabel}
                />

                <InfoRow
                  icon={<FileText size={16} />}
                  label="Words"
                  value={wordCount}
                />

                <InfoRow
                  icon={<Tag size={16} />}
                  label="Keywords"
                  value={form.secondaryKeywords.length + (form.keyword ? 1 : 0)}
                />

                <InfoRow
                  icon={<Globe size={16} />}
                  label="Websites"
                  value={distribution.websiteIds.length}
                />

                <InfoRow
                  icon={<Calendar size={16} />}
                  label="Created"
                  value={formatDate(contentRecord?.createdAt)}
                />

                {contentRecord?.updatedAt && (
                  <InfoRow
                    icon={<RefreshCw size={16} />}
                    label="Updated"
                    value={formatDate(contentRecord.updatedAt)}
                  />
                )}
              </div>
            </div>

            {/* SEO SCORE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">SEO Score</h3>

                  <p className="text-xs text-slate-500">Optimization</p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-blue-100 text-lg font-bold text-blue-600">
                  {seoScore}
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${seoScore}%`,
                  }}
                />
              </div>

              <div className="mt-5 space-y-3">
                <ScoreItem done={!!seo.focusKeyword} text="Focus keyword" />

                <ScoreItem done={!!seo.metaTitle} text="Meta title" />

                <ScoreItem
                  done={!!seo.metaDescription}
                  text="Meta description"
                />

                <ScoreItem done={!!seo.slug} text="SEO slug" />

                <ScoreItem done={wordCount > 500} text="500+ words" />

                <ScoreItem done={!!form.featuredImage} text="Featured image" />
              </div>
            </div>

            {/* AUTHOR */}

            {(contentRecord?.author ||
              contentRecord?.createdBy ||
              contentRecord?.user) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-bold text-slate-900">Author</h3>

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <User size={18} />
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {getAuthorName(contentRecord)}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Content author
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* QUICK ACTIONS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-slate-900">Quick Actions</h3>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => navigate(`/content/${recordId}/edit`)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Edit3 size={17} />
                  Edit Content
                </button>

                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Eye size={17} />
                  Preview Content
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/content")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft size={17} />
                  Back to Content
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          PREVIEW MODAL
      ===================================================== */}

      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-5">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="font-bold text-slate-900">Content Preview</h2>

                <p className="text-sm text-slate-500">Preview saved content</p>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            {/* CONTENT */}

            <div className="overflow-y-auto p-8">
              <article className="mx-auto max-w-3xl">
                {form.featuredImage && (
                  <img
                    src={form.featuredImage}
                    alt={form.title || "Featured"}
                    className="mb-7 h-72 w-full rounded-2xl object-cover"
                  />
                )}

                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    {typeLabel}
                  </span>

                  {form.keyword && (
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                      {form.keyword}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl font-bold leading-tight text-slate-900">
                  {form.title || "Your Content Title"}
                </h1>

                {form.excerpt && (
                  <p className="mt-4 text-lg leading-7 text-slate-600">
                    {form.excerpt}
                  </p>
                )}

                <div
                  className="prose prose-slate mt-8 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      form.content || "<p>Your content will appear here.</p>",
                  }}
                />
              </article>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===========================================================
   STATUS BADGE
=========================================================== */

function StatusBadge({ status }) {
  const styles = {
    Published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Scheduled: "bg-amber-50 text-amber-700 border-amber-200",
    Draft: "bg-slate-100 text-slate-600 border-slate-200",
    Archived: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
        styles[status] || styles.Draft
      }`}
    >
      {status}
    </span>
  );
}

/* ===========================================================
   INFO ROW
=========================================================== */

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        {label}
      </div>

      <span className="max-w-[170px] truncate text-right text-sm font-semibold text-slate-800">
        {value ?? "—"}
      </span>
    </div>
  );
}

/* ===========================================================
   INFO BOX
=========================================================== */

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-medium text-slate-400">{label}</div>

      <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}

/* ===========================================================
   SCORE ITEM
=========================================================== */

function ScoreItem({ done, text }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <CheckCircle2
        size={16}
        className={done ? "text-emerald-500" : "text-slate-300"}
      />

      <span className={done ? "text-slate-700" : "text-slate-400"}>{text}</span>
    </div>
  );
}

/* ===========================================================
   SEO CHECK
=========================================================== */

function SeoCheck({ done, label }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
      <CheckCircle2
        size={18}
        className={done ? "text-emerald-500" : "text-slate-300"}
      />

      <span
        className={`text-sm font-medium ${
          done ? "text-slate-700" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/* ===========================================================
   DETAIL FIELD
=========================================================== */

function DetailField({ label, value, multiline = false }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-slate-700">{label}</div>

      <div
        className={`rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 ${
          multiline ? "leading-6" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/* ===========================================================
   DISTRIBUTION STATUS
=========================================================== */

function DistributionStatus({ icon, title, active, count }) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-4 ${
        active ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            active ? "bg-blue-600 text-white" : "bg-white text-slate-400"
          }`}
        >
          {icon}
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>

          <div className="mt-0.5 text-xs text-slate-500">
            {active ? `${count} selected` : "Not enabled"}
          </div>
        </div>
      </div>

      <div
        className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
          active ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"
        }`}
      >
        {active ? "Enabled" : "Disabled"}
      </div>
    </div>
  );
}

/* ===========================================================
   WEBSITE DISTRIBUTION
=========================================================== */

function WebsiteDistribution({
  selectedIds,
  websites,
  loading,
  onRefresh,
  findWebsite,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Globe size={19} />
          </div>

          <div>
            <h3 className="font-bold text-slate-900">Websites</h3>

            <p className="text-xs text-slate-500">
              {selectedIds.length} website
              {selectedIds.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && <LoadingBox text="Loading websites..." />}

      {!loading && (
        <div className="space-y-3">
          {selectedIds.map((id, index) => {
            const website = findWebsite(id);

            return (
              <div
                key={`${id}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {website && getWebsiteImage(website) ? (
                    <img
                      src={getWebsiteImage(website)}
                      alt={getWebsiteName(website)}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Globe size={18} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {website ? getWebsiteName(website) : `Website ID: ${id}`}
                    </div>

                    {website && getWebsiteUrl(website) && (
                      <div className="mt-1 truncate text-xs text-slate-500">
                        {getWebsiteUrl(website)}
                      </div>
                    )}
                  </div>
                </div>

                <CheckCircle2 size={19} className="shrink-0 text-emerald-500" />
              </div>
            );
          })}

          {!selectedIds.length && <EmptyState text="No websites selected." />}
        </div>
      )}
    </div>
  );
}

/* ===========================================================
   SOCIAL DISTRIBUTION
=========================================================== */

function SocialDistribution({
  title,
  icon,
  ids,
  accounts,
  loading,
  onRefresh,
  findAccount,
  renderName,
  renderSubText,
  renderImage,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            {icon}
          </div>

          <div>
            <h3 className="font-bold text-slate-900">{title}</h3>

            <p className="text-xs text-slate-500">{ids.length} selected</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && <LoadingBox text="Loading connected accounts..." />}

      {!loading && (
        <div className="space-y-3">
          {ids.map((id, index) => {
            const account = findAccount(id);

            const image = account && renderImage?.(account);

            return (
              <div
                key={`${id}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {image ? (
                    <img
                      src={image}
                      alt={account ? renderName(account) : title}
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                      {icon}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {account ? renderName(account) : `${title} ID: ${id}`}
                    </div>

                    {account && (
                      <div className="mt-1 truncate text-xs text-slate-500">
                        {renderSubText(account)}
                      </div>
                    )}
                  </div>
                </div>

                <CheckCircle2 size={19} className="shrink-0 text-emerald-500" />
              </div>
            );
          })}

          {!ids.length && (
            <EmptyState text={`No ${title.toLowerCase()} selected.`} />
          )}
        </div>
      )}
    </div>
  );
}

/* ===========================================================
   EMPTY
=========================================================== */

function EmptyState({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}

/* ===========================================================
   LOADING
=========================================================== */

function LoadingBox({ text }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 py-10">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 size={18} className="animate-spin" />
        {text}
      </div>
    </div>
  );
}

/* ===========================================================
   AUTHOR
=========================================================== */

function getAuthorName(record) {
  const author = record?.author || record?.createdBy || record?.user;

  if (!author) {
    return "Unknown";
  }

  if (typeof author === "string") {
    return author;
  }

  return (
    author?.name ||
    author?.fullName ||
    author?.username ||
    author?.email ||
    "Unknown"
  );
}
