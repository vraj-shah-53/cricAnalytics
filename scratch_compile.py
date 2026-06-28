import os
import pandas as pd
import glob
import time

extract_dir = "ipl_extracted"
info_files = glob.glob(os.path.join(extract_dir, "*_info.csv"))

print(f"Found {len(info_files)} match info files.")

match_rows = []
delivery_dfs = []

start_time = time.time()

# To keep the test fast, let's compile all of them but print progress.
# If it's too slow we can optimize it.
count = 0
for info_file in info_files:
    match_id = os.path.basename(info_file).replace("_info.csv", "")
    deliv_file = os.path.join(extract_dir, f"{match_id}.csv")
    
    if not os.path.exists(deliv_file):
        continue
        
    # Read match info
    info_dict = {"match_id": match_id}
    # Parse key-value info
    with open(info_file, 'r', encoding='utf-8') as f:
        # Some info files might have player rows with multiple commas
        for line in f:
            parts = line.strip().split(',', 2)
            if len(parts) >= 3 and parts[0] == 'info':
                key = parts[1]
                val = parts[2].strip('"')
                if key in ['team', 'player', 'umpire']:
                    if key not in info_dict:
                        info_dict[key] = []
                    info_dict[key].append(val)
                else:
                    info_dict[key] = val
                    
    match_rows.append(info_dict)
    
    # Read deliveries
    deliv_df = pd.read_csv(deliv_file)
    delivery_dfs.append(deliv_df)
    
    count += 1
    if count % 200 == 0:
        print(f"Processed {count} matches...")

print(f"Parsed info and deliveries in {time.time() - start_time:.2f} seconds.")

# Combine
matches_df = pd.DataFrame(match_rows)
# Convert list columns to strings for easier CSV storage if needed
matches_df['teams'] = matches_df['team'].apply(lambda x: ",".join(x) if isinstance(x, list) else "")
matches_df.drop(columns=['team'], inplace=True, errors='ignore')

deliveries_df = pd.concat(delivery_dfs, ignore_index=True)

print("Matches shape:", matches_df.shape)
print("Deliveries shape:", deliveries_df.shape)

# Save to CSV or Parquet
# Parquet is much faster and smaller. Let's see if we can use parquet.
# We'll save to csv for simplicity of loading without extra dependencies, or parquet if fastparquet/pyarrow is installed.
start_save = time.time()
matches_df.to_csv("matches_compiled.csv", index=False)
deliveries_df.to_csv("deliveries_compiled.csv", index=False)
print(f"Saved compiled datasets in {time.time() - start_save:.2f} seconds.")
