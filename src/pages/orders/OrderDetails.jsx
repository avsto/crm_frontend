import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Edit3,
  FileText,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  User,
  XCircle,
  ShoppingBag
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import orderApi from "../../api/order.api";

// ======================================================
// HELPERS
// ======================================================

const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
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

const formatDateTime = (date) => {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

// ======================================================
// STATUS
// ======================================================

const getOrderStatus = (status) => {
  const value = String(status || "").toLowerCase();

  switch (value) {
    case "pending":
      return {
        label: "Pending",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock3,
      };

    case "confirmed":
      return {
        label: "Confirmed",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: CheckCircle2,
      };

    case "processing":
      return {
        label: "Processing",
        className: "bg-indigo-50 text-indigo-700 border-indigo-200",
        icon: Package,
      };

    case "shipped":
      return {
        label: "Shipped",
        className: "bg-purple-50 text-purple-700 border-purple-200",
        icon: Truck,
      };

    case "delivered":
      return {
        label: "Delivered",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      };

    case "cancelled":
    case "canceled":
      return {
        label: "Cancelled",
        className: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      };

    case "returned":
      return {
        label: "Returned",
        className: "bg-orange-50 text-orange-700 border-orange-200",
        icon: RefreshCw,
      };

    case "refunded":
      return {
        label: "Refunded",
        className: "bg-gray-100 text-gray-700 border-gray-200",
        icon: RefreshCw,
      };

    default:
      return {
        label: status || "Pending",
        className: "bg-gray-50 text-gray-700 border-gray-200",
        icon: Clock3,
      };
  }
};

const getPaymentStatus = (status) => {
  const value = String(status || "").toLowerCase();

  switch (value) {
    case "paid":
    case "success":
    case "successful":
      return {
        label: "Paid",
        className: "bg-emerald-50 text-emerald-700",
      };

    case "pending":
      return {
        label: "Pending",
        className: "bg-amber-50 text-amber-700",
      };

    case "failed":
      return {
        label: "Failed",
        className: "bg-red-50 text-red-700",
      };

    case "refunded":
      return {
        label: "Refunded",
        className: "bg-gray-100 text-gray-700",
      };

    case "cod":
      return {
        label: "COD",
        className: "bg-blue-50 text-blue-700",
      };

    default:
      return {
        label: status || "Pending",
        className: "bg-gray-50 text-gray-700",
      };
  }
};

// ======================================================
// EXTRACT ORDER
// ======================================================

const extractOrder = (response) => {
  const data = response?.data;

  if (data?.data) {
    return data.data;
  }

  if (data?.order) {
    return data.order;
  }

  if (data?._id) {
    return data;
  }

  return null;
};

// ======================================================
// INFO ROW
// ======================================================

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>

      <span className="text-right text-sm font-medium text-gray-900">
        {value || "-"}
      </span>
    </div>
  );
};

