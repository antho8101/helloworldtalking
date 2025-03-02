import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Message } from "@/types/messages";
import { updateConversationTimestamp } from "./conversationService";

interface MessagePayload {
  content: string;
  conversation_id: string;
  sender_id: string;
}

export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  if (!conversationId) return [];
  
  try {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        created_at,
        sender_id,
        sender:profiles(
          name,
          avatar_url
        )
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const fetchedMessages: Message[] = data.map(item => {
      // Default values
      let senderName = null;
      let senderAvatar = null;
      
      // Only proceed if sender exists 
      if (item.sender) {
        const senderData = item.sender;
        
        // Check that it's a valid object and not an error
        if (typeof senderData === 'object' && !('code' in senderData)) {
          // Use 'in' operator to check if properties exist
          if ('name' in senderData && senderData.name !== undefined) {
            senderName = senderData.name;
          }
          
          if ('avatar_url' in senderData && senderData.avatar_url !== undefined) {
            senderAvatar = senderData.avatar_url;
          }
        }
      }
      
      // Return a properly typed Message object
      return {
        id: item.id,
        content: item.content,
        created_at: item.created_at,
        sender_id: item.sender_id,
        sender_name: senderName,
        sender_avatar: senderAvatar
      };
    });

    return fetchedMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    toast("Error loading messages");
    return [];
  }
};

export const sendMessage = async (
  messageData: MessagePayload
): Promise<boolean> => {
  try {
    const { error: messageError } = await supabase
      .from("messages")
      .insert(messageData);

    if (messageError) throw messageError;

    // Update the timestamp on the conversation
    await updateConversationTimestamp(messageData.conversation_id);

    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    toast("Error sending message");
    return false;
  }
};
