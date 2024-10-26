//useInventory.js
import { ref, onMounted, watch } from 'vue';
import { EquippedSprite } from '@/core/EquippedSprite';
import { itemApi } from '@/api/itemApi';

export function useInventory(canvasRef, playerAccount) {
  // State refs
  const inventoryItems = ref(new Array(15).fill(null));
  const itemsData = ref(new Map());
  const equipmentSlots = ref([null, null, null]);
  const inventoryOpen = ref(false);
  const inventoryBackground = ref(null);
  const context = ref(null);

  const equippedItems = ref({
    accessory: null,
    hairstyle: null,
    outfit: null,
  });

  // Constants
  const typeMapping = {
    accessory: "飾品",
    hairstyle: "髮型",
    outfit: "衣服",
    "飾品": "accessory",
    "髮型": "hairstyle",
    "衣服": "outfit"
  };

  const getSlotIndexByType = (type) => {
    const typeToIndex = {
      accessory: 0,
      hairstyle: 1,
      outfit: 2,
      "飾品": 0,
      "髮型": 1,
      "衣服": 2
    };
    return typeToIndex[type];
  };

  const slotConfig = {
    size: 105,
    cols: 5,
    rows: 3,
    padding: 15.5,
  };

  // Computed positions
  const inventoryPosition = ref({
    x: 0,
    y: 0,
  });

  const previewBox = ref({
    x: 0,
    y: 0,
    width: 185,
    height: 300,
  });

  // Initialize canvas and positions
  const initializeCanvas = () => {
    if (!canvasRef.value) return;

    const canvas = canvasRef.value;
    context.value = canvas.getContext('2d');

    // Update positions based on canvas size
    inventoryPosition.value = {
      x: canvas.width / 3 - 200,
      y: canvas.height / 3 - 200,
    };

    previewBox.value = {
      x: inventoryPosition.value.x + 50,
      y: inventoryPosition.value.y + 200,
      width: 185,
      height: 300,
    };
  };

  // Initialize slot positions
  const itemSlots = ref([]);
  const equipmentSlotsPosition = ref([]);

  const initializeSlots = () => {
    // Initialize inventory slots
    itemSlots.value = [];
    for (let row = 0; row < slotConfig.rows; row++) {
      for (let col = 0; col < slotConfig.cols; col++) {
        itemSlots.value.push({
          x: inventoryPosition.value.x + 437 + col * (slotConfig.size + slotConfig.padding),
          y: inventoryPosition.value.y + 163 + row * (slotConfig.size + slotConfig.padding)
        });
      }
    }

    // Initialize equipment slots
    equipmentSlotsPosition.value = Array(3).fill(null).map((_, i) => ({
      x: inventoryPosition.value.x + 250,
      y: inventoryPosition.value.y + 193 + i * (slotConfig.size + slotConfig.padding)
    }));
  };

  // Image loading utility
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Load inventory items
  const loadInventoryItems = async () => {
    try {
      // Load background
      inventoryBackground.value = await loadImage('/images/BackPack_Test.png');

      // Load character equipment
      const equipment = await itemApi.getCharacterEquipment(playerAccount);
      const userItems = await itemApi.getUserItems(playerAccount);

      // Reset inventory
      inventoryItems.value = new Array(15).fill(null);

      // Process equipment
      for (const [slot, item] of Object.entries(equipment)) {
        if (item) {
          await handleEquip(item.imageName, -1, slot);
        }
      }

      // Process inventory items
      for (const item of userItems) {
        const emptySlot = inventoryItems.value.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
            const itemData = await itemApi.getItemByShopImage(item.imageName);
            console.log('Loaded item data:', itemData);
            console.log('Mapped type:', typeMapping[itemData.pClass]);
          const shopImage = await loadImage(`/images/${item.imageName}`);

          itemsData.value.set(shopImage, {
            type: typeMapping[itemData.pClass] || itemData.pClass,
            imageName: item.imageName,
            fullImagePath: itemData.pImageAll
          });

          inventoryItems.value[emptySlot] = shopImage;
        }
      }
    } catch (error) {
      console.error('Error loading inventory items:', error);
    }
  };

