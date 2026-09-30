"""Production settings for Railway (or any Linux host exposing PORT)."""
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
workers = 1
threads = 2
# The initial Markdown/Pygments scan can exceed Gunicorn's default 30 seconds.
timeout = 300
accesslog = '-'
errorlog = '-'


def post_worker_init(worker):
    """Build the library before accepting traffic or readiness checks."""
    from app import get_all_docs
    docs = get_all_docs()
    worker.log.info('Library ready: %s documents', len(docs))
