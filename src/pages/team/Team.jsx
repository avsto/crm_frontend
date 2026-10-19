import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  Pencil,
  Trash2,
  RotateCcw,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Mail,
  Phone,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import teamApi from "../../api/team.api";

// ======================================================
// CONSTANTS
// ======================================================

const ROLES = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "manager",
    label: "Manager",
  },
  {
    value: "sales",
    label: "Sales",
  },
  {
    value: "marketing",
    label: "Marketing",
  },
  {
    value: "support",
    label: "Support",
  },
  {
    value: "staff",
    label: "Staff",
  },
];

const STATUSES = [
  {
    value: "active",
    label: "Active",
  },
  {
    value: "inactive",
    label: "Inactive",
  },
  {
    value: "suspended",
    label: "Suspended",
  },
  {
    value: "pending",
    label: "Pending",
  },
];

// ======================================================
// HELPERS
// ======================================================

const getRoleLabel = (role) => {
  if (role === "owner") {
    return "Owner";
  }

  const found = ROLES.find((item) => item.value === role);

  return found?.label || role || "Staff";
};

const getInitials = (name = "") => {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "U"
  );
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const formatDate = (date) => {
  if (!date) {
    return "Never";
  }

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Never";
  }
};

// ======================================================
// STATUS BADGE
// ======================================================

const StatusBadge = ({ status }) => {
  const config = {
    active: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      dot: "bg-emerald-500",
    },

    inactive: {
      label: "Inactive",
      className: "bg-gray-100 text-gray-600 ring-gray-500/20",
      dot: "bg-gray-400",
    },

    suspended: {
      label: "Suspended",
      className: "bg-red-50 text-red-700 ring-red-600/20",
      dot: "bg-red-500",
    },

    pending: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 ring-amber-600/20",
      dot: "bg-amber-500",
    },
  };

  const item = config[status] || config.inactive;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1
        text-xs
        font-medium
        ring-1
        ring-inset
        ${item.className}
      `}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />

      {item.label}
    </span>
  );
};

// ======================================================
// ROLE BADGE
// ======================================================

const RoleBadge = ({ role }) => {
  const colors = {
    owner: "bg-violet-50 text-violet-700 ring-violet-600/20",

    admin: "bg-blue-50 text-blue-700 ring-blue-600/20",

    manager: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",

    sales: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",

    marketing: "bg-pink-50 text-pink-700 ring-pink-600/20",

    support: "bg-orange-50 text-orange-700 ring-orange-600/20",

    staff: "bg-gray-100 text-gray-700 ring-gray-500/20",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5
        py-1
        text-xs
        font-medium
        ring-1
        ring-inset
        ${colors[role] || colors.staff}
      `}
    >
      {getRoleLabel(role)}
    </span>
  );
};

// ======================================================
// TEAM PAGE
// ======================================================

