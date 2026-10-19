import React from "react";

import {
  StickyNote,
} from "lucide-react";

const NoteActivity = ({
  activities = [],
  formatDateTime,
}) => {
  if (!activities.length) {
    return (
      <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
        <div className="text-center">
          <StickyNote className="mx-auto h-7 w-7 text-slate-300" />

          <p className="mt-2 text-sm font-medium text-slate-500">
            No notes
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No notes have been added to this lead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div
          key={
            activity?._id ||
            `note-${index}`
          }
          className="rounded-xl border border-yellow-100 bg-yellow-50/40 p-4"
        >
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <StickyNote className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">
                  {activity?.title ||
                    "Note"}
                </p>

                <span className="shrink-0 text-[10px] text-slate-400">
                  {formatDateTime(
                    activity?.createdAt
                  )}
                </span>
              </div>

              <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-3 text-sm leading-6 text-slate-600">
                {activity?.description ||
                  activity?.content ||
                  "No note content"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoteActivity;