import { NextRequest } from 'next/server';
import NewsUpdateService from '@/lib/news-update';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const newsUpdateService = new NewsUpdateService(process.env.DB as any);
  
  try {
    const { type, query, accounts, tweetsPerAccount } = await request.json();
    
    let result;
    if (type === 'twitter_search') {
      result = await newsUpdateService.updateNewsFromTwitterSearch(
        query || "AI agent OR autonomous AI OR LLM agent", 
        50
      );
    } else if (type === 'twitter_accounts') {
      result = await newsUpdateService.updateNewsFromAccounts(
        accounts || ['OpenAI', 'AnthropicAI', 'DeepMind'], 
        tweetsPerAccount || 10
      );
    } else {
      return Response.json(
        { success: false, error: 'Invalid update type' },
        { status: 400 }
      );
    }
    
    return Response.json(result);
  } catch (error) {
    console.error('Error updating news:', error);
    return Response.json(
      { success: false, error: 'Failed to update news' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const newsUpdateService = new NewsUpdateService(process.env.DB as any);
  
  try {
    const logs = await newsUpdateService.getUpdateLogs();
    return Response.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching update logs:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch update logs' },
      { status: 500 }
    );
  }
}
