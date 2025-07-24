#!/usr/bin/env node

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// === 配置读取 ===
const DEBUG_MODE = (process.env.DEBUG_MODE || "false").toLowerCase() === "true";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '500') * 1024 * 1024; // 转换为字节
const DOWNLOAD_TIMEOUT = parseInt(process.env.DOWNLOAD_TIMEOUT_SECONDS || '300') * 1000; // 转换为毫秒
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_DOWNLOADS || '5');
const AUTO_CREATE_DIRS = (process.env.AUTO_CREATE_DIRECTORIES || "true").toLowerCase() === "true";
const OVERWRITE_FILES = (process.env.OVERWRITE_EXISTING_FILES || "true").toLowerCase() === "true";
const ENABLE_VALIDATION = (process.env.ENABLE_FILE_VALIDATION || "true").toLowerCase() === "true";

// 默认保存目录
const DEFAULT_DIRS = {
    image: process.env.DEFAULT_IMAGE_DIR || 'downloads/images/',
    video: process.env.DEFAULT_VIDEO_DIR || 'downloads/videos/',
    document: process.env.DEFAULT_DOCUMENT_DIR || 'downloads/docs/',
    other: process.env.DEFAULT_OTHER_DIR || 'downloads/others/'
};

// 允许的域名
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS ? 
    process.env.ALLOWED_DOMAINS.split(',').map(d => d.trim()) : [];

// === 调试日志 ===
function debugLog(message, ...args) {
    if (DEBUG_MODE) {
        console.error(`[FileDownloader][Debug] ${message}`, ...args);
    }
}

// === 输出函数 ===
function sendOutput(data) {
    try {
        const jsonString = JSON.stringify(data);
        process.stdout.write(jsonString);
        debugLog('发送输出:', jsonString);
    } catch (e) {
        console.error("[FileDownloader] 输出序列化错误:", e);
        process.stdout.write(JSON.stringify({ 
            status: "error", 
            message: "内部错误: 输出序列化失败" 
        }));
    }
}

// === 工具函数 ===
// 验证URL
function validateUrl(urlString) {
    try {
        const url = new URL(urlString);
        if (!['http:', 'https:'].includes(url.protocol)) {
            return { valid: false, error: '仅支持 HTTP 和 HTTPS 协议' };
        }
        
        // 检查域名白名单
        if (ALLOWED_DOMAINS.length > 0) {
            const hostname = url.hostname;
            const allowed = ALLOWED_DOMAINS.some(domain => 
                hostname === domain || hostname.endsWith('.' + domain)
            );
            if (!allowed) {
                return { valid: false, error: `域名 ${hostname} 不在允许列表中` };
            }
        }
        
        return { valid: true, url };
    } catch (error) {
        return { valid: false, error: 'URL 格式无效' };
    }
}

// 检测文件类型
function getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const videoExts = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv'];
    const docExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar'];
    
    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (docExts.includes(ext)) return 'document';
    return 'other';
}

// 从URL中提取文件扩展名
function extractExtensionFromUrl(url) {
    try {
        const parsedUrl = new URL(url);
        // 获取路径部分，去除查询参数
        const pathname = parsedUrl.pathname;
        const ext = path.extname(pathname).toLowerCase();
        
        // 验证是否为有效的文件扩展名
        const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg',
                          '.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv',
                          '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', 
                          '.txt', '.zip', '.rar', '.mp3', '.wav', '.flac', '.ogg'];
        
        if (ext && validExts.includes(ext)) {
            debugLog('从URL提取扩展名:', url, '→', ext);
            return ext;
        }
        
        // 如果没有找到扩展名，尝试从Content-Type推断（这里先返回null，实际下载时会处理）
        return null;
    } catch (error) {
        debugLog('提取扩展名失败:', error.message);
        return null;
    }
}

// 根据Content-Type推断文件扩展名
function getExtensionFromContentType(contentType) {
    if (!contentType) return null;
    
    const mimeToExt = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/bmp': '.bmp',
        'image/svg+xml': '.svg',
        'video/mp4': '.mp4',
        'video/avi': '.avi',
        'video/quicktime': '.mov',
        'video/x-msvideo': '.avi',
        'video/webm': '.webm',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'text/plain': '.txt',
        'application/zip': '.zip',
        'application/x-rar-compressed': '.rar',
        'audio/mpeg': '.mp3',
        'audio/wav': '.wav',
        'audio/flac': '.flac',
        'audio/ogg': '.ogg'
    };
    
    // 提取主要的 MIME 类型（去除参数部分）
    const mainMimeType = contentType.split(';')[0].trim().toLowerCase();
    const extension = mimeToExt[mainMimeType];
    
    if (extension) {
        debugLog('从Content-Type推断扩展名:', contentType, '→', extension);
        return extension;
    }
    
    return null;
}

