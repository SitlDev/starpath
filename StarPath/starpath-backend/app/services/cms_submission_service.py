"""
CMS Submission Service
Handles actual submission of data to CMS API with retry logic and mock mode support
"""
import json
import httpx
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple
from enum import Enum
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class SubmissionResult(Enum):
    """Result states for CMS submission"""
    SUCCESS = "success"
    FAILED = "failed"
    PARTIAL = "partial"
    RETRYABLE = "retryable"


class CMSSubmissionService:
    """Service for submitting data to CMS API"""
    
    def __init__(self):
        self.api_base_url = settings.CMS_API_BASE_URL
        self.api_key = settings.CMS_API_KEY
        self.timeout = settings.CMS_TIMEOUT_SECONDS
        self.max_retries = settings.CMS_MAX_RETRIES
        self.retry_delay = settings.CMS_RETRY_DELAY_SECONDS
        self.mock_mode = settings.CMS_MOCK_MODE
    
    async def submit_data_to_cms(
        self,
        facility_id: str,
        cms_provider_id: str,
        export_data: str,
        data_format: str = "json",
        submission_id: str = None
    ) -> Tuple[bool, Dict[str, Any], Optional[str]]:
        """
        Submit facility data to CMS API
        
        Args:
            facility_id: StarPath facility ID
            cms_provider_id: CMS Provider ID (6 digits)
            export_data: Formatted export data (JSON/XML)
            data_format: Format of data ("json" or "xml")
            submission_id: Unique submission ID for tracking
        
        Returns:
            Tuple of (success: bool, response_data: dict, cms_confirmation_id: str|None)
        """
        
        if self.mock_mode:
            return await self._submit_mock(facility_id, cms_provider_id, export_data, submission_id)
        else:
            return await self._submit_real(facility_id, cms_provider_id, export_data, data_format, submission_id)
    
    async def _submit_mock(
        self,
        facility_id: str,
        cms_provider_id: str,
        export_data: str,
        submission_id: str
    ) -> Tuple[bool, Dict[str, Any], str]:
        """Mock CMS submission for testing/development"""
        
        logger.info(f"Mock CMS submission for facility {cms_provider_id}, submission {submission_id}")
        
        # Simulate success with 90% probability in mock mode
        import random
        success = random.random() < 0.9
        
        mock_confirmation_id = f"CMS-{cms_provider_id}-{submission_id[:8].upper()}"
        
        response = {
            "status": "ACCEPTED" if success else "REJECTED",
            "confirmation_id": mock_confirmation_id,
            "submission_timestamp": datetime.now(timezone.utc).isoformat(),
            "record_count": len(export_data) // 100,  # Rough estimate
            "message": "Data successfully received by CMS" if success else "Data validation failed at CMS",
            "mock_mode": True
        }
        
        return success, response, mock_confirmation_id if success else None
    
    async def _submit_real(
        self,
        facility_id: str,
        cms_provider_id: str,
        export_data: str,
        data_format: str,
        submission_id: str
    ) -> Tuple[bool, Dict[str, Any], Optional[str]]:
        """Submit to actual CMS API with retry logic"""
        
        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    headers = {
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": f"application/{data_format}",
                        "X-Submission-ID": submission_id,
                        "X-Provider-ID": cms_provider_id
                    }
                    
                    url = f"{self.api_base_url}/submit"
                    
                    response = await client.post(
                        url,
                        content=export_data.encode() if isinstance(export_data, str) else export_data,
                        headers=headers
                    )
                    
                    if response.status_code == 202:  # Accepted
                        response_data = response.json()
                        cms_confirmation_id = response_data.get("confirmation_id")
                        logger.info(f"CMS submission successful: {cms_confirmation_id}")
                        return True, response_data, cms_confirmation_id
                    
                    elif response.status_code == 400:  # Bad request - not retryable
                        logger.error(f"CMS rejected data: {response.text}")
                        return False, {"error": response.text, "status_code": 400}, None
                    
                    elif response.status_code >= 500:  # Server error - retryable
                        logger.warning(f"CMS server error (attempt {attempt + 1}): {response.status_code}")
                        if attempt < self.max_retries - 1:
                            await asyncio.sleep(self.retry_delay)
                            continue
                        return False, {"error": "CMS server error", "status_code": response.status_code}, None
                    
                    else:
                        logger.error(f"Unexpected CMS response: {response.status_code}")
                        return False, {"error": response.text, "status_code": response.status_code}, None
            
            except httpx.TimeoutException:
                logger.warning(f"CMS request timeout (attempt {attempt + 1}/{self.max_retries})")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay)
                    continue
                return False, {"error": "CMS request timeout"}, None
            
            except httpx.HTTPError as e:
                logger.error(f"CMS HTTP error: {e}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay)
                    continue
                return False, {"error": str(e)}, None
        
        return False, {"error": "Max retries exceeded"}, None
    
    async def get_submission_status(self, cms_confirmation_id: str) -> Dict[str, Any]:
        """Query CMS for submission status"""
        
        if self.mock_mode:
            # Return mock status
            return {
                "confirmation_id": cms_confirmation_id,
                "status": "ACCEPTED",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "mock_mode": True
            }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                }
                
                url = f"{self.api_base_url}/submissions/{cms_confirmation_id}"
                response = await client.get(url, headers=headers)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to get CMS status: {response.status_code}")
                    return {"error": "Unable to retrieve status", "status_code": response.status_code}
        
        except Exception as e:
            logger.error(f"Error getting CMS submission status: {e}")
            return {"error": str(e)}
    
    async def cancel_submission(self, cms_confirmation_id: str) -> bool:
        """Cancel a pending CMS submission"""
        
        if self.mock_mode:
            logger.info(f"Mock cancel submission: {cms_confirmation_id}")
            return True
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                }
                
                url = f"{self.api_base_url}/submissions/{cms_confirmation_id}/cancel"
                response = await client.post(url, headers=headers)
                
                return response.status_code == 200
        
        except Exception as e:
            logger.error(f"Error canceling CMS submission: {e}")
            return False
    
    def get_submission_url(self, cms_confirmation_id: str) -> str:
        """Get CMS portal URL for viewing submission"""
        
        return f"https://cms.gov/five-star/submissions/{cms_confirmation_id}"


