import json
from datetime import datetime
from . import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='бегун', nullable=False) # 'бегун', 'летописец', 'архитектор'
    builds = db.relationship('Build', backref='author', lazy=True)
    likes = db.relationship('Like', backref='user', lazy=True)

class Build(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    shell_id = db.Column(db.String(50), nullable=False)

    _weapons_config = db.Column('weapons_config', db.Text, default='[]')
    _implant_ids = db.Column('implant_ids', db.Text, default='[]')

    is_private = db.Column(db.Boolean, default=False)
    views = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.relationship('Like', backref='build', lazy=True)

    @property
    def weapons_config(self):
        return json.loads(self._weapons_config)

    @weapons_config.setter
    def weapons_config(self, value):
        self._weapons_config = json.dumps(value)

    @property
    def implant_ids(self):
        return json.loads(self._implant_ids)

    @implant_ids.setter
    def implant_ids(self, value):
        self._implant_ids = json.dumps(value)

class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    build_id = db.Column(db.Integer, db.ForeignKey('build.id'), nullable=False)

class Lore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Highlight(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    video_url = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)