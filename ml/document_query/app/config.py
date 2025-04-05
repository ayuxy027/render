import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    DEBUG = True
    TEMPLATES_FOLDER = "templates"
    STATIC_FOLDER = "static"
    UPLOAD_FOLDER = "static\\uploads"


    # Database Management
    SQLITE_DB_DIR = os.path.join(basedir, "../db")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(SQLITE_DB_DIR, "filestore.sqlite3")