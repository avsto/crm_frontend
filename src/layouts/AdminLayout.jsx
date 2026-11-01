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
const CONTEXT_SIDEBAR_WIDTH = 220;

const FULL_SIDEBAR_WIDTH =
  PRIMARY_SIDEBAR_WIDTH + CONTEXT_SIDEBAR_WIDTH;

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

  const routes = {
    business: [
      "/business",
      "/website",
      "/integrations",
      "/forms",
      "/content",
      "/distribution",
    ],

    catalog: ["/products", "/categories", "/inventory"],

    sales: ["/sales", "/orders", "/payments", "/invoices", "/refunds"],

    crm: ["/crm", "/leads", "/contacts", "/customers"],

    marketing: ["/marketing"],

    team: ["/team", "/staff"],

    reports: ["/reports", "/report"],

    settings: ["/settings"],

    dashboard: ["/dashboard"],
  };

  for (const [module, prefixes] of Object.entries(routes)) {
    const matched = prefixes.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`)
    );

    if (matched) return module;
  }

  return "dashboard";
};

// ======================================================
// AUTOMATION EDITOR ROUTES
// ======================================================

const isAutomationEditorRoute = (pathname = "") => {
  const path = normalizePath(pathname);

  // Create automation
  if (path === "/marketing/automation/create") {
    return true;
  }

  // Edit automation:
  // /marketing/automation/123/edit
  // /marketing/automation/abc123/edit

  const automationEditPattern =
    /^\/marketing\/automation\/[^/]+\/edit$/;

  return automationEditPattern.test(path);
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
    getModuleFromPath(location.pathname)
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
    setContextCollapsed(false);
  };

  // ====================================================
  // CHECK AUTOMATION CREATE / EDIT
  // ====================================================

  const hideContextSidebar = isAutomationEditorRoute(
    location.pathname
  );

  // ====================================================
  // SHOW CONTEXT SIDEBAR
  // ====================================================

  const showContextSidebar =
    activeModule !== "dashboard" && !hideContextSidebar;

  // ====================================================
  // CONTENT LEFT OFFSET
  // ====================================================

  let contentLeft = PRIMARY_SIDEBAR_WIDTH;

  if (showContextSidebar && !contextCollapsed) {
    contentLeft = FULL_SIDEBAR_WIDTH;
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="brielix-admin-layout min-h-screen">

      {/* PRIMARY SIDEBAR */}

      <Sidebar onModuleChange={handleModuleChange} />

      {/* CONTEXT SIDEBAR */}

      {showContextSidebar && (
        <ContextSidebar
          module={activeModule}
          collapsed={contextCollapsed}
          onCollapse={() => setContextCollapsed(true)}
        />
      )}

      {/* MAIN APPLICATION */}

      <div
        className="brielix-main-content min-h-screen min-w-0 transition-[margin-left] duration-300 ease-out"
        style={{
          marginLeft: `${contentLeft}px`,
        }}
      >

        {/* HEADER */}

        <header className="brielix-main-header sticky top-0 z-40 h-16 border-b backdrop-blur-xl">
          <Header />
        </header>

        {/* PAGE CONTENT */}

        <main className="brielix-page-content min-h-[calc(100vh-64px)]">
          <div className="min-h-[calc(100vh-64px)] min-w-0">
            <Outlet />
          </div>
        </main>
      </div>

      {/* REOPEN CONTEXT SIDEBAR */}

      {showContextSidebar && contextCollapsed && (
        <button
          type="button"
          onClick={() => setContextCollapsed(false)}
          title="Open menu"
          aria-label="Open context menu"
          className="brielix-sidebar-reopen fixed left-[68px] top-1/2 z-[60] flex h-10 w-7 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 shadow-md transition-all duration-200 hover:w-8"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      )}

      {/* THEME STYLES */}

      <style>{`
        .brielix-admin-layout {
          background: var(--app-bg);
          color: var(--app-body);
        }

        .brielix-main-content {
          background: var(--app-bg);
        }

        .brielix-main-header {
          background: var(--app-surface);
          border-color: var(--app-border);
        }

        .brielix-page-content {
          background: var(--app-bg);
          color: var(--app-body);
        }

        .brielix-sidebar-reopen {
          background: var(--app-surface);
          border-color: var(--app-border);
          color: var(--app-muted);
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.12);
        }

        .brielix-sidebar-reopen:hover {
          color: var(--theme-primary);
          background: var(--theme-primary-soft);
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
