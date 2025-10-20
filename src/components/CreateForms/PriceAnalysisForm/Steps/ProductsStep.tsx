/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from '@/components/UI/input';
import { Button } from 'antd';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table';
import { PackagePlus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useRef, useState, useMemo } from 'react'

interface IProductsStepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const ProductsStep: React.FC<IProductsStepProps> = ({ formData, setFormData }) => {
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const columns = [
    { title: "№", dataIndex: "index", key: "index" },
    { title: "Buyurtma turi", dataIndex: "order_type", key: "order_type" },
    { title: "Tovar nomi", dataIndex: "product_name", key: "product_name" },
    { title: "Tovar turi", dataIndex: "product_type", key: "product_type" },
    { title: "Model", dataIndex: "model", key: "model" },
    { title: "O'lcham", dataIndex: "size", key: "size" },
    { title: "O'lchov birligi", dataIndex: "unit", key: "unit" },
    { title: "TK soni", dataIndex: "tk_number", key: "tk_number" },
    { title: "Miqdori", dataIndex: "quantity", key: "quantity" },
    { title: "Narx tahlil qilinganlar soni", dataIndex: "price_analysis_count", key: "price_analysis_count" },
    { title: "Hujjat manzili", dataIndex: "document_link", key: "document_link" },
    { title: "Buyurtma bo'yicha izoh", dataIndex: "order_comment", key: "order_comment" },
  ];

