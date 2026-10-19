// src/routes/AppRoutes.jsx

import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

// ======================================================
// AUTH PAGES
// ======================================================

import AuthLayout from "../pages/auth/AuthLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";

// ======================================================
// LAYOUT
// ======================================================

import AdminLayout from "../layouts/AdminLayout";

// ======================================================
// AUTH CONTEXT
// ======================================================

import { useAuth } from "../context/AuthContext";

// ======================================================
// BUSINESS
// ======================================================

import Business from "../pages/business/Business";
import BusinessProfile from "../pages/business/BusinessProfile";

// ======================================================
// PRODUCTS & INVENTORY
// ======================================================

import Products from "../pages/products/Products";
import CreateProduct from "../pages/products/CreateProduct";
import EditProduct from "../pages/products/EditProduct";
import ImportProducts from "../pages/products/ImportProducts";


import Inventory from "../pages/inventory/Inventory";

// ======================================================
// ORDERS
// ======================================================

import Orders from "../pages/orders/Orders";
import CreateOrder from "../pages/orders/CreateOrder";
import OrderDetails from "../pages/orders/OrderDetails";
import Customers from "../pages/crm/Customers";

// ======================================================
// CRM
// ======================================================

import Lead from "../pages/crm/Lead";
import LeadCreate from "../pages/crm/LeadCreate";
import LeadEdit from "../pages/crm/LeadEdit";
import Opportunity from "../pages/crm/Opportunity";
import Tag from "../pages/crm/Tag";
import Deal from "../pages/crm/Deal";

// ======================================================
// INBOX
// ======================================================

import Inbox from "../pages/inbox/Inbox";

// ======================================================
// WEBSITE
// ======================================================

import Website from "../pages/website/Website";
import CreateWebsite from "../pages/website/CreateWebsite";
import WebsiteOverview from "../pages/website/WebsiteOverview";
import WebsitePages from "../pages/website/WebsitePages";
import WebsiteTheme from "../pages/website/WebsiteTheme";
import WebsiteDomain from "../pages/website/WebsiteDomain";
import WebsiteNavigation from "../pages/website/WebsiteNavigation";
import WebsiteSEO from "../pages/website/WebsiteSEO";
import WebsiteSettings from "../pages/website/WebsiteSettings";

import WebsitePreview from "../pages/website/WebsitePreview";

// ======================================================
// CONTENT
// ======================================================

import Content from "../pages/content/Content";
import CreateContent from "../pages/content/CreateContent";
import ContentDetail from "../pages/content/ContentDetail";
import ContentEdit from "../pages/content/ContentEdit";
import ContentCalendar from "../pages/content/ContentCalendar";

// ======================================================
// MARKETING
// ======================================================

import Campaigns from "../pages/marketing/Campaigns";
import CreateCampaign from "../pages/marketing/CreateCampaign";
import CreateAutomation from "../pages/marketing/CreateAutomation";

// ======================================================
// DISTRIBUTION
// ======================================================

import Distribution from "../pages/distribution/Distribution";

// ======================================================
// SETTINGS
// ======================================================

import BusinessSettings from "../pages/settings/BusinessSettings";
import Integrations from "../pages/settings/Integrations";

import EditOrder from "../pages/orders/EditOrder";
import Team from "../pages/team/Team";
import CreateTeam from "../pages/team/CreateTeam";
import TeamRoles from "../pages/team/TeamRoles";
import TeamPermissions from "../pages/team/TeamPermissions";
import Reports from "../pages/report/Reports";
import SalesReport from "../pages/report/SalesReport";
import OrdersReport from "../pages/report/OrdersReport";
import EditPage from "../pages/website/EditPage";
import Form from "../pages/website/Form";
import FormCreate from "../pages/website/FormCreate";
import FormEdit from "../pages/website/FormEdit";
import FormPreview from "../pages/website/FormPreview";
import MarketingTemplates from "../pages/marketing/MarketingTemplates";
import Automation from "../pages/marketing/Automation";
import TemplateCreate from "../pages/marketing/TemplateCreate";
import TemplateEdit from "../pages/marketing/TemplateEdit";
import EditTeam from "../pages/team/EditTeam";

