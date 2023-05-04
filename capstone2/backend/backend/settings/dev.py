from .common import *

INSTALLED_APPS += [
    "debug_toolbar",
]

MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware",] + MIDDLEWARE

INTERNAL_IPS = ["127.0.0.1"] #debug 툴바를 허용할 ip목록


CORS_ORIGIN_WHITELIST = ["http://localhost:3000"]
CORS_ALLOW_CREDENTIALS = True