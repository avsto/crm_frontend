import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CheckCheck,
  ChevronDown,
  Filter,
  Inbox as InboxIcon,
  Loader2,
  Mail,
  MessageCircle,
  MoreHorizontal,
  RefreshCw,
  Search,
  Send,
  Star,
  X,
  Check,
  Circle,
} from "lucide-react";

import inboxApi from "../../api/inbox.api";
import WhatsAppActivity from "./../crm/activities/WhatsAppActivity";
import useNotifications from "../../hooks/useNotifications";

/* =========================================================
   HELPERS
========================================================= */

const getResponseData = (response) =>
  response?.data?.data ?? response?.data ?? null;

const getConversationId = (conversation) =>
  conversation?._id || conversation?.id || conversation?.conversationId || null;

const getCustomer = (conversation) =>
  conversation?.customer ||
  conversation?.participant ||
  conversation?.lead ||
  {};

const getCustomerName = (conversation) => {
  const customer = getCustomer(conversation);

  return (
    customer?.name ||
    customer?.profileName ||
    customer?.fullName ||
    customer?.firstName ||
    conversation?.customerName ||
    conversation?.participantName ||
    "Unknown Customer"
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
  const message = conversation?.lastMessage;

  if (!message) return "No messages yet";
  if (typeof message === "string") return message;
  if (message?.text) return message.text;

  const types = {
    image: "📷 Photo",
    video: "🎥 Video",
    audio: "🎵 Audio",
    document: "📄 Document",
    sticker: "😊 Sticker",
    location: "📍 Location",
    contacts: "👤 Contact",
    template: "Template message",
    interactive: "Interactive message",
    reaction: "Reaction",
  };

  return types[message?.messageType] || "Message";
};

const getLastMessageTime = (conversation) =>
  conversation?.lastMessageAt ||
  conversation?.lastMessage?.createdAt ||
  conversation?.updatedAt ||
  null;

const getUnreadCount = (conversation) => Number(conversation?.unreadCount || 0);

const getChannel = (conversation) =>
  String(
    conversation?.channel ||
      conversation?.provider ||
      conversation?.lastMessage?.channel ||
      "whatsapp",
  ).toLowerCase();

const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "U";

  return words.length > 1
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : words[0].slice(0, 2).toUpperCase();
};

