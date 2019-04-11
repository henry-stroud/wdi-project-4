from flask import Blueprint, jsonify, request
from models.user import User, UserSchema
from lib.helpers import is_unique

api = Blueprint('auth', __name__)
user_schema = UserSchema()

@api.route('/register', methods=['POST'])
def register():

    data = request.get_json()

    user, errors = user_schema.load(data)

    if not is_unique(model=User, key='username', value=data['username']):
        errors['username'] = errors.get('username', []) + ['Username already taken']

    if not is_unique(model=User, key='email', value=data['email']):
        errors['email'] = errors.get('email', []) + ['Email already taken']

    if errors:
        return jsonify(errors), 422

    user.balance = 10000
    user.save()

    return jsonify({'message': 'Registration Successful'}), 201


@api.route('/login', methods=['POST'])
def login():

    data = request.get_json()
    print(data, 'this is the login json')

    user = User.query.filter_by(username=data.get('username')).first()
    # we are finding the user that is trying to login, first one you find should be the exact match

    if not user or not user.validate_password(data.get('password', '')):
        # validate_password is from the user model
        return jsonify({'message': 'Unauthorized'}), 401

    return jsonify({
        'message': 'Welcome back {}!'.format(user.username),
        'token': user.generate_token()
    })

    #.format builds the user name into the {} into the message
