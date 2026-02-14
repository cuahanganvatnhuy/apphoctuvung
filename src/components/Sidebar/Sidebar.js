import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaPlus, 
  FaList, 
  FaGraduationCap, 
  FaChevronDown, 
  FaChevronRight,
  FaClipboardCheck,
  FaDumbbell,
  FaEdit
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    { 
      title: 'Trang chủ', 
      icon: <FaHome />, 
      path: '/dashboard',
      items: []
    },
    { 
      title: 'Thêm từ vựng', 
      icon: <FaPlus />, 
      path: '/add',
      items: []
    },
    { 
      title: 'Danh sách từ vựng', 
      icon: <FaList />, 
      path: '/list',
      items: []
    },
    { 
      title: 'Học từ vựng', 
      icon: <FaGraduationCap />, 
      path: '/slider',
      items: []
    },
    { 
      title: 'Kiểm tra', 
      icon: <FaClipboardCheck />, 
      path: '/quiz',
      items: []
    },
    { 
      title: 'Luyện tập', 
      icon: <FaDumbbell />, 
      path: '/luyen-tap',
      items: []
    },
    { 
      title: 'Bài luận', 
      icon: <FaEdit />, 
      path: '/essays/add',
      items: []
    },
    { 
      title: 'Quản lý bài luận', 
      icon: <FaList />, 
      path: '/essays',
      items: []
    }
  ];

  const toggleExpand = (title) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const renderSubmenuItem = (subItem, subIndex) => {
    const isActive = location.pathname === subItem.path;
    
    return (
      <Link 
        key={subIndex} 
        to={subItem.path} 
        className={`submenu-item ${isActive ? 'active' : ''}`}
      >
        <span className="submenu-icon">{subItem.icon}</span>
        <span className="submenu-text">{subItem.title}</span>
      </Link>
    );
  };

  const renderMenuItem = (item, index) => {
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expandedItems[item.title] !== undefined ? 
      expandedItems[item.title] : 
      false;
    const isActive = location.pathname === item.path || 
      (item.items && item.items.some(subItem => location.pathname === subItem.path));

    return (
      <div key={index} className={`menu-item ${isActive ? 'active' : ''}`}>
        <div 
          className="menu-item-header"
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.title);
            } else if (item.path) {
              navigate(item.path);
            }
          }}
        >
          <span className="menu-icon">{item.icon}</span>
          <span className="menu-title">{item.title}</span>
          {hasChildren && (
            <span className="menu-arrow">
              {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
            </span>
          )}
        </div>
        
        {hasChildren && (
          <div className="submenu" style={{ maxHeight: isExpanded ? '500px' : '0' }}>
            {item.items.map((subItem, subIndex) => renderSubmenuItem(subItem, subIndex))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="sidebar">
      <div className="logo" onClick={() => navigate('/')}>
        <h2>Vocabulary</h2>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </nav>
    </div>
  );
};

export default Sidebar;