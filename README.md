# [Generative AI Document Analyzer Overview](https://www.genanalyzer.com/)
Hello and welcome to the general overview of the Generative AI Document Analyzer web app. This is a simple web app made over a few months to familiarize myself with google cloud resources, as well as various other web based technologies. I did all of the development on my own with input and guidance from various resources including seniors at my workplace and various social medias.

## What does it do?
The web app functions as a user interface for interacting with uploaded and analyzed documents. I designed it in a way that was similar to other AI based UIs for familiarity. First, a user logs in using their gmail account. They then select a document to upload, either by dragging and dropping over the area marked for drag-and-drop, or by clicking the drag-and-drop and selected a document. The only documents that can be uploaded to be analyzed are PDFs (preferred), JPEGs/JPGs, or PNGs. The document is then sent off to google cloud to be both stored and analyzed. After the analysis is complete, it is sent back to the front end user, where they are able to see information about the document they uploaded. The analysis contains the text that was analyzed, a summary of the document, the quality of the document, languages detected in the document, and detected non-stop words and their prevalence in the document. Also displayed is a preview of the image/document that was uploaded by the user.

## What happens cloud side?
Below is a step by step occurence of what happens in google cloud when a user uploads a document:
1. Document is stored in a cloud storage bucket
2. Eventarc trigger attached to cloud storage sends data about the uploaded document to a workflow
3. Document is taken and is analyzed by multiple Document AI processors
4. The results of the processors are stored in a separate cloud storage bucket
5. Processor results are also sent to a cloud function where the data is cleansed
6. The cleansed data is stored in a google firestore collection
7. The analyzed data is then finally sent back to the front end where the information will be displayed to the front end user

In addittion, the workflow is contained within a try-catch loop, so if an error occurs server side, an error is sent to the front end, alerting the user that something occurred that could impace the analysis of their document.

## Below are some of the issues I encountered, and how I solved them
**Issue**: Displaying a preview of the analyzed document.
**Solution**: Had to adjust the CORS policy on the bucket where the document was stored to allow a temporary url of the document to be generated.

**Issue**: Getting the data sent back to the user after analysis.
**Solution**: May not be the most elegant solution, but polling the api endpoint for data where the analyzed data is posted back to.

## Technologies Used
Below are the listed major technologies used when developing the web app:
### Front End
1. React
2. Next.js
3. Material-UI
4. Node.js
5. Sequelize (ORM)

### Server Side
1. Cloud Storage
2. Cloud SQL
3. Cloud Functions (Node.js)
4. Cloud Workflows (YAML)
5. Cloud Run
6. Cloud Build
7. Document AI
8. Firestore
9. Eventarc
10. GCP Service Accounts
