/* eslint-disable react-hooks/exhaustive-deps */
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useEffect, useState } from 'react'
import { Label } from '@/components/UI/label';
import { Button, DatePicker, Input, Select } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import { axiosAPI } from '@/services/axiosAPI';
import { setRegions } from '@/store/infoSlice/infoSlice';
import dayjs from 'dayjs';
import { setProducts } from '@/store/productSlice/productSlice';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/UI/table';
import { CheckCircleOutlined } from "@ant-design/icons";
import { Download, Printer } from 'lucide-react';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import toast from 'react-hot-toast';
import { motion } from "framer-motion";
import { Modal } from "antd";
import FieldModal from '@/components/modal/FieldModal';

interface FilterData {
  start_date: string;
  end_date: string;
  region: string;
  warehouse: string;
  product: string;
  bar_code: string;
  product_type: string;
  model: string;
  size: string;
}

interface ProductInfo {
  id: string;
  name: string;
}

interface WarehouseItem {
  bar_code: string;
  product_code: string;
  product: ProductInfo;
  product_type: ProductInfo;
  model: ProductInfo;
  size: ProductInfo;
  unit: ProductInfo;
  initial_quantity: number;
  initial_summa: number;
  input_quantity: number;
  input_summa: number;
  output_quantity: number;
  output_summa: number;
  final_quantity: number;
  final_summa: number;
}

const { RangePicker } = DatePicker;

