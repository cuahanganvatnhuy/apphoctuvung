import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import essayApi from '../../api/essayApi';
import essayCategoryApi from '../../api/essayCategoryApi';
import './Essay.css';
import './RichTextEditor.css';

const AddEssay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [essay, setEssay] = useState({
    title: '',
    content: '',
    categoryId: location.state?.categoryId || ''
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await essayCategoryApi.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Không thể tải danh sách danh mục');
      }
    };

    fetchCategories();
  }, []);

  // Update categoryId when location state changes
  useEffect(() => {
    if (location.state?.categoryId) {
      setEssay(prev => ({
        ...prev,
        categoryId: location.state.categoryId
      }));
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEssay({
      ...essay,
      [name]: value
    });
  };

  const handleContentChange = (value) => {
    setEssay({
      ...essay,
      content: value
    });
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
    
    try {
      if (!essay.title.trim() || !essay.content.trim()) {
        toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung bài luận');
        return;
      }

      if (!essay.categoryId) {
        toast.error('Vui lòng chọn danh mục cho bài luận');
        return;
      }

      setIsLoading(true);

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
    } finally {
      setIsLoading(false);
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
            <label htmlFor="categoryId">Danh mục:</label>
            <select
              id="categoryId"
              name="categoryId"
              value={essay.categoryId}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-muted small mt-2">
                Chưa có danh mục nào. 
                <button 
                  type="button" 
                  className="btn btn-link p-0 ml-1"
                  onClick={() => navigate('/essay-categories')}
                >
                  Tạo danh mục mới
                </button>
              </p>
            )}
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
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Lưu bài luận'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/essays')}
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

export default AddEssay;
