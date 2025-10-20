/* eslint-disable react/no-unknown-property */
import React, { useEffect, useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { axiosAPI } from "@/services/axiosAPI"; // ⭐️ bizning instans

/** Modalda tanlanadigan xodim tipi */
export type Employee = {
  id: string;
  name: string;
  number: number;
  position: string;
};

type EmployeesApiResponse = {
  count: number;
  limit: number;
  offset: number;
  results: Array<{
    id: string;
    name: string;
    number: number;
    position: string;
    region: string;
    district: string;
  }>;
};

export const EMP_LIMIT = 20;

interface EmployeePickerModalProps {
  open: boolean;
  region: string;
  onClose: () => void;
  onPick: (emp: Employee) => void;
}

const EmployeePickerModal: React.FC<EmployeePickerModalProps> = ({
  open,
  region,
  onClose,
  onPick,
}) => {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Employee[]>([]);
  const [count, setCount] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / EMP_LIMIT)),
    [count]
  );

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const offset = (page - 1) * EMP_LIMIT;


        const { data } = await axiosAPI.get<EmployeesApiResponse>(
          `/employees/list`,
          {
            params: {
              region,
              limit: EMP_LIMIT,
              offset,
            },
          }
        );

        setCount(data.count);
        setItems(
          data.results.map((r) => ({
            id: r.id,
            name: r.name,
            number: r.number,
            position: r.position,
          }))
        );
      } catch (e: any) {
        // 401 tutib, foydali xabar qaytaramiz
        if (e?.response?.status === 401) {
          setError("401 Unauthorized — tizimga kirish talab qilinadi.");
        } else if (e.name !== "CanceledError" && e.name !== "AbortError") {
          setError(e?.message || "Тармоқ хатолиги");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [open, page, region]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="absolute inset-0 flex items-start justify-center pt-16 px-4">
        <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
            <h3 className="text-[15px] font-semibold">Барча ходимлар рўйхати</h3>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-slate-200/70" aria-label="Yopish">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            {error && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr className="[&>th]:py-2 [&>th]:px-3 [&>th]:text-left [&>th]:font-medium">
                    <th className="w-14">№</th>
                    <th>Ф.И.Ш.</th>
                    <th className="w-[40%]">Лавозим</th>
                    <th className="w-28 text-center">Танлаш</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center">Юкланмоқда...</td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center">Маʼlumot топилмади</td>
                    </tr>
                  ) : (
                    items.map((emp) => (
                      <tr key={emp.id} className="border-t hover:bg-slate-50">
                        <td className="py-2 px-3">{emp.number}</td>
                        <td className="py-2 px-3">{emp.name}</td>
                        <td className="py-2 px-3">{emp.position}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => { onPick(emp); onClose(); }}
                            className="inline-flex items-center justify-center rounded-md bg-sky-600 text-white text-xs h-8 px-3 hover:bg-sky-700"
                          >
                            Танлаш
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-slate-500">Жами: {count} • {page}/{totalPages}</div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-9 px-3 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="flex items-center gap-1"><ChevronLeft className="h-4 w-4" />Oldingi</span>
                </button>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 px-3 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="flex items-center gap-1">Keyingi<ChevronRight className="h-4 w-4" /></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePickerModal;


/* eslint-disable react/no-unknown-property */
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { X, ChevronLeft, ChevronRight } from "lucide-react";
// import { axiosAPI } from "@/services/axiosAPI";

// /** Modalda tanlanadigan xodim tipi */
// export type Employee = {
//   id: string;
//   name: string;
//   number: number;
//   position: string;
// };

// type EmployeesApiResponse = {
//   count: number;
//   limit: number;
//   offset: number;
//   results: Array<{
//     id: string;
//     name: string;
//     number: number;
//     position: string;
//     region: string;
//     district: string;
//   }>;
// };

// export const EMP_LIMIT = 20;

// interface EmployeePickerModalProps {
//   open: boolean;
//   region: string;
//   onClose: () => void;
//   onPick: (emp: Employee) => void; // Bir nechta tanlanganda har biri uchun chaqiriladi
// }

// const EmployeePickerModal: React.FC<EmployeePickerModalProps> = ({
//   open,
//   region,
//   onClose,
//   onPick,
// }) => {
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [items, setItems] = useState<Employee[]>([]);
//   const [count, setCount] = useState(0);

//   // ❗️Tanlanganlar barcha sahifalar bo‘yicha saqlanadi
//   const [selectedMap, setSelectedMap] = useState<Map<string, Employee>>(new Map());

//   const totalPages = useMemo(
//     () => Math.max(1, Math.ceil(count / EMP_LIMIT)),
//     [count]
//   );

//   // Hozirgi sahifadagi holat
//   const allOnPageSelected = useMemo(
//     () => items.length > 0 && items.every((e) => selectedMap.has(e.id)),
//     [items, selectedMap]
//   );

//   const someOnPageSelected = useMemo(
//     () => items.some((e) => selectedMap.has(e.id)) && !allOnPageSelected,
//     [items, selectedMap, allOnPageSelected]
//   );

//   // Header checkbox’iga indeterminate holatini qo‘yish
//   const headerCbRef = useRef<HTMLInputElement>(null);
//   useEffect(() => {
//     if (headerCbRef.current) {
//       headerCbRef.current.indeterminate = someOnPageSelected;
//     }
//   }, [someOnPageSelected]);

//   // Ma’lumot olish
//   useEffect(() => {
//     if (!open) return;

//     const controller = new AbortController();

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         if (!region) {
//           setError("Ҳудуд танланмаган");
//           return;
//         }

//         const offset = (page - 1) * EMP_LIMIT;

//         const { data } = await axiosAPI.get<EmployeesApiResponse>(
//           "employees/list", // ✅ oldidagi / olib tashlandi
//           {
//             params: { region, limit: EMP_LIMIT, offset },
//             withCredentials: true,
//             signal: controller.signal,
//             headers: { Accept: "application/json" },
//           }
//         );

//         setCount(data.count);
//         setItems(
//           data.results.map((r) => ({
//             id: r.id,
//             name: r.name,
//             number: r.number,
//             position: r.position,
//           }))
//         );
//       } catch (e: any) {
//         console.error("Xodimlarni olishda xatolik:", e);
//         if (e?.response?.status === 401) {
//           setError("401 Unauthorized — tizimga kirish talab qilinadi.");
//         } else if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
//           setError(e?.message || "Тармоқ хатолиги");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//     return () => controller.abort();
//   }, [open, page, region]);

//   if (!open) return null;

//   // === Checkbox handler’lari ===
//   const toggleRow = (emp: Employee) => {
//     setSelectedMap((prev) => {
//       const next = new Map(prev);
//       if (next.has(emp.id)) next.delete(emp.id);
//       else next.set(emp.id, emp);
//       return next;
//     });
//   };

//   const toggleAllOnPage = () => {
//     setSelectedMap((prev) => {
//       const next = new Map(prev);
//       if (allOnPageSelected) {
//         // sahifadagi barchasini olib tashlash
//         items.forEach((e) => next.delete(e.id));
//       } else {
//         // sahifadagi barchasini qo‘shish
//         items.forEach((e) => next.set(e.id, e));
//       }
//       return next;
//     });
//   };

//   const clearSelection = () => setSelectedMap(new Map());

//   const confirmSelection = () => {
//     // tanlanganlarning barchasini parentga yuboramiz
//     selectedMap.forEach((emp) => onPick(emp));
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-[100]">
//       {/* Overlay */}
//       <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

//       {/* Dialog */}
//       <div className="absolute inset-0 flex items-start justify-center pt-10 px-4">
//         <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
//           {/* Header */}
//           <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
//             <h3 className="text-[15px] font-semibold">Барча ходимлар рўйхати</h3>
//             <button onClick={onClose} className="p-2 rounded-md hover:bg-slate-200/70" aria-label="Yopish">
//               <X className="h-5 w-5" />
//             </button>
//           </div>

//           {/* Body */}
//           <div className="p-4">
//             {error && (
//               <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//                 {error}
//               </div>
//             )}

//             {/* Jadval + scroll */}
//             <div className="rounded-md border border-slate-200">
//               <div className="max-h-[420px] overflow-auto">
//                 <table className="w-full text-sm">
//                   <thead className="sticky top-0 bg-slate-50 text-slate-700 z-10">
//                     <tr className="[&>th]:py-2 [&>th]:px-3 [&>th]:text-left [&>th]:font-medium border-b">
//                       <th className="w-10 text-center">
//                         <input
//                           ref={headerCbRef}
//                           type="checkbox"
//                           className="h-4 w-4 accent-sky-600"
//                           checked={allOnPageSelected}
//                           onChange={toggleAllOnPage}
//                         />
//                       </th>
//                       <th className="w-14">№</th>
//                       <th>Ф.И.Ш.</th>
//                       <th className="w-[40%]">Лавозим</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {loading ? (
//                       <tr>
//                         <td colSpan={4} className="py-8 text-center">Юкланмоқда...</td>
//                       </tr>
//                     ) : items.length === 0 ? (
//                       <tr>
//                         <td colSpan={4} className="py-8 text-center">Маʼlumot топилмади</td>
//                       </tr>
//                     ) : (
//                       items.map((emp) => {
//                         const checked = selectedMap.has(emp.id);
//                         return (
//                           <tr key={emp.id} className="border-t hover:bg-slate-50">
//                             <td className="py-2 px-3 text-center">
//                               <input
//                                 type="checkbox"
//                                 className="h-4 w-4 accent-sky-600"
//                                 checked={checked}
//                                 onChange={() => toggleRow(emp)}
//                               />
//                             </td>
//                             <td className="py-2 px-3">{emp.number}</td>
//                             <td className="py-2 px-3">{emp.name}</td>
//                             <td className="py-2 px-3">{emp.position}</td>
//                           </tr>
//                         );
//                       })
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Pastki panel: Tanlash / Tozalash / Pagination */}
//             <div className="mt-4 grid grid-cols-1 gap-3">
//               {/* Actionlar */}
//               <div className="flex items-center justify-between gap-3">
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={clearSelection}
//                     disabled={selectedMap.size === 0}
//                     className="h-9 px-3 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
//                   >
//                     Tozalash
//                   </button>

//                   <span className="text-sm text-slate-600">
//                     Tanlanganlar: <b>{selectedMap.size}</b>
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <div className="text-xs text-slate-500">
//                     Жами: {count} • {page}/{totalPages}
//                   </div>
//                   <button
//                     disabled={page <= 1 || loading}
//                     onClick={() => setPage((p) => Math.max(1, p - 1))}
//                     className="h-9 px-3 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
//                   >
//                     <span className="flex items-center gap-1">
//                       <ChevronLeft className="h-4 w-4" />
//                       Oldingi
//                     </span>
//                   </button>
//                   <button
//                     disabled={page >= totalPages || loading}
//                     onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                     className="h-9 px-3 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
//                   >
//                     <span className="flex items-center gap-1">
//                       Keyingi
//                       <ChevronRight className="h-4 w-4" />
//                     </span>
//                   </button>
//                 </div>
//               </div>

//               {/* Tasdiqlash tugmasi */}
//               <div className="flex items-center justify-end">
//                 <button
//                   onClick={confirmSelection}
//                   disabled={selectedMap.size === 0}
//                   className="inline-flex items-center justify-center rounded-md bg-sky-600 text-white text-sm h-10 px-4 hover:bg-sky-700 disabled:opacity-50"
//                 >
//                   Танлаш ({selectedMap.size})
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeePickerModal;
