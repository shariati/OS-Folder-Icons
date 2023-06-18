import configparser
import os
import shutil
from pathlib import Path

from PIL import Image


def get_inf_file_path(image_file_path: str) -> str:
    """
    Takes an image file path as input and returns the path of the corresponding 'base_info.inf' file 
    in the same directory. If the 'base_info.inf' file doesn't exist, returns None.
    """
    # Create a Path object from the .png file path
    png_path = Path(image_file_path)
    # Replace the filename with 'base_info.inf'
    base_info_path = png_path.parent / 'base_info.inf'
    # Check if the 'base_info.inf' file exists
    if not base_info_path.exists():
        return None

    return str(base_info_path)


def read_padding_info(file_path):
    """
    Reads the padding information from a given .inf file. Returns an integer representing 
    the padding value, or 0 if the provided file is not a .inf file.
    """
    filename, extension = get_file_info(file_path)
    if extension != '.inf':
        return None
    config = configparser.ConfigParser()
    config.read(file_path)

    return int(config.get('image_calibration', 'padding_top', fallback=0))


def get_subfolder(file_path: str, search_term: str, folder_depth: int) -> str:
    """
    Returns the names of the subfolders at a specified depth if the path contains the 
    given search term. Returns None if the search term is not present in the path or 
    if the desired depth is not available.
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
    Returns the base name of a given file without its extension.
    """
    base_name = os.path.basename(file_path)
    file_name_without_extension = os.path.splitext(base_name)[0]
    return file_name_without_extension


def ensure_folder_exists(folder_path: str):
    """
    Checks if a directory exists at the given path, and if not, creates it.
    """
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)


def reset_folder(folder_path: str):
    """
    If the directory exists at the given path, deletes it along with all its contents. 
    Then, creates an empty directory with the same name.
    """
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)
    os.makedirs(folder_path)


def get_file_names(folder_path: str, file_extension: str) -> list:
    """
    Returns the names of all files with the specified extension in a given directory.
    """
    return [file for file in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, file)) and file.endswith(file_extension)]


def get_file_info(file_path: str) -> tuple:
    """
    Returns a tuple containing the filename and extension of a given file, derived from its path.
    """
    file_path = Path(file_path)
    return file_path.stem, file_path.suffix


def load_image_files(image_folder_path: str, image_file_extension: str = '.png') -> list:
    """
    Loads all image files with a specific extension from a directory, and returns them in a list.
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
    Saves an image file in a specified directory with a given filename. If the directory 
    does not exist, it creates the directory before saving the image.
    """
    # Ensure the output directory exists
    ensure_folder_exists(folder_path)

    # Create the full file path
    file_path = os.path.join(folder_path, file_name)

    # Save the image
    image.save(file_path)
