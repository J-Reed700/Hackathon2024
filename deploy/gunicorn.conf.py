# TODO: Read the docs for gunicorn and configure correctly

bind = ":5000"
workers = 4
threads = 4
timeout = 600 # Timeout value taken from Microsoft's guidelines for deploying w/ Gunicorn