// 确保目录存在
async function ensureDirectory(dirPath) {
    if (AUTO_CREATE_DIRS) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
            debugLog('创建目录:', dirPath);
        } catch (error) {
            throw new Error(`无法创建目录 ${dirPath}: ${error.message}`);
        }
    } else {
        try {
            await fs.access(dirPath);
        } catch (error) {
            throw new Error(`目录不存在且未启用自动创建: ${dirPath}`);
        }
    }
}

// 检查文件是否已存在
async function checkFileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// 下载单个文件
async function downloadFile(url, targetPath, filename) {
    return new Promise((resolve, reject) => {
        const urlValidation = validateUrl(url);
        if (!urlValidation.valid) {
            return reject(new Error(urlValidation.error));
        }
        
        const parsedUrl = urlValidation.url;
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        debugLog('开始下载:', url, '到', targetPath);
        
        const request = client.get(url, {
            timeout: DOWNLOAD_TIMEOUT
        }, (response) => {
            // 检查响应状态
            if (response.statusCode !== 200) {
                return reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
            }
            
            // 检查文件大小
            const contentLength = parseInt(response.headers['content-length'] || '0');
            if (contentLength > MAX_FILE_SIZE) {
                return reject(new Error(`文件过大: ${Math.round(contentLength/1024/1024)}MB, 超过限制 ${Math.round(MAX_FILE_SIZE/1024/1024)}MB`));
            }
            
            // 如果文件名没有扩展名，尝试从Content-Type推断
            let finalFilename = filename;
            if (!path.extname(filename)) {
                const contentType = response.headers['content-type'];
                const extensionFromContentType = getExtensionFromContentType(contentType);
                if (extensionFromContentType) {
                    finalFilename = filename + extensionFromContentType;
                    debugLog('根据Content-Type添加扩展名:', filename, '→', finalFilename);
                }
            }
            
            // 创建写入流
            const filePath = path.join(targetPath, finalFilename);
            const writeStream = fsSync.createWriteStream(filePath);
            
            let downloadedBytes = 0;
            
            response.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                if (downloadedBytes > MAX_FILE_SIZE) {
                    writeStream.destroy();
                    fsSync.unlink(filePath, () => {}); // 删除不完整文件
                    return reject(new Error('下载文件超出大小限制'));
                }
            });
            
            response.pipe(writeStream);
            
            writeStream.on('finish', () => {
                debugLog('文件下载完成:', filePath);
                resolve({
                    success: true,
                    filePath: filePath,
                    filename: finalFilename,
                    size: downloadedBytes
                });
            });
            
            writeStream.on('error', (error) => {
                fsSync.unlink(filePath, () => {}); // 删除不完整文件
                reject(new Error(`写入文件失败: ${error.message}`));
            });
        });
        
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('下载超时'));
        });
        
        request.on('error', (error) => {
            reject(new Error(`请求失败: ${error.message}`));
        });
    });
}

// === 主要功能函数 ===

// 单文件下载
async function handleSingleDownload(params) {
    const { url, filename, target_directory } = params;
    
    if (!url || !filename) {
        throw new Error('缺少必需参数: url 和 filename');
    }
    
    const targetDir = target_directory || DEFAULT_DIRS.other;
    
    // 自动添加文件扩展名（如果filename没有扩展名）
    let finalFilename = filename;
    if (!path.extname(filename)) {
        // 从URL中提取扩展名
        const urlExtension = extractExtensionFromUrl(url);
        if (urlExtension) {
            finalFilename = filename + urlExtension;
            debugLog('自动添加扩展名:', filename, '→', finalFilename);
        }
    }
    
    // 确保目录存在
    await ensureDirectory(targetDir);
    
    // 检查文件是否已存在
    const filePath = path.join(targetDir, finalFilename);
    if (!OVERWRITE_FILES && await checkFileExists(filePath)) {
        throw new Error(`文件已存在: ${finalFilename}`);
    }
    
    // 执行下载
    const result = await downloadFile(url, targetDir, finalFilename);
    
    return {
        status: "success",
        message: `文件下载成功: ${finalFilename}`,
        result: {
            filename: result.filename,
            filePath: result.filePath,
            size: result.size,
            sizeText: `${Math.round(result.size/1024)}KB`
        }
    };
}

