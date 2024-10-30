//gameStore.js
import { defineStore } from "pinia";
import { itemApi } from "@/api/itemApi";
import { EquippedSprite } from "@/core/EquippedSprite";
import { Playerinformation } from "@/Stores/PlayerCharacter";

export const useGameStore = defineStore("game", {
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
      飾品: "accessory",
      髮型: "hairstyle",
      衣服: "outfit",
    },
    mousePosition: {
      x: 0,
      y: 0,
    },
    dragState: {
      isDragging: false,
      draggedItem: null,
      sourceIndex: null,
      sourceType: null,
      dragImage: null,
      offsetX: 0,
      offsetY: 0,
    },
    equippedItemsMap: new Map(), // 追踪哪些物品已被裝備
    grayImageCache: new Map(), // 緩存灰色版本的圖片
  }),
  actions: {
    initializePositions(canvas) {
      if (!canvas) return;

      const inventoryX = canvas.width / 3 - 200;
      const inventoryY = canvas.height / 3 - 200;

      this.inventoryPosition = { x: inventoryX, y: inventoryY };

      this.itemSlots = [];
      for (let row = 0; row < this.slotConfig.rows; row++) {
        for (let col = 0; col < this.slotConfig.cols; col++) {
          this.itemSlots.push({
            x:
              inventoryX +
              437 +
              col * (this.slotConfig.size + this.slotConfig.padding),
            y:
              inventoryY +
              163 +
              row * (this.slotConfig.size + this.slotConfig.padding),
          });
        }
      }

      this.equipmentSlotsPosition = [];
      for (let i = 0; i < 3; i++) {
        this.equipmentSlotsPosition.push({
          x: inventoryX + 253,
          y:
            inventoryY +
            193 +
            i * (this.slotConfig.size + this.slotConfig.padding),
        });
      }

      this.previewBox = {
        x: inventoryX + 40,
        y: inventoryY + 200,
        width: 185,
        height: 300,
      };
    },
    async initializeInventory(account) {
      try {
        this.account = account;
        this.loadedSprites.clear();
        this.inventoryBackground = await this.loadImage(
          "/images/BackPack_Test.png"
        );

        const [equipment, userItems] = await Promise.all([
          itemApi.getCharacterEquipment(account),
          itemApi.getUserItems(account),
        ]);

        this.inventoryItems = new Array(15).fill(null);
        this.equipmentSlots = [null, null, null];
        this.equippedItems = {
          accessory: null,
          hairstyle: null,
          outfit: null,
        };

        for (const [slot, item] of Object.entries(equipment)) {
          if (item && item.imageName) {
            await this.handleEquipmentInitialization(slot, item);
          }
        }

        let inventoryIndex = 0;
        for (const item of userItems) {
          const isEquipped = Object.values(equipment).some(
            (equip) => equip && equip.imageName === item.imageName
          );

          if (!isEquipped && inventoryIndex < 15) {
            const shopImage = await this.loadImage(item.imageName);
            if (shopImage) {
              const imageName = item.imageName.split("/").pop();
              const itemData = await itemApi.getItemByShopImage(imageName);

              if (itemData) {
                this.itemsData.set(shopImage, {
                  type: this.typeMapping[itemData.pClass] || itemData.pClass,
                  imageName: imageName,
                  fullImagePath: itemData.pImageAll,
                });
                this.inventoryItems[inventoryIndex] = shopImage;
                inventoryIndex++;
              }
            }
          }
        }
        await this.syncEquipmentToPinia();
      } catch (error) {
        console.error("Error in initializeInventory:", error);
        throw error;
      }
    },
    async createEquippedSprite(imageName) {
      try {
        const fileName = imageName.split("/").pop();
        const itemData = await itemApi.getItemByShopImage(fileName);
        if (!itemData?.pImageAll) {
          return { success: false };
        }
        const fullImage = await this.loadImage(itemData.pImageAll);
        if (!fullImage) {
          return { success: false };
        }
        const sprite = new EquippedSprite({
          image: fullImage,
          frames: { max: 6 },
        });
        await new Promise((resolve) => {
          const checkLoaded = () => {
            if (sprite.loaded) resolve();
            else setTimeout(checkLoaded, 100);
          };
          checkLoaded();
        });
        return {
          success: true,
          sprite,
          itemData,
        };
      } catch (error) {
        console.error("Error creating equipped sprite:", error);
        return { success: false };
      }
    },
    // 新增：創建灰色版本的圖片
    createGrayImage(originalImage) {
      // 檢查緩存
      if (this.grayImageCache.has(originalImage)) {
        return this.grayImageCache.get(originalImage);
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;

      // 繪製原始圖片
      ctx.drawImage(originalImage, 0, 0);

      // 獲取圖片數據
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 轉換為灰度
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = gray; // R
        data[i + 1] = gray; // G
        data[i + 2] = gray; // B
        // 保持原始透明度
      }

      ctx.putImageData(imageData, 0, 0);

      // 創建新的 Image 對象
      const grayImage = new Image();
      grayImage.src = canvas.toDataURL();

      // 存入緩存
      this.grayImageCache.set(originalImage, grayImage);

      return grayImage;
    },
    async handleEquipmentInitialization(slot, item) {
      const slotIndex = ["accessory", "hairstyle", "outfit"].indexOf(slot);
      if (slotIndex === -1) return;

      const imageName = item.imageName.split("/").pop();
      const result = await this.createEquippedSprite(imageName);

      if (!result.success) return;

      const shopImage = await this.loadImage(item.imageName);
      if (shopImage) {
        this.equipmentSlots[slotIndex] = shopImage;
        this.equippedItems[slot] = result.sprite;
        this.itemsData.set(shopImage, {
          type: slot,
          imageName: imageName,
          fullImagePath: result.itemData.pImageAll,
        });
      }
    },

    // 新增同步裝備到 Pinia 的方法
    async syncEquipmentToPinia() {
      try {
        const playerCharacterStore = Playerinformation();
        const equipmentData = await itemApi.getCharacterEquipment(this.account);

        if (!equipmentData) return;

        // 取得各裝備的 P_Code
        const accessoryCode = await this.getItemPCode(equipmentData.accessory?.imageName);
        const hairstyleCode = await this.getItemPCode(equipmentData.hairstyle?.imageName);
        const outfitCode = await this.getItemPCode(equipmentData.outfit?.imageName);

        // 更新 Pinia store
        playerCharacterStore.Head = accessoryCode?.toString() || "";
        playerCharacterStore.Upper = hairstyleCode?.toString() || "";
        playerCharacterStore.Lower = outfitCode?.toString() || "";

        return true;
      } catch (error) {
        console.error("Error syncing equipment to Pinia:", error);
        return false;
      }
    },

    // 新增輔助方法來獲取物品的 P_Code
    async getItemPCode(imageName) {
      if (!imageName) return null;
      const fileName = imageName.split("/").pop();
      const itemData = await itemApi.getItemByShopImage(fileName);
      return itemData?.pCode || null;
    },
    async handleEquipmentInitialization(slot, item) {
      const slotIndex = ["accessory", "hairstyle", "outfit"].indexOf(slot);
      if (slotIndex === -1) return;

      const imageName = item.imageName.split("/").pop();
      const result = await this.createEquippedSprite(imageName);

      if (!result.success) return;

      const shopImage = await this.loadImage(item.imageName);
      if (shopImage) {
        this.equipmentSlots[slotIndex] = shopImage;
        this.equippedItems[slot] = result.sprite;
        this.itemsData.set(shopImage, {
          type: slot,
          imageName: imageName,
          fullImagePath: result.itemData.pImageAll,
        });
      }
    },
    async loadImage(src) {
      try {
        if (src.startsWith("/")) {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
              console.warn(`本地圖片載入失敗: ${src}`);
              resolve(null);
            };
            img.src = src;
          });
        }

        const response = await fetch(src, {
          mode: "cors",
          headers: {
            Accept: "image/*",
          },
        });

        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = reader.result;
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.warn(`圖片載入失敗: ${src}`, error);
        return null;
      }
    },

    async handleEquip(itemImage, fromIndex) {
      try {
        let itemInfo = this.itemsData.get(itemImage);
        if (!itemInfo) return;

        const result = await this.createEquippedSprite(itemInfo.imageName);
        if (!result.success) return;

        const itemType = result.itemData.pClass;
        const slotType = this.typeMapping[itemType] || itemType;
        const slotIndex = ["accessory", "hairstyle", "outfit"].indexOf(
          slotType
        );

        if (slotIndex !== -1) {
          // 如果該類型已有裝備，先解除該裝備的灰色狀態
          const currentEquippedItem = this.equipmentSlots[slotIndex];
          if (currentEquippedItem) {
            const currentItemInfo = this.itemsData.get(currentEquippedItem);
            const inventoryIndex = this.inventoryItems.findIndex(
              (item) =>
                item &&
                this.itemsData.get(item)?.imageName ===
                  currentItemInfo?.imageName
            );
            if (inventoryIndex !== -1) {
              this.equippedItemsMap.delete(this.inventoryItems[inventoryIndex]);
            }
          }

          // 設置新裝備
          this.equipmentSlots[slotIndex] = itemImage;
          this.equippedItems[slotType] = result.sprite;

          // 設置物品欄對應物品為灰色狀態
          const inventoryItem = this.inventoryItems[fromIndex];
          if (inventoryItem) {
            this.equippedItemsMap.set(inventoryItem, true);
          }
        }
      } catch (error) {
        console.error("Error equipping item:", error);
      }
    },
    handleUnequip(slotIndex) {
      const item = this.equipmentSlots[slotIndex];
      if (item) {
        // 找到對應的物品欄物品並解除灰色狀態
        const itemInfo = this.itemsData.get(item);
        const inventoryIndex = this.inventoryItems.findIndex(
          (invItem) =>
            invItem &&
            this.itemsData.get(invItem)?.imageName === itemInfo?.imageName
        );

        if (inventoryIndex !== -1) {
          this.equippedItemsMap.delete(this.inventoryItems[inventoryIndex]);
        }

        // 清除裝備欄
        this.equipmentSlots[slotIndex] = null;
        this.equippedItems[["accessory", "hairstyle", "outfit"][slotIndex]] =
          null;
      }
    },
    renderInventory(ctx, player) {
      // 如果物品欄關閉，只需清除相關區域即可
      if (!this.inventoryOpen) {
        if (this.inventoryBackground) {
          // 清除物品欄區域
          ctx.clearRect(
            this.inventoryPosition.x,
            this.inventoryPosition.y,
            this.inventoryBackground.width,
            this.inventoryBackground.height
          );
        }
        return;
      }

      // 以下是原有的渲染邏輯
      if (!ctx) return;

      if (this.inventoryBackground) {
        ctx.drawImage(
          this.inventoryBackground,
          this.inventoryPosition.x,
          this.inventoryPosition.y
        );
      }

      // 渲染物品欄
      this.itemSlots.forEach((slot, index) => {
        const item = this.inventoryItems[index];
        if (item && item instanceof Image) {
          if (this.equippedItemsMap.get(item)) {
            const grayImage = this.createGrayImage(item);
            ctx.drawImage(
              grayImage,
              slot.x,
              slot.y,
              this.slotConfig.size,
              this.slotConfig.size
            );
          } else {
            ctx.drawImage(
              item,
              slot.x,
              slot.y,
              this.slotConfig.size,
              this.slotConfig.size
            );
          }
        }
      });

      // 渲染裝備欄
      this.equipmentSlotsPosition.forEach((slot, i) => {
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

      this.drawPreviewBox(ctx, player);

      // 渲染拖曳中的物品
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
      equipmentOrder.forEach((type) => {
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
    startDrag(event, item, index, type) {
      if (!item) return;

      const rect = event.target.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      this.mousePosition = { x: clickX, y: clickY };

      let offsetX, offsetY;
      if (type === "inventory") {
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
        offsetY,
      };
    },

    updateDrag(event) {
      if (!this.dragState.isDragging) return;

      const rect = event.target.getBoundingClientRect();
      this.mousePosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    },

    async endDrag(event) {
      if (!this.dragState.isDragging) return;

      const { x, y } = this.getMousePosition(event);
      const { sourceType, sourceIndex, draggedItem } = this.dragState;

      if (sourceType === "inventory") {
        // 從物品欄拖到裝備欄
        const draggedItemInfo = this.itemsData.get(draggedItem);
        if (!draggedItemInfo) return;

        const itemType = draggedItemInfo.type;
        for (
          let index = 0;
          index < this.equipmentSlotsPosition.length;
          index++
        ) {
          const slot = this.equipmentSlotsPosition[index];
          if (
            x >= slot.x &&
            x <= slot.x + this.slotConfig.size &&
            y >= slot.y &&
            y <= slot.y + this.slotConfig.size
          ) {
            const slotTypes = ["accessory", "hairstyle", "outfit"];
            const targetSlotType = slotTypes[index];

            if (
              itemType === targetSlotType ||
              this.typeMapping[itemType] === targetSlotType
            ) {
              await this.handleEquip(draggedItem, sourceIndex);
              break;
            }
          }
        }
      } else if (sourceType === "equipment") {
        // 從裝備欄拖回物品欄 - 直接解除裝備
        this.handleUnequip(sourceIndex);
      }

      // 重置拖曳狀態
      this.dragState = {
        isDragging: false,
        draggedItem: null,
        sourceIndex: null,
        sourceType: null,
        dragImage: null,
        offsetX: 0,
        offsetY: 0,
      };
    },

    getMousePosition(event) {
      const canvas = event.target;
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    },

    handleInventoryClick(x, y) {
      if (!this.inventoryOpen) return;

      // 處理物品欄點擊
      const inventorySlotIndex = this.itemSlots.findIndex(
        (slot) =>
          x >= slot.x &&
          x <= slot.x + this.slotConfig.size &&
          y >= slot.y &&
          y <= slot.y + this.slotConfig.size
      );

      if (inventorySlotIndex !== -1) {
        const item = this.inventoryItems[inventorySlotIndex];
        if (item && !this.equippedItemsMap.get(item)) {
          const itemInfo = this.itemsData.get(item);
          if (itemInfo) {
            // 確保我們得到正確的 slot type
            const itemType = itemInfo.type;
            const slotType = this.typeMapping[itemType] || itemType;

            // 尋找對應的裝備欄位置
            const slotIndex = ["accessory", "hairstyle", "outfit"].indexOf(
              slotType
            );
            if (slotIndex !== -1) {
              this.handleEquip(item, inventorySlotIndex);
              return;
            }
          }
        }
        return; // 如果點擊了物品欄但沒有成功裝備，提前返回
      }

      // 處理裝備欄點擊
      const equipmentSlotIndex = this.equipmentSlotsPosition.findIndex(
        (slot) =>
          x >= slot.x &&
          x <= slot.x + this.slotConfig.size &&
          y >= slot.y &&
          y <= slot.y + this.slotConfig.size
      );

      if (
        equipmentSlotIndex !== -1 &&
        this.equipmentSlots[equipmentSlotIndex]
      ) {
        this.handleUnequip(equipmentSlotIndex);
      }
    },
    async saveInventoryState() {
      try {
        if (!this.account) {
          throw new Error("Player account is not initialized");
        }

        const equipmentData = {
          account: this.account,
          accessory: {
            imageName: null,
            type: "飾品",
          },
          hairstyle: {
            imageName: null,
            type: "髮型",
          },
          outfit: {
            imageName: null,
            type: "衣服",
          },
        };

        // 遍歷裝備槽位，只更新有裝備的槽位
        this.equipmentSlots.forEach((item, index) => {
          if (item) {
            const itemInfo = this.itemsData.get(item);
            if (itemInfo && itemInfo.imageName) {
              const slotType = ["accessory", "hairstyle", "outfit"][index];
              equipmentData[slotType].imageName = itemInfo.imageName;
            }
          }
        });
        // 檢查是否所有 imageName 都有值，如果沒有則設置為空字符串而不是 null
        Object.keys(equipmentData).forEach((key) => {
          if (key !== "account" && equipmentData[key].imageName === null) {
            equipmentData[key].imageName = "";
          }
        });
        const result = await itemApi.updateEquipment(equipmentData);
        if (result.success) {
          this.inventoryOpen = false; // 成功時才關閉背包
        }
        return result;
      } catch (error) {
        console.error("Error saving inventory state:", error);
        throw error;
      }
    },

    getEquipmentSlotData(index) {
      const item = this.equipmentSlots[index];
      if (!item) {
        return {
          imageName: null,
          type: this.getTypeForSlot(index),
        };
      }
      const itemInfo = this.itemsData.get(item);
      return {
        imageName: itemInfo?.imageName || null,
        type: this.getTypeForSlot(index),
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
      if (this.inventoryOpen) {
        // 關閉物品欄時儲存狀態
        try {
          await this.saveInventoryState();
          await this.syncEquipmentToPinia();
        } catch (error) {
          console.error("Failed to save inventory state:", error);
        }
      } else {
        try {
          if (this.account) {
            const currentEquipment = {
              accessory: this.equippedItems.accessory,
              hairstyle: this.equippedItems.hairstyle,
              outfit: this.equippedItems.outfit,
            };
            const currentEquipmentSlots = [...this.equipmentSlots];

            const [equipment, userItems] = await Promise.all([
              itemApi.getCharacterEquipment(this.account),
              itemApi.getUserItems(this.account),
            ]);

            // 重置物品欄和裝備數據
            this.inventoryItems = new Array(15).fill(null);
            this.equippedItemsMap.clear(); // 重置已裝備物品的追蹤
            // 如果沒有現有裝備，才初始化裝備欄
            if (
              !currentEquipment.accessory &&
              !currentEquipment.hairstyle &&
              !currentEquipment.outfit
            ) {
              this.equipmentSlots = [null, null, null];
              this.equippedItems = {
                accessory: null,
                hairstyle: null,
                outfit: null,
              };

              // 處理裝備數據
              for (const [slot, item] of Object.entries(equipment)) {
                if (item && item.imageName) {
                  await this.handleEquipmentInitialization(slot, item);
                }
              }
            } else {
              // 保持現有裝備狀態
              this.equipmentSlots = currentEquipmentSlots;
              this.equippedItems = currentEquipment;
            }
            // 處理物品欄數據
            let inventoryIndex = 0;
            for (const item of userItems) {
              if (inventoryIndex < 15) {
                const shopImage = await this.loadImage(item.imageName);
                if (shopImage) {
                  const imageName = item.imageName.split("/").pop();
                  const itemData = await itemApi.getItemByShopImage(imageName);

                  if (itemData) {
                    this.itemsData.set(shopImage, {
                      type: this.typeMapping[itemData.pClass] || itemData.pClass,
                      imageName: imageName,
                      fullImagePath: itemData.pImageAll,
                    });
                    this.inventoryItems[inventoryIndex] = shopImage;

                    // 檢查此物品是否已裝備
                    const isEquipped = Object.values(equipment).some(
                      (equip) => equip && equip.imageName === item.imageName
                    );
                    if (isEquipped) {
                      this.equippedItemsMap.set(shopImage, true);
                    }

                    inventoryIndex++;
                  }
                }
              }
            }
          }
          this.inventoryOpen = true;
          await this.syncEquipmentToPinia();
        } catch (error) {
          console.error("Failed to refresh inventory data:", error);
        }
      }
    },
  },
});
