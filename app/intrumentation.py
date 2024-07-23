import os
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter as OTLPGRPCSpanExporter
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

def setup_opentelemetry(app):
    if os.getenv("OTEL_TRACING_ENABLED"):
        tp = TracerProvider()
        exp = OTLPGRPCSpanExporter()
        trace.set_tracer_provider(tp)
        trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(exp))

        FlaskInstrumentor().instrument_app(app)