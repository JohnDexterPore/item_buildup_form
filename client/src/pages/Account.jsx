import React, { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../components/cropImage"; // Utility for cropping (defined below)
import Placeholder from "../img/placeholder.png";
import { useAxiosWithAuth } from "../hooks/useAxiosWithAuth";

function Account({ user }) {
  const axios = useAxiosWithAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("*********");
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null); // actual file

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropModal, setCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setJobTitle(user.jobTitle || "");
      setDepartment(user.department || "");
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setTempImage(imageUrl); // Use this for cropping
      setCropModal(true); // Show crop UI
    }
  };

  const handleCropSave = async () => {
    const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
    setImagePreview(croppedImage);
    setProfileImage(croppedImage);
    setCropModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("jobTitle", jobTitle);
    formData.append("department", department);
    formData.append("profileImage", profileImage);

    axios.post("/api/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Form submitted");
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center p-6">
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
                  src={imagePreview || Placeholder}
                  alt="User"
                  className="w-40 h-40 rounded-full mx-auto mb-4 border-4 border-blue-300 hover:opacity-80 transition"
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
                        onClick={() => setCropModal(false)}
                        className="px-4 py-2 bg-gray-400 text-white rounded"
                      >
                        Cancel
                      </button>
                      <button
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
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-500">{user?.email}</p>
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
                value={user?.employee_id || "Loading..."}
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
