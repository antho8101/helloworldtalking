
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const usePosts = (profileId: string | null, currentUserId: string | null) => {
  const [posts, setPosts] = useState<any[]>([]);

  const fetchPosts = async () => {
    if (profileId) {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          id,
          content,
          image_url,
          created_at,
          likes_count,
          user_id,
          profiles!user_id (
            id,
            name,
            username,
            avatar_url
          )
        `)
        .eq("user_id", profileId)
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error fetching posts:", postsError);
        return;
      }

      if (currentUserId) {
        const { data: likedPosts } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", currentUserId);

        const likedPostIds = new Set(likedPosts?.map(like => like.post_id) || []);

        const postsWithLikes = await Promise.all(
          postsData.map(async (post) => {
            const { data: comments } = await supabase
              .from("comments")
              .select(`
                id,
                content,
                created_at,
                likes_count,
                profiles!user_id (
                  name,
                  username,
                  avatar_url
                )
              `)
              .eq("post_id", post.id)
              .order("created_at", { ascending: true });

            return {
              ...post,
              isLiked: likedPostIds.has(post.id),
              comments: comments?.map(comment => ({
                id: comment.id,
                content: comment.content,
                createdAt: comment.created_at,
                author: {
                  name: comment.profiles.name,
                  username: comment.profiles.username,
                  avatarUrl: comment.profiles.avatar_url,
                },
                likesCount: comment.likes_count,
                isLiked: false,
              })) || [],
            };
          })
        );

        setPosts(postsWithLikes);
      }
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchPosts();
    }
  }, [profileId, currentUserId]);

  return { posts, fetchPosts };
};
