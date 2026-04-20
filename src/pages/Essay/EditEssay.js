import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  
  // Refs for debouncing
  const saveTimeoutRef = useRef(null);
  const previousEssayRef = useRef({ title: '', content: '' });

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

  // Auto-save function
  const autoSaveEssay = useCallback(async () => {
    console.log('Auto-save triggered');
    console.log('Current essay:', essay);
    console.log('Previous essay:', previousEssayRef.current);
    
    if (!essay.title.trim() || !essay.content.trim()) {
      console.log('Empty content, not saving');
      return;
    }

    // Don't save if content hasn't changed
    if (previousEssayRef.current.title === essay.title && 
        previousEssayRef.current.content === essay.content) {
      console.log('No changes detected, not saving');
      return;
    }

    console.log('Changes detected, saving...');
    try {
      setIsAutoSaving(true);
      await essayApi.updateEssay(essay.id, {
        title: essay.title.trim(),
        content: essay.content.trim(),
        updatedAt: new Date().toISOString()
      });
      
      // Update previous essay ref
      previousEssayRef.current = {
        title: essay.title,
        content: essay.content
      };
      
      setLastSavedAt(new Date());
      
      // Show subtle auto-save notification
      toast.success('Tài nguyên telah disimpan secara otomatis', {
        position: 'bottom-right',
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        closeButton: false,
        style: {
          background: 'rgba(40, 167, 69, 0.9)',
          fontSize: '0.85rem',
          padding: '8px 12px',
          borderRadius: '4px'
        }
      });
      
      console.log('Auto-save successful');
    } catch (error) {
      console.error('Auto-save error:', error);
      // Don't show error toast for auto-save to avoid annoying user
    } finally {
      setIsAutoSaving(false);
    }
  }, [essay]);

  // Debounced auto-save effect
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (immediate save)
    if (essay.title.trim() || essay.content.trim()) {
      saveTimeoutRef.current = setTimeout(() => {
        autoSaveEssay();
      }, 0);
    }

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [essay.title, essay.content, autoSaveEssay]);

  // Initialize previous essay ref when essay loads (only once)
  useEffect(() => {
    if (!isLoading && essay.id) {
      previousEssayRef.current = {
        title: essay.title,
        content: essay.content
      };
      console.log('Previous essay ref initialized:', previousEssayRef.current);
    }
  }, [isLoading, essay.id, essay.title, essay.content]);

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
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: true
    }
  };

  // Simple handler to reset cursor format when user selects new formatting
  const handleSelectionChange = () => {
    // This will be called when user clicks in the editor
    // We'll use this to ensure the toolbar selection is respected
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

    // Clear any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
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
      <div className="essay-header-with-status">
        <h1>Chỉnh sửa bài luận</h1>
        <div className="auto-save-status">
          {isAutoSaving && (
            <span className="auto-saving">
              <FaSpinner className="spinner" /> Đang tự động lưu...
            </span>
          )}
          {lastSavedAt && !isAutoSaving && (
            <span className="last-saved">
              Đã lưu lúc: {lastSavedAt.toLocaleTimeString('vi-VN')}
            </span>
          )}
        </div>
      </div>
      
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
              onSelectionChange={handleSelectionChange}
              modules={modules}
              formats={formats}
              placeholder="Nh?p n?i dung bài lu?n..."
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
