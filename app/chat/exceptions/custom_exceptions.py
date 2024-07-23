class MessageTooLongError(Exception):
    def __init__(self, message="The question is too long."):
        super().__init__(message)