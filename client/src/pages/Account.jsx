import React, { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../hooks/cropImage";
import Placeholder from "../img/placeholder.png";
import { useAxiosWithAuth } from "../hooks/useAxiosWithAuth";
import InputField from "../components/InputField";

function Account({ user }) {
  const axios = useAxiosWithAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    department: "",
    password: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropModal, setCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [imageDeleted, setImageDeleted] = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setTempImage(imageUrl);
      setCropModal(true);
      setImageDeleted(false);
      e.target.value = null;
    }
  };

  const handleCropSave = async () => {
    const croppedFile = await getCroppedImg(tempImage, croppedAreaPixels);
    const previewUrl = URL.createObjectURL(croppedFile);
    setImagePreview(previewUrl);
    setProfileImage(croppedFile);
    setCropModal(false);
  };

  const handleImageDelete = () => {
    setImagePreview(null);
    setProfileImage(null);
    setImageDeleted(true);
  };
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        jobTitle: user.jobTitle || "",
        department: user.department || "",
        password: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("employee_id", user?.employee_id);
    Object.entries(formData).forEach(([key, val]) => {
      if (key === "password" && val !== "" && val !== "******************") {
        form.append("password", val);
      } else if (key !== "password") {
        form.append(
          key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`),
          val
        );
      }
    });
    if (profileImage) form.append("image", profileImage);
    if (imageDeleted) form.append("delete_image", "1");

    try {
      const res = await axios.post("/users/update-profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message || "Profile updated successfully");
      if (res.data.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to update profile");
    }
  };

  const formSections = [
    {
      layout: "grid grid-cols-1 gap-6",
      fields: [
        {
          label: "Employee ID",
          name: "employeeId",
          value: user?.employee_id || "Loading...",
          type: "text",
          disabled: true,
          colSpan: "col-span-1",
        },
      ],
    },
    {
      layout: "grid grid-cols-2 gap-6",
      fields: [
        { label: "First Name", name: "firstName", value: formData.firstName },
        { label: "Last Name", name: "lastName", value: formData.lastName },
      ],
    },
    {
      layout: "grid grid-cols-1 gap-6",
      fields: [{ label: "Email", name: "email", value: formData.email }],
    },
    {
      layout: "grid grid-cols-1 gap-6",
      fields: [
        {
          label: "Password",
          name: "password",
          value: formData.password,
          type: "password",
          note: "Leave blank to keep current password.",
        },
      ],
    },
    {
      layout: "grid grid-cols-2 gap-6",
      fields: [
        { label: "Job Title", name: "jobTitle", value: formData.jobTitle },
        { label: "Department", name: "department", value: formData.department },
      ],
    },
  ];

  return (
    <div className="bg-gray-100 flex items-center justify-center p-6">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white shadow-2xl rounded-3xl overflow-hidden">
        <form
          className="flex w-full flex-col lg:flex-row"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          {/* Left Section */}
          <div className="w-full lg:w-1/3 bg-blue-50 flex items-center justify-center p-10">
            <div className="text-center">
              <label htmlFor="upload-image" className="cursor-pointer">
                <img
                  src={
                    imageDeleted
                      ? Placeholder
                      : imagePreview
                      ? imagePreview
                      : user?.profile_image
                      ? `${
                          import.meta.env.VITE_API_BASE_URL ||
                          "http://localhost:5000"
                        }/uploads/${user.profile_image}`
                      : Placeholder
                  }
                  alt={
                    user ? `${user.firstName} ${user.lastName} Profile` : "User"
                  }
                  className="w-40 h-40 rounded-full mx-auto mb-4 border-4 border-blue-300 hover:opacity-80 transition"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = Placeholder;
                  }}
                />
                <p className="text-sm text-gray-500">
                  Click to change profile image
                </p>
              </label>
              <input
                type="file"
                id="upload-image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {cropModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg w-[90vw] max-w-xl">
                    <div className="relative w-full h-96 bg-gray-200">
                      <Cropper
                        image={tempImage}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setCropModal(false)}
                        className="px-4 py-2 bg-gray-400 text-white rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCropSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                      >
                        Crop & Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {(imagePreview || user?.profile_image) && !imageDeleted && (
                <button
                  type="button"
                  onClick={handleImageDelete}
                  className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                >
                  Delete Image
                </button>
              )}
              <p className="text-gray-700 font-semibold mt-2">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="w-full lg:w-2/3 p-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Account Information
            </h1>

            <div className="space-y-6">
              {formSections.map((section, idx) => (
                <div key={idx} className={section.layout}>
                  {section.fields.map((field) => (
                    <div
                      key={field.name}
                      className={field.colSpan || "col-span-1"}
                    >
                      <InputField
                        label={field.label}
                        name={field.name}
                        value={field.value}
                        onChange={handleChange}
                        type={field.type || "text"}
                        disabled={field.disabled}
                      />
                      {field.note && (
                        <p className="text-xs text-gray-500 italic mt-1">
                          {field.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Account;
