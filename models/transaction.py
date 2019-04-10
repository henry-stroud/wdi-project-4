from app import db, ma
from marshmallow import fields
from .base import BaseModel

class Transaction(db.Model, BaseModel):

    __tablename__ = 'transactions'

    buy = db.Column(db.Boolean)
    videoId = db.Column(db.String(40), nullable=False)
    price_bought_at = db.Column(db.Integer, nullable=False)
    view_count_at_buy = db.Column(db.String(128), nullable=False)


class TransactionSchema(ma.ModelSchema):
    videos = fields.Nested('VideoSchema', many=True, exclude=('transactions', ))

    class Meta:
        model = Transaction