// 批量下载
async function handleBatchDownload(params) {
    const { downloads, target_directory } = params;
    
    if (!downloads || !Array.isArray(downloads)) {
        throw new Error('downloads 参数必须是数组格式');
    }
    
    if (downloads.length === 0) {
        throw new Error('下载列表不能为空');
    }
    
    if (downloads.length > MAX_CONCURRENT) {
        throw new Error(`批量下载数量超出限制: ${downloads.length} > ${MAX_CONCURRENT}`);
    }
    
    const targetDir = target_directory || DEFAULT_DIRS.other;
    await ensureDirectory(targetDir);
    
    const results = [];
    const errors = [];
    
    // 并发下载
    const downloadPromises = downloads.map(async (item, index) => {
        try {
            if (!item.url || !item.filename) {
                throw new Error(`下载项 ${index + 1} 缺少 url 或 filename`);
            }
            
            const result = await downloadFile(item.url, targetDir, item.filename);
            results.push({
                index: index + 1,
                filename: result.filename,
                filePath: result.filePath,
                size: result.size,
                status: 'success'
            });
        } catch (error) {
            errors.push({
                index: index + 1,
                filename: item.filename || 'unknown',
                error: error.message,
                status: 'failed'
            });
        }
    });
    
    await Promise.all(downloadPromises);
    
    const totalSuccess = results.length;
    const totalFailed = errors.length;
    
    return {
        status: totalFailed === 0 ? "success" : "partial",
        message: `批量下载完成: 成功 ${totalSuccess} 个, 失败 ${totalFailed} 个`,
        result: {
            successful: results,
            failed: errors,
            summary: {
                total: downloads.length,
                success: totalSuccess,
                failed: totalFailed
            }
        }
    };
}

// 按类型下载
async function handleDownloadByType(params) {
    const { url, file_type, filename } = params;
    
    if (!url || !file_type || !filename) {
        throw new Error('缺少必需参数: url, file_type, filename');
    }
    
    const targetDir = DEFAULT_DIRS[file_type] || DEFAULT_DIRS.other;
    
    // 自动添加文件扩展名（如果filename没有扩展名）
    let finalFilename = filename;
    if (!path.extname(filename)) {
        // 从URL中提取扩展名
        const urlExtension = extractExtensionFromUrl(url);
        if (urlExtension) {
            finalFilename = filename + urlExtension;
            debugLog('自动添加扩展名:', filename, '→', finalFilename);
        }
    }
    
    return await handleSingleDownload({
        url,
        filename: finalFilename,
        target_directory: targetDir
    });
}

// === 主处理函数 ===
async function handleRequest(input) {
    let requestData;
    try {
        requestData = JSON.parse(input);
    } catch (e) {
        return { status: "error", message: "无效的 JSON 输入" };
    }
    
    const { command } = requestData;
    debugLog('收到命令:', command, '参数:', requestData);
    
    try {
        switch (command) {
            case 'download':
                return await handleSingleDownload(requestData);
                
            case 'batch_download':
                // 如果 downloads 是字符串，尝试解析为 JSON
                if (typeof requestData.downloads === 'string') {
                    try {
                        requestData.downloads = JSON.parse(requestData.downloads);
                    } catch (e) {
                        return { status: "error", message: "downloads 参数 JSON 格式错误" };
                    }
                }
                return await handleBatchDownload(requestData);
                
            case 'download_by_type':
                return await handleDownloadByType(requestData);
                
            default:
                return { 
                    status: "error", 
                    message: `未知命令: ${command}. 支持的命令: download, batch_download, download_by_type` 
                };
        }
    } catch (error) {
        debugLog('处理请求时发生错误:', error);
        return { 
            status: "error", 
            message: error.message || "处理请求时发生未知错误" 
        };
    }
}

// === 主程序入口 ===
async function main() {
    let inputData = '';
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('readable', () => {
        let chunk;
        while ((chunk = process.stdin.read()) !== null) {
            inputData += chunk;
        }
    });
    
    process.stdin.on('end', async () => {
        debugLog('接收到输入数据:', inputData);
        try {
            if (!inputData.trim()) {
                throw new Error("未接收到输入数据");
            }
            
            const result = await handleRequest(inputData);
            sendOutput(result);
            
        } catch (error) {
            console.error("[FileDownloader] 处理请求时发生错误:", error.message);
            sendOutput({ 
                status: "error", 
                message: error.message || "发生未知错误" 
            });
            process.exitCode = 1;
        }
    });
    
    process.stdin.on('error', (err) => {
        console.error("[FileDownloader] 标准输入错误:", err);
        sendOutput({ 
            status: "error", 
            message: "读取输入时发生错误" 
        });
        process.exitCode = 1;
    });
}

// 启动主程序
main(); 