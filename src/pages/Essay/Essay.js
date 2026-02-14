import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import essayApi from '../../api/essayApi';
import './Essay.css';

const Essay = () => {
  const [essays, setEssays] = useState([]);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  // Load essays from database
  useEffect(() => {
    const fetchEssays = async () => {
      try {
        setIsLoading(true);
        const data = await essayApi.getAllEssays();
        setEssays(data);
      } catch (error) {
        console.error('Error loading essays:', error);
        toast.error('Không thể tải danh sách bài luận');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEssays();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài luận này?')) {
      try {
        await essayApi.deleteEssay(id);
        const updatedEssays = essays.filter(essay => essay.id !== id);
        setEssays(updatedEssays);
        toast.success('Đã xóa bài luận thành công');
      } catch (error) {
        console.error('Error deleting essay:', error);
        toast.error('Có lỗi xảy ra khi xóa bài luận');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const handleAddNew = () => {
    navigate('/essays/add');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Đang tải danh sách bài luận...</p>
      </div>
    );
  }

  return (
    <div className="essay-container">
      <div className="essay-header">
        <h1>Quản lý Bài Luận</h1>
        <button onClick={handleAddNew} className="btn btn-primary">
          <FaPlus /> Thêm bài luận mới
        </button>
      </div>
      
      <div className="essays-list">
        <h2>Danh sách bài luận</h2>
        {essays.length === 0 ? (
          <div className="no-essays-container">
            <p className="no-essays">Chưa có bài luận nào.</p>
            <button onClick={handleAddNew} className="btn btn-primary">
              <FaPlus /> Thêm bài luận mới
            </button>
          </div>
        ) : (
          <div className="essay-cards">
            {essays.map(essay => (
              <div key={essay.id} className="essay-card">
                <div className="essay-card-header">
                  <h3>{essay.title}</h3>
                  <div className="essay-actions">
                    <Link 
                      to={`/essays/edit/${essay.id}`}
                      className="btn-edit"
                      title="Chỉnh sửa"
                    >
                      <FaEdit />
                    </Link>
                    <button 
                      onClick={() => handleDelete(essay.id)}
                      className="btn-delete"
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="essay-content">
                  <p>{essay.content.length > 150 ? `${essay.content.substring(0, 150)}...` : essay.content}</p>
                </div>
                <div className="essay-footer">
                  <span className="essay-date">
                    {essay.createdAt === essay.updatedAt 
                      ? `Tạo lúc: ${formatDate(essay.createdAt)}` 
                      : `Cập nhật: ${formatDate(essay.updatedAt)}`}
                  </span>
                  <Link to={`/essays/${essay.id}`} className="btn-view">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Essay;
