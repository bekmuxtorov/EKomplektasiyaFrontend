/* eslint-disable react/no-unknown-property */
import React, { useMemo, useState } from "react";
import { Search, FolderPlus } from "lucide-react";
import { Button } from "antd"

type Row = {
  id: number;
  orderType: string;
  productName: string;
  productType: string;
  model: string;
  size: string;
  unit: string;       // Ул.Бир
  qty: number;        // Сони
  sum: number;        // Сумма
  attachedEmployee?: string;
  docUrl?: string;
  selected?: boolean;
};

const AppProductsStep: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]); // hozircha bo'sh
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.orderType.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.productType.toLowerCase().includes(q) ||
        r.model.toLowerCase().includes(q) ||
        r.size.toLowerCase().includes(q) ||
        r.unit.toLowerCase().includes(q) ||
        String(r.qty).includes(q) ||
        String(r.sum).includes(q) ||
        (r.attachedEmployee || "").toLowerCase().includes(q) ||
        (r.docUrl || "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  // Select-all (faqat filtrlanganlarga ta'sir qiladi)
  const allSelected = filtered.length > 0 && filtered.every((r) => r.selected);
  const someSelected = filtered.some((r) => r.selected) && !allSelected;

  return (
    <div className="w-full">
      {/* Top bar */}
      <div className="flex items-center justify-end gap-3 px-3 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск (Ctrl+F)"
            className="h-9 w-[260px] rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <Button
        >
          <FolderPlus className="h-4 w-4" />
          Tovarlarni to'ldirish
        </Button>
      </div>

      {/* Table */}
      <div className="mx-2 overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            {/* 🔹 Hammasi bitta qatorda */}
            <tr className="[&>th]:py-2 [&>th]:px-3 [&>th]:text-left [&>th]:font-medium">
              <th className="w-10 align-middle">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-sky-600"
                  checked={allSelected}
                  ref={(el) => el && (el.indeterminate = someSelected)}
                  onChange={() =>
                    setRows((prev) =>
                      prev.map((r) =>
                        filtered.find((f) => f.id === r.id)
                          ? { ...r, selected: !allSelected }
                          : r
                      )
                    )
                  }
                />
              </th>
              <th className="w-12">N</th>
              <th className="min-w-[140px]">Buyurtma turi</th>
              <th className="min-w-[120px]">Tovar nomi</th>
              <th className="min-w-[120px]">Tovar turi</th>
              <th className="min-w-[120px]">Model</th>
              <th className="min-w-[100px]">O'lcham</th>
              <th className="w-30">O'lchov birligi</th>
              <th className="w-24">Soni</th>
              <th className="w-20">Summa</th>
              <th className="min-w-[100px]">Biriktirilgan xodim</th>
              <th className="min-w-[100px]">Xujjat manzili</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-24 text-center text-slate-500">
                  Ruyhat mavjud emas
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
                      onChange={() =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id ? { ...x, selected: !x.selected } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="py-2 px-3">{idx + 1}</td>
                  <td className="py-2 px-3">{r.orderType}</td>
                  <td className="py-2 px-3">{r.productName}</td>
                  <td className="py-2 px-3">{r.productType}</td>
                  <td className="py-2 px-3">{r.model}</td>
                  <td className="py-2 px-3">{r.size}</td>
                  <td className="py-2 px-3">{r.unit}</td>
                  <td className="py-2 px-3">{r.qty}</td>
                  <td className="py-2 px-3">{r.sum}</td>
                  <td className="py-2 px-3">{r.attachedEmployee || ""}</td>
                  <td className="py-2 px-3">
                    {r.docUrl ? (
                      <a
                        href={r.docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-600 hover:underline"
                      >
                        {r.docUrl}
                      </a>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppProductsStep;
