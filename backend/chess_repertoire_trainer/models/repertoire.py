from mongoengine import DictField, Document, StringField


class Repertoire(Document):
    name = StringField(required=True)
    tree = DictField()
