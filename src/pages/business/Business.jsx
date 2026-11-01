import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import businessApi from "../../api/business.api";

// ======================================================
// ICON COMPONENT
// ======================================================

const Icon = ({ name, size = 18, className = "" }) => {
  const paths = {
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    bot: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="3" />
        <path d="M12 3v4M8 13h.01M16 13h.01M9 17h6" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h5" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] || paths.file}
    </svg>
  );
};

// ======================================================
// HELPERS
// ======================================================

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-IN");
};

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

const formatNotificationDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ======================================================
// DASHBOARD STATISTICS
// ======================================================

const statConfig = [
  {
    label: "Total Leads",
    key: "totallead",
    todayKey: "todaylead",
    icon: "users",
    color: "var(--theme-primary)",
    background: "var(--theme-primary-soft)",
  },
  {
    label: "Total Deals",
    key: "totalDeals",
    todayKey: "todayDeals",
    icon: "clock",
    color: "#d97706",
    background: "rgba(245,158,11,.12)",
  },
  {
    label: "Total Sales",
    key: "totalSales",
    todayKey: "todaySales",
    icon: "bot",
    color: "#6366f1",
    background: "rgba(99,102,241,.12)",
    currency: true,
  },
  {
    label: "Total Order",
    key: "totalOrder",
    todayKey: "todayOrder",
    icon: "briefcase",
    color: "var(--theme-primary)",
    background: "var(--theme-primary-soft)",
  },
];

// ======================================================
// REVENUE CHART
// ======================================================

const RevenueChart = ({ period, revenuePerformance }) => {
  const config =
    period === "Monthly"
      ? revenuePerformance?.monthly
      : revenuePerformance?.quarterly;

  const chartData = config?.values || [];
  const labels = config?.labels || [];

  const chartWidth = 590;
  const chartHeight = 275;
  const chartTop = 20;
  const chartBottom = 220;
  const chartLeft = 45;
  const chartRight = 575;

  const maxValue = Math.max(
    10,
    ...chartData.map((value) => Number(value || 0)),
  );

  const points =
    chartData.length > 0
      ? chartData.map((value, index) => ({
          x:
            chartData.length === 1
              ? (chartLeft + chartRight) / 2
              : chartLeft +
                (index * (chartRight - chartLeft)) / (chartData.length - 1),
          y:
            chartBottom -
            (Number(value || 0) / (maxValue * 1.2)) * (chartBottom - chartTop),
        }))
      : [];

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath =
    points.length > 0
      ? [
          linePath,
          `L ${points[points.length - 1].x} ${chartBottom}`,
          `L ${points[0].x} ${chartBottom}`,
          "Z",
        ].join(" ")
      : "";

  const gridValues = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full overflow-hidden">
      {chartData.length === 0 ? (
        <div className="flex h-[275px] items-center justify-center">
          <p className="business-muted text-sm">No revenue data available</p>
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${period} revenue performance chart`}
        >
          <defs>
            <linearGradient id="businessChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--theme-primary)"
                stopOpacity=".22"
              />
              <stop
                offset="100%"
                stopColor="var(--theme-primary)"
                stopOpacity=".01"
              />
            </linearGradient>
          </defs>

          {gridValues.map((value) => {
            const y = chartBottom - value * (chartBottom - chartTop);

            return (
              <g key={value}>
                <line
                  x1={chartLeft}
                  y1={y}
                  x2={chartRight}
                  y2={y}
                  stroke="var(--app-border)"
                  strokeDasharray="5 5"
                />

                <text x="0" y={y - 5} fill="var(--app-muted)" fontSize="12">
                  ₹{Math.round(maxValue * value * 1.2)}k
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#businessChartFill)" />

          <path
            d={linePath}
            fill="none"
            stroke="var(--theme-primary)"
            strokeWidth="2.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="var(--app-surface)"
                stroke="var(--theme-primary)"
                strokeWidth="2.5"
              />

              <title>{`${labels[index]}: ₹${chartData[index]}k`}</title>
            </g>
          ))}

          {labels.map((label, index) => (
            <text
              key={`${label}-${index}`}
              x={points[index]?.x}
              y="249"
              fill="var(--app-muted)"
              fontSize="12"
              textAnchor="middle"
            >
              {label}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
};

// ======================================================
// REUSABLE CARD
// ======================================================

const Card = ({ children, className = "" }) => (
  <div className={`business-card ${className}`}>{children}</div>
);

// ======================================================
// NOTIFICATION ITEM
// ======================================================

const NotificationItem = ({ item }) => {
  const isRead = Boolean(item.isRead);

  return (
    <div
      className={`business-notification-item flex gap-3 rounded-lg p-3 transition ${
        isRead ? "" : "business-notification-unread"
      }`}
    >
      <div className="business-primary-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
        <Icon name="bell" size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="business-heading break-words text-xs font-bold">
            {item.title || "Notification"}
          </h4>

          {!isRead && (
            <span
              className="mt-1 h-2 w-2 shrink-0 rounded-full"
              style={{ background: "var(--theme-primary)" }}
              title="Unread"
            />
          )}
        </div>

        <p className="business-muted mt-1 break-words text-xs leading-5">
          {item.message || item.body || "You have a new notification."}
        </p>

        <div className="business-muted mt-2 flex flex-wrap items-center gap-2 text-[10px]">
          {item.createdAt && (
            <span>{formatNotificationDate(item.createdAt)}</span>
          )}

          {item.reminderAt && (
            <span>Reminder: {formatNotificationDate(item.reminderAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ======================================================
// BUSINESS DASHBOARD
// ======================================================

export default function Business() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState("Monthly");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [aiEnabled, setAiEnabled] = useState(true);

  // API STATE
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ====================================================
  // LOAD DASHBOARD SUMMARY
  // ====================================================

  const loadSummary = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await businessApi.getSummary();

      const result = response?.data?.data || response?.data || response || {};

      setDashboard(result);
    } catch (err) {
      console.error("Business dashboard API error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load dashboard data",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // ====================================================
  // TASK STATE
  // ====================================================

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("business_tasks");
      const parsed = saved ? JSON.parse(saved) : [];

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [taskModal, setTaskModal] = useState(false);
  const [taskName, setTaskName] = useState("");

  useEffect(() => {
    localStorage.setItem("business_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // ====================================================
  // TASK FUNCTIONS
  // ====================================================

  const addTask = (e) => {
    e.preventDefault();

    const title = taskName.trim();

    if (!title) return;

    setTasks((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random()}`,
        title,
        completed: false,
      },
    ]);

    setTaskName("");
    setTaskModal(false);
  };

  const toggleTask = (id) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (id) => {
    setTasks((previous) => previous.filter((task) => task.id !== id));
  };

  const completedTasks = tasks.filter((task) => task.completed).length;

  const pendingTasks = tasks.length - completedTasks;

  // ====================================================
  // API DATA
  // ====================================================

  const pipeline = dashboard?.pipeline || {};

  const pipelineValue = pipeline.totalValue || 0;
  const activeOpportunities = pipeline.activeOpportunities || 0;
  const pipelineTarget = pipeline.target || 0;
  const achievement = pipeline.achievement || 0;

  // Supports numeric notification count
  // and object-based notification count.
  const notificationCount =
    typeof dashboard?.notification === "number"
      ? dashboard.notification
      : dashboard?.notification?.count || 0;

  // Notification list from API
  const notifications = Array.isArray(dashboard?.notifications)
    ? dashboard.notifications
    : Array.isArray(dashboard?.notificationList)
      ? dashboard.notificationList
      : Array.isArray(dashboard?.notification?.list)
        ? dashboard.notification.list
        : [];

  const revenuePerformance = dashboard?.revenuePerformance || {};

  const business = dashboard?.business || {};

  // ====================================================
  // STATISTICS
  // ====================================================

  const stats = statConfig.map((item) => {
    const value = dashboard?.[item.key] || 0;
    const todayValue = dashboard?.[item.todayKey] || 0;

    return {
      ...item,
      value: item.currency ? formatCurrency(value) : formatNumber(value),
      change:
        todayValue > 0 ? `↑ ${formatNumber(todayValue)} today` : "No new today",
      changeColor: todayValue > 0 ? "var(--theme-primary)" : "var(--app-muted)",
    };
  });

  // ====================================================
  // NAVIGATION
  // ====================================================

  const generateReport = () => navigate("/reports");

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="business-dashboard min-h-screen p-3 font-sans sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1700px]">
        {/* HEADER */}

        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Dashboard
            </h1>

            <p className="business-muted mt-1.5 text-xs sm:text-sm">
              {business.name
                ? `${business.name} - Performance summary`
                : "Real-time performance summary and active pipelines."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadSummary(false)}
              disabled={refreshing}
              className="business-secondary-button flex h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold"
            >
              <Icon
                name="refresh"
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <div className="relative w-fit">
              <Icon
                name="calendar"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 business-muted"
              />

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="business-input h-10 appearance-none rounded-lg py-2 pl-9 pr-3 text-xs font-semibold shadow-sm outline-none"
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadSummary()}
              className="font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading && !dashboard ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="business-muted text-sm">Loading dashboard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,2.25fr)_minmax(300px,.95fr)]">
            {/* MAIN CONTENT */}

            <main className="min-w-0">
              {/* STATISTICS */}

              <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                {stats.map((stat) => (
                  <Card
                    key={stat.label}
                    className="p-3.5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="business-muted text-[10px] font-bold tracking-wide sm:text-xs">
                        {stat.label}
                      </span>

                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          background: stat.background,
                          color: stat.color,
                        }}
                      >
                        <Icon name={stat.icon} size={18} />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                        {stat.value}
                      </h2>

                      <span
                        className="whitespace-nowrap text-[10px] font-bold sm:text-xs"
                        style={{ color: stat.changeColor }}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* MAIN WIDGETS */}

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(230px,.92fr)_minmax(0,2fr)]">
                {/* LEFT SIDE */}

                <div className="flex flex-col gap-4">
                  {/* PIPELINE */}

                  <Card className="flex min-h-[260px] flex-col justify-center p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="business-muted text-xs font-bold uppercase tracking-wide">
                        Total Pipeline Value
                      </h3>

                      <span className="business-primary-soft rounded-md px-2.5 py-1 text-[10px] font-bold">
                        Active
                      </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                      {formatCurrency(pipelineValue)}
                    </h2>

                    <p className="business-muted mt-1 text-xs">
                      Across {formatNumber(activeOpportunities)} open
                      opportunities
                    </p>

                    <div className="business-progress-track mt-8 h-2.5 overflow-hidden rounded-full">
                      <div
                        className="business-progress-fill h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            Math.max(Number(achievement), 0),
                            100,
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="business-muted mt-3 flex justify-between gap-2 text-[11px] font-medium sm:text-xs">
                      <span>Target: {formatCurrency(pipelineTarget)}</span>

                      <span>{achievement}% Achieved</span>
                    </div>
                  </Card>

                  {/* FINANCIAL REPORT */}

                  <button
                    type="button"
                    onClick={generateReport}
                    className="business-card group flex items-center gap-3 p-4 text-left transition hover:shadow-md"
                  >
                    <div className="business-icon-box flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
                      <Icon name="file" size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold">
                        Generate Financial Report
                      </h3>

                      <p className="business-muted mt-1 text-xs leading-5">
                        Export detailed conversion metrics
                      </p>
                    </div>

                    <Icon
                      name="arrow"
                      size={19}
                      className="business-muted shrink-0 transition group-hover:translate-x-1"
                    />
                  </button>
                </div>

                {/* REVENUE PERFORMANCE */}

                <Card className="min-w-0 p-4 sm:p-5">
                  <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <h2 className="text-base font-bold">
                        Revenue Performance
                      </h2>

                      <p className="business-muted mt-1 text-xs">
                        Revenue trend overview
                      </p>
                    </div>

                    <div className="business-segmented flex w-fit rounded-lg p-1">
                      {["Monthly", "Quarterly"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setPeriod(item)}
                          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                            period === item
                              ? "business-segment-active"
                              : "business-muted"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <RevenueChart
                    period={period}
                    revenuePerformance={revenuePerformance}
                  />

                  <div className="business-divider mt-3 flex items-center justify-between border-t pt-3">
                    <span className="business-muted text-[11px]">
                      Showing {period.toLowerCase()} performance
                    </span>

                    <span className="business-primary flex items-center gap-1.5 text-[11px] font-semibold">
                      <span className="business-primary-dot h-2 w-2 rounded-full" />
                      Revenue trend
                    </span>
                  </div>
                </Card>
              </div>
            </main>

            {/* RIGHT SIDEBAR */}

            <aside className="flex min-w-0 flex-col gap-5">
              {/* BUSINESS DETAILS */}

              

              {/* AI ENGINE */}

              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="business-primary-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <Icon name="bot" size={22} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold">Brielix AI Engine</h3>

                    <p
                      className={`mt-0.5 text-xs font-medium ${
                        aiEnabled ? "business-primary" : "business-muted"
                      }`}
                    >
                      {aiEnabled
                        ? "Active & Smart Routing"
                        : "Currently Disabled"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAiEnabled((value) => !value)}
                    role="switch"
                    aria-checked={aiEnabled}
                    aria-label="Toggle AI engine"
                    className={`business-switch ml-auto flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${
                      aiEnabled ? "is-on" : ""
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        aiEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <div className="business-subtle rounded-lg border p-3 text-center">
                    <p className="business-muted text-[10px] font-bold uppercase">
                      Conversations
                    </p>

                    <h3 className="mt-1.5 text-xl font-bold">842</h3>
                  </div>

                  <div className="business-subtle rounded-lg border p-3 text-center">
                    <p className="business-muted text-[10px] font-bold uppercase">
                      Time Saved
                    </p>

                    <h3 className="mt-1.5 text-xl font-bold">48 hrs</h3>
                  </div>
                </div>
              </Card>

              {/* NOTIFICATIONS */}

              <Card className="overflow-hidden">
                <div className="business-divider flex items-center justify-between gap-2 border-b px-4 py-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold">
                    <Icon name="bell" size={17} className="business-muted" />
                    Remainder
                  </h3>

                  <span className="business-primary-soft whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-bold">
                    {formatNumber(notificationCount)} Unread
                  </span>
                </div>

                <div className="max-h-[262px] space-y-2 overflow-y-auto p-3">
                  {notifications.length > 0 ? (
                    notifications.map((item, index) => (
                      <NotificationItem
                        key={item._id || item.id || index}
                        item={item}
                      />
                    ))
                  ) : (
                    <div className="business-subtle flex min-h-[180px] flex-col items-center justify-center rounded-lg border p-5 text-center">
                      <div className="business-primary-soft flex h-12 w-12 items-center justify-center rounded-full">
                        <Icon name="bell" size={22} />
                      </div>

                      <h4 className="mt-3 text-sm font-bold">
                        No notifications
                      </h4>

                      <p className="business-muted mt-1 text-xs leading-5">
                        You're all caught up. New notifications will appear
                        here.
                      </p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="business-divider border-t px-4 py-3">
                    <p className="business-muted text-center text-[10px]">
                      Showing latest {notifications.length} notifications
                    </p>
                  </div>
                )}
              </Card>
            </aside>
          </div>
        )}
      </div>

      {/* ADD TASK MODAL */}

      {taskModal && (
        <div
          className="business-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setTaskModal(false);
            }
          }}
        >
          <div
            className="business-modal w-full max-w-sm rounded-xl border p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-task-title"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 id="add-task-title" className="text-lg font-bold">
                  Add New Task
                </h2>

                <p className="business-muted mt-1 text-xs">
                  Create a task for your business
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTaskModal(false)}
                className="business-icon-button rounded-lg p-2 transition"
                aria-label="Close modal"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={addTask}>
              <label
                htmlFor="business-task-name"
                className="business-heading mb-2 block text-xs font-semibold"
              >
                Task Name *
              </label>

              <input
                id="business-task-name"
                autoFocus
                required
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Enter task name"
                className="business-input h-10 w-full rounded-lg px-3 text-xs outline-none transition"
              />

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTaskModal(false);
                    setTaskName("");
                  }}
                  className="business-secondary-button rounded-lg px-4 py-2 text-xs font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!taskName.trim()}
                  className="business-primary-button rounded-lg px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* THEME CSS */}

      <style>{`
        .business-dashboard {
          background: var(--app-bg);
          color: var(--app-heading);
        }

        .business-card {
          background: var(--app-surface);
          border: 1px solid var(--app-border);
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.035);
          color: var(--app-heading);
        }

        .business-heading {
          color: var(--app-heading);
        }

        .business-muted {
          color: var(--app-muted);
        }

        .business-primary {
          color: var(--theme-primary);
        }

        .business-primary-soft {
          background: var(--theme-primary-soft);
          color: var(--theme-primary);
        }

        .business-primary-dot,
        .business-progress-fill {
          background: var(--theme-primary);
        }

        .business-progress-track {
          background: var(--app-subtle);
          border-color: var(--app-border);
        }

        .business-icon-box {
          color: var(--theme-primary);
          background: var(--theme-primary-soft);
          border: 1px solid var(--theme-primary-border);
        }

        .business-subtle {
          background: var(--app-subtle);
          border-color: var(--app-border);
        }

        .business-divider {
          border-color: var(--app-border);
        }

        .business-segmented {
          background: var(--app-subtle);
          border: 1px solid var(--app-border);
        }

        .business-segment-active {
          background: var(--app-surface);
          color: var(--app-heading);
          box-shadow: 0 1px 3px rgba(0, 0, 0, .08);
        }

        .business-task:hover,
        .business-notification-item:hover {
          background: var(--app-hover);
        }

      

        .business-checkbox {
          accent-color: var(--theme-primary);
        }

        .business-input {
          background: var(--app-surface);
          color: var(--app-heading);
          border: 1px solid var(--app-border);
        }

        .business-input:focus {
          border-color: var(--theme-primary);
          box-shadow: 0 0 0 3px var(--theme-primary-soft);
        }

        .business-input::placeholder {
          color: var(--app-muted);
        }

        .business-secondary-button {
          color: var(--app-body);
          background: var(--app-subtle);
          border: 1px solid var(--app-border);
        }

        .business-secondary-button:hover {
          color: var(--theme-primary);
          background: var(--theme-primary-soft);
          border-color: var(--theme-primary-border);
        }

        .business-primary-button {
          background: var(--theme-primary);
          color: #fff;
        }

        .business-primary-button:hover:not(:disabled) {
          filter: brightness(.92);
        }

        .business-switch {
          background: var(--app-border);
        }

        .business-switch.is-on {
          background: var(--theme-primary);
        }

        .business-modal-overlay {
          background: rgba(15, 23, 42, .55);
        }

        .business-modal {
          background: var(--app-surface);
          border-color: var(--app-border);
          color: var(--app-heading);
        }

        .business-icon-button {
          color: var(--app-muted);
        }

        .business-icon-button:hover {
          background: var(--app-hover);
          color: var(--app-heading);
        }
      `}</style>
    </div>
  );
}
