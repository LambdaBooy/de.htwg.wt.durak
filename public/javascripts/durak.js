var playerName = undefined;
var playerRole = undefined;

var activePlayer = undefined;
var attacker = undefined;
var defender = undefined;
var neighbor = undefined;
var cardsInDeck = undefined;

var websocket = undefined;

$(function () {
    connectWebSocket();
});

function connectWebSocket() {
    websocket = new WebSocket("ws://localhost:9000/websocket");
    websocket.setTimeout;

    websocket.onopen = function (event) {
        websocket.send("test");
    };

    websocket.onclose = function () {
        connectWebSocket();
    };

    websocket.onerror = function (error) {
        console.log('Error in Websocket Occured: ' + error);
        connectWebSocket();
    };

    websocket.onmessage = function (event) {
        if (typeof event.data === "string") {
            let json = JSON.parse(event.data);

            $.when($.ajax({
                method: "GET",
                url: "/playerName",
                dataType: "html",

                success: function (data) {
                    playerName = data;
                    document.getElementById("playerName").innerText = "Your name:  \u00A0\u00A0\u00A0\u00A0" +
                        "\u00A0\u00A0\u00A0" + data
                }
            })).done(function () {

                activePlayer = json.game.active.player.name;

                $.when($.ajax({
                    method: "GET",
                    url: "/playerRole",
                    dataType: "html",

                    success: function (data) {
                        playerRole = data;
                    }
                })).done(function () {
                    updateComponents();
                });

                let activePlayerParagraph = document.getElementById("activePlayer");
                activePlayerParagraph.innerText = "Active: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" +
                    "\u00A0\u00A0\u00A0\u00A0" + activePlayer;


                attacker = json.game.currentTurn.attacker.player.name;

                let attackingPlayerParagraph = document.getElementById("attackingPlayer");
                attackingPlayerParagraph.innerText = "Attacker: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" +
                    "\u00A0\u00A0\u00A0" + attacker;

                defender = json.game.currentTurn.victim.player.name;

                let defendingPlayerParagraph = document.getElementById("defendingPlayer");
                defendingPlayerParagraph.innerText = "Victim: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" +
                    "\u00A0\u00A0\u00A0\u00A0" + defender;

                neighbor = json.game.currentTurn.neighbour.player.name;

                let neighborParagraph = document.getElementById("neighbor");
                neighborParagraph.innerText = "Neighbor: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
                    + neighbor;

                cardsInDeck = json.game.deck.length;

                let deckInfoParagraph = document.getElementById("deckInfo");
                deckInfoParagraph.innerText = "Cards in Deck: " + cardsInDeck;

                let playersAsJson = json.game.players;

                let handCardsElement = document.getElementById("handView").children[0];
                handCardsElement.innerHTML = "";

                let j = 0;
                for (i = 0; i < playersAsJson.length; i++) {
                    let player = playersAsJson[i].player;

                    if (player.name === playerName) {
                        player.handCards.forEach(cardObj => {
                            let cardColor = cardObj.card.color;
                            let cardValue = cardObj.card.value;

                            let cardSrcName = getCardSrcName(cardColor, cardValue);
                            let cardImg = createCard("handCard" + j, cardSrcName);
                            handCardsElement.append(cardImg);
                            j++;
                        });
                    }
                }

                let attackCardsAsJson = json.game.currentTurn.attackCards;
                let attackCardsElement = document.getElementById("attackCards");
                attackCardsElement.innerHTML = "";

                j = 0;

                attackCardsAsJson.forEach(attackCardObj => {
                    let cardColor = attackCardObj.card.color;
                    let cardValue = attackCardObj.card.value;

                    let cardSrcName = getCardSrcName(cardColor, cardValue);
                    let cardImg = createCard("attackCard" + j, cardSrcName);
                    attackCardsElement.append(cardImg);
                    j++;
                });

                let blockedByMap = json.game.currentTurn.blockedBy;

                let blockedCardsElement = document.getElementById("blockedCards");
                blockedCardsElement.innerHTML = "";

                let blockingCardsElement = document.getElementById("blockingCards");
                blockingCardsElement.innerHTML = "";

                blockedByMap.forEach(entry => {
                    let blockedCardColor = entry.attackCards.card.color;
                    let blockedCardValue = entry.attackCards.card.value;

                    let blockedCardSrcName = getCardSrcName(blockedCardColor, blockedCardValue);
                    let blockedCardsSize = blockedCardsElement.children.length;
                    let blockedCard = createCard("blockedCard" + blockedCardsSize, blockedCardSrcName);
                    blockedCardsElement.append(blockedCard);

                    let blockingCardColor = entry.blockingCards.card.color;
                    let blockingCardValue = entry.blockingCards.card.value;

                    let blockingCardSrcName = getCardSrcName(blockingCardColor, blockingCardValue);
                    let blockingCardsSize = blockingCardsElement.children.length;
                    let blockingCard = createCard("blockingCard" + blockingCardsSize, blockingCardSrcName);
                    blockingCardsElement.append(blockingCard);
                });
            })
        }
    }
}

