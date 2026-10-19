
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Megaphone,
  Globe,
  BarChart3,
  Settings,
  Check,
  Building2,
  CreditCard,
  Receipt,
  RotateCcw,
  MessageCircle,
  Inbox,
  Eye,
  EyeOff,
  Search,
  CheckCheck,
  X,
  KeyRound,
  UserPlus,
  Lock,
  Loader2,
} from "lucide-react";

import teamApi from "../../api/team.api";

// ======================================================
// PERMISSIONS
// ======================================================

const PERMISSIONS = [
  // DASHBOARD
  {
    key: "dashboard.view",
    title: "Dashboard",
    description: "View business dashboard and overview.",
    icon: LayoutDashboard,
    group: "Dashboard",
    default: true,
  },

  // BUSINESS
  {
    key: "business.view",
    title: "View Business",
    description: "View business profile and information.",
    icon: Building2,
    group: "Business",
    default: true,
  },
  {
    key: "business.update",
    title: "Update Business",
    description: "Update business profile and configuration.",
    icon: Building2,
    group: "Business",
    default: false,
  },

  // WEBSITE
  {
    key: "website.view",
    title: "View Websites",
    description: "View websites and website information.",
    icon: Globe,
    group: "Website",
    default: false,
  },
  {
    key: "website.create",
    title: "Create Websites",
    description: "Create new websites for the business.",
    icon: Globe,
    group: "Website",
    default: false,
  },
  {
    key: "website.update",
    title: "Edit Websites",
    description: "Edit website pages, themes and settings.",
    icon: Globe,
    group: "Website",
    default: false,
  },
  {
    key: "website.delete",
    title: "Delete Websites",
    description: "Delete websites from the business.",
    icon: Globe,
    group: "Website",
    default: false,
  },
  {
    key: "website.publish",
    title: "Publish Websites",
    description: "Publish and unpublish websites.",
    icon: Globe,
    group: "Website",
    default: false,
  },

  // FORMS
  {
    key: "forms.view",
    title: "View Forms",
    description: "View website forms and submissions.",
    icon: FileText,
    group: "Forms",
    default: false,
  },
  {
    key: "forms.create",
    title: "Create Forms",
    description: "Create and configure new forms.",
    icon: FileText,
    group: "Forms",
    default: false,
  },
  {
    key: "forms.update",
    title: "Edit Forms",
    description: "Update form fields and settings.",
    icon: FileText,
    group: "Forms",
    default: false,
  },
  {
    key: "forms.delete",
    title: "Delete Forms",
    description: "Delete forms and configurations.",
    icon: FileText,
    group: "Forms",
    default: false,
  },

  // CONTENT
  {
    key: "content.view",
    title: "View Content",
    description: "View content and blog posts.",
    icon: FileText,
    group: "Content",
    default: false,
  },
  {
    key: "content.create",
    title: "Create Content",
    description: "Create blogs, pages and marketing content.",
    icon: FileText,
    group: "Content",
    default: false,
  },
  {
    key: "content.update",
    title: "Edit Content",
    description: "Edit existing content and blog posts.",
    icon: FileText,
    group: "Content",
    default: false,
  },
  {
    key: "content.delete",
    title: "Delete Content",
    description: "Delete content and blog posts.",
    icon: FileText,
    group: "Content",
    default: false,
  },
  {
    key: "content.publish",
    title: "Publish Content",
    description: "Publish and unpublish content.",
    icon: FileText,
    group: "Content",
    default: false,
  },

  // DISTRIBUTION
  {
    key: "distribution.view",
    title: "View Distribution",
    description: "View content distribution tools.",
    icon: Megaphone,
    group: "Distribution",
    default: false,
  },
  {
    key: "distribution.manage",
    title: "Manage Distribution",
    description: "Manage content distribution and publishing.",
    icon: Megaphone,
    group: "Distribution",
    default: false,
  },
  {
    key: "distribution.automation",
    title: "Distribution Automation",
    description: "Manage automated content distribution.",
    icon: Megaphone,
    group: "Distribution",
    default: false,
  },
  {
    key: "distribution.social",
    title: "Social Distribution",
    description: "Publish content to connected social channels.",
    icon: Megaphone,
    group: "Distribution",
    default: false,
  },
  {
    key: "distribution.backlinks",
    title: "Backlinks",
    description: "Manage backlink generation and tracking.",
    icon: Globe,
    group: "Distribution",
    default: false,
  },

  // PRODUCTS
  {
    key: "products.view",
    title: "View Products",
    description: "View products and product information.",
    icon: Package,
    group: "Products",
    default: false,
  },
  {
    key: "products.create",
    title: "Create Products",
    description: "Create new products.",
    icon: Package,
    group: "Products",
    default: false,
  },
  {
    key: "products.update",
    title: "Edit Products",
    description: "Update product information.",
    icon: Package,
    group: "Products",
    default: false,
  },
  {
    key: "products.delete",
    title: "Delete Products",
    description: "Delete products.",
    icon: Package,
    group: "Products",
    default: false,
  },

  // CATEGORIES
  {
    key: "categories.view",
    title: "View Categories",
    description: "View product categories.",
    icon: Package,
    group: "Categories",
    default: false,
  },
  {
    key: "categories.create",
    title: "Create Categories",
    description: "Create product categories.",
    icon: Package,
    group: "Categories",
    default: false,
  },
  {
    key: "categories.update",
    title: "Edit Categories",
    description: "Update product categories.",
    icon: Package,
    group: "Categories",
    default: false,
  },
  {
    key: "categories.delete",
    title: "Delete Categories",
    description: "Delete product categories.",
    icon: Package,
    group: "Categories",
    default: false,
  },

  // INVENTORY
  {
    key: "inventory.view",
    title: "View Inventory",
    description: "View inventory and stock levels.",
    icon: Package,
    group: "Inventory",
    default: false,
  },
  {
    key: "inventory.manage",
    title: "Manage Inventory",
    description: "Update stock and inventory information.",
    icon: Package,
    group: "Inventory",
    default: false,
  },

  // SALES
  {
    key: "sales.view",
    title: "View Sales",
    description: "View sales information and performance.",
    icon: BarChart3,
    group: "Sales",
    default: false,
  },
  {
    key: "sales.manage",
    title: "Manage Sales",
    description: "Manage sales activities and transactions.",
    icon: BarChart3,
    group: "Sales",
    default: false,
  },

  // ORDERS
  {
    key: "orders.view",
    title: "View Orders",
    description: "View customer orders.",
    icon: ShoppingCart,
    group: "Orders",
    default: false,
  },
  {
    key: "orders.create",
    title: "Create Orders",
    description: "Create manual customer orders.",
    icon: ShoppingCart,
    group: "Orders",
    default: false,
  },
  {
    key: "orders.update",
    title: "Edit Orders",
    description: "Update and manage orders.",
    icon: ShoppingCart,
    group: "Orders",
    default: false,
  },
  {
    key: "orders.delete",
    title: "Delete Orders",
    description: "Delete orders where permitted.",
    icon: ShoppingCart,
    group: "Orders",
    default: false,
  },
  {
    key: "orders.cancel",
    title: "Cancel Orders",
    description: "Cancel customer orders.",
    icon: ShoppingCart,
    group: "Orders",
    default: false,
  },

  // PAYMENTS
  {
    key: "payments.view",
    title: "View Payments",
    description: "View payment transactions.",
    icon: CreditCard,
    group: "Payments",
    default: false,
  },
  {
    key: "payments.manage",
    title: "Manage Payments",
    description: "Manage payment transactions and status.",
    icon: CreditCard,
    group: "Payments",
    default: false,
  },

  // INVOICES
  {
    key: "invoices.view",
    title: "View Invoices",
    description: "View invoices and billing documents.",
    icon: Receipt,
    group: "Invoices",
    default: false,
  },
  {
    key: "invoices.create",
    title: "Create Invoices",
    description: "Create new invoices.",
    icon: Receipt,
    group: "Invoices",
    default: false,
  },
  {
    key: "invoices.update",
    title: "Edit Invoices",
    description: "Update invoices.",
    icon: Receipt,
    group: "Invoices",
    default: false,
  },
  {
    key: "invoices.delete",
    title: "Delete Invoices",
    description: "Delete invoices.",
    icon: Receipt,
    group: "Invoices",
    default: false,
  },

  // REFUNDS
  {
    key: "refunds.view",
    title: "View Refunds",
    description: "View refund requests and transactions.",
    icon: RotateCcw,
    group: "Refunds",
    default: false,
  },
  {
    key: "refunds.create",
    title: "Create Refunds",
    description: "Create refund requests.",
    icon: RotateCcw,
    group: "Refunds",
    default: false,
  },
  {
    key: "refunds.manage",
    title: "Manage Refunds",
    description: "Approve and manage refunds.",
    icon: RotateCcw,
    group: "Refunds",
    default: false,
  },

  // CRM
  {
    key: "crm.view",
    title: "CRM",
    description: "Access CRM overview.",
    icon: Users,
    group: "CRM",
    default: true,
  },

  // LEADS
  {
    key: "leads.view",
    title: "View Leads",
    description: "View and search business leads.",
    icon: Users,
    group: "Leads",
    default: true,
  },
  {
    key: "leads.create",
    title: "Create Leads",
    description: "Create new leads.",
    icon: Users,
    group: "Leads",
    default: true,
  },
  {
    key: "leads.update",
    title: "Edit Leads",
    description: "Update lead information and status.",
    icon: Users,
    group: "Leads",
    default: true,
  },
  {
    key: "leads.delete",
    title: "Delete Leads",
    description: "Delete leads.",
    icon: Users,
    group: "Leads",
    default: false,
  },
  {
    key: "leads.assign",
    title: "Assign Leads",
    description: "Assign leads to team members.",
    icon: Users,
    group: "Leads",
    default: false,
  },
  {
    key: "leads.export",
    title: "Export Leads",
    description: "Export leads and lead data.",
    icon: FileText,
    group: "Leads",
    default: false,
  },

  // CONTACTS
  {
    key: "contacts.view",
    title: "View Contacts",
    description: "View contacts and customer information.",
    icon: User,
    group: "Contacts",
    default: true,
  },
  {
    key: "contacts.create",
    title: "Create Contacts",
    description: "Create new contacts.",
    icon: User,
    group: "Contacts",
    default: true,
  },
  {
    key: "contacts.update",
    title: "Edit Contacts",
    description: "Update contact information.",
    icon: User,
    group: "Contacts",
    default: true,
  },
  {
    key: "contacts.delete",
    title: "Delete Contacts",
    description: "Delete contacts.",
    icon: User,
    group: "Contacts",
    default: false,
  },
  {
    key: "contacts.export",
    title: "Export Contacts",
    description: "Export contact information.",
    icon: FileText,
    group: "Contacts",
    default: false,
  },

  // CUSTOMERS
  {
    key: "customers.view",
    title: "View Customers",
    description: "View customers and customer profiles.",
    icon: Users,
    group: "Customers",
    default: false,
  },
  {
    key: "customers.create",
    title: "Create Customers",
    description: "Create customer profiles.",
    icon: Users,
    group: "Customers",
    default: false,
  },
  {
    key: "customers.update",
    title: "Edit Customers",
    description: "Update customer information.",
    icon: Users,
    group: "Customers",
    default: false,
  },
  {
    key: "customers.delete",
    title: "Delete Customers",
    description: "Delete customers.",
    icon: Users,
    group: "Customers",
    default: false,
  },

  // MARKETING
  {
    key: "marketing.view",
    title: "View Marketing",
    description: "View marketing tools and campaigns.",
    icon: Megaphone,
    group: "Marketing",
    default: false,
  },
  {
    key: "marketing.create",
    title: "Create Campaigns",
    description: "Create marketing campaigns.",
    icon: Megaphone,
    group: "Marketing",
    default: false,
  },
  {
    key: "marketing.update",
    title: "Edit Campaigns",
    description: "Update marketing campaigns.",
    icon: Megaphone,
    group: "Marketing",
    default: false,
  },
  {
    key: "marketing.delete",
    title: "Delete Campaigns",
    description: "Delete marketing campaigns.",
    icon: Megaphone,
    group: "Marketing",
    default: false,
  },
  {
    key: "marketing.automation",
    title: "Marketing Automation",
    description: "Manage marketing automation workflows.",
    icon: Megaphone,
    group: "Marketing",
    default: false,
  },
  {
    key: "marketing.social",
    title: "Social Media",
    description: "Manage connected social media channels.",
    icon: Megaphone,
    group: "Marketing",
    default: false,
  },

  // WHATSAPP
  {
    key: "whatsapp.view",
    title: "View WhatsApp",
    description: "View WhatsApp conversations and messages.",
    icon: MessageCircle,
    group: "WhatsApp",
    default: false,
  },
  {
    key: "whatsapp.send",
    title: "Send WhatsApp Messages",
    description: "Send WhatsApp messages to customers and leads.",
    icon: MessageCircle,
    group: "WhatsApp",
    default: false,
  },
  {
    key: "whatsapp.manage",
    title: "Manage WhatsApp",
    description: "Manage WhatsApp integration and configuration.",
    icon: MessageCircle,
    group: "WhatsApp",
    default: false,
  },
  {
    key: "whatsapp.templates",
    title: "WhatsApp Templates",
    description: "Manage WhatsApp message templates.",
    icon: MessageCircle,
    group: "WhatsApp",
    default: false,
  },

  // INBOX
  {
    key: "inbox.view",
    title: "View Inbox",
    description: "View conversations and customer messages.",
    icon: Inbox,
    group: "Inbox",
    default: false,
  },
  {
    key: "inbox.reply",
    title: "Reply to Messages",
    description: "Reply to customer conversations.",
    icon: MessageCircle,
    group: "Inbox",
    default: false,
  },
  {
    key: "inbox.assign",
    title: "Assign Conversations",
    description: "Assign conversations to team members.",
    icon: Users,
    group: "Inbox",
    default: false,
  },
  {
    key: "inbox.delete",
    title: "Delete Conversations",
    description: "Delete or archive conversations.",
    icon: Inbox,
    group: "Inbox",
    default: false,
  },

  // TEAM
  {
    key: "team.view",
    title: "View Team",
    description: "View team members.",
    icon: Users,
    group: "Team",
    default: false,
  },
  {
    key: "team.create",
    title: "Add Team Members",
    description: "Create and invite team members.",
    icon: UserPlus,
    group: "Team",
    default: false,
  },
  {
    key: "team.update",
    title: "Edit Team Members",
    description: "Update team member information.",
    icon: Users,
    group: "Team",
    default: false,
  },
  {
    key: "team.delete",
    title: "Remove Team Members",
    description: "Remove team members from the business.",
    icon: Users,
    group: "Team",
    default: false,
  },
  {
    key: "team.permissions",
    title: "Manage Permissions",
    description: "Manage team member permissions.",
    icon: ShieldCheck,
    group: "Team",
    default: false,
  },

  // REPORTS
  {
    key: "reports.view",
    title: "View Reports",
    description: "View business reports.",
    icon: BarChart3,
    group: "Reports",
    default: false,
  },
  {
    key: "reports.sales",
    title: "Sales Reports",
    description: "View sales analytics and reports.",
    icon: BarChart3,
    group: "Reports",
    default: false,
  },
  {
    key: "reports.orders",
    title: "Order Reports",
    description: "View order analytics and reports.",
    icon: ShoppingCart,
    group: "Reports",
    default: false,
  },
  {
    key: "reports.products",
    title: "Product Reports",
    description: "View product performance reports.",
    icon: Package,
    group: "Reports",
    default: false,
  },
  {
    key: "reports.leads",
    title: "Lead Reports",
    description: "View lead analytics and reports.",
    icon: Users,
    group: "Reports",
    default: false,
  },
  {
    key: "reports.customers",
    title: "Customer Reports",
    description: "View customer analytics.",
    icon: Users,
    group: "Reports",
    default: false,
  },
  {
    key: "reports.marketing",
    title: "Marketing Reports",
    description: "View campaign and marketing analytics.",
    icon: Megaphone,
    group: "Reports",
    default: false,
  },
  {
    key: "reports.export",
    title: "Export Reports",
    description: "Export reports and analytics.",
    icon: FileText,
    group: "Reports",
    default: false,
  },

  // SETTINGS
  {
    key: "settings.view",
    title: "View Settings",
    description: "View business and CRM settings.",
    icon: Settings,
    group: "Settings",
    default: false,
  },
  {
    key: "settings.update",
    title: "Update Settings",
    description: "Modify business and CRM settings.",
    icon: Settings,
    group: "Settings",
    default: false,
  },
  {
    key: "settings.billing",
    title: "Billing",
    description: "View subscription and billing information.",
    icon: CreditCard,
    group: "Settings",
    default: false,
  },
  {
    key: "settings.integrations",
    title: "Integrations",
    description: "Manage third-party integrations.",
    icon: Settings,
    group: "Settings",
    default: false,
  },
  {
    key: "settings.api",
    title: "API Access",
    description: "Manage API keys and API configuration.",
    icon: Settings,
    group: "Settings",
    default: false,
  },
];

