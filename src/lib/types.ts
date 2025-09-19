
import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

// ==============================
// Transactions
// ==============================
export type Transaction = {
  id: string;
  type: 'earn' | 'spend';
  description: string;
  amount: number;
  date: string;
  from?: string; // e.g., student name for tutor payments
  paymentMethod?: 'coins' | 'cash';
};

// ==============================
// Users
// ==============================
export type User = {
  id: string;
  name: string;
  sudoName: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  class: string;
  school: string;
  syllabus: string;
  area: string;
  state: string;
  languages: string[];
  sports: string[];
  willing_to_tutor: boolean;
  coins: number;
  avatar: string;
  subscription_status?: 'free' | 'premium';
  transactions: Transaction[];
  parental_controls: {
    max_screen_time: number;
    history_enabled: boolean;
  };
  achievements: string[];
  following: string[];
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

// ==============================
// Comments
// ==============================
export type Comment = {
  id: string;
  authorInfo: Pick<User, 'id' | 'name' | 'sudoName' | 'avatar'>;
  text: string;
  timestamp: string;
  videoUrl?: string;
  createdAt?: Date | Timestamp;
};

export type CommentType = Comment; // alias for local usage

// ==============================
// Posts
// ==============================
export type Post = {
  id: string;
  authorId: string;
  authorInfo: Pick<User, 'id' | 'name' | 'sudoName' | 'avatar'>;
  timestamp: string;
  type: 'video' | 'qa';
  content: string;
  videoUrl?: string;
  imageUrl?: string;
  likes: number;
  commentsCount: number;
  comments?: Comment[];
  shares: number;
  subject: string;
  subCategory?: string;
  class: string;
  isSponsored?: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

// ==============================
// Study Rooms
// ==============================
export type StudyRoom = {
  id: string;
  name: string;
  subject: string;
  description: string;
  hostId: string;
  hostInfo: Pick<User, 'id' | 'name' | 'avatar' | 'sudoName' | 'role'>;
  participantIds: string[];
  createdAt: Date;
  startTime?: Date;
  endTime?: Date;
  entryFee?: number;
  prize?: string;
  isSponsored?: boolean;
};

// ==============================
// Videos
// ==============================
export type Video = {
  id: string;
  title: string;
  description?: string;
  uploaderId: string;
  class: string;
  subject: string;
  stream: string;
  video_url: string;
  thumbnail_url: string;
  likes: number;
  shares: number;
  reports: number;
  status: 'pending' | 'approved' | 'blocked';
  created_at: Date;
  updated_at: Date;
};

// ==============================
// Questions / Doubts
// ==============================
export type Question = {
  id: string;
  question_text: string;
  studentId: string;
  class: string;
  subject: string;
  replies: {
    reply_text: string;
    userId: string;
    video_url?: string;
    created_at: Date;
  }[];
  likes: number;
  shares: number;
  status: 'open' | 'answered' | 'closed';
  created_at: Date;
  updated_at: Date;
};

// ==============================
// E-commerce
// ==============================
export type Product = {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  image_url: string;
  seller: Pick<User, 'id' | 'name' | 'avatar' | 'sudoName'>;
  created_at: Date;
  updated_at: Date;
};

export type Order = {
  id: string;
  buyerId: string;
  products: {
    productId: string;
    qty: number;
    price: number;
  }[];
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  payment_method: string;
  created_at: Date;
};

// ==============================
// Parental Control
// ==============================
export type ActivityLog = {
  id: string;
  studentId: string;
  videoId: string;
  action: 'watched' | 'liked' | 'shared' | 'posted';
  duration: number;
  timestamp: Date;
};

// ==============================
// Admin / Moderation
// ==============================
export type Moderation = {
  id: string;
  targetId: string;
  type: 'abuse' | 'adult' | 'vulgar';
  reports: number;
  status: 'pending' | 'reviewed' | 'action_taken';
  adminId: string;
  action_taken: 'deleted' | 'modified' | 'ignored';
  created_at: Date;
};

export type FlaggedContent = {
  id: string;
  contentId: string;
  contentType: 'video' | 'post' | 'comment';
  flaggedBy: Pick<User, 'id' | 'name' | 'avatar' | 'sudoName'>;
  reason: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
};

// ==============================
// Games
// ==============================
export type GameType = 'Quiz' | 'Word Scramble' | 'Tongue Twister' | 'Memory Match' | 'Math Puzzle' | 'Riddle';

export type Game = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  gameType: GameType;
  isSponsored?: boolean;
  creator: Pick<User, 'id' | 'name' | 'avatar' | 'sudoName'>;
  questions?: QuizQuestion[];
  wordScrambles?: WordScramble[];
  tongueTwisters?: string[];
  riddles?: Riddle[];
  startTime?: Date;
  endTime?: Date;
  entryFee?: number;
  prize?: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  imageUrl?: string;
};

export type WordScramble = {
  scrambled: string;
  answer: string;
};

export type Riddle = {
  riddle: string;
  answer: string;
  hint?: string;
};

// ==============================
// Classes & Tutors
// ==============================
export type TeacherClass = {
  id: string;
  teacher: Pick<User, 'id' | 'name' | 'avatar' | 'sudoName'>;
  className: string;
  subject: string;
  enrolled: number;
  status: 'Ongoing' | 'Upcoming' | 'Completed';
  price: number;
};

export type GameScore = {
  id: string;
  gameId: string;
  user: Pick<User, 'id' | 'name' | 'avatar' | 'sudoName'>;
  score: number;
  date: string;
};

export type Tutor = {
  id: string; // userId
  userId: string;
  bio: string;
  subjects: string[];
  rating: number;
  reviews: number;
  price_per_hour: number;
  name: string;
  sudoName: string;
  avatar: string;
  role: User['role'];
  class: string;
};

// ==============================
// Partners
// ==============================
export type PartnerCourse = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  duration: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
};

