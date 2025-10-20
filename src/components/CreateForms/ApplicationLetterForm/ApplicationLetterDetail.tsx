import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosAPI } from "@/services/axiosAPI";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/UI/table";
import { Button, Spin } from "antd";
import { ArrowLeft, CalendarDays, User2, Hash, CheckCircle2, XCircle } from "lucide-react";

/** Helper types */
type Named = { id?: string; name?: string } | string | undefined;

type DetailProduct = {
  row_number: number;
  product?: Named;
  model?: Named;
  product_type?: Named;
  size?: Named;
  unit?: Named;
  price?: number | string;
  quantity?: number | string;
  summa?: number | string;
  description?: string;
  completed_quentity?: number | string;
  analysis_quentity?: number | string;
};

type DetailSigner = {
  row_number: number;
  executer?: Named;
  status_message?: string;
  description?: string;
  confirmation_date?: string;
  is_signing?: boolean;
};

type DetailPayload = {
  id: string;
  number: string;
  date: string;
  is_approved: boolean;
  is_shaped: boolean;
  employee?: Named;
  products: DetailProduct[];
  signers: DetailSigner[];
};

const fmt = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

// object yoki string bo‘lishi mumkin bo‘lgan maydonni ko‘rsatish
const nm = (v?: Named) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v?.name ?? "";
};

const ApplicationLetterDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<DetailPayload | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      let d: DetailPayload | undefined;

      // 1) /detail/{id}
      try {
        const r1 = await axiosAPI.get<any>(`application-letter/detail/${encodeURIComponent(id)}`);
        const p1 = r1.data;
        d = Array.isArray(p1) ? p1[0] : (p1?.results?.[0] ?? p1);
      } catch { }

      // 2) /detail/?id=...
      if (!d) {
        try {
          const r2 = await axiosAPI.get<any>("application-letter/detail/", { params: { id } });
          const p2 = r2.data;
          const arr = Array.isArray(p2) ? p2 : p2?.results;
          d = Array.isArray(arr) ? (arr.find((x: any) => x?.id === id) || arr[0]) : p2;
        } catch { }
      }

      // 3) /detail/ va ichidan topish
      if (!d) {
        const r3 = await axiosAPI.get<any>("application-letter/detail/");
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

  const products = detail?.products || [];

  return (
    <section className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm min-h-[calc(100vh-150px)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-700">Murojat xati</h2>
        <Button type="default" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
          Orqaga
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      ) : !detail ? (
        <div className="text-center text-slate-500 py-10">Ma’lumot topilmadi</div>
      ) : (
        <>
          {/* Header / Meta (title uslubida) */}
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  Hujjat raqami
                </div>
                <h1 className="text-md font-semibold text-slate-800 mt-1 truncate">
                  № {detail.number || "-"}
                </h1>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500">Sana:</span>
                  <span className="font-medium">{fmt(detail.date) || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User2 className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500">Xodim:</span>
                  <span className="font-medium">{nm(detail.employee) || "-"}</span>
                </div>
              </div>

              <div className="flex gap-2">
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



          {/* Products jadvali */}
          <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-100">
                  <TableHead className="text-center font-semibold">№</TableHead>
                  <TableHead className="text-center font-semibold">Tovar</TableHead>
                  <TableHead className="text-center font-semibold">Model</TableHead>
                  <TableHead className="text-center font-semibold">Tovar turi</TableHead>
                  <TableHead className="text-center font-semibold">O‘lcham</TableHead>
                  <TableHead className="text-center font-semibold">O‘lchov birligi</TableHead>
                  <TableHead className="text-center font-semibold">Narx</TableHead>
                  <TableHead className="text-center font-semibold">Miqdori</TableHead>
                  <TableHead className="text-center font-semibold">Summa</TableHead>
                  <TableHead className="text-center font-semibold">Izoh</TableHead>
                  <TableHead className="text-center font-semibold">Bajarilgan miqdor</TableHead>
                  <TableHead className="text-center font-semibold">Tahlil miqdori</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-slate-500">
                      Malumotlar mavjud emas
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p, i) => (
                    <TableRow key={i} className="hover:bg-slate-50">
                      <TableCell className="text-center">{p.row_number ?? i + 1}</TableCell>
                      <TableCell className="text-center">{nm(p.product)}</TableCell>
                      <TableCell className="text-center">{nm(p.model)}</TableCell>
                      <TableCell className="text-center">{nm(p.product_type)}</TableCell>
                      <TableCell className="text-center">{nm(p.size)}</TableCell>
                      <TableCell className="text-center">{nm(p.unit)}</TableCell>
                      <TableCell className="text-center">{p.price ?? ""}</TableCell>
                      <TableCell className="text-center">{p.quantity ?? ""}</TableCell>
                      <TableCell className="text-center">{p.summa ?? ""}</TableCell>
                      <TableCell className="text-center">{p.description ?? ""}</TableCell>
                      <TableCell className="text-center">{p.completed_quentity ?? ""}</TableCell>
                      <TableCell className="text-center">{p.analysis_quentity ?? ""}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Signers (agar bo‘lsa) */}
          {!!detail.signers?.length && (
            <div className="mb-4 overflow-x-auto rounded-md border border-slate-200 bg-white">
              <table className="w-max min-w-[820px] text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-700">
                  <tr className="[&>th]:py-2 [&>th]:px-3 [&>th]:text-left [&>th]:font-medium">
                    <th>№</th>
                    <th>Imzolovchi xodim</th>
                    <th>Holat</th>
                    <th>Tasdiqlangan sana</th>
                    <th>Izoh</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.signers.map((s) => (
                    <tr key={s.row_number} className="border-t border-slate-200">
                      <td className="py-2 px-3">{s.row_number}</td>
                      <td className="py-2 px-3">{nm(s.executer) || "—"}</td>
                      <td className="py-2 px-3">{s.status_message || "—"}</td>
                      <td className="py-2 px-3">{s.confirmation_date ? fmt(s.confirmation_date) : ""}</td>
                      <td className="py-2 px-3">{s.description || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ApplicationLetterDetail;
