// DOM ready
document.addEventListener("DOMContentLoaded", () => {
    // Find all pieces
    document.querySelectorAll(".piece img").forEach((img) => {
        img.setAttribute("draggable", "true");
        img.addEventListener("dragstart", onDragStart);
    });

    // Find all squares
    document.querySelectorAll(".square").forEach((square) => {
        square.addEventListener("dragover", onDragOver);
        square.addEventListener("drop", onDrop);
    });
});

let draggedPiece = null;

function onDragStart(evt) {
    console.log("test");
    draggedPiece = evt.target;
    evt.dataTransfer.setData("text/plain", "");
}

function onDragOver(evt) {
    evt.preventDefault();
}

function onDrop(evt) {
    evt.preventDefault();
    const square = evt.currentTarget;
    if (draggedPiece) {
        let pieceContainer = square.querySelector(".piece");
        if (!pieceContainer) {
            pieceContainer = document.createElement("div");
            pieceContainer.classList.add("piece");
            square.appendChild(pieceContainer);
        } else {
            pieceContainer.innerHTML = "";
        }
        pieceContainer.appendChild(draggedPiece);
        draggedPiece = null;
    }
}