const ProductTurnOverReport: React.FC = () => {
  const [filterData, setFilterData] = React.useState<FilterData>({
    start_date: dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
    end_date: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
    region: '',
    warehouse: '',
    product: '',
    bar_code: '',
    product_type: '',
    model: '',
    size: '',
  });
  const [warehouses, setWarehouses] = React.useState<Array<{ id: string, name: string }>>([]);
  const [productsReport, setProductsReport] = React.useState<WarehouseItem[]>([]);
  const [handleDownloadModal, setHandleDownloadModal] = React.useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [fieldName, setFieldName] = useState<"size" | "product" | "product_type" | "model" | "">("");
  const { product_types, products, product_sizes, product_models } = useAppSelector(state => state.product)
  
  const { regions } = useAppSelector(state => state.info);
  const dispatch = useAppDispatch();

  const handlePrintPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tovarlar Kirimi Hisoboti</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #1E56A0;
              padding-bottom: 15px;
            }
            .header h1 {
              color: #1E56A0;
              margin: 0;
              font-size: 24px;
            }
            .date-range {
              margin: 15px 0;
              padding: 10px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #1E56A0; 
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>E-KOMPLEKTATSIYA</h1>
            <h2>Tovarlar Kirimi Hisoboti</h2>
            ${filterData.start_date || filterData.end_date
        ? `
              <div class="date-range">
                <strong>Sana oralig'i:</strong> 
                ${filterData.start_date ? filterData.start_date : "Sanadan"
        } - 
                ${filterData.end_date ? filterData.end_date : "Sanagacha"}
              </div>
            `
        : ""
      }
          </div>
          
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Viloyat</th>
                <th>Ombor</th>
                <th>Shtrix kod</th>
                <th>Tovar</th>
                <th>Tovar turi</th>
                <th>Model</th>
                <th>O'lcham</th>
                <th>O'lchov birligi</th>
                <th>Bosh qoldiq soni</th>
                <th>Bosh qoldiq summa</th>
                <th>Kirim soni</th>
                <th>Kirim summa</th>
                <th>Chiqim soni</th>
                <th>Chiqim summa</th>
                <th>Yakuniy qoldiq soni</th>
                <th>Yakuniy qoldiq summa</th>
              </tr>
            </thead>
            <tbody>
              ${productsReport.map(
        (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${regions.find(r => r.id === filterData.region)?.name}</td>
                  <td>${warehouses.find(w => w.id === filterData.warehouse)?.name}</td>
                  <td>${item.bar_code}</td>
                  <td>${item.product?.name}</td>
                  <td>${item.product_type?.name}</td>
                  <td>${item.model?.name}</td>
                  <td>${item.size?.name}</td>
                  <td>${item.unit?.name}</td>
                  <td>${item.initial_quantity}</td>
                  <td>${item.initial_summa.toLocaleString("uz-UZ")} UZS</td>
                  <td>${item.input_quantity}</td>
                  <td>${item.input_summa.toLocaleString("uz-UZ")} UZS</td>
                  <td>${item.output_quantity}</td>
                  <td>${item.output_summa.toLocaleString("uz-UZ")} UZS</td>
                  <td>${item.final_quantity}</td>
                  <td>${item.final_summa.toLocaleString("uz-UZ")} UZS</td>
                </tr>
              `
      )
        .join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Jami: ${productsReport.length} ta yozuv</p>
            <p>Chop etilgan: ${new Date().toLocaleDateString(
          "uz-UZ"
        )} ${new Date().toLocaleTimeString("uz-UZ")}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const getRegions = async () => {
    if (regions.length === 0) {
      try {
        const response = await axiosAPI.get("/regions/list/?order_by=2");
        if (response.status === 200) dispatch(setRegions(response.data));
      } catch (error) {
        console.log(error)
      }
    }
  }

  const getWarehouses = async () => {
    try {
      const response = await axiosAPI.get(`/warehouses/list/?order_by=2&region=${regions.find(r => r.id === filterData.region)?.name || ''}`);
      if (response.status === 200) setWarehouses(response.data);
    } catch (error) {
      console.log(error)
    }
  }

  const getProducts = async () => {
    try {
      const response = await axiosAPI.get(`/products/list/?order_by=2`);
      if (response.status === 200) {
        dispatch(setProducts(response.data.results));
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Get product turnover report based on filterData
  const getProductTurnoverReport = async () => {
    try {
      const response = await axiosAPI.post(`remainders/turnover-report/`, {
        start_date: filterData.start_date || undefined,
        end_date: filterData.end_date || undefined,
        region: filterData.region || undefined,
        warehouse: filterData.warehouse || undefined,
        product: filterData.product || undefined,
        bar_code: filterData.bar_code || undefined,
        product_type: filterData.product_type || undefined,
        model: filterData.model || undefined,
        size: filterData.size || undefined,
      });
      if (response.status === 200) {
        setProductsReport(response.data);
        setOpen(true); // ✅ modalni ochamiz
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getRegions();
    getProducts();
  }, [])

  useEffect(() => {
    getWarehouses();
  }, [filterData.region])

  return (
    <>
      <div className="bg-slate-50 flex animate-in fade-in duration-500">
        <div className="w-full flex flex-col">
          {/* Filter */}
          <div className="bg-white border-b border-slate-200 mb-2">
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id='panel1a-header'
              >
                <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Filter</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                  {/* Date Range */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="startDate">Sana</Label>
                    <RangePicker
                        placeholder={['Boshlanish sanasi', 'Tugash sanasi']}
                        showTime
                        format="DD-MM-YYYY HH:mm:ss"
                        value={[
                          filterData.start_date ? dayjs(filterData.start_date, 'YYYY-MM-DD HH:mm:ss') : null,
                          filterData.end_date ? dayjs(filterData.end_date, 'YYYY-MM-DD HH:mm:ss') : null,
                        ]}
                        onChange={(dates) => {
                          if (!dates || !dates[0] || !dates[1]) {
                            setFilterData(prev => ({
                              ...prev,
                              start_date: '',
                              end_date: '',
                            }));
                            return;
                          }

                          setFilterData(prev => ({
                            ...prev,
                            start_date: dates[0]!.format('YYYY-MM-DD HH:mm:ss'),
                            end_date: dates[1]!.format('YYYY-MM-DD HH:mm:ss'),
                          }));
                        }}
                      />

                  </div>
                  {/* Region */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="endDate">Viloyat</Label>
                    <div className="flex">
                      <Select
                        placeholder="Viloyatni tanglang"
                        allowClear 
                        value={filterData.region || null}
                        onChange={(value) => setFilterData({ ...filterData, region: value })}
                        className="flex-1"
                      >
                        {regions.map(region => (
                          <Select.Option key={region.id} value={region.id}>{region.name}</Select.Option>
                        ))}
                      </Select>
                      <Button
                        variant="outlined"
                        className="rounded-l-none border-l-0"
                        onClick={() => setFilterData(prev => ({ ...prev, region: "" }))}
                        disabled={!filterData.region}
                      >
                        X
                      </Button>
                    </div>
                  </div>
                  {/* Warehouse */}
                  <div className="flex flex-col gap-2">
                      <Label htmlFor="warehouse">Ombor</Label>
                      <div className="flex">
                        <Select
                          placeholder="Omborni tanglang"
                          allowClear 
                          value={filterData.warehouse || null}
                          onChange={(value) => setFilterData({ ...filterData, warehouse: value })}
                          className="flex-1" // ✅ Select komponentiga kenglik berish
                        >
                          {warehouses.map(warehouse => (
                            <Select.Option key={warehouse.id} value={warehouse.id}>{warehouse.name}</Select.Option>
                          ))}
                        </Select>
                        <Button
                          variant="outlined"
                          className="rounded-l-none border-l-0"
                          onClick={() => {
                            setFilterData(prev => ({ ...prev, warehouse: "" }));
                          }}
                          disabled={!filterData.warehouse} 
                        >
                          X
                        </Button>
                      </div>
                    </div>
                  {/* Product */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="bar_code">Shtrix kod</Label>
                    <div className="flex">
                      <Input
                      placeholder="Shtrix kodni kiriting"
                      value={filterData.bar_code || ''}
                      onChange={(e) => setFilterData({ ...filterData, bar_code: e.target.value })}
                    />
                      <Button
                          variant="outlined"
                          className="rounded-l-none border-l-0"
                          onClick={() => {
                            setFilterData(prev => ({ ...prev, bar_code: "" }));
                          }}
                          disabled={!filterData.bar_code}

                        >
                          X
                      </Button>
                    </div>
                   
                  </div>
                  <div className="flex flex-col gap-2">
                      <Label htmlFor="product_type">Tovar turi</Label>

                      <div className="flex">
                        <Button
                          className="w-full rounded-r-none"
                          onClick={() => setFieldName("product_type")}
                        >
                          <span
                            className={`${
                              filterData.product_type ? "text-gray-800" : "text-gray-400"
                            }`}
                          >
                            {filterData.product_type
                              ? product_types.results.find(
                                  (t) => t.id === filterData.product_type
                                )?.name
                              : "Tanlang"}
                          </span>
                        </Button>

                        <Button
                          variant="outlined"
                          className="rounded-l-none border-l-0"
                          onClick={() => {
                            setFilterData(prev => ({ ...prev, product_type: "" }));
                          }}
                          disabled={!filterData.product_type}

                        >
                          X
                        </Button>
                      </div>

                      {fieldName === "product_type" && (
                        <FieldModal
                          field_name={fieldName}
                          selectedItem={{ id: filterData.product_type, name: "" }}
                          setSelectedItem={(newItem) => {
                            if (newItem)
                              setFilterData((prev) => ({ ...prev, product_type: newItem.id }));
                            setFieldName("");
                          }}
                          
                        />
                      )}
                    </div>


                  {/* Model */}
                  <div className="flex flex-col gap-2 ">
                      <Label htmlFor="model">Model</Label>
                      <div className="flex">
                      <Button className="w-full" onClick={() => setFieldName("model")}><span className={`${filterData.model ? "text-gray-800" : "text-gray-400"}`}>{filterData.model ? product_models.results.find((t) => t.id === filterData.model)?.name : "Tanlang"}</span>
                      </Button>
                      <Button
                          variant="outlined"
                          className="rounded-l-none border-l-0"
                          onClick={() => {
                            setFilterData(prev => ({ ...prev, model: "" }));
                          }}
                          disabled={!filterData.model}

                        >
                          X
                      </Button>
                      </div>
                      
                      {fieldName === "model" && (
                          <FieldModal
                              field_name={fieldName}
                              selectedItem={{ id: filterData.model, name: "" }}
                              setSelectedItem={newItem => {
                                  if (newItem)
                                      setFilterData(prev => ({ ...prev, model: newItem.id }));
                                  setFieldName("");
                              }}
                              selectedProductTypeId={product_types.results.find(item => item.id === filterData.product_type)?.name}
                          />
                      )}
                  </div>
                  <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                        <Label htmlFor="size">O'lcham</Label>
                        <div className="flex">
                        <Button className="w-full" onClick={() => setFieldName("size")}><span className={`${filterData.size ? "text-gray-800" : "text-gray-400"}`}>{filterData.size ? product_sizes.results.find((t) => t.id === filterData.size)?.name : "Tanlang"}</span>
                        </Button>
                        <Button
                          variant="outlined"
                          className="rounded-l-none border-l-0"
                          onClick={() => {
                            setFilterData(prev => ({ ...prev, size: "" }));
                          }}
                          disabled={!filterData.size}
                          
                        >
                          X
                        </Button>
                        </div>
                        {fieldName === "size" && (
                            <FieldModal
                                field_name="size"
                                selectedItem={{ id: filterData.size, name: "" }}
                                setSelectedItem={newItem => {
                                    if (newItem) setFilterData(prev => ({ ...prev, size: newItem.id }))
                                    setFieldName("")
                                }}
                                selectedProductTypeId={product_types.results.find(item => item.id === filterData.product_type)?.name}
                                selectedModelId={product_models.results.find(item => item.id === filterData.model)?.name}
                            />
                        )}
                  </div>
                  <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                      <Label htmlFor="product">Tovar</Label>
                      <div className="flex">
                        <Button disabled={!filterData.product_type} className="w-full" onClick={() => setFieldName("product")}><span className={`${filterData.product ? "text-gray-800" : "text-gray-400"}`}>{filterData.product ? products.results.find((t) => t.id === filterData.product)?.name : "Tanlang"}</span>
                        </Button>
                        <Button
                            variant="outlined"
                            className="rounded-l-none border-l-0"
                            onClick={() => {
                              setFilterData(prev => ({ ...prev, product: "" }));
                            }}
                             disabled={!filterData.product}

                          >
                            X
                        </Button>
                      </div>
                      
                      {fieldName === "product" && (
                          <FieldModal
                              field_name="product"
                              selectedItem={{ id: filterData.product, name: "" }}
                              setSelectedItem={newItem => {
                                  if (newItem) setFilterData(prev => ({ ...prev, product: newItem.id }))
                                  setFieldName("")
                              }}
                              selectedProductTypeId={product_types.results.find(item => item.id === filterData.product_type)?.name}
                              selectedModelId={product_models.results.find(item => item.id === filterData.model)?.name}
                              selectedSizeId={product_sizes.results.find(item => item.id === filterData.size)?.name}
                          />
                      )
                      }
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>

          {/* Table */}
          <div className="p-4">
            <div className='flex items-center gap-4 mb-4'>
              <Button type="primary" onClick={() => { getProductTurnoverReport() }}>
                Shakllantirish
              </Button>
              <Button type='default' onClick={handlePrintPDF}>
                <Printer size={16} />
                Chop etish
              </Button>
              <Button type='default' onClick={() => setHandleDownloadModal(true)}>
                <Download size={16} />
                Yuklab olish
              </Button>
            </div>
            <div className="overflow-y-auto border border-gray-300 rounded max-h-[calc(100vh-250px)]">
              <Table className="border-collapse w-full">
                <TableHeader>
                  <TableRow className='bg-gray-200 sticky top-0 z-10'>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">#</TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">Viloyat</TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">Ombor</TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">Shtrix kod</TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">Tovar va materiallar</TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">Tovar turi</TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">Model</TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">O'lcham</TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">O'lchov birligi</TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">
                      Bosh qoldiq soni
                    </TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">
                      Bosh qoldiq summa
                    </TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">Kirim soni</TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">Kirim summa</TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">Chiqim soni</TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">Chiqim summa</TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">Ohirgi qoldiq soni</TableCell>
                    <TableCell className="border border-gray-300 text-center text-slate-700 font-semibold p-3">Ohirgi qoldiq summa</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsReport.length > 0 ? productsReport.map((item, index) => (
                    <TableRow key={index} className='bg-slate-50 hover:bg-slate-100 transition-colors group'>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {regions.find(region => region.id === filterData.region)?.name}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {warehouses.find(w => w.id === filterData.warehouse)?.name || ""}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {item.bar_code}
                      </TableCell>
                      <TableCell className="border border-gray-300 whitespace-normal break-words max-w-[500px]">
                        {item.product?.name}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {item.product_type?.name}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center whitespace-normal break-words max-w-[150px]">
                        {item.model?.name}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {item.size?.name}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {item.unit?.name}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {item.initial_quantity}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {item.initial_summa.toLocaleString()} UZS
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {item.input_quantity}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {item.input_summa.toLocaleString()} UZS
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {item.output_quantity}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {item.output_summa.toLocaleString()} UZS
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {item.final_quantity}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-3 text-center">
                        {item.final_summa.toLocaleString()} UZS
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell className="border border-gray-300 p-3 font-bold text-lg" colSpan={17} align="center">
                        Mahsulot aylanma hisobotini shakillantirish uchun "Shakillantirish" tugmasini bosing
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {
        /* Download modal */
        handleDownloadModal && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Yuklab olish</h2>

              <div className="space-y-3">
                {/* Fayl nomi */}
                <div className="flex flex-col gap-2">
                  <Label>Fayl nomi</Label>
                  <input
                    id="download-filename"
                    type="text"
                    defaultValue={`TovarlarQoldiq_${dayjs().format("YYYY-MM-DD_HH:mm")}`}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Fayl nomini kiriting"
                  />
                </div>
                {/* Fayl turi */}
                <div className="flex flex-col gap-2">
                  <Label>Fayl turi</Label>
                  <select
                    id="download-extension"
                    defaultValue="excel"
                    className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="xlsx">Excel (.xlsx)</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>

              {/* Tugmalar */}
              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={() => setHandleDownloadModal(false)}>Bekor qilish</Button>
                <Button
                  type="primary"
                  onClick={() => {
                    if (!productsReport || productsReport.length === 0) {
                      window.alert("Avval hisobotni shakillantiring.");
                      return;
                    }

                    const extSelect = document.getElementById("download-extension") as HTMLSelectElement | null;
                    const ext = (extSelect?.value || "pdf").toLowerCase();

                    const regionName = regions.find(r => r.id === filterData.region)?.name || "";
                    const warehouseName = warehouses.find(w => w.id === filterData.warehouse)?.name || "";

                    // Excel (.xlsx)

                    const downloadXLSX = async () => {
                      const workbook = new ExcelJS.Workbook();
                      const worksheet = workbook.addWorksheet("Hisobot");

                      // 🔹 Title 1-qator
                      worksheet.mergeCells(1, 1, 1, 15);
                      const titleCell = worksheet.getCell("A1");
                      titleCell.value = "Товар айланма хисоботи";
                      titleCell.font = { name: "Arial", size: 16, bold: true };
                      titleCell.alignment = { horizontal: "center", vertical: "middle" };

                      // 🔹 Title 2-qator (sana alohida qator)
                      // 🔹 Title 2-qator (sana alohida qator)
                      worksheet.mergeCells(2, 1, 2, 15);
                      const dateCell = worksheet.getCell("A2");

                      // Ikkala sanani formatlab chiqarish
                      const start = filterData.start_date
                        ? dayjs(filterData.start_date).format("YYYY-MM-DD HH:mm")
                        : "-";
                      const end = filterData.end_date
                        ? dayjs(filterData.end_date).format("YYYY-MM-DD HH:mm")
                        : "-";

                      dateCell.value = `Сана оралиғи: ${start} — ${end}`;
                      dateCell.font = { name: "Arial", size: 14, bold: true };
                      dateCell.alignment = { horizontal: "center", vertical: "middle" };
                      // worksheet.mergeCells(2, 1, 2, 15);
                      // const dateCell = worksheet.getCell("A2");
                      // dateCell.value = `Сана: ${dayjs().format("YYYY-MM-DD HH:mm")}`;
                      // dateCell.font = { name: "Arial", size: 16, bold: true };
                      // dateCell.alignment = { horizontal: "center", vertical: "middle" };

                      // 🔹 Header row (3-qator)
                      const headers = [
                        "№", "Viloyat", "Ombor", "Shtrix kod", "Tovar turi", "Model", "O‘lcham",
                        "Tovar", "Kod", "O‘lchov birligi", "Qoldiq miqdori", "Narxi",
                        "Summasi", "Oxirgi kirim sana", "Jami kun"
                      ];
                      worksheet.addRow(headers);

                      // 🔹 Header style
                      worksheet.getRow(3).font = { bold: true };
                      worksheet.getRow(3).alignment = { horizontal: "center" };
                      worksheet.getRow(3).eachCell((cell) => {
                        cell.fill = {
                          type: "pattern",
                          pattern: "solid",
                          fgColor: { argb: "1E56A0" },
                        };
                        cell.font = { color: { argb: "FFFFFF" }, bold: true };
                        cell.border = {
                          top: { style: "thin" },
                          left: { style: "thin" },
                          bottom: { style: "thin" },
                          right: { style: "thin" },
                        };
                      });

                      // 🔹 Rows (data)
                      productsReport.forEach((item, idx) => {
                        worksheet.addRow([
                          idx + 1,
                          regionName,
                          warehouseName,
                          item.bar_code || "",
                          item.product?.name || "",
                          item.product_type?.name || "",
                          item.model?.name || "",
                          item.size?.name || "",
                          item.unit?.name || "",
                          item.initial_quantity || 0,
                          item.initial_summa || 0,
                          item.input_quantity || 0,
                          item.input_summa || 0,
                          item.output_quantity || 0,
                          item.output_summa || 0,
                          item.final_quantity || 0,
                          item.final_summa || 0,
                        ]);
                      });

                      // 🔹 Column widths
                      worksheet.columns.forEach((col, index) => {
                        if (index === 0) col.width = 4;   // № (juda kichkina)
                        else if (index === 1) col.width = 20; // Viloyat kengroq
                        else if (index === 2) col.width = 25; // Ombor kengroq
                        else col.width = 20; // qolganlari standart
                      });

                      // 🔹 Export
                      const buffer = await workbook.xlsx.writeBuffer();
                      const blob = new Blob([buffer], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      });
                      saveAs(blob, `TovarlarQoldiq_${dayjs().format("YYYY-MM-DD_HH-mm")}.xlsx`);
                    };




                    // PDF — print dialog orqali
                    const buildHTMLDocument = () => `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tovarlar Kirimi Hisoboti</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #1E56A0;
              padding-bottom: 15px;
            }
            .header h1 {
              color: #1E56A0;
              margin: 0;
              font-size: 24px;
            }
            .date-range {
              margin: 15px 0;
              padding: 10px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #1E56A0; 
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>E-KOMPLEKTATSIYA</h1>
            <h2>Tovarlar Kirimi Hisoboti</h2>
            ${filterData.start_date || filterData.end_date
                        ? `
              <div class="date-range">
                <strong>Sana oralig'i:</strong> 
                ${filterData.start_date ? filterData.start_date : "Sanadan"
                        } - 
                ${filterData.end_date ? filterData.end_date : "Sanagacha"}
              </div>
            `
                        : ""
                      }
          </div>
          
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Viloyat</th>
                <th>Ombor</th>
                <th>Shtrix kod</th>
                <th>Tovar</th>
                <th>Tovar turi</th>
                <th>Model</th>
                <th>O'lcham</th>
                <th>O'lchov birligi</th>
                <th>Bosh qoldiq soni</th>
                <th>Bosh qoldiq summa</th>
                <th>Kirim soni</th>
                <th>Kirim summa</th>
                <th>Chiqim soni</th>
                <th>Chiqim summa</th>
                <th>Yakuniy qoldiq soni</th>
                <th>Yakuniy qoldiq summa</th>
              </tr>
            </thead>
            <tbody>
              ${productsReport.map(
                        (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${regions.find(r => r.id === filterData.region)?.name}</td>
                  <td>${warehouses.find(w => w.id === filterData.warehouse)?.name}</td>
                  <td>${item.bar_code}</td>
                  <td>${item.product?.name}</td>
                  <td>${item.product_type?.name}</td>
                  <td>${item.model?.name}</td>
                  <td>${item.size?.name}</td>
                  <td>${item.unit?.name}</td>
                  <td>${item.initial_quantity}</td>
                  <td>${item.initial_summa.toLocaleString("uz-UZ")} UZS</td>
                  <td>${item.input_quantity}</td>
                  <td>${item.input_summa.toLocaleString("uz-UZ")} UZS</td>
                  <td>${item.output_quantity}</td>
                  <td>${item.output_summa.toLocaleString("uz-UZ")} UZS</td>
                  <td>${item.final_quantity}</td>
                  <td>${item.final_summa.toLocaleString("uz-UZ")} UZS</td>
                </tr>
              `
                      )
                        .join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Jami: ${productsReport.length} ta yozuv</p>
            <p>Chop etilgan: ${new Date().toLocaleDateString(
                          "uz-UZ"
                        )} ${new Date().toLocaleTimeString("uz-UZ")}</p>
          </div>
        </body>
      </html>
    `;

                    if (ext === "pdf") {
                      const printWindow = window.open("", "_blank");
                      if (!printWindow) return;
                      printWindow.document.write(buildHTMLDocument());
                      printWindow.document.close();
                      printWindow.print();

                      toast.success("✅ PDF yuklab olindi!");
                    } else if (ext === "xlsx") {
                      downloadXLSX().then(() => {
                        toast.success("✅ Excel yuklab olindi!");
                      });
                    }

                    setHandleDownloadModal(false);
                  }}
                >
                  Yuklab olish
                </Button>
              </div>
            </div>
          </div>
        )
      }

      <Modal
        open={open}
        onOk={() => setOpen(false)}
        cancelButtonProps={{ style: { display: "none" } }}
        closable={false}
        centered
        width={450}
        footer={[
          <Button
            key="ok"
            type="primary"
            style={{
              borderRadius: "8px",
              padding: "6px 25px",
              backgroundColor: "blue",
              color: "#fff",
              border: "none",
            }}
            onClick={() => setOpen(false)}
          >
            OK
          </Button>,
        ]}
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.45)", // 🔹 yarim shaffof qora fon
        }}
        bodyStyle={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "220px",
          backgroundColor: "#52c41a", // 💚 butun modal yashil
          borderRadius: "12px",
          color: "white", // matn va ikon oq
        }}
      >
        {/* 🔹 Icon animatsiya bilan */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1.1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CheckCircleOutlined style={{ fontSize: "70px", color: "white" }} />
        </motion.div>

        {/* 🔹 Matn animatsiya bilan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            marginTop: "20px",
            fontSize: "20px",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Hisobot muvaffaqiyatli shakillantirildi
        </motion.div>
      </Modal>

    </>
  )
}

export default ProductTurnOverReport