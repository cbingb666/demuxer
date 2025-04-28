import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // 设置基本路径
    base: './',

    // 解析配置
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            'demuxer': resolve(__dirname, '../../src/index.ts')
        }
    },

    // 开发服务器配置
    server: {
        port: 3000,
        open: true,
        host: '0.0.0.0'
    },

    // 构建配置
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        minify: 'terser'
    }
});