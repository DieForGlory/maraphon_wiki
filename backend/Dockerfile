FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn
COPY . .
# Gunicorn слушает 0.0.0.0 для доступа извне контейнера
CMD ["gunicorn", "--workers", "3", "--bind", "0.0.0.0:5000", "run:app"]