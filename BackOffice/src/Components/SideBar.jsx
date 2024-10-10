import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileContract,
  faUserTag,
  faCalendarAlt,
  faUserFriends,
  faHome,
  faUserTie,
  faUser,
  faUsers,
  faUserMd,
  faList,
  faPlus,
  faFileImport,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Layout, Menu } from "antd";

import { ToggleContext } from "./store/ToggleContext";
// import { LoginContext } from './store/LoginContext';
import { jwtDecode } from "jwt-decode";

const { Sider } = Layout;
const { SubMenu } = Menu;

const SideBar = () => {
  const { collapsed } = useContext(ToggleContext);
  // const { decodedToken } = useContext(LoginContext);
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : "";
  const navigate = useNavigate();
  const location = useLocation();

  const coachId = decodedToken?.coachId;

  const items = [
    {
      key: "/",
      icon: <FontAwesomeIcon icon={faHome} />,
      label: "Tableau de Bord",
    },
    {
      key: "/clients",
      icon: <FontAwesomeIcon icon={faUserFriends} />,
      label: "Clients",
      role: "Admin",
      children: [
        {
          key: "/ajout-clients",
          label: "Ajouter Clients",
          icon: <FontAwesomeIcon icon={faPlusCircle} />,
        },
        {
          key: "/list-clients",
          label: "Liste Clients",
          icon: <FontAwesomeIcon icon={faList} />,
        },
        {
          key: "/import-clients",
          label: "Importer Clients",
          icon: <FontAwesomeIcon icon={faFileImport} />,
        },
        {
          key: "/affect-clients",
          label: "Affectation",
          icon: <FontAwesomeIcon icon={faUserTag} />,
          role: "Admin",
        },
      ],
    },
    // {
    //     key: '/clients',
    //     icon: <FontAwesomeIcon icon={faUserFriends} />,
    //     label: 'Clients',
    //     role:"Commercial",

    //     children: [
    //         {
    //             key: '/list-clients',
    //             label: 'Liste Clients',
    //             icon: <FontAwesomeIcon icon={faList} />,
    //         },
    //         {
    //             key: '/import-clients',
    //             label: 'Importer Clients',
    //             icon: <FontAwesomeIcon icon={faFileImport} />,
    //         },
    //     ],
    // },
    {
      key: "/coach",
      icon: <FontAwesomeIcon icon={faUsers} />,
      label: "Coachs",
      role: "Admin",
      children: [
        {
          key: "/ajouter-coachs",
          label: "Ajouter Coachs",
          icon: <FontAwesomeIcon icon={faPlusCircle} />,
        },
        {
          key: "/list-coachs",
          label: "Liste Coachs",
          icon: <FontAwesomeIcon icon={faList} />,
        },
        {
          key: "/import-coachs",
          label: "Importer Coachs",
          icon: <FontAwesomeIcon icon={faFileImport} />,
        },
        {
          key: "/affect-coachs",
          label: "Affectation Coachs",
          icon: <FontAwesomeIcon icon={faUserTag} />,
        },
      ],
    },
    {
      key: "/coach",
      icon: <FontAwesomeIcon icon={faUsers} />,
      label: "Coachs",
      role: "Commercial",
      children: [
        {
          key: "/list-coaches",
          label: "Liste Coachs",
          icon: <FontAwesomeIcon icon={faList} />,
        },
        // {
        //     key: '/import-coachs',
        //     label: 'Importer Coachs',
        //     icon: <FontAwesomeIcon icon={faFileImport} />,
        // },
      ],
    },

    {
      key: "/téléchargerContrat",
      icon: <FontAwesomeIcon icon={faFileContract} />,
      label: "Contrat",
      role: "Admin",
    },
    {
      key: "/ContratInfos",
      icon: <FontAwesomeIcon icon={faFileContract} />,
      label: "Devis",
      role: "Commercial",
    },
    {
      key: "/DevisValidé",
      icon: <FontAwesomeIcon icon={faFileContract} />,
      label: "DevisValidé",
      role: "Commercial",
    },
    // {
    //   key: "/CalendarCommerciale",
    //   icon: <FontAwesomeIcon icon={faCalendarAlt} />,
    //   label: "Calendar",
    //   role: "Commercial",
    // },
    {
        key: '/CalendarCommerciale', // Update the key if necessary
        icon: <FontAwesomeIcon icon={faCalendarAlt} />,
        label: 'Calendar',
        role: 'Commercial',
      },
    {
      key: "/admin",
      icon: <FontAwesomeIcon icon={faUser} />,
      label: "Admin",
      role: "Admin",

      children: [
        {
          key: "/list-admin",
          label: "List Admins",
          icon: <FontAwesomeIcon icon={faList} />,
        },
      ],
    },
    // {
    //     key: '/contrat',
    //     icon: <FontAwesomeIcon icon={faFileContract} />,
    //     label: 'Contrat',
    // },

    {
      key: "/commerciaux",
      icon: <FontAwesomeIcon icon={faUserTie} />,
      label: "Commerciaux",
      role: "Admin",
    },
  ];

  const filteredItems = items.filter((item) => {
    if (item.role) {
      return decodedToken.role === item.role;
    }
    return true;
  });

  const isActive = (path) => location.pathname === path;
  

  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <div className="demo-logo-vertical" />
      <Menu
        className="mt-5"
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => {
          navigate(key);
        }}
      >
        {filteredItems.map((item) =>
          item.children ? (
            <SubMenu key={item.key} icon={item.icon} title={item.label}>
              {item.children.map((child) => (
                <Menu.Item
                  key={child.key}
                  icon={child.icon}
                  className={isActive(child.key) ? "active" : ""}
                >
                  {child.label}
                </Menu.Item>
              ))}
            </SubMenu>
          ) : (
            <Menu.Item
              key={item.key}
              icon={item.icon}
              className={isActive(item.key) ? "active" : ""}
            >
              {item.label}
            </Menu.Item>
          )
        )}
      </Menu>
    </Sider>
  );
};

export default SideBar;
