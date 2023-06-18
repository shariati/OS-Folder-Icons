import os
from PIL import Image
from utils import load_base_files, load_mask_files, apply_mask_to_images

# Array to store the file names
mask_file_list = []
base_file_list = []

# List to store the folder paths, file paths, and file names
mask_file_list = load_mask_files()
base_file_list = load_base_files()
sizes = [(16, 16), (32, 32), (48, 48), (64, 64),
         (128, 128), (256, 256), (512, 512)]

print("Mask files:",mask_file_list)
# Create the output directory
output_dir = 'output'
os.makedirs(output_dir, exist_ok=True)

for mask_file in mask_file_list:
    # Apply the function

    for base_file in base_file_list:
        # Load the background image
        print("Mask:", mask_file)
        print("Base:", base_file)
        apply_mask_to_images(mask_file, base_file, output_dir, sizes)

