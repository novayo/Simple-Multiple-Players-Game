// 建立client 執行 index.html
const app = require("express")();
app.listen(8081, () => console.log("Client Listening on 8081"));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

// 建立http協議
const http = require("http");
const httpServer = http.createServer();
httpServer.listen(8080, () => console.log("Server Listening on 8080"));

// 建立socket server去做管理
const clients = {};
const games = {};
const websocketServer = require("websocket").server;
const wsServer = new websocketServer({
    "httpServer": httpServer,
});

// request is the http GET request sent by the client.
wsServer.on("request", request => {
    // client與server之間的建立連接
    // 可以設定要接受什麼條件的連接（這裡是無條件）
    const connection = request.accept(null, request.origin);

    // 建立連接時，為什麼沒用？
    connection.on("open", () => console.log("Connect !"));

    // 斷開連接時
    connection.on("close", () => console.log("Close !"));

    // 當client傳封包到server時
    connection.on("message", message => {
        const result = JSON.parse(message.utf8Data);

        // create Router
        // 由於所有的連接都會到這個server，所以要用clientId去做區隔，並把此id的connection給存起來
        if (result.method === "create") {
            const clientId = result.clientId;
            const gameId = guid();
            games[gameId] = {
                "id": gameId,
                "balls": 20,
                "clients": [],
            }

            const payload = {
                "method": "create",
                "game": games[gameId],
            }

            const client_connection = clients[clientId].connection;
            client_connection.send(JSON.stringify(payload));
        }

        // join Router
        if (result.method === "join") {
            const clientId = result.clientId;
            const gameId = result.gameId;
            const game = games[gameId];

            if (game.clients.length >= 3) {
                // sorry max players reach
                return;
            }

            // 依照長度給顏色，現在只有一個，就給綠色
            const color = { "0": "Red", "1": "Green", "2": "Blue" }[game.clients.length];
            game.clients.push({
                "clientId": clientId,
                "color": color,
            })

            if (game.clients.length === 3) updateGameState();

            const payload = {
                "method": "join",
                "game": game,
            }

            game.clients.forEach(c => {
                clients[c.clientId].connection.send(JSON.stringify(payload));
            });
        }

        // play Router
        if (result.method === "play") {
            const clientId = result.clientId;
            const gameId = result.gameId;
            const ballId = result.ballId;
            const color = result.color;

            let state = games[gameId].state;
            if (!state) {
                state = {}
            }

            state[ballId] = color;
            games[gameId].state = state;
        }
    });

    // connection Router
    const clientId = guid();
    clients[clientId] = {
        "connection": connection,
    };

    const payload = {
        "method": "connect",
        "clientId": clientId,
    };

    connection.send(JSON.stringify(payload));
});


function updateGameState() {

    for (const g of Object.keys(games)) {
        const payload = {
            "method": "update",
            "game": games[g],
        }

        games[g].clients.forEach(c => {
            clients[c.clientId].connection.send(JSON.stringify(payload));
        })
    }

    setTimeout(updateGameState, 500);
}

// 建立 client uid
const guid = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
}