from flask import Flask, request, jsonify
import pandas as pd
import joblib
import os

# ================================
# 1. INITIALIZE FLASK APP
# ================================
app = Flask(__name__)

# ================================
# 2. SET BASE PATHS (VERY IMPORTANT)
# ================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

# ================================
# 3. LOAD MODELS & SCALERS (ONCE)
# ================================
try:
    print("⏳ Loading ML models...")

    # --- SALES FORECAST (REGRESSION) ---
    sales_model = joblib.load(
        os.path.join(MODEL_DIR, "sales_forecast_model.pkl")
    )
    sales_scaler = joblib.load(
        os.path.join(MODEL_DIR, "sales_forecast_scaler.pkl")
    )

    # --- CUSTOMER RISK (CLASSIFICATION) ---
    churn_model = joblib.load(
        os.path.join(MODEL_DIR, "customer_risk_model.pkl")
    )
    churn_scaler = joblib.load(
        os.path.join(MODEL_DIR, "customer_risk_scaler.pkl")
    )

    print("✅ All ML models loaded successfully!")

except Exception as e:
    print("❌ Error loading model files")
    print(e)
    print("👉 Check that all .pkl files exist inside the 'models/' folder")

# ================================
# 4. HOME ROUTE
# ================================
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "ML Inference API is running",
        "endpoints": ["/predict_sales", "/predict_churn"]
    })

# ================================
# 5. SALES PREDICTION (REGRESSION)
# ================================
@app.route("/predict_sales", methods=["POST"])
def predict_sales():
    try:
        # Get JSON data
        data = request.get_json()

        # Convert to DataFrame
        df = pd.DataFrame([data])

        # Preprocess (OneHotEncoding + Scaling handled by pipeline)
        df_processed = sales_scaler.transform(df)

        # Predict
        prediction = sales_model.predict(df_processed)

        return jsonify({
            "status": "success",
            "predicted_sales": round(float(prediction[0]), 2)
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

# ================================
# 6. CUSTOMER RISK PREDICTION
# ================================
@app.route("/predict_churn", methods=["POST"])
def predict_churn():
    try:
        # Get JSON data
        data = request.get_json()

        # Convert to DataFrame
        df = pd.DataFrame([data])

        # Preprocess
        df_processed = churn_scaler.transform(df)

        # Predict class + probability
        prediction = churn_model.predict(df_processed)[0]
        probability = churn_model.predict_proba(df_processed)[0][1]

        result = "At Risk" if prediction == 1 else "Safe"

        return jsonify({
            "status": "success",
            "customer_status": result,
            "risk_probability_percent": round(probability * 100, 2)
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

# ================================
# 7. RUN SERVER
# ================================
if __name__ == "__main__":
    print("🚀 Starting Flask ML Inference API...")
    app.run(host="127.0.0.1", port=5001, debug=True)