export type Partner = {
  name: string;
  slug: string;
  logo: string;
  description: string;
  coursesOffered: number;
  studentsEnrolled: number;
  featuredCourses: PartnerCourse[];
  one_time_fee_paid?: boolean;
};

// ==============================
// Coins / Achievements / Quests
// ==============================
export type CoinUsageConfig = {
  aiRecommendations: number;
  languageTranslation: number;
};

export type CoinPackage = {
  id: string;
  coins: number;
  price: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tier: 'bronze' | 'silver' | 'gold';
};

export type QuestStep = {
  id: string;
  title: string;
  type: 'watch_video' | 'answer_question' | 'complete_quiz';
  targetId: string;
  isCompleted: boolean;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  subject: string;
  icon: LucideIcon;
  reward: number;
  steps: QuestStep[];
};

// ==============================
// Story / Reel
// ==============================
export type Story = {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  duration: number;
  userId: string;
  username: string;
  userAvatar: string;
  createdAt: Timestamp | Date;
};

export type StoryReel = {
  id: string; // This will be the userId
  userId: string;
  username: string;
  avatar: string;
  stories: Story[];
  updatedAt: Timestamp;
};

export type StoryReelWithViewed = StoryReel & {
  isAllViewed: boolean;
}

// ==============================
// Chat
// ==============================
export type ChatMessage = {
  id: string;
  senderId: string;
  participants: string[];
  text?: string;
  mediaUrl?: string;
  timestamp: Timestamp;
  readBy: string[]; // Array of user IDs who have read the message
};

export type ChatParticipantInfo = {
  id: string;
  name: string;
  sudoName: string;
  avatar: string;
};

export type Chat = {
  id: string;
  participants: string[];
  participantInfo: {
    [key: string]: ChatParticipantInfo
  };
  lastMessage?: string;
  lastSenderId?: string;
  lastTimestamp?: Timestamp;
  isTyping?: {
    [key: string]: boolean;
  };
  messages?: ChatMessage[];
};
