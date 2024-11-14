export default class SpriteMap {
  constructor({ position, image, frames = { max: 1 } }) {
    this.position = position;
    this.image = image;
    this.frames = { ...frames, val: 0, elapsed: 0 };
    this.width = this.image.width / this.frames.max;
    this.height = this.image.height;
    this.moving = false;
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.frames.val * this.width,
      0,
      this.width,
      this.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    if (!this.moving) return;

    // 處理動畫邏輯
    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }

    if (this.frames.elapsed % 15 === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++;
      else this.frames.val = 0;
    }
  }
}

export class Boundary {
  static width = 16;
  static height = 16;

  constructor({ position }) {
    this.position = position;
    this.width = Boundary.width;
    this.height = Boundary.height;
  }

  draw(ctx) {
    // 只在邊界位置繪製透明方塊，便於調試碰撞區域
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
