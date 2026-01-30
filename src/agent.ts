/**
 * AI Agent 核心模块
 * 
 * 这个模块是整个项目的"大脑"，负责：
 * 1. 与阿里云 DashScope API 通信
 * 2. 调用 qwen-plus AI 模型
 * 3. 处理 API 请求和响应
 * 4. 从响应中提取 AI 生成的注释代码
 * 
 * 工作流程：
 * 代码文件 → 构建提示词 → 调用 API → 解析响应 → 返回带注释的代码
 */

/**
 * TypeScript 接口定义：DashScope API 响应格式
 * 
 * interface 关键字：定义对象的形状（结构）
 * - 类似于其他语言的"类"或"结构体"
 * - 但 interface 只定义类型，不包含实现
 * - TypeScript 编译器会检查对象是否符合这个接口
 * 
 * 这个接口描述了 DashScope API 返回的数据结构：
 * {
 *   output: {
 *     choices: [
 *       {
 *         message: {
 *           content: "AI 生成的文本"
 *         }
 *       }
 *     ]
 *   },
 *   request_id: "请求ID"
 * }
 * 
 * 类型说明：
 * - Array<{...}> 表示一个数组，数组元素是对象
 * - string 表示字符串类型
 */
interface DashScopeResponse {
    output: {
        choices: Array<{
            message: {
                content: string;
            };
        }>;
    };
    request_id: string;
}

/**
 * 调用 DashScope API 生成代码注释
 * 
 * 这是核心函数，负责：
 * 1. 验证 API Key
 * 2. 构建发送给 AI 的提示词（prompt）
 * 3. 发送 HTTP 请求到 DashScope API
 * 4. 解析 API 响应
 * 5. 提取 AI 生成的代码
 * 
 * @param code - 需要添加注释的原始代码（字符串）
 * @param fileExtension - 文件扩展名（如 ".ts", ".js"），用于识别编程语言
 * @returns Promise<string> - 返回一个 Promise，解析后得到带注释的代码
 * 
 * TypeScript 类型说明：
 * - async function：异步函数，返回 Promise
 * - Promise<string>：表示这个函数返回一个 Promise，成功时解析为 string
 * - export：导出这个函数，让其他模块可以导入使用
 */
