//gameStore.js
import { defineStore } from 'pinia';
import { itemApi } from '@/api/itemApi';
import { EquippedSprite } from '@/core/EquippedSprite';

export const useGameStore = defineStore('game', {
  state: () => ({
    inventoryItems: new Array(15).fill(null),
    equipmentSlots: [null, null, null],
    equippedItems: {
      accessory: null,
      hairstyle: null,
      outfit: null,
    },
    itemsData: new Map(),
    inventoryOpen: false,
    inventoryBackground: null,
    account: null,
    slotConfig: {
      size: 105,
      cols: 5,
      rows: 3,
      padding: 15.5,
    },
    inventoryPosition: {
      x: 0,
      y: 0,
    },
    previewBox: {
      x: 0,
      y: 0,
      width: 185,
      height: 300,
    },
    itemSlots: [],
    equipmentSlotsPosition: [],
    loadedSprites: new Map(),
    typeMapping: {
      accessory: "飾品",
      hairstyle: "髮型",
      outfit: "衣服",
      "飾品": "accessory",
      "髮型": "hairstyle",
      "衣服": "outfit"
    }
  }),
  actions: {
        // Add the missing initializePositions method
        initializePositions(canvas) {
          if (!canvas) return;

          // 設定物品欄位置（置中）
          const inventoryX = (canvas.width / 3 - 200);
          const inventoryY = (canvas.height / 3 - 200);

          this.inventoryPosition = { x: inventoryX, y: inventoryY };

          // 計算物品槽位置
          this.itemSlots = [];
          for (let row = 0; row < this.slotConfig.rows; row++) {
            for (let col = 0; col < this.slotConfig.cols; col++) {
              this.itemSlots.push({
                x: inventoryX + 437 + col * (this.slotConfig.size + this.slotConfig.padding),
                y: inventoryY + 163 + row * (this.slotConfig.size + this.slotConfig.padding)
              });
            }
          }

          // 設定裝備槽位置

          this.equipmentSlotsPosition = [];
          for (let i = 0; i < 3; i++) {
            this.equipmentSlotsPosition.push({
              x: inventoryX + 253,
              y: inventoryY + 193 + i * (this.slotConfig.size + this.slotConfig.padding)
            });
          }

          // Set preview box position
          this.previewBox = {
            x: inventoryX + 40,
            y: inventoryY + 200,
            width: 185,
            height: 300
          };
        },
    async initializeInventory(account) {
      try {
        console.log('Starting inventory initialization for account:', account);
        this.account = account;
        this.loadedSprites.clear(); // 重置已加載的精靈

        console.log('Loading inventory background image...');
        this.inventoryBackground = await this.loadImage('/images/BackPack_Test.png');

        const [equipment, userItems] = await Promise.all([
          itemApi.getCharacterEquipment(account),
          itemApi.getUserItems(account)
        ]);

        // 重置所有槽位
        this.inventoryItems = new Array(15).fill(null);
        this.equipmentSlots = [null, null, null];
        this.equippedItems = {
          accessory: null,
          hairstyle: null,
          outfit: null,
        };

        // 先處理裝備槽
        for (const [slot, item] of Object.entries(equipment)) {
          if (item && item.imageName) {
            await this.handleEquipmentInitialization(slot, item);
          }
        }

    // 處理物品欄（只處理非裝備中的物品）
    let inventoryIndex = 0;
    for (const item of userItems) {
      // 檢查該物品是否已經在裝備槽中
      const isEquipped = Object.values(equipment).some(
        equip => equip && equip.imageName === item.imageName
      );

      if (!isEquipped && inventoryIndex < 15) {
        const shopImage = await this.loadImage(`/images/${item.imageName}`);
        if (shopImage) {
          const itemData = await itemApi.getItemByShopImage(item.imageName);
          if (itemData) {
            this.itemsData.set(shopImage, {
              type: this.typeMapping[itemData.pClass] || itemData.pClass,
              imageName: item.imageName,
              fullImagePath: itemData.pImageAll
            });
            this.inventoryItems[inventoryIndex] = shopImage;
            inventoryIndex++;
          }
        }
      }
    }

    console.log('Inventory initialization completed');
  } catch (error) {
    console.error('Error in initializeInventory:', error);
    throw error;
  }
},
async handleEquipmentInitialization(slot, item) {
  const slotIndex = ["accessory", "hairstyle", "outfit"].indexOf(slot);
  if (slotIndex === -1) return;

  const itemData = await itemApi.getItemByShopImage(item.imageName);
  if (!itemData || !itemData.pImageAll) return;

  const fullImage = await this.loadImage(`/images/${itemData.pImageAll}`);
  if (!fullImage) return;

  const sprite = new EquippedSprite({
    image: fullImage,
    frames: { max: 6 }
  });

  await new Promise(resolve => {
    const checkLoaded = () => {
      if (sprite.loaded) resolve();
      else setTimeout(checkLoaded, 100);
    };
    checkLoaded();
  });

  const shopImage = await this.loadImage(`/images/${item.imageName}`);
  if (shopImage) {
    this.equipmentSlots[slotIndex] = shopImage;
    this.equippedItems[slot] = sprite;
    this.itemsData.set(shopImage, {
      type: slot,
      imageName: item.imageName,
      fullImagePath: itemData.pImageAll
    });
  }
},

    async loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => {
          console.warn(`圖片載入失敗: ${src}`, e);
          resolve(null); // 返回 null 而不是直接拋出錯誤
        };
        img.src = src;
      });
    },

    async handleEquip(itemImage, fromSlot, toSlot) {
      try {
        let itemInfo = this.itemsData.get(itemImage);
        if (!itemInfo) return;

        const itemData = await itemApi.getItemByShopImage(itemInfo.imageName);
        if (!itemData || !itemData.pImageAll) return;

        const fullImage = await this.loadImage(`/images/${itemData.pImageAll}`);
        if (!fullImage) return;

        const sprite = new EquippedSprite({
          image: fullImage,
          frames: { max: 6 }
        });

        await new Promise(resolve => {
          const checkLoaded = () => {
            if (sprite.loaded) resolve();
            else setTimeout(checkLoaded, 100);
          };
          checkLoaded();
        });

   // Get the correct type mapping
   const itemType = itemData.pClass;
   const slotType = this.typeMapping[itemType] || itemType;
   const slotIndex = typeof toSlot === 'number' ? toSlot :
     ["accessory", "hairstyle", "outfit"].indexOf(slotType);

        if (slotIndex !== -1) {
          // 如果裝備槽有物品，先移到物品欄
          if (this.equipmentSlots[slotIndex]) {
            const emptySlot = this.inventoryItems.indexOf(null);
            if (emptySlot !== -1) {
              this.inventoryItems[emptySlot] = this.equipmentSlots[slotIndex];
            } else return;
          }

          // 更新裝備槽和精靈
          this.equipmentSlots[slotIndex] = itemImage;
          const types = ["accessory", "hairstyle", "outfit"];
          this.equippedItems[types[slotIndex]] = sprite;

          // 清空來源物品欄位置
          if (fromSlot >= 0) {
            this.inventoryItems[fromSlot] = null;
          }
        }
      } catch (error) {
        console.error('Error equipping item:', error);
      }
    },
    renderInventory(ctx, player) {
      if (!this.inventoryOpen || !ctx) {
        console.log('Not rendering inventory - closed or no context');
        return;
      }

      // Draw background
      if (this.inventoryBackground) {
        ctx.drawImage(
          this.inventoryBackground,
          this.inventoryPosition.x,
          this.inventoryPosition.y
        );
      }

      // Draw inventory slots
      this.itemSlots.forEach((slot, index) => {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 2;
        ctx.strokeRect(slot.x, slot.y, this.slotConfig.size, this.slotConfig.size);

        const item = this.inventoryItems[index];
        if (item && item instanceof Image) {
          ctx.drawImage(
            item,
            slot.x,
            slot.y,
            this.slotConfig.size,
            this.slotConfig.size
          );
        }
      });

      // Draw equipment slots
      this.equipmentSlotsPosition.forEach((slot, i) => {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 2;
        ctx.strokeRect(slot.x, slot.y, this.slotConfig.size, this.slotConfig.size);

        const item = this.equipmentSlots[i];
        if (item && item instanceof Image) {
          ctx.drawImage(
            item,
            slot.x,
            slot.y,
            this.slotConfig.size,
            this.slotConfig.size
          );
        }
      });

      // Draw preview box
      this.drawPreviewBox(ctx, player);
    },

    drawPreviewBox(ctx, player) {
      if (!player) return;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        this.previewBox.x,
        this.previewBox.y,
        this.previewBox.width,
        this.previewBox.height
      );

      if (player && player.image) {
        const scaleFactor = 0.8;
        const start = (player.image.width / 4) * player.direction;

        ctx.drawImage(
          player.image,
          start + player.frames.val * player.width,
          0,
          player.width,
          player.height,
          this.previewBox.x + 10,
          this.previewBox.y + 35,
          this.previewBox.width * scaleFactor,
          this.previewBox.height * scaleFactor
        );

        this.drawEquippedItems(ctx, player, scaleFactor);
      }
    },

    drawEquippedItems(ctx, player, scaleFactor) {
      if (!player) return;

      const equipmentOrder = ["outfit", "hairstyle", "accessory"];
      equipmentOrder.forEach(type => {
          const sprite = this.equippedItems[type];
          if (sprite && sprite.loaded) {
              sprite.draw(
                  ctx,
                  this.previewBox.x + 10,
                  this.previewBox.y + 35,
                  this.previewBox.width * scaleFactor,
                  this.previewBox.height * scaleFactor,
                  player
              );
          }
      });
  },

    handleInventoryClick(x, y) {
      if (!this.inventoryOpen) return;

      this.itemSlots.forEach((slot, index) => {
        if (
          x >= slot.x &&
          x <= slot.x + this.slotConfig.size &&
          y >= slot.y &&
          y <= slot.y + this.slotConfig.size &&
          this.inventoryItems[index]
        ) {
          this.handleEquip(this.inventoryItems[index], index);
        }
      });

      this.equipmentSlotsPosition.forEach((slot, i) => {
        if (
          x >= slot.x &&
          x <= slot.x + this.slotConfig.size &&
          y >= slot.y &&
          y <= slot.y + this.slotConfig.size &&
          this.equipmentSlots[i]
        ) {
          const removedItem = this.equipmentSlots[i];
          const emptySlot = this.inventoryItems.indexOf(null);
          if (emptySlot !== -1) {
            this.inventoryItems[emptySlot] = removedItem;
            this.equipmentSlots[i] = null;
            this.equippedItems[["accessory", "hairstyle", "outfit"][i]] = null;
          }
        }
      });
    },
    async saveInventoryState() {
      try {
        if (!this.account) {
          throw new Error('Player account is not initialized');
        }

    // 準備裝備數據
    const equipmentData = {
      account: this.account,
      accessory: {
        imageName: null,
        type: "飾品"
      },
      hairstyle: {
        imageName: null,
        type: "髮型"
      },
      outfit: {
        imageName: null,
        type: "衣服"
      }
    };
    // 從裝備槽位獲取數據
    const types = ["accessory", "hairstyle", "outfit"];
    this.equipmentSlots.forEach((item, index) => {
      if (item) {
        const itemInfo = this.itemsData.get(item);
        if (itemInfo && itemInfo.imageName) {
          const slotType = types[index];
          equipmentData[slotType].imageName = itemInfo.imageName;
        }
      }
    });

    // 準備背包數據
    const inventoryData = {
      account: this.account,
      items: this.inventoryItems
        .filter(item => item && this.itemsData.get(item))
        .map(item => {
          const itemInfo = this.itemsData.get(item);
          return {
            imageName: itemInfo.imageName || "null"
          };
        })
    };

        console.log('Saving equipment data:', JSON.stringify(equipmentData));
        console.log('Saving inventory data:', JSON.stringify(inventoryData));

        // 使用 Promise.all 同時處理兩個更新請求
        const [equipmentResult, inventoryResult] = await Promise.all([
          itemApi.updateEquipment(equipmentData),
          itemApi.updateInventory(inventoryData)
        ]);

        console.log('Save successful:', { equipmentResult, inventoryResult });
        return { equipmentResult, inventoryResult };

      } catch (error) {
        console.error('Error saving inventory state:', error);
        throw error;
      }
    },

    getEquipmentSlotData(index) {
      const item = this.equipmentSlots[index];
      if (!item) {
        return {
          imageName: null,
          type: this.getTypeForSlot(index)
        };
      }
      const itemInfo = this.itemsData.get(item);
      return {
        imageName: itemInfo?.imageName || null,
        type: this.getTypeForSlot(index)
      };
    },

    getTypeForSlot(index) {
      const types = ["飾品", "髮型", "衣服"];
      return types[index];
    },

    getItemData(item) {
      return this.itemsData.get(item);
    },

    async toggleInventory() {
      const wasOpen = this.inventoryOpen;
      this.inventoryOpen = !this.inventoryOpen;

      if (wasOpen && !this.inventoryOpen) {
        try {
          await this.saveInventoryState();
        } catch (error) {
          console.error('Failed to save inventory state:', error);
          // Optionally reopen the inventory if save fails
          // this.inventoryOpen = true;
        }
      }
    }
  }
});