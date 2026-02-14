import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaGraduationCap, FaPlus } from 'react-icons/fa';

// Inline styles
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    color: '#2d3748',
    marginBottom: '2rem',
    fontSize: '2rem',
    fontWeight: '600',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
    textDecoration: 'none',
    color: 'inherit',
  },
  statCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
  statIcon: {
    background: '#f0f9ff',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '1rem',
    color: '#0ea5e9',
    fontSize: '1.5rem',
  },
  statInfo: {
    margin: 0,
  },
  statTitle: {
    margin: 0,
    fontSize: '1rem',
    color: '#4a5568',
    fontWeight: '500',
  },
  statValue: {
    margin: '0.25rem 0 0',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1a202c',
  },
  recentActivity: {
    background: 'white',
    borderRadius: '10px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  recentActivityTitle: {
    marginTop: 0,
    marginBottom: '1.5rem',
    color: '#2d3748',
    fontSize: '1.5rem',
  },
  activityEmpty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#718096',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #cbd5e0',
  },
};

const DashboardNew = () => {
  const [hoveredCard, setHoveredCard] = React.useState(null);
  
  const stats = [
    { title: 'Tổng số từ', value: 0, icon: <FaBook />, link: '/list' },
    { title: 'Học từ mới', value: 0, icon: <FaPlus />, link: '/add' },
    { title: 'Luyện tập', value: 0, icon: <FaGraduationCap />, link: '/luyen-tap' },
    { title: 'Kiểm tra', value: 0, icon: <FaGraduationCap />, link: '/quiz' },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>
      
      <div style={styles.stats}>
        {stats.map((stat, index) => (
          <Link 
            to={stat.link} 
            key={index} 
            style={{
              ...styles.statCard,
              ...(hoveredCard === index ? styles.statCardHover : {})
            }}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.statIcon}>
              {stat.icon}
            </div>
            <div style={styles.statInfo}>
              <h3 style={styles.statTitle}>{stat.title}</h3>
              <p style={styles.statValue}>{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={styles.recentActivity}>
        <h2 style={styles.recentActivityTitle}>Hoạt động gần đây</h2>
        <div style={styles.activityEmpty}>
          <p>Chưa có hoạt động nào gần đây</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardNew;
