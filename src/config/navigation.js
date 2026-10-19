import {
  Building2,
  Package,
  ShoppingCart,
  UsersRound,
  Megaphone,
  Inbox,
  UserCog,
  BarChart3,
  Settings,
  LayoutDashboard,
  Globe,
  FileText,
  Share2,
  ClipboardList,
  FileBarChart,
  Layers,
  Plus,
  Globe2,
  Palette,
  FileStack,
  Boxes,
  Upload,
  Download,
  Receipt,
  CreditCard,
  RotateCcw,
  UserPlus,
  GitBranch,
  Database,
  Target,
  Handshake,
  Contact,
  Building,
  ListTodo,
  Activity,
  Phone,
  MessageCircle,
  Tags,
  Workflow,
  Users,
  UserRoundPlus,
  Mail,
  MessageSquare,
  Star,
  UserCheck,
  Plug,
  KeyRound,
  Webhook,
  Bell,
  ShieldCheck,
  WalletCards,
  Folder,
} from "lucide-react";

import { FaFacebook, FaInstagram } from "react-icons/fa";

export const mainNavigation = [
  {
    key: "business",
    label: "Business",
    translationKey: "main.business",
    path: "/business",
    icon: Building2,
  },
  {
    key: "catalog",
    label: "Catalog",
    translationKey: "main.catalog",
    path: "/products",
    icon: Package,
  },
  {
    key: "sales",
    label: "Sales",
    translationKey: "main.sales",
    path: "/orders",
    icon: ShoppingCart,
  },
  {
    key: "crm",
    label: "CRM",
    translationKey: "main.crm",
    path: "/crm/leads",
    icon: UsersRound,
  },
  {
    key: "marketing",
    label: "Marketing",
    translationKey: "main.marketing",
    path: "/marketing/campaigns",
    icon: Megaphone,
  },
  {
    key: "inbox",
    label: "Inbox",
    translationKey: "main.inbox",
    path: "/inbox",
    icon: Inbox,
  },
  {
    key: "team",
    label: "Team",
    translationKey: "main.team",
    path: "/team",
    icon: UserCog,
  },
  {
    key: "reports",
    label: "Reports",
    translationKey: "main.reports",
    path: "/reports",
    icon: BarChart3,
  },
  {
    key: "settings",
    label: "General",
    translationKey: "main.settings",
    path: "/settings",
    icon: Settings,
  },
];

