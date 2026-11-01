import React from "react";
import { LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { mainNavigation } from "../../config/navigation";

// ======================================================
// GET ACTIVE MODULE
// ======================================================

const getActiveModule = (pathname) => {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return "dashboard";
  }

  if (
    [
      "/business",
      "/content",
      "/distribution",
      "/website",
      "/forms",
      "/integrations",
    ].some((path) => pathname === path || pathname.startsWith(path + "/"))
  ) {
    return "business";
  }

  if (
    ["/products", "/categories", "/inventory"].some(
      (path) => pathname === path || pathname.startsWith(path + "/"),
    )
  ) {
    return "catalog";
  }

  if (pathname === "/inbox" || pathname.startsWith("/inbox/")) {
    return "inbox";
  }

  if (
    ["/sales", "/orders", "/payments", "/invoices", "/refunds"].some(
      (path) => pathname === path || pathname.startsWith(path + "/"),
    )
  ) {
    return "sales";
  }

  if (
    ["/crm", "/leads", "/contacts", "/customers"].some(
      (path) => pathname === path || pathname.startsWith(path + "/"),
    )
  ) {
    return "crm";
  }

  if (pathname === "/marketing" || pathname.startsWith("/marketing/")) {
    return "marketing";
  }

  if (
    ["/team", "/staff"].some(
      (path) => pathname === path || pathname.startsWith(path + "/"),
    )
  ) {
    return "team";
  }

  if (pathname === "/reports" || pathname.startsWith("/reports/")) {
    return "reports";
  }

  if (pathname === "/settings" || pathname.startsWith("/settings/")) {
    return "settings";
  }

  return "dashboard";
};

// ======================================================
// SIDEBAR
// ======================================================

const Sidebar = ({ onModuleChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const activeModule = getActiveModule(location.pathname);

  // ====================================================
  // NAVIGATION
  // ====================================================

  const handleClick = (item) => {
    if (onModuleChange) {
      onModuleChange(item.key);
    }

    if (item.path) {
      navigate(item.path);
    }
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const logoutLabel = t("common.logout", {
    defaultValue: "Logout",
  });

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <aside className="brielix-sidebar fixed inset-y-0 left-0 z-50 hidden w-[80px] flex-col overflow-hidden border-r shadow-sm lg:flex">
      {/* LOGO */}

      <div className="brielix-sidebar-header flex h-16 shrink-0 items-center justify-center border-b">
        <button
          type="button"
          onClick={() => navigate("/business")}
          title="Brielix"
          aria-label="Brielix"
          className="group flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
        >
          <img
            src="https://app.brielix.com/favicon.png"
            alt="Brielix"
            className="h-7 w-7 object-contain transition-transform duration-200 group-hover:scale-110"
          />
        </button>
      </div>

      {/* NAVIGATION */}

      <nav className="sidebar-scroll flex-1 overflow-y-auto px-2 py-4">
        <div className="space-y-1.5">
          {mainNavigation.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.key;

            const label = t(item.translationKey, {
              defaultValue: item.label,
            });

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleClick(item)}
                title={label}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`brielix-sidebar-item group relative flex w-full flex-col items-center justify-center gap-1 rounded-xl px-1 py-2.5 transition-all duration-200 ${
                  active ? "is-active" : ""
                }`}
              >
                {/* ACTIVE INDICATOR */}

                {active && (
                  <span className="brielix-sidebar-indicator absolute -left-2 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full" />
                )}

                {/* ICON */}

                <span className="brielix-sidebar-icon flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200">
                  <Icon size={19} strokeWidth={active ? 2.4 : 1.9} />
                </span>

                {/* LABEL */}

                <span className="brielix-sidebar-label w-full truncate text-center text-[9px] font-semibold leading-tight">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* LOGOUT */}

      <div className="brielix-sidebar-footer shrink-0 border-t p-2">
        <button
          type="button"
          onClick={handleLogout}
          title={logoutLabel}
          aria-label={logoutLabel}
          className="brielix-sidebar-logout group flex w-full flex-col items-center justify-center gap-1 rounded-xl px-1 py-2.5 transition-all duration-200"
        >
          <span className="brielix-sidebar-logout-icon flex h-8 w-8 items-center justify-center rounded-lg transition-all">
            <LogOut size={19} strokeWidth={2} />
          </span>

          <span className="text-[9px] font-semibold leading-tight">
            {logoutLabel}
          </span>
        </button>
      </div>

      {/* SCROLLBAR */}

      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 3px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: var(--app-border);
          border-radius: 999px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--app-muted);
        }

        .brielix-sidebar {
          background: var(--app-surface);
          border-color: var(--app-border);
          color: var(--app-body);
        }

        .brielix-sidebar-header,
        .brielix-sidebar-footer {
          background: var(--app-surface);
          border-color: var(--app-border);
        }

        .brielix-sidebar-header button {
          background: var(--app-surface);
          border-color: var(--app-border);
        }

        .brielix-sidebar-item {
          color: var(--app-muted);
          background: transparent;
        }

        .brielix-sidebar-item:hover {
          color: var(--theme-primary);
          background: var(--theme-primary-soft);
        }

        .brielix-sidebar-item.is-active {
          color: var(--theme-primary);
          background: var(--theme-primary-soft);
        }

        .brielix-sidebar-item.is-active .brielix-sidebar-icon {
          color: var(--theme-primary);
          background: var(--theme-primary-border);
        }

        .brielix-sidebar-item:not(.is-active):hover .brielix-sidebar-icon {
          color: var(--theme-primary);
          background: var(--theme-primary-soft);
        }

        .brielix-sidebar-item.is-active .brielix-sidebar-label {
          color: var(--theme-primary);
        }

        .brielix-sidebar-indicator {
          background: var(--theme-primary);
        }

        .brielix-sidebar-logout {
          color: var(--app-muted);
        }

        .brielix-sidebar-logout:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
        }

        .brielix-sidebar-logout:hover .brielix-sidebar-logout-icon {
          background: rgba(239, 68, 68, 0.12);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
