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
var currentStudent = null;
var teacherCurrent = null;

var userCurrent;
var storage = firebase.storage();
var databaseRef = firebase.database();
var onRecorder = isOnRecorder();

function isOnRecorder(){
  let result = false;
  if( window.location.pathname === '/recorder.html'){
    result = true;
  }
  return result;
}

function hideTag(id){
  document.getElementById(id).classList.add('hide');
}

function appearTag(id){
  document.getElementById(id).classList.remove('hide'); 
}

function colocarDiaOcupado(id){
  let reference = "Students/" + id + '/' + ano + '/' + mes;
  databaseRef.ref(reference).once('value', (snapshot) => {
    snapshot.forEach(function (childSnapshot) {
      let review = childSnapshot.val().review;
      if(review === true){
        diaOcupado[childSnapshot.val().dia] = 2;  
        quantidadeDiasOcupados += 1;
      }else if (review === false){
        diaOcupado[childSnapshot.val().dia] = 1;
        quantidadeDiasOcupados += 1;
      }
    });
    if(onRecorder === false || isUserATeacher(teacherCurrent)){
      try{
        criarCalendario(id);
      }catch(e){   }
    }
});
}

/***********************************************************
 * checkStudentHasTeacher
 * Está função checa se o estudante já possui o id do professor.
 * caso o estudant não tenha o id do professor, 
 * a função irá chamar a função chooseTeacher
 ***********************************************************/
function checkStudentHasTeacher(id){
  let reference = "StudentsInfo/" + id + '/info';
  databaseRef.ref(reference).once('value', (snapshot) => {
    try{
      let teacherId = snapshot.val().teacherId;
      if(teacherId == undefined || teacherId == null){
        chooseTeacher();
      }
    }catch(e){
      chooseTeacher();
    }
  });
}

function chooseTeacher(){
  appearTag('chooseTeacher');
  hideTag('calendario');
  hideTag('holder')
}

/*function saveAudioFromFile(){
    var files = document.getElementById("upload").files[0];
    document.getElementById("audio").load();
    var storageRef = firebase.storage().ref().child('audio/' + files.name);
    storageRef.put(files);
}*/

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
  apagarCalendario();
  document.getElementById("calendario").classList.remove("hide");
  diaOcupado = {};
  quantidadeDiasOcupados = 0;
  currentStudent = studentsList[id];
  localStorage.setItem('currentStudentId', id);
  colocarDiaOcupado(id);
}

function getCurrentStudentId(){
  return localStorage.getItem('currentStudentId');
}

function getStudentsInfo(){
  let reference = "StudentsInfo/";
  databaseRef.ref(reference).once('value', (snapshot) => {
    snapshot.forEach(function (childSnapshot) {
      let info = childSnapshot.val().info;

      if(info.teacherId === teacherCurrent.uid){
        studentsList[info.id] = new Student(info.name, info.id, info.newAudio);
      }
    });
    createStudentList();
  });
}

function isUserATeacher(teacher){
  if(teacher === null){
    return false;
  }
  return (teacher.uid == "vOdPdTtvKah6PoMS8ymFQQuO0iw2" || teacher.uid == 'Q2PSldgC67YjOR20BhprT2yYf8H3');
}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
      if(isUserATeacher(user)){
        teacherCurrent = user;
        getStudentsInfo();
        //document.getElementById("calendario").classList.add("hide");
        //document.getElementById("studentList").classList.remove("hide");
        hideTag("calendario");
        hideTag('holder');
        appearTag('studentList');
        /*if(onRecorder === false){
          document.getElementById("calendario").classList.add("hide");
          document.getElementById("studentList").classList.remove("hide");
          getStudentsInfo();
        } else{
          aparecerRecorder();
        }*/
        return;
      }
      
      
      userCurrent = user;
      localStorage.setItem('currentStudentId', user.uid);
      if(isOnRecorder()){
        aparecerRecorder();
      }else{
        colocarDiaOcupado(userCurrent.uid);
        atualizarDadosUsuario();
        document.getElementById('currentUser').innerHTML = "Bem vindo " + user.displayName;
      }
      
    }
    else {
        userNotLogged();
    }
})

function getAno(){
  let ano = localStorage.getItem("ano");
  if(ano == null){
    dayNotChoosed();
  }
  return ano;
}

function getMes(){
  let mes = localStorage.getItem("mes");
  if(mes == null){
    dayNotChoosed();
  }
  return mes;
}

