import React, { useState, useEffect, useCallback } from 'react';
import { FilePlus2, Plus, Search, Trash, Pencil, 
  CircleCheckBig, Save, Layers, X, Send, ArrowBigLeftDash, ArrowBigRightDash,
  Check
} from 'lucide-react';
import { Input } from '@/components/UI/input';

import { axiosAPI } from '@/services/axiosAPI';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, message, Modal, Select, Table } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import FileDropZone from '@/components/FileDropZone';
import {
  EyeOutlined, DownloadOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileImageOutlined, FileTextOutlined,
} from "@ant-design/icons";
import SelectRemainsModal from '@/components/CreateForms/SelectRemainsModal';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/store/hooks/hooks';
import RepublicOrderSining from './RepublicOrderSining';
import FieldModal from '@/components/modal/FieldModal';
import webSocketService from "@/services/webSocket";
import { arrayBufferToFile, inferMimeFromExt } from "@/utils/file_preview";

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
  product: string;
  model: IdName | null;
  product_type: IdName | null;
  size: IdName | null;
  unit: IdName | null;
  quantity: number;
  order_type: IdName | null;
  description?: string | null;
}

interface Executor {
  executor: IdName;
  executor_type: IdName;
  status: IdName;
  message: string;
  confirmation_date: string;
}

interface Performers {
  performer: IdName;
  description:string;
  row_number: number;
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
  recipient_republic: IdName;
  products: Product[];
  executors: Executor[];
  performers:Performers[]
  for_purpose: "signing" | "editing" | 'from_region' | 'for_agreement' | 'performer';
}

interface ProductRow {
  row_number: number;
  order_type: IdName | null;
  product_type: IdName | null;
  product: string;
  model: IdName | null;
  size: IdName | null;
  unit: IdName | null;
  quantity: number;
  description?: string | null;
}

interface FileData {
  file_name: string;
  raw_number: string;
  date: string;
  user: string;
}

interface AboveFileData {
  file_name: string;
  raw_number: string;
  date: string;
  user: string;
}

interface RequestsFileData {
  file_name: string;
  raw_number: string;
  date: string;
  user: string;
}


interface DocumentFormData {
  selectedDocumentType: string;
  filename: string;
  extension: string;
  fileBinary: string;
}

