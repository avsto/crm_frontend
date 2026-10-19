import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  Loader2,
  Tag,
  Upload,
  UserRound,
  X,
} from "lucide-react";

import crmApi from "../../api/crm.api";
import teamApi from "../../api/team.api";

// ====================================================
// LEAD FIELDS
// Based on actual Lead mongoose schema
// ====================================================

const LEAD_FIELDS = [
  {
    value: "name",
    label: "Lead Name",
    required: true,
  },
  {
    value: "email",
    label: "Email",
  },
  {
    value: "phone",
    label: "Phone",
  },
  {
    value: "phoneCountryCode",
    label: "Phone Country Code",
  },
  {
    value: "alternatePhone",
    label: "Alternate Phone",
  },
  {
    value: "companyName",
    label: "Company Name",
  },
  {
    value: "subject",
    label: "Subject",
  },
  {
    value: "message",
    label: "Message",
  },
  {
    value: "status",
    label: "Status",
  },
  {
    value: "priority",
    label: "Priority",
  },
  {
    value: "nextFollowUpAt",
    label: "Next Follow Up",
  },
  {
    value: "lastContactedAt",
    label: "Last Contacted",
  },
  {
    value: "assignedTo",
    label: "Assigned To",
  },
  {
    value: "source",
    label: "Source",
  },
  {
    value: "tag",
    label: "Tag",
  },
  {
    value: "createdBy",
    label: "Created By",
  },
  {
    value: "updatedBy",
    label: "Updated By",
  },
];

// ====================================================
// NORMALIZE
// ====================================================

const normalize = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[\_\-]+/g, " ")
    .replace(/\s+/g, " ");

// ====================================================
// AUTO DETECT FIELD
// ====================================================

const autoDetectField = (header) => {
  const value = normalize(header);

  const aliases = {
    name: [
      "name",
      "lead name",
      "lead_name",
      "fullname",
      "full name",
      "full_name",
      "lead",
      "customer name",
      "customer",
      "contact name",
      "contact person",
      "person name",
    ],

    email: [
      "email",
      "email address",
      "email_address",
      "e mail",
      "e-mail",
      "mail",
      "contact email",
    ],

    phone: [
      "phone",
      "mobile",
      "mobile number",
      "mobile_number",
      "phone number",
      "phone_number",
      "contact number",
      "contact_number",
      "contact",
      "contact phone",
      "primary phone",
      "primary mobile",
    ],

    phoneCountryCode: [
      "phone country code",
      "phone_country_code",
      "country code",
      "country_code",
      "phone code",
      "phone_code",
      "dial code",
      "dial_code",
      "calling code",
      "calling_code",
    ],

    alternatePhone: [
      "alternate phone",
      "alternate_phone",
      "alternate mobile",
      "alternate_mobile",
      "alternate number",
      "alternate_number",
      "secondary phone",
      "secondary_phone",
      "secondary mobile",
      "secondary_mobile",
      "other phone",
      "other mobile",
    ],

    companyName: [
      "company",
      "company name",
      "company_name",
      "organization",
      "organisation",
      "organization name",
      "organisation name",
      "business name",
      "business_name",
      "firm",
      "company title",
    ],

    subject: [
      "subject",
      "inquiry subject",
      "inquiry_subject",
      "enquiry subject",
      "enquiry_subject",
      "lead subject",
      "query",
      "title",
    ],

    message: [
      "message",
      "note",
      "notes",
      "description",
      "message note",
      "message_note",
      "comments",
      "comment",
      "remarks",
      "remark",
      "details",
      "inquiry",
      "enquiry",
      "lead message",
    ],

    status: [
      "status",
      "lead status",
      "lead_status",
      "lead stage",
      "lead_stage",
      "stage",
    ],

    priority: ["priority", "lead priority", "lead_priority", "importance"],

    nextFollowUpAt: [
      "next follow up",
      "next_follow_up",
      "next followup",
      "next_followup",
      "follow up",
      "follow_up",
      "followup",
      "follow up date",
      "follow_up_date",
      "followup date",
      "followup_date",
      "next follow up date",
      "next_follow_up_date",
      "next followup date",
      "next_followup_date",
      "follow up at",
      "follow_up_at",
      "next contact date",
      "next_contact",
    ],

    lastContactedAt: [
      "last contacted",
      "last_contacted",
      "last contacted at",
      "last_contacted_at",
      "last contact",
      "last_contact",
      "last contact date",
      "last_contact_date",
      "last contacted date",
      "last_contacted_date",
      "contacted date",
      "contacted_at",
    ],

    assignedTo: [
      "assigned to",
      "assigned_to",
      "assigned",
      "assignee",
      "sales person",
      "salesperson",
      "sales person name",
      "sales_person",
      "owner",
      "lead owner",
      "lead_owner",
      "agent",
      "assigned user",
      "assigned_user",
    ],

    source: [
      "source",
      "lead source",
      "lead_source",
      "source name",
      "lead channel",
      "channel",
      "origin",
    ],

    tag: ["tag", "tags", "lead tag", "lead_tag", "label", "lead label"],

    createdBy: [
      "created by",
      "created_by",
      "creator",
      "created user",
      "created_user",
    ],

    updatedBy: [
      "updated by",
      "updated_by",
      "updater",
      "updated user",
      "updated_user",
      "modified by",
      "modified_by",
    ],
  };

  for (const [field, names] of Object.entries(aliases)) {
    if (names.some((name) => normalize(name) === value)) {
      return field;
    }
  }

  return "";
};

