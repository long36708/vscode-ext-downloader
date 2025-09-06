#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import axios from 'axios';
import chalk from 'chalk';

/**
 * 生成VSCode插件下载URL
 * @param {string} publisher - 发布者名称
 * @param {string} extensionName - 插件名称
 * @param {string} version - 版本号
 * @returns {string} 下载URL
 */
const generateDownloadUrl = (publisher, extensionName, version) => {
    return `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${publisher}/vsextensions/${extensionName}/${version}/vspackage`;
};

/**
 * 从插件页面URL解析插件信息
 * @param {string} url - VSCode插件市场URL
 * @returns {Promise<Object>} 插件信息对象
 */
const parseExtensionInfo = async (url) => {
    try {
        const response = await axios.get(url);
        const html = response.data;
        
        // 提取发布者名称
        const publisherMatch = html.match(/\"publisher\":\"([^\"]+)\"/);
        const publisher = publisherMatch ? publisherMatch[1] : null;
        
        // 提取插件名称
        const extensionNameMatch = html.match(/\"extensionName\":\"([^\"]+)\"/);
        const extensionName = extensionNameMatch ? extensionNameMatch[1] : null;
        
        // 提取版本号
        const versionMatch = html.match(/\"version\":\"([^\"]+)\"/);
        const version = versionMatch ? versionMatch[1] : null;
        
        if (!publisher || !extensionName || !version) {
            throw new Error('无法从页面中解析完整的插件信息');
        }
        
        return { publisher, extensionName, version };
    } catch (error) {
        throw new Error(`解析插件信息失败: ${error.message}`);
    }
};

/**
 * 下载.vsix文件并显示进度
 * @param {string} downloadUrl - 下载URL
 * @param {string} outputPath - 输出路径
 */
const downloadVsixFile = async (downloadUrl, outputPath) => {
    try {
        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream'
        });
        
        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;
        let lastProgress = 0;
        
        const writer = fs.createWriteStream(outputPath);
        
        // 监听数据流事件来显示进度
        response.data.on('data', (chunk) => {
            downloadedSize += chunk.length;
            if (totalSize) {
                const progress = Math.floor((downloadedSize / totalSize) * 100);
                // 每10%更新一次进度，避免过于频繁的输出
                if (progress >= lastProgress + 10 || progress === 100) {
                    process.stdout.write(`\r下载进度: ${progress}% (${formatBytes(downloadedSize)}/${formatBytes(totalSize)})`);
                    lastProgress = progress;
                }
            }
        });
        
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                process.stdout.write('\n');
                resolve();
            });
            writer.on('error', reject);
        });
    } catch (error) {
        if (error.response) {
            throw new Error(`下载失败: HTTP ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
            throw new Error('下载失败: 网络连接错误，请检查网络连接');
        } else {
            throw new Error(`下载失败: ${error.message}`);
        }
    }
};

/**
 * 格式化字节大小为可读格式
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的字符串
 */
const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 设置命令行参数
program
    .name('vscode-plugin-download')
    .description('VSCode插件.vsix文件下载工具')
    .version('1.0.0');

program
    .command('generate')
    .description('生成插件下载链接')
    .argument('<publisher>', '发布者名称')
    .argument('<extension>', '插件名称')
    .argument('<version>', '版本号')
    .action((publisher, extension, version) => {
        const url = generateDownloadUrl(publisher, extension, version);
        console.log(chalk.green('下载链接:'), chalk.blue(url));
    });

program
    .command('parse')
    .description('从插件页面URL解析并生成下载链接')
    .argument('<url>', 'VSCode插件市场URL')
    .action(async (url) => {
        try {
            const info = await parseExtensionInfo(url);
            const downloadUrl = generateDownloadUrl(info.publisher, info.extensionName, info.version);
            
            console.log(chalk.green('插件信息:'));
            console.log(chalk.cyan('发布者:'), info.publisher);
            console.log(chalk.cyan('插件名:'), info.extensionName);
            console.log(chalk.cyan('版本号:'), info.version);
            console.log(chalk.green('下载链接:'), chalk.blue(downloadUrl));
        } catch (error) {
            console.error(chalk.red('错误:'), error.message);
        }
    });

program
    .command('download')
    .description('下载插件.vsix文件')
    .argument('<publisher>', '发布者名称')
    .argument('<extension>', '插件名称')
    .argument('<version>', '版本号')
    .option('-o, --output <path>', '输出文件路径', `${process.cwd()}/downloads`)
    .action(async (publisher, extension, version, options) => {
        try {
            const downloadUrl = generateDownloadUrl(publisher, extension, version);
            const outputDir = path.resolve(options.output);
            const fileName = `${publisher}.${extension}-${version}.vsix`;
            const outputPath = path.join(outputDir, fileName);
            
            // 创建输出目录
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            console.log(chalk.yellow('开始下载...'));
            console.log(chalk.cyan('来源:'), downloadUrl);
            console.log(chalk.cyan('目标:'), outputPath);
            
            await downloadVsixFile(downloadUrl, outputPath);
            
            console.log(chalk.green('下载完成!'));
            console.log(chalk.green('文件保存到:'), outputPath);
        } catch (error) {
            console.error(chalk.red('下载失败:'), error.message);
        }
    });

program
    .command('batch')
    .description('批量处理插件列表')
    .argument('<file>', '包含插件信息的JSON文件')
    .option('-o, --output <path>', '输出目录', `${process.cwd()}/downloads`)
    .action(async (file, options) => {
        try {
            const data = fs.readFileSync(file, 'utf8');
            const plugins = JSON.parse(data);
            const outputDir = path.resolve(options.output);
            
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            console.log(chalk.yellow(`开始批量处理 ${plugins.length} 个插件...`));
            
            for (const plugin of plugins) {
                try {
                    const { publisher, extension, version } = plugin;
                    const downloadUrl = generateDownloadUrl(publisher, extension, version);
                    const fileName = `${publisher}.${extension}-${version}.vsix`;
                    const outputPath = path.join(outputDir, fileName);
                    
                    console.log(chalk.cyan(`处理: ${publisher}.${extension}@${version}`));
                    
                    await downloadVsixFile(downloadUrl, outputPath);
                    console.log(chalk.green('✓ 下载完成'));
                } catch (error) {
                    console.error(chalk.red(`✗ 失败: ${error.message}`));
                }
            }
            
            console.log(chalk.green('批量处理完成!'));
        } catch (error) {
            console.error(chalk.red('批量处理失败:'), error.message);
        }
    });

program.parse();