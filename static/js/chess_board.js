// 1) On DOM ready
document.addEventListener("DOMContentLoaded", () => {
    // Find all pieces
    console.log("test");
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

// Called when you start dragging a piece
function onDragStart(evt) {
    console.log("test");
    draggedPiece = evt.target;
    // Optionally: set dataTransfer if you want to pass info
    evt.dataTransfer.setData("text/plain", "");
}

// Allow dropping by preventing default
function onDragOver(evt) {
    evt.preventDefault();
}

// Called when the piece is dropped onto a square
function onDrop(evt) {
    evt.preventDefault();
    const square = evt.currentTarget; // <div class="square …">
    if (draggedPiece) {
        // Move the <img> into the new square’s .piece container (or create one)
        let pieceContainer = square.querySelector(".piece");
        if (!pieceContainer) {
            pieceContainer = document.createElement("div");
            pieceContainer.classList.add("piece");
            square.appendChild(pieceContainer);
        } else {
            // clear out any existing piece if you like:
            pieceContainer.innerHTML = "";
        }
        pieceContainer.appendChild(draggedPiece);
        draggedPiece = null;
        // You can now fire an AJAX call to notify Django of the move
    }
}
