import React, { useEffect, useMemo, useState } from "react";

import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  Filter,
  Loader2,
  Mail,
  MessageCircle,
  MoreVertical,
  RefreshCw,
  Search,
  Send,
  Star,
  X,
} from "lucide-react";

import inboxApi from "../../api/inbox.api";
import WhatsAppActivity from "./../crm/activities/WhatsAppActivity";

import useNotifications from "../../hooks/useNotifications";

/* =========================================================
   HELPERS
========================================================= */

const getResponseData = (response) => {
  return response?.data?.data ?? response?.data ?? null;
};

const getConversationId = (conversation) => {
  return (
    conversation?._id ||
    conversation?.id ||
    conversation?.conversationId ||
    null
  );
};

const getCustomer = (conversation) => {
  return (
    conversation?.customer ||
    conversation?.participant ||
    conversation?.lead ||
    {}
  );
};

const getCustomerName = (conversation) => {
  const customer = getCustomer(conversation);

  return (
    customer?.name ||
    customer?.profileName ||
    customer?.fullName ||
    customer?.firstName ||
    conversation?.customerName ||
    conversation?.participantName ||
    "Unknown"
  );
};

const getCustomerPhone = (conversation) => {
  const customer = getCustomer(conversation);

  return (
    customer?.phone ||
    customer?.waId ||
    customer?.whatsappPhone ||
    conversation?.metadata?.whatsappCustomerPhone ||
    ""
  );
};

const getLastMessageText = (conversation) => {
  const lastMessage = conversation?.lastMessage;

  if (!lastMessage) {
    return "No messages yet";
  }

  if (typeof lastMessage === "string") {
    return lastMessage;
  }

  if (lastMessage?.text) {
    return lastMessage.text;
  }

  switch (lastMessage?.messageType) {
    case "image":
      return "📷 Image";

    case "video":
      return "🎥 Video";

    case "audio":
      return "🎵 Audio";

    case "document":
      return "📄 Document";

    case "sticker":
      return "😊 Sticker";

    case "location":
      return "📍 Location";

    case "contacts":
      return "👤 Contact";

    case "template":
      return "Template message";

    case "interactive":
      return "Interactive message";

    case "reaction":
      return "Reaction";

    default:
      return "Message";
  }
};

const getLastMessageTime = (conversation) => {
  return (
    conversation?.lastMessageAt ||
    conversation?.lastMessage?.createdAt ||
    conversation?.updatedAt ||
    null
  );
};

const formatTime = (date) => {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getChannel = (conversation) => {
  return String(
    conversation?.channel ||
      conversation?.provider ||
      conversation?.lastMessage?.channel ||
      "whatsapp",
  ).toLowerCase();
};

const getUnreadCount = (conversation) => {
  return Number(conversation?.unreadCount || 0);
};

/* =========================================================
   CHANNEL ICON
========================================================= */

const ChannelIcon = ({ channel }) => {
  const value = String(channel || "").toLowerCase();

  if (value === "whatsapp") {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
        <MessageCircle size={12} />
      </div>
    );
  }

  if (value === "email") {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
        <Mail size={12} />
      </div>
    );
  }

  if (value === "sms") {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-white">
        <Send size={11} />
      </div>
    );
  }

  if (value === "facebook") {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
        f
      </div>
    );
  }

  if (value === "instagram") {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[9px] font-bold text-white">
        IG
      </div>
    );
  }

  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-400 text-white">
      <MessageCircle size={11} />
    </div>
  );
};

/* =========================================================
   AVATAR
========================================================= */

