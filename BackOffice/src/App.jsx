import React, { useEffect, useContext } from "react";
import SideBar from "./Components/SideBar";
import { Routes, Route , useNavigate} from "react-router-dom";
import { Layout, theme } from "antd";
import Header from "./Components/Header";
import ListAdmin from "./Components/Pages/Admin/ListeAdmin";
import ListCoach from "./Components/Pages/Coachs/ListCoach";
import SignIn from "./Components/Pages/Auth/SignIn"
import Forget from "./Components/Pages/Auth/Forget"
import Confirm from "./Components/Pages/Auth/Confirm"
import Dashboard from "./Components/Pages/Home";
import Calendar from './Components/Pages/Calendar';
import Appoint from './Components/Pages/Appoint';
import Profile from './Components/Pages/Profile';
import Speciality from './Components/Pages/Speciality';
// import ErrorBoundary from './Components/ErrorBoundar';
import ListeClients from "./Components/Pages/Clients/ListeClients";
import ImportClients from "./Components/Pages/Clients/ImportClients";
import ImportCoachs from "./Components/Pages/Coachs/ImportCoachs";
import ClientDetailsPage from "./Components/Pages/Clients/ClientsDetails";
import CoachsDetailsPage from "./Components/Pages/Coachs/CoachDetails";
import ClientCommentsPage from "./Components/Pages/Clients/ClientCommentsPage";
import CoachsComments from "./Components/Pages/Coachs/CoachCommentsPage";
import Contrat from "./Components/Pages/ContratDetails";
import Commerciale from "./Components/Pages/Commercials/Commerciaux";
import AddClients from "./Components/Pages/Clients/AddClients";
import Affectations from "./Components/Pages/Clients/AffectationClient"
import AjoutCoach from "./Components/Pages/Coachs/AddCoachs";
import AffectationCoach from "./Components/Pages/Coachs/AffectationCoach";








import { LoginContext } from "./Components/store/LoginContext";
import ContractPage from "./Components/Pages/ContratDetails";
import TéléhargeContrat from "./Components/Pages/TéléhargeContrat";




const MainLayout = ({ children }) => {
  const { isLoggedIn } = useContext(LoginContext);  
  const { Content } = Layout;
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();


  const navigate = useNavigate()
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, []);


  return (
    <Layout>
      <Header />
      <Layout>
        <div className="flex min-h-screen">
          <SideBar />
        </div>
        <Content
          className="m-6 p-6"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

function App() {
  const { decodedToken } = useContext(LoginContext);
  const isDoc = () => {
    return decodedToken  && decodedToken.role==="Commercial"
  }

  return (
    // <ErrorBoundary>
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
      />
      <Route path="/login" element={<SignIn/>} />
      <Route path="/ForgotPassword" element={<Forget />} />
      <Route path="/confirm" element={<Confirm />} />


      <Route
        path="/profile"
        element={
          <MainLayout>
            <Profile />
          </MainLayout>
        }
      />
      {/* {!isDoc()&&(  */}
        <Route
        path="/speciality"
        element={
          <MainLayout>
            <Speciality />
          </MainLayout>
        }
      />
      {/* )}  */}

    
  {!isDoc()&&( 
      <Route
        path="/list-admin"
        element={
          <MainLayout>
            <ListAdmin />
          </MainLayout>
        }
      />
    )} 

      <Route
        path="/appointments"
        element={
          <MainLayout>
            <Appoint />
          </MainLayout>
        }
      />
      {/* {isDoc() && (
        <Route
          path="/calendar"
          element={
            <MainLayout>
              <Calendar />
            </MainLayout>
          }
        />
      )}
       */}
      <Route
        path="/list-coachs"
        element={
          <MainLayout>
            <ListCoach />
          </MainLayout>
        }
      />
      <Route
        path="/coach/:id"
        element={
          <MainLayout>
            <CoachsDetailsPage/>
          </MainLayout>
        }
      />
      <Route
        path="/ajouter-coachs"
        element={
          <MainLayout>
            <AjoutCoach />
          </MainLayout>
        }
      />
       <Route
        path="/affect-coachs"
        element={
          <MainLayout>
            <AffectationCoach/>
          </MainLayout>
        }
      />
       <Route
          path="/import-coachs"
          element={
            <MainLayout>
              <ImportCoachs/>
            </MainLayout>
          }
        />
       <Route
        path="/list-clients"
        element={
          <MainLayout>
            <ListeClients/>
          </MainLayout>
        }
      />
       <Route
        path="/ajout-clients"
        element={
          <MainLayout>
            <AddClients/>
          </MainLayout>
        }
      />
      <Route
        path="/affect-clients"
        element={
          <MainLayout>
            <Affectations/>
          </MainLayout>
        }
      />
       <Route
        path="/import-clients"
        element={
          <MainLayout>
            <ImportClients />
          </MainLayout>
        }
      />

      <Route
        path="/client/:id"
        element={
          <MainLayout>
            <ClientDetailsPage/>
          </MainLayout>
        }
      />
      <Route
          path="/client/:id/comments" 
          element={
            <MainLayout>
              <ClientCommentsPage />
            </MainLayout>
      }
       />

      <Route
          path="/coach/:id/comments" 
          element={
            <MainLayout>
              <CoachsComments/>
            </MainLayout>
      }
       />
      
      <Route
          path="/contrat/:id"
          element={
            <MainLayout>
              <ContractPage/>
            </MainLayout>
          }
        />
       <Route
  path="/téléchargecontrat"
  element={
    <MainLayout>
      <TéléhargeContrat />
    </MainLayout>
  }
/>

      {!isDoc()&&(

      <Route
          path="/commerciaux"
          element={
            <MainLayout>
              <Commerciale/>
            </MainLayout>
          }
        />      )}


    </Routes>

        
    // </ErrorBoundary>

  );
}

export default App;