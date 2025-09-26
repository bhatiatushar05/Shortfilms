// import React from "react";
// import MoviePlayer from "./MoviePlayer"; 

// const MovieTest = () => {
//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>🎬 Streaming Test</h2>
//       <MoviePlayer
//         hlsUrl="https://ott-movie-storage.s3.ap-south-1.amazonaws.com/movies/BigBuckBunny/master.m3u8"
//         title="Big Buck Bunny"
//       />
//     </div>
//   );
// };

// export default MovieTest;

// //

import React from "react";
import MoviePlayer from "./MoviePlayer";

const MovieTest = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>🎬 Streaming Test</h2>

      <MoviePlayer
        hlsUrl="https://ott-movies-bucket-1.s3.us-east-1.amazonaws.com/movies/BigBuckBunny/master.m3u8"
        title="Big Buck Bunny"
      />

      <MoviePlayer
        hlsUrl="https://ott-movies-bucket-1.s3.us-east-1.amazonaws.com/movies/ElephantsDream/hls/master.m3u8"
        title="Elephants Dream"
      />

      <MoviePlayer
        hlsUrl="https://ott-movies-bucket-1.s3.us-east-1.amazonaws.com/movies/Sintel/hls/Sintel.m3u8"
        title="Sintel"
      />

      <MoviePlayer
        hlsUrl="https://ott-movies-bucket-1.s3.us-east-1.amazonaws.com/movies/TearsOfSteel/hls/TearsOfSteel.m3u8"
        title="Tears of Steel"
      />
    </div>

  );
};

export default MovieTest;