export const contextNavigation = {
  business: {
    title: "Business",
    translationKey: "business.title",
    items: [
      {
        label: "Overview",
        translationKey: "business.overview",
        path: "/business",
        icon: LayoutDashboard,
      },
      {
        label: "Website",
        translationKey: "business.website",
        path: "/website",
        icon: Globe,
      },
      {
        label: "Content",
        translationKey: "business.content",
        path: "/content",
        icon: FileText,
      },
      {
        label: "Distribution",
        translationKey: "business.distribution",
        path: "/distribution",
        icon: Share2,
      },
      {
        label: "Forms",
        translationKey: "business.forms",
        path: "/forms",
        icon: ClipboardList,
      },
      {
        label: "Integrations",
        translationKey: "settings.integrations",
        path: "/integrations",
        icon: Plug,
      },
    ],
  },

  website: {
    title: "Website",
    translationKey: "website.title",
    items: [
      {
        label: "All Websites",
        translationKey: "website.allWebsites",
        path: "/websites",
        icon: Layers,
      },
      {
        label: "Create Website",
        translationKey: "website.createWebsite",
        path: "/websites/create",
        icon: Plus,
      },
      {
        label: "Domains",
        translationKey: "website.domains",
        path: "/websites/domains",
        icon: Globe2,
      },
      {
        label: "Themes",
        translationKey: "website.themes",
        path: "/websites/themes",
        icon: Palette,
      },
    ],
  },

  websiteDetail: {
    title: "Website",
    translationKey: "websiteDetail.title",
    items: [
      {
        label: "Overview",
        translationKey: "websiteDetail.overview",
        path: "",
        icon: LayoutDashboard,
      },
      {
        label: "Pages",
        translationKey: "websiteDetail.pages",
        path: "/pages",
        icon: FileStack,
      },
      {
        label: "Blog",
        translationKey: "websiteDetail.blog",
        path: "/blog",
        icon: FileText,
      },
      {
        label: "Theme",
        translationKey: "websiteDetail.theme",
        path: "/theme",
        icon: Palette,
      },
      {
        label: "Domain",
        translationKey: "websiteDetail.domain",
        path: "/domain",
        icon: Globe2,
      },
      {
        label: "Navigation",
        translationKey: "websiteDetail.navigation",
        path: "/navigation",
        icon: Share2,
      },
      {
        label: "SEO",
        translationKey: "websiteDetail.seo",
        path: "/seo",
        icon: BarChart3,
      },
      {
        label: "Settings",
        translationKey: "websiteDetail.settings",
        path: "/settings",
        icon: Settings,
      },
    ],
  },

  catalog: {
    title: "Catalog",
    translationKey: "catalog.title",
    items: [
      {
        label: "Products",
        translationKey: "catalog.products",
        path: "/products",
        icon: Package,
      },
      {
        label: "Categories",
        translationKey: "catalog.categories",
        path: "/categories",
        icon: Folder,
      },
      {
        label: "Inventory",
        translationKey: "catalog.inventory",
        path: "/inventory",
        icon: Boxes,
      },
      {
        label: "Bulk Import",
        translationKey: "catalog.bulkImport",
        path: "/products/import",
        icon: Upload,
      },
    ],
  },

  sales: {
    title: "Sales",
    translationKey: "sales.title",
    items: [
      {
        label: "Orders",
        translationKey: "sales.orders",
        path: "/orders",
        icon: ShoppingCart,
      },

      {
        label: "Invoices",
        translationKey: "sales.invoices",
        path: "/invoices",
        icon: Receipt,
      },
      {
        label: "Payments",
        translationKey: "sales.payments",
        path: "/payments",
        icon: CreditCard,
      },
    ],
  },

  crm: {
    title: "CRM",
    translationKey: "crm.title",
    items: [
      {
        label: "Contact",
        translationKey: "crm.contact",
        path: "/crm/leads",
        icon: UserPlus,
      },

      {
        label: "Opportunities",
        translationKey: "crm.opportunities",
        path: "/crm/opportunities",
        icon: Target,
      },

      {
        label: "Deal",
        translationKey: "crm.deals",
        path: "/crm/deals",
        icon: Handshake,
      },
      {
        label: "Customers",
        translationKey: "sales.customers",
        path: "/crm/customers",
        icon: Users,
      },
      {
        label: "Tags",
        translationKey: "crm.tags",
        path: "/crm/tags",
        icon: Tags,
      },
    ],
  },

  marketing: {
    title: "Marketing",
    translationKey: "marketing.title",
    items: [
      {
        label: "Campaigns",
        translationKey: "marketing.campaigns",
        path: "/marketing/campaigns",
        icon: Megaphone,
      },
      {
        label: "Templates",
        translationKey: "marketing.templates",
        path: "/marketing/templates",
        icon: FileText,
      },
      {
        label: "Automation",
        translationKey: "marketing.automation",
        path: "/marketing/automation",
        icon: Workflow,
        children: [
          {
            label: "All Automations",
            translationKey: "marketing.allAutomations",
            path: "/marketing/automation",
            icon: ListTodo,
          },
          {
            label: "Create Automation",
            translationKey: "marketing.createAutomation",
            path: "/marketing/automation/create",
            icon: Plus,
          },
          {
            label: "Logs",
            translationKey: "marketing.automationLogs",
            path: "/marketing/automation/logs",
            icon: FileBarChart,
          },
        ],
      },
      {
        label: "Audiences",
        translationKey: "marketing.audiences",
        path: "/marketing/audiences",
        icon: Users,
      },
      {
        label: "Segments",
        translationKey: "marketing.segments",
        path: "/marketing/segments",
        icon: Layers,
      },
      {
        label: "Lead Generation",
        translationKey: "marketing.leadGeneration",
        path: "/marketing/lead-generation",
        icon: UserRoundPlus,
      },
    ],
  },

  inbox: {
    title: "Inbox",
    translationKey: "inbox.title",
  },

  team: {
    title: "Team",
    translationKey: "team.title",
    items: [
      {
        label: "Members",
        translationKey: "team.members",
        path: "/team",
        icon: Users,
      },
      {
        label: "Add Member",
        translationKey: "team.addMember",
        path: "/team/create",
        icon: UserRoundPlus,
      },
    ],
  },

  reports: {
    title: "Reports",
    translationKey: "reports.title",
    items: [
      {
        label: "Overview",
        translationKey: "reports.overview",
        path: "/reports",
        icon: LayoutDashboard,
      },
      {
        label: "Sales",
        translationKey: "reports.sales",
        path: "/reports/sales",
        icon: BarChart3,
      },
      {
        label: "Orders",
        translationKey: "reports.orders",
        path: "/reports/orders",
        icon: ShoppingCart,
      },
      {
        label: "Products",
        translationKey: "reports.products",
        path: "/reports/products",
        icon: Package,
      },
      {
        label: "Leads",
        translationKey: "reports.leads",
        path: "/reports/leads",
        icon: UserPlus,
      },
      {
        label: "Deals",
        translationKey: "reports.deals",
        path: "/reports/deals",
        icon: Handshake,
      },
      {
        label: "Customers",
        translationKey: "reports.customers",
        path: "/reports/customers",
        icon: Users,
      },
      {
        label: "Marketing",
        translationKey: "reports.marketing",
        path: "/reports/marketing",
        icon: Megaphone,
      },
      {
        label: "Campaigns",
        translationKey: "reports.campaigns",
        path: "/reports/campaigns",
        icon: FileText,
      },
      {
        label: "Staff Performance",
        translationKey: "reports.staffPerformance",
        path: "/reports/staff-performance",
        icon: BarChart3,
      },
    ],
  },

  settings: {
    title: "Settings",
    translationKey: "settings.title",
    items: [
      {
        label: "Overview",
        translationKey: "settings.overview",
        path: "/settings",
        icon: LayoutDashboard,
      },

      {
        label: "Payments",
        translationKey: "settings.payments",
        path: "/settings/payments",
        icon: CreditCard,
      },
      {
        label: "API",
        translationKey: "settings.api",
        path: "/settings/api",
        icon: KeyRound,
      },
      {
        label: "Webhooks",
        translationKey: "settings.webhooks",
        path: "/settings/webhooks",
        icon: Webhook,
      },
      {
        label: "Notifications",
        translationKey: "settings.notifications",
        path: "/settings/notifications",
        icon: Bell,
      },
      {
        label: "Security",
        translationKey: "settings.security",
        path: "/settings/security",
        icon: ShieldCheck,
      },
      {
        label: "Billing",
        translationKey: "settings.billing",
        path: "/settings/billing",
        icon: WalletCards,
      },
    ],
  },
};

export default {
  mainNavigation,
  contextNavigation,
};
