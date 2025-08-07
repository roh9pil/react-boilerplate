import os
from app import app, db, initialize_database

if __name__ == "__main__":
    with app.app_context():
        # 데이터베이스 초기화
        print("Starting database initialization via init_db.py...")
        initialize_database(app,db)
        print("Database initialization complete.")
        #