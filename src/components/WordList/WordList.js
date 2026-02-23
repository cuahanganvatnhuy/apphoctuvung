import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabulary } from '../../context/VocabularyContext';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaCheck, FaPause, FaTimes, FaSave, FaVolumeUp } from 'react-icons/fa';
import './WordList.css';

// Function to remove Vietnamese diacritics
const removeDiacritics = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

const WordList = () => {
  const { words, deleteWord, updateWord } = useVocabulary();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWords, setFilteredWords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [editingWord, setEditingWord] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const editInputRef = useRef(null);
  
  // Focus the input field when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  // Filter and search words
  useEffect(() => {
    let result = [...words];
    
    // Filter by type
    if (filter !== 'all') {
      result = result.filter(word => word.status === filter);
    }
    
    // Search by word, meaning, example, or note (diacritic-insensitive)
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const searchTerms = term.split(/\s+/); // Split by whitespace for multiple keywords
      
      result = result.filter(word => {
        // Create a searchable string with all relevant fields and remove diacritics
        const searchableText = [
          word.word?.toLowerCase() || '',
          word.meaning?.toLowerCase() || '',
          word.example?.toLowerCase() || '',
          word.note?.toLowerCase() || '',
          getTypeName(word.type).toLowerCase()
        ].join(' ');
          
        // Remove diacritics from the searchable text
        const normalizedText = removeDiacritics(searchableText);
        
        // Check if all search terms (with diacritics removed) are found in the normalized text
        return searchTerms.every(t => {
          const normalizedTerm = removeDiacritics(t);
          return normalizedText.includes(normalizedTerm);
        });
      });
    }
    
    // Reset to first page when filters or search changes
    setCurrentPage(1);
    setFilteredWords(result);
  }, [words, filter, searchTerm]);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa từ này không?')) {
      deleteWord(id);
    }
  };

  const getTypeName = (type) => {
    const types = {
      'noun': 'Danh từ',
      'verb': 'Động từ',
      'adjective': 'Tính từ',
      'adverb': 'Trạng từ',
      'phrase': 'Cụm từ',
      'other': 'Khác'
    };
    return types[type] || type;
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = startPage + maxPageButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // Start editing a word
  const startEditing = (word) => {
    setEditingId(word.id);
    setEditingWord({
      word: word.word || '',
      meaning: word.meaning || '',
      example: word.example || '',
      note: word.note || '',
      type: word.type || 'active',
      status: word.status || 'active'
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditingWord({});
  };

  // Save edited word
  const saveEditedWord = async (id) => {
    if (!editingWord.word.trim() || !editingWord.meaning.trim()) {
      alert('Vui lòng nhập đầy đủ từ vựng và nghĩa');
      return;
    }

    setIsSaving(true);
    try {
      await updateWord(id, editingWord);
      setEditingId(null);
      setEditingWord({});
    } catch (error) {
      console.error('Lỗi khi lưu từ:', error);
      alert('Có lỗi xảy ra khi lưu từ. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input change for editing
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingWord(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleSpeak = (word, language) => {
    if (language === 'en') {
      speakText(word.word || '', 'en');
    } else if (language === 'vi') {
      speakText(word.meaning || '', 'vi');
    }
  };

  return (
    <div className="word-list-page">
      <div className="container">
        <div className="page-header">
          <h1>Danh sách từ vựng</h1>
          <div className="action-buttons">
            <button 
              className="btn btn-outline"
              onClick={() => {}}
            >
              <FaPlus /> Xuất Excel
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/add')}
            >
              <FaPlus /> Thêm từ mới
            </button>
          </div>
        </div>
        
        <div className="filters">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm (có thể gõ không dấu) từ vựng, nghĩa, ví dụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Tìm kiếm từ vựng"
            />
          </div>
          
          <div className="filter-group">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang học</option>
              <option value="paused">Tạm dừng</option>
              <option value="learned">Đã học</option>
            </select>
          </div>
        </div>
        
        {filteredWords.length === 0 ? (
          <div className="empty-state">
            <p>Không tìm thấy từ vựng nào.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/add')}
            >
              <FaPlus /> Thêm từ mới ngay
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="vocabulary-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>
                    Từ vựng
                    <FaVolumeUp className="speaker-icon-header" style={{marginLeft: '5px', fontSize: '0.8em'}} />
                  </th>
                  <th>
                    Nghĩa
                    <FaVolumeUp className="speaker-icon-header" style={{marginLeft: '5px', fontSize: '0.8em'}} />
                  </th>
                  <th>Loại từ</th>
                  <th>Ví dụ</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((word, index) => (
                  <tr key={word.id}>
                    <td>{index + 1}</td>
                    <td className="word-cell">
                      {editingId === word.id ? (
                        <div>
                          <input
                            type="text"
                            name="word"
                            value={editingWord.word}
                            onChange={handleEditChange}
                            className="edit-input"
                            ref={editingId === word.id ? editInputRef : null}
                          />
                          <input
                            type="text"
                            name="note"
                            value={editingWord.note || ''}
                            onChange={handleEditChange}
                            className="edit-input"
                            placeholder="Ghi chú..."
                            style={{ marginTop: '5px' }}
                          />
                        </div>
                      ) : (
                        <div className="word-content-with-sound">
                          <div className="word-content">
                            <div className="word-text">{word.word}</div>
                            {word.note && (
                              <div className="word-note">
                                <small>{word.note}</small>
                              </div>
                            )}
                          </div>
                          <button
                            className="speaker-btn"
                            onClick={() => handleSpeak(word, 'en')}
                            title="Đọc tiếng Anh"
                          >
                            <FaVolumeUp />
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === word.id ? (
                        <input
                          type="text"
                          name="meaning"
                          value={editingWord.meaning}
                          onChange={handleEditChange}
                          className="edit-input"
                        />
                      ) : (
                        <div className="meaning-with-sound">
                          <span>{word.meaning}</span>
                          <button
                            className="speaker-btn"
                            onClick={() => handleSpeak(word, 'vi')}
                            title="Đọc tiếng Việt"
                          >
                            <FaVolumeUp />
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === word.id ? (
                        <select
                          name="type"
                          value={editingWord.type}
                          onChange={handleEditChange}
                          className="edit-select"
                        >
                          <option value="noun">Danh từ</option>
                          <option value="verb">Động từ</option>
                          <option value="adjective">Tính từ</option>
                          <option value="adverb">Trạng từ</option>
                          <option value="phrase">Cụm từ</option>
                          <option value="other">Khác</option>
                        </select>
                      ) : (
                        <span className="status-badge">
                          {getTypeName(word.type)}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingId === word.id ? (
                        <input
                          type="text"
                          name="example"
                          value={editingWord.example || ''}
                          onChange={handleEditChange}
                          className="edit-input"
                          placeholder="Thêm ví dụ..."
                        />
                      ) : word.example ? (
                        <div className="word-example">
                          <small>{word.example}</small>
                        </div>
                      ) : null}
                    </td>
                    <td>
                      {editingId === word.id ? (
                        <select
                          name="status"
                          value={editingWord.status}
                          onChange={handleEditChange}
                          className="edit-select"
                        >
                          <option value="active">Đang học</option>
                          <option value="paused">Tạm dừng</option>
                          <option value="learned">Đã học</option>
                        </select>
                      ) : (
                        <span className={`status-badge ${
                          word.status === 'paused' ? 'paused' : 
                          word.status === 'learned' ? 'learned' : 'active'
                        }`}>
                          {word.status === 'paused' ? (
                            <><FaPause /> Tạm dừng</>
                          ) : word.status === 'learned' ? (
                            <><FaCheck /> Đã học</>
                          ) : (
                            <><FaCheck /> Đang học</>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="actions">
                      {editingId === word.id ? (
                        <>
                          <button 
                            className="btn-icon save"
                            onClick={() => saveEditedWord(word.id)}
                            title="Lưu"
                            disabled={isSaving}
                          >
                            {isSaving ? '...' : <FaSave />}
                          </button>
                          <button 
                            className="btn-icon cancel"
                            onClick={cancelEditing}
                            title="Hủy"
                            disabled={isSaving}
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="btn-icon edit"
                            onClick={() => startEditing(word)}
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-icon delete"
                            onClick={(e) => handleDelete(word.id, e)}
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  &laquo;
                </button>
                
                {getPageNumbers().map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                  >
                    {number}
                  </button>
                ))}
                
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  &raquo;
                </button>
                
                <div className="pagination-info">
                  Trang {currentPage} / {totalPages} ({filteredWords.length} từ)
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordList;
