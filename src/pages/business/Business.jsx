import React, { useCallback, useEffect, useState } from "react";

import businessApi from "../../api/business.api";

import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CircleDollarSign,
  FileText,
  Filter,
  Globe2,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

/* ============================================================

   HELPERS

\============================================================ */

const getResponseData = (response) => {
  return response?.data?.data || response?.data || response || {};
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",

    currency: "INR",

    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

/* ============================================================

   SMALL ICON

\============================================================ */

const IconBox = ({ icon: Icon, className = "bg-slate-100 text-slate-600" }) => {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${className}`}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
};

/* ============================================================

   TOP KPI

\============================================================ */

const TopKpi = ({
  title,

  value,

  change,

  changeType = "up",

  icon: Icon,

  iconClass = "text-blue-600",

  iconBg = "bg-blue-50",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-4 w-4 ${iconClass}`} />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1">
        {changeType === "up" ? (
          <ArrowUpRight className="h-3 w-3 text-emerald-500" />
        ) : (
          <ArrowDownRight className="h-3 w-3 text-red-500" />
        )}

        <span
          className={`text-xs font-semibold ${
            changeType === "up" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {change}
        </span>

        <span className="text-xs text-slate-400">today</span>
      </div>
    </div>
  );
};

/* ============================================================

   SECTION HEADER

\============================================================ */

const SectionHeader = ({ title, subtitle, icon: Icon, action }) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-3.5 w-3.5 text-slate-600" />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-slate-900">{title}</h2>

          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
};

/* ============================================================

   METRIC ROW

\============================================================ */

const MetricRow = ({
  label,

  value,

  icon: Icon,

  iconClass = "text-slate-500",
}) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && <Icon className={`h-3.5 w-3.5 ${iconClass}`} />}

        <span className="truncate text-sm font-medium text-slate-600">
          {label}
        </span>
      </div>

      <span className="ml-2 text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
};

/* ============================================================

   PIPELINE ROW

\============================================================ */

const PipelineRow = ({
  label,

  value,

  percentage,

  barClass = "bg-blue-500",
}) => {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{label}</span>

        <span className="text-sm font-semibold text-slate-800">
          {formatNumber(value)}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{
            width: `${Math.min(Math.max(percentage, 3), 100)}%`,
          }}
        />
      </div>
    </div>
  );
};

/* ============================================================

   EMPTY STATE

\============================================================ */

const EmptyState = ({ icon: Icon = FileText, title, description }) => {
  return (
    <div className="flex min-h-[180px] items-center justify-center px-5">
      <div className="text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <Icon className="h-4 w-4 text-slate-400" />
        </div>

        <p className="mt-2 text-xs font-semibold text-slate-700">{title}</p>

        <p className="mx-auto mt-1 max-w-[220px] text-xs leading-4 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
};

/* ============================================================

   SALES PERFORMANCE

\============================================================ */

const SalesPerformance = ({ orders }) => {
  const totalSales = Number(orders?.totalSales || 0);

  const todaySales = Number(orders?.todaySales || 0);

  const totalOrders = Number(orders?.totalOrders || 0);

  const todayOrders = Number(orders?.todayOrders || 0);

  const salesProgress =
    totalSales > 0
      ? Math.min(Math.max((todaySales / totalSales) * 100, 2), 100)
      : 2;

  const orderProgress =
    totalOrders > 0
      ? Math.min(Math.max((todayOrders / totalOrders) * 100, 2), 100)
      : 2;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
      <SectionHeader
        title="Sales Performance"
        subtitle="Current business performance"
        icon={TrendingUp}
        action={
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="text-xs font-medium text-slate-400">
              Live data
            </span>
          </div>
        }
      />

      <div className="p-5">
        <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
          {/* Main sales */}

          <div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Total Sales
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(totalSales)}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 px-2.5 py-1.5 text-right">
                <p className="text-xs text-emerald-600">Today</p>

                <p className="text-xs font-bold text-emerald-700">
                  {formatCurrency(todaySales)}
                </p>
              </div>
            </div>

            {/* Visual chart */}

            <div className="mt-6 flex h-28 items-end gap-2">
              {[35, 48, 38, 62, 55, 72, 58, 76, 68, 84, 73, 92].map(
                (height, index) => (
                  <div key={index} className="flex h-full flex-1 items-end">
                    <div
                      className={`w-full rounded-t-md transition ${
                        index === 11 ? "bg-emerald-500" : "bg-emerald-100"
                      }`}
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  </div>
                ),
              )}
            </div>

            <div className="mt-2 flex justify-between text-[10px] text-slate-400">
              <span>Earlier</span>

              <span>Current</span>
            </div>
          </div>

          {/* Stats */}

          <div className="space-y-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Orders</span>

                <ShoppingCart className="h-3.5 w-3.5 text-blue-500" />
              </div>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatNumber(totalOrders)}
              </p>

              <div className="mt-2 h-1.5 rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${orderProgress}%` }}
                />
              </div>

              <p className="mt-1 text-xs text-slate-400">
                {formatNumber(todayOrders)} today
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Today's Sales</span>

                <CircleDollarSign className="h-3.5 w-3.5 text-emerald-500" />
              </div>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatCurrency(todaySales)}
              </p>

              <div className="mt-2 h-1.5 rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${salesProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================

   LEAD PIPELINE

