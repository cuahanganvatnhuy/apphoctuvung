import { database } from '../firebase';
import { ref, push, set, get, update, remove } from 'firebase/database';

const ESSAYS_REF = 'essays';

const essayApi = {
  // Get all essays
  async getAllEssays() {
    try {
      const snapshot = await get(ref(database, ESSAYS_REF));
      if (snapshot.exists()) {
        // Convert the object of essays to an array with IDs
        const essays = [];
        snapshot.forEach((childSnapshot) => {
          essays.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return essays;
      }
      return [];
    } catch (error) {
      console.error('Error fetching essays:', error);
      throw error;
    }
  },

  // Get a single essay by ID
  async getEssayById(id) {
    try {
      console.log(`[essayApi] Getting essay with ID: ${id}`);
      const essayRef = ref(database, `${ESSAYS_REF}/${id}`);
      console.log(`[essayApi] Firebase ref path: ${essayRef.toString()}`);
      
      const snapshot = await get(essayRef);
      console.log(`[essayApi] Snapshot exists: ${snapshot.exists()}`);
      
      if (snapshot.exists()) {
        const essayData = { id, ...snapshot.val() };
        console.log(`[essayApi] Retrieved essay data:`, essayData);
        return essayData;
      }
      
      console.log(`[essayApi] No essay found with ID: ${id}`);
      throw new Error('Essay not found');
    } catch (error) {
      console.error(`[essayApi] Error in getEssayById:`, error);
      throw error;
    }
  },

  // Create a new essay
  async createEssay(essayData) {
    try {
      const newEssayRef = push(ref(database, ESSAYS_REF));
      await set(newEssayRef, essayData);
      return { id: newEssayRef.key, ...essayData };
    } catch (error) {
      console.error('Error creating essay:', error);
      throw error;
    }
  },

  // Update an existing essay
  async updateEssay(id, essayData) {
    try {
      const essayRef = ref(database, `${ESSAYS_REF}/${id}`);
      await update(essayRef, {
        ...essayData,
        updatedAt: new Date().toISOString()
      });
      return { id, ...essayData };
    } catch (error) {
      console.error(`Error updating essay with id ${id}:`, error);
      throw error;
    }
  },

  // Delete an essay
  async deleteEssay(id) {
    try {
      const essayRef = ref(database, `${ESSAYS_REF}/${id}`);
      await remove(essayRef);
      return true;
    } catch (error) {
      console.error(`Error deleting essay with id ${id}:`, error);
      throw error;
    }
  },
};

export default essayApi;
