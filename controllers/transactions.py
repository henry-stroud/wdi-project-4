from lib.secure_route import secure_route
from flask import Blueprint, request, jsonify, g
from models.video import Transaction, TransactionSchema, Video, VideoSchema

transaction_schema = TransactionSchema()
video_schema = VideoSchema()

api = Blueprint('transactions', __name__)

@api.route('/transactions', methods=['GET'])
def index():
    transactions = Transaction.query.all()
    return transaction_schema.jsonify(transactions, many=True), 200

@api.route('/transactions', methods=['POST'])
@secure_route
def create():
    data = request.get_json()
    current_user = g.current_user
    print(current_user.balance, 'Hello')
    vidId = data['videoId']
    video_get = Video.query.filter_by(videoId=vidId).first()
    print(vidId, 'VIDEOID')
    print(video_get.price, 'VIDEO PRICE')
    print(video_get.view_count, 'VIDEO VIEW COUNT')
    print(data['buy'], 'BUY BOOLEAN')
    print(current_user.owned_videos, 'DIS DE CURRENT USER')
    if data['buy'] == 'True':
        if video_get not in current_user.owned_videos:
            if current_user.balance > video_get.price:
                transaction, errors = transaction_schema.load(data)
                if errors:
                    return jsonify(errors), 422
                video_get.owned_by.append(current_user)
                transaction.user = current_user
                transaction.videos = video_get
                transaction.view_count_at_deal = video_get.view_count
                transaction.price_of_deal = video_get.price
                new_balance = current_user.balance = current_user.balance - video_get.price
                print(new_balance, 'NEW USER BALANCE')
                transaction.save()
                video_get.save()
                return transaction_schema.jsonify(transaction), 200
        return jsonify({'message': 'cant process transaction, balance not high enough or video already purchased'}), 401
    print('THIS IS A SELL')
    if video_get in current_user.owned_videos:
        transaction, errors = transaction_schema.load(data)
        if errors:
            return jsonify(errors), 422
        video_get.owned_by.remove(current_user)
        transaction.user = current_user
        transaction.videos = video_get
        transaction.view_count_at_deal = video_get.view_count
        transaction.price_of_deal = video_get.price
        current_user.balance = current_user.balance + video_get.price
        transaction.save()
        video_get.save()
        return transaction_schema.jsonify(transaction), 200
    return jsonify({'message': 'cant process transaction, user does not own this video'}), 401
