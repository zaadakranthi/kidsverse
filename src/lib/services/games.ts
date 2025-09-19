
'use server';

import { getFirebaseAdmin } from '@/lib/firebase-admin';
import type { Game, GameScore, User } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { games as mockGames, gameScores as mockGameScores } from '@/lib/data';

export const createGame = async (
    gameData: Omit<Game, 'id' | 'icon' | 'slug' | 'creator'>,
    creatorInfo: Pick<User, 'id' | 'name' | 'sudoName' | 'avatar'>
): Promise<Omit<Game, 'icon'>> => {
    if (!creatorInfo) {
        throw new Error("User must be logged in to create a game");
    }
    const { adminDb } = await getFirebaseAdmin();
    const gameRef = adminDb.collection('games').doc();
    const slug = gameData.title.toLowerCase().replace(/\s+/g, '-');

    const newGame = {
        ...gameData,
        slug: slug,
        creatorId: creatorInfo.id,
        creatorInfo: creatorInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await gameRef.set(newGame);
    
    return {
        ...newGame,
        id: gameRef.id,
        creator: creatorInfo,
    };
};


export const getGames = async (): Promise<Omit<Game, 'icon'>[]> => {
  try {
    const { adminDb } = await getFirebaseAdmin();
    const gamesSnapshot = await adminDb.collection('games').orderBy('createdAt', 'desc').get();
    
    if (gamesSnapshot.empty) {
        console.log("No games found in database, returning mock data.");
        // Return mock games without the icon component
        return mockGames.map(({ icon, ...rest }) => rest);
    }

    const games: Omit<Game, 'icon'>[] = gamesSnapshot.docs.map(doc => {
        const data = doc.data();
        
        const { icon, ...rest } = {
            id: doc.id,
            ...data,
            creator: data.creatorInfo || { id: 'unknown', name: 'Unknown', sudoName: 'unknown', avatar: '' }
        } as Game;
        return rest;
    });
    
    return games;
  } catch (error) {
    console.error("Error fetching games: ", error);
    // Return mock games without the icon component on error
    return mockGames.map(({ icon, ...rest }) => rest);
  }
}

export const getGameScores = async (): Promise<GameScore[]> => {
  try {
    const { adminDb } = await getFirebaseAdmin();
    const scoresSnapshot = await adminDb.collectionGroup('scores').orderBy('playedAt', 'desc').limit(50).get();
    
    if (scoresSnapshot.empty) {
        console.log("No game scores found in database, returning mock data.");
        return mockGameScores;
    }
    
    return scoresSnapshot.docs.map(doc => {
        const data = doc.data();
        const playedAt = (data.playedAt as FirebaseFirestore.Timestamp).toDate();
        return {
            id: doc.id,
            gameId: doc.ref.parent.parent!.id,
            user: data.userInfo,
            score: data.score,
            date: formatDistanceToNow(playedAt) + ' ago'
        } as GameScore
    });

  } catch(error) {
    console.error("Error fetching game scores: ", error);
    return mockGameScores; // Fallback to mock data on error
  }
}
