from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from ..models import User, Lore
from .. import db

admin_bp = Blueprint('admin', __name__)

def check_admin():
    claims = get_jwt()
    if claims.get("role") != 'архитектор':
        return jsonify({"error": "Access denied"}), 403
    return None

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    err = check_admin()
    if err: return err
    users = User.query.all()
    return jsonify([{"id": u.id, "username": u.username, "role": u.role} for u in users]), 200

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
def update_user_role(user_id):
    err = check_admin()
    if err: return err
    data = request.get_json()
    user = User.query.get_or_404(user_id)
    new_role = data.get('role')
    if new_role in ['бегун', 'летописец', 'архитектор']:
        user.role = new_role
        db.session.commit()
        return jsonify({"message": "Role updated"}), 200
    return jsonify({"error": "Invalid role"}), 400