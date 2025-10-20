/* eslint-disable react/no-unknown-property */
import React, { useMemo, useState } from "react";
import { Search, Plus, Play } from "lucide-react";
import { Button } from 'antd';
type Row = {
  id: number;
  employee: string;      // Келишувчи ходим
  msgStatus: string;     // Хабар ҳолати
  time: string;          // Вақт
  answerType: string;    // Жавоб тури
  note?: string;         // Изох
  selected?: boolean;
};

const Negotiators: React.FC = () => {
  // Hozircha bo'sh ro'yxat (rasmdagi kabi)
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.employee.toLowerCase().includes(q) ||
        r.msgStatus.toLowerCase().includes(q) ||
        r.time.toLowerCase().includes(q) ||
        r.answerType.toLowerCase().includes(q) ||
        (r.note || "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  const allSelected = filtered.length > 0 && filtered.every((r) => r.selected);
  const someSelected = filtered.some((r) => r.selected) && !allSelected;

  const toggleAll = () => {
    setRows((prev) =>
      prev.map((r) =>
        filtered.find((f) => f.id === r.id)
          ? { ...r, selected: !allSelected }
          : r
      )
    );
  };

  const toggleOne = (id: number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  return (
    <div className="w-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-3 pb-3">
        {/* Search (full width) */}
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск (Ctrl+F)"
            className="h-9 w-60 rounded-md border border-slate-300 pl-3 pr-9 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Buttons on the right */}
        <Button
          className="inline-flex items-center gap-2 h-9 rounded-md bg-[#2b6cb0] px-3 text-white text-sm hover:bg-[#255fa0] transition-colors"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
            <Plus className="h-4 w-4" />
          </span>
          Kiritish
        </Button>

        <Button
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
            <Play className="h-4 w-4" />
          </span>
          Kelishuvchilarga yuborish
        </Button>
      </div>

      {/* Table */}
      <div className="mx-2 overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr className="[&>th]:py-2 [&>th]:px-3 [&>th]:text-left [&>th]:font-medium">
              <th className="w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-sky-600"
                  checked={allSelected}
                  ref={(el) => el && (el.indeterminate = someSelected)}
                  onChange={toggleAll}
                />
              </th>
              <th className="w-12">N</th>
              <th className="min-w-[220px]">Kelishuvchi xodim</th>
              <th className="min-w-[160px]">Xabar xolati</th>
              <th className="min-w-[140px]">Vaqt</th>
              <th className="min-w-[160px]">Javob turi</th>
              <th className="min-w-[200px]">Izox</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-24 text-center text-slate-500">
                  Список пуст
                </td>
              </tr>
            ) : (
              filtered.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-t border-slate-200 hover:bg-slate-50"
                >
                  <td className="py-2 px-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-sky-600"
                      checked={!!r.selected}
                      onChange={() => toggleOne(r.id)}
                    />
                  </td>
                  <td className="py-2 px-3">{idx + 1}</td>
                  <td className="py-2 px-3">{r.employee}</td>
                  <td className="py-2 px-3">{r.msgStatus}</td>
                  <td className="py-2 px-3">{r.time}</td>
                  <td className="py-2 px-3">{r.answerType}</td>
                  <td className="py-2 px-3">{r.note || ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Negotiators;
