import React, { useState, useEffect, useContext } from "react";
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
  Avatar,
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
import { LoginContext } from "../../store/LoginContext";


const clientTypes = [
  { label: "Tous", value: "all" },
  { label: "Client Actif", value: "client_actif" },
  { label: "Prospect VRG", value: "prospect_vr" },
];


const ListCoaches = () => {
  const { id } = useParams();
  const [coaches, setCoaches] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState(coaches);
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
  const user = useContext(LoginContext);
  console.log("user", user);
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [activeCoaches, setActiveCoaches] = useState([]);
  const [prospectCoaches, setProspectCoaches] = useState([]);

  const fetchContracts = async () => {
    try {
      const response = await axios.get(
        "https://go-ko-9qul.onrender.com/api/contracts"
      );
      console.log("All Contracts:", response.data);
      setContracts(response.data);
      setFilteredContracts(response.data);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    }
  };

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://go-ko-9qul.onrender.com/coaches"
      );
      const allCoaches = response.data;

      // Log the fetched coaches for debugging
      console.log("Fetched Coaches:", allCoaches);

      // Extract commercial name from the user context
      const commercialName = user?.decodedToken?.name; // e.g., "Danguir1 Laila"
      const nameParts = commercialName?.trim().split(" ") || [];
      const firstName = nameParts.slice(1).join(" "); // Get all parts after the first one as first name
      const lastName = nameParts[0]; // Get the first part as last name

      // Filter coaches based on commercial name
      const filteredCoaches = allCoaches.filter((coach) => {
        // Ensure the commercial object exists before accessing properties
        const coachCommercial = coach.commercial || {};
        const coachCommercialFirstName = coachCommercial.prenom; // Coach's first name
        const coachCommercialLastName = coachCommercial.nom; // Coach's last name

        return (
          coachCommercialFirstName === firstName &&
          coachCommercialLastName === lastName
        );
      });

      setCoaches(filteredCoaches);
    } catch (error) {
      console.error("Error fetching coaches:", error);
      message.error("Failed to fetch coaches");
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };
  const handleFilterClick = (type) => {
    setFilterType(type);

    console.log("Current Coaches:", coaches);
    console.log("Current Contracts:", contracts);

    let filtered = [];

    if (type === "client_actif") {
      // Get coaches with contracts
      filtered = coaches.filter((coach) => {
        const hasContract = contracts.some((contract) => {
          // Ensure phone number and raisonsociale are checked correctly
          const hasPhoneMatch = contract.phone === coach.phone;
          const hasRaisonSocialMatch =
            contract.raisonsociale &&
            coach.raisonsociale &&
            contract.raisonsociale.toLowerCase() ===
              coach.raisonsociale.toLowerCase();

          console.log(
            `Checking coach ${coach.nom}: has contract? ${
              hasPhoneMatch || hasRaisonSocialMatch
            }`
          );
          return hasPhoneMatch || hasRaisonSocialMatch;
        });
        return hasContract;
      });

      console.log("Filtered Active Coaches:", filtered);
      setActiveCoaches(filtered);
      setProspectCoaches([]);
    } else if (type === "prospect_vr") {
      // Get coaches without contracts
      filtered = coaches.filter((coach) => {
        const hasNoContract = !contracts.some((contract) => {
          const hasPhoneMatch = contract.phone === coach.phone;
          const hasRaisonSocialMatch =
            contract.raisonsociale &&
            coach.raisonsociale &&
            contract.raisonsociale.toLowerCase() ===
              coach.raisonsociale.toLowerCase();

          console.log(
            `Checking coach ${coach.nom}: has no contract? ${
              !hasPhoneMatch && !hasRaisonSocialMatch
            }`
          );
          return hasPhoneMatch || hasRaisonSocialMatch;
        });
        return hasNoContract;
      });

      console.log("Filtered Prospect Coaches:", filtered);
      setProspectCoaches(filtered);
      setActiveCoaches([]);
    } else {
      // Reset states for "Tous"
      setActiveCoaches([]);
      setProspectCoaches([]);
      filtered = coaches; // Show all coaches
    }

    setFilteredCoaches(filtered);
  };

  useEffect(() => {
    fetchCoaches(); // Fetch coaches when user context is available
    fetchSpecialities();
    fetchCommercials();
    fetchContracts();
  }, []);

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

  useEffect(() => {
    if (searchQuery.trim() === "") {
      // setCoaches(filteredClients);
      const fetchCoaches = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            "https://go-ko-9qul.onrender.com/coaches"
          );
          const allCoaches = response.data;

          // Log the fetched coaches for debugging
          console.log("Fetched Coaches:", allCoaches);

          // Extract commercial name from the user context
          const commercialName = user?.decodedToken?.name; // e.g., "Danguir1 Laila"
          const nameParts = commercialName?.trim().split(" ") || [];
          const firstName = nameParts.slice(1).join(" "); // Get all parts after the first one as first name
          const lastName = nameParts[0]; // Get the first part as last name

          // Filter coaches based on commercial name
          const filteredCoaches = allCoaches.filter((coach) => {
            // Ensure the commercial object exists before accessing properties
            const coachCommercial = coach.commercial || {};
            const coachCommercialFirstName = coachCommercial.prenom; // Coach's first name
            const coachCommercialLastName = coachCommercial.nom; // Coach's last name

            return (
              coachCommercialFirstName === firstName &&
              coachCommercialLastName === lastName
            );
          });

          setCoaches(filteredCoaches);
        } catch (error) {
          console.error("Error fetching coaches:", error);
          message.error("Failed to fetch coaches");
        } finally {
          setLoading(false); // Set loading to false after fetching
        }
      };
      fetchCoaches();
    } else {
      const delayDebounceFn = setTimeout(() => {
        handleSearch();
      }, 1000);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, filterType, activeCoaches, prospectCoaches]);

  // const handleSearch = async () => {
  //   try {
  //     // Perform the search with postal code filter
  //     setLoading(true);
  //     const response = await axios.get(
  //       `https://go-ko-9qul.onrender.com/api/search?search=${searchQuery}`
  //     );
  //     console.log("Search response:", response.data);

  //     // Update coaches with filtered data
  //     setCoaches(response.data);
  //     setPagination({ current: 1, pageSize: 8 }); // Reset pagination for filtered results
  //   } catch (error) {
  //     console.error("Error searching coaches:", error);
  //     setCoaches(filteredClients);
  //   } finally {
  //     setLoading(false); // Stop loading after search completes
  //   }
  // };
  const handleSearch = async () => {
    try {
      setLoading(true);
  
      // Only search within the filtered coaches based on the commercial name
      const commercialName = user?.decodedToken?.name;
      const nameParts = commercialName?.trim().split(" ") || [];
      const firstName = nameParts.slice(1).join(" ");
      const lastName = nameParts[0];
  
      const filteredCoaches = coaches.filter((coach) => {
        const { prenom: coachFirstName, nom: coachLastName } = coach.commercial || {};
        return coachFirstName === firstName && coachLastName === lastName;
      });
  
      // Perform search on the filtered coaches
      const searchResults = filteredCoaches.filter((coach) => {
        // Adjust your search logic based on which fields you want to search
        const fullName = `${coach.commercial.prenom} ${coach.commercial.nom}`.toLowerCase();
        const searchLowerCase = searchQuery.toLowerCase();
        return fullName.includes(searchLowerCase) || 
               coach.phone.includes(searchLowerCase) || 
               (coach.raisonsociale && coach.raisonsociale.toLowerCase().includes(searchLowerCase));
      });
  
      console.log("Search results:", searchResults);
      setCoaches(searchResults); // Update the displayed coaches with the search results
      setPagination({ current: 1, pageSize: 8 }); // Reset pagination for filtered results
    } catch (error) {
      console.error("Error searching coaches:", error);
      setCoaches([]); // Reset coaches on error
    } finally {
      setLoading(false);
    }
  };
  

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
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

  // useEffect(() => {
  //   const filtered = filterClients(filterType, coaches);
  //   setFilteredCoaches(filtered);
  // }, [filterType, coaches]);

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
      <div className="w-full p-2">
        {filterType === "all" && (
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
        )}

        {filterType === "client_actif" && (
          <Table
            loading={loading}
            onChange={handleTableChange}
            rowSelection={rowSelection}
            columns={columns}
            dataSource={activeCoaches.map((coach) => ({
              ...coach,
              key: coach._id,
            }))}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: activeCoaches.length,
              onChange: (page, pageSize) => {
                setPagination({ current: page, pageSize });
              },
            }}
            tableLayout="fixed"
          />
        )}
        {filterType === "prospect_vr" && (
          <Table
            loading={loading}
            columns={columns}
            dataSource={prospectCoaches.map((coach) => ({
              ...coach,
              key: coach._id,
            }))}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: prospectCoaches.length,
              onChange: (page, pageSize) => {
                setPagination({ current: page, pageSize });
              },
            }}
            tableLayout="fixed"
          />
        )}
        {/* <Table
          columns={columns}
          user={user}
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
            total: filteredCoaches.length,
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
