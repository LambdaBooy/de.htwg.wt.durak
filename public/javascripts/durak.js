var numberOfPlayers = undefined;
var activePlayer = undefined;
var attacker = undefined;
var defender = undefined;
var neighbor = undefined;
var blockingCards = undefined;
var blockedCards = undefined;
var attackCards = undefined;

$(function () {
    $.when(updateNumberOfPlayers(), updateActivePlayer(), updateAttacker(), updateDefender(), updateNeighbor(),
        updateBlockingCards(), updateBlockedCards(), updateAttackCards()).done(function () {
        updateComponentsForActivePlayer();
    });
});

function updateComponentsForActivePlayer() {
    if (activePlayer === defender) {
        if (blockingCards === "") {
            showThrowInPlaceHolder();
        }
        disableOkButton();
    } else {
        updateAttackCards();
        enableOkButton();
    }
}

function handleCardOnDrag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function handleHandCardsOnDrop(ev) {
    ev.preventDefault();
    let draggedCard = ev.dataTransfer.getData("text");
    let draggedCardValue = getCardValueFromSrc(document.getElementById(draggedCard).src);

    if (activePlayer === attacker) {
        playAsAttacker(draggedCard, draggedCardValue, ev);
    } else if (activePlayer === defender) {
        playAsDefender(draggedCard, draggedCardValue, ev);

        if (numberOfPlayers === "2") {
            if (attackCards === "") {
                console.log("JETZT!");
                console.log("attackCards: " + attackCards);
                updateHandCards("attacker");
            }
        } else {
            alert("Not implemented yet!");
        }
    } else if (activePlayer === neighbor) {
        alert("Not implemented yet!");
    }
}

function playAsAttacker(draggedCard, cardValue, ev) {
    $.ajax({
        method: "GET",
        url: "/play/" + cardValue,
        dataType: "html",

        success: function (data) {
            if (data === "CARDLAYED") {
                let cardColorValueArr = cardValue.split(" ");
                let cardSrcName = getCardSrcName(cardColorValueArr[0], cardColorValueArr[1]);
                let attackCardsSize = document.getElementById("attackCards").children.length;
                let card = createCard("attackCard" + attackCardsSize, cardSrcName);
                ev.target.appendChild(card);
                updateHandCards("attacker");
            } else if (data === "ILLEGALTURN") {
                alert("Bisch du dumm?");
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
                if (data === "CARDLAYED") {
                    let blockedCardsElement = document.getElementById("blockedCards");
                    let blockedCardColorValueArr = otherCardValue.split(" ");
                    let blockedCardSrcName = getCardSrcName(blockedCardColorValueArr[0], blockedCardColorValueArr[1]);
                    let blockedCardsSize = blockedCardsElement.children.length;
                    let blockedCard = createCard("blockedCard" + blockedCardsSize, blockedCardSrcName);
                    blockedCardsElement.append(blockedCard);

                    let blockingCardsElement = document.getElementById("blockingCards");
                    let blockingCardColorValueArr = cardValue.split(" ");
                    let blockingCardSrcName = getCardSrcName(blockingCardColorValueArr[0], blockingCardColorValueArr[1]);
                    let blockingCardsSize = blockingCardsElement.children.length;
                    let blockingCard = createCard("blockingCard" + blockingCardsSize, blockingCardSrcName);
                    blockingCardsElement.append(blockingCard);

                    $.when(updateActivePlayer(), updateAttacker(), updateDefender(), updateNeighbor(),
                        updateAttackCards(), updateBlockingCards(), updateBlockedCards()).done(function () {
                        updateComponentsForActivePlayer();
                        if (attackCards === "") {
                            updateHandCards("attacker");
                        } else {
                            updateHandCards("defender");
                        }
                    });

                } else if (data === "ILLEGALTURN") {
                    alert("Bisch du dumm?");
                }
            }
        });
    } else if (otherCard.id === "placeholder") {
        $.ajax({
            method: "GET",
            url: "throwIn/" + cardValue,
            dataType: "html",

            success: function (data) {
                console.log("HIER: " + data);
                if (data === "CARDLAYED") {
                    $.when(updateActivePlayer(), updateAttacker(), updateDefender(), updateNeighbor(),
                        updateBlockedCards(), updateBlockingCards()).done(function () {
                        updateHandCards("attacker");
                        updateAttackCards();
                        updateComponentsForActivePlayer();
                    });
                }
            }
        });
    } else {
        alert("Bidde was? ¯\\_(ツ)_/¯ ")
    }
}

