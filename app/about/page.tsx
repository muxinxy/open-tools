export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
          关于开源工具箱
        </h1>
        
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              项目简介
            </h2>
            <p className="leading-relaxed">
              开源工具箱是一个功能丰富的在线工具平台，旨在为用户提供便捷、高效的在线工具服务。
              我们提供了多种类型的工具，包括视频工具、音频工具、图片工具、文档处理、文档转换、
              数据图表、智能文本、办公辅助、文本工具、数字工具、加密工具和单位转换等。
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              主要特点
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>完全免费开源</li>
              <li>无需注册登录</li>
              <li>本地处理，保护隐私</li>
              <li>支持多种工具类型</li>
              <li>界面简洁易用</li>
              <li>响应式设计，支持移动设备</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              工具分类
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  🎬 视频工具
                </h3>
                <p className="text-sm">视频格式转换、压缩等</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  🎵 音频工具
                </h3>
                <p className="text-sm">音频格式转换、剪辑等</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  🖼️ 图片工具
                </h3>
                <p className="text-sm">图片格式转换、压缩、调整大小等</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  📄 文档处理
                </h3>
                <p className="text-sm">PDF合并、拆分等</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  📝 文档转换
                </h3>
                <p className="text-sm">Word转PDF、PDF转Word等</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  📊 数据图表
                </h3>
                <p className="text-sm">图表生成、数据可视化等</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  🤖 智能文本
                </h3>
                <p className="text-sm">文本分析、摘要生成等</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  💼 办公辅助
                </h3>
                <p className="text-sm">二维码生成、条形码生成等</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  📃 文本工具
                </h3>
                <p className="text-sm">文本格式化、对比、字数统计等</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  🔢 数字工具
                </h3>
                <p className="text-sm">计算器、进制转换等</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  🔐 加密工具
                </h3>
                <p className="text-sm">哈希生成、Base64编码、URL编码等</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  ⚖️ 单位转换
                </h3>
                <p className="text-sm">长度、重量、温度等单位转换</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              技术栈
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Next.js 16 - React框架</li>
              <li>TypeScript - 类型安全</li>
              <li>Tailwind CSS - 样式框架</li>
              <li>React 19 - UI库</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              开源协议
            </h2>
            <p className="leading-relaxed">
              本项目采用开源协议，欢迎大家使用、修改和分发。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
