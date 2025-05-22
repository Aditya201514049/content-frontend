// src/components/posts/PostDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import BackButton from '../common/BackButton';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        console.log(`Fetching post with ID: ${id}`);
        const response = await api.get(`/posts/${id}`);
        console.log('Post data received:', response.data);
        setPost(response.data);
      } catch (err) {
        setError('Failed to load post');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await api.delete(`/posts/${id}`);
      navigate('/');
    } catch (err) {
      setError('Failed to delete post');
      console.error(err);
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isAuthor = currentUser?._id === post?.author?._id;
  const canEdit = isAuthor;
  const canDelete = isAdmin || isAuthor;

  if (loading) return <div className="text-center py-8">Loading post...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
  if (!post) return <div className="text-center py-8">Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <BackButton to="/" label="Back to Posts" />
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold dark:text-white">{post.title}</h1>
          
          <div className="space-x-2">
            {canEdit && (
              <Link 
                to={`/edit-post/${post._id}`}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </Link>
            )}
            {canDelete && (
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-600 text-black dark:text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          By {post.author?.name || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          {post.content}
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Comments</h2>
        
        {currentUser ? (
          <CommentForm postId={post._id} onCommentAdded={(newComment) => {
            // If user info is missing, make a fresh API call to get the updated post
            if (!newComment.user?.name) {
              // Refresh the entire post data to get updated comments with user info
              const refreshPostData = async () => {
                try {
                  const response = await api.get(`/posts/${post._id}`);
                  setPost(response.data);
                } catch (err) {
                  console.error('Failed to refresh post after comment added', err);
                  // Fall back to just adding the comment without user info
                  setPost({
                    ...post,
                    comments: [...(post.comments || []), newComment]
                  });
                }
              };
              
              refreshPostData();
            } else {
              // We have complete user info, just update the post state
              setPost({
                ...post,
                comments: [...(post.comments || []), newComment]
              });
            }
          }} />
        ) : (
          <p className="text-gray-500 mb-6">
            <Link to="/login" className="text-blue-600 hover:underline">Log in</Link> to add a comment
          </p>
        )}
        
        <CommentList 
          postId={post._id} 
          comments={post.comments || []} 
          postAuthorId={post.author?._id}
          onCommentDeleted={(commentId) => {
            setPost({
              ...post,
              comments: post.comments.filter(c => c._id !== commentId)
            });
          }}
        />
      </div>
    </div>
  );
};

export default PostDetail;