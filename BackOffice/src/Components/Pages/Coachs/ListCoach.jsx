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
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "tailwindcss/tailwind.css";

const { Option } = Select;
const clientTypes = [
  { label: "Tous", value: "all" },
  { label: "Client Actif", value: "client_actif" },
  { label: "Prospect VRG", value: "prospect_vr" },
  // { label: "Prospect Qlf", value: "prospect_qlf" },
];

const CoachList = () => {
  const navigate = useNavigate();
  const [specialities, setSpecialities] = useState([]);
  const [commercials, setCommercials] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isUnassignModalVisible, setIsUnassignModalVisible] = useState(false);
  const [currentCoach, setCurrentCoach] = useState(null);
  const [selectedCoaches, setSelectedCoaches] = useState([]);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [unassignForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileList, setFileList] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 8 });
  const [coaches, setCoaches] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  useEffect(() => {
    fetchCoaches();
    fetchSpecialities();
    fetchCommercials();
  }, []);

  const fetchCoaches = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No token found, please login first");
        return;
      }
      setLoading(true);
      const response = await axios.get(
        "https://go-ko-9qul.onrender.com/coaches",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCoaches(response.data);
      setFilteredClients(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coaches:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setCoaches(filteredClients); // Reset to original data when search is cleared
    } else {
      const delayDebounceFn = setTimeout(() => {
        handleSearch();
      }, 1000);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      // Perform the search with postal code filter
      setLoading(true);
      const response = await axios.get(
        `https://go-ko-9qul.onrender.com/api/search?search=${searchQuery}`
      );
      console.log("Search response:", response.data);

      // Update coaches with filtered data
      setCoaches(response.data);
      setPagination({ current: 1, pageSize: 8 }); // Reset pagination for filtered results
    } catch (error) {
      console.error("Error searching coaches:", error);
      setCoaches(filteredClients); // Reset to original state if search fails
    } finally {
      setLoading(false); // Stop loading after search completes
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

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

  const fetchCommercials = async () => {
    try {
      const response = await axios.get(
        "https://go-ko-9qul.onrender.com/commercials"
      );
      setCommercials(response.data);
    } catch (error) {
      console.error("Error fetching commercials:", error);
      message.error("Failed to fetch commercials");
    }
  };

  const handleCoachClick = (coach) => {
    navigate(`/coach/${coach._id}`);
  };

  const showEditModal = async (coach) => {
    if (specialities.length === 0) {
      await fetchSpecialities();
    }
    setCurrentCoach(coach);
    form.setFieldsValue({
      ...coach,
      ville: coach.ville || "",
      speciality: coach.speciality
        ? coach.speciality.map((speciality) => speciality._id)
        : [],
      image: coach.image || "",
    });
    setUploadedFileName(coach.image ? coach.image.split("/").pop() : "");
    setImageUrl(coach.image || "");
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentCoach(null);
    form.resetFields();
    setUploadedFileName("");
    setImageUrl("");
    setFileList([]);
  };

  const handleDelete = async (coachId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No token found, please login first");
        return;
      }

      await axios.delete(`https://go-ko-9qul.onrender.com/coaches/${coachId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCoaches(coaches.filter((coach) => coach._id !== coachId));
      message.success("Coach deleted successfully");
    } catch (error) {
      console.error("Error deleting coach:", error);
      message.error("Failed to delete coach");
    }
  };

  const handleFinish = async (values) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No token found, please login first");
        return;
      }

      const data = {
        ...values,
        speciality: values.speciality,
      };

      if (currentCoach) {
        const response = await axios.put(
          `https://go-ko-9qul.onrender.com/coaches/${currentCoach._id}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCoaches(
          coaches.map((coach) =>
            coach._id === currentCoach._id
              ? { ...coach, ...response.data }
              : coach
          )
        );
        message.success("Coach updated successfully");
      } else {
        const response = await axios.post(
          "https://go-ko-9qul.onrender.com/coaches",
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCoaches([...coaches, response.data]);
        message.success("Coach created successfully");
      }
      handleCancel();
    } catch (error) {
      console.error("Error saving coach:", error);
      message.error("Failed to save coach");
    }
  };

  const handleAssign = async (values) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No token found, please login first");
        return;
      }

      await axios.post(
        "https://go-ko-9qul.onrender.com/coaches/assign-coaches",
        {
          coachIds: selectedCoaches,
          commercialId: values.commercial,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedCoaches = coaches.map((coach) => {
        if (selectedCoaches.includes(coach._id)) {
          return {
            ...coach,
            commercial: commercials.find(
              (com) => com._id === values.commercial
            ),
          };
        }
        return coach;
      });
      setCoaches(updatedCoaches);
      message.success("Coaches assigned to commercial successfully");
      setIsAssignModalVisible(false);
      setSelectedCoaches([]);
    } catch (error) {
      console.error("Error assigning coaches:", error);
      message.error("Failed to assign coaches");
    }
  };

  const handleUnassign = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No token found, please login first");
        return;
      }

      await axios.post(
        "https://go-ko-9qul.onrender.com/coaches/unassign-coaches",
        {
          coachIds: selectedCoaches,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedCoaches = coaches.map((coach) => {
        if (selectedCoaches.includes(coach._id)) {
          return {
            ...coach,
            commercial: null,
          };
        }
        return coach;
      });
      setCoaches(updatedCoaches);
      message.success("Coaches unassigned from commercial successfully");
      setIsUnassignModalVisible(false);
      setSelectedCoaches([]);
    } catch (error) {
      console.error("Error unassigning coaches:", error);
      message.error("Failed to unassign coaches");
    }
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
    if (fileList.length > 0 && fileList[0].status === "done") {
      const imageUrl = fileList[0].response.secure_url;
      form.setFieldsValue({ image: imageUrl });
      setUploadedFileName(fileList[0].name);
      setImageUrl(imageUrl);
      setUploading(false);
      message.success(`${fileList[0].name} file uploaded successfully`);
    } else if (fileList.length > 0 && fileList[0].status === "error") {
      console.error("Upload error:", fileList[0].error, fileList[0].response);
      message.error(`${fileList[0].name} file upload failed.`);
      setUploading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };
  const rowSelection = {
    selectedRowKeys: selectedCoaches,
    onChange: (selectedRowKeys, selectedRows) => {
      console.log('Selected Row Keys:', selectedRowKeys);  // Log the selected row keys
      console.log('Selected Rows:', selectedRows);  // Log the actual rows being selected
      setSelectedCoaches(selectedRowKeys);  // Update the state with selected keys
    },
  };
  

  const uploadProps = {
    name: "file",
    action: "https://api.cloudinary.com/v1_1/doagzivng/image/upload",
    data: {
      upload_preset: "kj1jodbh",
    },
    fileList,
    onChange: handleUploadChange,
  };

  const columns = [
    {
      title: <span style={{ fontSize: "12px" }}>Raison Sociale</span>,
      dataIndex: "raisonsociale",
      key: "raisonsociale",
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleCoachClick(record)}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Coach",
      key: "coach",
      render: (text, record) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => handleCoachClick(record)}
        >
          {/* {record.image ? (
            <img
              src={record.image}
              alt="Coach"
              className="w-11 h-11 rounded-full mr-2"
            />
          ) : (
            <Avatar
              style={{ backgroundColor: "#87d068", marginRight: "20px" }}
              size={40}
              className="mr-2"
            >
              {getInitials(record.prenom, record.nom)}
            </Avatar>
          )} */}
          <span>
            {record.prenom} {record.nom}
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
          onClick={() => handleCoachClick(record)}
        >
          {text}
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: "12px" }}>Email</span>,
      dataIndex: "email",
      key: "email",
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleCoachClick(record)}
        >
          {text}
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: "12px" }}>Code Postal</span>,
      dataIndex: "codepostal",
      key: "codepostal",
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleCoachClick(record)}
        >
          {text}
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: "12px" }}>SIRET</span>,
      dataIndex: "siret",
      key: "siret",
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleCoachClick(record)}
        >
          {text}
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: "12px" }}>Ville</span>,
      dataIndex: "ville",
      key: "ville",
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleCoachClick(record)}
        >
          {text}
        </div>
      ),
    },

    {
      title: <span style={{ fontSize: "12px" }}>Adresse</span>,
      dataIndex: "adresse",
      key: "adresse",
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleCoachClick(record)}
        >
          {text}
        </div>
      ),
    },

    // {
    //   title: "Type",
    //   dataIndex: "type",
    //   key: "type",
    //   render: (type, record) => (
    //     <div className="flex-1">
    //       <div className="flex gap-2">
    //         <Button
    //           className={`btn ${
    //             type === "client_actif" ? "btn-active" : "btn-inactive"
    //           }`}
    //           onClick={() => handleCategoryClick(record._id, "client_actif")}
    //         >
    //           Actif
    //         </Button>
    //         <Button
    //           className={`btn ${
    //             type === "prospect_vr" ? "btn-active" : "btn-inactive"
    //           }`}
    //           onClick={() => handleCategoryClick(record._id, "prospect_vr")}
    //         >
    //           VRG
    //         </Button>
    //         {/* <Button
    //           className={`btn ${
    //             type === "prospect_qlf" ? "btn-active" : "btn-inactive"
    //           }`}
    //           onClick={() => handleCategoryClick(record._id, "prospect_qlf")}
    //         >
    //           QLF
    //         </Button> */}
    //       </div>
    //       <div className="mt-2">
    //         <strong>Commentaire:</strong> {record.categoryComment || "N/A"}
    //       </div>
    //     </div>
    //   ),
    // },

    {
      title: <span style={{ fontSize: "12px" }}>Âge</span>,
      dataIndex: "age",
      key: "age",
      width: 60,
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleCoachClick(record)}
        >
          {text}
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: "12px" }}>Sexe</span>,
      dataIndex: "sex",
      key: "sex",
      width: 60,
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleCoachClick(record)}
        >
          {text}
        </div>
      ),
    },

    {
      title: <span style={{ fontSize: "12px" }}>Spécialité</span>,
      dataIndex: "speciality",
      key: "speciality",
      render: (specialities) => (
        <div>
          {Array.isArray(specialities) &&
            specialities.map((item, index) => (
              <span key={index}>
                {item.nom}
                {index < specialities.length - 1 && ", "}
              </span>
            ))}
        </div>
      ),
    },

    {
      title: <span style={{ fontSize: "12px" }}>Commercial</span>,
      key: "commercial",
      render: (text, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleCoachClick(record)}
        >
          {record.commercial
            ? `${record.commercial.prenom} ${record.commercial.nom}`
            : "N/A"}
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: "12px" }}>Action</span>,
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            style={{ backgroundColor: "green", color: "white" }}
            onClick={() => showEditModal(record)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this coach?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              style={{ backgroundColor: "red", color: "white" }}
              danger
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Paginate data for the current page
  const paginateData = (data, current, pageSize) => {
    // First, filter and sort the data
    const sortedData = data.sort((a, b) => {
      if (!a.commercial) return -1; // Coaches without commercial come first
      if (!b.commercial) return 1; // Coaches without commercial come first
      return 0; // Keep original order
    });

    // Then, slice the data for pagination
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  };

  return (
    <div className="p-4">
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/">Tableau de Bord</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Coachs</Breadcrumb.Item>
        <Breadcrumb.Item>Liste des Coachs</Breadcrumb.Item>
      </Breadcrumb>
      <h1 className="text-xl font-bold mb-4">Liste des Coachs</h1>
  <div className="flex justify-between mb-4">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div className="space-x-2">
            {clientTypes?.map((type) => (
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
      </div>
      <div className="flex items-center mr-auto mb-4">
        <Input
          type="text"
          placeholder="Rechercher..."
          prefix={<SearchOutlined />}
          className="w-48"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyUp={handleKeyPress}
        />
      </div>
      <div className="w-full p-2">
      <Table
        onChange={handleTableChange}
        columns={columns}
        loading={loading}
        dataSource={paginateData(
          coaches,
          pagination.current,
          pagination.pageSize
        ).map((coach) => ({ ...coach, key: coach._id }))}
        // dataSource={paginateData(
        //   coaches,
        //   pagination.current,
        //   pagination.pageSize,
        // )}
        rowSelection={rowSelection}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: coaches.length,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
          },
          
        }}
        tableLayout="fixed"
        
      />
      {/* <Table
        columns={columns}
        dataSource={paginateData(
          coaches,
          pagination.current,
          pagination.pageSize
        ).map((coach) => ({ ...coach, key: coach._id }))}
        scroll={{ x: 600 }}
        rowSelection={selectedCoaches}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: coaches.length,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} coachs`,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
          },
        }}
        onChange={handleTableChange}
         tableLayout="fixed"
      /> */}
      <Modal
        // className="fixed-modal"
        title={currentCoach ? "Modifier Coach" : "Ajouter Coach"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
        centered
        className="fixed-modal rounded-lg shadow-lg  bg-white"
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <div className="grid grid-cols-2 overflow-y-auto p-4 max-h-96 gap-2">
            <Form.Item
              name="prenom"
              label="Prénom"
              rules={[
                { required: false, message: "Veuillez entrer le prénom" },
              ]}
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
              name="siret"
              label="Siret"
              rules={[{ required: false, message: "Veuillez entrer le siret" }]}
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
              rules={[
                { required: false, message: "Veuillez entrer l'adresse" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="codepostal"
              label="Code postal"
              rules={[
                { required: false, message: "Veuillez entrer le code postal" },
              ]}
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
              <Select mode="multiple">
                {specialities.map((speciality) => (
                  <Option key={speciality._id} value={speciality._id}>
                    {speciality.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Image">
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />} loading={uploading}>
                  Télécharger
                </Button>
              </Upload>
            </Form.Item>
            {uploadedFileName && (
              <Form.Item>
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
              </Form.Item>
            )}
          </div>
          <Form.Item className="mt-2">
            <Button type="primary" htmlType="submit">
              {currentCoach ? "Enregistrer les modifications" : "Ajouter Coach"}
            </Button>
            <Button onClick={handleCancel} className="ml-2">
              Annuler
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Affecter les Coachs au Commercial"
        visible={isAssignModalVisible}
        onCancel={() => setIsAssignModalVisible(false)}
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
            <Button
              onClick={() => setIsAssignModalVisible(false)}
              className="ml-2"
            >
              Annuler
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Désaffecter les Coachs du Commercial"
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
    </div>
  );
};

export default CoachList;
