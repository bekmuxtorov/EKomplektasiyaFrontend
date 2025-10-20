// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { axiosAPI } from "@/services/axiosAPI";
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow
// } from "@/components/UI/table";
// import { Button, Spin } from "antd";
// import { ArrowLeft, CalendarDays, CheckCircle2, Hash, User2, XCircle } from "lucide-react";

// /** === Types (yangi API shakliga mos) === */
// type IdName = { id?: string; name?: string };

// type DetailSigner = {
//   row_number: number;
//   executer?: IdName;
//   status_message?: string;
//   description?: string;
//   confirmation_date?: string;
//   is_signing?: boolean;
// };

// type DetailProduct = {
//   row_number?: number;
//   product?: IdName;
//   model?: IdName;
//   product_type?: IdName;
//   size?: IdName;
//   unit?: IdName;
//   price?: number;
//   quantity?: number;
//   summa?: number;
//   description?: string;
//   completed_quentity?: number;   // API dagi yozilishi shunday
//   analysis_quentity?: number;    // API dagi yozilishi shunday
//   [key: string]: any;
// };

// type DetailPayload = {
//   id: string;
//   number: string;
//   date: string;              // ISO
//   is_approved: boolean;
//   is_shaped: boolean;
//   employee?: IdName;
//   products: DetailProduct[];
//   signers: DetailSigner[];
// };

// /** === Helpers === */
// const fmt = (iso?: string) => {
//   if (!iso) return "";
//   const d = new Date(iso);
//   const p = (n: number) => String(n).padStart(2, "0");
//   return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
// };
// const nm = (v?: IdName | string) =>
//   typeof v === "string" ? v : (v?.name ?? "");

// const PriceAnalysisDetail: React.FC = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [detail, setDetail] = useState<DetailPayload | null>(null);

//   const load = async () => {
//     if (!id) return;
//     setLoading(true);
//     try {
//       let d: DetailPayload | undefined;

//       // 1) /detail/{id}
//       try {
//         const r1 = await axiosAPI.get<any>(`price-analysis/detail/${encodeURIComponent(id)}`);
//         const p1 = r1.data;
//         d = Array.isArray(p1) ? p1[0] : (p1?.results?.[0] ?? p1);
//       } catch { /* fallbacklarga o'tamiz */ }

//       // 2) /detail/?id=...
//       if (!d) {
//         try {
//           const r2 = await axiosAPI.get<any>("price-analysis/detail/", { params: { id } });
//           const p2 = r2.data;
//           const arr = Array.isArray(p2) ? p2 : p2?.results;
//           d = Array.isArray(arr) ? (arr.find((x: any) => x?.id === id) || arr[0]) : p2;
//         } catch { }
//       }

//       // 3) /detail/ to'liq va ichidan id qidiramiz
//       if (!d) {
//         const r3 = await axiosAPI.get<any>("price-analysis/detail/");
//         const p3 = r3.data;
//         const arr = Array.isArray(p3) ? p3 : p3?.results;
//         d = Array.isArray(arr) ? arr.find((x: any) => x?.id === id) : p3;
//       }

//       setDetail(d || null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, [id]);

//   const products = detail?.products || [];

//   return (
//     <section className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm min-h-[calc(100vh-150px)]">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-lg font-semibold text-slate-700">Narx tahlili tafsilotlari</h2>
//         <Button type="default" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
//           Orqaga
//         </Button>
//       </div>

//       {loading ? (
//         <div className="flex justify-center items-center py-20">
//           <Spin size="large" />
//         </div>
//       ) : !detail ? (
//         <div className="text-center text-slate-500 py-10">Ma’lumot topilmadi</div>
//       ) : (
//         <>
//           {/* Header (table) */}
//           <div>
//             {/* Header / Meta (table O‘RNIGA) */}
//             <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
//               <div className="flex items-center justify-between gap-4">
//                 {/* Title */}
//                 <div className="min-w-0 flex gap-2">
//                   <div className="text-sm text-slate-500 flex items-center gap-2">
//                     Hujjat raqami
//                   </div>
//                   <h1 className="text-md font-semibold text-slate-800 mt-1 truncate">
//                     № {detail.number || ""}
//                   </h1>
//                 </div>