function updateComponents() {
    if (playerRole === "defender") {
        if (activePlayer === playerName) {
            enableCardDragAndDrop();
            enableUndoButton();
            enableTakeButton();

            let blockingCards = document.getElementById("blockingCards");
            if (blockingCards !== null) {
                if (blockingCards.children.length === 0) {
                    showThrowInPlaceHolder();
                }
            }
        } else {
            disableCardDragAndDrop();
            disableUndoButton();
            disableTakeButton();
        }

        disableOkButton();
    } else {
        if (activePlayer === playerName) {
            enableCardDragAndDrop();
            enableUndoButton();
            enableTakeButton();
            enableOkButton()
        } else {
            disableCardDragAndDrop();
            disableOkButton();
            disableUndoButton();
            disableTakeButton();
        }
    }
}

function handleHandCardsOnDrop(ev) {
    ev.preventDefault();
    let draggedCard = ev.dataTransfer.getData("text");
    let draggedCardValue = getCardValueFromSrc(document.getElementById(draggedCard).src);

    if (activePlayer === attacker) {
        playAsAttacker(draggedCard, draggedCardValue, ev);
    } else if (activePlayer === defender) {
        playAsDefender(draggedCard, draggedCardValue, ev);
    } else if (activePlayer === neighbor) {
        alert("Not implemented yet! 1");
    }
}

function playAsAttacker(draggedCard, cardValue, ev) {
    $.ajax({
        method: "GET",
        url: "/play/" + cardValue,
        dataType: "html",

        success: function (data) {
            if (data !== "CARDLAYED") {
                var toast = document.getElementById('toast');
                toast.show({
                    notificationTitle: "Blyat",
                    body: "Bisch du dumm?!",
                    icon: "/assets/images/slav_squat.png"
                });
                var audio = new Audio("/assets/audios/blyat.mp3");
                audio.play();
            }
        }
    });
}

function playAsDefender(draggedCard, cardValue, ev) {
    let otherCard = ev.target;
    if (otherCard.tagName === "CARD-ELEMENT" && otherCard.id !== "placeholder") {
        let otherCardValue = getCardValueFromSrc(otherCard.src);
        $.ajax({
            method: "GET",
            url: "play/" + cardValue + " " + otherCardValue,
            dataType: "html",

            success: function (data) {
                if (data !== "CARDLAYED") {
                    var toast = document.getElementById('toast');
                    toast.show({
                        notificationTitle: "Blyat",
                        body: "Bisch du dumm?!",
                        icon: "/assets/images/slav_squat.png"
                    });
                    var audio = new Audio("/assets/audios/blyat.mp3");
                    audio.play();
                }
            }
        });
    } else if (otherCard.id === "placeholder") {
        $.ajax({
            method: "GET",
            url: "throwIn/" + cardValue,
            dataType: "html",

            success: function (data) {
                if (data !== "CARDLAYED") {
                    var toast = document.getElementById('toast');
                    toast.show({
                        notificationTitle: "Blyat",
                        body: "Bisch du dumm?!",
                        icon: "/assets/images/slav_squat.png"
                    });
                    var audio = new Audio("/assets/audios/blyat.mp3");
                    audio.play();
                }
            }
        });
    } else {
        var toast = document.getElementById('toast');
        toast.show({
            notificationTitle: "Blyat",
            body: "Bidde was? ¯\\_(ツ)_/¯",
            icon: "/assets/images/slav_squat.png"
        });
        var audio = new Audio("/assets/audios/blyat.mp3");
        audio.play();
    }
}

