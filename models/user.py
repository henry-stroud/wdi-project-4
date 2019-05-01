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
    @password.setter
    def password(self, plaintext):
        self.password_hash = bcrypt.generate_password_hash(plaintext).decode('utf-8')

    def validate_password(self, plaintext):
        return bcrypt.check_password_hash(self.password_hash, plaintext)

    def generate_token(self):
        payload = {
        'exp': datetime.utcnow() + timedelta(days=1),
        'iat': datetime.utcnow(),
        'sub': self.id
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

    password = fields.String(
        required=True,
        validate=[validate.Length(min=2, max=50)]
    )

    password_confirmation = fields.String(required=True)

    owned_videos = fields.Nested('VideoSchema', many=True)

    likes = fields.Nested('VideoSchema', many=True, only=('id', 'name'))

    user_transaction = fields.Nested('TransactionSchema', many=True)

    class Meta:
        model = User
        exclude = ('password_hash',)
