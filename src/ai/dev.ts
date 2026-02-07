import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-move.ts';
import '@/ai/flows/generate-opening.ts';
import '@/ai/flows/explain-move.ts';