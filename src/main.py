import os
from dotenv import load_dotenv
from icon_generator.generator import load_os_images, load_mask_images, apply_mask, save_image_variants

load_dotenv()

output_folder_path = os.getenv('OUTPUT_FOLDER', './output')

# Define the sizes
sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256), (512, 512)]

# Load base images and mask images
base_images = load_os_images()
mask_images = load_mask_images()

for base_image_path in base_images:
    for mask_image_path in mask_images:
        combined_image = apply_mask(base_image_path, mask_image_path, proportion=0.6)
        save_image_variants(combined_image, output_folder_path, sizes)