// ====================================================
// FIELD HELPERS
// ====================================================

const getFieldLabel = (fieldValue) => {
  return (
    LEAD_FIELDS.find((field) => field.value === fieldValue)?.label || fieldValue
  );
};

const isDateField = (field) => {
  return field === "nextFollowUpAt" || field === "lastContactedAt";
};

// ====================================================
// MAIN COMPONENT
// ====================================================

const LeadImportDrawer = ({ open, onClose, onImported }) => {
  const fileInputRef = useRef(null);

  // ==================================================
  // FILE STATE
  // ==================================================

  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});

  // ==================================================
  // TEAM
  // ==================================================

  const [members, setMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);

  // ==================================================
  // TAGS
  // ==================================================

  const [tags, setTags] = useState([]);
  const [tagLoading, setTagLoading] = useState(false);

  // ==================================================
  // DEFAULT ASSIGNMENT / TAG
  // ==================================================

  const [assignedTo, setAssignedTo] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  // ==================================================
  // UI STATE
  // ==================================================

  const [readingFile, setReadingFile] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // =========================================================
  // FETCH TEAM + TAGS
  // =========================================================

  useEffect(() => {
    if (!open) return;

    const fetchTeam = async () => {
      try {
        setTeamLoading(true);

        const response = await teamApi.getTeamMembers({
          page: 1,
          limit: 100,
          search: undefined,
          role: undefined,
          status: "active",
        });

        const data =
          response?.data?.data?.data ||
          response?.data?.data ||
          response?.data ||
          [];

        setMembers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch team error:", err);
        setMembers([]);
      } finally {
        setTeamLoading(false);
      }
    };

    const fetchTags = async () => {
      try {
        setTagLoading(true);

        const response = await crmApi.getTags({
          page: 1,
          limit: 100,
        });

        const data =
          response?.data?.data?.data ||
          response?.data?.data ||
          response?.data ||
          [];

        setTags(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch tags error:", err);
        setTags([]);
      } finally {
        setTagLoading(false);
      }
    };

    fetchTeam();
    fetchTags();
  }, [open]);

  // =========================================================
  // RESET
  // =========================================================

  const resetDrawer = () => {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setMapping({});

    setAssignedTo("");
    setSelectedTag("");

    setError("");
    setSuccess("");

    setReadingFile(false);
    setImporting(false);
    setDragActive(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (importing) return;

    resetDrawer();
    onClose?.();
  };

  // =========================================================
  // READ EXCEL / CSV
  // =========================================================

  const readFile = async (selectedFile) => {
    if (!selectedFile) return;

    const extension = "." + selectedFile.name.split(".").pop().toLowerCase();

    const allowed = [".csv", ".xls", ".xlsx"];

    if (!allowed.includes(extension)) {
      setError("Only CSV, XLS and XLSX files are allowed.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      return;
    }

    try {
      setReadingFile(true);
      setError("");
      setSuccess("");

      const XLSX = await import("xlsx");

      const buffer = await selectedFile.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
      });

      if (!workbook.SheetNames.length) {
        throw new Error("No sheet found in the file.");
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: false,
      });

      if (!json.length) {
        throw new Error("The selected file is empty.");
      }

      const detectedHeaders = Object.keys(json[0]);

      if (!detectedHeaders.length) {
        throw new Error("No columns found in the selected file.");
      }

      const autoMapping = {};

      detectedHeaders.forEach((header) => {
        const detected = autoDetectField(header);

        if (detected && !Object.values(autoMapping).includes(detected)) {
          autoMapping[header] = detected;
        } else {
          autoMapping[header] = "";
        }
      });

      setFile(selectedFile);
      setHeaders(detectedHeaders);
      setRows(json);
      setMapping(autoMapping);
    } catch (err) {
      console.error("Read import file error:", err);

      setError(err?.message || "Failed to read the selected file.");

      setFile(null);
      setHeaders([]);
      setRows([]);
      setMapping({});
    } finally {
      setReadingFile(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      readFile(selectedFile);
    }
  };

  // =========================================================
  // DRAG & DROP
  // =========================================================

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      readFile(droppedFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  // =========================================================
  // MAPPING
  // =========================================================

  const mappedFields = useMemo(
    () => Object.values(mapping).filter(Boolean),
    [mapping],
  );

  const updateMapping = (header, value) => {
    setMapping((current) => {
      const next = {
        ...current,
      };

      // One lead field can only be mapped once.
      if (value) {
        Object.keys(next).forEach((key) => {
          if (key !== header && next[key] === value) {
            next[key] = "";
          }
        });
      }

      next[header] = value;

      return next;
    });
  };

  const requiredFieldsMissing = LEAD_FIELDS.filter(
    (field) => field.required && !mappedFields.includes(field.value),
  );

  // =========================================================
  // PREVIEW
  // =========================================================

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

  const mappedHeaders = useMemo(
    () => headers.filter((header) => mapping[header]),
    [headers, mapping],
  );

  // =========================================================
  // IMPORT
  // =========================================================

  const handleImport = async () => {
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a CSV or Excel file.");
      return;
    }

    if (requiredFieldsMissing.length > 0) {
      setError(
        `Please map required field: ${requiredFieldsMissing
          .map((item) => item.label)
          .join(", ")}`,
      );

      return;
    }

    try {
      setImporting(true);

      const formData = new FormData();

      formData.append("file", file);

      // Column mapping
      formData.append("mapping", JSON.stringify(mapping));

      // Default assignment
      formData.append("assignedTo", assignedTo || "");

      // Default tag
      formData.append("tag", selectedTag || "");

      const response = await crmApi.importLeads(formData);

      const result = response?.data;

      const imported = result?.imported ?? result?.data?.imported ?? 0;

      const skipped = result?.skipped ?? result?.data?.skipped ?? 0;

      setSuccess(
        `Import completed successfully. ${imported} leads imported${
          skipped ? ` and ${skipped} skipped` : ""
        }.`,
      );

      if (onImported) {
        await onImported(result);
      }

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      console.error("Import leads error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to import leads.",
      );
    } finally {
      setImporting(false);
    }
  };

  // =========================================================
  // CLOSE
  // =========================================================

  if (!open) return null;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-[1px]"
        onClick={handleClose}
      />

      {/* DRAWER */}
      <aside
        className="fixed right-0 top-0 z-[90] flex h-screen w-full max-w-[720px] flex-col bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-gray-200 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Import Leads
              </h2>

              <p className="mt-0.5 text-[10px] text-gray-400">
                Import leads from CSV or Excel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={importing}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {/* ERROR */}

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* =================================================
              FILE UPLOAD
          ================================================== */}

          {!file ? (
            <div>
              <div className="mb-2">
                <label className="text-xs font-semibold text-gray-800">
                  Select File
                </label>

                <p className="mt-0.5 text-[10px] text-gray-400">
                  Supported formats: CSV, XLS, XLSX. Maximum size 10 MB.
                </p>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
                  dragActive
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                  {readingFile ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  ) : (
                    <Upload className="h-5 w-5 text-blue-600" />
                  )}
                </div>

                <p className="mt-3 text-xs font-semibold text-gray-700">
                  {readingFile
                    ? "Reading file..."
                    : "Click to select or drag & drop"}
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  CSV, XLS or XLSX
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <>
              {/* =================================================
                  FILE INFO
              ================================================== */}

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-800">
                        {file.name}
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                        {" • "}
                        {rows.length} rows
                        {" • "}
                        {headers.length} columns
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setHeaders([]);
                      setRows([]);
                      setMapping({});
                      setSelectedTag("");

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="shrink-0 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* =================================================
                  DEFAULT ASSIGN USER
              ================================================== */}

              <div className="mt-5">
                <div className="mb-2">
                  <label className="text-xs font-semibold text-gray-800">
                    Default Assign To
                  </label>

                  <p className="mt-0.5 text-[10px] text-gray-400">
                    Used when the file does not contain an Assigned To column.
                  </p>
                </div>

                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />

                  <select
                    value={assignedTo}
                    onChange={(event) => setAssignedTo(event.target.value)}
                    disabled={teamLoading}
                    className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-xs text-gray-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-50 disabled:bg-gray-50"
                  >
                    <option value="">Unassigned</option>

                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name ||
                          member.fullName ||
                          member.email ||
                          "Team Member"}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* =================================================
                  DEFAULT TAG
              ================================================== */}

              <div className="mt-5">
                <div className="mb-2">
                  <label className="text-xs font-semibold text-gray-800">
                    Default Tag
                  </label>

                  <p className="mt-0.5 text-[10px] text-gray-400">
                    Used when the file does not contain a Tag column.
                  </p>
                </div>

                <div className="relative">
                  <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />

                  <select
                    value={selectedTag}
                    onChange={(event) => setSelectedTag(event.target.value)}
                    disabled={tagLoading}
                    className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-xs text-gray-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-50 disabled:bg-gray-50"
                  >
                    <option value="">No Tag</option>

                    {tags.map((tag) => (
                      <option key={tag._id} value={tag._id}>
                        {tag.name || tag.title || tag.label || "Unnamed Tag"}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>

                {tagLoading && (
                  <p className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading tags...
                  </p>
                )}

                {!tagLoading && tags.length === 0 && (
                  <p className="mt-1.5 text-[10px] text-gray-400">
                    No tags available.
                  </p>
                )}
              </div>

              {/* =================================================
                  COLUMN MAPPING
              ================================================== */}

              <div className="mt-6">
                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-800">
                      Map Columns
                    </h3>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Match your file columns with Lead fields.
                    </p>
                  </div>

                  <span className="text-[10px] text-gray-400">
                    {mappedFields.length}/{LEAD_FIELDS.length} mapped
                  </span>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                  {/* HEADER */}

                  <div className="grid grid-cols-[1fr_36px_1fr] border-b border-gray-200 bg-gray-50 px-3 py-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      File Column
                    </span>

                    <span />

                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Lead Field
                    </span>
                  </div>

                  {/* ROWS */}

                  <div className="max-h-[360px] overflow-y-auto">
                    {headers.map((header) => {
                      const selected = mapping[header] || "";

                      return (
                        <div
                          key={header}
                          className="grid grid-cols-[1fr_36px_1fr] items-center border-b border-gray-100 px-3 py-2.5 last:border-b-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-medium text-gray-700">
                              {header}
                            </p>

                            {rows[0]?.[header] !== undefined && (
                              <p className="mt-0.5 truncate text-[9px] text-gray-400">
                                {String(rows[0][header]) || "Empty"}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-center text-gray-300">
                            →
                          </div>

                          <div className="relative">
                            <select
                              value={selected}
                              onChange={(event) =>
                                updateMapping(header, event.target.value)
                              }
                              className={`h-8 w-full appearance-none rounded-md border bg-white px-2.5 pr-7 text-[10px] outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-50 ${
                                selected
                                  ? "border-blue-200 text-gray-700"
                                  : "border-gray-200 text-gray-400"
                              }`}
                            >
                              <option value="">Do not import</option>

                              {LEAD_FIELDS.map((field) => (
                                <option
                                  key={field.value}
                                  value={field.value}
                                  disabled={
                                    mappedFields.includes(field.value) &&
                                    selected !== field.value
                                  }
                                >
                                  {field.label}
                                  {field.required ? " *" : ""}
                                </option>
                              ))}
                            </select>

                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* REQUIRED FIELD STATUS */}

                {requiredFieldsMissing.length > 0 && (
                  <div className="mt-2 flex items-start gap-1.5 text-[10px] text-amber-600">
                    <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />

                    <span>
                      Required:{" "}
                      {requiredFieldsMissing
                        .map((field) => field.label)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* =================================================
                  PREVIEW
              ================================================== */}

              {previewRows.length > 0 && mappedHeaders.length > 0 && (
                <div className="mt-6">
                  <div className="mb-3">
                    <h3 className="text-xs font-semibold text-gray-800">
                      Preview
                    </h3>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Showing first 5 rows using your selected mapping.
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full min-w-[700px] border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          {mappedHeaders.map((header) => (
                            <th
                              key={header}
                              className="whitespace-nowrap px-3 py-2 text-left text-[9px] font-semibold uppercase tracking-wide text-gray-500"
                            >
                              {getFieldLabel(mapping[header])}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {previewRows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {mappedHeaders.map((header) => (
                              <td
                                key={header}
                                className="max-w-[180px] truncate px-3 py-2 text-[10px] text-gray-600"
                              >
                                {String(row[header] ?? "") || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* =================================================
                  FIELD INFORMATION
              ================================================== */}

              <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50/70 p-3">
                <div className="mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    Supported Lead Fields
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {LEAD_FIELDS.map((field) => (
                    <span
                      key={field.value}
                      className={`rounded-md border px-2 py-1 text-[9px] ${
                        mappedFields.includes(field.value)
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-500"
                      }`}
                    >
                      {field.label}
                      {field.required ? " *" : ""}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 bg-white px-5 py-4">
          <div className="text-[10px] text-gray-400">
            {file
              ? `${rows.length} lead${
                  rows.length === 1 ? "" : "s"
                } ready to import`
              : "Select a file to continue"}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={importing}
              className="h-9 rounded-md border border-gray-200 bg-white px-4 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleImport}
              disabled={
                !file ||
                importing ||
                readingFile ||
                requiredFieldsMissing.length > 0
              }
              className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-4 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}

              {importing ? "Importing..." : "Import Leads"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default LeadImportDrawer;
