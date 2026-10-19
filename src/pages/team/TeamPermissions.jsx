
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const TeamPermissions = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("admin");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const roles = [
    {
      id: "admin",
      name: "Admin",
      description: "Full access",
      members: 2,
    },
    {
      id: "sales_manager",
      name: "Sales Manager",
      description: "Sales team management",
      members: 4,
    },
    {
      id: "sales_executive",
      name: "Sales Executive",
      description: "Assigned sales access",
      members: 8,
    },
    {
      id: "marketing",
      name: "Marketing",
      description: "Marketing & content access",
      members: 3,
    },
    {
      id: "support",
      name: "Support",
      description: "Customer support access",
      members: 5,
    },
  ];

  const modules = [
    {
      category: "CRM",
      items: [
        "Dashboard",
        "Leads",
        "Contacts",
        "Companies",
        "Tasks",
      ],
    },
    {
      category: "Commerce",
      items: [
        "Products",
        "Orders",
        "Customers",
      ],
    },
    {
      category: "Marketing",
      items: [
        "Content",
        "Campaigns",
        "Social Media",
        "Websites",
        "Backlinks",
        "Automation",
      ],
    },
    {
      category: "Analytics",
      items: [
        "Reports",
        "Analytics",
      ],
    },
    {
      category: "Administration",
      items: [
        "Team",
        "Roles",
        "Settings",
        "Integrations",
      ],
    },
  ];

  const allModules = modules.flatMap((group) => group.items);

  const permissionActions = [
    "view",
    "create",
    "edit",
    "delete",
    "export",
  ];

  const defaultPermissions = {
    Dashboard: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      export: false,
    },

    Leads: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      export: true,
    },

    Contacts: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      export: true,
    },

    Companies: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      export: true,
    },

    Tasks: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      export: false,
    },

    Products: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      export: true,
    },

    Orders: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      export: true,
    },

    Customers: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      export: true,
    },

    Content: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      export: false,
    },

    Campaigns: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      export: false,
    },

    "Social Media": {
      view: true,
      create: true,
      edit: true,
      delete: true,
      export: false,
    },

    Websites: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      export: false,
    },

    Backlinks: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      export: false,
    },

    Automation: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      export: false,
    },

    Reports: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      export: true,
    },

    Analytics: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      export: true,
    },

    Team: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      export: true,
    },

    Roles: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      export: false,
    },

    Settings: {
      view: true,
      create: false,
      edit: true,
      delete: false,
      export: false,
    },

    Integrations: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      export: false,
    },
  };

  const createRolePermissions = (roleId) => {
    const permissions = {};

    allModules.forEach((module) => {
      permissions[module] = {
        ...defaultPermissions[module],
      };

      if (roleId === "sales_executive") {
        permissions[module] = {
          view: [
            "Dashboard",
            "Leads",
            "Contacts",
            "Companies",
            "Tasks",
            "Orders",
            "Customers",
          ].includes(module),

          create: [
            "Leads",
            "Contacts",
            "Tasks",
          ].includes(module),

          edit: [
            "Leads",
            "Contacts",
            "Tasks",
          ].includes(module),

          delete: false,
          export: false,
        };
      }

      if (roleId === "support") {
        permissions[module] = {
          view: [
            "Dashboard",
            "Leads",
            "Contacts",
            "Orders",
            "Customers",
            "Tasks",
          ].includes(module),

          create: [
            "Contacts",
            "Tasks",
          ].includes(module),

          edit: [
            "Contacts",
            "Orders",
            "Customers",
            "Tasks",
          ].includes(module),

          delete: false,
          export: false,
        };
      }

      if (roleId === "marketing") {
        permissions[module] = {
          view: [
            "Dashboard",
            "Contacts",
            "Content",
            "Campaigns",
            "Social Media",
            "Websites",
            "Backlinks",
            "Automation",
            "Reports",
            "Analytics",
          ].includes(module),

          create: [
            "Content",
            "Campaigns",
            "Social Media",
            "Backlinks",
            "Automation",
          ].includes(module),

          edit: [
            "Content",
            "Campaigns",
            "Social Media",
            "Websites",
            "Backlinks",
            "Automation",
          ].includes(module),

          delete: [
            "Content",
            "Campaigns",
            "Social Media",
          ].includes(module),

          export: [
            "Reports",
            "Analytics",
          ].includes(module),
        };
      }

      if (roleId === "sales_manager") {
        permissions[module] = {
          view: [
            "Dashboard",
            "Leads",
            "Contacts",
            "Companies",
            "Tasks",
            "Orders",
            "Customers",
            "Reports",
            "Analytics",
            "Team",
          ].includes(module),

          create: [
            "Leads",
            "Contacts",
            "Companies",
            "Tasks",
            "Orders",
          ].includes(module),

          edit: [
            "Leads",
            "Contacts",
            "Companies",
            "Tasks",
            "Orders",
            "Customers",
            "Team",
          ].includes(module),

          delete: [
            "Leads",
            "Contacts",
            "Tasks",
          ].includes(module),

          export: [
            "Leads",
            "Contacts",
            "Orders",
            "Reports",
            "Analytics",
          ].includes(module),
        };
      }
    });

    return permissions;
  };

  const [permissions, setPermissions] = useState(
    createRolePermissions("admin")
  );

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setPermissions(createRolePermissions(roleId));
  };

  const togglePermission = (module, action) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action],
      },
    }));
  };

  const toggleModule = (module, enabled) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        view: enabled,
        create: enabled,
        edit: enabled,
        delete: enabled,
        export: enabled,
      },
    }));
  };

  const enableAll = () => {
    const updated = {};

    allModules.forEach((module) => {
      updated[module] = {
        view: true,
        create: true,
        edit: true,
        delete: true,
        export: true,
      };
    });

    setPermissions(updated);
  };

  const disableAll = () => {
    const updated = {};

    allModules.forEach((module) => {
      updated[module] = {
        view: false,
        create: false,
        edit: false,
        delete: false,
        export: false,
      };
    });

    setPermissions(updated);
  };

  const filteredGroups = useMemo(() => {
    if (!search.trim()) {
      return modules;
    }

    return modules
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [search]);

  const selectedRoleData = roles.find(
    (role) => role.id === selectedRole
  );

  const totalPermissions = allModules.length * permissionActions.length;

  const enabledPermissions = Object.values(permissions).reduce(
    (total, modulePermissions) =>
      total +
      Object.values(modulePermissions).filter(Boolean).length,
    0
  );

  const handleSave = async () => {
    setSaving(true);

    try {
      const payload = {
        role: selectedRole,
        permissions,
      };

      console.log("Saving permissions:", payload);

      // API:
      // await teamApi.updateRolePermissions(selectedRole, payload);

      await new Promise((resolve) => setTimeout(resolve, 700));

    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="border-b border-gray-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-4">

              <button
                type="button"
                onClick={() => navigate("/team")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
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
                  Permissions
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Control module access and actions for each team role.
                </p>

              </div>

            </div>


            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() => navigate("/team/roles")}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Manage Roles
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
              >

                {saving ? "Saving..." : "Save Changes"}

              </button>

            </div>

          </div>

        </div>

      </div>


      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Role selector */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-5">

            <h2 className="text-lg font-bold text-gray-900">
              Select Role
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose a role to configure its permissions.
            </p>

          </div>


          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">

            {roles.map((role) => {

              const selected = selectedRole === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleChange(role.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${
                        selected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {role.name.charAt(0)}
                    </span>

                    {selected && (
                      <svg
                        className="h-5 w-5 text-blue-600"
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
                    )}

                  </div>


                  <p className="mt-3 text-sm font-bold text-gray-900">
                    {role.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {role.description}
                  </p>

                  <p className="mt-3 text-xs font-medium text-gray-400">
                    {role.members} members
                  </p>

                </button>
              );
            })}

          </div>

        </div>


        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Selected Role
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900">
              {selectedRoleData?.name}
            </p>

          </div>


          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Enabled Permissions
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900">
              {enabledPermissions}
              <span className="ml-1 text-sm font-normal text-gray-400">
                / {totalPermissions}
              </span>
            </p>

          </div>


          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Team Members
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900">
              {selectedRoleData?.members}
            </p>

          </div>

        </div>


        {/* Permission matrix */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-gray-200 p-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-md">

              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search modules..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>


            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={enableAll}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Enable All
              </button>

              <button
                type="button"
                onClick={disableAll}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Disable All
              </button>

            </div>

          </div>


          {/* Matrix */}
          <div className="overflow-x-auto">

            <table className="min-w-[900px] w-full">

              <thead className="bg-gray-50">

                <tr className="border-b border-gray-200">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Module
                  </th>

                  {permissionActions.map((action) => (

                    <th
                      key={action}
                      className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                      {action}
                    </th>

                  ))}

                  <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    All
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredGroups.map((group) => (

                  <React.Fragment key={group.category}>

                    {/* Category */}
                    <tr className="bg-gray-50/70">

                      <td
                        colSpan={7}
                        className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500"
                      >
                        {group.category}
                      </td>

                    </tr>


                    {/* Modules */}
                    {group.items.map((module) => {

                      const modulePermissions =
                        permissions[module] || {};

                      const allEnabled =
                        permissionActions.every(
                          (action) => modulePermissions[action]
                        );

                      return (
                        <tr
                          key={module}
                          className="border-b border-gray-100 transition hover:bg-gray-50"
                        >

                          {/* Module */}
                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">

                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                  />
                                </svg>

                              </div>

                              <span className="text-sm font-semibold text-gray-800">
                                {module}
                              </span>

                            </div>

                          </td>


                          {/* Actions */}
                          {permissionActions.map((action) => (

                            <td
                              key={action}
                              className="px-4 py-4 text-center"
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  togglePermission(module, action)
                                }
                                className={`mx-auto flex h-6 w-6 items-center justify-center rounded-md border transition ${
                                  modulePermissions[action]
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-gray-300 bg-white text-transparent hover:border-gray-400"
                                }`}
                              >

                                {modulePermissions[action] && (

                                  <svg
                                    className="h-4 w-4"
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

                                )}

                              </button>

                            </td>

                          ))}


                          {/* All */}
                          <td className="px-4 py-4 text-center">

                            <button
                              type="button"
                              onClick={() =>
                                toggleModule(module, !allEnabled)
                              }
                              className={`mx-auto flex h-6 w-6 items-center justify-center rounded-md border transition ${
                                allEnabled
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-gray-300 bg-white"
                              }`}
                            >

                              {allEnabled && (

                                <svg
                                  className="h-4 w-4"
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

                              )}

                            </button>

                          </td>

                        </tr>
                      );
                    })}

                  </React.Fragment>

                ))}

              </tbody>

            </table>

          </div>


          {/* Footer */}
          <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold text-gray-900">
                {selectedRoleData?.name} permissions
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Changes will apply to all members assigned to this role.
              </p>

            </div>


            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Permissions"}
            </button>

          </div>

        </div>


        {/* Info */}
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

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
                  d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000-16"
                />
              </svg>

            </div>

            <div>

              <h3 className="text-sm font-semibold text-gray-900">
                How permissions work
              </h3>

              <p className="mt-1 max-w-4xl text-sm leading-6 text-gray-600">
                View controls access to a module. Create, Edit and Delete
                control the actions a team member can perform. Export allows
                downloading module data. Permissions are assigned to roles
                and automatically apply to all members with that role.
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default TeamPermissions;