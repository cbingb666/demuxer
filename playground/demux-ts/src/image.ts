/**
 * 获取图片裁剪尺寸
 * @param originalWidth 原始宽度
 * @param originalHeight 原始高度
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @returns 裁剪后的尺寸
 */
export const getImageResize = (
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
): { width: number; height: number } => {
    let width = originalWidth;
    let height = originalHeight;

    if (width > height) {
        if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
        }
    } else {
        if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
        }
    }

    return { width, height };
};