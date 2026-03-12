import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaFolder, FaSpinner, FaArrowLeft, FaChevronRight, FaChevronDown, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import essayCategoryApi from '../../api/essayCategoryApi';
import essayApi from '../../api/essayApi';
import './Essay.css';

const EssayCategories = () => {
  const [categories, setCategories] = useState([]);
  const [essaysByCategory, setEssaysByCategory] = useState({});
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load categories and essays
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Load categories
        const categoriesData = await essayCategoryApi.getAllCategories();
        setCategories(categoriesData);

        // Load essays for each category
        const essaysData = {};
        await Promise.all(
          categoriesData.map(async (category) => {
            const essays = await essayApi.getAllEssays();
            essaysData[category.id] = essays.filter(essay => essay.categoryId === category.id);
          })
        );
        setEssaysByCategory(essaysData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteCategory = async (id) => {
    const essays = essaysByCategory[id] || [];
    
    if (essays.length > 0) {
      toast.error(`Không thể xóa danh mục này vì còn ${essays.length} bài luận trong danh mục`);
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await essayCategoryApi.deleteCategory(id);
        setCategories(categories.filter(cat => cat.id !== id));
        toast.success('Đã xóa danh mục thành công');
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Có lỗi xảy ra khi xóa danh mục');
      }
    }
  };

  const handleDeleteEssay = async (essayId, categoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài luận này?')) {
      try {
        await essayApi.deleteEssay(essayId);
        setEssaysByCategory(prev => ({
          ...prev,
          [categoryId]: prev[categoryId].filter(essay => essay.id !== essayId)
        }));
        toast.success('Đã xóa bài luận thành công');
      } catch (error) {
        console.error('Error deleting essay:', error);
        toast.error('Có lỗi xảy ra khi xóa bài luận');
      }
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
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

  const handleAddCategory = () => {
    navigate('/essay-categories/add');
  };

  const handleAddEssay = () => {
    navigate('/essays/add');
  };

  // Filter essays based on search term
  const getFilteredEssaysByCategory = () => {
    const filtered = {};
    Object.keys(essaysByCategory).forEach(categoryId => {
      const categoryEssays = essaysByCategory[categoryId];
      const filteredCategoryEssays = categoryEssays.filter(essay => {
        if (!searchTerm.trim()) return true;
        
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = essay.title?.toLowerCase().includes(searchLower);
        const contentMatch = essay.content?.toLowerCase().includes(searchLower);
        
        return titleMatch || contentMatch;
      });
      
      if (filteredCategoryEssays.length > 0) {
        filtered[categoryId] = filteredCategoryEssays;
      }
    });
    return filtered;
  };

  const filteredEssaysByCategory = getFilteredEssaysByCategory();

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="essay-container">
      <div className="essay-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/essays')} 
            className="btn btn-secondary"
            title="Quay lại quản lý bài luận"
          >
            <FaArrowLeft /> Quay lại
          </button>
          <h1>Quản lý Danh mục Bài Luận</h1>
        </div>
        <div className="header-right">
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Tìm kiếm bài luận..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <button onClick={handleAddEssay} className="btn btn-primary">
            <FaPlus /> Thêm bài luận
          </button>
          <button onClick={handleAddCategory} className="btn btn-success">
            <FaPlus /> Thêm danh mục
          </button>
        </div>
      </div>
      
      <div className="categories-container">
        <h2>Danh sách danh mục</h2>
        {categories.length === 0 ? (
          <div className="no-categories-container">
            <p className="no-categories">Chưa có danh mục nào.</p>
            <button onClick={handleAddCategory} className="btn btn-success">
              <FaPlus /> Thêm danh mục mới
            </button>
          </div>
        ) : (
          <div className="category-tree">
            {categories.map(category => {
              const essays = filteredEssaysByCategory[category.id] || [];
              const isExpanded = expandedCategories.has(category.id);
              
              // Skip category if no essays match search and there's a search term
              if (searchTerm.trim() && essays.length === 0) {
                return null;
              }
              
              return (
                <div key={category.id} className="category-node">
                  <div 
                    className="category-header"
                    onClick={() => toggleCategory(category.id)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div className="category-info">
                      <div className="expand-icon">
                        {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                      </div>
                      <FaFolder className={isExpanded ? 'expanded' : ''} />
                      <div className="category-details">
                        <h3>{category.name}</h3>
                        <span className="essay-count">{essays.length} bài luận</span>
                      </div>
                    </div>
                    <div className="category-actions">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/essay-categories/edit/${category.id}`);
                        }}
                        className="btn-edit"
                        title="Chỉnh sửa danh mục"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        className="btn-delete"
                        title="Xóa danh mục"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="category-content">
                      {category.description && (
                        <p className="category-description">{category.description}</p>
                      )}
                      
                      {essays.length === 0 ? (
                        <div className="no-essays-in-category">
                          <p>Chưa có bài luận nào trong danh mục này.</p>
                          <button 
                            onClick={() => navigate('/essays/add', { state: { categoryId: category.id } })}
                            className="btn btn-primary"
                          >
                            <FaPlus /> Thêm bài luận vào danh mục
                          </button>
                        </div>
                      ) : (
                        <div className="essays-in-category">
                          {essays.map(essay => (
                            <div key={essay.id} className="essay-item">
                              <div className="essay-info">
                                <h4>{essay.title}</h4>
                                <p className="essay-excerpt">
                                  {essay.content.length > 100 ? `${essay.content.substring(0, 100)}...` : essay.content}
                                </p>
                                <span className="essay-date">
                                  {essay.createdAt === essay.updatedAt 
                                    ? `Tạo lúc: ${formatDate(essay.createdAt)}` 
                                    : `Cập nhật: ${formatDate(essay.updatedAt)}`}
                                </span>
                              </div>
                              <div className="essay-actions">
                                <Link 
                                  to={`/essays/edit/${essay.id}`}
                                  className="btn-edit"
                                  title="Chỉnh sửa"
                                >
                                  <FaEdit />
                                </Link>
                                <button 
                                  onClick={() => handleDeleteEssay(essay.id, category.id)}
                                  className="btn-delete"
                                  title="Xóa"
                                >
                                  <FaTrash />
                                </button>
                                <Link 
                                  to={`/essays/${essay.id}`}
                                  className="btn-view"
                                  title="Xem chi tiết"
                                >
                                  Xem
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EssayCategories;
