'''
Business: Управление материалами и остатками (создание, обновление, получение списка)
Args: event - dict с httpMethod, body (material data)
Returns: HTTP response со списком материалов или результатом операции
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
            cur.execute(
                "SELECT id, name, size, color, quantity, material_type, image_url, created_at FROM materials ORDER BY created_at DESC"
            )
            materials = cur.fetchall()
            
            result = [{
                'id': m[0],
                'name': m[1],
                'size': m[2],
                'color': m[3],
                'quantity': float(m[4]) if m[4] else 0,
                'material_type': m[5],
                'image_url': m[6],
                'created_at': m[7].isoformat() if m[7] else None
            } for m in materials]
            
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
            name = body_data.get('name')
            size = body_data.get('size', '')
            color = body_data.get('color', '')
            quantity = body_data.get('quantity', 0)
            material_type = body_data.get('material_type', '')
            image_url = body_data.get('image_url', '')
            
            cur.execute(
                "INSERT INTO materials (name, size, color, quantity, material_type, image_url) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                (name, size, color, quantity, material_type, image_url)
            )
            material_id = cur.fetchone()[0]
            conn.commit()
            
            cur.close()
            conn.close()
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'id': material_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            material_id = body_data.get('id')
            quantity_change = body_data.get('quantity_change', 0)
            updated_by = body_data.get('updated_by')
            
            cur.execute(
                "UPDATE materials SET quantity = quantity + %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (quantity_change, material_id)
            )
            
            cur.execute(
                "INSERT INTO material_inventory (material_id, quantity_change, updated_by) VALUES (%s, %s, %s)",
                (material_id, quantity_change, updated_by)
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
