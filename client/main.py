from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()  # ✅ PHẢI CÓ

@app.post("/login")
async def login(request: Request):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")

    print("📩 Backend nhận:", email, password)  # Log để kiểm tra

    # 🧪 Tạm thời cho phép đăng nhập bất kỳ
    return {
        "id": "user-001",
        "email": email,
        "name": "Test"
    }


