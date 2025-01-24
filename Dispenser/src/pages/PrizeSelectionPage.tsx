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
    setStatusMessage('Waiting for sensor response...');
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
        pollSensorResponse(data.id); // Start polling for sensor response
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

  const pollSensorResponse = (recordId: number) => {
    const timeout = 30000; // 30 seconds
    const interval = 5000; // Poll every 5 seconds
    const endTime = Date.now() + timeout;

    const checkResponse = async () => {
      try {
        const pollResponse = await fetch(`http://localhost:5000/check_sensor_response/${recordId}`);
        const pollData = await pollResponse.json();

        if (pollResponse.ok && pollData.SensorResponse) {
          if (pollData.SensorResponse === 'verified') {
            // Update status to "Complete"
            await updateStatus(recordId, 'Complete');
            setLoading(false);
            setModalMessage('Congratulations! Your prize has been successfully redeemed.');
            setShowModal(true);
          } else if (pollData.SensorResponse === 'cancelled') {
            // Update status to "Failed"
            await updateStatus(recordId, 'Failed');
            setLoading(false);
            setModalMessage('The process was cancelled. Please try again.');
            setShowModal(true);
          }
        } else if (Date.now() < endTime) {
          setTimeout(checkResponse, interval); // Retry after interval
        } else {
          // Timeout reached, update status to "Failed"
          await updateStatus(recordId, 'Failed');
          setLoading(false);
          setModalMessage('No response received. Status set to "Failed".');
          setShowModal(true);
        }
      } catch (error) {
        setModalMessage('An error occurred while checking the sensor response.');
        setShowModal(true);
        setLoading(false);
      }
    };

    checkResponse();
  };

  const updateStatus = async (recordId: number, status: string) => {
    await fetch(`http://localhost:5000/update_status/${recordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Status: status }),
    });
  };

  const handleCancel = async () => {
    // If a record ID exists, update its status to "Failed"
    if (recordId) {
      await updateStatus(recordId, 'Failed');
    }
    setLoading(false);
    navigate('/'); // Navigate back to the selection page
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
          <button className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Status</h2>
            <p>{modalMessage}</p>
            <button onClick={closeModal}>OK</button>
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
