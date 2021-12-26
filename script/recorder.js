
function aparecerRecorder(){
    appearTag('holder');
    let checarResposta = localStorage.getItem('checarResposta');
    if(checarResposta === 'false'){
        if(userCurrent != null){
            hideTag('getTeacherText');
            hideTag('teacherText');
            hideTag('studentText');
            appearTag('getStudentText');
        }else{
            hideTag('getStudentText');
            appearTag('studentText');
            appearTag('teacherText');
        }
    }else{
      let reference = "";
      let ano = getAno();
      let mes = getMes();
      let dia = getDiaEscolhido();
        if(userCurrent != null){
            hideTag('recordButton');
            hideTag('getStudentText');
            appearTag('teacherText');
            appearTag('studentText');
            reference = "Students/" + userCurrent.uid + '/' + ano + '/' + mes + '/' + dia;
            getTeacherText(userCurrent.uid,dia);
            getStudentText(userCurrent.uid,dia);
        }else{
            reference = "Students/" + currentStudent.id + '/' + ano + '/' + mes + '/' + dia;
            appearTag('teacherText');
            appearTag('studentText');
            getTeacherText(currentStudent.id,dia);
            getStudentText(currentStudent.id,dia);
        }
        
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
  }

var myRecorder;
jQuery(document).ready(function () {
    var $ = jQuery;
    myRecorder = {
        objects: {
            context: null,
            stream: null,
            recorder: null
           },
        init: function () {
            if (null === myRecorder.objects.context) {
                myRecorder.objects.context = new (
                        window.AudioContext || window.webkitAudioContext
                        );
                }
            },
        start: function () {
            var options = {audio: true, video: false};
            navigator.mediaDevices.getUserMedia(options).then(function (stream) {
            myRecorder.objects.stream = stream;
            myRecorder.objects.recorder = new Recorder(
                myRecorder.objects.context.createMediaStreamSource(stream),
                {numChannels: 1}
            );
            myRecorder.objects.recorder.record();
        }).catch(function (err) {});
    },
    stop: function (listObject) {
        if (null !== myRecorder.objects.stream) {
            myRecorder.objects.stream.getAudioTracks()[0].stop();
        }
        if (null !== myRecorder.objects.recorder) {
            myRecorder.objects.recorder.stop();

            // Validate object
            if (null !== listObject
                    && 'object' === typeof listObject
                    && listObject.length > 0) {
                // Export the WAV file
                    myRecorder.objects.recorder.exportWAV(function (blob) {
                        var url = (window.URL || window.webkitURL)
                            .createObjectURL(blob);
                        if(userCurrent != null){
                         document.getElementById("savedAudio").src = url;
                        }else{
                            document.getElementById("teacherSavedAudio").src = url;
                        }
                    });
                }
                
            }
        }
    };

    // Prepare the recordings list
    var listObject = $('[data-role="recordings"]');
    // Prepare the record button
    $('[data-role="controls"] > button').click(function () {
        // Initialize the recorder
        myRecorder.init();

        // Get the button state 
        var buttonState = !!$(this).attr('data-recording');

        // Toggle
      if (!buttonState) {
           $(this).attr('data-recording', 'true');
            myRecorder.start();
        } else {
           $(this).attr('data-recording', '');
            myRecorder.stop(listObject);
        }
    });
});

function saveRecordedAudio(){
    let ano = getAno();
    let mes = getMes();
    let diaEscolhido = getDiaEscolhido();

    if(diaEscolhido != null){
        let reference = "";
        let text = "";
        if(userCurrent != null){
        reference = "Students/" + userCurrent.uid + '/' 
            + ano + '/' + mes + '/' + diaEscolhido;
        try{
            myRecorder.objects.recorder.exportWAV(function (blob) {
                var url = (window.URL || window.webkitURL)
                    .createObjectURL(blob);
                var storageRef = firebase.storage().ref(reference);
                storageRef.put(blob);
                text = document.getElementById('getStudentText').value;
                salvarDiaEscolhido(userCurrent.uid, diaEscolhido);
                salvarReview(userCurrent.uid, diaEscolhido, false);
                if(text != null){
                    salvarStudentText(userCurrent.uid, diaEscolhido, text);
                }
                studentHasNewAudio(userCurrent.uid);
                alert("Audio Enviado com sucesso!");
            });    
            }catch(e){
                 alert("Você esqueceu de gravar o áudio");
            }
        }else {
            let diaTeacher = "dr";
            diaTeacher = diaTeacher.replace('d', diaEscolhido);
            reference = "Students/" + currentStudent.id + '/'
                 + ano + '/' + mes + '/' + diaTeacher;
            try{
                myRecorder.objects.recorder.exportWAV(function (blob) {
                    var url = (window.URL || window.webkitURL)
                        .createObjectURL(blob);
                    text = document.getElementById('getTeacherText').value;       
                    var storageRef = firebase.storage().ref(reference);
                    storageRef.put(blob);
                    salvarDiaEscolhido(currentStudent.id, diaEscolhido);
                    salvarReview(currentStudent.id, diaEscolhido, true);
                    if(text != null){
                        salvarTeacherText(currentStudent.id, diaEscolhido, text);
                    }
                    checkIfAllAudiosGotAnswered(currentStudent.id)
                    alert("Audio Enviado com sucesso!");
                });       
            }catch(e){
                alert("Você esqueceu de gravar o áudio");
            }
        }
    }else{
        dayNotChoosed();
    }
}
