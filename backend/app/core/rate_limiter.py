"""In-memory sliding window rate limiter for FastAPI endpoints."""
import time
import threading
from typing import Callable, Dict, List, Optional
from fastapi import Request, HTTPException, status

class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: Dict[str, List[float]] = {}
        self._lock = threading.Lock()

    def is_allowed(self, key: str) -> tuple[bool, int]:
        """Check if request is permitted. Returns (allowed, retry_after_seconds)."""
        now = time.time()
        window_start = now - self.window_seconds

        with self._lock:
            history = self._requests.get(key, [])
            # Purge entries older than the rolling window
            valid_history = [t for t in history if t > window_start]

            if len(valid_history) >= self.max_requests:
                earliest = valid_history[0]
                retry_after = max(1, int(earliest + self.window_seconds - now))
                self._requests[key] = valid_history
                return False, retry_after

            valid_history.append(now)
            self._requests[key] = valid_history
            return True, 0

    def cleanup(self) -> None:
        """Periodically purge empty or stale rate limit keys."""
        now = time.time()
        window_start = now - self.window_seconds
        with self._lock:
            stale_keys = [
                k for k, timestamps in self._requests.items()
                if not timestamps or timestamps[-1] <= window_start
            ]
            for k in stale_keys:
                self._requests.pop(k, None)


def get_client_ip(request: Request) -> str:
    """Safely extracts client IP address considering proxy headers."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # First IP in the comma-separated X-Forwarded-For list is the client
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else "127.0.0.1"


# Global limiters
login_rate_limiter = SlidingWindowRateLimiter(max_requests=10, window_seconds=60)
refresh_rate_limiter = SlidingWindowRateLimiter(max_requests=20, window_seconds=60)
webhook_rate_limiter = SlidingWindowRateLimiter(max_requests=60, window_seconds=60)
general_api_rate_limiter = SlidingWindowRateLimiter(max_requests=180, window_seconds=60)


def rate_limit(limiter: SlidingWindowRateLimiter, key_func: Optional[Callable[[Request], str]] = None):
    """FastAPI dependency to enforce rate limits."""
    async def _dependency(request: Request):
        key = key_func(request) if key_func else get_client_ip(request)
        allowed, retry_after = limiter.is_allowed(key)
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Please try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)},
            )
    return _dependency
