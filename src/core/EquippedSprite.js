// EquippedSprite.js
import { BaseSprite } from "./BaseSprite";

export class EquippedSprite extends BaseSprite {
  draw(ctx, x, y, width, height, player) {
    if (!this.loaded || !player) return;

    // Sync with player state
    this.moving = player.moving;
    this.direction = player.direction;
    this.frames.val = player.frames.val;

    const { sourceX, sourceY, frameWidth, frameHeight } = this.getFrameData();

    ctx.drawImage(
      this.image,
      sourceX,
      sourceY,
      frameWidth,
      frameHeight,
      x,
      y,
      width,
      height
    );
  }
}
