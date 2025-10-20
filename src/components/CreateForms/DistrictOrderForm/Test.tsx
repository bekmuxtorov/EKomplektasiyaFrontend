import React, { useEffect, useState } from "react";
import webSocketService from "@/services/webSocket";
import { Button, Card, Table, Typography, Space, message } from "antd";

const { Text, Title } = Typography;

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

const Test: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [certificates, setCertificates] = useState<CertificateParsed[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    webSocketService.connect(
      "wss://127.0.0.1:64443/service/cryptapi",
      (msg) => {
        try {
          const parsed = JSON.parse(msg);
          if (parsed.certificates) {
            const mapped = parsed.certificates.map((c: CertificateRaw) => {
              const info = parseAlias(c.alias);
              return { ...c, ...info };
            });
            setCertificates(mapped);
          }
        } catch (error) {
          console.error("❌ Parse error", error);
        }
      }
    );

    const interval = setInterval(() => {
      setConnected(webSocketService.isConnected());
    }, 1000);

    return () => {
      clearInterval(interval);
      webSocketService.disconnect();
    };
  }, []);

  const handleLoadCertificates = () => {
    webSocketService.sendMessage(
      JSON.stringify({ plugin: "pfx", name: "list_all_certificates" })
    );
  };

  // alias stringni parse qilish (cn, name, surname, validfrom, validto ni ajratish)
  const parseAlias = (alias: string) => {
    const parts = alias.split(",");
    const info: Record<string, string> = {};

    parts.forEach((part) => {
      const [key, value] = part.split("=");
      if (key && value) {
        info[key.trim().toLowerCase()] = value.trim();
      }
    });

    return {
      cn: info["cn"] || "",
      firstName: info["name"] || "",
      lastName: info["surname"] || "",
      validFrom: info["validfrom"] || "",
      validTo: info["validto"] || "",
    };
  };

  const columns = [
    { title: "Disk", dataIndex: "disk", key: "disk" },
    { title: "Path", dataIndex: "path", key: "path" },
    { title: "CN", dataIndex: "cn", key: "cn" },
    { title: "Ism", dataIndex: "firstName", key: "firstName" },
    { title: "Familiya", dataIndex: "lastName", key: "lastName" },
    { title: "Boshlanish", dataIndex: "validFrom", key: "validFrom" },
    { title: "Tugash", dataIndex: "validTo", key: "validTo" },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedKeys);
    },
  };

  const handleSelect = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Iltimos, sertifikatni tanlang");
      return;
    }
    const selected = certificates.find(
      (c) => c.name === selectedRowKeys[0]
    );
    console.log("✅ Tanlangan sertifikat:", selected);
    message.success(`Tanlandi: ${selected?.firstName} ${selected?.lastName}`);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <Card>
        <Title level={4}>WebSocket Status</Title>
        <Text type={connected ? "success" : "danger"}>
          {connected ? "Ulangan ✅" : "Uzilgan ❌"}
        </Text>
      </Card>

      <Card>
        <Space direction="vertical" className="w-full">
          <Button
            type="primary"
            onClick={handleLoadCertificates}
            disabled={!connected}
          >
            Sertifikatlarni olish
          </Button>

          <Table
            rowKey="name"
            dataSource={certificates}
            columns={columns}
            rowSelection={rowSelection}
            pagination={false}
            className="mt-2"
          />

          <Button
            type="primary"
            disabled={selectedRowKeys.length === 0}
            onClick={handleSelect}
          >
            Tanlash
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Test;
