import React, { useContext, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { UserContext } from "../../context/userContext";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import Input from "../../components/Inputs/Input";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import uploadImage from "../../utils/uploadImage";
import toast from "react-hot-toast";
import { LuSave, LuLoaderCircle } from "react-icons/lu";

const Profile = () => {
  const { user, setUser } = useContext(UserContext);

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl || "");
  const [profileImageFile, setProfileImageFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = profileImageUrl;

      // Upload new image if selected
      if (profileImageFile) {
        const uploadRes = await uploadImage(profileImageFile);
        finalImageUrl = uploadRes.imageUrl;
      }

      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
        name,
        bio,
        profileImageUrl: finalImageUrl,
      });

      if (response.data) {
        // Update user context with new data
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        
        // Update token in local storage if needed (usually stays same for profile update)
        
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Profile">
      <div className="max-w-[800px] mx-auto my-10">
        <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleUpdateProfile}>
            <div className="flex flex-col items-center mb-8">
              <ProfilePhotoSelector
                image={profileImageFile}
                setImage={setProfileImageFile}
                preview={profileImageUrl}
                setPreview={setProfileImageUrl}
              />
              <p className="text-xs text-gray-400 mt-2">Click to change profile photo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <Input
                  label="Full Name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={({ target }) => setName(target.value)}
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-2 block">Bio</label>
                <textarea
                  className="w-full text-sm text-black bg-gray-50/50 rounded px-4 py-3 border border-gray-100 outline-none focus:border-sky-300 transition-all min-h-[120px]"
                  placeholder="Tell us a bit about yourself..."
                  value={bio}
                  onChange={({ target }) => setBio(target.value)}
                />
              </div>

              <div className="col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <LuLoaderCircle className="animate-spin text-lg" />
                  ) : (
                    <LuSave className="text-lg" />
                  )}
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