const formatConversationTime = (date) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  const now = new Date();

  const isToday = parsed.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (isToday) {
    return parsed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (parsed.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return parsed.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
};

/* =========================================================
   THEME ICON
========================================================= */

const ChannelIcon = ({ channel }) => {
  const value = String(channel || "").toLowerCase();

  const config = {
    whatsapp: {
      label: "WA",
      className: "inbox-channel-whatsapp",
    },
    facebook: {
      label: "f",
      className: "inbox-channel-facebook",
    },
    instagram: {
      label: "IG",
      className: "inbox-channel-instagram",
    },
    email: {
      label: <Mail size={11} />,
      className: "inbox-channel-email",
    },
    sms: {
      label: <MessageCircle size={11} />,
      className: "inbox-channel-sms",
    },
  };

  const item = config[value] || config.whatsapp;

  return (
    <span className={`inbox-channel-icon ${item.className}`}>{item.label}</span>
  );
};

/* =========================================================
   AVATAR
========================================================= */

const Avatar = ({ conversation, size = "normal" }) => {
  const name = getCustomerName(conversation);

  const sizeClass =
    size === "large" ? "inbox-avatar-large" : "inbox-avatar-normal";

  return (
    <div className={`inbox-avatar ${sizeClass}`}>
      {getInitials(name)}
      <span className="inbox-avatar-status" />
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({ icon: Icon = MessageCircle, title, description }) => (
  <div className="inbox-empty-state">
    <div className="inbox-empty-icon">
      <Icon size={26} strokeWidth={1.6} />
    </div>

    <h3>{title}</h3>

    {description && <p>{description}</p>}
  </div>
);

/* =========================================================
   CONVERSATION ITEM
========================================================= */

const ConversationItem = ({ conversation, selected, onClick }) => {
  const name = getCustomerName(conversation);
  const message = getLastMessageText(conversation);
  const time = getLastMessageTime(conversation);
  const unread = getUnreadCount(conversation);
  const channel = getChannel(conversation);

  const isOutbound = conversation?.lastMessage?.direction === "outbound";

  return (
    <button
      type="button"
      onClick={() => onClick(conversation)}
      className={`inbox-conversation ${selected ? "is-selected" : ""}`}
    >
      <Avatar conversation={conversation} />

      <div className="inbox-conversation-content">
        <div className="inbox-conversation-top">
          <div className="inbox-name-group">
            <span className="inbox-customer-name">{name}</span>

            <ChannelIcon channel={channel} />

            {conversation?.starred && (
              <Star
                size={12}
                className="inbox-star-active"
                fill="currentColor"
              />
            )}
          </div>

          <span className="inbox-time">{formatConversationTime(time)}</span>
        </div>

        <div className="inbox-conversation-bottom">
          <p className="inbox-last-message">
            {isOutbound && (
              <CheckCheck size={13} className="inbox-message-tick" />
            )}

            {message}
          </p>

          {unread > 0 && (
            <span className="inbox-unread-badge">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>

        {getCustomerPhone(conversation) && (
          <p className="inbox-customer-phone">
            {getCustomerPhone(conversation)}
          </p>
        )}
      </div>
    </button>
  );
};

/* =========================================================
   MAIN INBOX
========================================================= */

export default function Inbox() {
  const [conversations, setConversations] = useState([]);

  const [selectedConversation, setSelectedConversation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [mobileView, setMobileView] = useState("list");

  const { notifications = [], dismissNotification } = useNotifications();

  /* =====================================================
     FETCH CONVERSATIONS
  ===================================================== */

  const fetchConversations = useCallback(async ({ silent = false } = {}) => {
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

      setSelectedConversation((previous) => {
        if (!previous) return previous;

        const selectedId = getConversationId(previous);

        return (
          items.find((item) => getConversationId(item) === selectedId) ||
          previous
        );
      });

      return items;
    } catch (err) {
      console.error("Inbox fetch error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load conversations.",
      );

      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  /* =====================================================
     NOTIFICATION REFRESH
  ===================================================== */

  useEffect(() => {
    if (!notifications.length) return;

    const timers = notifications.map((item) =>
      setTimeout(async () => {
        await fetchConversations({ silent: true });
        dismissNotification?.(item._id);
      }, 5000),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications, dismissNotification, fetchConversations]);

  /* =====================================================
     FILTER CONVERSATIONS
  ===================================================== */

  const filteredConversations = useMemo(() => {
    let result = [...conversations];

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((conversation) => {
        const name = getCustomerName(conversation).toLowerCase();
        const phone = getCustomerPhone(conversation).toLowerCase();
        const message = getLastMessageText(conversation).toLowerCase();

        return (
          name.includes(query) ||
          phone.includes(query) ||
          message.includes(query)
        );
      });
    }

    if (channelFilter !== "all") {
      result = result.filter((item) => getChannel(item) === channelFilter);
    }

    if (statusFilter === "unread") {
      result = result.filter((item) => getUnreadCount(item) > 0);
    }

    if (statusFilter === "starred") {
      result = result.filter((item) => item?.starred === true);
    }

    if (statusFilter === "archived") {
      result = result.filter((item) => item?.archived === true);
    }

    if (statusFilter === "active") {
      result = result.filter((item) => item?.archived !== true);
    }

    return result.sort((a, b) => {
      const first = new Date(
        getLastMessageTime(a) || a.createdAt || 0,
      ).getTime();

      const second = new Date(
        getLastMessageTime(b) || b.createdAt || 0,
      ).getTime();

      return second - first;
    });
  }, [conversations, search, channelFilter, statusFilter]);

  /* =====================================================
     SELECT CONVERSATION
  ===================================================== */

  const handleSelectConversation = async (conversation) => {
    if (!conversation) return;

    setSelectedConversation(conversation);
    setMobileView("chat");
    setShowMenu(false);

    const conversationId = getConversationId(conversation);

    if (!conversationId) return;

    if (getUnreadCount(conversation) > 0) {
      try {
        await inboxApi.markAsRead(conversationId);

        setConversations((previous) =>
          previous.map((item) =>
            getConversationId(item) === conversationId
              ? { ...item, unreadCount: 0 }
              : item,
          ),
        );

        setSelectedConversation((previous) =>
          previous && getConversationId(previous) === conversationId
            ? { ...previous, unreadCount: 0 }
            : previous,
        );
      } catch (err) {
        console.error("markAsRead error:", err);
      }
    }
  };

  /* =====================================================
     UPDATE CONVERSATION LOCALLY
  ===================================================== */

  const updateConversation = (conversationId, updates) => {
    setConversations((previous) =>
      previous.map((item) =>
        getConversationId(item) === conversationId
          ? { ...item, ...updates }
          : item,
      ),
    );

    setSelectedConversation((previous) =>
      previous && getConversationId(previous) === conversationId
        ? { ...previous, ...updates }
        : previous,
    );
  };

  /* =====================================================
     TOGGLE STAR
  ===================================================== */

  const handleToggleStar = async () => {
    if (!selectedConversation || actionLoading) return;

    const conversationId = getConversationId(selectedConversation);

    if (!conversationId) return;

    try {
      setActionLoading(true);

      await inboxApi.toggleStar(conversationId);

      updateConversation(conversationId, {
        starred: !selectedConversation.starred,
      });
    } catch (err) {
      console.error("toggleStar error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     ARCHIVE / UNARCHIVE
  ===================================================== */

  const handleArchive = async () => {
    if (!selectedConversation || actionLoading) return;

    const conversationId = getConversationId(selectedConversation);

    try {
      setActionLoading(true);

      if (selectedConversation.archived) {
        if (typeof inboxApi.unarchiveConversation !== "function") {
          console.warn("inboxApi.unarchiveConversation is not available.");
          return;
        }

        await inboxApi.unarchiveConversation(conversationId);

        updateConversation(conversationId, {
          archived: false,
        });
      } else {
        await inboxApi.archiveConversation(conversationId);

        updateConversation(conversationId, {
          archived: true,
        });
      }

      setShowMenu(false);
    } catch (err) {
      console.error("archive conversation error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     BACK TO LIST
  ===================================================== */

  const handleBack = () => {
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

  const selectedId = getConversationId(selectedConversation);

  /* =====================================================
     COUNTS
  ===================================================== */

  const totalUnread = conversations.reduce(
    (total, item) => total + getUnreadCount(item),
    0,
  );

  const activeCount = conversations.filter(
    (item) => item.archived !== true,
  ).length;

  const unreadCount = conversations.filter(
    (item) => getUnreadCount(item) > 0,
  ).length;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="inbox-page">
      {/* =================================================
          LEFT SIDEBAR
      ================================================= */}

      <aside
        className={`inbox-sidebar ${
          mobileView === "chat" ? "inbox-mobile-hidden" : ""
        }`}
      >
        {/* HEADER */}

        <div className="inbox-sidebar-header">
          <div className="inbox-heading-row">
            <div>
              <div className="inbox-title-row">
                <h1>Inbox</h1>

                <span className="inbox-total-badge">
                  {conversations.length}
                </span>
              </div>

              <p>Manage all your customer conversations</p>
            </div>

            <button
              type="button"
              onClick={() => fetchConversations({ silent: true })}
              disabled={refreshing}
              className="inbox-icon-button"
              title="Refresh conversations"
            >
              <RefreshCw size={17} className={refreshing ? "inbox-spin" : ""} />
            </button>
          </div>

          {/* SEARCH */}

          <div className="inbox-search">
            <Search size={16} />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone or message..."
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* FILTER TOOLBAR */}

          <div className="inbox-filter-toolbar">
            <div className="inbox-filter-label">
              <span>Conversations</span>

              <span>{filteredConversations.length}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className={`inbox-filter-button ${
                showFilters ? "is-active" : ""
              }`}
            >
              <Filter size={14} />
              Filter
              <ChevronDown
                size={13}
                className={showFilters ? "inbox-chevron-open" : ""}
              />
            </button>
          </div>

          {/* FILTER PANEL */}

          {showFilters && (
            <div className="inbox-filter-panel">
              <div>
                <label>Channel</label>

                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                >
                  <option value="all">All channels</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              <div>
                <label>Status</label>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All conversations</option>
                  <option value="active">Active</option>
                  <option value="unread">Unread</option>
                  <option value="starred">Starred</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setChannelFilter("all");
                  setStatusFilter("all");
                  setSearch("");
                }}
                className="inbox-clear-filters"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* QUICK COUNTS */}

        <div className="inbox-quick-stats">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={statusFilter === "all" ? "is-active" : ""}
          >
            <InboxIcon size={14} />
            All
            <span>{conversations.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("unread")}
            className={statusFilter === "unread" ? "is-active" : ""}
          >
            <Circle size={12} />
            Unread
            <span>{unreadCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={statusFilter === "active" ? "is-active" : ""}
          >
            <MessageCircle size={13} />
            Active
            <span>{activeCount}</span>
          </button>
        </div>

        {/* CONVERSATION LIST */}

        <div className="inbox-conversation-list">
          {loading ? (
            <div className="inbox-loading">
              <Loader2 size={22} className="inbox-spin" />
              <span>Loading conversations...</span>
            </div>
          ) : error ? (
            <div className="inbox-error">
              <p>{error}</p>

              <button type="button" onClick={() => fetchConversations()}>
                Try again
              </button>
            </div>
          ) : filteredConversations.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="No conversations found"
              description={
                search
                  ? "Try another name, phone number or keyword."
                  : "New customer conversations will appear here."
              }
            />
          ) : (
            filteredConversations.map((conversation) => {
              const id = getConversationId(conversation);

              return (
                <ConversationItem
                  key={id}
                  conversation={conversation}
                  selected={id === selectedId}
                  onClick={handleSelectConversation}
                />
              );
            })
          )}
        </div>

        {/* SIDEBAR FOOTER */}

        <div className="inbox-sidebar-footer">
          <div className="inbox-footer-status">
            <span className="inbox-online-dot" />
            <span>Inbox connected</span>
          </div>

          <span>{totalUnread} unread messages</span>
        </div>
      </aside>

      {/* =================================================
          CHAT AREA
      ================================================= */}

      <main
        className={`inbox-chat-area ${
          mobileView === "list" ? "inbox-mobile-hidden" : ""
        }`}
      >
        {!selectedConversation ? (
          <div className="inbox-welcome">
            <div className="inbox-welcome-icon">
              <MessageCircle size={34} strokeWidth={1.5} />
            </div>

            <h2>Your conversations, all in one place</h2>

            <p>
              Select a conversation from the sidebar to view messages and
              respond to your customers.
            </p>

            <div className="inbox-welcome-stats">
              <div>
                <span>Total conversations</span>
                <strong>{conversations.length}</strong>
              </div>

              <div>
                <span>Unread messages</span>
                <strong>{totalUnread}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="inbox-chat-container">
            {/* CHAT HEADER */}

            <div className="inbox-chat-header">
              <div className="inbox-chat-user">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inbox-back-button"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={19} />
                </button>

                <Avatar conversation={selectedConversation} size="large" />

                <div className="inbox-chat-user-info">
                  <div className="inbox-chat-name">
                    <h2>{selectedName}</h2>

                    <ChannelIcon channel={selectedChannel} />
                  </div>

                  <p>{selectedPhone || "No phone number available"}</p>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="inbox-chat-actions">
                <button
                  type="button"
                  onClick={handleToggleStar}
                  disabled={actionLoading}
                  className={`inbox-action-button ${
                    selectedConversation.starred ? "is-starred" : ""
                  }`}
                  title={
                    selectedConversation.starred ? "Remove star" : "Add star"
                  }
                >
                  <Star
                    size={17}
                    fill={
                      selectedConversation.starred ? "currentColor" : "none"
                    }
                  />
                </button>

                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={actionLoading}
                  className="inbox-action-button"
                  title={
                    selectedConversation.archived ? "Unarchive" : "Archive"
                  }
                >
                  {actionLoading ? (
                    <Loader2 size={17} className="inbox-spin" />
                  ) : selectedConversation.archived ? (
                    <ArchiveRestore size={17} />
                  ) : (
                    <Archive size={17} />
                  )}
                </button>

                <div className="inbox-menu-wrapper">
                  <button
                    type="button"
                    onClick={() => setShowMenu((value) => !value)}
                    className="inbox-action-button"
                    title="More options"
                  >
                    <MoreHorizontal size={19} />
                  </button>

                  {showMenu && (
                    <div className="inbox-dropdown">
                      <button
                        type="button"
                        onClick={handleArchive}
                        disabled={actionLoading}
                      >
                        {selectedConversation.archived ? (
                          <ArchiveRestore size={15} />
                        ) : (
                          <Archive size={15} />
                        )}

                        {selectedConversation.archived
                          ? "Unarchive conversation"
                          : "Archive conversation"}
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleStar}
                        disabled={actionLoading}
                      >
                        <Star size={15} />

                        {selectedConversation.starred
                          ? "Remove star"
                          : "Mark as starred"}
                      </button>

                      <button type="button" onClick={() => setShowMenu(false)}>
                        <X size={15} />
                        Close menu
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ARCHIVED NOTICE */}

            {selectedConversation.archived && (
              <div className="inbox-archived-notice">
                <Archive size={15} />
                This conversation is archived.
                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={actionLoading}
                >
                  Restore
                </button>
              </div>
            )}

            {/* CHAT BODY */}

            <div className="inbox-chat-content">
              {selectedChannel === "whatsapp" ? (
                <WhatsAppActivity
                  lead={{
                    ...(selectedCustomer || {}),

                    _id:
                      selectedCustomer?._id ||
                      selectedConversation?.leadId ||
                      selectedCustomer?.id ||
                      null,

                    id:
                      selectedCustomer?._id ||
                      selectedConversation?.leadId ||
                      selectedCustomer?.id ||
                      null,

                    name: selectedName,
                    phone: selectedPhone,

                    conversationId: selectedId,

                    channel: selectedChannel,
                  }}
                />
              ) : (
                <EmptyState
                  icon={MessageCircle}
                  title={`${selectedChannel} conversation`}
                  description="This channel is not connected to the WhatsApp activity component yet."
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* =================================================
          THEME STYLES
      ================================================= */}

      <style>{`

        .inbox-page {
          width: 100%;
          height: 100%;
          min-height: 0;
          display: flex;
          overflow: hidden;
          background: var(--app-bg);
          color: var(--app-heading);
          font-family: inherit;
          border: 1px solid var(--app-border);
          border-radius: 12px;
        }

        .inbox-page * {
          box-sizing: border-box;
        }

        /* SIDEBAR */

        .inbox-sidebar {
          width: 355px;
          min-width: 315px;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          min-height: 0;
          background: var(--app-surface);
          border-right: 1px solid var(--app-border);
        }

        .inbox-sidebar-header {
          padding: 20px 16px 14px;
          border-bottom: 1px solid var(--app-border);
        }

        .inbox-heading-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .inbox-title-row {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .inbox-title-row h1 {
          color: var(--app-heading);
          font-size: 20px;
          line-height: 1.3;
          font-weight: 750;
          letter-spacing: -.5px;
        }

        .inbox-title-row > span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 23px;
          height: 21px;
          padding: 0 6px;
          border-radius: 6px;
          background: var(--theme-primary-soft);
          color: var(--theme-primary);
          font-size: 10px;
          font-weight: 750;
        }

        .inbox-heading-row p {
          margin-top: 4px;
          color: var(--app-muted);
          font-size: 11px;
        }

        .inbox-icon-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          border: 1px solid var(--app-border);
          border-radius: 9px;
          background: var(--app-surface);
          color: var(--app-muted);
          transition: .2s;
        }

        .inbox-icon-button:hover {
          color: var(--theme-primary);
          background: var(--theme-primary-soft);
          border-color: var(--theme-primary-border);
        }

        /* SEARCH */

        .inbox-search {
          display: flex;
          align-items: center;
          gap: 9px;
          height: 40px;
          padding: 0 11px;
          border: 1px solid var(--app-border);
          border-radius: 9px;
          background: var(--app-subtle);
          color: var(--app-muted);
          transition: .2s;
        }

        .inbox-search:focus-within {
          background: var(--app-surface);
          border-color: var(--theme-primary);
          box-shadow: 0 0 0 3px var(--theme-primary-soft);
        }

        .inbox-search input {
          flex: 1;
          min-width: 0;
          height: 100%;
          outline: none;
          border: 0;
          background: transparent;
          color: var(--app-heading);
          font-size: 11px;
        }

        .inbox-search input::placeholder {
          color: var(--app-muted);
        }

        .inbox-search button {
          display: flex;
          align-items: center;
          color: var(--app-muted);
        }

        /* FILTER */

        .inbox-filter-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 17px;
        }

        .inbox-filter-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 700;
          color: var(--app-heading);
        }

        .inbox-filter-label span:last-child {
          color: var(--app-muted);
          font-weight: 500;
        }

        .inbox-filter-button {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 30px;
          padding: 0 9px;
          border: 1px solid var(--app-border);
          border-radius: 7px;
          background: var(--app-surface);
          color: var(--app-body);
          font-size: 10px;
          font-weight: 650;
          transition: .2s;
        }

        .inbox-filter-button:hover,
        .inbox-filter-button.is-active {
          color: var(--theme-primary);
          background: var(--theme-primary-soft);
          border-color: var(--theme-primary-border);
        }

        .inbox-chevron-open {
          transform: rotate(180deg);
        }

        .inbox-filter-panel {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 13px;
          padding: 12px;
          border: 1px solid var(--app-border);
          border-radius: 9px;
          background: var(--app-subtle);
        }

        .inbox-filter-panel label {
          display: block;
          margin-bottom: 6px;
          color: var(--app-muted);
          font-size: 10px;
          font-weight: 650;
        }

        .inbox-filter-panel select {
          width: 100%;
          height: 33px;
          padding: 0 7px;
          outline: none;
          border: 1px solid var(--app-border);
          border-radius: 6px;
          background: var(--app-surface);
          color: var(--app-heading);
          font-size: 10px;
        }

        .inbox-filter-panel select:focus {
          border-color: var(--theme-primary);
        }

        .inbox-clear-filters {
          grid-column: 1 / -1;
          justify-self: start;
          color: var(--theme-primary);
          font-size: 10px;
          font-weight: 700;
        }

        /* QUICK STATS */

        .inbox-quick-stats {
          display: flex;
          gap: 5px;
          padding: 11px 12px;
          border-bottom: 1px solid var(--app-border);
          background: var(--app-surface);
        }

        .inbox-quick-stats button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          min-width: 0;
          flex: 1;
          height: 30px;
          padding: 0 5px;
          border-radius: 7px;
          color: var(--app-muted);
          font-size: 9px;
          font-weight: 650;
          transition: .2s;
        }

        .inbox-quick-stats button span {
          color: var(--app-heading);
          font-size: 9px;
          font-weight: 750;
        }

        .inbox-quick-stats button:hover,
        .inbox-quick-stats button.is-active {
          color: var(--theme-primary);
          background: var(--theme-primary-soft);
        }

        .inbox-quick-stats button.is-active span {
          color: var(--theme-primary);
        }

        /* CONVERSATION LIST */

        .inbox-conversation-list {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          background: var(--app-surface);
        }

        .inbox-conversation-list::-webkit-scrollbar,
        .inbox-chat-content::-webkit-scrollbar {
          width: 5px;
        }

        .inbox-conversation-list::-webkit-scrollbar-thumb,
        .inbox-chat-content::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background: var(--app-border);
        }

        .inbox-conversation {
          position: relative;
          display: flex;
          width: 100%;
          gap: 11px;
          padding: 14px 13px;
          text-align: left;
          border-bottom: 1px solid var(--app-border);
          background: var(--app-surface);
          transition: background .2s;
        }

        .inbox-conversation:hover {
          background: var(--app-hover);
        }

        .inbox-conversation.is-selected {
          background: var(--theme-primary-soft);
        }

        .inbox-conversation.is-selected::before {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 3px;
          content: "";
          border-radius: 0 4px 4px 0;
          background: var(--theme-primary);
        }

        /* AVATAR */

        .inbox-avatar {
          position: relative;
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--theme-primary-soft);
          color: var(--theme-primary);
          font-weight: 750;
          letter-spacing: -.4px;
        }

        .inbox-avatar-normal {
          width: 43px;
          height: 43px;
          font-size: 13px;
        }

        .inbox-avatar-large {
          width: 43px;
          height: 43px;
          font-size: 13px;
        }

        .inbox-avatar-status {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 10px;
          height: 10px;
          border: 2px solid var(--app-surface);
          border-radius: 50%;
          background: #16a34a;
        }

        /* CONVERSATION TEXT */

        .inbox-conversation-content {
          flex: 1;
          min-width: 0;
        }

        .inbox-conversation-top,
        .inbox-conversation-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 7px;
        }

        .inbox-name-group {
          display: flex;
          align-items: center;
          min-width: 0;
          gap: 6px;
        }

        .inbox-customer-name {
          overflow: hidden;
          color: var(--app-heading);
          font-size: 11px;
          font-weight: 750;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .inbox-time {
          flex-shrink: 0;
          color: var(--app-muted);
          font-size: 9px;
        }

        .inbox-channel-icon {
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          font-size: 9px;
          font-weight: 800;
        }

        .inbox-channel-whatsapp {
          background: #dcfce7;
          color: #15803d;
        }

        .inbox-channel-facebook {
          background: #dbeafe;
          color: #2563eb;
        }

        .inbox-channel-instagram {
          background: #fce7f3;
          color: #db2777;
        }

        .inbox-channel-email {
          background: #e0e7ff;
          color: #4f46e5;
        }

        .inbox-channel-sms {
          background: #f3e8ff;
          color: #9333ea;
        }

        .inbox-star-active {
          flex-shrink: 0;
          color: #eab308;
        }

        .inbox-conversation-bottom {
          margin-top: 7px;
        }

        .inbox-last-message {
          display: flex;
          align-items: center;
          gap: 4px;
          min-width: 0;
          overflow: hidden;
          color: var(--app-muted);
          font-size: 10px;
          line-height: 1.5;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .inbox-message-tick {
          flex-shrink: 0;
          color: var(--theme-primary);
        }

        .inbox-unread-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 20px;
          background: var(--theme-primary);
          color: white;
          font-size: 9px;
          font-weight: 750;
        }

        .inbox-customer-phone {
          margin-top: 4px;
          overflow: hidden;
          color: var(--app-muted);
          font-size: 9px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .inbox-sidebar-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 12px 14px;
          border-top: 1px solid var(--app-border);
          background: var(--app-surface);
          color: var(--app-muted);
          font-size: 9px;
        }

        .inbox-footer-status {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .inbox-online-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #16a34a;
        }

        /* CHAT AREA */

        .inbox-chat-area {
          position: relative;
          display: flex;
          flex: 1;
          min-width: 0;
          min-height: 0;
          flex-direction: column;
          background: var(--app-bg);
        }

        .inbox-chat-container {
          display: flex;
          flex: 1;
          min-width: 0;
          min-height: 0;
          flex-direction: column;
        }

        /* CHAT HEADER */

        .inbox-chat-header {
          position: relative;
          z-index: 10;
          display: flex;
          min-height: 76px;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 20px;
          border-bottom: 1px solid var(--app-border);
          background: var(--app-surface);
        }

        .inbox-chat-user {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 12px;
        }

        .inbox-chat-user-info {
          min-width: 0;
        }

        .inbox-chat-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .inbox-chat-name h2 {
          overflow: hidden;
          color: var(--app-heading);
          font-size: 13px;
          font-weight: 750;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .inbox-chat-user-info > p {
          margin-top: 4px;
          color: var(--app-muted);
          font-size: 10px;
        }

        .inbox-chat-actions {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 6px;
        }

        .inbox-action-button,
        .inbox-back-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          border: 1px solid transparent;
          border-radius: 8px;
          color: var(--app-muted);
          transition: .2s;
        }

        .inbox-action-button:hover,
        .inbox-back-button:hover {
          border-color: var(--app-border);
          background: var(--app-hover);
          color: var(--theme-primary);
        }

        .inbox-action-button.is-starred {
          color: #eab308;
          background: rgba(234, 179, 8, .10);
        }

        .inbox-back-button {
          display: none;
        }

        /* MENU */

        .inbox-menu-wrapper {
          position: relative;
        }

        .inbox-dropdown {
          position: absolute;
          top: 42px;
          right: 0;
          z-index: 30;
          width: 210px;
          padding: 5px;
          border: 1px solid var(--app-border);
          border-radius: 10px;
          background: var(--app-surface);
          box-shadow: 0 10px 30px rgba(15, 23, 42, .12);
        }

        .inbox-dropdown button {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 9px;
          padding: 10px;
          border-radius: 7px;
          color: var(--app-body);
          text-align: left;
          font-size: 10px;
          transition: .2s;
        }

        .inbox-dropdown button:hover {
          background: var(--app-hover);
          color: var(--theme-primary);
        }

        .inbox-dropdown button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        /* ARCHIVED */

        .inbox-archived-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px 12px;
          border-bottom: 1px solid var(--app-border);
          background: var(--app-subtle);
          color: var(--app-muted);
          font-size: 10px;
        }

        .inbox-archived-notice button {
          color: var(--theme-primary);
          font-weight: 750;
        }

        /* CHAT BODY */

        .inbox-chat-content {
          display: flex;
          flex: 1;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          background: var(--app-bg);
        }

        .inbox-chat-content > * {
          width: 100%;
          min-width: 0;
        }

        /* WELCOME */

        .inbox-welcome {
          display: flex;
          flex: 1;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 25px;
          text-align: center;
        }

        .inbox-welcome-icon {
          display: flex;
          width: 76px;
          height: 76px;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--theme-primary-border);
          border-radius: 23px;
          background: var(--theme-primary-soft);
          color: var(--theme-primary);
        }

        .inbox-welcome h2 {
          margin-top: 20px;
          color: var(--app-heading);
          font-size: 18px;
          font-weight: 750;
        }

        .inbox-welcome > p {
          max-width: 390px;
          margin-top: 9px;
          color: var(--app-muted);
          font-size: 12px;
          line-height: 1.8;
        }

        .inbox-welcome-stats {
          display: flex;
          gap: 12px;
          margin-top: 28px;
        }

        .inbox-welcome-stats > div {
          min-width: 140px;
          padding: 14px;
          border: 1px solid var(--app-border);
          border-radius: 10px;
          background: var(--app-surface);
        }

        .inbox-welcome-stats span,
        .inbox-welcome-stats strong {
          display: block;
        }

        .inbox-welcome-stats span {
          color: var(--app-muted);
          font-size: 10px;
        }

        .inbox-welcome-stats strong {
          margin-top: 5px;
          color: var(--app-heading);
          font-size: 20px;
        }

        /* EMPTY / LOADING / ERROR */

        .inbox-empty-state,
        .inbox-loading {
          display: flex;
          min-height: 230px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
        }

        .inbox-empty-icon {
          display: flex;
          width: 55px;
          height: 55px;
          align-items: center;
          justify-content: center;
          border-radius: 17px;
          background: var(--app-subtle);
          color: var(--app-muted);
        }

        .inbox-empty-state h3 {
          margin-top: 13px;
          color: var(--app-heading);
          font-size: 12px;
          font-weight: 750;
        }

        .inbox-empty-state p {
          max-width: 220px;
          margin-top: 6px;
          color: var(--app-muted);
          font-size: 10px;
          line-height: 1.7;
        }

        .inbox-loading {
          min-height: 200px;
          gap: 10px;
          color: var(--app-muted);
          font-size: 11px;
        }

        .inbox-error {
          padding: 20px;
          color: #dc2626;
          font-size: 11px;
          text-align: center;
        }

        .inbox-error button {
          margin-top: 10px;
          color: var(--theme-primary);
          font-weight: 750;
        }

        .inbox-spin {
          animation: inbox-spin 1s linear infinite;
        }

        @keyframes inbox-spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* RESPONSIVE */

        @media (max-width: 767px) {
          .inbox-page {
            position: relative;
            height: 100%;
            min-height: 0;
            border-radius: 0;
            border-left: 0;
            border-right: 0;
          }

          .inbox-sidebar {
            width: 100%;
            min-width: 0;
          }

          .inbox-mobile-hidden {
            display: none !important;
          }

          .inbox-chat-area {
            width: 100%;
          }

          .inbox-chat-header {
            min-height: 68px;
            padding: 10px 12px;
          }

          .inbox-back-button {
            display: flex;
            width: 30px;
            height: 34px;
          }

          .inbox-chat-user {
            gap: 8px;
          }

          .inbox-chat-actions {
            gap: 1px;
          }

          .inbox-action-button {
            width: 32px;
            height: 34px;
          }

          .inbox-welcome h2 {
            font-size: 16px;
          }
        }

        @media (max-width: 380px) {
          .inbox-sidebar-header {
            padding: 15px 11px 12px;
          }

          .inbox-conversation {
            padding: 12px 10px;
          }

          .inbox-customer-name {
            font-size: 10px;
          }

          .inbox-chat-name h2 {
            max-width: 130px;
          }

          .inbox-chat-header {
            gap: 5px;
            padding: 8px;
          }
        }

      `}</style>
    </div>
  );
}
