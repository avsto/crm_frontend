import React, { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  Sparkles,
  Save,
  Eye,
  Search,
  Plus,
  X,
  Calendar,
  Globe,
  FileText,
  Image as ImageIcon,
  User,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Link2,
  Mail,
  RefreshCw,
} from "lucide-react";

import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import contentApi from "../../api/content.api";
import integrationsApi from "../../api/integrations.api";
import websiteApi from "../../api/website.api";
import distributionApi from "../../api/distribution.api";
import MediaManager from "../../components/media/MediaManager";
/* =========================================================
   EMPTY FORM
========================================================= */

const EMPTY_FORM = {
  title: "",
  keyword: "",
  secondaryKeywords: [],
  content: "",
  excerpt: "",
  featuredImage: "",
  publishDate: "",
  publishTime: "",
};

/* =========================================================
   EMPTY SEO
========================================================= */

const EMPTY_SEO = {
  metaTitle: "",
  metaDescription: "",
  slug: "",
  focusKeyword: "",
};

/* =========================================================
   EMPTY DISTRIBUTION
========================================================= */

const EMPTY_DISTRIBUTION = {
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
};

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
   SLUGIFY
========================================================= */

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

/* =========================================================
   ERROR HELPER
========================================================= */

const extractError = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"
  );
};

/* =========================================================
   API RESPONSE HELPER
========================================================= */

const getApiData = (response) => {
  return response?.data?.data ?? response?.data ?? response ?? [];
};

/* =========================================================
   SOCIAL ACCOUNT ID
========================================================= */

const getAccountId = (account) => {
  return (
    account?.providerAccountId ||
    account?.metadata?.facebookPageId ||
    account?.metadata?.linkedinPageId ||
    account?.metadata?.instagramBusinessAccountId ||
    account?.metadata?.instagramAccountId ||
    account?._id ||
    account?.id ||
    ""
  );
};

/* =========================================================
   WEBSITE ID
========================================================= */

const getWebsiteId = (website) => {
  return website?._id || website?.id || "";
};

/* =========================================================
   WEBSITE NAME
========================================================= */

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

/* =========================================================
   WEBSITE URL
========================================================= */

const getWebsiteUrl = (website) => {
  return (
    website?.url ||
    website?.websiteUrl ||
    website?.domain ||
    website?.siteUrl ||
    ""
  );
};

/* =========================================================
   WEBSITE IMAGE
========================================================= */

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

/* =========================================================
   CREATE CONTENT
========================================================= */

