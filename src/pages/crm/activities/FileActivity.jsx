import React from "react";

import {
  FileText,
  Download,
} from "lucide-react";

const FileActivity = ({
  activities = [],
  formatDateTime,
}) => {
  if (!activities.length) {
    return (
      <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
        <div className="text-center">
          <FileText className="mx-auto h-7 w-7 text-slate-300" />

          <p className="mt-2 text-sm font-medium text-slate-500">
            No files
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No files have been added to this lead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const fileUrl =
          activity?.metadata?.url ||
          activity?.metadata?.fileUrl ||
          activity?.fileUrl ||
          "";

        const fileName =
          activity?.metadata?.fileName ||
          activity?.fileName ||
          activity?.title ||
          "File";

        return (
          <div
            key={
              activity?._id ||
              `file-${index}`
            }
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <FileText className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {fileName}
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  {formatDateTime(
                    activity?.createdAt
                  )}
                </p>
              </div>

              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  title="Open file"
                >
                  <Download className="h-4 w-4" />
                </a>
              )}
            </div>

            {activity?.description && (
              <p className="mt-3 text-xs leading-5 text-slate-500">
                {activity.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FileActivity;