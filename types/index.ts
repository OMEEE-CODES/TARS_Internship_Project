export interface User {
  _id: string;
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string;
  isOnline: boolean;
  lastSeen: number;
}

export interface Conversation {
  _id: string;
  type: "direct" | "group";
  name?: string;
  participants: string[];
  createdBy: string;
  updatedAt: number;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
  reactions?: {
    emoji: string;
    userId: string;
  }[];
}

export interface TypingIndicator {
  _id: string;
  conversationId: string;
  userId: string;
  timestamp: number;
}

export interface ReadReceipt {
  _id: string;
  conversationId: string;
  userId: string;
  lastReadMessageId?: string;
  unreadCount: number;
}

export interface ConversationWithDetails extends Conversation {
  otherUser?: User;
  lastMessage?: Message;
  unreadCount: number;
}
