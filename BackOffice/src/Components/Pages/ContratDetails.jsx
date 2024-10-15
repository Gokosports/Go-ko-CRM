// import React, { useState, useEffect } from "react";
// import {
//   Form,
//   Input,
//   Button,
//   DatePicker,
//   message,
//   Radio,
//   Select,
//   Modal,
// } from "antd";
// import { jsPDF } from "jspdf";
// import "jspdf-autotable";
// import "tailwindcss/tailwind.css";
// import logo from "../../assets/images/goko.png";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import SignaturePadComponent from "../SignaturePadComponent";

// const { Option } = Select;

// const ContractPage = () => {
//   const { id } = useParams();
//   const [form] = Form.useForm();
//   const [totalPrice, setTotalPrice] = useState("€ 0");
//   const [selectedDuration, setSelectedDuration] = useState("1 an");
//   const [coach, setCoach] = useState(null);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [ht, setHT] = useState(0); // State for HT (Hors Taxes)
//   const [ttc, setTTC] = useState(0); // State for TTC (Toutes Taxes Comprises)
//   const taxRate = 0.2; // Fixed tax rate (20%)
//   const [signature, setSignature] = useState(null);

//   useEffect(() => {
//     fetchCoach();
//   }, []);

//   const fetchCoach = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         `https://go-ko-9qul.onrender.com/coaches/${id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setCoach(response.data);
//       form.setFieldsValue({
//         nemuro: response.data._id,
//         clientName: `${response.data.prenom} ${response.data.nom}`,
//         phone: response.data.phone,
//         email: response.data.email,
//         age: response.data.age,
//         sex: response.data.sex,
//         address: response.data.ville,
//       });
//     } catch (error) {
//       console.error("Error fetching coach:", error);
//     }
//   };

//   const handleFinish = (values) => {
//     const newContract = { ...values, id: new Date().getTime() };
//     generateAndUploadPDF(newContract); // Call PDF generation and upload
//     message.success("Contrat créé avec succès");
//     form.resetFields();
//   };
//   const showModal = () => {
//     setIsModalVisible(true);
//   };
//   const handleOk = () => {
//     setIsModalVisible(false);
//   };
//   const handleCancel = () => {
//     setIsModalVisible(false);
//   };

//   const handleDurationChange = (e) => {
//     const duration = e.target.value;

//     // Mapping of durations to price values
//     const priceMap = {
//       "12 mois - 64,90 € par mois": 64.9,
//       "18 mois - 59,90 € par mois": 59.9,
//       "24 mois - 54,90 € par mois": 54.9,
//     };

//     const selectedPrice = priceMap[duration] || 0;
//     setTotalPrice(`€ ${selectedPrice.toFixed(2)} par mois`);

//     // Calculate HT and TTC based on the selected price
//     const calculatedHT = selectedPrice / (1 + taxRate);
//     const calculatedTTC = selectedPrice;

//     setHT(calculatedHT);
//     setTTC(calculatedTTC);
//   };

//   const generateAndUploadPDF = async (contract) => {
//     const doc = new jsPDF("p", "pt", "a4");
//     doc.addImage(logo, "PNG", 450, 16, 100, 40);
//     doc.setFontSize(16);
//     doc.text("Contrat d'Abonnement au Service de Coaching", 40, 40);
//     const supplementsList =
//       contract.supplement.length > 0 ? contract.supplement.join(", ") : "Aucun";

//     const tableData = [
//       ["No de membre (référence du mandat)", contract.nemuro],
//       ["Adresse club", contract.clubAddress],
//       ["Date d’inscription", contract.startDate.format("DD-MM-YYYY")],
//       ["Date de début du contrat", contract.startDate.format("DD-MM-YYYY")],
//       ["Date de fin du contrat", contract.endDate.format("DD-MM-YYYY")],
//       ["Prénom + Nom", contract.clientName],
//       ["Montant total", totalPrice],
//       ["Adresse", `${contract.address}`],
//       ["Code postal", contract.zipCode],
//       ["Localité", contract.city],
//       ["Pays", contract.country],
//       ["Téléphone", contract.phone],
//       ["Adresse e-mail", contract.email],
//       ["Type d’affiliation", contract.affiliationType],
//       ["Durée du contrat", contract.contractDuration],
//       ["Montant Total HT", `${ht.toFixed(2)} €`],
//       ["Montant Total TTC", `${ttc.toFixed(2)} €`],
//       ["Suppléments", supplementsList],
//       ["RIB", contract.rib],
//       [
//         "MANDAT DE PRÉLÈVEMENT SEPA",
//         "En signant ce mandat, vous donnez l’autorisation (A) à [Nom de l'Application] d’envoyer des instructions à votre banque pour débiter votre compte et (B) votre banque à débiter votre compte conformément aux instructions de [Nom de l'Application].",
//       ],
//     ];

//     doc.autoTable({
//       head: [["Champ", "Information"]],
//       body: tableData,
//       startY: 60,
//       margin: { horizontal: 40 },
//       theme: "grid",
//       headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
//       styles: { cellPadding: 5, fontSize: 10 },
//     });
//     doc.text("Signature:", 400, doc.lastAutoTable.finalY + 50);

