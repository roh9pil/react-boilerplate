import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import pandas as pd
from dotenv import load_dotenv

# .env 파일 로드 (환경 변수 사용을 위함)
load_dotenv()

# --- Flask 애플리케이션 설정 ---
app = Flask(__name__, static_folder='../frontend', static_url_path='/')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# DB URI는 이제 오직 환경 변수에서만 가져옵니다.
# .env 파일에 DATABASE_URL이 정의되어 있지 않을 경우를 대비한 기본값도 설정
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/your_database_name_default')

# 환경 변수 로드 상태 출력 (디버깅용)
if not app.config['SQLALCHEMY_DATABASE_URI']:
    print("FATAL ERROR: DATABASE_URL 환경 변수가 설정되지 않았습니다. 애플리케이션을 시작할 수 없습니다.")
    exit(1) # 프로그램 종료

print(f"데이터베이스 URI: {app.config['SQLALCHEMY_DATABASE_URI']}")


db = SQLAlchemy(app)

# --- 데이터 모델 정의 ---
class TableDescription(db.Model):
    __tablename__ = 'table_descriptions'
    id = db.Column(db.Integer, primary_key=True)
    table_name = db.Column(db.String(255), unique=True, nullable=False)
    llm_table_description = db.Column(db.Text, nullable=True) # LLM이 생성한 테이블 설명
    user_table_description = db.Column(db.Text, nullable=True) # 사용자가 수정한 테이블 설명
    status = db.Column(db.String(50), default='pending') # pending, in_progress, completed
    last_updated = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

class ColumnDescription(db.Model):
    __tablename__ = 'column_descriptions'
    id = db.Column(db.Integer, primary_key=True)
    table_name = db.Column(db.String(255), nullable=False)
    column_name = db.Column(db.String(255), nullable=False)
    data_type = db.Column(db.String(100), nullable=True)
    llm_column_description = db.Column(db.Text, nullable=True) # LLM이 생성한 컬럼 설명
    user_column_description = db.Column(db.Text, nullable=True) # 사용자가 수정한 컬럼 설명
    status = db.Column(db.String(50), default='pending') # pending, in_progress, completed
    last_updated = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    __table_args__ = (db.UniqueConstraint('table_name', 'column_name', name='_table_column_uc'),)

# --- 데이터베이스 초기화 함수 (데코레이터 제거) ---
def initialize_database(app, db): # app과 db 인스턴스를 인자로 받도록 수정
    print("데이터베이스 초기화를 시작합니다...")
    # 애플리케이션 컨텍스트 내에서 실행
    with app.app_context(): 
        db.create_all() # 테이블 생성
        print("데이터베이스 테이블 생성 완료.")

        # CSV 파일에서 데이터 로드 및 DB에 저장
        csv_file_path = os.path.join(os.path.dirname(__file__), 'db_schema_with_descriptions.csv')
        if os.path.exists(csv_file_path):
            try:
                df = pd.read_csv(csv_file_path)
                print(f"'{csv_file_path}' 파일에서 스키마 데이터 로드 중...")

                # 테이블 설명 로드
                table_rows = df[df['column_name'].isna() | (df['column_name'] == '')]
                for _, row in table_rows.iterrows():
                    table_name = row['table_name']
                    llm_desc = row['description'] if pd.notna(row['description']) else None
                    
                    existing_table = TableDescription.query.filter_by(table_name=table_name).first()
                    if not existing_table:
                        new_table = TableDescription(
                            table_name=table_name,
                            llm_table_description=llm_desc,
                            user_table_description=llm_desc, # 초기값은 LLM 설명으로 설정
                            status='pending'
                        )
                        db.session.add(new_table)
                
                # 컬럼 설명 로드
                column_rows = df[df['column_name'].notna() & (df['column_name'] != '')]
                for _, row in column_rows.iterrows():
                    table_name = row['table_name']
                    column_name = row['column_name']
                    data_type = row['data_type'] if pd.notna(row['data_type']) else None
                    llm_desc = row['description'] if pd.notna(row['description']) else None

                    existing_column = ColumnDescription.query.filter_by(table_name=table_name, column_name=column_name).first()
                    if not existing_column:
                        new_column = ColumnDescription(
                            table_name=table_name,
                            column_name=column_name,
                            data_type=data_type,
                            llm_column_description=llm_desc, # LLM이 생성하지 않은 경우
                            user_column_description=llm_desc, # 초기값은 LLM 설명으로 설정
                            status='pending'
                        )
                        db.session.add(new_column)
                
                db.session.commit()
                print("CSV 데이터 데이터베이스 로드 완료.")
            except Exception as e:
                db.session.rollback()
                print(f"CSV 데이터 로드 중 오류 발생: {e}")
        else:
            print(f"경고: '{csv_file_path}' 파일을 찾을 수 없습니다. 데이터가 로드되지 않았습니다.")
            print("1번, 2번 스크립트를 먼저 실행하여 'db_schema_with_descriptions.csv' 파일을 생성해주세요.")


