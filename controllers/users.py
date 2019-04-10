from lib.secure_route import secure_route #importing the secure route function
from flask import Blueprint, request, jsonify, g
from models.user import UserSchema, User


user_schema = UserSchema()


api = Blueprint('users', __name__)

@api.route('/users', methods=['GET'])
def index():
    users = User.query.all()
    return user_schema.jsonify(users, many=True), 200

@api.route('/users/<int:user_id>', methods=['GET'])
def show(user_id):
    user = User.query.get(user_id)
    return user_schema.jsonify(user), 200

@api.route('/currentuser', methods=['GET'])
@secure_route
def showCurrentUser():
    current_user = g.current_user
    return user_schema.jsonify(current_user), 200

@api.route('/currentuser', methods=['DELETE'])
@secure_route
def delete():
    current_user = g.current_user
    current_user.remove()
    return '', 204
