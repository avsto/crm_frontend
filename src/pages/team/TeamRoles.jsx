import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TeamRoles = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Admin",
      description: "Full access to the business CRM and team management.",
      users: 2,
      type: "system",
      permissions: [
        "Dashboard",
        "Leads",
        "Contacts",
        "Products",
        "Orders",
        "Content",
        "Marketing",
        "Websites",
        "Reports",
        "Settings",
        "Team",
      ],
    },
    {
      id: 2,
      name: "Sales Manager",
      description: "Manage sales team, leads, contacts and sales activities.",
      users: 4,
      type: "custom",
      permissions: [
        "Dashboard",
        "Leads",
        "Contacts",
        "Orders",
        "Reports",
        "Team",
      ],
    },
    {
      id: 3,
      name: "Sales Executive",
      description: "Manage assigned leads, contacts and customer activities.",
      users: 8,
      type: "custom",
      permissions: ["Dashboard", "Leads", "Contacts", "Orders"],
    },
    {
      id: 4,
      name: "Marketing",
      description: "Manage content, campaigns, social media and marketing.",
      users: 3,
      type: "custom",
      permissions: ["Dashboard", "Content", "Marketing", "Websites", "Reports"],
    },
    {
      id: 5,
      name: "Support",
      description: "Handle customer support, contacts and orders.",
      users: 5,
      type: "custom",
      permissions: ["Dashboard", "Contacts", "Orders", "Leads"],
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const permissionGroups = [
    {
      title: "CRM",
      permissions: ["Dashboard", "Leads", "Contacts", "Companies"],
    },
    {
      title: "Commerce",
      permissions: ["Products", "Orders", "Customers"],
    },
    {
      title: "Marketing",
      permissions: ["Content", "Marketing", "Social Media", "Websites"],
    },
    {
      title: "Analytics",
      permissions: ["Reports", "Analytics"],
    },
    {
      title: "Administration",
      permissions: ["Team", "Settings", "Integrations"],
    },
  ];

  const openCreate = () => {
    setEditingRole(null);

    setForm({
      name: "",
      description: "",
    });

    setShowModal(true);
  };

  const openEdit = (role) => {
    setEditingRole(role);

    setForm({
      name: role.name,
      description: role.description,
    });

    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) return;

    if (editingRole) {
      setRoles((prev) =>
        prev.map((role) =>
          role.id === editingRole.id
            ? {
                ...role,
                name: form.name,
                description: form.description,
              }
            : role,
        ),
      );
    } else {
      setRoles((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: form.name,
          description: form.description,
          users: 0,
          type: "custom",
          permissions: [],
        },
      ]);
    }

    setShowModal(false);
  };

  const deleteRole = (role) => {
    if (role.type === "system") {
      alert("System roles cannot be deleted.");
      return;
    }

    if (role.users > 0) {
      alert(
        "This role is assigned to team members. Reassign those members before deleting the role.",
      );
      return;
    }

    setRoles((prev) => prev.filter((item) => item.id !== role.id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/team")}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Roles & Permissions
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Create roles and control what your team members can access.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Role
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Roles</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {roles.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Custom Roles</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {roles.filter((role) => role.type === "custom").length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Assigned Members
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {roles.reduce((total, role) => total + role.users, 0)}
            </p>
          </div>
        </div>

        {/* Roles */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-6">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19.4 15a1.7 1.7 0 00.34 1.88l.06.06-1.4 1.4-.06-.06a1.7 1.7 0 00-1.88-.34 1.7 1.7 0 00-1.03 1.56V21h-2v-.5a1.7 1.7 0 00-1.03-1.56 1.7 1.7 0 00-1.88.34l-.06.06-1.4-1.4.06-.06A1.7 1.7 0 008.4 15a1.7 1.7 0 00-1.56-1.03H6v-2h.84A1.7 1.7 0 008.4 10a1.7 1.7 0 00-.34-1.88L8 8.06l1.4-1.4.06.06a1.7 1.7 0 001.88.34A1.7 1.7 0 0012.37 5.5V5h2v.5a1.7 1.7 0 001.03 1.56 1.7 1.7 0 001.88-.34l.06-.06 1.4 1.4-.06.06A1.7 1.7 0 0018.4 10a1.7 1.7 0 001.56 1.03H21v2h-.84A1.7 1.7 0 0019.4 15z"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">
                        {role.name}
                      </h2>

                      {role.type === "system" ? (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                          System
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                          Custom
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {role.description}
                    </p>
                  </div>
                </div>

                {/* Menu */}
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(role)}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    title="Edit role"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16.862 3.487a2.1 2.1 0 112.97 2.97L8.5 17.79 4 19l1.21-4.5L16.862 3.487z"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteRole(role)}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    title="Delete role"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 7h12m-9 0V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7m3 4v6m4-6v6"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-8a4 4 0 110 8 4 4 0 010-8zm6 4a3 3 0 100-6"
                      />
                    </svg>

                    <span className="text-sm text-gray-500">Team Members</span>
                  </div>

                  <span className="text-sm font-semibold text-gray-900">
                    {role.users}
                  </span>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      Permissions
                    </span>

                    <span className="text-xs text-gray-500">
                      {role.permissions.length} enabled
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {role.permissions.length > 0 ? (
                      role.permissions.slice(0, 6).map((permission) => (
                        <span
                          key={permission}
                          className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200"
                        >
                          {permission}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">
                        No permissions assigned
                      </span>
                    )}

                    {role.permissions.length > 6 && (
                      <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-600">
                        +{role.permissions.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <span className="text-xs text-gray-400">
                  {role.type === "system" ? "Built-in role" : "Custom role"}
                </span>

                <button
                  type="button"
                  onClick={() => openEdit(role)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Manage Permissions →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Permission Overview */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-bold text-gray-900">
              Available Permissions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Permissions available for custom roles in Brielix CRM.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {permissionGroups.map((group) => (
              <div
                key={group.title}
                className="rounded-xl border border-gray-200 p-5"
              >
                <h3 className="text-sm font-bold text-gray-900">
                  {group.title}
                </h3>

                <div className="mt-4 space-y-2">
                  {group.permissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <svg
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>

                      {permission}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingRole ? "Edit Role" : "Create Role"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingRole
                    ? "Update role information."
                    : "Create a custom role for your team."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Role Name
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Account Manager"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <textarea
                    rows="4"
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe what this role is responsible for..."
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                      />
                    </svg>

                    <p className="text-sm leading-6 text-blue-800">
                      After creating the role, you can assign detailed
                      permissions and team members.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {editingRole ? "Save Changes" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamRoles;
