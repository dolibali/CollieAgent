#!/usr/bin/env node
/**
 * 这个 shebang 行告诉系统使用 node 来执行这个脚本
 * 当文件被直接执行时（如 ./dist/index.js），系统会找到 node 解释器
 */

/**
 * CLI Agent 入口文件
 * 
 * 这是整个应用的入口点，负责：
 * 1. 加载环境变量配置
 * 2. 初始化 CLI 命令系统
 * 3. 解析用户输入的命令
 * 
 * 执行流程：
 * 用户运行命令 → 这个文件被加载 → 设置 CLI → 解析命令 → 执行相应操作
 */

// 导入 dotenv 配置模块
// "dotenv/config" 会自动加载项目根目录下的 .env 文件中的环境变量
// 这样我们就可以通过 process.env.变量名 来访问环境变量
import "dotenv/config";

// 从 cli.ts 模块导入 setupCLI 函数
// 注意：TypeScript 编译后，.ts 文件会变成 .js，所以导入时使用 .js 扩展名
// 这是 ES Module 的导入语法
import { setupCLI } from "./cli.js";

/**
 * 检查环境变量是否已设置
 * 
 * process.env 是 Node.js 的全局对象，包含所有环境变量
 * DASHSCOPE_API_KEY 是我们需要的 API 密钥
 * 
 * 为什么要检查？
 * - 如果没有 API Key，后续的 API 调用会失败
 * - 提前检查可以给用户友好的提示，而不是等到 API 调用时才报错
 */
if (!process.env.DASHSCOPE_API_KEY) {
    // console.warn 输出警告信息（黄色），不会中断程序执行
    // 使用 \n 来换行，让输出更易读
    console.warn(
        "警告: 未设置 DASHSCOPE_API_KEY 环境变量\n" +
        "请设置环境变量: export DASHSCOPE_API_KEY=your_api_key\n" +
        "或创建 .env 文件并添加: DASHSCOPE_API_KEY=your_api_key"
    );
}

/**
 * 启动 CLI 程序
 * 
 * 1. setupCLI() 返回一个 Command 对象（来自 commander 库）
 * 2. program.parse() 解析命令行参数，并执行相应的命令
 * 
 * 例如：用户输入 "npm start comment src/example.ts"
 * - parse() 会识别 "comment" 命令
 * - 提取参数 "src/example.ts"
 * - 调用对应的 action 函数
 */
const program = setupCLI();
program.parse();
