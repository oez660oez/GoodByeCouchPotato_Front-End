# ![image](https://github.com/user-attachments/assets/17d1a284-ddd0-4efd-aef4-10ec26a4ad5f)再見! 沙發Potato!

再見! 沙發Potato!是一個團隊專案，也是一個將健康管理遊戲化的網頁應用平台，透過遊戲化元素提升使用者參與度和持續性。前台使用Vue.js + WebAPI，並且主要使用Canvas完成動畫繪製。

歡迎使用測試帳號登入使用，帳密如下：
```
帳號：leo555555
密碼：@aA1234567890
```

## 負責的功能

### 1. 角色創建系統
- 完整的角色創建流程
- 即時表單驗證
- 安全的資料處理機制
- 個人化角色設定

### 2. 健康數據追蹤
- 每月體重記錄
- 自動飲水量計算
- 過往體重自動填入

### 3. 角色裝扮系統
- 扮裝裝備管理
- 即時預覽外觀變化
- 智慧分類系統
- 拖放式操作介面

### 4. 視覺設計
- 自定義SweetAlert2像素樣式
- 表單樣式設計
- 原創Logo設計
- 素材蒐集與繪製

## 影片展示Demo

[![影片標題](https://github.com/user-attachments/assets/83f77191-7796-4a84-8dec-d4c0960d6ad3)](https://youtu.be/6vSm1pfr2bA)

## 環境要求
- 建議Windows 10 或以上版本
- SQL Server (建議 2019 或以上版本，Express 版本即可)

## 安裝步驟
### 需與 [後台](https://github.com/oez660oez/GoodByeCouchPotato_Back-End) 一同運行
1. 執行 SQL Server Management Studio時確保伺服器名稱為(localhost或是.或裝置名稱)連線
2. 執行 SQL 資料夾中的「241114 遊戲資料」指令碼
3. 複製專案
```
git clone https://github.com/oez660oez/GoodByeCouchPotato_Front-End.git
```
4. 安裝Package
```
npm install
```
5. 執行專案
```
npm run dev
```
## 使用說明
### 角色創建
1. 進入註冊頁面
2. 填寫基本資料
3. 確認創建
### 體重記錄
1. 點擊按鈕進入每月體重表單
2. 輸入當日體重
3. 確認更新
### 裝扮系統
1. 點擊裝扮按鈕
2. 拖曳裝備到角色
3. 預覽效果
4. 確認更換

## Screen Photo

![走路功能演示](https://github.com/oez660oez/GoodByeCouchPotato_Front-End/blob/main/ScreenShot/FunctionReview.gif)
![裝扮系統背包](https://github.com/oez660oez/GoodByeCouchPotato_Front-End/blob/main/ScreenShot/Backpack.png)
![角色創建表單](https://github.com/oez660oez/GoodByeCouchPotato_Front-End/blob/main/ScreenShot/CreateCharacter.png)
![每月體重表單](https://github.com/oez660oez/GoodByeCouchPotato_Front-End/blob/main/ScreenShot/WeightTask.png)
![每月每日任務樣式設計](https://github.com/oez660oez/GoodByeCouchPotato_Front-End/blob/main/ScreenShot/MissionTask.png)
![SweetAlert2自定義](https://github.com/oez660oez/GoodByeCouchPotato_Front-End/blob/main/ScreenShot/SweetAlert.png)

## 使用工具
- Vue.js 3 + Pinia
- Bootstrap
- SweetAlert2
- Visual Studio Code
- [SQL Server 2022](https://www.microsoft.com/zh-tw/sql-server/sql-server-downloads)
