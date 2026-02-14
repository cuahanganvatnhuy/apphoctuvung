import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabulary } from '../../context/VocabularyContext';

const Quiz = () => {
  const { getRandomWords, words } = useVocabulary();
  const [quizWords, setQuizWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const navigate = useNavigate();

  const startQuiz = () => {
    const wordsForQuiz = getRandomWords(10);
    if (wordsForQuiz.length < 5) {
      alert('Cần ít nhất 5 từ để bắt đầu bài kiểm tra!');
      return;
    }
    setQuizWords(wordsForQuiz);
    setQuizStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
  };

  const handleOptionSelect = (option) => {
    if (showResult) return; // Không cho phép thay đổi đáp án sau khi đã nộp

    setSelectedOption(option);
    const currentWord = quizWords[currentIndex];
    const isCorrect = option === currentWord.meaning;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Hiển thị kết quả trong 1.5 giây trước khi chuyển câu hỏi
    setShowResult(true);
    setTimeout(() => {
      if (currentIndex < quizWords.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowResult(false);
      }
    }, 1500);
  };

  const restartQuiz = () => {
    startQuiz();
  };

  const getOptionClass = (option) => {
    if (!showResult) return '';
    const currentWord = quizWords[currentIndex];
    
    if (option === currentWord.meaning) {
      return 'correct';
    }
    if (option === selectedOption && option !== currentWord.meaning) {
      return 'incorrect';
    }
    return '';
  };

  // Hàm lấy các đáp án ngẫu nhiên
  const getRandomOptions = (words, correctMeaning, count) => {
    const options = new Set();
    const filteredWords = words.filter(word => word.meaning !== correctMeaning);
    
    while (options.size < count && options.size < filteredWords.length) {
      const randomIndex = Math.floor(Math.random() * filteredWords.length);
      options.add(filteredWords[randomIndex].meaning);
    }
    
    return Array.from(options);
  };

  if (!quizStarted) {
    return (
      <div className="quiz-start">
        <div className="container">
          <h1>Kiểm tra từ vựng</h1>
          <p>Bài kiểm tra gồm 10 câu hỏi về các từ vựng bạn đã thêm.</p>
          <p>Hãy chọn nghĩa đúng cho mỗi từ được đưa ra.</p>
          
          <div className="quiz-stats">
            <p>Tổng số từ trong kho: <strong>{words.length}</strong></p>
            {words.length < 10 && (
              <p className="warning">
                <span>⚠️</span> Bạn cần ít nhất 10 từ để có trải nghiệm tốt nhất
              </p>
            )}
          </div>
          
          <div className="quiz-actions">
            <button 
              className="btn" 
              onClick={startQuiz}
              disabled={words.length < 5}
            >
              Bắt đầu kiểm tra
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => navigate('/add')}
            >
              Thêm từ mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentIndex >= quizWords.length) {
    const percentage = Math.round((score / quizWords.length) * 100);
    
    return (
      <div className="quiz-result">
        <div className="container">
          <h1>Kết quả kiểm tra</h1>
          <div className="score-display">
            <div className={`score-circle ${percentage >= 70 ? 'good' : percentage >= 50 ? 'average' : 'poor'}`}>
              <span className="score-percent">{percentage}%</span>
              <span className="score-fraction">{score}/{quizWords.length}</span>
            </div>
          </div>
          
          <div className="result-feedback">
            {percentage >= 80 ? (
              <p>Xuất sắc! Bạn đã nắm vững các từ này.</p>
            ) : percentage >= 60 ? (
              <p>Khá tốt! Hãy tiếp tục luyện tập thêm.</p>
            ) : percentage >= 40 ? (
              <p>Cố gắng hơn nữa nhé! Ôn lại các từ đã học.</p>
            ) : (
              <p>Đừng nản chí! Hãy ôn tập thêm từ vựng.</p>
            )}
          </div>
          
          <div className="quiz-actions">
            <button className="btn" onClick={restartQuiz}>
              Làm lại bài kiểm tra
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => navigate('/list')}
            >
              Xem danh sách từ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = quizWords[currentIndex];
  const options = [
    currentWord.meaning,
    ...getRandomOptions(quizWords, currentWord.meaning, 3)
  ].sort(() => Math.random() - 0.5);

  return (
    <div className="quiz-container">
      <div className="quiz-progress">
        Câu {currentIndex + 1}/{quizWords.length}
      </div>
      
      <div className="quiz-question">
        <h2>Nghĩa của từ <span className="word">"{currentWord.word}"</span> là gì?</h2>
      </div>
      
      <div className="quiz-options">
        {options.map((option, index) => (
          <button
            key={index}
            className={`quiz-option ${getOptionClass(option)}`}
            onClick={() => handleOptionSelect(option)}
            disabled={showResult}
          >
            {option}
          </button>
        ))}
      </div>
      
      {showResult && (
        <div className="quiz-feedback">
          {selectedOption === currentWord.meaning ? (
            <p className="correct-feedback">✅ Chính xác!</p>
          ) : (
            <p className="incorrect-feedback">
              ❌ Sai rồi! Đáp án đúng là: <strong>{currentWord.meaning}</strong>
            </p>
          )}
        </div>
      )}
      
      <div className="quiz-hint">
        {currentWord.example && (
          <p className="hint">💡 Gợi ý: {currentWord.example}</p>
        )}
      </div>
    </div>
  );
};

export default Quiz;
