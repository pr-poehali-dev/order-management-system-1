'''
Business: Управление заявками (создание, обновление статуса, получение списка)
Args: event - dict с httpMethod, body (order data), queryStringParameters (status filter)
Returns: HTTP response со списком заявок или результатом операции
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
            params = event.get('queryStringParameters', {}) or {}
            status_filter = params.get('status')
            
            if status_filter:
                cur.execute(
                    "SELECT id, order_number, material, quantity, size, color, status, completed_quantity, created_by, created_at, updated_at FROM orders WHERE status = %s ORDER BY created_at DESC",
                    (status_filter,)
                )
            else:
                cur.execute(
                    "SELECT id, order_number, material, quantity, size, color, status, completed_quantity, created_by, created_at, updated_at FROM orders ORDER BY created_at DESC"
                )
            
            orders = cur.fetchall()
            
            result = [{
                'id': o[0],
                'order_number': o[1],
                'material': o[2],
                'quantity': o[3],
                'size': o[4],
                'color': o[5],
                'status': o[6],
                'completed_quantity': o[7],
                'created_by': o[8],
                'created_at': o[9].isoformat() if o[9] else None,
                'updated_at': o[10].isoformat() if o[10] else None
            } for o in orders]
            
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
            order_number = body_data.get('order_number')
            material = body_data.get('material')
            quantity = body_data.get('quantity')
            size = body_data.get('size', '')
            color = body_data.get('color', '')
            created_by = body_data.get('created_by')
            
            cur.execute(
                "INSERT INTO orders (order_number, material, quantity, size, color, created_by) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                (order_number, material, quantity, size, color, created_by)
            )
            order_id = cur.fetchone()[0]
            conn.commit()
            
            cur.close()
            conn.close()
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'id': order_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            order_id = body_data.get('id')
            
            if 'completed_quantity' in body_data:
                completed = body_data['completed_quantity']
                
                cur.execute("SELECT quantity FROM orders WHERE id = %s", (order_id,))
                total = cur.fetchone()[0]
                
                if completed >= total:
                    new_status = 'completed'
                elif completed > 0:
                    new_status = 'in_progress'
                else:
                    new_status = 'created'
                
                cur.execute(
                    "UPDATE orders SET completed_quantity = %s, status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                    (completed, new_status, order_id)
                )
            
            elif 'status' in body_data:
                new_status = body_data['status']
                cur.execute(
                    "UPDATE orders SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                    (new_status, order_id)
                )
            
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
