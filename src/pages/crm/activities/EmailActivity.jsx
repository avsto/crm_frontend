import React, {
  useEffect,
  useState,
} from "react";

import {
  Mail,
  Loader2,
  AlertCircle,
  User,
} from "lucide-react";

import leadApi from "../../../api/crm.api";

const EmailActivity = ({
  lead,
  formatDateTime,
}) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchEmails = async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await leadApi.getConversations({
            channel: "email",
            phone: lead?.phone || "",
            email: lead?.email || "",
            phoneCountryCode:
              lead?.phoneCountryCode || "+91",
          });

        if (!mounted) return;

        const data = response?.data;

        const result =
          data?.data ||
          data?.conversation ||
          data?.messages ||
          [];

        if (Array.isArray(result)) {
          setEmails(result);
        } else if (
          Array.isArray(result?.messages)
        ) {
          setEmails(result.messages);
        } else {
          setEmails([]);
        }
      } catch (err) {
        console.error(
          "Email conversation error:",
          err
        );

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Unable to load email conversation."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (lead?.email || lead?.phone) {
      fetchEmails();
    } else {
      setEmails([]);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [
    lead?._id,
    lead?.email,
    lead?.phone,
    lead?.phoneCountryCode,
  ]);

  const normalizeEmail = (email) => ({
    id:
      email?._id ||
      email?.id ||
      Math.random(),

    subject:
      email?.subject ||
      email?.title ||
      "No subject",

    body:
      email?.body ||
      email?.message ||
      email?.content ||
      "",

    from:
      email?.from ||
      email?.sender ||
      email?.fromEmail ||
      "",

    to:
      email?.to ||
      email?.receiver ||
      email?.toEmail ||
      "",

    createdAt:
      email?.createdAt ||
      email?.timestamp ||
      email?.date,

    direction:
      email?.direction ||
      "",
  });

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />

          <p className="mt-2 text-sm text-slate-500">
            Loading emails...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-red-100 bg-red-50">
        <div className="text-center">
          <AlertCircle className="mx-auto h-6 w-6 text-red-400" />

          <p className="mt-2 text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const normalizedEmails =
    emails.map(normalizeEmail);

  if (!normalizedEmails.length) {
    return (
      <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
        <div className="text-center">
          <Mail className="mx-auto h-7 w-7 text-slate-300" />

          <p className="mt-2 text-sm font-medium text-slate-500">
            No email activity
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No email conversation was found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {normalizedEmails.map((email) => (
        <div
          key={email.id}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Mail className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {email.subject}
                  </p>

                  <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                    <User className="h-3 w-3" />
                    {email.from ||
                      lead?.email ||
                      "Unknown sender"}
                  </div>
                </div>

                <span className="shrink-0 text-[10px] text-slate-400">
                  {email.createdAt
                    ? formatDateTime(
                        email.createdAt
                      )
                    : ""}
                </span>
              </div>

              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {email.body ||
                    "No email content"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailActivity;