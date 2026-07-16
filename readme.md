# CardioAI - Medical Intelligence System 🫀

CardioAI là hệ thống chẩn đoán và dự báo nguy cơ tim mạch dựa trên các chỉ số sinh học và lối sống, áp dụng thuật toán Machine Learning. Đây là đồ án thực hành cho học phần Khai khoáng Dữ liệu (Data Mining) tại Trường Công nghệ Thông tin và Truyền thông, Đại học Cần Thơ.

## 🌟 Tính năng nổi bật
* **AI Core:** Huấn luyện bằng thuật toán XGBoost với kỹ thuật 5-Fold Cross Validation, đạt độ chính xác (Accuracy) 95% trên tập Test độc lập.
* **Xử lý Dữ liệu:** Chống Data Leakage nghiêm ngặt với quy trình Stratified Split và Scaling cục bộ.
* **Clinical Dashboard:** Giao diện Y khoa chuyên nghiệp, trực quan hóa mức độ rủi ro (Confidence Score) và phân tích đa chiều bằng Radar Chart.

## 🏗️ Kiến trúc Hệ thống (Microservices)
Hệ thống được chia thành 3 phân hệ hoạt động độc lập:
1. **Frontend (React.js + Vite):** Xử lý giao diện người dùng, sử dụng Ant Design và Recharts.
2. **Backend Gateway (Node.js + Express):** Đóng vai trò cầu nối, xử lý logic trung gian và định tuyến API.
3. **AI Service (Python + FastAPI):** Xử lý dữ liệu đầu vào (Pipeline), load mô hình XGBoost (`.json`) và các encoders (`.pkl`) để suy luận (Inference) và trả về kết quả.

## 🚀 Hướng dẫn Cài đặt & Chạy dự án

**Yêu cầu môi trường:** `Node.js` (v18+) · `npm` (v9+) · `Python` (v3.10+)

Cần mở **3 Terminal độc lập** để chạy 3 dịch vụ đồng thời.

### 0. Cấu hình biến môi trường (chạy một lần)
```bash
cd backend
# Windows
copy .env.example .env
# macOS / Linux
cp .env.example .env
```
> File `.env` đã có giá trị mặc định phù hợp cho môi trường local, không cần chỉnh sửa gì thêm.

### 1. Khởi động AI Service – Python / FastAPI (Terminal 1)
```bash
cd models
python -m venv venv

# Kích hoạt môi trường ảo:
# Windows:      .\venv\Scripts\activate
# macOS/Linux:  source venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --reload
# ✅ AI Service chạy tại: http://127.0.0.1:8000
```

### 2. Khởi động Backend Gateway – Node.js / Express (Terminal 2)
```bash
cd backend
npm install
npm start
# ✅ Backend chạy tại: http://localhost:5000
```

### 3. Khởi động Frontend – React / Vite (Terminal 3)
```bash
cd frontend
npm install
npm run dev
# ✅ Giao diện chạy tại: http://localhost:5173
```

## 📊 Bộ Dữ liệu & Đóng góp
Dữ liệu huấn luyện thuộc đồ án môn học Khai khoáng Dữ liệu (Data Mining) tại Trường Công nghệ Thông tin và Truyền thông, Đại học Cần Thơ do Tiến sĩ Lưu Tiến Đạo cung cấp. Cụ thể, dataset có nguồn gốc từ: https://raw.githubusercontent.com/ltdaovn/dataset/master/disease_prediction_2026.csv

Dữ liệu huấn luyện được nhóm thực hiện tiền xử lý kỹ lưỡng, loại bỏ nhiễu và mã hóa tiêu chuẩn. Các artifacts sinh ra sau quá trình huấn luyện (Model, Scaler, Encoders) được đóng gói và nạp trực tiếp vào pipeline API.
