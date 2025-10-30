'''
Business: Управление заявками на производство (создание, обновление статуса, получение списка, добавление позиций)
Args: event - dict с httpMethod, body (order data), queryStringParameters (status filter, id)
Returns: HTTP response с данными заявок или результатом операции
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
            status_filter = params.get('status')
            order_id = params.get('id')
            
            if order_id:
                cur.execute("""
                    SELECT o.id, o.order_number, o.status, o.created_by, o.created_at, o.updated_at
                    FROM t_p435659_order_management_sys.orders o
                    WHERE o.id = %s
                """, (order_id,))
                order_row = cur.fetchone()
                
                if not order_row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Order not found'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    SELECT id, material, quantity, size, color, completed_quantity
                    FROM t_p435659_order_management_sys.order_items
                    WHERE order_id = %s
                    ORDER BY id
                """, (order_id,))
                items = cur.fetchall()
                
                result = {
                    'id': order_row[0],
                    'order_number': order_row[1],
                    'status': order_row[2],
                    'created_by': order_row[3],
                    'created_at': order_row[4].isoformat() if order_row[4] else None,
                    'updated_at': order_row[5].isoformat() if order_row[5] else None,
                    'items': [{
                        'id': i[0],
                        'material': i[1],
                        'quantity': i[2],
                        'size': i[3],
                        'color': i[4],
                        'completed_quantity': i[5]
                    } for i in items]
                }
                
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            
            if status_filter:
                cur.execute("""
                    SELECT o.id, o.order_number, o.status, o.created_by, o.created_at, o.updated_at
                    FROM t_p435659_order_management_sys.orders o
                    WHERE o.status = %s
                    ORDER BY o.created_at DESC
                """, (status_filter,))
            else:
                cur.execute("""
                    SELECT o.id, o.order_number, o.status, o.created_by, o.created_at, o.updated_at
                    FROM t_p435659_order_management_sys.orders o
                    ORDER BY o.created_at DESC
                """)
            
            orders_rows = cur.fetchall()
            result = []
            
            for o in orders_rows:
                cur.execute("""
                    SELECT id, material, quantity, size, color, completed_quantity
                    FROM t_p435659_order_management_sys.order_items
                    WHERE order_id = %s
                    ORDER BY id
                """, (o[0],))
                items = cur.fetchall()
                
                result.append({
                    'id': o[0],
                    'order_number': o[1],
                    'status': o[2],
                    'created_by': o[3],
                    'created_at': o[4].isoformat() if o[4] else None,
                    'updated_at': o[5].isoformat() if o[5] else None,
                    'items': [{
                        'id': i[0],
                        'material': i[1],
                        'quantity': i[2],
                        'size': i[3],
                        'color': i[4],
                        'completed_quantity': i[5]
                    } for i in items]
                })
            
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            if 'order_id' in body_data and 'item' in body_data:
                order_id = body_data['order_id']
                item = body_data['item']
                
                cur.execute("""
                    INSERT INTO t_p435659_order_management_sys.order_items 
                    (order_id, material, quantity, size, color, completed_quantity)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (
                    order_id,
                    item.get('material'),
                    item.get('quantity', 0),
                    item.get('size', ''),
                    item.get('color', ''),
                    0
                ))
                
                item_id = cur.fetchone()[0]
                conn.commit()
                
                cur.close()
                conn.close()
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'item_id': item_id}),
                    'isBase64Encoded': False
                }
            
            order_number = body_data.get('order_number')
            items = body_data.get('items', [])
            created_by = body_data.get('created_by')
            
            cur.execute("""
                INSERT INTO t_p435659_order_management_sys.orders (order_number, created_by)
                VALUES (%s, %s)
                RETURNING id
            """, (order_number, created_by))
            
            order_id = cur.fetchone()[0]
            
            for item in items:
                cur.execute("""
                    INSERT INTO t_p435659_order_management_sys.order_items 
                    (order_id, material, quantity, size, color, completed_quantity)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    order_id,
                    item.get('material'),
                    item.get('quantity', 0),
                    item.get('size', ''),
                    item.get('color', ''),
                    0
                ))
            
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': order_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            if 'item_id' in body_data:
                item_id = body_data['item_id']
                completed = body_data.get('completed_quantity', 0)
                
                cur.execute("""
                    UPDATE t_p435659_order_management_sys.order_items
                    SET completed_quantity = %s
                    WHERE id = %s
                    RETURNING order_id
                """, (completed, item_id))
                
                order_id = cur.fetchone()[0]
                
                cur.execute("""
                    SELECT 
                        SUM(completed_quantity) as total_completed,
                        SUM(quantity) as total_quantity
                    FROM t_p435659_order_management_sys.order_items
                    WHERE order_id = %s
                """, (order_id,))
                
                totals = cur.fetchone()
                total_completed = totals[0] or 0
                total_quantity = totals[1] or 0
                
                if total_completed >= total_quantity:
                    new_status = 'completed'
                elif total_completed > 0:
                    new_status = 'in_progress'
                else:
                    new_status = 'created'
                
                cur.execute("""
                    UPDATE t_p435659_order_management_sys.orders
                    SET status = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (new_status, order_id))
                
                conn.commit()
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            order_id = body_data.get('id')
            
            if 'status' in body_data:
                status = body_data['status']
                cur.execute("""
                    UPDATE t_p435659_order_management_sys.orders
                    SET status = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (status, order_id))
                conn.commit()
            
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            order_id = query_params.get('id')
            
            if not order_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Order ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("DELETE FROM t_p435659_order_management_sys.order_items WHERE order_id = %s", (order_id,))
            cur.execute("DELETE FROM t_p435659_order_management_sys.orders WHERE id = %s", (order_id,))
            conn.commit()
            
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not supported'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
