'''
Business: Аутентификация пользователей с проверкой логина/пароля и получение информации о пользователе
Args: event - dict с httpMethod, body (login, password для POST), queryStringParameters (user_id для GET)
Returns: HTTP response с токеном и данными пользователя или ошибкой
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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            login = body_data.get('login', '')
            password = body_data.get('password', '')
            
            cur.execute(
                "SELECT id, login, role, full_name FROM users WHERE login = %s AND password = %s",
                (login, password)
            )
            user = cur.fetchone()
            
            if user:
                result = {
                    'success': True,
                    'user': {
                        'id': user[0],
                        'login': user[1],
                        'role': user[2],
                        'full_name': user[3]
                    }
                }
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
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': False, 'error': 'Неверный логин или пароль'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            user_id = params.get('user_id')
            
            if user_id:
                cur.execute(
                    "SELECT id, login, role, full_name FROM users WHERE id = %s",
                    (user_id,)
                )
                user = cur.fetchone()
                
                if user:
                    result = {
                        'id': user[0],
                        'login': user[1],
                        'role': user[2],
                        'full_name': user[3]
                    }
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
            
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Пользователь не найден'}),
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
