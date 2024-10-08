import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Breadcrumb,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tabs,
  Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";
import "tailwindcss/tailwind.css";

const { TabPane } = Tabs;

const CoachCommentsPage = () => {
  const { id } = useParams();
  const [comments, setComments] = useState([]);
  const [commercials, setCommercials] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentComment, setCurrentComment] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const connectedCommercial = decodedToken ? `${decodedToken.name}` : "";
  const userRole = decodedToken ? decodedToken.role : null;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `https://go-ko-9qul.onrender.com/coachs-comment/${id}/comments`
        );
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    const fetchCommercials = async () => {
      try {
        const response = await axios.get(
          "https://go-ko-9qul.onrender.com/commercials"
        );
        setCommercials(response.data);
      } catch (error) {
        console.error("Error fetching commercials:", error);
      }
    };

    fetchComments();
    fetchCommercials();
  }, [id]);

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
    setIsModalVisible(true);
  };

  const handleEditComment = (comment) => {
    setIsEdit(true);
    setCurrentComment(comment);
    form.setFieldsValue({
      commentaire: comment.commentaire,
      commercialId: comment.commercialId,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSave = async (values) => {
    try {
      const requestData = {
        ...values,
        commercialId: decodedToken.userId, // Ensure the commercial ID is included
      };

      if (isEdit && currentComment) {
        const response = await axios.put(
          `https://go-ko-9qul.onrender.com/coachs-comment/${id}/comments/${currentComment._id}`,
          requestData
        );
        setComments(
          comments.map((comment) =>
            comment._id === currentComment._id ? response.data.comment : comment
          )
        );
        message.success("Commentaire mis à jour avec succès");
      } else {
        const response = await axios.post(
          `https://go-ko-9qul.onrender.com/coachs-comment/${id}/comments`,
          requestData
        );
        setComments([...comments, response.data.comment]);
        message.success("Commentaire ajouté avec succès");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error saving comment:", error);
      message.error("Erreur lors de l'enregistrement du commentaire");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `https://go-ko-9qul.onrender.com/coachs-comment/${id}/comments/${commentId}`
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
      title: "Date de création",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => {
        const date = new Date(text);
        return isNaN(date.getTime()) ? "Date invalide" : date.toLocaleString();
      },
    },
    {
      title: "Date de modification",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text) => {
        const date = new Date(text);
        return isNaN(date.getTime()) ? "Date invalide" : date.toLocaleString();
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
  const renderCoachLink = () => {
    if (userRole === "Admin") {
      return <Link to={`/coach/${id}`}>Informations</Link>;
    } else if (userRole === "Commercial") {
      return <Link to={`/coaches/${id}`}>Informations</Link>;
    } else {
      return <span>Informations du Coach</span>; // fallback case
    }
  };
  return (
    <div className="p-4 border rounded shadow-lg mt-4">
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/list-coachs">Coachs</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={`/coach/${id}`}>Informations du Coach</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Commentaires du Coach</Breadcrumb.Item>
      </Breadcrumb>
      <Tabs defaultActiveKey="2">
      <TabPane tab={renderCoachLink()} key="1">
          {/* Add information tab content here */}
        </TabPane>
        <TabPane tab="Commentaires" key="2">
          {!isDoc() && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddComment}
            >
              Ajouter un Commentaire
            </Button>
          )}

          <Table
            columns={columns}
            dataSource={comments
              .filter((comment) => comment && comment._id)
              .map((comment) => ({ ...comment, key: comment._id }))}
            rowKey="_id"
            className="mt-4"
            scroll={{ x: "max-content" }}
          />
        </TabPane>
        <TabPane tab={<Link to={`/contrat/${id}`}>Contrat</Link>} key="3">
          {/* Add information tab content here */}
        </TabPane>
        {/* <TabPane tab={<Link to={`/planning/${id}`}>Planning</Link>} key="4">
         
        </TabPane> */}
      </Tabs>
      <Modal
        title={isEdit ? "Modifier le Commentaire" : "Ajouter un Commentaire"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="Commercial connecté">
            <Input value={connectedCommercial} disabled />
          </Form.Item>
          <Form.Item
            name="commentaire"
            label="Commentaire"
            rules={[
              { required: true, message: "Veuillez entrer un commentaire" },
            ]}
          >
            <Input.TextArea rows={4} />
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
    </div>
  );
};

export default CoachCommentsPage;
