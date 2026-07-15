import io
import difflib
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn
from xgboost import XGBClassifier

app = FastAPI(title="Heart Disease Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Paths ──────────────────────────────────────────────────────────────────────
MODEL_PATH    = "best_binary_disease_model.json"
SCALER_PATH   = "final_scaler.pkl"
ENCODERS_PATH = "feature_encoders.pkl"

try:
    model = XGBClassifier()
    model.load_model(MODEL_PATH)
    scaler           = joblib.load(SCALER_PATH)
    feature_encoders = joblib.load(ENCODERS_PATH)
    print("✅ Đã tải thành công mô hình JSON và các bộ xử lý dữ liệu!")
except Exception as e:
    print(f"❌ Lỗi khi tải file: {e}")
    model = scaler = feature_encoders = None

# ── Constants ─────────────────────────────────────────────────────────────────
MAX_ROWS = 1000

EXPECTED_COLUMNS = [
    'age', 'gender', 'glucose_mg_dl', 'cholesterol_mg_dl',
    'systolic_bp', 'diastolic_bp', 'bmi', 'heart_rate',
    'smoking', 'alcohol_consumption', 'physical_activity', 'family_history'
]

CATEGORICAL_COLS = ['gender', 'smoking', 'alcohol_consumption', 'physical_activity', 'family_history']
NUMERICAL_COLS   = ['age', 'glucose_mg_dl', 'cholesterol_mg_dl', 'systolic_bp', 'diastolic_bp', 'bmi', 'heart_rate']

# Alias dictionary: common alternative names → canonical column name
COLUMN_ALIASES = {
    'age': ['age', 'tuoi', 'tuổi', 'ages'],
    'gender': ['gender', 'sex', 'gioi_tinh', 'giới_tính', 'gioitinh'],
    'glucose_mg_dl': ['glucose_mg_dl', 'glucose', 'bloodsugar', 'blood_sugar', 'duong_huyet', 'đường_huyết', 'glucosemgdl'],
    'cholesterol_mg_dl': ['cholesterol_mg_dl', 'cholesterol', 'chol', 'mo_mau', 'mỡ_máu', 'cholesterolmgdl'],
    'systolic_bp': ['systolic_bp', 'systolic', 'sbp', 'bp_sys', 'huyet_ap_tam_thu', 'huyết_áp_tâm_thu', 'systolicbp'],
    'diastolic_bp': ['diastolic_bp', 'diastolic', 'dbp', 'bp_dia', 'huyet_ap_tam_truong', 'huyết_áp_tâm_trương', 'diastolicbp'],
    'bmi': ['bmi', 'body_mass_index', 'bodymassindex'],
    'heart_rate': ['heart_rate', 'hr', 'heartrate', 'nhip_tim', 'nhịp_tim', 'pulse'],
    'smoking': ['smoking', 'smoke', 'hut_thuoc', 'hút_thuốc', 'smoker'],
    'alcohol_consumption': ['alcohol_consumption', 'alcohol', 'alcoholuse', 'ruou_bia', 'rượu_bia', 'alcoholconsumption'],
    'physical_activity': ['physical_activity', 'exercise', 'activity', 'van_dong', 'vận_động', 'physicalactivity'],
    'family_history': ['family_history', 'familyhistory', 'family_hist', 'tien_su_gia_dinh', 'tiền_sử_gia_đình'],
}

def build_reverse_alias_map():
    """Build {alias_lower → canonical} lookup."""
    reverse = {}
    for canonical, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            reverse[alias.lower()] = canonical
    return reverse

REVERSE_ALIAS = build_reverse_alias_map()


def map_columns(df_cols: list) -> dict:
    """
    Map uploaded column names → canonical names.
    Returns {original_col → canonical_col} for matched columns.
    Unmatched columns are left out.
    """
    mapping = {}
    used_canonical = set()

    for col in df_cols:
        col_lower = col.lower().strip().replace(' ', '_')

        # 1. Exact alias match
        if col_lower in REVERSE_ALIAS:
            canonical = REVERSE_ALIAS[col_lower]
            if canonical not in used_canonical:
                mapping[col] = canonical
                used_canonical.add(canonical)
                continue

        # 2. Fuzzy match against canonical names
        matches = difflib.get_close_matches(col_lower, EXPECTED_COLUMNS, n=1, cutoff=0.75)
        if matches and matches[0] not in used_canonical:
            mapping[col] = matches[0]
            used_canonical.add(matches[0])

    return mapping


def run_prediction(input_df: pd.DataFrame):
    """Encode + scale + predict on a ready DataFrame (canonical columns, no NaN)."""
    df = input_df[EXPECTED_COLUMNS].copy()

    for col in CATEGORICAL_COLS:
        df[col] = feature_encoders[col].transform(df[col])

    df[NUMERICAL_COLS] = scaler.transform(df[NUMERICAL_COLS])

    preds       = model.predict(df)
    proba_all   = model.predict_proba(df)

    results = []
    for i, (pred, proba) in enumerate(zip(preds, proba_all)):
        prob = float(proba[1] if pred == 1 else proba[0])
        results.append({
            "row_index":   i + 1,
            "prediction":  int(pred),
            "has_disease": bool(pred == 1),
            "probability": round(prob * 100, 2),
        })
    return results


# ── Pydantic Models ────────────────────────────────────────────────────────────
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


# ── Endpoints ──────────────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"status": "OK", "message": "Hệ thống AI Dự đoán Bệnh Tim đang hoạt động!"}


@app.post("/predict")
def predict_disease(data: PatientData):
    if not model or not scaler or not feature_encoders:
        raise HTTPException(status_code=500, detail="Mô hình AI chưa sẵn sàng.")

    try:
        input_df = pd.DataFrame([data.model_dump()])
        input_df = input_df[EXPECTED_COLUMNS]

        for col in CATEGORICAL_COLS:
            input_df[col] = feature_encoders[col].transform(input_df[col])

        input_df[NUMERICAL_COLS] = scaler.transform(input_df[NUMERICAL_COLS])

        prediction   = model.predict(input_df)
        probabilities = model.predict_proba(input_df)[0]
        prob = probabilities[1] if prediction[0] == 1 else probabilities[0]

        return {"prediction": int(prediction[0]), "probability": float(prob)}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi xử lý dữ liệu: {str(e)}")


@app.post("/predict/upload")
async def predict_upload(file: UploadFile = File(...)):
    """
    Nhận file CSV, tự động map tên cột, kiểm tra missing values
    (không imputation), và trả về kết quả dự đoán cho từng hàng.
    """
    if not model or not scaler or not feature_encoders:
        raise HTTPException(status_code=500, detail="Mô hình AI chưa sẵn sàng.")

    # 1. Đọc file ─────────────────────────────────────────────────────────────
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận file định dạng CSV (.csv).")

    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8', errors='replace')))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Không thể đọc file CSV: {str(e)}")

    # 2. Giới hạn số hàng ─────────────────────────────────────────────────────
    total_rows = len(df)
    if total_rows == 0:
        raise HTTPException(status_code=400, detail="File CSV không có dữ liệu.")
    if total_rows > MAX_ROWS:
        raise HTTPException(
            status_code=400,
            detail=f"File chứa {total_rows} bệnh nhân, vượt quá giới hạn {MAX_ROWS} bệnh nhân mỗi lần upload."
        )

    # 3. Column mapping ────────────────────────────────────────────────────────
    col_mapping = map_columns(list(df.columns))
    df = df.rename(columns=col_mapping)

    # Xác định cột nào chưa tìm được
    missing_canonical = [c for c in EXPECTED_COLUMNS if c not in df.columns]
    if missing_canonical:
        raise HTTPException(
            status_code=422,
            detail={
                "error_type": "MISSING_COLUMNS",
                "message": "File CSV thiếu các cột bắt buộc sau hoặc tên cột không được nhận dạng.",
                "missing_columns": missing_canonical,
                "detected_columns": list(df.columns.tolist()),
                "expected_columns": EXPECTED_COLUMNS,
            }
        )

    # Chỉ giữ các cột cần thiết
    df = df[EXPECTED_COLUMNS].copy()

    # 4. Kiểm tra missing values ──────────────────────────────────────────────
    missing_info = []
    for col in EXPECTED_COLUMNS:
        null_rows = df.index[df[col].isnull()].tolist()
        if null_rows:
            missing_info.append({
                "column": col,
                "missing_rows": [r + 1 for r in null_rows],   # 1-indexed cho người dùng
                "count": len(null_rows)
            })

    if missing_info:
        total_missing_cells = sum(m["count"] for m in missing_info)
        raise HTTPException(
            status_code=422,
            detail={
                "error_type": "MISSING_VALUES",
                "message": (
                    f"File CSV có {total_missing_cells} ô dữ liệu bị khuyết trên "
                    f"{len(missing_info)} cột. Vui lòng bổ sung đầy đủ và upload lại."
                ),
                "missing_details": missing_info,
                "total_rows": total_rows,
            }
        )

    # 5. Dự đoán ───────────────────────────────────────────────────────────────
    try:
        results = run_prediction(df)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi khi dự đoán: {str(e)}")

    # 6. Tổng hợp ─────────────────────────────────────────────────────────────
    high_risk_count = sum(1 for r in results if r["has_disease"])
    safe_count      = total_rows - high_risk_count

    return {
        "status": "OK",
        "total_patients": total_rows,
        "high_risk_count": high_risk_count,
        "safe_count": safe_count,
        "column_mapping_applied": col_mapping,
        "results": results,
    }


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)