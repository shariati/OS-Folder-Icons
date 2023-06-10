from .generator import generate_folder_icons
from .utils import clean_output_directory

# Specify the base folder images for each OS
base_images = {
    'windows': 'windows_base.png',
    'macos': 'macos_base.png',
    'linux': 'linux_base.png'
}

# Specify the font file and size for the icons
font_file = 'fontawesome.ttf'
icon_size = 48

# Specify the output folder
output_folder = 'output'

# Specify the icon names and their corresponding Unicode codes
icons = {
    'windows': '\uf07c',  # Windows icon
    'macos': '\uf179',  # macOS icon
    'linux': '\uf17c'  # Linux icon
}

# Clean the output directory
clean_output_directory(output_folder)

# Generate the folder icons
generate_folder_icons(base_images, icons, font_file, icon_size, output_folder)
