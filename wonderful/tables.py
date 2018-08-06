from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from wonderful.auth import login_required
from wonderful.db import get_db

bp = Blueprint('tables', __name__)

@bp.route('/')
def index():
    db = get_db()
    meta_tables = db.execute(
        'SELECT t.id, object, description, created, owner_id, username'
        ' FROM tables t JOIN user u ON t.owner_id = u.id'
        ' ORDER BY created DESC'
    ).fetchall()
    return render_template('tables/index.html', tables=meta_tables)

