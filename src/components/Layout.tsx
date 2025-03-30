import Navbar from '@/components/Navbar';
import { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-800 shadow-inner mt-10">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI News Hub</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Stay updated with the latest news about AI agents
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} AI News Hub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
