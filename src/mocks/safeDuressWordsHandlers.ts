import { http, HttpResponse } from 'msw';
import { BASE_API_URL } from '@/config/api';
import { CodeWord, WordHistory, UpdateCodeWordRequest } from '@/types/safeDuressWords';
import { v4 as uuidv4 } from 'uuid';

// Mock data
let currentWords: { safe: CodeWord; duress: CodeWord } = {
  safe: {
    id: '1',
    word: 'cat',
    type: 'safe',
    updatedAt: '2024-02-15',
    updatedBy: 'John Smith'
  },
  duress: {
    id: '2',
    word: 'dog',
    type: 'duress',
    updatedAt: '2024-02-15',
    updatedBy: 'John Smith'
  }
};

let wordHistory: WordHistory[] = [
  {
    id: '1',
    type: 'safe',
    oldWord: 'bird',
    newWord: 'cat',
    changedAt: '2024-02-15 09:00',
    changedBy: 'John Smith',
    reason: 'Quarterly security protocol update'
  },
  {
    id: '2',
    type: 'duress',
    oldWord: 'fish',
    newWord: 'dog',
    changedAt: '2024-02-15 09:00',
    changedBy: 'John Smith',
    reason: 'Quarterly security protocol update'
  }
];

// Utility functions
const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 300)); // 300-500ms delay

const filterHistory = (
  history: WordHistory[],
  type?: string,
  startDate?: string,
  endDate?: string,
  search?: string
) => {
  return history.filter(entry => {
    const matchesType = !type || entry.type === type;
    const matchesDateRange = (!startDate || new Date(entry.changedAt) >= new Date(startDate)) &&
                           (!endDate || new Date(entry.changedAt) <= new Date(endDate));
    const matchesSearch = !search || 
      entry.oldWord.toLowerCase().includes(search.toLowerCase()) ||
      entry.newWord.toLowerCase().includes(search.toLowerCase()) ||
      entry.changedBy.toLowerCase().includes(search.toLowerCase()) ||
      entry.reason.toLowerCase().includes(search.toLowerCase());
    
    return matchesType && matchesDateRange && matchesSearch;
  });
};

// MSW Handlers
export const safeDuressWordsHandlers = [
  // Get current words
  http.get(`${BASE_API_URL}/safe-duress-words/current`, async () => {
    await delay();
    console.log('📡 [MSW] GET /api/safe-duress-words/current');
    
    return HttpResponse.json({
      data: currentWords,
      message: 'Current code words retrieved successfully'
    });
  }),

  // Get word history with pagination and filters
  http.get(`${BASE_API_URL}/safe-duress-words/history`, async ({ request }) => {
    await delay();
    console.log('📡 [MSW] GET /api/safe-duress-words/history');

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const type = url.searchParams.get('type') || undefined;
    const startDate = url.searchParams.get('startDate') || undefined;
    const endDate = url.searchParams.get('endDate') || undefined;
    const search = url.searchParams.get('search') || undefined;

    const filteredHistory = filterHistory(wordHistory, type, startDate, endDate, search);
    const total = filteredHistory.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedHistory = filteredHistory.slice(start, end);

    return HttpResponse.json({
      data: paginatedHistory,
      pagination: {
        total,
        page,
        pageSize
      },
      message: 'Word history retrieved successfully'
    });
  }),

  // Get single history entry
  http.get(`${BASE_API_URL}/safe-duress-words/history/:id`, async ({ params }) => {
    await delay();
    const { id } = params;
    console.log(`📡 [MSW] GET /api/safe-duress-words/history/${id}`);

    const entry = wordHistory.find(h => h.id === id);
    if (!entry) {
      return new HttpResponse(
        JSON.stringify({
          error: 'History entry not found'
        }),
        {
          status: 404
        }
      );
    }

    return HttpResponse.json({
      data: entry,
      message: 'History entry retrieved successfully'
    });
  }),

  // Update code word
  http.put(`${BASE_API_URL}/safe-duress-words`, async ({ request }) => {
    await delay();
    console.log('📡 [MSW] PUT /api/safe-duress-words');

    const data = await request.json() as UpdateCodeWordRequest;

    // Validate request
    if (!data.word || !data.type || !data.reason || !data.authorizedCode) {
      return new HttpResponse(
        JSON.stringify({
          error: 'Missing required fields'
        }),
        {
          status: 400
        }
      );
    }

    // Validate authorization code (mock validation)
    if (data.authorizedCode !== '1234') {
      return new HttpResponse(
        JSON.stringify({
          error: 'Invalid authorization code'
        }),
        {
          status: 401
        }
      );
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);
    const currentUser = 'Current User'; // This would come from auth context

    // Update current word
    const oldWord = currentWords[data.type].word;
    currentWords[data.type] = {
      id: uuidv4(),
      word: data.word,
      type: data.type,
      updatedAt: dateStr,
      updatedBy: currentUser
    };

    // Add to history
    const historyEntry: WordHistory = {
      id: uuidv4(),
      type: data.type,
      oldWord,
      newWord: data.word,
      changedAt: `${dateStr} ${timeStr}`,
      changedBy: currentUser,
      reason: data.reason
    };
    wordHistory.unshift(historyEntry);

    return HttpResponse.json({
      data: currentWords[data.type],
      message: `${data.type === 'safe' ? 'Safe' : 'Duress'} word updated successfully`
    });
  })
]; 