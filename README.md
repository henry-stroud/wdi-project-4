# WDI-Project 4
# General Assembly Project 4 :  A Flask + React App

## Goal: To create a Full-Stack application using React.js and Flask
### Timeframe
1 week

## Technologies used

* JavaScript (ES6)
* HTML5
* CSS
* React.js
* Flask
* Python
* SQLAlchemy
* YouTube Data API v3
* GitHub
* Axios

## My Project - YouBet

![YouBet](https://github.com/henry-stroud/wdi-project-4/blob/master/img/homepage.png?raw=true)

You can find a hosted version here ----> [you-bet.herokuapp.com/](https://you-bet.herokuapp.com/)

### Overview

YouBet is an application that creates a game marketplace from the YouTube video network, adding a price to each YouTube video whilst giving users credits to purchase and sell these videos. The aim of the game is to become top of the user leaderboard, with the highest accumulative portfolio value (videos held and cash credits held).

YouBet was a solo project, and my fourth and final project at General Assembly's Web Development Immersive Course, built in one week. It was my first project using Python as well as Flask.

### Brief
- **Build a full-stack application** building backend and front-end
- **Use Flask** to serve your data from a Postgres database
- **Consume your API with a separate front-end** built with React
- **Be a complete product** which most likely means multiple relationships and CRUD functionality for at least a couple of models
- **Have a visually impressive design**
- **Be deployed online** so it's publicly accessible.

### Process

I initially decided that I would build an app that would emulate a fantasy football type team with music artists. I decided that I would use the Spotify API to gather artist play count and work out a formula that gave each artist a value, as well as assigning credits to the user. However, I quickly found that Spotify's data did not update regularly enough for a reliable game-based app, so I instead converted to YouTube's Data API, concentrating on video view count and data that updated every 5 minutes.

With my plan laid out on Trello and wireframes drawn out, I set about building the back-end for my app, using Python, Flask and SQLAlchemy (the Python SQL toolkit and ORM) with an SQL database.

I focused on two main models, the user and video models. I also needed to create a transaction model that would be referenced on both the user and video models. I then had to create a video model that would align with the data served by YouTube's API so that I could attach my own data to it, such as transactions from users and price.

Below is a code snippet from the video model, including transactions, comments and likes:

```
from app import db, ma
from marshmallow import fields
from .base import BaseModel
from .user import User

likes = db.Table(
    'likes',
    db.Column('video_id', db.Integer, db.ForeignKey('videos.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'))
)

owned_videos = db.Table(
    'owned_videos',
    db.Column('video_id', db.Integer, db.ForeignKey('videos.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'))
)

class Video(db.Model, BaseModel):

    __tablename__ = 'videos'

    title = db.Column(db.String(128), nullable=False)
    published_at = db.Column(db.String(128), nullable=False)
    videoId = db.Column(db.String(40), nullable=False, unique=True)
    view_count = db.Column(db.String(128), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    owned_by_id = db.Column(db.Integer, db.ForeignKey('users.id')) # this is the table of users
    owned_by = db.relationship('User', secondary=owned_videos, backref='owned_videos')
    liked_by = db.relationship('User', secondary=likes, backref='likes')

class Transaction(db.Model, BaseModel):

    __tablename__ = 'transactions'

    buy = db.Column(db.Boolean)
    price_of_deal = db.Column(db.Integer)
    view_count_at_deal = db.Column(db.String(128))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user = db.relationship('User', backref='user_transaction')
    video_id = db.Column(db.Integer, db.ForeignKey('videos.id'))
    videos = db.relationship('Video', backref='video_transaction')

class Comment(db.Model, BaseModel):
    __tablename__ = 'comments'

    content = db.Column(db.Text, nullable=False)
    video_id = db.Column(db.Integer, db.ForeignKey('videos.id'))
    video = db.relationship('Video', backref='comments')

class CommentSchema(ma.ModelSchema):

    class Meta:
        model = Comment

class VideoSchema(ma.ModelSchema):
    comments = fields.Nested('CommentSchema', many=True, only=('content', 'id'))
    owned_by = fields.Nested('UserSchema', many=True, only=('id', 'username'))
    liked_by = fields.Nested('UserSchema', many=True, only=('id', 'username'))
    video_transaction = fields.Nested('TransactionSchema', many=True)
    class Meta:
        model = Video

class TransactionSchema(ma.ModelSchema):
    videos = fields.Nested('VideoSchema', only=('id'))
    user = fields.Nested('UserSchema', only=('id', 'username'))

    class Meta:
        model = Transaction


```


Once I had built out the back-end and tested all the routes in Insomnia, I moved on to displaying the data in the front-end via React, making axios requests to my back-end. I routed all the external API calls through my back-end, and also created a price formula that added a price to each YouTube video depending on when it was published and it's view count, that would then update everytime new data is gathered from YouTube's API. The code snippet for the price formula is below:

```

@api.route('/videos/localvideo/post', methods=['POST'])
def postVideo():
    data = request.get_json()
    published_at = data['data'].get('items')[0].get('snippet')['publishedAt']
    view_count = data['data'].get('items')[0].get('statistics')['viewCount']
    parsed_date = parse(published_at)
    today = datetime.now(timezone.utc)
    date_difference = today - parsed_date
    if date_difference.days:
        my_dict = {
            'published_at' : data['data'].get('items')[0].get('snippet')['publishedAt'],
            'title' : data['data'].get('items')[0].get('snippet')['title'],
            'videoId' : data['data'].get('items')[0].get('id'),
            'view_count' : data['data'].get('items')[0].get('statistics')['viewCount'],
            'price': int(view_count) / date_difference.days / 346
        }
    elif not date_difference.days:
        my_dict = {
            'published_at' : data['data'].get('items')[0].get('snippet')['publishedAt'],
            'title' : data['data'].get('items')[0].get('snippet')['title'],
            'videoId' : data['data'].get('items')[0].get('id'),
            'view_count' : data['data'].get('items')[0].get('statistics')['viewCount'],
            'price': int(view_count) / 0.4 / 346
        }
    vidId = my_dict['videoId']
    video_get = Video.query.filter_by(videoId=vidId).first()

    if video_get:
        video_schema.load(my_dict)
        return video_schema.jsonify(video_get), 200

    video, errors = video_schema.load(my_dict)
    if errors:
        return jsonify(errors), 422
    video.save()
    return video_schema.jsonify(video)


```

I also created a route that would update all the video data that had been accessed on my site by users, i.e all the videos that had been bought or purchased on the site so far.

One of the most complicated routes I created was the transaction route, which worked out whether a user had bought or sold a video, and then added to the list of transactions that user had made.

Below is a snippet of the transaction route:

```
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

```

### Screenshots

![screenshot - Home Page](https://github.com/henry-stroud/wdi-project-4/blob/master/img/homepage.png?raw=true)

![screenshot - Leader Board](https://github.com/henry-stroud/wdi-project-4/blob/master/img/leaderboard.png?raw=true)

![screenshot - Login](https://github.com/henry-stroud/wdi-project-4/blob/master/img/login.png?raw=true)

![screenshot - Portfolio](https://github.com/henry-stroud/wdi-project-4/blob/master/img/portfolionew.png?raw=true)

![screenshot - Transactions](https://github.com/henry-stroud/wdi-project-4/blob/master/img/transactions.png?raw=true)


### Challenges

I ended up having to use a variety of array methods in order to calculate the purchase prices for each user transaction, which resulted in the lengthy function below:

```
calculatePurchasePrices(profileData) {
  if (profileData.owned_videos.length && profileData.user_transaction.length) {
    const transactions = profileData.user_transaction
    const ownedVideos = profileData.owned_videos
    const array = []
    ownedVideos.forEach(function (video) {
      const videoTransactions = []
      transactions.forEach(function (transaction) {
        if (transaction.buy && video.id === transaction.videos) {
          videoTransactions.push([{id: video.id, price_at_deal: transaction.price_of_deal, view_count_at_deal: transaction.view_count_at_deal, date_of_deal: transaction.created_at}])
        }
      })
      const latest = videoTransactions.reduce(function (r, a) {
        return r.date_of_deal > a.date_of_deal ? r : a
      })
      const newArray = {...latest[0]}
      array.push(newArray)
    })
    this.setState({...this.state, ownedVideoData: array})
    const result = this.props.location.state.userProfile.owned_videos.map(ownedVideo => ({...array.find(data => ownedVideo.id === data.id), ...ownedVideo}))
    const userProfile = {...this.props.location.state.userProfile}
    const sortedResult = result.sort(this.compareDeal)
    userProfile.owned_videos = sortedResult
    this.setState({userProfile})
  }
}
```

This was likely due to the way I had structured my back-end, and taught me in the future to further plan my next project, as transaction history was only a feature I added and thought through after completing the wireframing.

Another challenge was the time constraint, as I spent a lot of time figuring out how to use YouTube's API with my own backend.


### Wins

Probably the biggest win was getting the Advanced Python Scheduler (APS) to work, allowing me to make a get request to a specific link on my deployed site in order to stop and start a 2-hourly update of all the data on my site.

```
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

@app.route('/run-tasks')
def run_tasks():
    scheduler.add_job(func=updateData, trigger='interval', seconds=7200, id='1')
    return 'Video Data Updating', 200

@app.route('/stop-tasks')
def stop_tasks():
    scheduler.remove_job('1')
    return 'Video Data Stopped Updating', 200

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

```

Another win was creating the Transactions table and also the Portfolio page, allowing users to click through the leaderboard and check the videos owned by other users on the site.

## Future features

I would have liked to make the app faster, consolidating the back-end, as well as possibly cycling through API keys in order to allow fresher updates for the app data. I would also like to look into using a CSS framework to design the site, perhaps something like Materialize or Material Design, as currently the design is quite sparse.

#Key Takeaways

One of the most valuable learnings from this project was proper planning and idea consolidation. I realised that I moved too quickly into trying to use Spotify's API without properly researching the limitations of the API, and will take this experience with me in future projects, to properly consider all the angles of my approach before diving into the pseudo code.
