//gameStore.js
//負責狀態管理
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
    },
    mousePosition: {
      x: 0,
      y: 0
    },
    dragState: {
      isDragging: false,
      draggedItem: null,
      sourceIndex: null,
      sourceType: null, // 'inventory' 或 'equipment'
      dragImage: null,
      offsetX: 0,
      offsetY: 0
    }
  }),
  actions: {
        // 初始化欄位位置
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

          // 設定角色預覽位置
          this.previewBox = {
            x: inventoryX + 40,
            y: inventoryY + 200,
            width: 185,
            height: 300
          };
        },
    async initializeInventory(account) {
      try {

        this.account = account;
        this.loadedSprites.clear(); // 重置已加載的精靈，避免使用舊資料

        this.inventoryBackground = await this.loadImage('/images/BackPack_Test.png');

        //從資料庫取得裝備欄與物品欄的資料，使用Promise.all確保同時執行這兩個請求，提高效率
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
        //Object.entries()是取key-value pair，此處key=slot、value=item
        for (const [slot, item] of Object.entries(equipment)) {
          //確保只處理有圖片名稱的物品
          if (item && item.imageName) {
            //呼叫函式處理
            await this.handleEquipmentInitialization(slot, item);
          }
        }

    // 處理物品欄（只處理非裝備中的物品）
    let inventoryIndex = 0;
    for (const item of userItems) {
      // 檢查該物品是否已經在裝備槽中
      //Object.values是將物件所有值轉陣列，.some確認至少有一個元素符合條件
      const isEquipped = Object.values(equipment).some(
        //檢查裝備與物品的圖片名稱是否相同
        equip => equip && equip.imageName === item.imageName
      );
      //物品不在裝備欄&背包物品欄沒裝滿
      if (!isEquipped && inventoryIndex < 15) {
        //載入物品圖片
        const shopImage = await this.loadImage(`/images/${item.imageName}`);
        if (shopImage) {
          //透過該物品的圖片名稱取得資料
          const itemData = await itemApi.getItemByShopImage(item.imageName);
          if (itemData) {
            //儲存對應格式資料進itemsData
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
  } catch (error) {
    console.error('Error in initializeInventory:', error);
    throw error;
  }
},async createEquippedSprite(imageName) {
  try{
    //檢查itemData 是否存在，並確保其 pImageAll 屬性不為空
    const itemData = await itemApi.getItemByShopImage(imageName);
    if (!itemData?.pImageAll) {
      return { success: false };
    }
  //載入物品完整圖片，失敗return
  const fullImage = await this.loadImage(`/images/${itemData.pImageAll}`);
  if (!fullImage) {
    return { success: false };
  }
  //使用EquippedSprite裁切
  const sprite = new EquippedSprite({
    image: fullImage,
    frames: { max: 6 }
  });
  //避免在未載入完成的情況下使用 sprite
  await new Promise(resolve => {
    //100毫秒就檢查，為true才resolve
    const checkLoaded = () => {
      if (sprite.loaded) resolve();
      else setTimeout(checkLoaded, 100);
    };
    checkLoaded();
  });
  //返回成功結果
  return {
    success: true,
    sprite,
    itemData
  };
  }catch(error){
    console.error('Error creating equipped sprite:', error);
    return { success: false };
  }
},
async handleEquipmentInitialization(slot, item) {
  //檢查slot是否為指定裝備欄位類型，等於-1(false)return
  const slotIndex = ["accessory", "hairstyle", "outfit"].indexOf(slot);
  if (slotIndex === -1) return;

  const result = await this.createEquippedSprite(item.imageName);
  if (!result.success) return;

  //載入物品縮圖
  const shopImage = await this.loadImage(`/images/${item.imageName}`);
  if (shopImage) {
    //物品縮圖設定到裝備欄對應位置
    this.equipmentSlots[slotIndex] = shopImage;
    //對應裝備拿去裁切製作動畫
    this.equippedItems[slot] = result.sprite;
    this.itemsData.set(shopImage, {
      type: slot,
      imageName: item.imageName,
      fullImagePath: result.itemData.pImageAll
    });
  }
},
    async loadImage(src) {
      //不使用reject
      return new Promise((resolve) => {
        const img = new Image();
        //載入成功丟回img
        img.onload = () => resolve(img);
        img.onerror = (e) => {
          console.warn(`圖片載入失敗: ${src}`, e);
          //載入失敗丟回null，沒使用reject
          resolve(null);
        };
        //圖片路徑設置
        img.src = src;
      });
    },

    async handleEquip(itemImage, fromSlot, toSlot) {
      try {
        // 1. 檢查要裝備的物品資訊
        let itemInfo = this.itemsData.get(itemImage);
        if (!itemInfo) return;

        // 2. 創建新裝備的精靈
        const result = await this.createEquippedSprite(itemInfo.imageName);
        if (!result.success) return;

        // 3. 確定目標裝備槽位置
        const itemType = result.itemData.pClass;
        const slotType = this.typeMapping[itemType] || itemType;
        const slotIndex = typeof toSlot === 'number' ? toSlot :
          ["accessory", "hairstyle", "outfit"].indexOf(slotType);

        if (slotIndex !== -1) {
          // 4. 儲存目標裝備槽的當前物品（如果有的話）
          const currentEquippedItem = this.equipmentSlots[slotIndex];

          // 5. 先從來源位置（物品欄）移除物品
          if (fromSlot >= 0) {
            this.inventoryItems[fromSlot] = null;
          }

          // 6. 如果裝備槽有物品，將其移到原始物品的位置
          if (currentEquippedItem) {
            if (fromSlot >= 0) {
              // 如果是從物品欄來的，就放回原位置
              this.inventoryItems[fromSlot] = currentEquippedItem;
            } else {
              // 如果不是從物品欄來的（例如直接裝備），找一個空位
              const emptySlot = this.inventoryItems.indexOf(null);
              if (emptySlot !== -1) {
                this.inventoryItems[emptySlot] = currentEquippedItem;
              } else return; // 如果沒有空位，中止操作
            }
          }

          // 7. 更新裝備槽和精靈
          this.equipmentSlots[slotIndex] = itemImage;
          const types = ["accessory", "hairstyle", "outfit"];
          this.equippedItems[types[slotIndex]] = result.sprite;
        }
      } catch (error) {
        console.error('Error equipping item:', error);
      }
    },
    //ctx是CanvasRenderingContext2D簡稱
    renderInventory(ctx, player) {
      //檢查物品欄是否開啟、ctx是否存在
      if (!this.inventoryOpen || !ctx) {
        console.log('Not rendering inventory - closed or no context');
        return;
      }

      // 繪製背包圖片
      if (this.inventoryBackground) {
        ctx.drawImage(
          this.inventoryBackground,
          this.inventoryPosition.x,
          this.inventoryPosition.y
        );
      }

      //繪製物品欄
      this.itemSlots.forEach((slot, index) => {
        //取出對應物品繪製
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

      // 繪製裝備欄
      this.equipmentSlotsPosition.forEach((slot, i) => {
        //取出對應裝備繪製
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

      // 繪製角色預覽框
      this.drawPreviewBox(ctx, player);
      // 如果正在拖曳，繪製拖曳中的物品
      if (this.dragState.isDragging && this.dragState.dragImage) {
        ctx.drawImage(
          this.dragState.dragImage,
          this.mousePosition.x - this.dragState.offsetX,
          this.mousePosition.y - this.dragState.offsetY,
          this.slotConfig.size,
          this.slotConfig.size
        );
      }
    },

    drawPreviewBox(ctx, player) {
      if (!player) return;
      //繪製角色預覽
      if (player && player.image) {
        //縮放比例
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
  // 開始拖曳
  startDrag(event, item, index, type) {
    if (!item) return;

    const rect = event.target.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    this.mousePosition = { x: clickX, y: clickY };

    let offsetX, offsetY;
    if (type === 'inventory') {
      offsetX = clickX - this.itemSlots[index].x;
      offsetY = clickY - this.itemSlots[index].y;
    } else {
      offsetX = clickX - this.equipmentSlotsPosition[index].x;
      offsetY = clickY - this.equipmentSlotsPosition[index].y;
    }

    this.dragState = {
      isDragging: true,
      draggedItem: item,
      sourceIndex: index,
      sourceType: type,
      dragImage: item,
      offsetX,
      offsetY
    };
  },

  // 更新拖曳位置
  updateDrag(event) {
    if (!this.dragState.isDragging) return;
    
    const rect = event.target.getBoundingClientRect();
    this.mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  },

  // 結束拖曳
  endDrag(event) {
    if (!this.dragState.isDragging) return;

    const { x, y } = this.getMousePosition(event);
    let targetFound = false;

    // 檢查是否放在裝備欄上
    if (this.dragState.sourceType === 'inventory') {
      this.equipmentSlotsPosition.forEach((slot, index) => {
        if (
          x >= slot.x &&
          x <= slot.x + this.slotConfig.size &&
          y >= slot.y &&
          y <= slot.y + this.slotConfig.size
        ) {
          // 使用現有的裝備邏輯
          this.handleEquip(this.dragState.draggedItem, this.dragState.sourceIndex, index);
          targetFound = true;
        }
      });
    }

    // 檢查是否放在物品欄上
    if (this.dragState.sourceType === 'equipment') {
      this.itemSlots.forEach((slot, index) => {
        if (
          x >= slot.x &&
          x <= slot.x + this.slotConfig.size &&
          y >= slot.y &&
          y <= slot.y + this.slotConfig.size &&
          !this.inventoryItems[index] // 確保目標格子是空的
        ) {
          // 處理卸下裝備
          const equipmentIndex = this.dragState.sourceIndex;
          const removedItem = this.equipmentSlots[equipmentIndex];

          if (removedItem) {
            this.inventoryItems[index] = removedItem;
            this.equipmentSlots[equipmentIndex] = null;
            this.equippedItems[["accessory", "hairstyle", "outfit"][equipmentIndex]] = null;
          }
          targetFound = true;
        }
      });
    }

    // 重置拖曳狀態
    this.dragState = {
      isDragging: false,
      draggedItem: null,
      sourceIndex: null,
      sourceType: null,
      dragImage: null,
      offsetX: 0,
      offsetY: 0
    };
  },

  // 獲取滑鼠在畫布上的位置
  getMousePosition(event) {
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  },
    //處理點擊物品欄或裝備欄的互動事件
    handleInventoryClick(x, y) {
      if (!this.inventoryOpen) return;

      //檢查並處理物品欄點擊
      this.itemSlots.forEach((slot, index) => {
        if (
          //檢查點擊的 x 與 y 座標是否位於該物品欄的水平、垂直範圍內
          x >= slot.x &&
          x <= slot.x + this.slotConfig.size &&
          y >= slot.y &&
          y <= slot.y + this.slotConfig.size &&
          //檢查欄位是否有物品，若null則略過
          this.inventoryItems[index]
        ) {
          this.handleEquip(this.inventoryItems[index], index);
        }
      });
      //檢查並處理裝備欄點擊
      this.equipmentSlotsPosition.forEach((slot, i) => {
        if (
          x >= slot.x &&
          x <= slot.x + this.slotConfig.size &&
          y >= slot.y &&
          y <= slot.y + this.slotConfig.size &&
          this.equipmentSlots[i]
        ) {
          //抓被移除的裝備
          const removedItem = this.equipmentSlots[i];
          //找物品欄第一格為空的欄位
          const emptySlot = this.inventoryItems.indexOf(null);
          //如果找到空欄位
          if (emptySlot !== -1) {
            //將removedItem 移到物品欄的空位置
            this.inventoryItems[emptySlot] = removedItem;
            //將裝備欄中的欄位清空
            this.equipmentSlots[i] = null;
            //清空裝備欄對應的裝備記錄
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
        }
      }
    }
  }
});