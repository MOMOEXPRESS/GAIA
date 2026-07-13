# Gaia AI Service — multi-stage Python build (Vol 6 §12.2).
# Build context: services/ai.
FROM python:3.12-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim AS runtime
RUN useradd --create-home gaia
WORKDIR /app
COPY --from=build /install /usr/local
COPY app app
USER gaia
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
