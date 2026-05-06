from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from enum import Enum

class NotificationType(str, Enum):
    NEW_INSPECTION = "new_inspection"
    RATING_CHANGE = "rating_change"
    LOW_RATING_ALERT = "low_rating_alert"
    SYSTEM_MESSAGE = "system_message"
    REPORT_READY = "report_ready"

class NotificationBase(BaseModel):
    type: NotificationType
    title: str
    message: str
    data: Optional[str] = None
    facility_id: Optional[UUID] = None

class NotificationCreate(NotificationBase):
    user_id: UUID

class Notification(NotificationBase):
    id: UUID
    user_id: UUID
    is_read: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

class WebSocketMessage(BaseModel):
    """WebSocket message format"""
    type: NotificationType
    title: str
    message: str
    data: Optional[dict] = None
    facility_id: Optional[UUID] = None
