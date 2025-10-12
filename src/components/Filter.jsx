import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

function Filter({name}) {
  const [isOpen, setIsOpen] = useState(false);

  const [selected, setSelected] = useState("All");
  const statuses = ["All", "Active", "Inactive", "Archived"];
  const [activeTab, setActiveTab] = useState("All");
  return (
    <>
      <div className="relative">
        <div
          className="flex items-center gap-2 py-3 px-4 rounded-lg border border-gray-200 bg-white text-gray-600 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <p>Filter</p>
          <IoIosArrowDown
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
        {isOpen && (
          <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {statuses.map((status, index) => (
              <div
                key={index}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                {status}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Filter;
