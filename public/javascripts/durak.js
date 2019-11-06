function handCardDragHandler(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    console.log("drag detected! " + ev.target.id);
}

function handleHandCardsOnDrop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    if (!ev.target.id.includes("handCard")) {
        ev.target.appendChild(document.getElementById(data));
    } else {
        alert("Bisch du dumm?");
    }
    console.log(data);
    console.log(ev.target.id);
}

function enableDrop(ev) {
    ev.preventDefault();
    console.log("This shit is me!")
}