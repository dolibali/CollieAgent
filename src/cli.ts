/**
 * CLI 命令处理模块
 * 
 * 这个模块负责：
 * 1. 定义 CLI 命令和参数
 * 2. 处理用户输入
 * 3. 调用相应的业务逻辑函数
 * 
 * 使用 Commander.js 库来构建 CLI 界面
 * Commander.js 是一个流行的 Node.js CLI 框架，简化了命令行工具的开发
 */

// 导入 Commander 库的 Command 类
// Command 类用于创建和管理 CLI 命令
import { Command } from "commander";

// 导入业务逻辑函数
// 这些函数在 commenter.ts 中定义，负责实际的文件处理工作
import { addCommentsToFile, addCommentsToFiles } from "./commenter.js";

/**
 * 设置 CLI 命令
 * 
 * 这个函数配置了所有可用的 CLI 命令
 * 
 * @returns {Command} 配置好的 Command 对象，用于解析和执行命令
 * 
 * TypeScript 类型注解说明：
 * - function 函数名(参数: 类型): 返回类型 { ... }
 * - Command 是返回值的类型，表示这个函数返回一个 Command 对象
 */
export function setupCLI(): Command {
    // 创建一个新的 Command 实例
    // 这个对象将用来定义命令、参数、选项等
    const program = new Command();

    /**
     * 配置主程序信息
     * 
     * .name() - 设置程序名称，用于帮助信息
     * .description() - 程序的简短描述
     * .version() - 程序版本号
     * 
     * 这些信息会在用户运行 --help 时显示
     */
    program
        .name("cli-agent")  // 程序名称
        .description("一个简单的 CLI Agent，用于为代码文件添加 AI 生成的注释")
        .version("1.0.0");  // 版本号

    /**
     * 定义 "comment" 子命令
     * 
     * 用户可以通过运行 "npm start comment <文件>" 来使用这个命令
     * 
     * 命令结构：
     * - command("comment") - 定义子命令名称
     * - description() - 命令的描述
     * - argument() - 定义命令参数
     * - option() - 定义命令选项（可选参数）
     * - action() - 定义命令执行时的回调函数
     */
    program
        .command("comment")  // 子命令名称：comment
        .description("为代码文件添加注释")  // 命令描述
        /**
         * 定义命令参数
         * 
         * "<files...>" 中的 ... 表示可以接受多个参数
         * 例如：comment file1.ts file2.js file3.py
         * files 会是一个数组：["file1.ts", "file2.js", "file3.py"]
         */
        .argument("<files...>", "要处理的文件路径（支持多个文件）")
        /**
         * 定义命令选项
         * 
         * "--no-backup" 是一个布尔选项
         * - 默认情况下，backup 为 true（会创建备份）
         * - 使用 --no-backup 时，backup 变为 false
         * 
         * 例如：
         * - npm start comment file.ts（会创建备份）
         * - npm start comment file.ts --no-backup（不创建备份）
         */
        .option(
            "--no-backup",
            "不创建备份文件（默认会创建 .backup 文件）"
        )
        /**
         * 定义命令执行时的动作
         * 
         * action() 接收一个回调函数，当用户执行命令时会调用这个函数
         * 
         * async 关键字：表示这是一个异步函数
         * - 异步函数可以使用 await 关键字等待异步操作完成
         * - 例如：等待文件读取、API 调用等
         * 
         * 参数说明：
         * - files: string[] - 用户输入的文件路径数组
         * - options: { backup: boolean } - 命令选项对象
         *   TypeScript 的类型注解 { backup: boolean } 表示这是一个对象，有一个 backup 属性，类型是 boolean
         */
        .action(async (files: string[], options: { backup: boolean }) => {
            /**
             * try-catch 错误处理
             * 
             * try 块：尝试执行可能出错的代码
             * catch 块：如果出错，捕获错误并处理
             * 
             * 为什么要用 try-catch？
             * - 文件可能不存在
             * - API 调用可能失败
             * - 网络可能有问题
             * - 使用 try-catch 可以让程序优雅地处理错误，而不是直接崩溃
             */
            try {
                // 验证用户是否提供了文件路径
                // files.length 获取数组的长度
                if (files.length === 0) {
                    // console.error 输出错误信息（红色）
                    console.error("错误: 请至少指定一个文件路径");
                    // process.exit(1) 退出程序，1 表示异常退出
                    // 0 表示正常退出，非 0 表示有错误
                    process.exit(1);
                }

                // 使用模板字符串输出信息
                // ${} 是模板字符串的插值语法，可以在字符串中嵌入变量
                // \n 是换行符
                console.log(`准备处理 ${files.length} 个文件...\n`);

                /**
                 * 调用业务逻辑函数
                 * 
                 * await 关键字：等待异步操作完成
                 * - addCommentsToFiles 是一个异步函数（返回 Promise）
                 * - await 会暂停当前函数的执行，直到 Promise 完成
                 * - 完成后，结果会赋值给 results
                 * 
                 * 为什么需要 await？
                 * - 文件读取、API 调用都是异步操作，需要时间
                 * - 不使用 await 的话，代码会继续执行，但结果还没准备好
                 * - await 确保我们拿到结果后再继续
                 */
                const results = await addCommentsToFiles(files, options.backup);

                // 输出处理结果
                console.log("\n处理完成:");
                /**
                 * forEach 方法：遍历数组中的每个元素
                 * 
                 * results.forEach((result) => { ... })
                 * - result 是数组中的每个元素
                 * - => 是箭头函数语法，等同于 function(result) { ... }
                 * - 箭头函数是 ES6 的语法糖，更简洁
                 */
                results.forEach((result) => {
                    console.log(`  ✓ ${result}`);  // ✓ 是 Unicode 字符，显示为勾号
                });
            } catch (error) {
                /**
                 * 错误处理
                 * 
                 * error instanceof Error 是类型检查
                 * - 检查 error 是否是 Error 类型的实例
                 * - 如果是，可以安全地访问 .message 属性
                 * - 这是 TypeScript/JavaScript 的类型守卫（type guard）
                 * 
                 * 为什么要检查类型？
                 * - catch 捕获的 error 类型是 unknown
                 * - 不能直接访问 .message，需要先确认类型
                 */
                console.error("错误:", error instanceof Error ? error.message : error);
                process.exit(1);  // 异常退出
            }
        });

    // 返回配置好的 program 对象
    // 在 index.ts 中会调用 program.parse() 来解析和执行命令
    return program;
}
