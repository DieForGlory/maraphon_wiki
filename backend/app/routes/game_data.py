import json
import os
from flask import Blueprint, jsonify

game_data_bp = Blueprint('game_data', __name__)


def load_json(filename):
    filepath = os.path.join(os.path.dirname(__file__), '..', 'static_data', filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []


@game_data_bp.route('/<category>', methods=['GET'])
def get_category_data(category):
    allowed_categories = [
        "weapons", "ammo", "backpacks", "consumables", "cores",
        "currency", "equipment", "implants", "keys", "mods",
        "profile-backgrounds", "profile-emblems", "runner-skins",
        "salvage", "sponsored-kits", "valuables", "weapon-charms",
        "weapon-skins", "weapon-stickers", "shells"
    ]

    if category not in allowed_categories:
        return jsonify({"error": "Category not found"}), 404

    return jsonify(load_json(f"{category}.json"))