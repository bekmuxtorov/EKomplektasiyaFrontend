/* eslint-disable react/no-unknown-property */
import React, { useMemo, useState } from "react";
import {
  ClipboardList,
  FileText,
  Globe,
  BadgeDollarSign,
  Mail,
  FileSpreadsheet,
} from "lucide-react";

type SectionId =
  | "order"
  | "fishka"
  | "publish"
  | "price"
  | "money"
  | "contract";

/* Summary misol (keyinchalik prop yoki API) */
const summary = {
  kirishNo: "XOP-44-30",
  kirishSana: "18.10.2025 12:22:05",
  yuboruvchi: "Туманда буюртма яратувчи ходим",
};

/* Chapdagi bo‘limlar */
const SECTIONS: { id: SectionId; title: string; icon: any }[] = [
  { id: "order", title: "Буюртма ойнаси", icon: ClipboardList },
  { id: "fishka", title: "Усти хат ҳужжати (фишка)", icon: FileText },
  { id: "publish", title: "Сайтга жойлаштириш жараёни", icon: Globe },
  { id: "price", title: "Нарх таҳлили", icon: BadgeDollarSign },
  { id: "money", title: "Маблағ сўраб хат", icon: Mail },
  { id: "contract", title: "Шартнома", icon: FileSpreadsheet },
];

/* Bo‘lim kontentlari uchun soddalashtirilgan panellar */
const EmptyPanel: React.FC<{ title: string }> = ({ title }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
    {title} — маълумот ҳозирча йўқ
  </div>
);

/* “Буюртма ойнаси” ichida kichik bloklar: quick summary + bo‘limlar joyi */
const OrderPanel: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Quick Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <div className="text-[12px] uppercase tracking-wide text-slate-500">Кириш №</div>
          <div className="mt-1 font-semibold text-sky-700">{summary.kirishNo}</div>
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <div className="text-[12px] uppercase tracking-wide text-slate-500">Кириш санаси</div>
          <div className="mt-1 font-semibold text-slate-800">{summary.kirishSana}</div>
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <div className="text-[12px] uppercase tracking-wide text-slate-500">Республикадан жўнатувчи</div>
          <div className="mt-1 font-semibold text-slate-800">{summary.yuboruvchi}</div>
        </div>
      </div>

      {/* Bu yerga oldin tayyorlagan jadvallaringizni ulaysiz: 
          - Товарлар рўйхати
          - Келишувчилар
          - Ижрочилар
      */}
      <EmptyPanel title="Товарлар рўйхати" />
      {/* <ProductsTable /> */}
      {/* <Negotiators /> */}
      {/* <Executors /> */}
    </div>
  );
};

/* ====== ASOSIY SHELL LAYOUT (chap nav + markaz panel) ====== */
const CreativeWorkspace: React.FC = () => {
  const [active, setActive] = useState<SectionId>("order");

  const panel = useMemo(() => {
    switch (active) {
      case "order":
        return <OrderPanel />;
      case "fishka":
        return <EmptyPanel title="Усти хат ҳужжати (фишка)" />;
      case "publish":
        return <EmptyPanel title="Сайтга жойлаштириш жараёни" />;
      case "price":
        return <EmptyPanel title="Нарх таҳлили" />;
      case "money":
        return <EmptyPanel title="Маблағ сўраб хат" />;
      case "contract":
        return <EmptyPanel title="Шартнома" />;
      default:
        return null;
    }
  }, [active]);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex gap-4">
          {/* LEFT RAIL */}
          <aside className="sticky top-4 h-fit w-[260px] shrink-0 rounded-xl border border-slate-200 bg-white p-2">
            <div className="text-xs px-2 py-2 text-slate-500">БО‘ЛИМЛАР</div>
            <nav className="space-y-1">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const activeClass =
                  active === s.id
                    ? "bg-sky-600 text-white shadow-sm"
                    : "hover:bg-slate-50 text-slate-700";
                return (
                  <button
                    key={s.id}
                    onClick={() => setActive(s.id)}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 ${activeClass}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{s.title}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* MAIN PANEL */}
          <main className="min-h-[60vh] flex-1 rounded-xl border border-slate-200 bg-white p-4">
            {panel}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CreativeWorkspace;
