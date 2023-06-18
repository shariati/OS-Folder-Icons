import os
from icon_generator.utils import ensure_folder_exists, reset_folder, load_image_files, get_file_info
from unittest import mock

def test_ensure_folder_exists():
    with mock.patch("os.makedirs") as mock_makedirs:
        ensure_folder_exists("./test_folder")
        mock_makedirs.assert_called_once_with("./test_folder")

def test_reset_folder():
    with mock.patch("shutil.rmtree") as mock_rmtree, mock.patch("os.makedirs") as mock_makedirs:
        reset_folder("./test_folder")
        mock_rmtree.assert_called_once_with("./test_folder")
        mock_makedirs.assert_called_once_with("./test_folder")

def test_get_file_info():
    filename, extension = get_file_info("/path/to/test_file.png")
    assert filename == "test_file"
    assert extension == ".png"
