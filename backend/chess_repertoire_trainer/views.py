import json
import sys

from django.http import HttpResponseBadRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from mongoengine import DoesNotExist, ValidationError

from chess_repertoire_trainer.models.repertoire import Repertoire


def merge_line_into_tree(tree, moves):
    """
    traverse the dict and create the move if it does not exist
    """
    current = tree
    for move in moves:
        if move not in current:
            current[move] = {}
        current = current[move]


@csrf_exempt
def submit_data(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        payload = json.loads(request.body)
        print("Payload:", payload, file=sys.stdout)

        line = payload.get("line")
        name = payload.get("name")

        if not line or not name:
            return HttpResponseBadRequest("Missing 'line' or 'name' in payload")

        moves = line.strip().split()

    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON")

    try:
        # create repertoire if not exist
        try:
            rep = Repertoire.objects.get(name=name)
        except DoesNotExist:
            rep = Repertoire(name=name, tree={})

        # merge the line into the repertoire
        merge_line_into_tree(rep.tree, moves)
        rep.save()

    except ValidationError as e:
        return HttpResponseBadRequest(f"Validation error: {str(e)}")

    return JsonResponse({"status": "success", "message": f"Line saved to {name}"})
