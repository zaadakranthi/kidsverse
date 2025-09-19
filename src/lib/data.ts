

import type { User, Post, Comment, StudyRoom, Product, FlaggedContent, Game, TeacherClass, GameScore, Tutor, Partner, Transaction, CoinUsageConfig, CoinPackage, GameType, WordScramble, Achievement, Riddle, Quest, Story, StoryReel } from './types';
import { Brain, Puzzle, SpellCheck, Forward, BookA, Medal, Video, Award, MessageSquare, PlusCircle, UserCheck, HelpCircle, Building2, Rocket, Flag as FlagIcon, Dna } from 'lucide-react';
import { addHours, addDays, format, subHours } from 'date-fns';

const transactions: Transaction[] = [
    { id: 't1', type: 'earn', description: 'Won "Indian History Challenge"', amount: 50, date: format(addDays(new Date(), -1), 'PPP'), paymentMethod: 'coins' },
    { id: 't2', type: 'spend', description: 'Purchased "Premium Notebook Set"', amount: 450, date: format(addDays(new Date(), -2), 'PPP'), paymentMethod: 'coins' },
    { id: 't3', type: 'earn', description: 'Bonus for Premium Subscription', amount: 1000, date: format(addDays(new Date(), -5), 'PPP'), paymentMethod: 'cash' },
    { id: 't4', type: 'earn', description: 'Created "Algebra Avengers" Event', amount: 100, date: format(addDays(new Date(), -7), 'PPP'), paymentMethod: 'coins' },
    { id: 't5', type: 'spend', description: 'Booked session with Mr. Garcia', amount: 800, date: format(addDays(new Date(), -10), 'PPP'), paymentMethod: 'coins' },
];

export const achievements: Achievement[] = [
    { id: 'ach1', title: 'First Steps', description: 'Joined EduVerse', icon: Medal, tier: 'bronze' },
    { id: 'ach2', title: 'Star Contributor', description: 'Posted your first video', icon: Video, tier: 'bronze' },
    { id: 'ach3', title: 'Curious Mind', description: 'Asked your first question', icon: MessageSquare, tier: 'bronze' },
    { id: 'ach4', title: 'Game On!', description: 'Played your first game', icon: Puzzle, tier: 'bronze' },
    { id: 'ach5', title: 'Debate Champion', description: 'Won a regional debate competition', icon: Award, tier: 'silver' },
    { id: 'ach6', title: 'Creative Mind', description: 'Won a monthly DIY craft challenge', icon: Award, tier: 'silver' },
    { id: 'ach7', title: 'Community Builder', description: 'Created your first event', icon: PlusCircle, tier: 'silver' },
    { id: 'ach8', title: 'Math Whiz', description: 'Answered 50 math questions', icon: Medal, tier: 'gold' },
    { id: 'ach9', title: 'Super Follower', description: 'Followed 10 users', icon: UserCheck, tier: 'gold' },
];


