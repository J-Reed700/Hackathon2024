from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter as OTLPGRPCSpanExporter
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

def setup_opentelemetry(app):
    try:
        # Configure the tracer provider with the resource
        trace.set_tracer_provider(TracerProvider())

        # Create an OTLP exporter instance based on the grpc protocol
        otlp_exporter = OTLPGRPCSpanExporter()

        # Add a span processor to the tracer provider with the exporter
        trace.get_tracer_provider().add_span_processor(
            BatchSpanProcessor(otlp_exporter)
        )

        # Instrument external HTTP requests and Flask application
        RequestsInstrumentor().instrument()
        FlaskInstrumentor().instrument_app(app)
        app.logger.info("OpenTelemetry instrumentation has been set up.")
    except Exception as e:
        app.logger.error(f"OpenTelemetry instrumentation failed: {e}")
        app.logger.info("Proceeding without OpenTelemetry instrumentation.")