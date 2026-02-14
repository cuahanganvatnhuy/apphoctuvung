import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabulary } from '../../context/VocabularyContext';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaFilter, FaCheck, FaPause } from 'react-icons/fa';
import './WordList.css';

const WordList = () => {
  const { words, deleteWord } = useVocabulary();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWords, setFilteredWords] = useState([]);
  const navigate = useNavigate();

  // Filter and search words
  useEffect(() => {
    let result = [...words];
    
    // Filter by type
    if (filter !== 'all') {
      result = result.filter(word => word.type === filter);
    }
    
    // Search by word or meaning
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        word => 
          word.word.toLowerCase().includes(term) || 
          word.meaning.toLowerCase().includes(term)
      );
    }
    
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
              placeholder="Tìm kiếm từ vựng hoặc nghĩa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
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
                  <th>Từ vựng</th>
                  <th>Nghĩa</th>
                  <th>Loại từ</th>
                  <th>Ví dụ</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredWords.map((word, index) => (
                  <tr key={word.id}>
                    <td>{index + 1}</td>
                    <td className="word-cell">
                      <div className="word-content">
                        <div className="word-text">{word.word}</div>
                        {word.note && (
                          <div className="word-note">
                            <small>{word.note}</small>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{word.meaning}</td>
                    <td>
                      <span className="status-badge">
                        {getTypeName(word.type)}
                      </span>
                    </td>
                    <td>
                      {word.example && (
                        <div className="word-example">
                          <small>{word.example}</small>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${word.status === 'paused' ? 'paused' : 'active'}`}>
                        {word.status === 'paused' ? (
                          <><FaPause /> Tạm dừng</>
                        ) : (
                          <><FaCheck /> Đang học</>
                        )}
                      </span>
                    </td>
                    <td className="actions">
                      <button 
                        className="btn-icon edit"
                        onClick={() => navigate(`/edit/${word.id}`)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordList;
