// src/pages/settings/Integrations.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Settings,
  RefreshCw,
  MessageCircle,
  Mail,
  Smartphone,
  Globe,
  Zap,
  ExternalLink,
  Plus,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
  FaGoogle,
  FaYoutube,
  FaWordpress,
  FaShopify,
} from "react-icons/fa";

import { SiGoogleforms } from "react-icons/si";

import integrationsApi from "../../api/integrations.api";

// ======================================================
// CHANNEL ICON
// ======================================================

const ChannelIcon = ({ type, size = 22 }) => {
  const channel = String(type || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  const wrapper =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl";

  switch (channel) {
    case "facebook":
    case "facebookpage":
    case "facebookpages":
      return (
        <div className={`${wrapper} bg-blue-50 text-blue-600`}>
          <FaFacebook size={size} />
        </div>
      );

    case "instagram":
      return (
        <div className={`${wrapper} bg-pink-50 text-pink-600`}>
          <FaInstagram size={size} />
        </div>
      );

    case "linkedin":
      return (
        <div className={`${wrapper} bg-sky-50 text-sky-700`}>
          <FaLinkedin size={size} />
        </div>
      );

    case "whatsapp":
      return (
        <div className={`${wrapper} bg-emerald-50 text-emerald-600`}>
          <FaWhatsapp size={size} />
        </div>
      );
    case "email":
      return (
        <div className={`${wrapper} bg-blue-50 text-blue-600`}>
          <Mail size={size} />
        </div>
      );
    case "google":
    case "googleads":
    case "googlelead":
      return (
        <div className={`${wrapper} bg-red-50 text-red-600`}>
          <FaGoogle size={size} />
        </div>
      );

    case "googleform":
    case "googleforms":
      return (
        <div className={`${wrapper} bg-purple-50 text-purple-600`}>
          <SiGoogleforms size={size} />
        </div>
      );

    case "indiamart":
      return (
        <div
          className={`${wrapper} bg-orange-50 text-orange-600`}
          title="IndiaMART"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-[10px] font-extrabold tracking-tight text-white">
            IM
          </div>
        </div>
      );

    case "wordpress":
      return (
        <div className={`${wrapper} bg-blue-50 text-blue-600`}>
          <FaWordpress size={size} />
        </div>
      );

    case "shopify":
      return (
        <div className={`${wrapper} bg-green-50 text-green-600`}>
          <FaShopify size={size} />
        </div>
      );

    case "youtube":
      return (
        <div className={`${wrapper} bg-red-50 text-red-600`}>
          <FaYoutube size={size} />
        </div>
      );

    case "sms":
      return (
        <div className={`${wrapper} bg-violet-50 text-violet-600`}>
          <Smartphone size={size} />
        </div>
      );

    case "website":
      return (
        <div className={`${wrapper} bg-orange-50 text-orange-600`}>
          <Globe size={size} />
        </div>
      );

    default:
      return (
        <div className={`${wrapper} bg-gray-50 text-gray-600`}>
          <Zap size={size} />
        </div>
      );
  }
};

// ======================================================
// HELPERS
// ======================================================

const getApiData = (response) => {
  return response?.data ?? response ?? {};
};

const getIntegrationList = (response) => {
  const data = getApiData(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.integrations)) {
    return data.integrations;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  if (Array.isArray(data.data?.integrations)) {
    return data.data.integrations;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  return [];
};

// ======================================================
// DEFAULT INTEGRATIONS
// ======================================================

const DEFAULT_INTEGRATIONS = [
  {
    key: "facebook",
    name: "Facebook",
    description:
      "Connect Facebook Pages to receive leads, messages and customer enquiries.",
    category: "Social",
    connected: false,
    status: "not_connected",
    accountName: "",
  },

  {
    key: "instagram",
    name: "Instagram",
    description:
      "Connect Instagram accounts to receive messages and generate leads.",
    category: "Social",
    connected: false,
    status: "not_connected",
    accountName: "",
  },
  {
    key: "whatsapp",
    name: "WhatsApp",
    description:
      "Connect WhatsApp Business to receive and manage customer messages.",
    category: "Messaging",
    connected: false,
    status: "not_connected",
    accountName: "",
  },

  {
    key: "googleads",
    name: "Google Ads",
    description:
      "Connect Google Ads to track campaigns and capture advertising leads.",
    category: "Marketing",
    connected: false,
    status: "not_connected",
    accountName: "",
  },
  {
    key: "email",
    name: "Email",
    description:
      "Connect your email account to manage customer emails from Inbox.",
    category: "Messaging",
    connected: false,
    status: "not_connected",
    accountName: "",
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    description:
      "Connect LinkedIn to manage your business presence and lead sources.",
    category: "Social",
    connected: false,
    status: "not_connected",
    accountName: "",
  },

  {
    key: "indiamart",
    name: "IndiaMART",
    description:
      "Connect IndiaMART to automatically receive and manage incoming leads.",
    category: "Lead Generation",
    connected: false,
    status: "not_connected",
    accountName: "",
  },

  {
    key: "googleform",
    name: "Google Forms",
    description:
      "Connect Google Forms to automatically capture form submissions as leads.",
    category: "Lead Generation",
    connected: false,
    status: "not_connected",
    accountName: "",
  },

  {
    key: "justdial",
    name: "JustDial",
    description:
      "Connect JustDial to receive and manage customer enquiries and leads.",
    category: "Lead Generation",
    connected: false,
    status: "not_connected",
    accountName: "",
  },

  {
    key: "sms",
    name: "SMS",
    description:
      "Connect an SMS provider for transactional and marketing messages.",
    category: "Messaging",
    connected: false,
    status: "not_connected",
    accountName: "",
  },

  {
    key: "website",
    name: "Website",
    description:
      "Connect your website to capture leads and customer enquiries.",
    category: "Lead Generation",
    connected: false,
    status: "not_connected",
    accountName: "",
  },

  {
    key: "wordpress",
    name: "WordPress",
    description:
      "Connect WordPress to synchronize website and lead information.",
    category: "Website",
    connected: false,
    status: "not_connected",
    accountName: "",
  },

  {
    key: "shopify",
    name: "Shopify",
    description:
      "Connect Shopify to synchronize orders, customers and store data.",
    category: "Ecommerce",
    connected: false,
    status: "not_connected",
    accountName: "",
  },
];

// ======================================================
// STATUS BADGE
// ======================================================

const StatusBadge = ({ connected, status }) => {
  if (connected || status === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 size={13} />
        Connected
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
        <XCircle size={13} />
        Error
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        <Loader2 size={13} />
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
      Not connected
    </span>
  );
};

// ======================================================
// INTEGRATION CARD
// ======================================================

const IntegrationCard = ({
  integration,
  onConnect,
  onDisconnect,
  onRefresh,
  processing,
}) => {
  const isConnected =
    integration.connected === true || integration.status === "connected";

  const isProcessing = processing === integration.key;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <ChannelIcon type={integration.key} />

        <StatusBadge
          connected={integration.connected}
          status={integration.status}
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900">
            {integration.name}
          </h3>

          {isConnected && (
            <ShieldCheck
              size={15}
              className="text-emerald-500"
              title="Verified connection"
            />
          )}
        </div>

        <p className="mt-1.5 min-h-[42px] text-xs leading-5 text-gray-500">
          {integration.description}
        </p>
      </div>

      {isConnected && integration.accountName && (
        <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Connected account
          </p>

          <p className="mt-0.5 truncate text-xs font-semibold text-gray-700">
            {integration.accountName}
          </p>
        </div>
      )}

      <div className="mt-5 flex items-center gap-2">
        {isConnected ? (
          <>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onRefresh(integration)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Refresh
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onDisconnect(integration)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onConnect(integration)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Connect {integration.name}
          </button>
        )}
      </div>
    </div>
  );
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const Integrations = () => {
  const [integrations, setIntegrations] = useState(DEFAULT_INTEGRATIONS);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // ====================================================
  // LOAD INTEGRATIONS
  // ====================================================

  const loadIntegrations = async ({ silent = false } = {}) => {
    try {
      setError("");

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await integrationsApi.getIntegrations();

      const serverIntegrations = getIntegrationList(response);

      const normalized = DEFAULT_INTEGRATIONS.map((defaultItem) => {
        const serverItem = serverIntegrations.find((item) => {
          const serverKey = String(
            item?.key ||
              item?.type ||
              item?.channel ||
              item?.provider ||
              item?.name ||
              "",
          )
            .toLowerCase()
            .replace(/[\s_-]/g, "");

          const defaultKey = defaultItem.key
            .toLowerCase()
            .replace(/[\s_-]/g, "");

          return serverKey === defaultKey;
        });

        if (!serverItem) {
          return defaultItem;
        }

        return {
          ...defaultItem,
          ...serverItem,

          key:
            serverItem.key ||
            serverItem.type ||
            serverItem.channel ||
            defaultItem.key,

          name: serverItem.name || defaultItem.name,

          description: serverItem.description || defaultItem.description,

          category: serverItem.category || defaultItem.category,

          connected:
            serverItem.connected === true || serverItem.status === "connected",

          status: serverItem.status || "not_connected",

          accountName:
            serverItem.accountName ||
            serverItem.account?.name ||
            serverItem.profile?.name ||
            "",
        };
      });

      setIntegrations(normalized);
    } catch (err) {
      console.error("GET INTEGRATIONS ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load integrations.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadIntegrations();
  }, []);

  // ====================================================
  // CONNECT
  // ====================================================

  const handleConnect = async (integration) => {
    try {
      setError("");
      setSuccess("");
      setProcessing(integration.key);

      const response = await integrationsApi.getConnectUrl(integration.key);

      const data = getApiData(response);

      const connectUrl =
        data?.url ||
        data?.connectUrl ||
        data?.authUrl ||
        data?.redirectUrl ||
        data?.data?.url ||
        data?.data?.connectUrl ||
        data?.data?.authUrl ||
        data?.data?.redirectUrl;

      // OAuth / Redirect integration
      if (connectUrl) {
        window.location.href = connectUrl;
        return;
      }

      // Direct connection
      setIntegrations((current) =>
        current.map((item) =>
          item.key === integration.key
            ? {
                ...item,
                connected: true,
                status: "connected",
                accountName:
                  data?.accountName ||
                  data?.data?.accountName ||
                  item.accountName,
              }
            : item,
        ),
      );

      setSuccess(`${integration.name} connected successfully.`);
    } catch (err) {
      console.error("CONNECT INTEGRATION ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          `Failed to connect ${integration.name}.`,
      );
    } finally {
      setProcessing("");
    }
  };

  // ====================================================
  // DISCONNECT
  // ====================================================

  const handleDisconnect = async (integration) => {
    const confirmed = window.confirm(
      `Are you sure you want to disconnect ${integration.name}?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");
      setProcessing(integration.key);

      await integrationsApi.disconnect(integration.key, integration._id);

      setIntegrations((current) =>
        current.map((item) =>
          item.key === integration.key
            ? {
                ...item,
                connected: false,
                status: "not_connected",
                accountName: "",
              }
            : item,
        ),
      );

      setSuccess(`${integration.name} disconnected successfully.`);
    } catch (err) {
      console.error("DISCONNECT INTEGRATION ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          `Failed to disconnect ${integration.name}.`,
      );
    } finally {
      setProcessing("");
    }
  };

  // ====================================================
  // REFRESH CONNECTION
  // ====================================================

  const handleRefresh = async (integration) => {
    try {
      setError("");
      setSuccess("");
      setProcessing(integration.key);

      const response = await integrationsApi.refresh(integration.key);

      const data = getApiData(response);

      setIntegrations((current) =>
        current.map((item) =>
          item.key === integration.key
            ? {
                ...item,

                connected:
                  data?.connected ?? data?.data?.connected ?? item.connected,

                status: data?.status || data?.data?.status || item.status,

                accountName:
                  data?.accountName ||
                  data?.data?.accountName ||
                  item.accountName,
              }
            : item,
        ),
      );

      setSuccess(`${integration.name} connection refreshed.`);
    } catch (err) {
      console.error("REFRESH INTEGRATION ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          `Failed to refresh ${integration.name}.`,
      );
    } finally {
      setProcessing("");
    }
  };

  // ====================================================
  // DYNAMIC CATEGORIES
  // ====================================================

  const categories = useMemo(() => {
    const values = integrations.map((item) => item.category).filter(Boolean);

    return ["all", ...new Set(values)];
  }, [integrations]);

  // ====================================================
  // FILTER
  // ====================================================

  const filteredIntegrations = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return integrations.filter((item) => {
      const name = String(item.name || "").toLowerCase();

      const description = String(item.description || "").toLowerCase();

      const itemCategory = String(item.category || "");

      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        description.includes(searchValue);

      const matchesCategory = category === "all" || itemCategory === category;

      return matchesSearch && matchesCategory;
    });
  }, [integrations, search, category]);

  // ====================================================
  // STATS
  // ====================================================

  const connectedCount = integrations.filter(
    (item) => item.connected === true || item.status === "connected",
  ).length;

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Zap size={21} />
                </div>

                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Integrations
                  </h1>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Connect your communication, marketing and lead channels
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
                <span className="text-[10px] text-gray-400">Connected</span>

                <span className="ml-2 text-sm font-bold text-gray-900">
                  {connectedCount}
                </span>

                <span className="ml-1 text-[10px] text-gray-400">
                  / {integrations.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  loadIntegrations({
                    silent: true,
                  })
                }
                disabled={refreshing}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <main className="mx-auto max-w-[1500px] px-5 py-6 lg:px-8">
        {/* ALERT */}

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={17} />

            <span className="flex-1">{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={17} />

            <span className="flex-1">{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* ==================================================
            INFO
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-blue-600">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-blue-900">
                Connect your business channels
              </h2>

              <p className="mt-1 max-w-3xl text-xs leading-5 text-blue-700">
                Connect Facebook, Instagram, LinkedIn, WhatsApp, IndiaMART,
                Google Forms, JustDial and other platforms to manage leads,
                messages and customer enquiries from one place.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  category === value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {value === "all" ? "All" : value}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search integrations..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs outline-none transition focus:border-blue-400 focus:bg-white focus:ring-3 focus:ring-blue-50"
            />
          </div>
        </div>

        {/* ==================================================
            GRID
        ================================================== */}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-100" />

                <div className="mt-5 h-4 w-32 animate-pulse rounded bg-gray-100" />

                <div className="mt-3 h-3 w-full animate-pulse rounded bg-gray-100" />

                <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-gray-100" />

                <div className="mt-6 h-9 w-full animate-pulse rounded-lg bg-gray-100" />
              </div>
            ))}
          </div>
        ) : filteredIntegrations.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
              <Settings size={25} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-gray-800">
              No integrations found
            </h3>

            <p className="mt-1 text-xs text-gray-400">
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.key}
                integration={integration}
                processing={processing}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onRefresh={handleRefresh}
              />
            ))}
          </div>
        )}

        {/* ==================================================
            FOOTER INFO
        ================================================== */}

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
              <Settings size={17} />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700">
                Need help with an integration?
              </p>

              <p className="mt-0.5 text-[11px] text-gray-400">
                Configure API credentials and connection settings from the
                respective integration.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View documentation
            <ExternalLink size={13} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Integrations;