  const tableData = [
    { index: 1, order_type: "Oddiy", product_name: "Mahsulot A", product_type: "Tur 1", model: "Model X", size: "L", unit: "dona", tk_number: "TK123", quantity: 100, price_analysis_count: 5, document_link: "http://example.com/doc1", order_comment: "Tez yetkazib berish kerak" },
    { index: 2, order_type: "Tezkor", product_name: "Mahsulot B", product_type: "Tur 2", model: "Model Y", size: "M", unit: "dona", tk_number: "TK456", quantity: 50, price_analysis_count: 3, document_link: "http://example.com/doc2", order_comment: "Maxsus paketlash" },
    { index: 3, order_type: "Oddiy", product_name: "Mahsulot C", product_type: "Tur 1", model: "Model Z", size: "S", unit: "dona", tk_number: "TK789", quantity: 200, price_analysis_count: 8, document_link: "http://example.com/doc3", order_comment: "Yangi mijoz uchun" },
    { index: 4, order_type: "Maxsus", product_name: "Mahsulot D", product_type: "Tur 3", model: "Model A1", size: "XL", unit: "dona", tk_number: "TK101", quantity: 30, price_analysis_count: 2, document_link: "http://example.com/doc4", order_comment: "Tekshiruv talab etiladi" },
    { index: 5, order_type: "Oddiy", product_name: "Mahsulot E", product_type: "Tur 2", model: "Model B2", size: "L", unit: "dona", tk_number: "TK102", quantity: 120, price_analysis_count: 6, document_link: "http://example.com/doc5", order_comment: "Standart buyurtma" },
    { index: 6, order_type: "Tezkor", product_name: "Mahsulot F", product_type: "Tur 1", model: "Model C3", size: "M", unit: "dona", tk_number: "TK103", quantity: 75, price_analysis_count: 4, document_link: "http://example.com/doc6", order_comment: "Urgent" },
    { index: 7, order_type: "Oddiy", product_name: "Mahsulot G", product_type: "Tur 4", model: "Model D4", size: "S", unit: "dona", tk_number: "TK104", quantity: 40, price_analysis_count: 1, document_link: "http://example.com/doc7", order_comment: "Zaxirada mavjud" },
    { index: 8, order_type: "Maxsus", product_name: "Mahsulot H", product_type: "Tur 3", model: "Model E5", size: "M", unit: "dona", tk_number: "TK105", quantity: 15, price_analysis_count: 7, document_link: "http://example.com/doc8", order_comment: "O'lcham tekshiriladi" },
    { index: 9, order_type: "Oddiy", product_name: "Mahsulot I", product_type: "Tur 2", model: "Model F6", size: "L", unit: "dona", tk_number: "TK106", quantity: 300, price_analysis_count: 10, document_link: "http://example.com/doc9", order_comment: "Massoviy buyurtma" },
    { index: 10, order_type: "Tezkor", product_name: "Mahsulot J", product_type: "Tur 1", model: "Model G7", size: "S", unit: "dona", tk_number: "TK107", quantity: 20, price_analysis_count: 2, document_link: "http://example.com/doc10", order_comment: "Yetkazish tez" },
    { index: 11, order_type: "Oddiy", product_name: "Mahsulot K", product_type: "Tur 4", model: "Model H8", size: "XL", unit: "dona", tk_number: "TK108", quantity: 60, price_analysis_count: 3, document_link: "http://example.com/doc11", order_comment: "Kafolat shartlari bor" },
    { index: 12, order_type: "Maxsus", product_name: "Mahsulot L", product_type: "Tur 3", model: "Model I9", size: "M", unit: "dona", tk_number: "TK109", quantity: 10, price_analysis_count: 1, document_link: "http://example.com/doc12", order_comment: "Namuna bilan tekshirish" },
    { index: 13, order_type: "Oddiy", product_name: "Mahsulot M", product_type: "Tur 2", model: "Model J10", size: "L", unit: "dona", tk_number: "TK110", quantity: 90, price_analysis_count: 5, document_link: "http://example.com/doc13", order_comment: "Tez-tez so'raladi" },
    { index: 14, order_type: "Tezkor", product_name: "Mahsulot N", product_type: "Tur 1", model: "Model K11", size: "S", unit: "dona", tk_number: "TK111", quantity: 5, price_analysis_count: 0, document_link: "http://example.com/doc14", order_comment: "Yangi dizayn" },
    { index: 15, order_type: "Oddiy", product_name: "Mahsulot O", product_type: "Tur 4", model: "Model L12", size: "M", unit: "dona", tk_number: "TK112", quantity: 250, price_analysis_count: 12, document_link: "http://example.com/doc15", order_comment: "Omadli chegirma" },
    { index: 16, order_type: "Maxsus", product_name: "Mahsulot P", product_type: "Tur 3", model: "Model M13", size: "XL", unit: "dona", tk_number: "TK113", quantity: 8, price_analysis_count: 2, document_link: "http://example.com/doc16", order_comment: "Maxsus rangi" },
    { index: 17, order_type: "Oddiy", product_name: "Mahsulot Q", product_type: "Tur 2", model: "Model N14", size: "L", unit: "dona", tk_number: "TK114", quantity: 140, price_analysis_count: 6, document_link: "http://example.com/doc17", order_comment: "Standart yetkazib berish" },
    { index: 18, order_type: "Tezkor", product_name: "Mahsulot R", product_type: "Tur 1", model: "Model O15", size: "S", unit: "dona", tk_number: "TK115", quantity: 35, price_analysis_count: 3, document_link: "http://example.com/doc18", order_comment: "Zudlik bilan" },
    { index: 19, order_type: "Oddiy", product_name: "Mahsulot S", product_type: "Tur 4", model: "Model P16", size: "M", unit: "dona", tk_number: "TK116", quantity: 70, price_analysis_count: 4, document_link: "http://example.com/doc19", order_comment: "Tashqi qadoqlash" },
    { index: 20, order_type: "Maxsus", product_name: "Mahsulot T", product_type: "Tur 3", model: "Model Q17", size: "L", unit: "dona", tk_number: "TK117", quantity: 12, price_analysis_count: 1, document_link: "http://example.com/doc20", order_comment: "Ishlab chiqarish muddatini tekshirish" },
    { index: 21, order_type: "Oddiy", product_name: "Mahsulot U", product_type: "Tur 2", model: "Model R18", size: "S", unit: "dona", tk_number: "TK118", quantity: 55, price_analysis_count: 2, document_link: "http://example.com/doc21", order_comment: "Mijoz so'rovi" },
    { index: 22, order_type: "Tezkor", product_name: "Mahsulot V", product_type: "Tur 1", model: "Model S19", size: "M", unit: "dona", tk_number: "TK119", quantity: 45, price_analysis_count: 5, document_link: "http://example.com/doc22", order_comment: "Favqulodda buyurtma" },
    { index: 23, order_type: "Oddiy", product_name: "Mahsulot W", product_type: "Tur 4", model: "Model T20", size: "XL", unit: "dona", tk_number: "TK120", quantity: 95, price_analysis_count: 7, document_link: "http://example.com/doc23", order_comment: "Sezilarli talab" },
    { index: 24, order_type: "Maxsus", product_name: "Mahsulot X", product_type: "Tur 3", model: "Model U21", size: "L", unit: "dona", tk_number: "TK121", quantity: 22, price_analysis_count: 2, document_link: "http://example.com/doc24", order_comment: "Xususiy talablar" },
    { index: 25, order_type: "Oddiy", product_name: "Mahsulot Y", product_type: "Tur 2", model: "Model V22", size: "M", unit: "dona", tk_number: "TK122", quantity: 160, price_analysis_count: 9, document_link: "http://example.com/doc25", order_comment: "Doimiy mijoz" },
    { index: 26, order_type: "Tezkor", product_name: "Mahsulot Z", product_type: "Tur 1", model: "Model W23", size: "S", unit: "dona", tk_number: "TK1234", quantity: 28, price_analysis_count: 1, document_link: "http://example.com/doc26", order_comment: "Tezkor yetkazish" },
    { index: 27, order_type: "Oddiy", product_name: "Mahsulot AA", product_type: "Tur 4", model: "Model X24", size: "L", unit: "dona", tk_number: "TK125", quantity: 110, price_analysis_count: 6, document_link: "http://example.com/doc27", order_comment: "Mavjud zaxira" },
    { index: 28, order_type: "Maxsus", product_name: "Mahsulot AB", product_type: "Tur 3", model: "Model Y25", size: "XL", unit: "dona", tk_number: "TK126", quantity: 6, price_analysis_count: 0, document_link: "http://example.com/doc28", order_comment: "Yagona partiya" },
    { index: 29, order_type: "Oddiy", product_name: "Mahsulot AC", product_type: "Tur 2", model: "Model Z26", size: "M", unit: "dona", tk_number: "TK127", quantity: 85, price_analysis_count: 4, document_link: "http://example.com/doc29", order_comment: "O'rtacha talab" },
    { index: 30, order_type: "Tezkor", product_name: "Mahsulot AD", product_type: "Tur 1", model: "Model A27", size: "S", unit: "dona", tk_number: "TK128", quantity: 18, price_analysis_count: 2, document_link: "http://example.com/doc30", order_comment: "Urgent - loyiha" },
    { index: 31, order_type: "Oddiy", product_name: "Mahsulot AE", product_type: "Tur 4", model: "Model B28", size: "L", unit: "dona", tk_number: "TK129", quantity: 130, price_analysis_count: 11, document_link: "http://example.com/doc31", order_comment: "Chegirma bilan" },
    { index: 32, order_type: "Maxsus", product_name: "Mahsulot AF", product_type: "Tur 3", model: "Model C29", size: "M", unit: "dona", tk_number: "TK130", quantity: 9, price_analysis_count: 1, document_link: "http://example.com/doc32", order_comment: "Spetsifikatsiya kerak" },
    { index: 33, order_type: "Oddiy", product_name: "Mahsulot AG", product_type: "Tur 2", model: "Model D30", size: "XL", unit: "dona", tk_number: "TK131", quantity: 210, price_analysis_count: 14, document_link: "http://example.com/doc33", order_comment: "Katta partiya" },
  ];

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page when searching
    const search = value.trim().toLowerCase();
    console.log(search);
  };

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchValue.trim()) return tableData;

    return tableData.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchValue.toLowerCase())
      )
    );
  }, [tableData, searchValue]);

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <>
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-medium text-gray-900'>Tovarlar</h3>
          <div className='flex items-center gap-4'>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Qidirish (Ctrl+F)"
                ref={searchInputRef}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64 h-8 pl-9 text-sm border-slate-200"
              />
            </div>
            <Button type="primary">
              <PackagePlus />
              Tovarlarni to'ldirish
            </Button>
          </div>
        </div>

        <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transform transition-all hover:shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-700'>
          <div className='max-h-[40vh] sm:max-h-[60vh] md:max-h-[80vh] lg:max-h-[90vh] overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-100">
                  {columns.map((column) => (
                    <TableHead className="text-slate-700 font-semibold py-3 px-4" key={column.key}>
                      {column.title}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length ? (
                  currentData.map((item, index) => (
                    <TableRow key={startIndex + index}>
                      <TableCell>
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>{item.order_type}</TableCell>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.product_type}</TableCell>
                      <TableCell>{item.model}</TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.tk_number}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.price_analysis_count}</TableCell>
                      <TableCell>{item.document_link}</TableCell>
                      <TableCell>{item.order_comment}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                      Ma'lumotlar topilmadi
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
            {/* Left side - Items info */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Jami {totalItems} ta, {startIndex + 1}-{Math.min(endIndex, totalItems)} ko'rsatilmoqda
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sahifada:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Right side - Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Oldingi
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="px-3 py-1 text-sm text-gray-500">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(page as number)}
                          className={`px-3 py-1 text-sm border rounded ${currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Next button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keyingi
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductsStep