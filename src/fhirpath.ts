import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as fhirpath from 'fhirpath';

const configFhirpathDemo = vscode.workspace.getConfiguration('fhirpathDemo');


export class FhirpathDemo {
    //#region Web
    /**
     * HTML del FHIRPATH demo
     * @param webview 
     * @param extensionContext 
     * @param nonce 
     */
    public static  setHtmlContent(webview: vscode.Webview, extensionContext: vscode.ExtensionContext, nonce:string) {
        //const nonce = getNonce();
        let htmlContent = `<html>
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-nonce';">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="vscodeTest.css" rel="stylesheet">
          <link href="icon.css" rel="stylesheet">
          <link href="codemirror.css" rel="stylesheet"> 
        </head>
        <body>
          
        <div class="container">
            <div class="container-fhirevaluate">
                <input type="text" id="evaluate" class="inputFhirpath">
                <div class="contanier-fhirevaluate-icon" id="copyEvaluate"><i title="copy" class="codicon codicon-copy active"></i></div>
                <div class="contanier-fhirevaluate-icon" id="deletePoint"><i title="delete point" class="codicon codicon-discard remove"></i></div>
                <div class="contanier-fhirevaluate-icon" id="deleteEvaluate"><i title="delete" class="codicon codicon-trash delete"></i></div>
            </div>
	    </div>
        
        <div class="container">
            <div class="container-resource">
                <textarea id="resource" rows="10" cols="50" class="container-res-resource inputFhirpath">Write something here</textarea>
                <div id="response" class="container-res-response"><pre>Codigo</pre></div>
            </div>
            
        </div>

        <div class="container">
            <div class="container-functions">
                <div id="labelFunction"></div>
            </div>
            </div>
            <div class="" id="infoFunction"></div>  
        </div>
        <div>
        </div>
        <script type="text/javascript" src="codemirror.js"></script>
        <script type="text/javascript" src="javascript.js"></script>
        <script type="text/javascript" src="vscodeTest.js"></script>
        </body>
      </html>`;

        const jsFilePath = vscode.Uri.joinPath(extensionContext.extensionUri, 'media', 'js', 'fhirpathDemo.js');
        const visUri = webview.asWebviewUri(jsFilePath);
        htmlContent = htmlContent.replace('vscodeTest.js', visUri.toString());

        const jsCodeMirror = vscode.Uri.joinPath(extensionContext.extensionUri, 'media', 'js', 'codemirror.js');
        const codeMirrorUri = webview.asWebviewUri(jsCodeMirror);
        htmlContent = htmlContent.replace('codemirror.js', codeMirrorUri.toString());

        const jsCodeMirrorJS = vscode.Uri.joinPath(extensionContext.extensionUri, 'media', 'js', 'codemirrorjavascript.js');
        const codeMirrorJSUri = webview.asWebviewUri(jsCodeMirrorJS);
        htmlContent = htmlContent.replace('javascript.js',  codeMirrorJSUri.toString());

        
        const cssPath = vscode.Uri.joinPath(extensionContext.extensionUri, 'media', 'css','fhirpathDemo.css');
        const cssUri = webview.asWebviewUri(cssPath);
        htmlContent = htmlContent.replace('vscodeTest.css', cssUri.toString());

        const iconPath = vscode.Uri.joinPath(extensionContext.extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css');
        const iconUri = webview.asWebviewUri(iconPath);
        htmlContent = htmlContent.replace('icon.css',iconUri.toString());

        const cssCodeMirror = vscode.Uri.joinPath(extensionContext.extensionUri, 'media', 'css', 'codemirror.css');
        const cssCodeMirrorUri = webview.asWebviewUri(cssCodeMirror);
        htmlContent = htmlContent.replace('codemirror.css',cssCodeMirrorUri.toString());
        
        htmlContent = htmlContent.replace('nonce-nonce', `nonce-${nonce}`);
        htmlContent = htmlContent.replace(/<script /g, `<script nonce="${nonce}" `);
        htmlContent = htmlContent.replace('cspSource', webview.cspSource);
        
        webview.html = htmlContent;
    }

    /**
     * Leemos el fichero JSON con el recurso por defecto (Patient)
     * @param currentPanel 
     * @param resource 
     */
    public static getJson(currentPanel:vscode.WebviewPanel,resource:string) {
        try {
            const jsonFilePath = path.join(__dirname, '..', 'media', 'resources', resource + '.json');
            const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');
            currentPanel.webview.postMessage({ command: 'resource', resource: JSON.parse(jsonData), evaluate:""});
        } catch (error) {
            vscode.window.showErrorMessage("Existe un error al abrir el fichero JSON con el recurso");
        }	
    }

    public static showFunctionFhirpath(currentPanel:vscode.WebviewPanel, functionFhirpath:any):void {
        if (!functionFhirpath) {
            return;
        }
        currentPanel.webview.postMessage({ command: 'showFunctionInfo', data:functionFhirpath});
    }

    //Añade una función del panel menu al input evaluate
    public static addFunctionFhirpath(currentPanel:vscode.WebviewPanel,funcion:string):void {
        if (!funcion) {
            return;
        }
        currentPanel.webview.postMessage({command:'addFunction', data:funcion});
    }

    /**
     * Evaluamos la consulta en el fhirpath
     * @param currentPanel 
     * @param resource 
     * @param evaluate 
     */
    public static getEvalute(currentPanel:vscode.WebviewPanel | undefined,resource:string,evaluate:string ) {
        try {
            if (currentPanel) {
                currentPanel.webview.postMessage({command:'evaluate', evaluate:fhirpath.evaluate(JSON.parse(resource), evaluate)});
            }
        } catch (error) {
            //vscode.window.showErrorMessage("Existe un error al evaluar la expresión");
        }
    }

    /**
     * Retornamos listado con todos los ficheros JSON con sus recursos.
     * @returns Array con el nombre de los ficheros JSON de los recursos
     */
    public static getFileResource():string[] {
        try {
            const jsonFilePath = path.join(__dirname, '..', 'media','resources');
            const files = fs.readdirSync(jsonFilePath);
            return files;
        } catch (error) {
            vscode.window.showErrorMessage("Error al leer los archivos");
            return [];
        }
    }

}
