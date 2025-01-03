# wsgi.py
from netlify_functions.summarizer import handler

def application(event, context):
    return handler(event, context)
