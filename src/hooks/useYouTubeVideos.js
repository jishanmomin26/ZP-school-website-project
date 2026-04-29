import { useState, useEffect, useCallback } from 'react';
import { fetchChannelVideos, clearYouTubeCache } from '../services/youtubeService';

/**
 * Custom hook to fetch YouTube channel videos.
 * Returns { videos, loading, error, refetch }.
 */
const useYouTubeVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChannelVideos();
      setVideos(data);
    } catch (err) {
      console.error('[useYouTubeVideos] Error:', err);
      setError(err.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const refetch = useCallback(() => {
    clearYouTubeCache();
    fetchVideos();
  }, [fetchVideos]);

  return { videos, loading, error, refetch };
};

export default useYouTubeVideos;
