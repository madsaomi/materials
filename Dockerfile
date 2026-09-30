FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    && useradd --create-home --uid 10001 library

COPY app.py gunicorn.conf.py ./
COPY templates/ ./templates/
COPY static/ ./static/
COPY public/ ./public/
COPY knowledge/ ./knowledge/

USER library
CMD ["gunicorn", "--config", "gunicorn.conf.py", "app:app"]
