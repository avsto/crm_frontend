import React from "react";

import {
  Phone,
  CircleDot,
} from "lucide-react";

const CallActivity = ({
  activities = [],
  formatDateTime,
}) => {
  if (!activities.length) {
    return (
      <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
        <div className="text-center">
          <Phone className="mx-auto h-7 w-7 text-slate-300" />

          <p className="mt-2 text-sm font-medium text-slate-500">
            No call activity
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No calls have been recorded for this lead.
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
            `call-${index}`
          }
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Phone className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {activity?.title ||
                      "Phone Call"}
                  </p>

                  {activity?.description && (
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {activity.description}
                    </p>
                  )}
                </div>

                <span className="shrink-0 text-[10px] text-slate-400">
                  {formatDateTime(
                    activity?.createdAt
                  )}
                </span>
              </div>

              {activity?.metadata && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activity.metadata.duration && (
                    <span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] text-slate-500">
                      Duration:{" "}
                      {activity.metadata.duration}
                    </span>
                  )}

                  {activity.metadata.status && (
                    <span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] text-slate-500">
                      {activity.metadata.status}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CallActivity;