
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PhotoCommentView, mapPhotoCommentToComment } from "@/types/photo";
import { toast } from "sonner";

export const usePhotoComments = (currentUserId: string | null) => {
  const [comments, setComments] = useState<PhotoCommentView[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async (photoUrl: string) => {
    if (!currentUserId) return;

    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          photo_url,
          profiles (
            name,
            username,
            avatar_url
          )
        `)
        .eq('photo_url', photoUrl)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      setComments((commentsData || []).map(mapPhotoCommentToComment));
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const addComment = async (photoUrl: string) => {
    if (!newComment.trim() || !currentUserId) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          user_id: currentUserId,
          photo_url: photoUrl
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          photo_url,
          profiles (
            name,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setComments(prev => [...prev, mapPhotoCommentToComment(data)]);
      setNewComment("");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    comments,
    newComment,
    setNewComment,
    isSubmitting,
    fetchComments,
    addComment
  };
};
