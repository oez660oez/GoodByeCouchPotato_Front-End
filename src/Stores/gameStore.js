//gameStore.js
import { defineStore } from "pinia";
import { itemApi } from "@/api/itemApi";
import { EquippedSprite } from "@/core/EquippedSprite";
import { Playerinformation } from "@/Stores/PlayerCharacter";
import { useRouter } from "vue-router";
const router = useRouter();
export const useGameStore = defineStore("game", {
  state: () => ({
    inventoryItems: [],
    currentPage: 0,
    itemsPerPage: 9,
    totalPages: 0,
    paginationButtons: {
      prev: { x: 0, y: 0, width: 30, height: 30 },
      next: { x: 0, y: 0, width: 30, height: 30 },
    },
    equipmentSlots: [null, null, null],
    equippedItems: {
      accessory: null,
      hairstyle: null,
      outfit: null,
    },
    itemsData: new Map(),
    inventoryOpen: false,
    inventoryBackground: null,
    prevButtonImg: null,
    nextButtonImg: null,
    account: null,
    slotConfig: {
      size: 70,
      cols: 3,
      rows: 3,
      padding: 35,
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
  getters: {
    currentPageItems() {
      const start = this.currentPage * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.inventoryItems.slice(start, end);
    },
  },
  actions: {
    async initializeEquipmentRender(equipment, account) {
      try {
        // 設置 account
        this.account = account;

        // 清空現有裝備狀態
        this.equipmentSlots = [null, null, null];
        this.equippedItems = {
          accessory: null,
          hairstyle: null,
          outfit: null,
        };

        // 如果沒有傳入裝備數據，則從 API 獲取
        if (!equipment) {
          console.log(this.account);
          equipment = await itemApi.getCharacterEquipment(this.account);
        }

        console.log("當前裝備狀態:", equipment);

        // 處理每個裝備槽位
        const equipmentPromises = Object.entries(equipment).map(
          async ([slot, item]) => {
            if (item && item.imageName) {
              return this.handleEquipmentInitialization(slot, item);
            }
          }
        );

        // 等待所有裝備初始化完成
        await Promise.all(equipmentPromises);

        console.log("裝備渲染初始化完成");
        return true;
      } catch (error) {
        console.error("裝備渲染初始化失敗:", error);
        return false;
      }
    },
    async initializeInventory(account) {
      try {
        this.account = account;
        this.loadedSprites.clear();
        this.inventoryItems = []; // 清空物品陣列
        this.currentPage = 0;
        this.equipmentSlots = [null, null, null];
        this.equippedItems = {
          accessory: null,
          hairstyle: null,
          outfit: null,
        };
        this.itemsData.clear(); // 清空物品數據
        console.log("初始化背包 - 開始");
        this.inventoryBackground = await this.loadImage("/images/BackPack.png");

        const [equipment, userItems] = await Promise.all([
          itemApi.getCharacterEquipment(account),
          itemApi.getUserItems(account),
        ]);
        console.log("當前裝備狀態:", equipment);
        for (const [slot, item] of Object.entries(equipment)) {
          if (item && item.imageName) {
            await this.handleEquipmentInitialization(slot, item);
          }
        }

        // 處理背包物品
        const processedItems = new Set(); // 用於追蹤已處理的物品
        for (const item of userItems) {
          const shopImage = await this.loadImage(item.imageName);
          if (shopImage) {
            const imageName = item.imageName.split("/").pop();
            // 檢查是否已經處理過這個物品
            if (!processedItems.has(imageName)) {
              const itemData = await itemApi.getItemByShopImage(imageName);
              if (itemData) {
                this.itemsData.set(shopImage, {
                  type: this.typeMapping[itemData.pClass] || itemData.pClass,
                  imageName: imageName,
                  fullImagePath: itemData.pImageAll,
                });
                this.inventoryItems.push(shopImage);
                processedItems.add(imageName); // 標記為已處理
              }
            }
          }
        }

        this.totalPages = Math.ceil(
          this.inventoryItems.length / this.itemsPerPage
        );
        this.currentPage = 0;
        console.log("背包初始化完成，總頁數：", this.totalPages);

        await this.syncEquipmentToPinia();
      } catch (error) {
        console.error("Error in initializeInventory:", error);
        throw error;
      }
    },
    changePage(direction) {
      if (direction === "next" && this.currentPage < this.totalPages - 1) {
        this.currentPage++;
      } else if (direction === "prev" && this.currentPage > 0) {
        this.currentPage--;
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
            else setTimeout(checkLoaded, 10);
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
      if (!originalImage) {
        console.warn("嘗試為空圖片創建灰色版本");
        return null;
      }
      // 檢查緩存
      if (this.grayImageCache.has(originalImage)) {
        console.log("從緩存中獲取灰色圖片");
        return this.grayImageCache.get(originalImage);
      }
      console.log("創建新的灰色圖片");
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
      console.log("灰色圖片已緩存");

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
        const accessoryCode = await this.getItemPCode(
          equipmentData.accessory?.imageName
        );
        const hairstyleCode = await this.getItemPCode(
          equipmentData.hairstyle?.imageName
        );
        const outfitCode = await this.getItemPCode(
          equipmentData.outfit?.imageName
        );

        console.log("更新前的 Pinia 狀態:", {
          Head: playerCharacterStore.Head,
          Upper: playerCharacterStore.Upper,
          Lower: playerCharacterStore.Lower,
        });

        // 更新 Pinia store
        playerCharacterStore.Head = accessoryCode?.toString() || "";
        playerCharacterStore.Upper = hairstyleCode?.toString() || "";
        playerCharacterStore.Lower = outfitCode?.toString() || "";

        console.log("更新後的 Pinia 狀態:", {
          Head: playerCharacterStore.Head,
          Upper: playerCharacterStore.Upper,
          Lower: playerCharacterStore.Lower,
        });

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
        console.log("開始裝備物品:", fromIndex);
        const actualItem = this.inventoryItems[fromIndex];
        let itemInfo = this.itemsData.get(actualItem);

        if (!itemInfo) {
          console.warn("找不到物品資訊");
          return;
        }

        const result = await this.createEquippedSprite(itemInfo.imageName);
        if (!result.success) {
          console.warn("創建裝備精靈圖失敗");
          return;
        }

        const itemType = result.itemData.pClass;
        const slotType = this.typeMapping[itemType] || itemType;
        const slotIndex = ["accessory", "hairstyle", "outfit"].indexOf(slotType);

        if (slotIndex !== -1) {
          // 處理已裝備的物品
          const existingItem = this.equipmentSlots[slotIndex];
          if (existingItem) {
            const existingItemInfo = this.itemsData.get(existingItem);
            const inventoryIndex = this.inventoryItems.findIndex(
              (invItem) => invItem &&
              this.itemsData.get(invItem)?.imageName === existingItemInfo?.imageName
            );
            if (inventoryIndex !== -1) {
              this.equippedItemsMap.delete(this.inventoryItems[inventoryIndex]);
            }
          }

          // 設置新裝備
          this.equipmentSlots[slotIndex] = actualItem;
          this.equippedItems[slotType] = result.sprite;
          this.equippedItemsMap.set(actualItem, true);

          console.log(`成功裝備到正確位置: ${slotType}`);
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
      const currentItems = this.currentPageItems;
      this.itemSlots.forEach((slot, index) => {
        const item = currentItems[index];
        if (item && item instanceof Image) {
          // 檢查該物品是否在裝備欄中
          const isEquipped = this.equipmentSlots.some((equippedItem) => {
            if (!equippedItem) return false;
            const equippedItemInfo = this.itemsData.get(equippedItem);
            const currentItemInfo = this.itemsData.get(item);
            return equippedItemInfo?.imageName === currentItemInfo?.imageName;
          });

          if (isEquipped) {
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
      this.renderPaginationButtons(ctx);
    },
    async renderPaginationButtons(ctx) {
      // 確保按鈕圖片已載入
      if (!this.prevButtonImg) {
        this.prevButtonImg = await this.loadImage("/images/lastpagebutton.png");
      }
      if (!this.nextButtonImg) {
        this.nextButtonImg = await this.loadImage("/images/nextpagebutton.png");
      }

      // 檢查圖片是否成功載入
      if (!this.prevButtonImg || !this.nextButtonImg) {
        console.warn("分頁按鈕圖片載入失敗");
        return;
      }

      // 繪製上一頁按鈕
      if (this.currentPage > 0) {
        ctx.drawImage(
          this.prevButtonImg,
          this.paginationButtons.prev.x,
          this.paginationButtons.prev.y,
          this.paginationButtons.prev.width,
          this.paginationButtons.prev.height
        );
      } else {
        // 如果是第一頁，繪製半透明的按鈕
        ctx.globalAlpha = 0.5;
        ctx.drawImage(
          this.prevButtonImg,
          this.paginationButtons.prev.x,
          this.paginationButtons.prev.y,
          this.paginationButtons.prev.width,
          this.paginationButtons.prev.height
        );
        ctx.globalAlpha = 1.0;
      }

      // 繪製下一頁按鈕
      if (this.currentPage < this.totalPages - 1) {
        ctx.drawImage(
          this.nextButtonImg,
          this.paginationButtons.next.x,
          this.paginationButtons.next.y,
          this.paginationButtons.next.width,
          this.paginationButtons.next.height
        );
      } else {
        // 如果是最後一頁，繪製半透明的按鈕
        ctx.globalAlpha = 0.5;
        ctx.drawImage(
          this.nextButtonImg,
          this.paginationButtons.next.x,
          this.paginationButtons.next.y,
          this.paginationButtons.next.width,
          this.paginationButtons.next.height
        );
        ctx.globalAlpha = 1.0;
      }

      // 繪製頁碼文字
      ctx.fillStyle = "#000000";
      ctx.font = "bold 20px 微軟正黑體";
      ctx.textAlign = "center";

      const pageText = `${this.currentPage + 1}/${this.totalPages}`;
      ctx.fillText(
        pageText,
        this.paginationButtons.prev.x + 75,
        this.paginationButtons.prev.y + 23
      );
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
        const slot = this.itemSlots[index];

        if (!slot) {
          console.warn("無法找到對應的物品格子位置");
          return;
        }

        offsetX = clickX - slot.x;
        offsetY = clickY - slot.y;
        const actualIndex = this.currentPage * this.itemsPerPage + index;
        const actualItem = this.inventoryItems[actualIndex];
        this.dragState = {
          isDragging: true,
          draggedItem: actualItem, // 使用實際的物品
          sourceIndex: actualIndex, // 儲存實際的索引
          sourceType: type,
          dragImage: actualItem,
          offsetX,
          offsetY,
        };
      } else {
        const slot = this.equipmentSlotsPosition[index];
        if (!slot) {
          console.warn("無法找到對應的裝備格子位置");
          return;
        }
        offsetX = clickX - slot.x;
        offsetY = clickY - slot.y;

        this.dragState = {
          isDragging: true,
          draggedItem: item,
          sourceIndex: index,
          sourceType: type,
          dragImage: item,
          offsetX,
          offsetY,
        };
      }
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

        // 取得物品實際類型
        const itemType = draggedItemInfo.type;
        const mappedItemType = this.typeMapping[itemType] || itemType;

        // 檢查是否點擊在任何裝備欄位置
        const clickedSlotIndex = this.equipmentSlotsPosition.findIndex(
          (slot) =>
            x >= slot.x &&
            x <= slot.x + this.slotConfig.size &&
            y >= slot.y &&
            y <= slot.y + this.slotConfig.size
        );

        // 只要拖曳到任何裝備欄，就進行裝備
        if (clickedSlotIndex !== -1) {
          await this.handleEquip(draggedItem, sourceIndex);
          console.log(`物品類型: ${itemType} 已裝備到位置: ${mappedItemType}`);
        }
      } else if (sourceType === "equipment") {
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

      if (this.isClickInButton(x, y, this.paginationButtons.prev)) {
        this.changePage("prev");
        return;
      }
      if (this.isClickInButton(x, y, this.paginationButtons.next)) {
        this.changePage("next");
        return;
      }
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
    isClickInButton(x, y, button) {
      return (
        x >= button.x &&
        x <= button.x + button.width &&
        y >= button.y &&
        y <= button.y + button.height
      );
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
        console.log("準備關閉背包");
        try {
          const saveResult = await this.saveInventoryState();
          const syncResult = await this.syncEquipmentToPinia();
          console.log("背包狀態保存結果:", saveResult);
          console.log("角色狀態同步結果:", syncResult);
          this.inventoryOpen = false;
          if (router.currentRoute.value.name === "out-dress") {
            router.push("/outdoor");
          }
        } catch (error) {
          console.error("Failed to save inventory state:", error);
        }
      } else {
        console.log("準備開啟背包");
        try {
          if (this.account) {
            // 只有當物品清單為空時才重新初始化
            await this.initializeInventory(this.account);
          }
          this.inventoryOpen = true;
          router.push("/outdoor/dress");
          await this.syncEquipmentToPinia();
        } catch (error) {
          console.error("Failed to refresh inventory data:", error);
        }
      }
    },
  },
});
