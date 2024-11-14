export default class Sprite {
  constructor({
    position,
    image,
    image2,
    image3,
    frames = { max: 1 },
    slice = 0
  }) {
    this.position = position;
    this.image = image;
    this.image2 = image2;
    this.image3 = image3;

    this.frames = { ...frames, val: 0, elapsed: 0 };

    this.slice = slice || 0; // 預設為 0

    // 確保圖片載入完成後再計算寬高
    this.width = this.image.width / frames.max;
    this.height = this.image.height;

    this.width2 = this.image2.width / frames.max;
    this.height2 = this.image2.height;

    this.width3 = this.image3.width / frames.max;
    this.height3 = this.image3.height;
  }

  draw(ctx) {
    // 繪製第一張圖片
    ctx.drawImage(
      this.image,
      this.frames.val * this.width, // 當前幀的 X 裁剪位置
      0 + (this.height / 3) * this.slice, // 當前幀的 Y 裁剪位置
      this.width, // 單幀的寬度
      this.height, // 單幀的高度
      this.position.x, // 繪製的 X 位置
      this.position.y, // 繪製的 Y 位置
      this.width, // 繪製到畫布的寬度
      this.height // 繪製到畫布的高度
    );

    // 繪製第二張圖片
    ctx.drawImage(
      this.image2,
      this.frames.val * this.width2,
      0 + (this.height2 / 3) * this.slice, // 當前幀的 Y 裁剪位置
      this.width2,
      this.height2,
      this.position.x,
      this.position.y,
      this.width2,
      this.height2
    );

    // 繪製第三張圖片
    ctx.drawImage(
      this.image3,
      this.frames.val * this.width3,
      0 + (this.height3 / 3) * this.slice, // 當前幀的 Y 裁剪位置
      this.width3,
      this.height3,
      this.position.x,
      this.position.y,
      this.width3,
      this.height3
    );

    // 更新動畫幀
    this.frames.elapsed++;
    if (this.frames.elapsed % 15 === 0) {
      this.frames.val = (this.frames.val + 1) % this.frames.max;
    }
  }
}
