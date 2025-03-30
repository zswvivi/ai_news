import { NewsItem } from '@/types/news';

type NewsCardProps = {
  news: NewsItem;
};

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {news.image_url && (
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={news.image_url} 
            alt={news.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center mb-2">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            {new Date(news.published_at).toLocaleDateString()}
          </span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {news.author}
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">
          {news.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
          {news.content}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {news.tags?.map((tag) => (
            <span 
              key={tag.id} 
              className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {tag.name}
            </span>
          ))}
        </div>
        <a 
          href={news.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          Read more →
        </a>
      </div>
    </div>
  );
}
