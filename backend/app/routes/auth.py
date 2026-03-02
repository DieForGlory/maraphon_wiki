from flask import Blueprint, request, jsonify
from ..models import User
from .. import db, bcrypt
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({"error": "Username exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')

    # Первый зарегистрированный пользователь автоматически становится 'архитектором'
    role = 'архитектор' if User.query.count() == 0 else 'бегун'

    new_user = User(username=data.get('username'), password_hash=hashed_pw, role=role)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role}
        )
        return jsonify(access_token=access_token, role=user.role, username=user.username), 200
    return jsonify({"error": "Invalid credentials"}), 401