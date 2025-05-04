FROM python:3.11-slim

RUN adduser --disabled-password --gecos "" django

WORKDIR /app

COPY requirements.txt /app/

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
         build-essential \
         libffi-dev \
         libpq-dev \
         git \
    && pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY . /app/

USER django

EXPOSE 8000

