import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import essayApi from '../../api/essayApi';
import './EssayDetail.css';

const EssayDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [essay, setEssay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Fetching essay with ID:', id);
    const fetchEssay = async () => {
      try {
        setIsLoading(true);
        console.log('Calling essayApi.getEssayById with ID:', id);
        const essayData = await essayApi.getEssayById(id);
        console.log('Received essay data:', essayData);
        
        if (essayData) {
          console.log('Setting essay data to state');
          setEssay(essayData);
        } else {
          console.log('No essay data found');
          toast.error('Không tìm thấy bài luận');
          navigate('/essays');
        }
      } catch (error) {
        console.error('Error fetching essay:', error);
        toast.error('Có lỗi xảy ra khi tải bài luận: ' + error.message);
        navigate('/essays');
      } finally {
        console.log('Finished loading, setting isLoading to false');
        setIsLoading(false);
      }
    };

    fetchEssay();
  }, [id, navigate]);
  
  console.log('Current essay state:', essay);
  console.log('Is loading:', isLoading);

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài luận này?')) {
      try {
        await essayApi.deleteEssay(id);
        toast.success('Đã xóa bài luận thành công');
        navigate('/essays');
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

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Đang tải bài luận...</p>
      </div>
    );
  }

  if (!essay) {
    return (
      <div className="essay-not-found">
        <h2>Không tìm thấy bài luận</h2>
        <p>Bài luận bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/essays" className="btn-back">
          <FaArrowLeft /> Quay lại danh sách bài luận
        </Link>
      </div>
    );
  }

  return (
    <div className="essay-detail-container">
      <Helmet>
        <title>{essay.title} | Bài luận</title>
      </Helmet>
      
      <div className="essay-detail-header">
        <h1>{essay.title}</h1>
        <div className="essay-meta">
          <span className="essay-date">
            {essay.createdAt === essay.updatedAt 
              ? `Đăng lúc: ${formatDate(essay.createdAt)}` 
              : `Cập nhật lần cuối: ${formatDate(essay.updatedAt)}`}
          </span>
        </div>
      </div>
      
      <div className="essay-content">
        {essay.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph || <br />}</p>
        ))}
      </div>
      
      <div className="essay-actions-bottom">
        <Link to="/essays" className="btn-back">
          <FaArrowLeft /> Quay lại danh sách bài luận
        </Link>
        <div className="essay-actions">
          <Link 
            to={`/essays/edit/${essay.id}`} 
            className="btn-edit"
            title="Chỉnh sửa bài luận"
          >
            <FaEdit /> Chỉnh sửa
          </Link>
          <button 
            className="btn-delete"
            title="Xóa bài luận"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
          >
            <FaTrash /> Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default EssayDetail;
