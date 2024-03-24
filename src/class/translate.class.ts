import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
const configFhirpathDemo = vscode.workspace.getConfiguration('fhirpathDemo');


export class Translate {

    public static i18n: any;
    public static translate: any;

    public static init() {
        try {
            const language = configFhirpathDemo.get('FhirLanguage');
            const jsonFilePath = path.join(__dirname, '..', 'i18n',  language + '.json');
            const jsonData = fs.readFileSync(jsonFilePath, 'utf-8'); 
            Translate.i18n =  JSON.parse(jsonData)
        } catch (error) {
            
        }
    }


    public static getTranslate(label:string):string {
       if(!this.i18n) return label;
       return this.i18n[label] || label
    }

}