/**
 * 代码注释处理模块
 * 
 * 这个模块负责文件操作和业务流程协调：
 * 1. 读取代码文件
 * 2. 调用 AI Agent 生成注释
 * 3. 创建备份文件（可选）
 * 4. 将带注释的代码写回文件
 * 
 * 这是业务逻辑层，连接 CLI 层和 AI Agent 层
 */

/**
 * 导入 Node.js 文件系统模块
 * 
 * fs/promises: Promise 版本的 fs 模块
 * - readFile: 异步读取文件（返回 Promise）
 * - writeFile: 异步写入文件（返回 Promise）
 * 
 * 为什么使用 promises 版本？
 * - 传统的 fs 模块使用回调函数（callback），代码嵌套深
 * - Promise 版本可以使用 async/await，代码更清晰
 * 
 * 例如：
 * - 旧方式：fs.readFile(path, (err, data) => { ... })
 * - 新方式：const data = await readFile(path)
 */
import { readFile, writeFile } from "fs/promises";

/**
 * 导入同步文件系统函数
 * 
 * existsSync: 同步检查文件是否存在
 * - 同步函数：立即返回结果，不需要 await
 * - 适合简单的检查操作
 */
import { existsSync } from "fs";

/**
 * 导入路径处理函数
 * 
 * extname: 提取文件扩展名
 * - 例如：extname("src/example.ts") 返回 ".ts"
 */
import { extname } from "path";

/**
 * 导入 AI Agent 函数
 * 
 * generateComments: 调用 AI 生成注释的核心函数
 */
import { generateComments } from "./agent.js";

/**
 * 为单个代码文件添加注释
 * 
 * 这是处理单个文件的完整流程：
 * 1. 验证文件存在
 * 2. 读取文件内容
 * 3. 调用 AI 生成注释
 * 4. 创建备份（可选）
 * 5. 写回带注释的代码
 * 
 * @param filePath - 要处理的文件路径（相对路径或绝对路径）
 * @param backup - 是否创建备份文件（默认 true）
 *                 备份文件名为原文件名 + ".backup"
 * @returns Promise<string> - 处理结果的成功消息
 * 
 * 函数签名说明：
 * - export: 导出函数，供其他模块使用
 * - async: 异步函数，可以使用 await
 * - Promise<string>: 返回一个 Promise，成功时解析为字符串
 */
export async function addCommentsToFile(
    filePath: string,
    backup: boolean = true  // 默认参数：如果不传 backup，默认为 true
): Promise<string> {
    /**
     * 步骤 1: 验证文件是否存在
     * 
     * 为什么要先检查？
     * - 如果文件不存在，readFile 会抛出错误
     * - 提前检查可以给出更友好的错误信息
     * - 避免不必要的 API 调用
     */
    if (!existsSync(filePath)) {
        // 使用模板字符串构建错误消息
        throw new Error(`文件不存在: ${filePath}`);
    }

    /**
     * 步骤 2: 读取文件内容
     * 
     * readFile 是异步函数，返回 Promise<string>
     * await 等待文件读取完成
     * 
     * 参数说明：
     * - filePath: 文件路径
     * - "utf-8": 文件编码格式
     *   - utf-8 是最常用的文本编码
     *   - 如果不指定，返回的是 Buffer 对象（二进制数据）
     */
    const originalCode = await readFile(filePath, "utf-8");

    /**
     * 步骤 3: 验证文件不为空
     * 
     * trim() 去除首尾空白字符
     * 如果去除空白后为空，说明文件没有实际内容
     * 
     * 为什么要检查？
     * - 空文件不需要添加注释
     * - 避免浪费 API 调用
     */
    if (!originalCode.trim()) {
        throw new Error("文件为空，无法添加注释");
    }

    /**
     * 步骤 4: 获取文件扩展名
     * 
     * extname() 从路径中提取扩展名
     * 例如：
     * - "src/example.ts" → ".ts"
     * - "test.js" → ".js"
     * - "README" → ""（无扩展名）
     */
    const fileExtension = extname(filePath);

    // 输出处理进度信息，让用户知道程序在运行
    console.log(`正在为文件 ${filePath} 生成注释...`);
    console.log(`检测到文件类型: ${fileExtension || "未知"}`);

    /**
     * 步骤 5: 调用 AI 生成注释
     * 
     * 这是核心步骤，调用 agent.ts 中的 generateComments 函数
     * 
     * 为什么用 try-catch？
     * - API 调用可能失败（网络问题、API Key 错误等）
     * - 需要捕获错误并给出清晰的错误信息
     */
    let commentedCode: string;  // 声明变量，类型是 string
    try {
        // 调用 AI Agent 生成注释
        // 传入原始代码和文件扩展名
        commentedCode = await generateComments(originalCode, fileExtension);
    } catch (error) {
        // 错误处理：提取错误消息
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`生成注释失败: ${errorMsg}`);
        // 重新抛出错误，让调用者知道失败了
        throw error;
    }

    /**
     * 步骤 6: 创建备份文件（如果需要）
     * 
     * 为什么要备份？
     * - 安全：如果 AI 生成的内容有问题，可以恢复
     * - 用户可能想对比原始代码和带注释的代码
     * 
     * 备份文件命名：
     * - 原文件: "src/example.ts"
     * - 备份文件: "src/example.ts.backup"
     */
    if (backup) {
        // 构建备份文件路径
        const backupPath = `${filePath}.backup`;
        // 写入原始代码到备份文件
        await writeFile(backupPath, originalCode, "utf-8");
        console.log(`已创建备份文件: ${backupPath}`);
    }

    /**
     * 步骤 7: 写回带注释的代码
     * 
     * writeFile 会覆盖原文件
     * 这就是为什么需要备份的原因
     */
    await writeFile(filePath, commentedCode, "utf-8");

    // 返回成功消息
    return `成功为文件 ${filePath} 添加注释！`;
}

