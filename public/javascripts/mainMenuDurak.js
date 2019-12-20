var clientName = undefined;
var connectedClientNames = undefined;

$(function () {
    connectWebSocket();
});

function updateComponents() {
    $.ajax({
        method: "GET",
        url: "/clientName",
        dataType: "html",

        success: function (data) {
            clientName = data;
        }
    }).then(function () {
        return $.ajax({
            method: "GET",
            url: "/addPlayer/" + clientName,
            dataType: "html",
        })
    }).then(function () {
        return $.ajax({
            method: "GET",
            url: "/players",
            dataType: "html",

            success: function (data) {
                connectedClientNames = data;
            }
        })
    }).done(function () {
        let connectedPlayersParagraph = document.getElementById("connectedPlayersParagraph");
        connectedPlayersParagraph.innerHTML = "";
        console.log("HIER 2: ", connectedClientNames);
        let connectedClientNamesArr = connectedClientNames.split(",");

        for (let i = 0; i < connectedClientNamesArr.length; i++) {
            let node = document.createElement("LI");
            let textnode = document.createTextNode(connectedClientNamesArr[i]);
            node.appendChild(textnode);
            connectedPlayersParagraph.appendChild(node);
        }
    });
}

function connectWebSocket() {
    let websocket = new WebSocket("ws://localhost:9000/mainMenuDurakWebsocket");
    websocket.setTimeout;

    websocket.onopen = function (event) {
        console.log("Connected to Websocket");
        websocket.send("Connected");
    };

    websocket.onclose = function () {
        websocket.send("Closed");
        console.log('Connection with Websocket Closed!');
        connectWebSocket()
    };

    websocket.onerror = function (error) {
        console.log('Error in Websocket Occured: ' + error);
    };

    websocket.onmessage = function (event) {
        if (event.data === "Update components"){
            console.log("Updating components ...");
            updateComponents()
        } else if (event.data == "New game") {
            console.log("Redirect to game view ...")
            window.location.replace("http://localhost:9000/durak")
        }
    };
}
