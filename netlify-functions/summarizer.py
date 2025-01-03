# netlify-functions/summarizer.py
from flask import Flask, request, jsonify
import torch
from transformers import T5ForConditionalGeneration, T5Tokenizer, PegasusForConditionalGeneration, PegasusTokenizer, BartForConditionalGeneration, BartTokenizer

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

pegasus_model_name = "google/pegasus-xsum"
pegasus_model = PegasusForConditionalGeneration.from_pretrained(pegasus_model_name).to(device)
pegasus_tokenizer = PegasusTokenizer.from_pretrained(pegasus_model_name)

bart_model_name = "facebook/bart-large-cnn"
bart_model = BartForConditionalGeneration.from_pretrained(bart_model_name).to(device)
bart_tokenizer = BartTokenizer.from_pretrained(bart_model_name)

t5_model_name = "t5-small"
t5_model = T5ForConditionalGeneration.from_pretrained(t5_model_name).to(device)
t5_tokenizer = T5Tokenizer.from_pretrained(t5_model_name)

def pegasus_summarize(text):
    inputs = pegasus_tokenizer(text, return_tensors="pt", truncation=True).to(device)
    summary_ids = pegasus_model.generate(inputs["input_ids"], max_length=40, min_length=20, length_penalty=2.0, num_beams=4, early_stopping=True)
    return pegasus_tokenizer.decode(summary_ids[0], skip_special_tokens=True)

def bart_summarize(text):
    inputs = bart_tokenizer(text, return_tensors="pt", truncation=True).to(device)
    summary_ids = bart_model.generate(inputs["input_ids"], max_length=40, min_length=20, length_penalty=2.0, num_beams=4, early_stopping=True)
    return bart_tokenizer.decode(summary_ids[0], skip_special_tokens=True)

def t5_summarize(text):
    inputs = t5_tokenizer("summarize: " + text, return_tensors="pt", truncation=True).to(device)
    summary_ids = t5_model.generate(inputs["input_ids"], max_length=40, min_length=20, length_penalty=2.0, num_beams=4, early_stopping=True)
    return t5_tokenizer.decode(summary_ids[0], skip_special_tokens=True)

def hybrid_summarize(text):
    pegasus_summary = pegasus_summarize(text)
    bart_summary = bart_summarize(pegasus_summary)
    final_summary = t5_summarize(bart_summary)
    return final_summary

def handler(event, context):
    body = event['body']
    data = json.loads(body)
    input_text = data['inputText']
    summary = hybrid_summarize(input_text)
    return {
        "statusCode": 200,
        "body": json.dumps({'t5_summary': summary})
    }
