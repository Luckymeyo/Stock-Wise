import pandas as pd

# Daftar pizza yang diizinkan
pizza_list = [
    'The Barbecue Chicken Pizza',
    'The Big Meat Pizza',
    'The Five Cheese Pizza',
    'The Hawaiian Pizza',
    'The Mexicana Pizza',
    'The California Chicken Pizza',
    'The Classic Deluxe Pizza',
    'The Italian Vegetables Pizza',
    'The Soppressata Pizza',
    'The Brie Carre Pizza'
]

# Baca file Excel
excel_path = "./transactions.xlsx"
df = pd.read_excel(excel_path, usecols=["order_id", "quantity", "order_date", "unit_price", "pizza_name"])

# Filter hanya baris dengan pizza_name yang valid
df_filtered = df[df["pizza_name"].isin(pizza_list)].copy()

# Simpan sebagai CSV
csv_path = "./transactions.csv"
df_filtered.to_csv(csv_path, index=False)

print(f"Filtered CSV saved to {csv_path} with {len(df_filtered)} rows.")
