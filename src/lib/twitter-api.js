import { ApiClient } from '/opt/.manus/.sandbox-runtime/data_api';

/**
 * Twitter API client for fetching AI-related news
 */
export class TwitterNewsClient {
  constructor() {
    this.client = new ApiClient();
  }

  /**
   * Search Twitter for AI agent related tweets
   * @param {string} query - Search query
   * @param {number} count - Number of tweets to return
   * @param {string} type - Type of search (Top, Latest)
   * @param {string} cursor - Pagination cursor
   * @returns {Promise<Object>} - Twitter search results
   */
  async searchTweets(query = "AI agent", count = 20, type = "Latest", cursor = "") {
    try {
      const response = await this.client.call_api('Twitter/search_twitter', {
        query,
        count,
        type,
        cursor
      });
      return response;
    } catch (error) {
      console.error('Error searching tweets:', error);
      throw error;
    }
  }

  /**
   * Get user profile by username
   * @param {string} username - Twitter username
   * @returns {Promise<Object>} - User profile data
   */
  async getUserProfile(username) {
    try {
      const response = await this.client.call_api('Twitter/get_user_profile_by_username', {
        username
      });
      return response;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Get tweets from a specific user
   * @param {string} userId - User's rest_id
   * @param {number} count - Number of tweets to return
   * @param {string} cursor - Pagination cursor
   * @returns {Promise<Object>} - User's tweets
   */
  async getUserTweets(userId, count = 20, cursor = "") {
    try {
      const response = await this.client.call_api('Twitter/get_user_tweets', {
        user: userId,
        count,
        cursor
      });
      return response;
    } catch (error) {
      console.error('Error getting user tweets:', error);
      throw error;
    }
  }
}

export default TwitterNewsClient;
