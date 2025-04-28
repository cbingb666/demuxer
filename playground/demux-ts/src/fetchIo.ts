// 定义 FetchIo 类用于从 URL 获取数据
export class FetchIo {
    url: string;
    constructor(url: string) {
        this.url = url;
    }

    async read(start: number = 0, end: number = -1) {
        return fetch(this.url, {
            headers: {
                'Range': `bytes=${start}-${end}`
            }
        });
    }
}