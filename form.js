(function () {
  "use strict";

  // ==========================================
  // 1. EMBED CONFIGURATION
  // ==========================================
  const script = document.currentScript;

  if (!script) {
    console.error("AvstoMart: Script element not found.");
    return;
  }

  const formId = script.getAttribute("data-form");
  const targetSelector = script.getAttribute("data-target");

  if (!formId || !targetSelector) {
    console.error("AvstoMart: data-form and data-target are required.");
    return;
  }

  const container = document.querySelector(targetSelector);

  if (!container) {
    console.error("AvstoMart: Form container not found:", targetSelector);
    return;
  }

  // Same URL for GET and POST
  const API_URL = `http://localhost:5000/api/webhooks/form/${encodeURIComponent(formId)}`;

  // ==========================================
  // 2. HELPERS
  // ==========================================
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[char];
    });
  }

  function getFieldId(key) {
    return `avsto-${formId}-${key}`;
  }

  function getFieldType(key, field) {
    if (field.type) {
      return field.type.toLowerCase();
    }

    const types = {
      name: "text",
      phone: "tel",
      email: "email",
      companyName: "text",
      subject: "text",
      message: "textarea",
    };

    return types[key] || "text";
  }

  // ==========================================
  // 3. GENERATE FIELD HTML
  // ==========================================
  function createField(key, field) {
    if (!field || field.enabled === false) {
      return "";
    }

    const id = getFieldId(key);
    const name = escapeHTML(key);
    const label = escapeHTML(field.label || key);
    const placeholder = escapeHTML(field.placeholder || "");
    const type = getFieldType(key, field);
    const required = field.required === true;
    const requiredAttr = required ? "required" : "";

    const requiredMark = required ? '<span style="color:#dc2626">*</span>' : "";

    const commonStyle = `
      width:100%;
      box-sizing:border-box;
      padding:11px 12px;
      border:1px solid #d1d5db;
      border-radius:7px;
      background:#fff;
      color:#111827;
      font-size:14px;
      font-family:inherit;
      outline-offset:2px;
    `;

    let control = "";

    // Textarea
    if (type === "textarea" || type === "message") {
      control = `
        <textarea
          id="${escapeHTML(id)}"
          name="${name}"
          placeholder="${placeholder}"
          rows="4"
          ${requiredAttr}
          style="${commonStyle}resize:vertical"
        ></textarea>
      `;
    }

    // Select / dropdown
    else if (type === "select" || type === "dropdown") {
      const options = (field.options || [])
        .map(function (option) {
          const value = typeof option === "object" ? option.value : option;

          const text =
            typeof option === "object"
              ? (option.label ?? option.value)
              : option;

          return `
            <option value="${escapeHTML(value)}">
              ${escapeHTML(text)}
            </option>
          `;
        })
        .join("");

      control = `
        <select
          id="${escapeHTML(id)}"
          name="${name}"
          ${requiredAttr}
          style="${commonStyle}"
        >
          <option value="">
            ${placeholder || "Select an option"}
          </option>
          ${options}
        </select>
      `;
    }

    // Checkbox
    else if (type === "checkbox") {
      control = `
        <input
          id="${escapeHTML(id)}"
          name="${name}"
          type="checkbox"
          value="true"
          ${requiredAttr}
          style="width:18px;height:18px;vertical-align:middle"
        />
      `;
    }

    // Radio buttons
    else if (type === "radio") {
      control = (field.options || [])
        .map(function (option, index) {
          const value = typeof option === "object" ? option.value : option;

          const text =
            typeof option === "object"
              ? (option.label ?? option.value)
              : option;

          return `
            <label style="display:flex;align-items:center;gap:8px;
              margin:8px 0;font-weight:400">
              <input
                type="radio"
                name="${name}"
                value="${escapeHTML(value)}"
                ${requiredAttr}
                ${index === 0 && required ? "" : ""}
              />
              ${escapeHTML(text)}
            </label>
          `;
        })
        .join("");
    }

    // Standard input types and custom fields
    else {
      const supportedTypes = ["text", "email", "tel", "number", "url", "date"];

      const inputType = supportedTypes.includes(type) ? type : "text";

      control = `
        <input
          id="${escapeHTML(id)}"
          name="${name}"
          type="${inputType}"
          placeholder="${placeholder}"
          ${requiredAttr}
          style="${commonStyle}"
        />
      `;
    }

    return `
      <div class="avsto-field" style="margin-bottom:17px">
        <label
          for="${escapeHTML(id)}"
          style="display:block;margin-bottom:7px;font-size:14px;
            font-weight:600;color:#374151"
        >
          ${label} ${requiredMark}
        </label>

        ${control}
      </div>
    `;
  }

  // ==========================================
  // 4. LOAD FORM CONFIGURATION
  // ==========================================
  async function loadForm() {
    container.innerHTML = `
      <div style="padding:20px;text-align:center;color:#6b7280">
        Loading form...
      </div>
    `;

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Form API failed: HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Invalid form response.");
      }

      const form = result.data;

      if (form.status !== "active" || form.isDeleted === true) {
        throw new Error("This form is currently unavailable.");
      }

      const fields = form.fields || {};

      // ==========================================
      // 5. STANDARD FIELDS
      // ==========================================
      const standardOrder = [
        "name",
        "phone",
        "email",
        "companyName",
        "subject",
        "message",
      ];

      let fieldsHTML = standardOrder
        .filter(function (key) {
          return fields[key]?.enabled === true;
        })
        .map(function (key) {
          return createField(key, fields[key]);
        })
        .join("");

      // ==========================================
      // 6. CUSTOM FIELDS
      // Example: budget
      // ==========================================
      const customFields = Array.isArray(form.customFields)
        ? [...form.customFields]
        : [];

      customFields
        .sort(function (a, b) {
          return (a.order || 0) - (b.order || 0);
        })
        .forEach(function (field) {
          if (field.key) {
            fieldsHTML += createField(field.key, field);
          }
        });

      // ==========================================
      // 7. RENDER HTML FORM
      // ==========================================
      container.innerHTML = `
        <form
          id="avsto-dynamic-form-${escapeHTML(form._id)}"
          novalidate
          style="
            max-width:520px;
            width:100%;
            box-sizing:border-box;
            margin:20px auto;
            padding:25px;
            border:1px solid #e5e7eb;
            border-radius:12px;
            background:#ffffff;
            box-shadow:0 4px 18px rgba(0,0,0,0.05);
          "
        >
          <h2 style="
            margin:0 0 9px;
            font-size:24px;
            line-height:1.3;
            font-weight:700;
            color:#111827;
          ">
            ${escapeHTML(form.name || "Contact Form")}
          </h2>

          ${
            form.description
              ? `<p style="margin:0 0 22px;color:#6b7280;
                   font-size:14px;line-height:1.6">
                   ${escapeHTML(form.description)}
                 </p>`
              : '<div style="height:15px"></div>'
          }

          ${fieldsHTML}

          <div
            class="avsto-form-status"
            role="status"
            aria-live="polite"
            style="margin-bottom:13px;font-size:14px"
          ></div>

          <button
            type="submit"
            style="
              display:block;
              width:100%;
              padding:13px 18px;
              border:0;
              border-radius:7px;
              background:#2563eb;
              color:#ffffff;
              font-size:15px;
              font-weight:600;
              cursor:pointer;
            "
          >
            Submit
          </button>
        </form>
      `;

      const formElement = container.querySelector("form");
      const statusElement = formElement.querySelector(".avsto-form-status");
      const submitButton = formElement.querySelector('button[type="submit"]');

      // ==========================================
      // 8. FORM SUBMISSION - POST TO SAME URL
      // ==========================================
      formElement.addEventListener("submit", async function (event) {
        event.preventDefault();

        statusElement.textContent = "";

        // Validate required fields
        if (!formElement.reportValidity()) {
          return;
        }

        const payload = {};

        Array.from(formElement.elements).forEach(function (element) {
          if (!element.name || element.disabled) {
            return;
          }

          if (element.type === "radio" && !element.checked) {
            return;
          }

          if (element.type === "checkbox") {
            payload[element.name] = element.checked;
          } else {
            payload[element.name] = element.value.trim();
          }
        });

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        try {
          // Same dynamic endpoint used by GET
          const postResponse = await fetch(API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          });

          const postResult = await postResponse.json();

          if (!postResponse.ok || postResult.success === false) {
            throw new Error(postResult.message || "Form submission failed.");
          }

          statusElement.style.color = "#15803d";
          statusElement.textContent =
            form.settings?.successMessage ||
            "Thank you! We will contact you shortly.";

          formElement.reset();

          if (form.settings?.redirectUrl) {
            window.setTimeout(function () {
              window.location.assign(form.settings.redirectUrl);
            }, 1800);
          }
        } catch (error) {
          console.error("AvstoMart form submission error:", error);

          statusElement.style.color = "#dc2626";
          statusElement.textContent =
            error.message || "Something went wrong. Please try again.";
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = "Submit";
        }
      });
    } catch (error) {
      console.error("AvstoMart form loading error:", error);

      container.innerHTML = `
        <div style="padding:16px;color:#dc2626;
          border:1px solid #fecaca;border-radius:8px">
          ${escapeHTML(error.message || "Unable to load form.")}
        </div>
      `;
    }
  }

  // Start loading
  loadForm();
})();
