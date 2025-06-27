import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import Placeholder from "../img/placeholder.png";
import InputField from "../components/InputField";
import SelectField from "../components/SelectField";
import TextAreaField from "../components/TextAreaField";
import CheckboxGroup from "../components/CheckboxGroup";
import useDropdown from "../hooks/useDropdown";

export default function Form() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const categoryOptions = useDropdown("Category");
  const subcategoryOptions = useDropdown("Sub Category");
  const coverageOptions = useDropdown("Coverage (Location)");
  const priceTierOptions = useDropdown("Price Tier");

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
    axios
      .get("/companies/get-companies")
      .then((res) => {
        setCompanies(res.data);
        if (res.data.length) setSelectedCompany(res.data[0]);
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        transactionTypes: { ...prev.transactionTypes, [name]: checked },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMoney = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.replace(/[^0-9.]/g, "") }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", formData);
    // post to backend...
  };

  const formSections = [
    {
      layout: "grid grid-cols-3 gap-4",
      fields: [
        {
          type: "input",
          label: "Parent Item Description",
          name: "parentItemDescription",
          colSpan: "col-span-3",
        },
      ],
    },
    {
      layout: "grid grid-cols-3 gap-4",
      fields: [
        {
          type: "input",
          label: "POS Text",
          name: "posTxt",
          colSpan: "col-span-2",
        },
        {
          type: "input",
          label: "Date Prepared",
          name: "datePrepared",
          inputType: "date",
          colSpan: "col-span-1",
        },
      ],
    },
    {
      layout: "grid grid-cols-3 gap-4",
      fields: [
        {
          type: "select",
          label: "Price Tier",
          name: "priceTier",
          options: priceTierOptions,
        },
        {
          type: "input",
          label: "Gross Price",
          name: "grossPrice",
          isMoney: true,
        },
        {
          type: "input",
          label: "Delivery Price",
          name: "deliveryPrice",
          isMoney: true,
        },
      ],
    },
    {
      layout: "grid grid-cols-3 gap-4",
      fields: [
        {
          type: "select",
          label: "Category",
          name: "category",
          options: categoryOptions,
        },
        {
          type: "select",
          label: "Sub Category",
          name: "subcategory",
          options: subcategoryOptions,
        },
        {
          type: "select",
          label: "Coverage",
          name: "coverage",
          options: coverageOptions,
        },
      ],
    },
    {
      layout: "grid grid-cols-2 gap-4",
      fields: [
        {
          type: "input",
          label: "Start Date",
          name: "startDate",
          inputType: "date",
        },
        {
          type: "input",
          label: "End Date",
          name: "endDate",
          inputType: "date",
        },
      ],
    },
  ];

  return (
    <div className="bg-gray-100 flex justify-center h-full p-6">
      <div className="flex flex-col lg:flex-row w-full h-full max-w-7xl bg-white shadow-lg rounded-3xl overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col lg:flex-row h-full"
        >
          {/* Left Side */}
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

          {/* Right Side */}
          <main className="w-full lg:w-3/4 p-10 flex flex-col justify-between">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Item Build-Up Form
            </h1>

            <div className="space-y-6 h-full overflow-y-auto pr-2 py-5">
              {formSections.map((section, idx) => (
                <div key={idx} className={section.layout}>
                  {section.fields.map((field) => {
                    const commonProps = {
                      key: field.name,
                      label: field.label,
                      name: field.name,
                      value: formData[field.name],
                      onChange: field.isMoney ? handleMoney : handleChange,
                      className: field.colSpan || "",
                    };

                    if (field.type === "input") {
                      return (
                        <InputField
                          {...commonProps}
                          type={field.inputType || "text"}
                        />
                      );
                    }

                    if (field.type === "select") {
                      return (
                        <SelectField
                          {...commonProps}
                          options={field.options || []}
                        />
                      );
                    }

                    return null;
                  })}
                </div>
              ))}

              {/** Textarea */}
              <TextAreaField
                label="Components"
                name="components"
                value={formData.components}
                onChange={handleChange}
              />

              {/** Checkbox Group */}
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
