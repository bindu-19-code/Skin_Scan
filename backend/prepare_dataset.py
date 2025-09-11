import os
import shutil
import splitfolders

# Paths to the 4 datasets (relative to backend/)
datasets = [
    "dataset/ham10000",
    "dataset/Skin_Conditions",
    "dataset/test",
    "dataset/train"
]

# Where to merge everything
merged_path = "dataset/merged"
os.makedirs(merged_path, exist_ok=True)

# Step 1: Merge all datasets into merged/
for dataset in datasets:
    if not os.path.exists(dataset):
        print(f"❌ Path not found: {dataset}")
        continue

    for class_name in os.listdir(dataset):
        class_path = os.path.join(dataset, class_name)
        if not os.path.isdir(class_path):
            continue  # skip files

        target_class_path = os.path.join(merged_path, class_name)
        os.makedirs(target_class_path, exist_ok=True)

        for img in os.listdir(class_path):
            src = os.path.join(class_path, img)
            dst = os.path.join(target_class_path, f"{os.path.basename(dataset)}_{img}")
            shutil.copy(src, dst)

print("✅ All datasets merged into:", merged_path)

# Step 2: Split into train/val
output_folder = "dataset/all_datasets"
splitfolders.ratio(merged_path, output=output_folder, seed=42, ratio=(.8, .2))

print("✅ Dataset split into train/ and val/ at:", output_folder)
