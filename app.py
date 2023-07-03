from flask import Flask, render_template,request,jsonify
from flask_cors import CORS, cross_origin
import os
from pdfminer.high_level import extract_text
import difflib
import json
import PyPDF2
from PyPDF2 import PdfFileReader
from PyPDF2 import errors
import zipfile
import json
import logging
import os.path
# from adobe.pdfservices.operation.auth.credentials import Credentials
# from adobe.pdfservices.operation.exception.exceptions import ServiceApiException, ServiceUsageException, SdkException
# from adobe.pdfservices.operation.pdfops.options.extractpdf.extract_pdf_options import ExtractPDFOptions
# from adobe.pdfservices.operation.pdfops.options.extractpdf.extract_element_type import ExtractElementType
# from adobe.pdfservices.operation.execution_context import ExecutionContext
# from adobe.pdfservices.operation.io.file_ref import FileRef
# from adobe.pdfservices.operation.pdfops.extract_pdf_operation import ExtractPDFOperation
logging.basicConfig(level=os.environ.get("LOGLEVEL", "INFO"))



app  = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/get_json', methods=['GET'])
def get_jsondata():
    data = {'key': 'value', 'foo': 'bar'}  # Sample JSON data
    response=jsonify(data)
    response.headers['Content-Type'] = 'application/json'
    return response



@app.route('/validate', methods=['GET', 'POST'])
def validatePDF():
    if request.method == "POST":
        inputPDF = request.files['inputPDF']
        # Store the input pdf in a temporary file
        inputPDF.save(os.path.join(os.getcwd(), 'inputPDF.pdf'))
        if inputPDF.filename == '':
            return render_template('validatePDF.html',error='Please upload a file')
        else:
            # Validating the file
            isPDF,isCorrupted,isProtected = pdfValidation(inputPDF)
            inputFile = open(os.path.join(os.getcwd(), 'inputPDF.pdf'), 'rb')
            isReadable = checkPdfData(inputFile,isProtected)
            text= extract_text_from_pdf(os.path.join(os.getcwd(), 'inputPDF.pdf'),isPDF,isCorrupted)

            response = {'isPDF':isPDF,'isCorrupted':isCorrupted,'isProtected':isProtected,'isReadable':isReadable,'text':text}
            return(response)
    return render_template('validatePDF.html')





@app.route('/diff', methods=['GET', 'POST'])
def upload_form():
    if request.method == 'POST':
        # Handle the form submission
        # Access the uploaded files using request.files
        inputPDF1= request.files['inputPDF1']
        # Store the input pdf in a temporary file
        inputPDF1.save(os.path.join(os.getcwd(), 'inputPDF1.pdf'))
        inputPDF2= request.files['inputPDF2']
        # Store the input pdf in a temporary file
        inputPDF2.save(os.path.join(os.getcwd(), 'inputPDF2.pdf'))

        if inputPDF1.filename == '' or inputPDF2.filename == '':
            return render_template('validatePDF.html',error='Please upload a file')
        else:
            # Validating the file
            inputFile1 = open(os.path.join(os.getcwd(), 'inputPDF1.pdf'), 'rb')
            inputFile2 = open(os.path.join(os.getcwd(), 'inputPDF2.pdf'), 'rb')
            isPDF1,isCorrupted1,isProtected1 = pdfValidation(inputPDF1)
            isReadable1 = checkPdfData(inputFile1,isProtected1)
            isPDF2,isCorrupted2,isProtected2 = pdfValidation(inputPDF2)
            isReadable2 = checkPdfData(inputFile2,isProtected2)
            text1= extract_text_from_pdf(os.path.join(os.getcwd(), 'inputPDF1.pdf'),isPDF1,isCorrupted1)
            text2= extract_text_from_pdf(os.path.join(os.getcwd(), 'inputPDF2.pdf'),isPDF2,isCorrupted2)

            # diff=compare_texts(text1, text2)
            diff = generate_diff(text1, text2)
            # print()
            response = {'isPDF1':isPDF1,'isCorrupted1':isCorrupted1,'isProtected1':isProtected1,'isReadable1':isReadable1,'text1':text1,
                        'isPDF2':isPDF2,'isCorrupted2':isCorrupted2,'isProtected2':isProtected2,'isReadable2':isReadable2,'text2':text2,'diff':diff}
            
        
            
            return(response)
            # Once the response is returned, delete the temporary file
            
    # os.remove(os.path.join(os.getcwd(), 'inputPDF1.pdf'))
    # os.remove(os.path.join(os.getcwd(), 'inputPDF2.pdf'))
    return render_template('diffPDF.html')

