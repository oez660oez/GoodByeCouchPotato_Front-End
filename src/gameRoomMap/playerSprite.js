export default class Sprite {
  constructor({
    position,
    image,
    image2,
    image3,
    image4,
    frames = { max: 1 }
  }) {
    this.position = position;
    this.image = image;
    this.image2 = image2;
    this.image3 = image3;
    this.image4 = image4;

    this.frames = { ...frames, val: 0, elapsed: 0 };

    // 確保圖片載入完成後再計算寬高
    this.width = this.image.width / frames.max / 4;
    this.height = this.image.height;

    this.width2 = this.image2.width / frames.max / 4;
    this.height2 = this.image2.height;

    this.width3 = this.image3.width / frames.max / 4;
    this.height3 = this.image3.height;

    this.width4 = this.image4.width / frames.max / 4;
    this.height4 = this.image4.height;

    this.direction = 3; // 預設角色朝下方向
    this.moving = false;
    this.start = (this.image3.width / 4) * 3; // 切圖片的起始點
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.start + this.frames.val * this.width, // 圖片在x方向的起始裁剪點
      0, // 圖片在y方向的起始裁剪點
      this.width, // 每幀的寬度
      this.height, // 每幀的高度
      this.position.x, // 角色在畫布上的 x 位置
      this.position.y, // 角色在畫布上的 y 位置
      this.width, // 繪製到畫布上的寬度
      this.height // 繪製到畫布上的高度
    );

    ctx.drawImage(
      this.image2,
      this.start + this.frames.val * this.width, // 圖片在x方向的起始裁剪點
      0, // 圖片在y方向的起始裁剪點
      this.width2, // 每幀的寬度
      this.height2, // 每幀的高度
      this.position.x, // 角色在畫布上的 x 位置
      this.position.y, // 角色在畫布上的 y 位置
      this.width2, // 繪製到畫布上的寬度
      this.height2 // 繪製到畫布上的高度
    );

    ctx.drawImage(
      this.image3,
      this.start + this.frames.val * this.width, // 圖片在x方向的起始裁剪點
      0, // 圖片在y方向的起始裁剪點
      this.width3, // 每幀的寬度
      this.height3, // 每幀的高度
      this.position.x, // 角色在畫布上的 x 位置
      this.position.y, // 角色在畫布上的 y 位置
      this.width3, // 繪製到畫布上的寬度
      this.height3 // 繪製到畫布上的高度
    );
    ctx.drawImage(
      this.image4,
      this.start + this.frames.val * this.width, // 圖片在x方向的起始裁剪點
      0, // 圖片在y方向的起始裁剪點
      this.width4, // 每幀的寬度
      this.height4, // 每幀的高度
      this.position.x, // 角色在畫布上的 x 位置
      this.position.y, // 角色在畫布上的 y 位置
      this.width4, // 繪製到畫布上的寬度
      this.height4 // 繪製到畫布上的高度
    );
    if (!this.moving) return;

    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }

    if (this.frames.elapsed % 15 === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++;
      else this.frames.val = 0;
    }
  }
  setDirection(direction) {
    //做pinia傳直
    this.direction = direction; // 設定角色的方向
    this.start = (this.image.width / 4) * direction;
  }
}
// 控制角色方向（例如，按鍵處理）
// player.setDirection(0); // 右
// player.setDirection(1); // 上
// player.setDirection(2); // 左
// player.setDirection(3); // 下

//--end