class ExportStorageService:
    """Service for storing and retrieving exported files"""
    
    def __init__(self):
        self.export_dir = settings.CMS_EXPORT_DIR
        self.keep_exports = settings.CMS_KEEP_EXPORTS
        import os
        os.makedirs(self.export_dir, exist_ok=True)
    
    def save_export(self, submission_id: str, data: str, data_format: str = "json") -> str:
        """Save exported data to file"""
        
        if not self.keep_exports:
            return None
        
        import os
        filename = f"{submission_id}.{data_format}"
        filepath = os.path.join(self.export_dir, filename)
        
        try:
            with open(filepath, 'w') as f:
                f.write(data)
            logger.info(f"Saved export: {filepath}")
            return filepath
        except Exception as e:
            logger.error(f"Failed to save export: {e}")
            return None
    
    def get_export(self, submission_id: str, data_format: str = "json") -> Optional[str]:
        """Retrieve saved export data"""
        
        import os
        filename = f"{submission_id}.{data_format}"
        filepath = os.path.join(self.export_dir, filename)
        
        try:
            if os.path.exists(filepath):
                with open(filepath, 'r') as f:
                    return f.read()
        except Exception as e:
            logger.error(f"Failed to read export: {e}")
        
        return None
    
    def list_exports(self, facility_id: str = None) -> list:
        """List all saved exports"""
        
        import os
        exports = []
        
        try:
            for filename in os.listdir(self.export_dir):
                filepath = os.path.join(self.export_dir, filename)
                if os.path.isfile(filepath):
                    stat = os.stat(filepath)
                    exports.append({
                        "filename": filename,
                        "size": stat.st_size,
                        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
                    })
        except Exception as e:
            logger.error(f"Failed to list exports: {e}")
        
        return exports