import EditCampaign from "../pages/marketing/EditCampaign";
import CategoryManagement from "../pages/products/CategoryManagement";
import CampaignView from "../pages/marketing/CampaignView";
import PublicWebsite from "../pages/website/PublicWebsite";

// ======================================================
// LOADING SCREEN
// ======================================================

const LoadingScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

        <p className="mt-4 text-sm text-gray-500">Loading Brielix...</p>
      </div>
    </div>
  );
};

// ======================================================
// PROTECTED ROUTE
// ======================================================

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Authentication state is still loading
  if (loading) {
    return <LoadingScreen />;
  }

  // User is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// ======================================================
// PUBLIC ROUTE
// ======================================================

const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Authentication state is still loading
  if (loading) {
    return <LoadingScreen />;
  }

  // Already logged in
  // Redirect to Business Dashboard
  if (isAuthenticated) {
    return <Navigate to="/business" replace />;
  }

  return <Outlet />;
};

// ======================================================
// 404 PAGE
// ======================================================

const NotFound = () => {
  const handleGoToBusiness = () => {
    window.location.href = "/business";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="text-center">
        <div className="text-7xl font-black text-gray-200">404</div>

        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Page not found
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          The page you are looking for does not exist.
        </p>

        <button
          type="button"
          onClick={handleGoToBusiness}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go to Business
        </button>
      </div>
    </div>
  );
};

// ======================================================
// APP ROUTES
// ======================================================

