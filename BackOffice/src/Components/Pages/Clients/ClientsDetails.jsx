// ClientDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Breadcrumb, Button, Table, Modal, Form, Input, Select, message, Upload, Image, Avatar, Tabs } from 'antd';
import { EditOutlined, UploadOutlined, UserSwitchOutlined } from '@ant-design/icons';
import 'tailwindcss/tailwind.css';

const { Option } = Select;
const { TabPane } = Tabs;

const clientTypes = [
    { label: 'Tous', value: 'all' },
    { label: 'Client Actif', value: 'client_actif' },
    { label: 'Prospect VR', value: 'prospect_vr' },
    { label: 'Prospect Qlf', value: 'prospect_qlf' },
];

const getInitials = (prenom, nom) => {
    if (!prenom || !nom) return '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
};

const ClientDetailsPage = () => {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [commercials, setCommercials] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState("1");
    const [form] = Form.useForm();
    const [assignForm] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchClient = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/clients/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setClient(response.data);
            } catch (error) {
                console.error('Error fetching client:', error);
                message.error('Erreur lors de la récupération des détails du client');
            }
        };

        const fetchCommercials = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/commercials', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCommercials(response.data);
            } catch (error) {
                console.error('Error fetching commercials:', error);
                message.error('Erreur lors de la récupération des commerciaux');
            }
        };

        fetchClient();
        fetchCommercials();

        if (location.pathname.includes("comments")) {
            setActiveTab("2");
        }
    }, [id, location]);

    const handleTabChange = (key) => {
        setActiveTab(key);
        if (key === "2") {
            navigate(`/client/${id}/comments`);
        } else {
            navigate(`/client/${id}`);
        }
    };

    const handleEdit = () => {
        form.setFieldsValue(client);
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
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/clients/${id}`, values, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            message.success('Client mis à jour avec succès');
            setIsModalVisible(false);
            form.resetFields();
            setClient({ ...client, ...values });
        } catch (error) {
            console.error('Error saving client:', error.response ? error.response.data : error.message);
            message.error('Erreur lors de la sauvegarde du client');
        }
    };

    const handleAssign = async (values) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/clients/${id}`, { commercial: values.commercial }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            message.success('Commercial assigné avec succès');
            setIsAssignModalVisible(false);
            setClient({ ...client, commercial: commercials.find(c => c._id === values.commercial) });
        } catch (error) {
            console.error('Erreur lors de l\'affectation du commercial:', error);
            message.error('Erreur lors de l\'affectation du commercial');
        }
    };

    if (!client) {
        return <div>Chargement...</div>;
    }

    const data = [
        { key: '1', field: 'Nom', value: client.nom },
        { key: '2', field: 'Prénom', value: client.prenom },
        { key: '3', field: 'Email', value: client.email },
        { key: '4', field: 'Téléphone', value: client.phone },
        { key: '5', field: 'Âge', value: client.age },
        { key: '6', field: 'Sexe', value: client.sex },
        { key: '7', field: 'Type', value: client.type },
        { key: '8', field: 'Ville', value: client.address },
        { key: '9', field: 'Commercial', value: client.commercial ? `${client.commercial.prenom} ${client.commercial.nom}` : 'Non affecté' },
    ];

    const columns = [
        {
            dataIndex: 'field',
            key: 'field',
            width: '30%',
            render: (text) => <span className="font-bold">{text}</span>,
            className: 'py-1 px-2',
        },
        {
            dataIndex: 'value',
            key: 'value',
            className: 'py-1 px-2',
            render: (text, record) => (
                <div className="flex justify-between items-center">
                    <span>{text}</span>
                    {record.field === 'Commercial' && (
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
        name: 'file',
        action: 'https://api.cloudinary.com/v1_1/doagzivng/image/upload',
        data: {
            upload_preset: 'kj1jodbh',
        },
        showUploadList: false,
        onChange: (info) => {
            if (info.file.status === 'done') {
                const imageUrl = info.file.response.secure_url;
                form.setFieldsValue({ imageUrl });
                setClient({ ...client, imageUrl });
                message.success(`${info.file.name} fichier téléchargé avec succès`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} échec du téléchargement du fichier.`);
            }
        },
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
                <Breadcrumb.Item>Détails du Client</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xl font-bold mb-4 flex items-center">
                Détails du Client : 
                
            </h1>
            <div className="text-center">
                <span className="ml-7 px-2 py-1 bg-green-600 text-white font-bold rounded">
                    {client.prenom} {client.nom}
                </span>
            </div>
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
                <TabPane tab="Informations" key="1">
                    <div className="text-center mb-4">
                        {client.imageUrl ? (
                            <img src={client.imageUrl} alt="Client" className="w-24 h-24 rounded-full mx-auto" />
                        ) : (
                            <Avatar style={{ backgroundColor: '#87d068', fontSize: '26px' }} size={70}>
                                {getInitials(client.prenom, client.nom)}
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
                    <div>
                        {/* Ajoutez ici le contenu des commentaires */}
                    </div>
                </TabPane>
            </Tabs>
            <Button type="primary" onClick={handleEdit} icon={<EditOutlined />} className="mt-4">
                Modifier
            </Button>
            <Modal
                title="Modifier le Client"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={client}
                >
                    <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Veuillez entrer le nom' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="prenom" label="Prénom" rules={[{ required: true, message: 'Veuillez entrer le prénom' }]}>
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
                    <Form.Item name="type" label="Type">
                        <Select>
                            {clientTypes.slice(1).map(type => (
                                <Option key={type.value} value={type.value}>{type.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="address" label="Adresse" rules={[{ required: true, message: 'Veuillez entrer l\'adresse' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="imageUrl" label="Image">
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Télécharger</Button>
                        </Upload>
                        {client.imageUrl && (
                            <div className="mt-2">
                                <Image src={client.imageUrl} alt="Client" width={100} />
                            </div>
                        )}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Enregistrer
                        </Button>
                        <Button onClick={handleCancel} className="ml-2">Annuler</Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Affecter le Commercial"
                visible={isAssignModalVisible}
                onCancel={handleAssignCancel}
                footer={null}
                centered
            >
                <Form form={assignForm} layout="vertical" onFinish={handleAssign}>
                    <Form.Item name="commercial" label="Commercial" rules={[{ required: true, message: 'Veuillez sélectionner un commercial' }]}>
                        <Select placeholder="Sélectionnez un commercial">
                            {commercials.map(commercial => (
                                <Option key={commercial._id} value={commercial._id}>{commercial.nom} {commercial.prenom}</Option>
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
        </div>
    );
};

export default ClientDetailsPage;
