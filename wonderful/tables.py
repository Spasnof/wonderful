from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify, json, app
)

import marshmallow
from werkzeug.exceptions import abort

from wonderful.auth import login_required
from wonderful.db import get_db


bp = Blueprint('tables', __name__)


def get_meta_tables(db):
    return db.execute(
        'SELECT t.id, object, description, created, owner_id, username'
        ' FROM tables t JOIN user u ON t.owner_id = u.id'
        ' ORDER BY created DESC'
    ).fetchall()

def get_edges(db):
    return db.execute(
        'SELECT e.from_table_id, e.to_table_id, e.description'
        ' FROM edges e'
    ).fetchall()

@bp.route('/')
def index():
    """render main page"""
    db = get_db()
    meta_tables = get_meta_tables(db)
    meta_edges = get_edges(db)
    return render_template('tables/index.html', tables=meta_tables, edges=meta_edges)


@bp.route('/_save_nodes', methods=['GET', 'POST'])
def save_nodes():
    """Pass node data to db backend
    TODO clean up these names to be consistent ie object vs table vs node
    """
    db = get_db()
    mtables = get_meta_tables(db)
    medges = get_edges(db)
    # build dictionary of db tables and edges
    table_labels = {}
    table_edges = {}
    for t in mtables:
        table_labels[t['object']] = t['description']
    for e in medges:
        table_edges[str(e['from_table_id']) + '-' + str(e['to_table_id'])] = ''

    nodes = request.args.get('nodes')
    nodes_json = json.loads(nodes)
    edges = request.args.get('edges')
    edges_json = json.loads(edges)


    # Insert records into db that exist in front end but not in backend.
    for n in nodes_json:
        if n['label'] not in table_labels:
            new_table_obj = (1, n['label'], n['title'])
            db.execute('INSERT INTO tables(owner_id, object, description) VALUES (?,?,?);', new_table_obj)
            db.commit()
    # TODO BUG if you add a node then create edges to/from it they are not saved.

    for e in edges_json:
        edgeid = str(e['from']) + '-' + str(e['to'])
        if edgeid not in table_edges:
            new_edge_obj = (e['from'], e['to'], 'empty description')
            db.execute('INSERT INTO edges(from_table_id, to_table_id, description) VALUES (?,?,?);', new_edge_obj)
            db.commit()

    # TODO get this to actualy yield some helpful results
    return 'you clicked save'


@bp.route('/_update_details', methods=['GET', 'POST'])
def update_details():
    db = get_db()
    node_id = request.args.get('node_id')
    details = request.args.get('details')
    object_type = request.args.get('object_type')
    print(details)
    if object_type == 'table':
        db.execute('UPDATE tables SET description = ? WHERE id = ? ', (details, node_id))
        db.commit()
    return 'stuff happens'


#TODO have the data dictionary only show services you own
#TODO have services you don't own displayed on click, only add one layer at a time.
#TODO have edge/node removal added to the save_nodes() function.
#TODO add unit tests
#TODO remove function calls in html button elements.
