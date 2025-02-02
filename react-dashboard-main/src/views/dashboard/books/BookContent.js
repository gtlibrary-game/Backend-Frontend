import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useSelector } from 'react-redux';

// material-ui
import { Grid, Button, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
// toast message
// project imports
import MainCard from '../../../ui-component/cards/MainCard';
import { gridSpacing } from '../../../store/constant';
import configData from '../../../config';
import './styles.css';

import { pdfjs } from 'react-pdf';
import { parseEpub } from '@gxl/epub-parser';
// import { pdfjs } from "pdfjs-dist";
// pdfjs.GlobalWorkerOptions.workerSrc ='pdf.worker.min.js';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// import PDFJSWorker from 'node_modules/pdfjs-dist/build/pdf.worker.js';
// pdfjs.GlobalWorkerOptions.workerSrc = PDFJSWorker;
//==============================|| book content ||==============================//

const useStyles = makeStyles((theme) => ({
    maincontent: {
        height: 'calc(100vh - 210px)',
        overflowY: 'scroll'
    }
}));

const BookContent = (props) => {
    const { id } = useParams();
    const [bookcontent, setBookcontent] = useState('<p>Hello from CKEditor 5!</p>');
    const [title, setTitle] = useState('Book Content Edit');
    const accountinfo = useSelector((state) => state.account);
    const classes = useStyles();

    const getBookcontentById = async () => {
        const { data } = await axios.get(configData.API_SERVER + 'books/edit/' + id, {
            headers: { Authorization: `${accountinfo.token}` }
        });
        setBookcontent(data.content);
    };

    const updateBookcontent = async () => {
        await axios.put(
            configData.API_SERVER + 'books/edit/' + id,
            {
                content: bookcontent
            },
            { headers: { Authorization: `${accountinfo.token}` } }
        );
    };

    useEffect(() => {
        if (id) {
            getBookcontentById();
            setTitle('Book Content Edit');
        }
    }, []);

    const saveBookcontent = () => {
        if (id) {
            updateBookcontent();
        } else {
            axios
                .post(configData.API_SERVER + 'bookcontent/save', {
                    headers: { Authorization: `${accountinfo.token}` },
                    content: bookcontent
                })
                .then(function (response) {
                    if (response.success === 201) {
                        setBookcontent('');
                    } else {
                        setBookcontent('');
                    }
                })
                .catch(function (error) {});
        }
    };

    function uploadAdapter(loader) {
        return {
            upload: () => {
                return new Promise((resolve, reject) => {
                    const body = new FormData();
                    loader.file.then((file) => {
                        body.append('uploadimage', file);
                        fetch(`${configData.API_SERVER}uploadimage`, {
                            method: 'post',
                            body: body
                            // mode: "no-cors"
                        })
                            .then((res) => res.json())
                            .then((res) => {
                                resolve({
                                    default: `${res.uploadimage}`
                                });
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    });
                });
            }
        };
    }
    function uploadPlugin(editor) {
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
            return uploadAdapter(loader);
        };
    }

    function getPageText(pageNum, PDFDocumentInstance) {
        // Return a Promise that is solved once the text of the page is retrieven
        return new Promise(function (resolve, reject) {
            PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
                // The main trick to obtain the text of the PDF page, use the getTextContent method
                pdfPage.getTextContent().then(function (textContent) {
                    var textItems = textContent.items;
                    var finalString = '';

                    // Concatenate the string of the item to the final string
                    for (var i = 0; i < textItems.length; i++) {
                        var item = textItems[i];

                        finalString += item.str + ' ';
                    }

                    // Solve promise with the text retrieven from the page
                    resolve(finalString);
                });
            });
        });
    }

    function readFileAsync(event) {
        return new Promise((resolve, reject) => {
            const file = event.target.files[0];
            if (!file) {
                return;
            }
            if (file.type === 'application/pdf') {
                const reader = new FileReader();

                reader.onload = () => {
                    let binary = '';
                    let bytes = new Uint8Array(reader.result);
                    let len = bytes.byteLength;
                    for (let i = 0; i < len; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    resolve({
                        id: Math.random(),
                        url: `data:${file.type};base64,${btoa(binary)}`,
                        type: file.type,
                        data: `${btoa(binary)}`,
                        dataarr: bytes
                    });
                };

                reader.onerror = reject;

                reader.readAsArrayBuffer(file);
            } else {
                const reader = new FileReader();
                reader.onload = () => {
                    let binary = '';
                    let bytes = new Uint8Array(reader.result);
                    let len = bytes.byteLength;
                    for (let i = 0; i < len; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    resolve({
                        id: Math.random(),
                        url: `data:${file.type};base64,${btoa(binary)}`,
                        type: file.type,
                        data: `${btoa(binary)}`,
                        dataarr: bytes
                    });
                };

                reader.readAsArrayBuffer(file);
            }
        });
    }
    const uploadcontent = async (event) => {
        const pdfinfo = await readFileAsync(event);
        const parser = new DOMParser();
        if (pdfinfo.type === 'application/epub+zip') {
            const epubObj = parseEpub(pdfinfo.dataarr, {
                type: 'buffer'
            });

            var content = '';
            console.log("epubobj", epubObj)
            content += (await epubObj).sections.map((item) => {
                // console.log(item.htmlString)
                let doc = parser.parseFromString(item.htmlString, 'application/xml')
                return doc.documentElement.textContent
            })
            setBookcontent(content);
        } else {
            const loadpdf = pdfjs.getDocument({ data: pdfinfo.dataarr });
            loadpdf.promise.then(
                (pdf) => {
                    var pdfDocument = pdf;
                    var pagesPromises = [];
                    var contentHtml = '';
    
                    for (var i = 0; i < pdf.numPages; i++) {
                        (function (pageNumber) {
                            pagesPromises.push(getPageText(pageNumber, pdfDocument));
                        })(i + 1);
                    }
    
                    Promise.all(pagesPromises).then(function (pagesText) {
                        for (let i = 0; i < pagesText.length; i++) {
                            const element = pagesText[i];
                            contentHtml += '<p>' + element + '</p>';
                        }
                        setBookcontent(contentHtml);
                    });
                },
                function (reason) {
                    // console.error(reason);
                }
            );
        }
    };
    return (
        <MainCard title={title}>
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12} sm={12}>
                    <Box display="flex" flexDirection="row-reverse" p={1} m={1} bgcolor="background.paper">
                        <Link to="/dashboard/booklist">
                            <Button variant="outlined">Back To List</Button>
                        </Link>
                    </Box>
                    <Box display="flex" flexDirection="column" className="upload-content" p={1} m={1} bgcolor="background.paper">
                        <input
                            accept="application/pdf, application/epub+zip"
                            className="hidden"
                            id="button-file"
                            type="file"
                            onChange={(e) => {
                                uploadcontent(e);
                            }}
                        />
                        <span>select the pdf file</span>
                    </Box>
                    <Box display="flex" p={1} m={1} bgcolor="background.paper">
                        <CKEditor
                            className={classes.maincontent}
                            config={{
                                extraPlugins: [uploadPlugin]
                            }}
                            editor={ClassicEditor}
                            // data="<p>Hello from CKEditor 5!</p>"
                            data={bookcontent}
                            onReady={(editor) => {
                                // You can store the "editor" and use when it is needed.
                                // console.log( 'Editor is ready to use!', editor );
                            }}
                            onChange={(event, editor) => {
                                const data = editor.getData();
                                setBookcontent(data);
                            }}
                            onBlur={(event, editor) => {
                                // console.log( 'Blur.', editor );
                            }}
                            onFocus={(event, editor) => {
                                // console.log( 'Focus.', editor );
                            }}
                        />
                    </Box>
                    <Box display="flex" flexDirection="row-reverse" p={1} m={1} bgcolor="background.paper">
                        <Button variant="contained" onClick={() => saveBookcontent()}>
                            Save
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default BookContent;
