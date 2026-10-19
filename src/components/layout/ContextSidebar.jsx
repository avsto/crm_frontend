import React, { useEffect, useState } from "react";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  NavLink,
  useLocation,
} from "react-router-dom";

import { useTranslation } from "react-i18next";

import {
  contextNavigation,
} from "../../config/navigation";

// ======================================================
// CONSTANTS
// ======================================================

const MAIN_SIDEBAR_WIDTH = "80px";
const CONTEXT_SIDEBAR_WIDTH = "240px";

// ======================================================
// HELPERS
// ======================================================

const normalizePath = (path = "") => {
  if (!path) return "/";

  const cleanPath = path
    .split("?")[0]
    .split("#")[0];

  if (cleanPath.length > 1) {
    return cleanPath.replace(/\/+$/, "");
  }

  return cleanPath;
};

const isActivePath = (
  currentPath,
  targetPath,
  exact = false
) => {
  const current = normalizePath(currentPath);
  const target = normalizePath(targetPath);

  if (!target) return false;

  if (exact) {
    return current === target;
  }

  return (
    current === target ||
    current.startsWith(`${target}/`)
  );
};

// ======================================================
// HIDE CONTEXT SIDEBAR ON FULL SCREEN PAGES
// ======================================================

const shouldHideContextSidebar = (pathname = "") => {
  const path = normalizePath(pathname);

  // --------------------------------------------
  // Automation Create
  // /marketing/automation/create
  // --------------------------------------------

  if (
    path === "/marketing/automation/create"
  ) {
    return true;
  }

  // --------------------------------------------
  // Automation Edit
  // /marketing/automation/:id/edit
  // --------------------------------------------

  const automationEditPattern =
    /^\/marketing\/automation\/[^/]+\/edit$/;

  if (
    automationEditPattern.test(path)
  ) {
    return true;
  }

  return false;
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

  const [expandedMenus, setExpandedMenus] =
    useState({});

  // ====================================================
  // HIDE SIDEBAR ON CREATE / EDIT
  // ====================================================

  const hideContextSidebar =
    shouldHideContextSidebar(
      location.pathname
    );

  if (hideContextSidebar) {
    return null;
  }

  // ====================================================
  // NORMALIZE MODULE
  // ====================================================

  const normalizedModule =
    module === "content" ||
    module === "distribution"
      ? "business"
      : module;

  // ====================================================
  // GET CONFIG
  // ====================================================

  const config =
    contextNavigation?.[normalizedModule] ||
    contextNavigation?.business;

  // ====================================================
  // SAFETY FALLBACK
  // ====================================================

  if (!config) {
    return null;
  }

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

  const translatedTitle = config.translationKey
    ? t(config.translationKey, {
        defaultValue:
          config.title || "Management",
      })
    : config.title || "Management";

  // ====================================================
  // ITEMS
  // ====================================================

  const items = Array.isArray(config.items)
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
      isActivePath(
        location.pathname,
        child.path,
        true
      )
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

    if (
      Object.keys(activeParents).length > 0
    ) {
      setExpandedMenus((prev) => ({
        ...prev,
        ...activeParents,
      }));
    }
  }, [location.pathname]);

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
  // COLLAPSED SIDEBAR
  // ====================================================

  if (collapsed) {
    return (
      <aside
        className="
          fixed
          inset-y-0
          z-40
          flex
          w-12
          flex-col
          items-center
          border-r
          border-slate-200
          bg-white
          shadow-[2px_0_10px_rgba(15,23,42,0.04)]
        "
        style={{
          left: MAIN_SIDEBAR_WIDTH,
        }}
      >
        {/* Header */}

        <div
          className="
            flex
            h-16
            w-full
            shrink-0
            items-center
            justify-center
            border-b
            border-slate-200
          "
        >
          <button
            type="button"
            onClick={onCollapse}
            title="Expand menu"
            aria-label="Expand menu"
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            <ChevronRight
              size={17}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Indicator */}

        <div className="mt-4">
          <div
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-blue-600
            "
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
        fixed
        inset-y-0
        z-40
        flex
        flex-col
        border-r
        border-slate-200
        bg-white
        shadow-[2px_0_12px_rgba(15,23,42,0.04)]
      "
      style={{
        left: MAIN_SIDEBAR_WIDTH,
        width: CONTEXT_SIDEBAR_WIDTH,
      }}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="
          flex
          h-16
          shrink-0
          items-center
          justify-between
          border-b
          border-slate-200
          px-4
        "
      >
        <div className="min-w-0">
          <h2
            className="
              truncate
              text-[14px]
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            {translatedTitle}
          </h2>

          <p
            className="
              mt-0.5
              text-[10px]
              font-medium
              uppercase
              tracking-wider
              text-slate-400
            "
          >
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
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-slate-800
          "
        >
          <ChevronLeft
            size={17}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* ==================================================
          NAVIGATION
      ================================================== */}

      <nav
        className="
          context-sidebar-scroll
          flex-1
          overflow-y-auto
          px-3
          py-4
        "
        aria-label={`${translatedTitle} navigation`}
      >
        {/* Section */}

        <div
          className="
            mb-2
            px-3
            text-[9px]
            font-bold
            uppercase
            tracking-[0.12em]
            text-slate-400
          "
        >
          {t("common.workspace", {
            defaultValue: "Workspace",
          })}
        </div>

        {/* Menu */}

        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;

            const hasChildren =
              Array.isArray(item.children) &&
              item.children.length > 0;

            const parentActive =
              isParentActive(item);

            const isExpanded =
              !!expandedMenus[item.path];

            const translatedLabel =
              item.translationKey
                ? t(item.translationKey, {
                    defaultValue:
                      item.label,
                  })
                : item.label;

            // ==================================================
            // PARENT WITH CHILDREN
            // ==================================================

            if (hasChildren) {
              return (
                <div
                  key={
                    item.path || item.label
                  }
                  className="w-full"
                >
                  {/* Parent Button */}

                  <button
                    type="button"
                    onClick={() =>
                      toggleMenu(item.path)
                    }
                    className={`
                      group
                      relative
                      flex
                      min-h-[42px]
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      font-medium
                      transition-all
                      duration-200

                      ${
                        parentActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                  >
                    {/* Active indicator */}

                    {parentActive && (
                      <span
                        className="
                          absolute
                          left-0
                          top-1/2
                          h-6
                          w-[3px]
                          -translate-y-1/2
                          rounded-r-full
                          bg-blue-600
                        "
                      />
                    )}

                    {/* Icon */}

                    {Icon && (
                      <span
                        className={`
                          flex
                          h-7
                          w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg

                          ${
                            parentActive
                              ? "bg-blue-100 text-blue-600"
                              : "text-slate-400 group-hover:text-slate-700"
                          }
                        `}
                      >
                        <Icon
                          size={17}
                          strokeWidth={
                            parentActive
                              ? 2.4
                              : 2
                          }
                        />
                      </span>
                    )}

                    {/* Text */}

                    <span
                      className="
                        min-w-0
                        flex-1
                        truncate
                        text-left
                      "
                    >
                      {translatedLabel}
                    </span>

                    {/* Arrow */}

                    <ChevronDown
                      size={16}
                      strokeWidth={2}
                      className={`
                        shrink-0
                        text-slate-400
                        transition-transform
                        duration-200

                        ${
                          isExpanded
                            ? "rotate-180"
                            : "rotate-0"
                        }
                      `}
                    />
                  </button>

                  {/* ==================================================
                      CHILDREN
                  ================================================== */}

                  {isExpanded && (
                    <div
                      className="
                        ml-5
                        mt-1
                        space-y-1
                        border-l
                        border-slate-200
                        pl-3
                      "
                    >
                      {item.children.map(
                        (child) => {
                          const ChildIcon =
                            child.icon;

                          const childActive =
                            isActivePath(
                              location.pathname,
                              child.path,
                              true
                            );

                          const childLabel =
                            child.translationKey
                              ? t(
                                  child.translationKey,
                                  {
                                    defaultValue:
                                      child.label,
                                  }
                                )
                              : child.label;

                          return (
                            <NavLink
                              key={
                                child.path ||
                                child.label
                              }
                              to={child.path}
                              end
                              className={`
                                group
                                relative
                                flex
                                min-h-[38px]
                                w-full
                                items-center
                                gap-2.5
                                rounded-lg
                                px-3
                                py-2
                                text-[13px]
                                font-medium
                                transition-all
                                duration-200

                                ${
                                  childActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }
                              `}
                            >
                              {/* Child active line */}

                              {childActive && (
                                <span
                                  className="
                                    absolute
                                    -left-[16px]
                                    top-1/2
                                    h-5
                                    w-[3px]
                                    -translate-y-1/2
                                    rounded-r-full
                                    bg-blue-600
                                  "
                                />
                              )}

                              {/* Child icon */}

                              {ChildIcon && (
                                <span
                                  className={`
                                    flex
                                    h-6
                                    w-6
                                    shrink-0
                                    items-center
                                    justify-center

                                    ${
                                      childActive
                                        ? "text-blue-600"
                                        : "text-slate-400 group-hover:text-slate-700"
                                    }
                                  `}
                                >
                                  <ChildIcon
                                    size={15}
                                    strokeWidth={
                                      childActive
                                        ? 2.3
                                        : 2
                                    }
                                  />
                                </span>
                              )}

                              {/* Child text */}

                              <span
                                className="
                                  min-w-0
                                  flex-1
                                  truncate
                                "
                              >
                                {childLabel}
                              </span>

                              {/* Active arrow */}

                              {childActive && (
                                <ChevronRight
                                  size={13}
                                  strokeWidth={2.2}
                                  className="
                                    shrink-0
                                    text-blue-500
                                  "
                                />
                              )}
                            </NavLink>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              );
            }

            // ==================================================
            // NORMAL MENU ITEM
            // ==================================================

            const isRootRoute =
              rootRoutes.includes(
                item.path
              );

            return (
              <NavLink
                key={
                  item.path || item.label
                }
                to={item.path}
                end={isRootRoute}
                className={({ isActive }) => `
                  group
                  relative
                  flex
                  min-h-[42px]
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  transition-all
                  duration-200

                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}

                    {isActive && (
                      <span
                        className="
                          absolute
                          left-0
                          top-1/2
                          h-6
                          w-[3px]
                          -translate-y-1/2
                          rounded-r-full
                          bg-blue-600
                        "
                      />
                    )}

                    {/* Icon */}

                    {Icon && (
                      <span
                        className={`
                          flex
                          h-7
                          w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg

                          ${
                            isActive
                              ? "bg-blue-100 text-blue-600"
                              : "text-slate-400 group-hover:text-slate-700"
                          }
                        `}
                      >
                        <Icon
                          size={17}
                          strokeWidth={
                            isActive
                              ? 2.4
                              : 2
                          }
                        />
                      </span>
                    )}

                    {/* Text */}

                    <span
                      className="
                        min-w-0
                        flex-1
                        truncate
                      "
                    >
                      {translatedLabel}
                    </span>

                    {/* Arrow */}

                    <ChevronRight
                      size={15}
                      strokeWidth={2}
                      className={`
                        shrink-0
                        transition-all
                        duration-200

                        ${
                          isActive
                            ? "translate-x-0 text-blue-500 opacity-100"
                            : "-translate-x-1 text-slate-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
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

      {/* ==================================================
          BOTTOM
      ================================================== */}

      <div
        className="
          shrink-0
          border-t
          border-slate-200
          px-4
          py-3
        "
      >
        <div
          className="
            rounded-xl
            bg-slate-50
            px-3
            py-2.5
          "
        >
          <p className="text-[10px] font-semibold text-slate-600">
            Brielix Workspace
          </p>

          <p className="mt-0.5 text-[9px] text-slate-400">
            {t(
              "common.businessManagement",
              {
                defaultValue:
                  "Business management",
              }
            )}
          </p>
        </div>
      </div>

      {/* ==================================================
          CUSTOM SCROLLBAR
      ================================================== */}

      <style>
        {`
          .context-sidebar-scroll::-webkit-scrollbar {
            width: 3px;
          }

          .context-sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .context-sidebar-scroll::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 999px;
          }

          .context-sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
          }
        `}
      </style>
    </aside>
  );
};

export default ContextSidebar;