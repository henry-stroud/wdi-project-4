from app import db, ma
from marshmallow import fields
from .base import BaseModel
from .user import User

likes = db.Table(
    'likes',
    db.Column('video_id', db.Integer, db.ForeignKey('videos.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'))
)

owned_videos = db.Table(
    'owned_videos',
    db.Column('video_id', db.Integer, db.ForeignKey('videos.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'))
)

class Video(db.Model, BaseModel):

    __tablename__ = 'videos'

    title = db.Column(db.String(128), nullable=False)
    published_at = db.Column(db.String(128), nullable=False)
    videoId = db.Column(db.String(40), nullable=False, unique=True)
    view_count = db.Column(db.String(128), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    owned_by_id = db.Column(db.Integer, db.ForeignKey('users.id')) # this is the table of users
    owned_by = db.relationship('User', secondary=owned_videos, backref='owned_videos')
    liked_by = db.relationship('User', secondary=likes, backref='likes')

class Transaction(db.Model, BaseModel):

    __tablename__ = 'transactions'

    buy = db.Column(db.Boolean)
    price_of_deal = db.Column(db.Integer)
    view_count_at_deal = db.Column(db.String(128))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user = db.relationship('User', backref='user_transaction')
    video_id = db.Column(db.Integer, db.ForeignKey('videos.id'))
    videos = db.relationship('Video', backref='video_transaction')

class Comment(db.Model, BaseModel):
    __tablename__ = 'comments'

    content = db.Column(db.Text, nullable=False)
    video_id = db.Column(db.Integer, db.ForeignKey('videos.id'))
    video = db.relationship('Video', backref='comments')

class CommentSchema(ma.ModelSchema):

    class Meta:
        model = Comment

class VideoSchema(ma.ModelSchema):
    comments = fields.Nested('CommentSchema', many=True, only=('content', 'id'))
    owned_by = fields.Nested('UserSchema', many=True, only=('id', 'username'))
    liked_by = fields.Nested('UserSchema', many=True, only=('id', 'username'))
    video_transaction = fields.Nested('TransactionSchema', many=True)
    class Meta:
        model = Video

class TransactionSchema(ma.ModelSchema):
    videos = fields.Nested('VideoSchema', only=('id'))
    user = fields.Nested('UserSchema', only=('id', 'username'))

    class Meta:
        model = Transaction
