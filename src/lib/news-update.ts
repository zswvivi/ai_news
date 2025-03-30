import { D1Database } from '@cloudflare/workers-types';
import NewsCollectionService from './news-collection';

/**
 * Service for scheduling and managing automatic news updates
 */
export class NewsUpdateService {
  private db: D1Database;
  private newsCollectionService: NewsCollectionService;

  constructor(db: D1Database) {
    this.db = db;
    this.newsCollectionService = new NewsCollectionService(db);
  }

  /**
   * Update news from Twitter based on search query
   * @param query - Search query for AI news
   * @param count - Number of tweets to fetch
   */
  async updateNewsFromTwitterSearch(query = "AI agent OR autonomous AI OR LLM agent", count = 50) {
    console.log(`Updating news from Twitter search with query: ${query}`);
    
    try {
      // Record update attempt
      await this.recordUpdateAttempt('twitter_search', query);
      
      // Collect news from Twitter
      const result = await this.newsCollectionService.collectNewsFromTwitter(query, count);
      
      // Record update result
      await this.recordUpdateResult('twitter_search', result.success, result.message);
      
      return result;
    } catch (error) {
      console.error('Error updating news from Twitter search:', error);
      
      // Record update failure
      await this.recordUpdateResult('twitter_search', false, error.message);
      
      return {
        success: false,
        message: `Error updating news: ${error.message}`
      };
    }
  }

  /**
   * Update news from specific AI-focused Twitter accounts
   * @param accounts - Array of Twitter usernames to collect from
   * @param tweetsPerAccount - Number of tweets to collect per account
   */
  async updateNewsFromAccounts(accounts = ['OpenAI', 'AnthropicAI', 'DeepMind'], tweetsPerAccount = 10) {
    console.log(`Updating news from accounts: ${accounts.join(', ')}`);
    
    try {
      // Record update attempt
      await this.recordUpdateAttempt('twitter_accounts', accounts.join(','));
      
      // Collect news from accounts
      const result = await this.newsCollectionService.collectNewsFromAccounts(accounts, tweetsPerAccount);
      
      // Record update result
      await this.recordUpdateResult('twitter_accounts', result.success, result.message);
      
      return result;
    } catch (error) {
      console.error('Error updating news from accounts:', error);
      
      // Record update failure
      await this.recordUpdateResult('twitter_accounts', false, error.message);
      
      return {
        success: false,
        message: `Error updating news from accounts: ${error.message}`
      };
    }
  }

  /**
   * Record an update attempt in the database
   * @param type - Type of update (twitter_search, twitter_accounts)
   * @param params - Parameters used for the update
   */
  private async recordUpdateAttempt(type: string, params: string) {
    try {
      await this.db.prepare(`
        INSERT INTO update_logs (type, params, status, started_at)
        VALUES (?, ?, 'in_progress', CURRENT_TIMESTAMP)
      `).bind(type, params).run();
    } catch (error) {
      console.error('Error recording update attempt:', error);
    }
  }

  /**
   * Record an update result in the database
   * @param type - Type of update (twitter_search, twitter_accounts)
   * @param success - Whether the update was successful
   * @param message - Result message
   */
  private async recordUpdateResult(type: string, success: boolean, message: string) {
    try {
      await this.db.prepare(`
        UPDATE update_logs
        SET status = ?, message = ?, completed_at = CURRENT_TIMESTAMP
        WHERE type = ? AND status = 'in_progress'
        ORDER BY started_at DESC
        LIMIT 1
      `).bind(success ? 'success' : 'failed', message, type).run();
    } catch (error) {
      console.error('Error recording update result:', error);
    }
  }

  /**
   * Get the latest update logs
   * @param limit - Maximum number of logs to return
   */
  async getUpdateLogs(limit = 10) {
    try {
      const result = await this.db.prepare(`
        SELECT id, type, params, status, message, started_at, completed_at
        FROM update_logs
        ORDER BY started_at DESC
        LIMIT ?
      `).bind(limit).all();
      
      return result.results || [];
    } catch (error) {
      console.error('Error getting update logs:', error);
      return [];
    }
  }
}

export default NewsUpdateService;
