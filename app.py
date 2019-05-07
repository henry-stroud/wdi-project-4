import requests
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
from config.environment import db_uri
from flask_apscheduler import APScheduler

app = Flask(__name__, static_folder='dist')

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)
bcrypt = Bcrypt(app)

@app.route('/run-tasks')
def run_tasks():
    scheduler.add_job(func=updateData, trigger='interval', seconds=7200, id='1')
    return 'Video Data Updating', 200

@app.route('/stop-tasks')
def stop_tasks():
    scheduler.remove_job('1')
    return 'Video Data Stopped Updating', 200

# pylint: disable=C0413, W0611, C0412
from config import routes

def updateData():
    print('ran-task')
    if app.config['ENV'] == 'development':
        response = requests.put(
          'http://localhost:5000/api/videos/localvideos/update')
        return response.text, 200, {'Content-Type': 'application/json'}
    else:
        response = requests.put(
          'https://you-bet.herokuapp.com/api/videos/localvideos/update')
        return response.text, 200, {'Content-Type': 'application/json'}
