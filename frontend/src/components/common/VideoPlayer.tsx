import React, { useState } from 'react';
import { Video, AlertCircle } from 'lucide-react';
import { parseVideoUrl } from '../../services/videoService';

interface VideoPlayerProps {
  url?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title = 'Vidéo du plat',
  className = 'w-full h-full object-cover',
  autoPlay = true,
  muted = true,
  loop = true,
  controls = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const parsed = parseVideoUrl(url);

  if (!url || !parsed) {
    return (
      <div className={`flex flex-col items-center justify-center bg-zinc-900 text-zinc-400 p-6 text-center ${className}`}>
        <Video className="w-10 h-10 mb-2 opacity-50" />
        <span className="text-xs">Aucune vidéo disponible</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-zinc-900 text-red-400 p-6 text-center ${className}`}>
        <AlertCircle className="w-8 h-8 mb-2 opacity-75" />
        <span className="text-xs">Impossible de lire cette vidéo</span>
      </div>
    );
  }

  if (parsed.type === 'youtube' || parsed.type === 'vimeo') {
    return (
      <iframe
        src={parsed.embedUrl}
        title={title}
        className={`border-0 w-full h-full ${className}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <video
      src={parsed.embedUrl}
      className={className}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      controls={controls}
      playsInline
      onError={() => setHasError(true)}
    >
      Votre navigateur ne supporte pas la lecture de cette vidéo.
    </video>
  );
};
