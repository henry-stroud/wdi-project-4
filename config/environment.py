import os # os is the env of the server you are running on, for eventual production

secret = os.getenv('SECRET', 'doop') #backup phrase is the second argument
