from flask import Flask, request, jsonify
from flask_cors import CORS  # Import Flask-CORS
import mysql.connector
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database connection configuration
db_config = {
    'user': 'root',
    'password': 'root',
    'host': 'localhost',
    'database': 'vendoDb'
}

# Connect to the database and create the table if it doesn't exist
def create_table():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS WastePrize (
                id INT AUTO_INCREMENT PRIMARY KEY,
                Waste VARCHAR(255) NOT NULL,
                Prize VARCHAR(255) NOT NULL,
                Status VARCHAR(50) NOT NULL,
                TimeDate DATETIME NOT NULL,
                SensorResponse VARCHAR(255) DEFAULT NULL
            );
        ''')
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Error: {err}")

# Initialize the table
create_table()

# API endpoint to insert waste and prize into the table
@app.route('/add_waste_prize', methods=['POST'])
def add_waste_prize():
    try:
        # Parse the JSON request
        data = request.json
        waste = data.get('Waste')
        prize = data.get('Prize')
        status = 'Pending'  # Default status
        time_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Validate input
        if not waste or not prize:
            return jsonify({'error': 'Waste and Prize fields are required'}), 400

        # Insert into the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO WastePrize (Waste, Prize, Status, TimeDate) 
            VALUES (%s, %s, %s, %s)
        ''', (waste, prize, status, time_date))
        conn.commit()

        # Get the inserted record ID
        record_id = cursor.lastrowid

        # Close the connection
        cursor.close()
        conn.close()

        return jsonify({'message': 'Record added successfully', 'id': record_id}), 201
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

# API endpoint to check sensor response
@app.route('/check_sensor_response/<int:record_id>', methods=['GET'])
def check_sensor_response(record_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT SensorResponse FROM WastePrize WHERE id = %s', (record_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if result:
            return jsonify(result), 200
        else:
            return jsonify({'error': 'Record not found'}), 404
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

# API endpoint to update status
@app.route('/update_status/<int:record_id>', methods=['PUT'])
def update_status(record_id):
    try:
        data = request.json
        new_status = data.get('Status')

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute('UPDATE WastePrize SET Status = %s WHERE id = %s', (new_status, record_id))
        conn.commit()
        cursor.close()
        conn.close()

        if cursor.rowcount > 0:
            return jsonify({'message': 'Status updated successfully'}), 200
        else:
            return jsonify({'error': 'Record not found'}), 404
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

# API endpoint to redeem a prize
@app.route('/redeem_prize/<int:record_id>', methods=['POST'])
def redeem_prize(record_id):
    try:
        # Parse the JSON request
        data = request.json
        prize = data.get('Prize')

        # Validate input
        if not prize:
            return jsonify({'error': 'Prize field is required'}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Check if the record exists and is eligible for redemption
        cursor.execute('SELECT * FROM WastePrize WHERE id = %s AND Status = "Pending"', (record_id,))
        record = cursor.fetchone()

        if not record:
            return jsonify({'error': 'Record not found or already redeemed'}), 404

        # Update the record status to "Redeemed"
        cursor.execute('''
            UPDATE WastePrize 
            SET Status = "Redeemed"
            WHERE id = %s
        ''', (record_id,))
        conn.commit()

        # Close the connection
        cursor.close()
        conn.close()

        return jsonify({'message': f'Prize "{prize}" redeemed successfully'}), 200
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500


if __name__ == '__main__':
    app.run(debug=True)
