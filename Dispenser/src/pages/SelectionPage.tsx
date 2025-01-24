import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SelectionPage.css';
import bottleImage from '../assets/bottle.png';
import paperImage from '../assets/paper.png';

const SelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (selectedWaste: string) => {
    navigate('/prizes', { state: { selectedWaste } }); // Pass the selected waste as state
  };

  return (
    <div className="selection-page">
      <h1 className="selection-title">Please Select What to Deposit?</h1>
      <div className="card-container">
        <div
          className="card"
          onClick={() => handleCardClick('Plastic Bottles')}
        >
          <img src={bottleImage} alt="Plastic Bottles" className="card-image" />
          <h2>Option 1</h2>
          <p>Plastic Bottles</p>
        </div>
        <div
          className="card"
          onClick={() => handleCardClick('Paper')}
        >
          <img src={paperImage} alt="Paper" className="card-image" />
          <h2>Option 2</h2>
          <p>Paper</p>
        </div>
      </div>
    </div>
  );
};

export default SelectionPage;
