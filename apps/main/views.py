# your_app/views.py
from django.shortcuts import render


def index(request):
    def make_rank(image_filenames, rank_num):
        """
        image_filenames: list of image filenames or None, e.g. ["Black-Rook.png", None, ...]
        rank_num: integer 1–8 for the chess rank
        returns: list of dicts, each representing a square
        """
        squares = []
        for i, img_filename in enumerate(image_filenames):
            file_letter = chr(ord("a") + i)
            # --- Start Color Calculation ---
            is_white_square = (
                rank_num + i
            ) % 2 != 0  # Adjusted logic: a1 is black usually, need parity check
            color_class = "white" if is_white_square else "black"
            coordinate_text_color = "blackText" if is_white_square else "whiteText"
            # --- End Color Calculation ---

            square_data = {
                "alt": None,
                "rank": str(rank_num),
                "file_letter": file_letter,
                "color_class": color_class,  # Added
                "coordinate_text_color": coordinate_text_color,  # Added
                "piece_img": None,  # Use a different key for piece image to avoid confusion with file_letter
            }

            if img_filename:
                square_data["piece_img"] = (
                    f"img/{img_filename}"  # Store path relative to static/
                )
                square_data["alt"] = img_filename.split(".")[0].replace("-", " ")

            squares.append(square_data)
        return squares

    # Rank 8 (index 0) down to Rank 1 (index 7)
    board_data = [
        make_rank(
            [
                "Black-Rook.png",
                "Black-Knight.png",
                "Black-Bishop.png",
                "Black-Queen.png",
                "Black-King.png",
                "Black-Bishop.png",
                "Black-Knight.png",
                "Black-Rook.png",
            ],
            8,
        ),
        make_rank(["Black-Pawn.png"] * 8, 7),
        make_rank([None] * 8, 6),
        make_rank([None] * 8, 5),
        make_rank([None] * 8, 4),
        make_rank([None] * 8, 3),
        make_rank(["White-Pawn.png"] * 8, 2),
        make_rank(
            [
                "White-Rook.png",
                "White-Knight.png",
                "White-Bishop.png",
                "White-Queen.png",
                "White-King.png",
                "White-Bishop.png",
                "White-Knight.png",
                "White-Rook.png",
            ],
            1,
        ),
    ]

    # The view passes rank 8 first, rank 1 last.
    # Depending on how you want to render (top-down or bottom-up),
    # you might reverse board_data here if needed, but the loop structure
    # in the template seems fine assuming board_data[0] is rank 8.

    return render(request, "main/index.html", {"board": board_data})
