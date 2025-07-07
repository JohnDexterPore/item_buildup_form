import React, { useEffect, useState } from "react";
import Search from "../components/Search";
import { useAxiosWithAuth } from "../hooks/useAxiosWithAuth";
import { LuPencilLine, LuTrash2 } from "react-icons/lu";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowRight,
  MdDescription,
} from "react-icons/md";
import ItemModal from "../components/ItemModal";
import Prompt from "../components/Prompt";

function Ongoing() {
  const axios = useAxiosWithAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [ItemModalVisible, setItemModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const itemsPerPage = 7;

  const fetchItemsData = async () => {
    try {
      const res = await axios.get("/items/get-items", {
        params: { state: "Ongoing" },
      });
      setItems(res.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItemsData();
  }, []);

  const filteredItems = items.filter((item) => {
    return (
      item.parent_item_description.includes(searchTerm) ||
      item.brand?.includes(searchTerm)
    );
  });

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setItemModalVisible(true);
  };

  const handleCloseItemModal = () => {
    setSelectedItem(null);
    setItemModalVisible(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItem = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  console.log("Filtered Items:", items);

  return (
    <>
      <div className="bg-gray-100 flex items-center justify-center p-5">
        <div className="flex flex-col lg:flex-col p-5 gap-5 w-full max-w-8xl bg-white shadow-2xl rounded-3xl">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-4 font-bold text-xl text-gray-700">
              Results:
              <span className="ml-2 font-normal text-xl text-gray-600">
                {filteredItems.length} items...
              </span>
            </div>

            <div className="flex flex-1 items-end justify-end">
              <Search
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showMobileSearch={showMobileSearch}
                setShowMobileSearch={setShowMobileSearch}
              />
            </div>
          </div>
          <div className="">
            <table className="min-w-full table-auto border-collapse rounded-xl overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold">
                    Actions
                  </th>
                  <th className="p-4 text-left text-sm font-semibold">
                    Item Description
                  </th>
                  <th className="p-4 text-left text-sm font-semibold">Brand</th>
                  <th className="p-4 text-left text-sm font-semibold">
                    Date Prepared
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white text-gray-800">
                {currentItem.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-50 transition duration-150"
                  >
                    <td className="p-4 flex items-center gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="hover:bg-blue-100 p-2 rounded-full transition duration-200"
                        title="Edit"
                        aria-label="Edit item"
                      >
                        <LuPencilLine className="text-xl" />
                      </button>
                      <button
                        className="hover:bg-red-100 p-2 rounded-full transition duration-200"
                        title="Delete"
                        aria-label="Delete item"
                      >
                        <LuTrash2 className="text-xl" />
                      </button>
                    </td>
                    <td className="p-4 font-medium">
                      {item.parent_item_description}
                    </td>
                    <td className="p-4">{item.brand || "N/A"}</td>
                    <td className="p-4">
                      {item.date_prepared ? (
                        <span className="whitespace-nowrap">
                          {new Date(item.date_prepared).toLocaleDateString()}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4 space-x-1 text-md">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              <MdKeyboardDoubleArrowLeft />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              <MdKeyboardArrowLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, currentPage - 4),
                Math.min(currentPage + 1, totalPages)
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === page
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              <MdKeyboardArrowRight />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              <MdKeyboardDoubleArrowRight />
            </button>
          </div>
        </div>
      </div>
      <ItemModal
        visible={ItemModalVisible}
        onClose={handleCloseItemModal}
        item={selectedItem}
        onSaved={fetchItemsData} // <-- NEW
      />
    </>
  );
}

export default Ongoing;
