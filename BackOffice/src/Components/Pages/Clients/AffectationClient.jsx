import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Upload, Breadcrumb, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import 'tailwindcss/tailwind.css';

const { Option } = Select;

const clientTypes = [
    { label: 'Tous', value: 'all' },
    { label: 'Client Actif', value: 'client_actif' },
    { label: 'Prospect VRG', value: 'prospect_vr' },
    { label: 'Prospect Qlf', value: 'prospect_qlf' },
];

const getInitials = (prenom, nom) => {
    if (!prenom || !nom) return '';
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
    const [filterType, setFilterType] = useState('all');
    const [uploading, setUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        fetchClients();
        fetchCommercials();
    }, []);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
            const response = await axios.get('https://go-ko.onrender.com/clients', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (Array.isArray(response.data)) {
                setClients(response.data);
                setFilteredClients(response.data);
                setPagination({ ...pagination, total: response.data.length });
            } else {
                message.error('Erreur lors de la récupération des données des clients');
            }
        } catch (error) {
            message.error('Erreur lors de la récupération des données des clients');
        }
    };

    const fetchCommercials = async () => {
        try {
            const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
            const response = await axios.get('https://go-ko.onrender.com/commercials', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCommercials(response.data);
        } catch (error) {
            console.error('Error fetching commercials:', error);
            message.error('Erreur lors de la récupération des commerciaux');
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
        setUploadedFileName(client.imageUrl ? client.imageUrl.split('/').pop() : '');
        setImageUrl(client.imageUrl || '');
        setIsModalVisible(true);
    };

    const handleDelete = async (clientId) => {
        try {
            const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
            await axios.delete(`https://go-ko.onrender.com/clients/${clientId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const updatedClients = clients.filter(client => client._id !== clientId);
            setClients(updatedClients);
            filterClients(filterType, updatedClients);
            setPagination({ ...pagination, total: updatedClients.length });
            message.success('Client supprimé avec succès');
        } catch (error) {
            console.error('Error deleting client:', error);
            message.error('Erreur lors de la suppression du client');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingClient(null);
        setUploadedFileName('');
        setImageUrl('');
    };

    const handleAssignCancel = () => {
        setIsAssignModalVisible(false);
        assignForm.resetFields();
        setSelectedClients([]);
    };

    const handleSave = async (values) => {
        console.log('Données envoyées pour ajout de client:', values);
        try {
            const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
            if (editingClient) {
                await axios.put(`https://go-ko.onrender.com/clients/${editingClient._id}`, values, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                message.success('Client mis à jour avec succès');
            } else {
                await axios.post('https://go-ko.onrender.com/clients', values, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                message.success('Client ajouté avec succès');
            }
            fetchClients();
            setIsModalVisible(false);
            form.resetFields();
            setEditingClient(null);
            setUploadedFileName('');
            setImageUrl('');
        } catch (error) {
            console.error('Error saving client:', error.response ? error.response.data : error.message);
            message.error('Erreur lors de la sauvegarde du client');
        }
    };

    const handleAssign = async (values) => {
        try {
            const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
            await axios.post('https://go-ko.onrender.com/clients/assign-clients', {
                clientIds: selectedClients,
                commercialId: values.commercial,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const updatedClients = clients.map(client => {
                if (selectedClients.includes(client._id)) {
                    return {
                        ...client,
                        commercial: commercials.find(com => com._id === values.commercial)
                    };
                }
                return client;
            });
            setClients(updatedClients);
            filterClients(filterType, updatedClients);

            message.success('Clients affectés au commercial avec succès');
            setIsAssignModalVisible(false);
            setSelectedClients([]);
        } catch (error) {
            console.error('Erreur lors de l\'affectation des clients:', error);
            message.error('Erreur lors de l\'affectation des clients');
        }
    };

    const handleUnassign = async () => {
        try {
            const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
            await axios.post('https://go-ko.onrender.com/clients/unassign-clients', {
                clientIds: selectedClients,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const updatedClients = clients.map(client => {
                if (selectedClients.includes(client._id)) {
                    return {
                        ...client,
                        commercial: null
                    };
                }
                return client;
            });
            setClients(updatedClients);
            filterClients(filterType, updatedClients);

            message.success('Clients désaffectés du commercial avec succès');
            setIsUnassignModalVisible(false);
            setSelectedClients([]);
        } catch (error) {
            console.error('Erreur lors de la désaffectation des clients:', error);
            message.error('Erreur lors de la désaffectation des clients');
        }
    };

    const filterClients = (type, clientList) => {
        if (type === 'all') {
            setFilteredClients(clientList);
        } else {
            setFilteredClients(clientList.filter(client => client.type === type));
        }
    };

    const handleFilterClick = (type) => {
        setFilterType(type);
        filterClients(type, clients);
    };

    const handleUploadChange = (info) => {
        if (info.file.status === 'uploading') {
            setUploading(true);
        }
        if (info.file.status === 'done') {
            const imageUrl = info.file.response.secure_url;
            form.setFieldsValue({ imageUrl });
            setUploadedFileName(info.file.name);
            setImageUrl(imageUrl);
            setUploading(false);
            message.success(`${info.file.name} fichier téléchargé avec succès`);
        } else if (info.file.status === 'error') {
            console.error('Erreur de téléchargement:', info.file.error, info.file.response);
            message.error(`${info.file.name} échec du téléchargement du fichier.`);
            setUploading(false);
        }
    };

    const handleTableChange = (pagination) => {
        setPagination(pagination);
    };

    const columns = [
        {
            title: 'Nom Prénom',
            key: 'nomPrenom',
            render: (text, record) => (
                <div className="flex items-center cursor-pointer" onClick={() => handleClientClick(record)}>
                    {record.imageUrl ? (
                        <img src={record.imageUrl} alt="Client" className="w-9 h-9 rounded-full mr-2" />
                    ) : (
                        <Avatar style={{ backgroundColor: 'navy', marginRight: "20px" }} size={40} className="mr-2" >
                            {getInitials(record.prenom, record.nom)}
                        </Avatar>
                    )}
                    <span>{record.nom} {record.prenom}</span>
                </div>
            ),
        },
        {
            title: 'Téléphone',
            dataIndex: 'phone',
            key: 'phone',
            render: (text, record) => (
                <div className="cursor-pointer" onClick={() => handleClientClick(record)}>
                    {record.phone}
                </div>
            ),
        },
        {
            title: 'Âge',
            dataIndex: 'age',
            key: 'age',
            render: (text, record) => (
                <div className="cursor-pointer" onClick={() => handleClientClick(record)}>
                    {record.age}
                </div>
            ),
        },
        {
            title: 'Sex',
            dataIndex: 'sex',
            key: 'sex',
            render: (text, record) => (
                <div className="cursor-pointer" onClick={() => handleClientClick(record)}>
                    {record.sex}
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type, record) => (
                <div className="cursor-pointer" onClick={() => handleClientClick(record)}>
                    {clientTypes.find(t => t.value === type)?.label}
                </div>
            ),
        },
        {
            title: 'Adresse',
            dataIndex: 'address',
            key: 'address',
            render: (address, record) => (
                <div className="cursor-pointer" onClick={() => handleClientClick(record)}>
                    {address || 'N/A'}
                </div>
            ),
        },
        {
            title: 'Commercial',
            key: 'commercial',
            render: (text, record) => (
                <div className="cursor-pointer" onClick={() => handleClientClick(record)}>
                    {record.commercial ? `${record.commercial.prenom} ${record.commercial.nom}` : 'N/A'}
                </div>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} style={{ backgroundColor: 'green', color: 'white' }} onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Êtes-vous sûr de vouloir supprimer ce client?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Oui"
                        cancelText="Non"
                    >
                        <Button icon={<DeleteOutlined />} style={{ backgroundColor: 'red', color: 'white' }} danger />
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
        name: 'file',
        action: 'https://api.cloudinary.com/v1_1/doagzivng/image/upload',
        data: {
            upload_preset: 'kj1jodbh',
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
                <Breadcrumb.Item>Clients</Breadcrumb.Item>
                <Breadcrumb.Item>Affectations des Clients</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xl font-bold mb-4 text-start">Affectation des Clients</h1>
            <div className="flex flex-col md:flex-row justify-between mb-4">
                {/* <div className="mb-2 md:mb-0">
                    <Button type="primary" onClick={() => setIsModalVisible(true)} icon={<PlusOutlined />}>
                        Ajouter un Client
                    </Button>
                </div> */}
                <div className="space-x-2">
                    {clientTypes.map(type => (
                        <Button
                            key={type.value}
                            type={filterType === type.value ? 'primary' : 'default'}
                            onClick={() => handleFilterClick(type.value)}
                        >
                            {type.label}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="flex justify-end space-x-2 mb-4">
                <Button type="primary" onClick={() => setIsAssignModalVisible(true)}>
                    Affecter les Clients au Commercial
                </Button>
                <Button type="primary" onClick={() => setIsUnassignModalVisible(true)}>
                    Désaffecter les Clients du Commercial
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={filteredClients.map(client => ({ ...client, key: client._id }))}
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
                    showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} total`,
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
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <div className="grid grid-cols-2 gap-2">
                        <Form.Item name="prenom" label="Prénom" rules={[{ required: true, message: 'Veuillez entrer le prénom' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Veuillez entrer le nom' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Veuillez entrer l\'email' }]}>
                            <Input type="email" />
                        </Form.Item>
                        <Form.Item name="phone" label="Téléphone" rules={[{ required: true, message: 'Veuillez entrer le téléphone' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="age" label="Âge" rules={[{ required: true, message: 'Veuillez entrer l\'âge' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="sex" label="Sexe" rules={[{ required: true, message: 'Veuillez sélectionner le sexe' }]}>
                            <Select>
                                <Option value="homme">Homme</Option>
                                <Option value="femme">Femme</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="type" label="Type" rules={[{ required: false, message: 'Veuillez sélectionner le type' }]}>
                            <Select>
                                {clientTypes.slice(1).map(type => (
                                    <Option key={type.value} value={type.value}>{type.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="address" label="Adresse" rules={[{ required: true, message: 'Veuillez entrer l\'adresse' }]}>
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
                                <Button icon={<UploadOutlined />} loading={uploading}>Télécharger</Button>
                            </Upload>
                            {uploadedFileName && (
                                <div className="flex items-center mt-2">
                                    <Avatar src={imageUrl} alt="Uploaded Image" size={50} className="mr-2" />
                                    <span>{uploadedFileName}</span>
                                    <Button
                                        type="link"
                                        icon={<DeleteOutlined />}
                                        onClick={() => {
                                            form.setFieldsValue({ imageUrl: '' });
                                            setUploadedFileName('');
                                            setImageUrl('');
                                        }}
                                    />
                                </div>
                            )}
                        </Form.Item>
                    </div>
                    <Form.Item className="mt-2">
                        <Button type="primary" htmlType="submit">
                            {editingClient ? "Enregistrer les modifications" : "Ajouter Client"}
                        </Button>
                        <Button onClick={handleCancel} className="ml-2">Annuler</Button>
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
                    <Form.Item name="commercial" label="Commercial" rules={[{ required: true, message: 'Veuillez sélectionner un commercial' }]}>
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
                        <Button onClick={handleAssignCancel} className="ml-2">Annuler</Button>
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
                        <Button onClick={() => setIsUnassignModalVisible(false)} className="ml-2">Annuler</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ClientTable;