//     // Convert the generated PDF to Blob format
//     const pdfBlob = doc.output("blob");
//     const [recipientPrenom, recipientNom] = contract.clientName.split(" ");
//     await uploadPDFToServer(
//       pdfBlob,
//       contract.id,
//       contract.email,
//       recipientNom,
//       recipientPrenom
//     );
//   };

//   const uploadPDFToServer = async (
//     pdfBlob,
//     contractId,
//     email,
//     recipientNom,
//     recipientPrenom
//   ) => {
//     const clientName = `${recipientPrenom} ${recipientNom}`;
//     console.log("Client Name:", clientName);
//     const formData = new FormData();
//     formData.append(
//       "pdf",
//       new Blob([pdfBlob], { type: "application/pdf" }),
//       `contrat_${contractId}.pdf`
//     );
//     formData.append("email", email);
//     formData.append("clientName", clientName);

//     try {
//       const response = await axios.post(
//         "https://go-ko-9qul.onrender.com/api/upload",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       console.log("PDF uploaded successfully:", response.data);
//       message.success("PDF envoyé au serveur avec succès.");
//     } catch (error) {
//       console.error(
//         "Erreur lors de l'envoi du PDF :",
//         error.response?.data || error
//       );
//       message.error("Échec de l'envoi du PDF.");
//     }
//   };

//   return (
//     <div className="p-8 bg-white shadow rounded-lg max-w-4xl mx-auto mt-8">
//       <h2 className="text-2xl font-bold mb-6">Créer un Contrat pour Coach</h2>
//       <Form form={form} layout="vertical" onFinish={handleFinish}>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Form Items */}
//           <Form.Item
//             name="nemuro"
//             label="No de membre (référence du mandat)"
//             rules={[
//               {
//                 required: true,
//                 message: "Veuillez entrer le numéro de membre",
//               },
//             ]}
//           >
//             <Input className="rounded-md" />
//           </Form.Item>
//           <Form.Item
//             name="clientName"
//             label="Prénom + Nom"
//             rules={[
//               { required: true, message: "Veuillez entrer le nom du client" },
//             ]}
//           >
//             <Input className="rounded-md" />
//           </Form.Item>
//           <Form.Item
//             name="startDate"
//             label="Date de Début"
//             rules={[
//               {
//                 required: true,
//                 message: "Veuillez sélectionner la date de début",
//               },
//             ]}
//           >
//             <DatePicker style={{ width: "100%" }} className="rounded-md" />
//           </Form.Item>
//           <Form.Item
//             name="endDate"
//             label="Date de Fin"
//             rules={[
//               {
//                 required: true,
//                 message: "Veuillez sélectionner la date de fin",
//               },
//             ]}
//           >
//             <DatePicker style={{ width: "100%" }} className="rounded-md" />
//           </Form.Item>
//           <Form.Item
//             name="address"
//             label="Adresse"
//             rules={[{ required: true, message: "Veuillez entrer l’adresse" }]}
//           >
//             <Input className="rounded-md" />
//           </Form.Item>
//           <Form.Item
//             name="zipCode"
//             label="Code Postal"
//             rules={[
//               { required: true, message: "Veuillez entrer le code postal" },
//             ]}
//           >
//             <Input className="rounded-md" />
//           </Form.Item>
//           <Form.Item
//             name="city"
//             label="Localité"
//             rules={[{ required: true, message: "Veuillez entrer la localité" }]}
//           >
//             <Input className="rounded-md" />
//           </Form.Item>
//           <Form.Item
//             name="country"
//             label="Pays"
//             rules={[{ required: true, message: "Veuillez entrer le pays" }]}
//           >
//             <Input className="rounded-md" />
//           </Form.Item>
//           <Form.Item
//             name="phone"
//             label="Téléphone"
//             rules={[
//               {
//                 required: true,
//                 message: "Veuillez entrer le numéro de téléphone",
//               },
//             ]}
//           >
//             <Input className="rounded-md" />
//           </Form.Item>
//           <Form.Item
//             name="email"
//             label="Adresse e-mail"
//             rules={[
//               { required: true, message: "Veuillez entrer l’adresse e-mail" },
//             ]}
//           >
//             <Input className="rounded-md" />
//           </Form.Item>
//           <Form.Item
//             name="affiliationType"
//             label="Type d’affiliation"
//             rules={[
//               {
//                 required: true,
//                 message: "Veuillez entrer le type d’affiliation",
//               },
//             ]}
//           >
//             <Input className="rounded-md" />
//           </Form.Item>
//           <Form.Item
//             name="clubAddress"
//             label="Adresse du Club"
//             rules={[
//               { required: true, message: "Veuillez entrer l’adresse du club" },
//             ]}
//           >
//             <Input className="rounded-md" />
//           </Form.Item>
//           <Form.Item
//             name="contractDuration"
//             label="Durée du contrat"
//             rules={[
//               {
//                 required: true,
//                 message: "Veuillez sélectionner la durée du contrat",
//               },
//             ]}
//           >
//             <Radio.Group onChange={handleDurationChange}>
//               <Radio value="12 mois - 64,90 € par mois">
//                 12 mois - 64,90 € par mois
//               </Radio>
//               <Radio value="18 mois - 59,90 € par mois">
//                 18 mois - 59,90 € par mois
//               </Radio>
//               <Radio value="24 mois - 54,90 € par mois">
//                 24 mois - 54,90 € par mois
//               </Radio>
//             </Radio.Group>
//           </Form.Item>
//           <Form.Item label="Montant Total HT">
//             <Input
//               value={`€ ${ht.toFixed(2)}`}
//               readOnly
//               className="rounded-md"
//             />
//           </Form.Item>

