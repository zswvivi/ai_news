import { D1Database } from '@cloudflare/workers-types';
import { NewsItem, NewsFilter, NewsTag, NewsSource } from '@/types/news';

export class NewsService {
  constructor(private db: D1Database) {}

  /**
   * Get all news items with optional filtering
   */
  async getNews(filters: NewsFilter = {}): Promise<NewsItem[]> {
    try {
      let query = `
        SELECT 
          n.id, n.source_id, n.title, n.content, n.summary, n.url, 
          n.image_url, n.author, n.published_at, n.external_id, 
          n.created_at, n.updated_at,
          s.id as source_id, s.name as source_name, s.type as source_type, s.url as source_url
        FROM ai_news n
        LEFT JOIN news_sources s ON n.source_id = s.id
      `;
      
      const whereConditions = [];
      const params: any[] = [];
      
      if (filters.tag) {
        query += `
          JOIN news_tag_relations ntr ON n.id = ntr.news_id
          JOIN news_tags t ON ntr.tag_id = t.id
        `;
        whereConditions.push('t.name = ?');
        params.push(filters.tag);
      }
      
      if (filters.source) {
        whereConditions.push('s.name = ?');
        params.push(filters.source);
      }
      
      if (filters.search) {
        whereConditions.push('(n.title LIKE ? OR n.content LIKE ?)');
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      query += ' ORDER BY n.published_at DESC';
      
      // Add pagination
      const limit = filters.limit || 12;
      const page = filters.page || 1;
      const offset = (page - 1) * limit;
      
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      let stmt = this.db.prepare(query);
      for (const param of params) {
        stmt = stmt.bind(param);
      }
      
      const results = await stmt.all();
      
      if (!results.results || results.results.length === 0) {
        return [];
      }
      
      // Get tags for each news item
      const newsItems = await Promise.all(
        results.results.map(async (item: any) => {
          const tags = await this.getNewsItemTags(item.id);
          
          return {
            id: item.id,
            source_id: item.source_id,
            title: item.title,
            content: item.content,
            summary: item.summary,
            url: item.url,
            image_url: item.image_url,
            author: item.author,
            published_at: item.published_at,
            external_id: item.external_id,
            created_at: item.created_at,
            updated_at: item.updated_at,
            tags,
            source: item.source_id ? {
              id: item.source_id,
              name: item.source_name,
              type: item.source_type,
              url: item.source_url
            } : undefined
          };
        })
      );
      
      return newsItems;
    } catch (error) {
      console.error('Error getting news:', error);
      return [];
    }
  }
  
  /**
   * Get a single news item by ID
   */
  async getNewsById(id: number): Promise<NewsItem | null> {
    try {
      const result = await this.db.prepare(`
        SELECT 
          n.id, n.source_id, n.title, n.content, n.summary, n.url, 
          n.image_url, n.author, n.published_at, n.external_id, 
          n.created_at, n.updated_at,
          s.id as source_id, s.name as source_name, s.type as source_type, s.url as source_url
        FROM ai_news n
        LEFT JOIN news_sources s ON n.source_id = s.id
        WHERE n.id = ?
      `).bind(id).first();
      
      if (!result) {
        return null;
      }
      
      const tags = await this.getNewsItemTags(id);
      
      return {
        id: result.id,
        source_id: result.source_id,
        title: result.title,
        content: result.content,
        summary: result.summary,
        url: result.url,
        image_url: result.image_url,
        author: result.author,
        published_at: result.published_at,
        external_id: result.external_id,
        created_at: result.created_at,
        updated_at: result.updated_at,
        tags,
        source: result.source_id ? {
          id: result.source_id,
          name: result.source_name,
          type: result.source_type,
          url: result.source_url
        } : undefined
      };
    } catch (error) {
      console.error('Error getting news by ID:', error);
      return null;
    }
  }
  
  /**
   * Get tags for a news item
   */
  private async getNewsItemTags(newsId: number): Promise<NewsTag[]> {
    try {
      const results = await this.db.prepare(`
        SELECT t.id, t.name
        FROM news_tags t
        JOIN news_tag_relations ntr ON t.id = ntr.tag_id
        WHERE ntr.news_id = ?
      `).bind(newsId).all();
      
      if (!results.results || results.results.length === 0) {
        return [];
      }
      
      return results.results as NewsTag[];
    } catch (error) {
      console.error('Error getting news item tags:', error);
      return [];
    }
  }
  
  /**
   * Get all available tags
   */
  async getAllTags(): Promise<NewsTag[]> {
    try {
      const results = await this.db.prepare(`
        SELECT id, name FROM news_tags ORDER BY name
      `).all();
      
      if (!results.results || results.results.length === 0) {
        return [];
      }
      
      return results.results as NewsTag[];
    } catch (error) {
      console.error('Error getting all tags:', error);
      return [];
    }
  }
  
  /**
   * Get all available sources
   */
  async getAllSources(): Promise<NewsSource[]> {
    try {
      const results = await this.db.prepare(`
        SELECT id, name, type, url, description FROM news_sources ORDER BY name
      `).all();
      
      if (!results.results || results.results.length === 0) {
        return [];
      }
      
      return results.results as NewsSource[];
    } catch (error) {
      console.error('Error getting all sources:', error);
      return [];
    }
  }
}

export default NewsService;
