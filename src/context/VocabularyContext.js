import React, { createContext, useState, useContext, useEffect } from 'react';
import { ref, onValue, off, remove, query, orderByChild } from 'firebase/database';
import { database } from '../firebase';
const VocabularyContext = createContext();

export const VocabularyProvider = ({ children }) => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch words from Firebase on component mount
  useEffect(() => {
    const wordsRef = query(ref(database, 'words'), orderByChild('createdAt'));
    
    const handleData = (snapshot) => {
      const wordsData = [];
      snapshot.forEach((childSnapshot) => {
        wordsData.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      setWords(wordsData);
      setLoading(false);
    };

    const handleError = (error) => {
      console.error('Error fetching words:', error);
      setError('Không thể tải dữ liệu từ máy chủ');
      setLoading(false);
    };

    // Set up the listener
    onValue(wordsRef, handleData, handleError);

    // Clean up the listener on unmount
    return () => {
      off(wordsRef, 'value', handleData);
    };
  }, []);

  const addWord = (newWord) => {
    // The actual saving to Firebase is now handled in the AddWord component
    // This is kept for backward compatibility with other components
    return newWord;
  };

  const deleteWord = async (id) => {
    try {
      await remove(ref(database, `words/${id}`));
      return true;
    } catch (error) {
      console.error('Error deleting word:', error);
      throw new Error('Không thể xóa từ. Vui lòng thử lại.');
    }
  };

  const getRandomWords = (count = 10) => {
    if (words.length <= count) return [...words];
    
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  return (
    <VocabularyContext.Provider value={{ 
      words, 
      addWord, 
      deleteWord, 
      getRandomWords,
      loading,
      error
    }}>
      {children}
    </VocabularyContext.Provider>
  );
};

export const useVocabulary = () => {
  const context = useContext(VocabularyContext);
  if (!context) {
    throw new Error('useVocabulary must be used within a VocabularyProvider');
  }
  return context;
};
