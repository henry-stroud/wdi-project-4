# from app import db, ma
# from marshmallow import fields
# from .base import BaseModel, BaseSchema
# from .user import User
#
# class Transaction(db.Model, BaseModel):
#
#     __tablename__ = 'transactions'
#
#     buy = db.Column(db.Boolean)
#     videoId = db.Column(db.String(40), nullable=False)
#     price_bought_at = db.Column(db.Integer, nullable=False)
#     view_count_at_buy = db.Column(db.String(128), nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
#     user = db.relationship('User', backref='user_transaction')
#     video_id = db.Column(db.Integer, db.ForeignKey('videos.id'))
#     videos = db.relationship('Video', backref='video_transaction')
#
#
# class TransactionSchema(ma.ModelSchema):
#     videos = fields.Nested('VideoSchema', many=True, exclude=('transactions', ))
#     user = fields.Nested('UserSchema', only=('id', 'username'))
#
#
#     class Meta:
#         model = Transaction
