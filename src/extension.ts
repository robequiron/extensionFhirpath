// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FhirpathDemo} from './fhirpath';
import {TreeFunctionJson,TreeResourceJson} from './components/menus';
import { fromEvent } from 'rxjs';
import { COMMAND, CONSTANT } from './models/constant';
import { Translate } from './class/translate.class';
const configFhirpathDemo = vscode.workspace.getConfiguration('fhirpathDemo');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Panel vista
	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	Translate.init();

	//Mostramos el webview del fhirpath demo
	context.subscriptions.push(vscode.commands.registerCommand(COMMAND.START, () => {	
		if (currentPanel){
			return;
		}
		
		currentPanel = vscode.window.createWebviewPanel(
		  'webFhirpath',
		  'Fhirpath Studio',
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
				case 'copyEvaluate':
					vscode.window.showInformationMessage("Copiado correctamente");
					break;	
			}
		  },
		  undefined,
		  context.subscriptions
		);
		FhirpathDemo.getJson(currentPanel,'patient');
		FhirpathDemo.setHtmlContent(currentPanel.webview, context, getNonce());
		if (configFhirpathDemo.get('infofunc')) {
			
		}

		currentPanel.onDidDispose(() => {
			currentPanel = undefined;
		});
		
	}));

	


	//Creamos el listado de recursos de Fhirpath
	const treeDataProvider = new TreeResourceJson();

    //Crea y muestra el TreeView del Fhirpath
    context.subscriptions.push(vscode.window.createTreeView('fhirpath', {treeDataProvider}));

	//Creamos el listado de funciones de Fhirpath
	const treeDataFunction = new TreeFunctionJson();

	//Crea y muestra el TreeView del Fhirpath
    context.subscriptions.push(vscode.window.createTreeView('function', {treeDataProvider: treeDataFunction}));

	//Registramos el commando que carga la extensión y muestra la pestaña de fhirtpath demo
	context.subscriptions.push(vscode.commands.registerCommand(COMMAND.GET_RESOURCE,(args)=>{
		try {
			vscode.commands.executeCommand(COMMAND.START)
			setTimeout(()=>{
				if(currentPanel && currentPanel?.visible)  {
					const resource:string = args.label;
					FhirpathDemo.getJson(currentPanel,resource.toLowerCase());				
				}
			},100)	
		} catch (error) {
			vscode.window.showErrorMessage(Translate.getTranslate("error.show.resource.fhirpath"))
		}
		 
	}));
	/**
	 * Funcion que muestra ayuda de la funciones disponibles de Fhirpath
	 */
	//TODO: Crear constante y cambiar el icono correspondiente
	context.subscriptions.push(vscode.commands.registerCommand(COMMAND.INFO_FUNCTION,  (args)=>{
		try {
			treeDataFunction.getFunctionItemMenu$(args.id).subscribe({
				next: (data) =>{
					if (data) {
						vscode.commands.executeCommand(COMMAND.START)
						if(currentPanel && currentPanel?.visible) {
							FhirpathDemo.showFunctionFhirpath(currentPanel, data);
						}
					}
				},
				error: ()=>{
					vscode.window.showErrorMessage(Translate.getTranslate("error.function.info.fhirpath"))
				}
			});
		} catch (error) {
			vscode.window.showErrorMessage(Translate.getTranslate("error.function.info.fhirpath"))
		}
	}))

	
	//Añadimos la función al input evaluate
	context.subscriptions.push(vscode.commands.registerCommand(COMMAND.ADD_FUNCTION, (args)=>{
		try {
			treeDataFunction.getFunctionItemMenu$(args.id).subscribe({
				next: (data) =>{
					if (data) {
						vscode.commands.executeCommand(COMMAND.START)
						if(currentPanel && currentPanel?.visible) {
							FhirpathDemo.addFunctionFhirpath(currentPanel,data.function);
						}
					}
				},
				error: ()=>{
					vscode.window.showErrorMessage(Translate.getTranslate("error.function.info.fhirpath"))
				}
			});	
		} catch (error) {
			vscode.window.showErrorMessage(Translate.getTranslate("error.function.info.fhirpath"));
		}
	}))

		
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
