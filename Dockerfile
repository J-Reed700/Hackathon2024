FROM python:3.9.19-alpine3.20


WORKDIR /app

ARG RUN_MODE=dev

RUN apk add --no-cache build-base libffi-dev
RUN apk add --no-cache openssl
RUN pip install --upgrade pip
RUN pip install poetry==1.8.2

# Copy Poetry project files
COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.create false
RUN poetry install --without dev

COPY config.py .
COPY app/ ./app
COPY data/ ./data
COPY deploy/ .
COPY tests/ ./tests

# Run Mode is used to specify dev or prod config when starting the Flask app
ENV RUN_MODE=$RUN_MODE

RUN chmod +x /app/gunicorn.sh

EXPOSE 5000
CMD ["/app/gunicorn.sh"]