interface SenderToSale {
  order_id: string;
  receiver_sale: string;
  receiver_republic_name: string;
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

const RegionOrderDetail: React.FC = () => {
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [SenderToSale, setSenderToSale] = useState<SenderToSale | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileUploadModal, setFileUploadModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentTypes, setDocumentTypes] = useState<IdName[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [remainders, setRemainders] = useState<ProductRemainder[]>([]);
  const [showRemainders, setShowRemainders] = useState(false);
  const [documentFormData, setDocumentFormData] = useState<DocumentFormData>({
    selectedDocumentType: '',
    filename: '',
    extension: '',
    fileBinary: ''
  });
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showIjrochiModal, setShowIjrochiModal] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [sender_employees, setSenderEmployees] = useState<any[]>([]);
  const { id } = useParams<{ id: string }>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);
  type FieldName = "product_type" | "model" | "size" | "unit" | "product";
  const [activeField, setActiveField] = useState<{ field: FieldName; row_number: number } | null>(null);
  const [executorType, setexecutorType] = useState<any[]>([]);
  const [messageFileURL, setMessageFileURL] = useState("");
  const [fishkaFileURL, setFishkaFileURL] = useState("");
  const [serviceFileURL, setServiceFileURL] = useState("");
  const [serviceOrderFileURL, setServiceOrderFileURL] = useState("");
  const [showRecepModal, setshowRecepModal] = useState(false);
  const { currentUserInfo } = useAppSelector(state => state.info);
  const { order_types } = useAppSelector(state => state.product);
  const [above_files, setAboveFiles] = useState<AboveFileData[]>([]);
  const [requests_files, setRequestsFiles] = useState<RequestsFileData[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [limit] = useState<number>(20);
  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  const [senderEmployeesLoading, setSenderEmployeesLoading] = useState(false);
  const [selectedCertRow, setSelectedCertRow] = useState<CertificateParsed | null>(null);
  const [messageFileBinary, setMessageFileBinary] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<CertificateParsed[]>([]);
  const [keyID, setKeyID] = useState("")
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateDetails | null>(null);
  const [eImzoOpen, setEImzoOpen] = useState(false);
  const [currentSigningType, setCurrentSigningType] = useState<'buyurtma' | 'xizmat' | null>(null);

  const [signingData, setSigningData] = useState<{
      document_name: string;
      id: string;
      data: any;
      number:number;
    }>({
      document_name: "ЗаявкаПоРеспублика",
      number:0,
      id: id ?? "",
      data: ""
    });
  
  const [xizmatSigningData, setXizmatSigningData] = useState({
    document_name: "ЗаявкаПоРеспублика", 
    number: 0,
    id: id ?? "",
    data: ""
  });
  const [xizmatFileBinary, setXizmatFileBinary] = useState<string | null>(null);
  const [xizmatEImzoOpen, setXizmatEImzoOpen] = useState(false);



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


  const generatePageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
      pages.push(i);
      }
      return pages;
	};
  

  const navigate = useNavigate();

  const fetchOrderDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await axiosAPI.get(`republic-orders/detail/${id}`);
      setOrderData(response.data[0]);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      message.error('Buyurtma ma\'lumotlarini olishda xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  }, [id]);
  const fetchDocumentTypesList = useCallback(async () => {
    try {
      const response = await axiosAPI.get('enumerations/document_types');
      setDocumentTypes(response.data);
    } catch (error) {
      console.error('Error fetching document types:', error);
      message.error('Hujjat turlarini olishda xatolik yuz berdi!');
    }
  }, []);

  const fetchRemaindersUserWarehouse = useCallback(async () => {
    try {
      const response = await axiosAPI.get(`/warehouses/list?region=${currentUserInfo?.region.name}&district=${currentUserInfo?.district.name}`);
      if (response.status === 200) {
        const warehouseId = response.data[0].id;
        const remaindersResponse = await axiosAPI.post("remainders/warehouses", {
          warehouse: warehouseId,
          date: new Date().toISOString()
        });
        if (remaindersResponse.status === 200) {
          setRemainders(remaindersResponse.data);
          setShowRemainders(true);
        }
      }
    } catch (error) {
      console.error('Error fetching remainders:', error);
      message.error('Qoldiqlarni olishda xatolik yuz berdi!');
    }
  }, [currentUserInfo?.region.name, currentUserInfo?.district.name]);

  useEffect(() => {
    if (file) {
      setDocumentFormData(prev => ({
        ...prev,
        filename: file.name,
        extension: file.name.split('.').pop() || ''
      }));
    }
  }, [file]);


  const handleFileAttach = useCallback(async () => {
    if (!file || !orderData?.id || !documentFormData.filename) {
      message.error('Fayl yoki ma\'lumotlar to\'liq emas!');
      return;
    }

    const params = {
      id: orderData.id,
      file_name: documentFormData.filename,
      extension: documentFormData.extension,
      file_type: "ЗаявкаДокументПоРайон"
    };

    try {
      const arrayBuffer = await file.arrayBuffer();
      const binary = new Uint8Array(arrayBuffer);
      const response = await axiosAPI.post(`republic-orders/files/create`, binary, {
        params,
        headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
      });

      if (response.status === 200) {
        await Promise.all([fetchOrderDetail(), fetchDocumentTypesList()]);
        if (file) {
          setDocumentFormData(prev => ({ ...prev!, filename: file.name, extension: file.name.split('.').pop()! }))
          setFiles(prev => {
            const exists = prev.some(f => (f.file_name || "").toLowerCase() === file.name.toLowerCase());
            if (exists) {
              toast("Bu fayl allaqachon biriktirilgan", { type: "warning" });
              return prev;
            }
            return [...prev, {
              raw_number: (prev.length + 1) + "",
              user: currentUserInfo?.id || "",
              file_name: file.name,
              extension: file.name.split('.').pop()!,
              date: new Date().toISOString()
            }];
          })
        }
        setFile(null);
        setDocumentFormData({
          selectedDocumentType: '',
          filename: '',
          extension: '',
          fileBinary: ''
        });
        toast("Fayl muvaffaqiyatli yuklandi", { type: "success" });
        setFileUploadModal(false);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Fayl yuklashda xatolik yuz berdi!');
    }
  }, [file, orderData?.id, documentFormData, fetchOrderDetail, fetchDocumentTypesList]);

  useEffect(() => {
    handleFileAttach()
  },[])

  const fetchFiles = useCallback(async () => {
    if (!id) return;
    try {
      const response = await axiosAPI.get(`republic-orders/${id}/files/list`);
      if (response.status === 200) {
        setFiles(response.data);
      }
    } catch (error) {
      message.error('Fayllarni olishda xatolik yuz berdi!');
    }
  }, [id]);

  const deleteFile = useCallback(async (file: FileData) => {
    try {
      setFiles(prev => prev.filter(f => f.raw_number !== file.raw_number));
    } catch (error) {
      console.error("Faylni o‘chirishda xato:", error);
    }
  }, []);

  const getDistrictOrderFile = useCallback(async () => {
    if (!id || !orderData) return;
    try {
      if (orderData.for_purpose === 'editing') {
        const response = await axiosAPI.get(`republic-orders/${orderData?.id}/order-file`);
        if (response.status === 200) {
          setMessageFileURL(response.data.file_url)
        }
      }
      if (orderData.for_purpose === 'from_region') {
        const above_response = await axiosAPI.get(`republic-orders/${orderData?.id}/above-file`);
        const above_list_response = await axiosAPI.get(`republic-orders/${orderData?.id}/above-files/list`);
        if (above_response.status === 200) {
          setFishkaFileURL(above_response.data.file_url)
          try {
            const fileUrl = above_response.data.file_url;
            console.log(fileUrl)

            const fileName = fileUrl.split("/").pop() || "file";
            console.log(fileName.split(".docm")[0])
            setSigningData((prev) => ({
              ...prev,
              number: fileName.split(".docm")[0],
            }));
            const res = await fetch(fileUrl);
            const arrayBuffer = await res.arrayBuffer();
            setMessageFileBinary(arrayBufferToBase64(arrayBuffer))
          } catch (error) {
            console.error("Message file error:", error);
          }
        }
        if (above_list_response.status === 200) {
          setAboveFiles(above_list_response.data)
        }
      }
      if (orderData.for_purpose === 'performer') {
        const se_response = await axiosAPI.get(`republic-orders/${orderData?.id}/request-file`);
        const service_response = await axiosAPI.get(`republic-orders/${orderData?.id}/service-files/list`);
        const order_response = await axiosAPI.get(`republic-orders/${orderData?.id}/service-file`);
        if (se_response.status === 200) {
          setServiceFileURL(se_response.data.file_url)
          try {
            const fileUrl = se_response.data.file_url;
            const fileName = fileUrl.split("/").pop() || "file";
            
            // Buyurtma hatini imzolash uchun tayyorlash
            setSigningData((prev) => ({
              ...prev,
              number: fileName.split(".docm")[0],
            }));
            
            const res = await fetch(fileUrl);
            const arrayBuffer = await res.arrayBuffer();
            setMessageFileBinary(arrayBufferToBase64(arrayBuffer))
          } catch (error) {
            console.error("Buyurtma file error:", error);
          }
      }

        if (order_response.status === 200) {
          setServiceOrderFileURL(order_response.data.file_url)
          try {
            const fileUrl = order_response.data.file_url;
            const fileName = fileUrl.split("/").pop() || "file";
            
            setXizmatSigningData(prev => ({
              ...prev,
              number: fileName.split(".docm")[0],
            }));
            
            const res = await fetch(fileUrl);
            const arrayBuffer = await res.arrayBuffer();
            setXizmatFileBinary(arrayBufferToBase64(arrayBuffer))
          } catch (error) {
            console.error("Xizmat file error:", error);
          }
        }
        if (service_response.status === 200) {
          setRequestsFiles(service_response.data)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }, [id, orderData])

  

  useEffect(() => {
    if (orderData) {
      getDistrictOrderFile();
    }
  }, [orderData, getDistrictOrderFile]);


  const signingXizmatDocument = useCallback(async () => {
    try {
      console.log("Xizmat hati serverga yuklanmoqda:", xizmatSigningData);
      const response = await axiosAPI.post("signing/upload", xizmatSigningData)
      if (response.status === 200) {
        toast.success("Xizmat hati imzolandi");
        console.log(response)
      }
    } catch (error: any) {
      console.error("Xizmat hati imzolash xatosi:", error);
      toast.error(error.response?.data?.error || "Xizmat hatini imzolashda xatolik yuz berdi!");
    }
  }, [xizmatSigningData])


  useEffect(() => {
    if (xizmatSigningData.data) {
      signingXizmatDocument()
    }
  }, [xizmatSigningData.data, signingXizmatDocument])

  

  useEffect(() => {
    Promise.all([fetchOrderDetail(), fetchDocumentTypesList()]);
  }, [fetchOrderDetail, fetchDocumentTypesList]);


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
      const handleWebSocketMessage = (msg: string) => {
        try {
          const parsed = JSON.parse(msg);
          console.log("WebSocket xabari:", parsed);
          
          if (parsed.certificates) {
            const mapped = parsed.certificates.map((c: CertificateRaw) => ({
              ...c,
              ...parseAlias(c.alias),
            }));
            setCertificates(mapped);
          } else if (parsed.keyId) {
            setKeyID(parsed.keyId);
            console.log("KeyID olingan:", parsed.keyId);
          } else if (parsed.pkcs7_64) {
            console.log("Imzolash tugadi, currentSigningType:", currentSigningType);
            
            // Qaysi hujjat imzolanganligiga qarab ma'lumotlarni saqlash
            if (currentSigningType === 'buyurtma') {
              console.log("Buyurtma hati imzolandi");
              setSigningData(prev => ({
                ...prev,
                data: parsed
              }));
              setEImzoOpen(false);
              setCurrentSigningType(null);
            } else if (currentSigningType === 'xizmat') {
              console.log("Xizmat hati imzolandi");
              setXizmatSigningData(prev => ({
                ...prev,
                data: parsed
              }));
              setXizmatEImzoOpen(false);
              setCurrentSigningType(null);
            }
          }
        } catch (error) {
          console.error("WebSocket parse error:", error);
        }
      };

      webSocketService.connect(
        "wss://127.0.0.1:64443/service/cryptapi",
        handleWebSocketMessage
      );
    webSocketService.sendMessage(JSON.stringify({ 'name': 'apikey', 'arguments': ['null', 'E0A205EC4E7B78BBB56AFF83A733A1BB9FD39D562E67978CC5E7D73B0951DB1954595A20672A63332535E13CC6EC1E1FC8857BB09E0855D7E76E411B6FA16E9D', 'localhost', '96D0C1491615C82B9A54D9989779DF825B690748224C2B04F500F370D51827CE2644D8D4A82C18184D73AB8530BB8ED537269603F61DB0D03D2104ABF789970B', '127.0.0.1', 'A7BCFA5D490B351BE0754130DF03A068F855DB4333D43921125B9CF2670EF6A40370C646B90401955E1F7BC9CDBF59CE0B2C5467D820BE189C845D0B79CFC96F', 'test.e-imzo.uz', 'DE783306B4717AFE4AE1B185E1D967C265AA397A35D8955C7D7E38A36F02798AA62FBABE2ABA15C888FE2F057474F35A5FC783D23005E4347A3E34D6C1DDBAE5', 'test.e-imzo.local', 'D56ABC7F43A23466D9ADB1A2335E7430FCE0F46B0EC99B578D554333245FC071357AE9E7E2F75F96B73AEEE7E0D61AE84E414F5CD795D8B6484E5645CAF958FC'] }
    ))
    
    }, [currentSigningType]);
  
    // Key ID va file binary lar uchun - bitta useEffect da barchasini birlashtiring
    useEffect(() => {
      if (keyID) {
        if (currentSigningType === 'buyurtma' && messageFileBinary && eImzoOpen) {
          console.log("Buyurtma hati imzolash boshlandi, KeyID:", keyID);
          webSocketService.sendMessage(
            JSON.stringify({ 
              'plugin': 'pkcs7', 
              'name': 'create_pkcs7', 
              'arguments': [messageFileBinary, keyID, 'no'] 
            })
          );
        } else if (currentSigningType === 'xizmat' && xizmatFileBinary && xizmatEImzoOpen) {
          console.log("Xizmat hati imzolash boshlandi, KeyID:", keyID);
          webSocketService.sendMessage(
            JSON.stringify({ 
              'plugin': 'pkcs7', 
              'name': 'create_pkcs7', 
              'arguments': [xizmatFileBinary, keyID, 'no'] 
            })
          );
        }
      }
    }, [keyID, currentSigningType, messageFileBinary, xizmatFileBinary, eImzoOpen, xizmatEImzoOpen]);
    useEffect(() => {
      if (keyID && xizmatFileBinary && xizmatEImzoOpen) {
        console.log("Xizmat hati imzolash boshlandi");
        webSocketService.sendMessage(
          JSON.stringify({ 'plugin': 'pkcs7', 'name': 'create_pkcs7', 'arguments': [xizmatFileBinary, keyID, 'no'] })
        )
      }
    }, [keyID, xizmatFileBinary, xizmatEImzoOpen])
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

    useEffect(() => {
      if (id) {
        fetchFiles();
      }
    }, [fetchFiles]);

  const formatDate = useCallback((iso: string): string => {
    const date = new Date(iso);
    return date.toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const handleDownload = useCallback((file: FileData) => {
    const link = document.createElement("a");
    link.href = `https://ekomplektasiya.uz/ekomplektasiya_backend/hs/republic-orders/${id}/files/${file.file_name}`;
    link.download = file.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [id]);

  const getFileIcon = useCallback((fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
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
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axiosAPI.get("employees/list");
      const type_response = await axiosAPI.get('enumerations/excuter_types');

      if (type_response.status === 200 && Array.isArray(type_response.data)) {
        setexecutorType(type_response.data);
      } else {
        setexecutorType([]);
      }

      if (response.status === 200 && Array.isArray(response.data.results)) {
        setEmployees(response.data.results);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Hodimlarni olishda xatolik:", error);
    }
  };

  const fetchSenderEmployees = async (newOffset = 0) => {
    try {
      setSenderEmployeesLoading(true); 
      const response = await axiosAPI.get("employees/list?region=Худудгазтаъминот&limit=${limit}&offset=${newOffset}");
      if (response.status === 200 && Array.isArray(response.data.results)) {
        setSenderEmployees(response.data.results);
        setTotalCount(response.data.count);
			  setOffset(newOffset);
      } else {
        setSenderEmployees([]);
      }
    } catch (error) {
      console.error("Hodimlarni olishda xatolik:", error);
    }
    finally {
      setSenderEmployeesLoading(false);
    }
  };
  const handleModalPageClick = (page: number) => {
    const newOffset = (page - 1) * limit;
      fetchSenderEmployees(newOffset);
	};
  const addSendToSale = async () => {
    try {
      if (!SenderToSale) return;
      const response = await axiosAPI.post('/republic-orders/send-to-sale/', {
        ...SenderToSale,
        order_id: orderData?.id,
      })
      if (response.status === 200) {
        toast.success("Buyurtma muvaffaqiyatli yangilandi!");
      }
    } catch (err: any) {
      console.error("Yangilashda xatolik:", err);
      toast.error(err.response?.data?.error || "Buyurtmani yangilashda xatolik yuz berdi!");
    }
  };

  const handleSelectEmployee = useCallback(() => {
    setShowEmployeeModal(false);
  }, []);

  const handleSelectIjrochi = useCallback(() => {
    setShowIjrochiModal(false);
  }, []);

  const updateRow = useCallback(<K extends keyof ProductRow>(
    row_number: number,
    key: K,
    value: ProductRow[K]
  ) => {
    setOrderData(prev => {
      if (!prev) return prev;
      const updatedProducts = prev.products.map(p =>
        p.row_number === row_number ? { ...p, [key]: value } : p
      );
      return { ...prev, products: updatedProducts };
    });
  }, []);

  const handleAddProduct = useCallback(() => {
    setOrderData(prev => {
      if (!prev) return prev;

      const newRowNumber = (prev.products?.length || 0) + 1;
      const newProduct: ProductRow = {
        row_number: newRowNumber,
        order_type: null,
        product_type: null,
        product: "",
        model: null,
        size: null,
        unit: null,
        quantity: 0,
        description: "",
      };
      return { ...prev, products: [...(prev.products || []), newProduct] };
    });
  }, []);

  const handleDeleteOrder = useCallback(() => {
    if (!orderData || !orderData.id) {
      message.error("Buyurtma ID topilmadi!");
      return;
    }
    setDeleteModalError(null);
    setIsDeleteModalOpen(true);
  }, [orderData]);

  const confirmDelete = useCallback(async () => {
    if (!orderData || !orderData.id) {
      message.error("Buyurtma ma'lumoti topilmadi!");
      return;
    }

    try {
      const response = await axiosAPI.delete(`republic-orders/delete/${orderData.id}/`);

      if (response.status === 200) {
        message.success("Buyurtma muvaffaqiyatli o'chirildi!");
        setIsDeleteModalOpen(false);

        setTimeout(() => {
          window.history.back();
        }, 1000);
      }
    } catch (error: any) {
      console.error("O'chirishda xatolik:", error);
      const backendError = error?.response?.data?.error || "Buyurtmani o'chirishda xatolik yuz berdi!";
      setDeleteModalError(backendError);
    }
  }, [orderData]);

  const cancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeleteModalError(null);
  }, []);

  const handleUpdateOrder = useCallback(async () => {
    try {
      if (!orderData) return;
      const res = await axiosAPI.post(`/republic-orders/update/${orderData.id}`, {
        ...orderData,
        type_document_for_filter: orderData.type_document_for_filter?.id,
        application_status_district: orderData.application_status_district?.id,
        from_district: orderData.from_district?.id,
        sender_from_district: orderData.sender_from_district?.id,
        to_region: orderData.to_region?.id,
        recipient_district: orderData.recipient_district?.id,
        from_region: orderData.from_region?.id,
        sender_from_region: orderData.sender_from_region?.id,
        to_district: orderData.to_district?.id,
        recipient_region: orderData.recipient_region?.id,
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
        })),
        performers: orderData.performers.map(e => ({
          ...e,
          performer: e.performer.id,
          row_number: e.row_number,
        })),
      });
      if (res.status === 200) {
        toast.success("Buyurtma muvaffaqiyatli yangilandi!");
        fetchOrderDetail();
      }
    } catch (err: any) {
      console.error("Yangilashda xatolik:", err);
      toast.error(err.response?.data?.error || "Buyurtmani yangilashda xatolik yuz berdi!");
    }
  }, [orderData, fetchOrderDetail]);

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
  
  return (
    <>
      {
        (orderData.for_purpose === "editing" || orderData.for_purpose === "from_region" || orderData.for_purpose === "performer") ? (
          <div className="min-h-screen py-2 px-2 bg-white">
            <div className="max-w-8xl mx-auto bg-white">
              <div>
                <div className="bg-white overflow-hidden mb-4">
                  <div className="flex items-center justify-between p-4">
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigate(-1)}
                      className="w-8 h-8 p-0 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                    <div className="text-center border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">{orderData.for_purpose === "editing" ? "Chiqish" : 'Kirish'}</p>
                      <p className="text-md font-semibold text-gray-800">{orderData.exit_number}</p>
                    </div>

                    <div className="text-center border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">{orderData.for_purpose === "editing" ? "Chiqish" : 'Kirish'} Sana</p>
                      <p className="text-md font-semibold text-gray-800">{orderData.exit_date?.split("T").join(" ")}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">{orderData.for_purpose === "editing" ? "Viloyatdan" : 'Tumandan'} junatuvchi</p>
                      <p className="text-md font-semibold text-gray-800">{orderData.for_purpose === "editing" ? orderData.sender_from_region?.name : orderData.sender_from_district?.name} </p>
                    </div>

                    <div className="text-center border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">{orderData.for_purpose === "from_region" ? "Viloyatda" : 'Respublikada'} qabul qiluvchi</p>
                      <p className="text-md font-semibold text-gray-800">{SenderToSale?.receiver_republic_name ? SenderToSale.receiver_republic_name : orderData.recipient_republic?.name}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-transparent rounded-md flex justify-between mb-4">
                    <div>
                      <h1 className='text-xl text-[#000] font-semibold'>Buyurtma uchun berilgan tovarlar ruyxati</h1>
                    </div>
                    <div className='flex items-center gap-3'>
                      <button
                        onClick={handleAddProduct}
                        className='group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'
                      >
                        <div className='bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors'>
                          <Plus className='w-3.5 h-3.5' />
                        </div>
                        Kiritish
                      </button>
                      <button
                        className='group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'
                        onClick={fetchRemaindersUserWarehouse}>
                        <div className='bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors'>
                          <Layers className='w-3.5 h-3.5' />
                        </div>
                        Qoldiqlar
                      </button>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          type="text"
                          placeholder="Qidirish (Ctrl+F)"
                          className="w-64 h-9 pl-9 text-sm border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 overflow-y-auto mb-4">
                    <div className="overflow-x-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b bg-gradient-to-r from-slate-100 via-blue-50 to-purple-50">
                          <tr className=" data-[state=selected]:bg-muted border-b transition-colors">
                            <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">№</th>
                            <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Buyurtma turi</th>
                            <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Tovar</th>
                            <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Tovar turi</th>
                            <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Model</th>
                            <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">O'lcham</th>
                            <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">O'lchov birligi</th>
                            <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Soni</th>
                            <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Izoh</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                          {orderData?.products && orderData.products.length > 0 ? (
                            orderData.products.map((p, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 transition-all duration-200">
                                {/* № */}
                                <td className="px-3 py-2 text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-sm">
                                    {p.row_number}
                                  </span>
                                </td>

                                {/* 🟢 Buyurtma turi (API dan kelgan SELECT) */}
                                <td className="px-3 py-2 text-center">
                                  <Select
                                    value={p.order_type?.id}
                                    onChange={(val) => {
                                      const found = order_types.find(o => o.id === val);
                                      if (found) updateRow(p.row_number, "order_type", found);
                                    }}
                                    style={{ width: 160 }}
                                    options={order_types.map(o => ({ value: o.id, label: o.name }))}
                                    placeholder="Tanlang"
                                  />
                                </td>

                                {/* 🟠 Mahsulot nomi (qo'lda Input) */}
                                <td className="px-3 py-2 text-center">
                                  <Input
                                    value={p.product}
                                    placeholder='Tovar nomini kiriting'
                                    onChange={(e) => updateRow(p.row_number, "product", e.target.value)}
                                    className="text-sm border border-gray-200 rounded-md w-full bg-white placeholder:text-gray-400"
                                  />
                                </td>

                                {/* Tovar turi */}
                                <td className="px-3 py-2 text-center">
                                  <Button
                                    onClick={() => setActiveField({ field: "product_type", row_number: p.row_number })}
                                    size="small"
                                    className="text-blue-600 border-blue-400"
                                  >
                                    {p.product_type?.name || "Tovar turini tanlash"}
                                  </Button>
                                  {activeField?.field === "product_type" && activeField?.row_number === p.row_number && (
                                    <FieldModal
                                      field_name={activeField.field}
                                      selectedItem={{
                                        id: p.product_type?.id || '',
                                        name: p.product_type?.name || '',
                                        name_uz: p.product_type?.name || ''
                                      }}
                                      setSelectedItem={newItem => {
                                        if (!newItem) {
                                          setActiveField(null);
                                          return;
                                        }
                                        setOrderData(prev => ({
                                          ...prev!,
                                          products: prev!.products.map(prod =>
                                            prod.row_number === p.row_number
                                              ? {
                                                ...prod,
                                                product_type: { id: newItem.id, name: newItem.name },
                                                model: { id: '', name: '' },
                                                size: { id: '', name: '' },
                                                unit: { id: '', name: '' },
                                              }
                                              : prod
                                          ),
                                        }));
                                        setActiveField(null);
                                      }}
                                    />
                                  )}
                                </td>

                                {/* Model */}
                                <td className="px-3 py-2 text-center">
                                  <Button
                                    onClick={() => setActiveField({ field: "model", row_number: p.row_number })}
                                    size="small"
                                    className="text-blue-600 border-blue-400"
                                  >
                                    {p.model?.name || "Modelni tanlash"}
                                  </Button>
                                  {activeField?.field === "model" && activeField?.row_number === p.row_number && (
                                    <FieldModal
                                      field_name={activeField.field}
                                      selectedItem={{
                                        id: p.model?.id || '',
                                        name: p.model?.name || '',
                                        name_uz: p.model?.name || ''
                                      }}
                                      selectedProductTypeId={p.product_type?.name || ''}
                                      setSelectedItem={newItem => {
                                        if (!newItem) {
                                          setActiveField(null);
                                          return;
                                        }
                                        setOrderData(prev => ({
                                          ...prev!,
                                          products: prev!.products.map(prod =>
                                            prod.row_number === p.row_number
                                              ? {
                                                ...prod,
                                                model: { id: newItem.id, name: newItem.name },
                                                size: { id: '', name: '' },
                                                unit: { id: '', name: '' },
                                              }
                                              : prod
                                          ),
                                        }));
                                        setActiveField(null);
                                      }}
                                    />
                                  )}
                                </td>

                                {/* O'lcham */}
                                <td className="px-3 py-2 text-center">
                                  <Button
                                    onClick={() => setActiveField({ field: "size", row_number: p.row_number })}
                                    size="small"
                                    className="text-blue-600 border-blue-400"
                                  >
                                    {p.size?.name || "O'lchamni tanlash"}
                                  </Button>
                                  {activeField?.field === "size" && activeField?.row_number === p.row_number && (
                                    <FieldModal
                                      field_name={activeField.field}
                                      selectedItem={{
                                        id: p.size?.id || '',
                                        name: p.size?.name || '',
                                        name_uz: p.size?.name || ''
                                      }}
                                      selectedProductTypeId={p.product_type?.name || ''}
                                      selectedModelId={p.model?.name || ''}
                                      setSelectedItem={newItem => {
                                        if (!newItem) {
                                          setActiveField(null);
                                          return;
                                        }
                                        setOrderData(prev => ({
                                          ...prev!,
                                          products: prev!.products.map(prod =>
                                            prod.row_number === p.row_number
                                              ? {
                                                ...prod,
                                                size: { id: newItem.id, name: newItem.name },
                                                unit: { id: '', name: '' },
                                              }
                                              : prod
                                          ),
                                        }));
                                        setActiveField(null);
                                      }}
                                    />
                                  )}
                                </td>

                                {/* Birlik */}
                                <td className="px-3 py-2 text-center">
                                  <Button
                                    onClick={() => setActiveField({ field: "unit", row_number: p.row_number })}
                                    size="small"
                                    className="text-blue-600 border-blue-400"
                                  >
                                    {p.unit?.name || "Birlikni tanlash"}
                                  </Button>
                                  {activeField?.field === "unit" && activeField?.row_number === p.row_number && (
                                    <FieldModal
                                      field_name={activeField.field}
                                      selectedItem={{
                                        id: p.unit?.id || '',
                                        name: p.unit?.name || '',
                                        name_uz: p.unit?.name || ''
                                      }}
                                      setSelectedItem={newItem => {
                                        if (!newItem) {
                                          setActiveField(null);
                                          return;
                                        }
                                        setOrderData(prev => ({
                                          ...prev!,
                                          products: prev!.products.map(prod =>
                                            prod.row_number === p.row_number
                                              ? { ...prod, unit: { id: newItem.id, name: newItem.name } }
                                              : prod
                                          ),
                                        }));
                                        setActiveField(null);
                                      }}
                                    />
                                  )}
                                </td>

                                {/* 🔢 Soni */}
                                <td className="px-3 py-2 text-center">
                                  <Input
                                    type="number"
                                    value={p.quantity}
                                    onChange={(e) => updateRow(p.row_number, "quantity", Number(e.target.value))}
                                    className="text-sm border border-gray-200 rounded-md w-full bg-white placeholder:text-gray-400"
                                  />
                                </td>

                                {/* 📝 Izoh */}
                                <td className="px-3 py-2 text-center">
                                  <Input
                                    placeholder="Izoh"
                                    value={p.description || ""}
                                    onChange={(e) => updateRow(p.row_number, "description", e.target.value)}
                                    className="text-sm border border-gray-200 rounded-md w-full bg-white placeholder:text-gray-400"
                                  />
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={9} className="py-6 text-center text-gray-500 text-md font-semibold">
                                Tovar qo'shilmagan
                              </td>
                            </tr>
                          )}
                        </tbody>


                      </table>
                    </div>
                  </div>
                </div>
                  {orderData?.for_purpose === 'from_region' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className="flex border shadow-md px-6 py-4 rounded-lg bg-white h-fit">
                          <div className="flex items-center gap-4 mb-3 w-full">
                            <div className="text-5xl p-6 flex items-center justify-center rounded-full text-blue-500 bg-blue-50">
                              <FileWordOutlined />
                            </div>
                            <div className="flex flex-col">
                              <h4 className="text-gray-800 font-semibold text-xl truncate w-40">Usti hat</h4>
                              <p className="text-lg">{currentUserInfo?.name}</p>
                              <p className="text-gray-500 mt-1">{currentUserInfo?.type_user}</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 min-w-[150px]">
                            <button
                              onClick={() => {
                                const openWordURL = `ms-word:ofe|u|${fishkaFileURL}`;
                                const link = document.createElement("a");
                                link.href = openWordURL;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                            >
                              <span>Ko'rish</span>
                              <EyeOutlined className="text-[24px]" />
                            </button>
                           
                            <button
                              onClick={() => {
                                const openWordURL = `ms-word:ofe|u|${fishkaFileURL}`;
                                const link = document.createElement("a");
                                link.href = openWordURL;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                            >
                              <span>O'zgartirish</span>
                              <Pencil className="text-[24px]" />
                            </button>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = fishkaFileURL;
                                link.setAttribute('download', 'file.docm');
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                            >
                              <span>Yuklab olish</span>
                              <DownloadOutlined className="text-[24px]" />
                            </button>
                            <button
                              onClick={() => {
                                setEImzoOpen(true);
                                setCurrentSigningType('buyurtma');
                                webSocketService.sendMessage(
                                  JSON.stringify({ plugin: "pfx", name: "list_all_certificates" })
                                );
                              }}
                              className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                            >
                              <span>Tasdiklash</span>
                              <Check className="text-[24px]" />
                            </button>
                          </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                          {above_files.length !== 0 ? (
                            above_files.map((file, index) => {
                              const { icon, color, bg } = getFileIcon(file.file_name);
                              return (
                                <div
                                  key={index}
                                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-3 flex flex-col justify-between"
                                >
                                  <div className="flex justify-between">
                                    <div className="flex items-center justify-between flex-1 px-2 py-7 h-full">
                                      <div className={`p-3 rounded-lg ${bg} flex items-center justify-center`}>
                                        <div className={`${color} text-3xl`}>{icon}</div>
                                      </div>
                                      <div className="flex flex-col justify-center">
                                        <h4 className="text-gray-800 font-semibold text-sm truncate w-40">
                                          {file.file_name}
                                        </h4>
                                        <p className="text-gray-700 text-[12px]">{file.user}</p>
                                        <p className="text-gray-500 text-[12px] mt-1">{formatDate(file.date)}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-gray-500 font-semibold text-md text-center col-span-full">
                              Hozircha fayllar mavjud emas.
                            </p>
                          )}
                      </div>
                    </div>
                  )}

                 {orderData?.for_purpose === 'editing' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className="flex border shadow-md px-6 py-4 rounded-lg bg-white h-fit">
                        <div className="flex items-center gap-4 mb-3 w-full">
                          <div className="text-5xl p-6 flex items-center justify-center rounded-full text-blue-500 bg-blue-50">
                            <FileWordOutlined />
                          </div>
                          <div className="flex flex-col">
                            <h4 className="text-gray-800 font-semibold text-xl truncate w-40">Hujat</h4>
                            <p className="text-lg">{currentUserInfo?.name}</p>
                            <p className="text-gray-500 mt-1">{currentUserInfo?.type_user}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[150px]">
                          <button
                            onClick={() => {
                              const openWordURL = `ms-word:ofe|u|${messageFileURL}`;
                              const link = document.createElement("a");
                              link.href = openWordURL;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                          >
                            <span>Ko'rish</span>
                            <EyeOutlined className="text-[24px]" />
                          </button>
                          <button
                            onClick={() => {
                              const openWordURL = `ms-word:ofe|u|${messageFileURL}`;
                              const link = document.createElement("a");
                              link.href = openWordURL;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                          >
                            <span>O'zgartirish</span>
                            <Pencil className="text-[24px]" />
                          </button>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = messageFileURL;
                              link.setAttribute('download', 'file.docm');
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                          >
                            <span>Yuklab olish</span>
                            <DownloadOutlined className="text-[24px]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                
                
                {orderData?.for_purpose === 'performer' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="flex border shadow-md px-6 py-4 rounded-lg bg-white h-fit">
                        <div className="flex items-center gap-4 mb-3 w-full">
                          <div className="text-5xl p-6 flex items-center justify-center rounded-full text-blue-500 bg-blue-50">
                            <FileWordOutlined />
                          </div>
                          <div className="flex flex-col">
                            <h4 className="text-gray-800 font-semibold text-xl truncate w-40">Buyurtma hati</h4>
                            <p className="text-lg">{currentUserInfo?.name}</p>
                            <p className="text-gray-500 mt-1">{currentUserInfo?.type_user}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[150px]">
                          <button
                            onClick={() => {
                              const openWordURL = `ms-word:ofe|u|${serviceFileURL}`;
                              const link = document.createElement("a");
                              link.href = openWordURL;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                          >
                            <span>Ko'rish</span>
                            <EyeOutlined className="text-[24px]" />
                          </button>
                          <button
                            onClick={() => {
                              const openWordURL = `ms-word:ofe|u|${serviceFileURL}`;
                              const link = document.createElement("a");
                              link.href = openWordURL;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                          >
                            <span>O'zgartirish</span>
                            <Pencil className="text-[24px]" />
                          </button>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = serviceFileURL;
                              link.setAttribute('download', 'file.docm');
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                          >
                            <span>Yuklab olish</span>
                            <DownloadOutlined className="text-[24px]" />
                          </button>
                          <button
                              onClick={() => {
                                setEImzoOpen(true);
                                setCurrentSigningType('buyurtma');
                                webSocketService.sendMessage(
                                  JSON.stringify({ plugin: "pfx", name: "list_all_certificates" })
                                );
                              }}
                              className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                            >
                              <span>Tasdiklash</span>
                              <Check className="text-[24px]" />
                          </button>
                        </div>
                    </div>
                     <div className="flex border shadow-md px-6 py-4 rounded-lg bg-white h-fit">
                        <div className="flex items-center gap-4 mb-3 w-full">
                          <div className="text-5xl p-6 flex items-center justify-center rounded-full text-blue-500 bg-blue-50">
                            <FileWordOutlined />
                          </div>
                          <div className="flex flex-col">
                            <h4 className="text-gray-800 font-semibold text-xl truncate w-40">Xizmat hati</h4>
                            <p className="text-lg">{currentUserInfo?.name}</p>
                            <p className="text-gray-500 mt-1">{currentUserInfo?.type_user}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[150px]">
                          <button
                            onClick={() => {
                              const openWordURL = `ms-word:ofe|u|${serviceFileURL}`;
                              const link = document.createElement("a");
                              link.href = openWordURL;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                          >
                            <span>Ko'rish</span>
                            <EyeOutlined className="text-[24px]" />
                          </button>
                          <button
                            onClick={() => {
                              const openWordURL = `ms-word:ofe|u|${serviceFileURL}`;
                              const link = document.createElement("a");
                              link.href = openWordURL;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                          >
                            <span>O'zgartirish</span>
                            <Pencil className="text-[24px]" />
                          </button>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = serviceFileURL;
                              link.setAttribute('download', 'file.docm');
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                          >
                            <span>Yuklab olish</span>
                            <DownloadOutlined className="text-[24px]" />
                          </button>
                          <button
                            onClick={() => {
                              setXizmatEImzoOpen(true);
                              setCurrentSigningType('xizmat');
                              webSocketService.sendMessage(
                                JSON.stringify({ plugin: "pfx", name: "list_all_certificates" })
                              );
                            }}
                            className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                          >
                            <span>Tasdiklash</span>
                            <Check className="text-[24px]" />
                          </button>
                        </div>
                    </div>
                  </div>
                )}

                 {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      {requests_files.length !== 0 ? (
                        requests_files.map((file, index) => {
                          const { icon, color, bg } = getFileIcon(file.file_name);
                          return (
                            <div
                              key={index}
                              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-3 flex flex-col justify-between"
                            >
                              <div className="flex justify-between">
                                <div className="flex items-center justify-between flex-1 px-2 py-7 h-full">
                                  <div className={`p-3 rounded-lg ${bg} flex items-center justify-center`}>
                                    <div className={`${color} text-3xl`}>{icon}</div>
                                  </div>
                                  <div className="flex flex-col justify-center">
                                    <h4 className="text-gray-800 font-semibold text-sm truncate w-40">
                                      {file.file_name}
                                    </h4>
                                    <p className="text-gray-700 text-[12px]">{file.user}</p>
                                    <p className="text-gray-500 text-[12px] mt-1">{formatDate(file.date)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-500 font-semibold text-md text-center col-span-full">
                          
                        </p>
                      )}
                    </div> */}
                <hr/>
                <>
                { orderData.for_purpose === "from_region" &&
                <>
                <div>
                   {/* IJROCHILAR START */}
                    <div className="bg-transparent rounded-md p-2 flex justify-between mb-2">
                      <div>
                        <h1 className='text-xl text-[#000] font-semibold'>Ijrochilar</h1>
                      </div>
                      <div className='flex items-center gap-3'>
                        <button className='group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'
                          onClick={() => { fetchSenderEmployees(), setShowIjrochiModal(true); }}
                        >
                          <div className='bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors'>
                            <Plus className='w-3.5 h-3.5' />
                          </div>
                          Ijrochilar Kiritish
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      {orderData.performers && orderData.performers.length > 0 ? (
                        orderData.performers.map((performer, index) => (
                          <div
                            key={index}
                            className="bg-white w-[300px] h-[160px] rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
                          >
                            <div className="p-5">
                              {/* Row number qo'shildi */}
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-semibold text-gray-500">№ {performer.row_number}</span>
                              </div>
                              
                              <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-1">Ijrochi xodim</p>
                                <p className="text-sm font-semibold text-gray-900">{performer?.performer?.name}</p>
                              </div>

                              <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-1">Izoh</p>
                                <p className="text-sm text-gray-700">{performer.description}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="w-full flex flex-col items-center justify-center py-10 rounded-lg border-gray-200">
                          <p className="text-gray-500 text-sm font-medium">Ijrochilar mavjud emas</p>
                        </div>
                      )}
                    </div>
                  {/* IJROCHILAR END */}
                </div>
                <hr/>
                </>
                }
                <div>
                 

                  <div className="bg-transparent rounded-md p-2 flex justify-between mb-2">
                    <div>
                      <h1 className='text-xl text-[#000] font-semibold'>Imzolovchilar</h1>
                    </div>
                    <div className='flex items-center gap-3'>
                      <button className='group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'
                        onClick={() => { fetchEmployees(), setShowEmployeeModal(true); }}
                      >
                        <div className='bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors'>
                          <Plus className='w-3.5 h-3.5' />
                        </div>
                        Kiritish
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {orderData.executors && orderData.executors.length > 0 ? (
                      orderData.executors.map((executor, index) => (
                        <div
                          key={index}
                          className="bg-white w-[300px] h-[160px] rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
                        >
                          <div className="p-5">
                            {/* Header with number and status */}
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm font-semibold text-gray-500">№ {index + 1}</span>
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
                                {executor?.executor_type?.name}
                              </span>
                            </div>

                            {/* Employee info */}
                            <div className="mb-4">
                              <p className="text-sm text-gray-500 mb-1">Imzolovchi xodim</p>
                              <p className="text-sm font-semibold text-gray-900">{executor?.executor?.name}</p>
                            </div>

                            {/* Message */}
                            {executor.message && (
                              <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-1">Imzolash holati</p>
                                <p className="text-sm text-gray-700">{executor.message}</p>
                              </div>
                            )}

                            {/* Date */}
                            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500">Sana</p>
                              <p className="text-sm text-gray-900 font-medium">{executor.confirmation_date}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full flex flex-col items-center justify-center py-10 rounded-lg border-gray-200">
                        <p className="text-gray-500 text-sm font-medium">Imzolovchilar mavjud emas</p>
                      </div>
                    )}
                  </div>

                </div>
                <hr/>
                </>

                {/* Attach document */}
                <div className='flex items-center justify-between p-6'>
                  <div>
                    <h1 className='text-xl text-[#000] font-semibold'>Hujjatlar ruyhati</h1>
                  </div>
                  <div>
                    <button
                      onClick={() => setFileUploadModal(true)}
                      className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'
                      aria-label="Hujjat biriktirish"
                    >
                      <div className='bg-white/20 p-2 rounded-md group-hover:bg-white/30 transition-colors'>
                        <FilePlus2 className='w-3 h-3' />
                      </div>
                      <span>Hujjat biriktirish</span>
                    </button>
                  </div>
                </div>

                {fileUploadModal && (
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

                <div className="bg-white rounded-xl mb-6 overflow-x-auto">
                  {files.length !== 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {files.map((file, index) => {
                        const { icon, color, bg } = getFileIcon(file.file_name);
                        return (
                          <div
                            key={index}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-3 flex flex-col justify-between"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[13px] font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                                {orderData.exit_number}-{file.raw_number}
                              </span>
                            </div>

                            <div className='flex '>
                              <div className="flex items-center gap-4 mb-3">
                                <div className={`p-3 rounded-lg ${bg}`}>
                                  <div className={`${color} text-3xl`}>{icon}</div>
                                </div>
                                <div className="flex flex-col">
                                  <h4 className="text-gray-800 font-semibold text-[12px] truncate w-40">
                                    {file.file_name}
                                  </h4>
                                  {file.user}
                                  <p className="text-gray-500 text-[12px] mt-1">{formatDate(file.date)}</p>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => deleteFile(file)}
                                  className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition"
                                  title="Ko'rish"
                                >
                                  <Trash className="text-lg text-red-600" />
                                </button>
                                <button
                                  onClick={() => setSelectedFile(file)}
                                  className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition"
                                  title="Ko'rish"
                                >
                                  <EyeOutlined className="text-lg" />
                                </button>
                                <button
                                  onClick={() => handleDownload(file)}
                                  className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition"
                                  title="Yuklab olish"
                                >
                                  <DownloadOutlined className="text-lg" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 font-semibold text-md text-center">
                      Hozircha fayllar mavjud emas.
                    </p>
                  )}

                  {selectedFile && (
                    <div
                      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
                      onClick={() => setSelectedFile(null)}
                    >
                      <div
                        className="bg-white w-11/12 h-[90vh] rounded-xl overflow-hidden shadow-xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <iframe
                          src={`https://ekomplektasiya.uz/ekomplektasiya_backend/hs/republic-orders/${id}/file/${selectedFile.raw_number}`}
                          title="PDF Viewer"
                          className="flex-1 border-none"
                        />
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="bg-purple-600 hover:bg-purple-700 text-white py-2 font-medium"
                        >
                          Yopish
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 right-0 left-0 bg-white border-t border-gray-200 shadow-sm z-40 px-6 py-4 flex flex-wrap md:flex-nowrap items-center justify-between">
              {/* Text Area */}
              <div className='flex-1 max-w-md'>
                <TextArea
                  placeholder='Qisqacha mazmun yozing...'
                  className='rounded-xl border-2 border-gray-200 focus:border-blue-400 hover:border-gray-300 transition-colors shadow-sm'
                  style={{ height: "30px" }}
                />
              </div>

              <div className='flex gap-4'>
                {/* Save Button */}
                <button
                  className='group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'
                  onClick={handleUpdateOrder}
                  aria-label="Saqlash"
                >
                  <div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
                    <CircleCheckBig className="w-3 h-3" />
                  </div>
                  <span>Tasdiqlash</span>
                </button>

                {/* Save Button */}
                <button
                  className='group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'
                  onClick={handleUpdateOrder}
                  aria-label="Saqlash"
                >
                  <div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
                    <Save className="w-3 h-3" />
                  </div>
                  <span>Saqlash</span>
                </button>

                <button
                  className='group bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'
                  onClick={() => { fetchSenderEmployees(), setshowRecepModal(true); }}
                  aria-label="Saqlash"
                >
                  <div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
                    <Save className='w-3 h-3' />
                  </div>
                  <span>Yuborish</span>
                </button>
                <button
                  className='group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'
                  onClick={handleDeleteOrder}
                  aria-label="O'chirish"
                >
                  <div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
                    <Trash className="w-3 h-3" />
                  </div>
                  <span>O'chirish</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <RepublicOrderSining  />
          </>
        )
      }

      {
        showRemainders && (
          <SelectRemainsModal onClose={() => setShowRemainders(false)} remainders={remainders} />
        )
      }

      {showEmployeeModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowEmployeeModal(false)}
        >
          <div
            className="bg-white rounded-lg w-[900px] p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-lg font-semibold">Imzolovchi hodimni tanlang</h2>
              <button
                className="text-xl font-bold hover:text-black cursor-pointer"
                onClick={() => setShowEmployeeModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="max-h-[400px] max-w-[800px] overflow-y-auto">
              {employees.length === 0 ? (
                <div className="text-center py-6 text-gray-500">Ma'lumot topilmadi</div>
              ) : (
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-center px-4 py-2 text-sm font-semibold">Tanlash</th>
                      <th className="text-left px-4 py-2 text-sm font-semibold">Xodim</th>
                      <th className="text-left px-4 py-2 text-sm font-semibold">Lavozimi</th>
                      <th className="text-left px-4 py-2 text-sm font-semibold">Imzolovchi turi	</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, index) => {
                      const existingExecutor = orderData?.executors?.find(e => e.executor.id === emp.id);
                      return (
                        <tr
                          key={index}
                          className={`hover:bg-blue-50 transition ${existingExecutor ? "bg-blue-100" : ""}`}
                        >
                          <td className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={!!existingExecutor}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const newExecutor = {
                                    executor: {
                                      id: emp.id,
                                      name: emp.name
                                    },
                                    executor_type: emp.executor_type || executorType[0]?.id || "",
                                    status: { id: '', name: '' },
                                    message: "",
                                    confirmation_date: new Date().toISOString(),
                                  };
                                  setOrderData(prev => prev ? {
                                    ...prev,
                                    executors: [...(prev.executors || []), newExecutor]
                                  } : prev);
                                } else {
                                  setOrderData(prev => prev ? {
                                    ...prev,
                                    executors: prev.executors.filter(e => e.executor.id !== emp.id)
                                  } : prev);
                                }
                              }}
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-800">{emp.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-800">{emp.position}</td>
                          <td>
                            <Select
                              placeholder="Imzolovchi turini tanlang"
                              style={{ width: 200 }}
                              value={
                                existingExecutor?.executor_type && typeof existingExecutor.executor_type === 'object'
                                  ? existingExecutor.executor_type.id
                                  : existingExecutor?.executor_type || undefined
                              }
                              onChange={(value) => {
                                setOrderData(prev => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    executors: prev.executors.map(e =>
                                      e.executor.id === emp.id
                                        ? {
                                          ...e,
                                          executor_type: value
                                        }
                                        : e
                                    )
                                  };
                                });
                              }}
                            >
                              {executorType.map((type) => (
                                <Select.Option key={type.id} value={type.id}>
                                  {type.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end mt-5">
              <Button
                type="primary"
                onClick={handleSelectEmployee}
              >
                Tanlash
              </Button>
            </div>
          </div>
        </div>
      )}


      {showRecepModal && (
				<div
					className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
					onClick={() => setshowRecepModal(false)}
				>
					<div
					className="bg-white rounded-lg w-[600px] p-6 shadow-lg"
					onClick={(e) => e.stopPropagation()}
					>
					<div className="flex items-center justify-between border-b pb-3 mb-4">
						<h2 className="text-lg font-semibold">Viloyatdan qabul qiluvchi xodimni tanlang</h2>
						<button
						className="text-xl font-bold hover:text-red-500"
						onClick={() => setshowRecepModal(false)}
						>
						&times;
						</button>
					</div>

					<div className="max-h-[400px] overflow-y-auto">
						{loading ? ( // ✅ Modal uchun alohida loading
						<div className="text-center py-6 text-gray-500">Yuklanmoqda...</div>
						) : sender_employees.length === 0 ? (
						<div className="text-center py-6 text-gray-500">Ma'lumot topilmadi</div>
						) : (
						<table className="w-full border-collapse">
							<thead className="bg-gray-50 border-b">
							<tr>
								<th className="text-center px-4 py-2 text-sm font-semibold">Tanlash</th>
								<th className="text-left px-4 py-2 text-sm font-semibold">F.I.Sh.</th>
								<th className="text-center px-4 py-2 text-sm font-semibold">Lavozimi</th>
							</tr>
							</thead>
							<tbody>
							{sender_employees.map((emp, index) => (
								<tr key={index} className="hover:bg-blue-50 transition">
								<td className="px-4 py-2 text-center">
									<input
									type="checkbox"
									onChange={(e) => {
										if (e.target.checked) {
										setSenderToSale({
											order_id: orderData?.id || "",
											receiver_sale: emp.id,
											receiver_republic_name: emp.name,
										});
										} else {
										setSenderToSale(null);
										}
									}}
									checked={SenderToSale?.receiver_sale === emp.id}
									/>
								</td>
								<td className="px-4 py-2 text-sm text-gray-800">{emp.name}</td>
								<td className="px-4 py-2 text-sm text-gray-800">{emp.position}</td>
								</tr>
							))}
							</tbody>
						</table>
						)}
					</div>

					{/* Pagination */}
					{totalCount > limit && (
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-2 text-sm">
						<span className="text-gray-600">
							Jami: {totalCount} ta | Sahifa: {currentPage} / {totalPages}
						</span>

						<div className="flex flex-wrap justify-center gap-2">
							<Button
							size="middle"
							disabled={currentPage === 1 || senderEmployeesLoading} // ✅ Modal loading
							onClick={() => handleModalPageClick(currentPage - 1)} // ✅ Yangi funksiya
							>
							<ArrowBigLeftDash className="w-4 h-4" />
							</Button>

							{generatePageNumbers().map((page) => (
							<Button
								key={page}
								size="middle"
								type={page === currentPage ? "primary" : "default"}
								onClick={() => handleModalPageClick(page)} // ✅ Yangi funksiya
							>
								{page}
							</Button>
							))}

							<Button
							size="middle"
							disabled={currentPage === totalPages || senderEmployeesLoading} // ✅ Modal loading
							onClick={() => handleModalPageClick(currentPage + 1)} // ✅ Yangi funksiya
							>
							<ArrowBigRightDash className="w-4 h-4" />
							</Button>
						</div>
						</div>
					)}

					<div className="flex justify-end mt-5">
						<Button type="primary" onClick={addSendToSale}>
						Saqlash
						</Button>
					</div>
					</div>
				</div>
		)}
    {showIjrochiModal && (
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        onClick={() => setShowIjrochiModal(false)}
      >
        <div
          className="bg-white rounded-lg w-[600px] p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h2 className="text-lg font-semibold">Ijrochilarni tanlang</h2>
            <button
              className="text-xl font-bold hover:text-red-500"
              onClick={() => setShowIjrochiModal(false)}
            >
              &times;
            </button>
          </div>

          <div className="max-h-[400px] max-w-[700px] overflow-y-auto">
            {sender_employees.length === 0 ? (
              <div className="text-center py-6 text-gray-500">Ma'lumot topilmadi</div>
            ) : (
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-center px-4 py-2 text-sm font-semibold">№</th>
                    <th className="text-center px-4 py-2 text-sm font-semibold">Tanlash</th>
                    <th className="text-left px-4 py-2 text-sm font-semibold">F.I.Sh.</th>
                    <th className="text-center px-4 py-2 text-sm font-semibold">Lavozimi</th>
                  </tr>
                </thead>
                <tbody>
                  {sender_employees.map((emp, index) => {
                    const isChecked = orderData?.performers?.some(
                      performer => performer.performer.id === emp.id
                    );
                    
                    return (
                      <tr
                        key={index}
                        className={`hover:bg-blue-50 transition ${isChecked ? "bg-blue-100" : ""}`}
                      >
                        <td className="px-4 py-2 text-center text-sm font-semibold">
                          {index + 1}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              setOrderData(prev => {
                                if (!prev) return prev;
                                
                                if (e.target.checked) {
                                  // Add new performer with row_number
                                  const newPerformer = {
                                    performer: {
                                      id: emp.id,
                                      name: emp.name
                                    },
                                    description: "",
                                    row_number: (prev.performers?.length || 0) + 1 // <- yangi row_number
                                  };
                                  return {
                                    ...prev,
                                    performers: [...(prev.performers || []), newPerformer]
                                  };
                                } else {
                                  // Remove performer and reorder row_numbers
                                  const filteredPerformers = prev.performers.filter(
                                    performer => performer.performer.id !== emp.id
                                  );
                                  
                                  // Reorder row_numbers
                                  const reorderedPerformers = filteredPerformers.map((performer, idx) => ({
                                    ...performer,
                                    row_number: idx + 1
                                  }));
                                  
                                  return {
                                    ...prev,
                                    performers: reorderedPerformers
                                  };
                                }
                              });
                            }}
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">{emp.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-800">{emp.position}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
      </div>

            <div className="flex justify-end mt-5">
              <Button
                type="primary"
                onClick={handleSelectIjrochi}
              >
                Saqlash
              </Button>
            </div>
          </div>
        </div>
      )}
      <Modal
        title={
          deleteModalError
            ? null
            : "Buyurtmani o‘chirishni tasdiqlaysizmi?"
        }
        open={isDeleteModalOpen}
        closable={!deleteModalError}
        maskClosable={!deleteModalError}
        width={deleteModalError ? 520 : 420}
        centered
        footer={
          deleteModalError
            ? [
              <Button
                key="ok"
                type="primary"
                onClick={cancelDelete}
                style={{
                  width: 120,
                  fontWeight: 600,
                }}
              >
                OK
              </Button>,
            ]
            : [
              <Button key="cancel" onClick={cancelDelete}>
                Bekor qilish
              </Button>,
              <Button key="delete" danger onClick={confirmDelete}>
                Ha, o‘chirish
              </Button>,
            ]
        }
        bodyStyle={{
          textAlign: "center",
          padding: deleteModalError ? "50px 30px" : "26px",
        }}
      >
        {deleteModalError && (
          <p
            style={{
              color: "#ff4d4f",
              fontSize: "20px",
              fontWeight: "700",
              textAlign: "center",
              lineHeight: "1.8",
            }}
          >
            {deleteModalError}
          </p>
        )}
      </Modal>


      <Modal
        title="Buyurtma hatini imzolash!"
        open={eImzoOpen}
        onCancel={() => {
          setEImzoOpen(false);
          webSocketService.disconnect()
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
          // (ixtiyoriy) vizual ogohlantirish – expired qatorda qizil fon
          rowClassName={(record: CertificateParsed) =>
            isExpired(record.validTo) ? "bg-red-50 text-red-600" : ""
          }
          rowSelection={{
            type: "radio",
            // tanlangan qator kalitiga name dan foydalanamiz
            selectedRowKeys: selectedCertRow ? [selectedCertRow.name] : [],
            // 🔒 expired bo'lsa tanlashni o'chiramiz
            getCheckboxProps: (record: CertificateParsed) => ({
              disabled: isExpired(record.validTo),
              title: isExpired(record.validTo) ? "Muddati tugagan — tanlab bo‘lmaydi" : undefined,
            }),
            onChange: (_keys, selectedRows) => {
              const cert = (selectedRows[0] as CertificateParsed) || null;
              if (!cert) {
                setSelectedCertRow(null);
                setSelectedCertificate(null);
                return;
              }
              if (isExpired(cert.validTo)) {
                // teoriya bo‘yicha buni bosib bo‘lmaydi, lekin baribir xavfsizlik uchun
                toast("Bu kalitning muddati tugagan, tanlab bo‘lmaydi.", { type: "warning" });
                return;
              }
              setSelectedCertRow(cert);
              setSelectedCertificate({
                plugin: "pfx",
                name: "load_key",
                arguments: [`${cert.disk}`, `${cert.path}`, `${cert.name}`, `${cert.alias}`],
              });
            },
          }}
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
      <Modal
        title="Xizmat hatini imzolash!"
        open={xizmatEImzoOpen}
        onCancel={() => {
          setXizmatEImzoOpen(false);
          setCurrentSigningType(null);
          setSelectedCertificate(null);
        }}
        style={{ minWidth: "800px" }}
        footer={[
          <Button key="cancel" onClick={() => {
             setXizmatEImzoOpen(false);
            setCurrentSigningType(null);
            setSelectedCertificate(null);
          }}>  
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
          // (ixtiyoriy) vizual ogohlantirish – expired qatorda qizil fon
          rowClassName={(record: CertificateParsed) =>
            isExpired(record.validTo) ? "bg-red-50 text-red-600" : ""
          }
          rowSelection={{
            type: "radio",
            // tanlangan qator kalitiga name dan foydalanamiz
            selectedRowKeys: selectedCertRow ? [selectedCertRow.name] : [],
            // 🔒 expired bo'lsa tanlashni o'chiramiz
            getCheckboxProps: (record: CertificateParsed) => ({
              disabled: isExpired(record.validTo),
              title: isExpired(record.validTo) ? "Muddati tugagan — tanlab bo‘lmaydi" : undefined,
            }),
            onChange: (_keys, selectedRows) => {
              const cert = (selectedRows[0] as CertificateParsed) || null;
              if (!cert) {
                setSelectedCertRow(null);
                setSelectedCertificate(null);
                return;
              }
              if (isExpired(cert.validTo)) {
                // teoriya bo‘yicha buni bosib bo‘lmaydi, lekin baribir xavfsizlik uchun
                toast("Bu kalitning muddati tugagan, tanlab bo‘lmaydi.", { type: "warning" });
                return;
              }
              setSelectedCertRow(cert);
              setSelectedCertificate({
                plugin: "pfx",
                name: "load_key",
                arguments: [`${cert.disk}`, `${cert.path}`, `${cert.name}`, `${cert.alias}`],
              });
            },
          }}
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

export default RegionOrderDetail;



