import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Space, message, Form, Input, Modal, Card, Breadcrumb } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined, EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { confirm } = Modal;


const SpecialityDashboard = () => {
    const [specialities, setSpecialities] = useState([]);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [currentSpeciality, setCurrentSpeciality] = useState(null);

    useEffect(() => {
        fetchSpecialities();
    }, []);

    const fetchSpecialities = async () => {
        try {
            const response = await axios.get('http://localhost:5000/speciality');
            setSpecialities(response.data);
        } catch (error) {
            console.error('Error fetching specialities:', error);
            message.error('Failed to fetch specialities');
        }
    };

    const handleDelete = (id) => {
        confirm({
            title: 'Êtes-vous sûr de vouloir supprimer cette spécialité?',
            icon: <ExclamationCircleOutlined />,
            content: 'Cette action ne peut pas être annulée.',
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Non',
            onOk() {
                deleteSpeciality(id);
            }
        });
    };

    const deleteSpeciality = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/speciality/${id}`);
            setSpecialities(specialities.filter(speciality => speciality._id !== id));
            message.success('Spécialité supprimée avec succès');
        } catch (error) {
            console.error('Error deleting speciality:', error);
            message.error('Failed to delete speciality');
        }
    };

    const handleAddNew = async (values) => {
        const existingSpeciality = specialities.find(speciality => speciality.nom.toLowerCase() === values.nom.toLowerCase());
        if (existingSpeciality) {
            message.error('Une spécialité avec le même nom existe déjà.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/speciality', values);
            setSpecialities([...specialities, response.data]);
            message.success('Spécialité ajoutée avec succès');
            addForm.resetFields();
        } catch (error) {
            console.error('Error adding speciality:', error);
            message.error('Failed to add speciality');
        }
    };

    const handleEdit = (record) => {
        setCurrentSpeciality(record);
        editForm.setFieldsValue(record);
        setIsEditModalVisible(true);
    };

    const handleEditSave = async (values) => {
        const isDuplicate = specialities.some(speciality => 
            speciality._id !== currentSpeciality._id && 
            speciality.nom.toLowerCase() === values.nom.toLowerCase()
        );

        if (isDuplicate) {
            message.error('Une spécialité avec ce nom existe déjà.');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/speciality/${currentSpeciality._id}`, values);
            setSpecialities(specialities.map(speciality =>
                speciality._id === currentSpeciality._id ? response.data : speciality
            ));
            message.success('Spécialité mise à jour avec succès');
            setIsEditModalVisible(false);
        } catch (error) {
            console.error('Error updating speciality:', error);
            message.error('Failed to update speciality');
        }
    };

    const columns = [
        {
            title: 'Nom',
            dataIndex: 'nom',
            key: 'nom',
            render: text => <span className="font-bold">{text}</span>
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            align: 'justify',
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Space size="middle" className="flex justify-center">
                    <Button icon={<EditOutlined style={{ color: 'green' }} />} onClick={() => handleEdit(record)} />
                    <Button icon={<DeleteOutlined style={{ color: 'red' }} />} onClick={() => handleDelete(record._id)} />
                </Space>
            )
        }
    ];

    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item>
                    <Link to="/">Tableau de Bord</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Gestion des Spécialités</Breadcrumb.Item>
            </Breadcrumb>
            <h2 className="text-2xl font-bold">Spécialités :</h2>
            <div className="p-7 flex flex-wrap justify-between mt-4 md:mt-8 lg:mt-5">
                <Card className="p-7 w-full lg:w-2/5 border-2 rounded shadow-lg">
                    <h2 className="text-center text-2xl font-bold mb-9">Ajouter une nouvelle spécialité</h2>
                    <Form
                        form={addForm}
                        onFinish={handleAddNew}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                    >
                        <Form.Item
                            label="Nom"
                            name="nom"
                            rules={[{ required: true, message: 'Veuillez entrer le nom de la spécialité!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Description"
                            name="description"
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                Ajouter la spécialité
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
                <Table
                    className="w-full lg:w-7/12 border rounded shadow-lg lg:mr-4"
                    columns={columns}
                    dataSource={specialities}
                    rowKey="_id"
                    pagination={{ pageSize: 4 }}
                />
            </div>
            <div className="w-full md:w-1/3">
                <Modal
                    title="Modifier la spécialité"
                    visible={isEditModalVisible}
                    onCancel={() => setIsEditModalVisible(false)}
                    footer={null}
                >
                    <Form
                        form={editForm}
                        onFinish={handleEditSave}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                    >
                        <Form.Item
                            label="Nom"
                            name="nom"
                            rules={[{ required: true, message: 'Veuillez entrer le nom de la spécialité!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Description"
                            name="description"
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                Enregistrer les modifications
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </>
    );
};

export default SpecialityDashboard;
