import { D1Database } from '@cloudflare/workers-types';
import TwitterNewsClient from './twitter-api';

/**
 * Service for collecting and storing AI news from Twitter
 */
export class NewsCollectionService {
  constructor(db: D1Database) {
    this.db = db;
    this.twitterClient = new TwitterNewsClient();
  }

  /**
   * Process tweets from search results and store them in the database
   * @param searchResults - Twitter search results
   */
  async processAndStoreTweets(searchResults) {
    try {
      if (!searchResults?.result?.timeline?.instructions) {
        console.error('Invalid search results format');
        return;
      }

      // Find the entries in the search results
      let entries = [];
      for (const instruction of searchResults.result.timeline.instructions) {
        if (instruction.entries) {
          entries = instruction.entries;
          break;
        }
      }

      if (!entries.length) {
        console.log('No tweets found in search results');
        return;
      }

      // Process each tweet entry
      for (const entry of entries) {
        // Skip non-tweet entries
        if (!entry.content?.items && !entry.content?.itemContent?.tweet_results?.result) {
          continue;
        }

        // Handle different entry formats
        let tweetData;
        if (entry.content?.items) {
          // Process timeline entries with multiple items
          for (const item of entry.content.items) {
            if (item.item?.itemContent?.tweet_results?.result) {
              await this.processTweetResult(item.item.itemContent.tweet_results.result);
            }
          }
        } else if (entry.content?.itemContent?.tweet_results?.result) {
          // Process single tweet entry
          await this.processTweetResult(entry.content.itemContent.tweet_results.result);
        }
      }

      console.log('Tweets processed and stored successfully');
    } catch (error) {
      console.error('Error processing tweets:', error);
      throw error;
    }
  }

