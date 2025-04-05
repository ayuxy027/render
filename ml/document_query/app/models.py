from .database import db


class Document(db.Model):
    __tablename__ = "document"
    id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    filepath = db.Column(db.String(225))
    is_indexed = db.Column(db.Integer, default = 0)

