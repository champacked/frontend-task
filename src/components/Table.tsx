import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { User, TableColumn } from "../types/table";

const ITEMS_PER_PAGE = 10;
const VALID_ROLES = ["admin", "member"];

interface TableProps {
  data: User[];
  columns: TableColumn<User>[];
  onDelete: (ids: string[]) => void;
  onEdit: (user: User) => void;
}

export const Table = ({ data, columns, onDelete, onEdit }: TableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<User | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const validateForm = (form: User) => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!isNaN(Number(form.name))) {
      errors.name = "Name cannot be a number";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(currentData.map((item) => item.id));
      setSelectedRows(newSelected);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleDeleteSelected = () => {
    onDelete(Array.from(selectedRows));
    setSelectedRows(new Set());
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm({ ...user });
    setValidationErrors({});
  };

  const handleSave = () => {
    if (editForm && validateForm(editForm)) {
      onEdit(editForm);
      setEditingId(null);
      setEditForm(null);
      setValidationErrors({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
    setValidationErrors({});
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={
                    currentData.length > 0 &&
                    currentData.every((item) => selectedRows.has(item.id))
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No items found
                </td>
              </tr>
            ) : (
              currentData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={selectedRows.has(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                    />
                  </td>
                  {columns.map((column) => (
                    <td
                      key={column.accessor}
                      className="px-6 py-4 whitespace-nowrap"
                    >
                      {editingId === row.id ? (
                        <div className="space-y-1">
                          {column.accessor === "role" ? (
                            <select
                              className="w-full px-2 py-1 border rounded"
                              value={editForm?.[column.accessor] || ""}
                              onChange={(e) =>
                                setEditForm((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        [column.accessor]: e.target.value,
                                      }
                                    : null
                                )
                              }
                            >
                              {VALID_ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={
                                column.accessor === "email" ? "email" : "text"
                              }
                              className="w-full px-2 py-1 border rounded"
                              value={editForm?.[column.accessor] || ""}
                              onChange={(e) =>
                                setEditForm((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        [column.accessor]: e.target.value,
                                      }
                                    : null
                                )
                              }
                            />
                          )}
                          {validationErrors[column.accessor] && (
                            <p className="text-red-500 text-xs">
                              {validationErrors[column.accessor]}
                            </p>
                          )}
                        </div>
                      ) : (
                        row[column.accessor]
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right space-x-2">
                    {editingId === row.id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-900 cursor-pointer"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(row)}
                          className="text-blue-600 hover:text-blue-900 cursor-pointer"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => onDelete([row.id])}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination and Actions */}
      <div className="flex justify-between items-center">
        {currentData.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            disabled={selectedRows.size === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 cursor-pointer"
          >
            Delete Selected
          </button>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
          >
            <ChevronFirst size={20} />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg cursor-pointer ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
          >
            <ChevronLast size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
