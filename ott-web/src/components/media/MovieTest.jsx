import React from "react";
import MoviePlayer from "./MoviePlayer"; 

const MovieTest = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>🎬 Streaming Test</h2>
      <MoviePlayer
        hlsUrl="https://ott-movie-storage.s3.ap-south-1.amazonaws.com/movies/BigBuckBunny/master.m3u8"
        title="Big Buck Bunny"
      />
    </div>
  );
};

export default MovieTest;
