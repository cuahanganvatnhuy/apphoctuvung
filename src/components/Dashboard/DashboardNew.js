import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaGraduationCap, FaPlus, FaCheck, FaClock, FaPause } from 'react-icons/fa';
import { useVocabulary } from '../../context/VocabularyContext';

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
  activityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid #edf2f7',
    gap: '1rem',
  },
  itemNumber: {
    color: '#718096',
    minWidth: '24px',
    textAlign: 'center',
    fontWeight: '600',
  },
  activityWord: {
    display: 'flex',
    flexDirection: 'column',
  },
  activityMeaning: {
    fontSize: '0.875rem',
    color: '#718096',
    marginTop: '0.25rem',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statusActive: {
    backgroundColor: '#ebf8ff',
    color: '#3182ce',
  },
  statusPaused: {
    backgroundColor: '#fffaf0',
    color: '#dd6b20',
  },
  statusLearned: {
    backgroundColor: '#f0fff4',
    color: '#38a169',
  },
};

const DashboardNew = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [stats, setStats] = useState([
    { title: 'Tổng số từ', value: 0, icon: <FaBook />, link: '/list' },
    { title: 'Đang học', value: 0, icon: <FaClock />, link: '/list?status=active' },
    { title: 'Tạm dừng', value: 0, icon: <FaPause />, link: '/list?status=paused' },
    { title: 'Đã học', value: 0, icon: <FaCheck />, link: '/list?status=learned' },
  ]);
  
  const { words } = useVocabulary();
  
  useEffect(() => {
    if (words) {
      const totalWords = words.length;
      const activeWords = words.filter(word => word.status === 'active').length;
      const pausedWords = words.filter(word => word.status === 'paused').length;
      const learnedWords = words.filter(word => word.status === 'learned').length;
      
      setStats([
        { ...stats[0], value: totalWords },
        { ...stats[1], value: activeWords },
        { ...stats[2], value: pausedWords },
        { ...stats[3], value: learnedWords },
      ]);
    }
  }, [words]);
  
  // Get the 10 most recent words, sorted by creation date (newest first)
  const recentWords = words ? words
    .slice() // Create a copy of the array to avoid mutating the original
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Sort in descending order (newest first)
    })
    .slice(0, 10) // Take only the first 10 items
    : [];

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
        <h2 style={styles.recentActivityTitle}>Từ vựng gần đây</h2>
        {recentWords.length > 0 ? (
          <div>
            {recentWords.map((word, index) => (
              <div key={index} style={styles.activityItem}>
                <span style={styles.itemNumber}>{index + 1}.</span>
                <div style={{...styles.activityWord, flex: 1}}>
                  <strong>{word.word}</strong>
                  <span style={styles.activityMeaning}>{word.meaning}</span>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  ...(word.status === 'active' ? styles.statusActive : 
                      word.status === 'paused' ? styles.statusPaused : styles.statusLearned)
                }}>
                  {word.status === 'active' ? 'Đang học' : 
                   word.status === 'paused' ? 'Tạm dừng' : 'Đã học'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.activityEmpty}>
            <p>Chưa có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardNew;
