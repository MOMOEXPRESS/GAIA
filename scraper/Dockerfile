FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir httpx beautifulsoup4 redis

COPY . .

CMD ["python", "scheduler.py"]
