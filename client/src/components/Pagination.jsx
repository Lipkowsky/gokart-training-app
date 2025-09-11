import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8 gap-2">
      {/* Poprzednia strona */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1.5 rounded-lg font-medium transition-colors
          ${currentPage === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white border hover:bg-gray-100 text-gray-700 shadow-sm"}
        `}
      >
        ←
      </button>

      {/* Numery stron */}
      {Array.from({ length: totalPages }, (_, i) => {
        const page = i + 1;
        const isActive = currentPage === page;

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors
              ${isActive
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white border text-gray-700 hover:bg-gray-100 shadow-sm"}
            `}
          >
            {page}
          </button>
        );
      })}

      {/* Następna strona */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1.5 rounded-lg font-medium transition-colors
          ${currentPage === totalPages
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white border hover:bg-gray-100 text-gray-700 shadow-sm"}
        `}
      >
        →
      </button>
    </div>
  );
};

export default Pagination;
