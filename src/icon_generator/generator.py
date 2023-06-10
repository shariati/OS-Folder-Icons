from PIL import Image, ImageDraw, ImageFont
from .utils import create_directory

def generate_folder_icon(base_image_path, icon, font_file, icon_size, output_path):
    """Generate a folder icon with the provided parameters."""
    # Load the base image
    base_image = Image.open(base_image_path).convert('RGBA')
    base_width, base_height = base_image.size

    # Create a new image with transparent background
    new_image = Image.new('RGBA', (base_width, base_height), (0, 0, 0, 0))

    # Paste the base image onto the new image
    new_image.paste(base_image, (0, 0))

    # Load the Font Awesome font
    font = ImageFont.truetype(font_file, icon_size)

    # Calculate the position to center the icon
    icon_width, icon_height = font.getsize(icon)
    icon_x = (base_width - icon_width) // 2
    icon_y = (base_height - icon_height) // 2

    # Create a transparent image for the icon
    icon_image = Image.new('RGBA', (icon_width, icon_height), (0, 0, 0, 0))

    # Draw the icon onto the transparent image
    icon_draw = ImageDraw.Draw(icon_image)
    icon_draw.text((0, 0), icon, font=font, fill=(0, 0, 0, 255))

    # Paste the icon onto the new image
    new_image.paste(icon_image, (icon_x, icon_y), icon_image)

    # Save the folder icon
    new_image.save(output_path)

def generate_folder_icons(base_images, icons, font_file, icon_size, output_directory):
    """Generate different folder icons for each OS."""
    create_directory(output_directory)

    for os_name, base_image_file in base_images.items():
        base_image_path = get_base_image_path(os_name)
        icon = icons[os_name]

        for variation, variation_suffix in variations:
            for size in sizes:
                filename = f'{os_name}_{variation}{variation_suffix}_{size[0]}x{size[1]}.png'
                output_path = os.path.join(output_directory, filename)
                generate_folder_icon(base_image_path, icon, font_file, icon_size, output_path)
                print(f'Saved: {output_path}')
