# test_ollama.py
import ollama

try:
    response = ollama.chat(model='mistral', messages=[
        {'role': 'user', 'content': 'Say hello in Spanish'}
    ])
    print("Success! Response:", response['message']['content'])
except Exception as e:
    print("Error:", e)
