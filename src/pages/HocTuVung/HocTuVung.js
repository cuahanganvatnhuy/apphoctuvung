import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVocabulary } from '../../context/VocabularyContext';
import { FaArrowLeft, FaVolumeUp, FaCheck, FaTimes } from 'react-icons/fa';
import './HocTuVung.css';

const HocTuVung = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { words } = useVocabulary();
  const [selectedWords, setSelectedWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const inputRef = useRef(null);

  // Get selected words from location state
  useEffect(() => {
    if (location.state?.selectedWords) {
      const selectedWordObjects = location.state.selectedWords.map(wordId => 
        words.find(word => word.id === wordId)
      ).filter(word => word !== undefined);
      
      setSelectedWords(selectedWordObjects);
    }
  }, [location.state, words]);

  // Focus input when component mounts or word changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWordIndex]);

  // Reset practice when starting new
  const resetPractice = () => {
    setCurrentWordIndex(0);
    setUserInput('');
    setShowResult(false);
    setIsCorrect(false);
    setCorrectCount(0);
    setTotalAttempts(0);
    setShowHint(false);
    setPracticeCompleted(false);
  };

  // Get current word
  const currentWord = selectedWords[currentWordIndex];

  // Text-to-speech function
  const speakText = (text, language) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
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
    }
  };

  // Check user input
  const checkAnswer = () => {
    if (!userInput.trim() || !currentWord) return;

    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedCorrect = currentWord.word.toLowerCase();
    
    const correct = normalizedInput === normalizedCorrect;
    setIsCorrect(correct);
    setShowResult(true);
    setTotalAttempts(prev => prev + 1);
    
    if (correct) {
      setCorrectCount(prev => prev + 1);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!showResult) {
        checkAnswer();
      } else {
        nextWord();
      }
    }
  };

  // Move to next word
  const nextWord = () => {
    if (currentWordIndex < selectedWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setUserInput('');
      setShowResult(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      setPracticeCompleted(true);
    }
  };

  // Move to previous word
  const previousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
      setUserInput('');
      setShowResult(false);
      setIsCorrect(false);
      setShowHint(false);
    }
  };

  // Skip to next word without checking answer
  const skipToNext = () => {
    nextWord();
  };

  // Generate hint
  const generateHint = () => {
    if (!currentWord) return '';
    const word = currentWord.word;
    let hint = '';
    for (let i = 0; i < word.length; i++) {
      if (i % 2 === 0) {
        hint += word[i];
      } else {
        hint += '_';
      }
    }
    return hint;
  };

  // Calculate accuracy
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

  if (selectedWords.length === 0) {
    return (
      <div className="hoc-tu-vung-page">
        <div className="container">
          <div className="empty-state">
            <h2>Không có từ vựng để học</h2>
            <p>Vui lòng chọn từ vựng để bắt đầu học.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/luyen-tap')}
            >
              Quay lại chọn từ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (practiceCompleted) {
    return (
      <div className="hoc-tu-vung-page">
        <div className="container">
          <div className="completion-screen">
            <h2>🎉 Hoàn thành học tập!</h2>
            <div className="results">
              <p>Kết quả: <strong>{correctCount}/{totalAttempts}</strong> ({accuracy}%)</p>
              <p>Bạn đã học {selectedWords.length} từ vựng!</p>
            </div>
            <div className="action-buttons">
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/luyen-tap')}
              >
                Chọn từ khác
              </button>
              <button 
                className="btn btn-primary"
                onClick={resetPractice}
              >
                Học lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hoc-tu-vung-page">
      <div className="container">
        <div className="header">
          <button 
            className="btn-back"
            onClick={() => navigate('/luyen-tap')}
          >
            <FaArrowLeft /> Quay lại
          </button>
          <div className="progress">
            Từ {currentWordIndex + 1}/{selectedWords.length}
          </div>
          <div className="score">
            Điểm: {correctCount}/{totalAttempts} ({accuracy}%)
          </div>
        </div>

        <div className="practice-card">
          <div className="word-display">
            <div className="meaning">
              <h2>{currentWord?.meaning}</h2>
              <button 
                className="speaker-btn"
                onClick={() => speakText(currentWord?.meaning, 'vi')}
                title="Đọc nghĩa tiếng Việt"
              >
                <FaVolumeUp />
              </button>
            </div>
            
            {currentWord?.example && (
              <div className="example">
                <p>Ví dụ: {currentWord.example}</p>
              </div>
            )}
          </div>

          <div className="input-section">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập từ tiếng Anh..."
                className={`word-input ${showResult ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                disabled={showResult}
                autoFocus
              />
              
              <button 
                className="speaker-btn-input"
                onClick={() => speakText(currentWord?.word, 'en')}
                title="Nghe phát âm"
              >
                <FaVolumeUp />
              </button>
            </div>

            {showResult && (
              <div className={`result ${isCorrect ? 'correct' : 'incorrect'}`}>
                {isCorrect ? (
                  <div className="correct-result">
                    <FaCheck /> Chính xác!
                  </div>
                ) : (
                  <div className="incorrect-result">
                    <FaTimes /> Sai rồi! Đáp án đúng: <strong>{currentWord?.word}</strong>
                  </div>
                )}
              </div>
            )}

            <div className="hint-section">
              {!showResult && (
                <button 
                  className="hint-btn"
                  onClick={() => setShowHint(!showHint)}
                >
                  {showHint ? 'Ẩn gợi ý' : 'Hiện gợi ý'}
                </button>
              )}
              
              {showHint && !showResult && (
                <div className="hint">
                  Gợi ý: {generateHint()}
                </div>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="btn btn-outline"
              onClick={previousWord}
              disabled={currentWordIndex === 0}
            >
              ← Quay lại
            </button>
            
            {!showResult ? (
              <button 
                className="btn btn-primary"
                onClick={checkAnswer}
                disabled={!userInput.trim()}
              >
                Kiểm tra
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={nextWord}
              >
                {currentWordIndex < selectedWords.length - 1 ? 'Từ tiếp theo' : 'Hoàn thành'}
              </button>
            )}
            
            <button 
              className="btn btn-outline"
              onClick={skipToNext}
              disabled={currentWordIndex === selectedWords.length - 1}
            >
              Bỏ qua →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HocTuVung;
