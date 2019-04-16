import os # os is the env of the server you are running on, for eventual production

# db_uri = os.getenv('DATABASE_URL', 'postgres://localhost:5432/videos') -- for EVENTUAL PRODUCTION
secret = os.getenv('SECRET', 'doop') #backup phrase is the second argument
