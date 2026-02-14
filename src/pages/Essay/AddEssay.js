import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import essayApi from '../../api/essayApi';
import './Essay.css';

const AddEssay = () => {
  const navigate = useNavigate();
  const [essay, setEssay] = useState({
    title: '',
    content: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEssay({
      ...essay,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!essay.title.trim() || !essay.content.trim()) {
        toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung bài luận');
        return;
      }

      // Thêm bài luận vào database
      await essayApi.createEssay({
        ...essay,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Thêm bài luận thành công!');
      // Chuyển về trang quản lý sau khi thêm thành công
      navigate('/essays');
    } catch (error) {
      console.error('Lỗi khi thêm bài luận:', error);
      toast.error('Có lỗi xảy ra khi thêm bài luận. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="essay-container">
      <div className="essay-header">
        <h1>Thêm bài luận mới</h1>
      </div>
      
      <div className="essay-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Tiêu đề:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={essay.title}
              onChange={handleInputChange}
              placeholder="Nhập tiêu đề bài luận"
              className="form-control"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Nội dung:</label>
            <textarea
              id="content"
              name="content"
              value={essay.content}
              onChange={handleInputChange}
              placeholder="Nhập nội dung bài luận"
              className="form-control"
              rows="15"
              required
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Lưu bài luận
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/essays')}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEssay;
