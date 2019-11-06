function handCardDragHandler(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    console.log("drag detected! " + ev.target.id);
}

function handleHandCardsOnDrop(ev) {
    ev.preventDefault();
    var activePlayer = document.getElementById("activePlayer").innerText.split(" ")[1].trim();
    var attackingPlayer = document.getElementById("attackingPlayer").innerText.split(" ")[1].trim();
    var defendingPlayer = document.getElementById("defendingPlayer").innerText.split(" ")[1].trim();
    var neighbor = document.getElementById("neighbor").innerText.split(" ")[1].trim();
    var draggedCard = ev.dataTransfer.getData("text");
    var cardValue = parseCardSrcName(document.getElementById(draggedCard).src);

    // TODO: Update active player etc.
    //       Enable throwing cards in....
    if (!ev.target.id.includes("handCard")) {
        if (activePlayer === attackingPlayer) {
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

        } else if (activePlayer === defendingPlayer) {
            var otherCard = ev.target;
            if (otherCard.tagName === "IMG") {
                var otherCardValue = parseCardSrcName(otherCard.src);

                $.ajax({
                    method: "GET",
                    url: "play/" + cardValue + " " + otherCardValue,
                    dataType: "html",

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
            }
        }
    }
}

function enableDrop(ev) {
    ev.preventDefault();
}

function parseCardSrcName(srcName) {
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