const AppRoutes = () => {
  return (
    <Routes>
      {/* ==================================================
          PUBLIC ROUTES
      ================================================== */}
      <Route
        path="/website/:websiteId/page/:pageId/edit"
        element={<EditPage />}
      />

      <Route
        path="/website/:websiteId/page/:pageId/preview"
        element={<WebsitePreview />}
      />

      <Route path="/site/:slug/*" element={<PublicWebsite />} />

      <Route path="/forms/:formId" element={<FormPreview />} />

      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>
      </Route>

      {/* ==================================================
          PROTECTED ROUTES
      ================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* ==================================================
              BUSINESS
          ================================================== */}

          <Route path="/business" element={<Business />} />

          <Route path="/business/profile" element={<BusinessProfile />} />

          {/* ==================================================
              PRODUCTS
          ================================================== */}

          <Route path="/products" element={<Products />} />

          <Route path="/products/create" element={<CreateProduct />} />

          <Route path="/products/:id/edit" element={<EditProduct />} />

          <Route path="/products/import" element={<ImportProducts />} />

          <Route path="/categories" element={<CategoryManagement />} />

          {/* ==================================================
              INVENTORY
          ================================================== */}

          <Route path="/inventory" element={<Inventory />} />

          {/* ==================================================
              ORDERS
          ================================================== */}

          <Route path="/orders" element={<Orders />} />

          <Route path="/orders/create" element={<CreateOrder />} />

          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/orders/:id/edit" element={<EditOrder />} />
          <Route path="/crm/customers" element={<Customers />} />

          {/* ==================================================
              CRM
          ================================================== */}

          <Route path="/crm/leads" element={<Lead />} />
          <Route path="/crm/leads/create" element={<LeadCreate />} />
          <Route path="/crm/leads/:id/edit" element={<LeadEdit />} />
          <Route path="/crm/opportunities" element={<Opportunity />} />
          <Route path="/crm/tags" element={<Tag />} />
          <Route path="/crm/deals" element={<Deal />} />

          {/* ==================================================
              INBOX
          ================================================== */}

          <Route path="/inbox" element={<Inbox />} />

          {/* ------------------------------
              WEBSITE LIST
          ------------------------------ */}

          <Route path="/forms" element={<Form />} />
          <Route path="/forms/create" element={<FormCreate />} />
          <Route path="/forms/:id/edit" element={<FormEdit />} />

          <Route path="/website" element={<Website />} />

          {/* ------------------------------
              CREATE WEBSITE
          ------------------------------ */}

          <Route path="/website/create" element={<CreateWebsite />} />
        
          {/* ------------------------------
              WEBSITE OVERVIEW
          ------------------------------ */}

          <Route path="/website/:websiteId" element={<WebsiteOverview />} />

          {/* ------------------------------
              WEBSITE PAGES
          ------------------------------ */}

          <Route path="/website/:websiteId/pages" element={<WebsitePages />} />

          {/* ------------------------------
              WEBSITE THEME
          ------------------------------ */}

          <Route path="/website/:websiteId/theme" element={<WebsiteTheme />} />

          {/* ------------------------------
              WEBSITE DOMAIN
          ------------------------------ */}

          <Route
            path="/website/:websiteId/domain"
            element={<WebsiteDomain />}
          />

          {/* ------------------------------
              WEBSITE NAVIGATION
          ------------------------------ */}

          <Route
            path="/website/:websiteId/navigation"
            element={<WebsiteNavigation />}
          />

          {/* ------------------------------
              WEBSITE SEO
          ------------------------------ */}

          <Route path="/website/:websiteId/seo" element={<WebsiteSEO />} />

          {/* ------------------------------
              WEBSITE SETTINGS
          ------------------------------ */}

          <Route
            path="/website/:websiteId/settings"
            element={<WebsiteSettings />}
          />

          {/* ------------------------------
              WEBSITE PREVIEW
          ------------------------------ */}

          {/* ==================================================
              CONTENT
          ================================================== */}

          <Route path="/content" element={<Content />} />

          <Route path="/content/create" element={<CreateContent />} />

          <Route path="/content/calendar" element={<ContentCalendar />} />

          <Route path="/content/:id" element={<ContentDetail />} />

          <Route path="/content/:id/edit" element={<ContentEdit />} />

          {/* ==================================================
              MARKETING
          ================================================== */}

          <Route path="/marketing/campaigns" element={<Campaigns />} />

          <Route
            path="/marketing/campaigns/create"
            element={<CreateCampaign />}
          />
          <Route
            path="/marketing/templates/:id/edit"
            element={<TemplateEdit />}
          />
          <Route path="/marketing/campaigns/:id" element={<CampaignView />} />
          <Route path="/marketing/automation" element={<Automation />} />
          <Route
            path="/marketing/templates/create"
            element={<TemplateCreate />}
          />
          <Route
            path="/marketing/automation/create"
            element={<CreateAutomation />}
          />
          <Route path="/marketing/templates" element={<MarketingTemplates />} />

          <Route
            path="/marketing/campaigns/:id/edit"
            element={<EditCampaign />}
          />
          {/* ==================================================
              MARKETING
          ================================================== */}

          <Route path="/team" element={<Team />} />
          <Route path="/team/create" element={<CreateTeam />} />
          <Route path="/team/roles" element={<TeamRoles />} />
          <Route path="/team/permissions" element={<TeamPermissions />} />
          <Route path="/team/edit/:id" element={<EditTeam />} />
          {/* ==================================================
              Report
          ================================================== */}

          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/sales" element={<SalesReport />} />
          <Route path="/reports/orders" element={<OrdersReport />} />
          {/* ==================================================
              DISTRIBUTION
          ================================================== */}

          <Route path="/distribution" element={<Distribution />} />

          {/* ==================================================
              SETTINGS
          ================================================== */}

          <Route path="/settings" element={<BusinessSettings />} />
          <Route path="/integrations" element={<Integrations />} />
        </Route>
      </Route>

      {/* ==================================================
          ROOT REDIRECT
      ================================================== */}

      <Route path="/" element={<Navigate to="/business" replace />} />

      {/* ==================================================
          404
      ================================================== */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// ======================================================
// EXPORT
// ======================================================

export default AppRoutes;
