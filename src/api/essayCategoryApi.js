import { database } from '../firebase';
import { ref, push, set, get, update, remove } from 'firebase/database';

const ESSAY_CATEGORIES_REF = 'essayCategories';

const essayCategoryApi = {
  // Get all categories
  async getAllCategories() {
    try {
      const snapshot = await get(ref(database, ESSAY_CATEGORIES_REF));
      if (snapshot.exists()) {
        const categories = [];
        snapshot.forEach((childSnapshot) => {
          categories.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return categories;
      }
      return [];
    } catch (error) {
      console.error('Error fetching essay categories:', error);
      throw error;
    }
  },

  // Get a single category by ID
  async getCategoryById(id) {
    try {
      const categoryRef = ref(database, `${ESSAY_CATEGORIES_REF}/${id}`);
      const snapshot = await get(categoryRef);
      
      if (snapshot.exists()) {
        return { id, ...snapshot.val() };
      }
      
      throw new Error('Category not found');
    } catch (error) {
      console.error(`Error in getCategoryById:`, error);
      throw error;
    }
  },

  // Create a new category
  async createCategory(categoryData) {
    try {
      const newCategoryRef = push(ref(database, ESSAY_CATEGORIES_REF));
      await set(newCategoryRef, {
        ...categoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: newCategoryRef.key, ...categoryData };
    } catch (error) {
      console.error('Error creating essay category:', error);
      throw error;
    }
  },

  // Update an existing category
  async updateCategory(id, categoryData) {
    try {
      const categoryRef = ref(database, `${ESSAY_CATEGORIES_REF}/${id}`);
      await update(categoryRef, {
        ...categoryData,
        updatedAt: new Date().toISOString()
      });
      return { id, ...categoryData };
    } catch (error) {
      console.error(`Error updating essay category with id ${id}:`, error);
      throw error;
    }
  },

  // Delete a category
  async deleteCategory(id) {
    try {
      const categoryRef = ref(database, `${ESSAY_CATEGORIES_REF}/${id}`);
      await remove(categoryRef);
      return true;
    } catch (error) {
      console.error(`Error deleting essay category with id ${id}:`, error);
      throw error;
    }
  },

  // Get essays by category
  async getEssaysByCategory(categoryId) {
    try {
      const essaysRef = ref(database, 'essays');
      const snapshot = await get(essaysRef);
      
      if (snapshot.exists()) {
        const essays = [];
        snapshot.forEach((childSnapshot) => {
          const essay = {
            id: childSnapshot.key,
            ...childSnapshot.val()
          };
          if (essay.categoryId === categoryId) {
            essays.push(essay);
          }
        });
        return essays;
      }
      return [];
    } catch (error) {
      console.error('Error fetching essays by category:', error);
      throw error;
    }
  }
};

export default essayCategoryApi;
