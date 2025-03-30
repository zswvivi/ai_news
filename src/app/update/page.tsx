'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

interface UpdateLog {
  id: number;
  type: string;
  params: string;
  status: string;
  message: string;
  started_at: string;
  completed_at: string;
}

export default function UpdatePage() {
  const [logs, setLogs] = useState<UpdateLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateType, setUpdateType] = useState('twitter_search');
  const [searchQuery, setSearchQuery] = useState('AI agent OR autonomous AI OR LLM agent');
  const [accounts, setAccounts] = useState('OpenAI,AnthropicAI,DeepMind');
  const [updateResult, setUpdateResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch update logs
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/update');
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching update logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    setUpdateResult(null);
    
    try {
      const payload = {
        type: updateType,
        query: updateType === 'twitter_search' ? searchQuery : undefined,
        accounts: updateType === 'twitter_accounts' ? accounts.split(',').map(a => a.trim()) : undefined
      };
      
      const response = await fetch('/api/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      setUpdateResult(result);
      
      // Refresh logs after update
      fetchLogs();
    } catch (error) {
      console.error('Error triggering update:', error);
      setUpdateResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Update News</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Manually trigger updates to fetch the latest AI news
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Update Settings</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Update Type
                </label>
                <select
                  value={updateType}
                  onChange={(e) => setUpdateType(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="twitter_search">Twitter Search</option>
                  <option value="twitter_accounts">Twitter Accounts</option>
                </select>
              </div>
              
              {updateType === 'twitter_search' ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search Query
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter search query"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Twitter Accounts
                  </label>
                  <input
                    type="text"
                    value={accounts}
                    onChange={(e) => setAccounts(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Comma-separated accounts"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter comma-separated Twitter usernames
                  </p>
                </div>
              )}
              
              <button
                onClick={handleUpdate}
                disabled={updating}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  updating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {updating ? 'Updating...' : 'Update Now'}
              </button>
              
              {updateResult && (
                <div className={`mt-4 p-3 rounded-md ${
                  updateResult.success
                    ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {updateResult.message}
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Update History</h2>
                <button
                  onClick={fetchLogs}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Refresh
                </button>
              </div>
              
              {loading ? (
                <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                  Loading update logs...
                </div>
              ) : logs.length === 0 ? (
                <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                  No update logs found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Started
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Completed
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {log.type === 'twitter_search' ? 'Twitter Search' : 'Twitter Accounts'}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {log.params}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              log.status === 'success'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : log.status === 'in_progress'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {log.status}
                            </span>
                            {log.message && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {log.message}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(log.started_at)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(log.completed_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
