
import type { LucideIcon } from 'lucide-react';

export type Transaction = {
  id: string;
  type: 'earn' | 'spend';
  description: string;
  amount: number;
  date: string;
  from?: string; // e.g. student name for tutor payments
  paymentMethod?: 'coins' | 'cash';
};

export type User = {
  id:string;
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
  avatar: string; // from profile_picture
  subscription_status?: 'free' | 'premium';
  transactions: Transaction[];
  parental_controls: {
    max_screen_time: number;
    history_enabled: boolean;
  };
  achievements: string[]; // List of achievement IDs earned
  following: string[]; // List of user IDs being followed
  created_at: Date;
  updated_at: Date;
};

export type Comment = {
  id: string;
  user: User;
  text: string;
  timestamp: string;
  videoUrl?: string;
};

// This seems to be a combination of Video and Question posts for the feed.
export type Post = {
  id: string;
  user: User;
  timestamp: string;
  type: 'video' | 'qa';
  content: string;
  videoUrl?: string;
  imageUrl?: string;
  likes: number;
  comments: Comment[];
  shares: number;
  subject: string;
  subCategory?: string;
  class: string;
  isSponsored?: boolean;
};

export type StudyRoom = {
  id: string;
  name: string;
  subject: string;
  description: string;
  host: User;
  participants: User[];
  createdAt: Date;
  startTime?: Date;
  endTime?: Date;
  entryFee?: number;
  prize?: string;
  isSponsored?: boolean;
};

// From 2️⃣ Videos Collection
export type Video = {
  id: string; // videoId
  title: string;
  description?: string;
  uploaderId: string; // reference to users.id
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

// From 3️⃣ Q&A / Doubts Collection
export type Question = {
  id: string; // questionId
  question_text: string;
  studentId: string; // reference to users.id
  class: string;
  subject: string;
  replies: {
    reply_text: string;
    userId: string; // teacherId or studentId
    video_url?: string;
    created_at: Date;
  }[];
  likes: number;
  shares: number;
  status: 'open' | 'answered' | 'closed';
  created_at: Date;
  updated_at: Date;
};

// From 4️⃣ E-commerce / Shop Collection
export type Product = {
  id: string; // productId
  name: string;
  category: string;
  description?: string;
  price: number; // in coins
  stock: number;
  image_url: string;
  seller: Pick<User, 'id' | 'name' | 'avatar' | 'sudoName'>;
  created_at: Date;
  updated_at: Date;
};

// From 4️⃣ E-commerce / Shop Collection
export type Order = {
  id: string; // orderId
  buyerId: string; // reference to users.id
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

// From 5️⃣ Parental Control / Activity Logs
export type ActivityLog = {
  id: string; // logId
  studentId: string; // reference to users.id
  videoId: string; // reference to videos.id
  action: 'watched' | 'liked' | 'shared' | 'posted';
  duration: number; // seconds
  timestamp: Date;
};

// From 7️⃣ Admin / Moderation
export type Moderation = {
  id: string; // moderationId
  targetId: string; // reference to videos.id or questions.id
  type: 'abuse' | 'adult' | 'vulgar';
  reports: number;
  status: 'pending' | 'reviewed' | 'action_taken';
  adminId: string; // reference to users.id
  action_taken: 'deleted' | 'modified' | 'ignored';
  created_at: Date;
};

export type FlaggedContent = {
    id: string;
    contentId: string;
    contentType: 'video' | 'post' | 'comment';
    flaggedBy: User;
    reason: string;
    timestamp: string;
    status: 'pending' | 'approved' | 'rejected';
};

export type GameType = 'Quiz' | 'Word Scramble' | 'Tongue Twister' | 'Memory Match' | 'Math Puzzle';

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
    startTime?: Date;
    endTime?: Date;
    entryFee?: number;
    prize?: string;
};

export type QuizQuestion = {
    question: string;
    options: string[];
    correctAnswer: string;
};

export type WordScramble = {
    scrambled: string;
    answer: string;
}

export type TeacherClass = {
    id: string;
    teacher: User;
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
    user: User;
    bio: string;
    subjects: string[];
    rating: number;
    reviews: number;
    price_per_hour: number; // in coins
};

export type PartnerCourse = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number; // in rupees
  duration: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
}

export type Partner = {
  name: string;
  slug: string;
  logo: string;
  description: string;
  coursesOffered: number;
  studentsEnrolled: number;
  featuredCourses: PartnerCourse[];
  one_time_fee_paid?: boolean;
}

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
