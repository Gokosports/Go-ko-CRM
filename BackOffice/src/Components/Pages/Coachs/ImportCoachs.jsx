import React, { useState, useEffect } from "react";
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
  const [specialityMap, setSpecialityMap] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("https://go-ko-9qul.onrender.com/speciality", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const specialities = response.data;
        const specialityMap = specialities.reduce((acc, speciality) => {
          acc[speciality.nom.toLowerCase()] = speciality;
          return acc;
        }, {});
        setSpecialityMap(specialityMap);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des spécialités:", error);
        message.error("Échec de la récupération des spécialités");
      });
  }, []);

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

        const coaches = rows.map((row) => {
          const coach = {};
          headers.forEach((header, index) => {
            coach[header.toLowerCase()] = row[index];
          });

          coach.ville = coach.ville;
          coach.speciality = coach.speciality;
          delete coach.password;

          return coach;
        });

        console.log("Données des coachs analysées:", coaches);
        setFileData(coaches);
        setFileName(file.name);
        message.success("Fichier téléchargé avec succès");
      } else {
        message.error("Aucune donnée trouvée dans le fichier");
      }
    };
    reader.readAsBinaryString(file);
  };

  const addNewSpeciality = async (specialityName, specialitySet) => {
    if (specialitySet.has(specialityName.toLowerCase())) {
      return null;
    }
    specialitySet.add(specialityName.toLowerCase());

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://go-ko-9qul.onrender.com/speciality",
        { nom: specialityName, description: specialityName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const newSpeciality = response.data;
      setSpecialityMap((prev) => ({
        ...prev,
        [newSpeciality.nom.toLowerCase()]: newSpeciality,
      }));
      return newSpeciality._id;
    } catch (error) {
      console.error("Erreur lors de l'ajout de la nouvelle spécialité:", error);
      message.error("Échec de l'ajout de la nouvelle spécialité");
      return null;
    }
  };

  const handleTransfer = async () => {
    if (!fileData) {
      message.error("Aucune donnée à transférer");
      return;
    }

    try {
      const validData = fileData.filter((coach) => {
        return (

          coach.phone &&
          coach.ville &&
          coach.raisonsociale &&
          coach.siret &&
          coach.adresse &&
          coach.codepostal
        );
      });

      console.log("Données valides:", validData);

      const emailSet = new Set();
    const uniqueData = validData.map((coach) => {
      if (coach.email) {
        emailSet.add(coach.email);
      }
      return coach; // Return coach regardless of email presence
    });
      // const emailSet = new Set();
      // const uniqueData = validData.filter((coach) => {
      //   // if (coach.email) {
      //   //   return false;
      //   // }
      //   // emailSet.add(coach.email);
      //   // return true;
      //   if (coach.email) {
      //     return false; // This will always return false for any coach with an email.
      // }
      // emailSet.add(coach.email);
      // return true; 
      // });

      // if (uniqueData.length !== validData.length) {
      //   message.error(
      //     "Certaines entrées ont des e-mails en double ou manquants"
      //   );
      //   return;
      // }

      console.log("Données uniques:", uniqueData);

      const specialitySet = new Set();
      const dataWithSpecialityIds = await Promise.all(
        uniqueData.map(async (coach) => {
          const specialities = coach.speciality
            ? await Promise.all(
                coach.speciality.split(",").map(async (speciality) => {
                  const trimmedSpeciality = speciality.trim();
                  const lowerCaseSpeciality = trimmedSpeciality.toLowerCase();
                  if (specialityMap[lowerCaseSpeciality]) {
                    return specialityMap[lowerCaseSpeciality]._id;
                  } else {
                    const newSpecialityId = await addNewSpeciality(
                      trimmedSpeciality,
                      specialitySet
                    );
                    console.log(
                      `Nouvelle spécialité ajoutée: ${trimmedSpeciality} avec ID: ${newSpecialityId}`
                    );
                    return newSpecialityId;
                  }
                })
              )
            : [];
          return {
            ...coach,
            speciality: specialities,
          };
        })
      );

      console.log("Données avec ID de spécialité:", dataWithSpecialityIds);

      const cleanedData = dataWithSpecialityIds.map((coach) => {
        coach.speciality = coach.speciality.filter(
          (speciality) => speciality !== null && speciality !== undefined
        );
        return coach;
      });

      console.log("Données nettoyées à transférer:", cleanedData);

      const token = localStorage.getItem("token"); // Récupérer le token JWT

      const response = await axios.post(
        "https://go-ko-9qul.onrender.com/coaches/import",
        cleanedData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Inclure le token JWT dans les en-têtes
          },
        }
      );

      message.success("Coachs importés avec succès");
      onImportSuccess(response.data);
      setImportedFiles([...importedFiles, fileName]);
      setFileData(null);
      setFileName(null);
    } catch (error) {
      console.error("Erreur lors de l'importation des coachs:", error);
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Erreur inconnue";
      message.error(`Erreur lors de l'importation des coachs: ${errorMessage}`);
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
          <Link to="/list-coachs">Liste des Coachs</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Importer Fichiers</Breadcrumb.Item>
      </Breadcrumb>
      <h2 className="text-lg font-bold mb-4">Importer des Coachs :</h2>
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