  /**
   * Process a single tweet result and store it in the database
   * @param tweetResult - Twitter tweet result object
   */
  async processTweetResult(tweetResult) {
    try {
      if (!tweetResult) return;

      // Extract tweet data
      const tweet = tweetResult.legacy || {};
      const user = tweetResult.core?.user_results?.result?.legacy || {};
      
      if (!tweet.id_str || !tweet.full_text) {
        console.log('Skipping invalid tweet');
        return;
      }

      // Check if this tweet already exists in the database
      const existingTweet = await this.db.prepare(
        'SELECT id FROM ai_news WHERE external_id = ?'
      ).bind(tweet.id_str).first();

      if (existingTweet) {
        console.log(`Tweet ${tweet.id_str} already exists in database`);
        return;
      }

      // Get or create source
      let sourceId;
      const existingSource = await this.db.prepare(
        'SELECT id FROM news_sources WHERE name = ? AND type = ?'
      ).bind(user.screen_name || 'Unknown', 'twitter').first();

      if (existingSource) {
        sourceId = existingSource.id;
      } else {
        // Create new source
        const result = await this.db.prepare(
          'INSERT INTO news_sources (name, type, url, description) VALUES (?, ?, ?, ?)'
        ).bind(
          user.screen_name || 'Unknown',
          'twitter',
          user.screen_name ? `https://twitter.com/${user.screen_name}` : null,
          user.description || null
        ).run();
        
        sourceId = result.meta?.last_row_id;
      }

      // Insert tweet into ai_news table
      const tweetUrl = `https://twitter.com/${user.screen_name}/status/${tweet.id_str}`;
      const mediaUrl = tweet.entities?.media?.[0]?.media_url_https || null;
      
      await this.db.prepare(
        `INSERT INTO ai_news (
          source_id, title, content, url, image_url, author, 
          published_at, external_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      ).bind(
        sourceId,
        tweet.full_text.substring(0, 100), // Use first 100 chars as title
        tweet.full_text,
        tweetUrl,
        mediaUrl,
        user.name || user.screen_name || 'Unknown',
        new Date(tweet.created_at).toISOString(),
        tweet.id_str
      ).run();

      // Add tags based on content
      await this.addTagsToNews(tweet.id_str, tweet.full_text);
      
      console.log(`Stored tweet ${tweet.id_str} from ${user.screen_name || 'Unknown'}`);
    } catch (error) {
      console.error('Error processing tweet result:', error);
      // Continue processing other tweets
    }
  }

  /**
   * Add relevant tags to a news item based on content
   * @param tweetId - External ID of the tweet
   * @param content - Tweet content
   */
  async addTagsToNews(tweetId, content) {
    try {
      // Get the news ID from external_id
      const newsItem = await this.db.prepare(
        'SELECT id FROM ai_news WHERE external_id = ?'
      ).bind(tweetId).first();
      
      if (!newsItem) return;
      
      // Define tag keywords to look for
      const tagKeywords = {
        'AI Agent': ['ai agent', 'autonomous agent', 'ai assistant'],
        'LLM': ['llm', 'large language model', 'gpt', 'claude', 'gemini'],
        'Autonomous AI': ['autonomous ai', 'self-directed', 'agentic'],
        'AI Assistant': ['assistant', 'chatbot', 'copilot'],
        'AI Research': ['research', 'paper', 'study', 'findings']
      };
      
      // Check content for each tag keyword
      for (const [tagName, keywords] of Object.entries(tagKeywords)) {
        const contentLower = content.toLowerCase();
        const hasKeyword = keywords.some(keyword => contentLower.includes(keyword));
        
        if (hasKeyword) {
          // Get tag ID
          const tag = await this.db.prepare(
            'SELECT id FROM news_tags WHERE name = ?'
          ).bind(tagName).first();
          
          if (tag) {
            // Add tag relation
            await this.db.prepare(
              'INSERT OR IGNORE INTO news_tag_relations (news_id, tag_id) VALUES (?, ?)'
            ).bind(newsItem.id, tag.id).run();
          }
        }
      }
    } catch (error) {
      console.error('Error adding tags to news:', error);
    }
  }

  /**
   * Collect AI news from Twitter
   * @param query - Search query for AI news
   * @param count - Number of tweets to fetch
   * @returns {Promise<Object>} - Collection results
   */
  async collectNewsFromTwitter(query = "AI agent OR autonomous AI OR LLM agent", count = 50) {
    try {
      console.log(`Collecting AI news from Twitter with query: ${query}`);
      
      // Search for tweets
      const searchResults = await this.twitterClient.searchTweets(query, count, "Latest");
      
      // Process and store tweets
      await this.processAndStoreTweets(searchResults);
      
      return {
        success: true,
        message: `Collected and processed ${count} tweets about AI agents`
      };
    } catch (error) {
      console.error('Error collecting news from Twitter:', error);
      return {
        success: false,
        message: `Error collecting news: ${error.message}`
      };
    }
  }

  /**
   * Collect news from specific AI-focused Twitter accounts
   * @param accounts - Array of Twitter usernames to collect from
   * @param tweetsPerAccount - Number of tweets to collect per account
   * @returns {Promise<Object>} - Collection results
   */
  async collectNewsFromAccounts(accounts = ['OpenAI', 'AnthropicAI', 'DeepMind'], tweetsPerAccount = 10) {
    try {
      console.log(`Collecting AI news from accounts: ${accounts.join(', ')}`);
      let totalTweets = 0;
      
      for (const username of accounts) {
        // Get user profile to get the user ID
        const profile = await this.twitterClient.getUserProfile(username);
        const userId = profile?.result?.data?.user?.result?.rest_id;
        
        if (!userId) {
          console.log(`Could not find user ID for ${username}`);
          continue;
        }
        
        // Get user tweets
        const tweets = await this.twitterClient.getUserTweets(userId, tweetsPerAccount);
        
        // Process and store tweets
        await this.processAndStoreTweets(tweets);
        totalTweets += tweetsPerAccount;
      }
      
      return {
        success: true,
        message: `Collected and processed ${totalTweets} tweets from ${accounts.length} AI-focused accounts`
      };
    } catch (error) {
      console.error('Error collecting news from accounts:', error);
      return {
        success: false,
        message: `Error collecting news from accounts: ${error.message}`
      };
    }
  }
}

export default NewsCollectionService;