\============================================================ */

const LeadPipeline = ({ leads }) => {
  const total = Number(leads?.total || 0);

  const newLeads = Number(leads?.new || 0);

  const followUps = Number(leads?.followUpsToday || 0);

  const meetings = Number(leads?.meetingsToday || 0);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
      <SectionHeader
        title="Lead Pipeline"
        subtitle="Lead activity overview"
        icon={Users}
      />

      <div className="space-y-4 p-5">
        {total > 0 ? (
          <>
            <PipelineRow
              label="Total Leads"
              value={total}
              percentage={100}
              barClass="bg-blue-500"
            />

            <PipelineRow
              label="New Leads"
              value={newLeads}
              percentage={total ? (newLeads / total) * 100 : 3}
              barClass="bg-indigo-500"
            />

            <PipelineRow
              label="Follow-ups Today"
              value={followUps}
              percentage={total ? (followUps / total) * 100 : 3}
              barClass="bg-amber-500"
            />

            <PipelineRow
              label="Meetings Today"
              value={meetings}
              percentage={total ? (meetings / total) * 100 : 3}
              barClass="bg-emerald-500"
            />
          </>
        ) : (
          <EmptyState
            icon={Users}
            title="No leads yet"
            description="Start adding leads to build your CRM pipeline."
          />
        )}
      </div>
    </div>
  );
};

/* ============================================================

   DEAL PIPELINE

\============================================================ */

const DealPipeline = ({ deals }) => {
  const total = Number(deals?.total || 0);

  const won = Number(deals?.won || 0);

  const lost = Number(deals?.lost || 0);

  const open = Math.max(total - won - lost, 0);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
      <SectionHeader
        title="Deal Pipeline"
        subtitle="Opportunity status"
        icon={BriefcaseBusiness}
      />

      <div className="space-y-4 p-5">
        {total > 0 ? (
          <>
            <PipelineRow
              label="Open Deals"
              value={open}
              percentage={total ? (open / total) * 100 : 3}
              barClass="bg-violet-500"
            />

            <PipelineRow
              label="Won"
              value={won}
              percentage={total ? (won / total) * 100 : 3}
              barClass="bg-emerald-500"
            />

            <PipelineRow
              label="Lost"
              value={lost}
              percentage={total ? (lost / total) * 100 : 3}
              barClass="bg-red-500"
            />

            <div className="mt-4 rounded-xl bg-violet-50 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-violet-600">
                  Pipeline Value
                </span>

                <CircleDollarSign className="h-3.5 w-3.5 text-violet-500" />
              </div>

              <p className="mt-1 text-base font-bold text-violet-900">
                {formatCurrency(deals?.value)}
              </p>
            </div>
          </>
        ) : (
          <EmptyState
            icon={BriefcaseBusiness}
            title="No deals yet"
            description="Create deals from your qualified leads."
          />
        )}
      </div>
    </div>
  );
};

/* ============================================================

   ORDERS

\============================================================ */

const OrdersSummary = ({ orders }) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
      <SectionHeader
        title="Orders & Sales"
        subtitle="Order and payment status"
        icon={ShoppingCart}
      />

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricRow
          label="Total Orders"
          value={formatNumber(orders?.totalOrders)}
          icon={ShoppingCart}
          iconClass="text-blue-500"
        />

        <MetricRow
          label="Today's Orders"
          value={formatNumber(orders?.todayOrders)}
          icon={CalendarDays}
          iconClass="text-indigo-500"
        />

        <MetricRow
          label="Completed"
          value={formatNumber(orders?.completedOrders)}
          icon={CheckCircle2}
          iconClass="text-emerald-500"
        />

        <MetricRow
          label="Pending"
          value={formatNumber(orders?.pendingOrders)}
          icon={Clock3}
          iconClass="text-amber-500"
        />

        <MetricRow
          label="Total Sales"
          value={formatCurrency(orders?.totalSales)}
          icon={TrendingUp}
          iconClass="text-emerald-500"
        />

        <MetricRow
          label="Today's Sales"
          value={formatCurrency(orders?.todaySales)}
          icon={CircleDollarSign}
          iconClass="text-green-500"
        />

        <MetricRow
          label="Pending Payments"
          value={formatCurrency(orders?.pendingPayments)}
          icon={CircleDollarSign}
          iconClass="text-red-500"
        />

        <MetricRow
          label="Deal Value"
          value={formatCurrency(0)}
          icon={BriefcaseBusiness}
          iconClass="text-violet-500"
        />
      </div>
    </div>
  );
};

