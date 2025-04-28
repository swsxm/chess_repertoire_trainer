from django.shortcuts import render


def index(request):
    context = {
        "title": "Chess Repertoire Trainer",
    }
    return render(request, "main/index.html", context)
