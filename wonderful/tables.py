from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify, json, app, session
)

import marshmallow
from werkzeug.exceptions import abort

from wonderful.auth import login_required
from wonderful.db import get_db

bp = Blueprint('tables', __name__)


def get_meta_tables(db, uid):
    return db.execute(
        'SELECT t.id, object, description, created, owner_id, username'
        ' FROM tables t JOIN user u ON t.owner_id = u.id'
        f' WHERE t.visible = 1 and t.owner_id = {uid}'
        ' ORDER BY created DESC'
    ).fetchall()


def get_edges(db):
    return db.execute(
        'SELECT e.id, e.from_table_id, e.to_table_id, e.description'
        ' FROM edges e'
        ' WHERE e.visible = 1'
    ).fetchall()


@bp.route('/')
def index():
    """render main page"""
    db = get_db()
    user_id = session.get('user_id')
    if not (user_id):
        return render_template('base.html')
    print(f'user id : {user_id} is logging in.')
    meta_tables = get_meta_tables(db, user_id)
    meta_edges = get_edges(db)
    return render_template('tables/index.html', tables=meta_tables, edges=meta_edges)


@bp.route('/_add_node', methods=['GET', 'POST'])
def add_node():
    """ method to add new placeholder nodes to the db, need id only for client to work."""
    db = get_db()
    user_id = session.get('user_id')
    # new nodes are created invisibly then the /_update_node call will address the visiblity.
    new_node = (0, user_id, 'new', '')
    db.execute('INSERT INTO tables(visible, owner_id, object, description ) VALUES (?,?,?,?) ;', new_node)
    max_id = db.execute('SELECT MAX(id) as max_id FROM tables;').fetchall()
    db.commit()
    return str(max_id[0][0])


@bp.route('/_update_node', methods=['GET', 'POST'])
def update_node():
    """ method to update or delete nodes"""
    db = get_db()
    node_id = request.args.get('node_id')
    node_label = request.args.get('node_label')
    node_description = request.args.get('node_description')
    node_visible = request.args.get('node_visible')
    # TODO add support to change ownership at some point
    node_update = (node_visible, node_label, node_description, node_id)
    # FIXME the jinja template seems to escape the object or description wierdly adding extra quotes.
    db.execute('UPDATE tables SET visible = ?, object = ?, description = ? WHERE id = ?;', node_update)
    db.commit()
    return 'success'


@bp.route('/_add_edge', methods=['GET', 'POST'])
def add_edge():
    """ method to add edges"""
    db = get_db()
    from_id = request.args.get('from_id')
    to_id = request.args.get('to_id')
    edge_description = request.args.get('edge_description')
    user_id = session.get('user_id')
    # new edges are always created visibly unless we see a reason otherwise.
    new_edge = (user_id, from_id, to_id, edge_description)
    db.execute('INSERT INTO edges(visible, from_table_id, to_table_id, description) VALUES (?,?,?,?);', new_edge)
    max_id = db.execute('SELECT MAX(id) FROM edges;').fetchall()
    db.commit()
    return str(max_id[0][0])


@bp.route('/_update_edge', methods=['GET', 'POST'])
def update_edge():
    """ method to remove or edit edges"""
    db = get_db()
    edge_id = request.args.get('edge_id')
    from_id = request.args.get('from_id')
    to_id = request.args.get('to_id')
    edge_description = request.args.get('edge_description')
    edge_visible = request.args.get('edge_visible')
    update_edge = (edge_visible, from_id, to_id, edge_description, edge_id)
    db.execute('UPDATE edges SET visible = ? , from_table_id = ? , to_table_id = ? , description = ? WHERE id = ? ;',
               update_edge)
    db.commit()
    return 'success'


@bp.route('/_get_child_parent_edges', methods=['GET', 'POST'])
def get_child_parent_edges():
    """method to get edge nodes"""
    db = get_db()
    node_id = request.args.get('node_id')
    connected_node_ids = request.args.get('connected_node_ids')
    # diff the two edges
    sql = '''
    SELECT t.id, t.object, t.description
    FROM tables t
    WHERE t.id in 
    (
    -- parents that that the node id depends on
    SELECT e1.from_table_id
    FROM edges e1 
    WHERE e1.to_table_id = ? 
    
    UNION 
    -- children that depend on the node id
    SELECT e2.to_table_id
    FROm edges e2
    WHERE e2.from_table_id = ?
    );
    '''
    db.row_factory = None
    all_connected_node_ids = db.execute(sql, (node_id, node_id)).fetchall()
    db.commit()
    nodes_json = jsonify(all_connected_node_ids)
    print(request.args.get('connected_node_ids'))
    return nodes_json


# TODO have the data dictionary only show services you own
# TODO have services you don't own displayed on click, only add one layer at a time.
# TODO have services you don't own displayed, perhaps a search?
# TODO add unit tests
# TODO remove function calls in html button elements.
# TODO readd keybinds once you understand how they work.
