import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaCheck, FaTimes, FaArrowRight, FaBook, FaList, FaVolumeUp, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { useVocabulary } from '../../context/VocabularyContext';
import { useNavigate } from 'react-router-dom';
import './LuyenTap.css';

const LuyenTap = () => {
  const { words, updateWordStatus } = useVocabulary();
  const [tuHienTai, setTuHienTai] = useState(null);
  const [cauTraLoi, setCauTraLoi] = useState('');
  const [ketQua, setKetQua] = useState(null);
  const [diemSo, setDiemSo] = useState({ dung: 0, tong: 0 });
  const [cheDo, setCheDo] = useState('anhViet');
  const [goiY, setGoiY] = useState(false);
  const [daNghe, setDaNghe] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const [practicedWords, setPracticedWords] = useState([]);
  const [selectingWords, setSelectingWords] = useState(true);
  const [practiceFinished, setPracticeFinished] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Pronunciation practice states
  const [phatAmMode, setPhatAmMode] = useState(false);
  const [showVietnameseMeaning, setShowVietnameseMeaning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingResult, setRecordingResult] = useState(null);
  const mediaRecorderRef = useRef(null);
  const navigate = useNavigate();

  // Update word status to 'learned' when practice is completed
  useEffect(() => {
    if (practiceFinished && practicedWords.length > 0) {
      // Update status for all practiced words
      Promise.all(
        practicedWords.map(wordId => 
          updateWordStatus(wordId, 'learned')
            .catch(error => console.error('Error updating word status:', error))
        )
      );
    }
  }, [practiceFinished, practicedWords, updateWordStatus]);
  
  // Toggle word selection
  const toggleWordSelection = (word) => {
    setSelectedWords(prev => {
      if (prev.includes(word.id)) {
        return prev.filter(id => id !== word.id);
      } else {
        return [...prev, word.id];
      }
    });
  };
  
  // Select all words
  const selectAllWords = () => {
    if (selectedWords.length === words.length) {
      setSelectedWords([]);
    } else {
      setSelectedWords(words.map(word => word.id));
    }
  };
  
  // Get filtered words based on selection and search term
  const getFilteredWords = useCallback(() => {
    let filtered = [...words];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(term) || 
        word.meaning.toLowerCase().includes(term)
      );
    }
    
    // Only apply selection filter when not in selection mode
    if (!selectingWords && selectedWords.length > 0) {
      filtered = filtered.filter(word => selectedWords.includes(word.id));
    }
    
    return filtered;
  }, [words, searchTerm, selectingWords, selectedWords]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Get paginated words for display
  const getPaginatedWords = () => {
    const filtered = getFilteredWords();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filtered.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Calculate pagination info
  const getPaginationInfo = () => {
    const filtered = getFilteredWords();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const startItem = filtered.length > 0 ? indexOfFirstItem + 1 : 0;
    const endItem = Math.min(indexOfLastItem, filtered.length);
    
    return {
      totalPages,
      startItem,
      endItem,
      totalItems: filtered.length
    };
  };

  // Pagination navigation functions
  const nextPage = () => {
    const { totalPages } = getPaginationInfo();
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const chuyenTuTiepTheo = useCallback(() => {
    const filteredWords = getFilteredWords();
    
    // Get words that are selected and haven't been practiced yet
    const remainingWords = filteredWords.filter(word => 
      selectedWords.includes(word.id) && !practicedWords.includes(word.id)
    );
    
    if (remainingWords.length === 0) {
      // If all selected words have been practiced, show completion screen
      setPracticeFinished(true);
      return;
    }
    
    // Get the first word from the selected words that hasn't been practiced
    const nextWord = remainingWords[0];
    setTuHienTai(nextWord);
    setCauTraLoi('');
    setKetQua(null);
    setGoiY(false);
    setDaNghe(false); // Reset listening state
  }, [getFilteredWords, practicedWords, selectedWords]);

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

  const handleSpeak = useCallback(() => {
    if (!tuHienTai) return;
    
    if (cheDo === 'anhViet' || cheDo === 'ngheViet') {
      speakText(tuHienTai.word || '', 'en');
      if (cheDo === 'ngheViet') {
        setDaNghe(true);
      }
    } else if (cheDo === 'vietAnh') {
      speakText(tuHienTai.meaning.split(',')[0].trim() || '', 'vi');
    }
  }, [tuHienTai, cheDo]);

  // Pronunciation practice functions
  const startPronunciationPractice = () => {
    if (selectedWords.length > 0) {
      setPhatAmMode(true);
      setSelectingWords(false);
      setPracticeFinished(false);
      setDiemSo({ dung: 0, tong: 0 });
      setPracticedWords([]);
      setShowVietnameseMeaning(false);
      setRecordingResult(null);
      chuyenTuTiepTheo();
    }
  };

  const showVietnameseMeaningHandler = () => {
    setShowVietnameseMeaning(true);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await analyzeRecording(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Không thể truy cập micro. Vui lòng kiểm tra cài đặt micro.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeRecording = async (audioBlob) => {
    // Simulate pronunciation analysis (in real app, you'd use speech recognition API)
    // For demo purposes, we'll generate a random accuracy score
    const accuracy = Math.floor(Math.random() * 30) + 70; // Random between 70-100%
    setRecordingResult({
      accuracy: accuracy,
      message: accuracy >= 80 ? 'Tuyệt vời!' : accuracy >= 60 ? 'Khá tốt!' : 'Cần cải thiện!'
    });
  };

  const resetPronunciationPractice = () => {
    setShowVietnameseMeaning(false);
    setRecordingResult(null);
    chuyenTuTiepTheo();
  };

  // Function to compare answers and highlight differences
  const compareAnswers = (userAnswer, correctAnswer) => {
    const result = [];
    const maxLength = Math.max(userAnswer.length, correctAnswer.length);
    
    for (let i = 0; i < maxLength; i++) {
      const userChar = userAnswer[i] || '';
      const correctChar = correctAnswer[i] || '';
      
      if (userChar === correctChar) {
        result.push({
          char: userChar,
          status: 'correct',
          isExtra: false
        });
      } else if (!userChar && correctChar) {
        result.push({
          char: correctChar,
          status: 'missing',
          isExtra: false
        });
      } else if (userChar && !correctChar) {
        result.push({
          char: userChar,
          status: 'extra',
          isExtra: true
        });
      } else {
        result.push({
          char: userChar,
          status: 'wrong',
          isExtra: false
        });
      }
    }
    
    return result;
  };

  // Function to render comparison result
  const renderComparison = () => {
    if (!ketQua) return null;
    
    let userAnswer, correctAnswer;
    
    if (cheDo === 'anhViet') {
      userAnswer = cauTraLoi.trim();
      correctAnswer = tuHienTai.meaning.split(',')[0].trim();
    } else if (cheDo === 'vietAnh' || cheDo === 'ngheViet') {
      userAnswer = cauTraLoi.trim();
      correctAnswer = tuHienTai.word;
    } else {
      return null;
    }
    
    const comparison = compareAnswers(userAnswer, correctAnswer);
    
    return (
      <div className="answer-comparison">
        <p className="comparison-label">So sánh câu trả lời của bạn:</p>
        <div className="comparison-container">
          <div className="user-answer">
            <span className="answer-label">Câu trả lời:</span>
            <div className="answer-chars">
              {comparison.map((item, index) => (
                <span
                  key={index}
                  className={`char ${item.status} ${item.isExtra ? 'extra' : ''}`}
                >
                  {item.char}
                </span>
              ))}
            </div>
          </div>
          <div className="correct-answer">
            <span className="answer-label">Đáp án đúng:</span>
            <div className="answer-chars">
              {correctAnswer.split('').map((char, index) => (
                <span key={index} className="char correct">
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button 
          className="nut-sua-lai"
          onClick={() => {
            setCauTraLoi('');
            setKetQua(null);
          }}
        >
          Sửa lại câu trả lời
        </button>
      </div>
    );
  };

  useEffect(() => {
    if (words.length > 0 && !tuHienTai) {
      chuyenTuTiepTheo();
    }
  }, [words, tuHienTai, chuyenTuTiepTheo]);

  // Auto-speak when entering ngheViet mode and a new word is loaded
  useEffect(() => {
    if (cheDo === 'ngheViet' && tuHienTai && !daNghe) {
      setTimeout(() => {
        handleSpeak();
      }, 500); // Small delay to ensure UI is ready
    }
  }, [cheDo, tuHienTai, daNghe, handleSpeak]);

  const kiemTraDapAn = () => {
    if (!tuHienTai || !cauTraLoi.trim()) return;

    // Normalize both user input and correct answers for comparison
    const normalizeText = (text) => text.toLowerCase().trim().replace(/\s+/g, ' ');
    const userAnswer = normalizeText(cauTraLoi);
    
    let dung = false;
    if (cheDo === 'anhViet') {
      const cacNghia = tuHienTai.meaning.split(',').map(m => normalizeText(m));
      dung = cacNghia.some(nghia => 
        nghia === userAnswer
      );
    } else if (cheDo === 'vietAnh' || cheDo === 'ngheViet') {
      dung = normalizeText(tuHienTai.word) === userAnswer;
    }

    // Mark the current word as practiced
    if (!practicedWords.includes(tuHienTai.id)) {
      setPracticedWords(prev => [...prev, tuHienTai.id]);
    }

    setKetQua(dung);
    setDiemSo(prev => ({
      dung: dung ? prev.dung + 1 : prev.dung,
      tong: prev.tong + 1
    }));
    
    // Show comparison for wrong answers in ngheViet or vietAnh modes
    if (!dung && (cheDo === 'ngheViet' || cheDo === 'vietAnh')) {
      // Comparison logic would go here
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !ketQua) {
      kiemTraDapAn();
    } else if (e.key === 'Enter' && ketQua !== null) {
      chuyenTuTiepTheo();
    }
  };

  const chuyenDoiCheDo = () => {
    setCheDo(prev => prev === 'anhViet' ? 'vietAnh' : 'anhViet');
    chuyenTuTiepTheo();
  };

  if (phatAmMode) {
    if (!tuHienTai) {
      return (
        <div className="trang-luyen-tap">
          <div className="khung-luyen-tap">
            <h2>Không có từ vựng để luyện tập</h2>
            <p>Vui lòng chọn từ vựng để bắt đầu luyện tập.</p>
            <button 
              className="nut-quay-lai"
              onClick={() => setSelectingWords(true)}
            >
              Quay lại chọn từ
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="trang-luyen-tap">
        <div className="khung-luyen-tap">
          <button 
            className="nut-quay-lai"
            onClick={() => {
              setSelectingWords(true);
              setTuHienTai(null);
              setPhatAmMode(false);
            }}
            style={{marginBottom: '1rem'}}
          >
            ← Chọn từ khác
          </button>
          <div className="tieu-de">
            <h2><FaBook style={{marginRight: '10px'}} />Luyện Tập Phát Âm</h2>
            <div className="diem-so">
              Điểm: {diemSo.dung}/{diemSo.tong} ({diemSo.tong > 0 ? Math.round((diemSo.dung / diemSo.tong) * 100) : 0}%)
            </div>
          </div>

          <div className="the-tu">
            <div className="hien-thi-tu">
              <div className="tu-voi-loa">
                <h3>{tuHienTai.word}</h3>
                <button 
                  className="speaker-btn-practice"
                  onClick={() => speakText(tuHienTai.word, 'en')}
                  title="Nghe phát âm chuẩn"
                >
                  <FaVolumeUp />
                </button>
              </div>
              
              {!showVietnameseMeaning && (
                <button 
                  className="nut-hien-nghia"
                  onClick={showVietnameseMeaningHandler}
                >
                  📖 Hiện nghĩa tiếng Việt
                </button>
              )}
              
              {showVietnameseMeaning && (
                <div className="nghia-tieng-viet">
                  <h4>Nghĩa: {tuHienTai.meaning}</h4>
                  
                  {!recordingResult && (
                    <div className="microphone-section">
                      <p>Bấm vào micro để đọc từ:</p>
                      <button 
                        className={`nut-micro ${isRecording ? 'dang-ghi-am' : ''}`}
                        onClick={isRecording ? stopRecording : startRecording}
                      >
                        {isRecording ? (
                          <>
                            <FaMicrophoneSlash style={{marginRight: '8px'}} />
                            Dừng ghi âm
                          </>
                        ) : (
                          <>
                            <FaMicrophone style={{marginRight: '8px'}} />
                            Bắt đầu ghi âm
                          </>
                        )}
                      </button>
                      
                      {isRecording && (
                        <div className="recording-indicator">
                          <span className="recording-dot"></span>
                          Đang ghi âm...
                        </div>
                      )}
                    </div>
                  )}
                  
                  {recordingResult && (
                    <div className="recording-result">
                      <h4>Kết quả phát âm:</h4>
                      <div className="accuracy-score">
                        <span className="score-number">{recordingResult.accuracy}%</span>
                        <span className="score-message">{recordingResult.message}</span>
                      </div>
                      
                      <div className="result-actions">
                        <button 
                          className="nut-thu-lai"
                          onClick={() => {
                            setRecordingResult(null);
                            setShowVietnameseMeaning(false);
                          }}
                        >
                          Thử lại
                        </button>
                        <button 
                          className="nut-tiep-theo-phat-am"
                          onClick={() => {
                            // Mark word as practiced
                            if (!practicedWords.includes(tuHienTai.id)) {
                              setPracticedWords(prev => [...prev, tuHienTai.id]);
                            }
                            
                            // Update score
                            const isGood = recordingResult.accuracy >= 70;
                            setDiemSo(prev => ({
                              dung: isGood ? prev.dung + 1 : prev.dung,
                              tong: prev.tong + 1
                            }));
                            
                            resetPronunciationPractice();
                          }}
                        >
                          Tiếp theo <FaArrowRight style={{marginLeft: '5px'}} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="thong-tin-them">
            <p><strong>Loại từ:</strong> {tuHienTai.type}</p>
            {tuHienTai.note && <p><strong>Ghi chú:</strong> {tuHienTai.note}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (selectingWords) {
    return (
      <div className="trang-luyen-tap">
        <div className="khung-luyen-tap">
          <div className="tieu-de">
            <h2><FaList style={{marginRight: '10px'}} />Chọn từ để luyện tập</h2>
          </div>
          
          <div className="bang-chon-tu">
            <div className="tim-kiem-container">
              <input
                type="text"
                placeholder="Tìm kiếm từ vựng hoặc nghĩa..."
                className="o-tim-kiem"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="bang-tieu-de">
              <div className="hang">
                <div className="cot cot-chon">
                  <input 
                    type="checkbox" 
                    checked={selectedWords.length === words.length && words.length > 0}
                    onChange={selectAllWords}
                  />
                </div>
                <div className="cot cot-stt">STT</div>
                <div className="cot cot-tu">Từ vựng</div>
                <div className="cot cot-nghia">Nghĩa</div>
              </div>
            </div>
            
            <div className="bang-noi-dung">
              {getPaginatedWords().length > 0 ? (
                getPaginatedWords().map((word, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index;
                  return (
                    <div 
                      key={word.id} 
                      className={`hang ${selectedWords.includes(word.id) ? 'da-chon' : ''}`}
                      onClick={() => toggleWordSelection(word)}
                    >
                      <div className="cot cot-chon">
                        <input 
                          type="checkbox" 
                          checked={selectedWords.includes(word.id)}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="cot cot-stt">{globalIndex + 1}</div>
                      <div className="cot cot-tu">{word.word}</div>
                      <div className="cot cot-nghia">{word.meaning}</div>
                    </div>
                  );
                })
              ) : (
                <div className="khong-co-du-lieu">
                  Không có từ vựng nào để hiển thị
                </div>
              )}
            </div>
            
            <div className="bang-chan-trang">
              <div className="tong-so">
                Tổng: {getPaginationInfo().totalItems} từ
              </div>
              <div className="thong-tin-phan-trang">
                {searchTerm ? (
                  <span>Đã tìm thấy {getPaginationInfo().totalItems} kết quả</span>
                ) : (
                  <span>Hiển thị {getPaginationInfo().startItem}-{getPaginationInfo().endItem} trên {words.length} từ</span>
                )}
              </div>
              <div className="dieu-khien-phan-trang">
                <button 
                  className="nut-phan-trang" 
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                <span className="trang-hien-tai">{currentPage}</span>
                <button 
                  className="nut-phan-trang" 
                  onClick={nextPage}
                  disabled={currentPage === getPaginationInfo().totalPages}
                >
                  &gt;
                </button>
              </div>
            </div>
            
            <div className="cac-nut-hanh-dong">
              <button 
                className="nut-huy"
                onClick={() => navigate('/')}
              >
                Hủy
              </button>
              <button 
                className={`nut-nghe-viet ${selectedWords.length === 0 ? 'bi-vo-hieu' : ''}`}
                onClick={() => {
                  const startListenPractice = () => {
                    if (selectedWords.length > 0) {
                      setCheDo('ngheViet'); // Set mode to ngheViet
                      setSelectingWords(false);
                      setPracticeFinished(false);
                      setDiemSo({ dung: 0, tong: 0 });
                      setPracticedWords([]);
                      chuyenTuTiepTheo();
                    }
                  };
                  startListenPractice();
                }}
                disabled={selectedWords.length === 0}
              >
                🎧 Luyện tập nghe viết ({selectedWords.length} từ đã chọn)
              </button>
              <button 
                className={`nut-luu ${selectedWords.length === 0 ? 'bi-vo-hieu' : ''}`}
                onClick={() => {
                  const startPractice = () => {
                    if (selectedWords.length > 0) {
                      setCheDo('anhViet'); // Set mode to anhViet for normal practice
                      setSelectingWords(false);
                      setPracticeFinished(false);
                      setDiemSo({ dung: 0, tong: 0 });
                      setPracticedWords([]);
                      chuyenTuTiepTheo();
                    }
                  };
                  startPractice();
                }}
                disabled={selectedWords.length === 0}
              >
                📝 Bắt đầu luyện tập ({selectedWords.length} từ đã chọn)
              </button>
              <button 
                className={`nut-phat-am ${selectedWords.length === 0 ? 'bi-vo-hieu' : ''}`}
                onClick={startPronunciationPractice}
                disabled={selectedWords.length === 0}
              >
                🎤 Luyện tập phát âm ({selectedWords.length} từ đã chọn)
              </button>
              <button 
                className={`nut-hoc-tu-vung ${selectedWords.length === 0 ? 'bi-vo-hieu' : ''}`}
                onClick={() => {
                  if (selectedWords.length > 0) {
                    // Navigate to learning page with selected words
                    navigate('/hoc-tu-vung', { state: { selectedWords } });
                  }
                }}
                disabled={selectedWords.length === 0}
              >
                📖 Học từ vựng ({selectedWords.length} từ đã chọn)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (practiceFinished) {
    return (
      <div className="trang-luyen-tap">
        <div className="khung-luyen-tap hoan-thanh-luyen-tap">
          <div className="thong-bao-hoan-thanh">
            <h2>Chúc mừng! 🎉</h2>
            <p>Bạn đã hoàn thành bài luyện tập!</p>
            <div className="ket-qua-tong-quat">
              <p>Điểm số: <strong>{diemSo.dung}/{diemSo.tong}</strong> ({Math.round((diemSo.dung / diemSo.tong) * 100)}%)</p>
            </div>
            <div className="cac-nut-hanh-dong">
              <button 
                className="nut-tiep-tuc"
                onClick={() => {
                  setPracticeFinished(false);
                  setDiemSo({ dung: 0, tong: 0 });
                  chuyenTuTiepTheo();
                }}
              >
                Luyện tập lại
              </button>
              <button 
                className="nut-thoat"
                onClick={() => {
                  setSelectingWords(true);
                  setPracticeFinished(false);
                  setDiemSo({ dung: 0, tong: 0 });
                }}
              >
                Chọn từ khác
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tuHienTai) {
    return (
      <div className="trang-luyen-tap">
        <div className="khung-luyen-tap">
          <h2>Không có từ vựng để luyện tập</h2>
          <p>Vui lòng chọn từ vựng để bắt đầu luyện tập.</p>
          <button 
            className="nut-quay-lai"
            onClick={() => setSelectingWords(true)}
          >
            Quay lại chọn từ
          </button>
        </div>
      </div>
    );
  }

  const doChinhXac = diemSo.tong > 0 ? Math.round((diemSo.dung / diemSo.tong) * 100) : 0;

  return (
    <div className="trang-luyen-tap">
      <div className="khung-luyen-tap">
        <button 
          className="nut-quay-lai"
          onClick={() => {
            setSelectingWords(true);
            setTuHienTai(null);
            setKetQua(null);
            setCauTraLoi('');
          }}
          style={{marginBottom: '1rem'}}
        >
          ← Chọn từ khác
        </button>
        <div className="tieu-de">
          <h2><FaBook style={{marginRight: '10px'}} />Luyện Tập Từ Vựng</h2>
          <div className="diem-so">
            Điểm: {diemSo.dung}/{diemSo.tong} ({doChinhXac}%)
          </div>
        </div>
        
        {ketQua !== null && !ketQua && (
          <div className="thong-bao sai">
            <>
              <FaTimes style={{ color: 'red', marginRight: '8px' }} />
              Sai rồi! Đáp án đúng là:
              <span className="dap-an-dung">
                {cheDo === 'anhViet' 
                  ? tuHienTai.meaning.split(',')[0].trim().split('').map((char, index) => {
                      const userAnswer = cauTraLoi.trim();
                      const isMissing = index >= userAnswer.length || userAnswer[index] !== char;
                      return (
                        <span 
                          key={index} 
                          className={isMissing ? 'char-thieu' : ''}
                        >
                          {char}
                        </span>
                      );
                    })
                  : cheDo === 'vietAnh' || cheDo === 'ngheViet'
                  ? tuHienTai.word.split('').map((char, index) => {
                      const userAnswer = cauTraLoi.trim();
                      // Check if this character exists in user's answer at any position
                      const charExistsInUserAnswer = userAnswer.includes(char);
                      // Only highlight if character is missing from user's answer entirely
                      const shouldHighlight = !charExistsInUserAnswer;
                      return (
                        <span 
                          key={index} 
                          className={shouldHighlight ? 'char-thieu' : ''}
                        >
                          {char}
                        </span>
                      );
                    })
                  : tuHienTai.word
                }
              </span>
            </>
          </div>
        )}

        <div className="chon-che-do">
          <button
            className={`nut-che-do ${cheDo === 'anhViet' ? 'dang-chon' : ''}`}
            onClick={() => cheDo !== 'anhViet' && chuyenDoiCheDo()}
          >
            Anh → Việt
          </button>
          <button
            className={`nut-che-do ${cheDo === 'vietAnh' ? 'dang-chon' : ''}`}
            onClick={() => cheDo !== 'vietAnh' && chuyenDoiCheDo()}
          >
            Việt → Anh
          </button>
          <button
            className={`nut-che-do ${cheDo === 'ngheViet' ? 'dang-chon' : ''}`}
            onClick={() => cheDo !== 'ngheViet' && chuyenDoiCheDo()}
          >
            Nghe → Viết
          </button>
        </div>

        <div className="the-tu">
          <div className="hien-thi-tu">
            {cheDo === 'ngheViet' ? (
              <div className="nghe-mode">
                <h3>Nghe và viết từ tiếng Anh</h3>
                <p className="hint-text">Nhấn nút loa để nghe từ, sau đó viết vào ô bên dưới</p>
                <div className="speaker-and-hint-container">
                  <button 
                    className="speaker-btn-practice"
                    onClick={handleSpeak}
                    title="Nghe tiếng Anh"
                  >
                    <FaVolumeUp />
                  </button>
                  {daNghe && (
                    <button 
                      className="nut-goi-y-nghe"
                      onClick={() => setGoiY(!goiY)}
                      title="Xem gợi ý"
                    >
                      {goiY ? 'Ẩn gợi ý' : 'Hiện gợi ý'}
                    </button>
                  )}
                </div>
                {daNghe && goiY && (
                  <div className="da-nghe-hint">
                    <p className="da-nghe-text">Bạn vừa nghe từ: <strong>{tuHienTai.word}</strong></p>
                    <small className="ghi-chu">Gợi ý: Từ có {tuHienTai.word.length} ký tự</small>
                  </div>
                )}
              </div>
            ) : (
              <div className="tu-voi-loa">
                {cheDo === 'anhViet' ? (
                  <h3>{tuHienTai.word}</h3>
                ) : (
                  <h3>{tuHienTai.meaning.split(',')[0].trim()}</h3>
                )}
                <button 
                  className="speaker-btn-practice"
                  onClick={handleSpeak}
                  title={cheDo === 'anhViet' ? "Đọc tiếng Anh" : "Đọc tiếng Việt"}
                >
                  <FaVolumeUp />
                </button>
              </div>
            )}
            
            {tuHienTai.example && cheDo !== 'ngheViet' && (
              <p className="vi-du">Ví dụ: {tuHienTai.example}</p>
            )}
          </div>

          <div className="phan-tra-loi">
            {!ketQua ? (
              <>
                <div className="nhap-lieu">
                  <input
                    type="text"
                    value={cauTraLoi}
                    onChange={(e) => setCauTraLoi(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={ketQua !== null ? (ketQua ? 'dung' : 'sai') : ''}
                    placeholder={cheDo === 'anhViet' 
                      ? `Nhập nghĩa tiếng Việt của "${tuHienTai.word}"` 
                      : cheDo === 'vietAnh'
                      ? `Nhập từ tiếng Anh của "${tuHienTai.meaning}"`
                      : `Nhập từ tiếng Anh bạn vừa nghe`}
                    disabled={ketQua !== null}
                    autoFocus
                  />
                  <button 
                    className="nut-goi-y"
                    onClick={() => setGoiY(!goiY)}
                    title="Gợi ý"
                  >
                    {goiY ? 'Ẩn gợi ý' : 'Gợi ý'}
                  </button>
                </div>

                {renderComparison()}

                {goiY && (
                  <div className="goi-y">
                    {cheDo === 'anhViet' ? (
                      <p>Gợi ý: {tuHienTai.meaning.split(',')[0].trim().split('').map((kyTu, i) => 
                        kyTu === ' ' ? ' ' : i % 2 === 0 ? kyTu : '_'
                      )}</p>
                    ) : (
                      <p>Gợi ý: {tuHienTai.word.split('').map((kyTu, i) => 
                        kyTu === ' ' ? ' ' : i % 2 === 0 ? kyTu : '_'
                      )}</p>
                    )}
                  </div>
                )}

                {ketQua !== null && !ketQua && (
                  <div className="thong-bao sai input-error">
                    <>
                      <FaTimes style={{ color: 'red', marginRight: '8px' }} />
                      Sai rồi! Đáp án đúng là:
                      <span className="dap-an-dung">
                        {cheDo === 'anhViet' 
                          ? tuHienTai.meaning.split(',')[0].trim().split('').map((char, index) => {
                              const userAnswer = cauTraLoi.trim();
                              const isMissing = index >= userAnswer.length || userAnswer[index] !== char;
                              return (
                                <span 
                                  key={index} 
                                  className={isMissing ? 'char-thieu' : ''}
                                >
                                  {char}
                                </span>
                              );
                            })
                          : cheDo === 'vietAnh' || cheDo === 'ngheViet'
                          ? tuHienTai.word.split('').map((char, index) => {
                              const userAnswer = cauTraLoi.trim();
                              // Check if this character exists in user's answer at any position
                              const charExistsInUserAnswer = userAnswer.includes(char);
                              // Only highlight if character is missing from user's answer entirely
                              const shouldHighlight = !charExistsInUserAnswer;
                              return (
                                <span 
                                  key={index} 
                                  className={shouldHighlight ? 'char-thieu' : ''}
                                >
                                  {char}
                                </span>
                              );
                            })
                          : tuHienTai.word
                        }
                      </span>
                    </>
                  </div>
                )}

                <button 
                  className={`nut-kiem-tra ${ketQua === null ? '' : 'tiep-theo'}`} 
                  onClick={ketQua === null ? kiemTraDapAn : chuyenTuTiepTheo}
                  disabled={!cauTraLoi.trim()}
                >
                  {ketQua === null ? 'Kiểm tra' : 'Tiếp theo'} <FaArrowRight style={{marginLeft: '5px'}} />
                </button>
              </>
            ) : (
              <div className={`ket-qua ${ketQua ? 'dung' : 'sai'}`}>
                <div className="bieu-tuong">
                  {ketQua ? <FaCheck /> : <FaTimes />}
                </div>
                <div className="thong-bao">
                  {ketQua ? (
                    <p>Chính xác! 🎉</p>
                  ) : (
                    <p>
                      Chưa chính xác. Đáp án đúng là:{" "}
                      <strong>
                        {cheDo === 'anhViet' 
                          ? tuHienTai.meaning 
                          : tuHienTai.word}
                      </strong>
                    </p>
                  )}
                </div>
                <button 
                  className="nut-tiep-theo"
                  onClick={chuyenTuTiepTheo}
                  autoFocus
                >
                  Tiếp theo <FaArrowRight />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="thong-tin-them">
          <p><strong>Loại từ:</strong> {tuHienTai.type}</p>
          {tuHienTai.note && <p><strong>Ghi chú:</strong> {tuHienTai.note}</p>}
        </div>
      </div>
    </div>
  );
};

export default LuyenTap;