export default function CreateContent() {
  const navigate = useNavigate();

  const [mediaOpen, setMediaOpen] = useState(false);

  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] = useState(EMPTY_FORM);

  const [seo, setSeo] = useState(EMPTY_SEO);

  const [distribution, setDistribution] = useState(EMPTY_DISTRIBUTION);

  const [type, setType] = useState("blog");

  const [status, setStatus] = useState("Draft");

  const [keywordInput, setKeywordInput] = useState("");

  const [backlinkInput, setBacklinkInput] = useState("");

  /* =======================================================
     LOADING
  ======================================================= */

  const [researchLoading, setResearchLoading] = useState(false);

  const [generateLoading, setGenerateLoading] = useState(false);

  const [saveLoading, setSaveLoading] = useState(false);

  const [integrationLoading, setIntegrationLoading] = useState({
    website: false,
    facebook: false,
    instagram: false,
    linkedin: false,
  });

  /* =======================================================
     INTEGRATIONS
  ======================================================= */

  const [websiteAccounts, setWebsiteAccounts] = useState([]);

  const [facebookAccounts, setFacebookAccounts] = useState([]);

  const [instagramAccounts, setInstagramAccounts] = useState([]);

  const [linkedinAccounts, setLinkedinAccounts] = useState([]);

  /* =======================================================
     UI
  ======================================================= */

  const [activeTab, setActiveTab] = useState("content");

  const [showPreview, setShowPreview] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [wordCount, setWordCount] = useState(0);

  /* =======================================================
     WORD COUNT
  ======================================================= */

  useEffect(() => {
    const text = String(form.content || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    setWordCount(text ? text.split(" ").length : 0);
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
     FORM HELPERS
  ======================================================= */

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateSeo = (field, value) => {
    setSeo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =======================================================
     MESSAGE
  ======================================================= */

  const showMessage = (type, text) => {
    setMessage({
      type,
      text,
    });
  };

  /* =======================================================
     KEYWORDS
  ======================================================= */

  const addKeyword = (value) => {
    const keyword = String(value || "").trim();

    if (!keyword) return;

    setForm((prev) => {
      const exists = prev.secondaryKeywords.some(
        (item) => String(item).toLowerCase() === keyword.toLowerCase(),
      );

      if (exists) {
        return prev;
      }

      return {
        ...prev,
        secondaryKeywords: [...prev.secondaryKeywords, keyword],
      };
    });

    setKeywordInput("");
  };

  const removeKeyword = (index) => {
    setForm((prev) => ({
      ...prev,
      secondaryKeywords: prev.secondaryKeywords.filter((_, i) => i !== index),
    }));
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(keywordInput);
    }
  };

  /* =======================================================
     TITLE CHANGE
  ======================================================= */

  const handleTitleChange = (value) => {
    const oldSlug = slugify(form.title);

    updateForm("title", value);

    if (!seo.slug || seo.slug === oldSlug) {
      updateSeo("slug", slugify(value));
    }

    if (!seo.metaTitle) {
      updateSeo("metaTitle", value);
    }
  };

  /* =======================================================
     RESEARCH KEYWORDS
  ======================================================= */

  const researchKeywords = async () => {
    if (!form.keyword.trim()) {
      showMessage("error", "Please enter a primary keyword first.");
      return;
    }

    try {
      setResearchLoading(true);

      setMessage({
        type: "",
        text: "",
      });

      const result = await contentApi.researchKeywords(form.keyword.trim());

      const data = getApiData(result);

      const suggestions = Array.isArray(data)
        ? data
        : data?.keywords || data?.keywordSuggestions || data?.suggestions || [];

      if (Array.isArray(suggestions)) {
        suggestions.forEach((keyword) => {
          if (typeof keyword === "string" || typeof keyword === "number") {
            addKeyword(String(keyword));
          } else if (keyword?.keyword) {
            addKeyword(keyword.keyword);
          }
        });
      }

      showMessage("success", "Keyword suggestions added.");
    } catch (error) {
      showMessage("error", extractError(error));
    } finally {
      setResearchLoading(false);
    }
  };

  /* =======================================================
     AI GENERATE
  ======================================================= */

  const generateWithAI = async () => {
    if (!form.keyword.trim()) {
      showMessage("error", "Please enter a primary keyword first.");
      return;
    }

    try {
      setGenerateLoading(true);

      setMessage({
        type: "",
        text: "",
      });

      const result = await contentApi.generateContent(form.keyword.trim());

      const generated = getApiData(result) || {};

      if (generated.title) {
        updateForm("title", generated.title);

        if (!seo.slug) {
          updateSeo("slug", slugify(generated.title));
        }

        if (!seo.metaTitle) {
          updateSeo("metaTitle", generated.title);
        }
      }

      if (generated.content) {
        updateForm("content", generated.content);
      }

      if (generated.excerpt) {
        updateForm("excerpt", generated.excerpt);
      }

      if (generated.featuredImage) {
        updateForm("featuredImage", generated.featuredImage);
      }

      if (generated.seo) {
        setSeo((prev) => ({
          ...prev,
          ...generated.seo,
        }));
      }

      const suggestions =
        generated.keywordSuggestions || generated.secondaryKeywords || [];

      if (Array.isArray(suggestions)) {
        setForm((prev) => ({
          ...prev,
          secondaryKeywords: [
            ...new Set([
              ...prev.secondaryKeywords,
              ...suggestions
                .map((item) =>
                  typeof item === "string" ? item : item?.keyword,
                )
                .map((item) => String(item || "").trim())
                .filter(Boolean),
            ]),
          ],
        }));
      }

      showMessage("success", "Content generated successfully.");
    } catch (error) {
      showMessage("error", extractError(error));
    } finally {
      setGenerateLoading(false);
    }
  };

  /* =======================================================
     LOAD WEBSITES
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
      showMessage("error", `Unable to load websites: ${extractError(error)}`);
    } finally {
      setIntegrationLoading((prev) => ({
        ...prev,
        website: false,
      }));
    }
  };

  /* =======================================================
     LOAD SOCIAL INTEGRATION
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
      showMessage(
        "error",
        `Unable to load ${provider} integrations: ${extractError(error)}`,
      );
    } finally {
      setIntegrationLoading((prev) => ({
        ...prev,
        [provider]: false,
      }));
    }
  };

  /* =======================================================
     LOAD ALL DISTRIBUTION DATA
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
     DISTRIBUTION TOGGLE
  ======================================================= */

  const toggleDistribution = (field) => {
    setDistribution((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  /* =======================================================
     WEBSITE SELECT
  ======================================================= */

  const toggleWebsite = (website) => {
    const id = getWebsiteId(website);

    if (!id) return;

    setDistribution((prev) => {
      const exists = prev.websiteIds.includes(id);

      const nextIds = exists
        ? prev.websiteIds.filter((item) => item !== id)
        : [...prev.websiteIds, id];

      return {
        ...prev,
        website: nextIds.length > 0,
        websiteIds: nextIds,
      };
    });
  };

  /* =======================================================
     SELECT ALL WEBSITES
  ======================================================= */

  const selectAllWebsites = () => {
    const ids = websiteAccounts.map(getWebsiteId).filter(Boolean);

    setDistribution((prev) => ({
      ...prev,
      website: ids.length > 0,
      websiteIds: ids,
    }));
  };

  /* =======================================================
     CLEAR WEBSITES
  ======================================================= */

  const clearWebsites = () => {
    setDistribution((prev) => ({
      ...prev,
      website: false,
      websiteIds: [],
    }));
  };

  /* =======================================================
     FACEBOOK SELECT
  ======================================================= */

  const toggleFacebookAccount = (account) => {
    const id = getAccountId(account);

    if (!id) return;

    setDistribution((prev) => {
      const exists = prev.facebookAccounts.includes(id);

      const nextAccounts = exists
        ? prev.facebookAccounts.filter((item) => item !== id)
        : [...prev.facebookAccounts, id];

      return {
        ...prev,
        facebook: nextAccounts.length > 0,
        facebookAccounts: nextAccounts,
      };
    });
  };

  /* =======================================================
     INSTAGRAM SELECT
  ======================================================= */

  const toggleInstagramAccount = (account) => {
    const id = getAccountId(account);

    if (!id) return;

    setDistribution((prev) => {
      const exists = prev.instagramAccounts.includes(id);

      const nextAccounts = exists
        ? prev.instagramAccounts.filter((item) => item !== id)
        : [...prev.instagramAccounts, id];

      return {
        ...prev,
        instagram: nextAccounts.length > 0,
        instagramAccounts: nextAccounts,
      };
    });
  };

  /* =======================================================
     LINKEDIN SELECT
  ======================================================= */

  const toggleLinkedinAccount = (account) => {
    const id = getAccountId(account);

    if (!id) return;

    setDistribution((prev) => {
      const exists = prev.linkedinAccounts.includes(id);

      const nextAccounts = exists
        ? prev.linkedinAccounts.filter((item) => item !== id)
        : [...prev.linkedinAccounts, id];

      return {
        ...prev,
        linkedin: nextAccounts.length > 0,
        linkedinAccounts: nextAccounts,
      };
    });
  };

  /* =======================================================
     SELECT ALL SOCIAL
  ======================================================= */

  const selectAllFacebook = () => {
    const ids = facebookAccounts.map(getAccountId).filter(Boolean);

    setDistribution((prev) => ({
      ...prev,
      facebook: ids.length > 0,
      facebookAccounts: ids,
    }));
  };

  const selectAllInstagram = () => {
    const ids = instagramAccounts.map(getAccountId).filter(Boolean);

    setDistribution((prev) => ({
      ...prev,
      instagram: ids.length > 0,
      instagramAccounts: ids,
    }));
  };

  const selectAllLinkedin = () => {
    const ids = linkedinAccounts.map(getAccountId).filter(Boolean);

    setDistribution((prev) => ({
      ...prev,
      linkedin: ids.length > 0,
      linkedinAccounts: ids,
    }));
  };

  /* =======================================================
     CLEAR SOCIAL
  ======================================================= */

  const clearFacebook = () => {
    setDistribution((prev) => ({
      ...prev,
      facebook: false,
      facebookAccounts: [],
    }));
  };

  const clearInstagram = () => {
    setDistribution((prev) => ({
      ...prev,
      instagram: false,
      instagramAccounts: [],
    }));
  };

  const clearLinkedin = () => {
    setDistribution((prev) => ({
      ...prev,
      linkedin: false,
      linkedinAccounts: [],
    }));
  };

  /* =======================================================
     BACKLINK
  ======================================================= */

  const addBacklink = (value) => {
    const url = String(value || "").trim();

    if (!url) return;

    setDistribution((prev) => {
      if (prev.backlinkUrls.includes(url)) {
        return prev;
      }

      return {
        ...prev,
        backlink: true,
        backlinkUrls: [...prev.backlinkUrls, url],
      };
    });

    setBacklinkInput("");
  };

  const removeBacklink = (index) => {
    setDistribution((prev) => {
      const nextUrls = prev.backlinkUrls.filter((_, i) => i !== index);

      return {
        ...prev,
        backlinkUrls: nextUrls,
        backlink: nextUrls.length > 0,
      };
    });
  };

  const handleBacklinkKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBacklink(backlinkInput);
    }
  };

  /* =======================================================
     BUILD PAYLOAD
  ======================================================= */

  const buildPayload = (saveStatus = status) => {
    return {
      type,

      status: saveStatus,

      content: {
        ...form,

        secondaryKeywords: form.secondaryKeywords.join(", "),
      },

      seo: {
        ...seo,

        focusKeyword: seo.focusKeyword || form.keyword,

        slug: seo.slug || slugify(form.title),
      },

      distribution: {
        website: Boolean(distribution.website),

        websiteIds: distribution.websiteIds,

        facebook: Boolean(distribution.facebook),

        facebookAccounts: distribution.facebookAccounts,

        instagram: Boolean(distribution.instagram),

        instagramAccounts: distribution.instagramAccounts,

        linkedin: Boolean(distribution.linkedin),

        linkedinAccounts: distribution.linkedinAccounts,

        backlink: Boolean(distribution.backlink),

        backlinkUrls: distribution.backlinkUrls,

        newsletter: Boolean(distribution.newsletter),
      },
    };
  };

  /* =======================================================
     VALIDATE
  ======================================================= */

  const validate = () => {
    if (!form.title.trim()) {
      return "Content title is required";
    }

    if (!form.keyword.trim()) {
      return "Primary keyword is required";
    }

    if (!form.content.trim()) {
      return "Content is required";
    }

    if (distribution.website && distribution.websiteIds.length === 0) {
      return "Please select at least one website";
    }

    if (distribution.facebook && distribution.facebookAccounts.length === 0) {
      return "Please select at least one Facebook Page";
    }

    if (distribution.instagram && distribution.instagramAccounts.length === 0) {
      return "Please select at least one Instagram account";
    }

    if (distribution.linkedin && distribution.linkedinAccounts.length === 0) {
      return "Please select at least one LinkedIn account";
    }

    if (status === "Scheduled" && !form.publishDate) {
      return "Publish date is required for scheduled content";
    }

    if (status === "Scheduled" && !form.publishTime) {
      return "Publish time is required for scheduled content";
    }

    if (distribution.backlink && distribution.backlinkUrls.length === 0) {
      return "Please add at least one backlink URL";
    }

    return null;
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const saveContent = async (saveStatus = status) => {
    const validationError = validate();

    if (validationError) {
      showMessage("error", validationError);
      return;
    }

    try {
      setSaveLoading(true);

      setMessage({
        type: "",
        text: "",
      });

      const payload = buildPayload(saveStatus);

      console.log("DISTRIBUTION PAYLOAD:", payload.distribution);

      console.log("CREATE CONTENT PAYLOAD:", payload);

      const res = await contentApi.create(payload);
      if (saveStatus === "Published") {
        const disres = await distributionApi.distribute(res?._id);
        console.log("disres-" + disres);
      }

      showMessage(
        "success",
        saveStatus === "Published"
          ? "Content published successfully."
          : saveStatus === "Scheduled"
            ? "Content scheduled successfully."
            : "Content saved successfully.",
      );

      setTimeout(() => {
        navigate("/content");
      }, 800);
    } catch (error) {
      showMessage("error", extractError(error));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSave = () => {
    saveContent(status);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===================================================
          HEADER
      =================================================== */}
      <MediaManager
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(file) => {
          updateForm("featuredImage", file?.url);
          // Popup automatically close hoga
          // MediaManager ke andar onClose() call ho raha hai
        }}
      />
      <div className="sticky top-0 z-40 border-b bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/content")}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft size={19} />
              </button>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Create Content
                </h1>

                <p className="text-sm text-slate-500">
                  Create SEO optimized content for your business
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Eye size={17} />
                Preview
              </button>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none"
              >
                <option value="Draft">Draft</option>

                <option value="Scheduled">Scheduled</option>

                <option value="Published">Published</option>
              </select>

              <button
                type="button"
                disabled={saveLoading}
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {saveLoading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                Save Content
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="px-6">
          <div className="flex gap-7">
            {[
              ["content", "Content"],
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
                CONTENT TAB
            ================================================= */}

            {activeTab === "content" && (
              <>
                {/* BASIC */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-slate-900">
                        Content Details
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Basic information about your content
                      </p>
                    </div>

                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium outline-none"
                    >
                      {CONTENT_TYPES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-5">
                    {/* TITLE */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Title *
                      </label>

                      <input
                        value={form.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Enter content title"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* KEYWORD */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Primary Keyword *
                      </label>

                      <div className="flex gap-2">
                        <input
                          value={form.keyword}
                          onChange={(e) => {
                            const value = e.target.value;

                            updateForm("keyword", value);

                            if (!seo.focusKeyword) {
                              updateSeo("focusKeyword", value);
                            }
                          }}
                          placeholder="e.g. wholesale shoes"
                          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />

                        <button
                          type="button"
                          onClick={researchKeywords}
                          disabled={researchLoading}
                          className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                        >
                          {researchLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Search size={16} />
                          )}
                          Research
                        </button>
                      </div>
                    </div>

                    {/* SECONDARY */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Secondary Keywords
                      </label>

                      <div className="rounded-xl border border-slate-200 p-3">
                        <div className="mb-2 flex flex-wrap gap-2">
                          {form.secondaryKeywords.map((keyword, index) => (
                            <span
                              key={`${keyword}-${index}`}
                              className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700"
                            >
                              {keyword}

                              <button
                                type="button"
                                onClick={() => removeKeyword(index)}
                                className="text-blue-500 hover:text-blue-800"
                              >
                                <X size={13} />
                              </button>
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyDown={handleKeywordKeyDown}
                            placeholder="Type keyword and press Enter"
                            className="min-w-0 flex-1 border-0 px-1 py-2 text-sm outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => addKeyword(keywordInput)}
                            className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            <Plus size={14} />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI */}

                <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <Sparkles size={19} />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          AI Content Assistant
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          Generate SEO-friendly content using your primary
                          keyword.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={generateWithAI}
                      disabled={generateLoading}
                      className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {generateLoading ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Sparkles size={17} />
                      )}
                      Generate with AI
                    </button>
                  </div>
                </div>

                {/* EDITOR */}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-bold text-slate-900">
                          Content Editor
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Write or paste your article content
                        </p>
                      </div>

                      <span className="text-xs text-slate-500">
                        {wordCount} words
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-3 flex flex-wrap gap-2 rounded-xl bg-slate-50 p-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateForm(
                            "content",
                            `${form.content}\n<h2>Your heading</h2>`,
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Heading
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateForm(
                            "content",
                            `${form.content}\n<strong>Bold text</strong>`,
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Bold
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateForm(
                            "content",
                            `${form.content}\n<em>Italic text</em>`,
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Italic
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateForm(
                            "content",
                            `${form.content}\n<ul><li>List item</li></ul>`,
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        List
                      </button>
                    </div>

                    <textarea
                      value={form.content}
                      onChange={(e) => updateForm("content", e.target.value)}
                      placeholder="<h2>Introduction</h2><p>Start writing your content...</p>"
                      rows={22}
                      className="w-full resize-y rounded-xl border border-slate-200 px-4 py-4 font-mono text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* EXCERPT + IMAGE */}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <FileText size={18} className="text-blue-600" />

                      <h2 className="font-bold text-slate-900">Excerpt</h2>
                    </div>

                    <textarea
                      value={form.excerpt}
                      onChange={(e) => updateForm("excerpt", e.target.value)}
                      rows={6}
                      placeholder="Short summary of the content..."
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <ImageIcon size={18} className="text-blue-600" />

                      <h2 className="font-bold text-slate-900">
                        Featured Image
                      </h2>
                    </div>

                    {form.featuredImage ? (
                      <img
                        src={form.featuredImage}
                        
                        className="mt-4 h-40 w-full rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <>
                        {mediaOpen}
                        <button
                          type="button"
                          onClick={() => setMediaOpen(true)}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                        >
                          Select Image
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* SCHEDULE */}

                {(status === "Scheduled" || form.publishDate) && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                      <Calendar size={18} className="text-blue-600" />

                      <div>
                        <h2 className="font-bold text-slate-900">
                          Publishing Schedule
                        </h2>

                        <p className="text-sm text-slate-500">
                          Set when this content should be published
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Publish Date
                        </label>

                        <input
                          type="date"
                          value={form.publishDate}
                          onChange={(e) =>
                            updateForm("publishDate", e.target.value)
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Publish Time
                        </label>

                        <input
                          type="time"
                          value={form.publishTime}
                          onChange={(e) =>
                            updateForm("publishTime", e.target.value)
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* =================================================
                SEO TAB
            ================================================= */}

            {activeTab === "seo" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="font-bold text-slate-900">SEO Settings</h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Optimize this content for search engines
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Meta Title
                      </label>

                      <input
                        value={seo.metaTitle}
                        onChange={(e) => updateSeo("metaTitle", e.target.value)}
                        maxLength={160}
                        placeholder="SEO title"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />

                      <div className="mt-1 text-right text-xs text-slate-400">
                        {seo.metaTitle.length}
                        /160
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Meta Description
                      </label>

                      <textarea
                        value={seo.metaDescription}
                        onChange={(e) =>
                          updateSeo("metaDescription", e.target.value)
                        }
                        maxLength={320}
                        rows={5}
                        placeholder="Describe this page for search engines..."
                        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />

                      <div className="mt-1 text-right text-xs text-slate-400">
                        {seo.metaDescription.length}
                        /320
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        URL Slug
                      </label>

                      <div className="relative">
                        <Link2
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          value={seo.slug}
                          onChange={(e) =>
                            updateSeo("slug", slugify(e.target.value))
                          }
                          placeholder="content-url-slug"
                          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Focus Keyword
                      </label>

                      <input
                        value={seo.focusKeyword}
                        onChange={(e) =>
                          updateSeo("focusKeyword", e.target.value)
                        }
                        placeholder="Primary SEO keyword"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO PREVIEW */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 font-bold text-slate-900">SEO Preview</h2>

                  <div className="rounded-xl border border-slate-200 p-5">
                    <div className="text-sm text-emerald-700">
                      {seo.slug ? `example.com/${seo.slug}` : "example.com"}
                    </div>

                    <div className="mt-1 text-lg font-semibold text-blue-700">
                      {seo.metaTitle || form.title || "Your content title"}
                    </div>

                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      {seo.metaDescription ||
                        form.excerpt ||
                        "Your meta description will appear here."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                DISTRIBUTION TAB
            ================================================= */}

            {activeTab === "distribution" && (
              <div className="space-y-6">
                {/* OPTIONS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="font-bold text-slate-900">
                      Content Distribution
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Select where this content should be distributed after
                      publishing.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DistributionCard
                      active={distribution.website}
                      onClick={() => toggleDistribution("website")}
                      icon={<Globe size={21} />}
                      title="Website"
                      description="Publish on your websites"
                    />

                    <DistributionCard
                      active={distribution.facebook}
                      onClick={() => toggleDistribution("facebook")}
                      icon={<FaFacebook className="text-[21px]" />}
                      title="Facebook"
                      description="Share on Facebook Pages"
                    />

                    <DistributionCard
                      active={distribution.instagram}
                      onClick={() => toggleDistribution("instagram")}
                      icon={<FaInstagram className="text-[21px]" />}
                      title="Instagram"
                      description="Share on Instagram accounts"
                    />

                    <DistributionCard
                      active={distribution.linkedin}
                      onClick={() => toggleDistribution("linkedin")}
                      icon={<FaLinkedin className="text-[21px]" />}
                      title="LinkedIn"
                      description="Share on LinkedIn accounts"
                    />

                    <DistributionCard
                      active={distribution.backlink}
                      onClick={() => toggleDistribution("backlink")}
                      icon={<Link2 size={21} />}
                      title="Backlinks"
                      description="Create backlink distribution"
                    />

                    <DistributionCard
                      active={distribution.newsletter}
                      onClick={() => toggleDistribution("newsletter")}
                      icon={<Mail size={21} />}
                      title="Newsletter"
                      description="Send to newsletter subscribers"
                    />
                  </div>
                </div>

                {/* WEBSITE */}

                {distribution.website && (
                  <WebsiteAccountsSection
                    websites={websiteAccounts}
                    selectedIds={distribution.websiteIds}
                    loading={integrationLoading.website}
                    onRefresh={loadWebsites}
                    onSelect={toggleWebsite}
                    onSelectAll={selectAllWebsites}
                    onClear={clearWebsites}
                  />
                )}

                {/* FACEBOOK */}

                {distribution.facebook && (
                  <SocialAccountsSection
                    title="Facebook Pages"
                    icon={<FaFacebook className="text-blue-600" />}
                    accounts={facebookAccounts}
                    selectedIds={distribution.facebookAccounts}
                    loading={integrationLoading.facebook}
                    onRefresh={() => loadIntegration("facebook")}
                    onSelect={toggleFacebookAccount}
                    onSelectAll={selectAllFacebook}
                    onClear={clearFacebook}
                    emptyText="No connected Facebook Pages found."
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
                  <SocialAccountsSection
                    title="Instagram Accounts"
                    icon={<FaInstagram className="text-pink-600" />}
                    accounts={instagramAccounts}
                    selectedIds={distribution.instagramAccounts}
                    loading={integrationLoading.instagram}
                    onRefresh={() => loadIntegration("instagram")}
                    onSelect={toggleInstagramAccount}
                    onSelectAll={selectAllInstagram}
                    onClear={clearInstagram}
                    emptyText="No connected Instagram accounts found."
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
                  <SocialAccountsSection
                    title="LinkedIn Accounts"
                    icon={<FaLinkedin className="text-blue-700" />}
                    accounts={linkedinAccounts}
                    selectedIds={distribution.linkedinAccounts}
                    loading={integrationLoading.linkedin}
                    onRefresh={() => loadIntegration("linkedin")}
                    onSelect={toggleLinkedinAccount}
                    onSelectAll={selectAllLinkedin}
                    onClear={clearLinkedin}
                    emptyText="No connected LinkedIn accounts found."
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

                {/* BACKLINK */}

                {distribution.backlink && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link2 size={19} className="text-blue-600" />

                          <h3 className="font-bold text-slate-900">
                            Backlink URLs
                          </h3>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          Add websites or pages where this content should be
                          promoted.
                        </p>
                      </div>

                      <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                        {distribution.backlinkUrls.length} URLs
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={backlinkInput}
                        onChange={(e) => setBacklinkInput(e.target.value)}
                        onKeyDown={handleBacklinkKeyDown}
                        placeholder="https://example.com/page"
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />

                      <button
                        type="button"
                        onClick={() => addBacklink(backlinkInput)}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        <Plus size={16} />
                        Add URL
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      {distribution.backlinkUrls.map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <Link2
                              size={15}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="truncate text-sm text-slate-700">
                              {url}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeBacklink(index)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {distribution.backlinkUrls.length === 0 && (
                      <div className="mt-4 rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                        No backlink URLs added.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <div className="space-y-6">
            {/* SEO SCORE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">SEO Score</h3>

                  <p className="text-xs text-slate-500">Content optimization</p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-blue-100 text-lg font-bold text-blue-600">
                  {seoScore}
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
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

            {/* CONTENT SUMMARY */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-slate-900">Content Summary</h3>

              <div className="space-y-4">
                <InfoRow
                  icon={<FileText size={17} />}
                  label="Type"
                  value={
                    CONTENT_TYPES.find((item) => item.value === type)?.label ||
                    "Blog"
                  }
                />

                <InfoRow
                  icon={<Tag size={17} />}
                  label="Keywords"
                  value={form.secondaryKeywords.length}
                />

                <InfoRow
                  icon={<FileText size={17} />}
                  label="Words"
                  value={wordCount}
                />

                <InfoRow
                  icon={<Globe size={17} />}
                  label="Websites"
                  value={distribution.websiteIds.length}
                />
              </div>
            </div>

            {/* PUBLISHING */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-slate-900">Publishing</h3>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={saveLoading}
                  onClick={() => saveContent("Draft")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  <Save size={17} />
                  Save Draft
                </button>

                <button
                  type="button"
                  disabled={saveLoading}
                  onClick={() => saveContent("Published")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <CheckCircle2 size={17} />
                  Publish Now
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
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="font-bold text-slate-900">Content Preview</h2>

                <p className="text-sm text-slate-500">
                  Preview how your content will look
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="overflow-y-auto p-8">
              <article className="mx-auto max-w-3xl">
                {form.featuredImage && (
                  <img
                    src={form.featuredImage}
                    alt={form.title || "Featured"}
                    className="mb-7 h-72 w-full rounded-2xl object-cover"
                  />
                )}

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
   DISTRIBUTION CARD
=========================================================== */

function DistributionCard({ active, onClick, icon, title, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
        active
          ? "border-blue-200 bg-blue-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          {icon}
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>

          <div className="mt-0.5 text-xs text-slate-500">{description}</div>
        </div>
      </div>

      <div
        className={`h-5 w-5 rounded-full border-2 ${
          active ? "border-blue-600 bg-blue-600" : "border-slate-300"
        }`}
      >
        {active && <div className="m-1 h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
    </button>
  );
}

/* ===========================================================
   WEBSITE ACCOUNTS SECTION
=========================================================== */

function WebsiteAccountsSection({
  websites,
  selectedIds,
  loading,
  onRefresh,
  onSelect,
  onSelectAll,
  onClear,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* HEADER */}

      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Globe size={20} />
          </div>

          <div>
            <h3 className="font-bold text-slate-900">Websites</h3>

            <p className="text-xs text-slate-500">
              {selectedIds.length} selected
              {" / "}
              {websites.length} available
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {websites.length > 0 && (
            <>
              <button
                type="button"
                onClick={onSelectAll}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={onClear}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            title="Refresh websites"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 py-10">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Loading websites...
          </div>
        </div>
      )}

      {/* EMPTY */}

      {!loading && websites.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
          <Globe size={28} className="mx-auto text-slate-300" />

          <div className="mt-3 text-sm font-semibold text-slate-700">
            No websites found.
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Create a website first to distribute content.
          </p>
        </div>
      )}

      {/* WEBSITES */}

      {!loading && websites.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {websites.map((website) => {
            const id = getWebsiteId(website);

            const selected = selectedIds.includes(id);

            const image = getWebsiteImage(website);

            const name = getWebsiteName(website);

            const url = getWebsiteUrl(website);

            return (
              <button
                key={id || website?.name}
                type="button"
                onClick={() => onSelect(website)}
                className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="h-11 w-11 shrink-0 rounded-xl object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        selected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Globe size={19} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {name}
                    </div>

                    {url && (
                      <div className="mt-1 truncate text-xs text-slate-500">
                        {url}
                      </div>
                    )}

                    {id && (
                      <div className="mt-1 truncate text-[10px] text-slate-400">
                        ID: {id}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected
                      ? "border-blue-600 bg-blue-600"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {selected && (
                    <CheckCircle2 size={14} className="text-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===========================================================
   SOCIAL ACCOUNTS SECTION
=========================================================== */

function SocialAccountsSection({
  title,
  icon,
  accounts,
  selectedIds,
  loading,
  onRefresh,
  onSelect,
  onSelectAll,
  onClear,
  emptyText,
  renderName,
  renderSubText,
  renderImage,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* HEADER */}

      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            {icon}
          </div>

          <div>
            <h3 className="font-bold text-slate-900">{title}</h3>

            <p className="text-xs text-slate-500">
              {selectedIds.length} selected
              {" / "}
              {accounts.length} connected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {accounts.length > 0 && (
            <>
              <button
                type="button"
                onClick={onSelectAll}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={onClear}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 py-10">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Loading connected accounts...
          </div>
        </div>
      )}

      {/* EMPTY */}

      {!loading && accounts.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
          <div className="text-sm font-semibold text-slate-700">
            {emptyText}
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Connect the account first from Integrations.
          </p>
        </div>
      )}

      {/* ACCOUNTS */}

      {!loading && accounts.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {accounts.map((account) => {
            const id = getAccountId(account);

            const selected = selectedIds.includes(id);

            const image = renderImage?.(account);

            return (
              <button
                key={account?._id || id}
                type="button"
                onClick={() => onSelect(account)}
                className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {image ? (
                    <img
                      src={image}
                      alt={renderName(account)}
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                        selected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {icon}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {renderName(account)}
                    </div>

                    <div className="mt-1 truncate text-xs text-slate-500">
                      {renderSubText(account)}
                    </div>

                    {id && (
                      <div className="mt-1 truncate text-[10px] text-slate-400">
                        ID: {id}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected
                      ? "border-blue-600 bg-blue-600"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {selected && (
                    <CheckCircle2 size={14} className="text-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
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
   INFO ROW
=========================================================== */

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        {label}
      </div>

      <span className="max-w-[180px] truncate text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}