function getDiaEscolhido(){
  let dia = localStorage.getItem("diaEscolhido");
  if(dia == null){
    dayNotChoosed();
  }
  return dia;
}

function userNotLogged(){
  window.location.replace("index.html");
}

function dayNotChoosed(){
  window.location.replace("user.html");
}

function sairDoRecorder(){
  if(isUserATeacher(teacherCurrent)){
    hideTag('holder');
    appearTag('studentList');
    appearTag('calendario');
    document.getElementById("savedAudio").src = "";
    document.getElementById("teacherSavedAudio").src = "";
  }else{
    window.location.replace("user.html");
  } 
}

function checkIfAllAudiosGotAnswered(id){
  let reference = "Students/" + id + '/' + ano + '/' + mes;
  databaseRef.ref(reference).once('value', (snapshot) => {
    let answerEverything = true;
    snapshot.forEach(function (childSnapshot) {
      if(childSnapshot.val().review == false){
        studentHasNewAudio(id);
        answerEverything = false;
      }
    });
    if(answerEverything){
      let reference = "StudentsInfo/" + id + '/info/newAudio';
      firebase.database().ref(reference).set(false);
    }
});
}

function getStudentText(id, day){
  let reference = "Students/" + id + '/' +  ano + '/' + mes + '/' + day;
  databaseRef.ref(reference).once('value', (snapshot) => {
    let text = snapshot.val().studentText;
    if(text != undefined){
      document.getElementById('studentText').innerHTML = snapshot.val().studentText;
      appearTag('studentText');
    }
  });
}

function getTeacherText(id, day){
  let reference = "Students/" + id + '/' +  ano + '/' + mes + '/' + day;
  databaseRef.ref(reference).once('value', (snapshot) => {
    let text = snapshot.val().teacherText;
    if(text != undefined){
      document.getElementById('teacherText').innerHTML = snapshot.val().teacherText;
      appearTag('teacherText');
    }
  });
}

function studentHasNewAudio(id){
  let reference = "StudentsInfo/" + id + '/info/newAudio';
  firebase.database().ref(reference).set(true);
}

function logout(){
  firebase.auth().signOut().then(function() {
    window.location = 'index.html';
  }, function(error) {
    // An error happened.
  });
}

function salvarIdUsuario(id){
  let reference = "StudentsInfo/" + id + '/info/id' ;
  firebase.database().ref(reference).set(userCurrent.uid);
}

function salvarNomeUsuario(id){
  let reference = "StudentsInfo/" + id + '/info/name' ;
  firebase.database().ref(reference).set(userCurrent.displayName);
}

function salvarTeacherId(id){
  let reference = "StudentsInfo/" + userCurrent.uid + '/info/teacherId' ;
  firebase.database().ref(reference).set(id);
  hideTag("chooseTeacher");
  appearTag('calendario');
}

function salvarDiaEscolhido(id, dia){
  let reference = "Students/" + id + '/' + ano + '/' + mes + '/' + dia + '/dia';
  firebase.database().ref(reference).set(dia);
}

function salvarReview(id, dia, caso){
  let reference = "Students/" + id + '/' + ano + '/' + mes + '/' + dia + '/review';
  firebase.database().ref(reference).set(caso);
}

function salvarTeacherText(id, dia, text){
  let reference = "Students/" + id + '/' + ano + '/' + mes + '/' + dia + '/teacherText';
  firebase.database().ref(reference).set(text);
}

function salvarStudentText(id, dia, text){
  let reference = "Students/" + id + '/' + ano + '/' + mes + '/' + dia + '/studentText';
  firebase.database().ref(reference).set(text);
}

function checkStudentSavedData(id){
  let reference = "StudentsInfo/" + id + '/info';
  databaseRef.ref(reference).once('value', (snapshot) => {
    let studentId = null;
    try{
     studentId = snapshot.val().id;
     if(studentId == undefined || studentId == null){
      salvarIdUsuario(userCurrent.uid);
      salvarNomeUsuario(userCurrent.uid);
      }
    }catch(e){
      salvarIdUsuario(userCurrent.uid);
      salvarNomeUsuario(userCurrent.uid);
    }
  });
}

function atualizarDadosUsuario(){
  if(userCurrent != null){
    checkStudentSavedData(userCurrent.uid);
    checkStudentHasTeacher(userCurrent.uid);
  }
}

