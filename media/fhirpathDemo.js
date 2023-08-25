//const canvas = document.getElementById('vscodeTestCanvas');
const vscode = acquireVsCodeApi();
const resource = document.getElementById('resource');
const evaluate = document.getElementById('evaluate');
const response = document.getElementById('response');
let setTimeEvaluate;


evaluate.addEventListener('input', (event)=>{
    clearTimeout(setTimeEvaluate);
    setTimeEvaluate = setTimeout(()=>{
      vscode.postMessage({
        command: 'evaluate',
        evaluate: event.target.value,
        resource: resource.value
      });
    },400);
});

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
    }
});