// ======================================================
// ROLES
// ======================================================

const TEAM_ROLES = [
  {
    value: "admin",
    label: "Admin",
    description: "Full business management access.",
  },
  {
    value: "manager",
    label: "Manager",
    description: "Manage team operations and business activities.",
  },
  {
    value: "sales",
    label: "Sales",
    description: "Manage leads, contacts and sales activities.",
  },
  {
    value: "marketing",
    label: "Marketing",
    description: "Manage marketing and content activities.",
  },
  {
    value: "support",
    label: "Support",
    description: "Manage customers, inbox and support operations.",
  },
  {
    value: "staff",
    label: "Staff",
    description: "General team member access.",
  },
];

// ======================================================
// STATUS
// ======================================================

const STATUSES = [
  {
    value: "active",
    label: "Active",
    description: "Member can access the CRM.",
  },
  {
    value: "inactive",
    label: "Inactive",
    description: "Member access is disabled.",
  },
  {
    value: "suspended",
    label: "Suspended",
    description: "Member is temporarily suspended.",
  },
  {
    value: "pending",
    label: "Pending",
    description: "Member is waiting for activation.",
  },
];

// ======================================================
// INITIAL PERMISSIONS
// ======================================================

const createInitialPermissions = () => {
  return PERMISSIONS.reduce((acc, permission) => {
    acc[permission.key] = Boolean(permission.default);
    return acc;
  }, {});
};

