import React, { useEffect, useRef, useState } from "react";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  File,
  FileImage,
  FileText,
  Folder,
  FolderPlus,
  MoreVertical,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import api from "../../api/axios";

const MediaManager = ({ open = false, onClose, onSelect }) => {
  const fileInputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [currentFolder, setCurrentFolder] = useState(null);

  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);

  const [showFolderModal, setShowFolderModal] = useState(false);

  const [folderName, setFolderName] = useState("");

  const [renameModal, setRenameModal] = useState(false);

  const [renameValue, setRenameValue] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "https://api.avstomart.com";

  /*
  |--------------------------------------------------------------------------
  | FETCH MEDIA
  |--------------------------------------------------------------------------
  */

  const fetchMedia = async (folderId = currentFolder, searchValue = search) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (folderId) {
        params.append("parent", folderId);
      }

      if (searchValue) {
        params.append("search", searchValue);
      }

      const response = await api.get(`/media?${params.toString()}`);

      const data = response?.data?.data || response?.data || [];

      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD WHEN POPUP OPENS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    setCurrentFolder(null);
    setBreadcrumbs([]);
    setSearch("");
    setSelectedItem(null);

    fetchMedia(null, "");
  }, [open]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      fetchMedia(currentFolder, search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /*
  |--------------------------------------------------------------------------
  | OPEN FOLDER
  |--------------------------------------------------------------------------
  */

  const openFolder = (folder) => {
    setBreadcrumbs((prev) => [
      ...prev,
      {
        _id: folder._id,
        name: folder.name,
      },
    ]);

    setCurrentFolder(folder._id);

    setSelectedItem(null);
  };

  /*
  |--------------------------------------------------------------------------
  | BACK
  |--------------------------------------------------------------------------
  */

  const goBack = () => {
    if (!breadcrumbs.length) {
      return;
    }

    const newBreadcrumbs = [...breadcrumbs];

    newBreadcrumbs.pop();

    const parent = newBreadcrumbs[newBreadcrumbs.length - 1];

    setBreadcrumbs(newBreadcrumbs);

    setCurrentFolder(parent?._id || null);

    setSelectedItem(null);
  };

  /*
  |--------------------------------------------------------------------------
  | HOME
  |--------------------------------------------------------------------------
  */

  const goHome = () => {
    setBreadcrumbs([]);
    setCurrentFolder(null);
    setSelectedItem(null);
  };

  /*
  |--------------------------------------------------------------------------
  | BREADCRUMB
  |--------------------------------------------------------------------------
  */

  const goToBreadcrumb = (index) => {
    if (index === -1) {
      goHome();
      return;
    }

    const selected = breadcrumbs[index];

    setBreadcrumbs(breadcrumbs.slice(0, index + 1));

    setCurrentFolder(selected._id);

    setSelectedItem(null);
  };

  /*
  |--------------------------------------------------------------------------
  | SELECT ITEM
  |--------------------------------------------------------------------------
  */

  const handleSelectItem = (item) => {
    if (item.type === "folder") {
      openFolder(item);
      return;
    }

    setSelectedItem(item);
  };

  /*
  |--------------------------------------------------------------------------
  | INSERT / SELECT
  |--------------------------------------------------------------------------
  */

  const handleInsert = () => {
    if (!selectedItem || selectedItem.type === "folder") {
      return;
    }

    const selectedFile = {
      ...selectedItem,

      url:
        selectedItem.url || `${API_BASE}/api/media/preview/${selectedItem._id}`,
    };

    /*
    | Parent ko selected file bhejo
    */

    if (onSelect) {
      onSelect(selectedFile);
    }

    /*
    | Popup close
    */

    if (onClose) {
      onClose();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | UPLOAD
  |--------------------------------------------------------------------------
  */

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    try {
      setUploading(true);

      for (const file of files) {
        const formData = new FormData();

        formData.append("file", file);

        if (currentFolder) {
          formData.append("parent", currentFolder);
        }

        await api.post("/media/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      await fetchMedia(currentFolder, search);
    } catch (error) {
      console.error("Upload failed:", error);

      alert(error?.response?.data?.message || "File upload failed");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE FOLDER
  |--------------------------------------------------------------------------
  */

  const createFolder = async () => {
    const name = folderName.trim();

    if (!name) {
      return;
    }

    try {
      await api.post("/media/folder", {
        name,
        parent: currentFolder || null,
      });

      setFolderName("");
      setShowFolderModal(false);

      await fetchMedia(currentFolder, search);
    } catch (error) {
      console.error("Create folder failed:", error);

      alert(error?.response?.data?.message || "Failed to create folder");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RENAME
  |--------------------------------------------------------------------------
  */

  const openRename = (item) => {
    setSelectedItem(item);
    setRenameValue(item.name);
    setRenameModal(true);
  };

  const renameItem = async () => {
    const name = renameValue.trim();

    if (!name || !selectedItem) {
      return;
    }

    try {
      await api.patch(`/media/rename/${selectedItem._id}`, {
        name,
      });

      setRenameModal(false);
      setRenameValue("");
      setSelectedItem(null);

      await fetchMedia(currentFolder, search);
    } catch (error) {
      console.error("Rename failed:", error);

      alert(error?.response?.data?.message || "Failed to rename");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const deleteItem = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/media/${item._id}`);

      setSelectedItem(null);

      await fetchMedia(currentFolder, search);
    } catch (error) {
      console.error("Delete failed:", error);

      alert(error?.response?.data?.message || "Failed to delete");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DOWNLOAD
  |--------------------------------------------------------------------------
  */

  const downloadItem = (item) => {
    window.open(`${API_BASE}/api/media/download/${item._id}`, "_blank");
  };

  /*
  |--------------------------------------------------------------------------
  | FILE ICON
  |--------------------------------------------------------------------------
  */

  const getFileIcon = (item) => {
    if (item.type === "folder") {
      return <Folder size={42} className="text-blue-500" fill="currentColor" />;
    }

    if (item.mimeType?.startsWith("image/")) {
      return <FileImage size={42} className="text-purple-500" />;
    }

    if (item.mimeType === "application/pdf") {
      return <FileText size={42} className="text-red-500" />;
    }

    return <File size={42} className="text-gray-500" />;
  };

  /*
  |--------------------------------------------------------------------------
  | NOT OPEN
  |--------------------------------------------------------------------------
  */

  if (!open) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Select Media
            </h2>

            <p className="text-xs text-gray-500">
              Select a file from your media library
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* TOOLBAR */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-3">
          {/* LEFT */}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              disabled={breadcrumbs.length === 0}
              className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={goHome}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Home
            </button>

            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb._id}>
                <ChevronRight size={15} className="text-gray-400" />

                <button
                  type="button"
                  onClick={() => goToBreadcrumb(index)}
                  className="max-w-[150px] truncate text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  {breadcrumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-56 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload size={17} />

              {uploading ? "Uploading..." : "Upload"}
            </button>

            <button
              type="button"
              onClick={() => setShowFolderModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FolderPlus size={17} />
              Folder
            </button>

            <button
              type="button"
              onClick={() => fetchMedia(currentFolder, search)}
              className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw size={18} className="animate-spin" />
                Loading...
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center">
              <Folder size={48} className="text-gray-300" />

              <p className="mt-3 text-sm font-medium text-gray-700">
                No files found
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Upload a file or create a folder
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
              {items.map((item) => {
                const isSelected = selectedItem?._id === item._id;

                return (
                  <div
                    key={item._id}
                    className={`group relative rounded-xl border p-3 transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    {/* SELECT CHECK */}

                    {isSelected && item.type === "file" && (
                      <div className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                        <Check size={14} />
                      </div>
                    )}

                    {/* MENU */}

                    <div className="absolute right-2 top-2 z-20">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedItem(isSelected ? null : item)
                        }
                        className="rounded-lg bg-white/90 p-1.5 text-gray-400 shadow-sm hover:text-gray-700"
                      >
                        <MoreVertical size={17} />
                      </button>

                      {isSelected && (
                        <div className="absolute right-0 top-8 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                          {item.type === "file" && (
                            <button
                              type="button"
                              onClick={() => downloadItem(item)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-gray-50"
                            >
                              <Download size={14} />
                              Download
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openRename(item)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-gray-50"
                          >
                            <Pencil size={14} />
                            Rename
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteItem(item)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* FILE */}

                    <button
                      type="button"
                      onDoubleClick={() => {
                        if (item.type === "folder") {
                          openFolder(item);
                        }
                      }}
                      onClick={() => handleSelectItem(item)}
                      className="w-full"
                    >
                      <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                        {item.type === "file" &&
                        item.mimeType?.startsWith("image/") ? (
                          <img
                            src={
                              item.url ||
                              `${API_BASE}/api/media/preview/${item._id}`
                            }
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getFileIcon(item)
                        )}
                      </div>

                      <p className="mt-3 truncate text-center text-sm font-medium text-gray-800">
                        {item.name}
                      </p>

                      <p className="mt-1 text-center text-xs text-gray-400">
                        {item.type === "folder"
                          ? "Folder"
                          : formatFileSize(item.size)}
                      </p>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-3">
          <div className="text-sm text-gray-500">
            {selectedItem && selectedItem.type === "file" ? (
              <>
                Selected:
                <span className="ml-1 font-medium text-gray-800">
                  {selectedItem.name}
                </span>
              </>
            ) : (
              "No file selected"
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleInsert}
              disabled={!selectedItem || selectedItem.type === "folder"}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={17} />
              Select
            </button>
          </div>
        </div>
      </div>

      {/* CREATE FOLDER */}

      {showFolderModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <h3 className="font-semibold">Create Folder</h3>

              <button type="button" onClick={() => setShowFolderModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <input
                autoFocus
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    createFolder();
                  }
                }}
                placeholder="Folder name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 border-t p-5">
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createFolder}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME */}

      {renameModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <h3 className="font-semibold">Rename</h3>

              <button type="button" onClick={() => setRenameModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    renameItem();
                  }
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 border-t p-5">
              <button
                type="button"
                onClick={() => setRenameModal(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={renameItem}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| FILE SIZE
|--------------------------------------------------------------------------
*/

const formatFileSize = (bytes = 0) => {
  if (!bytes) {
    return "0 KB";
  }

  const units = ["Bytes", "KB", "MB", "GB"];

  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(
    index === 0 ? 0 : 2,
  )} ${units[index]}`;
};

export default MediaManager;
