// 定義 Sprite 類別，並設置 draw 方法接受 Chart.js 的 ctx
class Sprite {
  constructor({ position, image, frames = { max: 1 } }) {
    this.position = position;
    this.image = image;
    this.frames = { ...frames, val: 0, elapsed: 0 };
    this.width = 32; // 每幀的寬度
    this.height = 40; // 每幀的高度
  }
  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.frames.val * this.width, // 動畫當前幀的 X 裁剪位置
      0, // 動畫 Y 裁剪位置
      this.width, // 單幀寬度
      this.height, // 單幀高度
      this.position.x, // 畫布上 X 位置
      this.position.y, // 畫布上 Y 位置
      this.width, // 繪製到畫布的寬度
      this.height // 繪製到畫布的高度
    );

    // 更新動畫幀
    this.frames.elapsed++;
    if (this.frames.elapsed % 5 === 0) {
      // 控制動畫速度
      this.frames.val = (this.frames.val + 1) % this.frames.max;
    }
  }
}
