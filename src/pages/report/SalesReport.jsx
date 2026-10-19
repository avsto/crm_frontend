import React, { useMemo, useState } from "react";

const SalesReport = () => {
  const [dateRange, setDateRange] = useState("30");
  const [status, setStatus] = useState("all");

  const reportData = useMemo(() => {
    const data = {
      7: {
        revenue: "₹4.82L",
        orders: 186,
        avgOrder: "₹2,591",
        conversion: "28.9%",
        growth: "+12.4%",
        ordersGrowth: "+8.2%",
        avgGrowth: "+4.8%",
        conversionGrowth: "+3.1%",
        chart: [38, 46, 42, 58, 51, 67, 74],
      },
      30: {
        revenue: "₹18.46L",
        orders: 724,
        avgOrder: "₹2,550",
        conversion: "25.4%",
        growth: "+18.6%",
        ordersGrowth: "+12.8%",
        avgGrowth: "+5.1%",
        conversionGrowth: "+4.7%",
        chart: [42, 58, 48, 72, 65, 82, 75, 91, 84, 96],
      },
      90: {
        revenue: "₹52.84L",
        orders: 2148,
        avgOrder: "₹2,461",
        conversion: "24.1%",
        growth: "+24.8%",
        ordersGrowth: "+18.5%",
        avgGrowth: "+7.4%",
        conversionGrowth: "+6.2%",
        chart: [38, 52, 45, 61, 58, 72, 67, 81, 76, 94, 87, 98],
      },
      365: {
        revenue: "₹2.14Cr",
        orders: 8942,
        avgOrder: "₹2,393",
        conversion: "24.5%",
        growth: "+31.6%",
        ordersGrowth: "+26.4%",
        avgGrowth: "+9.2%",
        conversionGrowth: "+8.1%",
        chart: [28, 35, 42, 38, 51, 58, 54, 67, 72, 69, 84, 92],
      },
    };

    return data[dateRange];
  }, [dateRange]);

  const salesPeople = [
    {
      name: "Rahul Kumar",
      initials: "RK",
      leads: 286,
      orders: 82,
      revenue: "₹4.82L",
      conversion: "28.7%",
      growth: "+24.5%",
    },
    {
      name: "Priya Sharma",
      initials: "PS",
      leads: 254,
      orders: 76,
      revenue: "₹4.36L",
      conversion: "29.9%",
      growth: "+21.8%",
    },
    {
      name: "Amit Verma",
      initials: "AV",
      leads: 238,
      orders: 61,
      revenue: "₹3.72L",
      conversion: "25.6%",
      growth: "+18.4%",
    },
    {
      name: "Neha Singh",
      initials: "NS",
      leads: 214,
      orders: 54,
      revenue: "₹2.98L",
      conversion: "25.2%",
      growth: "+15.7%",
    },
    {
      name: "Rohit Gupta",
      initials: "RG",
      leads: 182,
      orders: 48,
      revenue: "₹2.54L",
      conversion: "26.4%",
      growth: "+12.2%",
    },
  ];

  const products = [
    {
      name: "Industrial Safety Equipment",
      category: "Safety",
      units: 184,
      orders: 92,
      revenue: "₹3.42L",
      growth: "+24.5%",
    },
    {
      name: "LED Lighting Solutions",
      category: "Electrical",
      units: 162,
      orders: 78,
      revenue: "₹2.86L",
      growth: "+18.2%",
    },
    {
      name: "Packaging Materials",
      category: "Packaging",
      units: 148,
      orders: 71,
      revenue: "₹2.54L",
      growth: "+16.8%",
    },
    {
      name: "Office Furniture",
      category: "Furniture",
      units: 126,
      orders: 64,
      revenue: "₹2.18L",
      growth: "+12.4%",
    },
    {
      name: "Industrial Tools",
      category: "Tools",
      units: 108,
      orders: 53,
      revenue: "₹1.94L",
      growth: "+9.7%",
    },
  ];

  const recentOrders = [
    {
      id: "#ORD-10482",
      customer: "ABC Industries Pvt. Ltd.",
      salesPerson: "Rahul Kumar",
      amount: "₹48,500",
      status: "Paid",
      date: "28 Aug 2026",
    },
    {
      id: "#ORD-10481",
      customer: "Sharma Enterprises",
      salesPerson: "Priya Sharma",
      amount: "₹32,800",
      status: "Paid",
      date: "28 Aug 2026",
    },
    {
      id: "#ORD-10480",
      customer: "Global Packaging",
      salesPerson: "Amit Verma",
      amount: "₹24,600",
      status: "Pending",
      date: "27 Aug 2026",
    },
    {
      id: "#ORD-10479",
      customer: "Metro Office Solutions",
      salesPerson: "Neha Singh",
      amount: "₹18,400",
      status: "Paid",
      date: "27 Aug 2026",
    },
    {
      id: "#ORD-10478",
      customer: "Techno Industrial",
      salesPerson: "Rahul Kumar",
      amount: "₹56,200",
      status: "Paid",
      date: "26 Aug 2026",
    },
    {
      id: "#ORD-10477",
      customer: "Prime Tools India",
      salesPerson: "Rohit Gupta",
      amount: "₹21,750",
      status: "Cancelled",
      date: "26 Aug 2026",
    },
  ];

  const filteredOrders =
    status === "all"
      ? recentOrders
      : recentOrders.filter((order) => order.status.toLowerCase() === status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Sales Report
                  </h1>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    Sales
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Analyze revenue, orders, conversion and sales team
                  performance.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
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
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
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
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* KPI */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SalesMetric
            title="Total Revenue"
            value={reportData.revenue}
            change={reportData.growth}
            icon="revenue"
          />

          <SalesMetric
            title="Total Orders"
            value={reportData.orders.toLocaleString()}
            change={reportData.ordersGrowth}
            icon="orders"
          />

          <SalesMetric
            title="Average Order Value"
            value={reportData.avgOrder}
            change={reportData.avgGrowth}
            icon="aov"
          />

          <SalesMetric
            title="Conversion Rate"
            value={reportData.conversion}
            change={reportData.conversionGrowth}
            icon="conversion"
          />
        </div>

        {/* Revenue chart */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Sales Revenue</h2>

              <p className="mt-1 text-sm text-gray-500">
                Revenue generated during the selected period.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />

              <span className="text-xs font-medium text-gray-500">Revenue</span>
            </div>
          </div>

          <div className="p-6">
            <div className="relative h-72">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="border-t border-dashed border-gray-200"
                  />
                ))}
              </div>

              <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 pt-5">
                {reportData.chart.map((value, index) => (
                  <div
                    key={index}
                    className="group relative flex h-full flex-1 items-end justify-center"
                  >
                    <div
                      className="w-full max-w-12 rounded-t-lg bg-blue-500 transition hover:bg-blue-600"
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

        {/* Funnel + Payment */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sales Funnel */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-bold text-gray-900">Sales Funnel</h2>

              <p className="mt-1 text-sm text-gray-500">
                Track prospects from lead to closed sale.
              </p>
            </div>

            <div className="space-y-5 p-6">
              <FunnelItem
                title="New Leads"
                value="2,846"
                percent="100%"
                width="100%"
              />

              <FunnelItem
                title="Contacted"
                value="2,148"
                percent="75.4%"
                width="75%"
              />

              <FunnelItem
                title="Qualified"
                value="1,462"
                percent="51.3%"
                width="51%"
              />

              <FunnelItem
                title="Proposal"
                value="892"
                percent="31.3%"
                width="31%"
              />

              <FunnelItem
                title="Negotiation"
                value="624"
                percent="21.9%"
                width="22%"
              />

              <FunnelItem title="Won" value="724" percent="25.4%" width="25%" />
            </div>
          </div>

          {/* Order Status */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-bold text-gray-900">Order Status</h2>

              <p className="mt-1 text-sm text-gray-500">
                Current order distribution.
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <StatusCard
                  title="Paid"
                  value="612"
                  amount="₹15.82L"
                  type="paid"
                />

                <StatusCard
                  title="Pending"
                  value="72"
                  amount="₹1.84L"
                  type="pending"
                />

                <StatusCard
                  title="Processing"
                  value="28"
                  amount="₹62.4K"
                  type="processing"
                />

                <StatusCard
                  title="Cancelled"
                  value="12"
                  amount="₹28.6K"
                  type="cancelled"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Team */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Sales Team Performance
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Compare sales performance across team members.
              </p>
            </div>

            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              View Team →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Sales Person
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Leads
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Orders
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Revenue
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Conversion
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Growth
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {salesPeople.map((person) => (
                  <tr key={person.name} className="transition hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                          {person.initials}
                        </div>

                        <span className="text-sm font-semibold text-gray-900">
                          {person.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {person.leads}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {person.orders}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {person.revenue}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        {person.conversion}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-green-600">
                        {person.growth}
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
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-bold text-gray-900">
              Top Selling Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Products contributing the most to sales revenue.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Units Sold
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
                {products.map((product, index) => (
                  <tr
                    key={product.name}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
                          {index + 1}
                        </span>

                        <span className="text-sm font-semibold text-gray-900">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.category}
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {product.units}
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {product.orders}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {product.revenue}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-green-600">
                        {product.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Sales</h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest orders generated by your sales team.
              </p>
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="all">All Orders</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[950px] w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Order
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Sales Person
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-blue-600">
                        {order.id}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {order.customer}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.salesPerson}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {order.amount}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <OrderStatus status={order.status} />
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insight */}
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 10.607a7 7 0 1111.314 0c-.48.61-1.05 1.15-1.61 1.66-.67.61-1.25 1.35-1.25 2.25H9.08c0-.9-.58-1.64-1.25-2.25-.56-.51-1.13-1.05-1.61-1.66z"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">Sales Insight</h3>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                Revenue is growing faster than order volume, which indicates a
                healthy increase in average order value. Rahul Kumar and Priya
                Sharma are currently leading the sales team by revenue and
                conversion rate.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* KPI */
const SalesMetric = ({ title, value, change, icon }) => {
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

          {icon === "aov" && (
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z"
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
                d="M4 16l6-6 4 4 6-7M16 7h4v4"
              />
            </svg>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
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

        <span className="text-xs text-gray-400">vs previous period</span>
      </div>
    </div>
  );
};

/* Funnel */
const FunnelItem = ({ title, value, percent, width }) => {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{title}</span>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-900">{value}</span>

          <span className="text-xs text-gray-400">{percent}</span>
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

/* Status */
const StatusCard = ({ title, value, amount, type }) => {
  const classes = {
    paid: "bg-green-50 text-green-700",
    pending: "bg-yellow-50 text-yellow-700",
    processing: "bg-blue-50 text-blue-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>

        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${classes[type]}`}
        >
          {value}
        </span>
      </div>

      <p className="mt-3 text-xl font-bold text-gray-900">{amount}</p>
    </div>
  );
};

/* Order status */
const OrderStatus = ({ status }) => {
  const styles = {
    Paid: "bg-green-50 text-green-700",
    Pending: "bg-yellow-50 text-yellow-700",
    Cancelled: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-50 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

export default SalesReport;
