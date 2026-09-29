"""Production settings for Railway (or any Linux host exposing PORT)."""
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
workers = 1
threads = 2
# The initial Markdown/Pygments scan can exceed Gunicorn's default 30 seconds.
timeout = 120
accesslog = '-'
errorlog = '-'
