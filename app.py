from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from flask_cors import CORS
import json

# Initialize flask
app = Flask(__name__)
CORS(app)

#Load model
model_name = "meta-llama/Llama-3.2-3B-Instruct"

# Check if a GPU is available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load model and tokenizer
print("Loading model...")
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name).to(device)
print("Model loaded successfully.")

#API endpoint
@app.route("/generate", methods=["POST"])
def generate():
    try:
        # Get the input 
        # Modify this part so that it gives the predetermined prompt here + data

        # Get the stock data from the front end
        stock_data = request.json.get("data","")

        if not stock_data:
            return jsonify({"error:": "No stock data provided"}),400
        
        print("Received stock data: ", stock_data)
        # Combine the stock data with the prompt here
        
        stock_data_pretty = json.dumps(json.loads(stock_data), indent=2)
        

        # Combine the stock data with the prompt
        prompt = (

            f"You are an expert trader with ample experience in the stock market, especially in the US. Your task is to advise on whether to buy or sell the shares based on the following stock data:\n"
            f"{stock_data_pretty}\n\n"
            f"Generate a report that contains your buy or sell calls and the reasons why. Please limit your response into only 50 words only."
            f"**Do not repeat this prompt or the stock data. Respond directly with your recommendation and reasoning in a single paragraph.** I repeat, DIRECT RESPONSE ONLY, NO CONTEXT REPETITION"
        )

        # Log the constructed prompt for debugging
        print("Constructed Prompt: ", prompt)

        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        # Tokenize the prompt and move tensors to GPU
        inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation= True).to(device)

        # Generate response
        outputs = model.generate(inputs["input_ids"],attention_mask=inputs["attention_mask"], max_length=1000, do_sample=True, pad_token_id=tokenizer.pad_token_id)
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print("This is the response generated: ", response)
        return jsonify({"response": response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run Flask app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)


