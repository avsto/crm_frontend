import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  Eye,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";

import orderApi from "../../api/order.api";

// ======================================================
// HELPERS
// ======================================================

const formatCurrency = (amount = 0) => {
  const value = Number(amount || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (date) => {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

// ======================================================
// ORDER STATUS
// ======================================================

const getOrderStatus = (status) => {
  const value = String(status || "").toLowerCase();

  switch (value) {
    case "pending":
      return {
        key: "pending",
        label: "Pending",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };

    case "confirmed":
      return {
        key: "confirmed",
        label: "Confirmed",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };

    case "processing":
      return {
        key: "processing",
        label: "Processing",
        className: "bg-indigo-50 text-indigo-700 border-indigo-200",
      };

    case "shipped":
      return {
        key: "shipped",
        label: "Shipped",
        className: "bg-purple-50 text-purple-700 border-purple-200",
      };

    case "delivered":
      return {
        key: "delivered",
        label: "Delivered",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };

    case "cancelled":
    case "canceled":
      return {
        key: "cancelled",
        label: "Cancelled",
        className: "bg-red-50 text-red-700 border-red-200",
      };

    case "returned":
      return {
        key: "returned",
        label: "Returned",
        className: "bg-orange-50 text-orange-700 border-orange-200",
      };

    case "refunded":
      return {
        key: "refunded",
        label: "Refunded",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      };

    default:
      return {
        key: value || "pending",
        label: status || "Pending",
        className: "bg-gray-50 text-gray-700 border-gray-200",
      };
  }
};

// ======================================================
// PAYMENT STATUS
// ======================================================

const getPaymentStatus = (status) => {
  const value = String(status || "").toLowerCase();

  switch (value) {
    case "paid":
    case "success":
    case "successful":
      return {
        key: "paid",
        label: "Paid",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };

    case "pending":
      return {
        key: "pending",
        label: "Pending",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };

    case "failed":
      return {
        key: "failed",
        label: "Failed",
        className: "bg-red-50 text-red-700 border-red-200",
      };

    case "refunded":
      return {
        key: "refunded",
        label: "Refunded",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      };

    case "cod":
      return {
        key: "cod",
        label: "COD",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };

    default:
      return {
        key: value || "pending",
        label: status || "Pending",
        className: "bg-gray-50 text-gray-700 border-gray-200",
      };
  }
};

// ======================================================
// NORMALIZE ORDER
// ======================================================

const normalizeOrder = (order) => {
  const customer = order?.customer || {};
  const items = Array.isArray(order?.items) ? order.items : [];

  return {
    id: order?._id || order?.id,
    orderNumber:
      order?.orderNumber ||
      order?.orderNo ||
      order?.number ||
      order?._id ||
      "-",
    source: order?.source || "-",
    customerName: order?.customerName || customer?.name || "Walk-in Customer",
    customerPhone:
      order?.customerPhone || customer?.phone || customer?.mobile || "-",
    customerEmail: order?.customerEmail || customer?.email || "-",
    storeName: order?.storeName || order?.store?.name || "-",
    status: order?.status || "pending",
    paymentStatus: order?.paymentStatus || order?.payment?.status || "pending",
    paymentMethod: order?.paymentMethod || order?.payment?.method || "-",
    total: Number(order?.total ?? 0),
    subtotal: Number(order?.subtotal ?? 0),
    discount: Number(order?.discountAmount ?? order?.discount ?? 0),
    shipping: Number(
      order?.shippingAmount ?? order?.shipping ?? order?.shippingCharge ?? 0,
    ),
    tax: Number(order?.taxAmount ?? order?.tax ?? 0),
    itemsCount: items.reduce(
      (sum, item) => sum + Number(item?.quantity || 0),
      0,
    ),
    items,
    customer,
    shippingAddress: order?.shippingAddress ||
      order?.deliveryAddress || {
        name: customer?.name,
        address: customer?.address,
        city: customer?.city,
        state: customer?.state,
        pincode: customer?.pincode,
        phone: customer?.phone,
      },
    delivery: order?.delivery || {},
    invoice: order?.invoice || {},
    notes: order?.notes || "",
    createdAt: order?.createdAt || order?.orderDate,
    updatedAt: order?.updatedAt,
    raw: order,
  };
};

// ======================================================
// EXTRACT ORDERS
// ======================================================

const extractOrders = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openMenu, setOpenMenu] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);

  // ====================================================
  // LOAD ORDERS
  // ====================================================

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await orderApi.getOrders();
      const data = extractOrders(response);
      const normalized = data.map(normalizeOrder);

      setOrders(normalized);
    } catch (err) {
      console.error("❌ Orders API error:", err);
      const message =
        err?.response?.data?.message || err?.message || "Failed to load orders";
      setError(message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Close actions menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenMenu(null);
    if (openMenu) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenu]);

  // ====================================================
  // STATS
  // ====================================================

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSales = orders.reduce(
      (total, order) => total + Number(order.total || 0),
      0,
    );
    const pending = orders.filter(
      (order) => String(order.status).toLowerCase() === "pending",
    ).length;
    const processing = orders.filter((order) => {
      const value = String(order.status).toLowerCase();
      return value === "confirmed" || value === "processing";
    }).length;
    const shipped = orders.filter(
      (order) => String(order.status).toLowerCase() === "shipped",
    ).length;
    const delivered = orders.filter(
      (order) => String(order.status).toLowerCase() === "delivered",
    ).length;
    const cancelled = orders.filter((order) => {
      const value = String(order.status).toLowerCase();
      return value === "cancelled" || value === "canceled";
    }).length;

    return {
      totalOrders,
      totalSales,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
    };
  }, [orders]);

  // ====================================================
  // FILTER
  // ====================================================

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const orderNumber = String(order.orderNumber || "").toLowerCase();
      const customerName = String(order.customerName || "").toLowerCase();
      const phone = String(order.customerPhone || "").toLowerCase();

      const matchesSearch =
        !query ||
        orderNumber.includes(query) ||
        customerName.includes(query) ||
        phone.includes(query);

      const matchesStatus =
        status === "all" || String(order.status).toLowerCase() === status;

      const matchesPayment =
        paymentStatus === "all" ||
        String(order.paymentStatus).toLowerCase() === paymentStatus;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, status, paymentStatus]);

  // ====================================================
  // HANDLERS
  // ====================================================

  const handleStatusUpdate = async (order, newStatus) => {
    if (!order?.id) return;

    try {
      setStatusLoading(order.id);
      setOpenMenu(null);

      await orderApi.updateOrderStatus(order.id, newStatus);

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? { ...item, status: newStatus } : item,
        ),
      );
    } catch (err) {
      console.error("❌ Order status update error:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update order status",
      );
    } finally {
      setStatusLoading(null);
    }
  };

  const handleViewOrder = (order) => {
    setOpenMenu(null);
    if (!order?.id) return;
    navigate(`/orders/${order.id}`);
  };

  const handleEditOrder = (order) => {
    setOpenMenu(null);
    if (!order?.id) return;
    navigate(`/orders/${order.id}/edit`);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPaymentStatus("all");
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* LEFT */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1.5 transition hover:text-gray-900"
                >
                  <ArrowLeft size={15} />
                  Back
                </button>
                <span>/</span>
                <span>Business</span>
                <span>/</span>
                <span className="text-gray-900">Orders</span>
              </div>

              <h1 className="mt-2 text-1xl font-bold tracking-tight text-gray-900">
                Orders
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage customer orders, payments, and fulfillment.
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadOrders}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => navigate("/orders/create")}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <Plus size={17} />
                Create Order
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-[1600px] px-6 py-6">
        {/* CANCELLED NOTIFICATION */}
        {!loading && stats.cancelled > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/50 p-4 text-red-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <XCircle size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {stats.cancelled} cancelled{" "}
                  {stats.cancelled === 1 ? "order" : "orders"}
                </p>
                <p className="text-xs text-red-700">
                  These orders may require refund processing or follow-up.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS CONTAINER */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* SECTION HEADER & FILTERS */}
          <div className="border-b border-gray-200 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              {/* FILTER CHIPS */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("all")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    status === "all"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All ({stats.totalOrders})
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("pending")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    status === "pending"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Pending ({stats.pending})
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("processing")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    status === "processing"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Processing ({stats.processing})
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("shipped")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    status === "shipped"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Shipped ({stats.shipped})
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("delivered")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    status === "delivered"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Delivered ({stats.delivered})
                </button>
              </div>

              {/* SEARCH & SELECTS */}
              <div className="flex flex-col gap-2 sm:flex-row">
                {/* SEARCH */}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search order #, customer, phone..."
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 sm:w-64"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* ORDER STATUS FILTER */}
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-10 appearance-none rounded-xl border border-gray-200 bg-white pl-3 pr-8 text-sm text-gray-700 outline-none focus:border-gray-400"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="returned">Returned</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>

                {/* PAYMENT STATUS FILTER */}
                <div className="relative">
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="h-10 appearance-none rounded-xl border border-gray-200 bg-white pl-3 pr-8 text-sm text-gray-700 outline-none focus:border-gray-400"
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="cod">COD</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="px-5 py-16 text-center">
              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-gray-400"
              />
              <p className="mt-4 text-sm text-gray-500">Loading orders...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertCircle size={22} className="text-red-600" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900">
                Failed to load orders
              </h3>
              <p className="mt-1 text-sm text-red-500">{error}</p>
              <button
                type="button"
                onClick={loadOrders}
                className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Try Again
              </button>
            </div>
          )}

          {/* DESKTOP TABLE */}
          {!loading && !error && (
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Order
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Customer
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Items
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Payment
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const orderStatus = getOrderStatus(order.status);
                      const payment = getPaymentStatus(order.paymentStatus);
                      const isUpdating = statusLoading === order.id;
                      const menuOpen = openMenu === order.id;

                      return (
                        <tr
                          key={order.id}
                          className="border-b border-gray-100 transition hover:bg-gray-50"
                        >
                          {/* ORDER NUMBER */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                <ShoppingBag
                                  size={18}
                                  className="text-gray-600"
                                />
                              </div>
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleViewOrder(order)}
                                  className="text-sm font-semibold text-gray-900 hover:underline"
                                >
                                  #{order.orderNumber}
                                </button>
                                <p className="mt-0.5 text-xs text-gray-500">
                                  Src: {order.source}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* CUSTOMER */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                <User size={14} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {order.customerName}
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                  {order.customerPhone}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* ITEMS */}
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
                              <Package size={14} className="text-gray-400" />
                              {order.itemsCount}
                            </span>
                          </td>

                          {/* AMOUNT */}
                          <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(order.total)}
                            </span>
                          </td>

                          {/* PAYMENT STATUS */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${payment.className}`}
                            >
                              {payment.label}
                            </span>
                          </td>

                          {/* ORDER STATUS */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${orderStatus.className}`}
                            >
                              {orderStatus.label}
                            </span>
                          </td>

                          {/* DATE */}
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-gray-500">
                              <CalendarDays
                                size={14}
                                className="text-gray-400"
                              />
                              {formatDate(order.createdAt)}
                            </span>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                title="View order"
                                onClick={() => handleViewOrder(order)}
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                type="button"
                                title="Edit order"
                                onClick={() => handleEditOrder(order)}
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                              >
                                <Edit3 size={17} />
                              </button>

                              <div
                                className="relative"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    setOpenMenu(menuOpen ? null : order.id)
                                  }
                                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                                >
                                  {isUpdating ? (
                                    <RefreshCw
                                      size={17}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <MoreHorizontal size={18} />
                                  )}
                                </button>

                                {menuOpen && (
                                  <div className="absolute right-0 z-30 mt-1 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
                                    <button
                                      type="button"
                                      onClick={() => handleViewOrder(order)}
                                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <Eye
                                        size={16}
                                        className="text-gray-500"
                                      />
                                      View Order
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleEditOrder(order)}
                                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <Edit3
                                        size={16}
                                        className="text-gray-500"
                                      />
                                      Edit Order
                                    </button>

                                    <div className="my-1 border-t border-gray-100" />

                                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                      Update Status
                                    </p>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStatusUpdate(order, "confirmed")
                                      }
                                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <CheckCircle2
                                        size={16}
                                        className="text-blue-600"
                                      />
                                      Mark Confirmed
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStatusUpdate(order, "processing")
                                      }
                                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <Package
                                        size={16}
                                        className="text-indigo-600"
                                      />
                                      Mark Processing
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStatusUpdate(order, "shipped")
                                      }
                                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <Truck
                                        size={16}
                                        className="text-purple-600"
                                      />
                                      Mark Shipped
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStatusUpdate(order, "delivered")
                                      }
                                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-emerald-600 hover:bg-emerald-50"
                                    >
                                      <CheckCircle2 size={16} />
                                      Mark Delivered
                                    </button>

                                    <div className="my-1 border-t border-gray-100" />

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStatusUpdate(order, "cancelled")
                                      }
                                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <XCircle size={16} />
                                      Cancel Order
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center">
                        <p className="text-sm text-gray-500">
                          No orders found matching your search or filters.
                        </p>
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-2 text-sm font-medium text-gray-900 hover:underline"
                        >
                          Clear Filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
