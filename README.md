# 1. 多人連線遊戲 (未完成)

[![hackmd-github-sync-badge](https://hackmd.io/PbIOMVKiSKu831DGNtPd_g/badge)](https://hackmd.io/PbIOMVKiSKu831DGNtPd_g)

###### tags: `Side Projects`

## 遊戲架構
1. 開發語言：Nodejs
2. Agenda
    * 連接到server
    * 開啟新遊戲（不同的game id）
    * 加入新遊戲（加入game id）
    * 設計遊戲
    * broadcast（更新所有使用者的狀態）

## 前端
### 連接到server
1. 創建client，用express，並寫一個簡單的html當作client
    ```htmlembedded=
    <script>
        // 創建對8080的 socket
        let wsServer = new WebSocket("ws://localhost:8080");

        // 接收server的封包
        wsServer.onmessage = message => {
            const result = JSON.parse(message.data);
        }
    </script>
    ```
### 開啟新遊戲（不同的game id）
1. 創建按鈕，按下後傳送create封包給server(含clientId)
2. 監聽server傳的 create 封包(含game資訊)，並將資訊存起來

## 後端
### 連接到server
1. 建立http，建立httpServer
2. 建立websocketServer去管理httpServer
3. 當建立連接時，給予client一個id，傳送connect封包給client
    ```javascript=
    const payload = {
        "method": "connect",
        "clientId": clientId,
    };
    ```

### 開啟新遊戲（不同的game id）
1. 監聽client傳的 create 封包，並去建立一個game去存gameId與球個數
2. 由於所有的連接都會到這個server，所以要用clientId去做區隔，並把此clientId的connection給存起來，之後找到對應的clientId.connection並傳回此create封包

## 我學到了什麼？

## 遇到的困難

## Reference
### [學習影片](https://www.youtube.com/watch?v=cXxEiWudIUY&t=59m12s)
### [websocket 套件]( https://github.com/websockets/ws/blob/HEAD/doc/ws.md)
### [不重複的guid](https://stackoverflow.com/posts/44996682/revisions)