//                 {/* Meta row */}
//                 <div className="mt-3 flex gap-x-10 gap-y-2 text-sm text-slate-700">
//                   <div className="flex items-center gap-2">
//                     <CalendarDays className="w-4 h-4 text-slate-500" />
//                     <span className="text-slate-500">Sana:</span>
//                     <span className="font-medium">{fmt(detail.date) || ""}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <User2 className="w-4 h-4 text-slate-500" />
//                     <span className="text-slate-500">Xodim:</span>
//                     <span className="font-medium">{detail.employee?.name || ""}</span>
//                   </div>
//                 </div>

//                 {/* Status badges */}
//                 <div className="flex items-center gap-2">
//                   <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs
//         ${detail.is_shaped
//                       ? "border-emerald-200 bg-emerald-50 text-emerald-700"
//                       : "border-rose-200 bg-rose-50 text-rose-700"}`}>
//                     {detail.is_shaped ? (
//                       <CheckCircle2 className="w-4 h-4" />
//                     ) : (
//                       <XCircle className="w-4 h-4" />
//                     )}
//                     Shakllangan
//                   </span>

//                   <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs
//         ${detail.is_approved
//                       ? "border-emerald-200 bg-emerald-50 text-emerald-700"
//                       : "border-rose-200 bg-rose-50 text-rose-700"}`}>
//                     {detail.is_approved ? (
//                       <CheckCircle2 className="w-4 h-4" />
//                     ) : (
//                       <XCircle className="w-4 h-4" />
//                     )}
//                     Tasdiqlangan
//                   </span>
//                 </div>
//               </div>


//             </div>

//           </div>

//           {/* Products (yangi struktura) */}
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-slate-50 border-b border-slate-100">
//                   <TableHead className="text-center font-semibold">№</TableHead>
//                   <TableHead className="text-center font-semibold">Tovar nomi</TableHead>
//                   <TableHead className="text-center font-semibold">Tovar turi</TableHead>
//                   <TableHead className="text-center font-semibold">Model</TableHead>
//                   <TableHead className="text-center font-semibold">O‘lcham</TableHead>
//                   <TableHead className="text-center font-semibold">O‘lchov birligi</TableHead>
//                   <TableHead className="text-center font-semibold">Miqdori</TableHead>
//                   <TableHead className="text-center font-semibold">Tahlil soni</TableHead>
//                   <TableHead className="text-center font-semibold">Yakunlangan miqdor</TableHead>
//                   <TableHead className="text-center font-semibold">Narx</TableHead>
//                   <TableHead className="text-center font-semibold">Summa</TableHead>
//                   <TableHead className="text-center font-semibold">Izoh</TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {products.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={12} className="text-center py-8 text-slate-500">
//                       Список пуст
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   products.map((p, idx) => (
//                     <TableRow key={`${p.row_number ?? idx}-${idx}`} className="hover:bg-slate-50">
//                       <TableCell className="text-center">{p.row_number ?? idx + 1}</TableCell>
//                       <TableCell className="text-center">{nm(p.product)}</TableCell>
//                       <TableCell className="text-center">{nm(p.product_type)}</TableCell>
//                       <TableCell className="text-center">{nm(p.model)}</TableCell>
//                       <TableCell className="text-center">{nm(p.size)}</TableCell>
//                       <TableCell className="text-center">{nm(p.unit)}</TableCell>
//                       <TableCell className="text-center">{p.quantity ?? 0}</TableCell>
//                       <TableCell className="text-center">{p.analysis_quentity ?? 0}</TableCell>
//                       <TableCell className="text-center">{p.completed_quentity ?? 0}</TableCell>
//                       <TableCell className="text-center">{p.price ?? 0}</TableCell>
//                       <TableCell className="text-center">{p.summa ?? 0}</TableCell>
//                       <TableCell className="text-center">{p.description ?? ""}</TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>

//           {/* Signers bo‘sh bo‘lsa chiqmaydi; bo‘lsa xuddi oldingidek jadval qilib qo‘yishingiz mumkin */}
//         </>
//       )}
//     </section>
//   );
// };

// export default PriceAnalysisDetail;


/* eslint-disable react/no-unknown-property */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosAPI } from "@/services/axiosAPI";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/UI/table";
import { Button, Spin } from "antd";
import {
  ArrowLeft, CalendarDays, CheckCircle2, XCircle, User2, Search, Plus,
} from "lucide-react";
import { Input } from "@/components/UI/input";

/** === Types (API) === */
type IdName = { id?: string; name?: string };

type DetailSigner = {
  row_number: number;
  executer?: IdName;
  status_message?: string;
  description?: string;
  confirmation_date?: string;
  is_signing?: boolean;
};

type DetailProduct = {
  row_number?: number;
  product?: IdName;
  model?: IdName;
  product_type?: IdName;
  size?: IdName;
  unit?: IdName;
  price?: number;
  quantity?: number;
  summa?: number;
  description?: string;
  completed_quentity?: number;
  analysis_quentity?: number;
  [key: string]: any;
};

type DetailPayload = {
  id: string;
  number: string;
  date: string; // ISO
  is_approved: boolean;
  is_shaped: boolean;
  employee?: IdName;
  products: DetailProduct[];
  signers: DetailSigner[];
};

/** === Helpers === */
const fmt = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};
const nm = (v?: IdName | string) => (typeof v === "string" ? v : (v?.name ?? ""));

