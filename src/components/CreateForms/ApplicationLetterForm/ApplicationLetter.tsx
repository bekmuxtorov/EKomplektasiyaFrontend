/* eslint-disable react/no-unknown-property */
import React, { useMemo, useState } from "react";
import ApplicationLetterForm from "./ApplicationLetterForm";
import { Button } from "antd";
import { Plus } from "lucide-react";

type Row = {
  id: number;
  selected?: boolean;
  date: string;
  docNumber: string;
  employee: string;
  signatory: string;
  signStatus: "Имзоланган" | "Юборилган";
  formOk?: boolean;   // "Шакл..." ustuni (✓ bo'lishi mumkin)
  accepted?: boolean; // "Қабу..." ustuni
  paid?: boolean;     // "Тўло..." ustuni
};

const initialRows: Row[] = [
  {
    id: 1,
    date: "19.09.2025 11:21:00",
    docNumber: "000000020",
    employee: "Ахмедов Дилшод Рамиз ўғли",
    signatory: "Исмаилов Каиротбек Джурабекович",
    signStatus: "Имзоланган",
    formOk: true,
    accepted: false,
    paid: false,
  },
  {
    id: 2,
    date: "25.09.2025 15:42:29",
    docNumber: "000000022",
    employee: "Ахмедов Дилшод Рамиз ўғли",
    signatory: "Исмаилов Каиротбек Джурабекович",
    signStatus: "Юборилган",
    formOk: false,
    accepted: false,
    paid: false,
  },
];

const ApplicationLetter: React.FC = () => {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [query, setQuery] = useState("");
  const [isCreateFormModalOpen, setIsCreateFormModalOpen] = useState<boolean>(false);

  // Qidiruv
  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        r.docNumber.toLowerCase().includes(q) ||
        r.employee.toLowerCase().includes(q) ||
        r.signatory.toLowerCase().includes(q) ||
        r.signStatus.toLowerCase().includes(q) ||
        r.date.toLowerCase().includes(q)
    );
  }, [rows, query]);

  // Select-all / select-one
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
    <>
      {isCreateFormModalOpen ? (
        <>
          <ApplicationLetterForm isCreateFormModalOpen={isCreateFormModalOpen} setIsCreateFormModalOpen={setIsCreateFormModalOpen} />
        </>
      ) : (<div className="w-full">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 px-3 pb-3">
          <div className="flex items-center gap-2">
            {/* Faqat matnli tugma, ikonkasiz */}
            <Button className='cursor-pointer'
              onClick={() => {
                setIsCreateFormModalOpen(true)
              }}>
              <Plus />
              Yaratish
            </Button>
          </div>

          {/* Qidiruv */}
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск (Ctrl+F)"
              className="h-9 w-[260px] rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mx-2 overflow-hidden rounded-md border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr className="[&>th]:py-2 [&>th]:px-3 [&>th]:text-left [&>th]:font-medium">
                <th className="w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 align-middle accent-sky-600"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                  />
                </th>
                <th className="w-34">Sana</th>
                <th className="w-30">Xujjat nomeri</th>
                <th className="w-44">Xodim</th>
                <th className="w-44">Imzolovchi xodim</th>
                <th className="w-40">Imzolanish xolati</th>
                <th className="w-20">Shakllangan</th>
                <th className="w-34">Qabul qilish xolati</th>
                <th className="w-24">To'lov xolati</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="py-10 text-center text-slate-500" colSpan={9}>
                    Malumot topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-slate-200 hover:bg-slate-50"
                  >
                    <td className="py-2 px-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 align-middle accent-sky-600"
                        checked={!!r.selected}
                        onChange={() => toggleOne(r.id)}
                      />
                    </td>
                    <td className="py-2 px-3">{r.date}</td>
                    <td className="py-2 px-3">{r.docNumber}</td>
                    <td className="py-2 px-3">{r.employee}</td>
                    <td className="py-2 px-3">{r.signatory}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs ${r.signStatus === "Имзоланган"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                      >
                        {/* rangli nuqta */}
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${r.signStatus === "Имзоланган"
                            ? "bg-green-600"
                            : "bg-amber-600"
                            }`}
                        />
                        {r.signStatus}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {r.formOk ? (
                        <span className="inline-block rounded bg-green-600/90 px-1.5 text-[11px] leading-5 text-white">
                          ✓
                        </span>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="py-2 px-3">{r.accepted ? "—" : ""}</td>
                    <td className="py-2 px-3">{r.paid ? "—" : ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>)}

    </>
  );
};

export default ApplicationLetter;