//           <Form.Item label="Montant Total TTC">
//             <Input
//               value={`€ ${ttc.toFixed(2)}`}
//               readOnly
//               className="rounded-md"
//             />
//           </Form.Item>
//           <Form.Item
//             name="supplement"
//             label="Suppléments"
//             rules={[
//               {
//                 required: true,
//                 message: "Veuillez sélectionner un supplément",
//               },
//             ]}
//           >
//             <Select
//               placeholder="Choisissez un supplément"
//               className="rounded-md"
//               mode="multiple"
//               allowClear
//             >
//               <Option value="Football">Football</Option>
//               <Option value="Course à pied">Course à pied</Option>
//               <Option value="Fitness">Fitness</Option>
//               <Option value="Musculation">Musculation</Option>
//               <Option value="Tennis">Tennis</Option>
//               <Option value="Basketball">Basketball</Option>
//               <Option value="Cyclisme (incluant BMX)">
//                 Cyclisme (incluant BMX)
//               </Option>
//               <Option value="Rugby">Rugby</Option>
//               <Option value="Natation">Natation</Option>
//               <Option value="Handball">Handball</Option>
//               <Option value="Volleyball">Volleyball</Option>
//               <Option value="Golf">Golf</Option>
//               <Option value="Ski">Ski</Option>
//               <Option value="Boxe">Boxe</Option>
//               <Option value="Arts martiaux (inclut Judo et Taekwondo)">
//                 Arts martiaux (inclut Judo et Taekwondo)
//               </Option>
//               <Option value="Escalade">Escalade</Option>
//               <Option value="Gymnastique">Gymnastique</Option>
//               <Option value="Surf">Surf</Option>
//               <Option value="Paddle">Paddle</Option>
//               <Option value="Triathlon">Triathlon</Option>
//               <Option value="Patinage artistique">Patinage artistique</Option>
//               <Option value="Skateboard">Skateboard</Option>
//               <Option value="Aviron">Aviron</Option>
//               <Option value="Kitesurf">Kitesurf</Option>
//               <Option value="Plongeon">Plongeon</Option>
//               <Option value="Breakdance">Breakdance</Option>
//               <Option value="Escrime">Escrime</Option>
//               <Option value="Lutte">Lutte</Option>
//               <Option value="Canoë-Kayak (Sprint et Slalom)">
//                 Canoë-Kayak (Sprint et Slalom)
//               </Option>
//               <Option value="Softball">Softball</Option>
//               <Option value="Snowboard">Snowboard</Option>
//               <Option value="Hockey sur glace">Hockey sur glace</Option>
//               <Option value="Squash">Squash</Option>
//               <Option value="Renforcement musculaire et conditionnement">
//                 Renforcement musculaire et conditionnement
//               </Option>
//               <Option value="Baseball">Baseball</Option>
//               <Option value="Tir à l'arc">Tir à l'arc</Option>
//               <Option value="Pentathlon moderne">Pentathlon moderne</Option>
//               <Option value="Cheerleading">Cheerleading</Option>
//               <Option value="Lacrosse">Lacrosse</Option>
//               <Option value="Hockey sur gazon">Hockey sur gazon</Option>
//               <Option value="Danse">Danse</Option>
//               <Option value="Badminton">Badminton</Option>
//               <Option value="Électrostimulation">Électrostimulation</Option>
//             </Select>
//           </Form.Item>
//           <Form.Item
//             name="rib"
//             label="RIB"
//             rules={[{ required: false, message: "Veuillez entrer le RIB" }]}
//           >
//             <Input className="rounded-md" />
//           </Form.Item>
//           <p className="text-lg mt-10 font-semibold">
//             Montant total : {totalPrice}
//           </p>
//         </div>
//         <Form.Item>
//           <Button type="primary" htmlType="submit" className="mr-4">
//             Créer et Envoyer le Contrat
//           </Button>

//           {/* <Button type="dashed" onClick={showModal} className="mb-4">
//   Add Signature
// </Button> */}
//         </Form.Item>
//       </Form>

//       <Modal
//         title="Aperçu du Contrat"
//         visible={isModalVisible}
//         onOk={handleOk}
//         onCancel={handleCancel}
//       >
//         <ul
//           className="list-disc list-inside"
//           style={{
//             marginLeft: "0px",
//             padding: "10px",
//             backgroundColor: "#f9f9f9",
//             borderRadius: "8px",
//             lineHeight: "1.8",
//             color: "#333",
//             fontSize: "16px",
//           }}
//         >
//           <li>
//             Le coach s'engage à fournir des séances d'entraînement selon
//             l'horaire convenu.
//           </li>
//           <li>
//             Le client s'engage à participer aux séances programmées et à
//             respecter les horaires.
//           </li>
//           <li>
//             Le paiement doit être effectué en totalité avant le début des
//             séances.
//           </li>
//           <li>
//             Le coach n'est pas responsable des blessures subies en dehors des
//             séances d'entraînement.
//           </li>
//           <li>
//             Le client doit informer le coach de tout problème de santé ou
//             blessure pouvant affecter la participation.
//           </li>
//           <li>
//             Le contrat peut être résilié par l'une ou l'autre des parties avec
//             un préavis de deux semaines.
//           </li>
//           <li>
//             En cas d'annulation de séance, un préavis de 24 heures est requis
//             pour éviter des frais supplémentaires.
//           </li>
//           <li>
//             Les séances non annulées dans les délais seront facturées au plein
//             tarif.
//           </li>
//           <li>
//             Le client doit respecter les horaires de début et de fin des
//             séances.
//           </li>
//           <li>
//             Tout retard de plus de 15 minutes sera considéré comme une séance
//             annulée sans préavis et sera facturé au plein tarif.
//           </li>
//           <li>
//             Le coach se réserve le droit de terminer la séance à l'heure prévue
//             même si le client est en retard.
//           </li>
//         </ul>
//         <SignaturePadComponent onSignatureComplete={setSignature} />
//         <Button type="primary" onClick={handleOk}>
//           Save
//         </Button>
//       </Modal>
//     </div>
//   );
// };

