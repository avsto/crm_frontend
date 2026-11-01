// src/pages/settings/Payment.jsx

import { useState } from "react";
import {
  CreditCard,
  Wallet,
  Building2,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Search,
  ShieldCheck,
  ArrowUpRight,
  Receipt,
} from "lucide-react";

const initialPayments = [
  {
    id: "PAY-1001",
    customer: "Rahul Sharma",
    email: "rahul@example.com",
    date: "20 Oct 2026",
    amount: 2499,
    method: "Visa •••• 4242",
    status: "Completed",
  },
  {
    id: "PAY-1002",
    customer: "Priya Verma",
    email: "priya@example.com",
    date: "19 Oct 2026",
    amount: 1499,
    method: "UPI",
    status: "Pending",
  },
  {
    id: "PAY-1003",
    customer: "Amit Kumar",
    email: "amit@example.com",
    date: "18 Oct 2026",
    amount: 3999,
    method: "Mastercard •••• 8210",
    status: "Failed",
  },
  {
    id: "PAY-1004",
    customer: "Neha Singh",
    email: "neha@example.com",
    date: "17 Oct 2026",
    amount: 999,
    method: "UPI",
    status: "Completed",
  },
];

const initialMethods = [
  {
    id: 1,
    name: "Visa",
    details: "•••• •••• •••• 4242",
    expiry: "Expires 12/28",
    primary: true,
    type: "card",
  },
  {
    id: 2,
    name: "Mastercard",
    details: "•••• •••• •••• 8210",
    expiry: "Expires 08/27",
    primary: false,
    type: "card",
  },
  {
    id: 3,
    name: "UPI",
    details: "business@okaxis",
    expiry: "Connected account",
    primary: false,
    type: "upi",
  },
];

const statusStyles = {
  Completed: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Failed: "bg-red-50 text-red-600",
};

