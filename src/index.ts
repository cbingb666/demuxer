/**
 * @file: index.js, created at Monday, 23rd December 2019 3:47:23 pm
 * @copyright Copyright (c) 2020
 * @author gem <gems.xu@gmail.com>
 * @description module entry.
 */

export { Events } from './enum/events';
export { TSDemux } from './m2t/demux';
export { MP4Demux } from './mp4/demux';
export { FLVDemux } from './flv/demux';
export { StreamTypes } from './enum/stream-types';
export type { Track } from './m2t/psi';
export { NaluTypes } from './enum/nalu-types';
export * from './types/pipeline';
export { default as getAVCConfig } from './codec/avc/avc-config';
