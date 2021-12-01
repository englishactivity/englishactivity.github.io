function aparecerRecorder(){
    document.getElementById('holder').classList.remove('hide');
    document.getElementById('calendario').classList.add('hide');
}

function fecharRecorder(){
    diaEscolhido = null;
    document.getElementById("recordButton").classList.remove("hide");
    document.getElementById('holder').classList.add('hide');
    document.getElementById('calendario').classList.remove('hide'); 
    document.getElementById('savedAudio').src = "";
    document.getElementById('teacherSavedAudio').src = "";
}
