// Full React component with real-time currency formatting, improved money handling, auto row enter, delete rows, and comma + prefix display in summary table

import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import Placeholder from "../img/placeholder.png";
import InputField from "../components/InputField";
import SelectField from "../components/SelectField";
import TextAreaField from "../components/TextAreaField";
import CheckboxGroup from "../components/CheckboxGroup";
import useDropdown from "../hooks/useDropdown";

function formatMoney(value) {
  if (!value) return "";
  const num = parseFloat(value);
  if (isNaN(num)) return "";
  // Format with commas and up to 2 decimal places, but do not force trailing zeros
  const parts = num.toString().split(".");
  if (parts.length === 1) {
    // integer, no decimals
    return `₱${num.toLocaleString()}`;
  } else {
    // has decimals, limit to 2 decimal places without trailing zeros
    return `₱${num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
}

// New function to format price for display in inputs or text
function formatPriceForDisplay(value) {
  if (value === "" || value === null || value === undefined) return "₱";
  // If value is already formatted (starts with ₱), return as is
  if (typeof value === "string" && value.startsWith("₱")) return value;
  return formatMoney(value);
}

function parseMoneyInput(value) {
  return value.replace(/[^\d.]/g, "").replace(/(\.\d{2})\d+/, "$1");
}

export default function Form({ user }) {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const categoryOptions = useDropdown("Category");
  const subcategoryOptions = useDropdown("Sub Category");
  const coverageOptions = useDropdown("Coverage (Location)");
  const priceTierOptions = useDropdown("Price Tier");

  const [rows, setRows] = useState([
    {
      id: 1,
      description: "",
      posText: "",
      sapCode: "",
      mmPrice: "",
      provPrice: "",
    },
  ]);

  const [formData, setFormData] = useState({
    parentItemDescription: "",
    posTxt: "",
    datePrepared: "",
    startDate: "",
    endDate: "",
    priceTier: "",
    grossPrice: "",
    deliveryPrice: "",
    category: "",
    subcategory: "",
    coverage: "",
    components: "",
    userId: "",
    transactionTypes: {
      dineIn: false,
      takeOut: false,
      delivery: false,
      bulkOrder: false,
      events: false,
      corpTieUps: false,
    },
  });

  useEffect(() => {
    axios.get("/companies/get-companies").then((res) => {
      setCompanies(res.data);
      if (res.data.length) setSelectedCompany(res.data[0]);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) =>
      type === "checkbox"
        ? {
            ...prev,
            transactionTypes: { ...prev.transactionTypes, [name]: checked },
          }
        : { ...prev, [name]: value.toUpperCase() }
    );
  };

  const handleMoney = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseMoneyInput(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasTx = Object.values(formData.transactionTypes).some(Boolean);
    if (!hasTx) return alert("Please select at least one transaction type.");

    // Clean and convert money fields in rows
    const cleanRows = rows.map((row) => ({
      ...row,
      mmPrice: parseFloat(parseMoneyInput(row.mmPrice)) || 0,
      provPrice: parseFloat(parseMoneyInput(row.provPrice)) || 0,
    }));

    try {
      const payload = {
        ...formData,
        userId: user?.employee_id || "",
        companyCode: selectedCompany?.company_code || "",
        grossPrice: parseFloat(parseMoneyInput(formData.grossPrice)) || 0,
        deliveryPrice: parseFloat(parseMoneyInput(formData.deliveryPrice)) || 0,
        summary: cleanRows, // updated here
      };

      console.log("Submitting payload:", payload); // for debugging
      const res = await axios.post("/items/create-item", payload);
      alert(res.data.message || "Item created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit item.");
    }
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        description: "",
        posText: "",
        sapCode: "",
        mmPrice: "",
        provPrice: "",
      },
    ]);
  };

  return (
    <div className="bg-gray-100 flex justify-center h-full p-6">
      <div className="flex flex-col lg:flex-row w-full h-full max-w-8xl bg-white shadow-lg rounded-3xl overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col lg:flex-row h-full"
        >
          {/* Company Side */}
          <aside className="w-full lg:w-1/4 bg-blue-50 p-10 flex flex-col justify-center items-center">
            <img
              src={
                selectedCompany?.logo_address
                  ? `/uploads/${selectedCompany.logo_address}`
                  : Placeholder
              }
              alt={selectedCompany?.company_name || "Company Logo"}
              className="w-40 h-40 rounded-full mb-6 border-4 border-blue-300 object-contain"
              onError={(e) => (e.currentTarget.src = Placeholder)}
            />
            <select
              value={selectedCompany?.company_code || ""}
              onChange={(e) =>
                setSelectedCompany(
                  companies.find((c) => c.company_code === e.target.value)
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {companies.map((c) => (
                <option key={c.company_code} value={c.company_code}>
                  {c.company_name}
                </option>
              ))}
            </select>
          </aside>

          {/* Form Side */}
          <main className="w-full lg:w-3/4 p-10 flex flex-col justify-between">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Item Build-Up Form
            </h1>

            <div className="space-y-6 h-full overflow-y-auto pr-2 py-5">
              <InputField
                label="Parent Item Description"
                name="parentItemDescription"
                value={formData.parentItemDescription}
                onChange={handleChange}
                className="col-span-3"
                required
              />
              <div className="grid grid-cols-3 gap-4">
                <InputField
                  label="POS Text"
                  name="posTxt"
                  value={formData.posTxt}
                  onChange={handleChange}
                  className="col-span-2"
                  required
                />
                <InputField
                  label="Date Prepared"
                  name="datePrepared"
                  type="date"
                  value={formData.datePrepared}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <SelectField
                  label="Price Tier"
                  name="priceTier"
                  options={priceTierOptions}
                  value={formData.priceTier}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Gross Price"
                  name="grossPrice"
                  value={formData.grossPrice ? `₱${formData.grossPrice}` : ""}
                  onChange={(e) => {
                    let val = e.target.value;
                    // Remove currency prefix and commas for parsing
                    val = val.replace(/₱/g, "").replace(/,/g, "");
                    // Allow only digits and decimal point, max 2 decimals
                    if (/^\d*\.?\d{0,2}$/.test(val)) {
                      // Format with commas while typing
                      const parts = val.split(".");
                      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                      const formattedVal = parts.join(".");
                      setFormData((prev) => ({
                        ...prev,
                        grossPrice: formattedVal,
                      }));
                    }
                  }}
                  onBlur={(e) => {
                    // Format on blur with currency prefix and commas
                    const rawVal = formData.grossPrice.replace(/,/g, "");
                    const formatted = formatMoney(rawVal);
                    setFormData((prev) => ({ ...prev, grossPrice: formatted }));
                  }}
                  required
                />
                <InputField
                  label="Delivery Price"
                  name="deliveryPrice"
                  value={
                    formData.deliveryPrice ? `₱${formData.deliveryPrice}` : ""
                  }
                  onChange={(e) => {
                    let val = e.target.value;
                    val = val.replace(/₱/g, "").replace(/,/g, "");
                    if (/^\d*\.?\d{0,2}$/.test(val)) {
                      const parts = val.split(".");
                      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                      const formattedVal = parts.join(".");
                      setFormData((prev) => ({
                        ...prev,
                        deliveryPrice: formattedVal,
                      }));
                    }
                  }}
                  onBlur={(e) => {
                    const rawVal = formData.deliveryPrice.replace(/,/g, "");
                    const formatted = formatMoney(rawVal);
                    setFormData((prev) => ({
                      ...prev,
                      deliveryPrice: formatted,
                    }));
                  }}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <SelectField
                  label="Category"
                  name="category"
                  options={categoryOptions}
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
                <SelectField
                  label="Sub Category"
                  name="subcategory"
                  options={subcategoryOptions}
                  value={formData.subcategory}
                  onChange={handleChange}
                  required
                />
                <SelectField
                  label="Coverage"
                  name="coverage"
                  options={coverageOptions}
                  value={formData.coverage}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <TextAreaField
                label="Components"
                name="components"
                value={formData.components}
                onChange={handleChange}
                required
              />
              <CheckboxGroup
                label="Transaction Types"
                options={[
                  { name: "dineIn", label: "Dine In" },
                  { name: "takeOut", label: "Take Out" },
                  { name: "delivery", label: "Delivery" },
                  { name: "bulkOrder", label: "Bulk Order" },
                  { name: "events", label: "Events" },
                  { name: "corpTieUps", label: "Corp Tie-ups" },
                ]}
                values={formData.transactionTypes}
                onChange={handleChange}
              />

              <h2 className="text-2xl font-bold text-gray-800">Summary</h2>
              <table className="min-w-full table-auto border border-gray-300 rounded-xl overflow-hidden shadow-sm">
                <thead className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 border w-4/12">Description</th>
                    <th className="px-4 py-3 border w-3/12">POS Text</th>
                    <th className="px-4 py-3 border w-2/12">SAP Code</th>
                    <th className="px-4 py-3 border w-1/12">MM Price</th>
                    <th className="px-4 py-3 border w-1/12">Prov Price</th>
                    <th className="px-4 py-3 border w-1/12">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800">
                  {rows.map((row, i) => (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      {[
                        "description",
                        "posText",
                        "sapCode",
                        "mmPrice",
                        "provPrice",
                      ].map((field) => {
                        const isMoney = ["mmPrice", "provPrice"].includes(
                          field
                        );
                        return (
                          <td key={field} className="border align-middle">
                            <input
                              type="text"
                              className="w-full px-2 py-1 outline-none text-center"
                              value={
                                isMoney ? formatMoney(row[field]) : row[field]
                              }
                              onChange={(e) => {
                                const updated = [...rows];
                                updated[i][field] = isMoney
                                  ? parseMoneyInput(e.target.value)
                                  : e.target.value.toUpperCase();
                                setRows(updated);
                              }}
                              onBlur={() => {
                                const updated = [...rows];
                                if (isMoney) {
                                  updated[i][field] = parseMoneyInput(
                                    updated[i][field]
                                  );
                                  setRows(updated);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  i === rows.length - 1 &&
                                  field === "provPrice"
                                ) {
                                  e.preventDefault();
                                  addRow();
                                }
                              }}
                            />
                          </td>
                        );
                      })}
                      <td className="border px-3 py-2 text-center align-middle">
                        <button
                          type="button"
                          onClick={() =>
                            setRows((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                          className="text-red-600 hover:text-red-700 hover:scale-105 transition-transform duration-100 font-bold text-lg"
                          title="Remove row"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                type="button"
                onClick={addRow}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add Row
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2 rounded-lg"
              >
                Submit
              </button>
            </div>
          </main>
        </form>
      </div>
    </div>
  );
}
