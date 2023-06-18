import os

from dotenv import load_dotenv
from PIL import Image, ImageFilter

from icon_generator.utils import (get_file_names, load_image_files,
                                  read_padding_info, save_image)

load_dotenv()


mask_folder_path = os.getenv('MASK_FOLDER_PATH')
base_folder_path = os.getenv('BASE_FOLDER_PATH')
image_file_extension = os.getenv('IMAGE_FILE_EXTENSION', '.png')


def get_category_names(base_folder_path=mask_folder_path):
    """
    Returns a list of names of all first-level directories in the base folder.
    These directory names are treated as category names.
    """
    return [name for name in os.listdir(base_folder_path) if os.path.isdir(os.path.join(base_folder_path, name))]


def get_os_names(base_folder_path=base_folder_path):
    """
    Returns a list of names of all first-level directories in the base folder.
    These directory names are treated as operating system names.
    """
    return [name for name in os.listdir(base_folder_path) if os.path.isdir(os.path.join(base_folder_path, name))]


def get_mask_name(mask_folder_path=mask_folder_path):
    """
    Returns a list of filenames of all files in the mask folder.
    """
    return get_file_names(mask_folder_path)


def load_os_images(base_folder_path=base_folder_path):
    """
    Loads all available images for each operating system, returns them in a list.
    """
    return load_image_files(base_folder_path, image_file_extension)


def load_mask_images(mask_folder_path=mask_folder_path):
    """
    Loads all available mask images, returns them in a list.
    """
    return load_image_files(mask_folder_path, image_file_extension)


def get_center_coordinate(image, top_padding_percent=0):
    """
    Calculates and returns the center coordinates (x, y) of an image.
    The y-coordinate is adjusted for optional top padding.
    """
    width, height = image.size
    center_y = height // 2
    center_y += int(center_y * top_padding_percent / 100)

    return width // 2, center_y


def apply_mask(base_image_path, mask_image_path, config=None, proportion=0.6, alpha=0.9):
    """
    Applies a mask image to the center of a base image. 
    If the mask is larger than a certain proportion of the base image size, it is resized.
    The opacity of the mask can be adjusted using the 'alpha' parameter.
    If the mask requires calibration (e.g. to adjust the top padding), a config file can be passed.
    Returns the image with the mask applied.
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
        edges = mask_image.filter(ImageFilter.FIND_EDGES)

    # Adjust alpha (opacity) of the mask image
    r, g, b, a = mask_image.split()
    a = a.point(lambda p: p * alpha)
    mask_image = Image.merge('RGBA', (r, g, b, a))

    # Calculate the position to center the mask
    if config is not None:
        top_padding = read_padding_info(config)
        center_x, center_y = get_center_coordinate(base_image, top_padding)
    else:
        center_x, center_y = get_center_coordinate(base_image)

    mask_x, mask_y = get_center_coordinate(mask_image)

    top_left_x = center_x - mask_x
    top_left_y = center_y - mask_y

    # Create a new blank (transparent) image with the same size as the base image
    temp_img = Image.new('RGBA', base_image.size)

    # Paste the mask image into the center of the new image
    temp_img.paste(mask_image, (top_left_x, top_left_y))

    # Composite the images
    combined = Image.alpha_composite(base_image, temp_img)
    return combined


def save_image_variants(image, output_folder_path, os_names, filename, maskfilename, sizes):
    """
    Saves the image in different sizes as specified by the sizes list. 
    The filenames of the resized images include the original filename and the mask filename.
    The images are saved in the output folder, inside subfolders named after their sizes.
    """
    
    os_names = get_file_names(f"{base_folder_path}/{os_names}",image_file_extension)
    for size in sizes:
        resized_image = image.resize(size, Image.ANTIALIAS)
        new_filename = f"{filename}-{maskfilename}{image_file_extension}"
        save_image(resized_image,
                   f"{output_folder_path}/{size[0]}x{size[1]}", new_filename)
