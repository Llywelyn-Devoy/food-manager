FROM python:3.14 AS base

WORKDIR /code/

# Copy this first to improve docker caching
COPY ./pyproject.toml .

RUN pip install --no-cache-dir --upgrade .


##########
# Debug
##########
FROM base AS food-manager-debug

RUN pip install --no-cache-dir --upgrade debugpy

# TODO: mount the code so we can have hot reloading????
COPY . .

CMD [                                                                                 \
    "python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "--wait-for-client", "-m", \
    "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"                    \
]

##########
# Prod
##########
FROM base AS food-manager-prod

COPY . .

CMD [ "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80" ]
