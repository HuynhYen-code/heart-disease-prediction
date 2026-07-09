import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from xgboost import XGBClassifier # Thêm dòng này

app = FastAPI(title="Heart Disease Prediction API")

# Đổi đuôi .pkl thành .json cho model
MODEL_PATH = "best_binary_disease_model.json" 
SCALER_PATH = "final_scaler.pkl"
ENCODERS_PATH = "feature_encoders.pkl"

try:
    # 1. Tải mô hình XGBoost bằng file JSON
    model = XGBClassifier()
    model.load_model(MODEL_PATH)
    
    # 2. Tải Scaler và Encoders bằng Joblib như cũ
    scaler = joblib.load(SCALER_PATH)
    feature_encoders = joblib.load(ENCODERS_PATH)
    print("✅ Đã tải thành công mô hình JSON và các bộ xử lý dữ liệu!")
except Exception as e:
    print(f"❌ Lỗi khi tải file: {e}")
    model = scaler = feature_encoders = None

# Định nghĩa cấu trúc dữ liệu đầu vào.
# Lưu ý: Các biến phân loại (gender, smoking...) sử dụng kiểu 'str' (chuỗi)
class PatientData(BaseModel):
    age: int
    glucose_mg_dl: float
    cholesterol_mg_dl: float
    systolic_bp: int
    diastolic_bp: int
    bmi: float
    heart_rate: int
    gender: str
    smoking: str
    alcohol_consumption: str
    physical_activity: str
    family_history: str

@app.get("/")
def read_root():
    return {"status": "OK", "message": "Hệ thống AI Dự đoán Bệnh Tim đang hoạt động!"}

@app.post("/predict")
def predict_disease(data: PatientData):
    if not model or not scaler or not feature_encoders:
        raise HTTPException(status_code=500, detail="Mô hình AI chưa sẵn sàng.")

    try:
        # 1. Chuyển JSON payload thành Pandas DataFrame
        input_df = pd.DataFrame([data.model_dump()])

        # KHẮC PHỤC LỖI: Ép thứ tự cột phải khớp 100% với lúc Train
        expected_columns = [
            'age', 'gender', 'glucose_mg_dl', 'cholesterol_mg_dl', 
            'systolic_bp', 'diastolic_bp', 'bmi', 'heart_rate', 
            'smoking', 'alcohol_consumption', 'physical_activity', 'family_history'
        ]
        input_df = input_df[expected_columns]

        # 2. Xử lý các biến phân loại bằng LabelEncoder đã lưu
        categorical_cols = ['gender', 'smoking', 'alcohol_consumption', 'physical_activity', 'family_history']
        for col in categorical_cols:
            input_df[col] = feature_encoders[col].transform(input_df[col])

        # 3. Chuẩn hóa các biến số (Scaling) bằng StandardScaler đã lưu
        numerical_cols = ['age', 'glucose_mg_dl', 'cholesterol_mg_dl', 'systolic_bp', 'diastolic_bp', 'bmi', 'heart_rate']
        input_df[numerical_cols] = scaler.transform(input_df[numerical_cols])

        prediction = model.predict(input_df)
        # Lấy xác suất của class dự đoán (class 1 nếu có bệnh, class 0 nếu không bệnh)
        probabilities = model.predict_proba(input_df)[0]
        prob = probabilities[1] if prediction[0] == 1 else probabilities[0]

        return {"prediction": int(prediction[0]), "probability": float(prob)}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi xử lý dữ liệu: {str(e)}")

# Dòng lệnh giúp chạy file trực tiếp bằng lệnh `python app.py` (tùy chọn)
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)