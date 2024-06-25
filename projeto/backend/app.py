from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import logging
import os

app = Flask(__name__)
CORS(app)

# Use environment variable for database URI
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI', 'postgresql://user:password@db:5432/tasks_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

logging.basicConfig(level=logging.DEBUG)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80), nullable=False)
    start_time = db.Column(db.Date, nullable=False)
    end_time = db.Column(db.Date, nullable=False)
    planning_time = db.Column(db.Date, nullable=False)

    def __init__(self, title, start_time, end_time, planning_time):
        self.title = title
        self.start_time = start_time
        self.end_time = end_time
        self.planning_time = planning_time

# Create tables if they don't exist
with app.app_context():
    db.create_all()

@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.query.all()
        return jsonify([{
            'id': task.id,
            'title': task.title,
            'start_time': task.start_time.strftime('%Y-%m-%d'),
            'end_time': task.end_time.strftime('%Y-%m-%d'),
            'planning_time': task.planning_time.strftime('%Y-%m-%d')
        } for task in tasks])
    except Exception as e:
        logging.error("Error fetching tasks: %s", e)
        return jsonify({'message': 'Internal Server Error'}), 500

@app.route('/tasks', methods=['POST'])
def add_task():
    try:
        data = request.get_json()
        logging.debug("Received data: %s", data)
        if 'title' not in data or 'start_time' not in data or 'end_time' not in data or 'planning_time' not in data:
            logging.error("Missing data in request: %s", data)
            return jsonify({'message': 'Bad Request: Missing data'}), 400
        
        new_task = Task(
            title=data['title'],
            start_time=datetime.strptime(data['start_time'], '%Y-%m-%d'),
            end_time=datetime.strptime(data['end_time'], '%Y-%m-%d'),
            planning_time=datetime.strptime(data['planning_time'], '%Y-%m-%d')
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({'message': 'Task added successfully'})
    except Exception as e:
        logging.error("Error adding task: %s", e)
        return jsonify({'message': 'Internal Server Error'}), 500

@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    try:
        task = Task.query.get(id)
        if task:
            db.session.delete(task)
            db.session.commit()
            return jsonify({'message': 'Task deleted successfully'})
        return jsonify({'message': 'Task not found'}), 404
    except Exception as e:
        logging.error("Error deleting task: %s", e)
        return jsonify({'message': 'Internal Server Error'}), 500

@app.route('/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    try:
        data = request.get_json()
        logging.debug("Received data for update: %s", data)
        task = Task.query.get(id)
        if not task:
            return jsonify({'message': 'Task not found'}), 404

        if 'title' in data:
            task.title = data['title']
        if 'start_time' in data:
            task.start_time = datetime.strptime(data['start_time'], '%Y-%m-%d')
        if 'end_time' in data:
            task.end_time = datetime.strptime(data['end_time'], '%Y-%m-%d')
        if 'planning_time' in data:
            task.planning_time = datetime.strptime(data['planning_time'], '%Y-%m-%d')

        db.session.commit()
        return jsonify({'message': 'Task updated successfully'}), 200
    except Exception as e:
        logging.error("Error updating task: %s", e)
        return jsonify({'message': 'Internal Server Error'}), 500

# Ensure the route and method are correctly defined
@app.route('/tasks/clear', methods=['DELETE'])
def clear_tasks():
    try:
        num_deleted = db.session.query(Task).delete()
        db.session.commit()
        return jsonify({'message': f'{num_deleted} tasks deleted successfully'}), 200
    except Exception as e:
        logging.error("Error clearing tasks: %s", e)
        return jsonify({'message': 'Internal Server Error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
