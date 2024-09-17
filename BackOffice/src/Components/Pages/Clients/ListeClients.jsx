import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Upload,
  Breadcrumb,
  Avatar,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "tailwindcss/tailwind.css";

const { Option } = Select;

const clientTypes = [
  { label: "Tous", value: "all" },
  { label: "Client Actif", value: "client_actif" },
  { label: "Prospect VRG", value: "prospect_vr" },
  { label: "Prospect Qlf", value: "prospect_qlf" },
];

const getInitials = (prenom, nom) => {
  if (!prenom || !nom) return "";
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
};

const ClientTable = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [editingClient, setEditingClient] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isUnassignModalVisible, setIsUnassignModalVisible] = useState(false); // Ajout pour désaffecter
  const [selectedClients, setSelectedClients] = useState([]);
  const [commercials, setCommercials] = useState([]);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [unassignForm] = Form.useForm(); // Formulaire pour désaffecter
  const [filterType, setFilterType] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchClients(); // Fetch clients and apply the filter immediately
    fetchCommercials();
  }, []);

  const handleCategoryClick = async (id, categoryType) => {
    try {
      const token = localStorage.getItem("token");

      // Update filter type on the backend
      const response = await axios.put(
        `https://go-ko.onrender.com/clients/${id}/filter`,
        { filterType: categoryType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        // Get the updated list of clients from the server
        const updatedResponse = await axios.get(
          "https://go-ko.onrender.com/clients",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updatedClients = updatedResponse.data;

        // Update the client list and filter type
        setClients(updatedClients);
        setFilterType(categoryType);
        localStorage.setItem("filterType", categoryType);

        // Apply the filter
        filterClients(categoryType, updatedClients);
      } else {
        message.error("Unable to update client type");
      }
    } catch (error) {
      console.error("Error updating client type:", error);
      message.error("Error updating client type");
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://go-ko.onrender.com/clients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          setClients(response.data);
          filterClients(filterType, response.data); // Apply filter after fetching
        } else {
          message.error("Error fetching clients data");
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        message.error("Error fetching clients");
      }
    };

    fetchClients();
  }, [filterType]); // Re-run when filterType changes

  useEffect(() => {
    const fetchFilterPreference = async () => {
      const id = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!id) {
        console.error("User ID is missing in localStorage");
        return;
      }

      try {
        const response = await axios.get(
          `https://go-ko.onrender.com/clients/${id}/filtered`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { filterType } = response.data;
        setFilterType(filterType || "all"); // Set the filter type

        if (clients.length > 0) {
          filterClients(filterType || "all", clients); // Apply the filter
        }
      } catch (error) {
        console.error("Error fetching filter preference:", error);
      }
    };

    fetchFilterPreference();
  }, [clients]); // Ensure this runs when clients are fetched

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://go-ko.onrender.com/clients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(response.data)) {
        setClients(response.data);
        filterClients(filterType, response.data);
        setPagination((prev) => ({ ...prev, total: response.data.length }));
      } else {
        message.error("Erreur lors de la récupération des données des clients");
      }
    } catch (error) {
      console.error("Error fetching client by ID:", error);
      message.error("Erreur lors de la récupération des données du client");
    }
  };

  // Handle filtering clients by type
  const filterClients = (type, clientList) => {
    if (type === "all") {
      setFilteredClients(clientList); // Show all clients if 'all' is selected
    } else {
      const filtered = clientList.filter((client) => client.type === type);
      setFilteredClients(filtered); // Only show clients with the selected type
    }
  };

  const handleFilterClick = (type) => {
    setFilterType(type);
    filterClients(type, clients);
  };

  const fetchCommercials = async () => {
    try {
      const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
      const response = await axios.get("https://go-ko.onrender.com/commercials", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCommercials(response.data);
    } catch (error) {
      console.error("Error fetching commercials:", error);
      message.error("Erreur lors de la récupération des commerciaux");
    }
  };

  const handleUploadChange = (info) => {
    if (info.file.status === "uploading") {
      setUploading(true);
    }
    if (info.file.status === "done") {
      const imageUrl = info.file.response.secure_url;
      form.setFieldsValue({ imageUrl });
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

  const handleClientClick = (client) => {
    navigate(`/client/${client._id}`);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    form.setFieldsValue({
      ...client,
      commercial: client.commercial ? client.commercial._id : undefined,
    });
    setUploadedFileName(
      client.imageUrl ? client.imageUrl.split("/").pop() : ""
    );
    setImageUrl(client.imageUrl || "");
    setIsModalVisible(true);
  };

  const handleDelete = async (clientId) => {
    try {
      const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
      await axios.delete(`https://go-ko.onrender.com/clients/${clientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedClients = clients.filter(
        (client) => client._id !== clientId
      );
      setClients(updatedClients);
      filterClients(filterType, updatedClients);
      setPagination({ ...pagination, total: updatedClients.length });
      message.success("Client supprimé avec succès");
    } catch (error) {
      console.error("Error deleting client:", error);
      message.error("Erreur lors de la suppression du client");
    }
  };

  const handleSave = async (values) => {
    console.log("Données envoyées pour ajout de client:", values);
    try {
      const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
      if (editingClient) {
        await axios.put(
          `https://go-ko.onrender.com/clients/${editingClient._id}`,
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        message.success("Client mis à jour avec succès");
      } else {
        const res = await axios.post("https://go-ko.onrender.com/clients", values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("responseclients", res);
        message.success("Client ajouté avec succès");
      }
      fetchClients();
      setIsModalVisible(false);
      form.resetFields();
      setEditingClient(null);
      setUploadedFileName("");
      setImageUrl("");
    } catch (error) {
      console.error(
        "Error saving client:",
        error.response ? error.response.data : error.message
      );
      message.error("Erreur lors de la sauvegarde du client");
    }
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingClient(null);
    setUploadedFileName("");
    setImageUrl("");
  };

  const handleAssignCancel = () => {
    setIsAssignModalVisible(false);
    assignForm.resetFields();
    setSelectedClients([]);
  };

  const handleAssign = async (values) => {
    try {
      const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
      await axios.post(
        "https://go-ko.onrender.com/clients/assign-clients",
        {
          clientIds: selectedClients,
          commercialId: values.commercial,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedClients = clients.map((client) => {
        if (selectedClients.includes(client._id)) {
          return {
            ...client,
            commercial: commercials.find(
              (com) => com._id === values.commercial
            ),
          };
        }
        return client;
      });
      setClients(updatedClients);
      filterClients(filterType, updatedClients);

      message.success("Clients affectés au commercial avec succès");
      setIsAssignModalVisible(false);
      setSelectedClients([]);
    } catch (error) {
      console.error("Erreur lors de l'affectation des clients:", error);
      message.error("Erreur lors de l'affectation des clients");
    }
  };

  const handleUnassign = async () => {
    try {
      const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
      await axios.post(
        "https://go-ko.onrender.com/clients/unassign-clients",
        {
          clientIds: selectedClients,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedClients = clients.map((client) => {
        if (selectedClients.includes(client._id)) {
          return {
            ...client,
            commercial: null,
          };
        }
        return client;
      });
      setClients(updatedClients);
      filterClients(filterType, updatedClients);

      message.success("Clients désaffectés du commercial avec succès");
      setIsUnassignModalVisible(false);
      setSelectedClients([]);
    } catch (error) {
      console.error("Erreur lors de la désaffectation des clients:", error);
      message.error("Erreur lors de la désaffectation des clients");
    }
  };
  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const columns = [
    {
      title: "Nom Prénom",
      key: "nomPrenom",
      render: (text, record) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => handleClientClick(record)}
        >
          {record.imageUrl ? (
            <img
              src={record.imageUrl}
              alt="Client"
              className="w-9 h-9 rounded-full mr-2"
            />
          ) : (
            <Avatar
              style={{ backgroundColor: "navy", marginRight: "20px" }}
              size={40}
              className="mr-2"
            >
              {getInitials(record.prenom, record.nom)}
            </Avatar>
          )}
          <span>
            {record.nom} {record.prenom}
          </span>
        </div>
      ),
    },
    {
      title: "Téléphone",
      dataIndex: "phone",
      key: "phone",
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleClientClick(record)}
        >
          {record.phone}
        </div>
      ),
    },
    {
      title: "Âge",
      dataIndex: "age",
      key: "age",
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleClientClick(record)}
        >
          {record.age}
        </div>
      ),
    },
    {
      title: "Sex",
      dataIndex: "sex",
      key: "sex",
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleClientClick(record)}
        >
          {record.sex}
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type, record) => (
        <div className="flex gap-2">
          <Button
            className={`btn ${
              type === "client_actif" ? "btn-active" : "btn-inactive"
            }`}
            onClick={() => handleCategoryClick(record._id, "client_actif")}
          >
            Client Actif
          </Button>
          <Button
            className={`btn ${
              type === "prospect_vr" ? "btn-active" : "btn-inactive"
            }`}
            onClick={() => handleCategoryClick(record._id, "prospect_vr")}
          >
            Prospect VRG
          </Button>
          <Button
            className={`btn ${
              type === "prospect_qlf" ? "btn-active" : "btn-inactive"
            }`}
            onClick={() => handleCategoryClick(record._id, "prospect_qlf")}
          >
            Prospect QLF
          </Button>
        </div>
      ),
    },

    {
      title: "Adresse",
      dataIndex: "address",
      key: "address",
      render: (address, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleClientClick(record)}
        >
          {address || "N/A"}
        </div>
      ),
    },
    {
      title: "Commercial",
      key: "commercial",
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleClientClick(record)}
        >
          {record.commercial
            ? `${record.commercial.prenom} ${record.commercial.nom}`
            : "N/A"}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            style={{ backgroundColor: "green", color: "white" }}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce client?"
            onConfirm={() => handleDelete(record._id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              icon={<DeleteOutlined />}
              style={{ backgroundColor: "red", color: "white" }}
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedClients(selectedRowKeys);
    },
    selectedRowKeys: selectedClients,
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
          <Link to="/list-clients">Clients</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Liste des Clients</Breadcrumb.Item>
      </Breadcrumb>
      <h1 className="text-xl font-bold mb-4 text-start">Liste des Clients</h1>
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="space-x-2">
          {clientTypes.map((type) => (
            <Button
              key={type.value}
              type={filterType === type.value ? "primary" : "default"}
              onClick={() => handleFilterClick(type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredClients}
        // dataSource={filteredClients.map(client => ({ ...client, key: client._id }))}
        rowKey="_id"
        scroll={{ x: 600 }}
        rowSelection={rowSelection}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredClients.length,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
          },
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} total`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        className="fixed-modal"
        title={editingClient ? "Modifier Client" : "Ajouter Client"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <div className="grid grid-cols-2 gap-2">
            <Form.Item
              name="prenom"
              label="Prénom"
              rules={[{ required: true, message: "Veuillez entrer le prénom" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="nom"
              label="Nom"
              rules={[{ required: true, message: "Veuillez entrer le nom" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: "Veuillez entrer l'email" }]}
            >
              <Input type="email" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Téléphone"
              rules={[
                { required: true, message: "Veuillez entrer le téléphone" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="age"
              label="Âge"
              rules={[{ required: true, message: "Veuillez entrer l'âge" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="sex"
              label="Sexe"
              rules={[
                { required: true, message: "Veuillez sélectionner le sexe" },
              ]}
            >
              <Select>
                <Option value="homme">Homme</Option>
                <Option value="femme">Femme</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="address"
              label="Adresse"
              rules={[{ required: true, message: "Veuillez entrer l'adresse" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="commercial" label="Commercial">
              <Select placeholder="Sélectionnez un commercial">
                {commercials.map((commercial) => (
                  <Option key={commercial._id} value={commercial._id}>
                    {commercial.nom} {commercial.prenom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="imageUrl" label="Image">
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
                      form.setFieldsValue({ imageUrl: "" });
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
              {editingClient
                ? "Enregistrer les modifications"
                : "Ajouter Client"}
            </Button>
            <Button onClick={handleCancel} className="ml-2">
              Annuler
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Affecter les Clients au Commercial"
        visible={isAssignModalVisible}
        onCancel={handleAssignCancel}
        footer={null}
      >
        <Form form={assignForm} onFinish={handleAssign}>
          <Form.Item
            name="commercial"
            label="Commercial"
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner un commercial",
              },
            ]}
          >
            <Select placeholder="Sélectionnez un commercial">
              {commercials.map((commercial) => (
                <Option key={commercial._id} value={commercial._id}>
                  {commercial.nom} {commercial.prenom}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Affecter
            </Button>
            <Button onClick={handleAssignCancel} className="ml-2">
              Annuler
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Désaffecter les Clients du Commercial"
        visible={isUnassignModalVisible}
        onCancel={() => setIsUnassignModalVisible(false)}
        footer={null}
      >
        <Form form={unassignForm} onFinish={handleUnassign}>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Désaffecter
            </Button>
            <Button
              onClick={() => setIsUnassignModalVisible(false)}
              className="ml-2"
            >
              Annuler
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientTable;
