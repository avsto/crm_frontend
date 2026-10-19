import React, { useMemo, useState } from "react";

const OrdersReport = () => {
  const [dateRange, setDateRange] = useState("30");
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");

  const data = useMemo(() => {
    const reports = {
      7: {
        orders: 186,
        revenue: "₹4.82L",
        aov: "₹2,591",
        customers: 142,
        ordersGrowth: "+8.2%",
        revenueGrowth: "+12.4%",
        aovGrowth: "+4.8%",
        customerGrowth: "+11.6%",
        chart: [42, 56, 48, 64, 58, 72, 82],
      },
      30: {
        orders: 724,
        revenue: "₹18.46L",
        aov: "₹2,550",
        customers: 518,
        ordersGrowth: "+12.8%",
        revenueGrowth: "+18.6%",
        aovGrowth: "+5.1%",
        customerGrowth: "+16.4%",
        chart: [42, 58, 48, 72, 65, 82, 75, 91, 84, 96],
      },
      90: {
        orders: 2148,
        revenue: "₹52.84L",
        aov: "₹2,461",
        customers: 1486,
        ordersGrowth: "+18.5%",
        revenueGrowth: "+24.8%",
        aovGrowth: "+7.4%",
        customerGrowth: "+21.3%",
        chart: [38, 52, 45, 61, 58, 72, 67, 81, 76, 94, 87, 98],
      },
      365: {
        orders: 8942,
        revenue: "₹2.14Cr",
        aov: "₹2,393",
        customers: 5842,
        ordersGrowth: "+26.4%",
        revenueGrowth: "+31.6%",
        aovGrowth: "+9.2%",
        customerGrowth: "+28.7%",
        chart: [28, 35, 42, 38, 51, 58, 54, 67, 72, 69, 84, 92],
      },
    };

    return reports[dateRange];
  }, [dateRange]);

  const orders = [
    {
      id: "#ORD-10482",
      customer: "ABC Industries Pvt. Ltd.",
      source: "Website",
      items: 8,
      amount: "₹48,500",
      payment: "Paid",
      status: "Delivered",
      date: "28 Aug 2026",
    },
    {
      id: "#ORD-10481",
      customer: "Sharma Enterprises",
      source: "WhatsApp",
      items: 5,
      amount: "₹32,800",
      payment: "Paid",
      status: "Processing",
      date: "28 Aug 2026",
    },
    {
      id: "#ORD-10480",
      customer: "Global Packaging",
      source: "Website",
      items: 12,
      amount: "₹24,600",
      payment: "Pending",
      status: "Pending",
      date: "27 Aug 2026",
    },
    {
      id: "#ORD-10479",
      customer: "Metro Office Solutions",
      source: "Facebook",
      items: 4,
      amount: "₹18,400",
      payment: "Paid",
      status: "Shipped",
      date: "27 Aug 2026",
    },
    {
      id: "#ORD-10478",
      customer: "Techno Industrial",
      source: "Website",
      items: 16,
      amount: "₹56,200",
      payment: "Paid",
      status: "Delivered",
      date: "26 Aug 2026",
    },
    {
      id: "#ORD-10477",
      customer: "Prime Tools India",
      source: "WhatsApp",
      items: 6,
      amount: "₹21,750",
      payment: "Refunded",
      status: "Cancelled",
      date: "26 Aug 2026",
    },
    {
      id: "#ORD-10476",
      customer: "Apex Engineering",
      source: "Website",
      items: 9,
      amount: "₹38,900",
      payment: "Paid",
      status: "Delivered",
      date: "25 Aug 2026",
    },
    {
      id: "#ORD-10475",
      customer: "Digital Office India",
      source: "Instagram",
      items: 3,
      amount: "₹12,600",
      payment: "Paid",
      status: "Shipped",
      date: "25 Aug 2026",
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const statusMatch =
      status === "all" || order.status.toLowerCase() === status;

    const paymentMatch =
      paymentStatus === "all" || order.payment.toLowerCase() === paymentStatus;

    return statusMatch && paymentMatch;
  });

  const orderSources = [
    {
      name: "Website",
      orders: 318,
      percentage: 44,
      revenue: "₹8.42L",
    },
    {
      name: "WhatsApp",
      orders: 186,
      percentage: 26,
      revenue: "₹4.82L",
    },
    {
      name: "Facebook",
      orders: 102,
      percentage: 14,
      revenue: "₹2.74L",
    },
    {
      name: "Instagram",
      orders: 76,
      percentage: 11,
      revenue: "₹1.86L",
    },
    {
      name: "Manual",
      orders: 42,
      percentage: 5,
      revenue: "₹62.4K",
    },
  ];

  const customers = [
    {
      name: "ABC Industries Pvt. Ltd.",
      orders: 24,
      revenue: "₹2.86L",
      average: "₹11,917",
    },
    {
      name: "Sharma Enterprises",
      orders: 21,
      revenue: "₹2.42L",
      average: "₹11,524",
    },
    {
      name: "Apex Engineering",
      orders: 18,
      revenue: "₹2.18L",
      average: "₹12,111",
    },
    {
      name: "Global Packaging",
      orders: 16,
      revenue: "₹1.94L",
      average: "₹12,125",
    },
    {
      name: "Metro Office Solutions",
      orders: 14,
      revenue: "₹1.72L",
      average: "₹12,286",
    },
  ];

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
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50"
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
                    Orders Report
                  </h1>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    Orders
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Monitor orders, revenue, customers and order performance.
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
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
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
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Orders"
            value={data.orders.toLocaleString()}
            growth={data.ordersGrowth}
            icon="orders"
          />

          <MetricCard
            title="Order Revenue"
            value={data.revenue}
            growth={data.revenueGrowth}
            icon="revenue"
          />

          <MetricCard
            title="Average Order Value"
            value={data.aov}
            growth={data.aovGrowth}
            icon="aov"
          />

          <MetricCard
            title="Unique Customers"
            value={data.customers.toLocaleString()}
            growth={data.customerGrowth}
            icon="customers"
          />
        </div>

        {/* Order Chart */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Orders Overview
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Order volume during the selected period.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              <span className="text-xs font-medium text-gray-500">Orders</span>
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
                {data.chart.map((value, index) => (
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
                      {value} orders
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status + Sources */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Order Status */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-bold text-gray-900">Order Status</h2>

              <p className="mt-1 text-sm text-gray-500">
                Current distribution of your orders.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-6">
              <OrderStatusCard
                title="Delivered"
                value="412"
                percentage="56.9%"
                amount="₹10.42L"
                type="delivered"
              />

              <OrderStatusCard
                title="Processing"
                value="126"
                percentage="17.4%"
                amount="₹3.24L"
                type="processing"
              />

              <OrderStatusCard
                title="Shipped"
                value="98"
                percentage="13.5%"
                amount="₹2.82L"
                type="shipped"
              />

              <OrderStatusCard
                title="Pending"
                value="72"
                percentage="9.9%"
                amount="₹1.84L"
                type="pending"
              />

              <OrderStatusCard
                title="Cancelled"
                value="12"
                percentage="1.7%"
                amount="₹28.6K"
                type="cancelled"
              />

              <OrderStatusCard
                title="Refunded"
                value="4"
                percentage="0.6%"
                amount="₹12.4K"
                type="refunded"
              />
            </div>
          </div>

          {/* Order Sources */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-bold text-gray-900">Order Sources</h2>

              <p className="mt-1 text-sm text-gray-500">
                Orders generated from each channel.
              </p>
            </div>

            <div className="space-y-5 p-6">
              {orderSources.map((source) => (
                <div key={source.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-gray-800">
                        {source.name}
                      </span>

                      <span className="ml-2 text-xs text-gray-400">
                        {source.orders} orders
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">
                        {source.revenue}
                      </span>

                      <span className="ml-2 text-xs text-gray-400">
                        {source.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${source.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-bold text-gray-900">Top Customers</h2>

            <p className="mt-1 text-sm text-gray-500">
              Customers generating the highest order value.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[750px] w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Orders
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Revenue
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Avg. Order
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {customers.map((customer, index) => (
                  <tr
                    key={customer.name}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
                          {index + 1}
                        </div>

                        <span className="text-sm font-semibold text-gray-900">
                          {customer.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {customer.orders}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {customer.revenue}
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {customer.average}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest orders across all connected channels.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="delivered">Delivered</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Order
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Source
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Items
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Payment
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
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-blue-600">
                          {order.id}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {order.customer}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                          {order.source}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        {order.items}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                        {order.amount}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <PaymentBadge status={order.payment} />
                      </td>

                      <td className="px-6 py-4 text-center">
                        <OrderBadge status={order.status} />
                      </td>

                      <td className="px-6 py-4 text-right text-sm text-gray-500">
                        {order.date}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="text-sm font-semibold text-gray-700">
                        No orders found
                      </div>

                      <p className="mt-1 text-xs text-gray-400">
                        Try changing your filters.
                      </p>
                    </td>
                  </tr>
                )}
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 10.607a7 7 0 1111.314 0 7 7 0 01-1.61 1.66c-.67.61-1.25 1.35-1.25 2.25H9.08c0-.9-.58-1.64-1.25-2.25-.56-.51-1.13-1.05-1.61-1.66z"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">Order Insight</h3>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                Your website is currently generating the highest number of
                orders. WhatsApp is the second strongest channel. The average
                order value is also increasing, indicating stronger customer
                purchasing behavior.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* Metric Card */
const MetricCard = ({ title, value, growth, icon }) => {
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

          {icon === "revenue" && <span className="text-lg font-bold">₹</span>}

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

          {icon === "customers" && (
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

          {growth}
        </span>

        <span className="text-xs text-gray-400">vs previous period</span>
      </div>
    </div>
  );
};

/* Order Status Card */
const OrderStatusCard = ({ title, value, percentage, amount, type }) => {
  const styles = {
    delivered: "bg-green-50 text-green-700",
    processing: "bg-blue-50 text-blue-700",
    shipped: "bg-indigo-50 text-indigo-700",
    pending: "bg-yellow-50 text-yellow-700",
    cancelled: "bg-red-50 text-red-700",
    refunded: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>

        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${styles[type]}`}
        >
          {percentage}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <span className="text-2xl font-bold text-gray-900">{value}</span>

        <span className="text-sm font-semibold text-gray-600">{amount}</span>
      </div>
    </div>
  );
};

/* Payment Badge */
const PaymentBadge = ({ status }) => {
  const styles = {
    Paid: "bg-green-50 text-green-700",
    Pending: "bg-yellow-50 text-yellow-700",
    Refunded: "bg-purple-50 text-purple-700",
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

/* Order Badge */
const OrderBadge = ({ status }) => {
  const styles = {
    Delivered: "bg-green-50 text-green-700",
    Processing: "bg-blue-50 text-blue-700",
    Shipped: "bg-indigo-50 text-indigo-700",
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

export default OrdersReport;