// ======================================================
// CLASSES
// ======================================================

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

// ======================================================
// EDIT TEAM
// ======================================================

const EditTeam = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    status: "active",
  });

  const [permissions, setPermissions] = useState(
    createInitialPermissions()
  );

  const [permissionSearch, setPermissionSearch] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ====================================================
  // LOAD TEAM MEMBER
  // ====================================================

  useEffect(() => {
    loadTeamMember();
  }, [id]);

  const loadTeamMember = async () => {
    if (!id) {
      setError("Team member ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await teamApi.getTeamMember(id);

      const member =
        response?.data?.data ||
        response?.data?.member ||
        response?.data ||
        response?.member ||
        response;

      if (!member) {
        throw new Error("Team member not found.");
      }

      setForm({
        name: member.name || "",
        email: member.email || "",
        phone: member.phone || "",
        password: "",
        confirmPassword: "",
        role: member.role || "",
        status: member.status || "active",
      });

      // ----------------------------------------------
      // Existing permissions
      // ----------------------------------------------

      const nextPermissions = createInitialPermissions();

      let existingPermissions = member.permissions || [];

      // Supports:
      // ["leads.view", "leads.create"]
      //
      // and:
      // {
      //   "leads.view": true,
      //   "leads.create": false
      // }

      if (Array.isArray(existingPermissions)) {
        existingPermissions.forEach((permission) => {
          if (typeof permission === "string") {
            nextPermissions[permission] = true;
          } else if (permission?.key) {
            nextPermissions[permission.key] = true;
          }
        });
      } else if (
        existingPermissions &&
        typeof existingPermissions === "object"
      ) {
        Object.entries(existingPermissions).forEach(([key, value]) => {
          nextPermissions[key] = Boolean(value);
        });
      }

      setPermissions(nextPermissions);
    } catch (err) {
      console.error("Load team member error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to load team member.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // GROUP PERMISSIONS
  // ====================================================

  const groupedPermissions = useMemo(() => {
    const search = permissionSearch.trim().toLowerCase();

    const filtered = PERMISSIONS.filter((permission) => {
      if (!search) return true;

      return (
        permission.key.toLowerCase().includes(search) ||
        permission.title.toLowerCase().includes(search) ||
        permission.description.toLowerCase().includes(search) ||
        permission.group.toLowerCase().includes(search)
      );
    });

    return filtered.reduce((groups, permission) => {
      if (!groups[permission.group]) {
        groups[permission.group] = [];
      }

      groups[permission.group].push(permission);

      return groups;
    }, {});
  }, [permissionSearch]);

  // ====================================================
  // COUNTS
  // ====================================================

  const enabledPermissions = Object.values(permissions).filter(Boolean)
    .length;

  const totalPermissions = PERMISSIONS.length;

  // ====================================================
  // FORM CHANGE
  // ====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ====================================================
  // PERMISSION TOGGLE
  // ====================================================

  const handlePermission = (key) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ====================================================
  // ENABLE ALL
  // ====================================================

  const enableAllPermissions = () => {
    const next = {};

    PERMISSIONS.forEach((permission) => {
      next[permission.key] = true;
    });

    setPermissions(next);
  };

  // ====================================================
  // CLEAR ALL
  // ====================================================

  const clearAllPermissions = () => {
    const next = {};

    PERMISSIONS.forEach((permission) => {
      next[permission.key] = false;
    });

    setPermissions(next);
  };

  // ====================================================
  // GROUP TOGGLE
  // ====================================================

  const toggleGroup = (groupPermissions) => {
    const allEnabled = groupPermissions.every(
      (permission) => permissions[permission.key]
    );

    setPermissions((prev) => {
      const next = { ...prev };

      groupPermissions.forEach((permission) => {
        next[permission.key] = !allEnabled;
      });

      return next;
    });
  };

  // ====================================================
  // GENERATE PASSWORD
  // ====================================================

  const generatePassword = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

    let password = "";

    for (let i = 0; i < 12; i++) {
      password += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }

    setForm((prev) => ({
      ...prev,
      password,
      confirmPassword: password,
    }));

    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  // ====================================================
  // VALIDATE
  // ====================================================

  const validateForm = () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name) {
      return "Name is required.";
    }

    if (!email) {
      return "Email address is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }

    // Password is optional during edit.
    // But if entered, validate it.

    if (form.password) {
      if (form.password.length < 6) {
        return "Password must be at least 6 characters.";
      }

      if (form.password !== form.confirmPassword) {
        return "Password and confirm password do not match.";
      }
    }

    if (!form.role) {
      return "Please select a role.";
    }

    if (!["active", "inactive", "suspended", "pending"].includes(form.status)) {
      return "Invalid status selected.";
    }

    return null;
  };

  // ====================================================
  // SUBMIT
  // ====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    try {
      // ----------------------------------------------
      // Permission array
      // ----------------------------------------------

      const permissionList = Object.entries(permissions)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key);

      // ----------------------------------------------
      // Payload
      // ----------------------------------------------

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        role: form.role,
        permissions: permissionList,
        status: form.status,
      };

      // ----------------------------------------------
      // Password only if changed
      // ----------------------------------------------

      if (form.password.trim()) {
        payload.password = form.password;
      }

      console.log("Update team member payload:", payload);

      await teamApi.updateTeamMember(id, payload);

      navigate("/team");
    } catch (err) {
      console.error("Update team member error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to update team member. Please try again.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // SELECTED ROLE
  // ====================================================

  const selectedRole =
    TEAM_ROLES.find((item) => item.value === form.role)?.label ||
    "Not selected";

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={30}
            className="animate-spin text-blue-600"
          />

          <p className="text-sm font-medium text-slate-500">
            Loading team member...
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
          {/* Breadcrumb */}

          <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => navigate("/team")}
              className="transition hover:text-blue-600"
            >
              Team
            </button>

            <span>/</span>

            <span className="text-slate-600">
              Edit Member
            </span>
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/team")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Edit Team Member
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Update team member information and CRM access.
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 sm:flex">
              <ShieldCheck
                size={18}
                className="text-blue-600"
              />

              <div>
                <p className="text-xs font-semibold text-blue-700">
                  Team Access
                </p>

                <p className="text-[11px] text-blue-500">
                  Secure role-based permissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="mx-auto max-w-[1500px] px-4 py-6 pb-28 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* ==================================================
                LEFT
            ================================================== */}

            <div className="space-y-6">
              {/* ==================================================
                  PERSONAL INFORMATION
              ================================================== */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <User size={19} />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Personal Information
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Basic information about the team member.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                  <FormField
                    label="Full Name"
                    required
                    icon={User}
                  >
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter full name"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField
                    label="Email Address"
                    required
                    icon={Mail}
                  >
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="name@company.com"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField
                    label="Phone Number"
                    icon={Phone}
                  >
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField
                    label="Status"
                    required
                    icon={ShieldCheck}
                  >
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      {STATUSES.map((status) => (
                        <option
                          key={status.value}
                          value={status.value}
                        >
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </section>

              {/* ==================================================
                  PASSWORD
              ================================================== */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <KeyRound size={19} />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Account Security
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Leave password blank to keep the current password.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                  <FormField
                    label="New Password"
                    icon={Lock}
                  >
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        minLength={6}
                        placeholder="Leave blank to keep current"
                        className={`${inputClass} pr-12`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={generatePassword}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Generate secure password
                    </button>
                  </FormField>

                  <FormField
                    label="Confirm New Password"
                    icon={Lock}
                  >
                    <div className="relative">
                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        minLength={6}
                        placeholder="Confirm new password"
                        className={`${inputClass} pr-12`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (prev) => !prev
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    {form.confirmPassword &&
                      form.password ===
                        form.confirmPassword && (
                        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <Check size={13} />
                          Passwords match
                        </p>
                      )}
                  </FormField>
                </div>
              </section>

              {/* ==================================================
                  ROLE
              ================================================== */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <BriefcaseIcon />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Role & Access
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Define the team member's role and access level.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <FormField
                    label="Role"
                    required
                    icon={ShieldCheck}
                  >
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      required
                      className={selectClass}
                    >
                      <option value="">
                        Select role
                      </option>

                      {TEAM_ROLES.map((role) => (
                        <option
                          key={role.value}
                          value={role.value}
                        >
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  {form.role && (
                    <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3">
                      <p className="text-xs font-semibold text-violet-900">
                        {selectedRole}
                      </p>

                      <p className="mt-1 text-xs text-violet-700">
                        {
                          TEAM_ROLES.find(
                            (item) =>
                              item.value === form.role
                          )?.description
                        }
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* ==================================================
                  PERMISSIONS
              ================================================== */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <ShieldCheck size={19} />
                        </div>

                        <div>
                          <h2 className="text-base font-bold text-slate-900">
                            Permissions
                          </h2>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Choose exactly what this member can access.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {enabledPermissions} of{" "}
                        {totalPermissions} enabled
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:flex-row">
                      <div className="relative flex-1">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          value={permissionSearch}
                          onChange={(e) =>
                            setPermissionSearch(
                              e.target.value
                            )
                          }
                          placeholder="Search permissions..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />

                        {permissionSearch && (
                          <button
                            type="button"
                            onClick={() =>
                              setPermissionSearch("")
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={enableAllPermissions}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <CheckCheck size={15} />
                          Enable All
                        </button>

                        <button
                          type="button"
                          onClick={clearAllPermissions}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          <X size={15} />
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-5">
                  {Object.keys(groupedPermissions).length ===
                  0 ? (
                    <div className="py-12 text-center">
                      <Search
                        size={28}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-600">
                        No permissions found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try a different search term.
                      </p>
                    </div>
                  ) : (
                    Object.entries(groupedPermissions).map(
                      ([group, groupPermissions]) => {
                        const groupEnabled =
                          groupPermissions.filter(
                            (permission) =>
                              permissions[permission.key]
                          ).length;

                        const allGroupEnabled =
                          groupPermissions.length > 0 &&
                          groupPermissions.every(
                            (permission) =>
                              permissions[permission.key]
                          );

                        return (
                          <div key={group}>
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-800">
                                  {group}
                                </h3>

                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                  {groupEnabled}/
                                  {groupPermissions.length}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  toggleGroup(
                                    groupPermissions
                                  )
                                }
                                className={`text-xs font-semibold transition ${
                                  allGroupEnabled
                                    ? "text-slate-500 hover:text-red-600"
                                    : "text-blue-600 hover:text-blue-700"
                                }`}
                              >
                                {allGroupEnabled
                                  ? "Clear group"
                                  : "Enable group"}
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              {groupPermissions.map(
                                (permission) => {
                                  const Icon =
                                    permission.icon;

                                  const enabled =
                                    permissions[
                                      permission.key
                                    ];

                                  return (
                                    <button
                                      key={permission.key}
                                      type="button"
                                      onClick={() =>
                                        handlePermission(
                                          permission.key
                                        )
                                      }
                                      aria-pressed={enabled}
                                      className={`group flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                                        enabled
                                          ? "border-blue-200 bg-blue-50/70"
                                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                      }`}
                                    >
                                      <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                          enabled
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                                        }`}
                                      >
                                        <Icon size={17} />
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                          <h4
                                            className={`text-sm font-semibold ${
                                              enabled
                                                ? "text-blue-900"
                                                : "text-slate-800"
                                            }`}
                                          >
                                            {permission.title}
                                          </h4>

                                          <div
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                              enabled
                                                ? "border-blue-600 bg-blue-600 text-white"
                                                : "border-slate-300 bg-white text-transparent"
                                            }`}
                                          >
                                            <Check
                                              size={12}
                                              strokeWidth={3}
                                            />
                                          </div>
                                        </div>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                          {
                                            permission.description
                                          }
                                        </p>

                                        <p className="mt-2 font-mono text-[10px] text-slate-400">
                                          {permission.key}
                                        </p>
                                      </div>
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        );
                      }
                    )
                  )}
                </div>
              </section>

              {/* ==================================================
                  PASSWORD NOTE
              ================================================== */}

              <section className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/60 shadow-sm">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <KeyRound size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900">
                        Password update
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        The current password is not displayed for
                        security. Enter a new password only if you
                        want to change it.
                      </p>

                      <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 py-2.5">
                        <Check
                          size={15}
                          className="text-emerald-600"
                        />

                        <span className="text-xs font-medium text-slate-600">
                          Existing password remains unchanged when
                          the password field is empty.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* ==================================================
                RIGHT SUMMARY
            ================================================== */}

            <aside className="hidden xl:block">
              <div className="sticky top-24 space-y-4">
                {/* Preview */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 p-6 text-white">
                    <p className="text-xs font-medium text-blue-100">
                      TEAM MEMBER
                    </p>

                    <div className="mt-5 flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold backdrop-blur">
                        {form.name
                          ? form.name
                              .charAt(0)
                              .toUpperCase()
                          : "U"}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold">
                          {form.name || "Team Member"}
                        </h3>

                        <p className="mt-0.5 truncate text-xs text-blue-100">
                          {selectedRole}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <SummaryItem
                      icon={Mail}
                      label="Email"
                      value={
                        form.email || "Not provided"
                      }
                    />

                    <SummaryItem
                      icon={Phone}
                      label="Phone"
                      value={
                        form.phone || "Not provided"
                      }
                    />

                    <SummaryItem
                      icon={ShieldCheck}
                      label="Role"
                      value={selectedRole}
                    />

                    <SummaryItem
                      icon={ShieldCheck}
                      label="Status"
                      value={formatRole(form.status)}
                    />

                    <SummaryItem
                      icon={ShieldCheck}
                      label="Permissions"
                      value={`${enabledPermissions} enabled`}
                    />
                  </div>
                </div>

                {/* Permission summary */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        ACCESS
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-900">
                        Permission Coverage
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                      {totalPermissions
                        ? Math.round(
                            (enabledPermissions /
                              totalPermissions) *
                              100
                          )
                        : 0}
                      %
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${
                          totalPermissions
                            ? (enabledPermissions /
                                totalPermissions) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    {enabledPermissions} of{" "}
                    {totalPermissions} permissions enabled.
                  </p>
                </div>

                {/* Security */}

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600">
                      <ShieldCheck size={17} />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-emerald-900">
                        Secure access
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        Access is controlled through role-based
                        permissions and the member's business account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <X
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          {/* ==================================================
              ACTION BAR
          ================================================== */}

          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="hidden sm:block">
                <p className="text-xs text-slate-400">
                  {enabledPermissions} permissions selected.
                </p>
              </div>

              <div className="flex w-full justify-end gap-3 sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate("/team")}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check size={17} />
                      Update Team Member
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

// ======================================================
// FORM FIELD
// ======================================================

const FormField = ({
  label,
  required = false,
  icon: Icon,
  children,
}) => {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        {Icon && (
          <Icon
            size={14}
            className="text-slate-400"
          />
        )}

        <span>{label}</span>

        {required && (
          <span className="text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
};

// ======================================================
// SUMMARY ITEM
// ======================================================

const SummaryItem = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
};

// ======================================================
// FORMAT ROLE
// ======================================================

const formatRole = (value) => {
  if (!value) return "";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

// ======================================================
// BRIEFCASE ICON
// ======================================================

const BriefcaseIcon = () => {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        width="20"
        height="14"
        x="2"
        y="7"
        rx="2"
      />

      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />

      <path d="M2 12h20" />
    </svg>
  );
};

export default EditTeam;