export async function generateComments(
    code: string,
    fileExtension: string
): Promise<string> {
    /**
     * 步骤 1: 获取并验证 API Key
     * 
     * process.env 是 Node.js 的全局对象，包含所有环境变量
     * 环境变量是在系统级别设置的配置，不会硬编码在代码中
     * 
     * 为什么要用环境变量？
     * - 安全性：API Key 不应该写在代码里（会被提交到 Git）
     * - 灵活性：不同环境（开发/生产）可以使用不同的 Key
     */
    const apiKey = process.env.DASHSCOPE_API_KEY;

    // 如果 API Key 不存在，抛出错误
    // throw new Error() 会中断函数执行，错误会被调用者捕获
    if (!apiKey) {
        throw new Error(
            "未找到 DASHSCOPE_API_KEY 环境变量，请先设置 API Key"
        );
    }

    /**
     * 步骤 2: 根据文件扩展名确定编程语言
     * 
     * 为什么要识别语言？
     * - AI 模型需要知道代码语言，才能生成正确的注释格式
     * - 不同语言的注释语法不同（//, #, /* 等）
     */
    const language = getLanguageName(fileExtension);

    /**
     * 步骤 3: 构建提示词（Prompt）
     * 
     * 提示词是发送给 AI 的指令，告诉 AI 要做什么
     * 好的提示词应该：
     * - 清晰明确地说明任务
     * - 包含具体要求
     * - 提供上下文（代码内容）
     * 
     * 模板字符串语法：
     * - 使用反引号 ` 而不是单引号或双引号
     * - ${变量} 可以在字符串中嵌入变量
     * - \`\`\` 是转义的反引号，用于在字符串中表示代码块标记
     */
    const prompt = `请为以下${language}代码添加详细的中文注释。要求：
1. 为每个函数、类、方法添加注释
2. 为关键逻辑和复杂代码段添加行内注释
3. 注释要清晰易懂，说明代码的作用和意图
4. 保持代码的原有格式和结构
5. 只返回添加了注释的完整代码，不要添加额外的说明文字

代码：
\`\`\`${language}
${code}
\`\`\`

请直接返回添加了注释的代码：`;

    /**
     * 步骤 4: 发送 HTTP 请求到 DashScope API
     * 
     * try-catch 块：捕获可能的错误
     * - 网络错误、API 错误等都可能发生
     * - 使用 try-catch 可以优雅地处理这些错误
     */
    try {
        /**
         * fetch() 函数：发送 HTTP 请求
         * 
         * fetch 是浏览器和 Node.js（18+）提供的全局函数
         * 用于发送 HTTP 请求，类似于 axios 或 request 库
         * 
         * await 关键字：
         * - 等待异步操作完成
         * - fetch 返回 Promise，await 会等待 Promise 解析
         * - 解析后得到 Response 对象
         */
        const response = await fetch(
            // API 端点 URL
            // 这是阿里云 DashScope 服务的文本生成 API 地址
            "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
            {
                // HTTP 方法：POST（发送数据）
                method: "POST",

                // HTTP 请求头
                // 告诉服务器请求的格式和认证信息
                headers: {
                    // Content-Type: 告诉服务器请求体的格式是 JSON
                    "Content-Type": "application/json",
                    // Authorization: Bearer token 是标准的 API 认证方式
                    // Bearer 表示使用令牌认证，后面跟着 API Key
                    Authorization: `Bearer ${apiKey}`,
                },

                // 请求体：发送给服务器的数据
                // JSON.stringify() 将 JavaScript 对象转换为 JSON 字符串
                body: JSON.stringify({
                    // 指定使用的 AI 模型
                    model: "qwen-plus",

                    // 输入数据：对话格式
                    // messages 数组包含对话历史
                    input: {
                        messages: [
                            {
                                // role: "user" 表示这是用户的消息
                                // 也可以是 "assistant"（AI 的回复）或 "system"（系统提示）
                                role: "user",
                                // content: 用户的消息内容（我们构建的提示词）
                                content: prompt,
                            },
                        ],
                    },

                    // 模型参数：控制 AI 的行为
                    parameters: {
                        // temperature: 控制输出的随机性
                        // 0.0 = 完全确定（总是选择最可能的词）
                        // 1.0 = 完全随机
                        // 0.3 = 偏向确定性，适合代码生成任务
                        temperature: 0.3,
                        // max_tokens: 限制生成的最大长度（token 数）
                        // 防止生成过长的文本，节省成本
                        max_tokens: 2000,
                    },
                }),
            }
        );

        /**
         * 步骤 5: 检查 HTTP 响应状态
         * 
         * response.ok 是 Response 对象的属性
         * - true: HTTP 状态码在 200-299 之间（成功）
         * - false: 其他状态码（如 400, 401, 500 等，表示错误）
         */
        if (!response.ok) {
            // 如果请求失败，读取错误信息
            // response.text() 读取响应体作为文本
            const errorText = await response.text();
            // 抛出错误，包含状态码和错误信息
            throw new Error(
                `API 请求失败: ${response.status} ${response.statusText}\n${errorText}`
            );
        }

        /**
         * 步骤 6: 解析 JSON 响应
         * 
         * response.json() 将响应体解析为 JavaScript 对象
         * 
         * 类型断言 (as any):
         * - TypeScript 不知道 API 返回的确切格式
         * - as any 告诉 TypeScript："相信我，我知道这是什么类型"
         * - 使用 any 类型会跳过类型检查，需要谨慎使用
         * - 这里使用 any 是因为 API 响应格式可能变化
         */
        const data = (await response.json()) as any;

        /**
         * 调试模式：打印完整的 API 响应
         * 
         * 为什么需要调试模式？
         * - 帮助开发者理解 API 返回的数据结构
         * - 排查问题时非常有用
         * - 生产环境不应该开启（会输出大量日志）
         * 
         * JSON.stringify(data, null, 2):
         * - 将对象转换为格式化的 JSON 字符串
         * - null: 不使用替换函数
         * - 2: 缩进 2 个空格，让输出更易读
         */
        if (process.env.DEBUG === "1" || process.env.DEBUG === "true") {
            console.log("API 响应:", JSON.stringify(data, null, 2));
        }

        /**
         * 步骤 7: 从响应中提取 AI 生成的文本
         * 
         * 为什么需要多种格式检查？
         * - 不同版本的 API 可能返回不同格式
         * - 为了兼容性，我们检查多种可能的格式
         * 
         * 可选链操作符 (?.)：
         * - data.output?.choices 表示：如果 data.output 存在，则访问 choices
         * - 如果 data.output 是 null 或 undefined，不会报错，而是返回 undefined
         * - 这是 ES2020 的新特性，避免访问 undefined 的属性时报错
         * 
         * 数组访问 [0]：
         * - choices 是一个数组，[0] 获取第一个元素
         * - AI 通常返回多个候选答案，我们取第一个
         */
        let content: string | undefined;  // 声明变量，类型是 string 或 undefined

        // 尝试不同的响应格式（按优先级顺序）
        // 格式 1: 标准格式 output.choices[0].message.content
        if (data.output?.choices?.[0]?.message?.content) {
            content = data.output.choices[0].message.content;
        }
        // 格式 2: 简化格式 output.text
        else if (data.output?.text) {
            content = data.output.text;
        }
        // 格式 3: 另一种格式 choices[0].message.content
        else if (data.choices?.[0]?.message?.content) {
            content = data.choices[0].message.content;
        }
        // 格式 4: 最简单的格式 text
        else if (data.text) {
            content = data.text;
        }
        // 如果都不匹配，说明 API 返回了未知格式
        else {
            // 打印实际响应以便调试
            const responseStr = JSON.stringify(data, null, 2);
            console.error("无法识别的 API 响应结构:");
            console.error(responseStr);
            throw new Error(
                `API 返回的数据格式不正确。\n` +
                `请设置 DEBUG=1 查看完整响应，或检查 API 文档。\n` +
                `响应结构预览: ${responseStr.substring(0, 500)}`  // 只显示前 500 个字符
            );
        }

        // 双重检查：确保成功提取了内容
        if (!content) {
            throw new Error("API 返回的数据格式不正确：无法提取内容");
        }

        /**
         * 步骤 8: 清理和提取代码
         * 
         * AI 可能返回带 markdown 代码块标记的文本（```typescript ... ```）
         * 我们需要提取其中的纯代码
         */
        return extractCodeFromResponse(content, language);
    } catch (error) {
        /**
         * 错误处理
         * 
         * 如果 try 块中的任何代码抛出错误，会被 catch 捕获
         * 我们重新包装错误，添加更清晰的错误信息
         */
        if (error instanceof Error) {
            // 如果错误是 Error 类型，提取错误消息并重新抛出
            throw new Error(`生成注释时出错: ${error.message}`);
        }
        // 如果错误不是 Error 类型（很少见），直接抛出
        throw error;
    }
}

