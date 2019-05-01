import os

db_uri = os.getenv('DATABASE_URL', 'postgres://localhost:5432/videos')
secret = os.getenv('SECRET', 'doop')
