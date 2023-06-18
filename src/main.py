import os

from dotenv import load_dotenv

from icon_generator.generator import (apply_mask, get_category_names,
                                      get_os_names, load_mask_images,
                                      load_os_images, save_image_variants)
from icon_generator.utils import (get_subfolder, get_filename, reset_folder,get_inf_file_path)
load_dotenv()

output_folder_path = os.getenv('OUTPUT_FOLDER', './output')

# Define the sizes
sizes = [(16, 16), (32, 32), (48, 48), (64, 64),
         (128, 128), (256, 256), (512, 512)]

# Load base images and mask images
base_images = load_os_images()
mask_images = load_mask_images()

# usage:
os_names = get_os_names()
category_names = get_category_names()

reset_folder(output_folder_path)

for base_image_path in base_images:
    os_folder = get_subfolder(base_image_path, "os_folders", 2)
    os_folder_filename = get_filename(base_image_path)
    filename = get_filename(base_image_path)
    os_folder_config = get_inf_file_path(base_image_path)
    for mask_image_path in mask_images:
        maskfilename = get_filename(mask_image_path)
        category_name = get_subfolder(mask_image_path, "masks", 1)
        combined_image = apply_mask(base_image_path, mask_image_path, os_folder_config, proportion=0.4)
        save_image_variants(
                     combined_image, f"{output_folder_path}/{os_folder}/",category_name, filename, maskfilename, sizes)
   
