import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Link2,
  Plus,
  CheckCircle2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import websiteApi from "../../api/website.api";

const WebsiteDomain = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();

  const [domains, setDomains] = useState([]);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDomains = async () => {
    try {
      setLoading(true);

      const response = await websiteApi.getDomains(websiteId);

      const data =
        response?.data?.data || response?.data?.domains || response?.data || [];

      setDomains(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Domain loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, [websiteId]);

  const connectDomain = async () => {
    if (!domain.trim()) {
      alert("Please enter domain.");
      return;
    }

    try {
      setSaving(true);

      await websiteApi.connectDomain(websiteId, {
        domain: domain.trim().toLowerCase(),
      });

      setDomain("");

      await loadDomains();
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to connect domain.");
    } finally {
      setSaving(false);
    }
  };

  const verifyDomain = async (domainId) => {
    try {
      await websiteApi.verifyDomain(websiteId, domainId);
      await loadDomains();
    } catch (error) {
      alert(error?.response?.data?.message || "Domain verification failed.");
    }
  };

  const makePrimary = async (domainId) => {
    try {
      await websiteApi.setPrimaryDomain(websiteId, domainId);
      await loadDomains();
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to set primary domain.");
    }
  };

  const disconnect = async (domainId) => {
    if (!window.confirm("Disconnect this domain?")) return;

    try {
      await websiteApi.disconnectDomain(websiteId, domainId);
      await loadDomains();
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to disconnect domain.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate(`/website/${websiteId}`)}
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Website
        </button>

        <h1 className="text-2xl font-bold text-gray-900">Domains</h1>

        <p className="mt-1 text-sm text-gray-500">
          Connect your custom domain to this website.
        </p>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="www.example.com"
                className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <button
              disabled={saving}
              onClick={connectDomain}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {saving ? "Connecting..." : "Connect Domain"}
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {loading ? (
            <div className="flex justify-center p-10">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : domains.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No domains connected.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {domains.map((item) => {
                const id = item._id || item.id;

                return (
                  <div
                    key={id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.domain}
                        </p>

                        {item.primary && (
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                            Primary
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        Status: {item.status || "pending"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                    
                      {item.status !== "active" && (
                        <button
                          onClick={() => verifyDomain(id)}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700"
                        >
                          Verify
                        </button>
                      )}

                      {!item.primary && (
                        <button
                          onClick={() => makePrimary(id)}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                        >
                          Make Primary
                        </button>
                      )}

                      <button
                        onClick={() => disconnect(id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebsiteDomain;
