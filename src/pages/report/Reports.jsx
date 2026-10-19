import React, { useMemo, useState } from "react";

const Reports = () => {
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("overview");

  const data = useMemo(() => {
    const datasets = {
      7: {
        revenue: "₹4.82L",
        orders: 186,
        leads: 642,
        conversion: "28.9%",
        revenueChange: "+12.4%",
        ordersChange: "+8.2%",
        leadsChange: "+15.7%",
        conversionChange: "+3.1%",
        chart: [32, 45, 38, 58, 52, 68, 74],
      },
      30: {
        revenue: "₹18.46L",
        orders: 724,
        leads: 2846,
        conversion: "25.4%",
        revenueChange: "+18.6%",
        ordersChange: "+12.8%",
        leadsChange: "+21.4%",
        conversionChange: "+4.7%",
        chart: [42, 58, 48, 72, 65, 82, 75, 91, 84, 96],
      },
      90: {
        revenue: "₹52.84L",
        orders: 2148,
        leads: 8932,
        conversion: "24.1%",
        revenueChange: "+24.8%",
        ordersChange: "+18.5%",
        leadsChange: "+28.3%",
        conversionChange: "+6.2%",
        chart: [38, 52, 45, 61, 58, 72, 67, 81, 76, 94, 87, 98],
      },
      365: {
        revenue: "₹2.14Cr",
        orders: 8942,
        leads: 36480,
        conversion: "24.5%",
        revenueChange: "+31.6%",
        ordersChange: "+26.4%",
        leadsChange: "+35.8%",
        conversionChange: "+8.1%",
        chart: [28, 35, 42, 38, 51, 58, 54, 67, 72, 69, 84, 92],
      },
    };

    return datasets[dateRange];
  }, [dateRange]);

  const leadSources = [
    {
      name: "Website",
      value: 34,
      leads: 968,
    },
    {
      name: "WhatsApp",
      value: 26,
      leads: 740,
    },
    {
      name: "Facebook",
      value: 18,
      leads: 512,
    },
    {
      name: "Instagram",
      value: 12,
      leads: 341,
    },
    {
      name: "Referral",
      value: 7,
      leads: 199,
    },
    {
      name: "Other",
      value: 3,
      leads: 86,
    },
  ];

  const salesData = [
    {
      name: "Rahul Kumar",
      initials: "RK",
      leads: 286,
      won: 82,
      revenue: "₹4.82L",
      conversion: "28.7%",
    },
    {
      name: "Priya Sharma",
      initials: "PS",
      leads: 254,
      won: 76,
      revenue: "₹4.36L",
      conversion: "29.9%",
    },
    {
      name: "Amit Verma",
      initials: "AV",
      leads: 238,
      won: 61,
      revenue: "₹3.72L",
      conversion: "25.6%",
    },
    {
      name: "Neha Singh",
      initials: "NS",
      leads: 214,
      won: 54,
      revenue: "₹2.98L",
      conversion: "25.2%",
    },
  ];

  const topProducts = [
    {
      name: "Industrial Safety Equipment",
      category: "Safety",
      orders: 184,
      revenue: "₹3.42L",
      growth: "+24.5%",
    },
    {
      name: "LED Lighting Solutions",
      category: "Electrical",
      orders: 162,
      revenue: "₹2.86L",
      growth: "+18.2%",
    },
    {
      name: "Packaging Materials",
      category: "Packaging",
      orders: 148,
      revenue: "₹2.54L",
      growth: "+16.8%",
    },
    {
      name: "Office Furniture",
      category: "Furniture",
      orders: 126,
      revenue: "₹2.18L",
      growth: "+12.4%",
    },
    {
      name: "Industrial Tools",
      category: "Tools",
      orders: 108,
      revenue: "₹1.94L",
      growth: "+9.7%",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Reports
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Track business performance, sales, leads and marketing results.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="overview">Overview Report</option>

                <option value="sales">Sales Report</option>

                <option value="leads">Lead Report</option>

                <option value="marketing">Marketing Report</option>

                <option value="team">Team Report</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last 12 months</option>
              </select>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m5 6H7a2 2 0 01-2-2V5a2 2 0 012-2h6l5 5v11a2 2 0 01-2 2z"
                  />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {/* Revenue */}
          <MetricCard
            title="Total Revenue"
            value={data.revenue}
            change={data.revenueChange}
            subtitle="vs previous period"
            icon="revenue"
            positive
          />

          {/* Orders */}
          <MetricCard
            title="Total Orders"
            value={data.orders.toLocaleString()}
            change={data.ordersChange}
            subtitle="vs previous period"
            icon="orders"
            positive
          />

          {/* Leads */}
          <MetricCard
            title="Total Leads"
            value={data.leads.toLocaleString()}
            change={data.leadsChange}
            subtitle="vs previous period"
            icon="leads"
            positive
          />

          {/* Conversion */}
          <MetricCard
            title="Conversion Rate"
            value={data.conversion}
            change={data.conversionChange}
            subtitle="vs previous period"
            icon="conversion"
            positive
          />
        </div>

        {/* Revenue Chart */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Revenue Overview
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Revenue performance for the selected period.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>

              <span className="text-xs font-medium text-gray-500">Revenue</span>
            </div>
          </div>

          <div className="p-6">
            {/* Chart */}
            <div className="relative h-72">
              {/* Grid */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="border-t border-dashed border-gray-200"
                  />
                ))}
              </div>

              {/* Bars */}
              <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 pt-5">
                {data.chart.map((value, index) => (
                  <div
                    key={index}
                    className="group relative flex h-full flex-1 items-end justify-center"
                  >
                    <div
                      className="w-full max-w-10 rounded-t-lg bg-blue-500 transition hover:bg-blue-600"
                      style={{
                        height: `${value}%`,
                      }}
                    />

                    <div className="absolute bottom-0 translate-y-7 text-xs text-gray-400">
                      {index + 1}
                    </div>

                    <div className="absolute -top-8 hidden rounded-lg bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                      ₹{value}K
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lead Sources + Funnel */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Lead Sources */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-bold text-gray-900">Lead Sources</h2>

              <p className="mt-1 text-sm text-gray-500">
                Where your leads are coming from.
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-5">
                {leadSources.map((source) => (
                  <div key={source.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-800">
                          {source.name}
                        </span>

                        <span className="text-xs text-gray-400">
                          {source.leads} leads
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-gray-900">
                        {source.value}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${source.value}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales Funnel */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-bold text-gray-900">Sales Funnel</h2>

              <p className="mt-1 text-sm text-gray-500">
                Track leads through your sales process.
              </p>
            </div>

            <div className="space-y-3 p-6">
              <FunnelRow
                title="New Leads"
                value="2,846"
                percentage="100%"
                width="100%"
              />

              <FunnelRow
                title="Contacted"
                value="2,148"
                percentage="75.4%"
                width="75%"
              />

              <FunnelRow
                title="Qualified"
                value="1,462"
                percentage="51.3%"
                width="51%"
              />

              <FunnelRow
                title="Proposal"
                value="892"
                percentage="31.3%"
                width="31%"
              />

              <FunnelRow
                title="Negotiation"
                value="624"
                percentage="21.9%"
                width="22%"
              />

              <FunnelRow
                title="Won"
                value="724"
                percentage="25.4%"
                width="25%"
              />
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Sales Team Performance
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Compare team member sales performance.
              </p>
            </div>

            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              View Full Report →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Team Member
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Leads
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Won
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Revenue
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Conversion
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {salesData.map((member) => (
                  <tr key={member.name} className="transition hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                          {member.initials}
                        </div>

                        <span className="text-sm font-semibold text-gray-900">
                          {member.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {member.leads}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {member.won}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {member.revenue}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        {member.conversion}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Products */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Top Performing Products
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Products generating the most revenue.
              </p>
            </div>

            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              View Products →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Orders
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Revenue
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Growth
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {topProducts.map((product, index) => (
                  <tr
                    key={product.name}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
                          {index + 1}
                        </div>

                        <span className="text-sm font-semibold text-gray-900">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.category}
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {product.orders}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {product.revenue}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        {product.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Reports */}
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Quick Reports
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickReport
              title="Lead Report"
              description="Lead sources, status and conversion."
              icon="leads"
            />

            <QuickReport
              title="Sales Report"
              description="Revenue, orders and sales pipeline."
              icon="sales"
            />

            <QuickReport
              title="Marketing Report"
              description="Campaign and channel performance."
              icon="marketing"
            />

            <QuickReport
              title="Team Report"
              description="Individual team performance."
              icon="team"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

/* Metric Card */
const MetricCard = ({ title, value, change, subtitle, icon, positive }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon === "revenue" && <span className="text-lg font-bold">₹</span>}

          {icon === "orders" && (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7h18M5 7v12h14V7M8 7V5a4 4 0 018 0v2"
              />
            </svg>
          )}

          {icon === "leads" && (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-8a4 4 0 110 8 4 4 0 010-8zm6 4a3 3 0 100-6"
              />
            </svg>
          )}

          {icon === "conversion" && (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l6-6 4 4 6-7"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7h4v4"
              />
            </svg>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            positive ? "text-green-600" : "text-red-600"
          }`}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 10l5-5 5 5M10 5v14"
            />
          </svg>

          {change}
        </span>

        <span className="text-xs text-gray-400">{subtitle}</span>
      </div>
    </div>
  );
};

/* Funnel */
const FunnelRow = ({ title, value, percentage, width }) => {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{title}</span>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900">{value}</span>

          <span className="text-xs text-gray-400">{percentage}</span>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{
            width,
          }}
        />
      </div>
    </div>
  );
};

/* Quick Report */
const QuickReport = ({ title, description, icon }) => {
  return (
    <button
      type="button"
      className="group rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon === "leads" && (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-8a4 4 0 110 8 4 4 0 010-8zm6 4a3 3 0 100-6"
              />
            </svg>
          )}

          {icon === "sales" && <span className="font-bold">₹</span>}

          {icon === "marketing" && (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
              />
            </svg>
          )}

          {icon === "team" && (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-8a4 4 0 110 8 4 4 0 010-8zm6 4a3 3 0 100-6"
              />
            </svg>
          )}
        </div>

        <svg
          className="h-5 w-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>

      <h3 className="mt-4 text-sm font-bold text-gray-900">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
    </button>
  );
};

export default Reports;
