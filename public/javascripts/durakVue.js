var playerName = undefined;
var playerRole = undefined;

var activePlayer = undefined;
var attacker = undefined;
var defender = undefined;
var neighbor = undefined;
var cardsInDeck = undefined;
var trumpCard = undefined;

var websocket = undefined;

Vue.component('durak-app', {
    template:`
        <div>
            <div class="row">
                <div class="col"></div>
                <div class="col">
                    <p id="deckInfo">Cards in Deck:</p>
                </div>
                <div class="col">
                    <p id="trumpCardLabel"><b>Trump Card:</b></p>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <div id="gameInfo">
                        <p id="playerName">Your name:</p>
                        <p id="activePlayer">Active:</p>
                        <p id="attackingPlayer">Attacker:</p>
                        <p id="defendingPlayer">Victim:</p>
                        <p id="neighbor">Neighbor:</p>
                    </div>
                </div>
                    <div class="col">
                    </div>
                    <div class="col" id="trumpCardBox">
                    </div>
            </div>

            <div class="row">
                <div class="col">
                    <div id="attackCards" ondrop="handleHandCardsOnDrop(event)" ondragover="enableDrop(event)" class="scrollmenu" >
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
                    <div id="leftButtonsContainer">
                        <div>
                            <button id="okayButton" class="btn btn-dark" type="button" onclick="playOk()">
                                <b>OKAY</b>
                                <img id="thumpUpImg" src="assets/images/thump_up.png"/>
                            </button>
                        </div>
                        <div>
                            <button id="takeButton" onclick="takeCards()" class="btn btn-dark">
                                <b>TAKE</b>
                                <img id="poopImg" src="assets/images/poop.png"/>
                            </button>
                        </div>
                        <div>
                            <button id="undoButton" class="btn btn-dark" onclick="undo()" type="button">
                                <b>UNDO</b>
                                <img id="undoArrowImg" src="assets/images/undo_arrow.png"/>
                            </button>
                        </div>
                    </div>
                </div>
                <div id="handView" ondrop="handleHandCardsOnDrop(event)" class="col-md-5">
                    <div id="hand-cards" class="scrollmenu">
                    </div>
                </div>
            </div>
        </div>
    `
});


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

            console.log(json);

            let app = new Vue({
                el: "#gameContainer"
            });

            $.when($.ajax({
                method: "GET",
                url: "/playerName",
                dataType: "html",

                success: function (data) {
                    playerName = data;
                    let playerNameVue = new Vue({
                        el: "#playerName",
                    });

                    playerNameVue.$el.innerHTML = "Your name:  \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" + data;
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

                let activePlayerVue = new Vue({
                    el: "#activePlayer",
                });

                activePlayerVue.$el.innerHTML = "Active: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" +
                    "\u00A0\u00A0\u00A0\u00A0" + activePlayer;

                attacker = json.game.currentTurn.attacker.player.name;

                let attackingPlayerVue = new Vue({
                    el: "#attackingPlayer",
                });

                attackingPlayerVue.$el.innerHTML = "Attacker: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
                    + attacker;

                defender = json.game.currentTurn.victim.player.name;

                let defendingPlayerVue = new Vue({
                    el: "#defendingPlayer",
                });

                defendingPlayerVue.$el.innerHTML = "Victim: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" +
                    "\u00A0\u00A0\u00A0\u00A0" + defender;

                neighbor = json.game.currentTurn.neighbour.player.name;

                let neighborVue = new Vue({
                    el: "#neighbor",
                });

                neighborVue.$el.innerHTML = "Neighbor: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" + neighbor;

                cardsInDeck = json.game.deck.length;

                let cardsInDeckVue = new Vue({
                    el: "#deckInfo",
                });

                cardsInDeckVue.$el.innerHTML = "Cards in Deck: " + cardsInDeck;

                let trumpCardAsJson = json.game.trump.card;

                let trumpCardBoxElementVue = new Vue({
                    el: "#trumpCardBox"
                });

                let trumpCardSrcName = getCardSrcName(trumpCardAsJson.color, trumpCardAsJson.value);
                let trumpCardImg = createCard("trumpCard", trumpCardSrcName);

                trumpCardBoxElementVue.$el.innerHTML = "";
                trumpCardBoxElementVue.$el.appendChild(trumpCardImg);

                let playersAsJson = json.game.players;

                let j = 0;
                for (i = 0; i < playersAsJson.length; i++) {
                    let player = playersAsJson[i].player;

                    if (player.name === playerName) {

                        var handCardsElementVue = new Vue({
                            el: "#hand-cards"
                        });

                        handCardsElementVue.$el.innerHTML = "";

                        player.handCards.forEach(cardObj => {
                            let cardColor = cardObj.card.color;
                            let cardValue = cardObj.card.value;

                            let cardSrcName = getCardSrcName(cardColor, cardValue);
                            let cardImg = createCard("handCard" + j, cardSrcName);
                            handCardsElementVue.$el.append(cardImg);
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

                let blockedCardsElementVue = new Vue({
                    el: "#blockedCards"
                });
                blockedCardsElementVue.$el.innerHTML = "";

                let blockingCardsElementVue = new Vue({
                    el: "#blockingCards"
                });
                blockingCardsElementVue.$el.innerHTML = "";

                blockedByMap.forEach(entry => {
                    let blockedCardColor = entry.attackCards.card.color;
                    let blockedCardValue = entry.attackCards.card.value;

                    let blockedCardSrcName = getCardSrcName(blockedCardColor, blockedCardValue);
                    let blockedCardsSize = blockedCardsElementVue.$el.children.length;
                    let blockedCard = createCard("blockedCard" + blockedCardsSize, blockedCardSrcName);
                    blockedCardsElementVue.$el.append(blockedCard);

                    let blockingCardColor = entry.blockingCards.card.color;
                    let blockingCardValue = entry.blockingCards.card.value;

                    let blockingCardSrcName = getCardSrcName(blockingCardColor, blockingCardValue);
                    let blockingCardsSize = blockingCardsElementVue.$el.children.length;
                    let blockingCard = createCard("blockingCard" + blockingCardsSize, blockingCardSrcName);
                    blockingCardsElementVue.$el.append(blockingCard);
                });
            });
        }
    }
}

function updateComponents() {
    if (playerRole === "defender") {
        if (activePlayer === playerName) {
            enableCardDragAndDrop();
            enableUndoButton();
            enableTakeButton();

            let blockingCardsVue = new Vue({
                el: "#blockingCards"
            });

            if (blockingCards !== null) {
                if (blockingCardsVue.$el.children.length === 0) {
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

function disableCardDragAndDrop() {
    let cards = document.getElementById("handView").children[0].children;

    for (i = 0; i < cards.length; i++) {
        cards[i].setAttribute("draggable", "false");
    }
}

function enableCardDragAndDrop() {
    let cardsVue = new Vue({
        el: "#handView"
    });
    let cards = cardsVue.$el.children[0].children;

    for (i = 0; i < cards.length; i++) {
        cards[i].setAttribute("draggable", "true");
    }
}

function disableOkButton() {
    let okayButtonVue = new Vue({
        el: "#okayButton"
    });

    okayButtonVue.$el.disabled = true;
}

function enableOkButton() {
    let okayButtonVue = new Vue({
        el: "#okayButton"
    });

    okayButtonVue.$el.disabled = false;
}

function disableUndoButton() {
    let undoButtonVue = new Vue({
        el: "#undoButton"
    });

    undoButtonVue.$el.disabled = true;
}

function enableUndoButton() {
    let undoButtonVue = new Vue({
        el: "#undoButton"
    });

    undoButtonVue.$el.disabled = false;
}

function disableTakeButton() {
    let takeButtonVue = new Vue({
        el: "#takeButton"
    });

    takeButtonVue.$el.disabled = true;
}

function enableTakeButton() {
    let takeButtonVue = new Vue({
        el: "#takeButton"
    });

    takeButtonVue.$el.disabled = false;
}

function playAsAttacker(draggedCard, cardValue, ev) {
    $.ajax({
        method: "GET",
        url: "/play/" + cardValue,
        dataType: "html",

        success: function (data) {
            if (data !== "CARDLAYED") {
                Vue.use(Toasted, {
                    position: 'bottom-left',
                    duration: 3000,
                    keepOnHover: true,
                    action: {
                        text: 'JA',
                        onClick: (e, toastObject) => {
                            toastObject.goAway(0);
                        }
                    }
                });
                Vue.toasted.show('Bisch du dumm?!');
            } else {
                let cardColorValueArr = cardValue.split(" ");
                let cardSrcName = getCardSrcName(cardColorValueArr[0], cardColorValueArr[1]);
                let attackCardsSize = document.getElementById("attackCards").children.length;
                let card = createCard("attackCard" + attackCardsSize, cardSrcName);
                ev.target.appendChild(card);
            }
        }
    });
}

function playAsDefender(draggedCard, cardValue, ev) {
    let otherCard = ev.target;
    if (otherCard.tagName === "IMG" && otherCard.id !== "placeholder") {
        let otherCardValue = getCardValueFromSrc(otherCard.src);
        $.ajax({
            method: "GET",
            url: "play/" + cardValue + " " + otherCardValue,
            dataType: "html",

            success: function (data) {
                if (data !== "CARDLAYED") {
                    Vue.use(Toasted, {
                        position: 'bottom-left',
                        duration: 3000,
                        keepOnHover: true,
                        action: {
                            text: 'JA',
                            onClick: (e, toastObject) => {
                                toastObject.goAway(0);
                            }
                        }
                    });
                    Vue.toasted.show('Bisch du dumm?!');
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
                    Vue.use(Toasted, {
                        position: 'bottom-left',
                        duration: 3000,
                        keepOnHover: true,
                        action: {
                            text: 'JA',
                            onClick: (e, toastObject) => {
                                toastObject.goAway(0);
                            }
                        }
                    });
                    Vue.toasted.show('Bisch du dumm?!');
                }
            }
        });
    } else {
        Vue.use(Toasted, {
            position: 'bottom-left',
            duration: 3000,
            keepOnHover: true,
            action: {
                text: 'JA',
                onClick: (e, toastObject) => {
                    toastObject.goAway(0);
                }
            }
        });
        Vue.toasted.show('Bidde was? ¯\\_(ツ)_/¯');
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

function takeCards() {
    return $.ajax({
        method: "GET",
        url: "/take",
        dataType: "html",

        success: function (data) {
            if (data !== "TAKE") {
                Vue.use(Toasted, {
                    position: 'bottom-left',
                    duration: 3000,
                    keepOnHover: true,
                    action: {
                        text: 'JA',
                        onClick: (e, toastObject) => {
                            toastObject.goAway(0);
                        }
                    }
                });
                Vue.toasted.show('Bisch du dumm?!');
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

function getCardValueFromSrc(srcName) {
    let cardNameArr = srcName.slice(36).split(".")[0].split("_");
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

function handleHandCardsOnDrop(ev) {
    ev.preventDefault();
    let draggedCard = ev.dataTransfer.getData("text");
    let draggedCardValue = getCardValueFromSrc(draggedCard);

    if (activePlayer === attacker) {
        playAsAttacker(draggedCard, draggedCardValue, ev);
    } else if (activePlayer === defender) {
        playAsDefender(draggedCard, draggedCardValue, ev);
    } else if (activePlayer === neighbor) {
        alert("Not implemented yet! 1");
    }
}

function handleCardOnDrag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function createCard(id, cardSrcName) {
    let cardElement = document.createElement('img');
    cardElement.id = id;
    cardElement.className = "cardImg";
    if (activePlayer === playerName) {
        cardElement.draggable = "true";
    }
    cardElement.setAttribute("src", "/assets/images/" + cardSrcName);
    if (activePlayer === playerName) {
        cardElement.addEventListener('dragstart', function (ev) {
            ev.dataTransfer.setData("text", ev.target.id);
        });
    }

    return cardElement;
}

function enableDrop(ev) {
    ev.preventDefault();
}

function showThrowInPlaceHolder() {
    let img = document.createElement('img');
    img.id = "placeholder";
    img.src = "/assets/images/placeholder.png";
    img.style = "border: 2px solid; width: 85px;";
    document.getElementById("attackCards").append(img);
}



