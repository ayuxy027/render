from flask import current_app as app
from flask import jsonify, request, send_file
from ml_models.convert_files import get_file_data, get_image_data
from ml_models.document_chat import get_llm_chat_response
from app.models import Document
from app.database import db
import os


@app.get("/healthcheck")
def healthcheck():
    return jsonify({"status": "healthy"})


@app.post("/api/ml/v1/convert")
def convert():
    file = request.files.get("file")
    if not file:
        return jsonify({"status": "fail", "message": "no file provided"}), 400
    filename = file.filename
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    filetype = request.form.get("input_file_type")
    if not filetype:
        return jsonify({"status": "fail", "message": "filetype not mentioned"}), 400
    
    if filetype == "img":
        result = get_image_data(filepath)
    else:
        result = get_file_data(filepath)

    return jsonify({"converted_json": result})


@app.post("/api/ml/v1/upload")
def upload():
    file = request.files["file"]
    filename = file.filename
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)
    new_doc = Document(filepath = filepath)
    db.session.add(new_doc)
    db.session.commit()
    
    return jsonify({"file_id": new_doc.id})


@app.get("/api/ml/v1/download/<int:file_id>")
def download(file_id):
    file = Document.query.filter_by(id = int(file_id)).first()
    if file:
        return send_file(file.filepath)
    else:
        return jsonify({"status": "fail", "message": "file id not found"}), 404
    


@app.post("/api/ml/v1/chat")
def chat():
    req = request.json
    curr_message = req.get("current_message")
    document_id = req.get("document_id")
    if (curr_message == None) or (document_id == None):
        return jsonify({"status": "fail", "message": "current_message and document_id are required parameters"}), 400
    
    file = Document.query.filter_by(id = int(document_id)).first()
    if not file:
        return jsonify({"status": "fail", "message": "file id not found"}), 404
    
    filepath = file.filepath
    is_indexed = file.is_indexed

    llm_response = get_llm_chat_response(filepath, int(document_id), is_indexed, curr_message)
    if is_indexed == 0:
        file.is_indexed = 1
        db.session.commit()

    return jsonify({"chat_response": llm_response})


@app.post("/api/ml/v1/summary")
def chat():
    req = request.json
    curr_message = """
    Summarize the following document into a concise, clear, and coherent summary. 
    Capture the key points, main ideas, and any important details while maintaining the overall meaning. 
    Avoid unnecessary details and focus on essential information.
    Document:
    """
    document_id = req.get("document_id")
    if (curr_message == None) or (document_id == None):
        return jsonify({"status": "fail", "message": "current_message and document_id are required parameters"}), 400
    
    file = Document.query.filter_by(id = int(document_id)).first()
    if not file:
        return jsonify({"status": "fail", "message": "file id not found"}), 404
    
    filepath = file.filepath
    is_indexed = file.is_indexed

    llm_response = get_llm_chat_response(filepath, int(document_id), is_indexed, curr_message)
    if is_indexed == 0:
        file.is_indexed = 1
        db.session.commit()

    return jsonify({"chat_response": llm_response})