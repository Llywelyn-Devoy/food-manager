import json

from app.main import app

schema = app.openapi()
print(json.dumps(schema))
