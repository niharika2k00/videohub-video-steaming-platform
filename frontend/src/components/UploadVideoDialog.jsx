import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/utils/api";
import { toast } from "react-toastify";
import MDEditor from "@uiw/react-md-editor";
import { analytics } from "@/utils/analytics";
import {
  Dialog,
  DialogTrigger,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  videoFile: z.any().refine((f) => {
    console.log("File validation:", f);
    if (!f || !f[0]) return false;

    const file = f[0];
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
      isFile: file instanceof File,
    });
    return file instanceof File && file.size > 0;
  }, "Please select a valid video file"),
});

const UploadVideoDialog = ({ onSuccess, children }) => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");

  // Array of popular video categories
  const videoCategories = [
    "Art",
    "Automotive",
    "Business",
    "Comedy",
    "Education",
    "Entertainment",
    "Fashion",
    "Fitness",
    "Food",
    "Gaming",
    "Health",
    "Innovation",
    "Lifestyle",
    "Motivational",
    "Music",
    "Nature",
    "News",
    "Science",
    "Sports",
    "Technology",
    "Travel",
    "Tutorial",
    "Vlog",
    "Other",
  ];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    const formData = new FormData();
    console.log("data:", data);
    formData.append("title", data.title);
    formData.append("description", data.description); // Use markdown editor value
    formData.append("category", data.category);
    formData.append("videoFile", data.videoFile[0]);

    try {
      await api.post("/video/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000, // 5 min timeout for video uploads
      });
      analytics.trackVideoUpload(data.title);
      toast.success("Video uploaded ✅");
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      analytics.trackError(
        "Video Upload Error",
        err?.response?.data?.message || "Upload failed"
      );
      toast.error(err?.response?.data?.message || "Upload failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        children({ open: () => setOpen(true) })
      ) : (
        <DialogTrigger asChild>
          <Button variant="secondary">Upload video</Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Upload Your Video
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            All fields are required. Maximum file size: 200 MB
          </DialogDescription>
        </DialogHeader>

        <form
          id="upload-form"
          className="space-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Title */}
          <div className="grid gap-1">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description with Markdown Editor */}
          {/* https://uiwjs.github.io/react-md-editor/ */}
          <div className="grid gap-1">
            <Label htmlFor="description">Description</Label>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <MDEditor
                value={description}
                onChange={(val) => {
                  setDescription(val || "");
                  setValue("description", val || "");
                }}
                preview="edit"
                hideToolbar={false}
                visibleDragBar={true}
                previewOptions={true}
                height={200}
                data-color-mode="light"
                textareaProps={{
                  placeholder: "Write your video description using markdown...",
                }}
              />
            </div>
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Supports markdown formatting: **bold**, *italic*, ### headings, -
              lists, [links](url)
            </p>
          </div>

          {/* Category */}
          <div className="grid gap-1">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              {...register("category")}
            >
              <option value="">Select a category</option>
              {videoCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Video file */}
          <div className="grid gap-1">
            <Label htmlFor="videoFile">Video file</Label>
            <div className="relative">
              <Input
                id="videoFile"
                type="file"
                accept="video/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                {...register("videoFile")}
              />
              <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 cursor-pointer">
                <span className="text-sm text-gray-500">
                  {watch("videoFile")?.[0]?.name || "Choose file"}
                </span>
                <span className="text-sm text-blue-600 font-medium">
                  Browse
                </span>
              </div>
            </div>
            {errors.videoFile && (
              <p className="text-sm text-red-500">{errors.videoFile.message}</p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="upload-form"
            disabled={isSubmitting}
            className="w-50"
          >
            {isSubmitting ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadVideoDialog;
