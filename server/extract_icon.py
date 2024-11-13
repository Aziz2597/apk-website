import sys
from androguard.misc import AnalyzeAPK
import os

def extract_icon(apk_path, output_dir, app_name):
    try:
        a, d, dx = AnalyzeAPK(apk_path)
    except Exception as e:
        print(f"Error analyzing APK: {e}")
        sys.exit(2)

    icon_data = None
    icon_path = None

    for activity in a.get_activities():
        icon_path = a.get_app_icon(activity)
        if icon_path:
            break

    if not icon_path:
        print("Icon not found in the APK.")
        sys.exit(2)

    for file_name, file_data in a.get_files():
        if file_name.endswith(icon_path):
            icon_data = file_data
            break

    if not icon_data:
        print("Icon data not found in the APK.")
        sys.exit(2)

    try:
        output_file_path = os.path.join(output_dir, f"{app_name}.png")
        with open(output_file_path, 'wb') as f:
            f.write(icon_data)
        print(f"Icon extracted to {output_file_path}")
    except Exception as e:
        print(f"Error writing icon file: {e}")
        sys.exit(2)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: extract_icon.py <apk_path> <output_dir> <app_name>")
        sys.exit(2)

    apk_path = sys.argv[1]
    output_directory = sys.argv[2]
    app_name = sys.argv[3]

    if not os.path.isfile(apk_path):
        print(f"APK file not found: {apk_path}")
        sys.exit(2)

    if not os.path.isdir(output_directory):
        print(f"Output directory not found: {output_directory}")
        sys.exit(2)

    extract_icon(apk_path, output_directory, app_name)
