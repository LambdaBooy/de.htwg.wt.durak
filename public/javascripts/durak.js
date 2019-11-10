
var numberOfPlayers = getNumberOfPlayers();

function handleCardOnDrag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function handleHandCardsOnDrop(ev) {
    ev.preventDefault();
    var draggedCard = ev.dataTransfer.getData("text");
    var draggedCardValue = getCardValueFromSrc(document.getElementById(draggedCard).src);

    if (activePlayer === attacker) {
        playAsAttacker(draggedCard, draggedCardValue, ev);
    } else if (activePlayer === defender) {
        playAsDefender(draggedCard, draggedCardValue, ev);

        var activePlayer = getActivePlayer();
        var attacker = getCurrentAttacker();
        var defender = getCurrentDefender();
        var neighbor = getCurrentNeighbor();

        if (numberOfPlayers === "2") {
            showHandCards("attacker");
            updateGameInfo(activePlayer, attacker, defender, neighbor);
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
            console.log("Game Status:" + data);
            if (data === "CARDLAYED") {
                ev.target.appendChild(document.getElementById(draggedCard));
            } else if (data === "ILLEGALTURN") {
                alert("Bisch du dumm?");
            }
        }
    });
}

function playAsDefender(draggedCard, cardValue, ev) {
    var otherCard = ev.target;
    if (otherCard.tagName === "IMG") {
        var otherCardValue = getCardValueFromSrc(otherCard.src);

        $.ajax({
            method: "GET",
            url: "play/" + cardValue + " " + otherCardValue,
            dataType: "html",
            async: false,

            success: function (data) {
                console.log("Game Status:" + data);
                if (data === "CARDLAYED") {
                    var blockedCards = document.getElementById("blockedCards");
                    blockedCards.append(otherCard);

                    var blockingCards = document.getElementById("blockingCards");
                    blockingCards.append(document.getElementById(draggedCard));
                } else if (data === "ILLEGALTURN") {
                    alert("Bisch du dumm?");
                }
            }
        });
    } else {
        alert("Bidde was? ¯\\_(ツ)_/¯ ")
    }
}

function playOk() {
    var activePlayer = getActivePlayer();
    var attacker = getCurrentAttacker();
    var defender = getCurrentDefender();
    var neighbor = getCurrentNeighbor();

    $.ajax({
        method: "GET",
        url: "/ok",
        dataType: "html",

        success: function (data) {
            if (data !== "LAYCARDFIRST") {

                updateGameInfo(activePlayer, attacker, defender, neighbor);

                if (activePlayer === attacker) {
                    activePlayer = getActivePlayer();
                    attacker = getCurrentAttacker();
                    defender = getCurrentDefender();
                    neighbor = getCurrentNeighbor();

                    updateGameInfo(activePlayer, attacker, defender, neighbor);
                    showHandCards("defender");
                    showThrowInPlaceHolder();
                    disableOkButton();
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
    ev.preventDefault();
}

function getCardValueFromSrc(srcName) {
    var cardNameArr = srcName.slice(36).split(".")[0].split("_");
    var typeDict = {
        "club": "Kreuz",
        "diamond": "Karo",
        "heart": "Herz",
        "spade": "Pik"
    };
    var valueDict = {
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

function cardNamesToCardImgConverter(cardsAsString) {
    var cards = cardsAsString.split(",");

    var cardColorDict = {
        "Herz": "heart",
        "Karo": "diamond",
        "Pik": "spade",
        "Kreuz": "club"
    };

    var cardValueDict = {
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

    var i = 1;

    var cardsAsImgs = [];

    cards.forEach(function (card) {
        var cardColorValueArr = card.split(" ");
        var cardColor = cardColorValueArr[0];
        var cardValue = cardColorValueArr[1];
        var cardImgSrcName = cardColorDict[cardColor] + "_" + cardValueDict[cardValue] + ".png";
        var cardImg = document.createElement('img');
        cardImg.id = "handCard" + i;
        cardImg.draggable = "true";
        cardImg.className = "cardImg";
        cardImg.src = "/assets/images/" + cardImgSrcName;
        i++;
        cardImg.addEventListener('dragstart', function (ev) {
            ev.dataTransfer.setData("text", ev.target.id);
        });
        cardsAsImgs.push(cardImg);
    });

    return cardsAsImgs
}

// if (activePlayer === defendingPlayer) {
//     showThrowInPlaceHolder();
// }

function getNumberOfPlayers() {
    var numOfPlayers = "0";
    $.ajax({
        method: "GET",
        url: "/numberOfPlayers",
        dataType: "html",
        async: false,

        success: function (data) {
            numOfPlayers = data;
        }
    });
    return numOfPlayers;
}

function showHandCards(player) {
    if (player === "attacker") {
        $.ajax({
            method: "GET",
            url: "/attackerHandCards",
            dataType: "html",

            success: function (data) {
                var handView = document.getElementById("handView").children[0];
                var newHandCards = cardNamesToCardImgConverter(data);
                handView.innerHTML = "";
                newHandCards.forEach(function (card) {
                    handView.append(card);
                });
            }
        });
    } else if (player === "defender") {
        $.ajax({
            method: "GET",
            url: "/defenderHandCards",
            dataType: "html",

            success: function (data) {
                var handView = document.getElementById("handView").children[0];
                var newHandCards = cardNamesToCardImgConverter(data);
                handView.innerHTML = "";
                newHandCards.forEach(function (card) {
                    handView.append(card);
                });
            }
        });
    }
}

function updateGameInfo(activePlayer, attacker, defender, neighbor) {
    var activePlayerParagraph = document.getElementById("activePlayer");
    var attackingPlayerParagraph = document.getElementById("attackingPlayer");
    var defendingPlayerParagraph = document.getElementById("defendingPlayer");
    var neighborParagraph = document.getElementById("neighbor");

    activePlayerParagraph.innerText = "Active: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" + activePlayer;
    attackingPlayerParagraph.innerText = "Attacker: \u00A0\u00A0\u00A0" + attacker;
    defendingPlayerParagraph.innerText = "Victim: \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" + defender;
    neighborParagraph.innerText = "Neighbor: \u00A0\u00A0" + neighbor;
}

function showThrowInPlaceHolder() {
    var placeHolder = document.getElementById("placeholder");

    if (placeHolder === null) {
        var img = document.createElement('img');
        img.id = "placeholder";
        img.src = "/assets/images/placeholder.png";
        img.style = "border: 2px solid";
        document.getElementById("attackCards").append(img);
    }
}

function getActivePlayer() {
    var activePlayer = "This should not happen :'(";
    $.ajax({
        method: "GET",
        url: "/activePlayer",
        dataType: "html",
        async: false,

        success: function (data) {
            activePlayer = data;
        }
    });
    return activePlayer;
}

function getCurrentAttacker() {
    var currentAttacker = "";
    $.ajax({
        method: "GET",
        url: "/attacker",
        dataType: "html",
        async: false,

        success: function (data) {
            currentAttacker = data;
        }
    });
    return currentAttacker;
}

function getCurrentDefender() {
    var currentDefender = "";
    $.ajax({
        method: "GET",
        url: "/defender",
        dataType: "html",
        async: false,

        success: function (data) {
            currentDefender = data;
        }
    });
    return currentDefender;
}

function getCurrentNeighbor() {
    var currentNeighbor = "";
    $.ajax({
        method: "GET",
        url: "/neighbor",
        dataType: "html",
        async: false,

        success: function (data) {
            currentNeighbor = data;
        }
    });
    return currentNeighbor;
}

function disableOkButton() {
    document.getElementById("okayButton").disabled = true;
}