@app.route('/diffjson', methods=['GET', 'POST'])
def upload_json_form():
    if request.method == 'POST':
        # Handle the form submission
        # Access the uploaded files using request.files
        inputJSON1= request.files['inputJSON1']
        # json_data1 = inputJSON1.read()
        # Store the input pdf in a temporary file
        inputJSON1.save(os.path.join(os.getcwd(), 'inputJSON1.json'))
        inputJSON2= request.files['inputJSON2']

        # Store the input pdf in a temporary file
        inputJSON2.save(os.path.join(os.getcwd(), 'inputJSON2.json'))
        # json_data2 = inputJSON2.read()
        # print(json_data1)
        with open('inputJSON1.json') as file:
            # Read the file contents
            json_data1 = file.read()

        with open('inputJSON2.json') as file:
            # Read the file contents
            json_data2 = file.read()

        # print(json_data2)
        
        print(type(json_data1))
        diff = json_diff(json_data1, json_data2)
        # print(diff)
        
        response = {"diff":diff}
            
        
            
        return(response)
            # Once the response is returned, delete the temporary file
            
    # os.remove(os.path.join(os.getcwd(), 'inputPDF1.pdf'))
    # os.remove(os.path.join(os.getcwd(), 'inputPDF2.pdf'))
    return render_template('diffJSON.html')

def extract_text_from_pdf(pdf_path,isPDF,isCorrupted):
    if (not isPDF or  isCorrupted):
        return ""
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfFileReader(file)
        num_pages = pdf_reader.numPages

        extracted_text = ""
        for page_num in range(num_pages):
            page = pdf_reader.getPage(page_num)
            extracted_text += page.extractText()

    return extracted_text

# //libdiff

def compare_texts(text1, text2):
    dff=[]
    for i, j in zip(text1, text2):
        
        lines1 = i.splitlines()
        lines2 = j.splitlines()

        differ = difflib.Differ()
        diff = differ.compare(lines1, lines2)

        differing_lines = [line for line in diff if line.startswith('+') or line.startswith('-')]
        dff.append(differing_lines)

    return dff
    # return differ

def json_diff(json1,json2):

    data1 = json.loads(json1)
    data2 = json.loads(json2)

    # Calculate the difference between the JSON objects using json_delta's diff
    # delta = diff(data1, data2)

    # Generate unified diff-like output using difflib
    diff_lines = difflib.unified_diff(json.dumps(data1, indent=4).splitlines(keepends=True),
                                    json.dumps(data2, indent=4).splitlines(keepends=True),
                                    fromfile='json1', tofile='json2')
    line='\n'.join(diff_lines)

    lines = [line for line in line.splitlines() if line.strip()]

# Join non-empty lines back into a string
    text_without_empty_lines = '\n'.join(lines)

    # print(text_without_empty_lines)
    
    return text_without_empty_lines
    # return diff_lines


def generate_diff(text1, text2):
    lines1 = text1.splitlines()
    lines2 = text2.splitlines()


    diff = difflib.unified_diff(lines1, lines2, lineterm='', fromfile='oldPDF', tofile='newPDf')

    return '\n'.join(diff)

# validate pdf
def pdfValidation(inputPDF):
    isPDF = False
    isCorrupted = True
    isProtected = True
    # Validating the file
    fileNameExtension = inputPDF.filename.split('.')[-1]
    print(fileNameExtension)
    # if fileNameExtension.lower() == 'pdf':
    isPDF = True
    if isPDF:
        try:
          file = PdfFileReader(inputPDF)
          if file.isEncrypted:
              file.decrypt('')
        except errors.PdfReadError:
            isCorrupted = True
        else :
            isCorrupted = False
        if not isCorrupted:
            isProtected = file.isEncrypted
    return isPDF,isCorrupted,isProtected


def checkPdfData(inputPDF,isProtected):
    isReadable = False
    if not isProtected:
        # Try to read the pdf if there is no unicode error
        try:
            text = extract_text(inputPDF)
        except UnicodeDecodeError:
            isReadable = False
        else:
            isReadable = True
    return isReadable
        
# def extractXMLofpdf(inputPDF):

# def compareJSONS():

    


if __name__ == '__main__':  
    app.run(debug=True, port=9000)
   
