from app import db, ma #imported db(sqlalchemy) and ma (marshmallow)
from marshmallow import fields
from .base import BaseModel #we use .base as we are in the same folder, models which base.py is in
from .user import User
from models.transaction import Transaction, TransactionSchema

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

# importing db from the app.py file

# class in python creates objects not dictionaries

# Model is coming from SQLAlchemy

#making the join table now, made up of two foreign Keys,
# the two tables where it gets them from is the primary key of those tables


transactions_videos = db.Table('transactions_videos',
    db.Column('transaction_id', db.Integer, db.ForeignKey('transactions.id'), primary_key=True),
    db.Column('video_id', db.Integer, db.ForeignKey('videos.id'), primary_key=True)
)

# created the basic model for our resource
class Video(db.Model, BaseModel):

    #specify the tablename, if you dont it will be the same as the model
    __tablename__ = 'videos'

    title = db.Column(db.String(128), nullable=False)
    published_at = db.Column(db.String(128), nullable=False)
    videoId = db.Column(db.String(40), nullable=False, unique=True)
    view_count = db.Column(db.String(128), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    transactions = db.relationship('Transaction', secondary=transactions_videos, backref='videos')
    # we are telling it it has a relationship with planets,
    # because its many to many, before you try and join yourself to that model -
    #find your relationship through this- the backref is for the planets. backref is a table name.
    owned_by_id = db.Column(db.Integer, db.ForeignKey('users.id')) # this is the table of users
    owned_by = db.relationship('User', secondary=owned_videos, backref='owned_videos')
    liked_by = db.relationship('User', secondary=likes, backref='likes')
    #backref is created on User Model
    #secondary is the jointable it must use to work out the relationship
    #backref allows us to make the relationship the otherway without making the relationship again

# schema made using marshmallow to convert our sql object to json(serializing)

class Comment(db.Model, BaseModel):
    __tablename__ = 'comments'

    content = db.Column(db.Text, nullable=False)
    video_id = db.Column(db.Integer, db.ForeignKey('videos.id'))
    video = db.relationship('Video', backref='comments')
    # backref will make a comments field on the planets

class CommentSchema(ma.ModelSchema):

    class Meta:
        model = Comment

class VideoSchema(ma.ModelSchema):
    # tell us which fields we'd like converted to json
    #this below means we want them all
    # Meta is the whole planet model
    comments = fields.Nested('CommentSchema', many=True, only=('content', 'id'))
    transactions = fields.Nested('TransactionSchema', many=True)
    owned_by = fields.Nested('UserSchema', many=True, only=('id', 'username'))
    # this only gets the user id and the username
    liked_by = fields.Nested('UserSchema', many=True, only=('id', 'username'))
    class Meta:
        model = Video

        # trailing comma is important as its a tuple with one item in it, needs a trailing comma

# after this we created seeds in the seeds.py file
