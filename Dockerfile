FROM python:3.14

WORKDIR /code/

# Copy this first to improve docker caching
COPY ./pyproject.toml /code/pyproject.toml

RUN pip install --no-cache-dir --upgrade /code/

COPY ./ /code/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]
