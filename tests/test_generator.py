from PIL import Image
# test_generator.py

from unittest.mock import patch
from icon_generator import generator


def test_get_category_names():
    with patch('os.listdir', return_value=['dir1', 'dir2']), \
         patch('os.path.isdir', return_value=True):
        assert generator.get_category_names() == ['dir1', 'dir2']


def test_get_os_names():
    with patch('os.listdir', return_value=['dir1', 'dir2']), \
         patch('os.path.isdir', return_value=True):
        assert generator.get_os_names() == ['dir1', 'dir2']


def test_get_mask_name():
    with patch('icon_generator.generator.get_file_names', return_value=['file1', 'file2']):
        assert generator.get_mask_name() == ['file1', 'file2']


def test_load_os_images():
    with patch('icon_generator.generator.load_image_files', return_value=['img1', 'img2']):
        assert generator.load_os_images() == ['img1', 'img2']


def test_load_mask_images():
    with patch('icon_generator.generator.load_image_files', return_value=['img1', 'img2']):
        assert generator.load_mask_images() == ['img1', 'img2']


def test_get_center_coordinate():
    image = Image.new('RGB', (100, 200))
    assert generator.get_center_coordinate(image) == (50, 100)
    assert generator.get_center_coordinate(image, 20) == (50, 120)


def test_save_image_variants(tmpdir):
    image = Image.new('RGB', (100, 200))
    output_folder_path = tmpdir.mkdir("sub")
    with patch('icon_generator.generator.get_file_names', return_value=['file1', 'file2']), \
         patch('icon_generator.generator.save_image') as mock_save_image:

        generator.save_image_variants(image, str(output_folder_path), 'category', 'filename', 'maskfilename', [(50, 100), (200, 400)])

        assert mock_save_image.call_count == 2
