# VSCode插件下载工具

一个Node.js命令行工具，用于自动生成和下载VSCode插件的.vsix文件。

## 功能特性

- ✅ 生成VSCode插件下载链接
- ✅ 从插件页面URL自动解析插件信息
- ✅ 下载.vsix文件到本地，支持实时进度显示
- ✅ 批量处理多个插件
- ✅ 彩色命令行输出
- ✅ 详细的错误信息和友好的错误提示

## 安装

```bash
npm install -g .
```

或者直接使用npx：

```bash
npx vscode-plugin-download [command]
```

## 使用方法

### 1. 生成下载链接

```bash
# 基本用法
vscode-plugin-download generate <publisher> <extension> <version>

# 示例
vscode-plugin-download generate maattdd gitless 11.7.2
```

### 2. 从插件页面解析并生成链接

```bash
# 从插件市场URL解析
vscode-plugin-download parse <marketplace-url>

# 示例
vscode-plugin-download parse "https://marketplace.visualstudio.com/items?itemName=maattdd.gitless"
```

### 3. 下载.vsix文件

```bash
# 下载单个插件
vscode-plugin-download download <publisher> <extension> <version>

# 指定输出目录
vscode-plugin-download download maattdd gitless 11.7.2 -o ./my-plugins

# 示例
vscode-plugin-download download maattdd gitless 11.7.2
```

下载过程中会显示实时进度条，包括：
- 下载百分比进度
- 已下载大小/总大小
- 友好的文件大小格式化显示

**错误处理：**
- 网络连接错误会提示检查网络
- 404错误会显示具体的HTTP状态码
- 其他错误会提供详细的错误信息

### 4. 批量下载

首先创建JSON配置文件（参考`example-plugins.json`）：

```json
[
  {
    "publisher": "maattdd",
    "extension": "gitless",
    "version": "11.7.2"
  },
  {
    "publisher": "rooveterinaryinc",
    "extension": "roo-cline",
    "version": "3.27.0"
  }
]
```

然后运行批量下载：

```bash
vscode-plugin-download batch example-plugins.json
```

## 进度显示和错误处理

### 进度显示
下载过程中会实时显示进度信息，包括：
- 下载百分比（每10%更新一次）
- 已下载文件大小和总大小
- 自动格式化的文件大小（B/KB/MB/GB）

### 错误处理
工具提供了详细的错误信息：
- **HTTP错误**：显示具体的状态码和状态文本
- **网络错误**：提示检查网络连接
- **解析错误**：提供详细的错误消息
- **文件错误**：显示文件操作相关的错误

## 技术原理

VSCode插件的下载链接格式为：

```
https://marketplace.visualstudio.com/_apis/public/gallery/publishers/{发布者}/vsextensions/{插件名}/{版本号}/vspackage
```

例如：
- 发布者：`maattdd`
- 插件名：`gitless` 
- 版本号：`11.7.2`

生成的下载链接：
```
https://marketplace.visualstudio.com/_apis/public/gallery/publishers/maattdd/vsextensions/gitless/11.7.2/vspackage
```

## 示例插件

项目中包含 `example-plugins.json` 文件，包含几个常用插件的配置示例。

## 许可证

ISC