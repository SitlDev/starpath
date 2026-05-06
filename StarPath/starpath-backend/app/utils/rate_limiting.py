"""
Rate Limiting Middleware and Utilities
Provides rate limiting for API endpoints
"""
from typing import Dict, Tuple
from datetime import datetime, timedelta, timezone
import asyncio


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests: Dict[str, list] = {}
    
    def is_allowed(self, identifier: str, limit: int, window_seconds: int = 3600) -> bool:
        """
        Check if a request is allowed under the rate limit
        
        Args:
            identifier: Unique identifier (e.g., user_id or IP)
            limit: Maximum requests allowed in the window
            window_seconds: Time window in seconds (default 1 hour)
        
        Returns:
            True if request is allowed, False if rate limit exceeded
        """
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(seconds=window_seconds)
        
        # Initialize if not exists
        if identifier not in self.requests:
            self.requests[identifier] = []
        
        # Remove old requests outside the window
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier]
            if req_time > cutoff
        ]
        
        # Check if limit exceeded
        if len(self.requests[identifier]) >= limit:
            return False
        
        # Add current request
        self.requests[identifier].append(now)
        return True
    
    def get_remaining(self, identifier: str, limit: int, window_seconds: int = 3600) -> int:
        """Get remaining requests for identifier"""
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(seconds=window_seconds)
        
        if identifier not in self.requests:
            return limit
        
        valid_requests = len([
            req_time for req_time in self.requests[identifier]
            if req_time > cutoff
        ])
        
        return max(0, limit - valid_requests)
    
    def get_reset_time(self, identifier: str, window_seconds: int = 3600) -> int:
        """Get seconds until rate limit resets"""
        if identifier not in self.requests or not self.requests[identifier]:
            return 0
        
        oldest_request = min(self.requests[identifier])
        reset_time = oldest_request + timedelta(seconds=window_seconds)
        now = datetime.now(timezone.utc)
        
        seconds_remaining = (reset_time - now).total_seconds()
        return max(0, int(seconds_remaining))


# Global rate limiters for CMS operations
cms_export_limiter = RateLimiter()
cms_submission_limiter = RateLimiter()


def create_rate_limit_headers(limiter: RateLimiter, identifier: str, limit: int, window_seconds: int = 3600) -> Dict[str, str]:
    """Create rate limit headers for response"""
    remaining = limiter.get_remaining(identifier, limit, window_seconds)
    reset_time = limiter.get_reset_time(identifier, window_seconds)
    
    return {
        "X-RateLimit-Limit": str(limit),
        "X-RateLimit-Remaining": str(remaining),
        "X-RateLimit-Reset": str(int(datetime.now(timezone.utc).timestamp()) + reset_time),
    }
