import React, { useState } from "react";
import { Upload, Button, message, List, Modal, Table, Breadcrumb } from "antd";
import {
  UploadOutlined,
  FileExcelOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import axios from "axios";
import { Link } from "react-router-dom";

const ExcelImport = ({ onImportSuccess = () => {} }) => {
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [importedFiles, setImportedFiles] = useState([]);

  const handleUpload = ({ file }) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length) {
        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        const clients = rows.map((row) => {
          const client = {};
          headers.forEach((header, index) => {
            client[header.toLowerCase()] = row[index];
          });

          // Remplace les valeurs invalides pour le champ 'type'
          if (client.type === "qualifié") {
            client.type = "prospect_qlf";
          }

          // Combine les champs d'adresse en une seule chaîne si ils existent
          client.address = client["address"] || "";

          // Supprime le champ 'password' s'il existe
          delete client.password;

          return client;
        });

        console.log("Données des clients analysées:", clients);
        setFileData(clients);
        setFileName(file.name);
        message.success("Fichier téléchargé avec succès");
      } else {
        message.error("Aucune donnée trouvée dans le fichier");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleTransfer = () => {
    if (fileData) {
      // Filtrer les entrées invalides
      const validData = fileData.filter(
        (client) =>
          client.nom &&
          client.prenom &&
          client.email &&
          client.phone &&
          client.sex &&
          client.address &&
          client.age &&
          client.type
      );

      // Vérifier les emails dupliqués ou nuls
      const emailSet = new Set();
      const uniqueData = validData.filter((client) => {
        if (!client.email || emailSet.has(client.email)) {
          return false;
        }
        emailSet.add(client.email);
        return true;
      });

      if (uniqueData.length !== validData.length) {
        message.error(
          "Certaines entrées ont des e-mails en double ou manquants"
        );
        return;
      }

      console.log("Transfert des données suivantes au backend:", uniqueData);

      const token = localStorage.getItem("token"); // Récupérer le token JWT

      axios
        .post("https://go-ko-9qul.onrender.com/clients/import", uniqueData, {
          headers: {
            Authorization: `Bearer ${token}`, // Inclure le token JWT dans les en-têtes
          },
        })
        .then((response) => {
          message.success("Clients importés avec succès");
          onImportSuccess(response.data);
          setImportedFiles([...importedFiles, fileName]); // Ajouter le nom du fichier à l'archive
          setFileData(null);
          setFileName(null);
        })
        .catch((error) => {
          console.error("Erreur lors de l'importation des clients:", error);
          const errorMessage =
            error.response && error.response.data && error.response.data.message
              ? error.response.data.message
              : "Erreur inconnue";
          message.error(
            `Erreur lors de l'importation des clients: ${errorMessage}`
          );
        });
    } else {
      message.error("Aucune donnée à transférer");
    }
  };

  const handleRemove = () => {
    setFileData(null);
    setFileName(null);
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";
      if (!isExcel) {
        message.error(`${file.name} n'est pas un fichier Excel`);
      }
      return isExcel || Upload.LIST_IGNORE;
    },
    customRequest: handleUpload,
  };

  const columns =
    fileData && fileData.length > 0
      ? Object.keys(fileData[0]).map((key) => ({
          title: key,
          dataIndex: key,
          key,
        }))
      : [];

  return (
    <div className="p-4">
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/">Tableau de Bord</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/list-clients">Liste des Clients</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Importer Fichiers</Breadcrumb.Item>
      </Breadcrumb>
      <h2 className="text-lg font-bold mb-4">Importer des Clients :</h2>
      <Upload {...uploadProps} showUploadList={false}>
        <Button icon={<UploadOutlined />}>Télécharger le fichier Excel</Button>
      </Upload>
      {fileName && (
        <div className="mt-4">
          <List
            itemLayout="horizontal"
            dataSource={[fileName]}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={<DeleteOutlined />}
                    onClick={handleRemove}
                  />,
                  <Button type="link" onClick={() => setIsModalVisible(true)}>
                    Aperçu
                  </Button>,
                ]}
              >
                <List.Item.Meta avatar={<FileExcelOutlined />} title={item} />
              </List.Item>
            )}
          />
          <Button type="primary" onClick={handleTransfer} className="mt-4">
            Transférer dans la base de données
          </Button>
        </div>
      )}
      <Modal
        title="Aperçu du fichier Excel"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={columns}
          dataSource={fileData}
          rowKey={(record) => `${record.nom}-${record.email}`}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Modal>
      <div className="mt-4">
        <h2>Archive des fichiers importés</h2>
        <List
          itemLayout="horizontal"
          dataSource={importedFiles}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta avatar={<FileExcelOutlined />} title={item} />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default ExcelImport;
