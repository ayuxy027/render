from flask import Flask
from app.config import Config
from app.database import db
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.config.from_object(Config)
    db.init_app(app)
    app.app_context().push()

app = create_app()


if __name__ == "__main__":
    from app.controllers import *
    app.run(debug = True)