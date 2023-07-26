import os

# Specify the path to the output directory and the docs directory
output_folder_path = os.getenv('OUTPUT_FOLDER', './output')
docs_folder_path = './docs'
github_username = os.getenv('GITHUB_USERNAME', 'shariati')
github_repo_name = os.getenv('GITHUB_REPOSITORY_NAME', 'OS-Folder-Icons')


# Make sure the docs directory exists
os.makedirs(docs_folder_path, exist_ok=True)

# Open the index.md file in write mode
with open(os.path.join(docs_folder_path, 'index.md'), 'w') as f:
    # Write the H1 header for "Icon Generator Output"
    f.write("# OS Folder Icons 📂 \n\n")
    f.write(f"[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://opensource.org/licenses/MIT) \n\n Collection of custom folder 📂 icons for MacOS, Linux, and Windows. \n ## What folder icons would you want? \nHey, guess what? I am open to suggestions 😉 so you can just let me know what icons you would like?")
    f.write(f"\n\n### How to ask for a Folder Icon?")
    f.write(f"\n\nSimple😎")
    f.write(f"\n\n- Drop us a message 💬 [here](https://github.com/shariati/OS-Folder-Icons/issues/new).")
    f.write(f"\n## Collection\n\n")
    f.write(f"The collections are sorted Alphabatically 🔤.")

    # Traverse the output directory
    for category_folder in os.listdir(output_folder_path):
        category_path = os.path.join(output_folder_path, category_folder)

        # Check if the item in the output folder is a directory
        if os.path.isdir(category_path):
            # Write the H2 header for the category
            f.write(f"\n## {category_folder.capitalize()}\n\n")

            for os_folder in os.listdir(category_path):
                os_path = os.path.join(category_path, os_folder)

                # Check if the item in the category folder is a directory
                if os.path.isdir(os_path):
                    # Write the H3 header for the OS name
                    f.write(f"\n### {os_folder.capitalize()}\n\n")

                    # Traverse the OS folder and find the 64x64 images
                    for root, dirs, files in os.walk(os_path):
                        for file in files:
                            # If the file is a 64x64 image, write its path to the file
                            if file.endswith('.png') and '64x64' in root:
                                # Calculate the relative path from the docs directory to the image
                                rel_path = os.path.relpath(os.path.join(root, file), docs_folder_path)

                                # Write the image path with Markdown syntax to the file
                                f.write(f"![{file}](https://{github_username}.github.io/{github_repo_name}/{file})")

    f.write(f"\n\n## License\n\n")
    f.write(f"This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details")  
    f.write(f"\n\n### Brand Images")
    f.write(f"\n- All brand icons are trademarks of their respective owners.")
    f.write(f"\n- The use of these trademarks does not indicate endorsement of the trademark holder by OS Folder Icons (Amin Shariati and Sarah Ghanbarzadeh), nor vice versa.")
    f.write(f"\n- Brand icons should only be used to represent the company or product to which they refer.")
    f.write(f"\n- Please do not use brand logos for any purpose except to represent that particular brand or service.")






    