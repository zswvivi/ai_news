import { NextRequest } from 'next/server';
import NewsService from '@/lib/news-service';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag') || undefined;
  const source = searchParams.get('source') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);

  const newsService = new NewsService(process.env.DB as any);
  
  try {
    const news = await newsService.getNews({
      tag,
      source,
      search,
      page,
      limit
    });
    
    return Response.json({ success: true, news });
  } catch (error) {
    console.error('Error fetching news:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
