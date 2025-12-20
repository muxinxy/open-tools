import Link from 'next/link';
import { ToolCategory } from '@/types/tools';

interface CategoryCardProps {
  category: ToolCategory;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl">{category.icon}</span>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {category.name}
        </h2>
      </div>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {category.description}
      </p>
      <div className="space-y-2">
        {category.tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.path}
            className="flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>{tool.icon}</span>
            <span className="text-gray-700 dark:text-gray-300">{tool.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
