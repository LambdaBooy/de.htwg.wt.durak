function handCardDragHandler(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    console.log("drag detected! " + ev.target.id);
}

function handleHandCardsOnDrop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var cardValue = parseCardSrcName(document.getElementById(data).src);

    var activePlayer = document.getElementById("activePlayer").innerText.split(" ")[1].trim();
    var attackingPlayer = document.getElementById("attackingPlayer").innerText.split(" ")[1].trim();
    var defendingPlayer = document.getElementById("defendingPlayer").innerText.split(" ")[1].trim();
    var neighbor = document.getElementById("neighbor").innerText.split(" ")[1].trim();

    if (activePlayer === attackingPlayer) {
        $.get("play/" + cardValue, function () {
            if (!ev.target.id.includes("handCard")) {
                ev.target.appendChild(document.getElementById(data));
            } else {
                alert("Bisch du dumm?");
            }
        });
    } else if (activePlayer === defendingPlayer) {
        var otherCardValue = parseCardSrcName(ev.target.src);
        $.get("play/" + cardValue + " " + otherCardValue, function () {
            if (!ev.target.id.includes("handCard")) {
                ev.target.appendChild(document.getElementById(data));
            } else {
                alert("Bisch du dumm?");
            }
        });
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