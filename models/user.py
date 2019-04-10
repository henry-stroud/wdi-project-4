from datetime import datetime, timedelta
from config.environment import secret
from app import db, ma, bcrypt
import jwt
from sqlalchemy.ext.hybrid import hybrid_property
from marshmallow import fields, validates_schema, ValidationError, validate
#fields allows you to specify new fields in the schema
from .base import BaseModel, BaseSchema

class User(db.Model, BaseModel):

    __tablename__ = 'users'

    username = db.Column(db.String(28), nullable=False, unique=True)
    email = db.Column(db.String(128), nullable=False, unique=True)
    balance = db.Column(db.Integer)
    password_hash = db.Column(db.String(128))

    @hybrid_property
    def password(self):
        pass
            # self is the equivalent of this
            # hybrid is the equivalent of a virtual, on the model virtually
            # making a virtual field called password.
    @password.setter
    def password(self, plaintext):
        self.password_hash = bcrypt.generate_password_hash(plaintext).decode('utf-8')
        # hashing the password

    def validate_password(self, plaintext):
        return bcrypt.check_password_hash(self.password_hash, plaintext)

    def generate_token(self):
        #self is like 'this' in javascript
        payload = {
        'exp': datetime.utcnow() + timedelta(days=1),
        #timedelta works out 1 day added on and token will expire after that
        'iat': datetime.utcnow(), # this is the time the token was issued at
        'sub': self.id #this is the user's ID
        }

        token = jwt.encode(
            payload,
            secret,
            'HS256'
        ).decode('utf-8')

        return token

class UserSchema(ma.ModelSchema, BaseSchema):

    @validates_schema
    #pylint: disable=R0201
    def check_passwords_match(self, data):
        if data.get('password') != data.get('password_confirmation'):
            raise ValidationError(
            'Passwords do not match',
            'password_confirmation'
            )
            #if passwords dont match raise an error

    password = fields.String(
        required=True,
        validate=[validate.Length(min=8, max=50)]
    )
    # this is defining what i want in my json object before i store it in sql

    password_confirmation = fields.String(required=True)

    owned_videos = fields.Nested('VideoSchema', many=True)
    #this is the same name as the backref in planet model, 'created_planets'

    likes = fields.Nested('VideoSchema', many=True, only=('id', 'name'))

    class Meta:
        model = User
        exclude = ('password_hash',)
