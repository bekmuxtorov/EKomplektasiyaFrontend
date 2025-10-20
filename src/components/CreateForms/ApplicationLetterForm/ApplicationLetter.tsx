/* eslint-disable react/no-unknown-property */
import React, { useEffect, useMemo, useState } from "react";
import ApplicationLetterForm from "./ApplicationLetterForm";
import { Button } from "antd";
import { Plus, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { axiosAPI } from "@/services/axiosAPI";
import { useNavigate } from "react-router-dom";

type ApiItem = {
  id: string;
  number: string;
  date: string;      // ISO
  name: string;      // << Nomi
  employee: string;  // << Xodim
  is_shaped: boolean;
  is_approved: boolean;
};

type ApiResponse = {
  count: number;
  limit: number;
  offset: number;
  approved: number;
  unapproved: number;
  results: ApiItem[];
};

const fmt = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const ApplicationLetter: React.FC = () => {
  const [rows, setRows] = useState<ApiItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreateFormModalOpen, setIsCreateFormModalOpen] = useState<boolean>(false);
  const navigate = useNavigate(); // ⬅️ YANGI

  // API’dan olish
  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await axiosAPI.get<ApiResponse>("application-letter/list", {
        params: { limit: 20, offset: 0 },
      });
      setRows(res.data.results || []);
    } catch (e) {
      console.error("application-letter/list fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  // Qidiruv
  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        (r.number || "").toLowerCase().includes(q) ||
        (r.name || "").toLowerCase().includes(q) ||
        (r.employee || "").toLowerCase().includes(q) ||
        (r.date || "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <>
      {isCreateFormModalOpen ? (
        <ApplicationLetterForm
          isCreateFormModalOpen={isCreateFormModalOpen}
          setIsCreateFormModalOpen={setIsCreateFormModalOpen}
        />
      ) : (
        <div className="w-full">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-3 px-3 pb-3">
            <div className="flex items-center gap-2">
              <Button className="cursor-pointer" onClick={() => setIsCreateFormModalOpen(true)}>
                <Plus />
                Yaratish
              </Button>
              <Button onClick={fetchRows} disabled={loading}>
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {loading ? "Yuklanmoqda..." : "Yangilash"}
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
          <div className="mx-3 overflow-x-auto rounded-md border border-slate-200 bg-white">
            <table className="w-max min-w-[1000px] text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700">
                <tr className="[&>th]:py-2 [&>th]:px-5.5 [&>th]:text-left [&>th]:font-medium">
                  <th className="w-34">Sana</th>
                  <th className="w-30">Xujjat nomeri</th>
                  <th className="w-40">Nomi</th>               {/* name */}
                  <th className="w-44">Xodim</th>              {/* employee */}
                  <th className="w-44">Imzolovchi xodim</th>  {/* hozircha bo‘sh */}
                  <th className="w-28 text-center">Shakllangan</th> {/* is_shaped + is_approved (ikonlar) */}
                  <th className="w-34">Qabul qilish xolati</th>{/* hozircha bo‘sh */}
                  <th className="w-24">To'lov xolati</th>     {/* hozircha bo‘sh */}
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td className="py-10 text-center text-slate-500" colSpan={8}>
                      Ma’lumot topilmadi
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id}
                      onClick={() => navigate(`/appeal-letter/${r.id}`)}
                      className="border-t border-slate-200 hover:bg-slate-50">
                      <td className="py-2 px-3">{fmt(r.date)}</td>
                      <td className="py-2 px-3">{r.number}</td>
                      <td className="py-2 px-3">{r.name || ""}</td>
                      <td className="py-2 px-3">{r.employee || ""}</td>
                      <td className="py-2 px-3">{/* signatory */}</td>
                      {/* Shakllangan (ikkita indikator: is_shaped, is_approved) */}
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-center gap-3">
                          {/* Shakllangan */}
                          {r.is_shaped ? (
                            <CheckCircle2
                              className="w-5 h-5 inline-block text-emerald-500"
                              aria-label="Shakllangan"
                            />
                          ) : (
                            <XCircle
                              className="w-5 h-5 inline-block text-rose-500"
                              aria-label="Shakllanmagan"
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-center gap-3">
                          {/* Shakllangan */}
                          {r.is_approved ? (
                            <CheckCircle2
                              className="w-5 h-5 inline-block text-emerald-500"
                              aria-label="Shakllangan"
                            />
                          ) : (
                            <XCircle
                              className="w-5 h-5 inline-block text-rose-500"
                              aria-label="Shakllanmagan"
                            />
                          )}
                        </div>
                      </td>
                      {/* Hozircha bo'sh ustunlar */}
                      <td className="py-2 px-3">{/* accepted */}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplicationLetter;
