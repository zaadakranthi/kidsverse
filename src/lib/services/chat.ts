
'use server';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
  writeBatch,
  orderBy,
  limit,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Chat, ChatMessage, User } from '@/lib/types';
import { getChatId } from '@/lib/client/chat';

// Send a new message to a chat
export const sendMessage = async (
  chatId: string,
  senderId: string,
  receiverId: string,
  text: string,
  mediaFile?: File
) => {
  let mediaUrl: string | undefined = undefined;
  const chatDocRef = doc(db, 'chats', chatId);
  const messagesColRef = collection(db, `chats/${chatId}/messages`);

  // 1. Upload media if it exists
  if (mediaFile) {
    const messageId = `media_${Date.now()}`;
    const storageRef = ref(storage, `chats/${chatId}/${messageId}`);

    const uploadTask = uploadBytesResumable(storageRef, mediaFile);
    await uploadTask;
    mediaUrl = await getDownloadURL(uploadTask.snapshot.ref);
  }

  // 2. Add the new message to the 'messages' subcollection
  const newMessageData: Omit<ChatMessage, 'id' | 'timestamp'> = {
    senderId,
    participants: [senderId, receiverId],
    text,
    mediaUrl,
    readBy: [senderId], // Mark as read by the sender initially
  };
  
  await addDoc(messagesColRef, { ...newMessageData, timestamp: serverTimestamp() });

  // 3. Update the last message on the parent chat document
  await updateDoc(chatDocRef, {
    lastMessage: text || 'Sent an image',
    lastSenderId: senderId,
    lastTimestamp: serverTimestamp(),
    [`isTyping.${senderId}`]: false,
  });
};


// Creates a chat if it doesn't exist, and returns the chat document
export const startChat = async (
  currentUser: User,
  otherUser: User
): Promise<Chat> => {
  const chatId = getChatId(currentUser.id, otherUser.id);
  const chatDocRef = doc(db, 'chats', chatId);

  const chatDoc = await getDoc(chatDocRef);

  if (chatDoc.exists()) {
     const data = chatDoc.data();
    return { id: chatDoc.id, ...data } as Chat;
  } else {
    const newChatData = {
      participants: [currentUser.id, otherUser.id],
      participantInfo: {
        [currentUser.id]: {
          id: currentUser.id,
          name: currentUser.name,
          sudoName: currentUser.sudoName,
          avatar: currentUser.avatar,
        },
        [otherUser.id]: {
          id: otherUser.id,
          name: otherUser.name,
          sudoName: otherUser.sudoName,
          avatar: otherUser.avatar,
        },
      },
      lastMessage: '',
      lastSenderId: '',
      lastTimestamp: serverTimestamp(),
      isTyping: {
        [currentUser.id]: false,
        [otherUser.id]: false,
      },
    };
    await setDoc(chatDocRef, newChatData);

    // Fetch the document again to get the server-generated timestamp
    const newChatDoc = await getDoc(chatDocRef);
    const finalData = newChatDoc.data()!;
    return { 
        id: newChatDoc.id, 
        ...finalData,
        lastTimestamp: finalData.lastTimestamp as Timestamp, // Ensure type is correct
    } as Chat;
  }
};


// Mark specific messages as read by adding the user's ID to the 'readBy' array
export const markMessagesAsRead = async (chatId: string, userId: string, messageIds: string[]) => {
  if (messageIds.length === 0) return;
  
  const batch = writeBatch(db);
  
  try {
    for (const messageId of messageIds) {
        const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
        batch.update(messageRef, { readBy: arrayUnion(userId) });
    }
    await batch.commit();
  } catch (error) {
    console.error("Error marking messages as read: ", error);
  }
};


export const setTypingStatus = async (
  chatId: string,
  userId: string,
  isTyping: boolean
) => {
  const chatDocRef = doc(db, 'chats', chatId);
  try {
     const chatDoc = await getDoc(chatDocRef);
    if (!chatDoc.exists()) {
      // This can happen if one user starts typing before the chat doc is created.
      // We can safely ignore this.
      return;
    }
    await updateDoc(chatDocRef, {
      [`isTyping.${userId}`]: isTyping,
    });
  } catch (error) {
    console.error(`Could not set typing status for chat ${chatId}:`, error);
  }
};
