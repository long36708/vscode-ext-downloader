# VSCode插件下载工具

一个Node.js命令行工具，用于自动生成和下载VSCode插件的.vsix文件。

## 功能特性

- ✅ 生成VSCode插件下载链接
- ✅ 从插件页面URL自动解析插件信息
- ✅ 下载.vsix文件到本地
- ✅ 批量处理多个插件
- ✅ 彩色命令行输出

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