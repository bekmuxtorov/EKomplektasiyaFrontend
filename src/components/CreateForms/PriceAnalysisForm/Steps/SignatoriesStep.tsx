/* eslint-disable react/no-unknown-property */
import React, { useMemo, useState } from "react";
import { Plus, Search, ChevronDown } from "lucide-react";
import EmployeePickerModal, { type Employee } from "@/components/modal/EmployeePickerModal";

type Row = {
  id: number;
  staffId?: string;
  staffName?: string;
  position?: string;
};

const DEFAULT_REGION = "Худудгаз Комплектатция";

const SignatoriesStep: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([{ id: 1 }]);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [focusedRowId, setFocusedRowId] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const showPopoverFor = useMemo(
    () => (rowId: number) => hoveredRowId === rowId || focusedRowId === rowId,
    [hoveredRowId, focusedRowId]
  );

  const applyPickedEmployee = (emp: Employee) => {
    setRows((prev) => {
      const emptyIndex = prev.findIndex((r) => !r.staffId);
      if (emptyIndex !== -1) {
        const updated = [...prev];
        updated[emptyIndex] = {
          ...updated[emptyIndex],
          staffId: emp.id,
          staffName: emp.name,
          position: emp.position,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: prev.length + 1,
          staffId: emp.id,
          staffName: emp.name,
          position: emp.position,
        },
      ];
    });
  };

  return (
    <div className="w-full">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-3 pb-3">
        {/* Search */}
        <div className="relative max-w-xl w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск (Ctrl+F)"
            className="w-full h-9 rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        {/* Add button -> opens modal */}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer"
        >
          <span className="relative inline-flex h-5 w-5 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-white/15" />
            <Plus className="h-4 w-4" />
          </span>
          Kiritish
        </button>
      </div>

      {/* Table */}
      <div className="mx-2 overflow-hidden rounded-md border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr className="[&>th]:py-2 [&>th]:px-3 [&>th]:text-left [&>th]:font-medium">
              <th className="w-10">
                <input type="checkbox" className="h-4 w-4 accent-sky-600" />
              </th>
              <th className="w-12">N</th>
              <th>Xabar xolati</th>
              <th className="w-[260px]">Imzolovchi xodim</th>
              <th>Lavozim</th>
              <th>Imzo</th>
              <th className="w-56">Imzolangan vaqt</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => {
              // const show = showPopoverFor(r.id);
              return (
                <tr key={r.id} className="border-t border-slate-200 bg-white">
                  <td className="py-2 px-3">
                    <input type="checkbox" className="h-4 w-4 accent-sky-600" />
                  </td>
                  <td className="py-2 px-3">{r.id}</td>
                  <td className="py-2 px-3"></td>
                  <td className="py-2 px-3">{r.staffName || "Tanlang"}</td>
                  <td className="py-2 px-3">{r.position || ""}</td>
                  <td className="py-2 px-3"></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <EmployeePickerModal
        open={pickerOpen}
        region={DEFAULT_REGION}
        onClose={() => setPickerOpen(false)}
        onPick={applyPickedEmployee}
      />
    </div>
  );
};

export default SignatoriesStep;
