'''
Business: Управление графиком работы сотрудников (ввод часов, получение данных)
Args: event - dict с httpMethod, body (schedule data), queryStringParameters (year, month)
Returns: HTTP response с данными графика или результатом операции
'''

import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            year = params.get('year')
            month = params.get('month')
            
            if not year or not month:
                now = datetime.now()
                year = str(now.year)
                month = str(now.month)
            
            cur.execute("""
                SELECT 
                    s.id, s.user_id, s.work_date, s.hours,
                    u.full_name, u.login
                FROM t_p435659_order_management_sys.schedule s
                JOIN t_p435659_order_management_sys.users u ON s.user_id = u.id
                WHERE EXTRACT(YEAR FROM s.work_date) = %s 
                  AND EXTRACT(MONTH FROM s.work_date) = %s
                ORDER BY s.work_date, u.full_name
            """, (year, month))
            
            records = cur.fetchall()
            
            result = [{
                'id': r[0],
                'user_id': r[1],
                'work_date': r[2].isoformat() if r[2] else None,
                'hours': float(r[3]) if r[3] else 0,
                'full_name': r[4],
                'login': r[5]
            } for r in records]
            
            cur.execute("""
                SELECT id, full_name, login 
                FROM t_p435659_order_management_sys.users 
                WHERE role IN ('worker', 'manager')
                ORDER BY full_name
            """)
            users = cur.fetchall()
            
            users_list = [{'id': u[0], 'full_name': u[1], 'login': u[2]} for u in users]
            
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'schedule': result, 'users': users_list}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            work_date = body_data.get('work_date')
            hours = body_data.get('hours', 0)
            
            cur.execute("""
                INSERT INTO t_p435659_order_management_sys.schedule 
                (user_id, work_date, hours) 
                VALUES (%s, %s, %s)
                ON CONFLICT (user_id, work_date) 
                DO UPDATE SET hours = %s, updated_at = CURRENT_TIMESTAMP
                RETURNING id
            """, (user_id, work_date, hours, hours))
            
            schedule_id = cur.fetchone()[0]
            conn.commit()
            
            cur.close()
            conn.close()
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'id': schedule_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            schedule_id = body_data.get('id')
            hours = body_data.get('hours', 0)
            
            cur.execute("""
                UPDATE t_p435659_order_management_sys.schedule 
                SET hours = %s, updated_at = CURRENT_TIMESTAMP 
                WHERE id = %s
            """, (hours, schedule_id))
            
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
