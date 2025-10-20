/* eslint-disable @typescript-eslint/no-explicit-any */
import { PriceAnalysisForm } from "@/components";
import { Input } from "@/components/UI/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "antd";
import { Plus, RefreshCw, Search } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { axiosAPI } from "@/services/axiosAPI";
import { useNavigate } from "react-router-dom";

type PriceAnalysisItem = {
  id: string;
  number: string;
  date: string;
  name: string;
  employee: string;
  is_shaped: boolean;
  is_approved: boolean; // API’da bor, lekin ko‘rsatmaymiz
};

type ApiResponse = {
  count: number;
  limit: number;
  offset: number;
  approved: number;
  unapproved: number;
  results: PriceAnalysisItem[];
};

const fmt = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const ITEMS_PER_PAGE = 20;

const PriceAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isCreateFormModalOpen, setIsCreateFormModalOpen] = useState(false);

  const [data, setData] = useState<PriceAnalysisItem[]>([]);
  const [currentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const getPriceAnalysisList = async () => {
    const res = await axiosAPI.get<ApiResponse>("price-analysis/list", {
      params: { limit: ITEMS_PER_PAGE, offset: (currentPage - 1) * ITEMS_PER_PAGE },
    });
    setData(res.data.results || []);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await getPriceAnalysisList();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return data;
    return data.filter((it) =>
      [it.number, it.date, it.name, it.employee]
        .filter(Boolean)
        .some((v) => v!.toString().toLowerCase().includes(q))
    );
  }, [data, searchTerm]);




  return (
    <>
      {isCreateFormModalOpen ? (
        <PriceAnalysisForm
          isCreateFormModalOpen={isCreateFormModalOpen}
          setIsCreateFormModalOpen={setIsCreateFormModalOpen}
        />
      ) : (
        <section className="min-h-[calc(100vh-150px)] p-6 bg-white">
          {/* Top */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsCreateFormModalOpen(true)}>
                <Plus /> Yaratish
              </Button>
              <Button onClick={handleRefresh} disabled={loading}>
                {loading ? (
                  <RefreshCw className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {loading ? "Yangilanmoqda..." : "Yangilash"
                }
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Qidirish (Ctrl+F)"
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 h-8 pl-9 text-sm border-slate-200"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white mt-6 rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-100">
                    <TableHead className="text-slate-700 font-semibold py-3 px-4 text-center">
                      №
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold py-3 px-4 text-center">
                      Nomer
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold py-3 px-4 text-center">
                      Sana
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold py-3 px-4 text-center">
                      Nomi
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold py-3 px-4 text-center">
                      Xodim
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold py-3 px-4 text-center">
                      Shakllaish xolati
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold py-3 px-4 text-center">
                      Tasdiqlanish xolati
                    </TableHead>
                  </TableRow>
                </TableHeader>


                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                        Ma’lumot topilmadi
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row, idx) => (
                      <TableRow
                        key={row.id}
                        onClick={() => navigate(`/price-analysis/${row.id}`)}
                        className="hover:bg-slate-50 cursor-pointer transition-all"
                      >
                        <TableCell className="text-center">{idx + 1}</TableCell>
                        <TableCell className="text-center">{row.number}</TableCell>
                        <TableCell className="text-center">{fmt(row.date)}</TableCell>
                        <TableCell className="text-center">{row.name}</TableCell>
                        <TableCell className="text-center">{row.employee}</TableCell>
                        <TableCell className="text-center">
                          {row.is_shaped ? (
                            <CheckCircle2 className="text-emerald-500 inline w-5 h-5" />
                          ) : (
                            <XCircle className="text-rose-500 inline w-5 h-5" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.is_approved ? (
                            <CheckCircle2 className="text-emerald-500 inline w-5 h-5" />
                          ) : (
                            <XCircle className="text-rose-500 inline w-5 h-5" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default PriceAnalysis;