/**
 * 批量处理多个文件
 * 
 * 这个函数处理多个文件，即使某个文件失败，也会继续处理其他文件
 * 
 * 使用场景：
 * - 用户输入多个文件：comment file1.ts file2.js file3.py
 * - 需要逐个处理，并收集所有结果
 * 
 * @param filePaths - 文件路径数组（例如：["file1.ts", "file2.js"]）
 * @param backup - 是否创建备份文件（默认 true）
 * @returns Promise<string[]> - 处理结果数组，每个元素是成功或错误消息
 * 
 * 类型说明：
 * - string[] 表示字符串数组
 * - Promise<string[]> 表示返回一个 Promise，解析后得到字符串数组
 */
export async function addCommentsToFiles(
    filePaths: string[],
    backup: boolean = true
): Promise<string[]> {
    /**
     * 初始化结果数组
     * 
     * const results: string[] = []
     * - const: 常量声明（数组内容可以改变，但变量不能重新赋值）
     * - results: 变量名
     * - : string[]: TypeScript 类型注解，表示这是字符串数组
     * - = []: 初始化为空数组
     */
    const results: string[] = [];

    /**
     * 遍历文件路径数组
     * 
     * for...of 循环：
     * - 这是 ES6 的语法，用于遍历可迭代对象（数组、字符串等）
     * - for (const filePath of filePaths) 表示：
     *   遍历 filePaths 数组，每次循环将当前元素赋值给 filePath
     * 
     * 为什么用 for...of 而不是 forEach？
     * - for...of 支持 await，可以等待异步操作完成
     * - forEach 不支持 await，无法正确处理异步函数
     */
    for (const filePath of filePaths) {
        /**
         * 处理单个文件
         * 
         * 每个文件单独用 try-catch 包裹
         * 这样即使某个文件失败，也不会影响其他文件的处理
         */
        try {
            // 调用单文件处理函数
            const result = await addCommentsToFile(filePath, backup);
            // 将成功消息添加到结果数组
            results.push(result);
        } catch (error) {
            /**
             * 如果处理失败，捕获错误
             * 
             * 不抛出错误，而是将错误信息添加到结果数组
             * 这样可以让用户知道哪些文件成功，哪些失败
             */
            const errorMsg = error instanceof Error ? error.message : String(error);
            // 将错误消息添加到结果数组
            results.push(`处理 ${filePath} 时出错: ${errorMsg}`);
        }
    }

    /**
     * 返回所有处理结果
     * 
     * results 数组包含：
     * - 成功消息：如 "成功为文件 xxx 添加注释！"
     * - 错误消息：如 "处理 xxx 时出错: ..."
     * 
     * 调用者可以根据结果判断哪些文件处理成功，哪些失败
     */
    return results;
}
