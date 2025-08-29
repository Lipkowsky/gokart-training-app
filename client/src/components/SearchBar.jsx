import React from "react";

const SearchBar = ({ value, onChange, placeholder = "Szukaj..." }) => {
  return (
    <div className="mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 border rounded-md shadow-sm"
      />
    </div>
  );
};

export default SearchBar;
