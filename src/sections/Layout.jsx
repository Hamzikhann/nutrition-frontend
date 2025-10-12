import React, { useState, useEffect } from "react";
import Topbar from "../sections/Topbar";
import Sidebar from "../sections/Sidebar";
import { Outlet, useLocation } from "react-router-dom";

function Layout() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const location = useLocation();

  const pathToTabName = {
    "/dashboard": "Dashboard",
    "/users": "Users",
    "/tracker": "Tracker",
    "/recipes": "Recips",
    "/diet-plans": "Diet Plans",
    "/workouts": "WorkOuts",
    "/community": "Community",
    "/supplements": "Supplements",
    "/moderators": "Moderators",
    "/notifications": "Notifications",
    "/plans": "Plans",
    "/profile": "Profile"
  };

  useEffect(() => {
    const currentTab = pathToTabName[location.pathname] || "Dashboard";
    setActiveTab(currentTab);
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-full">
      <Sidebar setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-x-auto">
        <Topbar activeTab={activeTab} />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;
