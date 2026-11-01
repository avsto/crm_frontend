import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  Menu,
  Search,
  UserCircle,
  ChevronDown,
  LogOut,
  Settings,
  X,
  Command,
  Check,
  CheckCheck,
  ExternalLink,
  FileText,
  Users,
  ShoppingCart,
  AlertCircle,
  Sun,
  Moon,
  Palette,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { mainNavigation } from "../../config/navigation";
import LanguageSwitcher from "../common/LanguageSwitcher";

/* =========================================================
   THEME CONFIGURATION
========================================================= */

const THEME_STORAGE_KEY = "brielix-theme";

const THEME_COLORS = {
  emerald: {
    label: "Emerald",
    primary: "#059669",
    hover: "#047857",
    soft: "#ecfdf5",
    border: "#a7f3d0",
  },
  blue: {
    label: "Blue",
    primary: "#2563eb",
    hover: "#1d4ed8",
    soft: "#eff6ff",
    border: "#bfdbfe",
  },
  violet: {
    label: "Violet",
    primary: "#7c3aed",
    hover: "#6d28d9",
    soft: "#f5f3ff",
    border: "#ddd6fe",
  },
  rose: {
    label: "Rose",
    primary: "#e11d48",
    hover: "#be123c",
    soft: "#fff1f2",
    border: "#fecdd3",
  },
  amber: {
    label: "Amber",
    primary: "#d97706",
    hover: "#b45309",
    soft: "#fffbeb",
    border: "#fde68a",
  },
};

const getSavedTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      return {
        mode: parsed.mode === "dark" ? "dark" : "light",
        color: THEME_COLORS[parsed.color]
          ? parsed.color
          : "emerald",
      };
    }
  } catch (error) {
    console.error("Theme loading error:", error);
  }

  return {
    mode: "light",
    color: "emerald",
  };
};

/* =========================================================
   APPLY THEME
========================================================= */

const applyTheme = (theme) => {
  const root = document.documentElement;
  const selectedColor =
    THEME_COLORS[theme.color] || THEME_COLORS.emerald;

  root.classList.toggle("dark", theme.mode === "dark");

  root.dataset.theme = theme.color;
  root.dataset.mode = theme.mode;

  root.style.setProperty(
    "--theme-primary",
    selectedColor.primary
  );

  root.style.setProperty(
    "--theme-primary-hover",
    selectedColor.hover
  );

  root.style.setProperty(
    "--theme-primary-soft",
    selectedColor.soft
  );

  root.style.setProperty(
    "--theme-primary-border",
    selectedColor.border
  );

  try {
    localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify(theme)
    );
  } catch (error) {
    console.error("Theme saving error:", error);
  }
};

/* =========================================================
   THEME SWITCHER
========================================================= */

