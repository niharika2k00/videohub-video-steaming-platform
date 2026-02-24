import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/utils/api";
import SharePopover from "@/components/SharePopover";
import Skeleton from "react-loading-skeleton";
import VideoPlayer from "@/components/VideoPlayer";
import ReactMarkdown from "react-markdown";
import remarkEmoji from "remark-emoji";
import rehypeRaw from "rehype-raw";

export default function VideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("current window location object:", window.location);

    const fetchVideo = async () => {
      try {
        const { data } = await api.get(`/videos/${id}`);
        setVideo(data);
      } catch (err) {
        setError("Failed to load video");
        toast.error("Cannot load video");
      }
    };
    fetchVideo();
  }, [id]);

  if (!video) {
    return (
      <div className="container mx-auto px-6 py-10 space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  // build path: /videos/<userId>/<videoId>
  console.log("video:", video);
  const base = `/videos/${video.authorId}/${video.id}`;
  // const masterManifestUrl = `${base}/master.m3u8`;
  const masterManifestUrl = video.videoDirectoryPath;
  const poster =
    video.thumbnailUrl || "./thumbnail.jpg" || `${base}/thumbnail.jpg`;

  // mapping required for the shareable link
  const baseUrl = window.location.origin;
  let storageCode;

  var segmentToStorageMap = new Map([
    ["s01", "AWS_S3"],
    ["s02", "GCP_STORAGE"],
    ["s03", "FIREBASE_STORAGE"],
  ]);

  segmentToStorageMap.forEach((value, key) => {
    if (value === video.storageType) {
      storageCode = key;
    }
  });

  return (
    <div className="container mx-auto px-6 py-10">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </button>
      <VideoPlayer src={masterManifestUrl} poster={poster} />

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{video.title}</h1>
          <SharePopover
            url={`${baseUrl}/${storageCode}/video/${video.authorId}/${video.id}/master.m3u8`} // has reverse proxy
            videoId={video.id}
            videoTitle={video.title}
          />
        </div>
        <p className="text-sm text-gray-500">
          {video.category} • {new Date(video.uploadedAt).toLocaleDateString()}
        </p>
        <div className="mt-4 prose prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkEmoji]}
            rehypePlugins={[rehypeRaw]}
          >
            {video.description}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
