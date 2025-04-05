from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from typing import Dict, Any




class Response(BaseModel):
    image_content: Any

parser = JsonOutputParser(pydantic_object=Response)