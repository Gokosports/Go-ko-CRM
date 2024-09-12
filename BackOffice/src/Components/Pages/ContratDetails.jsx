import React, { useState } from "react";
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

const { Option } = Select;

const ContractPage = () => {
  const [form] = Form.useForm();
  const [contracts, setContracts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [totalPrice, setTotalPrice] = useState("€ 0");
  const [selectedDuration, setSelectedDuration] = useState("1 an");

  const handleFinish = (values) => {
    const newContract = { ...values, id: contracts.length + 1 };
    setContracts([...contracts, newContract]);
    message.success("Contrat créé avec succès");
    form.resetFields();
  };

  const handleDurationChange = (e) => {
    const duration = e.target.value;
    setSelectedDuration(duration);
    const priceMap = {
      "12 mois - 64,90 € par mois": "€ 64,90 par mois",
      "18 mois - 59,90 € par mois": "€ 59,90 par mois",
      "24 mois - 54,90 € par mois": "€ 54,90 par mois",
    };
    setTotalPrice(priceMap[duration] || "€");
  };

  const downloadPDF = (contract) => {
    const doc = new jsPDF("p", "pt", "a4");
    doc.addImage(logo, "PNG", 450, 16, 100, 40);
    doc.setFontSize(16);
    doc.text("Contrat d'Abonnement au Service de Coaching", 40, 40);
    const tableData = [
      ["No de membre (référence du mandat)", contract.memberNumber],
      ["Adresse club", contract.clubAddress],
      ["Date d’inscription", contract.startDate.format("DD-MM-YYYY")],
      ["Date de début du contrat", contract.startDate.format("DD-MM-YYYY")],
      ["Date de fin du contrat", contract.endDate.format("DD-MM-YYYY")],
      ["Prénom + Nom", contract.clientName],
      ["Montant total", totalPrice],
      ["Adresse", `rue ${contract.address}`],
      ["Code postal", contract.zipCode],
      ["Localité", contract.city],
      ["Pays", contract.country],
      ["Téléphone", contract.phone],
      ["Adresse e-mail", contract.email],
      ["Type d’affiliation", contract.affiliationType],
      ["Durée du contrat", contract.contractDuration],
      ["Suppléments", contract.supplement],
      ["RIB", contract.rib],
      [
        "MANDAT DE PRÉLÈVEMENT SEPA",
        "En signant ce mandat, vous donnez l’autorisation (A) à [Nom de l'Application] d’envoyer des instructions à votre banque pour débiter votre compte et (B) votre banque à débiter votre compte conformément aux instructions de [Nom de l'Application].",
      ],
      ["Lieu", contract.location],
      ["Date", contract.startDate.format("DD-MM-YYYY")],
      [
        "La société [Nom de l'Application]",
        "au capital de [Capital Social] ayant son siège social à [Adresse du Siège Social], immatriculée au RCS sous le no [Numéro RCS].",
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
    doc.save(`contrat_${contract.id}.pdf`);
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

  const fetchCoach = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://go-ko.onrender.com/coaches/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data)
        setCoach(response.data);
    } catch (error) {
        console.error('Error fetching coach:', error);
    }
};

  return (
    <div className="p-8 bg-white shadow rounded-lg max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Créer un Contrat pour Coach</h2>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Form Items */}
          <Form.Item
            name="memberNumber"
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
            rules={[{ required: true, message: "Veuillez entrer le RIB" }]}
          >
            <Input className="rounded-md" />
          </Form.Item>
        </div>
        <div className="flex justify-between items-center mt-6">
          <p className="text-lg font-semibold">Montant total : {totalPrice}</p>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-blue-500 hover:bg-blue-600"
          >
            Générer le Contrat
          </Button>
          <Button
            onClick={showModal}
            className="bg-green-500 hover:bg-green-600"
          >
            Conditions Générales
          </Button>
        </div>
      </Form>
      {/* List of created contracts */}
      {contracts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Contrats Créés</h3>
          <ul className="list-disc list-inside">
            {contracts.map((contract) => (
              <li key={contract.id}>
                <span className="text-lg font-semibold">
                  Contrat #{contract.id}
                </span>
                <Button type="link" onClick={() => downloadPDF(contract)}>
                  Télécharger PDF
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Modal
        title="Conditions Générales"
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
      </Modal>
    </div>
  );
};

export default ContractPage;
