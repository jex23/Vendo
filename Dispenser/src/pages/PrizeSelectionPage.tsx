import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SelectionPage.css';
import pencilImage from '../assets/pencil.png';
import ballpenImage from '../assets/ballpen.png';

const PrizeSelectionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedWaste = location.state?.selectedWaste || 'Unknown';

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [recordId, setRecordId] = useState<number | null>(null);

  const handlePrizeSelection = async (selectedPrize: string) => {
    setLoading(true);
    setStatusMessage('Processing prize redemption...');
    try {
      const response = await fetch('http://localhost:5000/add_waste_prize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Waste: selectedWaste,
          Prize: selectedPrize,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecordId(data.id);
        setModalMessage(`You have selected ${selectedPrize}. Please confirm redemption.`);
        setShowModal(true);
        setLoading(false);
      } else {
        const error = await response.json();
        setModalMessage(`Error: ${error.error}`);
        setShowModal(true);
        setLoading(false);
      }
    } catch (error) {
      setModalMessage('An unknown error occurred. Please try again.');
      setShowModal(true);
      setLoading(false);
    }
  };

  const handleConfirmRedemption = async () => {
    if (recordId) {
      try {
        const response = await fetch(`http://localhost:5000/redeem_prize/${recordId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Prize: modalMessage.includes('Pencil') ? 'Pencil' : 'Ballpen' }),
        });

        if (response.ok) {
          setModalMessage('Prize redeemed successfully! Redirecting to the selection page...');
          setTimeout(() => navigate('/'), 2000);
        } else {
          const error = await response.json();
          setModalMessage(`Error: ${error.error}`);
        }
      } catch (error) {
        setModalMessage('An unknown error occurred during redemption.');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/'); // Navigate back to the selection page
  };

  return (
    <div className="selection-page">
      <h1 className="selection-title">Please Select Your Prize</h1>
      <p className="selection-subtitle">You selected: {selectedWaste}</p>

      {loading && (
        <div className="overlay">
          <div className="spinner"></div>
          <p>{statusMessage}</p>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Redemption</h2>
            <p>{modalMessage}</p>
            <button onClick={handleConfirmRedemption}>Confirm</button>
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card-container">
        <div className="card" onClick={() => handlePrizeSelection('Pencil')}>
          <img src={pencilImage} alt="Pencil" className="card-image" />
          <h2>Option 1</h2>
          <p>Pencil</p>
        </div>
        <div className="card" onClick={() => handlePrizeSelection('Ballpen')}>
          <img src={ballpenImage} alt="Ballpen" className="card-image" />
          <h2>Option 2</h2>
          <p>Ballpen</p>
        </div>
      </div>
    </div>
  );
};

export default PrizeSelectionPage;
