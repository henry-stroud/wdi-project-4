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
        'password': 'pass',
        'password_confirmation': 'pass',
        'balance': 200000
    })

    if errors:
        raise Exception(errors)

    thierry, errors = user_schema.load({
        'username': 'thierry',
        'email': 'thierry@email.com',
        'password': 'pass',
        'password_confirmation': 'pass',
        'balance': 150000
    })

    if errors:
        raise Exception(errors)

    emmanuel, errors = user_schema.load({
        'username': 'emmanuel',
        'email': 'emmanuel@email.com',
        'password': 'pass',
        'password_confirmation': 'pass',
        'balance': 500000
    })

    if errors:
        raise Exception(errors)

    jackamo, errors = user_schema.load({
        'username': 'jackamo',
        'email': 'jackamo@email.com',
        'password': 'pass',
        'password_confirmation': 'pass',
        'balance': 60000
    })

    if errors:
        raise Exception(errors)

    timbo, errors = user_schema.load({
        'username': 'timbo',
        'email': 'timbo@email.com',
        'password': 'pass',
        'password_confirmation': 'pass',
        'balance': 30000
    })

    if errors:
        raise Exception(errors)

    roger, errors = user_schema.load({
        'username': 'roger',
        'email': 'roger@email.com',
        'password': 'pass',
        'password_confirmation': 'pass',
        'balance': 59234
    })

    if errors:
        raise Exception(errors)

    billybob, errors = user_schema.load({
        'username': 'billybob',
        'email': 'billybob@email.com',
        'password': 'pass',
        'password_confirmation': 'pass',
        'balance': 33094
    })

    if errors:
        raise Exception(errors)

    db.session.add(henry)
    db.session.add(thierry)
    db.session.add(jackamo)
    db.session.add(emmanuel)
    db.session.add(timbo)
    db.session.add(roger)
    db.session.add(billybob)
    db.session.commit()
