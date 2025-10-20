/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/UI/input';
import { FilePlus2, Plus, Search, Trash, Pencil } from 'lucide-react';
import { axiosAPI } from '@/services/axiosAPI';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { Button, Modal, message, Select, Radio, Table,Input as AntInput } from 'antd';
const { TextArea } = AntInput;
import {
  EyeOutlined, DownloadOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileImageOutlined, FileTextOutlined,
} from "@ant-design/icons";
import { toast } from 'react-toastify';
import { useAppSelector } from '@/store/hooks/hooks';
import FileDropZone from '@/components/FileDropZone';

import FilePreviewModal from "@/components/files/FilePreviewModal";
import { arrayBufferToFile, inferMimeFromExt } from "@/utils/file_preview";
import FilePreviewer from '@/components/files/FilePreviewer';
import webSocketService from "@/services/webSocket";


function capitalizeWords(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const parseEimzoDate = (s?: string | null) => {
  if (!s) return null;
  const cleaned = s.trim().replace(/\./g, "-");
  const [d, t = "00:00:00"] = cleaned.split(/\s+/);
  const [Y, M, D] = (d || "").split("-").map(n => parseInt(n, 10));
  const [h = 0, m = 0, sec = 0] = (t || "").split(":").map(n => parseInt(n, 10));
  if ([Y, M, D].some(Number.isNaN)) return null;
  return new Date(Y, (M || 1) - 1, D || 1, h, m, sec);
};

const isExpired = (validTo?: string | null) => {
  const dt = parseEimzoDate(validTo);
  return dt ? dt.getTime() < Date.now() : false;
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}


interface IdName {
  id: string;
  name: string;
}

interface Product {
  row_number: number;
  product: IdName;
  model: IdName;
  product_type: IdName;
  size: IdName;
  unit: IdName;
  quantity: number;
  order_type: IdName;
  description: string;
}

interface Executor {
  row_number: number;
  executor: IdName;
  executor_type: IdName;
  status_message: IdName;
  answer_type:IdName
  description: string;
  confirmation_date:string;
}

interface OrderDetail {
  id: string;
  exit_number: string;
  exit_date: string;
  type_document_for_filter: IdName;
  application_status_district: IdName;
  confirmation_date: string;
  is_approved: boolean;
  user: string;
  description: string;
  from_district: IdName;
  sender_from_district: IdName;
  to_region: IdName;
  recipient_region: IdName;
  from_region: IdName;
  sender_from_region: IdName;
  to_district: IdName;
  recipient_district: IdName;
  products: Product[];
  executors: Executor[];
  for_purpose: "signing" |'for_agreement';

}

interface FileData {
  raw_number: string;
  user: string;
  file_name: string;
  extension: string;
  date: string;
}


interface DocumentFormData {
  selectedDocumentType: string;
  filename: string;
  extension: string;
  fileBinary: string;
}

interface CertificateRaw {
  disk: string;
  path: string;
  name: string;
  alias: string;
}

interface CertificateParsed extends CertificateRaw {
  cn?: string;
  firstName?: string;
  lastName?: string;
  validFrom?: string;
  validTo?: string;
}

interface CertificateDetails {
  plugin: "pfx";
  name: "load_key";
  arguments: string[];
}


const ComplektatsiyaOrderSining: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  console.log(orderData, 'wae12312')
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileData[]>([]);
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [selectedFileMeta, setSelectedFileMeta] = useState<FileData | null>(null);
  const [messageFile, setMessageFile] = useState<File | null>(null);
  const [fileUploadModal, setFileUploadModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentTypes, setDocumentTypes] = useState<IdName[]>([]);
  const [documentFormData, setDocumentFormData] = useState<DocumentFormData>({
      selectedDocumentType: '',
      filename: '',
      extension: '',
      fileBinary: ''
  });
  const fetchDocumentTypesList = useCallback(async () => {
      try {
        const response = await axiosAPI.get('enumerations/document_types');
        setDocumentTypes(response.data);
      } catch (error) {
        console.error('Error fetching document types:', error);
        message.error('Hujjat turlarini olishda xatolik yuz berdi!');
      }
  }, []);
  const { currentUserInfo } = useAppSelector(state => state.info);
  const [modalOpen, setModalOpen] = useState(false);
  const [radioValue, setRadioValue] = useState("Розиман");
  const [comment, setComment] = useState("");
  const [selectedCertRow, setSelectedCertRow] = useState<CertificateParsed | null>(null);
  const [messageFileBinary, setMessageFileBinary] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<CertificateParsed[]>([]);
  const [keyID, setKeyID] = useState("")
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateDetails | null>(null);
  const [eImzoOpen, setEImzoOpen] = useState(false);
  
  const [signingData, setSigningData] = useState<{
      document_name: string;
      id: string;
      data: any;
      number:number;
    }>({
      document_name: "ЗаявкаПоКомплектация",
      number:0,
      id: id ?? "",
      data: ""
    });
  
  const parseAlias = (alias: string) => {
    const info: Record<string, string> = {};
    alias.split(",").forEach((part) => {
      const [key, value] = part.split("=");
      if (key && value) info[key.trim().toLowerCase()] = value.trim();
    });
    return {
      cn: capitalizeWords(info["cn"]) || "",
      firstName: capitalizeWords(info["name"]) || "",
      lastName: capitalizeWords(info["surname"]) || "",
      validFrom: info["validfrom"] || "",
      validTo: info["validto"] || "",
    };
  };




  const handleModalOpen = () => {
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setRadioValue("Розиман");
    setComment("");
  };

  // Saqlash funksiyasini qo'shing
  const handleSave = async () => {
    try {
        if (!orderData) return;
        const response = await axiosAPI.post(`/sale-orders/update/${orderData.id}`, {
          ...orderData,
          products: orderData.products.map(p => ({
            ...p,
            product: p.product || "",
            model: p.model?.id,
            size: p.size?.id,
            unit: p.unit?.id,
            quantity: p.quantity,
            description: p.description,
            order_type: p.order_type?.id,
            product_type: p.product_type?.id,
            row_number: p.row_number,
          })),
          executors: orderData.executors.map(e => ({
            ...e,
            executor: e.executor.id,
            executor_type: e.executor_type?.id || e.executor_type,
            description: e.description,
            answer_type: e.answer_type?.id,
            status_message:e.status_message?.id
          })),
        })
        if (response.status === 200) {
          toast.success("Buyurtma muvaffaqiyatli yangilandi!");
          fetchOrderDetail();
        }
        
      }catch (err: any) {
        console.error("Yangilashda xatolik:", err);
        toast.error(err.response?.data?.error || "Buyurtmani yangilashda xatolik yuz berdi!");
    }
    setModalOpen(false);
  };
  
  

  

  const handleView = async (f: FileData) => {
        try {
          setSelectedFileMeta(f);
          const res = await axiosAPI.get(
            `sale-orders/${id}/file/${f.raw_number}`,
            { responseType: "arraybuffer" }
          );
          const suggestedName =
            f.file_name ||
            `${orderData?.exit_number || "file"}-${f.raw_number}.${f.extension}`;
          const mime =
            inferMimeFromExt(suggestedName) ||
            inferMimeFromExt(f.extension) ||
            "application/octet-stream";
          setPreviewFile(arrayBufferToFile(res.data, suggestedName, mime));
          setPreviewOpen(true);
        } catch (e) {
          console.error(e);
          toast("Faylni ochib bo‘lmadi", { type: "error" });
        }
  };


  const handleDownloadFile = async (f: FileData) => {
        try {
          const res = await axiosAPI.get(
            `sale-orders/${id}/file/${f.raw_number}`,
            { responseType: "blob" }
          );
          const url = URL.createObjectURL(res.data as Blob);
          const a = document.createElement("a");
          a.href = url;
          a.download =
            f.file_name ||
            `${orderData?.exit_number || "file"}-${f.raw_number}.${f.extension}`;
          a.click();
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error(e);
          toast("Yuklab olishda xatolik", { type: "error" });
        }
  };


  const handleCancel = () => {
    setOpen(false);
  };

  const fetchOrderDetail = useCallback(async () => {
    if (!id) return;
    try {
      const response = await axiosAPI.get(`sale-orders/detail/${id}`);
      setOrderData(response.data);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // 🟢 Fayllarni olish
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axiosAPI.get(`sale-orders/${id}/files/list`);
        if (Array.isArray(response.data)) {
          setFiles(response.data);
        } else {
          console.error("Kutilmagan format:", response.data);
        }
      } catch (error) {
        console.error("Fayllarni olishda xato:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMessageFile = async () => {
              try {
                const response = await axiosAPI.get(
                  `sale-orders/${id}/order-file/`
                );
                const fileUrl = response.data.file_url;
                const fileName = fileUrl.split("/").pop() || "file";
                const fileExt = (fileName.split(".").pop() || "").toLowerCase();
                setSigningData((prev) => ({
                  ...prev,
                  number: fileName.split(".docm")[0],
                }));
                
                const mime =
                  inferMimeFromExt(fileName) ||
                  inferMimeFromExt(fileExt) ||
                  "application/octet-stream";
        
                const res = await fetch(fileUrl);
                const arrayBuffer = await res.arrayBuffer();
                setMessageFileBinary(arrayBufferToBase64(arrayBuffer))
                setMessageFile(arrayBufferToFile(arrayBuffer, fileName, mime));
              } catch (error) {
                console.error("Message file error:", error);
              }
    };

    if (id) {
      fetchFiles();
      fetchMessageFile();
    }
  }, [id]);

  const formatDate = (iso: string): string => {
    const date = new Date(iso);
    return date.toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 📁 Fayl turiga qarab icon va rang qaytaruvchi funksiya
  const getFileIcon = (fileName: any) => {
    const ext = fileName.split(".").pop().toLowerCase();

    switch (ext) {
      case "pdf":
        return { icon: <FilePdfOutlined />, color: "text-red-500", bg: "bg-red-50" };
      case "doc":
      case "docx":
        return { icon: <FileWordOutlined />, color: "text-blue-500", bg: "bg-blue-50" };
      case "xls":
      case "xlsx":
        return { icon: <FileExcelOutlined />, color: "text-green-500", bg: "bg-green-50" };
      case "jpg":
      case "jpeg":
      case "png":
        return { icon: <FileImageOutlined />, color: "text-yellow-500", bg: "bg-yellow-50" };
      default:
        return { icon: <FileTextOutlined />, color: "text-gray-500", bg: "bg-gray-100" };
    }
  };

  const signingDocument = useCallback(async () => {
      try {
        const response = await axiosAPI.post("signing/upload", signingData)
        if (response.status === 200) {
          toast.success("Hujjat imzolandi");
          console.log(response)
        }
      } catch (error: any) {
        toast.error(error.response.data.error)
      }
  }, [signingData])

  useEffect(() => {
    webSocketService.connect(
      "wss://127.0.0.1:64443/service/cryptapi",
      (msg) => {
        try {
          const parsed = JSON.parse(msg);
          if (parsed.certificates) {
            const mapped = parsed.certificates.map((c: CertificateRaw) => ({
              ...c,
              ...parseAlias(c.alias),
            }));
            setCertificates(mapped);
          } else if (parsed.keyId) {
            setKeyID(parsed.keyId);
          } else if (parsed.pkcs7_64) {
            setSigningData(prev => ({
              ...prev,
              data: parsed
            }))
          }
        } catch (error) {
          console.error("WebSocket parse error:", error);
        }
      }
    );

    webSocketService.sendMessage(JSON.stringify({ 'name': 'apikey', 'arguments': ['null', 'E0A205EC4E7B78BBB56AFF83A733A1BB9FD39D562E67978CC5E7D73B0951DB1954595A20672A63332535E13CC6EC1E1FC8857BB09E0855D7E76E411B6FA16E9D', 'localhost', '96D0C1491615C82B9A54D9989779DF825B690748224C2B04F500F370D51827CE2644D8D4A82C18184D73AB8530BB8ED537269603F61DB0D03D2104ABF789970B', '127.0.0.1', 'A7BCFA5D490B351BE0754130DF03A068F855DB4333D43921125B9CF2670EF6A40370C646B90401955E1F7BC9CDBF59CE0B2C5467D820BE189C845D0B79CFC96F', 'test.e-imzo.uz', 'DE783306B4717AFE4AE1B185E1D967C265AA397A35D8955C7D7E38A36F02798AA62FBABE2ABA15C888FE2F057474F35A5FC783D23005E4347A3E34D6C1DDBAE5', 'test.e-imzo.local', 'D56ABC7F43A23466D9ADB1A2335E7430FCE0F46B0EC99B578D554333245FC071357AE9E7E2F75F96B73AEEE7E0D61AE84E414F5CD795D8B6484E5645CAF958FC'] }
    ))
  }, []);

  useEffect(() => {
    if (keyID && messageFileBinary) {
      webSocketService.sendMessage(
        JSON.stringify({ 'plugin': 'pkcs7', 'name': 'create_pkcs7', 'arguments': [messageFileBinary, keyID, 'no'] })
      )
    }
  }, [keyID, messageFileBinary])

  const handleSelectCertificate = () => {
    if (selectedCertificate) {
      webSocketService.sendMessage(JSON.stringify(selectedCertificate));
    }
  };

  useEffect(() => {
    if (signingData.data) {
      signingDocument()
    }
  }, [signingData.data, signingDocument])

  const handleFileAttach = useCallback(async () => {

    if (!file) {
      console.log('❌ Fayl tanlanmagan');
      message.error('Iltimos, fayl tanlang!');
      return;
    }

    if (!documentFormData.selectedDocumentType) {
      console.log('❌ Hujjat turi tanlanmagan');
      message.error('Iltimos, hujjat turini tanlang!');
      return;
    }

    if (!orderData?.id) {
      console.log('❌ Order ID topilmadi');
      message.error('Buyurtma maʼlumoti topilmadi!');
      return;
    }

    const filename = file.name;
    const extension = file.name.split('.').pop() || '';

    console.log('📤 Yuklash boshlandi...', { filename, extension });

    const params = {
      id: orderData.id,
      file_name: filename,
      extension: extension,
      file_type: "ЗаявкаДокументПоРайон"
    };

    try {
      const arrayBuffer = await file.arrayBuffer();
      const binary = new Uint8Array(arrayBuffer);
      
      console.log('📡 Serverga soʻrov yuborilmoqda...');
      
      const response = await axiosAPI.post(`sale-orders/files/create`, binary, {
        params,
        headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
      });


      if (response.status === 200) {
        console.log('✅ Fayl muvaffaqiyatli yuklandi');
        
        await Promise.all([fetchOrderDetail(), fetchDocumentTypesList()]);
        
        // Fayllar ro'yxatini yangilash
        setFiles(prev => {
          const exists = prev.some(f => (f.file_name || "").toLowerCase() === filename.toLowerCase());
          if (exists) {
            toast("Bu fayl allaqachon biriktirilgan", { type: "warning" });
            return prev;
          }
          return [...prev, {
            raw_number: (prev.length + 1).toString(),
            user: currentUserInfo?.id || "",
            file_name: filename,
            extension: extension,
            date: new Date().toISOString()
          }];
        });

        // Formani tozalash
        setFile(null);
        setDocumentFormData({
          selectedDocumentType: '',
          filename: '',
          extension: '',
          fileBinary: ''
        });
        
        toast("Fayl muvaffaqiyatli yuklandi! ✅", { type: "success" });
        setFileUploadModal(false);
      }
    } catch (error: any) {
      console.error('❌ Fayl yuklashda xatolik:', error);
      console.error('Xato tafsilotlari:', error.response?.data);
      message.error(`Fayl yuklashda xatolik: ${error.response?.data?.message || error.message}`);
    }
  }, [file, orderData?.id, documentFormData.selectedDocumentType, fetchOrderDetail, fetchDocumentTypesList, currentUserInfo]);
  
  useEffect(() => {
    Promise.all([fetchOrderDetail(), fetchDocumentTypesList()]);
  }, [fetchOrderDetail, fetchDocumentTypesList]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-red-600 text-xl">Malumotlar topilmadi</div>
      </div>
    );
  }

  console.log(orderData.for_purpose)

  return (
    <>

      <div className="min-h-screen py-2 px-2 bg-white">
        <div className="max-w-8xl mx-auto bg-white">

          {orderData.for_purpose === "signing" ?  (
            <div className="p-6 bg-gray-50 rounded-lg shadow-sm mb-8 relative">
                <Button
                    onClick={() => {
                      setEImzoOpen(true);
                      webSocketService.sendMessage(
                        JSON.stringify({ plugin: "pfx", name: "list_all_certificates" })
                      );
                    }}
                    style={{ position: "absolute", top: 30, left: 30 }}
                  >
                    (QR code) tasdiqlash E-IMZO
                  </Button>
                  {messageFile && (
                    <div className="w-full h-[80vh] flex flex-col">
                      <div className="flex-1 overflow-auto">
                        <FilePreviewer file={messageFile} />
                      </div>
                    </div>
                  )}
              </div>
            ) : (
                <>
              <div className="p-6 bg-gray-50 rounded-lg shadow-sm mb-8 relative">
                <Button type="primary" onClick={handleModalOpen}>
                  Kelishish
                </Button>
              </div>

              <Modal
                open={modalOpen}
                onCancel={handleModalClose}
                footer={null}
                title="Kelishish haqida"
                width={500}
              >
                <div className="space-y-4">
                    <TextArea
                      rows={4}
                      placeholder="Izoh kiriting..."
                      value={comment}
                      onChange={(e) => {
                        const newComment = e.target.value;
                        setOrderData(prev => {
                          if (!prev) return null;
                          const updatedExecutors = prev.executors.map(emp =>
                            emp.executor?.id === currentUserInfo?.employee.id
                              ? { ...emp, description: newComment }
                              : emp
                          );
                          return {
                            ...prev,
                            executors: updatedExecutors
                          };
                        });
                        setComment(newComment);
                      }}
                    />
                  <Radio.Group
                    onChange={(e) => {
                      const statusValue = e.target.value;

                      const statusMapping: { [key: string]: IdName } = {
                        "Розиман": { id: "Розиман", name: "Roziman" },
                        "РозиЭмасман": { id: "РозиЭмасман", name: "Rozi emasman" }
                      };

                      setOrderData(prev => {
                        if (!prev) return null;
                        
                        const updatedExecutors = prev.executors.map(emp =>
                          emp.executor?.id === currentUserInfo?.employee.id
                            ? {
                                ...emp,
                                answer_type: statusMapping[statusValue],
                              }
                            : emp
                        );
                        
                        return {
                          ...prev,
                          executors: updatedExecutors
                        };
                      });
                      
                      setRadioValue(statusValue);
                    }}
                    value={radioValue}
                  >
                    <Radio value="Розиман">Roziman</Radio>
                    <Radio value="РозиЭмасман">Rozi emasman</Radio>
                  </Radio.Group>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={handleModalClose}>Bekor qilish</Button>
                    <Button
                      type="primary"
                      onClick={handleSave}
                    >
                      Saqlash
                    </Button>
                  </div>
                </div>
              </Modal>
            </>
          )}
          {/* 🔸 2. YUBORILGAN XATNI KO‘RINISHI */}

          <div className='mb-2'>
            <div className='flex flex-col gap-4'>
              <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Buyurtma uchun berilgan tovarlar ruyhati</Typography>

              {/* Tovarlar ro'yxati */}
              <div className="bg-white rounded-xl mb-6 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2">
                      <tr>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">№</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Tovar nomi</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Model</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Tovar turi</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">O'lcham</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">O'lchov birligi</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Soni</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Tovar bo'yicha izoh</th>
                      </tr>
                    </thead>
                    <tbody className=" bg-[#f2f2f2b6]">
                      {orderData.products?.map((product, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
                          <td className="text-center px-6 py-4 text-sm text-gray-700 font-medium">{product.row_number}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{product.product?.name}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700 font-medium">{product.model?.name}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{product.product_type?.name}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{product.size?.name}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{product.unit?.name}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{product.quantity}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{product.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Imzolovchi xodimlar */}
                          <div className='flex flex-col gap-4'>
                            <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Imzolovchilar ro'yhati</Typography>

                            <div className="bg-white rounded-xl mb-6 overflow-hidden">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-gray-50 border-b-2">
                                    <tr>
                                      <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">№</th>
                                      <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Xabar xolati</th>
                                      <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Imzolovchi xodim</th>
                                      {/* <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Lavozim</th> */}
                                      <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Izoh</th>
                                      <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Sana</th>
                                    </tr>
                                  </thead>
                                  <tbody className=" bg-[#f2f2f2b6]">
                                    {orderData.executors?.map((executor, index) => (
                                      <tr key={index} className="hover:bg-indigo-50 transition-colors">
                                        <td className="text-center px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                                        <td className="text-center px-6 py-4 text-sm text-gray-700">{executor.answer_type?.name}</td>
                                        <td className="text-center px-6 py-4 text-sm text-gray-700 font-medium">{executor.executor?.name}</td>
                                        {/* <td className="text-center px-6 py-4 text-sm text-gray-700">{}</td> */}
                                        <td className="text-center px-6 py-4 text-sm text-gray-700">{executor.description}</td>
                                        <td className="text-center px-6 py-4 text-sm text-gray-700">{executor.confirmation_date}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>

                          {fileUploadModal && orderData.for_purpose == 'for_agreement' && (
                                <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50" onClick={() => setFileUploadModal(false)}>
                                  <div className="bg-white rounded-lg p-6 w-96 flex flex-col" onClick={(e) => e.stopPropagation()}>
                                    {/* Top */}
                                    <div className='flex items-center justify-between mb-4 pb-2 border-b'>
                                      <h2 className="text-xl font-semibold">Hujjat biriktirish</h2>
                                      <button className='text-2xl' onClick={() => setFileUploadModal(false)}>&times;</button>
                                    </div>
                                    <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Hujjat turi</label>
                                      <Select
                                        style={{ width: '100%' }}
                                        placeholder="Hujjat turini tanlang"
                                        value={documentFormData.selectedDocumentType || undefined}
                                        onChange={(value) => {
                                          setDocumentFormData(prev => ({ ...prev, selectedDocumentType: value }))
                                        }}
                                        options={documentTypes.map(docType => ({ value: docType.id, label: docType.name }))}
                                      />
                                    </div>
                                    <div className="mb-4">
                                      <FileDropZone file={file} setFile={setFile} />
                                    </div>

                                    <Button
                                      className="bg-gray-100 p-2 rounded-lg text-sm cursor-pointer hover:bg-blue-400 hover:text-white ml-auto"
                                      onClick={handleFileAttach}
                                      disabled={!file || !documentFormData?.selectedDocumentType}
                                    >
                                      Yuklash
                                    </Button>
                                  </div>
                                </div>
                        )}
                        <div className="p-4">
                          {fileUploadModal && orderData.for_purpose == 'for_agreement' && (
                              <button
                                onClick={() => setFileUploadModal(true)}
                                className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
                                aria-label="Hujjat biriktirish"
                              >
                                <div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
                                  <FilePlus2 className='w-5 h-5' />
                                </div>
                                <span>Hujjat biriktirish</span>
                              </button>
                            )}
                            <Typography fontSize={"20px"} fontWeight={600} color="#0f172b" className="mb-4">
                              Buyurtmaga biriktirilgan fayllar ro‘yxati
                            </Typography>
                            {files.length !== 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {files.map((file, index) => {
                                  const { icon, color, bg } = getFileIcon(file.file_name);

                                  return (
                                    <div
                                      key={index}
                                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-4 flex flex-col justify-between"
                                    >
                                      {/* 🔹 Exit number & Row number */}
                                      <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                          {orderData.exit_number}-{file.raw_number}
                                        </span>
                                      </div>

                                      {/* 🔸 Fayl ma’lumotlari */}
                                      <div className="flex items-center gap-4 mb-3">
                                        <div className={`p-3 rounded-lg ${bg}`}>
                                          <div className={`${color} text-3xl`}>{icon}</div>
                                        </div>
                                        <div className="flex flex-col">
                                          <h4 className="text-gray-800 font-semibold text-sm truncate w-48">
                                            {file.file_name}
                                          </h4>
                                          {file.user}
                                          <p className="text-gray-500 text-sm mt-1">{formatDate(file.date)}</p>
                                        </div>
                                      </div>

                                      {/* 🔸 Action tugmalar */}
                                      <div className="flex justify-end gap-3 mt-auto">
                                        <button
                                          onClick={() => handleView(file)}
                                          className="p-2 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition"
                                          title="Ko'rish"
                                        >
                                          <EyeOutlined className="text-lg" />
                                        </button>

                                        <button
                                          onClick={() => handleDownloadFile(file)}
                                          className="p-2 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition"
                                          title="Yuklab olish"
                                        >
                                          <DownloadOutlined className="text-lg" />
                                        </button>

                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-gray-700 font-bold text-2xl text-center">
                                Hozircha fayllar mavjud emas.
                              </p>
                            )}
          </div>

        </div>
      </div>

      {/* 🟣 PDF modal */}
      {selectedFileMeta && (
        <FilePreviewModal
          open={previewOpen}
          file={previewFile}
          onClose={() => { setPreviewOpen(false); setPreviewFile(null); }}
          onDownload={() => { if (selectedFileMeta) handleDownloadFile(selectedFileMeta); }}
        />
      )}

      <Modal
        title="E-IMZO maxfiy raqamini kiriting!"
        open={eImzoOpen}
        onCancel={() => {
          setEImzoOpen(false);
          webSocketService.disconnect();
          setSelectedCertificate(null);
        }}
        style={{ minWidth: "800px" }}
        footer={[
          <Button key="cancel" onClick={() => setEImzoOpen(false)}>
            Chiqish
          </Button>,
          <Button
            key="ok"
            type="primary"
            disabled={!selectedCertificate}
            onClick={handleSelectCertificate}
          >
            Tasdiqlash
          </Button>,
        ]}
      >
        <Table
          rowKey="name"
          dataSource={certificates}
          pagination={false}
          rowClassName={(record: CertificateParsed) =>
            isExpired(record.validTo)
              ? "bg-red-50 text-red-600"
              : selectedCertRow?.name === record.name
              ? "bg-blue-50"
              : ""
          }
          rowSelection={{
            type: "radio",
            selectedRowKeys: selectedCertRow ? [selectedCertRow.name] : [],
            getCheckboxProps: (record: CertificateParsed) => ({
              disabled: isExpired(record.validTo),
              title: isExpired(record.validTo)
                ? "Muddati tugagan — tanlab bo‘lmaydi"
                : undefined,
            }),
          }}
          onRow={(record: CertificateParsed) => ({
            onClick: () => {
              if (isExpired(record.validTo)) {
                toast("Bu kalitning muddati tugagan, tanlab bo‘lmaydi.", {
                  type: "warning",
                });
                return;
              }
              setSelectedCertRow(record);
              setSelectedCertificate({
                plugin: "pfx",
                name: "load_key",
                arguments: [
                  `${record.disk}`,
                  `${record.path}`,
                  `${record.name}`,
                  `${record.alias}`,
                ],
              });
            },
          })}
          columns={[
            { title: "Disk", dataIndex: "disk", key: "disk" },
            { title: "Joylashuvi", dataIndex: "path", key: "path" },
            { title: "F.I.O", dataIndex: "cn", key: "cn" },
            {
              title: "Amal qilish muddati",
              render: (_, r: CertificateParsed) => {
                const expired = isExpired(r.validTo);
                return (
                  <span className={expired ? "text-red-600 font-semibold" : ""}>
                    {r.validFrom} - {r.validTo}
                    {expired && <span className="ml-2">(muddati tugagan)</span>}
                  </span>
                );
              },
            },
          ]}
        />
      </Modal>

    </>
  );
};

export default ComplektatsiyaOrderSining;
