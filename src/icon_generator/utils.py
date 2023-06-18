import os
import shutil
from pathlib import Path

from PIL import Image


def ensure_folder_exists(folder_path: str):
    """
    Ensure a directory exists. If not, it creates it.
    """
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)


def reset_folder(folder_path: str):
    """
    If the directory exists, delete it along with all its contents.
    Then create an empty directory with the same name.
    """
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)
    os.makedirs(folder_path)


def get_file_info(file_path: str) -> tuple:
    """
    Get the filename and extension of a file from its path.
    """
    file_path = Path(file_path)
    return file_path.stem, file_path.suffix


def load_image_files(image_folder_path: str, image_file_extension: str = '.png') -> list:
    """
    Load image files with a specific extension from a directory into a list.
    """
    folder_path = Path(image_folder_path)
    file_paths = []

    for root, dirs, files in os.walk(folder_path):
        for file_name in files:
            if file_name.endswith(image_file_extension):
                file_path = os.path.join(root, file_name)
                file_paths.append(file_path)

    return file_paths


def save_image(image: Image.Image, folder_path: str, file_name: str):
    """
    Save an image file in a specified directory with a given file name.
    """
    # Ensure the output directory exists
    ensure_folder_exists(folder_path)

    # Create the full file path
    file_path = os.path.join(folder_path, file_name)

    # Save the image
    image.save(file_path)
