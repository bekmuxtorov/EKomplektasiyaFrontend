/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import FileDropZoneSteps from './FileDropZoneSteps';
import { Search, X } from 'lucide-react';
import { EyeOutlined } from "@ant-design/icons";

interface IProductsStepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const CommericalOffersStep: React.FC<IProductsStepProps> = ({ formData, setFormData }) => {
  const [fileTr, setFileTr] = useState<File | null>(null);
  const [fileOrg, setFileOrg] = useState<File | null>(null);
  const [fileStat, setFileStat] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);

  const data = [
    {
      id: 220,
      name: "AHADBEK-AHAROBREK STROY MCHJ",
      inn: "308211886",
      kirish_sana: "04.09.2025",
      tk_sana: "04.09.2025",
      etkazib_sana: "17.09.2025 12:22:38",
      foydalanuvchi: "Ахмедов Дилмурод",
    },
    {
      id: 221,
      name: "XARID.UZEX.UZ NSO21350619",
      inn: "—",
      kirish_sana: "04.09.2025",
      tk_sana: "04.09.2025",
      etkazib_sana: "17.09.2025 16:26:23",
      foydalanuvchi: "Ахмедов Дилмурод",
    },
    {
      id: 222,
      name: "ALIQULOL XOLMAT JUMAYEVICH MCHJ",
      inn: "206713384",
      kirish_sana: "21.08.2025",
      tk_sana: "—",
      etkazib_sana: "17.09.2025 16:28:02",
      foydalanuvchi: "Ахмедов Дилмурод",
    },
  ];

  return (
    <>
      <div className="p-5 bg-white rounded-lg shadow-sm w-full">
        {/* --- BUTTON PANEL --- */}
        <div className="flex items-center gap-3 mb-4">
          {/* TK yuklash */}
          <button
            className="flex items-center gap-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-md px-4 py-2 hover:bg-blue-200 transition cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <span>TK yuklash</span>
          </button>

          {/* Checkbox + Mavjud TK yuklash */}
          <button
            onClick={() => setShowPriceModal(true)}
            className="flex items-center gap-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-md px-4 py-2 hover:bg-blue-200 transition cursor-pointer">
            <span>Mavjud TK yuklash</span>
          </button>

          {/* Tovarlarga biriktirish */}
          <button className="flex items-center gap-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-md px-4 py-2 hover:bg-blue-200 transition cursor-pointer">
            <span>Tovarlarga biriktirish</span>
          </button>

          {/* TKni ko‘rish */}
          <button className="flex items-center gap-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-md px-4 py-2 hover:bg-blue-200 transition cursor-pointer">
            <span>TKni ko‘rish</span>
          </button>
        </div>

        {/* --- TABLE --- */}
        <div className="border border-gray-200 rounded-md overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="border border-gray-200 p-2">
                  <input type="checkbox" className="w-4 h-4 accent-blue-500" />
                </th>
                <th className="border border-gray-200 p-2">N</th>
                <th className="border border-gray-200 p-2">Kirish sanasi</th>
                <th className="border border-gray-200 p-2">Tashkilot nomi</th>
                <th className="border border-gray-200 p-2">INN</th>
                <th className="border border-gray-200 p-2">TK sanasi</th>
                <th className="border border-gray-200 p-2">Tijoriy taklif</th>
                <th className="border border-gray-200 p-2">STAT</th>
                <th className="border border-gray-200 p-2">Org info</th>
                <th className="border border-gray-200 p-2">Xodimlar</th>
                <th className="border border-gray-200 p-2">Yetkazib berish turi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={11}
                  className="text-center py-10 text-gray-400"
                >
                  Narx tahlili mavjud emas
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg w-[500px] p-6 shadow-lg relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6 border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Tijoriy taklif yuklash oynasi
              </h2>
              <button
                onClick={() => setShowModal(false)}>
                <span className='cursor-pointer'>X</span>
              </button>
            </div>

            {/* FORM */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Kirish №</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Kirish sanasi</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Tashkilot</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">STIR</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  Yetkazib berish sharti
                </label>
                <select
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  Yetkazib berish muddati
                </label>
                <input
                  type="number"
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-blue-500"
                />
              </div>


              <div className="flex flex-col col-span-2">
                <label className="text-sm text-gray-600 mb-1">Org Info</label>
                <div className='w-full'>
                  <FileDropZoneSteps file={fileOrg} setFile={setFileOrg} />
                </div>
              </div>
              <div className="flex flex-col col-span-2">
                <label className="text-sm text-gray-600 mb-1">STAT</label>
                <div className='w-full'>
                  <FileDropZoneSteps file={fileStat} setFile={setFileStat} />
                </div>
              </div>

              <div className="flex flex-col col-span-2">
                <label className="text-sm text-gray-600 mb-1">
                  Tijoriy taklif faylini tanlang
                </label>
                <div className='w-full'>
                  <FileDropZoneSteps file={fileTr} setFile={setFileTr} />
                </div>
              </div>

            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="flex items-center gap-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-md px-4 py-2 hover:bg-blue-200 transition"
              >
                OK
              </button>
              <button
                onClick={() => setShowModal(false)}
                type="button"
                className="flex items-center gap-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-md px-4 py-2 hover:bg-gray-200 transition"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for "Mavjud TK yuklash" */}
      {showPriceModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowPriceModal(false)}
        >
          <div
            className="bg-white h-[90%] rounded-lg shadow-lg p-5 relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Mavjud narx tahlili
              </h2>
              <button
                onClick={() => setShowPriceModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center justify-end gap-2 mb-3">
              <div className="flex items-center gap-3">
                <button className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md border border-blue-200 transition cursor-pointer">
                  Yangilash
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск"
                  className="border rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-blue-500"
                />
                <Search
                  size={16}
                  className="absolute left-2.5 top-2.5 text-gray-400"
                />
              </div>
            </div>

            {/* Table (faqat jadval scroll bo‘ladi) */}
            <div className="flex-grow overflow-y-auto border rounded-md max-h-[calc(100%-160px)]">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="border-b">
                    <th className="py-2 px-3 font-medium text-gray-700">№</th>
                    <th className="py-2 px-3 font-medium text-gray-700">
                      Tashkilot nomi
                    </th>
                    <th className="py-2 px-3 font-medium text-gray-700">ИНН</th>
                    <th className="py-2 px-3 font-medium text-gray-700">
                      Kirish sanasi
                    </th>
                    <th className="py-2 px-3 font-medium text-gray-700">
                      TK sanasi
                    </th>
                    <th className="py-2 px-3 font-medium text-gray-700">
                      Etkazib berish sana
                    </th>
                    <th className="py-2 px-3 font-medium text-gray-700">
                      Jami summa
                    </th>
                    <th className="py-2 px-3 font-medium text-gray-700">
                      Foydalanuvchi
                    </th>
                    <th className="py-2 px-3 font-medium text-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-2 px-3">{item.id}</td>
                      <td className="py-2 px-3">{item.name}</td>
                      <td className="py-2 px-3">{item.inn}</td>
                      <td className="py-2 px-3">{item.kirish_sana}</td>
                      <td className="py-2 px-3">{item.tk_sana}</td>
                      <td className="py-2 px-3">{item.etkazib_sana}</td>
                      <td className="py-2 px-3">9000</td>
                      <td className="py-2 px-3">{item.foydalanuvchi}</td>
                      <td className="py-2 px-3">
                        <EyeOutlined className="text-[18px]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Fixed Button */}
            <div className="mt-4 pt-3 flex justify-end sticky bottom-0 bg-white">
              <button className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md border border-blue-200 transition cursor-pointer">
                Tanlash
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default CommericalOffersStep