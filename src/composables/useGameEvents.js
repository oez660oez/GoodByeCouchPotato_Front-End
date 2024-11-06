// useGameEvents.js
// 處理所有用戶輸入和事件
import { ref } from "vue";
import { useRouter } from 'vue-router';

export function useGameEvents(gameCanvasRef, gameStore) {
  const router = useRouter();
  const keys = ref({
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
  });

  const lastKey = ref("");
  const isInitialized = ref(false);
  let animationFrameId = null;

  // Movement handling
  function handlePlayerMovement() {
    if (!gameCanvasRef.value) return;

    const player = gameCanvasRef.value.getPlayer();
    if (!player) return;

    player.moving = false;

    if (keys.value.w.pressed && lastKey.value === "w") {
      gameCanvasRef.value.handleMove("up");
      console.log("w");
    } else if (keys.value.a.pressed && lastKey.value === "a") {
      gameCanvasRef.value.handleMove("left");
      console.log("a");
    } else if (keys.value.s.pressed && lastKey.value === "s") {
      gameCanvasRef.value.handleMove("down");
      console.log("s");
    } else if (keys.value.d.pressed && lastKey.value === "d") {
      gameCanvasRef.value.handleMove("right");
      console.log("d");
    }
  }

  // Game loop handling
  function startGameLoop() {
    const canvas = gameCanvasRef.value?.getCanvas();
    const context = canvas?.getContext("2d");

    function loop() {
      if (!canvas || !context) return;

      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Execute game loop
      gameCanvasRef.value?.executeGameLoop();

      // Handle player movement
      handlePlayerMovement();

      // Render inventory if open
      if (gameStore.inventoryOpen) {
        const player = gameCanvasRef.value?.getPlayer();
        if (player) {
          gameStore.renderInventory(context, player);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    }

    loop();
  }

  // Event handlers
  const eventHandlers = {
    keydown: (e) => {
      const key = e.key.toLowerCase();
      if (keys.value[key] !== undefined) {
        keys.value[key].pressed = true;
        lastKey.value = key;
      }
    },

    keyup: (e) => {
      const key = e.key.toLowerCase();
      if (keys.value[key] !== undefined) {
        keys.value[key].pressed = false;
      }
    },

    mousedown: (e) => {
      if (!gameStore.inventoryOpen) return;
      handleInventoryMouseDown(e);
    },

    mousemove: (e) => {
      if (!gameStore.inventoryOpen || !gameStore.dragState.isDragging) return;
      handleInventoryMouseMove(e);
    },

    mouseup: (e) => {
      if (!gameStore.inventoryOpen) return;
      handleInventoryMouseUp(e);
    },

    click: (e) => {
      if (!gameStore.inventoryOpen) return;
      handleInventoryClick(e);
    },
  };

  const handleInventoryMouseDown = (e) => {
    const canvas = gameCanvasRef.value?.getCanvas();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check inventory slots
    gameStore.itemSlots.forEach((slot, index) => {
      if (isWithinSlot(x, y, slot) && gameStore.inventoryItems[index]) {
        gameStore.startDrag(
          createMouseEvent(e, canvas),
          gameStore.inventoryItems[index],
          index,
          "inventory"
        );
      }
    });

    // Check equipment slots
    gameStore.equipmentSlotsPosition.forEach((slot, index) => {
      if (isWithinSlot(x, y, slot) && gameStore.equipmentSlots[index]) {
        gameStore.startDrag(
          createMouseEvent(e, canvas),
          gameStore.equipmentSlots[index],
          index,
          "equipment"
        );
      }
    });
  };

  const handleInventoryMouseMove = (e) => {
    const canvas = gameCanvasRef.value?.getCanvas();
    if (canvas) {
      gameStore.updateDrag(createMouseEvent(e, canvas));
    }
  };

  const handleInventoryMouseUp = (e) => {
    const canvas = gameCanvasRef.value?.getCanvas();
    if (canvas) {
      gameStore.endDrag(createMouseEvent(e, canvas));
    }
  };

  const handleInventoryClick = (e) => {
    const canvas = gameCanvasRef.value?.getCanvas();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gameStore.handleInventoryClick(x, y);
  };

  // Helper functions
  const isWithinSlot = (x, y, slot) => {
    return (
      x >= slot.x &&
      x <= slot.x + gameStore.slotConfig.size &&
      y >= slot.y &&
      y <= slot.y + gameStore.slotConfig.size
    );
  };

  const createMouseEvent = (e, canvas) => ({
    clientX: e.clientX,
    clientY: e.clientY,
    target: canvas,
  });

  // Setup and cleanup
  const setupEventListeners = () => {
    const canvas = gameCanvasRef.value?.getCanvas();
    if (!canvas) return;

    // Add event listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      if (event === "keydown" || event === "keyup") {
        window.addEventListener(event, handler);
      } else {
        canvas.addEventListener(event, handler);
      }
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    // Start game loop
    startGameLoop();
  };

  const cleanupEventListeners = () => {
    const canvas = gameCanvasRef.value?.getCanvas();

    // Remove event listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      if (event === "keydown" || event === "keyup") {
        window.removeEventListener(event, handler);
      } else if (canvas) {
        canvas.removeEventListener(event, handler);
      }
    });

    // Cancel animation frame
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };

  return {
    keys,
    lastKey,
    isInitialized,
    setupEventListeners,
    cleanupEventListeners,
  };
}