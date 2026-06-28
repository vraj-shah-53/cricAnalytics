import urllib.request
import zipfile
import os

zip_url = "https://cricsheet.org/downloads/ipl_male_csv2.zip"
zip_path = "ipl_male_csv2.zip"
extract_dir = "ipl_extracted"

print(f"Downloading {zip_url}...")
urllib.request.urlretrieve(zip_url, zip_path)
print("Download complete. Extracting...")

os.makedirs(extract_dir, exist_ok=True)
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    zip_ref.extractall(extract_dir)

print("Extraction complete. Listing first 15 files:")
files = os.listdir(extract_dir)
for f in files[:15]:
    print(f)

print(f"Total files extracted: {len(files)}")
