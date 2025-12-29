import CategoryCard from '@/components/CategoryCard';
import { toolCategories } from '@/lib/tools-data';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
          开源工具箱
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          一站式在线工具平台，提供视频、音频、图片、文档等多种实用工具
        </p>
      </div>

      {/* Tool Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {toolCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {/* Feature Section */}
      <div className="mt-16">
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
          为什么选择我们
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 text-4xl">🚀</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              快速高效
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              在线处理，无需下载安装，即开即用
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 text-4xl">🔒</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              安全可靠
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              本地处理，保护您的数据隐私
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 text-4xl">💯</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              完全免费
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              开源项目，永久免费使用
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
