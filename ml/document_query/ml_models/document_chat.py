from .init_model import llm
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_redis import RedisConfig, RedisVectorStore
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnablePassthrough
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from typing import Dict

import os

def parse_retriever_input(params: Dict):
    return params["messages"][-1].content


SYSTEM_TEMPLATE = """
Answer the user's questions based on the below context. 
If the context doesn't contain any relevant information to the question, don't make something up and just say "I don't know":

<context>
{context}
</context>
"""

embeddings = HuggingFaceEmbeddings(  
    model_name="sentence-transformers/all-mpnet-base-v2",  
    model_kwargs={'device': 'cpu'}  ,  
    encode_kwargs={'normalize_embeddings': False}    
)


question_answering_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            SYSTEM_TEMPLATE,
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

document_chain = create_stuff_documents_chain(llm, question_answering_prompt)




def get_llm_chat_response(document_path, document_id, document_is_indexed, user_message):
    config = RedisConfig(
        index_name=f"{document_id}",
        redis_url=os.environ["REDIS_URL"],
    )

    vectorstore = RedisVectorStore(embeddings, config=config, overwrite=True)
    if not document_is_indexed:

        loader = PyPDFLoader(file_path = document_path)
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        data = loader.load()
        all_splits = text_splitter.split_documents(data)
        vectorstore.add_documents(all_splits)
    
    retriever = vectorstore.as_retriever(k=10)
    retrieval_chain = RunnablePassthrough.assign(context = parse_retriever_input | retriever).assign(answer = document_chain)
    res = retrieval_chain.invoke(
        {
            "messages": [
                HumanMessage(content=user_message)
            ],
        }
    )

    return res["answer"]


