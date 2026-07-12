import json
import logging
from collections import defaultdict
from datetime import datetime
from typing import Any, Callable, Optional

logger = logging.getLogger("gaia.events")

# In-process event bus (Redis adapter available when redis_url is configured)
_handlers: dict[str, list[Callable]] = defaultdict(list)
_event_log: list[dict] = []


def subscribe(event_type: str, handler: Callable):
    _handlers[event_type].append(handler)


def publish(event_type: str, payload: dict[str, Any]):
    event = {
        "type": event_type,
        "payload": payload,
        "timestamp": datetime.utcnow().isoformat(),
    }
    _event_log.append(event)
    logger.info("Event published: %s", event_type)

    for handler in _handlers.get(event_type, []):
        try:
            handler(payload)
        except Exception as e:
            logger.error("Event handler error for %s: %s", event_type, e)

    for handler in _handlers.get("*", []):
        try:
            handler(event)
        except Exception as e:
            logger.error("Wildcard handler error: %s", e)


def get_recent_events(limit: int = 20) -> list[dict]:
    return list(reversed(_event_log[-limit:]))
