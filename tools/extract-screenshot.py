import os
import json
import base64

# evidence folder (input and output)
evidence_dir = "evidence"

# mapping of JSON files to output filenames
files = {
    "lhr-broken-1.json": "broken.jpg",
    "lhr-fixed-1.json": "fixed.jpg"
}

for json_file, output_name in files.items():
    json_path = os.path.join(evidence_dir, json_file)
    output_path = os.path.join(evidence_dir, output_name)

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # extract base64 screenshot data
        screenshot_b64 = data["audits"]["final-screenshot"]["details"]["data"]

        # remove data URL prefix if present
        if screenshot_b64.startswith("data:image"):
            screenshot_b64 = screenshot_b64.split(",")[1]

        # decode base64 string
        img_data = base64.b64decode(screenshot_b64)

        # save image
        with open(output_path, "wb") as img_file:
            img_file.write(img_data)

        print(f"Saved {output_name} to {evidence_dir}")

    except Exception as e:
        print(f"Error processing {json_file}: {e}")