import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Breadcrumb,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  message,
  Upload,
  Image,
  Avatar,
  Tabs,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  UploadOutlined,
  DeleteOutlined,
  UserSwitchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import "tailwindcss/tailwind.css";

const { Option } = Select;
const { TabPane } = Tabs;

const getInitials = (prenom, nom) => {
  if (!prenom || !nom) return "";
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
};

const CoachDetailsPage = () => {
  const { id } = useParams();
  const [coach, setCoach] = useState(null);
  const [commercials, setCommercials] = useState([]);
  const [comments, setComments] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchCoach = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://go-ko-9qul.onrender.com/coaches/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCoach(response.data);
    } catch (error) {
      console.error("Error fetching coach:", error);
    }
  };

  const fetchCommercials = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://go-ko-9qul.onrender.com/commercials",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCommercials(response.data);
    } catch (error) {
      console.error("Error fetching commercials:", error);
    }
  };

  const fetchSpecialities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://go-ko-9qul.onrender.com/speciality",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSpecialities(response.data);
    } catch (error) {
      console.error("Error fetching specialities:", error);
    }
  };

  useEffect(() => {
    fetchCoach();
    fetchCommercials();
    fetchSpecialities();

    if (location.pathname.includes("comments")) {
      setActiveTab("2");
    }
  }, [id, location]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "2") {
      navigate(`/coach/${id}/comments`);
    } else if (key === "3") {
      navigate(`/CréerContrat/${id}`);
    } else if (key === "4") {
      navigate(`/planning/${id}`);
    } else {
      navigate(`/coach/${id}`);
    }
  };

  const handleEdit = () => {
    form.setFieldsValue({
      ...coach,
      speciality: coach.speciality.map((speciality) => speciality._id),
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleAssignCancel = () => {
    setIsAssignModalVisible(false);
    assignForm.resetFields();
  };

  const handleSave = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `https://go-ko-9qul.onrender.com/coaches/${id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Coach mis à jour avec succès");
      setIsModalVisible(false);
      form.resetFields();

      // Update the coach state with the new specialties
      const updatedCoach = {
        ...coach,
        ...values,
        speciality: specialities.filter((s) =>
          values.speciality.includes(s._id)
        ),
      };
      console.log("Updated Coach:", updatedCoach);
      setCoach(updatedCoach);
    } catch (error) {
      console.error(
        "Error saving coach:",
        error.response ? error.response.data : error.message
      );
      message.error("Erreur lors de la sauvegarde du coach");
    }
  };

  const handleAssign = async (values) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://go-ko-9qul.onrender.com/coaches/${id}`,
        { commercial: values.commercial },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Commercial assigné avec succès");
      setIsAssignModalVisible(false);
      setCoach({
        ...coach,
        commercial: commercials.find((c) => c._id === values.commercial),
      });
    } catch (error) {
      console.error("Erreur lors de l'affectation du commercial:", error);
      message.error("Erreur lors de l'affectation du commercial");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://go-ko-9qul.onrender.com/coaches/${id}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments(comments.filter((comment) => comment._id !== commentId));
      message.success("Commentaire supprimé avec succès");
    } catch (error) {
      console.error("Error deleting comment:", error);
      message.error("Erreur lors de la suppression du commentaire");
    }
  };

  const confirmDelete = (commentId) => {
    Modal.confirm({
      title: "Êtes-vous sûr de vouloir supprimer ce commentaire ?",
      onOk: () => handleDeleteComment(commentId),
      onCancel() {
        console.log("Annulation de la suppression");
      },
    });
  };

  if (!coach) {
    return <div>Chargement...</div>;
  }

  const isString = (value) => typeof value === "string";
  const isNumber = (value) => typeof value === "number";

  const data = [
    { key: "1", field: "Nom", value: isString(coach.nom) ? coach.nom : "N/A" },
    {
      key: "2",
      field: "Prénom",
      value: isString(coach.prenom) ? coach.prenom : "N/A",
    },
    {
      key: "3",
      field: "Email",
      value: isString(coach.email) ? coach.email : "N/A",
    },
    {
      key: "4",
      field: "Téléphone",
      value: isString(coach.phone) ? coach.phone : "N/A",
    },

    { key: "5", field: "Âge", value: isString(coach.age) ? coach.age : "N/A" },
    { key: "6", field: "Sexe", value: isString(coach.sex) ? coach.sex : "N/A" },
    {
      key: "7",
      field: "Spécialité",
      value: Array.isArray(coach.speciality)
        ? coach.speciality.map((s) => s.nom).join(", ")
        : "N/A",
    },
    {
      key: "8",
      field: "Ville",
      value: isString(coach.ville) ? coach.ville : "N/A",
    },
    {
      key: "10",
      field: "Commercial",
      value: coach.commercial
        ? `${coach.commercial.prenom} ${coach.commercial.nom}`
        : "Non affecté",
    },
    {
      key: "11",
      field: "SIRET",
      value: isString(coach.siret) ? coach.siret : "N/A",
    },
    {
      key: "12",
      field: "Raison sociale",
      value: isString(coach.raisonsociale) ? coach.raisonsociale : "N/A",
    },
    {
      key: "13",
      field: "Adresse",
      value: isString(coach.adresse) ? coach.adresse : "N/A",
    },
    {
      key: "14",
      field: "Code postal",
      value: isNumber(coach.codepostal) ? coach.codepostal : "N/A",
    },
  ];

  const columns = [
    {
      dataIndex: "field",
      key: "field",
      width: "30%",
      render: (text) => <span className="font-bold">{text}</span>,
      className: "py-1 px-2",
    },
    {
      dataIndex: "value",
      key: "value",
      className: "py-1 px-2",
      render: (text, record) => (
        <div className="flex justify-between items-center">
          <span>{text}</span>
          {record.field === "Commercial" && (
            <Button
              icon={<UserSwitchOutlined />}
              onClick={() => setIsAssignModalVisible(true)}
              size="small"
            >
              Changer
            </Button>
          )}
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
    showUploadList: false,
    onChange: (info) => {
      if (info.file.status === "done") {
        const imageUrl = info.file.response.secure_url;
        form.setFieldsValue({ imageUrl });
        setCoach({ ...coach, imageUrl });
        message.success(`${info.file.name} fichier téléchargé avec succès`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} échec du téléchargement du fichier.`);
      }
    },
  };

  const commentColumns = [
    {
      title: "Commentaire",
      dataIndex: "commentaire",
      key: "commentaire",
    },
    {
      title: "Commercial",
      dataIndex: "commercialId",
      key: "commercialId",
      render: (text) => {
        const commercial = commercials.find(
          (commercial) => commercial._id === text
        );
        return commercial
          ? `${commercial.nom} ${commercial.prenom}`
          : "Commercial inconnu";
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => {
        const date = new Date(text);
        return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <span key={record._id}>
          <Button
            icon={<EditOutlined style={{ color: "green" }} />}
            onClick={() => handleEditComment(record)}
            style={{
              marginRight: 8,
              backgroundColor: "white",
              borderColor: "green",
              color: "green",
            }}
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce commentaire ?"
            onConfirm={() => handleDeleteComment(record._id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              icon={<DeleteOutlined style={{ color: "red" }} />}
              style={{
                backgroundColor: "white",
                borderColor: "red",
                color: "red",
              }}
            />
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 border rounded shadow-lg mt-4">
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/list-coachs">Coachs</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Détails du Coach</Breadcrumb.Item>
      </Breadcrumb>
      <div className="text-center">
        <h1 className="text-xl font-bold mb-4 flex items-center justify-center">
          Détails du Coach
        </h1>
        <div className="text-center">
          <span className="ml-7 px-2 py-1 bg-green-600 text-white font-bold rounded">
            {coach.prenom} {coach.nom}
          </span>
        </div>
      </div>
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="Informations" key="1">
          <div className="text-center mb-4">
            {coach.imageUrl ? (
              <img
                src={coach.imageUrl}
                alt="Coach"
                className="w-24 h-24 rounded-full mx-auto"
              />
            ) : (
              <Avatar
                style={{ backgroundColor: "#87d068", fontSize: "26px" }}
                size={70}
              >
                {getInitials(coach.prenom, coach.nom)}
              </Avatar>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Table
              dataSource={data.slice(0, Math.ceil(data.length / 2))}
              columns={columns}
              pagination={false}
              bordered
              rowClassName="bg-white"
              className="mb-4 custom-table"
            />
            <Table
              dataSource={data.slice(Math.ceil(data.length / 2))}
              columns={columns}
              pagination={false}
              bordered
              rowClassName="bg-white"
              className="mb-4 custom-table"
            />
          </div>
        </TabPane>
        <TabPane tab="Commentaires" key="2">
          <Button type="primary" icon={<PlusOutlined />}>
            Ajouter un Commentaire
          </Button>
          <Table
            columns={commentColumns}
            dataSource={comments.map((comment) => ({
              ...comment,
              key: comment._id,
            }))}
            rowKey="_id"
            className="mt-4"
            scroll={{ x: "max-content" }}
          />
        </TabPane>
        <TabPane tab="Contrat" key="3">
          <Button type="primary" icon={<PlusOutlined />}>
            Créer un contract
          </Button>
        </TabPane>
        <TabPane tab="Planning" key="4">
          <Button type="primary" icon={<PlusOutlined />}>
            Créer un contract
          </Button>
        </TabPane>
      </Tabs>
      <div className="flex justify-between items-center mt-4">
        <Link to="/list-coachs" className="text-blue-500 hover:underline">
          &lt; Retour
        </Link>
        <Button
          type="primary"
          style={{ backgroundColor: "green", borderColor: "green" }}
          icon={<EditOutlined />}
          onClick={handleEdit}
        >
          Modifier Coach
        </Button>
      </div>
      <Modal
        title="Modifier Coach"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        centered
        // className="fixed-modal"

        className="fixed-modal rounded-lg shadow-lg p-4 bg-white"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <div className="grid grid-cols-2 overflow-y-auto p-4 max-h-96 gap-2">
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
              name="speciality"
              label="Spécialité"
              rules={[
                {
                  required: true,
                  message: "Veuillez sélectionner la spécialité",
                },
              ]}
            >
              <Select mode="multiple">
                {specialities.map((speciality) => (
                  <Option key={speciality._id} value={speciality._id}>
                    {speciality.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="ville"
              label="Ville"
              rules={[{ required: true, message: "Veuillez entrer la ville" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="siret"
              label="Siret"
              rules={[{ required: true, message: "Veuillez entrer le siret" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="raisonsociale"
              label="Raison sociale"
              rules={[
                {
                  required: true,
                  message: "Veuillez entrer la raison sociale",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="adresse"
              label="Adresse"
              rules={[{ required: true, message: "Veuillez entrer l'adresse" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="codepostal"
              label="Code postal"
              rules={[
                { required: true, message: "Veuillez entrer le code postal" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Image">
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Télécharger</Button>
              </Upload>
              {coach.imageUrl && (
                <div className="flex items-center mt-2">
                  <Image
                    src={coach.imageUrl}
                    alt="Uploaded Image"
                    width={50}
                    height={50}
                    className="mr-2"
                  />
                  <span>{coach.imageUrl.split("/").pop()}</span>
                  <Button
                    type="link"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      form.setFieldsValue({ imageUrl: "" });
                      setCoach({ ...coach, imageUrl: "" });
                    }}
                  />
                </div>
              )}
            </Form.Item>
          </div>
          <Form.Item className="mt-2">
            <Button type="primary" htmlType="submit">
              Enregistrer les modifications
            </Button>
            <Button onClick={handleCancel} className="ml-2">
              Annuler
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Affecter un nouveau Commercial"
        visible={isAssignModalVisible}
        onCancel={handleAssignCancel}
        footer={null}
        centered
        className="fixed-modal"
      >
        <Form form={assignForm} layout="vertical" onFinish={handleAssign}>
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
                  {commercial.prenom} {commercial.nom}
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
    </div>
  );
};

export default CoachDetailsPage;
