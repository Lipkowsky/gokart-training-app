import React from "react";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Szukaj...",
  className = "",
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full p-2 border rounded-md shadow-sm ${className}`}
    />
  );
};

export default SearchBar;
