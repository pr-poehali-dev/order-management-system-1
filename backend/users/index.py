'''
Business: Управление пользователями (создание, удаление, получение списка)
Args: event - dict с httpMethod, body (user data для POST/DELETE), queryStringParameters
Returns: HTTP response со списком пользователей или результатом операции
'''

import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
            cur.execute(
                "SELECT id, login, role, full_name, created_at FROM users ORDER BY created_at DESC"
            )
            users = cur.fetchall()
            
            result = [{
                'id': u[0],
                'login': u[1],
                'role': u[2],
                'full_name': u[3],
                'created_at': u[4].isoformat() if u[4] else None
            } for u in users]
            
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            login = body_data.get('login')
            password = body_data.get('password')
            role = body_data.get('role')
            full_name = body_data.get('full_name')
            
            cur.execute(
                "INSERT INTO users (login, password, role, full_name) VALUES (%s, %s, %s, %s) RETURNING id",
                (login, password, role, full_name)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            
            cur.close()
            conn.close()
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'id': user_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('id')
            
            cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
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
