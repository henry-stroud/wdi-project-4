from app import app, db

from models.video import Video, Comment, Transaction

from models.user import UserSchema
user_schema = UserSchema()

with app.app_context():
    db.drop_all()
    db.create_all()


    henry, errors = user_schema.load({
        'username': 'henry',
        'email': 'henry@email.com',
        'password': 'password',
        'password_confirmation': 'password',
        'balance': 100000
    })

    if errors:
        raise Exception(errors)

    thierry, errors = user_schema.load({
        'username': 'thierry',
        'email': 'thierry@email.com',
        'password': 'password',
        'password_confirmation': 'password',
        'balance': 10000
    })

    if errors:
        raise Exception(errors)

    db.session.add(henry)
    db.session.add(thierry)

    # ariana_demo = Video(title='Ariana Grande - 7 rings (Lyrics)',
    # published_at='2019-01-18T05:27:55.000Z', videoId='EOApBOHeBHg', view_count='73504125', price=5000, owned_by=[henry], liked_by=[thierry])
    #
    # despacito = Video(title='Despacito',
    # published_at='2017-01-13T05:00:02.000Z', videoId='kJQP7kiw5Fk', view_count='6117367999', price=3000, owned_by=[henry, thierry], liked_by=[thierry])
    #
    # comment1 = Comment(content="I love this video", video=ariana_demo)
    # comment2 = Comment(content="pretty sure this isnt a video", video=despacito)
    #
    # transaction1 = Transaction(buy=True, created_at='2019-01-13T05:00:02.000Z', price_of_deal=1000, view_count_at_deal='20303', user=thierry, videos=ariana_demo)
    # transaction2 = Transaction(buy=True, price_of_deal=3992, created_at='2019-01-13T05:00:02.000Z', view_count_at_deal='232332', user=thierry, videos=despacito)
    # transaction3 = Transaction(buy=True, price_of_deal=3443, created_at='2019-01-13T05:00:02.000Z', view_count_at_deal='433443', user=henry, videos=despacito)
    # transaction4 = Transaction(buy=False, price_of_deal=23333, created_at='2019-01-13T05:00:02.000Z', view_count_at_deal='122344', user=thierry, videos=despacito)

    # db.session.add_all([ariana_demo, despacito, comment1, comment2, transaction1])

    db.session.commit()
