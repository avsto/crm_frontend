// src/pages/orders/EditOrder.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  Truck,
  FileText,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import productApi from "../../api/product.api";
import orderApi from "../../api/order.api";

// =====================================================
// HELPERS
// =====================================================

const extractData = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

const getOrderData = (response) => {
  return (
    response?.data?.data || response?.data?.order || response?.data || null
  );
};

const getId = (value) => {
  if (!value) return null;

  if (typeof value === "string") return value;

  return value?._id || value?.id || null;
};

const normalizeProduct = (product) => ({
  id: product?._id || product?.id,

  name:
    product?.name ||
    product?.productName ||
    product?.title ||
    "Unnamed Product",

  sku: product?.sku || product?.SKU || "-",

  price: Number(
    product?.sellingPrice ??
      product?.salePrice ??
      product?.price ??
      product?.mrp ??
      0,
  ),

  stock: Number(
    product?.stock ?? product?.quantity ?? product?.inventory?.stock ?? 0,
  ),

  image:
    product?.image ||
    product?.thumbnail ||
    product?.images?.[0] ||
    product?.media?.[0]?.url ||
    null,

  raw: product,
});

const formatDateForInput = (date) => {
  if (!date) return "";

  try {
    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "";

    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

// =====================================================
// COMPONENT
// =====================================================

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [order, setOrder] = useState(null);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showProducts, setShowProducts] = useState(false);

  const [items, setItems] = useState([]);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [orderStatus, setOrderStatus] = useState("pending");

  const [shippingAmount, setShippingAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);

  const [notes, setNotes] = useState("");

  // ===================================================
  // DELIVERY
  // ===================================================

  const [delivery, setDelivery] = useState({
    status: "pending",
    method: "standard",
    courierName: "",
    courierService: "",
    trackingNumber: "",
    trackingUrl: "",
    estimatedDeliveryDate: "",
    failureReason: "",
    returnReason: "",
    deliveryNotes: "",
  });

  // ===================================================
  // INVOICE
  // ===================================================

  const [invoice, setInvoice] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    status: "pending",
    taxIncluded: false,
    taxPercentage: 0,
    notes: "",
    terms: "",
  });

  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ===================================================
  // LOAD PRODUCTS
  // ===================================================

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);

      const response = await productApi.getProducts();

      const data = extractData(response).map(normalizeProduct);

      setProducts(data);
    } catch (err) {
      console.error("LOAD PRODUCTS ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load products",
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  // ===================================================
  // LOAD ORDER
  // ===================================================

  const loadOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await orderApi.getOrder(id);

      const data = getOrderData(response);

      if (!data) {
        throw new Error("Order not found");
      }

      setOrder(data);

      // -----------------------------------------------
      // CUSTOMER
      // -----------------------------------------------

      const customerData = data?.customer || data?.customerDetails || {};

      setCustomer({
        name: customerData?.name || "",
        phone: customerData?.phone || "",
        email: customerData?.email || "",
        address: customerData?.address || "",
        city: customerData?.city || "",
        state: customerData?.state || "",
        pincode: customerData?.pincode || "",
      });

      // -----------------------------------------------
      // ITEMS
      // -----------------------------------------------

      const orderItems = Array.isArray(data?.items) ? data.items : [];

      setItems(
        orderItems.map((item) => ({
          productId: getId(item?.productId) || getId(item?.product) || "",

          name:
            item?.name || item?.productName || item?.product?.name || "Product",

          sku: item?.sku || item?.product?.sku || "-",

          image:
            item?.image ||
            item?.product?.image ||
            item?.product?.thumbnail ||
            item?.product?.images?.[0] ||
            null,

          price: Number(
            item?.price ?? item?.unitPrice ?? item?.product?.price ?? 0,
          ),

          quantity: Number(item?.quantity || 1),

          stock: Number(item?.stock ?? item?.product?.stock ?? 999999),
        })),
      );

      // -----------------------------------------------
      // PAYMENT
      // -----------------------------------------------

      setPaymentMethod(data?.paymentMethod || "cod");
      setPaymentStatus(data?.paymentStatus || "pending");
      setOrderStatus(data?.status || "pending");

      // -----------------------------------------------
      // AMOUNTS
      // -----------------------------------------------

      setShippingAmount(Number(data?.shippingAmount || 0));

      setDiscountAmount(Number(data?.discountAmount || 0));

      setTaxAmount(Number(data?.taxAmount || 0));

      setNotes(data?.notes || "");

      // -----------------------------------------------
      // DELIVERY
      // -----------------------------------------------

      const deliveryData = data?.delivery || {};

      setDelivery({
        status: deliveryData?.status || "pending",

        method: deliveryData?.method || "standard",

        courierName: deliveryData?.courierName || "",

        courierService: deliveryData?.courierService || "",

        trackingNumber: deliveryData?.trackingNumber || "",

        trackingUrl: deliveryData?.trackingUrl || "",

        estimatedDeliveryDate: formatDateForInput(
          deliveryData?.estimatedDeliveryDate,
        ),

        failureReason: deliveryData?.failureReason || "",

        returnReason: deliveryData?.returnReason || "",

        deliveryNotes: deliveryData?.deliveryNotes || "",
      });

      // -----------------------------------------------
      // INVOICE
      // -----------------------------------------------

      const invoiceData = data?.invoice || {};

      setInvoice({
        invoiceNumber: invoiceData?.invoiceNumber || "",

        invoiceDate: formatDateForInput(invoiceData?.invoiceDate),

        dueDate: formatDateForInput(invoiceData?.dueDate),

        status: invoiceData?.status || "pending",

        taxIncluded: Boolean(invoiceData?.taxIncluded),

        taxPercentage: Number(invoiceData?.taxPercentage || 0),

        notes: invoiceData?.notes || "",

        terms: invoiceData?.terms || "",
      });
    } catch (err) {
      console.error("LOAD ORDER ERROR:", err);

      setError(
        err?.response?.data?.message || err?.message || "Failed to load order",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadOrder();
  }, [id]);

  // ===================================================
  // SEARCH PRODUCTS
  // ===================================================

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products.slice(0, 10);
    }

    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query),
      )
      .slice(0, 10);
  }, [products, search]);

  // ===================================================
  // ADD PRODUCT
  // ===================================================

  const addProduct = (product) => {
    const existing = items.find((item) => item.productId === product.id);

    if (existing) {
      updateQuantity(
        product.id,
        Math.min(existing.quantity + 1, product.stock || 999999),
      );

      setSearch("");
      setShowProducts(false);

      return;
    }

    setItems((current) => [
      ...current,
      {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        image: product.image,
        price: product.price,
        quantity: 1,
        stock: product.stock || 999999,
      },
    ]);

    setSearch("");
    setShowProducts(false);
  };

  // ===================================================
  // UPDATE QUANTITY
  // ===================================================

  const updateQuantity = (productId, quantity) => {
    const qty = Number(quantity);

    setItems((current) =>
      current.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        const maxStock = Number(item.stock || 999999);

        return {
          ...item,
          quantity: Math.max(1, Math.min(qty || 1, maxStock)),
        };
      }),
    );
  };

  // ===================================================
  // REMOVE ITEM
  // ===================================================

  const removeItem = (productId) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  };

  // ===================================================
  // TOTALS
  // ===================================================

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
  }, [items]);

  const total = Math.max(
    0,
    subtotal +
      Number(shippingAmount || 0) +
      Number(taxAmount || 0) -
      Number(discountAmount || 0),
  );

  // ===================================================
  // DELIVERY CHANGE
  // ===================================================

  const updateDelivery = (field, value) => {
    setDelivery((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // ===================================================
  // INVOICE CHANGE
  // ===================================================

  const updateInvoice = (field, value) => {
    setInvoice((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // ===================================================
  // UPDATE ORDER
  // ===================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!items.length) {
      alert("Please add at least one product.");
      return;
    }

    if (!customer.name.trim()) {
      alert("Customer name is required.");
      return;
    }

    if (!customer.phone.trim()) {
      alert("Customer phone is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // ===============================================
      // PAYLOAD
      // ===============================================

      const payload = {
        customer: {
          name: customer.name.trim(),

          phone: customer.phone.trim(),

          email: customer.email.trim(),

          address: customer.address.trim(),

          city: customer.city.trim(),

          state: customer.state.trim(),

          pincode: customer.pincode.trim(),
        },

        items: items.map((item) => ({
          productId: item.productId,

          name: item.name,

          sku: item.sku,

          image: item.image || null,

          quantity: Number(item.quantity),

          price: Number(item.price),
        })),

        source: order?.source || "manual",

        paymentMethod,

        paymentStatus,

        status: orderStatus,

        subtotal: Number(subtotal),

        shippingAmount: Number(shippingAmount || 0),

        discountAmount: Number(discountAmount || 0),

        taxAmount: Number(taxAmount || 0),

        total: Number(total),

        notes: notes.trim(),

        // =============================================
        // DELIVERY
        // =============================================

        delivery: {
          status: delivery.status,

          method: delivery.method,

          courierName: delivery.courierName.trim(),

          courierService: delivery.courierService.trim(),

          trackingNumber: delivery.trackingNumber.trim(),

          trackingUrl: delivery.trackingUrl.trim(),

          estimatedDeliveryDate: delivery.estimatedDeliveryDate || null,

          failureReason: delivery.failureReason.trim(),

          returnReason: delivery.returnReason.trim(),

          deliveryNotes: delivery.deliveryNotes.trim(),
        },

        // =============================================
        // INVOICE
        // =============================================

        invoice: {
          invoiceNumber: invoice.invoiceNumber.trim(),

          invoiceDate: invoice.invoiceDate || null,

          dueDate: invoice.dueDate || null,

          status: invoice.status,

          taxIncluded: Boolean(invoice.taxIncluded),

          taxPercentage: Number(invoice.taxPercentage || 0),

          taxAmount: Number(taxAmount || 0),

          subtotal: Number(subtotal),

          shippingAmount: Number(shippingAmount || 0),

          discountAmount: Number(discountAmount || 0),

          total: Number(total),

          notes: invoice.notes.trim(),

          terms: invoice.terms.trim(),
        },
      };

      console.log("UPDATE ORDER PAYLOAD:", payload);

      const response = await orderApi.updateOrder(id, payload);

      const updatedOrder =
        response?.data?.data || response?.data?.order || response?.data;

      const updatedId = updatedOrder?._id || updatedOrder?.id || id;

      navigate(`/orders/${updatedId}`);
    } catch (err) {
      console.error("UPDATE ORDER ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update order",
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw size={30} className="mx-auto animate-spin text-blue-600" />

          <p className="mt-3 text-sm text-gray-500">Loading order...</p>
        </div>
      </div>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="mb-5 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
        >
          <ArrowLeft size={17} />
          Back to Orders
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-800">Unable to load order</p>

          <p className="mt-1 text-sm text-red-700">
            {error || "Order not found"}
          </p>

          <button
            type="button"
            onClick={loadOrder}
            className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/orders/${id}`)}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Order</h1>

            <p className="text-sm text-gray-500">
              {order.orderNumber || `#${id}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
            Source: {formatText(order.source || "manual")}
          </span>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6 xl:col-span-2">
            {/* =================================================
                CUSTOMER
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <User size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Customer Information
                  </h2>

                  <p className="text-xs text-gray-500">
                    Update customer details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                <Input
                  label="Customer Name *"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter customer name"
                />

                <Input
                  label="Phone *"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Enter phone number"
                />

                <Input
                  label="Email"
                  type="email"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      email: e.target.value,
                    })
                  }
                  placeholder="customer@example.com"
                />

                <Input
                  label="Pincode"
                  value={customer.pincode}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      pincode: e.target.value,
                    })
                  }
                  placeholder="Enter pincode"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        address: e.target.value,
                      })
                    }
                    placeholder="Enter complete address"
                  />
                </div>

                <Input
                  label="City"
                  value={customer.city}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      city: e.target.value,
                    })
                  }
                  placeholder="City"
                />

                <Input
                  label="State"
                  value={customer.state}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      state: e.target.value,
                    })
                  }
                  placeholder="State"
                />
              </div>
            </div>

            {/* =================================================
                PRODUCTS
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-semibold text-gray-900">Order Items</h2>
              </div>

              <div className="relative p-5">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onFocus={() => setShowProducts(true)}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowProducts(true);
                    }}
                    placeholder="Search product by name or SKU..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {showProducts && (
                  <div className="absolute left-5 right-5 top-[78px] z-20 max-h-72 overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                    {loadingProducts ? (
                      <div className="flex items-center gap-2 p-4 text-sm text-gray-500">
                        <RefreshCw size={16} className="animate-spin" />
                        Loading products...
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="p-5 text-center text-sm text-gray-500">
                        No products found
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addProduct(product)}
                          className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package size={18} className="text-gray-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {product.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              SKU: {product.sku} · Stock: {product.stock}
                            </p>
                          </div>

                          <span className="font-semibold text-gray-900">
                            ₹{product.price.toFixed(2)}
                          </span>

                          <Plus size={17} className="text-blue-600" />
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* ITEMS */}

                <div className="mt-5">
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
                      <Package size={40} className="mx-auto text-gray-300" />

                      <p className="mt-3 font-medium text-gray-700">
                        No products added
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                      {items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package size={20} className="text-gray-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900">
                              {item.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              SKU: {item.sku}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Available: {item.stock}
                            </p>
                          </div>

                          <input
                            type="number"
                            min="1"
                            max={item.stock || undefined}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.productId, e.target.value)
                            }
                            className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-center text-sm outline-none focus:border-blue-500"
                          />

                          <div className="w-24 text-right">
                            <p className="font-semibold text-gray-900">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                DELIVERY
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Truck size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Delivery Information
                  </h2>

                  <p className="text-xs text-gray-500">
                    Manage shipment and tracking
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                <Select
                  label="Delivery Status"
                  value={delivery.status}
                  onChange={(e) => updateDelivery("status", e.target.value)}
                  options={[
                    ["pending", "Pending"],
                    ["packed", "Packed"],
                    ["shipped", "Shipped"],
                    ["out_for_delivery", "Out for Delivery"],
                    ["delivered", "Delivered"],
                    ["failed", "Failed"],
                    ["returned", "Returned"],
                  ]}
                />

                <Select
                  label="Delivery Method"
                  value={delivery.method}
                  onChange={(e) => updateDelivery("method", e.target.value)}
                  options={[
                    ["standard", "Standard"],
                    ["express", "Express"],
                    ["same_day", "Same Day"],
                    ["pickup", "Pickup"],
                  ]}
                />

                <Input
                  label="Courier Name"
                  value={delivery.courierName}
                  onChange={(e) =>
                    updateDelivery("courierName", e.target.value)
                  }
                  placeholder="Courier name"
                />

                <Input
                  label="Courier Service"
                  value={delivery.courierService}
                  onChange={(e) =>
                    updateDelivery("courierService", e.target.value)
                  }
                  placeholder="e.g. Delhivery"
                />

                <Input
                  label="Tracking Number"
                  value={delivery.trackingNumber}
                  onChange={(e) =>
                    updateDelivery("trackingNumber", e.target.value)
                  }
                  placeholder="Tracking number"
                />

                <Input
                  label="Tracking URL"
                  value={delivery.trackingUrl}
                  onChange={(e) =>
                    updateDelivery("trackingUrl", e.target.value)
                  }
                  placeholder="https://..."
                />

                <Input
                  label="Estimated Delivery Date"
                  type="date"
                  value={delivery.estimatedDeliveryDate}
                  onChange={(e) =>
                    updateDelivery("estimatedDeliveryDate", e.target.value)
                  }
                />

                {delivery.status === "failed" && (
                  <Input
                    label="Failure Reason"
                    value={delivery.failureReason}
                    onChange={(e) =>
                      updateDelivery("failureReason", e.target.value)
                    }
                    placeholder="Why delivery failed?"
                  />
                )}

                {delivery.status === "returned" && (
                  <Input
                    label="Return Reason"
                    value={delivery.returnReason}
                    onChange={(e) =>
                      updateDelivery("returnReason", e.target.value)
                    }
                    placeholder="Return reason"
                  />
                )}

                <div className="md:col-span-2">
                  <Textarea
                    label="Delivery Notes"
                    value={delivery.deliveryNotes}
                    onChange={(e) =>
                      updateDelivery("deliveryNotes", e.target.value)
                    }
                    placeholder="Delivery related notes..."
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                INVOICE
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FileText size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">Invoice</h2>

                  <p className="text-xs text-gray-500">Invoice information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                <Input
                  label="Invoice Number"
                  value={invoice.invoiceNumber}
                  onChange={(e) =>
                    updateInvoice("invoiceNumber", e.target.value)
                  }
                  placeholder="INV-000001"
                />

                <Select
                  label="Invoice Status"
                  value={invoice.status}
                  onChange={(e) => updateInvoice("status", e.target.value)}
                  options={[
                    ["pending", "Pending"],
                    ["paid", "Paid"],
                    ["partial", "Partially Paid"],
                    ["cancelled", "Cancelled"],
                  ]}
                />

                <Input
                  label="Invoice Date"
                  type="date"
                  value={invoice.invoiceDate}
                  onChange={(e) => updateInvoice("invoiceDate", e.target.value)}
                />

                <Input
                  label="Due Date"
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => updateInvoice("dueDate", e.target.value)}
                />

                <Input
                  label="Tax Percentage"
                  type="number"
                  min="0"
                  value={invoice.taxPercentage}
                  onChange={(e) => {
                    updateInvoice("taxPercentage", e.target.value);

                    setTaxAmount(subtotal * (Number(e.target.value) / 100));
                  }}
                />

                <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={invoice.taxIncluded}
                    onChange={(e) =>
                      updateInvoice("taxIncluded", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />

                  <span className="text-sm font-medium text-gray-700">
                    Tax Included
                  </span>
                </label>

                <div className="md:col-span-2">
                  <Textarea
                    label="Invoice Notes"
                    value={invoice.notes}
                    onChange={(e) => updateInvoice("notes", e.target.value)}
                    placeholder="Invoice notes..."
                  />
                </div>

                <div className="md:col-span-2">
                  <Textarea
                    label="Invoice Terms"
                    value={invoice.terms}
                    onChange={(e) => updateInvoice("terms", e.target.value)}
                    placeholder="Payment terms..."
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                NOTES
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Order Notes
              </label>

              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this order..."
                className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <div className="space-y-6">
            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="space-y-4 p-5">
                <SummaryRow
                  label="Items"
                  value={items.reduce(
                    (sum, item) => sum + Number(item.quantity || 0),
                    0,
                  )}
                />

                <SummaryRow
                  label="Subtotal"
                  value={`₹${subtotal.toFixed(2)}`}
                />

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Shipping
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={shippingAmount}
                    onChange={(e) => setShippingAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Discount
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <SummaryRow
                  label="Tax"
                  value={`₹${Number(taxAmount || 0).toFixed(2)}`}
                />

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total</span>

                    <span className="text-xl font-bold text-blue-600">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                PAYMENT
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-semibold text-gray-900">
                  Payment & Status
                </h2>
              </div>

              <div className="space-y-4 p-5">
                <Select
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  options={[
                    ["cod", "Cash on Delivery"],
                    ["online", "Online Payment"],
                    ["upi", "UPI"],
                    ["card", "Card"],
                    ["bank_transfer", "Bank Transfer"],
                  ]}
                />

                <Select
                  label="Payment Status"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  options={[
                    ["pending", "Pending"],
                    ["paid", "Paid"],
                    ["failed", "Failed"],
                    ["refunded", "Refunded"],
                  ]}
                />

                <Select
                  label="Order Status"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  options={[
                    ["pending", "Pending"],
                    ["confirmed", "Confirmed"],
                    ["processing", "Processing"],
                    ["shipped", "Shipped"],
                    ["delivered", "Delivered"],
                    ["cancelled", "Cancelled"],
                  ]}
                />
              </div>
            </div>

            {/* =================================================
                UPDATE BUTTON
            ================================================= */}

            <button
              type="submit"
              disabled={saving || !items.length}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw size={17} className="animate-spin" />
                  Updating Order...
                </>
              ) : (
                <>
                  <Check size={17} />
                  Update Order
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/orders/${id}`)}
              disabled={saving}
              className="w-full rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// =====================================================
// INPUT
// =====================================================

const Input = ({ label, value, onChange, placeholder, type = "text" }) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
};

// =====================================================
// TEXTAREA
// =====================================================

const Textarea = ({ label, value, onChange, placeholder }) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <textarea
        rows={3}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full resize-none rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
};

// =====================================================
// SELECT
// =====================================================

const Select = ({ label, value, onChange, options }) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
};

// =====================================================
// SUMMARY ROW
// =====================================================

const SummaryRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>

      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
};

// =====================================================
// FORMAT TEXT
// =====================================================

const formatText = (value = "") => {
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default EditOrder;
