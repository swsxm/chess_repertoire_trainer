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
            is_white_square = (rank_num + i) % 2 != 0
            color_class = "white" if is_white_square else "black"

            square_data = {
                "rank": str(rank_num),
                "file_letter": file_letter,
                "square_color": color_class,
                "piece_color": None,
                "piece_name": None,
                "piece_img": None,
            }

            if img_filename:
                square_data["piece_img"] = f"img/{img_filename}"

                # png filenames have this format: Color-PieceName.png
                filename_split = img_filename.split("-")
                square_data["piece_color"] = filename_split[0].lower()

                # access the name and remove .png
                square_data["piece_name"] = filename_split[1].lower().split(".")[0]

            squares.append(square_data)
        return squares

    # create the ranks
    # black is at the top
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
    print(board_data)
    return render(request, "main/index.html", {"board": board_data})
