from flask import Flask, send_from_directory, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import os


db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.instance_path, 'marathon.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'super-secret-terminal-key'

    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False

    app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static/uploads/highlights')
    app.config['THUMBNAIL_FOLDER'] = os.path.join(app.root_path, 'static/uploads/thumbnails')
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['THUMBNAIL_FOLDER'], exist_ok=True)
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)

    with app.app_context():
        db.create_all()

    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "allow_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        }
    })

    @jwt.unauthorized_loader
    def custom_unauthorized_response(_err):
        return jsonify({"msg": _err}), 401

    @jwt.invalid_token_loader
    def custom_invalid_token_response(_err):
        return jsonify({"msg": _err}), 422

    @jwt.expired_token_loader
    def custom_expired_token_response(jwt_header, jwt_payload):
        return jsonify({"msg": "Token has expired"}), 401

    @app.route('/uploads/highlights/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route('/uploads/thumbnails/<filename>')
    def uploaded_thumbnail(filename):
        return send_from_directory(app.config['THUMBNAIL_FOLDER'], filename)

    from .routes.auth import auth_bp
    from .routes.game_data import game_data_bp
    from .routes.builds import builds_bp
    from .routes.community import community_bp
    from .routes.admin import admin_bp
    from .routes.factions import factions_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(game_data_bp, url_prefix='/api/data')
    app.register_blueprint(builds_bp, url_prefix='/api/builds')
    app.register_blueprint(community_bp, url_prefix='/api/community')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(factions_bp, url_prefix='/api/factions')
    return app