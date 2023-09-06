// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FhirpathDemo,TreeResourceJson } from './fhirpath';



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Panel vista
	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	//Mostramos el webview del fhirpath demo
	context.subscriptions.push(vscode.commands.registerCommand('fhirpathDemo.start', () => {
		if (currentPanel){
			return;
		}
		
		currentPanel = vscode.window.createWebviewPanel(
		  'vscodeTest',
		  'Fhirpath demo',
		   vscode.ViewColumn.Active,
		  {
			enableScripts: true,
			retainContextWhenHidden: true
		  }
		);    
		currentPanel.webview.onDidReceiveMessage(
		  message => {
			switch (message.command) {
			  case 'evaluate':
				FhirpathDemo.getEvalute(currentPanel,message.resource, message.evaluate);
				break;	
			}
		  },
		  undefined,
		  context.subscriptions
		);
		FhirpathDemo.getJson(currentPanel,'patient');
		FhirpathDemo.setHtmlContent(currentPanel.webview, context, getNonce());
		FhirpathDemo.getFunctionFhirpath(currentPanel);

		currentPanel.onDidDispose(() => {
			currentPanel = undefined;
		});
		
	}));


	  // Our new command
	context.subscriptions.push(vscode.commands.registerCommand('catCoding.doRefactor', () => {
		if (!currentPanel) {
			return;
		}
		console.log("Iniciamos desde extensiónn a la web");
		// Send a message to our webview.
		// You can send any JSON serializable data.
		currentPanel.webview.postMessage({ command: 'refactor' });
	})
	);

	const treeDataProvider = new TreeResourceJson();

    // Crea y muestra el TreeView del Fhirpath
    context.subscriptions.push(vscode.window.createTreeView('fhirpath', {treeDataProvider})
	);

	//Registramos el commando que carga la extensión
	context.subscriptions.push(vscode.commands.registerCommand('fhirpathDemo.getResource',(args)=>{
		if(currentPanel && currentPanel?.visible)  {
			const resource:string = args.label;
			FhirpathDemo.getJson(currentPanel,resource.toLowerCase());				
		}
	}));

	


	
}


function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
	  text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
  
  

// This method is called when your extension is deactivated
export function deactivate() {}
