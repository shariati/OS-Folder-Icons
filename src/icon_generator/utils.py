import os
from PIL import Image, ImageDraw, ImageFont

def create_directory(directory):
    """Create a directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)

def delete_directory(directory):
    """Delete a directory if it exists."""
    if os.path.exists(directory):
        shutil.rmtree(directory)

def clean_output_directory(output_directory):
    """Remove all files and subdirectories from the output directory."""
    delete_directory(output_directory)
    create_directory(output_directory)

def get_base_image_path(os_name):
    """Get the path to the base image file for the given OS."""
    base_images_directory = os.path.join('src', 'icons')
    base_image_file = f'{os_name}_base.png'
    return os.path.join(base_images_directory, base_image_file)