/* ============================================================

   WEBSITE STATUS

\============================================================ */

const WebsiteStatus = ({ website }) => {
  const statusItems = [
    {
      label: "Websites",

      value: website?.total,

      icon: Globe2,

      color: "text-blue-500",
    },

    {
      label: "Published",

      value: website?.published,

      icon: CheckCircle2,

      color: "text-emerald-500",
    },

    {
      label: "Draft",

      value: website?.draft,

      icon: FileText,

      color: "text-amber-500",
    },

    {
      label: "Custom Domain",

      value: website?.customDomain,

      icon: Globe2,

      color: "text-violet-500",
    },

    {
      label: "SSL Enabled",

      value: website?.sslEnabled,

      icon: CheckCircle2,

      color: "text-emerald-500",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
      <SectionHeader title="Website" subtitle="Website status" icon={Globe2} />

      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
        {statusItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`h-3.5 w-3.5 ${item.color}`} />

                <span className="truncate text-xs font-medium text-slate-500">
                  {item.label}
                </span>
              </div>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {formatNumber(item.value)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================

   REMINDERS

\============================================================ */

const Reminders = ({ notifications = [], unread = 0 }) => {
  const [date, setDate] = useState(new Date());

  const changeDate = (amount) => {
    const next = new Date(date);

    next.setDate(next.getDate() + amount);

    setDate(next);
  };

  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  });

  const dayName = date.toLocaleDateString("en-IN", {
    weekday: "long",
  });

  return (
    <aside className="sticky top-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
      {/* Header */}

      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50">
              <Bell className="h-4 w-4 text-violet-600" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">Reminders</h2>

              <p className="text-xs text-slate-400">
                Follow-ups & appointments
              </p>
            </div>
          </div>

          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-100 px-1.5 text-xs font-bold text-violet-700">
            {JSON.stringify(unread)}
          </span>
        </div>
      </div>

      {/* Date Filter */}

      <div className="border-b border-slate-100 bg-slate-50/60 p-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => changeDate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 hover:bg-slate-50"
          >
            ←
          </button>

          <div className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white">
            <CalendarDays className="h-3.5 w-3.5 text-slate-500" />

            <span className="text-xs font-semibold text-slate-700">
              {formattedDate}
            </span>
          </div>

          <button
            type="button"
            onClick={() => changeDate(1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 hover:bg-slate-50"
          >
            →
          </button>
        </div>
      </div>

      {/* Day */}

      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-xs font-bold text-slate-800">{dayName}</p>

        <p className="mt-0.5 text-xs text-slate-400">Your schedule for today</p>
      </div>

      {/* Empty */}

      {/* Notification List */}
      <div className="max-h-[390px] min-h-[260px] overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="space-y-0 divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`group px-4 py-4 transition-colors hover:bg-slate-50/80 ${
                  !notification.isRead ? "bg-violet-50/30" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      !notification.isRead
                        ? "bg-violet-100 text-violet-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="break-words text-[13px] font-semibold leading-5 text-slate-800">
                        {notification.title || "Notification"}
                      </h3>

                      {!notification.isRead && (
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500"
                          title="Unread"
                        />
                      )}
                    </div>

                    {notification.message && (
                      <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {notification.reminderAt && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {new Date(notification.reminderAt).toLocaleString(
                            "en-IN",
                            {
                              timeZone: "Asia/Kolkata",
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      )}

                      {notification.createdAt && (
                        <span className="text-[11px] text-slate-400">
                          {new Date(notification.createdAt).toLocaleString(
                            "en-IN",
                            {
                              timeZone: "Asia/Kolkata",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center px-5 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <CalendarDays className="h-5 w-5 text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              No reminders
            </h3>

            <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-400">
              You don't have any notifications or follow-ups yet.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}

      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          className="w-full rounded-xl border border-slate-200/80 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          View All Reminders
        </button>
      </div>
    </aside>
  );
};

/* ============================================================

   MAIN COMPONENT

\============================================================ */

const Business = () => {
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [dateFilter, setDateFilter] = useState("this_month");

  const loadSummary = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await businessApi.getSummary();

      const data = getResponseData(response);

      setSummary(data);
    } catch (err) {
      console.error("Business summary error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load business dashboard.",
      );
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const business = summary?.business || {};

  const leads = summary?.leads || {};

  const deals = summary?.deals || {};

  const orders = summary?.orders || {};

  const website = summary?.website || {};

  const notificationData = summary?.notifications || {};

  const notifications = notificationData.notifications || [];

  /* ============================================================

     LOADING

  \============================================================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-4">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-3">
              <div className="h-16 animate-pulse rounded-xl bg-white" />

              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-xl bg-white"
                  />
                ))}
              </div>

              <div className="h-80 animate-pulse rounded-xl bg-white" />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-64 animate-pulse rounded-xl bg-white" />

                <div className="h-64 animate-pulse rounded-xl bg-white" />
              </div>

              <div className="h-40 animate-pulse rounded-xl bg-white" />
            </div>

            <div className="h-[700px] animate-pulse rounded-xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================

     ERROR

  \============================================================ */

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-5">
        <div className="mx-auto max-w-lg pt-20">
          <div className="rounded-xl border border-red-200 bg-white p-7 text-center shadow-sm">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>

            <h2 className="mt-3 text-sm font-bold text-slate-900">
              Dashboard couldn't load
            </h2>

            <p className="mt-1 text-xs text-slate-500">{error}</p>

            <button
              type="button"
              onClick={() => loadSummary()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================

     DASHBOARD

  \============================================================ */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="mx-auto max-w-[1600px] px-3 py-5 sm:px-5 lg:px-7">
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* ==================================================

              LEFT MAIN CONTENT

          \================================================== */}

          <main className="min-w-0 space-y-5">
            {/* Header */}

            <header className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                      {business?.name || "Business Dashboard"}
                    </h1>

                    {business?.status && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          business.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {business.status}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Here's what's happening with your business today
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Date Filter */}

                  <div className="relative">
                    <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="h-10 appearance-none rounded-xl border border-slate-200/80 bg-white pl-9 pr-8 text-sm font-semibold text-slate-600 outline-none transition focus:border-gray-400"
                    >
                      <option value="today">Today</option>

                      <option value="this_week">This Week</option>

                      <option value="this_month">This Month</option>

                      <option value="this_year">This Year</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                  </div>

                  {/* Date */}

                  {/* Refresh */}

                  <button
                    type="button"
                    onClick={() => loadSummary(true)}
                    disabled={refreshing}
                    title="Refresh dashboard"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        refreshing ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </header>

            {/* ==================================================

                TOP KPIs

            \================================================== */}

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <TopKpi
                title="Total Leads"
                value={formatNumber(leads.total)}
                change={`+${formatNumber(leads.new)}`}
                icon={Users}
                iconClass="text-blue-600"
                iconBg="bg-blue-50"
              />

              <TopKpi
                title="Total Deals"
                value={formatNumber(deals.total)}
                change={formatCurrency(deals.value)}
                icon={BriefcaseBusiness}
                iconClass="text-violet-600"
                iconBg="bg-violet-50"
              />

              <TopKpi
                title="Total Sales"
                value={formatCurrency(orders.totalSales)}
                change={formatCurrency(orders.todaySales)}
                icon={TrendingUp}
                iconClass="text-emerald-600"
                iconBg="bg-emerald-50"
              />

              <TopKpi
                title="Total Orders"
                value={formatNumber(orders.totalOrders)}
                change={`+${formatNumber(orders.todayOrders)}`}
                icon={ShoppingCart}
                iconClass="text-orange-600"
                iconBg="bg-orange-50"
              />
            </div>

            {/* ==================================================

                SALES PERFORMANCE

            \================================================== */}

            <SalesPerformance orders={orders} />

            {/* ==================================================

                LEAD + DEAL PIPELINE

            \================================================== */}

            <div className="grid gap-4 md:grid-cols-2">
              <LeadPipeline leads={leads} />

              <DealPipeline deals={deals} />
            </div>

            {/* ==================================================

                ORDERS

            \================================================== */}

            <OrdersSummary orders={orders} />

            {/* ==================================================

                WEBSITE

            \================================================== */}

            <WebsiteStatus website={website} />
          </main>

          {/* ==================================================

              RIGHT REMINDERS

          \================================================== */}

          <Reminders
            notifications={summary.notifications?.notifications || []}
            unread={summary?.notifications?.unread || 0}
          />
        </div>
      </div>
    </div>
  );
};

export default Business;
