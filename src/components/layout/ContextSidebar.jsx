
import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { contextNavigation } from "../../config/navigation";

// ======================================================
// CONSTANTS
// ======================================================

const MAIN_SIDEBAR_WIDTH = "80px";
const CONTEXT_SIDEBAR_WIDTH = "220px";

// ======================================================
// HELPERS
// ======================================================

const normalizePath = (path = "") => {
  if (!path) return "/";

  const cleanPath = path.split("?")[0].split("#")[0];

  if (cleanPath.length > 1) {
    return cleanPath.replace(/\/+$/, "");
  }

  return cleanPath;
};

const isActivePath = (currentPath, targetPath, exact = false) => {
  const current = normalizePath(currentPath);
  const target = normalizePath(targetPath);

  if (!target) return false;

  if (exact) {
    return current === target;
  }

  return current === target || current.startsWith(`${target}/`);
};

// ======================================================
// HIDE CONTEXT SIDEBAR
// ======================================================

const shouldHideContextSidebar = (pathname = "") => {
  const path = normalizePath(pathname);

  if (path === "/marketing/automation/create") {
    return true;
  }

  const automationEditPattern =
    /^\/marketing\/automation\/[^/]+\/edit$/;

  return automationEditPattern.test(path);
};

// ======================================================
// THEME CLASS HELPERS
// ======================================================

const getThemeClasses = (active = false) => {
  if (active) {
    return "theme-sidebar-active";
  }

  return "theme-sidebar-item";
};

// ======================================================
// CONTEXT SIDEBAR
// ======================================================

