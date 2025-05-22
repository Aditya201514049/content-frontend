// src/components/posts/CreatePostForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../common/BackButton';
import Layout from '../layout/Layout';

const CreatePostForm = () => {
  const { id } = useParams(); // Will be undefined for new posts
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingPost, setLoadingPost] = useState(isEditMode);

  // Check if user has permission to create/edit posts
  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'author')) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Fetch post data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchPost = async () => {
        try {
          const response = await api.get(`/posts/${id}`);
          const post = response.data;
          
          // Only post author can edit their own post
          if (post.author._id !== currentUser._id) {
            console.log('User does not have permission to edit this post');
            navigate('/');
            return;
          }
          
          setFormData({
            title: post.title,
            content: post.content
          });
          setLoadingPost(false);
        } catch (err) {
          setError('Failed to load post');
          console.error(err);
          setLoadingPost(false);
        }
      };
      
      fetchPost();
    }
  }, [id, isEditMode, currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEditMode) {
        await api.put(`/posts/${id}`, formData);
      } else {
        await api.post('/posts', formData);
      }
      
      navigate('/');
    } catch (err) {
      setError('Failed to save post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPost) {
    return (
      <Layout>
        <div className="text-center py-8">Loading post...</div>
      </Layout>
    );
  }

  const formContent = (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <BackButton label="Back" />
      </div>
      
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {isEditMode ? 'Edit Post' : 'Create New Post'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Enter post title"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2" htmlFor="content">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            rows="10"
            placeholder="Write your post content here..."
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded ${
              loading 
                ? 'bg-gray-400 dark:bg-gray-500 text-gray-800 dark:text-white cursor-not-allowed' 
                : 'bg-gray-600 dark:bg-gray-600 text-black dark:text-white hover:bg-gray-700 dark:hover:bg-gray-700'
            }`}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );

  return <Layout>{formContent}</Layout>;
};

export default CreatePostForm;