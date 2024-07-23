class Session:
    def __init__(self, conversation_id, user_id, conversation_obj = None):
        self.conversation_id = conversation_id
        self.user_id = user_id
        self.conversation_obj = conversation_obj