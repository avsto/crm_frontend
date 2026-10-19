// src/pages/products/ImportProducts.jsx

import React, { useMemo, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  X,
} from "lucide-react";

const REQUIRED_FIELDS = ["name", "sku", "price"];

const AVAILABLE_FIELDS = [
  {
    key: "name",
    label: "Product Name",
    required: true,
  },
  {
    key: "sku",
    label: "SKU",
    required: true,
  },
  {
    key: "description",
    label: "Description",
    required: false,
  },
  {
    key: "price",
    label: "Price",
    required: true,
  },
  {
    key: "salePrice",
    label: "Sale Price",
    required: false,
  },
  {
    key: "stock",
    label: "Stock",
    required: false,
  },
  {
    key: "reorderLevel",
    label: "Reorder Level",
    required: false,
  },
  {
    key: "brand",
    label: "Brand",
    required: false,
  },
  {
    key: "unit",
    label: "Unit",
    required: false,
  },
];

const SAMPLE_DATA = [
  {
    name: "Premium Cotton Shirt",
    sku: "PRD-1001",
    description: "Premium quality cotton shirt",
    price: "1299",
    salePrice: "999",
    stock: "50",
    reorderLevel: "10",
    brand: "Avsto",
    unit: "piece",
  },
  {
    name: "Running Sports Shoes",
    sku: "PRD-1002",
    description: "Comfortable running shoes",
    price: "2499",
    salePrice: "1999",
    stock: "30",
    reorderLevel: "5",
    brand: "Avsto",
    unit: "pair",
  },
  {
    name: "Wireless Headphones",
    sku: "PRD-1003",
    description: "Bluetooth wireless headphones",
    price: "1799",
    salePrice: "1499",
    stock: "25",
    reorderLevel: "5",
    brand: "Avsto",
    unit: "piece",
  },
];

const STEPS = [
  {
    id: 1,
    label: "Upload File",
  },
  {
    id: 2,
    label: "Map Columns",
  },
  {
    id: 3,
    label: "Preview",
  },
  {
    id: 4,
    label: "Import",
  },
];

