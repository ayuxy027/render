from .init_model import llm
from .utils import *

from langchain_community.document_loaders import PyPDFLoader


def get_image_data(image_path):
    image_b64 = load_image(image_path)
    prompt_template = """
        You are a bot that is used to obtain the text present in images.\n\
        Return the output in the following format:\n\
        dict("image_content": <content of the image>)
        Given the image, convert the textual content present in the image into JSON format\n\
    """
    res = llm.invoke(prompt_template, images = [image_b64])
    json_value = convert_response_to_pydantic(res).image_content

    return {"file_content": json_value}


def get_file_data(file_path):
    loader = PyPDFLoader(file_path = file_path)
    data = loader.load()
    return {"file_content": [i.page_content for i in data]}