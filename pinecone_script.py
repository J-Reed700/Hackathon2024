import pandas as pd
from app.services.pinecone_service import PineconeService
import pinecone

# Create an instance of the PineconeClient and connect to the index
pinecone_client = PineconeService()
pinecone_client.connect_to_index("bigtimekb")

print(pinecone_client.describe_index_stats())
results = pinecone_client.fetch(["1"], "kbembeddings")
print(results)