const Avatar = ({ conversation }) => {
  const name = getCustomerName(conversation);

  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
      {initial}
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({ title, description }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <MessageCircle className="text-gray-400" size={25} />
      </div>

      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>

      {description && (
        <p className="mt-1 max-w-sm text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
};

/* =========================================================
   CONVERSATION ITEM
========================================================= */

const ConversationItem = ({ conversation, selected, onClick }) => {
  const name = getCustomerName(conversation);
  const lastMessage = getLastMessageText(conversation);
  const lastMessageTime = getLastMessageTime(conversation);
  const unreadCount = getUnreadCount(conversation);
  const channel = getChannel(conversation);

  return (
    <button
      type="button"
      onClick={() => onClick(conversation)}
      className={`w-full border-b border-gray-100 px-3 py-3 text-left transition ${
        selected ? "bg-gray-100" : "bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex gap-3">
        <Avatar conversation={conversation} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-gray-800">
                {name}
              </span>

              <ChannelIcon channel={channel} />
            </div>

            <span className="shrink-0 text-[10px] text-gray-400">
              {lastMessageTime ? formatTime(lastMessageTime) : ""}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <p
              className={`truncate text-xs ${
                unreadCount > 0
                  ? "font-semibold text-gray-700"
                  : "text-gray-500"
              }`}
            >
              {lastMessage}
            </p>

            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-green-500 px-1.5 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>

          {conversation?.starred && (
            <div className="mt-1">
              <Star size={11} className="fill-yellow-400 text-yellow-400" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

/* =========================================================
   MAIN INBOX
========================================================= */

const Inbox = () => {
  const [conversations, setConversations] = useState([]);

  const [selectedConversation, setSelectedConversation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [channelFilter, setChannelFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  const [showFilters, setShowFilters] = useState(false);

  const [mobileView, setMobileView] = useState("list");

  const [actionLoading, setActionLoading] = useState(false);

  const [showConversationMenu, setShowConversationMenu] = useState(false);

  const { notifications, dismissNotification } = useNotifications();

  useEffect(() => {
    if (!notifications.length) return;

    console.log("Notifications:", notifications);

    const timers = notifications.map((item) =>
      setTimeout(async () => {
        await fetchConversations({
          silent: true,
        });
        dismissNotification(item._id);
      }, 5000),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications, dismissNotification]);

  /* =====================================================
     FETCH CONVERSATIONS
  ===================================================== */

  const fetchConversations = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await inboxApi.getConversations({
        page: 1,
        limit: 100,
      });

      const result = getResponseData(response);

      let items = [];

      if (Array.isArray(result)) {
        items = result;
      } else if (Array.isArray(result?.conversations)) {
        items = result.conversations;
      } else if (Array.isArray(result?.items)) {
        items = result.items;
      } else if (Array.isArray(result?.data)) {
        items = result.data;
      }

      setConversations(items);

      if (selectedConversation) {
        const selectedId = getConversationId(selectedConversation);

        const updatedSelected = items.find(
          (item) => getConversationId(item) === selectedId,
        );

        if (updatedSelected) {
          setSelectedConversation(updatedSelected);
        }
      }

      return items;
    } catch (err) {
      console.error("Inbox fetchConversations error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load conversations.",
      );

      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchConversations();
  }, []);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredConversations = useMemo(() => {
    let result = [...conversations];

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((conversation) => {
        const name = getCustomerName(conversation).toLowerCase();

        const phone = getCustomerPhone(conversation).toLowerCase();

        const text = getLastMessageText(conversation).toLowerCase();

        return (
          name.includes(query) || phone.includes(query) || text.includes(query)
        );
      });
    }

    if (channelFilter !== "all") {
      result = result.filter(
        (conversation) => getChannel(conversation) === channelFilter,
      );
    }

    if (statusFilter === "unread") {
      result = result.filter(
        (conversation) => getUnreadCount(conversation) > 0,
      );
    }

    if (statusFilter === "starred") {
      result = result.filter((conversation) => conversation?.starred === true);
    }

    if (statusFilter === "archived") {
      result = result.filter((conversation) => conversation?.archived === true);
    }

    if (statusFilter === "active") {
      result = result.filter((conversation) => conversation?.archived !== true);
    }

    return result;
  }, [conversations, search, channelFilter, statusFilter]);

  /* =====================================================
     SELECT CONVERSATION
  ===================================================== */

  const handleSelectConversation = async (conversation) => {
    if (!conversation) return;

    setSelectedConversation(conversation);

    setMobileView("chat");

    setShowConversationMenu(false);

    const conversationId = getConversationId(conversation);

    if (!conversationId) return;

    if (getUnreadCount(conversation) > 0) {
      try {
        await inboxApi.markAsRead(conversationId);

        setConversations((prev) =>
          prev.map((item) =>
            getConversationId(item) === conversationId
              ? {
                  ...item,
                  unreadCount: 0,
                }
              : item,
          ),
        );

        setSelectedConversation((prev) =>
          prev
            ? {
                ...prev,
                unreadCount: 0,
              }
            : prev,
        );
      } catch (err) {
        console.error("markAsRead error:", err);
      }
    }
  };

  /* =====================================================
     REFRESH
  ===================================================== */

  const handleRefresh = async () => {
    await fetchConversations({
      silent: true,
    });
  };

  /* =====================================================
     STAR
  ===================================================== */

  const handleToggleStar = async () => {
    if (!selectedConversation) return;

    const conversationId = getConversationId(selectedConversation);

    if (!conversationId) return;

    try {
      setActionLoading(true);

      await inboxApi.toggleStar(conversationId);

      const currentStarred = selectedConversation?.starred === true;

      const updated = {
        ...selectedConversation,
        starred: !currentStarred,
      };

      setSelectedConversation(updated);

      setConversations((prev) =>
        prev.map((item) =>
          getConversationId(item) === conversationId
            ? {
                ...item,
                starred: !currentStarred,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("toggleStar error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     ARCHIVE
  ===================================================== */

  const handleArchive = async () => {
    if (!selectedConversation) return;

    const conversationId = getConversationId(selectedConversation);

    if (!conversationId) return;

    try {
      setActionLoading(true);

      await inboxApi.archiveConversation(conversationId);

      const updated = {
        ...selectedConversation,
        archived: true,
      };

      setSelectedConversation(updated);

      setConversations((prev) =>
        prev.map((item) =>
          getConversationId(item) === conversationId
            ? {
                ...item,
                archived: true,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("archiveConversation error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     UNARCHIVE
  ===================================================== */

  const handleUnarchive = async () => {
    if (!selectedConversation) return;

    const conversationId = getConversationId(selectedConversation);

    if (!conversationId) return;

    try {
      setActionLoading(true);

      if (typeof inboxApi.unarchiveConversation === "function") {
        await inboxApi.unarchiveConversation(conversationId);
      } else {
        console.warn("inboxApi.unarchiveConversation is not available.");

        return;
      }

      const updated = {
        ...selectedConversation,
        archived: false,
      };

      setSelectedConversation(updated);

      setConversations((prev) =>
        prev.map((item) =>
          getConversationId(item) === conversationId
            ? {
                ...item,
                archived: false,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("unarchiveConversation error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     MOBILE BACK
  ===================================================== */

  const handleBackToList = () => {
    setMobileView("list");
  };

  /* =====================================================
     SELECTED DATA
  ===================================================== */

  const selectedCustomer = selectedConversation
    ? getCustomer(selectedConversation)
    : null;

  const selectedName = selectedConversation
    ? getCustomerName(selectedConversation)
    : "";

  const selectedPhone = selectedConversation
    ? getCustomerPhone(selectedConversation)
    : "";

  const selectedChannel = selectedConversation
    ? getChannel(selectedConversation)
    : "whatsapp";

  /* =====================================================
     TOTAL UNREAD
  ===================================================== */

  const totalUnread = useMemo(() => {
    return conversations.reduce(
      (total, conversation) => total + getUnreadCount(conversation),
      0,
    );
  }, [conversations]);

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-white">
      {/* =================================================
          LEFT SIDEBAR
      ================================================= */}

      <aside
        className={`flex w-full shrink-0 flex-col border-r border-gray-200 bg-white md:w-[340px] lg:w-[360px] ${
          mobileView !== "list" ? "hidden md:flex" : "flex"
        }`}
      >
        {/* SIDEBAR HEADER */}

        <div className="border-b border-gray-200">
          <div className="flex h-12 items-center justify-between px-4">
            <div>
              <h1 className="text-base font-semibold text-gray-900">Inbox</h1>

              <p className="text-[11px] text-gray-500">
                {conversations.length} conversations
                {totalUnread > 0 ? ` • ${totalUnread} unread` : ""}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                title="Refresh"
              >
                {refreshing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className={`flex h-8 w-8 items-center justify-center rounded-md ${
                  showFilters
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                title="Filters"
              >
                <Filter size={16} />
              </button>
            </div>
          </div>

          {/* SEARCH */}

          <div className="px-3 pb-3">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="h-9 w-full rounded-md border border-gray-200 bg-gray-50 pl-9 pr-9 text-xs text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* FILTERS */}

          {showFilters && (
            <div className="border-t border-gray-100 bg-gray-50 px-3 py-3">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none"
                >
                  <option value="all">All channels</option>

                  <option value="whatsapp">WhatsApp</option>

                  <option value="email">Email</option>

                  <option value="sms">SMS</option>

                  <option value="facebook">Facebook</option>

                  <option value="instagram">Instagram</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none"
                >
                  <option value="all">All</option>

                  <option value="active">Active</option>

                  <option value="unread">Unread</option>

                  <option value="starred">Starred</option>

                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* CONVERSATION LIST */}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                Loading conversations...
              </div>
            </div>
          ) : error ? (
            <div className="p-4">
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-xs font-medium text-red-700">{error}</p>

                <button
                  type="button"
                  onClick={() => fetchConversations()}
                  className="mt-2 text-xs font-semibold text-red-700 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <EmptyState
              title="No conversations"
              description={
                search
                  ? "No conversations match your search."
                  : "There are no conversations to display."
              }
            />
          ) : (
            filteredConversations.map((conversation) => {
              const id = getConversationId(conversation);

              return (
                <ConversationItem
                  key={id}
                  conversation={conversation}
                  selected={id === getConversationId(selectedConversation)}
                  onClick={handleSelectConversation}
                />
              );
            })
          )}
        </div>
      </aside>

      {/* =================================================
          CENTER CHAT
      ================================================= */}

      <main
        className={`min-w-0 flex-1 ${
          mobileView === "chat" ? "flex" : "hidden md:flex"
        }`}
      >
        {!selectedConversation ? (
          <div className="flex h-full flex-1">
            <EmptyState
              title="Select a conversation"
              description="Choose a conversation from the inbox to view the messages."
            />
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col">
            {/* =================================================
                CHAT HEADER
            ================================================= */}

            {/* =================================================
                CHAT CONTENT
            ================================================= */}

            <div className="min-h-0 flex-1 overflow-hidden">
              {selectedChannel === "whatsapp" ? (
                <WhatsAppActivity
                  lead={{
                    ...(selectedCustomer || {}),

                    _id:
                      selectedCustomer?._id ||
                      selectedConversation?.leadId ||
                      selectedConversation?.customer?.id ||
                      selectedConversation?.leadId,

                    id:
                      selectedCustomer?._id ||
                      selectedConversation?.leadId ||
                      selectedConversation?.customer?.id ||
                      selectedConversation?.leadId,

                    name: selectedName,

                    phone: selectedPhone,

                    conversationId: getConversationId(selectedConversation),
                  }}
                />
              ) : (
                <EmptyState
                  title={`${selectedChannel} conversation`}
                  description="This channel is not connected to the WhatsApp activity component."
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inbox;
