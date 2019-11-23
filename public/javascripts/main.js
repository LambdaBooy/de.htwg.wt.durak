var playerName = undefined;

$(function () {
    $.ajax({
        method: "GET",
        url: "/check",
        dataType: "html",

        success: function (data) {
            if (data === "COOKIEALREADYEXISTS") {
                document.getElementById("submitButton").disabled = true;
            }
        }
    });

    setTimeout(function () {
        update()
    }, 2500);
});


function handleAddButton() {
    playerName = document.getElementById("playerNameInputField").value;

    if (playerName !== "") {
        $.ajax({
            method: "GET",
            url: "/addPlayer/" + playerName,
            dataType: "html",

            success: function (data) {
                if (data === "PLAYERALREADYPRESENT") {
                    alert("This player name already exists! Please take another one...");
                    return;
                }
                document.getElementById("playerNameInputField").value = "";
                document.getElementById("submitButton").disabled = true;
                connectWebSocket();

                $.ajax({
                    method: "GET",
                    url: "/",
                    dataType: "html",
                });
            }
        });
    } else {
        alert("You have to enter a name!");
    }
}

function handleInputField() {
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("submitButton").click();
    }
}

function connectWebSocket() {
    let websocket = undefined;

    if (playerName !== undefined) {
        websocket = new WebSocket("ws://localhost:9000/websocket?playerName=" + playerName);
    } else {
        websocket = new WebSocket("ws://localhost:9000/websocket")
    }

    websocket.setTimeout;

    websocket.onopen = function (event) {
        console.log("Connected to Websocket");
        websocket.send("YO!");
    };

    websocket.onclose = function () {
        console.log('Connection with Websocket Closed!');
    };

    websocket.onerror = function (error) {
        console.log('Error in Websocket Occured: ' + error);
    };

    websocket.onmessage = function (e) {
        if (typeof e.data === "string") {
            console.log(e.data)
        }
    }
}

function update() {
    $.when($.ajax({
            method: "GET",
            url: "/players",
            dataType: "html",

            success: function (data) {
                let playerNamesArr = data.split(" ");
                let playerNamesString = "";

                for (i = 0; i < playerNamesArr.length; i++) {
                    if (i < playerNamesArr.length - 1) {
                        playerNamesString = playerNamesString + playerNamesArr[i] + ","
                    } else {
                        playerNamesString = playerNamesString + playerNamesArr[i]
                    }
                }

                document.getElementById("connectedPlayersParagraph").innerText = playerNamesString
            }
        }),
        $.ajax({
            method: "GET",
            url: "/gameStatus",
            dataType: "html",

            success: function (data) {
                if (data === "NEW" || data === "CARDLAYED" || data === "OK") {
                    location.reload();
                }
            }
        })).done(function () {

        setTimeout(function () {
            update()
        }, 2500);
    });

}
