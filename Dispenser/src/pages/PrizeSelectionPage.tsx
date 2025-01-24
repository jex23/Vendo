import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SelectionPage.css';
import pencilImage from '../assets/pencil.png';
import ballpenImage from '../assets/ballpen.png';

const PrizeSelectionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedWaste = location.state?.selectedWaste || 'Unknown';

  const handlePrizeSelection = async (selectedPrize: string) => {
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
        console.log(data.message);
        alert('Selection saved successfully!');
        navigate('/'); // Navigate back to the selection page or another page
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('An unknown error occurred.');
      }
    }
  };
  

  return (
    <div className="selection-page">
      <h1 className="selection-title">Please Select Your Prize</h1>
      <p className="selection-subtitle">You selected: {selectedWaste}</p>
      <div className="card-container">
        <div
          className="card"
          onClick={() => handlePrizeSelection('Pencil')}
        >
          <img src={pencilImage} alt="Pencil" className="card-image" />
          <h2>Option 1</h2>
          <p>Pencil</p>
        </div>
        <div
          className="card"
          onClick={() => handlePrizeSelection('Ballpen')}
        >
          <img src={ballpenImage} alt="Ballpen" className="card-image" />
          <h2>Option 2</h2>
          <p>Ballpen</p>
        </div>
      </div>
    </div>
  );
};

export default PrizeSelectionPage;
