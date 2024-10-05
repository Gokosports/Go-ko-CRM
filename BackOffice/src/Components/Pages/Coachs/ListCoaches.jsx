import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Breadcrumb,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Upload,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate, Link, useParams } from "react-router-dom";
import "tailwindcss/tailwind.css";

// const clientTypes = [
//   { label: "Tous", value: "all" },
//   { label: "Client Actif", value: "client_actif" },
//   { label: "Prospect VRG", value: "prospect_vr" },
//   // { label: "Prospect Qlf", value: "prospect_qlf" },
// ];

// const getInitials = (prenom, nom) => {
//   if (!prenom || !nom) return "";
//   return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
// };

const ListCoaches = () => {
  const { id } = useParams();
  const [coaches, setCoaches] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState(coaches); // New state to store filtered data
  const [specialities, setSpecialities] = useState([]);
  const [commercials, setCommercials] = useState([]);
  const [selectedCoaches, setSelectedCoaches] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 6 });
  const [filterType, setFilterType] = useState("all");
  const [filteredClients, setFilteredClients] = useState([]);
  const [currentCoach, setCurrentCoach] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCoaches();
    fetchSpecialities();
    fetchCommercials();
  }, []);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          message.error("No token found, please login first");
          return;
        }
        const response = await axios.get(
          "https://go-ko-9qul.onrender.com/coaches",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCoaches(response.data);
      } catch (error) {
        console.error("Error fetching coaches:", error);
        message.error("Failed to fetch coaches");
      }
    };
    fetchCoaches();
  }, []); // Re-run when filterType changes

  useEffect(() => {
    const fetchFilterPreference = async () => {
      const id = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!id) {
        return;
      }

      try {
        const response = await axios.get(
          `https://go-ko-9qul.onrender.com/coaches/${id}/filteredCoach`,
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
  const handleCategoryClick = async (id, categoryType) => {
    // Prompt the user for a comment
    const comment =
      prompt("Entrez un commentaire pour le coach:") ||
      "Ajouter un commentaire";

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      // Send request to update the coach's type and category comment
      const response = await axios.put(
        `https://go-ko-9qul.onrender.com/coaches/${id}/filterCoach`,
        { filterType: categoryType, categoryComment: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Response from API:", response.data);

      // Check if the response is valid and update the UI
      if (response.data) {
        // Update the coach's type and comment in the local state
        const updatedCoaches = coaches.map((coach) =>
          coach._id === id
            ? { ...coach, type: categoryType, categoryComment: comment }
            : coach
        );

        console.log("Updated coaches list:", updatedCoaches);

        // Update the state for coaches
        setCoaches(updatedCoaches);

        // Re-filter the clients based on the new type
        const filtered = filterClients(filterType, updatedCoaches);
        setFilteredCoaches(filtered);

        // Show a success message or update UI as needed
        message.success("Coach type and comment updated successfully");
      } else {
        message.error("Unable to update coach type");
      }
    } catch (error) {
      console.error("Error updating coach type:", error);
      message.error("Error updating coach type");
    }
  };

  const filterClients = (type, clients) => {
    if (type === "all") {
      return clients;
    }
    return clients.filter((client) => client.type === type); // Ensure client.type exists
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

  const handleFilterClick = (type) => {
    setFilterType(type); // Set the current filter type
    const filtered = filterClients(type, coaches); // Filter coaches based on type
    setFilteredCoaches(filtered); // Update the filteredCoaches state with the filtered data
  };

  useEffect(() => {
    const filtered = filterClients(filterType, coaches);
    setFilteredCoaches(filtered);
  }, [filterType, coaches]);

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
    navigate(`/coaches/${coach._id}`);
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
  const uploadProps = {
    name: "file",
    action: "https://api.cloudinary.com/v1_1/doagzivng/image/upload",
    data: {
      upload_preset: "kj1jodbh",
    },
    fileList,
    onChange: handleUploadChange,
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };
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

  const rowSelection = {
    onChange: (selectedRowKeys) => {
      setSelectedCoaches(selectedRowKeys);
    },
    selectedRowKeys: selectedCoaches,
  };

  const columns = [
    {
      title: <span style={{ fontSize: "12px" }}>Raison Sociale</span>,
      dataIndex: "raisonsociale",
      key: "raisonsociale",

      render: (text, record) => (
        <div
          style={{ fontSize: "12px", cursor: "pointer" }}
          onClick={() => handleCoachClick(record)}
        >
          {text}
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: "12px" }}>Coach</span>,
      key: "coach",
      render: (text, record) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => handleCoachClick(record)}
        >
          <span>
            {record.prenom} {record.nom}
          </span>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: "12px" }}>Téléphone</span>,
      dataIndex: "phone",
      key: "phone",
      width: 100,
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
      width: 120,
      render: (text, record) => (
        <div
          style={{ fontSize: "12px", cursor: "pointer" }}
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
    //   title:<span style={{ fontSize: '12px' }}>Type</span>,
    //   dataIndex: "type",
    //   key: "type",
    //   width: 150,
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
              <div key={index}>{item.nom}</div>
            ))}
        </div>
      ),
    },

    // {
    //   title:<span style={{ fontSize: '12px' }}>Commercial</span>,
    //   key: "commercial",
    //   render: (text, record) => (
    //     <div
    //       className="cursor-pointer"
    //       onClick={() => handleCoachClick(record)}
    //     >
    //       {record.commercial
    //         ? `${record.commercial.prenom} ${record.commercial.nom}`
    //         : "N/A"}
    //     </div>
    //   ),
    // },
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
        </Space>
      ),
    },
  ];

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
      {/* <div className="flex justify-between mb-4">
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
      </div> */}
      <div className="w-full p-2">
        <Table
          columns={columns}
          loading={loading}
          dataSource={paginateData(
            filteredCoaches,
            pagination.current,
            pagination.pageSize
          ).map((coach) => ({ ...coach, key: coach._id }))}
          rowSelection={rowSelection}
          scroll={{ x: 600 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredClients.length,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} coachs`,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize });
            },
          }}
          onChange={handleTableChange}
          tableLayout="fixed"
        />
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
                rules={[
                  { required: false, message: "Veuillez entrer l'email" },
                ]}
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
                rules={[
                  { required: false, message: "Veuillez entrer la ville" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="siret"
                label="Siret"
                rules={[
                  { required: false, message: "Veuillez entrer le siret" },
                ]}
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
                  {
                    required: false,
                    message: "Veuillez entrer le code postal",
                  },
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
                {currentCoach
                  ? "Enregistrer les modifications"
                  : "Ajouter Coach"}
              </Button>
              <Button onClick={handleCancel} className="ml-2">
                Annuler
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default ListCoaches;
