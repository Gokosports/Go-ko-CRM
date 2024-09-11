import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  message,
  Checkbox,
  Modal,
  Radio,
  Select,
} from "antd";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // To create tables in PDF
import "tailwindcss/tailwind.css";
import logo from "../../assets/images/goko.png";

// const { TextArea } = Input;
const { Option } = Select;

const ContractPage = () => {
  const [form] = Form.useForm();
  const [contracts, setContracts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [totalPrice, setTotalPrice] = useState("€ 24,99"); // Initial price for 1 year
  const [selectedDuration, setSelectedDuration] = useState("1 an");

  // Handle form submission
  const handleFinish = (values) => {
    const newContract = { ...values, id: contracts.length + 1 };
    setContracts([...contracts, newContract]);
    message.success("Contrat créé avec succès");
    form.resetFields();
  };

  // Function to handle radio change and set price accordingly
  const handleDurationChange = (e) => {
    const duration = e.target.value;
    setSelectedDuration(duration);

    // Set the corresponding price based on selected duration
    switch (duration) {
      case "1 an":
        setTotalPrice("€ 49,00");
        break;
      case "1.5 ans":
        setTotalPrice("€ 59,00");
        break;
      case "2 ans":
        setTotalPrice("€ 69,00");
        break;
      default:
        setTotalPrice("€ 49,00");
    }
  };

  // Generate and download PDF
  // const downloadPDF = (contract) => {
  //     const doc = new jsPDF('p', 'pt', 'a4');

  //     // Add GOKO Logo at the top
  //     const logoUrl = 'path_to_your_logo_here'; // Use your logo URL or file path
  //     doc.addImage(logoUrl, 'PNG', 40, 20, 100, 40); // Adjust the position and size as needed

  //     doc.setFontSize(16);
  //     doc.text("Contrat d'Abonnement au Service de Coaching", 40, 80);

  //     const tableData = [
  //         ["Champ", "Information"],
  //         ["No de membre (référence du mandat)", contract.memberNumber],
  //         ["Club", "Application Coach Clients"],
  //         ["Adresse club", contract.clubAddress], // Club address from form
  //         ["Code postal", "00000"],
  //         ["Localité", "Virtuelle"],
  //         ["Date d’inscription", contract.startDate.format('DD-MM-YYYY')],
  //         ["Date de début du contrat", contract.startDate.format('DD-MM-YYYY')],
  //         ["Date de fin du contrat", contract.endDate.format('DD-MM-YYYY')],
  //         ["Prénom + Nom", contract.clientName],
  //         ["Date de naissance", contract.dateOfBirth.format('DD-MM-YYYY')],
  //         ["Adresse", `rue ${contract.address}, Numéro: ${contract.addressNumber}`],
  //         ["Code postal", contract.zipCode],
  //         ["Localité", contract.city],
  //         ["Pays", contract.country],
  //         ["Téléphone", contract.phone],
  //         ["Adresse e-mail", contract.email],
  //         ["Type d’affiliation", contract.affiliationType],
  //         ["Durée du contrat", contract.contractDuration],
  //         ["Suppléments", "Yanga Sportswater Pro-App"],
  //         ["Suppléments non récurrents", "€ 5,00"],
  //         ["Total (par période)", "€ 24,99"],
  //         ["Montant total", "€ 44,98"],
  //         ["RIB", contract.rib],
  //         ["MANDAT DE PRÉLÈVEMENT SEPA", "En signant ce mandat, vous donnez l’autorisation (A) à [Nom de l'Application] d’envoyer des instructions à votre banque pour débiter votre compte et (B) votre banque à débiter votre compte conformément aux instructions de [Nom de l'Application]."],
  //         ["Lieu", contract.location],
  //         ["Date", contract.startDate.format('DD-MM-YYYY')],
  //         ["La société [Nom de l'Application]", "au capital de [Capital Social] ayant son siège social à [Adresse du Siège Social], immatriculée au RCS sous le no [Numéro RCS]."],
  //     ];

  //     doc.autoTable({
  //         head: [['Champ', 'Information']],
  //         body: tableData,
  //         startY: 100,
  //         margin: { horizontal: 40 },
  //         theme: 'grid',
  //         headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
  //         styles: { cellPadding: 5, fontSize: 10 },
  //     });

  //     // Add signature field at the bottom right of the page
  //     doc.text("Signature:", 400, doc.lastAutoTable.finalY + 50);
  //     doc.line(450, doc.lastAutoTable.finalY + 45, 550, doc.lastAutoTable.finalY + 45); // Line for signature

  //     doc.save(`contrat_${contract.id}.pdf`);
  // };
  const downloadPDF = (contract) => {
    const doc = new jsPDF("p", "pt", "a4");
    doc.addImage(logo, "PNG", 450, 16, 100, 40);
    doc.setFontSize(16);
    doc.text("Contrat d'Abonnement au Service de Coaching", 40, 40);
    const tableData = [
      ["No de membre (référence du mandat)", contract.memberNumber],
      ["Club", "Application Coach Clients"],
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

  // Show modal with terms and conditions
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="p-8 bg-white shadow rounded-lg max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Créer un Contrat pour Coach</h2>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Radio value="1 an">1 année</Radio>
              <Radio value="1.5 ans">1.5 années</Radio>
              <Radio value="2 ans">2 années</Radio>
            </Radio.Group>
          </Form.Item>
          <div className="text-lg font-bold mb-4">
            Total (par période): {totalPrice}
          </div>

          <Form.Item
            name="rib"
            label="RIB"
            rules={[{ required: true, message: "Veuillez entrer le RIB" }]}
          >
            <Input className="rounded-md" />
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
              <Option value="Natation">Natation</Option>
              <Option value="Basketball">Basketball</Option>
              <Option value="Volleyball">Volleyball</Option>
              <Option value="Football">Football</Option>
              <Option value="Fitness">Fitness</Option>
              <Option value="Boxe">Boxe</Option>
              <Option value="Surf">Surf</Option>
              <Option value="Tennis">Tennis</Option>
              <Option value="Polo">Polo</Option>
              <Option value="Climbing">Climbing</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="location"
            label="Lieu de signature"
            rules={[{ required: true, message: "Veuillez entrer le lieu" }]}
          >
            <Input className="rounded-md" />
          </Form.Item>
        </div>

        <Form.Item>
          <Checkbox>
            J'accepte les{" "}
            <Button type="link" onClick={showModal}>
              termes et conditions
            </Button>
            .
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Créer le Contrat
          </Button>
        </Form.Item>
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
        title="Termes et Conditions"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>
          <ul className="list-disc list-inside">
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
              Le coach se réserve le droit de terminer la séance à l'heure
              prévue même si le client est en retard.
            </li>
          </ul>
        </p>
      </Modal>
    </div>
  );
};

export default ContractPage;
