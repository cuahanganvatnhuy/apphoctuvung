import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSpinner, FaSave, FaTimes } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import essayApi from '../../api/essayApi';
import './EssayDetail.css';
import './RichTextEditor.css';

const EditEssay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [essay, setEssay] = useState({
    title: '',
    content: '',
    id: null,
    createdAt: '',
    updatedAt: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEssay = async () => {
      try {
        setIsLoading(true);
        const essayData = await essayApi.getEssayById(id);
        if (essayData) {
          setEssay(essayData);
        } else {
          toast.error('Không tìm thấy bài luận');
          navigate('/essays');
        }
      } catch (error) {
        console.error('Error fetching essay:', error);
        toast.error('Có lỗi xảy ra khi tải bài luận');
        navigate('/essays');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEssay();
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEssay(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (value) => {
    setEssay(prev => ({
      ...prev,
      content: value
    }));
  };

  // Configure Quill editor modules
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'script', 'align', 'direction',
    'color', 'background', 'font', 'link', 'image', 'video', 'code-block'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!essay.title.trim() || !essay.content.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung bài luận');
      return;
    }

    try {
      setIsSubmitting(true);
      await essayApi.updateEssay(essay.id, {
        title: essay.title.trim(),
        content: essay.content.trim(),
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Cập nhật bài luận thành công');
      navigate(`/essays/${essay.id}`);
    } catch (error) {
      console.error('Error updating essay:', error);
      toast.error('Có lỗi xảy ra khi cập nhật bài luận');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải bài luận...</p>
      </div>
    );
  }

  return (
    <div className="essay-detail-container">
      <h1>Chỉnh sửa bài luận</h1>
      
      <form onSubmit={handleSubmit} className="essay-edit-form">
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
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Nội dung:</label>
          <div className="rich-text-editor">
            <ReactQuill
              theme="snow"
              value={essay.content}
              onChange={handleContentChange}
              modules={modules}
              formats={formats}
              placeholder="Nhập nội dung bài luận..."
              style={{ minHeight: '300px' }}
              readOnly={isSubmitting}
            />
          </div>
        </div>
        
        <div className="essay-actions-bottom">
          <button 
            type="button" 
            className="btn-back"
            onClick={() => navigate(`/essays/${essay.id}`)}
            disabled={isSubmitting}
          >
            <FaTimes /> Hủy bỏ
          </button>
          <button 
            type="submit" 
            className="btn-edit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="spinner" /> Đang lưu...
              </>
            ) : (
              <>
                <FaSave /> Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEssay;
