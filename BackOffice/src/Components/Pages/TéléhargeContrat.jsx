import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { List, Button, message } from 'antd';
import { Link } from 'react-router-dom';

const TéléhargeContrat = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await axios.get('https://go-ko.onrender.com/contract');
      setContracts(response.data.contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      message.error('Failed to fetch contracts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white shadow rounded-lg max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Téléchargez vos Contrats</h2>
      <List
        loading={loading}
        dataSource={contracts}
        renderItem={contract => (
          <List.Item>
            <div className="flex justify-between items-center w-full">
              <span>Contrat {contract._id}</span>
              <Link href={`http://localhost:3000/${contract.pdfPath}`} download>
                <Button type="primary">Télécharger le PDF</Button>
              </Link>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default TéléhargeContrat;
