import React, { useState, useEffect, useContext } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  Avatar,
  message,
  Radio,
  Breadcrumb,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";
import { LoginContext } from "../../store/LoginContext";

const { Option } = Select;

const AddCoachByCommerciale = () => {
  const [form] = Form.useForm();
  const [specialities, setSpecialities] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const user = useContext(LoginContext);
  console.log('user', user)

  useEffect(() => {
    fetchSpecialities();
    form.setFieldsValue({ commercialName: user.decodedToken.name });
  }, []);

  const fetchSpecialities = async () => {
    try {
      const response = await axios.get(
        "https://go-ko-9qul.onrender.com/speciality"
      );
      setSpecialities(response.data);
    } catch (error) {
      console.error("Error fetching specialities:", error);
      message.error("Failed to fetch specialities");
    }
  };

  const handleSave = async (values) => {
    const coachData = {
      ...values,
      commercialId: user.decodedToken.userId, // Automatically assign the commercial ID
    };

    try {
      const token = localStorage.getItem("token");
      await axios.post("https://go-ko-9qul.onrender.com/coaches", coachData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("Coach ajouté avec succès");
      form.resetFields();
      setUploadedFileName("");
      setImageUrl("");
    } catch (error) {
      console.error(
        "Error saving coach:",
        error.response ? error.response.data : error.message
      );
      message.error("Erreur lors de la sauvegarde du coach");
    }
  };

  const handleUploadChange = (info) => {
    if (info.file.status === "uploading") {
      setUploading(true);
    }
    if (info.file.status === "done") {
      const imageUrl = info.file.response.secure_url;
      form.setFieldsValue({ image: imageUrl });
      setUploadedFileName(info.file.name);
      setImageUrl(imageUrl);
      setUploading(false);
      message.success(`${info.file.name} fichier téléchargé avec succès`);
    } else if (info.file.status === "error") {
      console.error(
        "Erreur de téléchargement:",
        info.file.error,
        info.file.response
      );
      message.error(`${info.file.name} échec du téléchargement du fichier.`);
      setUploading(false);
    }
  };

  const uploadProps = {
    name: "file",
    action: "https://api.cloudinary.com/v1_1/doagzivng/image/upload",
    data: {
      upload_preset: "kj1jodbh",
    },
    showUploadList: false,
    onChange: handleUploadChange,
  };

  return (
    <div className="p-4">
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/">Tableau de Bord</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/coaches">Coachs</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Ajouter Coach</Breadcrumb.Item>
      </Breadcrumb>
      <h1 className="text-xl font-bold mb-4 text-start">Ajouter un Coach</h1>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <div className="grid grid-cols-2 gap-2">
          <Form.Item
            name="prenom"
            label="Prénom"
            rules={[{ required: false, message: "Veuillez entrer le prénom" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="nom"
            label="Nom"
            rules={[{ required: false, message: "Veuillez entrer le nom" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
                 name='codepostal'
                 label='Code postal'
                 rules={[{ required: false, message: "Veuillez entrer le Code postal'" }]}
                 >
                  <Input />
                 </Form.Item>
          <Form.Item
              name="raisonsociale"
              label="Raison sociale"
              rules={[{ required: false, message: "Veuillez entrer le Raison sociale" }]}
              >
              <Input />
              </Form.Item>
              <Form.Item
              name="siret"
              label="SIRET"
              rules={[{ required: false, message: "Veuillez entrer le siret" }]}
            >
              <Input />
            </Form.Item>
              <Form.Item
                 name='adresse'
                 label='Adresse'
                 rules={[{ required: false, message: "Veuillez entrer lAdresse'" }]}
                 >
                  <Input />
                 </Form.Item>
         
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: false, message: "Veuillez entrer l'email" }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Téléphone"
            rules={[
              { required: false, message: "Veuillez entrer le téléphone" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="age"
            label="Âge"
            rules={[{ required: false, message: "Veuillez entrer l'âge" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="sex"
            label="Sexe"
            rules={[
              { required: false, message: "Veuillez sélectionner le sexe" },
            ]}
          >
            <Select>
              <Option value="homme">Homme</Option>
              <Option value="femme">Femme</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="ville"
            label="Ville"
            rules={[{ required: false, message: "Veuillez entrer la ville" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="speciality"
            label="Spécialité"
            rules={[
              {
                required: false,
                message: "Veuillez sélectionner la spécialité",
              },
            ]}
          >
            <Select mode="multiple" showSearch optionFilterProp="children" allowClear>
              {specialities.map((speciality) => (
                <Option key={speciality._id} value={speciality._id}>
                  {speciality.nom}
                </Option>
              ))}
            </Select>
     
          </Form.Item>
          <Form.Item name="commercialName">
            <Input />
          </Form.Item>
          
          <Form.Item name="image" label="Image">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} loading={uploading}>
                Télécharger
              </Button>
            </Upload>
            {uploadedFileName && (
              <div className="flex items-center mt-2">
                <Avatar
                  src={imageUrl}
                  alt="Uploaded Image"
                  size={50}
                  className="mr-2"
                />
                <span>{uploadedFileName}</span>
                <Button
                  type="link"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    form.setFieldsValue({ image: "" });
                    setUploadedFileName("");
                    setImageUrl("");
                  }}
                />
              </div>
            )}
          </Form.Item>
        </div>
        <Form.Item className="mt-2">
          <Button type="primary" htmlType="submit">
            Ajouter Coach
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddCoachByCommerciale;
