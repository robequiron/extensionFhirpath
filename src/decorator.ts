import * as vscode from 'vscode';
import { DecoratorEditor } from './models/decorator.model';
import { filter, from } from 'rxjs';

export class Decorator {

    /** Inicia la decoración del documento */
    public static initDecorator(editor: vscode.TextEditor, decorator:DecoratorEditor[]):void {
        if (!editor) return;
        from(decorator)
			.pipe(filter(dataPipe=>dataPipe.languageId===editor.document.languageId))
			.subscribe((data)=>{
				const decorations:vscode.Range[] = [];
				Decorator.getDecorations(data,editor,decorations);
				editor.setDecorations(Decorator.getDecorationType(data.style), decorations);
		})
    }

    /* Buscamos el texto para decorar con estilos */
    private static getDecorations(decorator:DecoratorEditor, editor:vscode.TextEditor, decorations:vscode.Range[]):void{

        if(!decorator || !decorator.text) return 

        for (let i = 0; i < editor.document.lineCount; i++) {
            const line:string = editor.document.lineAt(i).text;
            if (line.indexOf(decorator.text)>0) {
                const startPosition = new vscode.Position(i,line.indexOf(decorator.text));
                const endPosition = new vscode.Position(i,(line.indexOf(decorator.text)+ decorator.text.length));
                const decoration:any = {
                    range: new vscode.Range(startPosition, endPosition),
                    hoverMessage: decorator.hoverMessage || null
                    };
                decorations.push(decoration);
            }
        }

    }

    /** Obtenemos el estilo para la decoración */
    private static getDecorationType(style:vscode.DecorationRenderOptions):vscode.TextEditorDecorationType {
        return vscode.window.createTextEditorDecorationType(style) || {};
    } 


}