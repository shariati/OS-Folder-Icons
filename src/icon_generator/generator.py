import os

from dotenv import load_dotenv
from PIL import Image
from icon_generator.utils import ensure_folder_exists, load_image_files, save_image, get_file_info

load_dotenv()


mask_folder_path = os.getenv('MASK_FOLDER_PATH')
base_folder_path = os.getenv('BASE_FOLDER_PATH')
image_file_extension = os.getenv('IMAGE_FILE_EXTENSION', '.png')




def load_os_images(base_folder_path=base_folder_path):
    """
    Load all available images for each operating system.
    """
    return load_image_files(base_folder_path, image_file_extension)


def load_mask_images(mask_folder_path=mask_folder_path):
    """
    Load all available mask images.
    """
    return load_image_files(mask_folder_path, image_file_extension)


def get_center_coordinate(image):
    """
    Calculate and return the center coordinates of an image.
    """
    width, height = image.size
    return width // 2, height // 2


def apply_mask(base_image_path, mask_image_path, proportion=0.6):
    """
    Apply the mask image at the center of the base image.
    Resize the mask if it's larger than 'proportion' of the base image size.
    """
    base_image = Image.open(base_image_path).convert("RGBA")
    mask_image = Image.open(mask_image_path).convert("RGBA")

    base_width, base_height = base_image.size
    mask_width, mask_height = mask_image.size

    # Resize mask image if it is larger than 'proportion' of the base image size
    if mask_width > base_width * proportion or mask_height > base_height * proportion:
        new_size = (int(base_width * proportion),
                    int(base_height * proportion))
        mask_image = mask_image.resize(new_size, Image.ANTIALIAS)

    # Calculate the position to center the mask
    center_x, center_y = get_center_coordinate(base_image)
    mask_x, mask_y = get_center_coordinate(mask_image)

    top_left_x = center_x - mask_x
    top_left_y = center_y - mask_y

    # Composite the images
    combined = Image.alpha_composite(base_image, mask_image)

    return combined


def save_image_variants(image, output_folder_path, sizes):
    """
    Save the image in different sizes as specified by the sizes list.
    """
    # Make sure output folder exists
    ensure_folder_exists(output_folder_path)
    base, extension = get_file_info(image.filename)
    for size in sizes:
        resized_image = image.resize(size, Image.ANTIALIAS)
        new_filename = f"{base}_{size[0]}x{size[1]}{extension}"
        save_image(resized_image, output_folder_path, new_filename)



