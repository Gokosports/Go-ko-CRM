import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Upload, message, Avatar } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const Profile = () => {
  const token = localStorage.getItem('token');
  const decodedToken = jwtDecode(token);
  const [form] = Form.useForm();
  const [userData, setUserData] = useState({
    _id: "",
    prenom: "",
    nom: "",
    email: "",
    imageUrl: ""
  });
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const role = decodedToken.role;
      const userId = decodedToken.userId;
      const url = `https://go-ko.onrender.com/${role === 'Admin' ? 'admin' : 'commercials'}/${userId}`;

      console.log('Fetching data from URL:', url); // Debug log

      try {
        const response = await axios.get(url, {
          headers: { authorization: `Bearer ${token}` }
        });
        const data = response.data;
        setUserData(data);
        form.setFieldsValue(data);
        if (data.imageUrl) {
          setFileList([
            {
              uid: '-1',
              name: 'image.png',
              status: 'done',
              url: data.imageUrl,
            },
          ]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        message.error('Échec de la récupération du profil.');
      }
    };

    fetchUserData();
  }, [form, token, decodedToken.role, decodedToken.userId]);

  const onFinish = async (values) => {
    const role = decodedToken.role;
    const id = userData._id;
    const url = `https://go-ko.onrender.com/${role === 'Admin' ? 'admin' : 'commercials'}/${id}`;

    try {
      const response = await axios.put(url, {
        ...values,
        imageUrl: userData.imageUrl,
      }, {
        headers: { authorization: `Bearer ${token}` }
      });
      message.success('Informations mises à jour avec succès !');
      setUserData(response.data);
      form.setFieldsValue(response.data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      message.error('Échec de la mise à jour des informations.');
    }
  };

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  const uploadProps = {
    name: 'file',
    action: 'https://api.cloudinary.com/v1_1/doagzivng/image/upload',
    data: {
      upload_preset: 'kj1jodbh',
    },
    listType: 'picture',
    fileList,
    onChange(info) {
      const { fileList } = info;
      setFileList(fileList);

      if (info.file.status === 'done') {
        console.log('Fichier téléchargé:', info.file.response);
        const newImageUrl = info.file.response.secure_url;
        setUserData(prevUserData => ({
          ...prevUserData,
          imageUrl: newImageUrl
        }));
        form.setFieldsValue({ imageUrl: newImageUrl });

        // Updating the backend immediately after the image is uploaded
        const role = decodedToken.role;
        const id = userData._id;
        const url = `https://go-ko.onrender.com/${role === 'Admin' ? 'admin' : 'commercials'}/${id}`;
        axios.put(url, {
          ...userData,
          imageUrl: newImageUrl
        }, {
          headers: { authorization: `Bearer ${token}` }
        }).then(response => {
          message.success('Image mise à jour avec succès !');
          setUserData(response.data);
        }).catch(error => {
          console.error('Erreur lors de la mise à jour de l\'image:', error);
          message.error('Échec de la mise à jour de l\'image.');
        });
      } else if (info.file.status === 'error') {
        console.error('Erreur de téléchargement:', info.file.error, info.file.response);
        message.error('Échec du téléchargement de l\'image.');
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    form.setFieldsValue(userData);
    if (userData.imageUrl) {
      setFileList([
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: userData.imageUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
  };

  const handleDeleteImage = async () => {
    const role = decodedToken.role;
    const id = userData._id;
    const url = `https://go-ko.onrender.com/${role === 'Admin' ? 'admin' : 'commercials'}/${id}`;

    try {
      const response = await axios.put(url, {
        ...userData,
        imageUrl: ""
      }, {
        headers: { authorization: `Bearer ${token}` }
      });
      setUserData({ ...userData, imageUrl: "" });
      form.setFieldsValue({ imageUrl: "" });
      setFileList([]);
      message.success('Image supprimée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      message.error('Échec de la suppression de l\'image.');
    }
  };

  const getAvatarText = (prenom, nom) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="p-5 border-2 shadow-lg border-grey-300 rounded">
      <h2 className="text-2xl font-bold mb-3">Bienvenue sur votre profil :</h2>

      <Form
        form={form}
        {...formItemLayout}
        initialValues={userData}
        onFinish={onFinish}
        className="justify-text"
      >
        <div className="flex justify-center mb-5">
          {userData.imageUrl ? (
            <>
              <Avatar
                src={userData.imageUrl}
                alt="Image de profil"
                className="rounded-full"
                size={150}
              />
              <Button
                type="danger"
                shape="circle"
                icon={<FontAwesomeIcon icon={faTrash} />}
                onClick={handleDeleteImage}
                className="ml-2"
              />
            </>
          ) : (
            <Avatar size={80} className="rounded-full bg-blue-900" style={{ fontSize: '36px' }}>
              {getAvatarText(userData.prenom, userData.nom)}
            </Avatar>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Form.Item label="Prénom" name="prenom" rules={[{ required: true, message: 'Veuillez entrer votre prénom !' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Nom" name="nom" rules={[{ required: true, message: 'Veuillez entrer votre nom !' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Veuillez entrer votre email !' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Image" name="imageUrl">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Télécharger</Button>
            </Upload>
          </Form.Item>
        </div>
        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Button type="primary" htmlType="submit" icon={<FontAwesomeIcon icon={faSave} />}>
            Enregistrer
          </Button>
          <Button type="default" htmlType="button" className="ml-2" onClick={handleCancel}>
            Annuler
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Profile;