export const users: User[] = [
  {
    id: 'u1',
    name: 'Alex Johnson',
    sudoName: 'rising_star',
    email: 'alex.j@example.com',
    role: 'admin',
    avatar: 'https://picsum.photos/seed/u1/100/100',
    class: '10th',
    school: 'Maple High',
    syllabus: 'CBSE',
    area: 'Mumbai',
    state: 'Maharashtra',
    languages: ['English', 'Hindi'],
    sports: ['Cricket'],
    willing_to_tutor: true,
    coins: 1200,
    subscription_status: 'premium',
    transactions: transactions,
    achievements: ['ach1', 'ach2', 'ach3', 'ach5'],
    following: ['u2', 'u3', 'u4'],
    parental_controls: {
      max_screen_time: 120,
      history_enabled: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'u2',
    name: 'Benny Smith',
    sudoName: 'code_ninja',
    email: 'benny.s@example.com',
    role: 'student',
    avatar: 'https://picsum.photos/seed/u2/100/100',
    class: '9th',
    school: 'Oakwood Academy',
    syllabus: 'State',
    area: 'Delhi',
    state: 'Delhi',
    languages: ['English'],
    sports: ['Football'],
    willing_to_tutor: false,
    coins: 800,
    subscription_status: 'free',
    transactions: [],
    achievements: ['ach1', 'ach4'],
    following: ['u1', 'u3'],
    parental_controls: {
      max_screen_time: 90,
      history_enabled: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'u3',
    name: 'Chloe Davis',
    sudoName: 'art_whiz',
    email: 'chloe.d@example.com',
    role: 'student',
    avatar: 'https://picsum.photos/seed/u3/100/100',
    class: '10th',
    school: 'Maple High',
    syllabus: 'IB',
    area: 'Mumbai',
    state: 'Maharashtra',
    languages: ['English', 'Marathi'],
    sports: ['Badminton'],
    willing_to_tutor: true,
    coins: 1500,
    subscription_status: 'free',
    transactions: [],
    achievements: ['ach1', 'ach2', 'ach7'],
    following: ['u1'],
    parental_controls: {
      max_screen_time: 150,
      history_enabled: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'u4',
    name: 'Mr. Garcia',
    sudoName: 'prof_garcia',
    email: 'mr.garcia@example.com',
    role: 'teacher',
    avatar: 'https://picsum.photos/seed/u4/100/100',
    class: '10th',
    school: 'Maple High',
    syllabus: 'CBSE',
    area: 'Mumbai',
    state: 'Maharashtra',
    languages: ['English', 'Spanish'],
    sports: [],
    willing_to_tutor: true,
    coins: 0,
    subscription_status: 'free',
    transactions: [],
    achievements: [],
    following: ['u1'],
    parental_controls: {
      max_screen_time: 0,
      history_enabled: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
   {
    id: 'u5',
    name: 'Sponsor Brand',
    sudoName: 'sponsor_brand',
    email: 'contact@sponsor.com',
    role: 'admin',
    avatar: 'https://placehold.co/100x100/e2e8f0/e2e8f0',
    class: '',
    school: '',
    syllabus: '',
    area: '',
    state: '',
    languages: [],
    sports: [],
    willing_to_tutor: false,
    coins: 0,
    transactions: [],
    achievements: [],
    following: [],
    parental_controls: {
      max_screen_time: 0,
      history_enabled: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export let comments: Comment[] = [
  {
    id: 'c1',
    authorInfo: { id: 'u2', name: 'Benny Smith', sudoName: 'code_ninja', avatar: 'https://picsum.photos/seed/u2/100/100' },
    text: 'Great explanation!',
    timestamp: '2h ago',
  },
  {
    id: 'c2',
    authorInfo: { id: 'u3', name: 'Chloe Davis', sudoName: 'art_whiz', avatar: 'https://picsum.photos/seed/u3/100/100' },
    text: 'This helped me a lot, thanks!',
    timestamp: '1h ago',
  },
];

export let posts: Post[] = [
  {
    id: 'p1',
    authorInfo: { id: 'u1', name: 'Alex Johnson', sudoName: 'rising_star', avatar: 'https://picsum.photos/seed/u1/100/100' },
    authorId: 'u1',
    timestamp: '3h ago',
    type: 'video',
    content:
      'Here is a quick tutorial on solving quadratic equations. Hope this helps with your math homework!',
    imageUrl: 'https://picsum.photos/seed/p1/600/400',
    likes: 125,
    comments: [comments[0]],
    commentsCount: 1,
    shares: 12,
    subject: 'Mathematics',
    class: '10th',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p2',
    authorInfo: { id: 'u3', name: 'Chloe Davis', sudoName: 'art_whiz', avatar: 'https://picsum.photos/seed/u3/100/100' },
    authorId: 'u3',
    timestamp: '5h ago',
    type: 'qa',
    content:
      "Can anyone explain the process of photosynthesis? I'm having trouble understanding the light-dependent reactions.",
    imageUrl: 'https://picsum.photos/seed/p2/600/400',
    likes: 88,
    comments: [comments[1]],
    commentsCount: 1,
    shares: 5,
    subject: 'Biology',
    class: '10th',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p3',
    authorInfo: { id: 'u2', name: 'Benny Smith', sudoName: 'code_ninja', avatar: 'https://picsum.photos/seed/u2/100/100' },
    authorId: 'u2',
    timestamp: '1d ago',
    type: 'video',
    content:
      "Let's break down Shakespeare's \"Romeo and Juliet\". Act 1 summary and character analysis.",
    imageUrl: 'https://picsum.photos/seed/p3/600/400',
    likes: 240,
    comments: [],
    commentsCount: 0,
    shares: 30,
    subject: 'English',
    class: '9th',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const sponsoredPost: Post = {
    id: 'sp1',
    authorInfo: { id: 'u5', name: 'Sponsor Brand', sudoName: 'sponsor_brand', avatar: 'https://placehold.co/100x100/e2e8f0/e2e8f0' },
    authorId: 'u5',
    timestamp: 'Sponsored',
    type: 'video',
    content: 'Unlock your potential with the new "Future Genius" learning tablet. Faster, smarter, and designed for students. Available now in the marketplace!',
    imageUrl: 'https://picsum.photos/seed/sp1/600/400',
    likes: 1340,
    comments: [],
    commentsCount: 0,
    shares: 250,
    subject: 'Tech for Students',
    class: 'All',
    isSponsored: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

export let studyRooms: Omit<StudyRoom, 'host' | 'participants'>[] = [
  {
    id: 'sr1',
    name: 'Algebra Avengers',
    subject: 'Mathematics',
    description: 'Weekly session to tackle tough algebra problems and prepare for exams.',
    hostId: 'u4',
    hostInfo: { id: 'u4', name: 'Mr. Garcia', sudoName: 'prof_garcia', avatar: 'https://picsum.photos/seed/u4/100/100', role: 'teacher' },
    participantIds: ['u1', 'u3'],
    createdAt: new Date(),
    startTime: new Date(),
    endTime: addHours(new Date(), 1)
  },
  {
    id: 'sr2',
    name: 'Biology Buffs',
    subject: 'Biology',
    description: 'Deep dive into cellular biology and genetics. Everyone is welcome!',
    hostId: 'u1',
    hostInfo: { id: 'u1', name: 'Alex Johnson', sudoName: 'rising_star', avatar: 'https://picsum.photos/seed/u1/100/100', role: 'admin' },
    participantIds: ['u2', 'u3'],
    createdAt: new Date(),
    entryFee: 10,
    prize: '100 Coins'
  },
  {
    id: 'sr3',
    name: 'Upcoming Physics Phantoms',
    subject: 'Physics',
    description: 'Conquering the concepts of motion, force, and energy. Peer-led study group.',
    hostId: 'u3',
    hostInfo: { id: 'u3', name: 'Chloe Davis', sudoName: 'art_whiz', avatar: 'https://picsum.photos/seed/u3/100/100', role: 'student' },
    participantIds: ['u1', 'u2'],
    createdAt: new Date(),
    startTime: addDays(new Date(), 1),
    endTime: addHours(addDays(new Date(), 1), 1),
    entryFee: 20,
    prize: "200 Coins",
    isSponsored: true,
  }
];

export let products: Product[] = [
  {
    id: 'prod1',
    name: 'Premium Notebook Set',
    category: 'Stationery',
    description: 'A set of 5 high-quality, single-rule notebooks for all your classes.',
    price: 450,
    stock: 150,
    image_url: 'https://picsum.photos/seed/prod1/400/400',
    seller: users[3],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'prod2',
    name: 'Advanced Mathematics Guide',
    category: 'Books',
    description: 'A comprehensive guide for 10th-grade mathematics, covering all CBSE topics.',
    price: 750,
    stock: 80,
    image_url: 'https://picsum.photos/seed/prod2/400/400',
    seller: users[3],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'prod3',
    name: 'Mechanical Pencil & Lead Set',
    category: 'Stationery',
    description: 'A durable mechanical pencil with 3 packs of 0.7mm lead refills.',
    price: 250,
    stock: 200,
    image_url: 'https://picsum.photos/seed/prod3/400/400',
    seller: users[1],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'prod4',
    name: 'Physics Notes (Class 9)',
    category: 'Notes',
    description: 'Handwritten, comprehensive notes covering all major topics in 9th-grade physics.',
    price: 300,
    stock: 1,
    image_url: 'https://picsum.photos/seed/prod4/400/400',
    seller: users[0],
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const flaggedContent: FlaggedContent[] = [
    {
        id: 'fc1',
        contentId: 'p3',
        contentType: 'video',
        flaggedBy: users[2],
        reason: 'HARM_CATEGORY_HATE_SPEECH',
        timestamp: '1 day ago',
        status: 'pending'
    },
    {
        id: 'fc2',
        contentId: 'c1',
        contentType: 'comment',
        flaggedBy: users[1],
        reason: 'HARM_CATEGORY_HARASSMENT',
        timestamp: '2 hours ago',
        status: 'pending'
    }
];

export const pointsConfig = {
    createStudyRoom: 100,
    studentJoinsRoom: 10,
    askQuestion: 5,
    answerQuestion: 15,
    createVideoPost: 75,
    createBrainGame: 50,
    createQuiz: 80, // More points for creating a quiz
    playBrainGame: 5,
};

export const coinUsageConfig: CoinUsageConfig = {
    aiRecommendations: 5,
    languageTranslation: 10,
};

export const coinPackages: CoinPackage[] = [
    { id: 'cp1', coins: 1000, price: 99 },
    { id: 'cp2', coins: 2000, price: 149 },
    { id: 'cp3', coins: 5000, price: 199 },
];

export const teacherClasses: TeacherClass[] = [
    { id: 'tc1', teacher: users.find(u => u.role === 'teacher')!, className: 'Advanced Calculus', subject: 'Mathematics', enrolled: 25, status: 'Ongoing', price: 1500 },
    { id: 'tc2', teacher: users.find(u => u.role === 'teacher')!, className: 'Shakespeare Deep-Dive', subject: 'English', enrolled: 18, status: 'Upcoming', price: 1200 },
    { id: 'tc3', teacher: users.find(u => u.role === 'teacher')!, className: 'Organic Chemistry Basics', subject: 'Chemistry', enrolled: 32, status: 'Completed', price: 1300 },
];

export const wordScrambleData: WordScramble[] = [
    { scrambled: 'C S I E N C E', answer: 'SCIENCE' },
    { scrambled: 'Y H G O R A P E G', answer: 'GEOGRAPHY' },
    { scrambled: 'S I Y H R O T', answer: 'HISTORY' },
    { scrambled: 'A M H T S', answer: 'MATHS' },
    { scrambled: 'N E I L H S G', answer: 'ENGLISH' },
];

export const tongueTwisterData: string[] = [
    "She sells seashells by the seashore.",
    "Peter Piper picked a peck of pickled peppers.",
    "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
    "Betty Botter bought some butter but she said the butter’s bitter.",
    "A proper copper coffee pot."
];

export const riddleData: Riddle[] = [
  { riddle: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", answer: "A map" },
  { riddle: "What has an eye, but cannot see?", answer: "A needle" },
  { riddle: "What month of the year has 28 days?", answer: "All of them" },
  { riddle: "What is always in front of you but can’t be seen?", answer: "The future" },
  { riddle: "What has to be broken before you can use it?", answer: "An egg" },
];


export let games: Omit<Game, 'icon'>[] = [
    {
        id: 'game-1',
        title: 'Daily Memory Match',
        slug: 'memory-match',
        description: 'Test your memory! A new challenge every day.',
        gameType: 'Memory Match',
        isSponsored: true,
        creator: users.find(u => u.role === 'admin')!,
    },
    {
        id: 'game-3',
        title: 'Daily Word Scramble',
        slug: 'word-scramble',
        description: 'Unscramble the daily word. A new puzzle every day!',
        gameType: 'Word Scramble',
        isSponsored: false,
        creator: users.find(u => u.role === 'admin')!,
    },
    {
        id: 'game-4',
        title: 'Daily Tongue Twister',
        slug: 'tongue-twisters',
        description: 'Challenge your pronunciation with a new tricky twister every day!',
        gameType: 'Tongue Twister',
        isSponsored: false,
        creator: users.find(u => u.role === 'admin')!,
    },
     {
        id: 'game-5',
        title: 'Daily Riddles',
        slug: 'riddles',
        description: 'Solve a new riddle every day to test your wit!',
        gameType: 'Riddle',
        isSponsored: false,
        creator: users.find(u => u.role === 'admin')!,
    },
    {
        id: 'game-2',
        title: 'Math Puzzles',
        slug: 'math-puzzles',
        description: 'Solve challenging math problems to sharpen your mind.',
        gameType: 'Math Puzzle',
        isSponsored: false,
        creator: users.find(u => u.role === 'teacher')!,
        questions: [
            { question: 'What is 15 * 5?', options: ['60', '70', '75', '80'], correctAnswer: '75' },
            { question: 'What is the square root of 144?', options: ['10', '11', '12', '13'], correctAnswer: '12' },
        ],
        entryFee: 5,
        prize: "A cool badge!"
    },
    {
        id: 'quiz-1',
        title: 'Indian History Challenge',
        slug: 'indian-history-challenge',
        description: 'How well do you know the history of India? Test your knowledge!',
        gameType: 'Quiz',
        isSponsored: false,
        creator: users.find(u => u.role === 'teacher')!,
        questions: [
            {
                question: 'Who was the first Prime Minister of India?',
                options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'Subhas Chandra Bose'],
                correctAnswer: 'Jawaharlal Nehru'
            },
            {
                question: 'The Indian National Congress was founded in which year?',
                options: ['1885', '1905', '1920', '1947'],
                correctAnswer: '1885'
            },
            {
                question: 'What was the ancient name of the city of Patna?',
                options: ['Pataliputra', 'Kannauj', 'Vaishali', 'Kapilavastu'],
                correctAnswer: 'Pataliputra'
            }
        ],
        startTime: new Date(),
        endTime: addDays(new Date(), 7),
        entryFee: 10,
        prize: "500 Knowledge Coins"
    }
];

export const gameScores: GameScore[] = [
    { id: 'gs1', gameId: 'quiz-1', user: users[2], score: 3, date: '2 days ago' },
    { id: 'gs2', gameId: 'quiz-1', user: users[1], score: 2, date: '1 day ago' },
    { id: 'gs3', gameId: 'quiz-1', user: users[3], score: 3, date: '3 hours ago' },
];

export const tutors: Tutor[] = [
    {
        userId: 'u4',
        id: 'u4',
        name: 'Mr. Garcia',
        sudoName: 'prof_garcia',
        avatar: 'https://picsum.photos/seed/u4/100/100',
        role: 'teacher',
        class: 'N/A',
        bio: "Experienced teacher with 10+ years specializing in Mathematics and Physics. I focus on building strong fundamentals and problem-solving skills. Let's make learning fun and effective!",
        subjects: ['Mathematics', 'Physics', 'Science'],
        rating: 4.9,
        reviews: 85,
        price_per_hour: 800,
    },
    {
        userId: 'u1',
        id: 'u1',
        name: 'Alex Johnson',
        sudoName: 'rising_star',
        avatar: 'https://picsum.photos/seed/u1/100/100',
        role: 'student',
        class: '10th',
        bio: "As a senior student, I excel in Chemistry and Biology. I enjoy helping my peers understand complex topics in a simple way. Great for exam preparation and homework help.",
        subjects: ['Chemistry', 'Biology', 'Science'],
        rating: 4.8,
        reviews: 32,
        price_per_hour: 400,
    },
    {
        userId: 'u3',
        id: 'u3',
        name: 'Chloe Davis',
        sudoName: 'art_whiz',
        avatar: 'https://picsum.photos/seed/u3/100/100',
        role: 'student',
        class: '10th',
        bio: "Passionate about literature and history. I can help with essay writing, understanding historical events, and preparing for English exams. My goal is to make these subjects engaging.",
        subjects: ['English', 'History'],
        rating: 4.7,
        reviews: 21,
        price_per_hour: 350,
    },
];

export let partners: Partner[] = [
  { 
    name: 'Publisher A',
    slug: 'publisher-a',
    logo: 'https://placehold.co/120x60/white/black?text=Partner+A',
    description: 'Publisher A is a leading provider of K-12 educational materials, committed to creating engaging and effective learning experiences for students nationwide. They specialize in STEM subjects and digital learning tools.',
    coursesOffered: 45,
    studentsEnrolled: 12000,
    featuredCourses: [
      { id: 'fc1', title: 'Interactive Physics Lab', description: 'A hands-on virtual lab for mastering physics concepts.', imageUrl: 'https://picsum.photos/seed/fc1/600/400', price: 2999, duration: '12 Weeks', mode: 'Online' },
      { id: 'fc2', title: 'Algebra Masterclass', description: 'Comprehensive video lessons to build a strong foundation in algebra.', imageUrl: 'https://picsum.photos/seed/fc2/600/400', price: 1999, duration: '8 Weeks', mode: 'Online' },
      { id: 'fc3', title: 'Introduction to Python', description: 'A beginner-friendly course to start your coding journey with Python.', imageUrl: 'https://picsum.photos/seed/fc3/600/400', price: 4999, duration: '10 Weeks', mode: 'Hybrid' },
    ],
    one_time_fee_paid: true,
  },
  { 
    name: 'EdTech Inc.',
    slug: 'edtech-inc',
    logo: 'https://placehold.co/120x60/white/black?text=Partner+B',
    description: 'EdTech Inc. leverages technology to create innovative educational solutions. Their adaptive learning platform personalizes the learning journey for every student, ensuring better outcomes.',
    coursesOffered: 72,
    studentsEnrolled: 25000,
    featuredCourses: [
      { id: 'fc4', title: 'Adaptive Learning Path: Math', description: 'A personalized math curriculum that adapts to your learning pace.', imageUrl: 'https://picsum.photos/seed/fc4/600/400', price: 6999, duration: '6 Months', mode: 'Online' },
      { id: 'fc5', title: 'Creative Writing Workshop', description: 'Unleash your creativity with guided writing exercises and peer feedback.', imageUrl: 'https://picsum.photos/seed/fc5/600/400', price: 2499, duration: '6 Weeks', mode: 'Offline' },
    ]
  },
  { 
    name: 'Learning Co.',
    slug: 'learning-co',
    logo: 'https://placehold.co/120x60/white/black?text=Partner+C',
    description: 'Learning Co. focuses on holistic education, providing resources for both academic and personal development. Their content is designed to be engaging, accessible, and aligned with modern teaching practices.',
    coursesOffered: 60,
    studentsEnrolled: 18000,
    featuredCourses: [
      { id: 'fc6', title: 'Public Speaking for Students', description: 'Build confidence and communication skills with our expert-led course.', imageUrl: 'https://picsum.photos/seed/fc6/600/400', price: 3499, duration: '4 Weeks', mode: 'Offline' },
      { id: 'fc7', title: 'Indian History: An Overview', description: 'Explore the rich history of India from ancient to modern times.', imageUrl: 'https://picsum.photos/seed/fc7/600/400', price: 1499, duration: '12 Weeks', mode: 'Online' },
      { id: 'fc8', title: 'Financial Literacy for Teens', description: 'Learn the basics of money management, saving, and investing.', imageUrl: 'https://picsum.photos/seed/fc8/600/400', price: 999, duration: '4 Weeks', mode: 'Hybrid' },
    ]
  },
  { 
    name: 'Scholar Books',
    slug: 'scholar-books',
    logo: 'https://placehold.co/120x60/white/black?text=Partner+D',
    description: 'For over 50 years, Scholar Books has been a trusted name in academic publishing. They provide high-quality textbooks, reference materials, and exam preparation guides that are relied upon by educators and students alike.',
    coursesOffered: 150,
    studentsEnrolled: 50000,
    featuredCourses: [
       { id: 'fc9', title: 'CBSE Exam Prep Series', description: 'A complete set of guides and mock tests for Class 10 board exams.', imageUrl: 'https://picsum.photos/seed/fc9/600/400', price: 7999, duration: 'Full Year', mode: 'Offline' },
    ]
  },
];


export let currentUser: User = users[0];

// Functions to update the "database"
export const addPost = (newPost: Post) => {
    posts.unshift(newPost);
};

export const addGame = (newGame: Omit<Game, 'icon'>) => {
    games.unshift(newGame);
};

export const quests: Quest[] = [
  {
    id: 'quest1',
    title: 'Physics Fundamentals: Motion',
    description: 'Master the basic concepts of motion, from speed and velocity to acceleration.',
    subject: 'Physics',
    icon: Rocket,
    reward: 200,
    steps: [
      { id: 'q1s1', title: 'Watch: Intro to Motion', type: 'watch_video', targetId: 'p1', isCompleted: true },
      { id: 'q1s2', title: 'Answer: What is Velocity?', type: 'answer_question', targetId: 'p2', isCompleted: false },
      { id: 'q1s3', title: 'Complete: Motion Basics Quiz', type: 'complete_quiz', targetId: 'quiz-1', isCompleted: false },
    ],
  },
  {
    id: 'quest2',
    title: 'Biology Basics: The Cell',
    description: 'Explore the building blocks of life, from the cell membrane to the nucleus.',
    subject: 'Biology',
    icon: Dna,
    reward: 250,
    steps: [
      { id: 'q2s1', title: 'Watch: The Parts of a Cell', type: 'watch_video', targetId: 'p3', isCompleted: true },
      { id: 'q2s2', title: 'Watch: Photosynthesis Explained', type: 'watch_video', targetId: 'p2', isCompleted: true },
      { id: 'q2s3', title: 'Answer: Mitochondria Function', type: 'answer_question', targetId: 'p2', isCompleted: false },
      { id: 'q2s4', title: 'Complete: Cell Biology Quiz', type: 'complete_quiz', targetId: 'quiz-1', isCompleted: false },
    ],
  },
  {
    id: 'quest3',
    title: 'Indian History: The Road to Independence',
    description: 'Learn about the key events and figures in India\'s struggle for freedom.',
    subject: 'History',
    icon: FlagIcon,
    reward: 300,
    steps: [
      { id: 'q3s1', title: 'Watch: The 1857 Rebellion', type: 'watch_video', targetId: 'p3', isCompleted: false },
      { id: 'q3s2', title: 'Answer: Who was Mangal Pandey?', type: 'answer_question', targetId: 'p2', isCompleted: false },
      { id: 'q3s3', title: 'Complete: Independence Movement Quiz', type: 'complete_quiz', targetId: 'indian-history-challenge', isCompleted: false },
    ],
  },
];

export const storyReels: StoryReel[] = [
    {
        id: 'u1',
        userId: 'u1',
        username: 'Alex Johnson',
        avatar: 'https://picsum.photos/seed/u1/100/100',
        stories: [
          {
            id: 'story1',
            type: 'image',
            url: 'https://picsum.photos/seed/story1/1080/1920',
            duration: 5000,
            userId: 'u1',
            username: 'Alex Johnson',
            userAvatar: 'https://picsum.photos/seed/u1/100/100',
            createdAt: subHours(new Date(), 2),
            caption: 'Good morning! 🌞'
          },
           {
            id: 'story2',
            type: 'image',
            url: 'https://picsum.photos/seed/story2/1080/1920',
            duration: 5000,
            userId: 'u1',
            username: 'Alex Johnson',
            userAvatar: 'https://picsum.photos/seed/u1/100/100',
            createdAt: subHours(new Date(), 1),
            caption: 'Studying for my exams! Wish me luck! 📚'
          }
        ],
        updatedAt: subHours(new Date(), 1) as any,
    },
    {
        id: 'u2',
        userId: 'u2',
        username: 'Benny Smith',
        avatar: 'https://picsum.photos/seed/u2/100/100',
        stories: [
          {
            id: 'story3',
            type: 'image',
            url: 'https://picsum.photos/seed/story3/1080/1920',
            duration: 5000,
            userId: 'u2',
            username: 'Benny Smith',
            userAvatar: 'https://picsum.photos/seed/u2/100/100',
            createdAt: subHours(new Date(), 5),
            caption: 'Coding something new!'
          }
        ],
        updatedAt: subHours(new Date(), 5) as any,
    }
];
