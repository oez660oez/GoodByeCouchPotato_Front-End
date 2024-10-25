//Map.js
export class SpriteMap {
  constructor({ position, image, frames = { max: 1 } }) {
    this.position = position;
    this.image = image;
    this.frames = { ...frames, val: 0, elapsed: 0 };

    // 立即設置寬度和高度，如果圖片已經載入
    if (image.complete) {
      this.width = image.width / frames.max;
      this.height = image.height;
    } else {
      // 如果圖片還沒載入，等待載入完成
      image.onload = () => {
        this.width = image.width / frames.max;
        this.height = image.height;
      };
    }

    this.moving = false;
  }

  draw(context) {
    // 確保圖片和尺寸都已經準備好
    if (!this.image.complete || !this.width || !this.height) {
      return;
    }

    context.drawImage(
      this.image,
      this.frames.val * this.width,
      0,
      this.image.width / this.frames.max,
      this.image.height,
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max,
      this.image.height
    );

    if (!this.moving) return;

    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }

    if (this.frames.elapsed % 10 === 0) {
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
      this.width = 16;
      this.height = 16;
    }

    draw(context) {
      context.fillStyle = 'rgba(255, 0, 0, 0.0)';
      context.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
  }