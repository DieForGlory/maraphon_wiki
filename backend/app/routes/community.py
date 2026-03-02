import os
import cv2
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename
from ..models import db, Highlight, Lore, User

community_bp = Blueprint('community', __name__)

ALLOWED_EXTENSIONS = {'mp4', 'webm', 'mov'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def generate_thumbnail_opencv(video_path, thumbnail_path):
    try:
        vidcap = cv2.VideoCapture(video_path)
        vidcap.set(cv2.CAP_PROP_POS_MSEC, 1000)
        success, image = vidcap.read()
        if success:
            cv2.imwrite(thumbnail_path, image)
            vidcap.release()
            return True
        vidcap.release()
        return False
    except Exception as e:
        print(f"[SYSTEM ERROR] OpenCV Thumbnail fail: {e}")
        return False


@community_bp.route('/highlights', methods=['POST'])
@jwt_required()
def upload_highlight():
    if 'video' not in request.files:
        return jsonify({"error": "Видеофайл не обнаружен"}), 400

    file = request.files['video']
    title = request.form.get('title')
    description = request.form.get('description', '')

    if not title:
        return jsonify({"error": "Необходимо указать заголовок"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        user_id = get_jwt_identity()

        video_filename = f"user_{user_id}_{filename}"
        thumb_filename = f"thumb_{video_filename.rsplit('.', 1)[0]}.jpg"

        video_path = os.path.join(current_app.config['UPLOAD_FOLDER'], video_filename)
        thumb_path = os.path.join(current_app.config['THUMBNAIL_FOLDER'], thumb_filename)

        file.save(video_path)

        thumb_url = None
        if generate_thumbnail_opencv(video_path, thumb_path):
            thumb_url = f"/uploads/thumbnails/{thumb_filename}"

        new_h = Highlight(
            user_id=user_id,
            title=title,
            video_url=f"/uploads/highlights/{video_filename}",
            thumbnail_url=thumb_url,
            description=description
        )
        db.session.add(new_h)
        db.session.commit()

        return jsonify({"message": "Передача завершена успешно"}), 201

    return jsonify({"error": "Неподдерживаемый протокол/формат файла"}), 400


@community_bp.route('/highlights', methods=['GET'])
def get_highlights():
    highlights = Highlight.query.order_by(Highlight.created_at.desc()).all()
    result = []
    for h in highlights:
        author = User.query.get(h.user_id)
        result.append({
            "id": h.id,
            "title": h.title,
            "video_url": h.video_url,
            "thumbnail_url": h.thumbnail_url,
            "description": h.description,
            "author": author.username if author else "Unknown User"
        })
    return jsonify(result)


@community_bp.route('/lore', methods=['GET'])
def get_lore():
    all_lore = Lore.query.order_by(Lore.created_at.desc()).all()
    return jsonify([{
        "id": l.id,
        "category": l.category,
        "title": l.title,
        "content": l.content,
        "image": l.image_url
    } for l in all_lore])


@community_bp.route('/lore', methods=['POST'])
@jwt_required()
def create_lore():
    claims = get_jwt()
    if claims.get("role") not in ['летописец', 'архитектор']:
        return jsonify({"error": "Недостаточно прав доступа"}), 403

    data = request.get_json()
    new_lore = Lore(
        category=data.get('category'),
        title=data.get('title'),
        content=data.get('content'),
        image_url=data.get('image_url')
    )
    db.session.add(new_lore)
    db.session.commit()
    return jsonify({"message": "Запись добавлена в архивы"}), 201


@community_bp.route('/lore/<int:lore_id>', methods=['DELETE'])
@jwt_required()
def delete_lore(lore_id):
    claims = get_jwt()
    if claims.get("role") != 'архитектор':
        return jsonify({"error": "Критическая операция доступна только архитектору"}), 403

    lore_entry = Lore.query.get_or_404(lore_id)
    db.session.delete(lore_entry)
    db.session.commit()
    return jsonify({"message": "Данные стерты"}), 200