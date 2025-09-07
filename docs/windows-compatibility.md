# Windows 兼容性说明

## Shebang 处理机制

### Unix/Linux 系统

- `#!/usr/bin/env node` 是标准的 shebang 语法
- 系统内核直接识别并执行，使用 env 查找 node 解释器
- 文件需要具有可执行权限 (`chmod +x`)

### Windows 系统

- Windows 不原生支持 shebang 语法
- 会忽略 `#!/usr/bin/env node` 这一行
- 但通过 npm 的包装机制仍然可以正常工作

## npm 的跨平台解决方案

### 包安装时的处理

当在 Windows 上安装 npm 包时：

1. **自动生成 .cmd 文件**
   - npm 会为 `package.json` 中 `bin` 字段的每个命令生成对应的 `.cmd` 批处理文件
   - 例如：`vscode-dl` → `vscode-dl.cmd`
   - 这些文件安装在系统的 npm 全局路径中

2. **.cmd 文件的内容**

   ```cmd
   @ECHO off
   GOTO start
   :find_dp0
   SET dp0=%~dp0
   EXIT /b
   :start
   SETLOCAL
   CALL :find_dp0

   IF EXIST "%dp0%\node.exe" (
     SET "_prog=%dp0%\node.exe"
   ) ELSE (
     SET "_prog=node"
     SET PATHEXT=%PATHEXT:;.JS;=;%
   )

   "%_prog%" "%dp0%\index.js" %*
   ENDLOCAL
   EXIT /b
   ```

3. **执行流程**
   - 用户输入 `vscode-dl` 或 `vsdl`
   - Windows 找到对应的 `.cmd` 文件
   - `.cmd` 文件调用 Node.js 执行 `index.js`
   - shebang 行被忽略，但不影响执行

## 最佳实践

### 保持 shebang 的原因

1. **Unix/Linux 兼容性**：在非Windows系统上直接工作
2. **开发便利性**：在开发时可以直接执行 `./index.js`
3. **标准约定**：遵循 Node.js 社区的最佳实践

### Windows 用户的使用方式

1. **全局安装后使用**：

   ```bash
   npm install -g vscode-ext-downloader
   vscode-dl generate <publisher> <name> <version>
   ```

2. **使用短别名**：
   ```bash
   vsdl download <publisher> <name> <version>
   ```

## 技术细节

### 文件路径处理

- 使用 `path` 模块确保跨平台路径兼容性
- 避免硬编码路径分隔符 (`/` 或 `\`)
- 使用 `path.join()` 和 `path.resolve()`

### 权限设置

- 在创建目录时使用适当的权限模式：
  ```javascript
  fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
  ```

## 验证方法

### 检查安装

```bash
# 检查全局安装
npm list -g | findstr vscode-ext-downloader

# 检查命令可用性
where vscode-dl
where vsdl
```

### 测试功能

```bash
# 测试短命令
vscode-dl --help
vsdl --version
```

## 结论

当前的配置已经完全支持 Windows 环境：

- shebang 行在 Windows 上被忽略但不影响功能
- npm 的包装机制确保了跨平台兼容性
- 用户可以通过短命令别名获得更好的体验
- 所有功能在 Windows 上都能正常工作

无需修改现有代码，配置已经是最佳实践。
