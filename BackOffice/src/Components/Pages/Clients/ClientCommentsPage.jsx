import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Breadcrumb,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tabs,
  Popconfirm,
  Spin,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "tailwindcss/tailwind.css";

const { TabPane } = Tabs;
const { Option } = Select;

const useFetch = (url, initialState = []) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, loading, error, setData };
};

const ClientCommentsPage = () => {
  const { id: clientId } = useParams();
  const {
    data: comments,
    loading: loadingComments,
    error: errorComments,
    setData: setComments,
  } = useFetch(`https://go-ko-9qul.onrender.com/clients/${clientId}/comments`);
  const {
    data: commercials,
    loading: loadingCommercials,
    error: errorCommercials,
  } = useFetch("https://go-ko-9qul.onrender.com/commercials");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentComment, setCurrentComment] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const connectedCommercial = decodedToken ? `${decodedToken.name}` : "";

  const getCommercialName = (commercialId) => {
    const commercial = commercials.find(
      (commercial) => commercial._id === commercialId
    );
    return commercial
      ? `${commercial.nom} ${commercial.prenom}`
      : "Commercial inconnu";
  };

  const handleAddComment = () => {
    setIsEdit(false);
    setCurrentComment(null);
    form.resetFields();
    form.setFieldsValue({ commercialId: decodedToken.userId });
    setIsModalVisible(true);
  };

  const handleEditComment = (comment) => {
    setIsEdit(true);
    setCurrentComment(comment);
    form.setFieldsValue(comment);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSave = async (values) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = isEdit
        ? await axios.put(
            `https://go-ko-9qul.onrender.com/clients/${clientId}/comments/${currentComment._id}`,
            values,
            config
          )
        : await axios.post(
            `https://go-ko-9qul.onrender.com/clients/${clientId}/comments`,
            values,
            config
          );

      const updatedComments = isEdit
        ? comments.map((comment) =>
            comment._id === currentComment._id ? response.data.comment : comment
          )
        : [...comments, response.data.comment];

      setComments(updatedComments);
      setIsModalVisible(false);
      form.resetFields();
      message.success("Commentaire enregistré avec succès");
    } catch (error) {
      console.error("Error saving comment:", error);
      message.error("Erreur lors de l'enregistrement du commentaire");
    }
  };

  const handleTabChange = (key) => {
    switch (key) {
      case "1":
        navigate(`/client/${clientId}`);
        break;
      case "2":
        navigate(`/client/${clientId}/comments`);
        break;
      case "3":
        navigate(`/client/${clientId}/orders`);
        break;
      case "4":
        navigate(`/client/${clientId}/calendar`);
        break;
      case "5":
        navigate(`/client/${clientId}/cart`);
        break;
      default:
        break;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `https://go-ko-9qul.onrender.com/clients/${clientId}/comments/${commentId}`,
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

  const columns = [
    {
      title: "Commentaire",
      dataIndex: "commentaire",
      key: "commentaire",
    },
    {
      title: "Commercial",
      dataIndex: "commercialId",
      key: "commercialId",
      render: (text) => getCommercialName(text),
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
      title: "Date de Modification",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text) => {
        const date = new Date(text);
        return isNaN(date.getTime())
          ? "Date Modification"
          : date.toLocaleString();
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
  const isDoc = () => {
    return decodedToken && decodedToken.role === "Admin";
  };

  return (
    <div className="p-4 border rounded shadow-lg mt-4">
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/">Tableau de Bord</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/list-clients">Clients</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={`/client/${clientId}`}>Informations du Client</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Commentaires du Client</Breadcrumb.Item>
      </Breadcrumb>
      <Tabs defaultActiveKey="2" onChange={handleTabChange}>
        <TabPane tab="Informations" key="1"></TabPane>
        <TabPane tab="Commentaires" key="2"></TabPane>
      </Tabs>
      <h2 className="text-lg font-bold mb-4">Commentaires du Client</h2>

      {!isDoc() && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddComment}
        >
          Ajouter un Commentaire
        </Button>
      )}

      {loadingComments || loadingCommercials ? (
        <Spin className="mt-4" />
      ) : (
        <Table
          columns={columns}
          dataSource={comments.map((comment) => ({
            ...comment,
            key: comment._id,
          }))}
          rowKey="_id"
          className="mt-4"
          scroll={{ x: "max-content" }}
        />
      )}
      <Modal
        title={isEdit ? "Modifier le Commentaire" : "Ajouter un Commentaire"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="commentaire"
            label="Commentaire"
            rules={[
              { required: true, message: "Veuillez entrer un commentaire" },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Commercial">
            <Input value={connectedCommercial} disabled />
          </Form.Item>
          <Form.Item
            name="commercialId"
            initialValue={decodedToken ? decodedToken.userId : ""}
            hidden
          >
            <Input type="hidden" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Enregistrer
            </Button>
            <Button onClick={handleCancel} className="ml-2">
              Annuler
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <div className="mt-4">
        <Button onClick={() => navigate(`/client/${clientId}`)}>
          &lt; Retour
        </Button>
      </div>
    </div>
  );
};

export default ClientCommentsPage;
