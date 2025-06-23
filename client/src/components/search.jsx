import React from "react";

function Search({
  searchTerm,
  setSearchTerm,
  showMobileSearch,
  setShowMobileSearch,
}) {
  return (
    <>
      <button
        className="lg:hidden md:hidden text-white font-bold h-12 px-4 rounded-md bg-blue-500 flex items-center justify-center gap-2"
        onClick={() => setShowMobileSearch(true)}
      >
        <svg
          width="20"
          height="20"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M11.2498 5.75037C10.8356 5.75037 10.4998 6.08615 10.4998 6.50037C10.4998 6.91458 10.8356 7.25037 11.2498 7.25037C13.874 7.25037 16.0011 9.37718 16.0011 12.0004C16.0011 12.4146 16.3369 12.7504 16.7511 12.7504C17.1653 12.7504 17.5011 12.4146 17.5011 12.0004C17.5011 8.54842 14.7021 5.75037 11.2498 5.75037Z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2 11.9989C2 6.89126 6.14154 2.75098 11.25 2.75098C16.3585 2.75098 20.5 6.89126 20.5 11.9989C20.5 14.2836 19.6714 16.3747 18.2983 17.9883L21.7791 21.4695C22.072 21.7624 22.072 22.2372 21.7791 22.5301C21.4862 22.823 21.0113 22.823 20.7184 22.5301L17.2372 19.0486C15.6237 20.4197 13.5334 21.2469 11.25 21.2469C6.14154 21.2469 2 17.1066 2 11.9989ZM11.25 4.25098C6.96962 4.25098 3.5 7.72003 3.5 11.9989C3.5 16.2779 6.96962 19.7469 11.25 19.7469C15.5304 19.7469 19 16.2779 19 11.9989C19 7.72003 15.5304 4.25098 11.25 4.25098Z"
          />
        </svg>
      </button>

      {/* Desktop: always show input */}
      <input
        type="text"
        placeholder="Search..."
        className="hidden w-full sm:block h-12 border border-gray-300 rounded-md px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Mobile: show input absolutely when button clicked */}
      {showMobileSearch && (
        <input
          type="text"
          placeholder="Search..."
          autoFocus
          className="absolute top-[15%] left-0 right-0 z-50 mx-2 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:hidden"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onBlur={() => setShowMobileSearch(false)} // hide input when it loses focus
        />
      )}
    </>
  );
}

export default Search;
