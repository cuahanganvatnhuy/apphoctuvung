import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaFolder, FaChevronRight, FaChevronDown, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import essayApi from '../../api/essayApi';
import essayCategoryApi from '../../api/essayCategoryApi';
import './Essay.css';

const Essay = () => {
  const [essays, setEssays] = useState([]);
  const [categories, setCategories] = useState([]);
  const [essaysByCategory, setEssaysByCategory] = useState({});
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Load categories and essays from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Load categories
        const categoriesData = await essayCategoryApi.getAllCategories();
        setCategories(categoriesData);

        // Load all essays
        const essaysData = await essayApi.getAllEssays();
        setEssays(essaysData);

        // Group essays by category
        const essaysDataByCategory = {};
        essaysData.forEach(essay => {
          if (essay.categoryId) {
            if (!essaysDataByCategory[essay.categoryId]) {
              essaysDataByCategory[essay.categoryId] = [];
            }
            essaysDataByCategory[essay.categoryId].push(essay);
          }
        });
        setEssaysByCategory(essaysDataByCategory);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id, categoryId = null) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài luận này?')) {
      try {
        await essayApi.deleteEssay(id);
        
        // Update essays list
        const updatedEssays = essays.filter(essay => essay.id !== id);
        setEssays(updatedEssays);
        
        // Update essays by category if categoryId is provided
        if (categoryId) {
          setEssaysByCategory(prev => ({
            ...prev,
            [categoryId]: prev[categoryId].filter(essay => essay.id !== id)
          }));
        }
        
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

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Không có danh mục';
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

  // Filter essays based on search term
  const filteredEssays = essays.filter(essay => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = essay.title?.toLowerCase().includes(searchLower);
    const contentMatch = essay.content?.toLowerCase().includes(searchLower);
    
    return titleMatch || contentMatch;
  });

  // Filter essays by category for tree view
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
        <p>Đang tải danh sách bài luận...</p>
      </div>
    );
  }

  return (
    <div className="essay-container">
      <div className="essay-header">
        <h1>Quản lý Bài Luận</h1>
        <div className="header-actions">
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
          <button 
            onClick={() => navigate('/essay-categories')} 
            className="btn btn-info"
          >
            <FaFolder /> Quản lý danh mục
          </button>
          <button onClick={handleAddNew} className="btn btn-primary">
            <FaPlus /> Thêm bài luận mới
          </button>
        </div>
      </div>
      
      <div className="view-toggle">
        <button 
          className={`btn ${viewMode === 'tree' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('tree')}
        >
          <FaFolder /> Dạng cây
        </button>
        <button 
          className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('list')}
        >
          <FaPlus /> Danh sách
        </button>
      </div>
      
      <div className="essays-content">
        {viewMode === 'tree' ? (
          <div className="tree-view">
            <h2>Danh mục và bài luận</h2>
            {categories.length === 0 && filteredEssays.filter(e => !e.categoryId).length === 0 ? (
              <div className="no-data-container">
                <p>Chưa có danh mục hay bài luận nào.</p>
                <div className="action-buttons">
                  <button onClick={() => navigate('/essay-categories')} className="btn btn-info">
                    <FaFolder /> Thêm danh mục
                  </button>
                  <button onClick={handleAddNew} className="btn btn-primary">
                    <FaPlus /> Thêm bài luận
                  </button>
                </div>
              </div>
            ) : (
              <div className="category-tree">
                {/* Hiển thị các danh mục */}
                {categories.map(category => {
                  const categoryEssays = filteredEssaysByCategory[category.id] || [];
                  const isExpanded = expandedCategories.has(category.id);
                  
                  // Skip category if no essays match search and there's a search term
                  if (searchTerm.trim() && categoryEssays.length === 0) {
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
                            <span className="essay-count">{categoryEssays.length} bài luận</span>
                          </div>
                        </div>
                        <div className="category-actions">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/essays/add', { state: { categoryId: category.id } });
                            }}
                            className="btn btn-sm btn-primary"
                            title="Thêm bài luận vào danh mục"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="category-content">
                          {categoryEssays.length === 0 ? (
                            <div className="no-essays-in-category">
                              <p>Chưa có bài luận nào trong danh mục này.</p>
                            </div>
                          ) : (
                            <div className="essays-in-category">
                              {categoryEssays.map(essay => (
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
                                      onClick={() => handleDelete(essay.id, category.id)}
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
                          <span className="essay-count">{categoryEssays.length} bài luận</span>
                        </div>
                      </div>
                      <div className="category-actions">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/essays/add', { state: { categoryId: category.id } });
                          }}
                          className="btn btn-sm btn-primary"
                          title="Thêm bài luận vào danh mục"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="category-content">
                        {categoryEssays.length === 0 ? (
                          <div className="no-essays-in-category">
                            <p>Chưa có bài luận nào trong danh mục này.</p>
                          </div>
                        ) : (
                          <div className="essays-in-category">
                            {categoryEssays.map(essay => (
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
                                    onClick={() => handleDelete(essay.id, category.id)}
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
              
              {/* Hiển thị các bài luận không có danh mục */}
              {filteredEssays.filter(essay => !essay.categoryId).length > 0 && (
                <div className="category-node">
                  <div 
                    className="category-header"
                    onClick={() => toggleCategory('no-category')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div className="category-info">
                      <div className="expand-icon">
                        {expandedCategories.has('no-category') ? <FaChevronDown /> : <FaChevronRight />}
                      </div>
                      <FaFolder />
                      <div className="category-details">
                        <h3>Không có danh mục</h3>
                        <span className="essay-count">{filteredEssays.filter(essay => !essay.categoryId).length} bài luận</span>
                      </div>
                    </div>
                  </div>
                  {expandedCategories.has('no-category') && (
                    <div className="category-content">
                      <div className="essays-in-category">
                        {filteredEssays.filter(essay => !essay.categoryId).map(essay => (
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
                                onClick={() => handleDelete(essay.id)}
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
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="list-view">
          <h2>Danh sách bài luận</h2>
          {filteredEssays.length === 0 ? (
            <div className="no-essays-container">
              <p className="no-essays">Chưa có bài luận nào.</p>
              <button onClick={handleAddNew} className="btn btn-primary">
                <FaPlus /> Thêm bài luận mới
              </button>
            </div>
          ) : (
            <div className="essay-cards">
              {filteredEssays.map(essay => (
                <div key={essay.id} className="essay-card">
                  <div className="essay-card-header">
                    <h3>{essay.title}</h3>
                    <span className="essay-category">
                      {getCategoryName(essay.categoryId)}
                    </span>
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
      )}
      </div>
    </div>
  );
};

export default Essay;
