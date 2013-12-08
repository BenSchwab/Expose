import sqlite3
from flask import Flask, jsonify, g, redirect, request, url_for, render_template
import json
app = Flask(__name__)

@app.before_request
def before_request():
    g.db = sqlite3.connect('./sample.db')

@app.teardown_request
def teardown_request(exception):
  if hasattr(g, 'db'):
    g.db.close()

@app.route('/')
def index():
  return render_template('demo.html')

@app.route('/query_row/<query>')
def query_row(query):
  # error = None
  cursor = g.db.execute(query)

  # # get number of items from the javascript request
  # nitems = request.args.get('nitems', 2)
  # # query database
  # cursor = g.db.execute('select * from items limit ?', (nitems,))

  # return json
  columns = [column[0] for column in cursor.description]
  results = []
  rows = cursor.fetchall()
  for i, row in enumerate(rows,start=0):
    # rList = []
    myDict = ( dict( (col,row[j]) for j, col in enumerate(columns,start=0)))

    results.append((i,myDict))
  print(dict(results))
  return jsonify(dict(results))
  return jsonify(dict(('item%d' % i, item) for i, item in enumerate(rows,start=1)))

@app.route('/query_col/<query>')
def query_col(query):
  # error = None
  cursor = g.db.execute(query)

  # return json
  columns = [column[0] for column in cursor.description]
  results = []
  rows = cursor.fetchall()
  for i, col in enumerate(columns,start=0):
    cList = []
    for j, row in enumerate(rows,start=0):
      cList.append(row[i])
    results.append((col,cList))

  return jsonify(dict(results))

@app.route('/query_row', methods=['POST', 'GET'])
def query_row_post():
  # error = None
  if request.method == 'POST':
    cursor = g.db.execute(request['query'])

    # return json
    columns = [column[0] for column in cursor.description]
    results = []
    rows = cursor.fetchall()
    for i, row in enumerate(rows,start=0):
      # rList = []
      myDict = ( dict( (col,row[j]) for j, col in enumerate(columns,start=0)))

      results.append((i,myDict))
    print(dict(results))

    return jsonify(dict(results))
  else:
    return "error"

@app.route('/query_col', methods=['POST', 'GET'])
def query_col_post():
  if request.method == 'POST':
    cursor = g.db.execute(request['query'])

    # return json
    columns = [column[0] for column in cursor.description]
    results = []
    rows = cursor.fetchall()
    for i, col in enumerate(columns,start=0):
      cList = []
      for j, row in enumerate(rows,start=0):
        cList.append(row[i])
      results.append((col,cList))

    return jsonify(dict(results))

  else:
    return "error"

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5001) # http://localhost:5001/