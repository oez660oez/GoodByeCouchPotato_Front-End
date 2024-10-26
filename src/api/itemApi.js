//itemApi.js

const BASE_URL = import.meta.env.VITE_API_BASEURL;
const API_URL = `${BASE_URL}/Item`;

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    let errorData;
    try {
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        errorData = await response.text();
      }
    } catch (e) {
      errorData = '無法解析錯誤回應';
    }

    // 詳細的錯誤日誌
    console.error('API 錯誤:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorData
    });

    throw new Error(JSON.stringify({
      status: response.status,
      message: errorData,
      endpoint: response.url
    }));
  }

  try {
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log('API 成功回應:', {
        url: response.url,
        data: data
      });
      return data;
    }
    return await response.text();
  } catch (e) {
    console.error('回應解析失敗:', e);
    throw new Error('伺服器回應格式無效');
  }
};

export const itemApi = {
  async getCharacterEquipment(account) {
    try {
      const response = await fetch(`${API_URL}/characterEquipment/${account}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        rejectUnauthorized: false
      });

      return await handleResponse(response);
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
        headers: {
          'Content-Type': 'application/json'
        },
        rejectUnauthorized: false
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("獲取用戶物品失敗:", error);
      return [];
    }
  },

  async getItemByShopImage(shopImage) {
    try {
      const response = await fetch(`${API_URL}/byShopImage?shopImage=${encodeURIComponent(shopImage)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        rejectUnauthorized: false
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("獲取商店物品資訊失敗:", error);
      return null;
    }
  },

  async updateEquipment(equipmentData) {
    try {
      if (!equipmentData || typeof equipmentData !== 'object') {
        throw new Error('裝備資料格式無效');
      }

      if (!equipmentData.account) {
        throw new Error('缺少帳號資料');
      }

      // 驗證每個裝備項目
      ['accessory', 'hairstyle', 'outfit'].forEach(slot => {
        if (!equipmentData[slot] || typeof equipmentData[slot] !== 'object') {
          throw new Error(`無效的${slot}資料格式`);
        }
      });

      const formattedData = {
        account: equipmentData.account,
        accessory: {
          imageName: equipmentData.accessory?.imageName ?? "null",
          type: "飾品"
        },
        hairstyle: {
          imageName: equipmentData.hairstyle?.imageName ?? "null",
          type: "髮型"
        },
        outfit: {
          imageName: equipmentData.outfit?.imageName ?? "null",
          type: "衣服"
        }
      };

      console.log('準備更新裝備:', JSON.stringify(formattedData, null, 2));

      const response = await fetch(`${API_URL}/updateEquipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData),
        rejectUnauthorized: false
      });

      const result = await handleResponse(response);
      console.log('裝備更新成功:', result);
      return result;
    } catch (error) {
      console.error("更新裝備失敗:", {
        error: error.message,
        originalData: equipmentData
      });
      throw error;
    }
  },

  async updateInventory(inventoryData) {
    try {
      if (!inventoryData || typeof inventoryData !== 'object') {
        throw new Error('物品欄資料格式無效');
      }

      if (!inventoryData.account) {
        throw new Error('缺少帳號資料');
      }

      if (!Array.isArray(inventoryData.items)) {
        throw new Error('物品清單格式無效');
      }

      const formattedData = {
        account: inventoryData.account,
        items: inventoryData.items
          .filter(item => item && typeof item === 'object')
          .map(item => ({
            imageName: item.imageName ?? "null"
          }))
      };

      console.log('準備更新物品欄:', JSON.stringify(formattedData, null, 2));

      const response = await fetch(`${API_URL}/updateInventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData),
        rejectUnauthorized: false
      });

      const result = await handleResponse(response);
      console.log('物品欄更新成功:', result);
      return result;
    } catch (error) {
      console.error("更新物品欄失敗:", {
        error: error.message,
        originalData: inventoryData
      });
      throw error;
    }
  }
};