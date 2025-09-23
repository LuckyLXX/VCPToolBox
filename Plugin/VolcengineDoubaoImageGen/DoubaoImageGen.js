#!/usr/bin/env node
const https = require('https');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

// Generate UUID v4 without external dependency
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Simple mime type detection
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

// Convert file:// URL to path
function fileURLToPath(url) {
    if (typeof url === 'string' && url.startsWith('file://')) {
        return url.replace('file://', '').replace(/\//g, path.sep);
    }
    return url;
}

// --- Configuration (from environment variables set by Plugin.js) ---
const VOLCENGINE_API_KEY = process.env.VOLCENGINE_API_KEY;
const PROJECT_BASE_PATH = process.env.PROJECT_BASE_PATH;
const SERVER_PORT = process.env.SERVER_PORT;
const IMAGESERVER_IMAGE_KEY = process.env.IMAGESERVER_IMAGE_KEY;
const VAR_HTTP_URL = process.env.VarHttpUrl;
const VAR_HTTPS_URL = process.env.VarHttpsUrl;

// 下载超时配置
const DOWNLOAD_TIMEOUT = 60000; // 图片下载超时60秒

// API specific configurations for Volcengine Doubao 4.0
const DOUBAO_API_CONFIG = {
    BASE_URL: 'https://ark.cn-beijing.volces.com',
    IMAGE_GENERATION_ENDPOINT: '/api/v3/images/generations',
    MODEL_ID: "doubao-seedream-4-0-250828",
    DEFAULT_PARAMS: {
        watermark: true,
        response_format: 'url'
    }
};

// Helper to validate input arguments
function isValidDoubaoArgs(args) {
    if (!args || typeof args !== 'object' || !args.command) return false;

    // Common validation
    if (typeof args.prompt !== 'string' || !args.prompt.trim()) return false;

    const command = args.command;

    if (command === 'DoubaoTextToImage') {
        // 文生图 - 只需要prompt和可选的size
        return true;
        
    } else if (command === 'DoubaoImageToImage') {
        // 图文生图 - 需要image参数
        if (typeof args.image !== 'string' || !args.image.trim()) return false;
        return true;
        
    } else if (command === 'DoubaoMultiImageFusion') {
        // 多图融合 - 需要至少image1和image2
        if (typeof args.image1 !== 'string' || !args.image1.trim()) return false;
        if (typeof args.image2 !== 'string' || !args.image2.trim()) return false;
        return true;
        
    } else if (command === 'DoubaoTextToImageGroup') {
        // 文生组图 - 需要max_images参数
        if (args.max_images !== undefined) {
            const maxImages = parseInt(args.max_images);
            if (isNaN(maxImages) || maxImages < 1 || maxImages > 10) return false;
        }
        return true;
        
    } else if (command === 'DoubaoImageToImageGroup') {
        // 图生组图 - 需要image参数
        if (typeof args.image !== 'string' || !args.image.trim()) return false;
        if (args.max_images !== undefined) {
            const maxImages = parseInt(args.max_images);
            if (isNaN(maxImages) || maxImages < 1 || maxImages > 10) return false;
        }
        return true;
        
    } else if (command === 'DoubaoMultiImageToImageGroup') {
        // 多图生组图 - 需要至少image1和image2
        if (typeof args.image1 !== 'string' || !args.image1.trim()) return false;
        if (typeof args.image2 !== 'string' || !args.image2.trim()) return false;
        if (args.max_images !== undefined) {
            const maxImages = parseInt(args.max_images);
            if (isNaN(maxImages) || maxImages < 1 || maxImages > 10) return false;
        }
        return true;
        
    } else {
        return false; // Unknown command
    }
}

// --- Helper function to process the 'image' parameter ---
async function getImageData(imageUrl, imageBase64) {
    // Priority to imageBase64 if provided
    if (imageBase64) {
        return imageBase64;
    }

    if (!imageUrl) {
        return null;
    }

    // Handle Data URI
    if (imageUrl.startsWith('data:image/')) {
        return imageUrl;
    }

    // Handle public https URL - return URL directly for Doubao API
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Handle local file URL
    if (imageUrl.startsWith('file://')) {
        const filePath = fileURLToPath(imageUrl);
        try {
            const buffer = await fs.readFile(filePath);
            const mimeType = getMimeType(filePath);
            
            // Check file size (10MB limit)
            if (buffer.length > 10 * 1024 * 1024) {
                throw new Error("Image size exceeds the 10MB limit.");
            }

            const base64Image = buffer.toString('base64');
            return `data:${mimeType};base64,${base64Image}`;
        } catch (e) {
            if (e.code === 'ENOENT') {
                const structuredError = new Error(`File not found locally, requesting remote fetch for: ${imageUrl}`);
                structuredError.code = 'FILE_NOT_FOUND_LOCALLY';
                structuredError.fileUrl = imageUrl;
                throw structuredError;
            } else {
                throw new Error(`Error reading local file: ${e.message}`);
            }
        }
    }

    throw new Error(`Unsupported image format or protocol. Please use an https:// or file:// URL.`);
}

// Make HTTPS request
function makeHttpsRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    if (res.statusCode === 200) {
                        const result = JSON.parse(data);
                        resolve(result);
                    } else {
                        reject(new Error(`API request failed (${res.statusCode}): ${data}`));
                    }
                } catch (error) {
                    reject(new Error(`Response parsing failed: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Request error: ${error.message}`));
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function generateImageAndSave(args) {
    // Check for essential environment variables
    if (!VOLCENGINE_API_KEY) {
        throw new Error("DoubaoImageGen Plugin Error: VOLCENGINE_API_KEY environment variable is required.");
    }
    if (!PROJECT_BASE_PATH) {
        throw new Error("DoubaoImageGen Plugin Error: PROJECT_BASE_PATH environment variable is required for saving images.");
    }
    if (!SERVER_PORT) {
        throw new Error("DoubaoImageGen Plugin Error: SERVER_PORT environment variable is required for constructing image URL.");
    }
    if (!IMAGESERVER_IMAGE_KEY) {
        throw new Error("DoubaoImageGen Plugin Error: IMAGESERVER_IMAGE_KEY environment variable is required for constructing image URL.");
    }
    if (!VAR_HTTP_URL) {
        throw new Error("DoubaoImageGen Plugin Error: VarHttpUrl environment variable is required for constructing image URL.");
    }

    const command = args.command;
    if (!command) {
        throw new Error(`DoubaoImageGen Plugin Error: 'command' not specified in arguments.`);
    }

    if (!isValidDoubaoArgs(args)) {
        throw new Error(`DoubaoImageGen Plugin Error: Invalid arguments for command '${command}': ${JSON.stringify(args)}.`);
    }

    // --- Payload Construction ---
    const payload = {
        model: DOUBAO_API_CONFIG.MODEL_ID,
        prompt: args.prompt,
        size: args.size || '2K',
        watermark: DOUBAO_API_CONFIG.DEFAULT_PARAMS.watermark,
        response_format: DOUBAO_API_CONFIG.DEFAULT_PARAMS.response_format
    };

    // Handle different commands
    if (command === 'DoubaoImageToImage') {
        const imageData = await getImageData(args.image, args.image_base64);
        payload.image = imageData;
        
    } else if (command === 'DoubaoMultiImageFusion') {
        const images = [];
        if (args.image1) images.push(await getImageData(args.image1, args.image_base64_1));
        if (args.image2) images.push(await getImageData(args.image2, args.image_base64_2));
        if (args.image3) images.push(await getImageData(args.image3, args.image_base64_3));
        
        payload.image = images;
        payload.sequential_image_generation = 'disabled';
        
    } else if (command === 'DoubaoTextToImageGroup') {
        payload.sequential_image_generation = 'auto';
        payload.sequential_image_generation_options = {
            max_images: parseInt(args.max_images) || 4
        };
        
    } else if (command === 'DoubaoImageToImageGroup') {
        const imageData = await getImageData(args.image, args.image_base64);
        payload.image = imageData;
        payload.sequential_image_generation = 'auto';
        payload.sequential_image_generation_options = {
            max_images: parseInt(args.max_images) || 4
        };
        
    } else if (command === 'DoubaoMultiImageToImageGroup') {
        const images = [];
        if (args.image1) images.push(await getImageData(args.image1, args.image_base64_1));
        if (args.image2) images.push(await getImageData(args.image2, args.image_base64_2));
        if (args.image3) images.push(await getImageData(args.image3, args.image_base64_3));
        
        payload.image = images;
        payload.sequential_image_generation = 'auto';
        payload.sequential_image_generation_options = {
            max_images: parseInt(args.max_images) || 4
        };
    }

    // --- Make API Request ---
    const url = new URL(DOUBAO_API_CONFIG.IMAGE_GENERATION_ENDPOINT, DOUBAO_API_CONFIG.BASE_URL);
    const postData = JSON.stringify(payload);
    
    // 根据是否为批量操作选择合适的超时时间

    
    const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${VOLCENGINE_API_KEY}`,
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const response = await makeHttpsRequest(options, postData);

    // Process response
    if (!response.data || !Array.isArray(response.data)) {
        throw new Error("DoubaoImageGen Plugin Error: Invalid response format from API");
    }

    const images = response.data;
    const results = [];

    // Save images and create results (参考NanoBananaGenOR的实现)
    for (let i = 0; i < images.length; i++) {
        const imageInfo = images[i];
        
        if (!imageInfo.url) {
            throw new Error("DoubaoImageGen Plugin Error: No image URL in response");
        }

        // Download image from Volcengine URL
        const imageUrl = new URL(imageInfo.url);
        const downloadOptions = {
            hostname: imageUrl.hostname,
            port: imageUrl.port || 443,
            path: imageUrl.pathname + imageUrl.search,
            method: 'GET',
            timeout: DOWNLOAD_TIMEOUT
        };

        const imageResponse = await new Promise((resolve, reject) => {
            const req = https.request(downloadOptions, (res) => {
                const chunks = [];
                res.on('data', chunk => chunks.push(chunk));
                res.on('end', () => resolve({
                    data: Buffer.concat(chunks),
                    headers: res.headers
                }));
            });
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Image download timeout'));
            });
            req.end();
        });

        const imageBuffer = imageResponse.data;
        const contentType = imageResponse.headers['content-type'] || 'image/png';
        const imageExtension = contentType.split('/')[1] || 'png';

        // Save to VCPToolBox/image/doubaogen/ directory (like NanoBananaGenOR)
        const generatedFileName = `${uuidv4()}.${imageExtension}`;
        const doubaoGenImageDir = path.join(PROJECT_BASE_PATH, 'image', 'doubaogen');
        const localImageServerPath = path.join(doubaoGenImageDir, generatedFileName);

        await fs.mkdir(doubaoGenImageDir, { recursive: true });
        await fs.writeFile(localImageServerPath, imageBuffer);

        // Generate accessible URL using VCP image server format
        const relativePathForUrl = path.join('doubaogen', generatedFileName).replace(/\\/g, '/');
        const accessibleImageUrl = `${VAR_HTTP_URL}:${SERVER_PORT}/pw=${IMAGESERVER_IMAGE_KEY}/images/${relativePathForUrl}`;

        results.push({
            url: accessibleImageUrl,
            serverPath: `image/doubaogen/${generatedFileName}`,
            fileName: generatedFileName,
            mimeType: contentType,
            size: imageInfo.size || 'unknown'
        });
    }

    // Create response (参考NanoBananaGenOR的格式)
    const content = [];
    
    // Add text summary with accessible URLs
    const summary = `🎨 豆包4.0图片生成完成！\n` +
        `📝 提示词: ${args.prompt}\n` +
        `📏 尺寸: ${args.size || '2K'}\n` +
        `🔧 命令: ${command}\n` +
        `📊 生成数量: ${results.length}张\n\n` +
        `**图片详情:**\n` +
        results.map((r, i) => `- 图片${i+1}: ${r.url}`).join('\n') + 
        `\n\n请利用可访问URL将图片转发给用户`;
    
    content.push({
        type: 'text',
        text: summary
    });

    // 不再附带 base64，以避免响应体过大导致连接被重置（当图片数量较多时尤甚）

    const result = {
        content: content,
        details: {
            command: command,
            prompt: args.prompt,
            size: args.size || '2K',
            imageCount: results.length,
            images: results.map(r => ({
                url: r.url,
                serverPath: r.serverPath,
                fileName: r.fileName,
                size: r.size
            }))
        }
    };

    return result;
}

async function main() {
    let inputChunks = [];
    process.stdin.setEncoding('utf8');

    for await (const chunk of process.stdin) {
        inputChunks.push(chunk);
    }
    const inputData = inputChunks.join('');
    let parsedArgs;

    try {
        if (!inputData.trim()) {
            console.log(JSON.stringify({ status: "error", error: "DoubaoImageGen Plugin Error: No input data received from stdin." }));
            process.exit(1);
            return;
        }
        parsedArgs = JSON.parse(inputData);
        const resultObject = await generateImageAndSave(parsedArgs);
        console.log(JSON.stringify({ status: "success", result: resultObject }));
    } catch (e) {
        // Handle file not found locally error
        if (e.code === 'FILE_NOT_FOUND_LOCALLY') {
            const errorPayload = {
                status: "error",
                code: e.code,
                error: e.message,
                fileUrl: e.fileUrl
            };
            if (e.failedParameter) {
                errorPayload.failedParameter = e.failedParameter;
            }
            console.log(JSON.stringify(errorPayload));
        } else {
            let detailedError = e.message || "Unknown error in DoubaoImageGen plugin";
            if (e.response && e.response.data) {
                detailedError += ` - API Response: ${JSON.stringify(e.response.data)}`;
            } else if (e.request) {
                detailedError += ` - No response received from API.`;
            }
            const finalErrorMessage = detailedError.startsWith("DoubaoImageGen Plugin Error:") ? detailedError : `DoubaoImageGen Plugin Error: ${detailedError}`;
            console.log(JSON.stringify({ status: "error", error: finalErrorMessage }));
        }
        process.exit(1);
    }
}

main();