import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import ContextSidebar from "../components/layout/ContextSidebar";
import Header from "../components/layout/Header";

// ======================================================
// LAYOUT CONSTANTS
// ======================================================

const PRIMARY_SIDEBAR_WIDTH = 80;
const CONTEXT_SIDEBAR_WIDTH = 240;

const FULL_SIDEBAR_WIDTH = PRIMARY_SIDEBAR_WIDTH + CONTEXT_SIDEBAR_WIDTH;

// ======================================================
// NORMALIZE PATH
// ======================================================

const normalizePath = (pathname = "") => {
  if (!pathname) return "/";

  const cleanPath = pathname.split("?")[0].split("#")[0];

  if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
    return cleanPath.slice(0, -1);
  }

  return cleanPath;
};

// ======================================================
// GET MODULE FROM PATH
// ======================================================

const getModuleFromPath = (pathname = "") => {
  const path = normalizePath(pathname);

  // ====================================================
  // BUSINESS
  // ====================================================

  if (
    path === "/business" ||
    path.startsWith("/business/") ||
    path === "/website" ||
    path.startsWith("/website/") ||
    path === "/integrations" ||
    path.startsWith("/integrations/") ||
    path === "/forms" ||
    path.startsWith("/forms/") ||
    path === "/content" ||
    path.startsWith("/content/") ||
    path === "/distribution" ||
    path.startsWith("/distribution/")
  ) {
    return "business";
  }

  // ====================================================
  // CATALOG
  // ====================================================

  if (
    path === "/products" ||
    path.startsWith("/products/") ||
    path === "/categories" ||
    path.startsWith("/categories/") ||
    path === "/inventory" ||
    path.startsWith("/inventory/")
  ) {
    return "catalog";
  }

  // ====================================================
  // SALES
  // ====================================================

  if (
    path === "/sales" ||
    path.startsWith("/sales/") ||
    path === "/orders" ||
    path.startsWith("/orders/") ||
    path === "/payments" ||
    path.startsWith("/payments/") ||
    path === "/invoices" ||
    path.startsWith("/invoices/") ||
    path === "/refunds" ||
    path.startsWith("/refunds/")
  ) {
    return "sales";
  }

  // ====================================================
  // CRM
  // ====================================================

  if (
    path === "/crm" ||
    path.startsWith("/crm/") ||
    path === "/leads" ||
    path.startsWith("/leads/") ||
    path === "/contacts" ||
    path.startsWith("/contacts/") ||
    path === "/customers" ||
    path.startsWith("/customers/")
  ) {
    return "crm";
  }

  // ====================================================
  // MARKETING
  // ====================================================

  if (path === "/marketing" || path.startsWith("/marketing/")) {
    return "marketing";
  }

  // ====================================================
  // INBOX
  // ====================================================

 
  // ====================================================
  // TEAM
  // ====================================================

  if (
    path === "/team" ||
    path.startsWith("/team/") ||
    path === "/staff" ||
    path.startsWith("/staff/")
  ) {
    return "team";
  }

  // ====================================================
  // REPORTS
  // ====================================================

  if (
    path === "/reports" ||
    path.startsWith("/reports/") ||
    path === "/report" ||
    path.startsWith("/report/")
  ) {
    return "reports";
  }

  // ====================================================
  // SETTINGS
  // ====================================================

  if (path === "/settings" || path.startsWith("/settings/")) {
    return "settings";
  }

  // ====================================================
  // DASHBOARD
  // ====================================================

  if (path === "/dashboard" || path.startsWith("/dashboard/")) {
    return "dashboard";
  }

  return "dashboard";
};

// ======================================================
// AUTOMATION EDITOR ROUTES
// ======================================================

const isAutomationEditorRoute = (pathname = "") => {
  const path = normalizePath(pathname);

  // Create Automation
  if (path === "/marketing/automation/create") {
    return true;
  }

  // Edit Automation
  //
  // Example:
  // /marketing/automation/123/edit
  // /marketing/automation/abc123/edit
  //
  const automationEditPattern = /^\/marketing\/automation\/[^/]+\/edit$/;

  if (automationEditPattern.test(path)) {
    return true;
  }

  return false;
};

