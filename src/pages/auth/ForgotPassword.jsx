import React, { useState } from "react";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";
import authApi from "../../api/auth.api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await authApi.forgotPassword({
        email: email.trim(),
      });

      setSuccess(
        response?.message ||
          "If this email exists, a password reset link has been sent.",
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to process request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link
        to="/login"
        className="mb-7 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to login
      </Link>

      <h2 className="text-3xl font-bold text-gray-900">Forgot password?</h2>

      <p className="mt-2 text-sm text-gray-500">
        Enter your registered email and we'll send you a reset link.
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <Send size={17} />

          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
