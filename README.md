# CLI Agent - 代码注释生成工具

一个基于 TypeScript 和 AI Agent 的 CLI 工具，可以自动为代码文件添加详细的中文注释。

## 功能特性

- 🤖 使用阿里云 DashScope 的 qwen-plus 模型生成智能注释
- 📝 支持多种编程语言（TypeScript、JavaScript、Python、Java、Go、Rust 等）
- 🔄 自动创建备份文件，安全可靠
- 📦 支持批量处理多个文件
- 🎯 简单易用的 CLI 接口
- 🐛 内置调试模式，方便排查问题
- 🛡️ 完善的错误处理和类型安全

## 安装

### 1. 克隆或下载项目

```bash
cd Agent1
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 API Key

设置环境变量 `DASHSCOPE_API_KEY`：

**方式一：使用环境变量**
```bash
export DASHSCOPE_API_KEY=your_api_key_here
```

**方式二：使用 .env 文件**
创建 `.env` 文件并添加：
```
DASHSCOPE_API_KEY=your_api_key_here
```

## 使用方法

### 编译项目

```bash
npm run build
```

### 使用 CLI 命令

**为单个文件添加注释：**
```bash
npm start comment src/example.ts
```

**为多个文件添加注释：**
```bash
npm start comment src/file1.ts src/file2.js src/file3.py
```

**不创建备份文件：**
```bash
npm start comment src/example.ts --no-backup
```

**启用调试模式（查看详细的 API 响应）：**
```bash
DEBUG=1 npm start comment src/example.ts
```

### 开发模式

使用 `tsx` 直接运行（无需编译）：
```bash
npm run dev comment src/example.ts
```

**开发模式 + 调试：**
```bash
DEBUG=1 npm run dev comment src/example.ts
```

## 项目结构

```
Agent1/
├── src/
│   ├── index.ts          # 入口文件
│   ├── cli.ts            # CLI 命令处理
│   ├── agent.ts          # AI Agent 核心逻辑（DashScope API 调用）
│   ├── commenter.ts      # 代码注释处理逻辑
│   └── example.ts        # 示例文件（用于测试）
├── dist/                 # 编译后的 JavaScript 文件
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## 技术栈

- **TypeScript**: 类型安全的 JavaScript
- **Commander**: CLI 框架
- **DashScope API**: 阿里云 AI 服务
- **Node.js**: 运行时环境

## 工作原理

1. **读取代码文件**: 从指定路径读取源代码
2. **调用 AI 模型**: 使用 DashScope API 调用 qwen-plus 模型生成注释
3. **处理响应**: 智能解析多种 API 响应格式，提取带注释的代码
4. **创建备份**: 可选地创建原始文件的备份（`.backup` 文件）
5. **写回文件**: 将带注释的代码写回原文件

### 错误处理

- 自动检测多种 API 响应格式
- 详细的错误信息输出
- 支持调试模式查看完整 API 响应
- 安全的文件操作（自动备份）

## 示例

假设有一个 `example.ts` 文件：

```typescript
function calculateSum(a: number, b: number) {
  return a + b;
}
```

运行命令后，文件会被添加注释：

```typescript
/**
 * 计算两个数的和
 * @param a 第一个数字
 * @param b 第二个数字
 * @returns 两个数字的和
 */
function calculateSum(a: number, b: number) {
  return a + b;
}
```

## 故障排除

### 常见错误

**1. API Key 未设置**
```
错误: 未找到 DASHSCOPE_API_KEY 环境变量
```
**解决方案**: 确保已设置环境变量或创建 `.env` 文件

**2. API 响应格式错误**
```
错误: Cannot read properties of undefined (reading '0')
```
**解决方案**: 
- 启用调试模式查看实际响应：`DEBUG=1 npm start comment <file>`
- 检查 API Key 是否有效
- 确认网络连接正常

**3. 文件不存在**
```
错误: 文件不存在: <filepath>
```
**解决方案**: 检查文件路径是否正确

### 调试技巧

- 使用 `DEBUG=1` 环境变量查看完整的 API 请求和响应
- 检查 `.backup` 备份文件以恢复原始代码
- 查看终端输出的详细错误信息

## 注意事项

- 确保已正确设置 `DASHSCOPE_API_KEY` 环境变量
- 默认会创建 `.backup` 备份文件，建议保留备份以便恢复
- 处理大文件时可能需要较长时间
- API 调用会产生费用，请注意使用量
- 如果遇到 API 格式问题，请使用 `DEBUG=1` 查看实际响应结构

## 学习资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [DashScope API 文档](https://help.aliyun.com/zh/model-studio/)
- [Commander.js 文档](https://github.com/tj/commander.js)

## 许可证

MIT
