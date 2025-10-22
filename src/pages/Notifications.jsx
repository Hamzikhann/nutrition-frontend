import React, { useState, useEffect } from "react";
import Searchbar from "../components/Searchbar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Filter from "../components/Filter";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import ApiService from "../services/ApiServices";
import { toast } from "react-toastify";

function Notifications() {
  const [openMenu, setOpenMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isUserSelectionModalOpen, setIsUserSelectionModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationContent, setNotificationContent] = useState('');
  const [folderUsers, setFolderUsers] = useState([]);

  // Fetch folders and notifications on component mount
  useEffect(() => {
    fetchFolders();
    fetchNotifications();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await ApiService.getFolders();
      if (response?.data?.success) {
        setFolders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error("Failed to fetch folders");
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await ApiService.getNotifications();
      if (response?.data?.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications");
    }
  };

  const notificationsData = [
    {
      id: 1,
      notification: [
        "Premium Upgrade offer",
        "Unlock all features with 50% off your first month!",
      ],
      audience: "Trial Users",
      recipients: "# 1500",
      performance: ["Dilivered: 98.7%", "Opened: 23.5%"],
      status: "Sent",
      date: "12/11/2023",
    },
    {
      id: 2,
      notification: [
        "Premium Upgrade offer",
        "Unlock all features with 50% off your first month!",
      ],
      audience: "Trial Users",
      recipients: "# 1500",
      performance: ["Dilivered: 98.7%", "Opened: 23.5%"],
      status: "Sent",
      date: "12/11/2023",
    },
    {
      id: 3,
      notification: [
        "Premium Upgrade offer",
        "Unlock all features with 50% off your first month!",
      ],
      audience: "Active Users",
      recipients: "# 1500",
      performance: ["Dilivered: 98.7%", "Opened: 23.5%"],
      status: "Inprogress",
      date: "12/11/2023",
    },
    {
      id: 4,
      notification: [
        "Premium Upgrade offer",
        "Unlock all features with 50% off your first month!",
      ],
      audience: "Active Users",
      recipients: "# 1500",
      performance: ["Dilivered: 98.7%", "Opened: 23.5%"],
      status: "Completed",
      date: "12/11/2023",
    },
  ];

  const handleMenuToggle = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const handleEdit = (row) => {
    console.log("Edit clicked for:", row.name);
    setOpenMenu(null);
  };

  const handleDelete = (row) => {
    console.log("Delete clicked for:", row.name);
    setOpenMenu(null);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCreateFolder = async () => {
    if (folderName.trim()) {
      setLoading(true);
      try {
        const response = await ApiService.createFolder({
          name: folderName,
          categories: selectedCategories
        });
        if (response?.data?.success) {
          toast.success("Folder created successfully");
          fetchFolders(); // Refresh folders list
          setIsCreateFolderModalOpen(false);
          setFolderName('');
          setSelectedCategories([]);
        }
      } catch (error) {
        console.error("Error creating folder:", error);
        toast.error("Failed to create folder");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFolderClick = async (folder) => {
    setSelectedFolder(folder);
    setLoading(true);
    try {
      const response = await ApiService.getUsersByCategories({
        categories: folder.categories
      });
      if (response?.data?.success) {
        setFolderUsers(response.data.data);
        setSelectedUsers([]);
        setSelectAll(false);
        setIsUserSelectionModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      const allUserIds = folderUsers.map(user => user.id);
      setSelectedUsers(allUserIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSaveUserSelection = () => {
    // For now, just close the modal. In a real app, you might want to save this selection
    setIsUserSelectionModalOpen(false);
    setSelectedFolder(null);
    setSelectedUsers([]);
    setSelectAll(false);
  };

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationContent.trim() || selectedUsers.length === 0) {
      toast.error("Please fill all fields and select users");
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.createNotification({
        title: notificationTitle,
        content: notificationContent,
        userIds: selectedUsers,
        folderId: selectedFolder?.id || null
      });
      if (response?.data?.success) {
        toast.success("Notification created successfully");
        fetchNotifications(); // Refresh notifications list
        setIsModalOpen(false);
        setNotificationTitle('');
        setNotificationContent('');
        setSelectedUsers([]);
        setSelectedFolder(null);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: "Notification",
      center: false, // left align
      grow: 2,
      cell: (row) => (
        <div className="flex flex-col items-start">
          <span className="font-semibold text-gray-800">
            {row.notification[0]}
          </span>
          <span className="text-sm text-gray-500">{row.notification[1]}</span>
        </div>
      ),
    },
    {
      name: "Target Audience",
      center: true,
      grow: 1,
      cell: (row) => (
        <button className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl shadow-sm text-xs transition">
          {row.audience}
        </button>
      ),
    },
    {
      name: "Recipients",
      selector: (row) => row.recipients,
      center: true,
      grow: 1,
    },
    {
      name: "Performance",
      center: true,
      grow: 1,
      cell: (row) => (
        <div className="flex flex-col items-center">
          <span className="text-xs">{row.performance[0]}</span>
          <span className="text-xs">{row.performance[1]}</span>
        </div>
      ),
    },
    {
      name: "Status",
      center: true,
      grow: 1,
      cell: (row) => {
        let bgColor = "bg-gray-200";
        let textColor = "text-gray-700";

        if (row.status === "Sent") {
          bgColor = "bg-yellow-200";
          textColor = "text-yellow-700";
        } else if (row.status === "Inprogress") {
          bgColor = "bg-red-200";
          textColor = "text-red-700";
        } else if (row.status === "Completed") {
          bgColor = "bg-green-200";
          textColor = "text-green-700";
        }

        return (
          <button
            className={`px-2 py-1 ${bgColor} hover:opacity-80 ${textColor} rounded-xl shadow-sm text-xs transition`}
          >
            {row.status}
          </button>
        );
      },
    },
    {
      name: "Date",
      selector: (row) => row.date,
      center: true,
      grow: 1,
    },
    {
      name: "Actions",
      center: true,
      grow: 1,
      cell: (row) => (
        <div className="relative">
          {/* 3 dots button */}
          <button
            onClick={() => handleMenuToggle(row.id)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <FiMoreVertical className="text-gray-600 text-lg" />
          </button>

          {/* Dropdown menu */}
          {openMenu === row.id && (
            <div className="absolute right-6 -top-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]">
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleEdit(row)}
              >
                ✏️ Edit
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={() => handleDelete(row)}
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        border: "none",
        backgroundColor: "#e5e7ea",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        color: "#64748b",
        borderRadius: "8px 8px 0 0",
        padding: "0 8px",
      },
    },
    headCells: {
      style: {
        paddingLeft: "13px",
        // justifyContent: "center",
        paddingRight: "16px",
        "&:first-of-type": {
          paddingLeft: "20px",
          borderTopLeftRadius: "8px",
        },
        "&:last-of-type": {
          paddingRight: "20px",
          borderTopRightRadius: "8px",
        },
      },
    },
    rows: {
      style: {
        fontSize: "0.875rem",
        paddingTop: "16px",
        paddingBottom: "16px",
        fontWeight: 400,
        color: "#334155",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #f1f5f9",
        transition: "all 0.2s ease",
        "&:not(:last-of-type)": {
          borderBottom: "1px solid #f1f5f9",
        },
        "&:hover": {
          backgroundColor: "#f8fafc",
          transform: "translateY(-1px)",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        },
        "&.Mui-selected": {
          backgroundColor: "#f1f5fe",
          boxShadow: "inset 3px 0 0 0 #3b82f6",
        },
        "&.Mui-selected:hover": {
          backgroundColor: "#e0e7ff",
        },
      },
      stripedStyle: {
        backgroundColor: "#f8fafc",
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        justifyContent: "center",
        paddingRight: "16px",
        "&:first-of-type": {
          paddingLeft: "24px",
        },
        "&:last-of-type": {
          paddingRight: "24px",
        },
      },
    },
    pagination: {
      style: {
        borderTop: "none",
        backgroundColor: "#ffffff",
        padding: "16px 24px",
        borderRadius: "0 0 8px 8px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      },
      pageButtonsStyle: {
        borderRadius: "6px",
        height: "36px",
        width: "36px",
        padding: "0",
        margin: "0 4px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        backgroundColor: "transparent",
        border: "1px solid #e2e8f0",
        color: "#64748b",
        "&:disabled": {
          cursor: "unset",
          opacity: 0.5,
        },
        "&:hover:not(:disabled)": {
          backgroundColor: "#f1f5f9",
          borderColor: "#cbd5e1",
        },
        "&:focus": {
          outline: "none",
          backgroundColor: "#e0e7ff",
          borderColor: "#93c5fd",
        },
      },
    },
  };

  return (
    <>
      <section className="bg-gray-50 sm:p-7 p-4 min-h-screen flex gap-10 flex-col">
        {/* upper div */}
        <div className="flex xl:flex-row flex-col-reverse gap-8 justify-between items-center">
          <Filter />
          <div className="flex flex-wrap items-center gap-2">
            <Searchbar />
            <Button
              onClick={() => setIsCreateFolderModalOpen(true)}
              text="Create Folder"
              bg="bg-[#46abbd]"
              icon={IoMdAdd}
              textColor="text-white"
              borderColor="border-[#46abbd]"
            />
            <Button
              onClick={() => setIsModalOpen(true)}
              text="Send New Notification"
              bg="bg-[#46abbd]"
              icon={IoMdAdd}
              textColor="text-white"
              borderColor="border-[#46abbd]"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full">
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={notificationsData}
              customStyles={{
                ...customStyles,
                table: {
                  style: {
                    minWidth: "900px",
                  },
                },
              }}
              pagination
              highlightOnHover
              pointerOnHover
              responsive={false}
              noHeader
              noDataComponent={
                <div className="py-8 text-center">
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No users found
                  </h3>
                </div>
              }
            />
          </div>
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Send New Notification"
        showTitle={true}
        showCloseIcon={true}
        showDivider={true}
        width="min-w-[300px] max-w-2xl"
        secondaryBtnText="Cancel"
        primaryBtnText="Send Now"
        onPrimaryClick={handleSendNotification}
      >
        <div className="flex flex-col gap-4 pb-4">
          <div className="w-full flex flex-col gap-2">
            <label className="text-base font-normal text-gray-600">
              Post Title:
            </label>
            <input
              type="text"
              placeholder="enter post title"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                            focus:outline-none focus:border-[#46acbe]"
            />
          </div>
          <div className="w-full flex flex-col gap-2">
            <label className="text-base font-normal text-gray-600">
              Content:
            </label>
            <textarea
              placeholder="type"
              rows={4}
              value={notificationContent}
              onChange={(e) => setNotificationContent(e.target.value)}
              className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe] resize-y"
            />
            <p className="text-xs text-gray-600">10,000 Max Characters</p>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Target Users:</h2>
          <div className="flex flex-wrap gap-2">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleFolderClick(folder)}
                disabled={loading}
                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-blue-700 rounded-lg text-sm transition"
              >
                {folder.name}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        title="Create Folder"
        showTitle={true}
        showCloseIcon={true}
        showDivider={true}
        width="min-w-[300px] max-w-2xl"
        secondaryBtnText="Cancel"
        primaryBtnText="Add"
        onPrimaryClick={handleCreateFolder}
      >
        <div className="flex flex-col gap-4 pb-4">
          <div className="w-full flex flex-col gap-2">
            <label className="text-base font-normal text-gray-600">
              Folder Name:
            </label>
            <input
              type="text"
              placeholder="Enter folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                            focus:outline-none focus:border-[#46acbe]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-base font-normal text-gray-600">
              Select Categories:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Inactive users",
                "Active users",
                "Progress less than 50",
                "Progress less than 70",
                "Progress more than 90",
                "User not doing workout",
                "User not posting meals",
                "Trial Users"
              ].map((category) => (
                <label key={category} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="w-4 h-4 text-[#46abbd] bg-gray-100 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isUserSelectionModalOpen}
        onClose={() => setIsUserSelectionModalOpen(false)}
        title={`Select Users for ${selectedFolder?.name || ''}`}
        showTitle={true}
        showCloseIcon={true}
        showDivider={true}
        width="min-w-[600px] max-w-4xl"
        secondaryBtnText="Cancel"
        primaryBtnText="Save"
        onPrimaryClick={handleSaveUserSelection}
      >
        <div className="flex flex-col gap-4 pb-4">
          {folderUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 text-[#46abbd] bg-gray-100 border-gray-300 rounded focus:ring-[#46abbd] focus:ring-2"
              />
              <label className="text-sm font-medium text-gray-700">Select All</label>
            </div>
          )}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#46abbd]"></div>
              </div>
            ) : folderUsers.length > 0 ? (
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Select</th>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Phone</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {folderUsers.map((user) => (
                    <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                          className="w-4 h-4 text-[#46abbd] bg-gray-100 border-gray-300 rounded focus:ring-[#46abbd] focus:ring-2"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4">{user.email || 'N/A'}</td>
                      <td className="px-6 py-4">{user.phoneNo || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.isActive === 'Y' ? 'bg-green-100 text-green-800' :
                          user.isActive === 'N' ? 'bg-red-100 text-red-800' :
                          user.isActive ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isActive === 'Y' ? 'Active' : user.isActive === 'N' ? 'Inactive' : user.isActive ? 'Trial' : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">There are no users available for this folder.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Notifications;
