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
                TimeDate DATETIME NOT NULL
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

        # Close the connection
        cursor.close()
        conn.close()

        return jsonify({'message': 'Record added successfully'}), 201
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

if __name__ == '__main__':
    app.run(debug=True)