/**
 * 根据文件扩展名获取语言名称
 * 
 * 这是一个辅助函数，将文件扩展名（如 ".ts"）转换为语言名称（如 "typescript"）
 * 
 * @param extension - 文件扩展名（如 ".ts", ".js"）
 * @returns 语言名称（如 "typescript", "javascript"）
 * 
 * TypeScript 类型说明：
 * - function 函数名(参数: 类型): 返回类型 { ... }
 * - Record<string, string> 是 TypeScript 的工具类型
 *   表示一个对象，键是 string，值也是 string
 *   等同于 { [key: string]: string }
 */
function getLanguageName(extension: string): string {
    /**
     * 语言映射表
     * 
     * 这是一个对象字面量，将文件扩展名映射到语言名称
     * 例如：".ts" → "typescript"
     * 
     * const 关键字：声明常量，值不能改变
     * 使用 const 而不是 let，因为这个映射表不会改变
     */
    const languageMap: Record<string, string> = {
        ".ts": "typescript",
        ".js": "javascript",
        ".tsx": "typescript",  // React TypeScript
        ".jsx": "javascript",  // React JavaScript
        ".py": "python",
        ".java": "java",
        ".cpp": "cpp",
        ".c": "c",
        ".go": "go",
        ".rs": "rust",
        ".php": "php",
        ".rb": "ruby",
        ".swift": "swift",
        ".kt": "kotlin",
    };

    /**
     * 查找语言名称
     * 
     * extension.toLowerCase() - 将扩展名转为小写（如 ".TS" → ".ts"）
     * languageMap[extension.toLowerCase()] - 在映射表中查找
     * || "text" - 如果找不到，使用默认值 "text"
     * 
     * || 运算符（逻辑或）：
     * - 如果左边是 falsy 值（null, undefined, "", 0, false），返回右边
     * - 如果左边是 truthy 值，返回左边
     * - 这里用作"默认值"的简写
     */
    return languageMap[extension.toLowerCase()] || "text";
}

