import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Upload, Avatar, Breadcrumb } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const getInitials = (prenom, nom) => {
    if (!prenom || !nom) return '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
};

const CommercialsPage = () => {
    const [commercials, setCommercials] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCommercial, setCurrentCommercial] = useState(null);
    const [form] = Form.useForm();
    const [uploading, setUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        fetchCommercials();
    }, []);

    const fetchCommercials = async () => {
        try {
            const response = await axios.get('https://go-ko.onrender.com/commercials');
            setCommercials(response.data);
        } catch (error) {
            console.error('Error fetching commercials:', error);
        }
    };

    const handleAddCommercial = () => {
        setIsEditing(false);
        setCurrentCommercial(null);
        setIsModalVisible(true);
    };

    const handleEditCommercial = (commercial) => {
        setIsEditing(true);
        setCurrentCommercial(commercial);
        form.setFieldsValue({
            ...commercial,
            password: '', // Clear the password field when editing
        });
        setUploadedFileName(commercial.image ? commercial.image.split('/').pop() : '');
        setImageUrl(commercial.image || '');
        setIsModalVisible(true);
    };

    const handleDeleteCommercial = async (commercialId) => {
        try {
            await axios.delete(`https://go-ko.onrender.com/commercials/${commercialId}`);
            message.success('Commercial supprimé avec succès');
            fetchCommercials();
        } catch (error) {
            console.error('Error deleting commercial:', error);
            message.error('Erreur lors de la suppression du commercial');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setCurrentCommercial(null);
        setUploadedFileName('');
        setImageUrl('');
    };

    const handleSave = async (values) => {
        if (!values.image) {
            // Si l'image est supprimée, envoyez une valeur vide pour mettre à jour la base de données
            values.image = '';
        }

        try {
            if (isEditing) {
                await axios.put(`https://go-ko.onrender.com/commercials/${currentCommercial._id}`, values);
                message.success('Commercial mis à jour avec succès');
            } else {
                await axios.post('https://go-ko.onrender.com/commercials', values);
                message.success('Commercial ajouté avec succès');
            }
            setIsModalVisible(false);
            form.resetFields();
            fetchCommercials();
        } catch (error) {
            console.error('Error saving commercial:', error);
            message.error('Erreur lors de la sauvegarde du commercial');
        }
    };

    const handleUploadChange = (info) => {
        if (info.file.status === 'uploading') {
            setUploading(true);
        }
        if (info.file.status === 'done') {
            const imageUrl = info.file.response.secure_url;
            form.setFieldsValue({ image: imageUrl });
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

    const uploadProps = {
        name: 'file',
        action: 'https://api.cloudinary.com/v1_1/doagzivng/image/upload',
        data: {
            upload_preset: 'kj1jodbh',
        },
        showUploadList: false,
        onChange: handleUploadChange,
    };

    const columns = [
        {
            title: 'Nom Prénom',
            key: 'nomPrenom',
            render: (text, record) => (
                <div className="flex items-center">
                    {record.image ? (
                        <img src={record.image} alt="Commercial" className="w-9 h-9 rounded-full mr-2" />
                    ) : (
                        <Avatar style={{ backgroundColor: 'navy' }} size={40} className="mr-2">
                            {getInitials(record.prenom, record.nom)}
                        </Avatar>
                    )}
                    <span> {record.prenom} {record.nom}</span>
                </div>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Téléphone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <span>
                    <Button
                        type="primary"
                        icon={<EditOutlined style={{ color: 'white' }} />}
                        className="mr-2"
                        style={{ backgroundColor: 'green', borderColor: 'green' }}
                        onClick={() => handleEditCommercial(record)}
                    />
                    <Popconfirm
                        title="Êtes-vous sûr de vouloir supprimer ce commercial?"
                        onConfirm={() => handleDeleteCommercial(record._id)}
                        okText="Oui"
                        cancelText="Non"
                    >
                        <Button
                            type="danger"
                            icon={<DeleteOutlined style={{ color: 'white' }} />}
                            style={{ backgroundColor: 'red', borderColor: 'red' }}
                        />
                    </Popconfirm>
                </span>
            ),
        },
    ];

    return (
        <div className="p-4 border rounded shadow-lg mt-4">
            <Breadcrumb className="mb-4">
            <Breadcrumb.Item><Link to="/">Tableau de Bord</Link></Breadcrumb.Item>
            <Breadcrumb.Item>Commerciaux</Breadcrumb.Item>
            <Breadcrumb.Item>Gestion des Commerciaux</Breadcrumb.Item>
            </Breadcrumb>
            <h2 className="text-lg font-bold mb-4">Gestion des Commerciaux</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCommercial}>
                Ajouter un Commercial
            </Button>
            <Table
                columns={columns}
                dataSource={commercials}
                rowKey="_id"
                className="mt-4"
                scroll={{ x: 'max-content' }}
            />
            <Modal
                title={isEditing ? 'Modifier le Commercial' : 'Ajouter un Commercial'}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
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
                    <Form.Item name="password" label="Mot de passe" rules={[{ required: !isEditing, message: 'Veuillez entrer le mot de passe' }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="image" label="Image">
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
                                        form.setFieldsValue({ image: '' });
                                        setUploadedFileName('');
                                        setImageUrl('');
                                    }}
                                />
                            </div>
                        )}
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

export default CommercialsPage;
