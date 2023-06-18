# Import necessary modules and functions

import os

from dotenv import load_dotenv

from icon_generator.generator import (apply_mask, get_category_names,
                                      get_os_names, load_mask_images,
                                      load_os_images, save_image_variants)
from icon_generator.utils import (get_filename, get_inf_file_path,
                                  get_subfolder, reset_folder)
# Load environment variables
load_dotenv()

# Get the output folder path from the environment variable, default to './output'
output_folder_path = os.getenv('OUTPUT_FOLDER', './output')

# Define the sizes for the icon variants
sizes = [(16, 16), (32, 32), (48, 48), (64, 64),
         (128, 128), (256, 256), (512, 512)]

# Load base images and mask images
base_images = load_os_images()
mask_images = load_mask_images()

# Get the list of operating system names and category names
os_names = get_os_names()
category_names = get_category_names()

# Reset the output folder, i.e., remove it and its contents if it exists, then create a new one
reset_folder(output_folder_path)

# Loop over each base image path
for base_image_path in base_images:
    # Get the folder name for the OS and the filename of the image
    os_folder = get_subfolder(base_image_path, "os_folders", 2)
    os_folder_filename = get_filename(base_image_path)

    # Get the filename and config file path of the base image
    filename = get_filename(base_image_path)
    os_folder_config = get_inf_file_path(base_image_path)

    # Loop over each mask image path
    for mask_image_path in mask_images:
        # Get the filename of the mask image and the name of the category it belongs to
        maskfilename = get_filename(mask_image_path)
        category_name = get_subfolder(mask_image_path, "masks", 1)

        # Apply the mask image to the base image
        combined_image = apply_mask(
            base_image_path, mask_image_path, os_folder_config, proportion=0.4, alpha=0.25)

        # Save the combined image in different sizes
        save_image_variants(
            combined_image, f"{output_folder_path}/{os_folder}/", category_name, filename, maskfilename, sizes)
