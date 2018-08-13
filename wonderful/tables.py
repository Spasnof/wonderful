from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
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
    meta_edges = db.execute(
        'SELECT e.from_table_id, e.to_table_id'
        ' FROM edges e'
    )
    return render_template('tables/index.html', tables=meta_tables, edges=meta_edges)


@bp.route('/_add_numbers', methods=['GET', 'POST'])
def add_numbers():

    c = request.args.get('c')
    print(c)
    return jsonify(result=c)

# TODO have javascript pass back to db backend a frontend added db
# TODO add edge support for DB
