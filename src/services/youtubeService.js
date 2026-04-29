const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const CACHE_KEY = 'yt_channel_videos_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Get the uploads playlist ID from a channel ID.
 * YouTube convention: replace "UC" prefix with "UU".
 */
const getUploadsPlaylistId = (channelId) => {
  if (channelId.startsWith('UC')) {
    return 'UU' + channelId.slice(2);
  }
  return channelId;
};

/**
 * Format ISO 8601 duration (PT1H2M3S) to human-readable string.
 */
const formatDuration = (isoDuration) => {
  if (!isoDuration) return 'N/A';
  
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 'N/A';

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes} min`;
  }
  return `${seconds} sec`;
};

/**
 * Check if cached data is still valid.
 */
const getCachedData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
    // Cache expired
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

/**
 * Save data to localStorage cache.
 */
const setCachedData = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (e) {
    console.warn('Failed to cache YouTube data:', e);
  }
};

/**
 * Fetch all videos from a YouTube channel's uploads playlist.
 * Uses playlistItems.list (1 quota unit per request) + videos.list for durations.
 */
export const fetchChannelVideos = async () => {
  // Check cache first
  const cached = getCachedData();
  if (cached) {
    console.log('[YouTubeService] Returning cached data');
    return cached;
  }

  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

  if (!API_KEY || API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
    throw new Error(
      'YouTube API key is not configured. Please add VITE_YOUTUBE_API_KEY to your .env.local file.'
    );
  }

  if (!CHANNEL_ID) {
    throw new Error(
      'YouTube Channel ID is not configured. Please add VITE_YOUTUBE_CHANNEL_ID to your .env.local file.'
    );
  }

  const uploadsPlaylistId = getUploadsPlaylistId(CHANNEL_ID);
  const allItems = [];
  let nextPageToken = '';

  // Step 1: Fetch all playlist items (paginated, 50 per page)
  do {
    const url = new URL(`${YOUTUBE_API_BASE}/playlistItems`);
    url.searchParams.set('part', 'snippet,contentDetails');
    url.searchParams.set('playlistId', uploadsPlaylistId);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', API_KEY);
    if (nextPageToken) {
      url.searchParams.set('pageToken', nextPageToken);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || response.statusText;
      throw new Error(`YouTube API error: ${errorMessage}`);
    }

    const data = await response.json();
    allItems.push(...(data.items || []));
    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  if (allItems.length === 0) {
    setCachedData([]);
    return [];
  }

  // Step 2: Fetch video details (duration, etc.) in batches of 50
  const videoIds = allItems
    .map((item) => item.contentDetails?.videoId)
    .filter(Boolean);

  const videoDetailsMap = {};

  for (let i = 0; i < videoIds.length; i += 50) {
    const batchIds = videoIds.slice(i, i + 50).join(',');
    const url = new URL(`${YOUTUBE_API_BASE}/videos`);
    url.searchParams.set('part', 'contentDetails');
    url.searchParams.set('id', batchIds);
    url.searchParams.set('key', API_KEY);

    const response = await fetch(url.toString());
    if (response.ok) {
      const data = await response.json();
      (data.items || []).forEach((item) => {
        videoDetailsMap[item.id] = item.contentDetails;
      });
    }
  }

  // Step 3: Transform into the lecture data format
  const lectures = allItems
    .filter((item) => {
      // Filter out deleted/private videos
      const snippet = item.snippet;
      return snippet && snippet.title !== 'Private video' && snippet.title !== 'Deleted video';
    })
    .map((item) => {
      const snippet = item.snippet;
      const videoId = item.contentDetails?.videoId;
      const videoDetails = videoDetailsMap[videoId] || {};

      return {
        id: videoId,
        youtubeId: videoId,
        title: snippet.title,
        subject: extractSubject(snippet.title, snippet.description),
        duration: formatDuration(videoDetails.duration),
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail:
          snippet.thumbnails?.maxres?.url ||
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        publishedAt: snippet.publishedAt,
        description: snippet.description || '',
      };
    });

  // Sort by published date (newest first)
  lectures.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  setCachedData(lectures);
  console.log(`[YouTubeService] Fetched ${lectures.length} videos from channel`);
  return lectures;
};

/**
 * Try to extract a subject/category from the video title or description.
 * Falls back to "General" if nothing is found.
 */
const extractSubject = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();

  const subjectKeywords = {
    'Mathematics': ['math', 'गणित', 'algebra', 'geometry', 'arithmetic', 'calculation'],
    'Science': ['science', 'विज्ञान', 'experiment', 'physics', 'chemistry', 'biology'],
    'Marathi': ['marathi', 'मराठी', 'marathi language'],
    'Hindi': ['hindi', 'हिंदी', 'hindi language'],
    'English': ['english', 'इंग्रजी', 'english language', 'grammar'],
    'Social Studies': ['social', 'history', 'geography', 'इतिहास', 'भूगोल', 'सामाजिक'],
    'EVS': ['evs', 'environment', 'पर्यावरण'],
    'Computer Science': ['computer', 'coding', 'programming', 'संगणक'],
    'Drawing': ['drawing', 'art', 'कला', 'चित्रकला'],
    'Physical Education': ['sports', 'exercise', 'yoga', 'शारीरिक', 'खेल'],
  };

  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return subject;
    }
  }

  return 'General';
};

/**
 * Clear the cached YouTube data (useful for manual refresh).
 */
export const clearYouTubeCache = () => {
  localStorage.removeItem(CACHE_KEY);
};
