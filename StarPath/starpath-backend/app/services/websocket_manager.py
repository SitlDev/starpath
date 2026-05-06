from fastapi import WebSocket
from typing import Dict, List, Set
import json
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        # Structure: {user_id: set of WebSocket connections}
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, user_id: str, websocket: WebSocket):
        """Register a new WebSocket connection for a user"""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
    
    def disconnect(self, user_id: str, websocket: WebSocket):
        """Remove a WebSocket connection for a user"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def send_personal_message(self, user_id: str, message: dict):
        """Send message to specific user's all connections"""
        if user_id in self.active_connections:
            message_json = json.dumps({
                **message,
                "timestamp": datetime.utcnow().isoformat()
            })
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message_json)
                except Exception as e:
                    print(f"Error sending message to user {user_id}: {e}")
    
    async def send_to_multiple_users(self, user_ids: List[str], message: dict):
        """Send message to multiple users"""
        for user_id in user_ids:
            await self.send_personal_message(user_id, message)
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected users"""
        message_json = json.dumps({
            **message,
            "timestamp": datetime.utcnow().isoformat()
        })
        for user_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_text(message_json)
                except Exception as e:
                    print(f"Error broadcasting to user {user_id}: {e}")
    
    def get_connected_users(self) -> List[str]:
        """Get list of currently connected user IDs"""
        return list(self.active_connections.keys())
    
    def is_user_connected(self, user_id: str) -> bool:
        """Check if a user is currently connected"""
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

# Global connection manager instance
manager = ConnectionManager()
