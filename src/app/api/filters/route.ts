import { NextRequest } from 'next/server';
import NewsService from '@/lib/news-service';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const newsService = new NewsService(process.env.DB as any);
  
  try {
    const tags = await newsService.getAllTags();
    const sources = await newsService.getAllSources();
    
    return Response.json({ 
      success: true, 
      data: {
        tags,
        sources
      }
    });
  } catch (error) {
    console.error('Error fetching filters data:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch filters data' },
      { status: 500 }
    );
  }
}
