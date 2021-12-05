function aparecerRecorder(){
    appearTag('holder');
    hideTag('calendario');
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
}

function fecharRecorder(){
    diaEscolhido = null;
    appearTag("recordButton");
    hideTag('holder');
    appearTag('calendario');
    document.getElementById('savedAudio').src = "";
    document.getElementById('teacherSavedAudio').src = "";
    document.getElementById('teacherText').innerHTML ="";
    document.getElementById('studentText').innerHTML ="";
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
    if(diaEscolhido != null){
        let reference = "";
        let text = "";
        if(userCurrent != null){
        reference = "Students/" + userCurrent.uid + '/' + ano + '/' + mes + '/' + diaEscolhido;
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
        }else {
            let diaTeacher = "dr";
            diaTeacher = diaTeacher.replace('d', diaEscolhido);
            reference = "Students/" + currentStudent.id + '/' + ano + '/' + mes + '/' + diaTeacher;
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
        }
    }
}
