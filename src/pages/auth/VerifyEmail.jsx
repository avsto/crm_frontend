import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import authApi from "../../api/auth.api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const response = await authApi.verifyEmail(token);

        setStatus("success");

        setMessage(
          response?.message || "Your email has been verified successfully.",
        );
      } catch (err) {
        setStatus("error");

        setMessage(
          err?.response?.data?.message || "Email verification failed.",
        );
      }
    };

    verify();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="text-center">
        <Loader2 size={42} className="mx-auto animate-spin text-blue-600" />

        <h2 className="mt-5 text-2xl font-bold text-gray-900">
          Verifying email...
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Please wait while we verify your email address.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <CheckCircle size={56} className="mx-auto text-green-500" />

        <h2 className="mt-5 text-2xl font-bold text-gray-900">
          Email verified
        </h2>

        <p className="mt-2 text-sm text-gray-500">{message}</p>

        <Link
          to="/login"
          className="mt-7 inline-flex h-11 items-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Continue to login
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <XCircle size={56} className="mx-auto text-red-500" />

      <h2 className="mt-5 text-2xl font-bold text-gray-900">
        Verification failed
      </h2>

      <p className="mt-2 text-sm text-gray-500">{message}</p>

      <Link
        to="/login"
        className="mt-7 inline-flex h-11 items-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Back to login
      </Link>
    </div>
  );
};

export default VerifyEmail;
