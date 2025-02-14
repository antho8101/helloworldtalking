
import React from "react";
import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";
import { PhotoCommentView } from "@/types/photo";

interface PhotoViewerProps {
  photoUrl: string;
  photoIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
  comments: PhotoCommentView[];
  newComment: string;
  onCommentChange: (value: string) => void;
  onCommentSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  photoUrl,
  photoIndex,
  onClose,
  onPrevious,
  onNext,
  isLiked,
  likesCount,
  onLike,
  comments,
  newComment,
  onCommentChange,
  onCommentSubmit,
  isSubmitting,
}) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-50">
      <Button
        variant="ghost"
        onClick={onClose}
        className="absolute right-4 top-4 text-white hover:bg-black/20 z-50"
      >
        <X size={24} weight="bold" />
      </Button>

      <div className="grid h-screen grid-cols-[1fr_400px]">
        <div className="relative flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <img
              src={photoUrl}
              alt={`Photo ${photoIndex + 1}`}
              className="max-h-[calc(100vh-64px)] max-w-[calc(100%-64px)] object-contain"
            />
            
            <Button
              variant="ghost"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/20"
              onClick={onPrevious}
            >
              <ArrowLeft size={24} weight="bold" />
            </Button>
            
            <Button
              variant="ghost"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/20"
              onClick={onNext}
            >
              <ArrowRight size={24} weight="bold" />
            </Button>
          </div>
        </div>

        <div className="bg-white h-screen overflow-y-auto">
          <div className="p-6">
            <LikeButton isLiked={isLiked} likesCount={likesCount} onClick={onLike} />
            <CommentSection
              comments={comments}
              newComment={newComment}
              onCommentChange={onCommentChange}
              onCommentSubmit={onCommentSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
