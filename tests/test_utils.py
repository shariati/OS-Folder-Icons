# test_utils.py
import os
import configparser
from pathlib import Path
from icon_generator.utils import (get_inf_file_path,
                                  read_padding_info, get_subfolder, get_filename, ensure_folder_exists, save_image, reset_folder, get_file_names, get_file_info, load_image_files)


def test_get_inf_file_path(tmp_path: Path):
    png_file = tmp_path / 'test.png'
    inf_file = tmp_path / 'base_info.inf'
    png_file.touch()
    inf_file.touch()

    assert get_inf_file_path(str(png_file)) == str(inf_file)

    os.remove(inf_file)
    assert get_inf_file_path(str(png_file)) is None


def test_read_padding_info(tmp_path: Path):
    inf_file = tmp_path / 'test.inf'
    config = configparser.ConfigParser()
    config.add_section('image_calibration')
    config.set('image_calibration', 'padding_top', '10')

    with open(inf_file, 'w') as f:
        config.write(f)

    assert read_padding_info(str(inf_file)) == 10

    # Remove the .inf file
    os.remove(inf_file)
    assert read_padding_info(str(inf_file)) is 0

    # Check with a non .inf file
    non_inf_file = tmp_path / 'test.txt'
    non_inf_file.touch()
    assert read_padding_info(str(non_inf_file)) is None


def test_get_subfolder():
    path = '/usr/home/user/icon_generator/test/sub'
    assert get_subfolder(path, 'icon_generator', 2) == 'test/sub'

    assert get_subfolder(path, 'icon_generator', 3) is None
    assert get_subfolder(path, 'not_in_path', 1) is None


def test_get_filename():
    assert get_filename('/usr/home/user/icon_generator/test.png') == 'test'
    assert get_filename('test.png') == 'test'


def test_ensure_folder_exists(tmp_path: Path):
    new_folder = tmp_path / 'new_folder'
    assert not os.path.exists(new_folder)

    ensure_folder_exists(str(new_folder))
    assert os.path.exists(new_folder)


def test_reset_folder(tmp_path: Path):
    new_folder = tmp_path / 'new_folder'
    new_folder.mkdir()
    (new_folder / 'new_file.txt').touch()

    assert os.path.exists(new_folder / 'new_file.txt')

    reset_folder(str(new_folder))
    assert os.path.exists(new_folder)
    assert not os.path.exists(new_folder / 'new_file.txt')


def test_get_file_names(tmp_path: Path):
    (tmp_path / 'test1.png').touch()
    (tmp_path / 'test2.png').touch()
    (tmp_path / 'test3.txt').touch()

    assert set(get_file_names(str(tmp_path), '.png')
               ) == set(['test1.png', 'test2.png'])
    assert set(get_file_names(str(tmp_path), '.txt')) == set(['test3.txt'])


def test_get_file_info():
    assert get_file_info(
        '/usr/home/user/icon_generator/test.png') == ('test', '.png')
    assert get_file_info('test.png') == ('test', '.png')


def test_load_image_files(tmp_path: Path):
    (tmp_path / 'test1.png').touch()
    (tmp_path / 'test2.png').touch()
    (tmp_path / 'test3.txt').touch()

    assert set(load_image_files(str(tmp_path), '.png')) == set(
        [str(tmp_path / 'test1.png'), str(tmp_path / 'test2.png')])
    assert load_image_files(str(tmp_path), '.txt') == [
        str(tmp_path / 'test3.txt')]

