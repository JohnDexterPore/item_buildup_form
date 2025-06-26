import React, { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../hooks/cropImage"; // Utility for cropping (defined below)
import Placeholder from "../img/placeholder.png";
import { useAxiosWithAuth } from "../hooks/useAxiosWithAuth";

function UserModal({ visible, onClose, onSaved, account }) {
  const axios = useAxiosWithAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null); // actual file

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropModal, setCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  const [deletedImage, setDeletedImage] = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  useEffect(() => {
    if (account) {
      setFirstName(account.firstName || "");
      setLastName(account.lastName || "");
      setEmail(account.email || "");
      setJobTitle(account.jobTitle || "");
      setDepartment(account.department || "");
    }
  }, [account]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setTempImage(imageUrl);
      setCropModal(true);
      setDeletedImage(false); // reset deletion flag
      e.target.value = null; // allow re-uploading same file
    }
  };

  const handleCropSave = async () => {
    const croppedFile = await getCroppedImg(tempImage, croppedAreaPixels);
    const previewUrl = URL.createObjectURL(croppedFile);

    setImagePreview(previewUrl);
    setProfileImage(croppedFile); // ✅ this is now a File object
    setCropModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("employee_id", account?.employee_id);
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("email", email);
    formData.append("job_title", jobTitle);
    formData.append("department", department);

    if (password && password !== "******************") {
      formData.append("password", password);
    }

    if (profileImage) {
      formData.append("image", profileImage);
    }

    if (deletedImage && !profileImage) {
      formData.append("delete_image", "1");
    }

    try {
      const res = await axios.put("/users/update-user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message || "Profile updated successfully");

      if (res.data.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
      }

      if (typeof onClose === "function") onClose();
      if (typeof onSaved === "function") onSaved(); // <-- ✅ Refresh users
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to update profile");
    }
  };

  useEffect(() => {
    if (!account) return;

    setFirstName(account.first_name || "");
    setLastName(account.last_name || "");
    setEmail(account.email || "");
    setJobTitle(account.job_title || "");
    setDepartment(account.department || "");
    setImagePreview(null);
    setProfileImage(null);
  }, [account]);

  if (!visible || !account) return null;
  return (
    <div className="fixed inset-0 bg-gray-100/70 flex items-center justify-center p-6">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white shadow-2xl rounded-3xl overflow-hidden">
        <form
          className="flex w-full flex-col lg:flex-row"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          {/* Left Side - Profile image */}
          <div className="w-full lg:w-1/3 bg-blue-50 flex items-center justify-center p-10">
            <div className="text-center">
              <label htmlFor="upload-image" className="cursor-pointer">
                <img
                  src={
                    deletedImage
                      ? Placeholder
                      : imagePreview
                      ? imagePreview
                      : account?.profile_image
                      ? `${
                          import.meta.env.VITE_API_BASE_URL ||
                          "http://localhost:5000"
                        }/uploads/${account.profile_image}`
                      : Placeholder
                  }
                  alt={
                    account
                      ? `${account.firstName} ${account.lastName} Profile`
                      : "User"
                  }
                  className="w-40 h-40 rounded-full mx-auto mb-4 border-4 border-blue-300 hover:opacity-80 transition"
                  onError={(e) => {
                    e.currentTarget.onerror = null; // Prevent infinite loop
                    e.currentTarget.src = Placeholder;
                  }}
                />

                <p className="text-sm text-gray-500">
                  Click to change profile image
                </p>
                {account?.profile_image && !imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeletedImage(true);
                      setImagePreview(null);
                      setProfileImage(null);
                    }}
                    className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                  >
                    Delete Image
                  </button>
                )}
              </label>
              <input
                type="file"
                id="upload-image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {/* Crop Modal */}
              {cropModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg w-[90vw] max-w-xl">
                    <div className="relative w-full h-96 bg-gray-200">
                      <Cropper
                        image={tempImage}
                        crop={crop}
                        zoom={zoom}
                        aspect={1} // square
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
              <p className="text-gray-700 font-semibold mt-2">
                {firstName} {lastName}
              </p>
              <p className="text-sm text-gray-500">{account?.email}</p>
            </div>
          </div>

          {/* Right Side - Form fields */}
          <div className="w-full lg:w-2/3 p-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Account Information
            </h1>

            {/* Employee ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 uppercase">
                Employee ID
              </label>
              <input
                type="text"
                readOnly
                value={account?.employee_id || "Loading..."}
                className="w-full mt-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>

            {/* First and Last Name */}
            <div className="flex flex-col md:flex-row gap-6 mt-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 uppercase">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 uppercase">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-600 uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Password */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-600 uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 italic mt-1">
                Password cannot be changed here.
              </p>
            </div>

            {/* Job Title and Department */}
            <div className="flex flex-col md:flex-row gap-6 mt-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 uppercase">
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 uppercase">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="text-center mt-8 flex justify-end gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Save
              </button>

              <button
                onClick={onClose}
                type="button"
                className=" px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserModal;
