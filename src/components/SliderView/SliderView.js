import React, { useState, useEffect } from 'react';
import { useVocabulary } from '../../context/VocabularyContext';
import './SliderView.css';

const SliderView = () => {
  const { words } = useVocabulary();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  
  const currentWord = words[currentIndex];
  
  const nextWord = () => {
    setShowAnswer(false);
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
  };
  
  const prevWord = () => {
    setShowAnswer(false);
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + words.length) % words.length);
  };
  
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!showAnswer) setShowAnswer(true);
  };
  
  if (words.length === 0) {
    return (
      <div className="slider-container">
        <div className="empty-state">
          <h2>Không có từ vựng nào</h2>
          <p>Hãy thêm từ vựng để bắt đầu học</p>
        </div>
      </div>
    );
  }

  return (
    <div className="slider-container">
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        ></div>
        <span>{currentIndex + 1}/{words.length}</span>
      </div>
      
      <div 
        className={`card ${isFlipped ? 'flipped' : ''}`}
        onClick={toggleFlip}
      >
        <div className="card-front">
          <h2>{currentWord.word}</h2>
          <p className="type">{currentWord.type}</p>
          {currentWord.pronunciation && (
            <p className="pronunciation">/{currentWord.pronunciation}/</p>
          )}
          {!showAnswer && (
            <div className="hint">Nhấn để xem nghĩa</div>
          )}
        </div>
        <div className="card-back">
          <h3>Nghĩa:</h3>
          <p>{currentWord.meaning}</p>
          {currentWord.example && (
            <div className="example">
              <h4>Ví dụ:</h4>
              <p>"{currentWord.example}"</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="navigation-buttons">
        <button onClick={prevWord} className="nav-btn prev-btn">
          <i className="fas fa-chevron-left"></i>
        </button>
        <button onClick={nextWord} className="nav-btn next-btn">
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default SliderView;
