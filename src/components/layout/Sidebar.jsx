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
    pathname === "/business" ||
    pathname.startsWith("/business/") ||
    pathname === "/content" ||
    pathname.startsWith("/content/") ||
    pathname === "/distribution" ||
    pathname.startsWith("/distribution/") ||
    pathname === "/website" ||
    pathname.startsWith("/website/") ||
    pathname === "/forms" ||
    pathname.startsWith("/forms/") ||
    pathname === "/integrations" ||
    pathname.startsWith("/integrations/")
  ) {
    return "business";
  }

  if (
    pathname === "/products" ||
    pathname.startsWith("/products/") ||
    pathname === "/categories" ||
    pathname.startsWith("/categories/") ||
    pathname === "/inventory" ||
    pathname.startsWith("/inventory/")
  ) {
    return "catalog";
  }

  if (pathname === "/inbox" || pathname.startsWith("/inbox/")) {
    return "inbox";
  }

  if (
    pathname === "/sales" ||
    pathname.startsWith("/sales/") ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/") ||
    pathname === "/payments" ||
    pathname.startsWith("/payments/") ||
    pathname === "/invoices" ||
    pathname.startsWith("/invoices/") ||
    pathname === "/refunds" ||
    pathname.startsWith("/refunds/")
  ) {
    return "sales";
  }

  if (
    pathname === "/crm" ||
    pathname.startsWith("/crm/") ||
    pathname === "/leads" ||
    pathname.startsWith("/leads/") ||
    pathname === "/contacts" ||
    pathname.startsWith("/contacts/") ||
    pathname === "/customers" ||
    pathname.startsWith("/customers/")
  ) {
    return "crm";
  }

  if (pathname === "/marketing" || pathname.startsWith("/marketing/")) {
    return "marketing";
  }

  if (
    pathname === "/team" ||
    pathname.startsWith("/team/") ||
    pathname === "/staff" ||
    pathname.startsWith("/staff/")
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

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <aside
      className="
        fixed
        inset-y-0
        left-0
        z-50
        hidden
        w-[80px]
        flex-col
        overflow-hidden
        border-r
        border-blue-950/40
        bg-[#071A33]
        lg:flex
      "
    >
      {/* ==================================================
          LOGO
      ================================================== */}

      <div
        className="
          flex
          h-16
          shrink-0
          items-center
          justify-center
          border-b
          border-white/10
          bg-[#06172C]
        "
      >
        <button
          type="button"
          onClick={() => navigate("/business")}
          title="Brielix"
          aria-label="Brielix"
          className="
            group
            flex
            h-10
            w-10
            items-center
            justify-center
            overflow-hidden
            rounded-xl
            bg-white
            shadow-lg
            shadow-blue-950/30
            transition-all
            duration-200
            hover:scale-105
          "
        >
          <img
            src="https://app.brielix.com/favicon.png"
            alt="Brielix"
            className="
              h-7
              w-7
              object-contain
              transition-transform
              duration-200
              group-hover:scale-110
            "
          />
        </button>
      </div>

      {/* ==================================================
          NAVIGATION
      ================================================== */}

      <nav
        className="
          sidebar-scroll
          flex-1
          overflow-y-auto
          px-2
          py-4
        "
      >
        <div className="space-y-2">
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
                className={`
                  group
                  relative
                  flex
                  w-full
                  flex-col
                  items-center
                  justify-center
                  gap-0
                  rounded-xl
                  px-1
                  py-2.5
                  transition-all
                  duration-200
                  ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                      : "text-blue-100/60 hover:bg-white/[0.07] hover:text-white"
                  }
                `}
              >
                {/* Active indicator */}

                {active && (
                  <span
                    className="
                      absolute
                      -left-2
                      top-1/2
                      h-7
                      w-1
                      -translate-y-1/2
                      rounded-r-full
                      bg-cyan-300
                    "
                  />
                )}

                {/* Icon */}

                <span
                  className={`
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    transition-all
                    duration-200
                    ${
                      active
                        ? "bg-white/15 text-white"
                        : "text-blue-100/60 group-hover:bg-white/10 group-hover:text-white"
                    }
                  `}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                </span>

                {/* Label */}

                <span
                  className={`
                    w-full
                    truncate
                    text-center
                    text-[9px]
                    font-semibold
                    leading-tight
                    ${
                      active
                        ? "text-white"
                        : "text-blue-100/60 group-hover:text-white"
                    }
                  `}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ==================================================
          LOGOUT
      ================================================== */}

      <div
        className="
          shrink-0
          border-t
          border-white/10
          bg-[#06172C]
          p-2
        "
      >
        <button
          type="button"
          onClick={handleLogout}
          title={t("common.logout", {
            defaultValue: "Logout",
          })}
          aria-label={t("common.logout", {
            defaultValue: "Logout",
          })}
          className="
            group
            flex
            w-full
            flex-col
            items-center
            justify-center
            gap-1
            rounded-xl
            px-1
            py-2.5
            text-blue-100/50
            transition-all
            hover:bg-red-500/10
            hover:text-red-400
          "
        >
          <span
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              transition-all
              group-hover:bg-red-500/10
            "
          >
            <LogOut size={20} strokeWidth={2} />
          </span>

          <span
            className="
              text-[9px]
              font-semibold
              leading-tight
            "
          >
            {t("common.logout", {
              defaultValue: "Logout",
            })}
          </span>
        </button>
      </div>

      {/* ==================================================
          SCROLLBAR
      ================================================== */}

      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 3px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 999px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.22);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
