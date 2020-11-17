# 1. 多人連線遊戲 (已完成)

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


## 遊戲內容
> 多人網頁遊戲，有遊戲大廳(最多三人)，每個人有個代表顏色，每個遊戲廳有幾個button，點擊button可以改變顏色，並會同步到多人的畫面內

## 如何執行
1. npm install
2. http://localhost:8081/
3. 按下 F12
4. 按下 New Game，把 game id 給複製下來(f12頁面裡)
5. 開啟其他視窗，並join game id
6. 開始遊戲

## 框架
* index.js
    * server 端
    * 有著websocket傳送封包與client溝通
    * 儲存 client 連線 以及 給予 clientid 來區別每個使用者
    * 儲存 client 的 gameid
    * game 狀態 都要記得，因為要更新到每個使用者
    * game 紀錄 每個使用者

* index.html
    * client 端
    * 有著WebSocket與server溝通
    * 產生畫面

* 封包
    * connect
        * 溝通過程
            * client 建立連接
            * server 接到請求，建立clientId，儲存連接(clients[clientId] = connection)，並把封包傳給client
            * client 接收到 connect 封包，紀錄自己的clientId
        * server
            * 封包 給 client
            ```javascript=
            const payload = {
                "method": "connect",
                "clientId": clientId,
            }
            ```
        * client
    * create
        * 溝通過程
            * client 按下 創造新遊戲時，送封包給server
            * server 收到封包後，創建gameId，並建立game資訊，回傳game資訊回去
            * client 接收封包後，把gameId記錄起來
        * server
            * game 資訊
            ```javascript=
            let games = [];
            games[gameId] = {
                "id": gameId,
                "balls" : 20, // 要有幾個按鈕
                "clients" : [], // 紀錄每個玩家
                "states" : {}, // 紀錄按鈕狀態
            }
            ```
            * 封包內容
            ```javascript=
            const payload = {
                "method": "create",
                "game" : games[gameId],
            }
            ```
        * client
            * 封包內容
            ```javascript=
            const payload = {
                "method": "create",
                "clientId" : clientId,
            }
            ```
    * join
        * 溝通過程
            * client 按下加入遊戲，傳送gameId與clientId給server
            * server 利用gameId取出那個game，加入clientId後，將新的game狀態傳送給所有clients
            * client 接收封包之後，利用clients去建立畫面
        * server
            * 封包內容
            ```javascript=
            const payload = {
                "method": "join",
                "game" : game,
            }
            ```
        * client
            * 封包內容
            ```javascript=
            const payload = {
                "method": "join",
                "clientId": clientId,
                "gameId": gameId,
            };
            ```
    * update
        * 溝通過程
            * server 每 500ms 去跌代所有games，並把所有game資訊更新到所有使用者
            * client 接收到封包之後，更新畫面
        * server
            * 封包內容
            ```javascript=
            for (const g of Object.keys(games)) { // 跑所有game
                const payload = {                 // 建立update封包，附上新的game資訊
                    "method": "update",
                    "game": games[g],
                }

                games[g].clients.forEach(c => {  // 傳送給game的每個使用者
                    clients[c.clientId].connection.send(JSON.stringify(payload));
                })
            }
            ```
        * client


## 我學到了什麼？
1. 封包的傳遞
> 利用封包的傳遞去讓server與client間溝通，並給定必要資訊

2. 後端要做甚麼
> 處理 每個client資訊，每個game資訊，並要去更新給所有client

3. clientId
> 利用clientId把每一個連接給區隔開來

## 感想 or 遇到的困難
> 這是我第一次去整理後端的架構，看似簡單，但框架對了，才能達到想要的效果
> 因此在寫程式之前，我會先去想server client要儲存甚麼資料，每個封包的建立過程是甚麼，寫著寫著才不會亂掉

## Reference
### [websocket 套件]( https://github.com/websockets/ws/blob/HEAD/doc/ws.md)
### [不重複的guid](https://stackoverflow.com/posts/44996682/revisions)
