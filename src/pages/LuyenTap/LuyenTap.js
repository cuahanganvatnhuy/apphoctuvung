import React, { useState, useEffect, useCallback } from 'react';
import { FaCheck, FaTimes, FaArrowRight, FaBook, FaList } from 'react-icons/fa';
import { useVocabulary } from '../../context/VocabularyContext';
import { useNavigate } from 'react-router-dom';
import './LuyenTap.css';

const LuyenTap = () => {
  const { words } = useVocabulary();
  const [tuHienTai, setTuHienTai] = useState(null);
  const [cauTraLoi, setCauTraLoi] = useState('');
  const [ketQua, setKetQua] = useState(null);
  const [diemSo, setDiemSo] = useState({ dung: 0, tong: 0 });
  const [cheDo, setCheDo] = useState('anhViet');
  const [goiY, setGoiY] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const [practicedWords, setPracticedWords] = useState([]);
  const [selectingWords, setSelectingWords] = useState(true);
  const [practiceFinished, setPracticeFinished] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
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
  const getFilteredWords = () => {
    let filtered = [...words];
    
    // Apply search filter if search term exists
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
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
  };

  const chuyenTuTiepTheo = useCallback(() => {
    const filteredWords = getFilteredWords();
    
    // Get words that haven't been practiced yet
    const remainingWords = filteredWords.filter(word => !practicedWords.includes(word.id));
    
    if (remainingWords.length === 0) {
      // If all words have been practiced, show completion screen
      setPracticeFinished(true);
      return;
    }
    
    // Select a random word from remaining words
    const randomIndex = Math.floor(Math.random() * remainingWords.length);
    setTuHienTai(remainingWords[randomIndex]);
    setCauTraLoi('');
    setKetQua(null);
    setGoiY(false);
  }, [getFilteredWords, practicedWords]);

  useEffect(() => {
    if (words.length > 0 && !tuHienTai) {
      chuyenTuTiepTheo();
    }
  }, [words, tuHienTai, chuyenTuTiepTheo]);

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
    } else {
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
              {getFilteredWords().length > 0 ? (
                getFilteredWords().map((word, index) => (
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
                    <div className="cot cot-stt">{index + 1}</div>
                    <div className="cot cot-tu">{word.word}</div>
                    <div className="cot cot-nghia">{word.meaning}</div>
                  </div>
                ))
              ) : (
                <div className="khong-co-du-lieu">
                  Không có từ vựng nào để hiển thị
                </div>
              )}
            </div>
            
            <div className="bang-chan-trang">
              <div className="tong-so">
                Tổng: {getFilteredWords().length} từ
              </div>
              <div className="thong-tin-phan-trang">
                {searchTerm ? (
                  <span>Đã tìm thấy {getFilteredWords().length} kết quả</span>
                ) : (
                  <span>Hiển thị 1-{getFilteredWords().length} trên {words.length} từ</span>
                )}
              </div>
              <div className="dieu-khien-phan-trang">
                <button className="nut-phan-trang" disabled={true}>&lt;</button>
                <span className="trang-hien-tai">1</span>
                <button className="nut-phan-trang" disabled={true}>&gt;</button>
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
                className={`nut-luu ${selectedWords.length === 0 ? 'bi-vo-hieu' : ''}`}
                onClick={() => {
                  const startPractice = () => {
                    if (selectedWords.length > 0) {
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
                Bắt đầu luyện tập ({selectedWords.length} từ đã chọn)
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
        
        {ketQua !== null && (
          <div className={`thong-bao ${ketQua ? 'dung' : 'sai'}`}>
            {ketQua ? (
              <><FaCheck style={{ color: 'green', marginRight: '8px' }} /> Chính xác!</>
            ) : (
              <>
                <FaTimes style={{ color: 'red', marginRight: '8px' }} />
                {cheDo === 'anhViet' 
                  ? `Sai rồi! Đáp án đúng là: ${tuHienTai.meaning}`
                  : `Sai rồi! Đáp án đúng là: ${tuHienTai.word}`
                }
              </>
            )}
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
        </div>

        <div className="the-tu">
          <div className="hien-thi-tu">
            {cheDo === 'anhViet' ? (
              <h3>{tuHienTai.word}</h3>
            ) : (
              <h3>{tuHienTai.meaning.split(',')[0].trim()}</h3>
            )}
            
            {tuHienTai.example && (
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
                      : `Nhập từ tiếng Anh của "${tuHienTai.meaning}"`}
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