export default function Payment() {
  const [payments, setPayments] = useState(initialPayments);
  const [methods, setMethods] = useState(initialMethods);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [methodType, setMethodType] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [upiId, setUpiId] = useState("");
  const [notice, setNotice] = useState("");

  const completedPayments = payments.filter(
    (payment) => payment.status === "Completed",
  );

  const totalReceived = completedPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const pendingPayments = payments
    .filter((payment) => payment.status === "Pending")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.customer.toLowerCase().includes(search.toLowerCase()) ||
      payment.id.toLowerCase().includes(search.toLowerCase()) ||
      payment.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  const setPrimaryMethod = (id) => {
    setMethods((current) =>
      current.map((method) => ({
        ...method,
        primary: method.id === id,
      })),
    );
    setNotice("Default payment method updated.");
  };

  const removeMethod = (id) => {
    setMethods((current) => {
      const remaining = current.filter((method) => method.id !== id);

      if (!remaining.some((method) => method.primary) && remaining.length) {
        remaining[0].primary = true;
      }

      return remaining;
    });

    setNotice("Payment method removed.");
  };

  const addMethod = (event) => {
    event.preventDefault();

    if (
      methodType === "card" &&
      (!cardName.trim() || !cardNumber.trim() || !expiry.trim())
    ) {
      setNotice("Please complete all card fields.");
      return;
    }

    if (methodType === "upi" && !upiId.trim()) {
      setNotice("Please enter a UPI ID.");
      return;
    }

    const newMethod =
      methodType === "card"
        ? {
            id: Date.now(),
            name: "Card",
            details: `•••• •••• •••• ${cardNumber.replace(/\s/g, "").slice(-4)}`,
            expiry: `Expires ${expiry}`,
            primary: methods.length === 0,
            type: "card",
          }
        : {
            id: Date.now(),
            name: "UPI",
            details: upiId.trim(),
            expiry: "UPI ID added",
            primary: methods.length === 0,
            type: "upi",
          };

    setMethods((current) => [...current, newMethod]);
    setShowAddMethod(false);
    setCardNumber("");
    setCardName("");
    setExpiry("");
    setUpiId("");
    setNotice("Payment method added to this page.");
  };

  const exportPayments = () => {
    const headers = [
      "Payment ID",
      "Customer",
      "Email",
      "Date",
      "Amount",
      "Method",
      "Status",
    ];

    const rows = filteredPayments.map((payment) => [
      payment.id,
      payment.customer,
      payment.email,
      payment.date,
      payment.amount,
      payment.method,
      payment.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "payments.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>Settings</span>
              <span>/</span>
              <span className="text-slate-800">Payments</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Payments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage payment methods and track transactions.
            </p>
          </div>

          <button
            onClick={() => setShowAddMethod(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#f72567] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#df1756]"
          >
            <Plus size={17} />
            Add payment method
          </button>
        </div>

        {notice && (
          <div
            role="status"
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
          >
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              className="text-slate-500 hover:text-slate-900"
              aria-label="Dismiss notification"
            >
              <XCircle size={17} />
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="Total received"
            value={formatCurrency(totalReceived)}
            description="Completed transactions"
            icon={Wallet}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            title="Pending payments"
            value={formatCurrency(pendingPayments)}
            description="Awaiting confirmation"
            icon={Clock}
            iconClass="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            title="Successful transactions"
            value={String(completedPayments.length).padStart(2, "0")}
            description="Completed payments"
            icon={CheckCircle2}
            iconClass="bg-blue-50 text-blue-600"
          />
        </div>

        {/* Payment methods */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-slate-900">Payment methods</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage your saved payment options.
              </p>
            </div>

            <button
              onClick={() => setShowAddMethod(true)}
              className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:self-auto"
            >
              <Plus size={16} />
              Add new
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {methods.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CreditCard className="mx-auto mb-3 text-slate-400" size={30} />
                <p className="font-medium text-slate-800">No payment methods</p>
                <p className="mt-1 text-sm text-slate-500">
                  Add a payment method to get started.
                </p>
              </div>
            ) : (
              methods.map((method) => (
                <div
                  key={method.id}
                  className="flex flex-col justify-between gap-4 px-5 py-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                      {method.type === "upi" ? (
                        <Building2 size={21} className="text-slate-600" />
                      ) : (
                        <CreditCard size={21} className="text-slate-600" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {method.name}
                        </p>

                        {method.primary && (
                          <span className="rounded-md bg-pink-50 px-2 py-0.5 text-xs font-medium text-[#f72567]">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-sm text-slate-600">
                        {method.details}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {method.expiry}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center">
                    {!method.primary && (
                      <button
                        onClick={() => setPrimaryMethod(method.id)}
                        className="text-sm font-medium text-slate-600 hover:text-[#f72567]"
                      >
                        Set as default
                      </button>
                    )}

                    <button
                      onClick={() => removeMethod(method.id)}
                      aria-label={`Remove ${method.name}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-start gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-emerald-600"
            />
            <p className="text-xs leading-5 text-slate-500">
              Never store full card details or CVV directly in your application.
              Use a trusted payment provider for secure payment processing.
            </p>
          </div>
        </section>

        {/* Transaction history */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-semibold text-slate-900">
                Transaction history
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View and export payment records.
              </p>
            </div>

            <button
              onClick={exportPayments}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>

          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer or payment ID..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#f72567] focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#f72567]"
            >
              <option value="All">All statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Payment</th>
                  <th className="px-5 py-3.5 font-medium">Customer</th>
                  <th className="px-5 py-3.5 font-medium">Date</th>
                  <th className="px-5 py-3.5 font-medium">Method</th>
                  <th className="px-5 py-3.5 font-medium">Amount</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      <Receipt
                        size={28}
                        className="mx-auto mb-2 text-slate-300"
                      />
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {payment.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {payment.customer}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {payment.email}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {payment.date}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {payment.method}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                        {formatCurrency(payment.amount)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[payment.status]}`}
                        >
                          {payment.status === "Completed" ? (
                            <CheckCircle2 size={13} />
                          ) : payment.status === "Pending" ? (
                            <Clock size={13} />
                          ) : (
                            <XCircle size={13} />
                          )}
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
            Showing {filteredPayments.length} of {payments.length} transactions
          </div>
        </section>
      </div>

      {/* Add payment method modal */}
      {showAddMethod && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddMethod(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-payment-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2
                  id="add-payment-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Add payment method
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add a card or UPI account.
                </p>
              </div>

              <button
                onClick={() => setShowAddMethod(false)}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethodType("card")}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium ${
                  methodType === "card"
                    ? "border-[#f72567] bg-pink-50 text-[#f72567]"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                <CreditCard size={17} />
                Card
              </button>

              <button
                type="button"
                onClick={() => setMethodType("upi")}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium ${
                  methodType === "upi"
                    ? "border-[#f72567] bg-pink-50 text-[#f72567]"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                <Building2 size={17} />
                UPI
              </button>
            </div>

            <form onSubmit={addMethod} className="space-y-4">
              {methodType === "card" ? (
                <>
                  <Field label="Name on card">
                    <input
                      value={cardName}
                      onChange={(event) => setCardName(event.target.value)}
                      placeholder="Enter cardholder name"
                      className={inputClass}
                      required
                    />
                  </Field>

                  <Field label="Card number">
                    <input
                      value={cardNumber}
                      onChange={(event) =>
                        setCardNumber(
                          event.target.value.replace(/\D/g, "").slice(0, 19),
                        )
                      }
                      inputMode="numeric"
                      placeholder="Enter card number"
                      className={inputClass}
                      required
                    />
                  </Field>

                  <Field label="Expiry date">
                    <input
                      value={expiry}
                      onChange={(event) => setExpiry(event.target.value)}
                      placeholder="MM/YY"
                      className={inputClass}
                      required
                    />
                  </Field>
                </>
              ) : (
                <Field label="UPI ID">
                  <input
                    value={upiId}
                    onChange={(event) => setUpiId(event.target.value)}
                    placeholder="name@bank"
                    className={inputClass}
                    required
                  />
                </Field>
              )}

              <p className="text-xs leading-5 text-slate-500">
                Demo only: this form stores a masked display entry in React
                state. It does not verify or securely tokenize a real payment
                method.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMethod(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-[#f72567] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#df1756]"
                >
                  Add method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#f72567] focus:ring-2 focus:ring-pink-100";

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function SummaryCard({ title, value, description, icon: Icon, iconClass }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div className={`rounded-lg p-2.5 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
        <ArrowUpRight size={14} />
        {description}
      </div>
    </div>
  );
}
