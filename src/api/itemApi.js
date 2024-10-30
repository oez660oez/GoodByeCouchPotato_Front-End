//itemApi.js
const BASE_URL = import.meta.env.VITE_API_BASEURL;
const API_URL = `${BASE_URL}/Item`;

export const itemApi = {
  async getCharacterEquipment(account) {
    try {
      const response = await fetch(`${API_URL}/characterEquipment/${account}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      return await response.json();
    } catch (error) {
      console.error("獲取角色裝備失敗:", error);
      return {
        accessory: null,
        hairstyle: null,
        outfit: null,
      };
    }
  },

  async getUserItems(account) {
    try {
      const response = await fetch(`${API_URL}/userItems/${account}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      return await response.json();
    } catch (error) {
      console.error("獲取用戶物品失敗:", error);
      return [];
    }
  },

  async getItemByShopImage(shopImage) {
    try {
      const response = await fetch(`${API_URL}/byShopImage?shopImage=${shopImage}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      return await response.json();
    } catch (error) {
      console.error("獲取商店物品資訊失敗:", error);
      return null;
    }
  },

  async updateEquipment(equipmentData) {
    try {
      if (!equipmentData?.account) {
        throw new Error('缺少帳號資料');
      }

      const formattedData = {
        account: equipmentData.account,
        accessory: {
          imageName: equipmentData.accessory?.imageName || "",
          type: "飾品"
        },
        hairstyle: {
          imageName: equipmentData.hairstyle?.imageName || "",
          type: "髮型"
        },
        outfit: {
          imageName: equipmentData.outfit?.imageName || "",
          type: "衣服"
        }
      };
      
      const response = await fetch(`${API_URL}/updateEquipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${errorText}`);
      }

      const text = await response.text();
    if (!text) {
      return { success: true }; // 返回一個默認的成功響應
    }

    // 嘗試解析 JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn('Response is not JSON:', text);
      return { success: true };
    }
  } catch (error) {
    console.error("更新裝備失敗:", error);
    throw error;
  }
}
};