const ThemeSwitcher = ({ theme, setTheme }) => {
  const [colorOpen, setColorOpen] = useState(false);
  const colorRef = useRef(null);

  const toggleMode = () => {
    setTheme((prev) => ({
      ...prev,
      mode: prev.mode === "light" ? "dark" : "light",
    }));
  };

  const changeColor = (color) => {
    setTheme((prev) => ({
      ...prev,
      color,
    }));

    setColorOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        colorRef.current &&
        !colorRef.current.contains(event.target)
      ) {
        setColorOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  return (
    <div className="flex items-center gap-1">
      {/* Light / Dark Toggle */}
      <button
        type="button"
        onClick={toggleMode}
        title={
          theme.mode === "light"
            ? "Switch to dark mode"
            : "Switch to light mode"
        }
        aria-label="Toggle theme mode"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
      >
        {theme.mode === "light" ? (
          <Moon size={19} />
        ) : (
          <Sun size={19} />
        )}
      </button>

      {/* Theme Color */}
      <div ref={colorRef} className="relative">
        <button
          type="button"
          onClick={() => setColorOpen((prev) => !prev)}
          title="Change theme color"
          aria-label="Change theme color"
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 ${
            colorOpen ? "bg-gray-100" : ""
          }`}
        >
          <Palette size={19} />
        </button>

        {colorOpen && (
          <div className="absolute right-0 top-12 z-[100] w-52 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
            <p className="mb-3 text-xs font-semibold text-gray-800">
              Choose Theme Color
            </p>

            <div className="space-y-1">
              {Object.entries(THEME_COLORS).map(
                ([key, color]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => changeColor(key)}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 rounded-full ring-2 ring-white"
                        style={{
                          backgroundColor: color.primary,
                          boxShadow: `0 0 0 1px ${color.border}`,
                        }}
                      />

                      {color.label}
                    </span>

                    {theme.color === key && (
                      <Check
                        size={16}
                        style={{ color: color.primary }}
                      />
                    )}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   MOBILE SIDEBAR
========================================================= */

const MobileSidebar = ({ open, onClose }) => {
  const navigate = useNavigate();

  if (!open) return null;

  const handleNavigation = (path) => {
    if (!path) return;

    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <aside className="theme-surface absolute left-0 top-0 flex h-full w-[285px] flex-col shadow-2xl">
        <div className="theme-divider flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-lg font-black text-white"
              style={{ backgroundColor: "var(--theme-primary)" }}
            >
              B
            </div>

            <div>
              <p className="theme-heading font-bold leading-none">
                Brielix
              </p>

              <p className="theme-muted mt-1 text-[10px]">
                CRM
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="theme-icon-button rounded-lg p-2"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="theme-muted mb-3 px-2 text-[10px] font-semibold uppercase tracking-wider">
            Navigation
          </div>

          <div className="space-y-1">
            {mainNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavigation(item.path)}
                  className="theme-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition"
                >
                  {Icon && <Icon size={19} />}

                  <span className="truncate">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="theme-divider border-t p-3">
          <div className="theme-subtle rounded-xl px-3 py-3">
            <p className="theme-body text-xs font-medium">
              Brielix CRM
            </p>

            <p className="theme-muted mt-1 text-[11px]">
              Manage your business
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

/* =========================================================
   SEARCH POPUP
========================================================= */

const SearchPopup = ({
  open,
  search,
  setSearch,
  onClose,
}) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  const searchItems = [
    {
      title: "Business",
      description: "Manage your business",
      path: "/business",
      icon: FileText,
    },
    {
      title: "Products",
      description: "Manage products and catalog",
      path: "/products",
      icon: ShoppingCart,
    },
    {
      title: "Leads",
      description: "Manage CRM leads",
      path: "/leads",
      icon: Users,
    },
    {
      title: "Orders",
      description: "View and manage orders",
      path: "/orders",
      icon: ShoppingCart,
    },
    {
      title: "Reports",
      description: "Business reports and analytics",
      path: "/reports",
      icon: FileText,
    },
    {
      title: "Settings",
      description: "Manage application settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  const filteredItems = searchItems.filter((item) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const handleNavigate = (path) => {
    onClose();
    setSearch("");
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="theme-surface mx-auto mt-[8vh] w-[calc(100%-24px)] max-w-2xl overflow-hidden rounded-2xl border shadow-2xl">
        <div className="theme-divider flex items-center gap-3 border-b px-4">
          <Search
            size={19}
            className="theme-muted shrink-0"
          />

          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anything..."
            className="theme-input h-14 flex-1 bg-transparent text-sm outline-none"
          />

          <button
            type="button"
            onClick={onClose}
            className="theme-icon-button rounded-lg p-1.5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {filteredItems.length > 0 ? (
            <>
              <div className="theme-muted px-3 py-2 text-[10px] font-semibold uppercase tracking-wider">
                Quick Navigation
              </div>

              {filteredItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavigate(item.path)}
                    className="theme-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: "var(--theme-primary-soft)",
                        color: "var(--theme-primary)",
                      }}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="theme-heading text-sm font-medium">
                        {item.title}
                      </p>

                      <p className="theme-muted truncate text-xs">
                        {item.description}
                      </p>
                    </div>

                    <ExternalLink
                      size={15}
                      className="theme-muted"
                    />
                  </button>
                );
              })}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-14">
              <Search
                size={22}
                className="theme-muted mb-3"
              />

              <p className="theme-heading text-sm font-medium">
                No results found
              </p>

              <p className="theme-muted mt-1 text-xs">
                Try a different search term.
              </p>
            </div>
          )}
        </div>

        <div className="theme-subtle theme-divider flex items-center justify-between border-t px-4 py-2.5">
          <span className="theme-muted text-[11px]">
            Search navigation
          </span>

          <div className="theme-muted flex items-center gap-1 text-[11px]">
            <kbd className="theme-surface rounded border px-1.5 py-0.5">
              ESC
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   NOTIFICATIONS PANEL
========================================================= */

const NotificationsPanel = ({
  open,
  notifications,
  onClose,
  onMarkAllRead,
}) => {
  if (!open) return null;

  return (
    <div className="theme-surface absolute right-0 top-12 z-[80] w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border shadow-2xl">
      <div className="theme-divider flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="theme-heading text-sm font-semibold">
            Notifications
          </h3>

          <p className="theme-muted mt-0.5 text-[11px]">
            Your latest updates
          </p>
        </div>

        <button
          type="button"
          onClick={onMarkAllRead}
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: "var(--theme-primary)" }}
        >
          <CheckCheck size={14} />
          Mark all read
        </button>
      </div>

      <div className="max-h-[390px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`theme-divider theme-menu-item flex gap-3 border-b px-4 py-3 transition ${
                !notification.read ? "theme-notification-unread" : ""
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  notification.type === "success"
                    ? "bg-green-50 text-green-600"
                    : notification.type === "warning"
                    ? "bg-amber-50 text-amber-600"
                    : "theme-accent-soft"
                }`}
              >
                {notification.type === "success" ? (
                  <Check size={17} />
                ) : notification.type === "warning" ? (
                  <AlertCircle size={17} />
                ) : (
                  <Bell size={17} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="theme-body text-sm font-medium">
                    {notification.title}
                  </p>

                  {!notification.read && (
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: "var(--theme-primary)",
                      }}
                    />
                  )}
                </div>

                <p className="theme-muted mt-0.5 text-xs leading-5">
                  {notification.message}
                </p>

                <p className="theme-muted mt-1 text-[10px]">
                  {notification.time}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-14">
            <Bell size={22} className="theme-muted mb-3" />

            <p className="theme-heading text-sm font-medium">
              No notifications
            </p>

            <p className="theme-muted mt-1 text-xs">
              You're all caught up.
            </p>
          </div>
        )}
      </div>

      <div className="theme-subtle theme-divider border-t p-2">
        <button
          type="button"
          onClick={onClose}
          className="theme-menu-item w-full rounded-lg py-2 text-xs font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   HEADER
========================================================= */

const Header = () => {
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [theme, setTheme] = useState(getSavedTheme);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  /* =======================================================
     APPLY AND SAVE THEME
  ======================================================= */

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /* =======================================================
     USER
  ======================================================= */

  const userName =
    user?.name ||
    user?.fullName ||
    user?.businessName ||
    "User";

  const userEmail = user?.email || "";

  const userRole =
    user?.role?.name ||
    user?.role?.code ||
    user?.role ||
    "User";

  const avatarLetter =
    String(userName).charAt(0).toUpperCase() || "U";

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome to Brielix CRM",
      message: "Your CRM workspace is ready to use.",
      type: "success",
      time: "Just now",
      read: false,
    },
    {
      id: 2,
      title: "New lead received",
      message: "A new lead has been added to your CRM.",
      type: "info",
      time: "10 min ago",
      read: false,
    },
    {
      id: 3,
      title: "System update",
      message: "Your CRM features have been updated.",
      type: "info",
      time: "1 hour ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      setProfileOpen(false);
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /* =======================================================
     MARK NOTIFICATIONS READ
  ======================================================= */

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const openSearch = () => {
    setProfileOpen(false);
    setNotificationOpen(false);
    setSearchOpen(true);
  };

  /* =======================================================
     KEYBOARD SHORTCUT
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMac =
        navigator.platform?.toUpperCase().includes("MAC");

      const shortcut =
        (isMac && event.metaKey && event.key.toLowerCase() === "k") ||
        (!isMac && event.ctrlKey && event.key.toLowerCase() === "k");

      if (shortcut) {
        event.preventDefault();
        setProfileOpen(false);
        setNotificationOpen(false);
        setSearchOpen(true);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setProfileOpen(false);
        setNotificationOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* =======================================================
     OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =======================================================
     TOGGLES
  ======================================================= */

  const toggleProfile = () => {
    setNotificationOpen(false);
    setProfileOpen((value) => !value);
  };

  const toggleNotifications = () => {
    setProfileOpen(false);
    setNotificationOpen((value) => !value);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <header className="theme-header sticky top-0 z-30 border-b">
        <div className="flex h-16 items-center justify-between gap-4 px-3 sm:px-5 lg:px-6">

          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="theme-icon-button rounded-lg p-2 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <button
              type="button"
              onClick={openSearch}
              className="theme-search hidden h-10 w-[280px] items-center gap-3 rounded-lg border px-3 text-left transition md:flex lg:w-[360px]"
            >
              <Search size={17} className="theme-muted shrink-0" />

              <span className="theme-muted flex-1 text-sm">
                Search...
              </span>

              <span className="theme-muted flex items-center gap-1 text-[10px]">
                <Command size={11} />
                K
              </span>
            </button>

            <button
              type="button"
              onClick={openSearch}
              aria-label="Search"
              className="theme-icon-button rounded-lg p-2 md:hidden"
            >
              <Search size={20} />
            </button>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-1 sm:gap-2">

            <ThemeSwitcher
              theme={theme}
              setTheme={setTheme}
            />

            <LanguageSwitcher />

            {/* Notifications */}

            <div ref={notificationRef} className="relative">
              <button
                type="button"
                onClick={toggleNotifications}
                aria-label="Notifications"
                className={`theme-icon-button relative rounded-lg p-2.5 transition ${
                  notificationOpen ? "theme-active" : ""
                }`}
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <>
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />

                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </>
                )}
              </button>

              <NotificationsPanel
                open={notificationOpen}
                notifications={notifications}
                onClose={() => setNotificationOpen(false)}
                onMarkAllRead={handleMarkAllRead}
              />
            </div>

            <div className="theme-divider mx-1 hidden h-7 w-px sm:block" />

            {/* Profile */}

            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={toggleProfile}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                className={`theme-icon-button flex items-center gap-2 rounded-xl p-1.5 transition ${
                  profileOpen ? "theme-active" : ""
                }`}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: "var(--theme-primary-soft)",
                    color: "var(--theme-primary)",
                  }}
                >
                  {avatarLetter}
                </div>

                <div className="hidden max-w-[150px] text-left md:block">
                  <p className="theme-heading truncate text-sm font-semibold">
                    {userName}
                  </p>

                  <p className="theme-muted truncate text-xs capitalize">
                    {String(userRole)}
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`theme-muted hidden transition-transform md:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown */}

              {profileOpen && (
                <div className="theme-surface absolute right-0 top-12 z-[80] w-[280px] overflow-hidden rounded-2xl border shadow-2xl">

                  <div className="theme-subtle theme-divider border-b px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold"
                        style={{
                          backgroundColor: "var(--theme-primary-soft)",
                          color: "var(--theme-primary)",
                        }}
                      >
                        {avatarLetter}
                      </div>

                      <div className="min-w-0">
                        <p className="theme-heading truncate text-sm font-semibold">
                          {userName}
                        </p>

                        <p className="theme-muted mt-0.5 truncate text-xs">
                          {userEmail}
                        </p>

                        <span
                          className="theme-accent-soft mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
                        >
                          {String(userRole)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      to="/business/profile"
                      onClick={() => setProfileOpen(false)}
                      className="theme-menu-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition"
                    >
                      <UserCircle size={18} />
                      <span className="flex-1">Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="theme-menu-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition"
                    >
                      <Settings size={18} />
                      <span className="flex-1">Settings</span>
                    </Link>
                  </div>

                  <div className="theme-divider border-t p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      <span className="flex-1 text-left">
                        Logout
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH MODAL */}

      <SearchPopup
        open={searchOpen}
        search={search}
        setSearch={setSearch}
        onClose={() => {
          setSearchOpen(false);
          setSearch("");
        }}
      />

      {/* MOBILE SIDEBAR */}

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
};

export default Header;
