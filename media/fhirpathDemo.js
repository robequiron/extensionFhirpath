//const canvas = document.getElementById('vscodeTestCanvas');
const vscode = acquireVsCodeApi();
const resource = document.getElementById('resource');
const evaluate = document.getElementById('evaluate');
const response = document.getElementById('response');
let labelFunctions = document.querySelectorAll('.label');
let setTimeEvaluate;



evaluate.addEventListener('input', (event)=>{
    clearTimeout(setTimeEvaluate);
    setTimeEvaluate = setTimeout(()=>{
      event.target.value = event.target.value.replace(/"/g, "'")
      vscode.postMessage({
        command: 'evaluate',
        evaluate: event.target.value,
        resource: resource.value
      });
    },400);
});

/**
 * Escuchamos los eventos desde la extensión
 */
window.addEventListener('message', event=>{
    const message = event.data;
    switch (message.command) {
      case 'resource':
        evaluate.value = message.evaluate,
        resource.value = JSON.stringify(message.resource, undefined, 4);
        break;
      case 'evaluate':
        response.innerHTML = '<pre>' + JSON.stringify(message.evaluate, undefined, 4) + '</pre>';
        break;
      case 'functionFhirpath':
        setContainerFunctions(message.data)
        break;
    }
});

/**
 * Muestra la información detallada de cada función disponible en Fhirpath
 * @param {*} data 
 */
function setInfoFunctions(data){
  const infoFunction = document.getElementById('infoFunction');
  
  if (data) {
    data = JSON.parse(data);
    let html = '<div class="container-info-funcFHIR">';
    html+= '<div class="container-info-funcFHIR-title"><h2>'+ data.name +'</h2></div>'
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

