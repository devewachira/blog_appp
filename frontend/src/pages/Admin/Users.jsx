import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { LuTrash2, LuUsers, LuUser } from "react-icons/lu";
import moment from "moment";
import Modal from "../../components/Modal";
import DeleteAlertContent from "../../components/DeleteAlertContent";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SUPERADMIN.GET_ALL_USERS);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axiosInstance.delete(API_PATHS.SUPERADMIN.DELETE_USER(userId));
      toast.success("User deleted successfully");
      setOpenDeleteAlert({ open: false, data: null });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <DashboardLayout activeMenu="Users">
      <div className="max-w-[1000px] mx-auto my-10">
        <div className="flex items-center gap-3 mb-8">
          <LuUsers className="text-2xl text-sky-600" />
          <h2 className="text-2xl font-semibold">User Management</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {userItem.profileImageUrl ? (
                        <img src={userItem.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                          <LuUser />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                        <div className="text-xs text-gray-500">{userItem.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                      userItem.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                      userItem.role === 'admin' ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {userItem.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-600">
                      Posts: <span className="font-semibold text-black">{userItem._count?.posts || 0}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Comments: <span className="font-semibold text-black">{userItem._count?.comments || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {moment(userItem.createdAt).format("MMM Do, YYYY")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      onClick={() => setOpenDeleteAlert({ open: true, data: userItem.id })}
                    >
                      <LuTrash2 className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={openDeleteAlert.open}
        onClose={() => setOpenDeleteAlert({ open: false, data: null })}
        title="Delete User"
      >
        <div className="w-[30vw]">
          <DeleteAlertContent
            content="Are you sure you want to delete this user? This will permanently remove all their posts and comments."
            onDelete={() => handleDeleteUser(openDeleteAlert.data)}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Users;
