import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance"; // make sure axios is imported

export default function useDropdown(name) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!name) return;

    axios
      .get(`/form/get-dropdowns?name=${name}`)
      .then((res) =>
        setOptions(
          res.data.map((d) => ({
            value: d.dropdown_select,
            label: d.dropdown_select,
          }))
        )
      )
      .catch((err) => {
        console.error("Error fetching dropdown options:", err);
        setOptions([]); // fallback to empty if error
      });
  }, [name]);

  return options;
}
