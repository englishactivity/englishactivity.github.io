
var horaEscolhida = 0;
var diaEscolhido = 0;
var semanaEscolhida = 0;
var data = new Date();
var dia = data.getDate();
var diaSemana = data.getDay() + 1; //0 = domingo por isso a soma
var mes = data.getMonth(); //0 = janeiro
var ano = data.getFullYear();
var primeiroDiaSemanaMes = diaSemana;
var historico = [];
var diaAtual = [diaSemana, dia];
var diaOcupado = {};
var quantidadeDiasOcupados = 0;
var studentsList ={};
var currentStudent = new Student("Beatriz", "ckmfNnhYEkSPTxG3K8UbdhN4Aci1", true);

var userCurrent = firebase.auth().currentUser;
var storage = firebase.storage();

/*function saveAudioFromFile(){
    var files = document.getElementById("upload").files[0];
    document.getElementById("audio").load();
    var storageRef = firebase.storage().ref().child('audio/' + files.name);
    storageRef.put(files);
}*/

function userNotLogged(){
    console.log("User not logged");
}
var storage = firebase.storage();

function colocarDiaOcupado(id){
  let reference = "Students/" + id + '/' + ano + '/' + mes;
  firebase.database().ref(reference).once('value', (snapshot) => {
    snapshot.forEach(function (childSnapshot) {
      if(childSnapshot.val().review){
        diaOcupado[childSnapshot.val().dia] = 2;  
      }else{
        diaOcupado[childSnapshot.val().dia] = 1;
      }
      quantidadeDiasOcupados += 1;
    });
    criarCalendario(id);
});
}

function createStudentList(){
  let list = "";
  for( key in studentsList){
    list += "<button class='student ";
    if(studentsList[key].newAudio != null && studentsList[key].newAudio){
      list += "newAudio";
    }
    
    list += " ' onclick='createStudentCalendar(\"" + studentsList[key].id + "\")'>" + studentsList[key].name + "</button>";
  }

  document.getElementById("studentList").innerHTML = list;
}

function createStudentCalendar(id){
  document.getElementById("calendario").classList.remove("hide");
  diaOcupado = {};
  quantidadeDiasOcupados = 0;
  currentStudent = studentsList[id];
  console.log(currentStudent);
  apagarCalendario();
  colocarDiaOcupado(id);
}

function getStudentsInfo(){
  let reference = "Students/";
  firebase.database().ref(reference).once('value', (snapshot) => {
    snapshot.forEach(function (childSnapshot) {
      let info = childSnapshot.val().info;
      studentsList[info.id] = new Student(info.name, info.id, info.newAudio);
    });
    console.log(studentsList);
    createStudentList();
  });
}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
      if(user.uid == "TyGwwULrWeYFuFmlYSSvdAbO4am1"){
        document.getElementById("calendario").classList.add("hide");
        document.getElementById("studentList").classList.remove("hide");
        getStudentsInfo();
      }else{
        userCurrent = user;
        colocarDiaOcupado(user.uid);
        document.getElementById('currentUser').innerHTML = "Bem vindo " + user.displayName;
      }
    }
    else {
        userNotLogged();
    }
})


function checarResposta(d){
  diaEscolhido = d;
  aparecerRecorder();
  let reference = "";
  if(userCurrent != null){
    document.getElementById("recordButton").classList.add("hide");
    reference = "Students/" + userCurrent.uid + '/' + ano + '/' + mes + '/' + d;
  }else{
    reference = "Students/" + currentStudent.id + '/' + ano + '/' + mes + '/' + d;
  }
  //let reference = "audio/Sun, 28 Nov 2021 23:24:05 GMT";
  console.log(reference);
  firebase.storage().ref(reference).getDownloadURL().then(function(url) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function(event) {
      var blob = xhr.response;
    };
  
    let audio = document.getElementById('savedAudio');
    audio.src = url;
  }).catch(function(error) {
    // Handle any errors
  });

  reference = reference + 'r';
  
  firebase.storage().ref(reference).getDownloadURL().then(function(url) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function(event) {
      var blob = xhr.response;
    };
  
    let audio = document.getElementById('teacherSavedAudio');
    audio.src = url;
  }).catch(function(error) {
    // Handle any errors
  });
  
}

function checkIfAllAudiosGotAnswered(id){
  let reference = "Students/" + id + '/' + ano + '/' + mes;
  firebase.database().ref(reference).once('value', (snapshot) => {
    let answerEverything = true;
    snapshot.forEach(function (childSnapshot) {
      if(childSnapshot.val().review == false){
        studentHasNewAudio(id);
        answerEverything = false;
      }
    });
    if(answerEverything){
      let reference = "Students/" + id + '/info/newAudio';
      firebase.database().ref(reference).set(false);
    }
});
}

function studentHasNewAudio(id){
  let reference = "Students/" + id + '/info/newAudio';
  firebase.database().ref(reference).set(true);
}

function logout(){
  firebase.auth().signOut().then(function() {
    window.location = 'index.html';
  }, function(error) {
    // An error happened.
  });
}

function salvarNomeUsuario(){
  if(userCurrent != null){
  let reference = "Students/" + userCurrent.uid + '/info' ;
  firebase.database().ref(reference).set({
    "name" : userCurrent.displayName,
    "id" : userCurrent.uid
  });
}
}
