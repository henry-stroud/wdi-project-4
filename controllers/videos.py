from lib.secure_route import secure_route
from flask import Blueprint, request, jsonify, g
from models.video import Video, VideoSchema, Comment, CommentSchema
import requests, json
from datetime import datetime, date, timezone
from dateutil.parser import parse
import os
# from os.path import join, dirname
# from dotenv import load_dotenv
#
# dotenv_path = join(dirname(__file__), '.env')
# load_dotenv(dotenv_path)

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")


video_schema = VideoSchema()
comment_schema = CommentSchema()

api = Blueprint('videos', __name__)

@api.route('/videos/topvideos', methods=['GET'])
def getTopVids():
    params = {
    'key': YOUTUBE_API_KEY,
    }
    response = requests.get(
      'https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&regionCode=US',
      params=params)
    return response.text, 200, {'Content-Type': 'application/json'}

@api.route('/videos/searchvideo', methods=['GET'])
def searchVideos():
    data = request.get_json()
    params = {
    'key': YOUTUBE_API_KEY,
    'q': data['query']
    }
    response = requests.get(
      'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25',
      params=params)
    return response.text, 200, {'Content-Type': 'application/json'}


@api.route('/videos/localvideo', methods=['POST'])
def getVideoData():
    data = request.get_json()
    print(request)
    params = {
    'key': YOUTUBE_API_KEY,
    'id': data['videoId'],
    }
    response = requests.get(
      'https://www.googleapis.com/youtube/v3/videos?part=statistics%2C%20contentDetails%2C%20snippet',
      params=params)
    return response.text, 200, {'Content-Type': 'application/json'}

@api.route('/videos/localvideo/post', methods=['POST'])
def postVideo():
    data = request.get_json()
    published_at = data['data'].get('items')[0].get('snippet')['publishedAt']
    view_count = data['data'].get('items')[0].get('statistics')['viewCount']
    parsed_date = parse(published_at)
    today = datetime.now(timezone.utc)
    date_difference = today - parsed_date
    print(date_difference, 'datediff')
    print(date_difference.days, 'days')
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
    # video_get = Video.query.get(my_dict['videoId'])
    video_get = Video.query.filter_by(videoId=vidId).first()

    if video_get:
        video_schema.load(my_dict)
        return video_schema.jsonify(video_get), 200

    video, errors = video_schema.load(my_dict)
    if errors:
        return jsonify(errors), 422
    video.save()
    return video_schema.jsonify(video)

@api.route('/videos/localvideos/update', methods=['PUT'])
def updateVideos():
    print(YOUTUBE_API_KEY, 'APIKEY')
    videos = Video.query.all()
    print(videos, 'VIDEOS UPDATING')
    for video in videos:
        params = {
        'key': YOUTUBE_API_KEY,
        'id': video.videoId,
        }
        response = requests.get(
          'https://www.googleapis.com/youtube/v3/videos?part=statistics%2C%20contentDetails%2C%20snippet',
          params=params)
        print(response.json(), 'videodatacomingin')
        if response.json()['items']:
            updated_view_count = response.json().get('items')[0].get('statistics')['viewCount']
            published_date = response.json().get('items')[0].get('snippet')['publishedAt']
            parsed_date = parse(published_date)
            today = datetime.now(timezone.utc)
            date_difference = today - parsed_date
            video.view_count = updated_view_count
            if date_difference.days:
                video.price = int(updated_view_count) / date_difference.days / 346
            elif not date_difference.days:
                video.price = int(updated_view_count) / 0.4 / 346
            video.save()
    return video_schema.jsonify(videos, many=True), 200


@api.route('/videos', methods=['GET'])
def index():
    videos = Video.query.all()
    return video_schema.jsonify(videos, many=True), 200


@api.route('/videos/<int:video_id>', methods=['GET'])
def show(video_id):
    video = Video.query.get(video_id)
    return video_schema.jsonify(video), 200

@api.route('/videos', methods=['POST'])
@secure_route
def create():
    data = request.get_json()
    video, errors = video_schema.load(data)
    print(data, 'BANANAS')
    if errors:
        return jsonify(errors), 422
    video.owned_by = g.current_user
    video.save()
    return video_schema.jsonify(video)

@api.route('/videos/<int:video_id>', methods=['PUT'])
@secure_route
def update(video_id):
    video = Video.query.get(video_id)
    video, errors = video_schema.load(request.get_json(), instance=video, partial=True)
    if errors:
        return jsonify(errors), 422
    print(video.owned_by, 'owned_by')
    print(g.current_user, 'currentuser')
    if video.owned_by != g.current_user:
        return jsonify({'message': 'Unauthorized'}), 401

    video.save()
    return video_schema.jsonify(video)

@api.route('/videos/<int:video_id>', methods=['DELETE'])
@secure_route
def delete(video_id):
    video = Video.query.get(video_id)
    if video.owned_by != g.current_user:
        return jsonify({'message': 'Unauthorized'}), 401
    video.remove()
    return '', 204

@api.route('/videos/<int:video_id>/comments', methods=['POST'])
@secure_route
def comment_create(video_id):
    data = request.get_json()
    video = Video.query.get(video_id)
    comment, errors = comment_schema.load(data)
    if errors:
        return jsonify(errors), 422
    comment.video = video
    comment.save()
    return comment_schema.jsonify(comment)

@api.route('/videos/<int:video_id>/comments/<int:comment_id>', methods=['DELETE'])
@secure_route
def comment_delete(**kwargs):
    comment = Comment.query.get(kwargs['comment_id'])
    comment.remove()
    return '', 204

@api.route('/videos/<int:video_id>/like', methods=['PUT'])
@secure_route
def like(video_id):
    video = Video.query.get(video_id)
    user = g.current_user
    video.liked_by.append(user)
    video.save()
    return video_schema.jsonify(video), 201
