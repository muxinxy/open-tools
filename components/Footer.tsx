export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛠️</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              开源工具箱
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Open Tools. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
