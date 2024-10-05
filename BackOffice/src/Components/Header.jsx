import React, { useContext, useState, useEffect } from "react";
import {
  Layout,
  Input,
  Avatar,
  Button,
  Modal,
  Form,
  Input as AntdInput,
} from "antd";
import { ToggleContext } from "./store/ToggleContext";
import {
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPersonSnowboarding,
  faEdit,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Dropdown } from "antd";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import logo from "../assets/images/goko.png";

const Header = () => {
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const navigate = useNavigate();


  const Logout = async () => {
    await axios.post("https://go-ko-9qul.onrender.com/admin/logout");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menu = (
    <Menu>
      {/* <Menu.Item key="settings" icon={<SettingOutlined />}>
        Setting
      </Menu.Item> */}
      <Menu.Item onClick={Logout} key="logout" icon={<LogoutOutlined />}>
        Déconnecté
      </Menu.Item>
    </Menu>
  );

  const role = decodedToken?.role;
  const { Header } = Layout;
  const { collapsed, onClickHandler } = useContext(ToggleContext);
  const [profileVisible, setProfileVisible] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://go-ko-9qul.onrender.com/admin",
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );
        const data = response.data;
        setProfileImage(data.imageUrl);
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
    };

    if (token) {
      fetchProfileImage();
    }
  }, [token]);

 

  const showProfile = () => {
    setProfileVisible(true);
  };

  const hideProfile = () => {
    setProfileVisible(false);
  };

  const getInitials = (name) => {
    const names = name.split(" ");
    const initials = names.map((n) => n[0]).join("");
    return initials.toUpperCase();
  };

  

  return (
    <Header
      className="header flex items-center justify-between"
      style={{ maxHeight: "100%", padding: "0 25px" }}
    >
    <div className="flex">
    <Button
        type="text"
        icon={
          collapsed ? (
            <MenuUnfoldOutlined style={{ fontSize: "20px" }} />
          ) : (
            <MenuFoldOutlined style={{ fontSize: "20px" }} />
          )
        }
        onClick={onClickHandler}
        style={{
          fontSize: "20px",
          marginRight: "30px",
          color: "#fff",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          outline: "none",
        }}
      />
      <Link to="/">
      <img src={logo} alt="logo" className="w-12 h-10 ml-16" />
  </Link>
    </div>
        {/* <div className="logo flex items-end">
        </div> */}
          {/* <span className="font-bold text-white text-2xl">GOKO</span> */}
      {/* <div className="flex items-center ml-4 mr-auto">
        <Input
          type="text"
          placeholder="Rechercher..."
          prefix={<SearchOutlined />}
          className="w-48"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyUp={handleKeyPress}
        />
      </div> */}
      <div className="flex items-center">
        <Avatar src={profileImage} className="bg-blue-950 mr-2" size={40}>
          {!profileImage &&
            (decodedToken ? getInitials(decodedToken.name) : <UserOutlined />)}
        </Avatar>
        <div
          className="text-white text-lg font-semibold mr-4 cursor-pointer"
          onClick={showProfile}
        >
          <div>{decodedToken?.name}</div>
          <div className="text-sm">{role}</div>
        </div>
        <Dropdown overlay={menu}>
          <SettingOutlined className="text-white text-2xl ml-6" />
        </Dropdown>
      </div>
      <Modal
        title="Profile"
        visible={profileVisible}
        onCancel={hideProfile}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Nom">
            <AntdInput defaultValue={decodedToken?.name} />
          </Form.Item>
          <Form.Item label="Rôle">
            <AntdInput defaultValue={role} />
          </Form.Item>
          <Link to="/profile">
            <Button
              onClick={hideProfile}
              type="primary"
              icon={<FontAwesomeIcon icon={faEdit} />}
              className="mr-2"
            >
              Edit
            </Button>
          </Link>
          <Button
            onClick={hideProfile}
            icon={<FontAwesomeIcon icon={faClose} />}
          >
            Close
          </Button>
        </Form>
      </Modal>
    </Header>
  );
};

export default Header;
