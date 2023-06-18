import os
from pathlib import Path
from dotenv import load_dotenv
from PIL import Image

load_dotenv()


mask_folder_path = os.getenv('MASK_FOLDER_PATH')
base_folder_path = os.getenv('BASE_FOLDER_PATH')
base_file_extension = os.getenv('IMAGE_FILE_EXTENSION', '.png')
mask_file_extension = os.getenv('MASK_FILE_EXTENSION', '.svg')

# Validate and handle missing environment variables

if mask_folder_path is None:
    raise ValueError("Missing MASK_FOLDER_PATH environment variable.")

if base_folder_path is None:
    raise ValueError("Missing BASE_FOLDER_PATH environment variable.")


def load_image_files(image_folder_path: str, image_file_extension: str = '.png') -> list:
    """
    Load base files from the specified folder path with the given file extension.

    Args:
        image_folder_path (str): Folder path to load image files from.
        image_file_extension (str): File extension of the base files. By default, it uses '.png'.

    Returns:
        list: List of image file paths.
    """
    folder_path = Path(image_folder_path)
    file_paths = []

    for root, dirs, files in os.walk(folder_path):
        for file_name in files:
            if file_name.endswith(image_file_extension):
                file_path = os.path.join(root, file_name)
                file_paths.append(file_path)

    return file_paths


def load_mask_files(mask_folder_path: str = mask_folder_path) -> list:
    """
    Load mask files from the specified folder path.

    Args:
        mask_folder_path (str): Folder path to load mask files from.

    Returns:
        list: List of mask file paths.
    """
    return load_image_files(mask_folder_path, mask_file_extension)


def load_base_files(base_folder_path: str = base_folder_path) -> list:
    """
    Load base files from the specified folder path with the given file extension.

    Args:
        base_folder_path (str): Folder path to load base folder image files from.

    Returns:
        list: List of base file paths.
    """
    return load_image_files(base_folder_path, base_file_extension)


def print_folders(folder_list: list):
    """
    Print the list of folder paths.

    Args:
        folder_list (list): List of folder paths.
    """
    for folder_path in folder_list:
        print("Folder:", folder_path)


def print_files(file_list: list):
    """
    Print the list of file paths.

    Args:
        file_list (list): List of file paths.
    """
    for file_path in file_list:
        print("File:", file_path)


if __name__ == "__main__":
    mask_file_list = load_mask_files(mask_folder_path)
    print_files(mask_file_list)

    file_list = load_base_files(base_folder_path)
    print_files(file_list)



def apply_mask_to_images(mask_file, folder_image, output_folder, sizes):
    print("Mask:", mask_file)
    # Load the mask image
    mask_img = Image.open(mask_file)
    
    # Ensure the output directory exists
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # Iterate over all the images in the input folder
    if folder_image.endswith('.png'):
        # Open the image
        img = Image.open(folder_image)
            
        # Calculate the coordinates to center the mask
        left = (img.width - mask_img.width)/2
        top = (img.height - mask_img.height)/2
        right = (img.width + mask_img.width)/2
        bottom = (img.height + mask_img.height)/2
            
        # Apply the mask to the image
        img.paste(mask_img, (int(left), int(top), int(right), int(bottom)), mask_img)
            
         # Resize the resulting image and save it
        for size in sizes:
            resized_img = img.resize(size, Image.ANTIALIAS)
                
            # Create a filename that includes the size
            base, ext1 = os.path.splitext(folder_image)
            mask, ext2 = os.path.splitext(mask_file)

            new_filename = f"{base}_{mask}_{size[0]}x{size[1]}{ext1}"
                
            # Save the resized image to the output folder
            resized_img.save(os.path.join(output_folder, new_filename))
