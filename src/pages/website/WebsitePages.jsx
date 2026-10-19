import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import websiteApi from "../../api/website.api";

const WebsitePages = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadPages = async () => {
    try {
      setLoading(true);

      const response = await websiteApi.getPages(websiteId);

      const data =
        response?.data?.data || response?.data?.pages || response?.data || [];

      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load pages error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (websiteId) loadPages();
  }, [websiteId]);

  const createPage = async () => {
    const title = window.prompt("Enter page name");

    if (!title?.trim()) return;

    try {
      setCreating(true);

      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      await websiteApi.createPage(websiteId, {
        title: title.trim(),
        slug,
        published: false,
      });

      await loadPages();
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to create page.");
    } finally {
      setCreating(false);
    }
  };

  const deletePage = async (pageId) => {
    if (!window.confirm("Delete this page?")) return;

    try {
      await websiteApi.deletePage(websiteId, pageId);
      await loadPages();
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to delete page.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate(`/website/${websiteId}`)}
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Website
        </button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Website Pages</h1>

            <p className="mt-1 text-sm text-gray-500">
              Create and manage your website pages.
            </p>
          </div>

          <button
            disabled={creating}
            onClick={createPage}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Add Page
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {loading ? (
            <div className="flex justify-center p-10">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : pages.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="mx-auto h-10 w-10 text-gray-300" />

              <p className="mt-3 text-sm text-gray-500">No pages found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pages.map((page) => {
                const pageId = page._id || page.id;

                return (
                  <div
                    key={pageId}
                    className="flex items-center justify-between p-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {page.title}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {page.slug || ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate(`/website/${websiteId}/page/${pageId}/edit`)
                        }
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => deletePage(pageId)}
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

export default WebsitePages;
