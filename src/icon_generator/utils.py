import os
import shutil
from pathlib import Path

from PIL import Image


def get_subfolder(file_path: str, search_term: str, folder_depth: int) -> str:
    """
    Return the subfolder names at a specified depth if the path contains the search term.
    """

    # Split the path into a list of folders
    folders = os.path.normpath(file_path).split(os.path.sep)

    # Check if the search term exists in the path
    if search_term not in folders:
        return None

    # Find the position of the search term
    search_term_position = folders.index(search_term)

    # Check if the desired depth is available
    if search_term_position + folder_depth >= len(folders):
        return None

    # Return the combined name of the subfolders at the desired depth
    return os.path.sep.join(folders[search_term_position + 1:search_term_position + folder_depth + 1])


def get_filename(file_path: str) -> str:
    """
    Return the base name of a file without its extension.
    """
    base_name = os.path.basename(file_path)
    file_name_without_extension = os.path.splitext(base_name)[0]
    return file_name_without_extension

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

def get_file_names(folder_path:str, file_extension:str):
    """
    Get the names of all files with the specified extension in a given folder.
    """
    return [file for file in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, file)) and file.endswith(file_extension)]


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