function playOk() {
    $.ajax({
        method: "GET",
        url: "/ok",
        dataType: "html",

        success: function (data) {
            if (data === "LAYCARDFIRST") {
                alert(data);
            }
        }
    });
}

function getCardValueFromSrc(srcName) {
    let cardNameArr = srcName.slice(15).split(".")[0].split("_");
    let typeDict = {
        "club": "Kreuz",
        "diamond": "Karo",
        "heart": "Herz",
        "spade": "Pik"
    };
    let valueDict = {
        "2": "Zwei",
        "3": "Drei",
        "4": "Vier",
        "5": "Fünf",
        "6": "Sechs",
        "7": "Sieben",
        "8": "Acht",
        "9": "Neun",
        "jack": "Bube",
        "queen": "Dame",
        "king": "König",
        "10": "Zehn",
        "1": "Ass"
    };

    return typeDict[cardNameArr[0]].concat(" ").concat(valueDict[cardNameArr[1]]);
}

function showThrowInPlaceHolder() {
    let img = document.createElement('img');
    img.id = "placeholder";
    img.src = "/assets/images/placeholder.png";
    img.style = "border: 2px solid; width: 85px; margin-top: -117px;";
    document.getElementById("attackCards").append(img);
}

function enableDrop(ev) {
    ev.preventDefault();
}

function disableCardDragAndDrop() {
    let cards = document.getElementById("handView").children[0].children;

    for (i = 0; i < cards.length; i++) {
        cards[i].setAttribute("draggable", "false");
    }
}

function enableCardDragAndDrop() {
    let cards = document.getElementById("handView").children[0].children;

    for (i = 0; i < cards.length; i++) {
        cards[i].setAttribute("draggable", "true");
    }
}

function disableOkButton() {
    document.getElementById("okayButton").disabled = true;
}

function enableOkButton() {
    document.getElementById("okayButton").disabled = false;
}

function disableUndoButton() {
    document.getElementById("undoButton").disabled = true;
}

function enableUndoButton() {
    document.getElementById("undoButton").disabled = false;
}

function disableTakeButton() {
    document.getElementById("takeButton").disabled = true;
}

function enableTakeButton() {
    document.getElementById("takeButton").disabled = false;
}

function updatePlayerRole() {
    return $.ajax({
        method: "GET",
        url: "/playerRole",
        dataType: "html",

        success: function (data) {
            playerRole = data;
        }
    });
}

function takeCards() {
    return $.ajax({
        method: "GET",
        url: "/take",
        dataType: "html",

        success: function (data) {
            if (data !== "TAKE") {
                var toast = document.getElementById('toast');
                toast.show({
                    notificationTitle: "Blyat",
                    body: "Bisch du dumm?!",
                    icon: "/assets/images/slav_squat.png"
                });
                var audio = new Audio("/assets/audios/blyat.mp3");
                audio.play();
            }
        }
    });
}

function undo() {
    return $.ajax({
        method: "GET",
        url: "/undo",
        dataType: "html",
    });
}

function createCard(id, cardSrcName) {
    let cardElement = document.createElement('card-element');
    cardElement.id = id;
    if (activePlayer === playerName) {
        cardElement.draggable = "true";
    }
    cardElement.src = "/assets/images/" + cardSrcName;
    if (activePlayer === playerName) {
        cardElement.addEventListener('dragstart', function (ev) {
            ev.dataTransfer.setData("text", ev.target.id);
        });
    }

    return cardElement;
}

function getCardSrcName(cardColor, cardValue) {
    let cardColorDict = {
        "Herz": "heart",
        "Karo": "diamond",
        "Pik": "spade",
        "Kreuz": "club"
    };

    let cardValueDict = {
        "Zwei": "2",
        "Drei": "3",
        "Vier": "4",
        "Fünf": "5",
        "Sechs": "6",
        "Sieben": "7",
        "Acht": "8",
        "Neun": "9",
        "Bube": "jack",
        "Dame": "queen",
        "König": "king",
        "Zehn": "10",
        "Ass": "1"
    };

    return cardColorDict[cardColor] + "_" + cardValueDict[cardValue] + ".png";
}