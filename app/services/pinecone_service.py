from pinecone import Pinecone
from opentelemetry import trace
import config

tracer = trace.get_tracer(__name__)

class PineconeService:
    def __init__(self, index_name='bigtimekb', report_index_name='reportai'):
        self.index_name = index_name
        self.report_index_name = report_index_name
        self.pc = Pinecone(api_key=config.Config.PINECONE_API_KEY)
        self.chat_index = self._get_index(index_name)
        self.report_index = self._get_index(report_index_name)

    def _get_index(self, index_name):
        return self.pc.Index(index_name)

    def execute_query(self, index, vector, top_k):
        with tracer.start_as_current_span("PineconeService.execute_query") as span:
            try:
                query_response = index.query(vector=vector, top_k=top_k, include_metadata=True)
                return query_response
            except Exception as e:
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                raise

    def query_chat(self, vector, top_k=20):
        with tracer.start_as_current_span("PineconeService.query_chat") as span:
            span.set_attribute("pinecone.index_name", "chat_index")
            return self.execute_query(self.chat_index, vector, top_k)

    def query_report(self, vector, top_k=50):
        with tracer.start_as_current_span("PineconeService.query_report") as span:
            span.set_attribute("pinecone.index_name", "report_index")
            return self.execute_query(self.report_index, vector, top_k)

    def describe_index_stats(self):
        return self.pc.describe_index(self.index_name)