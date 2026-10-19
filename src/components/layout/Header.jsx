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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { mainNavigation } from "../../config/navigation";


import LanguageSwitcher from "../common/LanguageSwitcher";

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
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="absolute left-0 top-0 flex h-full w-[285px] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white">
              A
            </div>

            <div>
              <p className="font-bold leading-none text-gray-900">
                Brielix
              </p>
              <p className="mt-1 text-[10px] text-gray-400">
                CRM
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
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
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
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

        {/* Footer */}
        <div className="border-t border-gray-200 p-3">
          <div className="rounded-xl bg-gray-50 px-3 py-3">
            <p className="text-xs font-medium text-gray-700">
              Brielix CRM
            </p>

            <p className="mt-1 text-[11px] text-gray-400">
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
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
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
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="mx-auto mt-[8vh] w-[calc(100%-24px)] max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4">
          <Search size={19} className="shrink-0 text-gray-400" />

          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anything..."
            className="h-14 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto p-2">
          {filteredItems.length > 0 ? (
            <>
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Quick Navigation
              </div>

              {filteredItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavigate(item.path)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-gray-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.title}
                      </p>

                      <p className="truncate text-xs text-gray-400">
                        {item.description}
                      </p>
                    </div>

                    <ExternalLink
                      size={15}
                      className="text-gray-300"
                    />
                  </button>
                );
              })}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-14">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <Search size={22} className="text-gray-400" />
              </div>

              <p className="text-sm font-medium text-gray-900">
                No results found
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Try a different search term.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2.5">
          <span className="text-[11px] text-gray-400">
            Search navigation
          </span>

          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5">
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
    <div className="absolute right-0 top-12 z-[80] w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Notifications
          </h3>

          <p className="mt-0.5 text-[11px] text-gray-400">
            Your latest updates
          </p>
        </div>

        <button
          type="button"
          onClick={onMarkAllRead}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          <CheckCheck size={14} />
          Mark all read
        </button>
      </div>

      {/* Notifications */}
      <div className="max-h-[390px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex gap-3 border-b border-gray-100 px-4 py-3 transition hover:bg-gray-50 ${
                !notification.read ? "bg-blue-50/40" : ""
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  notification.type === "success"
                    ? "bg-green-50 text-green-600"
                    : notification.type === "warning"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-blue-50 text-blue-600"
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
                  <p className="text-sm font-medium text-gray-800">
                    {notification.title}
                  </p>

                  {!notification.read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  )}
                </div>

                <p className="mt-0.5 text-xs leading-5 text-gray-500">
                  {notification.message}
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  {notification.time}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-14">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <Bell size={22} className="text-gray-400" />
            </div>

            <p className="text-sm font-medium text-gray-900">
              No notifications
            </p>

            <p className="mt-1 text-xs text-gray-400">
              You're all caught up.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50 p-2">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg py-2 text-xs font-medium text-gray-600 transition hover:bg-white hover:text-gray-900"
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
  const [notificationOpen, setNotificationOpen] =
    useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

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
      message:
        "Your CRM workspace is ready to use.",
      type: "success",
      time: "Just now",
      read: false,
    },
    {
      id: 2,
      title: "New lead received",
      message:
        "A new lead has been added to your CRM.",
      type: "info",
      time: "10 min ago",
      read: false,
    },
    {
      id: 3,
      title: "System update",
      message:
        "Your CRM features have been updated.",
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
      const isMac = navigator.platform
        .toUpperCase()
        .includes("MAC");

      const shortcut =
        isMac && event.metaKey
          ? event.key.toLowerCase() === "k"
          : event.ctrlKey &&
            event.key.toLowerCase() === "k";

      if (shortcut) {
        event.preventDefault();
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
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
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
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-between gap-4 px-3 sm:px-5 lg:px-6">
          {/* =================================================
              LEFT
          ================================================== */}

          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile Menu */}
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(true)
              }
              aria-label="Open menu"
              className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
            >
              <Menu size={21} />
            </button>

            {/* Search */}
            <button
              type="button"
              onClick={openSearch}
              className="hidden h-10 w-[280px] items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 text-left transition hover:border-gray-300 hover:bg-white md:flex lg:w-[360px]"
            >
              <Search
                size={17}
                className="shrink-0 text-gray-400"
              />

              <span className="flex-1 text-sm text-gray-400">
                Search...
              </span>

              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <Command size={11} />
                K
              </span>
            </button>

            {/* Mobile Search */}
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search"
              className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
            >
              <Search size={20} />
            </button>
          </div>

          {/* =================================================
              RIGHT
          ================================================== */}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher/>
            {/* Notification */}
            <div
              ref={notificationRef}
              className="relative"
            >
              <button
                type="button"
                onClick={toggleNotifications}
                aria-label="Notifications"
                className={`relative rounded-lg p-2.5 transition ${
                  notificationOpen
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <>
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />

                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 9
                        ? "9+"
                        : unreadCount}
                    </span>
                  </>
                )}
              </button>

              <NotificationsPanel
                open={notificationOpen}
                notifications={notifications}
                onClose={() =>
                  setNotificationOpen(false)
                }
                onMarkAllRead={handleMarkAllRead}
              />
            </div>

            {/* Divider */}
            <div className="mx-1 hidden h-7 w-px bg-gray-200 sm:block" />

            {/* Profile */}
            <div
              ref={profileRef}
              className="relative"
            >
              <button
                type="button"
                onClick={toggleProfile}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                className={`flex items-center gap-2 rounded-xl p-1.5 transition ${
                  profileOpen
                    ? "bg-gray-100"
                    : "hover:bg-gray-100"
                }`}
              >
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {avatarLetter}
                </div>

                {/* User Info */}
                <div className="hidden max-w-[150px] text-left md:block">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {userName}
                  </p>

                  <p className="truncate text-xs capitalize text-gray-500">
                    {String(userRole)}
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`hidden text-gray-500 transition-transform md:block ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-12 z-[80] w-[280px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                  {/* User */}
                  <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-bold text-blue-700">
                        {avatarLetter}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {userName}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {userEmail}
                        </p>

                        <span className="mt-1.5 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium capitalize text-blue-700">
                          {String(userRole)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="p-2">
                    <Link
                      to="/business/profile"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                    >
                      <UserCircle
                        size={18}
                        className="text-gray-500"
                      />

                      <span className="flex-1">
                        Profile
                      </span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Settings
                        size={18}
                        className="text-gray-500"
                      />

                      <span className="flex-1">
                        Settings
                      </span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 p-2">
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

      {/* =====================================================
          SEARCH MODAL
      ====================================================== */}

      <SearchPopup
        open={searchOpen}
        search={search}
        setSearch={setSearch}
        onClose={() => {
          setSearchOpen(false);
          setSearch("");
        }}
      />

      {/* =====================================================
          MOBILE SIDEBAR
      ====================================================== */}

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() =>
          setMobileMenuOpen(false)
        }
      />
    </>
  );
};

export default Header;