const Team = () => {
  const navigate = useNavigate();

  // ====================================================
  // STATE
  // ====================================================

  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState(null);

  const [restoringId, setRestoringId] = useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ====================================================
  // SEARCH / FILTER
  // ====================================================

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  // ====================================================
  // PAGINATION
  // ====================================================

  const [page, setPage] = useState(1);

  const [limit] = useState(20);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // ====================================================
  // DELETE CONFIRMATION
  // ====================================================

  const [deleteMember, setDeleteMember] = useState(null);

  // ====================================================
  // FETCH TEAM
  // ====================================================

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await teamApi.getTeamMembers({
        page,
        limit,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });

      const data = response?.data || [];

      setMembers(data);

      setPagination(
        response?.pagination || {
          page,
          limit,
          total: data.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: page > 1,
        },
      );
    } catch (err) {
      console.error("Fetch team error:", err);

      setError(getErrorMessage(err, "Failed to load team members"));
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // INITIAL / FILTER LOAD
  // ====================================================

  useEffect(() => {
    fetchTeam();
  }, [page, roleFilter, statusFilter]);

  // ====================================================
  // SEARCH
  // ====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        fetchTeam();
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ====================================================
  // STATS
  // ====================================================

  const stats = useMemo(() => {
    const total = pagination.total || members.length;

    const active = members.filter(
      (member) => member.status === "active",
    ).length;

    const inactive = members.filter(
      (member) => member.status === "inactive" || member.status === "suspended",
    ).length;

    const admins = members.filter(
      (member) => member.role === "admin" || member.role === "manager",
    ).length;

    return {
      total,
      active,
      inactive,
      admins,
    };
  }, [members, pagination.total]);

  // ====================================================
  // EDIT
  // ====================================================

  const handleEdit = (member) => {
    const id = member._id || member.id;

    if (!id) {
      setError("Team member ID is missing");
      return;
    }

    if (member.role === "owner") {
      setError("Owner account cannot be edited");
      return;
    }

    navigate(`/team/edit/${id}`);
  };

  // ====================================================
  // DELETE
  // ====================================================

  const handleDelete = async () => {
    if (!deleteMember) {
      return;
    }

    const id = deleteMember._id || deleteMember.id;

    if (!id) {
      setError("Team member ID is missing");
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await teamApi.deleteTeamMember(id);

      setDeleteMember(null);

      setSuccess("Team member deleted successfully");

      await fetchTeam();
    } catch (err) {
      console.error("Delete team member error:", err);

      setError(getErrorMessage(err, "Failed to delete team member"));
    } finally {
      setDeletingId(null);
    }
  };

  // ====================================================
  // RESTORE
  // ====================================================

  const handleRestore = async (member) => {
    const id = member._id || member.id;

    if (!id) {
      setError("Team member ID is missing");
      return;
    }

    try {
      setRestoringId(id);
      setError("");

      await teamApi.restoreTeamMember(id);

      setSuccess("Team member restored successfully");

      await fetchTeam();
    } catch (err) {
      console.error("Restore team member error:", err);

      setError(getErrorMessage(err, "Failed to restore team member"));
    } finally {
      setRestoringId(null);
    }
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Users size={21} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">Team</h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Manage and monitor your business team
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <main className="p-6 lg:p-8">
        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ==================================================
            STATS
        ================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Members
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={19} />
              </div>
            </div>
          </div>

          {/* Active */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active</p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {stats.active}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <UserCheck size={19} />
              </div>
            </div>
          </div>

          {/* Inactive */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Inactive</p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {stats.inactive}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <UserX size={19} />
              </div>
            </div>
          </div>

          {/* Admins */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Admin / Managers
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {stats.admins}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <ShieldCheck size={19} />
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* Search */}

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email or phone..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Role */}

            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);

                setPage(1);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Roles</option>

              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);

                setPage(1);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Status</option>

              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ==================================================
            TABLE
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Member
                  </th>

                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Role
                  </th>

                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Last Login
                  </th>

                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {/* Loading */}

                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2
                          size={28}
                          className="animate-spin text-blue-600"
                        />

                        <p className="mt-3 text-sm text-slate-500">
                          Loading team members...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  /* Empty */

                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <Users size={25} />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-slate-900">
                          No team members found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          No team members match your current search or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  members.map((member) => {
                    const id = member._id || member.id;

                    return (
                      <tr
                        key={id}
                        className="group transition hover:bg-slate-50"
                      >
                        {/* Member */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="h-10 w-10 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
                                {getInitials(member.name)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {member.name}
                                </p>

                                {member.role === "owner" && (
                                  <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                                    OWNER
                                  </span>
                                )}
                              </div>

                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}

                        <td className="px-5 py-4">
                          <RoleBadge role={member.role} />
                        </td>

                        {/* Contact */}

                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            {member.email && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Mail size={13} />

                                <span>{member.email}</span>
                              </div>
                            )}

                            {member.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Phone size={13} />

                                <span>{member.phone}</span>
                              </div>
                            )}

                            {!member.email && !member.phone && (
                              <span className="text-xs text-slate-400">
                                No contact information
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">
                          <StatusBadge status={member.status} />
                        </td>

                        {/* Last Login */}

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-600">
                            {formatDate(member.lastLoginAt)}
                          </p>
                        </td>

                        {/* Actions */}

                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            {member.role === "owner" ? (
                              <span className="text-xs font-medium text-slate-400">
                                Protected
                              </span>
                            ) : (
                              <div className="flex items-center gap-1">
                                {/* Edit */}

                                <button
                                  type="button"
                                  onClick={() => handleEdit(member)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>

                                {/* Restore */}

                                {member.status === "inactive" ? (
                                  <button
                                    type="button"
                                    disabled={restoringId === id}
                                    onClick={() => handleRestore(member)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                                    title="Restore"
                                  >
                                    {restoringId === id ? (
                                      <Loader2
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <RotateCcw size={16} />
                                    )}
                                  </button>
                                ) : (
                                  /* Delete */

                                  <button
                                    type="button"
                                    disabled={deletingId === id}
                                    onClick={() => setDeleteMember(member)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    title="Delete"
                                  >
                                    {deletingId === id ? (
                                      <Loader2
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2 size={16} />
                                    )}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ==================================================
              PAGINATION
          ================================================== */}

          {!loading && members.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {members.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {pagination.total}
                </span>{" "}
                members
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="min-w-[100px] text-center text-sm font-medium text-slate-700">
                  Page {pagination.page || page} of {pagination.totalPages || 1}
                </span>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ====================================================
          DELETE CONFIRMATION
      ==================================================== */}

      {deleteMember && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Delete team member?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-slate-700">
                {deleteMember.name}
              </span>
              ? The member will be soft deleted and can be restored later.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() => setDeleteMember(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deletingId !== null}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deletingId !== null && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
