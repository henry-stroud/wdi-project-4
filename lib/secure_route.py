from functools import wraps
import jwt
from flask import request, jsonify, g
from models.user import User
from config.environment import secret

def secure_route(func):
    @wraps(func) #wraps lets it know its own name from debugging purposes
    def wrapper(*args, **kwargs):
        if 'Authorization' not in request.headers: # request headers, where you need 'Authoriztion'
            return jsonify({'message': 'Unauthorized'}), 401
        token = request.headers.get('Authorization').replace('Bearer ', '')
        #try asks it to do something but wont break if it cant
        try:
            payload = jwt.decode(token, secret)
        # if something goes wrong
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'})
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid Token'})

        user = User.query.get(payload.get('sub')) #find the user and attribute it with a token

        if not user:
            return jsonify({'message': 'Unauthorized'}), 401

        g.current_user = user #this assigns a global variable to the app,
        # g is the global python object - and we are adding hte current user to that

        return func(*args, **kwargs)
    return wrapper
