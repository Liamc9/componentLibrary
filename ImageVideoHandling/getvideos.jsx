import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, getDocs } from 'firebase/firestore';

function VideoGallery() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const videoSnapshot = await getDocs(collection(db, 'videos'));
      const videoList = videoSnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() };
      });
      setVideos(videoList);
      setLoading(false);
    };

    fetchVideos();
  }, []);

  return (
    <div className="p-4">
      {loading ? (
        <p>Loading videos...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {videos.map((video) => (
            <div key={video.id} className="max-w-md rounded overflow-hidden shadow-lg">
              <video controls className="w-full">
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {video.name && <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">{video.name}</div>
              </div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VideoGallery;