function playOk() {
    $.ajax({
        method: "GET",
        url: "/ok",
        dataType: "html",

        success: function (data) {
            if (data !== "LAYCARDFIRST") {
                if (activePlayer === attacker) {
                    $.when(updateActivePlayer(), updateAttacker(), updateDefender(), updateNeighbor(),
                        updateAttackCards(), updateBlockedCards(), updateBlockingCards()).done(
                        function () {
                            console.log(attackCards);

                            if (attackCards === "") {
                                $.when(updateHandCards("attacker")).done(function () {
                                    updateComponentsForActivePlayer();
                                });
                            } else {
                                $.when(updateHandCards("defender")).done(function () {
                                    updateComponentsForActivePlayer();
                                });
                            }
                        }
                    );

                } else {
                    if (numberOfPlayers > 2 && activePlayer === neighbor) {
                        alert("Not implemented yet!");
                    }
                }
            } else {
                alert(data);
            }
        }
    });
}

function enableDrop(ev) {
    if (activePlayer === defender) {
        if (ev.target.id === "attackCards") {
            return;
        } else if (ev.target.id === "placeholder") {
            let attackCardsValue = attackCards.split(",")[0].split(" ")[1];
            let draggedCard = document.getElementById(ev.dataTransfer.getData("text"));
            let draggedCardValue = getCardValueFromSrc(draggedCard.src).split(" ")[1];

            if (draggedCardValue !== attackCardsValue) {
                return;
            }
        }
    }
    ev.preventDefault();
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

function updateNumberOfPlayers() {
    return $.ajax({
        method: "GET",
        url: "/numberOfPlayers",
        dataType: "html",

        success: function (data) {
            numberOfPlayers = data;
        }
    });
}

function updateHandCards(player) {
    if (player === "attacker") {
        return $.ajax({
            method: "GET",
            url: "/attackerHandCards",
            dataType: "html",

            success: function (data) {
                let handCardsElement = document.getElementById("handView").children[0];
                let newHandCards = data.split(",");
                let i = 0;

                handCardsElement.innerHTML = "";

                newHandCards.forEach(function (card) {
                    let cardColorValueArr = card.split(" ");
                    let cardSrcName = getCardSrcName(cardColorValueArr[0], cardColorValueArr[1]);
                    let cardImg = createCard("handCard" + i, cardSrcName);
                    handCardsElement.append(cardImg);
                    i++;
                });
            }
        });
    } else if (player === "defender") {
        return $.ajax({
            method: "GET",
            url: "/defenderHandCards",
            dataType: "html",

            success: function (data) {
                let handCardsElement = document.getElementById("handView").children[0];
                let cards = data.split(",");
                let i = 0;

                handCardsElement.innerHTML = "";

                cards.forEach(function (card) {
                    let cardColorValueArr = card.split(" ");
                    let cardSrcName = getCardSrcName(cardColorValueArr[0], cardColorValueArr[1]);
                    let cardImg = createCard("handCard" + i, cardSrcName);
                    handCardsElement.append(cardImg);
                    i++;
                });
            }
        });
    } else {
        alert("Not implemented yet!");
    }
}

function showThrowInPlaceHolder() {
    let img = document.createElement('img');
    img.id = "placeholder";
    img.src = "/assets/images/placeholder.png";
    img.style = "border: 2px solid";
    document.getElementById("attackCards").append(img);
}

function updateActivePlayer() {
    return $.ajax({
        method: "GET",
        url: "/activePlayer",
        dataType: "html",

        success: function (data) {
            activePlayer = data;
            let activePlayerParagraph = document.getElementById("activePlayer");
            activePlayerParagraph.innerText = "Active: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" + activePlayer;
        }
    });
}

function updateAttacker() {
    return $.ajax({
        method: "GET",
        url: "/attacker",
        dataType: "html",

        success: function (data) {
            attacker = data;
            let attackingPlayerParagraph = document.getElementById("attackingPlayer");
            attackingPlayerParagraph.innerText = "Attacker: \u00A0\u00A0\u00A0" + attacker;
        }
    });
}

function updateDefender() {
    return $.ajax({
        method: "GET",
        url: "/defender",
        dataType: "html",

        success: function (data) {
            defender = data;
            let defendingPlayerParagraph = document.getElementById("defendingPlayer");
            defendingPlayerParagraph.innerText = "Victim: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" + defender;
        }
    });
}

function updateNeighbor() {
    return $.ajax({
        method: "GET",
        url: "/neighbor",
        dataType: "html",

        success: function (data) {
            neighbor = data;
            let neighborParagraph = document.getElementById("neighbor");
            neighborParagraph.innerText = "Neighbor: \u00A0\u00A0" + neighbor;
        }
    });
}

function disableOkButton() {
    document.getElementById("okayButton").disabled = true;
}

function enableOkButton() {
    document.getElementById("okayButton").disabled = false;
}


function updateAttackCards() {
    return $.ajax({
        method: "GET",
        url: "/attackCards",
        dataType: "html",

        success: function (data) {
            attackCards = data;

            let attackCardsElement = document.getElementById("attackCards");
            attackCardsElement.innerHTML = "";

            if (data !== "") {
                let newAttackCards = data.split(",");
                let i = 0;

                newAttackCards.forEach(function (card) {
                    let cardColorValueArr = card.split(" ");
                    let cardSrcName = getCardSrcName(cardColorValueArr[0], cardColorValueArr[1]);
                    let cardImg = createCard("attackCard" + i, cardSrcName);
                    attackCardsElement.append(cardImg);
                    i++;
                });
            }
        }
    });
}

function updateBlockedCards() {
    return $.ajax({
        method: "GET",
        url: "/blockedCards",
        dataType: "html",

        success: function (data) {
            blockedCards = data;

            let blockedCardsElement = document.getElementById("blockedCards");
            blockedCardsElement.innerHTML = "";

            if (data !== "") {
                let newBlockedCards = data.split(",");
                let i = 0;

                newBlockedCards.forEach(function (card) {
                    let cardColorValueArr = card.split(" ");
                    let cardSrcName = getCardSrcName(cardColorValueArr[0], cardColorValueArr[1]);
                    let cardImg = createCard("blockedCard" + i, cardSrcName);
                    blockedCardsElement.append(cardImg);
                    i++;

                });
            }
        }
    });
}

function updateBlockingCards() {
    return $.ajax({
        method: "GET",
        url: "/blockingCards",
        dataType: "html",

        success: function (data) {
            blockingCards = data;

            let blockingCardsElement = document.getElementById("blockingCards");
            blockingCardsElement.innerHTML = "";

            if (data !== "") {
                let newBlockingCards = data.split(",");
                let i = 0;

                newBlockingCards.forEach(function (card) {
                    let cardColorValueArr = card.split(" ");
                    let cardSrcName = getCardSrcName(cardColorValueArr[0], cardColorValueArr[1]);
                    let cardImg = createCard("blockingCard" + i, cardSrcName);
                    blockingCardsElement.append(cardImg);
                    i++;
                });
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
            if (data === "TAKE") {
                $.when(updateAttackCards(), updateBlockingCards(), updateBlockedCards(), updateActivePlayer(),
                    updateAttacker(), updateDefender(), updateNeighbor()).done(function () {
                    updateHandCards("attacker");
                    updateComponentsForActivePlayer();
                });
            } else {
                alert("There are no cards to take!");
            }
        }
    });
}

function undo() {
    return $.ajax({
        method: "GET",
        url: "/undo",
        dataType: "html",

        success: function (data) {
            $.when(updateAttackCards(), updateBlockingCards(), updateBlockedCards(), updateActivePlayer(),
                updateAttacker(), updateDefender(), updateNeighbor()).done(function () {
                    if (activePlayer === attacker) {
                        updateHandCards("attacker");
                    } else if (activePlayer === defender) {
                        updateHandCards("defender");
                    } else {
                        alert("Not implemented yet!");
                    }
                updateComponentsForActivePlayer();
            });
        }
    });
}

function createCard(id, cardSrcName) {
    let cardImg = document.createElement('img');
    cardImg.id = id;
    cardImg.draggable = "true";
    cardImg.className = "cardImg";
    cardImg.src = "/assets/images/" + cardSrcName;
    cardImg.addEventListener('dragstart', function (ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    });

    return cardImg;
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