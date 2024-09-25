import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Popconfirm,
  Breadcrumb,
  Avatar,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Link } from "react-router-dom";

const ListeAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token"); // Récupérer le token du local storage
      const response = await axios.get(
        "https://go-ko-9qul.onrender.com/admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAdmins(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des admins:", error);
      message.error("Échec de la récupération des admins");
    }
  };

  const showEditModal = (admin) => {
    setCurrentAdmin(admin);
    form.setFieldsValue({ ...admin, password: "" }); // Réinitialiser le champ mot de passe
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentAdmin(null);
    form.resetFields();
  };

  const handleDelete = async (adminId) => {
    try {
      const token = localStorage.getItem("token"); // Récupérer le token du local storage
      await axios.delete(`https://go-ko-9qul.onrender.com/admin/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedAdmins = admins.filter((admin) => admin._id !== adminId);
      setAdmins(updatedAdmins);
      message.success("Admin supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'admin:", error);
      message.error("Échec de la suppression de l'admin");
    }
  };

  const handleUploadChange = (info) => {
    if (info.file.status === "uploading") {
      console.log("Téléchargement en cours...");
    }
    if (info.file.status === "done") {
      const imageUrl = info.file.response.secure_url;
      form.setFieldsValue({ imageUrl });
      if (currentAdmin) {
        setAdmins(
          admins.map((admin) =>
            admin._id === currentAdmin._id ? { ...admin, imageUrl } : admin
          )
        );
      }
      message.success(`${info.file.name} fichier téléchargé avec succès`);
    } else if (info.file.status === "error") {
      console.error(
        "Erreur de téléchargement:",
        info.file.error,
        info.file.response
      );
      message.error(`Échec du téléchargement du fichier ${info.file.name}.`);
    }
  };

  const handleRemoveImage = () => {
    form.setFieldsValue({ imageUrl: null });
    if (currentAdmin) {
      setAdmins(
        admins.map((admin) =>
          admin._id === currentAdmin._id ? { ...admin, imageUrl: null } : admin
        )
      );
    }
  };

  const handleFinish = async (values) => {
    try {
      const token = localStorage.getItem("token"); // Récupérer le token du local storage
      if (currentAdmin) {
        await axios.put(
          `https://go-ko-9qul.onrender.com/admin/${currentAdmin._id}`,
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAdmins(
          admins.map((admin) =>
            admin._id === currentAdmin._id ? { ...admin, ...values } : admin
          )
        );
        message.success("Admin mis à jour avec succès");
      } else {
        const response = await axios.post(
          "https://go-ko-9qul.onrender.com/admin",
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAdmins([...admins, response.data]);
        message.success("Admin créé avec succès");
      }
      handleCancel();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'admin:", error);
      message.error("Échec de l'enregistrement de l'admin");
    }
  };

  const getInitials = (prenom, nom) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const columns = [
    {
      title: "Admin",
      key: "admin",
      render: (text, record) => (
        <div className="flex items-center">
          {record.imageUrl ? (
            <img
              src={record.imageUrl}
              alt="Admin"
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <Avatar
              style={{ backgroundColor: "#87d068" }}
              size={40}
              className="mr-2"
            >
              {getInitials(record.prenom, record.nom)}
            </Avatar>
          )}
          <span className="ml-2">{`${record.prenom} ${record.nom}`}</span>
        </div>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Mot de passe",
      key: "password",
      render: (text, record) => (
        <div className="flex items-center">
          <span>••••••••</span> {/* Le mot de passe n'est pas affiché */}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div className="flex space-x-2">
          <Button
            onClick={(e) => {
              e.stopPropagation(); // Empêcher le déclenchement du clic sur la ligne
              showEditModal(record);
            }}
            style={{
              backgroundColor: "green",
              color: "white",
              borderColor: "green",
            }}
            icon={<EditOutlined />}
            shape="circle"
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cet admin ?"
            onConfirm={(e) => {
              e.stopPropagation(); // Empêcher le déclenchement du clic sur la ligne
              handleDelete(record._id);
            }}
            okText="Oui"
            cancelText="Non"
            onCancel={(e) => e.stopPropagation()} // Empêcher le déclenchement du clic sur la ligne
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              shape="circle"
              onClick={(e) => e.stopPropagation()} // Empêcher le déclenchement du clic sur la ligne
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const uploadProps = {
    name: "file",
    action: "https://api.cloudinary.com/v1_1/doagzivng/image/upload",
    data: {
      upload_preset: "kj1jodbh",
    },
    listType: "picture",
    onChange: handleUploadChange,
  };

  return (
    <div className="p-4">
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/">Tableau de Bord</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Admin</Breadcrumb.Item>
        <Breadcrumb.Item>Liste des Admins</Breadcrumb.Item>
      </Breadcrumb>
      <h1 className="text-2xl font-bold mb-4">Liste des Admins</h1>
      <Button
        type="primary"
        onClick={() => setIsModalVisible(true)}
        className="mb-4"
        icon={<PlusOutlined />}
      >
        Ajouter un Admin
      </Button>
      <Table
        columns={columns}
        dataSource={admins}
        rowKey="_id"
        scroll={{ x: "max-content" }}
        onRow={(record) => ({
          onClick: () => {
            showEditModal(record);
          },
        })}
      />
      <Modal
        title={currentAdmin ? "Modifier Admin" : "Ajouter Admin"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Form form={form} onFinish={handleFinish} layout="vertical">
          <Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[{ required: currentAdmin ? false : true }]}
          >
            <Input.Password
              placeholder={
                currentAdmin
                  ? "Laissez vide pour garder le mot de passe actuel"
                  : "Entrez le mot de passe"
              }
            />
          </Form.Item>
          <Form.Item name="imageUrl" label="Image">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Télécharger</Button>
            </Upload>
            {form.getFieldValue("imageUrl") && (
              <div className="flex items-center mt-2">
                <img
                  src={form.getFieldValue("imageUrl")}
                  alt="Admin"
                  className="w-12 h-12 rounded-full"
                />
                <Button
                  onClick={handleRemoveImage}
                  type="link"
                  danger
                  className="ml-2"
                >
                  Supprimer
                </Button>
              </div>
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {currentAdmin ? "Mettre à jour" : "Créer"}
            </Button>
            <Button onClick={handleCancel} className="ml-2">
              Annuler
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListeAdmins;
