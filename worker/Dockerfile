FROM python:3.8-buster AS builder

ENV CELERY_BROKER_URL redis://fc-redis:6379/0
ENV CELERY_RESULT_BACKEND redis://fc-redis:6379/0
ENV POSTGRES_USER fcuser
ENV POSTGRES_PASSWORD fcpassword
ENV POSTGRES_HOST fc-database
ENV POSTGRES_DB fcdb
ENV C_FORCE_ROOT true

RUN apt-get update \
    && apt-get install -y --no-install-recommends g++ gcc \
    && rm -rf /var/lib/apt/lists/* \
    && pip install cryptography

WORKDIR /

RUN sed -r -i 's/^deb(.*)$/deb\1 contrib/g' /etc/apt/sources.list

RUN apt-get update && apt-get install -y \
    wget \
    xdg-utils \
    zenity \
    ttf-mscorefonts-installer \
    fontconfig \
    supervisor

RUN apt-get update \
	&& wget https://download.screamingfrog.co.uk/products/seo-spider/screamingfrogseospider_20.4_all.deb \
    && apt install ./screamingfrogseospider_20.4_all.deb

COPY . /queue
WORKDIR /queue

RUN pip install -U setuptools pip
RUN pip install -r requirements.txt

ENV C_FORCE_ROOT=1

CMD ["supervisord"]