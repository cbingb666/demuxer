import { DemuxerTs } from './demux-ts';
import { FetchIo } from './fetchIo';
import { getImageResize } from './image';
import './style.css';
// TS 文件的路径
// const tsUrl = '/assets/225ED20E405742889DB82111769CA590152493BF_1920-00325.ts';
const tsUrl = '/assets/DB1713CF7787BE536A8058CB72F7FC599243E815_1280-00354.ts';

// 获取 DOM 元素
const playDemoButton = document.getElementById('playDemo') as HTMLButtonElement;
// 添加事件监听器
playDemoButton.addEventListener('click', playDemo);


// 播放示例视频
async function playDemo() {
    let decodedFrameCount = 0;
    let ret = 0;
    let startTime = performance.now();
    const frames: ImageBitmap[] = [];

    try {
        // 检查 WebCodecs API 是否可用
        if (typeof VideoDecoder === 'undefined') {
            throw new Error('您的浏览器不支持 WebCodecs API');
        }

        // 创建视频解码器
        let canvas: HTMLCanvasElement = document.getElementById('videoCanvas') as HTMLCanvasElement;
        let ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

        const videoDecoder = new VideoDecoder({
            output: async (videoFrame) => {

                try {

                    // 绘制视频帧到 canvas
                    ctx.drawImage(videoFrame, 0, 0);

                    if (videoDecoder.decodeQueueSize === 0) {
                        ret = 1;
                    }
                } catch (e) {
                    console.error('处理视频帧时出错：', e);
                } finally {
                    videoFrame.close(); // 释放资源
                }


            },
            error: (e) => {
                ret = -1;
                console.error('解码器错误', e.message);
            }
        });

        // 创建解复用器
        const demuxerTs = new DemuxerTs({
            onConfig: async (videoTrack) => {
                // const description

                const config: VideoDecoderConfig = {
                    codec: videoTrack.codec,
                };
                canvas.width = videoTrack.width || 0;
                canvas.height = videoTrack.height || 0;
                videoDecoder.configure(config);
            },
            onDecodeChunk: (encodeChunk) => {
                try {
                    const videoChunk = new EncodedVideoChunk({
                        type: encodeChunk.avcFrame.keyframe ? 'key' : 'delta',
                        timestamp: encodeChunk.avcFrame.dts! * 1_000_000 || 0,
                        duration: encodeChunk.avcFrame.duration! * 1_000_000 || 0,
                        data: encodeChunk.rawData
                    })
                    videoDecoder.decodeQueueSize
                    videoDecoder.decode(videoChunk);
                } catch (e) {
                    console.error('解码失败:', e);
                }
            },
            onDone: () => {
                // videoDecoder.flush().catch((err) => {
                //     console.error('解码器flush失败', err);
                // });
                // console.log('解复用完成');
            }
        });

        const fetchIo = new FetchIo(tsUrl);
        const chunkSize = 188 * 1024;
        let pointer = 0

        while (true) {
            const res = (await fetchIo.read(pointer, pointer + chunkSize - 1));
            const buffer = await res.arrayBuffer();
            console.log('res', res);
            demuxerTs.push(buffer);
            pointer += chunkSize;
            await new Promise(resolve => setTimeout(resolve, 0));
            if (pointer >= 188 * 1024 * 2) {
                break;
            }
        }

        // 更新按钮状态
        playDemoButton.disabled = true;
        playDemoButton.textContent = '播放中...';

        while (ret === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        if (ret === 1) {
            console.log('解码完成');
            playDemoButton.disabled = false;
            playDemoButton.textContent = '播放示例视频';
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`解码完成，耗时: ${duration} 毫秒`);
        } else {
            console.error('解码失败');
        }
    } catch (error) {
        ret = -1;
        console.error('播放错误:', error);
        // 恢复按钮状态
        playDemoButton.disabled = false;
        playDemoButton.textContent = '播放示例视频';
    }
}


