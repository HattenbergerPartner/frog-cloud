FROM python:3.8-slim-bullseye AS builder

ENV DEBIAN_FRONTEND=noninteractive

ENV CELERY_BROKER_URL redis://fc-redis:6379/0
ENV CELERY_RESULT_BACKEND redis://fc-redis:6379/0
ENV POSTGRES_USER fcuser
ENV POSTGRES_PASSWORD fcpassword
ENV POSTGRES_HOST fc-database
ENV POSTGRES_DB fcdb
ENV C_FORCE_ROOT true

RUN apt-get update \
    && apt-get install -y --no-install-recommends g++ gcc wget xdg-utils zenity fontconfig supervisor ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir cryptography

WORKDIR /

RUN sed -r -i 's/^deb(.*)$/deb\1 contrib/g' /etc/apt/sources.list

RUN apt-get update && apt-get install -y \
    ttf-mscorefonts-installer || true

RUN apt-get update \
	&& wget -q https://download.screamingfrog.co.uk/products/seo-spider/screamingfrogseospider_20.4_all.deb \
    && apt-get install -y --no-install-recommends ./screamingfrogseospider_20.4_all.deb \
    && rm -f screamingfrogseospider_20.4_all.deb \
    && rm -rf /var/lib/apt/lists/*

COPY . /queue
WORKDIR /queue

RUN pip install -U setuptools pip
RUN pip install -r requirements.txt

ENV C_FORCE_ROOT=1

CMD ["supervisord", "-c", "/queue/supervisord.conf"]