// Player.js
import { BaseSprite } from "./BaseSprite";

export class Sprite extends BaseSprite {
  constructor({ position, image, frames = { max: 1 } }) {
    super({ image, frames });
    this.position = position;
  }

  draw(context) {
    if (!this.loaded) return;

    const { sourceX, sourceY, frameWidth, frameHeight } = this.getFrameData();

    context.drawImage(
      this.image,
      sourceX,
      sourceY,
      frameWidth,
      frameHeight,
      this.position.x,
      this.position.y,
      frameWidth,
      frameHeight
    );

    this.updateAnimation();
  }
}