// ======================================================
// ORDER DETAILS
// ======================================================

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ====================================================
  // LOAD ORDER
  // ====================================================

  const loadOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await orderApi.getOrder(id);

      console.log("📦 ORDER DETAIL RESPONSE:", response);

      const data = extractOrder(response);

      if (!data) {
        throw new Error("Order details not found");
      }

      setOrder(data);
    } catch (err) {
      console.error("❌ Order detail error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load order details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw size={32} className="mx-auto animate-spin text-blue-600" />

          <p className="mt-3 text-sm text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={17} />
          Back to Orders
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <XCircle size={24} className="text-red-600" />

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load order
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error || "Order not found"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadOrder}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // DATA
  // ====================================================

  const customer = order?.customer || {};

  const items = Array.isArray(order?.items) ? order.items : [];

  const delivery = order?.delivery || {};

  const invoice = order?.invoice || {};

  const orderStatus = getOrderStatus(order.status);

  const paymentStatus = getPaymentStatus(order.paymentStatus);

  const StatusIcon = orderStatus.icon;

  const addressParts = [
    customer?.address,
    customer?.city,
    customer?.state,
    customer?.pincode,
  ].filter(Boolean);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={17} />
            Back to Orders
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ShoppingBagIcon />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{order.orderNumber}
                </h1>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${orderStatus.className}`}
                >
                  <StatusIcon size={14} />
                  {orderStatus.label}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Created {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/orders/${id}/edit`)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Edit3 size={17} />
            Edit Order
          </button>

          <button
            type="button"
            onClick={loadOrder}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>

      {/* STATUS + PAYMENT */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Order Status
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${orderStatus.className}`}
            >
              <StatusIcon size={16} />
              {orderStatus.label}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Payment Status
          </p>

          <div className="mt-3">
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-sm font-medium ${paymentStatus.className}`}
            >
              {paymentStatus.label}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Order Total
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(order.total)}
          </p>
        </div>
      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* LEFT */}

        <div className="space-y-6 xl:col-span-2">
          {/* CUSTOMER */}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <User size={18} className="text-blue-600" />

                <h2 className="font-semibold text-gray-900">
                  Customer Information
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Name
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {customer?.name || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Phone
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {customer?.phone || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Email
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {customer?.email || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Order Source
                </p>

                <p className="mt-1 capitalize font-medium text-gray-900">
                  {order?.source || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* ITEMS */}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-blue-600" />

                  <h2 className="font-semibold text-gray-900">Order Items</h2>
                </div>

                <span className="text-sm text-gray-500">
                  {items.reduce(
                    (sum, item) => sum + Number(item?.quantity || 0),
                    0,
                  )}{" "}
                  items
                </span>
              </div>
            </div>

            {items.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {items.map((item, index) => {
                  const quantity = Number(item?.quantity || 0);

                  const price = Number(item?.price || 0);

                  const itemTotal = Number(
                    item?.itemTotal ?? item?.total ?? price * quantity,
                  );

                  return (
                    <div
                      key={item?._id || item?.productId || index}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                          {item?.image ? (
                            <img
                              src={item.image}
                              alt={item?.name || "Product"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package size={20} className="text-gray-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">
                            {item?.name || "Product"}
                          </p>

                          {item?.sku && (
                            <p className="mt-1 text-xs text-gray-500">
                              SKU: {item.sku}
                            </p>
                          )}

                          <p className="mt-1 text-sm text-gray-500">
                            Qty: {quantity} × {formatCurrency(price)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(itemTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                No items found.
              </div>
            )}
          </div>

          {/* DELIVERY */}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-blue-600" />

                <h2 className="font-semibold text-gray-900">
                  Delivery Information
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <InfoRow
                label="Delivery Status"
                value={delivery?.status || "-"}
              />

              <InfoRow
                label="Delivery Method"
                value={delivery?.method || "-"}
              />

              <InfoRow label="Courier" value={delivery?.courierName || "-"} />

              <InfoRow
                label="Courier Service"
                value={delivery?.courierService || "-"}
              />

              <InfoRow
                label="Tracking Number"
                value={delivery?.trackingNumber || "-"}
              />

              <InfoRow
                label="Estimated Delivery"
                value={formatDate(delivery?.estimatedDeliveryDate)}
              />

              {delivery?.trackingUrl && (
                <div className="md:col-span-2">
                  <a
                    href={delivery.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                  >
                    <Truck size={16} />
                    Track Shipment
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ADDRESS */}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" />

                <h2 className="font-semibold text-gray-900">
                  Delivery Address
                </h2>
              </div>
            </div>

            <div className="p-5">
              {addressParts.length > 0 ? (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-medium text-gray-900">{customer?.name}</p>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    {addressParts.join(", ")}
                  </p>

                  {customer?.phone && (
                    <p className="mt-2 text-sm text-gray-600">
                      Phone: {customer.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No delivery address available.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="space-y-6">
          {/* ORDER SUMMARY */}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-blue-600" />

                <h2 className="font-semibold text-gray-900">Order Summary</h2>
              </div>
            </div>

            <div className="p-5">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>

                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>

                  <span className="font-medium text-gray-900">
                    - {formatCurrency(order.discountAmount || 0)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>

                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.shippingAmount || 0)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>

                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.taxAmount || 0)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>

                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT */}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-blue-600" />

                <h2 className="font-semibold text-gray-900">
                  Payment Information
                </h2>
              </div>
            </div>

            <div className="p-5">
              <InfoRow label="Method" value={order?.paymentMethod} />

              <InfoRow label="Status" value={paymentStatus.label} />

              <InfoRow label="Payment ID" value={order?.paymentId || "-"} />

              <InfoRow
                label="Transaction ID"
                value={order?.transactionId || "-"}
              />

              <InfoRow label="Paid At" value={formatDateTime(order?.paidAt)} />
            </div>
          </div>

          {/* INVOICE */}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />

                <h2 className="font-semibold text-gray-900">Invoice</h2>
              </div>
            </div>

            <div className="p-5">
              <InfoRow label="Invoice Number" value={invoice?.invoiceNumber} />

              <InfoRow
                label="Invoice Date"
                value={formatDate(invoice?.invoiceDate)}
              />

              <InfoRow label="Status" value={invoice?.status} />

              <InfoRow
                label="Paid Amount"
                value={formatCurrency(invoice?.paidAmount || 0)}
              />

              <InfoRow
                label="Due Amount"
                value={formatCurrency(invoice?.dueAmount || 0)}
              />

              {invoice?.pdfUrl && (
                <a
                  href={invoice.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <FileText size={16} />
                  View Invoice
                </a>
              )}
            </div>
          </div>

          {/* DATES */}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-blue-600" />

                <h2 className="font-semibold text-gray-900">Order Timeline</h2>
              </div>
            </div>

            <div className="p-5">
              <InfoRow
                label="Created"
                value={formatDateTime(order.createdAt)}
              />

              <InfoRow
                label="Updated"
                value={formatDateTime(order.updatedAt)}
              />

              {delivery?.shippedAt && (
                <InfoRow
                  label="Shipped"
                  value={formatDateTime(delivery.shippedAt)}
                />
              )}

              {delivery?.deliveredAt && (
                <InfoRow
                  label="Delivered"
                  value={formatDateTime(delivery.deliveredAt)}
                />
              )}
            </div>
          </div>

          {/* NOTES */}

          {order?.notes && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900">Order Notes</h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {order.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ======================================================
// SHOPPING BAG ICON
// ======================================================

const ShoppingBagIcon = () => {
  return <ShoppingBag size={22} />;
};

export default OrderDetails;