const ImportProducts = () => {
  const [step, setStep] = useState(1);

  const [file, setFile] = useState(null);

  const [dragActive, setDragActive] = useState(false);

  const [rows, setRows] = useState([]);

  const [headers, setHeaders] = useState([]);

  const [mapping, setMapping] = useState({});

  const [errors, setErrors] = useState([]);

  const [importing, setImporting] = useState(false);

  const [importResult, setImportResult] = useState(null);

  /* =====================================================
     FILE HANDLING
  ===================================================== */

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    const extension = selectedFile.name.split(".").pop().toLowerCase();

    return ["csv", "xlsx", "xls"].includes(extension);
  };

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;

    if (!validateFile(selectedFile)) {
      setErrors(["Please upload a CSV, XLSX or XLS file."]);

      return;
    }

    setErrors([]);

    setFile(selectedFile);

    /*
     * For real API:
     *
     * const formData = new FormData();
     * formData.append("file", selectedFile);
     *
     * const response =
     *   await productApi.previewImport(formData);
     *
     * setHeaders(response.data.headers);
     * setRows(response.data.rows);
     */

    // Demo headers
    const demoHeaders = [
      "name",
      "sku",
      "description",
      "price",
      "salePrice",
      "stock",
      "reorderLevel",
      "brand",
      "unit",
    ];

    setHeaders(demoHeaders);
    setRows(SAMPLE_DATA);

    // Auto mapping when headers match fields
    const autoMapping = {};

    AVAILABLE_FIELDS.forEach((field) => {
      const matchedHeader = demoHeaders.find(
        (header) => header.toLowerCase() === field.key.toLowerCase(),
      );

      if (matchedHeader) {
        autoMapping[field.key] = matchedHeader;
      }
    });

    setMapping(autoMapping);

    setStep(2);
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files?.[0];

    handleFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];

    handleFile(droppedFile);
  };

  /* =====================================================
     MAPPING
  ===================================================== */

  const requiredMapped = useMemo(() => {
    return REQUIRED_FIELDS.every((field) => mapping[field]);
  }, [mapping]);

  const updateMapping = (field, selectedHeader) => {
    setMapping((current) => ({
      ...current,
      [field]: selectedHeader,
    }));
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateRows = () => {
    const validationErrors = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;

      const name = row[mapping.name];

      const sku = row[mapping.sku];

      const price = row[mapping.price];

      if (!name?.toString().trim()) {
        validationErrors.push(`Row ${rowNumber}: Product name is required.`);
      }

      if (!sku?.toString().trim()) {
        validationErrors.push(`Row ${rowNumber}: SKU is required.`);
      }

      if (
        price === undefined ||
        price === null ||
        price === "" ||
        Number.isNaN(Number(price))
      ) {
        validationErrors.push(`Row ${rowNumber}: Valid price is required.`);
      }
    });

    setErrors(validationErrors);

    return validationErrors.length === 0;
  };

  /* =====================================================
     NEXT
  ===================================================== */

  const handleNext = () => {
    if (step === 1) {
      if (!file) {
        setErrors(["Please select a file first."]);

        return;
      }

      setStep(2);

      return;
    }

    if (step === 2) {
      if (!requiredMapped) {
        setErrors(["Please map Product Name, SKU and Price."]);

        return;
      }

      if (!validateRows()) {
        return;
      }

      setStep(3);

      return;
    }

    if (step === 3) {
      setStep(4);
    }
  };

  /* =====================================================
     BACK
  ===================================================== */

  const handleBack = () => {
    if (step > 1) {
      setErrors([]);
      setStep(step - 1);
    }
  };

  /* =====================================================
     IMPORT
  ===================================================== */

  const handleImport = async () => {
    try {
      setImporting(true);
      setErrors([]);

      /*
       * Real API:
       *
       * const payload = {
       *   file,
       *   mapping,
       * };
       *
       * const response =
       *   await productApi.importProducts(
       *     payload
       *   );
       */

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setImportResult({
        success: rows.length,
        failed: 0,
      });
    } catch (error) {
      console.error("Product import error:", error);

      setErrors(["Unable to import products. Please try again."]);
    } finally {
      setImporting(false);
    }
  };

  /* =====================================================
     RESET
  ===================================================== */

  const resetImport = () => {
    setStep(1);
    setFile(null);
    setRows([]);
    setHeaders([]);
    setMapping({});
    setErrors([]);
    setImportResult(null);
  };

  /* =====================================================
     DOWNLOAD TEMPLATE
  ===================================================== */

  const downloadTemplate = () => {
    const csv = [
      [
        "name",
        "sku",
        "description",
        "price",
        "salePrice",
        "stock",
        "reorderLevel",
        "brand",
        "unit",
      ].join(","),
      [
        "Premium Cotton Shirt",
        "PRD-1001",
        "Premium quality cotton shirt",
        "1299",
        "999",
        "50",
        "10",
        "Avsto",
        "piece",
      ].join(","),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "product-import-template.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Import Products</h1>

        <p className="mt-1 text-sm text-gray-500">
          Import multiple products using CSV or Excel file
        </p>
      </div>

      {/* STEPS */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          {STEPS.map((item, index) => {
            const active = step === item.id;

            const completed = step > item.id;

            return (
              <React.Fragment key={item.id}>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                      completed
                        ? "bg-emerald-600 text-white"
                        : active
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {completed ? <CheckCircle2 size={18} /> : item.id}
                  </div>

                  <span
                    className={`hidden text-sm font-medium sm:block ${
                      active
                        ? "text-blue-600"
                        : completed
                          ? "text-emerald-600"
                          : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-px flex-1 ${
                      step > item.id ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ERROR */}
      {errors.length > 0 && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />

            <div className="min-w-0">
              <p className="font-semibold text-red-800">
                Please fix the following:
              </p>

              <ul className="mt-2 space-y-1">
                {errors.slice(0, 10).map((error, index) => (
                  <li key={index} className="text-sm text-red-700">
                    {error}
                  </li>
                ))}
              </ul>

              {errors.length > 10 && (
                <p className="mt-1 text-xs text-red-600">
                  + {errors.length - 10} more errors
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setErrors([])}
              className="ml-auto text-red-400 hover:text-red-700"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          STEP 1
      ================================================= */}

      {step === 1 && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upload */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="font-semibold text-gray-900">
                  Upload Product File
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Upload CSV, XLS or XLSX file
                </p>
              </div>

              <label
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={handleDrop}
                className={`flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
              >
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleInputChange}
                  className="hidden"
                />

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Upload size={26} />
                </div>

                <p className="mt-4 font-semibold text-gray-900">
                  Drop your file here
                </p>

                <p className="mt-1 text-sm text-gray-500">or click to browse</p>

                <p className="mt-4 text-xs text-gray-400">
                  Supported formats: CSV, XLS, XLSX
                </p>
              </label>

              {file && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <FileSpreadsheet size={20} className="text-emerald-600" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {file.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  <CheckCircle2 size={20} className="text-emerald-600" />
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">Import Guidelines</h2>

            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <p className="text-sm text-gray-600">
                  Product Name, SKU and Price are required.
                </p>
              </div>

              <div className="flex gap-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <p className="text-sm text-gray-600">
                  SKU should be unique for each product.
                </p>
              </div>

              <div className="flex gap-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <p className="text-sm text-gray-600">
                  Stock and reorder level are optional.
                </p>
              </div>

              <div className="flex gap-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <p className="text-sm text-gray-600">
                  Duplicate SKUs will be validated before import.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download size={17} />
              Download Template
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          STEP 2
      ================================================= */}

      {step === 2 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900">Map Columns</h2>

            <p className="mt-1 text-sm text-gray-500">
              Match your file columns with product fields
            </p>
          </div>

          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {AVAILABLE_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {field.label}
                    </label>

                    {field.required && (
                      <span className="text-xs font-medium text-red-500">
                        Required
                      </span>
                    )}
                  </div>

                  <select
                    value={mapping[field.key] || ""}
                    onChange={(e) => updateMapping(field.key, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">-- Do not import --</option>

                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          STEP 3
      ================================================= */}

      {step === 3 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Preview Import</h2>

              <p className="mt-1 text-sm text-gray-500">
                Review your products before importing
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
              {rows.length} products
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                    Product
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                    SKU
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                    Price
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                    Sale Price
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                    Stock
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">
                    Reorder
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {row[mapping.name]}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {row[mapping.sku]}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      ₹{row[mapping.price]}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {mapping.salePrice
                        ? `₹${row[mapping.salePrice] || "-"}`
                        : "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {mapping.stock ? row[mapping.stock] || "0" : "0"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {mapping.reorderLevel
                        ? row[mapping.reorderLevel] || "0"
                        : "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================
          STEP 4
      ================================================= */}

      {step === 4 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {!importResult ? (
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <FileSpreadsheet size={30} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-gray-900">
                Ready to Import
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                You are about to import{" "}
                <strong className="text-gray-700">{rows.length}</strong>{" "}
                products.
              </p>

              <div className="mx-auto mt-6 max-w-sm rounded-xl bg-gray-50 p-4 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">File</span>

                  <span className="max-w-[200px] truncate font-medium text-gray-700">
                    {file?.name}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-500">Products</span>

                  <span className="font-medium text-gray-700">
                    {rows.length}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleImport}
                disabled={importing}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {importing ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={17} />
                    Import Products
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={34} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-gray-900">
                Import Completed
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Your products have been imported successfully.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-2xl font-bold text-emerald-700">
                    {importResult.success}
                  </p>

                  <p className="mt-1 text-sm text-emerald-600">Imported</p>
                </div>

                <div className="rounded-xl bg-red-50 p-4">
                  <p className="text-2xl font-bold text-red-700">
                    {importResult.failed}
                  </p>

                  <p className="mt-1 text-sm text-red-600">Failed</p>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={resetImport}
                  className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Import More
                </button>

                <button
                  type="button"
                  onClick={() => (window.location.href = "/products")}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  View Products
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================
          FOOTER ACTIONS
      ================================================= */}

      {!importResult && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          {step < 4 && (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              {step === 3 ? "Continue" : "Continue"}

              <ArrowRight size={17} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportProducts;
