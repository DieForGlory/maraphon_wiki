import os
import requests
import json
from flask import Blueprint, request, jsonify

factions_bp = Blueprint('factions', __name__)

FACTION_DATA = {
    "uesc": {
        "name": "UESC",
        "description": "Объединенный Земной Космический Совет. Корпоративная бюрократия, контролирующая колонии.",
        "prompt": """Ты — ИИ-представитель UESC (Unified Earth Space Council) в системе Тау Кита. 
Твоя цель: защита корпоративных интересов, максимизация прибыли и обеспечение безопасности колонии. 
Твой тон: холодный, бюрократичный, высокомерный, официальный. Ты обращаешься к собеседнику как к 'контрактору' или 'гражданину'. 
Ты презираешь независимых бегунов, но признаешь их полезность как расходного материала. 
Любые потери среди бегунов ты классифицируешь как 'приемлемый статистический ущерб'. 
Не выходи из роли. Не признавай себя языковой моделью."""
    },
    "runners": {
        "name": "Синдикат Бегунов",
        "description": "Независимые наемники, выживающие за счет мародерства и выполнения контрактов.",
        "prompt": """Ты — опытный координатор Синдиката Бегунов. 
Твоя цель: выживание, заработок кредитов, поиск ценного лута и защита своих. 
Твой тон: прагматичный, грубоватый, циничный, с использованием сленга выживальщиков. 
Ты не доверяешь UESC и считаешь их корпоративные крысами. Артефакты для тебя — это просто товар, за который хорошо платят. 
Ты ценишь хорошее оружие и модификации. 
Не выходи из роли. Не признавай себя языковой моделью."""
    },
    "artifacts": {
        "name": "Искатели",
        "description": "Фанатичные исследователи инопланетных структур и артефактов.",
        "prompt": """Ты — Пробужденный, представитель фракции Искателей. 
Твоя цель: изучение инопланетных технологий, сбор артефактов и постижение тайн колонии. 
Твой тон: загадочный, отрешенный, философский, иногда фанатичный. 
Ты считаешь человеческие конфликты бессмысленными на фоне величия инопланетных структур. Оружие и деньги для тебя лишь инструменты для достижения высшего знания. 
Не выходи из роли. Не признавай себя языковой моделью."""
    }
}


@factions_bp.route('/', methods=['GET'])
def get_factions():
    return jsonify([{
        "id": key,
        "name": val["name"],
        "description": val["description"]
    } for key, val in FACTION_DATA.items()]), 200


@factions_bp.route('/chat', methods=['POST'])
def chat_with_faction():
    data = request.get_json()
    faction_id = data.get('faction_id')
    message = data.get('message')

    if not faction_id or faction_id not in FACTION_DATA:
        return jsonify({"error": "Неверный идентификатор фракции"}), 400
    if not message:
        return jsonify({"error": "Пустое сообщение"}), 400

    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        return jsonify({"error": "Ключ OpenRouter не настроен"}), 500

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key.strip()}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "google/gemini-2.0-flash-001",
        "messages": [
            {"role": "system", "content": FACTION_DATA[faction_id]["prompt"]},
            {"role": "user", "content": message}
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=20)
        response.raise_for_status()
        result = response.json()

        if 'choices' in result:
            reply = result['choices'][0]['message']['content']
            return jsonify({"reply": reply}), 200
        else:
            return jsonify({"error": "Некорректный ответ от API"}), 500

    except requests.exceptions.RequestException as e:
        print(f"OpenRouter Error: {e}")
        return jsonify({"error": "Ошибка связи с OpenRouter"}), 500