# --- API 엔드포인트 (이전과 동일) ---

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/tables', methods=['GET'])
def get_tables():
    # 쿼리 파라미터 가져오기
    search_query = request.args.get('search', '').strip()
    status_filter = request.args.get('status', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # 기본 쿼리
    query = TableDescription.query

    # 검색 쿼리가 있으면 필터링 적용
    if search_query:
        # 테이블 이름에 검색어가 포함된 경우 (대소문자 구분 없이)
        query = query.filter(TableDescription.table_name.ilike(f'%{search_query}%'))

    # 상태 필터가 있으면 필터링 적용
    if status_filter and status_filter != 'all': # 'all'은 모든 상태를 의미
        query = query.filter(TableDescription.status == status_filter)

    # 최종 쿼리 실행 및 결과 정렬
    pagination = query.order_by(TableDescription.table_name).paginate(page=page, per_page=per_page, error_out=False)
    tables = pagination.items
    
    table_list = [{
        'table_name': t.table_name,
        'status': t.status,
        'last_updated': t.last_updated.isoformat() if t.last_updated else None
    } for t in tables]
    
    return jsonify({
        'tables': table_list,
        'total_pages': pagination.pages,
        'current_page': pagination.page,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev
    })

@app.route('/tables/<table_name>', methods=['GET'])
def get_table_details(table_name):
    table_info = TableDescription.query.filter_by(table_name=table_name).first_or_404()
    
    # PostgreSQL information_schema에서 실제 컬럼 정보 가져오기 (데이터 타입 포함)
    conn = None
    try:
        conn = db.engine.raw_connection()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = %s
            ORDER BY ordinal_position;
        """, (table_name,))
        
        db_columns_info = {col[0]: col[1] for col in cur.fetchall()}
    except Exception as e:
        print(f"DB에서 실제 컬럼 정보 가져오기 실패: {e}")
        db_columns_info = {}
    finally:
        if conn:
            conn.close()

    # DB에 저장된 컬럼 설명 가져오기
    column_descriptions = ColumnDescription.query.filter_by(table_name=table_name).order_by(ColumnDescription.column_name).all()
    
    columns_data = []
    for col_desc in column_descriptions:
        col_name = col_desc.column_name
        columns_data.append({
            'column_name': col_name,
            'data_type': db_columns_info.get(col_name, col_desc.data_type), # 실제 DB 타입 우선, 없으면 저장된 값
            'llm_description': col_desc.llm_column_description,
            'user_description': col_desc.user_column_description,
            'status': col_desc.status
        })
    
    # 실제 DB의 컬럼 정보와 DB에 없는 컬럼 설명 (오류 상황 등) 처리
    for col_name, data_type in db_columns_info.items():
        if not any(d['column_name'] == col_name for d in columns_data):
             columns_data.append({
                'column_name': col_name,
                'data_type': data_type,
                'llm_description': "No LLM description available.",
                'user_description': "",
                'status': "missing"
            })
    
    return jsonify({
        'table_name': table_info.table_name,
        'llm_table_description': table_info.llm_table_description,
        'user_table_description': table_info.user_table_description,
        'table_status': table_info.status,
        'columns': columns_data
    })

@app.route('/tables/<table_name>/save', methods=['POST'])
def save_table_descriptions(table_name):
    data = request.json
    
    table_info = TableDescription.query.filter_by(table_name=table_name).first_or_404()
    
    table_info.user_table_description = data.get('user_table_description')
    table_info.status = data.get('status', 'in_progress') # 'in_progress' 또는 'completed'
    
    for col_data in data.get('columns', []):
        col_name = col_data['column_name']
        user_col_desc = col_data['user_description']
        col_status = col_data.get('status', 'in_progress')

        column_desc = ColumnDescription.query.filter_by(table_name=table_name, column_name=col_name).first()
        if column_desc:
            column_desc.user_column_description = user_col_desc
            column_desc.status = col_status
        else:
            conn = None
            col_data_type = None
            try:
                conn = db.engine.raw_connection()
                cur = conn.cursor()
                cur.execute(f"""
                    SELECT data_type
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = %s AND column_name = %s;
                """, (table_name, col_name))
                result = cur.fetchone()
                if result:
                    col_data_type = result[0]
            except Exception as e:
                print(f"새 컬럼의 데이터 타입 가져오기 실패: {e}")
            finally:
                if conn:
                    conn.close()

            new_col = ColumnDescription(
                table_name=table_name,
                column_name=col_name,
                data_type=col_data_type,
                llm_column_description="N/A", # LLM이 생성하지 않은 경우
                user_column_description=user_col_desc,
                status=col_status
            )
            db.session.add(new_col)
            
    try:
        db.session.commit()
        return jsonify({'message': 'Descriptions saved successfully!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to save descriptions: {e}'}), 500

@app.route('/apply_comments_to_db', methods=['POST'])
def apply_comments_to_db_api():
    try:
        conn = db.engine.raw_connection()
        cur = conn.cursor()

        tables_to_apply = TableDescription.query.filter_by(status='completed').all()
        for t_desc in tables_to_apply:
            if t_desc.user_table_description and t_desc.user_table_description.strip() != "":
                cur.execute(f"COMMENT ON TABLE {t_desc.table_name} IS %s;", (t_desc.user_table_description,))
                print(f"Applied comment to table: {t_desc.table_name}")

        columns_to_apply = ColumnDescription.query.filter_by(status='completed').all()
        for c_desc in columns_to_apply:
            if c_desc.user_column_description and c_desc.user_column_description.strip() != "":
                cur.execute(f"COMMENT ON COLUMN {c_desc.table_name}.{c_desc.column_name} IS %s;", (c_desc.user_column_description,))
                print(f"Applied comment to column: {c_desc.table_name}.{c_desc.column_name}")
        
        conn.commit()
        return jsonify({'message': 'Comments successfully applied to PostgreSQL database.'})

    except Exception as e:
        conn.rollback()
        return jsonify({'error': f'Failed to apply comments: {e}'}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    # 애플리케이션 시작 전에 데이터베이스 초기화 함수 호출
    # Flask 앱 컨텍스트를 활성화하여 SQLAlchemy 작업이 가능하게 함
    with app.app_context():
        initialize_database(app, db) # app과 db 인스턴스를 전달

    print("Flask 애플리케이션을 시작합니다...")
    app.run(debug=True, host='0.0.0.0', port=8585)
