import threading, requests
from flask import Flask # pipenv install flask
from flask_sqlalchemy import SQLAlchemy # pipenv install flask-alchemy psycopg2-binary
from flask_marshmallow import Marshmallow # pipenv install flask-marshmallow marshmallow-sqlalchemy
from flask_bcrypt import Bcrypt
from config.environment import db_uri
from flask_apscheduler import APScheduler
import time
from datetime import time

# created .env file to set environment to development

# the name part tells Flask this is the main file of the app

app = Flask(__name__, static_folder='dist') #start out flask app, equiv of const app = express()
# at this point we made a route for '/' a function called hom that just returned the text hello world and a status of 200
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

# app = Flask(__name__, static_folder='dist') -- FOR PRODUCTION

# connecting up the db, equiv of mongoose.connect(DB_URI)
#make sure you create the db in terminal first with 'createdb my_db_name_here, i.e createdb planets, add this name after localhost'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres://localhost:5432/videos'
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False #speeds up sql alchemy

# we connect to the sqlalchemy database above, using app with this app .

# connecting sql alchemy and marshmallow to our app and making them available as db and ma
db = SQLAlchemy(app)
ma = Marshmallow(app)
bcrypt = Bcrypt(app)

@app.route('/run-tasks')
def run_tasks():
    app.apscheduler.add_job(func=updateData, trigger='interval', seconds=300, id='1')
    return 'Scheduled updating task long running tasks.', 200

# app.apscheduler.add_job(job_function, 'interval', hours=2)

#we disable the pylint rule below as we need to import here, and pylint will throw an error.
# pylint: disable=C0413, W0611
from config import routes

def updateData():
    print('ran-task')
    response = requests.put(
      'http://localhost:5000/api/videos/localvideos/update')
    return response.text, 200, {'Content-Type': 'application/json'}
