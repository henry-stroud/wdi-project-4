from lib.secure_route import secure_route
from flask import Blueprint, request, jsonify, g
from models.video import Transaction, TransactionSchema

transaction_schema = TransactionSchema()

api = Blueprint('transactions', __name__)

@api.route('/transactions', methods=['GET'])
def index():
    transactions = Transaction.query.all()
    return transaction_schema.jsonify(transactions, many=True), 200
