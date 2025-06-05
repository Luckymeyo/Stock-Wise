import pandas as pd

# Baca file Excel
excel_path = "./transactions.xlsx"
df = pd.read_excel(excel_path)

# Simpan sebagai CSV
csv_path = "./transactions.csv"
df.to_csv(csv_path, index=False)
