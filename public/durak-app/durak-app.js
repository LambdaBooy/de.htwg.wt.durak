import {LitElement, html, css} from "https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module";

document.body.style.background = "green";

var clientName = undefined;
var playerRole = undefined;

var activePlayer = undefined;
var attacker = undefined;
var defender = undefined;
var neighbor = undefined;
var cardsInDeck = undefined;

var websocket = undefined;

$(function () {
    setUpEventListeners();
    connectWebSocket();
});

function setUpEventListeners() {
    let attackCardsElement = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("attackCards");
    attackCardsElement.ondragover = function (event) {
        enableDrop(event)
    };
    attackCardsElement.ondrop = function (event) {
        handleHandCardsOnDrop(event)
    };

    let handViewElement = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("handView");
    handViewElement.ondrop = function (event) {
        handleHandCardsOnDrop(event)
    };

    let undoButtonElement = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("undoButton");
    undoButtonElement.onclick = function () {
        undo();
    };

    let takeButtonElement = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("takeButton");
    takeButtonElement.onclick = function () {
        takeCards();
    };

    let okayButtonElement = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("okayButton");
    okayButtonElement.onclick = function () {
        playOk();
    }
}

function enableDrop(ev) {
    ev.preventDefault();
}

function connectWebSocket() {
    websocket = new WebSocket("ws://localhost:9000/durakWebsocket");
    websocket.setTimeout;

    websocket.onopen = function (event) {
        websocket.send("test");
    };

    websocket.onclose = function () {
        connectWebSocket();
    };

    websocket.onerror = function (error) {
        console.log('Error in Websocket Occured: ' + error);
    };

    websocket.onmessage = function (event) {
        if (typeof event.data === "string") {
            let json = JSON.parse(event.data);

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
                    url: "/playerRole",
                    dataType: "html",

                    success: function (data) {
                        playerRole = data;
                    }
                })
            }).done(function () {
                activePlayer = json.game.active.player.name;

                let playerNameParagraph = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("playerName");
                playerNameParagraph.innerText = "Your name:  \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" + clientName

                let activePlayerParagraph = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("activePlayer");
                activePlayerParagraph.innerText = "Active: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" +
                    "\u00A0\u00A0\u00A0\u00A0\u00A0" + activePlayer;


                attacker = json.game.currentTurn.attacker.player.name;

                let attackingPlayerParagraph = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("attackingPlayer");
                attackingPlayerParagraph.innerText = "Attacker: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" +
                    "\u00A0\u00A0\u00A0" + attacker;

                defender = json.game.currentTurn.victim.player.name;

                let defendingPlayerParagraph = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("defendingPlayer");
                defendingPlayerParagraph.innerText = "Victim: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" +
                    "\u00A0\u00A0\u00A0\u00A0\u00A0" + defender;

                neighbor = json.game.currentTurn.neighbour.player.name;

                let neighborParagraph = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("neighbor");
                neighborParagraph.innerText = "Neighbor: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
                    + neighbor;

                cardsInDeck = json.game.deck.length;

                let deckInfoParagraph = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("deckInfo");
                deckInfoParagraph.innerText = "Cards in Deck: " + cardsInDeck;

                let playersAsJson = json.game.players;

                let trumpCardElement = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("trumpCardBox");
                trumpCardElement.innerHTML = "";
                let trumpCard = json.game.trump.card;
                let trumpCardColor = trumpCard.color;
                let trumpCardValue = trumpCard.value;
                let cardSrcName = getCardSrcName(trumpCardColor, trumpCardValue);
                let trumpCardImg = createCard("trumpCard", cardSrcName);
                trumpCardElement.appendChild(trumpCardImg);
                let handCardsElement = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("handView").children[0];
                handCardsElement.innerHTML = "";

                let i = 0;
                let j = 0;
                for (i = 0; i < playersAsJson.length; i++) {
                    let player = playersAsJson[i].player;

                    if (player.name === clientName) {
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
                let attackCardsElement = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("attackCards");
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

                let blockedCardsElement = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("blockedCards");
                blockedCardsElement.innerHTML = "";

                let blockingCardsElement = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("blockingCards");
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

                updateComponents();
            });
        }
    }
}

