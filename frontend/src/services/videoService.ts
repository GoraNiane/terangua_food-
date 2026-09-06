export interface VideoEmbedInfo {
  type: 'youtube' | 'vimeo' | 'direct';
  embedUrl: string;
}

/**
 * Parses a video URL to detect if it's YouTube, Vimeo or direct video link (MP4, WebM, Cloudinary, etc.)
 */
export function parseVideoUrl(url?: string): VideoEmbedInfo | null {
  if (!url || !url.trim()) return null;
  const cleanUrl = url.trim();

  // YouTube match: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID
  const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}&controls=1&rel=0`,
    };
  }

  // Vimeo match: vimeo.com/ID
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1&muted=1&loop=1`,
    };
  }

  // Direct video file or CDN URL (MP4, WebM, Cloudinary, S3, etc.)
  return {
    type: 'direct',
    embedUrl: cleanUrl,
  };
}