// 修改 handleEquip 函數
const handleEquip = async (itemImage, fromSlot, toSlot) => {
  try {
    const itemInfo = itemsData.value.get(itemImage);
    if (!itemInfo) {
      console.error('Item info not found for:', itemImage);
      return;
    }

    // 確保所有需要的數據都存在
    if (!itemInfo.fullImagePath) {
      console.error('Full image path not found for:', itemInfo);
      return;
    }

    // 加載完整的裝備圖片
    const fullImage = await loadImage(`/images/${itemInfo.fullImagePath}`);

    // 創建精靈前確保圖片已完全加載
    await new Promise((resolve) => {
      if (fullImage.complete) {
        resolve();
      } else {
        fullImage.onload = resolve;
      }
    });

    const sprite = new EquippedSprite({
      image: fullImage,
      frames: { max: 6 }
    });

    // 等待精靈初始化完成
    await new Promise(resolve => {
      const checkLoaded = () => {
        if (sprite.loaded) {
          resolve();
        } else {
          setTimeout(checkLoaded, 50);
        }
      };
      checkLoaded();
    });

    // 計算正確的槽位索引
    const slotIndex = typeof toSlot === 'number'
      ? toSlot
      : getSlotIndexByType(itemInfo.type);

    if (slotIndex === undefined) {
      console.error('Invalid slot index for type:', itemInfo.type);
      return;
    }

    // 處理已裝備的物品
    if (equipmentSlots.value[slotIndex]) {
      const emptySlot = inventoryItems.value.findIndex(slot => slot === null);
      if (emptySlot !== -1) {
        inventoryItems.value[emptySlot] = equipmentSlots.value[slotIndex];
      } else {
        console.warn('No empty inventory slot available');
        return;
      }
    }

    // 更新裝備槽位
    equipmentSlots.value[slotIndex] = itemImage;
    if (fromSlot >= 0) {
      inventoryItems.value[fromSlot] = null;
    }

    // 更新已裝備物品
    const types = ["accessory", "hairstyle", "outfit"];
    equippedItems.value[types[slotIndex]] = sprite;

    // 確保精靈準備就緒
    sprite.initialize();

  } catch (error) {
    console.error('Error in handleEquip:', error);
    throw error;
  }
};

  // Render inventory
  const render = (player) => {
    if (!inventoryOpen.value || !context.value) return;

    const ctx = context.value;

    // Draw background
    if (inventoryBackground.value) {
      ctx.drawImage(
        inventoryBackground.value,
        inventoryPosition.value.x,
        inventoryPosition.value.y
      );
    }

    // Draw inventory slots
    itemSlots.value.forEach((slot, index) => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(slot.x, slot.y, slotConfig.size, slotConfig.size);

      if (inventoryItems.value[index]) {
        ctx.drawImage(
          inventoryItems.value[index],
          slot.x,
          slot.y,
          slotConfig.size,
          slotConfig.size
        );
      }
    });

    // Draw equipment slots
    equipmentSlotsPosition.value.forEach((slot, i) => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(slot.x, slot.y, slotConfig.size, slotConfig.size);

      if (equipmentSlots.value[i]) {
        ctx.drawImage(
          equipmentSlots.value[i],
          slot.x,
          slot.y,
          slotConfig.size,
          slotConfig.size
        );
      }
    });

    // Draw preview box
    drawPreviewBox(player);
  };

  // Draw preview box and character
  const drawPreviewBox = (player) => {
    if (!context.value || !player) return;

    const ctx = context.value;

    // Draw box
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.strokeRect(
      previewBox.value.x,
      previewBox.value.y,
      previewBox.value.width,
      previewBox.value.height
    );

    // Draw character
    if (player.image) {
      const scaleFactor = 0.8;
      const start = (player.image.width / 4) * player.direction;

      ctx.drawImage(
        player.image,
        start + player.frames.val * player.width,
        0,
        player.width,
        player.height,
        previewBox.value.x + 10,
        previewBox.value.y + 35,
        previewBox.value.width * scaleFactor,
        previewBox.value.height * scaleFactor
      );

      // Draw equipped items
      drawEquippedItems(player, scaleFactor);
    }
  };

  // Draw equipped items
  const drawEquippedItems = (player, scaleFactor) => {
    if (!context.value || !player) {
      console.warn('Missing context or player in drawEquippedItems');
      return;
    }
    const equipmentOrder = ["outfit", "hairstyle", "accessory"];

    for (const type of equipmentOrder) {
      const sprite = equippedItems.value[type];
      if (!sprite) continue;

      if (!sprite.loaded) {
        console.warn(`Sprite for ${type} not fully loaded`);
        continue;
      }

      try {
        const start = (sprite.image.width / 4) * player.direction;
        sprite.draw(
          context.value,
          previewBox.value.x + 10,
          previewBox.value.y + 35,
          previewBox.value.width * scaleFactor,
          previewBox.value.height * scaleFactor,
          player
        );
      } catch (error) {
        console.error(`Error drawing ${type}:`, error);
      }
    }
  };

  // Toggle inventory
  const toggleInventory = async () => {
    console.log('切換背包狀態:', this.inventoryOpen);
    if (inventoryOpen.value) {
      await saveInventoryState();
    }
    inventoryOpen.value = !inventoryOpen.value;
  };

  // Save inventory state
  const saveInventoryState = async () => {
    try {
      const equipmentData = {
        account: playerAccount,
        accessory: null,
        hairstyle: null,
        outfit: null
      };

      const types = ["accessory", "hairstyle", "outfit"];
      equipmentSlots.value.forEach((item, index) => {
        if (item) {
          const itemInfo = itemsData.value.get(item);
          equipmentData[types[index]] = {
            imageName: itemInfo?.imageName,
            type: typeMapping[types[index]]
          };
        }
      });

      const inventoryData = {
        account: playerAccount,
        items: inventoryItems.value
          .filter(Boolean)
          .map(item => ({
            imageName: itemsData.value.get(item)?.imageName
          }))
          .filter(item => item.imageName)
      };

      await Promise.all([
        itemApi.updateEquipment(equipmentData),
        itemApi.updateInventory(inventoryData)
      ]);
    } catch (error) {
      console.error('Error saving inventory state:', error);
    }
  };

  // Event handlers
  const handleItemInteraction = (mouseX, mouseY) => {
    if (!inventoryOpen.value) return;

    // Check inventory slots
    itemSlots.value.forEach((slot, index) => {
      if (
        mouseX >= slot.x &&
        mouseX <= slot.x + slotConfig.size &&
        mouseY >= slot.y &&
        mouseY <= slot.y + slotConfig.size &&
        inventoryItems.value[index]
      ) {
        handleEquip(inventoryItems.value[index], index);
      }
    });

    // Check equipment slots
    equipmentSlotsPosition.value.forEach((slot, i) => {
      if (
        mouseX >= slot.x &&
        mouseX <= slot.x + slotConfig.size &&
        mouseY >= slot.y &&
        mouseY <= slot.y + slotConfig.size &&
        equipmentSlots.value[i]
      ) {
        const removedItem = equipmentSlots.value[i];
        const emptySlot = inventoryItems.value.indexOf(null);
        if (emptySlot !== -1) {
          inventoryItems.value[emptySlot] = removedItem;
          equipmentSlots.value[i] = null;
          equippedItems.value[["accessory", "hairstyle", "outfit"][i]] = null;
        }
      }
    });
  };

  // Setup
  onMounted(() => {
    initializeCanvas();
    initializeSlots();
    loadInventoryItems();

    // Bind events
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'i') {
        toggleInventory();
      }
    };

    const handleDoubleClick = (e) => {
      const rect = canvasRef.value.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      handleItemInteraction(mouseX, mouseY);
    };

    window.addEventListener('keydown', handleKeyDown);
    canvasRef.value?.addEventListener('dblclick', handleDoubleClick);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvasRef.value?.removeEventListener('dblclick', handleDoubleClick);
    };
  });

  return {
    inventoryOpen,
    render,
    toggleInventory,
    handleItemInteraction,
    equippedItems: equippedItems.value
  };
}