from PIL import Image
import base64
from io import BytesIO
from .output_parsers import Response

def convert_to_base64(pil_image: Image):
    buffered = BytesIO()
    pil_image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str

def load_image(image_path: str):
    pil_image = Image.open(image_path)
    image_b64 = convert_to_base64(pil_image)
    return image_b64


def convert_response_to_pydantic(field):
    if "```json" in field:
        field = field[field.index("```json") + 7:]
        field = field[:field.index("```")]
    return Response.parse_raw(field)