// export default ContractPage;

import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  message,
  Radio,
  Select,
  Modal,
  Tabs,
} from "antd";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "tailwindcss/tailwind.css";
import logo from "../../assets/images/goko.png";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
// import SignaturePadComponent from "../SignaturePadComponent";

const { Option } = Select;
const { TabPane } = Tabs;

const ContractPage = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [coach, setCoach] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [totalPrice, setTotalPrice] = useState("€ 0");
  const [ht, setHT] = useState(0); // State for HT (Hors Taxes)
  const [ttc, setTTC] = useState(0); // State for TTC (Toutes Taxes Comprises)
  const taxRate = 0.2; // Fixed tax rate (20%)
  // const [discountedPrice, setDiscountedPrice] = useState(0);
  const [specialities, setSpecialities] = useState([]);

  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const userRole = decodedToken ? decodedToken.role : null;

  const handleDurationChange = (e) => {
    const duration = e.target.value;

    // Mapping of durations to price values for 12, 18, and 24 months
    const priceMap = {
      "12 mois - 64,90 € par mois": 64.9,
      "18 mois - 59,90 € par mois": 59.9,
      "24 mois - 54,90 € par mois": 54.9,
    };

    let selectedPrice = priceMap[duration] || 0;
    let discountedPrice = selectedPrice;

    // Additional logic for bonus durations (1 year, 1.5 years, 2 years)
    if (duration === "59.91 € par mois (12 mois + 1 mois offert)") {
      discountedPrice = (64.9 * 12) / 13; // 1-year with 1 month bonus
    } else if (duration === "56.75 € par mois (18 mois + 1 mois offert)") {
      discountedPrice = (59.9 * 18) / 19; // 1.5 years with 1 month bonus
    } else if (duration === "52.70 € par mois (24 mois + 1 mois offert)") {
      discountedPrice = (54.9 * 24) / 25; // 2 years with 1 month bonus
    }

    setTotalPrice(`€ ${discountedPrice.toFixed(2)} par mois`);

    // Calculate HT and TTC based on the discounted price
    const calculatedHT = discountedPrice / (1 + taxRate);
    const calculatedTTC = discountedPrice;

    setHT(calculatedHT);
    setTTC(calculatedTTC);
  };

  useEffect(() => {
    fetchCoach();
    fetchSpecialities();
  }, []);

  const fetchSpecialities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://go-ko-9qul.onrender.com/speciality",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSpecialities(response.data);
    } catch (error) {
      console.error("Error fetching specialities:", error);
    }
  };

  const fetchCoach = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://go-ko-9qul.onrender.com/coaches/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCoach(response.data);

      // Accessing commercial name safely
      const commercialName = response.data.commercial
        ? `${response.data.commercial.prenom} ${response.data.commercial.nom}`
        : "";
      form.setFieldsValue({
        nemuro: response.data._id,
        clientName: `${response.data.prenom} ${response.data.nom}`,
        phone: response.data.phone,
        email: response.data.email,
        age: response.data.age,
        sex: response.data.sex,
        ville: response.data.ville,
        commercialName: commercialName,
        codepostal: response.data.codepostal,
        siret: response.data.siret,
        raisonsociale: response.data.raisonsociale,
        address: response.data.adresse,
      });
    } catch (error) {
      console.error("Error fetching coach:", error);
    }
  };

  const handleFinish = (values) => {
    const selectedSpecialities = values.supplement.map((id) => {
      const speciality = specialities.find((spec) => spec._id === id);
      return speciality ? speciality.nom : null; // Return name or null if not found
    }).filter(Boolean);
      console.log("Submitted values:", selectedSpecialities);
      const newContract = { ...values, supplement: selectedSpecialities, id: new Date().getTime() };
    generateAndUploadPDF(newContract); // Call PDF generation and upload
    message.success("Contrat créé avec succès");
    form.resetFields();
  };
  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    setIsModalVisible(false);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const generateAndUploadPDF = async (contract) => {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 40;
    const marginRight = 40;
    const marginTop = 40;
    const pageContentWidth = pageWidth - marginLeft - marginRight;
    let currentY = marginTop;

    doc.addImage(logo, "PNG", pageWidth - 110, 20, 60, 30);

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Contrat d'Abonnement au Service de Coaching",
      marginLeft,
      currentY
    );
    currentY += 40;

    // Contract details
    const supplementsList =
      contract.supplement.length > 0 ? contract.supplement.join(", ") : "Aucun";
    const tableData = [
      ["No de membre (référence du mandat)", contract.nemuro],
      ["Prénom + Nom", contract.clientName],
      ["SIRET", contract.siret],
      ["Date de début du contrat", contract.startDate.format("DD-MM-YYYY")],
      ["Date de fin du contrat", contract.endDate.format("DD-MM-YYYY")],
      ["Adresse club", contract.clubAddress],
      [
        "Montant total", contract.contractDuration
        // contract.contractDuration === "12 mois + 1 mois offert" ||
        // contract.contractDuration === "18 mois + 1 mois offert" ||
        // contract.contractDuration === "24 mois + 1 mois offert"
        //   ? `${(discountedPrice * 12).toFixed(2)} €`
        //   : totalPrice,
      ],
      ["Adresse", `${contract.address}`],
      ["Code postal", contract.codepostal],
      ["Localité", contract.ville],
      ["Pays", contract.country],
      ["Téléphone", contract.phone],
      ["Raison Sociale", contract.raisonsociale],
      ["Code postal", contract.codepostal],

      ["Adresse e-mail", contract.email],
      ["Durée du contrat", contract.contractDuration],
      ["Montant Total HT", `${ht.toFixed(2)} €`],
      ["Montant Total TTC", `${ttc.toFixed(2)} €`],
      ["Suppléments", supplementsList],
      ["RIB", contract.rib],
      [
        "MANDAT DE PRÉLÈVEMENT SEPA",
        "En signant ce mandat, vous autorisez GOKO à transmettre des instructions à votre banque afin de débiter votre compte. Par ailleurs, vous autorisez votre banque à débiter votre compte conformément aux instructions transmises par GOKO.",
      ],
    ];

    doc.autoTable({
      head: [["Champ", "Information"]],
      body: tableData,
      startY: 60,
      margin: { horizontal: 40 },
      theme: "grid",
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      styles: { cellPadding: 5, fontSize: 10 },
    });

    currentY = doc.lastAutoTable.finalY + 50;
    currentY += 40;

    if (currentY > pageHeight - marginTop) {
      doc.addPage();
      currentY = marginTop;
    }
    doc.setFontSize(12);
    doc.text("Signature:", pageWidth - 160, currentY);

    doc.addPage();
    currentY = marginTop;

    const logoWidth = 100;
    const logoHeight = 50;

    const xCenter = (pageWidth - logoWidth) / 2;

    const yPosition = 20;

    doc.addImage(logo, "PNG", xCenter, yPosition, logoWidth, logoHeight);
    currentY = 30 + logoHeight + 30;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
      "CONDITIONS GÉNÉRALES DE VENTE ET D'UTILISATION",
      pageWidth / 2,
      currentY,
      { align: "center" }
    );
    currentY += 40;
    doc.text("DE L'APPLICATION GOKO", pageWidth / 2, currentY, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.setFont("arial", "normal");

    const CGVUContent = `
  Version en vigueur au 23 septembre 2024  
  Préambule
  La société GOKO (ci-après "GOKO") propose une application mobile (ci-après "l’Application") mettant en relation des coachs sportifs indépendants ou entités sportives (ci-après "les Coachs") avec des utilisateurs de tout niveau sportif (ci-après "les Utilisateurs"). Les présentes conditions générales de vente et d'utilisation (ci-après "CGV/CGU") régissent les modalités d’accès et d’utilisation de l’Application. GOKO n'intervient qu'en tant que plateforme facilitant la mise en relation et ne prend aucune responsabilité sur les prestations proposées par les Coachs. 
  1. Objet
  Les CGV/CGU ont pour objet de définir les droits et obligations de GOKO, des Coachs abonnés à l’Application et des Utilisateurs dans le cadre de l’utilisation de l’Application. Seuls les Coachs ou entités sportives paient un abonnement pour figurer sur l’Application, tandis que l'accès pour les Utilisateurs est gratuit.
  2. Accès et inscription à l’Application
      2.1. Inscription des Coachs
Les Coachs souhaitant être présents sur l’Application doivent s'inscrire en fournissant les informations demandées (nom, qualifications, services offerts, etc.). L’inscription est conditionnée au paiement d’un abonnement mensuel ou annuel.
      2.2. Inscription des Utilisateurs
Les Utilisateurs peuvent s’inscrire gratuitement sur l’Application pour accéder aux services proposés et contacter les Coachs. Ils doivent créer un compte et fournir les informations nécessaires à la création de leur profil.
  3. Abonnement des Coachs
      3.1. Offre d’abonnement
Les Coachs doivent souscrire un abonnement payant pour être référencés sur l’Application. Les détails des tarifs et des options d’abonnement sont précisés lors de la souscription.
      3.2. Engagement du Coach
Le Coach s’engage à fournir des informations exactes, à jour et conformes à la réalité concernant ses qualifications et services. Le non-respect de cette obligation pourra entraîner la suspension ou la résiliation de son compte sans remboursement.
      3.3. Offre "Rentabilisé ou remboursé"
Si, à l’issue de la période d’abonnement, le Coach n’a pas atteint le nombre de clients escompté (indiqué au moment de la souscription), GOKO propose une garantie "Rentabilisé ou remboursé". Le Coach pourra demander un remboursement partiel ou total de son abonnement, sous réserve de prouver qu’il a utilisé activement l’Application et respecté les conditions d’utilisation. Le nombre de clients attendu doit avoir été précisé lors de l'activation de l'offre.
  4. Utilisation de l’Application 
      4.1. Fonctionnement de l’Application 
L’Application permet aux Utilisateurs de rechercher des Coachs selon leurs besoins sportifs (niveau, spécialité, localisation, etc.) et de les contacter directement via l’interface. Les Coachs peuvent proposer des sessions, consultations ou programmes sportifs via l'Application.
      4.2. Engagements des Utilisateurs 
Les Utilisateurs s’engagent à utiliser l’Application de manière loyale et respectueuse. Toute tentative de fraude, comportement injurieux ou non-respect des conditions peut entraîner la suspension ou la résiliation de leur compte.
  5. Responsabilité de GOKO 
      5.1. Non-responsabilité 
GOKO agit uniquement comme une plateforme de mise en relation entre Coachs et Utilisateurs et ne peut être tenue responsable des litiges, accidents, ou incidents survenant entre eux. GOKO ne garantit en aucun cas la qualité, la compétence ou les résultats des prestations fournies par les Coachs.
      5.2. Interruption de service 
GOKO ne pourra être tenue responsable de toute interruption de l’Application pour des raisons de maintenance, mise à jour ou cas de force majeure. Des efforts seront cependant faits pour informer les Utilisateurs et Coachs en cas d’interruption prolongée.
  6. Protection des données personnelles (RGPD) 
Conformément au Règlement Général sur la Protection des Données (RGPD) n°2016/679 du 27 avril 2016, GOKO s’engage à protéger les données personnelles de ses Utilisateurs et Coachs.
      6.1. Collecte des données 
Les données personnelles collectées sont strictement nécessaires à l’utilisation de l’Application (inscription, gestion des abonnements, mises en relation). Ces données ne sont pas vendues à des tiers et sont conservées pour la durée nécessaire à la gestion des comptes.
      6.2. Droits des utilisateurs 
Les Coachs et Utilisateurs disposent d’un droit d’accès, de rectification, de suppression et de portabilité de leurs données personnelles, qu’ils peuvent exercer en contactant GOKO à l’adresse suivante : [adresse e-mail].
      6.3. Sécurité des données 
GOKO met en place des mesures techniques et organisationnelles pour garantir la sécurité des données collectées. En cas de violation des données, les utilisateurs concernés seront informés dans les meilleurs délais conformément à la réglementation en vigueur.
  7. Respect des principes de non-discrimination 
GOKO s’engage à lutter contre toutes formes de discriminations et promeut l’inclusion de toutes les personnes, y compris celles en situation de handicap. Toute pratique discriminatoire, qu’elle soit basée sur le sexe, l’âge, la religion, l’origine, l’orientation sexuelle ou toute autre caractéristique protégée par la loi, est strictement interdite sur l’Application.
      7.1. Accessibilité aux personnes handicapées 
GOKO s’engage à favoriser l’accès à des Coachs qualifiés pour accompagner les personnes en situation de handicap. Les Coachs s’engagent également à adapter leurs prestations pour répondre aux besoins spécifiques des personnes en situation de handicap.
  8. Résiliation 
      8.1. Résiliation par le Coach 
Le Coach peut résilier son abonnement en respectant un préavis de 30 jours avant la fin de la période d’abonnement . Toute demande de résiliation doit être effectuée via l’Application ou en contactant le support de GOKO.
      8.2. Résiliation par GOKO 
GOKO se réserve le droit de résilier immédiatement l'abonnement d'un Coach ou le compte d'un Utilisateur en cas de violation des présentes CGV/CGU ou en cas de comportement jugé inapproprié.
  9. Droit applicable et juridiction compétente 
Les présentes CGV/CGU sont régies par la loi française. En cas de litige, les parties s'engagent à rechercher une solution amiable avant d’engager toute procédure judiciaire. À défaut d'accord amiable, les tribunaux compétents seront ceux du ressort du siège social de GOKO.
  10. Modification des conditions générales 
GOKO se réserve le droit de modifier les présentes CGV/CGU à tout moment. Les modifications seront notifiées aux Coachs et Utilisateurs et seront applicables immédiatement après leur publication sur l’Application.


Fait à Roubaix, le 23 septembre 2024.
                                                                            GOKO -
                                                              75 bis Boulevard D’Armentières
                                                                        59100 Roubaix
    `;

    function addJustifiedText(doc, text, startY) {
      const paragraphs = text.split("\n");
      let currentY = startY;
      paragraphs.forEach((paragraph) => {
        const lines = doc.splitTextToSize(paragraph, pageContentWidth);
        lines.forEach((line, index) => {
          if (currentY > pageHeight - marginTop) {
            doc.addPage();
            currentY = marginTop;
          }

          if (index < lines.length - 1) {
            const words = line.split("  ");
            const spaceWidth =
              (pageContentWidth -
                doc.getStringUnitWidth(line) * doc.internal.getFontSize()) /
              (words.length - 1);
            let currentX = marginLeft;
            words.forEach((word) => {
              doc.text(word, currentX, currentY);
              currentX +=
                doc.getStringUnitWidth(word) * doc.internal.getFontSize() +
                spaceWidth;
            });
          } else {
            doc.text(line, marginLeft, currentY); // Left-align the last line
          }
          currentY += 15; // Adjust line height
        });
        currentY += 10; // Extra spacing between paragraphs
      });
      return currentY;
    }

    currentY = addJustifiedText(doc, CGVUContent, currentY);

    // Convert the generated PDF to Blob format
    const pdfBlob = doc.output("blob");
    const [recipientPrenom, recipientNom] = contract.clientName.split(" ");
    await uploadPDFToServer(
      pdfBlob,
      contract.id,
      contract.email,
      recipientNom,
      recipientPrenom,
      contract.commercialName,
      contract.contractDuration,
      contract.raisonsociale,
      contract.phone
    );
  };

  const uploadPDFToServer = async (
    pdfBlob,
    contractId,
    email,
    recipientNom,
    recipientPrenom,
    commercialName,
    contractDuration,
    raisonsociale,
    phone
  ) => {
    const clientName = `${recipientPrenom} ${recipientNom}`;
    const formData = new FormData();
    formData.append(
      "pdf",
      new Blob([pdfBlob], { type: "application/pdf" }),
      `contrat_${contractId}.pdf`
    );
    formData.append("email", email);
    formData.append("clientName", clientName);
    formData.append("commercialName", commercialName);
    formData.append("contractDuration", contractDuration);
    formData.append("raisonsociale", raisonsociale),
      formData.append("phone", phone);
    try {
      const response = await axios.post(
        "https://go-ko-9qul.onrender.com/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("PDF uploaded successfully:", response.data);
      message.success("PDF envoyé au serveur avec succès.");
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi du PDF :",
        error.response?.data || error
      );
      message.error("Échec de l'envoi du PDF.");
    }
  };
  const renderCoachLink = () => {
    if (userRole === "Admin") {
      return <Link to={`/coach/${id}`}>Informations</Link>;
    } else if (userRole === "Commercial") {
      return <Link to={`/coaches/${id}`}>Informations</Link>;
    } else {
      return <span>Informations du Coach</span>; // fallback case
    }
  };

  return (
    <div className="p-8 bg-white shadow rounded-lg max-w-4xl mx-auto mt-8">
      <Tabs defaultActiveKey="3">
        <TabPane tab={renderCoachLink()} key="1">
          {/* Add information tab content here */}
        </TabPane>

        <TabPane
          tab={<Link to={`/coach/${id}/comments`}>Commentaires</Link>}
          key="2"
        ></TabPane>
        <TabPane
          tab={<Link to={`/coach/${id}/comments`}>Contrat</Link>}
          key="3"
        ></TabPane>
        {/* <TabPane tab={<Link to={`/devis/${id}`}>Contrat</Link>} key="3">
         
        </TabPane> */}
        {/* <TabPane tab={<Link to={`/planning/${id}`}>Planning</Link>} key="4">
         
        </TabPane> */}
      </Tabs>
      <h2 className="text-2xl font-bold mb-6">Créer un Contrat pour Coach</h2>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Form Items */}
          <Form.Item
            name="nemuro"
            label="No de membre (référence du mandat)"
            rules={[
              {
                required: true,
                message: "Veuillez entrer le numéro de membre",
              },
            ]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="clientName"
            label="Prénom + Nom"
            rules={[
              { required: true, message: "Veuillez entrer le nom du client" },
            ]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Date de Début"
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner la date de début",
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Date de Fin"
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner la date de fin",
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="siret"
            label="SIRET"
            rules={[{ required: true, message: "Veuillez entrer le SIRET" }]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Adresse"
            rules={[{ required: true, message: "Veuillez entrer l’adresse" }]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="raisonsociale"
            label="Raison Sociale"
            rules={[
              {
                required: true,
                message: "Veuillez entrer la raison sociale",
              },
            ]}
          >
            <Input className="rounded-md p-4" />
          </Form.Item>
          <Form.Item
            name="codepostal"
            label="Code Postal"
            rules={[
              { required: true, message: "Veuillez entrer le code postal" },
            ]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="ville"
            label="Ville"
            rules={[{ required: true, message: "Veuillez entrer la localité" }]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="country"
            label="Pays"
            rules={[{ required: true, message: "Veuillez entrer le pays" }]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Téléphone"
            rules={[
              {
                required: true,
                message: "Veuillez entrer le numéro de téléphone",
              },
            ]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="commercialName"
            label="Nom Commercial"
            rules={[
              {
                required: false, // Not mandatory
                message: "Veuillez entrer le nom commercial",
              },
            ]}
          >
            <Input className="rounded-md" readOnly />
          </Form.Item>

          <Form.Item
            name="email"
            label="Adresse e-mail"
            rules={[
              { required: true, message: "Veuillez entrer l’adresse e-mail" },
            ]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          {/* <Form.Item
            name="affiliationType"
            label="Type d’affiliation"
            rules={[
              {
                required: true,
                message: "Veuillez entrer le type d’affiliation",
              },
            ]}
          >
            <Input className="rounded-md" />
          </Form.Item> */}
          <Form.Item
            name="clubAddress"
            label="Adresse du Club"
            rules={[
              { required: true, message: "Veuillez entrer l’adresse du club" },
            ]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="raisonsociale"
            label="Raison Sociale"
            rules={[
              {
                required: true,
                message: "Veuillez entrer la raison sociale",
              },
            ]}
          >
            <Input.TextArea className="rounded-md py-4" rows={2} />
          </Form.Item>

          <Form.Item
            name="contractDuration"
            label="Durée du contrat"
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner la durée du contrat",
              },
            ]}
          >
            <Radio.Group
              onChange={handleDurationChange}
              className="flex flex-col"
            >
              <Radio value="12 mois - 64,90 € par mois">
                12 mois - 64,90 € par mois
              </Radio>
              <Radio value="18 mois - 59,90 € par mois">
                18 mois - 59,90 € par mois
              </Radio>
              <Radio value="24 mois - 54,90 € par mois">
                24 mois - 54,90 € par mois
              </Radio>
              <Radio value="59.91 € par mois (12 mois + 1 mois offert)">12 mois + 1 mois offert</Radio>
              <Radio value="56.75 € par mois (18 mois + 1 mois offert)">18 mois + 1 mois offert</Radio>
              <Radio value="52.70 € par mois (24 mois + 1 mois offert)">24 mois + 1 mois offert</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Montant Total HT">
            <Input
              value={`€ ${ht.toFixed(2)}`}
              readOnly
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item label="Montant Total TTC">
            <Input
              value={`€ ${ttc.toFixed(2)}`}
              readOnly
              className="rounded-md"
            />
          </Form.Item>
          {/* <Form.Item label="Montant Total avec Bonus">
  <Input value={`€ ${discountedPrice.toFixed(2)}`} readOnly className="rounded-md" />
</Form.Item> */}
          {/* <Form.Item
            name="supplement"
            label="Suppléments"
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner un supplément",
              },
            ]}
          >
            <Select
              placeholder="Choisissez un supplément"
              className="rounded-md"
              mode="multiple"
              allowClear
            >
              <Option value="Football">Football</Option>
              <Option value="Course à pied">Course à pied</Option>
              <Option value="Fitness">Fitness</Option>
              <Option value="Musculation">Musculation</Option>
              <Option value="Tennis">Tennis</Option>
              <Option value="Basketball">Basketball</Option>
              <Option value="Cyclisme (incluant BMX)">
                Cyclisme (incluant BMX)
              </Option>
              <Option value="Rugby">Rugby</Option>
              <Option value="Natation">Natation</Option>
              <Option value="Handball">Handball</Option>
              <Option value="Volleyball">Volleyball</Option>
              <Option value="Golf">Golf</Option>
              <Option value="Ski">Ski</Option>
              <Option value="Boxe">Boxe</Option>
              <Option value="Arts martiaux (inclut Judo et Taekwondo)">
                Arts martiaux (inclut Judo et Taekwondo)
              </Option>
              <Option value="Escalade">Escalade</Option>
              <Option value="Gymnastique">Gymnastique</Option>
              <Option value="Surf">Surf</Option>
              <Option value="Paddle">Paddle</Option>
              <Option value="Triathlon">Triathlon</Option>
              <Option value="Patinage artistique">Patinage artistique</Option>
              <Option value="Skateboard">Skateboard</Option>
              <Option value="Aviron">Aviron</Option>
              <Option value="Kitesurf">Kitesurf</Option>
              <Option value="Plongeon">Plongeon</Option>
              <Option value="Breakdance">Breakdance</Option>
              <Option value="Escrime">Escrime</Option>
              <Option value="Lutte">Lutte</Option>
              <Option value="Canoë-Kayak (Sprint et Slalom)">
                Canoë-Kayak (Sprint et Slalom)
              </Option>
              <Option value="Softball">Softball</Option>
              <Option value="Snowboard">Snowboard</Option>
              <Option value="Hockey sur glace">Hockey sur glace</Option>
              <Option value="Squash">Squash</Option>
              <Option value="Renforcement musculaire et conditionnement">
                Renforcement musculaire et conditionnement
              </Option>
              <Option value="Baseball">Baseball</Option>
              <Option value="Tir à l'arc">Tir à l'arc</Option>
              <Option value="Pentathlon moderne">Pentathlon moderne</Option>
              <Option value="Cheerleading">Cheerleading</Option>
              <Option value="Lacrosse">Lacrosse</Option>
              <Option value="Hockey sur gazon">Hockey sur gazon</Option>
              <Option value="Danse">Danse</Option>
              <Option value="Badminton">Badminton</Option>
              <Option value="Électrostimulation">Électrostimulation</Option>
            </Select>
          </Form.Item> */}
          <Form.Item
              name="supplement"
              label="Suppléments"
              rules={[
                {
                  required: true,
                  message: "Veuillez sélectionner la spécialité",
                },
              ]}
            >
              <Select mode="multiple" allowClear
              placeholder="Choisissez un supplément"
              className="rounded-md"
              showSearch optionFilterProp="children">
                {specialities.map((speciality) => (
                  <Option key={speciality._id} value={speciality._id}>
                    {speciality.nom}
                  </Option>
                ))}
              </Select>
       
            </Form.Item>
          <Form.Item
            name="rib"
            label="RIB"
            rules={[{ required: false, message: "Veuillez entrer le RIB" }]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <p className="text-lg mt-4 mb-6 font-semibold">
            Montant total : {totalPrice}
          </p>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="mr-4">
            Créer et Envoyer le Contrat
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ContractPage;

