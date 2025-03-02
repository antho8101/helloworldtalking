import { supabase } from "@/integrations/supabase/client";
import type { Conversation } from "@/types/messages";

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const { data: participations, error: participationsError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);

    if (participationsError) throw participationsError;

    if (!participations || participations.length === 0) {
      return [];
    }

    const conversationIds = participations.map(p => p.conversation_id);

    const { data: conversations, error: conversationsError } = await supabase
      .from("conversations")
      .select(`
        id,
        created_at,
        is_pinned,
        is_archived,
        updated_at,
        latest_message:messages(
          content,
          created_at
        ),
        participants:conversation_participants(
          user_id,
          user:profiles(
            id,
            name,
            avatar_url,
            last_seen
          )
        )
      `)
      .in("id", conversationIds)
      .order("updated_at", { ascending: false });

    if (conversationsError) throw conversationsError;

    return (conversations || []).map(convo => {
      // Default values for the other participant
      let otherParticipant = null;
      let otherParticipantId = null;
      let otherParticipantName = null;
      let otherParticipantAvatar = null;

      // Get the other participant (not the current user)
      const participants = convo.participants || [];
      const otherParticipantWrapper = participants.find(p => p.user_id !== userId);
      
      if (otherParticipantWrapper && otherParticipantWrapper.user) {
        // Extract user data and use type assertion to handle null checks
        const userData = otherParticipantWrapper.user;
        
        // Use type guards to ensure userData is a valid object
        if (userData && typeof userData === 'object' && !('code' in userData)) {
          // Optional chaining and nullish coalescing to handle potentially undefined properties
          otherParticipantId = 'id' in userData ? userData.id : null;
          otherParticipantName = 'name' in userData ? userData.name : null;
          otherParticipantAvatar = 'avatar_url' in userData ? userData.avatar_url : null;
          
          // Only create the participant object if we have an ID
          if (otherParticipantId) {
            otherParticipant = {
              id: otherParticipantId,
              name: otherParticipantName,
              avatar_url: otherParticipantAvatar
            };
          }
        }
      }

      // Create a properly typed Conversation object
      return {
        id: convo.id,
        created_at: convo.created_at,
        updated_at: convo.updated_at,
        is_pinned: convo.is_pinned || false,
        is_archived: convo.is_archived || false,
        otherParticipant,
        // Optional additional properties to maintain backward compatibility
        isTemporary: false,
        latest_message: convo.latest_message?.[0]?.content || null,
        latest_message_time: convo.latest_message?.[0]?.created_at || null,
        other_participant_id: otherParticipantId,
        other_participant_name: otherParticipantName,
        other_participant_avatar: otherParticipantAvatar,
        other_participant_online: false // Will be updated by the online status hook
      };
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export const createConversation = async (
  currentUserId: string,
  otherUserId: string
): Promise<string | null> => {
  try {
    // Create a new conversation
    const { data: newConversation, error: conversationError } = await supabase
      .from("conversations")
      .insert([{ is_pinned: false, is_archived: false }])
      .select()
      .single();

    if (conversationError) throw conversationError;

    // Add both users as participants
    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .insert([
        { conversation_id: newConversation.id, user_id: currentUserId },
        { conversation_id: newConversation.id, user_id: otherUserId },
      ]);

    if (participantsError) throw participantsError;

    return newConversation.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
};

export const updateConversationTimestamp = async (conversationId: string): Promise<void> => {
  try {
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  } catch (error) {
    console.error("Error updating conversation timestamp:", error);
  }
};
