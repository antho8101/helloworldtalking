
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Conversation } from "@/types/messages";

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  activeConversationId: string | undefined;
  onSelectConversation: (conversation: Conversation) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  loading,
  activeConversationId,
  onSelectConversation
}) => {
  if (loading) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6153BD]"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="p-2">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation.id || (conversation.otherParticipant?.id ?? 'temp')}
                className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center ${
                  activeConversationId === conversation.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="relative mr-3">
                  <div className="w-10 h-10 bg-[#6153BD]/10 rounded-full flex items-center justify-center overflow-hidden">
                    {conversation.otherParticipant?.avatar_url ? (
                      <img 
                        src={conversation.otherParticipant.avatar_url} 
                        alt={conversation.otherParticipant.name || "User"} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#6153BD] font-bold">
                        {conversation.otherParticipant?.name 
                          ? conversation.otherParticipant.name[0].toUpperCase() 
                          : "U"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {conversation.otherParticipant?.name || "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.isTemporary ? "New conversation" : "Click to view messages"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
