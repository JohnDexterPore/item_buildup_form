import React from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import * as LuIcons from "react-icons/lu";

function Sidebar({ collapsed, setCollapsed, navigationItems = [], loading }) {
  return (
    <>
      {/* Sidebar */}
      <div
        className={`h-screen bg-gray-900 text-white transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div
          className={`flex items-center justify-between p-4 border-b border-gray-700 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {!collapsed && <span className="text-xl font-bold">IBU Form</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white focus:outline-none"
          >
            <LuLayoutDashboard />
          </button>
        </div>

        <ul className="mt-4 space-y-2">
          {loading ? (
            <li className="text-center">Loading...</li>
          ) : (
            navigationItems.map((item, index) => {
              const Icon = LuIcons[item.nav_svg];
              return (
                <li key={index}>
                  <a
                    className={`flex items-center space-x-3 px-4 py-2 hover:bg-gray-700 cursor-pointer ${
                      collapsed ? "justify-center" : ""
                    }`}
                    href={item.nav_link}
                  >
                    <span className="text-lg">{Icon && <Icon />}</span>
                    {!collapsed && <span>{item.nav_name}</span>}
                  </a>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