const ContextSidebar = ({
  module,
  collapsed = false,
  onCollapse,
}) => {
  const { t } = useTranslation();
  const location = useLocation();

  const [expandedMenus, setExpandedMenus] = useState({});

  // ====================================================
  // HIDE SIDEBAR ON CREATE / EDIT
  // ====================================================

  const hideContextSidebar = shouldHideContextSidebar(
    location.pathname
  );

  // ====================================================
  // NORMALIZE MODULE
  // ====================================================

  const normalizedModule =
    module === "content" || module === "distribution"
      ? "business"
      : module;

  // ====================================================
  // GET CONFIG
  // ====================================================

  const config =
    contextNavigation?.[normalizedModule] ||
    contextNavigation?.business;

  // ====================================================
  // ROOT ROUTES
  // ====================================================

  const rootRoutes = [
    "/business",
    "/products",
    "/categories",
    "/inventory",
    "/sales",
    "/orders",
    "/payments",
    "/invoices",
    "/refunds",
    "/crm",
    "/leads",
    "/contacts",
    "/customers",
    "/marketing",
    "/team",
    "/staff",
    "/reports",
    "/settings",
    "/website",
    "/forms",
    "/integrations",
    "/inbox",
  ];

  // ====================================================
  // TRANSLATED TITLE
  // ====================================================

  const translatedTitle = config?.translationKey
    ? t(config.translationKey, {
        defaultValue: config.title || "Management",
      })
    : config?.title || "Management";

  // ====================================================
  // ITEMS
  // ====================================================

  const items = Array.isArray(config?.items)
    ? config.items
    : [];

  // ====================================================
  // CHECK CHILD ACTIVE
  // ====================================================

  const hasActiveChild = (item) => {
    if (
      !Array.isArray(item.children) ||
      item.children.length === 0
    ) {
      return false;
    }

    return item.children.some((child) =>
      isActivePath(location.pathname, child.path, true)
    );
  };

  // ====================================================
  // CHECK PARENT ACTIVE
  // ====================================================

  const isParentActive = (item) => {
    if (hasActiveChild(item)) {
      return true;
    }

    if (!item.path) {
      return false;
    }

    const hasChildren =
      Array.isArray(item.children) &&
      item.children.length > 0;

    if (hasChildren) {
      return isActivePath(
        location.pathname,
        item.path,
        true
      );
    }

    return isActivePath(
      location.pathname,
      item.path,
      rootRoutes.includes(item.path)
    );
  };

  // ====================================================
  // AUTO EXPAND ACTIVE MENU
  // ====================================================

  useEffect(() => {
    const activeParents = {};

    items.forEach((item) => {
      if (
        Array.isArray(item.children) &&
        item.children.length > 0 &&
        hasActiveChild(item)
      ) {
        activeParents[item.path] = true;
      }
    });

    if (Object.keys(activeParents).length > 0) {
      setExpandedMenus((prev) => ({
        ...prev,
        ...activeParents,
      }));
    }
  }, [location.pathname, normalizedModule]);

  // ====================================================
  // TOGGLE MENU
  // ====================================================

  const toggleMenu = (path) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // ====================================================
  // HIDE SIDEBAR
  // ====================================================

  if (hideContextSidebar || !config) {
    return null;
  }

  // ====================================================
  // COLLAPSED SIDEBAR
  // ====================================================

  if (collapsed) {
    return (
      <aside
        className="
          theme-context-sidebar
          fixed inset-y-0 z-40
          flex w-12 flex-col items-center
          border-r
          shadow-[2px_0_10px_rgba(15,23,42,0.04)]
        "
        style={{
          left: MAIN_SIDEBAR_WIDTH,
        }}
      >
        {/* HEADER */}

        <div
          className="
            theme-sidebar-divider
            flex h-16 w-full shrink-0
            items-center justify-center
            border-b
          "
        >
          <button
            type="button"
            onClick={onCollapse}
            title="Expand menu"
            aria-label="Expand menu"
            className="
              theme-sidebar-icon-button
              flex h-8 w-8 items-center justify-center
              rounded-lg transition
            "
          >
            <ChevronRight size={17} strokeWidth={2} />
          </button>
        </div>

        {/* ACTIVE INDICATOR */}

        <div className="mt-4">
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: "var(--theme-primary)",
            }}
          />
        </div>
      </aside>
    );
  }

  // ====================================================
  // NORMAL SIDEBAR
  // ====================================================

  return (
    <aside
      className="
        theme-context-sidebar
        fixed inset-y-0 z-40
        flex flex-col
        border-r
        shadow-[2px_0_12px_rgba(15,23,42,0.04)]
      "
      style={{
        left: MAIN_SIDEBAR_WIDTH,
        width: CONTEXT_SIDEBAR_WIDTH,
      }}
    >
      {/* =================================================
          HEADER
      ================================================== */}

      <div
        className="
          theme-sidebar-divider
          flex h-16 shrink-0 items-center
          justify-between
          border-b
          px-4
        "
      >
        <div className="min-w-0">
          <h2 className="theme-sidebar-heading truncate text-sm font-bold tracking-tight">
            {translatedTitle}
          </h2>

          <p className="theme-sidebar-muted mt-0.5 text-[10px] font-semibold uppercase tracking-wider">
            {t("common.management", {
              defaultValue: "Management",
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={onCollapse}
          title="Collapse menu"
          aria-label="Collapse menu"
          className="
            theme-sidebar-icon-button
            flex h-8 w-8 shrink-0 items-center
            justify-center rounded-lg transition
          "
        >
          <ChevronLeft size={17} strokeWidth={2} />
        </button>
      </div>

      {/* =================================================
          NAVIGATION
      ================================================== */}

      <nav
        className="
          context-sidebar-scroll
          flex-1 overflow-y-auto
          px-3 py-4
        "
        aria-label={`${translatedTitle} navigation`}
      >
        {/* SECTION TITLE */}

        <div
          className="
            theme-sidebar-muted
            mb-2 px-3
            text-[10px] font-bold
            uppercase tracking-[0.12em]
          "
        >
          {t("common.workspace", {
            defaultValue: "Workspace",
          })}
        </div>

        {/* MENU ITEMS */}

        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;

            const hasChildren =
              Array.isArray(item.children) &&
              item.children.length > 0;

            const parentActive = isParentActive(item);

            const isExpanded = !!expandedMenus[item.path];

            const translatedLabel = item.translationKey
              ? t(item.translationKey, {
                  defaultValue: item.label,
                })
              : item.label;

            // ==================================================
            // PARENT WITH CHILDREN
            // ==================================================

            if (hasChildren) {
              return (
                <div
                  key={item.path || item.label}
                  className="w-full"
                >
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.path)}
                    aria-expanded={isExpanded}
                    className={`
                      ${getThemeClasses(parentActive)}
                      group relative flex min-h-[40px]
                      w-full items-center gap-3
                      rounded-xl px-3 py-2
                      text-left text-xs font-semibold
                      transition-all duration-200
                    `}
                  >
                    {/* ACTIVE INDICATOR */}

                    {parentActive && (
                      <span
                        className="
                          theme-sidebar-indicator
                          absolute left-0 top-1/2
                          h-6 w-[3px]
                          -translate-y-1/2
                          rounded-r-full
                        "
                      />
                    )}

                    {/* ICON */}

                    {Icon && (
                      <span
                        className={`
                          ${parentActive
                            ? "theme-sidebar-icon-active"
                            : "theme-sidebar-icon"
                          }
                          flex h-8 w-8 shrink-0
                          items-center justify-center
                          rounded-lg transition-all
                        `}
                      >
                        <Icon
                          size={17}
                          strokeWidth={parentActive ? 2.3 : 2}
                        />
                      </span>
                    )}

                    {/* LABEL */}

                    <span className="min-w-0 flex-1 truncate">
                      {translatedLabel}
                    </span>

                    {/* ARROW */}

                    <ChevronDown
                      size={15}
                      strokeWidth={2}
                      className={`
                        theme-sidebar-muted
                        shrink-0
                        transition-transform duration-200
                        ${isExpanded ? "rotate-180" : ""}
                      `}
                    />
                  </button>

                  {/* CHILDREN */}

                  {isExpanded && (
                    <div
                      className="
                        theme-sidebar-child-border
                        ml-5 mt-1 space-y-1
                        border-l pl-3
                      "
                    >
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;

                        const childActive = isActivePath(
                          location.pathname,
                          child.path,
                          true
                        );

                        const childLabel = child.translationKey
                          ? t(child.translationKey, {
                              defaultValue: child.label,
                            })
                          : child.label;

                        return (
                          <NavLink
                            key={child.path || child.label}
                            to={child.path}
                            end
                            className={() => `
                              ${getThemeClasses(childActive)}
                              group relative flex min-h-[36px]
                              w-full items-center gap-2.5
                              rounded-lg px-3 py-2
                              text-[11px] font-medium
                              transition-all duration-200
                            `}
                          >
                            {/* ACTIVE LINE */}

                            {childActive && (
                              <span
                                className="
                                  theme-sidebar-indicator
                                  absolute -left-[16px]
                                  top-1/2 h-5 w-[3px]
                                  -translate-y-1/2
                                  rounded-r-full
                                "
                              />
                            )}

                            {/* ICON */}

                            {ChildIcon && (
                              <span
                                className={`
                                  ${childActive
                                    ? "theme-sidebar-icon-active"
                                    : "theme-sidebar-icon"
                                  }
                                  flex h-6 w-6 shrink-0
                                  items-center justify-center
                                `}
                              >
                                <ChildIcon
                                  size={15}
                                  strokeWidth={childActive ? 2.3 : 2}
                                />
                              </span>
                            )}

                            {/* LABEL */}

                            <span className="min-w-0 flex-1 truncate">
                              {childLabel}
                            </span>

                            {childActive && (
                              <ChevronRight
                                size={13}
                                className="theme-sidebar-indicator-text shrink-0"
                              />
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // ==================================================
            // NORMAL MENU ITEM
            // ==================================================

            const isRootRoute = rootRoutes.includes(item.path);

            return (
              <NavLink
                key={item.path || item.label}
                to={item.path}
                end={isRootRoute}
                className={({ isActive }) => `
                  ${getThemeClasses(isActive)}
                  group relative flex min-h-[40px]
                  w-full items-center gap-3
                  rounded-xl px-3 py-2
                  text-xs font-semibold
                  transition-all duration-200
                `}
              >
                {({ isActive }) => (
                  <>
                    {/* ACTIVE INDICATOR */}

                    {isActive && (
                      <span
                        className="
                          theme-sidebar-indicator
                          absolute left-0 top-1/2
                          h-6 w-[3px]
                          -translate-y-1/2
                          rounded-r-full
                        "
                      />
                    )}

                    {/* ICON */}

                    {Icon && (
                      <span
                        className={`
                          ${isActive
                            ? "theme-sidebar-icon-active"
                            : "theme-sidebar-icon"
                          }
                          flex h-8 w-8 shrink-0
                          items-center justify-center
                          rounded-lg
                        `}
                      >
                        <Icon
                          size={17}
                          strokeWidth={isActive ? 2.3 : 2}
                        />
                      </span>
                    )}

                    {/* LABEL */}

                    <span className="min-w-0 flex-1 truncate">
                      {translatedLabel}
                    </span>

                    {/* ARROW */}

                    <ChevronRight
                      size={14}
                      className={`
                        shrink-0 transition-all duration-200

                        ${
                          isActive
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }
                        ${
                          isActive
                            ? "theme-sidebar-indicator-text"
                            : "theme-sidebar-muted"
                        }
                      `}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* =================================================
          BOTTOM WORKSPACE
      ================================================== */}

      <div className="theme-sidebar-divider shrink-0 border-t px-3 py-3">
        <div className="theme-sidebar-card rounded-xl border px-3 py-2.5">
          <p className="theme-sidebar-heading text-[10px] font-bold">
            Brielix Workspace
          </p>

          <p className="theme-sidebar-muted mt-0.5 text-[9px] font-medium">
            {t("common.businessManagement", {
              defaultValue: "Business management",
            })}
          </p>
        </div>
      </div>

      {/* =================================================
          CUSTOM SCROLLBAR
      ================================================== */}

      <style>{`
        .context-sidebar-scroll::-webkit-scrollbar {
          width: 3px;
        }

        .context-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .context-sidebar-scroll::-webkit-scrollbar-thumb {
          background: var(--app-border);
          border-radius: 999px;
        }

        .context-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--app-muted);
        }
      `}</style>
    </aside>
  );
};

export default ContextSidebar;
