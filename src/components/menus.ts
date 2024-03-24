import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { FunctionFhirpath } from '../models/functionFhirpath.model';
import { filter, from, groupBy, mergeMap, toArray } from 'rxjs'
import { ThemeIcon } from 'vscode';
import { COMMAND } from '../models/constant';
import { Translate } from '../class/translate.class';
const configFhirpathDemo = vscode.workspace.getConfiguration('fhirpathDemo');




export class TreeItem {
    constructor(public readonly label: string, public readonly tooltip?:string, 
        public readonly iconPath?: ThemeIcon,
        public readonly command?:vscode.Command,
        public readonly children: Thenable<TreeItem[]> = Promise.resolve([])
        ) {}
}

//* Creamos un listado con los recursos fhispath*/
export class TreeResourceJson implements vscode.TreeDataProvider<TreeItem>  {
    
	private itemResource:TreeItem[]= [];
    private icon:vscode.ThemeIcon = new ThemeIcon('explorer-view-icon');

    constructor() {}
    
    jsonFilePath = path.join(__dirname, '../..', 'media','resources');
    files = fs.readdirSync(this.jsonFilePath).map((nameJSON,i)=>{
		const item = nameJSON.charAt(0).toUpperCase() + nameJSON.slice(1,-5);
        const command = this.getCommand(i,item);
		this.itemResource.push(new TreeItem(item,Translate.getTranslate('label.resource'),this.icon, command));
        
	});

	getTreeItem(element: TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        return Promise.resolve(element ? element.children : this.itemResource);
    }

    getCommand(id:number,label:string):vscode.Command {
        const command:vscode.Command = {
            title: 'Ver',
            command: COMMAND.GET_RESOURCE,
            tooltip: 'Recurso FHIRPATH',
            arguments: [{
                label: label,
                lineNumber: id
            }]
        }
        return command
    }
}

export class TreeFunctionJson implements vscode.TreeDataProvider<FunctionItem> {
   
    private itemResource:FunctionItem[]= [];


    private functionFhirpath:FunctionFhirpath[]= [];
    private icon:vscode.ThemeIcon = new ThemeIcon('explorer-view-icon');
    private jsonData: any;
    
    constructor() {
        this.getDataJson();
        this.getItemDataJson();
        this.getItems();
    }

    /**
     * Obtenemos los datos de la funciones de fhirpathFhirpath.json
     */
    private getDataJson() {
        try {
            const jsonFilePath = path.join(__dirname, '../..', 'media',  'functionFhirpath.json');
            const jsonData = fs.readFileSync(jsonFilePath, 'utf-8'); 
            this.jsonData = JSON.parse(jsonData);
        } catch (error) {
            vscode.window.showErrorMessage(Translate.getTranslate('error.function.fhirpath'))
        }
    }

    /**
     * Obtenemos las categorías de las funciones del fichero json, solo se mostrarán los 
     * que tiene isVisible a true
     */
    private getItemDataJson() {
       
        this.functionFhirpath = [];
          from(this.jsonData).pipe(
            filter((data:any)=>data.isVisible),
            groupBy<any,any>(data=>data.category),
            mergeMap<any,FunctionFhirpath[]>(group => group.pipe(toArray()))
          ).subscribe((data)=>{
            this.functionFhirpath.push(data)
        })
    }

    /**
     * Obtenemos la estructura principal del menu con las categorias y los hijos de cada una de ellas
     */    
    private getItems() {
        from(this.functionFhirpath)
        .subscribe(
            (category:any) =>{                
		        this.itemResource.push(new FunctionItem(Translate.getTranslate(category[0].category),this.getChildrenItems(category)));
            }
        )
    }
    
    /**
     * Retornamos los items en TreeItems de cada categoría
     * @param items Retornamos 
     * @returns 
     */
    private getChildrenItems(items:any):FunctionItem[] {
        const children:FunctionItem[] = [];
        from(items || [] ).subscribe(
            (data:any)=>{
                const item = new FunctionItem(data.name);
                item.command = this.getCommand(data);
                item.tooltip = data.tooltip || Translate.getTranslate("noInfo");
                children.push(item);
            }
        )
        return children;
    }

    getTreeItem(element: FunctionItem): vscode.TreeItem {
        return element;
    }
    getChildren(element?: FunctionItem|undefined): vscode.ProviderResult<FunctionItem[]> {
        if (element === undefined) {
          return this.itemResource;
        }
        return element.children;
    }

    getCommand(data:string):vscode.Command {
        const command:vscode.Command = {
            title: 'Ver',
            command: COMMAND.INFO_FUNCTION,
            tooltip: 'Información función FHIRPATH',
            arguments: [{
                data:data
            }]
        }
        return command
    }

}

export class FunctionItem extends vscode.TreeItem {

    children: FunctionItem[]|undefined;

    constructor(label:string, children?:FunctionItem[]) {
        super(
            label,
            children === undefined ? vscode.TreeItemCollapsibleState.None :
            vscode.TreeItemCollapsibleState.Expanded);
        
        this.children = children;
    }
}