function updateComponents() {
    if (playerRole === "defender") {
        if (activePlayer === clientName) {
            enableCardDragAndDrop();
            enableUndoButton();
            enableTakeButton();

            let blockingCards = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("blockingCards");
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
        if (activePlayer === clientName) {
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
    let draggedCardValue = getCardValueFromSrc(document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById(draggedCard).src);

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
                var toast = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById('toast');
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
                    var toast = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById('toast');
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
                    var toast = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById('toast');
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
        var toast = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById('toast');
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
    document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("attackCards").append(img);
}


function disableCardDragAndDrop() {
    let cards = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("handView").children[0].children;
    console.log(cards)
    let i = 0;
    for (i = 0; i < cards.length; i++) {
        cards[i].setAttribute("draggable", "false");
    }
    console.log(cards)
}

function enableCardDragAndDrop() {
    let cards = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("handView").children[0].children;

    let i = 0;
    for (i = 0; i < cards.length; i++) {
        cards[i].setAttribute("draggable", "true");
    }
}

function disableOkButton() {
    document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("okayButton").disabled = true;
}

function enableOkButton() {
    document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("okayButton").disabled = false;
}

function disableUndoButton() {
    document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("undoButton").disabled = true;
}

function enableUndoButton() {
    document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("undoButton").disabled = false;
}

function disableTakeButton() {
    document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("takeButton").disabled = true;
}

function enableTakeButton() {
    document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById("takeButton").disabled = false;
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
                var toast = document.getElementsByTagName("durak-app")[0].shadowRoot.getElementById('toast');
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
    if (activePlayer === clientName) {
        cardElement.draggable = "true";
    }
    cardElement.src = "/assets/images/" + cardSrcName;
    if (activePlayer === clientName) {
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

class DurakApp extends LitElement {
    static get styles() {
        return [
            super.styles,
            css`
            
            #gameContainer {
                background-color: green;
              
            }
            
            div.ff-ext--bootstrapResponsiveHelper {
                background-color: green;
            }
            
            div.scrollmenu {
                overflow: auto;
                white-space: nowrap;
                bottom: 0;
            }
            
            div.scrollmenu a {
                display: inline-block;
                text-align: center;
                padding: 14px;
                text-decoration: none;
            }
            
            div.scrollmenu a:hover {
                background-color: #777;
            }
            
            #attackCards {
                margin-top: 20px;
                margin-left: 10.8%;
                width: 78%;
                min-height: 168.667px;
                border:2px solid #d4af37;
            }
            
            #defendedCardsContainer {
                width: 78%;
                margin-top: 30px;
                margin-left: 10.8%;
                min-height: 204px;
            }
            
            #blockedCards {
                display: inline-block;
            }
            
            #blockingCards {
                margin-top: -115px;
            }
            
            #handViewContainer {
                flex-wrap: nowrap;
            }
            
            #handView {
                margin-top: 35px;
                min-width: 785px;
            }
            
            #trumpCardBox {
                text-align: right;
                margin-right: 25px;
            }
            
            #okayButton {
                margin-left: 13px;
                margin-top: 25px;
                font-size: 15px;
            }
            
            #undoButton {
                margin-left: 12px;
                margin-top: 30px;
                font-size: 15px;
            }
            
            #buttonRight {
                margin-top: 85px;
                font-size: 15px;
            }
            
            #takeButton {
                margin-left: 10px;
                margin-top: 30px;
                font-size: 15px;
            }
            
            #leftButtonsContainer {
                margin-bottom: 30px;
                float: left;
                margin-right: 30px;
                margin-top: -40px;
            }
            
            #deckInfo {
                text-align: center;
                color: white;
                font-size: 16px;
                padding-top: 15px;
                margin-bottom: 0;
            }
            
            #gameInfo {
                left: 15px;
                text-align: left;
                color: white;
                font-size: 16px;
                font-weight: bold;
            }
            
            #deckInfo {
                font-weight: bold;
                font-size: 16px;
            }
            
            #trumpCardLabel {
                text-align: right;
                color: white;
                font-size: 16px;
                padding-right: 32px;
                margin-bottom: 0;
            }
            
            #poopImg {
                width: 35px;
                margin-left: 15px;
            }
            
            #thumpUpImg {
                width: 25px;
                margin-left: 15px;
            }
            
            #undoArrowImg {
                width: 25px;
                margin-left: 15px;
            }`
        ];
    }

    render() {
        return html`
        <div id="gameContainer" class="container-fluid">
        <notification-toast id="toast"></notification-toast>

        <div class="row">
            <div class="col-xs-12">
                <p id="deckInfo">Cards in Deck:</p>
            </div>
        </div>

        <div class="row">
            <div class="col-xs-6">
                <div id="gameInfo">
                    <p id="playerName">Your name:</p>
                    <p id="activePlayer">Active:</p>
                    <p id="attackingPlayer">Attacker:</p>
                    <p id="defendingPlayer">Victim:</p>
                    <p id="neighbor">Neighbor:</p>

                </div>
            </div>
            <div class="col-xs-6">
                <p id="trumpCardLabel"><b>Trump Card:</b></p>
                <div id="trumpCardBox">
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col">
                <div id="attackCards" class="scrollmenu" >
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col">
                <div class="scrollmenu" id="defendedCardsContainer">
                    <div>

                        <div id="blockedCards">
                        </div>

                        <div id="blockingCards">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row" id="handViewContainer">
            <div class="col-md-auto">
                <div>
                <div id="leftButtonsContainer">
                    <div>
                        <button id="okayButton" class="btn btn-primary" type="button">
                            <b>OKAY</b>
                            <img id="thumpUpImg" src="assets/images/thump_up.png">
                        </button>
                    </div>
                    <div>
                        <button id="takeButton" class="btn btn-primary">
                            <b>TAKE</b>
                            <img id="poopImg" src="assets/images/poop.png">
                        </button>
                    </div>
                    <div>
                        <button id="undoButton" class="btn btn-primary" type="button">
                            <b>UNDO</b>
                            <img id="undoArrowImg" src="assets/images/undo_arrow.png">
                        </button>
                    </div>
                </div>

                <div id="handView">
                    <div class="scrollmenu">
                    </div>
                </div>
                </div>
            </div>
        </div>
    </div>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    `;
    }
}

customElements.define('durak-app', DurakApp);