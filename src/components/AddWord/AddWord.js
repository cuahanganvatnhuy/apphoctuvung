import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabulary } from '../../context/VocabularyContext';
import { FaCheckCircle, FaExclamationCircle, FaSave, FaList } from 'react-icons/fa';
import { database } from '../../firebase';
import { ref, push, set } from 'firebase/database';
import './AddWord.css';

const AddWord = () => {
  const [word, setWord] = useState({
    word: '',
    meaning: '',
    type: 'noun',
    example: '',
    note: '',
    subject: '',
    customSubject: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const { addWord, words } = useVocabulary();
  const navigate = useNavigate();

  // Get unique subjects from existing words
  const getUniqueSubjects = () => {
    const subjects = new Set();
    words.forEach(word => {
      if (word.subject && word.subject.trim()) {
        subjects.add(word.subject.trim());
      }
    });
    return Array.from(subjects).sort();
  };

  // Function to remove Vietnamese diacritics for search
  const removeDiacritics = (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWord(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!word.word.trim() || !word.meaning.trim()) {
      setMessage({
        text: 'Vui lòng điền đầy đủ từ và nghĩa',
        type: 'error'
      });
      return;
    }

    if (!word.subject) {
      setMessage({
        text: 'Vui lòng chọn chủ đề',
        type: 'error'
      });
      return;
    }

    if (word.subject === 'khác' && !word.customSubject.trim()) {
      setMessage({
        text: 'Vui lòng nhập chủ đề tùy chỉnh',
        type: 'error'
      });
      return;
    }

    try {
      // Prepare word data with subject
      const wordData = {
        ...word,
        subject: word.subject === 'khác' ? word.customSubject : word.subject
      };
      
      // Add to local state
      addWord(wordData);
      
      // Add to Firebase
      const wordsRef = ref(database, 'words');
      const newWordRef = push(wordsRef);
      
      await set(newWordRef, {
        ...wordData,
        createdAt: new Date().toISOString(),
        id: newWordRef.key
      });
      
      setMessage({
        text: 'Đã thêm từ mới thành công!',
        type: 'success'
      });
      
      // Reset form
      setWord({
        word: '',
        meaning: '',
        type: 'noun',
        example: '',
        note: '',
        subject: '',
        customSubject: ''
      });
      
      // Auto hide message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error adding word:', error);
      setMessage({
        text: 'Có lỗi xảy ra khi lưu từ. Vui lòng thử lại.',
        type: 'error'
      });
    }
  };

  // Auto focus on the first input
  const wordInputRef = useRef(null);
  
  useEffect(() => {
    if (wordInputRef.current) {
      wordInputRef.current.focus();
    }
  }, []);

  return (
    <div className="add-word-page">
      <div className="container">
        <h1>Thêm từ mới</h1>
        
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? (
              <FaCheckCircle className="mr-2" />
            ) : (
              <FaExclamationCircle className="mr-2" />
            )}
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="add-word-form">
          <div className="form-group">
            <input
              type="text"
              id="word"
              name="word"
              value={word.word}
              onChange={handleChange}
              placeholder=" "
              required
              ref={wordInputRef}
              className={word.word ? 'has-value' : ''}
            />
            <span className="floating-label">Từ vựng *</span>
          </div>
          
          <div className="form-group">
            <input
              type="text"
              id="meaning"
              name="meaning"
              value={word.meaning}
              onChange={handleChange}
              placeholder=" "
              required
              className={word.meaning ? 'has-value' : ''}
            />
            <span className="floating-label">Nghĩa *</span>
          </div>
          
          <div className="form-group">
            <div className="select-wrapper">
              <select
                id="type"
                name="type"
                value={word.type}
                onChange={handleChange}
                className={word.type ? 'has-value' : ''}
              >
                <option value="">Chọn loại từ</option>
                <option value="noun">Danh từ</option>
                <option value="verb">Động từ</option>
                <option value="adjective">Tính từ</option>
                <option value="adverb">Trạng từ</option>
                <option value="phrase">Cụm từ</option>
                <option value="other">Khác</option>
              </select>
              <span className="floating-label">Loại từ</span>
            </div>
          </div>
          
          <div className="form-group">
            <div className="select-wrapper">
              <select
                id="subject"
                name="subject"
                value={word.subject}
                onChange={handleChange}
                className={word.subject ? 'has-value' : ''}
              >
                <option value="">Chọn chủ đề</option>
                {getUniqueSubjects().map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
                <option value="khác">Khác</option>
              </select>
              <span className="floating-label">Chủ đề</span>
            </div>
          </div>
          
          {word.subject === 'khác' && (
            <div className="form-group">
              <input
                type="text"
                id="customSubject"
                name="customSubject"
                value={word.customSubject}
                onChange={handleChange}
                placeholder=" "
                className={word.customSubject ? 'has-value' : ''}
              />
              <span className="floating-label">Nhập chủ đề tùy chỉnh</span>
            </div>
          )}
          
          <div className="form-group">
            <textarea
              id="example"
              name="example"
              value={word.example}
              onChange={handleChange}
              placeholder=" "
              rows="3"
              className={word.example ? 'has-value' : ''}
            />
            <span className="floating-label">Ví dụ (không bắt buộc)</span>
          </div>
          
          <div className="form-group">
            <textarea
              id="note"
              name="note"
              value={word.note}
              onChange={handleChange}
              placeholder=" "
              rows="2"
              className={word.note ? 'has-value' : ''}
            />
            <span className="floating-label">Ghi chú thêm (nếu có)</span>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => navigate('/list')}
            >
              <FaList className="mr-2" />
              Xem danh sách
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!word.word.trim() || !word.meaning.trim() || !word.subject || (word.subject === 'khác' && !word.customSubject.trim())}
            >
              <FaSave className="mr-2" />
              Lưu từ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWord;
