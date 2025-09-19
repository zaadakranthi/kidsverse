
'use client';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  Unsubscribe,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Chat, ChatMessage } from '@/lib/types';

// Helper to create a consistent chat ID for two users
export const getChatId = (userId1: string, userId2: string) => {
  return [userId1, userId2].sort().join('_');
};

// Get a list of all chats for a given user
export const getUserChats = (
  userId: string,
  callback: (chats: Chat[]) => void
): Unsubscribe => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastTimestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const chats: Chat[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Ensure lastTimestamp is a Timestamp object before creating a Chat
      if (data.lastTimestamp) {
        chats.push({ id: doc.id, ...data } as Chat);
      }
    });
    callback(chats);
  });
};

// Listen for real-time messages in a specific chat
export const listenForMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(50));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ChatMessage)
    );
    callback(messages);
  });
};


// Listen for metadata changes on a single chat (like isTyping)
export const listenForChatMetadata = (
    chatId: string,
    callback: (chat: Chat) => void
): Unsubscribe => {
    const chatDocRef = doc(db, 'chats', chatId);
    return onSnapshot(chatDocRef, (doc) => {
        if(doc.exists()) {
            callback({ id: doc.id, ...doc.data() } as Chat)
        }
    });
}
