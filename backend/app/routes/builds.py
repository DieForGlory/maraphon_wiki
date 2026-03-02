from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Build, Like
from .. import db
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

builds_bp = Blueprint('builds', __name__)


@builds_bp.route('/', methods=['POST'])
@jwt_required()
def create_build():
    data = request.get_json()
    user_id = get_jwt_identity()

    new_build = Build(
        user_id=user_id,
        name=data.get('name'),
        description=data.get('description', ''),
        shell_id=data.get('shell_id'),
        is_private=data.get('is_private', False)
    )
    # Ожидается массив объектов вместо массива строк
    new_build.weapons_config = data.get('weapons_config', [])
    new_build.implant_ids = data.get('implant_ids', [])

    db.session.add(new_build)
    db.session.commit()
    return jsonify({"message": "Build created", "id": new_build.id}), 201


@builds_bp.route('/', methods=['GET'])
def get_public_builds():
    builds = Build.query.filter_by(is_private=False).order_by(Build.created_at.desc()).all()
    result = [{
        "id": b.id,
        "name": b.name,
        "author": b.author.username,
        "shell_id": b.shell_id,
        "likes": len(b.likes),
        "views": b.views
    } for b in builds]
    return jsonify(result), 200


@builds_bp.route('/<int:build_id>', methods=['GET'])
def get_build(build_id):
    build = Build.query.get_or_404(build_id)

    if build.is_private:
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        if current_user_id != build.user_id:
            return jsonify({"error": "Access denied"}), 403

    build.views += 1
    db.session.commit()

    return jsonify({
        "id": build.id,
        "name": build.name,
        "description": build.description,
        "shell_id": build.shell_id,
        "weapons_config": build.weapons_config,
        "implant_ids": build.implant_ids,
        "author": build.author.username,
        "views": build.views,
        "likes": len(build.likes)
    }), 200


@builds_bp.route('/<int:build_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(build_id):
    user_id = get_jwt_identity()
    build = Build.query.get_or_404(build_id)

    existing_like = Like.query.filter_by(user_id=user_id, build_id=build.id).first()
    if existing_like:
        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({"message": "Unliked", "status": False}), 200

    new_like = Like(user_id=user_id, build_id=build.id)
    db.session.add(new_like)
    db.session.commit()
    return jsonify({"message": "Liked", "status": True}), 200