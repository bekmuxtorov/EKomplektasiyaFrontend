/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal, Table } from "antd";
import Typography from "@mui/material/Typography";
import {
  EyeOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

import { axiosAPI } from "@/services/axiosAPI";
import webSocketService from "@/services/webSocket";

import FilePreviewModal from "@/components/files/FilePreviewModal";
import FilePreviewer from "@/components/files/FilePreviewer";
import { arrayBufferToFile, inferMimeFromExt } from "@/utils/file_preview";

function capitalizeWords(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// "2027.09.19 18:19:43" / "2027-09-19 18:19:43" ni ishonchli parse qiladi
const parseEimzoDate = (s?: string | null) => {
  if (!s) return null;
  const cleaned = s.trim().replace(/\./g, "-"); // YYYY.MM.DD -> YYYY-MM-DD
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
  executor: IdName;
  status: IdName;
  message: string;
  confirmation_date: string;
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
}

interface FileData {
  raw_number: string;
  user: string;
  file_name: string;
  extension: string;
  date: string;
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

const DistrictOrderSigning: React.FC = () => {
  const { id } = useParams();

  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [files, setFiles] = useState<FileData[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [selectedFileMeta, setSelectedFileMeta] = useState<FileData | null>(
    null
  );
  // yuqoridagi state'lar yoniga qo'shing
  const [selectedCertRow, setSelectedCertRow] = useState<CertificateParsed | null>(null);

  const [signingData, setSigningData] = useState<{
    document_name: string;
    id: string;
    data: any;
    number:number;
  }>({
    document_name: "ЗаявкаПоРайонам",
    number:0,
    id: id ?? "",
    data: ""
  });


  const [messageFile, setMessageFile] = useState<File | null>(null);
  const [messageFileBinary, setMessageFileBinary] = useState<string | null>(null);
  const [eImzoOpen, setEImzoOpen] = useState(false);
  const [certificates, setCertificates] = useState<CertificateParsed[]>([]);
  const [keyID, setKeyID] = useState("")
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateDetails | null>(null);

  // 📌 Buyurtma tafsilotlarini olish
  const fetchOrderDetail = useCallback(async () => {
    try {
      const response = await axiosAPI.get(`district-orders/detail/${id}`);
      setOrderData(response.data[0]);
    } catch (error) {
      console.error("Order detail error:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // 📌 Fayllarni olish
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axiosAPI.get(
          `district-orders/${id}/files/list`
        );
        if (Array.isArray(response.data)) setFiles(response.data);
      } catch (error) {
        console.error("Files fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMessageFile = async () => {
      try {
        const response = await axiosAPI.get(
          `district-orders/${id}/order-file/`
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

  // 📅 Sana formatlash
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

  // 📁 Fayl iconlari
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
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

  // 📡 WebSocket orqali sertifikatlarni olish
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

  useEffect(() => {
    if (signingData.data) {
      signingDocument()
    }
  }, [signingData.data, signingDocument])

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

  // 📥 Sertifikat tanlash
  const handleSelectCertificate = () => {
    if (selectedCertificate) {
      webSocketService.sendMessage(JSON.stringify(selectedCertificate));
    }
  };

  const handleView = async (f: FileData) => {
    try {
      setSelectedFileMeta(f);
      const res = await axiosAPI.get(
        `district-orders/${id}/file/${f.raw_number}`,
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
        `district-orders/${id}/file/${f.raw_number}`,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 text-xl">Ma'lumotlar topilmadi</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen py-4 px-2 bg-white">
        <div className="max-w-8xl mx-auto bg-white">
          {/* 📄 QR Code & E-IMZO */}
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

          {/* 📜 Tovarlar ro‘yxati */}
          <Typography fontSize={20} fontWeight={600} color="#0f172b" className="mb-2">
            Buyurtma uchun berilgan tovarlar ro‘yхati
          </Typography>
          <div className="bg-white rounded-xl mb-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2">
                  <tr>
                    <th>№</th>
                    <th>Tovar nomi</th>
                    <th>Model</th>
                    <th>Tovar turi</th>
                    <th>O‘lcham</th>
                    <th>O‘lchov birligi</th>
                    <th>Soni</th>
                    <th>Izoh</th>
                  </tr>
                </thead>
                <tbody className="bg-[#f2f2f2b6]">
                  {orderData.products?.map((p, i) => (
                    <tr key={i}>
                      <td>{p.row_number}</td>
                      <td>{p.product?.name}</td>
                      <td>{p.model?.name}</td>
                      <td>{p.product_type?.name}</td>
                      <td>{p.size?.name}</td>
                      <td>{p.unit?.name}</td>
                      <td>{p.quantity}</td>
                      <td>{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 📎 Fayllar ro‘yxati */}
          <Typography fontSize={20} fontWeight={600} color="#0f172b" className="mb-4">
            Buyurtmaga biriktirilgan fayllar ro‘yxati
          </Typography>
          {files.length !== 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {files.map((file, index) => {
                const { icon, color, bg } = getFileIcon(file.file_name);
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                        {orderData.exit_number}-{file.raw_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`p-3 rounded-lg ${bg}`}>
                        <div className={`${color} text-3xl`}>{icon}</div>
                      </div>
                      <div>
                        <h4 className="text-gray-800 font-semibold text-sm truncate w-48">
                          {file.file_name}
                        </h4>
                        {file.user}
                        <p className="text-gray-500 text-sm mt-1">
                          {formatDate(file.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-auto">
                      <button
                        onClick={() => handleView(file)}
                        className="p-2 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100"
                      >
                        <EyeOutlined className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="p-2 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100"
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

      {/* 📑 PDF preview modal */}
      {selectedFileMeta && (
        <FilePreviewModal
          open={previewOpen}
          file={previewFile}
          onClose={() => {
            setPreviewOpen(false);
            setPreviewFile(null);
          }}
          onDownload={() => {
            if (selectedFileMeta) handleDownloadFile(selectedFileMeta);
          }}
        />
      )}

      {/* 📡 Sertifikatlar Modal */}
      <Modal
        title="E-IMZO maxfiy raqamini kiriting!"
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
    </>
  );
};

export default DistrictOrderSigning;