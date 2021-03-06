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
    vidId = data['videoId']
    video_get = Video.query.filter_by(videoId=vidId).first()
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
                transaction.save()
                video_get.save()
                return transaction_schema.jsonify(transaction), 200
        if video_get in current_user.owned_videos:
            return jsonify({'message': 'Cannot process transaction, you already own this video'}), 401
        return jsonify({'message': 'Cannot process transaction, balance not high enough'}), 401
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
    return jsonify({'message': 'Cannot process transaction, you do not own this video'}), 401
