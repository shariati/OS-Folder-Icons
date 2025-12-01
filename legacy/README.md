# OS Folder Icons 📂

[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://opensource.org/licenses/MIT) 
[![CodeQL](https://github.com/shariati/OS-Folder-Icons/actions/workflows/codeql.yml/badge.svg)](https://github.com/shariati/OS-Folder-Icons/actions/workflows/codeql.yml)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/S6S2QRA2Y)

Collection of custom folder 📂 icons for MacOS, Linux, and Windows.

## Overview

This repository contains a collection of custom folder icons for different operating systems. You can choose from a variety of icons to customize your folder appearance on MacOS, Linux, and Windows.

## Requesting Folder Icons

We welcome suggestions for new folder icons! If you have specific icons you'd like to see added to the collection, please drop us a message by [creating a new issue](https://github.com/shariati/OS-Folder-Icons/issues/new).

## Usage

To use the folder icons, simply download the repository. Inside the `icons` folder, you will find the icons categorized into different folders based on their respective brands, development languages, finance, games, operating systems, social media, virtualization, project management, and others.

### Changing Folder Icon on Linux

1. Right-click on a folder and select "Properties."
2. In the properties window, click on the framed icon located at the top left corner.
3. Choose a new image by browsing through the icons available in the respective Linux folder.

### Changing Folder Icon on Windows

1. Right-click on a folder and select "Properties."
2. Go to the "Customize" tab and click on "Change Icon" in the "Folder icons" section.
3. Choose a new image by browsing through the icons available in the respective Windows folder.

![How to Change Folder Icon on Windows](https://user-images.githubusercontent.com/19328465/33271833-9a32a2ae-d39d-11e7-9318-56ec1e054ef8.gif)

### Changing Folder Icon on Mac

1. Right-click on a folder and select "Get Info."
2. Drag and drop an icon from the `.icns` files available in the respective Mac folder onto the icon preview located at the top left corner of the Get Info dialogue.

![How to Use on Mac](https://user-images.githubusercontent.com/2625497/33240487-738316b8-d2f1-11e7-8c65-6d9c2de56c39.gif)

## Folder Icon Collection

The icons are organized into the following folders:

- Brands
- Development
- Finance
- Games
- Operating Systems
- Social Media
- Virtualization
- Project Management
- Others

You can find the respective icons for each category in their corresponding folders.

## Repository Folder Structure

Here is the folder structure of this repository:



## Folder Structure

Here is the folder structure of the repository:
```bash
├── LICENSE
├── README.md
├── docs
│ ├── images
│ └── index.md
├── images
│ ├── masks
│ └── os_folders
│ ├── linux
│ ├── macos
│ └── windows
├── pytest.ini
├── requirements.txt
├── setup.py
├── src
│ ├── generate_readme.py
│ ├── icon_generator
│ │ ├── init.py
│ │ ├── generator.py
│ │ └── utils.py
│ └── main.py
└── tests
├── test_generator.py
└── test_utils.py
```

Explanation of each folder:

- `docs`: Contains the documentation files, including the generated `index.md` file.
- `images`: Contains the mask images and base folder images.
  - `masks`: Contains the mask images used to apply on the base folder images.
  - `os_folders`: Contains the base folder images categorized by operating systems.
    - `linux`: Contains base folder images for Linux operating system.
    - `macos`: Contains base folder images for macOS operating system.
    - `windows`: Contains base folder images for Windows operating system.
- `pytest.ini`: Configuration file for pytest.
- `requirements.txt`: Lists the project dependencies.
- `setup.py`: Setup script for the project.
- `src`: Contains the source code files for the project.
  - `generate_readme.py`: Script to generate the `index.md` file for documentation.
  - `icon_generator`: Package containing the icon generation logic.
    - `generator.py`: Contains the functions to generate folder icons.
    - `utils.py`: Contains utility functions used in the generation process.
  - `main.py`: Main script to run the icon generation process.
- `tests`: Contains the test files for the project.
  - `test_generator.py`: Tests for the icon


## Prerequisites

Before running the project, make sure you have the following prerequisites installed on your system:

- Python: Visit the [Python website](https://www.python.org/) and download the appropriate version of Python for your operating system. Follow the installation instructions provided.

## Installing Dependencies

To install the project dependencies, follow these steps:

1. Open a terminal or command prompt.
2. Navigate to the root directory of the project.
3. Run the following command to install the dependencies:

```python
pip install -r requirements.txt
```

This command will install all the necessary packages specified in the `requirements.txt` file.

## Running the Project

To run the project, follow these steps:

1. Open a terminal or command prompt.
2. Navigate to the root directory of the project.
3. Run the following command to execute the `main.py` script:

```python
python src/main.py
```
This command will generate the folder icons based on the specified configuration.

## Running Tests

To run the project tests, follow these steps:

1. Open a terminal or command prompt.
2. Navigate to the root directory of the project.
3. Run the following command to execute the tests:

```python
pytest
```

This command will run all the tests located in the `tests` directory.

## Generating Documentation

To generate the documentation, follow these steps:

1. Open a terminal or command prompt.
2. Navigate to the root directory of the project.
3. Run the following command to execute the `generate_readme.py` script:

```python
python src/generate_readme.py
```

This command will generate the `index.md` file in the `docs` directory.

## License

### Mask Images Attribution
Please refer to `docs/ATTRIBUTION.md` for full list

### Icon and Image License

- Applies to all `.png`, `.icns`, and `.ico` files in the `icons` directory.
- License: [MIT License](./LICENSE)

### Brand Images

- All brand icons are trademarks of their respective owners.
- The use of these trademarks does not indicate endorsement of the trademark holder by OS Folder Icons (Amin Shariati and Sarah Ghanbarzadeh), nor vice versa.
- Brand icons should only be used to represent the company or product to which they refer.
- Please do not use brand logos for any purpose except to represent that particular brand or service.

