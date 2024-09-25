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
} from "antd";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "tailwindcss/tailwind.css";
import logo from "../../assets/images/goko.png";
import axios from "axios";
import { useParams } from "react-router-dom";
import SignaturePadComponent from "../SignaturePadComponent";

const { Option } = Select;

const ContractPage = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [totalPrice, setTotalPrice] = useState("€ 0");
  const [selectedDuration, setSelectedDuration] = useState("1 an");
  const [coach, setCoach] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ht, setHT] = useState(0); // State for HT (Hors Taxes)
  const [ttc, setTTC] = useState(0); // State for TTC (Toutes Taxes Comprises)
  const taxRate = 0.2; // Fixed tax rate (20%)
  const [signature, setSignature] = useState(null);

  useEffect(() => {
    fetchCoach();
  }, []);

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
      form.setFieldsValue({
        nemuro: response.data._id,
        clientName: `${response.data.prenom} ${response.data.nom}`,
        phone: response.data.phone,
        email: response.data.email,
        age: response.data.age,
        sex: response.data.sex,
        address: response.data.ville,
      });
    } catch (error) {
      console.error("Error fetching coach:", error);
    }
  };

  const handleFinish = (values) => {
    const newContract = { ...values, id: new Date().getTime() };
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

  const handleDurationChange = (e) => {
    const duration = e.target.value;

    // Mapping of durations to price values
    const priceMap = {
      "12 mois - 64,90 € par mois": 64.9,
      "18 mois - 59,90 € par mois": 59.9,
      "24 mois - 54,90 € par mois": 54.9,
    };

    const selectedPrice = priceMap[duration] || 0;
    setTotalPrice(`€ ${selectedPrice.toFixed(2)} par mois`);

    // Calculate HT and TTC based on the selected price
    const calculatedHT = selectedPrice / (1 + taxRate);
    const calculatedTTC = selectedPrice;

    setHT(calculatedHT);
    setTTC(calculatedTTC);
  };

  const generateAndUploadPDF = async (contract) => {
    const doc = new jsPDF("p", "pt", "a4");
    doc.addImage(logo, "PNG", 450, 16, 100, 40);
    doc.setFontSize(16);
    doc.text("Contrat d'Abonnement au Service de Coaching", 40, 40);
    const supplementsList =
      contract.supplement.length > 0 ? contract.supplement.join(", ") : "Aucun";

    const tableData = [
      ["No de membre (référence du mandat)", contract.nemuro],
      ["Adresse club", contract.clubAddress],
      ["Date d’inscription", contract.startDate.format("DD-MM-YYYY")],
      ["Date de début du contrat", contract.startDate.format("DD-MM-YYYY")],
      ["Date de fin du contrat", contract.endDate.format("DD-MM-YYYY")],
      ["Prénom + Nom", contract.clientName],
      ["Montant total", totalPrice],
      ["Adresse", `${contract.address}`],
      ["Code postal", contract.zipCode],
      ["Localité", contract.city],
      ["Pays", contract.country],
      ["Téléphone", contract.phone],
      ["Adresse e-mail", contract.email],
      ["Type d’affiliation", contract.affiliationType],
      ["Durée du contrat", contract.contractDuration],
      ["Montant Total HT", `${ht.toFixed(2)} €`],
      ["Montant Total TTC", `${ttc.toFixed(2)} €`],
      ["Suppléments", supplementsList],
      ["RIB", contract.rib],
      [
        "MANDAT DE PRÉLÈVEMENT SEPA",
        "En signant ce mandat, vous donnez l’autorisation (A) à [Nom de l'Application] d’envoyer des instructions à votre banque pour débiter votre compte et (B) votre banque à débiter votre compte conformément aux instructions de [Nom de l'Application].",
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
    doc.text("Signature:", 400, doc.lastAutoTable.finalY + 50);

    // Convert the generated PDF to Blob format
    const pdfBlob = doc.output("blob");
    const [recipientPrenom, recipientNom] = contract.clientName.split(" ");
    await uploadPDFToServer(
      pdfBlob,
      contract.id,
      contract.email,
      recipientNom,
      recipientPrenom
    );
  };

  const uploadPDFToServer = async (
    pdfBlob,
    contractId,
    email,
    recipientNom,
    recipientPrenom
  ) => {
    const clientName = `${recipientPrenom} ${recipientNom}`;
    console.log("Client Name:", clientName);
    const formData = new FormData();
    formData.append(
      "pdf",
      new Blob([pdfBlob], { type: "application/pdf" }),
      `contrat_${contractId}.pdf`
    );
    formData.append("email", email);
    formData.append("clientName", clientName);

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

  return (
    <div className="p-8 bg-white shadow rounded-lg max-w-4xl mx-auto mt-8">
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
            name="address"
            label="Adresse"
            rules={[{ required: true, message: "Veuillez entrer l’adresse" }]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="zipCode"
            label="Code Postal"
            rules={[
              { required: true, message: "Veuillez entrer le code postal" },
            ]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="city"
            label="Localité"
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
            name="email"
            label="Adresse e-mail"
            rules={[
              { required: true, message: "Veuillez entrer l’adresse e-mail" },
            ]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <Form.Item
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
          </Form.Item>
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
            name="contractDuration"
            label="Durée du contrat"
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner la durée du contrat",
              },
            ]}
          >
            <Radio.Group onChange={handleDurationChange}>
              <Radio value="12 mois - 64,90 € par mois">
                12 mois - 64,90 € par mois
              </Radio>
              <Radio value="18 mois - 59,90 € par mois">
                18 mois - 59,90 € par mois
              </Radio>
              <Radio value="24 mois - 54,90 € par mois">
                24 mois - 54,90 € par mois
              </Radio>
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
          <Form.Item
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
          </Form.Item>
          <Form.Item
            name="rib"
            label="RIB"
            rules={[{ required: false, message: "Veuillez entrer le RIB" }]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <p className="text-lg mt-10 font-semibold">
            Montant total : {totalPrice}
          </p>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="mr-4">
            Créer et Envoyer le Contrat
          </Button>

          {/* <Button type="dashed" onClick={showModal} className="mb-4">
  Add Signature
</Button> */}
        </Form.Item>
      </Form>

      <Modal
        title="Aperçu du Contrat"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <ul
          className="list-disc list-inside"
          style={{
            marginLeft: "0px",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            lineHeight: "1.8",
            color: "#333",
            fontSize: "16px",
          }}
        >
          <li>
            Le coach s'engage à fournir des séances d'entraînement selon
            l'horaire convenu.
          </li>
          <li>
            Le client s'engage à participer aux séances programmées et à
            respecter les horaires.
          </li>
          <li>
            Le paiement doit être effectué en totalité avant le début des
            séances.
          </li>
          <li>
            Le coach n'est pas responsable des blessures subies en dehors des
            séances d'entraînement.
          </li>
          <li>
            Le client doit informer le coach de tout problème de santé ou
            blessure pouvant affecter la participation.
          </li>
          <li>
            Le contrat peut être résilié par l'une ou l'autre des parties avec
            un préavis de deux semaines.
          </li>
          <li>
            En cas d'annulation de séance, un préavis de 24 heures est requis
            pour éviter des frais supplémentaires.
          </li>
          <li>
            Les séances non annulées dans les délais seront facturées au plein
            tarif.
          </li>
          <li>
            Le client doit respecter les horaires de début et de fin des
            séances.
          </li>
          <li>
            Tout retard de plus de 15 minutes sera considéré comme une séance
            annulée sans préavis et sera facturé au plein tarif.
          </li>
          <li>
            Le coach se réserve le droit de terminer la séance à l'heure prévue
            même si le client est en retard.
          </li>
        </ul>
        <SignaturePadComponent onSignatureComplete={setSignature} />
        <Button type="primary" onClick={handleOk}>
          Save
        </Button>
      </Modal>
    </div>
  );
};

export default ContractPage;
