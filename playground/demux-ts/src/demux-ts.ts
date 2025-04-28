import { TSDemux, Events, AVCFrame, NaluTypes, getAVCConfig } from 'demuxer';

// DemuxerTs 类的构造函数选项
interface DemuxerTsOptions {
    onDecodeChunk: (encodeChunk: { avcFrame: AVCFrame, rawData: Uint8Array }) => void;
    onConfig: (config: {
        codec: string;
        width: number;
        height: number;
    }) => void;
    onDone: () => void;
}

/**
 * 解复用器类
 */
export class DemuxerTs {
    /**
     * 解复用器实例
     */
    private demux: TSDemux | undefined;
    /**
     * 第一次收到数据的时间
     */
    private firstOnDataTime: number = 0;
    /**
     * 解码回调
     */
    private _onDecodeChunk: DemuxerTsOptions['onDecodeChunk'];
    /**
     * 配置回调
     */
    private _onConfig: DemuxerTsOptions['onConfig'];

    /**
     * 解复用完成回调
     */
    private _onDone: DemuxerTsOptions['onDone'];

    /**
     * 构造函数
     * @param options 解复用器选项
     */
    constructor(options: DemuxerTsOptions) {
        this.demux = new TSDemux({
            // 如果是生产环境，应该设为 false 或不指定
            debug: true,
            // 启用编解码器解析
            decodeCodec: true,
        });

        // this.demux.on(Events.DEMUX_DATA, this._onDemuxData.bind(this));
        this.demux.on(Events.DONE, this._onDeMuxDataDone.bind(this));
        this.demux.elementaryStream_.avcStream.on('frame', this._onDemuxFrame.bind(this));
        this._onDecodeChunk = options.onDecodeChunk;
        this._onConfig = options.onConfig;
        this._onDone = options.onDone;
    }

    /**
     * 处理解复用帧
     * @param avcFrame 解复用帧
     */
    private _onDemuxFrame(avcFrame: AVCFrame) {
        // 创建帧数据
        const frameData = this._createFrameData(avcFrame);

        // 发送帧数据
        if (frameData) {
            this._sendVideoFrame(avcFrame, frameData);
        }
    }

    /**
     * 创建帧数据
     * @description 创建帧数据，将 NALU 数据转换为帧数据，并且为 NALU 添加起始码
     */
    private _createFrameData(avcFrame: AVCFrame): Uint8Array | null {
        try {
            const nalus: Uint8Array[] = [];

            // 使用更普遍的Annex-B格式（0x00 0x00 0x00 0x01起始码）
            const startCode = new Uint8Array([0, 0, 0, 1]);

            for (let i = 0, len = avcFrame.length; i < len; i++) {
                const nalu = avcFrame[i];

                if (!nalu || !nalu.rawData || nalu.rawData.byteLength === 0) continue;

                if (nalu.unit_type === NaluTypes.SPS) {
                    console.log('关键帧');
                    const config = getAVCConfig(nalu.sps);

                    this._onConfig({
                        codec: config.codec,
                        width: nalu.sps.width,
                        height: nalu.sps.height,
                    });
                }
                const naluData = new Uint8Array(startCode.length + nalu.rawData.byteLength);
                naluData.set(startCode, 0);
                naluData.set(new Uint8Array(nalu.rawData), startCode.length);
                nalus.push(naluData);
            }

            // 如果没有有效数据，返回null
            if (nalus.length === 0) {
                // console.warn('关键帧中没有有效NALU数据');
                return null;
            }

            // 合并所有NALU数据
            const totalLength = nalus.reduce((acc, nalu) => acc + nalu.byteLength, 0);
            const frameData = new Uint8Array(totalLength);

            let offset = 0;
            for (const nalu of nalus) {
                frameData.set(nalu, offset);
                offset += nalu.byteLength;
            }

            return frameData;
        } catch (error) {
            console.error('创建关键帧数据时出错:', error);
            return null;
        }
    }

    /**
     * 发送视频帧到解码器
     */
    private _sendVideoFrame(avcFrame: AVCFrame, frameData: Uint8Array) {
        try {
            if (!frameData || frameData.byteLength === 0) {
                console.warn('尝试发送无效帧数据');
                return;
            }

            // // 创建EncodedVideoChunk
            // const chunk = new EncodedVideoChunk({
            //     type: type,
            //     timestamp: timestamp,
            //     duration: 0,
            //     data: frameData
            // });

            // 发送到解码器
            this._onDecodeChunk({
                avcFrame: avcFrame,
                rawData: frameData
            });
        } catch (error) {
            console.error('发送视频帧时出错:', error);
        }
    }

    /**
     * 解复用完成回调
     */
    private _onDeMuxDataDone() {
        const endTime = performance.now();
        const duration = endTime - this.firstOnDataTime;
        console.log(`解复用完成，耗时: ${duration} 毫秒`);
    }

    /**
     * 推送数据
     * @param bytes 数据
     */
    push(bytes: ArrayBuffer) {
        if (!this.demux) {
            throw new Error('解复用器未初始化');
        }
        this.demux.push(new Uint8Array(bytes), {
            done: false
        });
    }

    destroy() {
        this.demux?.destroy();
        this.demux = undefined;
    }
}