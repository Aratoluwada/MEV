from collections import defaultdict, deque
from threading import Lock
from time import monotonic
from typing import Callable


class InMemoryRateLimiter:
    """Single-process sliding-window limiter; use a shared store in multi-worker deployments."""

    def __init__(
        self,
        max_requests: int = 120,
        window_seconds: int = 60,
        clock: Callable[[], float] = monotonic,
    ) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.clock = clock
        self._requests: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def allow(self, client_id: str) -> bool:
        now = self.clock()
        cutoff = now - self.window_seconds
        with self._lock:
            requests = self._requests[client_id]
            while requests and requests[0] <= cutoff:
                requests.popleft()
            if len(requests) >= self.max_requests:
                return False
            requests.append(now)
            return True