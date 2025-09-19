
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-safety-filter';
import '@/ai/flows/recommend-content';
import '@/ai/flows/translate-text';
import '@/ai/flows/award-points';
