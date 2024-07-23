class ConversationHistory:
    def __init__(self, conversation_id, messages, user_id, vote, feedback, flagged):
        self.conversation_id = conversation_id
        self.messages = messages
        self.user_id = user_id
        self.vote = vote
        self.feedback = feedback
        self.flagged = flagged