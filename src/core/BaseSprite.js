// BaseSprite.js
export class BaseSprite {
  constructor({ image, frames = { max: 1 } }) {
    this.image = image;
    this.frames = { ...frames, val: 0, elapsed: 0 };
    this.moving = false;
    this.direction = 3;
    this.animationSpeed = 20; // 可配置的動畫速度

    if (image.complete) {
      this.onImageLoad(frames);
    } else {
      image.onload = () => this.onImageLoad(frames);
    }
  }

  onImageLoad(frames) {
    this.width = this.image.width / (frames.max * 4);
    this.height = this.image.height;
    this.loaded = true;
  }

  setDirection(direction) {
    if (direction >= 0 && direction <= 3) {
      this.direction = direction;
    }
  }

  updateAnimation() {
    if (this.moving && this.frames.max > 1) {
      this.frames.elapsed++;
      if (this.frames.elapsed % this.animationSpeed === 0) {
        this.frames.val = (this.frames.val + 1) % this.frames.max;
      }
    }
  }

  getFrameData() {
    const frameWidth = this.width;
    const startX = (this.image.width / 4) * this.direction;
    return {
      sourceX: startX + this.frames.val * frameWidth,
      sourceY: 0,
      frameWidth: this.width,
      frameHeight: this.height,
    };
  }
}
