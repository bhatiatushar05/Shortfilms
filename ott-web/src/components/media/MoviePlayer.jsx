// MoviePlayer.jsx
import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

const MoviePlayer = ({ hlsUrl, title }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(err => {
          console.warn("Autoplay blocked:", err);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
      });

      return () => {
        hls.destroy();
      };
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS
      videoRef.current.src = hlsUrl;
      videoRef.current.addEventListener("loadedmetadata", () => {
        videoRef.current?.play().catch(err => {
          console.warn("Autoplay blocked:", err);
        });
      });
    }
  }, [hlsUrl]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <video
        ref={videoRef}
        controls
        muted
        width="100%"
        className="rounded-lg shadow-md"
      />
    </div>
  );
};

export default MoviePlayer;
