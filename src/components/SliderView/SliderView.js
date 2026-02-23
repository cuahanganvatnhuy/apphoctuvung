import React, { useState } from 'react';
import { useVocabulary } from '../../context/VocabularyContext';
import { FaVolumeUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './SliderView.css';

const SliderView = () => {
  const { words } = useVocabulary();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  
  const currentWord = words[currentIndex];
  
  // Text-to-speech functions
  const speakText = (text, language) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language based on selection
      if (language === 'en') {
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
      } else if (language === 'vi') {
        utterance.lang = 'vi-VN';
        utterance.rate = 1.0;
      }
      
      utterance.pitch = 1;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Trình duyệt của bạn không hỗ trợ tính năng đọc văn bản.');
    }
  };

  const handleSpeak = (language) => {
    if (language === 'en' && currentWord) {
      speakText(currentWord.word || '', 'en');
    } else if (language === 'vi' && currentWord) {
      speakText(currentWord.meaning || '', 'vi');
    }
  };
  
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
          <div className="word-header">
            <h2>{currentWord.word}</h2>
            <button 
              className="speaker-btn-slider"
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak('en');
              }}
              title="Đọc tiếng Anh"
            >
              <FaVolumeUp />
            </button>
          </div>
          <p className="type">{currentWord.type}</p>
          {currentWord.pronunciation && (
            <p className="pronunciation">/{currentWord.pronunciation}/</p>
          )}
          {!showAnswer && (
            <div className="hint">Nhấn để xem nghĩa</div>
          )}
        </div>
        <div className="card-back">
          <div className="meaning-header">
            <h3>Nghĩa:</h3>
            <button 
              className="speaker-btn-slider"
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak('vi');
              }}
              title="Đọc tiếng Việt"
            >
              <FaVolumeUp />
            </button>
          </div>
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
          <FaChevronLeft />
        </button>
        <button onClick={nextWord} className="nav-btn next-btn">
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default SliderView;
