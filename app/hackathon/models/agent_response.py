import uuid
from datetime import datetime, timezone

from enum import Enum

class SystemObject(Enum):
    Invoice = 1
    Time = 2
    Staff = 3

class ResponseList:
    def __init__(self) -> None:
        pass
class AgentResponse:
    def __init__(self, analysis: str, system_object: SystemObject):
        self.analysis = analysis
        self.system_object = system_object



        