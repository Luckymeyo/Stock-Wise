from fastapi import FastAPI, HTTPException,  Form
from datetime import datetime, timedelta, date
from pydantic import BaseModel
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import os
from tensorflow.keras.models import load_model
import numpy as np
import math

CSV_FILE = "transactions.csv"

df = pd.read_csv(CSV_FILE, usecols=["order_id", "quantity", "order_date", "unit_price", "pizza_name"])
df_grouped = df.groupby(['order_date', 'pizza_name'])['quantity'].sum().reset_index()

app = FastAPI()

# Load semua model
models = {
    "The Barbecue Chicken Pizza": load_model("The_Barbecue_Chicken_Pizza-model.h5"),
    "The Big Meat Pizza": load_model("The_Big_Meat_Pizza-model.h5"),
    "The Brie Carre Pizza": load_model("The_Brie_Carre_Pizza-model.h5"),
    "The California Chicken Pizza": load_model("The_California_Chicken_Pizza-model.h5"),
    "The Classic Deluxe Pizza": load_model("The_Classic_Deluxe_Pizza-model.h5"),
    "The Hawaiian Pizza":  load_model("The_Hawaiian_Pizza-model.h5"),
    "The Italian Vegetables Pizza": load_model("The_Italian_Vegetables_Pizza-model.h5"),
    "The Mexicana Pizza":  load_model("The_Soppressata_Pizza-model.h5"),
    "The Soppressata Pizza": load_model("The_Soppressata_Pizza-model.h5"),
    "The Five Cheese Pizza": load_model("The_Five_Cheese_Pizza-model.h5")
}


# Model validasi input
class Transaction(BaseModel):
    order_id: str
    pizza_name: str
    quantity: int
    order_date: str  # format: 'YYYY-MM-DD'
    unit_price: float



origins = [

    "*",  # Kalau mau buka semua origin (untuk development, hati-hati di production)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # bisa juga ["*"] kalau mau semua origin boleh
    allow_credentials=True,
    allow_methods=["*"],  # izinkan semua method GET, POST, dll
    allow_headers=["*"],  # izinkan semua headers
)

@app.get("/")
async def root():
    return {"message": "Hello World from FastAPI!"}


@app.get("/transactions")
async def get_transactions():
    # Baca file Excel
    # Pastikan order_date bertipe datetime
    df["order_date"] = pd.to_datetime(df["order_date"])

    # Urutkan berdasarkan order_date (terbaru dulu), ambil 100 teratas
    df_sorted = df.sort_values(by="order_date", ascending=False)

    # Ubah DataFrame ke list of dict (JSON friendly)
    transactions = df_sorted.to_dict(orient="records")

    return transactions


@app.post("/transactions")
async def add_transaction(transaction: Transaction):
    # Buat dict dari input
    new_data = {
        "order_id": transaction.order_id,
        "quantity": transaction.quantity,
        "order_date": transaction.order_date,
        "unit_price": transaction.unit_price,
        "pizza_name": transaction.pizza_name
    }

    # Jika file sudah ada, append; jika belum, buat baru
    if os.path.exists(CSV_FILE):
        df = pd.read_csv(CSV_FILE)
        df = pd.concat([df, pd.DataFrame([new_data])], ignore_index=True)
    else:
        df = pd.DataFrame([new_data])

    # Simpan kembali ke CSV
    df.to_csv(CSV_FILE, index=False)

    return {"message": "Transaction added successfully"}

def get_data_between_dates(start: date, end: date):
    # Load data CSV (pastikan path df_grouped benar)
    global df_grouped  # Jika ini variabel global, tetap bisa akses
    df_grouped["order_date"] = pd.to_datetime(df_grouped["order_date"])

    # Ambil semua nama pizza unik
    all_pizza_names = df_grouped["pizza_name"].unique()

    # Buat semua tanggal dalam rentang
    date_range = pd.date_range(start=start, end=end)

    # Buat DataFrame dari kombinasi semua tanggal dan pizza
    all_combinations = pd.MultiIndex.from_product(
        [date_range, all_pizza_names],
        names=["order_date", "pizza_name"]
    ).to_frame(index=False)

    # Gabungkan dengan data asli
    merged = pd.merge(
        all_combinations,
        df_grouped,
        how="left",
        on=["order_date", "pizza_name"]
    )

    # Isi NaN quantity jadi 0
    merged["quantity"] = merged["quantity"].fillna(0)

    # Urutkan hasil akhir
    merged = merged.sort_values(["pizza_name", "order_date"])

    return merged

def predict_all_pizzas(input_data: np.ndarray):
    """
    input_data shape harus sesuai dengan model, misal (1,7,1)
    Mengembalikan dict nama pizza dan prediksi
    """
    predictions = {}
    for name, model in models.items():
        pred = model.predict(input_data)
        predictions[name] = float(pred[0][0])  # ambil nilai prediksi float
    return predictions

@app.post("/predict")
async def predict(predict_date: str = Form(...)):
    print(f"Received predict_date: {predict_date}")

    # Ubah string ke date
    target_date = datetime.strptime(predict_date, "%Y-%m-%d").date()
    start_date = target_date - timedelta(days=7)

    # Ambil data dari database
    data = get_data_between_dates(start_date, target_date)

    predictions = {}

    for pizza_name, model in models.items():
        # Ambil hanya data untuk pizza ini
        pizza_data = data[data["pizza_name"] == pizza_name].sort_values("order_date")
        print(f"Processing pizza: {pizza_name}, data length: {len(pizza_data)}")
        # Validasi minimal 7 data
        if len(pizza_data) < 7:
            predictions[pizza_name] = "Not enough data"
            continue

        # Ambil 7 kuantitas terakhir
        last_7_qty = pizza_data["quantity"].values[-7:]
        input_data = np.array(last_7_qty).reshape(1, 7, 1)

        # Prediksi
        pred = model.predict(input_data)
        predictions[pizza_name] = math.ceil(float(pred[0][0]))

    return {"predictions": predictions}