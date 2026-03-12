import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import essayCategoryApi from '../../api/essayCategoryApi';
import './Essay.css';

const AddEssayCategory = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState({
    name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategory({
      ...category,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!category.name.trim()) {
        toast.error('Vui lòng nhập tên danh mục');
        return;
      }

      setIsLoading(true);

      // Thêm danh mục vào database
      await essayCategoryApi.createCategory(category);
      
      toast.success('Thêm danh mục thành công!');
      // Chuyển về trang quản lý danh mục sau khi thêm thành công
      navigate('/essay-categories');
    } catch (error) {
      console.error('Lỗi khi thêm danh mục:', error);
      toast.error('Có lỗi xảy ra khi thêm danh mục. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="essay-container">
      <div className="essay-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/essay-categories')} 
            className="btn btn-secondary"
          >
            ← Quay lại
          </button>
          <h1>Thêm danh mục bài luận mới</h1>
        </div>
      </div>
      
      <div className="essay-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Tên danh mục:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={category.name}
              onChange={handleInputChange}
              placeholder="Nhập tên danh mục bài luận"
              className="form-control"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Mô tả:</label>
            <textarea
              id="description"
              name="description"
              value={category.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả cho danh mục (không bắt buộc)"
              className="form-control"
              rows="4"
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Lưu danh mục'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/essay-categories')}
              disabled={isLoading}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEssayCategory;
