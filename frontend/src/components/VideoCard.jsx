import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import Skeleton from "react-loading-skeleton";
import { Trash2, Play, Loader2 } from "lucide-react";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";

const VideoCard = ({ video, onDelete, className }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!video) {
    return (
      <div className={cn("overflow-hidden rounded-xl shadow-lg", className)}>
        <Skeleton className="h-48 w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  const { id, title, category, thumbnailUrl, videoVariantList } = video;
  const defaultThumbnail = "default-thumbnail.jpg";
  const hasVideoVariants = videoVariantList && videoVariantList.length > 0;

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl transition-transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10 overflow-hidden",
        className,
      )}
    >
      <Link to={`/video/${id}`} className="block">
        <div className="relative h-48 w-full bg-gray-100">
          {/* Only show image if video variants exist */}
          <img
            src={thumbnailUrl || defaultThumbnail}
            onLoad={handleImageLoad}
            alt={title}
            className={cn(
              "h-48 w-full object-cover transition-all duration-300",
              imageLoading ? "opacity-0" : "opacity-100 group-hover:scale-105",
            )}
          />

          {/* Spinner when no video variants (resolutions) are present */}
          {!hasVideoVariants && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="p-3">
                <Loader2 className="animate-spin w-10 h-10 text-white" />
              </div>
            </div>
          )}

          {/* Play Icon Overlay for Video Cards */}
          {hasVideoVariants && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-black/50 rounded-full p-3">
                <Play className="text-white" size={24} fill="white" />
              </div>
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 p-4 text-white">
          <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
          <span className="text-xs opacity-80">{category}</span>
        </div>
      </Link>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDeleteDialog(true);
        }}
        className="absolute top-2 right-3 z-20 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
        title="Delete video"
      >
        <Trash2 size={18} />
      </button>

      {/* Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmationDialog
          isDialogOpen={showDeleteDialog}
          onDialogStateChange={setShowDeleteDialog}
          title="Delete Video"
          description="Are you sure you want to delete this video? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={() => onDelete(id)}
        />
      )}
    </div>
  );
};

export default VideoCard;
