from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.linear_model import LinearRegression
import math

app = Flask(__name__)
CORS(app)

@app.route('/forecast', methods=['POST'])
def forecast():
    """
    Expects JSON:
    {
        "sales": [
            {"month": 1, "quantity": 10},
            {"month": 2, "quantity": 15}
        ]
    }
    """
    data = request.get_json()
    sales = data.get('sales', [])
    
    if not sales:
        return jsonify({"message": "No sales data provided", "fallback": True}), 400
        
    months = []
    quantities = []
    
    # Data Validation handled here
    for item in sales:
        months.append(item['month'])
        quantities.append(item['quantity'])
    
    # 3. Add Data Validation
    # 4. Add Fallback Prediction
    if len(sales) < 4:
        avg_sales = sum(quantities) / len(quantities)
        fallback_predictions = []
        last_month = months[-1] if months else 0
        
        # fallback is average
        for i in range(1, 7):
            display_month = ((last_month + i) - 1) % 12 + 1
            fallback_predictions.append({
                "month": display_month,
                "predicted": max(0, round(avg_sales))
            })
            
        return jsonify({
            "message": "Not enough historical data for reliable forecast",
            "fallback": True,
            "predictions": fallback_predictions
        })
        
    X = []
    y = quantities
    
    # 1. Add Trend Feature
    # Apply cyclic encoding on month to capture seasonal patterns
    # Plus time_index for trend (1, 2, 3...)
    for idx, month in enumerate(months):
        month_sin = math.sin(2 * math.pi * month / 12)
        month_cos = math.cos(2 * math.pi * month / 12)
        time_index = idx + 1
        X.append([month_sin, month_cos, time_index])
        
    # Train Linear Regression model
    model = LinearRegression()
    model.fit(X, y)
    
    last_month = months[-1]
    last_time_index = len(months)
    predictions = []
    
    # Predict demand for the next 6 months
    for i in range(1, 7):
        future_month = last_month + i
        # Normalize future_month to 1-12
        display_month = (future_month - 1) % 12 + 1
        
        future_sin = math.sin(2 * math.pi * display_month / 12)
        future_cos = math.cos(2 * math.pi * display_month / 12)
        future_time_index = last_time_index + i
        
        pred_qty = model.predict([[future_sin, future_cos, future_time_index]])[0]
        # 2. Ensure Non-Negative Predictions
        predicted = max(0, round(pred_qty))
        
        predictions.append({
            "month": display_month,
            "predicted": predicted
        })
        
    return jsonify({
        "message": "Forecast generated based on trend and seasonality",
        "predictions": predictions, 
        "fallback": False
    })

if __name__ == '__main__':
    # Running on 5002 to avoid conflicts with existing ML services
    app.run(port=5002, debug=True)
