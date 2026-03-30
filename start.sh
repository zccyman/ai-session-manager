#!/bin/bash

MODE=${1:-backend}

create_data_dir() {
    mkdir -p data
    if [ ! -f data/kilo.db ]; then
        touch data/kilo.db
    fi
    if [ ! -f data/opencode.db ]; then
        touch data/opencode.db
    fi
}

start_backend() {
    echo "Starting backend..."
    cd backend
    pip install -r requirements.txt 2>/dev/null || true
    uvicorn app.main:app --host 0.0.0.0 --port 8000
}

start_frontend() {
    echo "Starting frontend..."
    cd frontend
    npm install 2>/dev/null || true
    npm run dev
}

start_docker() {
    echo "Starting with Docker..."
    create_data_dir
    docker-compose up -d --build
    echo "Services started: Backend http://localhost:8000, Frontend http://localhost:3000"
}

stop_docker() {
    echo "Stopping Docker services..."
    docker-compose down
}

case $MODE in
    backend)
        create_data_dir
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    docker)
        start_docker
        ;;
    stop)
        stop_docker
        ;;
    *)
        echo "Usage: $0 {backend|frontend|docker|stop}"
        exit 1
        ;;
esac