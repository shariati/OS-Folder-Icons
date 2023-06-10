from PIL import Image, ImageDraw, ImageFont
import os

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

# Create the output folder if it doesn't exist
os.makedirs(output_folder, exist_ok=True)

# Load the Font Awesome font
font = ImageFont.truetype(font_file, icon_size)

# Iterate over each OS
for os_name, base_image_file in base_images.items():
    # Load the base image
    base_image = Image.open(base_image_file).convert('RGBA')
    base_width, base_height = base_image.size
    
    # Create a new image with transparent background
    new_image = Image.new('RGBA', (base_width, base_height), (0, 0, 0, 0))
    
    # Paste the base image onto the new image
    new_image.paste(base_image, (0, 0))
    
    # Get the icon Unicode code for the current OS
    icon = icons[os_name]
    
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
    
    # Generate different variations and sizes for the folder icon
    variations = [('normal', ''), ('active', '_active')]
    sizes = [(16, 16), (32, 32), (48, 48)]
    
    for variation, variation_suffix in variations:
        for size in sizes:
            # Resize the image to the desired size
            resized_image = new_image.resize(size, Image.ANTIALIAS)
            
            # Save the folder icon with the appropriate filename
            filename = f'{os_name}_{variation}{variation_suffix}_{size[0]}x{size[1]}.png'
            output_path = os.path.join(output_folder, filename)
            resized_image.save(output_path)
            print(f'Saved: {output_path}')
