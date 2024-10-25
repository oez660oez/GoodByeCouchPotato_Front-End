//Player.js
export class Sprite {
    constructor({ position, image, frames = { max: 1 } }) {
      this.position = position;
      this.image = image;
      this.frames = { ...frames, val: 0, elapsed: 0 };
      this.moving = false;
      this.direction = 3;
      this.width = 0;  // 初始化寬度
      this.height = 0; // 初始化高度

        // 如果圖片已經載入，立即設置尺寸
        if (image.complete) {
          this.width = image.width / frames.max / 4;
          this.height = image.height;
      } else {
          // 如果圖片還沒載入，等待載入完成後設置尺寸
          image.onload = () => {
              this.width = image.width / frames.max / 4;
              this.height = image.height;
          };
      }
  }

  draw(context) {
    if (!this.image || !this.width || !this.height) return;

    const frameWidth = this.width;
    const frameHeight = this.height;
    const startX = (this.image.width / 4) * this.direction;

    try {
        context.drawImage(
            this.image,
            startX + this.frames.val * frameWidth,
            0,
            frameWidth,
            frameHeight,
            this.position.x,
            this.position.y,
            frameWidth,
            frameHeight
        );

        if (this.moving && this.frames.max > 1) {
            this.frames.elapsed++;
            if (this.frames.elapsed % 10 === 0) {
                this.frames.val = (this.frames.val + 1) % this.frames.max;
            }
        }
    } catch (error) {
        console.error('Error drawing sprite:', error);
        console.log('Sprite properties:', {
            imageWidth: this.image.width,
            imageHeight: this.image.height,
            frameWidth,
            frameHeight,
            startX,
            position: this.position,
            frames: this.frames
        });
    }
}

setDirection(direction) {
    this.direction = direction;
}
}