//const canvas = document.getElementById('vscodeTestCanvas');
const vscode = acquireVsCodeApi();
const resource = document.getElementById('resource');
const evaluate = document.getElementById('evaluate');
const response = document.getElementById('response');
const deleteEvaluate = document.getElementById('deleteEvaluate');
const deletePoint = document.getElementById('deletePoint');
const copyEvaluate = document.getElementById('copyEvaluate');
let addFunction;
let labelFunctions = document.querySelectorAll('.label');


let setTimeEvaluate;
const tabSize = 4;
let stringEvaluate= [];

//#region Eventos
var editor = CodeMirror.fromTextArea(resource, {
  mode: {
    name: "javascript",
    json: true
  },
  indentUnit: 4, // Tamaño de la indentación
  tabSize: tabSize, // Tamaño de la tabulación
  indentWithTabs: true, // Utilizar tabs para la indentación
  lineNumbers: true,
  lineWrapping: true,
})

editor.on('scroll', ()=>{
  setEventProperties();
});

editor.on('dblclick', (cm,event)=>{
  var cursor = cm.getCursor(); //Posición actual del cursor
  var token = cm.getTokenAt(cursor);//Token en la posición actual
  if (token.type==='string property') {
    evaluate.value = getValueProperty(token);
    onEvaluate(evaluate.value || '');
  }
})


//Borramos el input evaluate
deleteEvaluate.addEventListener('click', ()=>{
  evaluate.value = [];
  response.innerHTML = response.innerHTML = '<pre>[]</pre>';
});
//Copiamos la evaluación y notificamos 
copyEvaluate.addEventListener('click', ()=>{
  navigator.clipboard.writeText(evaluate.value);

  vscode.postMessage({
    command: 'copyEvaluate',
    copy: evaluate.value
  });
});

//Eliminamos la ultima propiedad o funcion
deletePoint.addEventListener('click', ()=>{
  deletePointEvaluate();
});

evaluate.addEventListener('input', (event)=>{
  clearTimeout(setTimeEvaluate);
  setTimeEvaluate = setTimeout(()=>{
    event.target.value = event.target.value.replace(/"/g, "'")
    onEvaluate(evaluate.value);
  },400);
});

/**
 * Escuchamos los eventos desde la extensión
 */
window.addEventListener('message', event=>{
  const message = event.data;
  switch (message.command) {
    case 'resource':
      evaluate.value = message.evaluate;
      editor.setValue(JSON.stringify(message.resource, undefined, tabSize));
      break;
    case 'evaluate':
      response.innerHTML = '<pre>' + JSON.stringify(message.evaluate, undefined, tabSize) + '</pre>';
      break;
    case 'showFunctionInfo': 
      setInfoFunctions(message.data);
      addFunction = document.getElementById('addFunction');
      addFunction.addEventListener('click', (e)=>{
        evaluate.value = getValueProperty(e.target.dataset.function);
        onEvaluate(evaluate.value || '');
      })
      break;
    case 'addFunction':
      evaluate.value = getValueProperty(message.data);
      onEvaluate(evaluate.value || '');
      break;
  }
});

//#region Funciones
function getValueProperty(token) {
  
  if (evaluate.value==='') {
    stringEvaluate = [];
  }
  if (evaluate.value) {
    stringEvaluate = evaluate.value.split('.');
  }
  if (typeof token==='object') {
    stringEvaluate.push(token.string.replace(/"/g, ""));
  }
  if (typeof token==='string') {
    stringEvaluate.push(token.replace(/"/g, ""));
  }


  return stringEvaluate.join('.')
}

function onEvaluate(value) {
  if(!value) return;
  vscode.postMessage({
    command: 'evaluate',
    evaluate: value,
    resource: editor.getValue()
  });
}

/**
 * Muestra la información detallada de cada función disponible en Fhirpath
 * @param {*} data 
 */
function setInfoFunctions(data){
  const infoFunction = document.getElementById('infoFunction');
  if (data) {
    let html = '<div class="container-info-funcFHIR">';
    html+= '<div class="container-info-funcFHIR-title"><h2>'+ data.name +'</h2>';

    if (data.function) {
      html+= '<i title="add-funcion" id="addFunction" data-function="'+data.function+'" class="codicon codicon-word-wrap active"></i>';
    } 

    html+= '</div>';
    html+= '<div class="container-info-funcFHIR-signature"><h3>'+ data.signature+'</h3></div>'; 

    if(data.info) {
      html+= '<div class="container-info-funcFHIR-information">'+data.info+'</div>';
    }
    if(data.example && data.example.length>0){
      html+= '<div class="container-info-funcFHIR-example">';
      data.example.forEach(example=>{
        html+= example + '</br>';
      })
      html+='</div>';
    }
    html+='</div>'
    infoFunction.innerHTML = html;
  }
  
}

/**
 *  Muestra las funciones disponibles
 * @param {*} data 
 */
function setContainerFunctions(data) {
  const categories = document.getElementById('categories');
  if (data.length>0 && categories) {
    let html = '<div class="container-category">'
    data.forEach(group => {
      if (group.some(fun=>{return fun.isVisible})) {
        html+= '<span>'+ group[0]["category"] +'</span>'//Obtenemos el nombre de la categoría de las funciones FHIRPATH
      }      
      if(group.length>0) {
        html+= '<div class="container-functions">';//Imprimimos los label con las funciones
        group.forEach(functionFhir=>{
          if(functionFhir.isVisible) {
            var data_str = JSON.stringify(functionFhir);
            html+="<div class='label' data-func='"+ data_str + "'>"
            + functionFhir.name+'</div>';
          }
        })
        html+= '</div>'
      }
    });
    html+= '</div>'; 
    categories.innerHTML = html;
  }
  setEventListenerLabel();
}

/**
 * Establecemos los eventos para los label con la información de las funciones disponibles en FHIRPATH
 */
function setEventListenerLabel() {
  labelFunctions = document.querySelectorAll('.label');
  labelFunctions.forEach(label => {
    label.addEventListener('click', event => {
      if(label.getAttribute('data-func')) {
        setInfoFunctions(label.getAttribute('data-func'));
      }
    });
  });
}

function setEventProperties() {
  return;
}

function deletePointEvaluate() {
  let evaluatePoint = evaluate.value.split(".");
  if (evaluatePoint.length > 0) {
    evaluatePoint.pop();
    evaluate.value = evaluatePoint.join('.');
  }
  onEvaluate(evaluate.value);
}