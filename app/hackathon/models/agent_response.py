import uuid
from datetime import datetime, timezone

from enum import Enum

class SystemObject(Enum):
    Risk = 1
    Insight = 2
    Invoice = 3

class ResponseList:
    def __init__(self) -> None:
        pass
class AgentResponse:
    def __init__(self, analysis: str, system_object: SystemObject):
        self.analysis = analysis
        self.system_object = system_object

    def to_dict(self):
        return {
            'analysis': self.analysis,
            'system_object': self.system_object.name  # Use the name of the enum
        }

        