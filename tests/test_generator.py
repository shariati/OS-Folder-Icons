import os
from icon_generator.generator import load_os_images, load_mask_images, get_center_coordinate, apply_mask, save_image_variants
from PIL import Image
from unittest import mock

def test_get_center_coordinate():
    image = Image.new('RGB', (60, 80), color = 'red')
    center_x, center_y = get_center_coordinate(image)
    assert center_x == 30
    assert center_y == 40