const StepBadge: React.FC<{ n: number; label: string; active?: boolean; done?: boolean }> = ({ n, label, active, done }) => {
  const base = "flex items-center gap-2";
  const dot = `inline-flex items-center justify-center w-7 h-7 rounded-full border text-sm
    ${active ? "bg-[#2563eb] text-white border-[#2563eb]" : done ? "bg-[#e2e8f0] text-slate-600 border-slate-300" : "bg-white text-slate-600 border-slate-300"}`;
  const text = `${active ? "text-slate-900 font-medium" : "text-slate-600"}`;
  return (
    <div className={base}>
      <span className={dot}>{n}</span>
      <span className={text}>{label}</span>
    </div>
  );
};

const PriceAnalysisDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<DetailPayload | null>(null);

  // Wizard step: 1=Tovarlar, 2=Murojaat xatini shakllantirish, 3=Kelishuvchilar
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step-1: search + selection
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set()); // by row_number (fallback to index)

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      let d: DetailPayload | undefined;

      // 1) /detail/{id}
      try {
        const r1 = await axiosAPI.get<any>(`price-analysis/detail/${encodeURIComponent(id)}`);
        const p1 = r1.data;
        d = Array.isArray(p1) ? p1[0] : (p1?.results?.[0] ?? p1);
      } catch { /* fallback */ }

      // 2) /detail/?id=...
      if (!d) {
        try {
          const r2 = await axiosAPI.get<any>("price-analysis/detail/", { params: { id } });
          const p2 = r2.data;
          const arr = Array.isArray(p2) ? p2 : p2?.results;
          d = Array.isArray(arr) ? (arr.find((x: any) => x?.id === id) || arr[0]) : p2;
        } catch { /* ignore */ }
      }

      // 3) /detail/ and find by id
      if (!d) {
        const r3 = await axiosAPI.get<any>("price-analysis/detail/");
        const p3 = r3.data;
        const arr = Array.isArray(p3) ? p3 : p3?.results;
        d = Array.isArray(arr) ? arr.find((x: any) => x?.id === id) : p3;
      }

      setDetail(d || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  // Derived
  const products = detail?.products ?? [];

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) =>
      [
        nm(p.product), nm(p.product_type), nm(p.model), nm(p.size), nm(p.unit),
        p.quantity, p.summa, p.price, p.description,
      ]
        .map((v) => String(v ?? "").toLowerCase())
        .some((txt) => txt.includes(s))
    );
  }, [products, q]);

  // Selection (by row_number fallback index)
  const keyFor = (p: DetailProduct, idx: number) => (p.row_number ?? idx);
  const allVisibleSelected = filtered.length > 0 && filtered.every((p, i) => picked.has(keyFor(p, i)));
  const someVisibleSelected = filtered.some((p, i) => picked.has(keyFor(p, i))) && !allVisibleSelected;

  // const toggleAllVisible = () => {
  //   setPicked(prev => {
  //     const next = new Set(prev);
  //     if (allVisibleSelected) {
  //       filtered.forEach((p, i) => next.delete(keyFor(p, i)));
  //     } else {
  //       filtered.forEach((p, i) => next.add(keyFor(p, i)));
  //     }
  //     return next;
  //   });
  // };
  const toggleOne = (p: DetailProduct, idx: number) => {
    const k = keyFor(p, idx);
    setPicked(prev => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  // Footer actions
  const onNext = () => setStep((s) => (s === 1 ? 2 : s === 2 ? 3 : 3));
  const onPrev = () => setStep((s) => (s === 3 ? 2 : 1));
  const onCancel = () => navigate(-1);

  return (
    <section className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm min-h-[calc(100vh-150px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-700">Narx tahlili</h2>
        <Button type="default" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
          Orqaga
        </Button>
      </div>

      {/* Meta bar (hujjat ma’lumoti) */}

      {/* Stepper */}
      <div className="mb-4 flex items-center gap-6">
        <StepBadge n={1} label="Tovarlar" active={step === 1} done={step > 1} />
        <div className="h-px flex-1 bg-slate-200" />
        <StepBadge n={2} label="Murojaat xatini shakllantirish" active={step === 2} done={step > 2} />
        <div className="h-px flex-1 bg-slate-200" />
        <StepBadge n={3} label="Kelishuvchilar" active={step === 3} />
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex justify-center items-center py-20"><Spin size="large" /></div>
      ) : !detail ? (
        <div className="text-center text-slate-500 py-10">Ma’lumot topilmadi</div>
      ) : (
        <>
          {/* STEP 1: Tovarlar */}
          {step === 1 && (
            <>
              {detail && (
                <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500">Hujjat raqami</div>
                      <div className="text-base font-semibold text-slate-800 truncate">№ {detail.number}</div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-500">Sana:</span>
                        <span className="font-medium">{fmt(detail.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User2 className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-500">Xodim:</span>
                        <span className="font-medium">{detail.employee?.name || ""}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs
                ${detail.is_shaped ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                        {detail.is_shaped ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        Shakllangan
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs
                ${detail.is_approved ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                        {detail.is_approved ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        Tasdiqlangan
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {/* toolbar */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-slate-500">Tovarlar - Qadam 1/3</div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      ref={searchRef}
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Поиск (Ctrl+F)"
                      className="h-9 w-[260px] pl-9"
                    />
                  </div>
                  <Button type="default" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tovarlarni to'ldirish
                  </Button>
                </div>
              </div>

              {/* table */}
              <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                <table className="w-max min-w-[1100px] text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr className="[&>th]:py-2 [&>th]:px-3 [&>th]:text-left [&>th]:font-medium">
                      <th className="w-12">N</th>
                      <th className="min-w-[180px]">Tovar nomi</th>
                      <th className="min-w-[160px]">Tovar turi</th>
                      <th className="min-w-[140px]">Model</th>
                      <th className="min-w-[140px]">O'lcham</th>
                      <th className="min-w-[140px]">O'lchov birligi</th>
                      <th className="min-w-[120px] text-right">Soni</th>
                      <th className="min-w-[120px] text-right">Narx</th>
                      <th className="min-w-[140px] text-right">Summa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-16 text-center text-slate-500">
                          Ruyhat mavjud emas
                        </td>
                      </tr>
                    ) : (
                      filtered.map((p, i) => {
                        const idx = i; // index in filtered
                        const k = keyFor(p, i);
                        const checked = picked.has(k);
                        return (
                          <tr key={`${k}-${i}`} className="border-t border-slate-200 hover:bg-slate-50">
                            <td className="py-2 px-3">{p.row_number ?? i + 1}</td>
                            <td className="py-2 px-3">{nm(p.product)}</td>
                            <td className="py-2 px-3">{nm(p.product_type)}</td>
                            <td className="py-2 px-3">{nm(p.model)}</td>
                            <td className="py-2 px-3">{nm(p.size)}</td>
                            <td className="py-2 px-3">{nm(p.unit)}</td>
                            <td className="py-2 px-3 text-right">{p.quantity ?? 0}</td>
                            <td className="py-2 px-3 text-right">{p.price ?? 0}</td>
                            <td className="py-2 px-3 text-right">{p.summa ?? 0}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* STEP 2: Murojaat xatini shakllantirish */}
          {step === 2 && (
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="mb-2 text-sm text-slate-500">Murojaat xatini shakllantirish — Qadam 2/3</div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs text-slate-500">Tanlangan tovarlar</div>
                  <div className="text-base font-semibold">{picked.size} ta</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs text-slate-500">Jami soni</div>
                  <div className="text-base font-semibold">
                    {Array.from(picked.values()).reduce((acc, k) => {
                      const item = products.find((p, i) => (p.row_number ?? i) === k);
                      return acc + (item?.quantity ?? 0);
                    }, 0)}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs text-slate-500">Jami summa</div>
                  <div className="text-base font-semibold">
                    {Array.from(picked.values()).reduce((acc, k) => {
                      const item = products.find((p, i) => (p.row_number ?? i) === k);
                      return acc + (item?.summa ?? 0);
                    }, 0)}
                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-600">
                Bu qadamda foydalanuvchiga suratdagi kabi xulosa / preview ko‘rsatish yoki “Shakllantirish” tugmasi bilan
                keyingi bosqichga o‘tish logikasini qo‘shishingiz mumkin. Hozircha bu yer “preview” sifatida ishlaydi.
              </div>
            </div>
          )}

          {/* STEP 3: Kelishuvchilar */}
          {step === 3 && (
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="mb-2 text-sm text-slate-500">Kelishuvchilar — Qadam 3/3</div>
              {detail.signers?.length ? (
                <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1">
                  {detail.signers.map((s) => {
                    const confirmed = !!s.confirmation_date;
                    const tone = confirmed
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-700";
                    return (
                      <span
                        key={s.row_number}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${tone}`}
                        title={s.description || ""}
                      >
                        <span className="font-medium">{nm(s.executer) || "—"}</span>
                        <span className="opacity-60">·</span>
                        <span>{s.status_message || "—"}</span>
                        {s.confirmation_date && (
                          <>
                            <span className="opacity-60">·</span>
                            <span>{fmt(s.confirmation_date)}</span>
                          </>
                        )}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-slate-500">Kelishuvchilar mavjud emas</div>
              )}
            </div>
          )}

          {/* Footer actions */}
          <div className="mt-6 flex items-center justify-between">
            <Button onClick={onCancel}>Bekor qilish</Button>
            <div className="flex items-center gap-2">
              {step > 1 && <Button onClick={onPrev}>Orqaga</Button>}
              <Button type="primary" onClick={onNext}>
                {step < 3 ? "Davom etish" : "Tugatish"}
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default PriceAnalysisDetail;