// ======================================================
// ADMIN LAYOUT
// ======================================================

const AdminLayout = () => {
  const location = useLocation();

  // ====================================================
  // ACTIVE MODULE
  // ====================================================

  const [activeModule, setActiveModule] = useState(() =>
    getModuleFromPath(location.pathname),
  );

  // ====================================================
  // CONTEXT SIDEBAR COLLAPSED
  // ====================================================

  const [contextCollapsed, setContextCollapsed] = useState(false);

  // ====================================================
  // UPDATE MODULE WHEN URL CHANGES
  // ====================================================

  useEffect(() => {
    const module = getModuleFromPath(location.pathname);

    setActiveModule(module);
  }, [location.pathname]);

  // ====================================================
  // MODULE CHANGE
  // ====================================================

  const handleModuleChange = (module) => {
    setActiveModule(module);

    // New module open hone par
    // Context Sidebar automatically expand
    setContextCollapsed(false);
  };

  // ====================================================
  // CHECK AUTOMATION CREATE / EDIT
  // ====================================================

  const hideContextSidebar = isAutomationEditorRoute(location.pathname);

  // ====================================================
  // SHOW CONTEXT SIDEBAR
  // ====================================================

  const showContextSidebar =
    activeModule !== "dashboard" && !hideContextSidebar;

  // ====================================================
  // CONTENT LEFT OFFSET
  // ====================================================

  let contentLeft = PRIMARY_SIDEBAR_WIDTH;

  if (showContextSidebar) {
    if (contextCollapsed) {
      contentLeft = PRIMARY_SIDEBAR_WIDTH;
    } else {
      contentLeft = FULL_SIDEBAR_WIDTH;
    }
  }

  // ====================================================
  // AUTOMATION EDITOR
  // ====================================================
  //
  // Create/Edit page:
  //
  // Main Sidebar = 80px
  // Context Sidebar = hidden
  // Content starts after 80px
  //
  // Normal page:
  //
  // Main Sidebar = 80px
  // Context Sidebar = 240px
  // Content starts after 320px
  //
  // ====================================================

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ==================================================
          PRIMARY SIDEBAR
      ================================================== */}

      <Sidebar onModuleChange={handleModuleChange} />

      {/* ==================================================
          CONTEXT SIDEBAR
      ================================================== */}

      {showContextSidebar && (
        <ContextSidebar
          module={activeModule}
          collapsed={contextCollapsed}
          onCollapse={() => setContextCollapsed(true)}
        />
      )}

      {/* ==================================================
          MAIN APPLICATION
      ================================================== */}

      <div
        className="
          min-h-screen
          transition-[margin-left]
          duration-300
          ease-out
        "
        style={{
          marginLeft: `${contentLeft}px`,
        }}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <header
          className="
            sticky
            top-0
            z-40
            h-16
            border-b
            border-slate-200/80
            bg-white/90
            backdrop-blur-xl
          "
        >
          <Header />
        </header>

        {/* ==================================================
            PAGE CONTENT
        ================================================== */}

        <main
          className="
            min-h-[calc(100vh-64px)]
            bg-slate-50
          "
        >
          <div
            className="
              min-h-[calc(100vh-64px)]
              min-w-0
            "
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* ==================================================
          REOPEN CONTEXT SIDEBAR
      ================================================== */}

      {showContextSidebar && contextCollapsed && (
        <button
          type="button"
          onClick={() => setContextCollapsed(false)}
          title="Open menu"
          aria-label="Open context menu"
          className="
            fixed
            left-[68px]
            top-1/2
            z-[60]
            flex
            h-10
            w-7
            -translate-y-1/2
            items-center
            justify-center
            rounded-r-xl
            border
            border-l-0
            border-slate-200
            bg-white
            text-slate-500
            shadow-[0_4px_15px_rgba(15,23,42,0.12)]
            transition-all
            duration-200
            hover:w-8
            hover:bg-slate-50
            hover:text-slate-900
          "
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
};

export default AdminLayout;
