import React, { useEffect, useMemo, useState } from "react";

import {
  MessageCircle,
  Send,
  Loader2,
  AlertCircle,
  User,
  Check,
  CheckCheck,
  ChevronDown,
  FileText,
  RefreshCw,
  Paperclip,
  X,
  Image as ImageIcon,
  Video,
  Mic,
  Download,
  ExternalLink,
  MapPin,
  Contact,
  Reply,
  Phone,
  Search,
  MoreVertical,
  Trash2,
  Eraser,
  Info,
  Plus,
  Camera,
  Headphones,
  CalendarDays,
  Zap,
  Store,
  Sticker,
  ListFilter,
  UserRound,
  Images,
} from "lucide-react";

import inboxApi from "../../../api/inbox.api";
import marketingTemplateApi from "../../../api/marketingTemplate.api";
import MediaManager from "../../../components/media/MediaManager";

/* =========================================================
   HELPERS
========================================================= */

const getMessageDate = (message) => {
  return message?.createdAt || message?.whatsappTimestamp || null;
};

const formatMessageTime = (date) => {
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

const formatMessageDate = (date) => {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;

  const first = new Date(date1);
  const second = new Date(date2);

  if (Number.isNaN(first.getTime()) || Number.isNaN(second.getTime())) {
    return false;
  }

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

/* =========================================================
   ATTACHMENT URL
========================================================= */

const getAttachmentUrl = (attachment) => {
  return attachment?.url || attachment?.mediaUrl || attachment?.sourceUrl || "";
};

/* =========================================================
   ATTACHMENT TYPE
========================================================= */

const getAttachmentType = (attachment) => {
  return attachment?.type || "document";
};

/* =========================================================
   MESSAGE STATUS
========================================================= */

const MessageStatus = ({ message }) => {
  if (message?.direction !== "outbound") {
    return null;
  }

  switch (message?.status) {
    case "read":
      return <CheckCheck size={14} className="text-blue-500" />;

    case "delivered":
      return <CheckCheck size={14} className="text-slate-400" />;

    case "sent":
      return <Check size={14} className="text-slate-400" />;

    case "failed":
      return <span className="text-[9px] text-red-500">Failed</span>;

    default:
      return <Check size={14} className="text-slate-400" />;
  }
};

/* =========================================================
   IMAGE
========================================================= */

const ImageAttachment = ({ attachment }) => {
  const url = getAttachmentUrl(attachment);

  if (!url) {
    return (
      <div className="flex min-w-[220px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
          <ImageIcon size={19} className="text-slate-400" />
        </div>

        <div>
          <div className="text-xs font-medium text-slate-700">Image</div>

          <div className="mt-1 text-[9px] text-slate-400">
            Media ID: {attachment?.externalId || "-"}
          </div>

          <div className="mt-1 text-[9px] text-orange-500">
            Image URL not available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <img
        src={url}
        alt={attachment?.name || "WhatsApp image"}
        className="block max-h-[320px] max-w-[340px] object-contain"
      />

      <div className="flex items-center justify-between border-t border-slate-100 px-2.5 py-2">
        <span className="truncate text-[10px] text-slate-500">
          {attachment?.name || "Image"}
        </span>

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-slate-400 hover:text-slate-700"
        >
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
};

/* =========================================================
   VIDEO
========================================================= */

const VideoAttachment = ({ attachment }) => {
  const url = getAttachmentUrl(attachment);

  if (!url) {
    return (
      <div className="flex min-w-[220px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <Video size={20} className="text-slate-400" />

        <div>
          <div className="text-xs font-medium text-slate-700">Video</div>

          <div className="text-[9px] text-orange-500">
            Video URL not available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-black">
      <video
        src={url}
        controls
        preload="metadata"
        className="max-h-[320px] max-w-[340px]"
      />
    </div>
  );
};

/* =========================================================
   AUDIO
========================================================= */

const AudioAttachment = ({ attachment }) => {
  const url = getAttachmentUrl(attachment);

  if (!url) {
    return (
      <div className="flex min-w-[220px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <Mic size={19} className="text-slate-400" />

        <div>
          <div className="text-xs font-medium text-slate-700">Audio</div>

          <div className="text-[9px] text-orange-500">
            Audio URL not available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2">
      <audio src={url} controls className="w-[280px] max-w-full" />
    </div>
  );
};

/* =========================================================
   DOCUMENT
========================================================= */

const DocumentAttachment = ({ attachment }) => {
  const url = getAttachmentUrl(attachment);

  return (
    <div className="flex min-w-[230px] max-w-[320px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
        <FileText size={19} className="text-slate-500" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-slate-700">
          {attachment?.name || attachment?.filename || "Document"}
        </div>

        {attachment?.mimeType && (
          <div className="mt-1 truncate text-[9px] text-slate-400">
            {attachment.mimeType}
          </div>
        )}
      </div>

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          download
          className="text-slate-400 hover:text-slate-700"
        >
          <Download size={15} />
        </a>
      )}
    </div>
  );
};

/* =========================================================
   STICKER
========================================================= */

const StickerAttachment = ({ attachment }) => {
  const url = getAttachmentUrl(attachment);

  if (url) {
    return (
      <img
        src={url}
        alt="Sticker"
        className="max-h-[220px] max-w-[220px] object-contain"
      />
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <ImageIcon size={18} className="text-slate-400" />

      <span className="text-xs">Sticker</span>
    </div>
  );
};

/* =========================================================
   ATTACHMENT RENDER
========================================================= */

const RenderAttachment = ({ attachment }) => {
  switch (getAttachmentType(attachment)) {
    case "image":
      return <ImageAttachment attachment={attachment} />;

    case "video":
      return <VideoAttachment attachment={attachment} />;

    case "audio":
      return <AudioAttachment attachment={attachment} />;

    case "sticker":
      return <StickerAttachment attachment={attachment} />;

    case "document":
    case "file":
    default:
      return <DocumentAttachment attachment={attachment} />;
  }
};

/* =========================================================
   LOCATION
========================================================= */

const LocationMessage = ({ message }) => {
  const location = message?.location;

  if (!location) {
    return null;
  }

  const latitude = location?.latitude;
  const longitude = location?.longitude;

  const mapUrl =
    latitude && longitude
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : "";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-red-500" />

        <span className="text-xs font-medium text-slate-700">Location</span>
      </div>

      {location?.name && (
        <div className="mt-2 text-xs text-slate-600">{location.name}</div>
      )}

      {location?.address && (
        <div className="mt-1 text-[10px] text-slate-400">
          {location.address}
        </div>
      )}

      {mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-blue-600"
        >
          Open Map
          <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
};

/* =========================================================
   CONTACTS
========================================================= */

const ContactsMessage = ({ message }) => {
  const contacts = Array.isArray(message?.contacts) ? message.contacts : [];

  return (
    <div className="space-y-2">
      {contacts.map((contact, index) => (
        <div
          key={index}
          className="flex min-w-[230px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
            <Contact size={17} className="text-slate-500" />
          </div>

          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-700">
              {contact?.name?.formatted_name ||
                contact?.name?.first_name ||
                contact?.name ||
                "Contact"}
            </div>

            {contact?.phones?.[0]?.phone && (
              <div className="mt-1 text-[10px] text-slate-400">
                {contact.phones[0].phone}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/* =========================================================
   MESSAGE BUBBLE
========================================================= */

const MessageBubble = ({ message, lead }) => {
  const isOutgoing = message?.direction === "outbound";

  const text = message?.text || "";

  const messageType = message?.messageType || "text";

  const attachments = Array.isArray(message?.attachments)
    ? message.attachments
    : [];

  return (
    <div
      className={`flex w-full ${isOutgoing ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[82%] min-w-[70px] rounded-2xl px-3 py-2 shadow-sm ${
          isOutgoing ? "rounded-br-md bg-[#d9fdd3]" : "rounded-bl-md bg-white"
        }`}
      >
        {!isOutgoing && (
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold text-green-600">
            <User size={11} />

            {lead?.name || lead?.fullName || "Customer"}
          </div>
        )}

        {message?.replyTo && (
          <div className="mb-2 rounded-lg border-l-2 border-green-500 bg-black/5 px-2 py-1.5">
            <div className="flex items-center gap-1 text-[9px] font-medium text-green-600">
              <Reply size={10} />
              Reply
            </div>

            {message.replyTo.text && (
              <div className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">
                {message.replyTo.text}
              </div>
            )}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <RenderAttachment
                key={`${message._id}-${index}`}
                attachment={attachment}
              />
            ))}
          </div>
        )}

        {messageType === "location" && <LocationMessage message={message} />}

        {messageType === "contacts" && <ContactsMessage message={message} />}

        {messageType === "reaction" && message?.reaction?.emoji && (
          <div className="text-2xl">{message.reaction.emoji}</div>
        )}

        {messageType === "template" && (
          <div className="rounded-lg bg-black/5 p-2">
            <div className="text-[10px] font-semibold text-slate-500">
              WhatsApp Template
            </div>

            {message?.template?.name && (
              <div className="mt-1 text-xs font-medium">
                {message.template.name}
              </div>
            )}
          </div>
        )}

        {text && (
          <div
            className={`whitespace-pre-wrap break-words text-[13px] leading-[1.45] ${
              attachments.length > 0 ||
              messageType === "location" ||
              messageType === "contacts" ||
              messageType === "template"
                ? "mt-2"
                : ""
            }`}
          >
            {text}
          </div>
        )}

        <div className="mt-1 flex items-center justify-end gap-1">
          <span className="text-[9px] text-slate-400">
            {formatMessageTime(getMessageDate(message))}
          </span>

          <MessageStatus message={message} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const WhatsAppActivity = ({ lead }) => {
  const [messages, setMessages] = useState([]);

  const [conversationId, setConversationId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [messageLoading, setMessageLoading] = useState(false);

  const [messageText, setMessageText] = useState("");

  const [attachments, setAttachments] = useState([]);

  const [mediaOpen, setMediaOpen] = useState(false);

  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);

  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const [sendError, setSendError] = useState("");

  const [sendSuccess, setSendSuccess] = useState("");

  /* =======================================================
     HEADER STATES
  ======================================================= */

  const [searchOpen, setSearchOpen] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  const [contactInfoOpen, setContactInfoOpen] = useState(false);

  const [actionProcessing, setActionProcessing] = useState(false);

  /* =======================================================
     PHONE NUMBER
  ======================================================= */

  const phoneNumber = useMemo(() => {
    if (!lead?.phone) {
      return "";
    }

    const phone = String(lead.phone).replace(/\D/g, "");

    if (!phone) {
      return "";
    }

    if (phone.startsWith("91")) {
      return phone;
    }

    return `91${phone}`;
  }, [lead?.phone]);

  /* =======================================================
     GET / CREATE CONVERSATION
  ======================================================= */

  const fetchConversation = async () => {
    if (!phoneNumber) {
      setConversationId(null);
      setMessages([]);
      return null;
    }

    const response = await inboxApi.getOrCreateConversation(phoneNumber);

    const conversation = response?.data?.data;

    const id = conversation?._id;

    if (!id) {
      throw new Error("Conversation ID not found.");
    }

    setConversationId(id);

    return id;
  };

  /* =======================================================
     FETCH MESSAGES
  ======================================================= */

  const fetchInboxMessages = async (id) => {
    if (!id) {
      setMessages([]);
      return;
    }

    try {
      setMessageLoading(true);

      const response = await inboxApi.getMessages(id, {
        page: 1,
        limit: 100,
      });

      const apiMessages = response?.data?.data?.messages || [];

      setMessages(Array.isArray(apiMessages) ? apiMessages : []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);

      setMessages([]);

      setSendError(err?.response?.data?.message || "Failed to load messages.");
    } finally {
      setMessageLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const id = await fetchConversation();

        if (!mounted) return;

        if (id) {
          await fetchInboxMessages(id);
        }

        if (!mounted) return;
      } catch (err) {
        console.error("WhatsApp load error:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load WhatsApp.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [phoneNumber]);

  /* =======================================================
     REFRESH CHAT
  ======================================================= */

  const handleRefresh = async () => {
    if (!conversationId) {
      return;
    }

    setSearchText("");
    setSendError("");
    setSendSuccess("");

    await fetchInboxMessages(conversationId);
  };

  /* =======================================================
     VIDEO CALL
  ======================================================= */

  const handleVideoCall = () => {
    if (!phoneNumber) {
      setSendError("Customer phone number not available.");

      return;
    }

    setSendSuccess("Video call is not available through WhatsApp Cloud API.");
  };

  /* =======================================================
     AUDIO CALL
  ======================================================= */

  const handleAudioCall = () => {
    if (!phoneNumber) {
      setSendError("Customer phone number not available.");

      return;
    }

    setSendSuccess("Audio call is not available through WhatsApp Cloud API.");
  };

  /* =======================================================
     SEARCH MESSAGES
  ======================================================= */

  const filteredMessages = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return messages;
    }

    return messages.filter((message) => {
      const text = message?.text || "";

      const templateName = message?.template?.name || "";

      return (
        text.toLowerCase().includes(query) ||
        templateName.toLowerCase().includes(query)
      );
    });
  }, [messages, searchText]);

  /* =======================================================
     CLEAR CHAT
  ======================================================= */

  const handleClearChat = async () => {
    if (!conversationId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear this chat? All messages will be removed from this conversation view.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionProcessing(true);

      setMenuOpen(false);

      /*
       * Use API if available.
       */

      if (typeof inboxApi.clearChat === "function") {
        await inboxApi.clearChat(conversationId);
      } else if (typeof inboxApi.clearMessages === "function") {
        await inboxApi.clearMessages(conversationId);
      } else {
        /*
         * Do not call an unknown API.
         * Clear local view only.
         */
        console.warn(
          "inboxApi.clearChat / clearMessages is not available. Clearing local chat view only.",
        );
      }

      setMessages([]);

      setSendSuccess("Chat cleared successfully.");
    } catch (err) {
      console.error("Clear chat error:", err);

      setSendError(
        err?.response?.data?.message || err?.message || "Unable to clear chat.",
      );
    } finally {
      setActionProcessing(false);
    }
  };

  /* =======================================================
     DELETE CHAT
  ======================================================= */

  const handleDeleteChat = async () => {
    if (!conversationId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this chat? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionProcessing(true);

      setMenuOpen(false);

      if (typeof inboxApi.deleteConversation === "function") {
        await inboxApi.deleteConversation(conversationId);
      } else if (typeof inboxApi.deleteChat === "function") {
        await inboxApi.deleteChat(conversationId);
      } else {
        console.warn(
          "inboxApi.deleteConversation / deleteChat is not available.",
        );
      }

      setMessages([]);

      setConversationId(null);

      setSendSuccess("Chat deleted successfully.");
    } catch (err) {
      console.error("Delete chat error:", err);

      setSendError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete chat.",
      );
    } finally {
      setActionProcessing(false);
    }
  };

  /* =======================================================
     CONTACT INFO
  ======================================================= */

  const handleContactInfo = () => {
    setMenuOpen(false);

    setContactInfoOpen((value) => !value);
  };

  /* =======================================================
     MEDIA UPLOAD
  ======================================================= */

  const uploadSelectedMediaToWhatsApp = async (media) => {
    if (!media) {
      throw new Error("Media not selected.");
    }

    const payload = {
      mediaId: media?.source_id || media?._id || media?.id || null,

      filePath: media?.source_path || media?.path || null,

      fileUrl: media?.source_url || media?.url || media?.previewUrl || null,

      fileName:
        media?.name ||
        media?.originalName ||
        media?.filename ||
        "whatsapp-media",

      mimeType:
        media?.mimeType ||
        media?.mime_type ||
        media?.type ||
        "application/octet-stream",

      size: media?.size || 0,
    };

    const response = await marketingTemplateApi.uploadMediaToWhatsApp(payload);

    const result = response?.data || {};

    const data = result?.data || result;

    const mediaId = data?.mediaId || data?.id || null;

    if (!mediaId) {
      throw new Error("WhatsApp media ID was not returned.");
    }

    return String(mediaId);
  };

  /* =======================================================
     SELECT MEDIA
  ======================================================= */

  const handleMediaSelect = async (media) => {
    if (!media) return;

    try {
      setUploadingMedia(true);

      setSendError("");
      setSendSuccess("");

      const whatsappMediaId = await uploadSelectedMediaToWhatsApp(media);

      const mimeType = media?.mimeType || media?.mime_type || media?.type || "";

      let type = "document";

      if (mimeType.startsWith("image/")) {
        type = "image";
      } else if (mimeType.startsWith("video/")) {
        type = "video";
      } else if (mimeType.startsWith("audio/")) {
        type = "audio";
      }

      const attachment = {
        id: media?._id || media?.id || `${Date.now()}-${Math.random()}`,

        mediaId: whatsappMediaId,

        externalId: whatsappMediaId,

        type,

        mimeType,

        name:
          media?.name ||
          media?.originalName ||
          media?.filename ||
          "WhatsApp media",

        filename: media?.filename || media?.name || "WhatsApp media",

        size: media?.size || 0,

        url: media?.url || media?.source_url || media?.previewUrl || "",
      };

      setAttachments((previous) => [...previous, attachment]);

      setMediaOpen(false);

      setSendSuccess("Media selected successfully.");
    } catch (err) {
      console.error("Media select error:", err);

      setSendError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to upload media.",
      );
    } finally {
      setUploadingMedia(false);
    }
  };

  /* =======================================================
     REMOVE ATTACHMENT
  ======================================================= */

  const removeAttachment = (id) => {
    setAttachments((previous) => previous.filter((item) => item.id !== id));
  };

  /* =======================================================
     SEND TEXT / MEDIA
  ======================================================= */

  const handleSendMessage = async () => {
    if (!conversationId) {
      setSendError("Conversation not found.");

      return;
    }

    const text = messageText.trim();

    if (!text && attachments.length === 0) {
      setSendError("Please enter a message or select media.");

      return;
    }

    try {
      setSending(true);
      setSendError("");
      setSendSuccess("");

      if (attachments.length === 0) {
        const response = await inboxApi.sendMessage(conversationId, {
          messageType: "text",
          text,
        });

        if (response?.data?.success === false) {
          throw new Error(response?.data?.message || "Message failed.");
        }
      } else {
        for (let index = 0; index < attachments.length; index++) {
          const attachment = attachments[index];

          const payload = {
            messageType: attachment.type,

            mediaId: attachment.externalId || attachment.mediaId,

            caption: index === 0 ? text : "",

            mimeType: attachment.mimeType || "",

            url: attachment?.url,
          };

          if (attachment.type === "document") {
            payload.filename =
              attachment.filename || attachment.name || "document";
          }

          const response = await inboxApi.sendMessage(conversationId, payload);

          if (response?.data?.success === false) {
            throw new Error(
              response?.data?.message || `Failed to send ${attachment.type}.`,
            );
          }
        }
      }

      setMessageText("");
      setAttachments([]);

      setSendSuccess("Message sent successfully.");

      await fetchInboxMessages(conversationId);
    } catch (err) {
      console.error("Send message error:", err);

      setSendError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to send message.",
      );
    } finally {
      setSending(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <div className="text-center">
          <Loader2 size={28} className="mx-auto animate-spin text-green-600" />

          <p className="mt-3 text-sm text-slate-600">Loading WhatsApp...</p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-red-100 bg-red-50">
        <div className="max-w-md text-center">
          <AlertCircle size={28} className="mx-auto text-red-500" />

          <p className="mt-3 text-sm font-medium text-red-700">
            Unable to load WhatsApp
          </p>

          <p className="mt-1 text-xs text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="overflow-hidden  border-slate-200 bg-white">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="relative flex min-h-[56px] items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
            <MessageCircle size={19} />
          </div>

          {!searchOpen ? (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-800">
                WhatsApp
              </div>

              <div className="truncate text-xs text-slate-400">
                {phoneNumber || "No phone number"}
              </div>
            </div>
          ) : (
            <div className="flex min-w-[180px] max-w-[320px] items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5">
              <Search size={15} className="shrink-0 text-slate-400" />

              <input
                autoFocus
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search messages..."
                className="h-9 min-w-0 flex-1 bg-transparent px-2 text-xs text-slate-700 outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);

                  setSearchText("");
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT ACTIONS */}

        <div className="flex shrink-0 items-center gap-0.5">
          {/* REFRESH */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={messageLoading || actionProcessing}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              size={17}
              className={messageLoading ? "animate-spin" : ""}
            />
          </button>

          {/* VIDEO CALL */}

          <button
            type="button"
            onClick={handleVideoCall}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 sm:flex"
            title="Video call"
          >
            <Video size={17} />
          </button>

          {/* AUDIO CALL */}

          <button
            type="button"
            onClick={handleAudioCall}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 sm:flex"
            title="Audio call"
          >
            <Phone size={17} />
          </button>

          {/* SEARCH */}

          <button
            type="button"
            onClick={() => {
              setSearchOpen((value) => !value);

              if (searchOpen) {
                setSearchText("");
              }

              setMenuOpen(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            title="Search"
          >
            <Search size={17} />
          </button>

          {/* 3 DOT */}

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMenuOpen((value) => !value);

                setContactInfoOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              title="More"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                {/* CONTACT INFO */}

                <button
                  type="button"
                  onClick={handleContactInfo}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50"
                >
                  <Info size={15} className="text-slate-500" />

                  <span>Contact Info</span>
                </button>

                {/* CLEAR CHAT */}

                <button
                  type="button"
                  onClick={handleClearChat}
                  disabled={actionProcessing}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Eraser size={15} className="text-slate-500" />

                  <span>Clear Chat</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                {/* DELETE CHAT */}

                <button
                  type="button"
                  onClick={handleDeleteChat}
                  disabled={actionProcessing}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={15} />

                  <span>Delete Chat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          CONTACT INFO PANEL
      ================================================= */}

      {contactInfoOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-semibold text-green-600">
                {(lead?.name || lead?.fullName || "U").charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-800">
                  {lead?.name || lead?.fullName || "Unknown"}
                </div>

                <div className="mt-0.5 text-xs text-slate-400">
                  {phoneNumber || "No phone number"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setContactInfoOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <div className="text-[9px] uppercase tracking-wide text-slate-400">
                Phone
              </div>

              <div className="mt-1 truncate text-xs font-medium text-slate-700">
                {phoneNumber || "-"}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <div className="text-[9px] uppercase tracking-wide text-slate-400">
                Channel
              </div>

              <div className="mt-1 text-xs font-medium text-slate-700">
                WhatsApp
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <div className="text-[9px] uppercase tracking-wide text-slate-400">
                Messages
              </div>

              <div className="mt-1 text-xs font-medium text-slate-700">
                {messages.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          SEARCH RESULT INFO
      ================================================= */}

      {searchText.trim() && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500">
              {filteredMessages.length}{" "}
              {filteredMessages.length === 1 ? "message" : "messages"} found
            </span>

            <button
              type="button"
              onClick={() => setSearchText("")}
              className="text-[10px] font-medium text-slate-500 hover:text-slate-700"
            >
              Clear search
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          CHAT
      ================================================= */}

      <div className="max-h-[455px] min-h-[420px] overflow-y-auto bg-[#efeae2] px-4 py-5">
        {messageLoading && (
          <div className="mb-3 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] text-slate-500 shadow-sm">
              <Loader2 size={12} className="animate-spin" />
              Loading messages...
            </div>
          </div>
        )}

        {filteredMessages.length === 0 ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="text-center">
              <MessageCircle size={35} className="mx-auto text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-500">
                {searchText.trim() ? "No messages found" : "No messages"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {searchText.trim()
                  ? "Try another search."
                  : "Start a WhatsApp conversation."}
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-2.5">
            {filteredMessages.map((message, index) => {
              const previous = filteredMessages[index - 1];

              const currentDate = getMessageDate(message);

              const previousDate = previous ? getMessageDate(previous) : null;

              const showDate =
                !previous || !isSameDay(currentDate, previousDate);

              return (
                <React.Fragment key={message._id}>
                  {showDate && currentDate && (
                    <div className="my-3 flex justify-center">
                      <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-medium text-slate-500 shadow-sm">
                        {formatMessageDate(currentDate)}
                      </span>
                    </div>
                  )}

                  <MessageBubble message={message} lead={lead} />
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* =================================================
          COMPOSER
      ================================================= */}

      <div className="border-t border-slate-200 bg-white">
        <div className="p-4">
          {/* =================================================
              MESSAGE
          ================================================= */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <textarea
              value={messageText}
              onChange={(event) => {
                setMessageText(event.target.value);

                setSendError("");

                setSendSuccess("");
              }}
              placeholder="Type a WhatsApp message..."
              rows={3}
              disabled={sending || !conversationId}
              className="w-full resize-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />

            {/* SELECTED MEDIA */}

            {attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="relative w-28 overflow-hidden rounded-lg border border-slate-200 bg-white"
                  >
                    {attachment?.url && attachment?.type === "image" ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name || "Image"}
                        className="h-20 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-20 items-center justify-center bg-slate-100">
                        {attachment?.type === "video" ? (
                          <Video size={23} className="text-slate-400" />
                        ) : attachment?.type === "audio" ? (
                          <Mic size={23} className="text-slate-400" />
                        ) : (
                          <FileText size={23} className="text-slate-400" />
                        )}
                      </div>
                    )}

                    <div className="truncate px-2 py-1 text-[9px] text-slate-500">
                      {attachment?.name || "Attachment"}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ACTIONS */}

            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAttachmentMenuOpen((open) => !open)}
                  disabled={sending || uploadingMedia}
                  aria-label="Attach files"
                  aria-expanded={attachmentMenuOpen}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 ${attachmentMenuOpen ? "bg-[#075e54] text-white shadow-md shadow-emerald-900/15" : "text-slate-600 hover:bg-slate-100 hover:text-[#075e54]"}`}
                >
                  <Plus
                    size={25}
                    className={`transition-transform ${attachmentMenuOpen ? "rotate-45" : ""}`}
                  />
                </button>

                {attachmentMenuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close attachment menu"
                      className="fixed inset-0 z-30 cursor-default"
                      onClick={() => setAttachmentMenuOpen(false)}
                    />
                    <div className="absolute bottom-14 left-0 z-40 w-[304px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[22px] border border-white/10 bg-[#171717] p-2 text-white shadow-[0_18px_55px_rgba(0,0,0,0.42)] ring-1 ring-black/30 animate-in fade-in slide-in-from-bottom-2 duration-150">
                      <div className="flex items-center justify-between px-3 pb-2 pt-2">
                        <div>
                          <p className="text-[13px] font-semibold tracking-wide text-white">
                            Attach to message
                          </p>
                          <p className="mt-0.5 text-[11px] text-white/45">
                            Choose what you want to share
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachmentMenuOpen(false)}
                          aria-label="Close attachment menu"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      <div className="max-h-[min(65vh,560px)] overflow-y-auto px-1 pb-1 [scrollbar-width:thin] [scrollbar-color:#454545_transparent]">
                        {[
                          {
                            label: "Document",
                            hint: "Share a PDF or other file",
                            icon: FileText,
                            color: "text-violet-400",
                            tile: "bg-violet-500/15",
                            action: "media",
                          },
                          {
                            label: "Photos & videos",
                            hint: "Choose from your media library",
                            icon: Images,
                            color: "text-sky-400",
                            tile: "bg-sky-500/15",
                            action: "media",
                          },
                          {
                            label: "Camera",
                            hint: "Choose a photo or video",
                            icon: Camera,
                            color: "text-pink-400",
                            tile: "bg-pink-500/15",
                            action: "camera",
                          },
                          {
                            label: "Audio",
                            hint: "Share an audio file",
                            icon: Headphones,
                            color: "text-orange-400",
                            tile: "bg-orange-500/15",
                            action: "audio",
                          },
                          {
                            label: "Contact",
                            hint: "Share contact details",
                            icon: UserRound,
                            color: "text-cyan-400",
                            tile: "bg-cyan-500/15",
                            action: "contact",
                          },
                          {
                            label: "Poll",
                            hint: "Create a poll-style message",
                            icon: ListFilter,
                            color: "text-amber-300",
                            tile: "bg-amber-400/15",
                            action: "poll",
                          },
                          {
                            label: "Event",
                            hint: "Share event information",
                            icon: CalendarDays,
                            color: "text-rose-400",
                            tile: "bg-rose-500/15",
                            action: "event",
                          },
                          {
                            label: "New sticker",
                            hint: "Choose an image to share",
                            icon: Sticker,
                            color: "text-emerald-400",
                            tile: "bg-emerald-500/15",
                            action: "sticker",
                          },
                          { divider: true },
                          {
                            label: "Catalog",
                            hint: "Share a product or catalog link",
                            icon: Store,
                            color: "text-slate-300",
                            tile: "bg-slate-400/15",
                            action: "catalog",
                          },
                          {
                            label: "Quick replies",
                            hint: "Insert a saved response",
                            icon: Zap,
                            color: "text-amber-300",
                            tile: "bg-amber-400/15",
                            action: "quick-replies",
                          },
                        ].map((item, index) =>
                          item.divider ? (
                            <div
                              key={`divider-${index}`}
                              className="mx-3 my-2 border-t border-white/10"
                            />
                          ) : (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => {
                                setAttachmentMenuOpen(false);
                                setSendError("");
                                setSendSuccess("");

                                const addText = (
                                  text,
                                  successMessage = "Added to message.",
                                ) => {
                                  if (!text?.trim()) return;
                                  setMessageText((current) =>
                                    current.trim()
                                      ? `${current}\n${text.trim()}`
                                      : text.trim(),
                                  );
                                  setSendSuccess(successMessage);
                                };

                                if (
                                  [
                                    "media",
                                    "audio",
                                    "sticker",
                                    "camera",
                                  ].includes(item.action)
                                ) {
                                  setMediaOpen(true);
                                  if (item.action === "audio") {
                                    setSendSuccess(
                                      "Choose an audio file from your media library.",
                                    );
                                  } else if (item.action === "camera") {
                                    setSendSuccess(
                                      "Choose a photo or video from your media library. Camera capture depends on your device and media manager.",
                                    );
                                  } else if (item.action === "sticker") {
                                    setSendSuccess(
                                      "Choose an image. It will be sent as an image attachment, not a native WhatsApp sticker.",
                                    );
                                  }
                                } else if (item.action === "contact") {
                                  const name = window.prompt("Contact name:");
                                  if (name?.trim()) {
                                    const phone =
                                      window.prompt("Phone number:") || "";
                                    const email =
                                      window.prompt("Email (optional):") || "";
                                    addText(
                                      [
                                        "Contact",
                                        `Name: ${name.trim()}`,
                                        phone.trim()
                                          ? `Phone: ${phone.trim()}`
                                          : "",
                                        email.trim()
                                          ? `Email: ${email.trim()}`
                                          : "",
                                      ]
                                        .filter(Boolean)
                                        .join("\n"),
                                      "Contact details added to the message. Press Send to share.",
                                    );
                                  }
                                } else if (item.action === "poll") {
                                  const question =
                                    window.prompt("Poll question:");
                                  if (question?.trim()) {
                                    const options = window.prompt(
                                      "Enter poll options separated by commas (at least 2):",
                                      "Option 1, Option 2",
                                    );
                                    const choices = (options || "")
                                      .split(",")
                                      .map((value) => value.trim())
                                      .filter(Boolean);
                                    if (choices.length < 2) {
                                      setSendError(
                                        "Enter at least two poll options.",
                                      );
                                    } else {
                                      addText(
                                        `📊 Poll: ${question.trim()}\n${choices.map((choice, index) => `${index + 1}. ${choice}`).join("\n")}\nReply with your choice.`,
                                        "Poll formatted as a message. Native WhatsApp poll sending requires backend/API support.",
                                      );
                                    }
                                  }
                                } else if (item.action === "event") {
                                  const title = window.prompt("Event title:");
                                  if (title?.trim()) {
                                    const date =
                                      window.prompt("Date and time:") || "";
                                    const location =
                                      window.prompt(
                                        "Location or meeting link (optional):",
                                      ) || "";
                                    addText(
                                      [
                                        `📅 Event: ${title.trim()}`,
                                        date.trim()
                                          ? `When: ${date.trim()}`
                                          : "",
                                        location.trim()
                                          ? `Where: ${location.trim()}`
                                          : "",
                                      ]
                                        .filter(Boolean)
                                        .join("\n"),
                                      "Event details added to the message. Press Send to share.",
                                    );
                                  }
                                } else if (item.action === "catalog") {
                                  const url = window.prompt(
                                    "Paste your product catalog or product link:",
                                  );
                                  if (url?.trim()) {
                                    addText(
                                      `🛍️ Catalog: ${url.trim()}`,
                                      "Catalog link added to the message. Press Send to share.",
                                    );
                                  }
                                } else if (item.action === "quick-replies") {
                                  const replies = [
                                    "Hello! How can I help you?",
                                    "Thank you for contacting us.",
                                    "We will get back to you shortly.",
                                    "Your order is being processed.",
                                    "Please share more details.",
                                  ];
                                  const choice = window.prompt(
                                    `Choose a quick reply by number:\n${replies.map((reply, index) => `${index + 1}. ${reply}`).join("\n")}`,
                                    "1",
                                  );
                                  const selected = Number(choice);
                                  if (
                                    Number.isInteger(selected) &&
                                    selected >= 1 &&
                                    selected <= replies.length
                                  ) {
                                    addText(
                                      replies[selected - 1],
                                      "Quick reply added. Press Send to send it.",
                                    );
                                  }
                                }
                              }}
                              className="group flex min-h-[58px] w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition duration-150 hover:bg-white/[0.075] active:scale-[0.99]"
                            >
                              <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tile} transition group-hover:scale-105`}
                              >
                                <item.icon
                                  size={20}
                                  strokeWidth={2.2}
                                  className={item.color}
                                />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-[13px] font-medium leading-5 text-white/95">
                                  {item.label}
                                </span>
                                <span className="mt-0.5 block truncate text-[11px] leading-4 text-white/45">
                                  {item.hint}
                                </span>
                              </span>
                              <span className="pr-1 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-white/55">
                                ›
                              </span>
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={
                  sending ||
                  !conversationId ||
                  (!messageText.trim() && attachments.length === 0)
                }
                className="flex h-10 items-center gap-2 rounded-xl bg-[#087f5b] px-5 text-xs font-semibold text-white shadow-sm shadow-emerald-900/15 transition hover:bg-[#066c4d] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ERROR */}

          {sendError && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />

              <span>{sendError}</span>
            </div>
          )}

          {/* SUCCESS */}

          {sendSuccess && (
            <div className="mt-3 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-600">
              {sendSuccess}
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          MEDIA MANAGER
      ================================================= */}

      {mediaOpen && (
        <MediaManager
          open={mediaOpen}
          onClose={() => setMediaOpen(false)}
          onSelect={handleMediaSelect}
        />
      )}
    </div>
  );
};

export default WhatsAppActivity;
