#!/bin/sh
gunicorn "app:create_app()" -c "./gunicorn.conf.py"