/**
 * 从 API 响应中提取代码内容
 * 
 * AI 可能返回带 markdown 代码块标记的文本，例如：
 * ```typescript
 * function test() {}
 * ```
 * 
 * 我们需要提取其中的纯代码，去掉 ``` 标记
 * 
 * @param content - AI 返回的原始文本（可能包含 markdown 标记）
 * @param language - 编程语言名称（用于匹配代码块标记）
 * @returns 提取出的纯代码（不包含 markdown 标记）
 */
function extractCodeFromResponse(
    content: string,
    language: string
): string {
    /**
     * 方法 1: 尝试匹配特定语言的代码块
     * 
     * 正则表达式说明：
     * - \`\`\` - 匹配三个反引号（需要转义）
     * - ${language} - 匹配语言名称（如 "typescript"）
     * - \\s* - 匹配零个或多个空白字符
     * - \\n - 匹配换行符
     * - ([\\s\\S]*?) - 捕获组，匹配任意字符（包括换行）
     *   - \\s 是空白字符，\\S 是非空白字符
     *   - *? 是非贪婪匹配（尽可能少匹配）
     * - \\n\`\`\` - 匹配换行和结束的三个反引号
     * - "i" 标志：不区分大小写
     * 
     * RegExp 构造函数：
     * - 用于动态构建正则表达式（当模式包含变量时）
     * - 模板字符串可以嵌入变量
     */
    const codeBlockRegex = new RegExp(
        `\`\`\`${language}\\s*\\n([\\s\\S]*?)\\n\`\`\``,
        "i"
    );

    // match() 方法：在字符串中查找匹配
    // 返回匹配结果数组，或 null（如果没有匹配）
    const match = content.match(codeBlockRegex);

    // 如果找到匹配，提取第一个捕获组（索引 1）
    // match[0] 是整个匹配，match[1] 是第一个捕获组（代码内容）
    if (match && match[1]) {
        // trim() 方法：去除字符串首尾的空白字符
        return match[1].trim();
    }

    /**
     * 方法 2: 尝试匹配通用代码块（不指定语言）
     * 
     * 如果特定语言的匹配失败，尝试匹配任何语言的代码块
     * 
     * 正则表达式说明：
     * - /.../ - 正则表达式字面量语法
     * - ``` - 三个反引号（在字面量中不需要转义）
     * - [\w]* - 匹配零个或多个单词字符（语言名称）
     * - \n - 换行符
     * - ([\s\S]*?) - 捕获代码内容
     * - \n``` - 结束标记
     */
    const genericCodeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/;
    const genericMatch = content.match(genericCodeBlockRegex);

    if (genericMatch && genericMatch[1]) {
        return genericMatch[1].trim();
    }

    /**
     * 方法 3: 如果都没有代码块标记，直接返回内容
     * 
     * 有些情况下，AI 可能直接返回代码，不包含 markdown 标记
     * 这时我们直接返回，只去除首尾空白
     */
    return content.trim();
}
