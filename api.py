from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from pydantic import BaseModel
import os

app = FastAPI()

# CORS for local testing; restrict in production if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your domain for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    prompt: str

HF_TOKEN = os.getenv("HF_TOKEN", "your-huggingface-token")  # Use env var for security

@app.post("/api/generate")
def generate_response(query: Query):
    if not query.prompt or len(query.prompt) > 500:
        raise HTTPException(status_code=400, detail="Prompt must be between 1 and 500 characters")
    
    url = "https://api-inference.huggingface.co/models/gpt2"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": query.prompt, "parameters": {"max_length": 100, "num_return_sequences": 1}}
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        generated = response.json()[0]["generated_text"]
        return {"response": generated}
    else:
        raise HTTPException(status_code=500, detail="AI generation failed. Try again later.")
