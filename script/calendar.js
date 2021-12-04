class HistoricoMes {
    constructor(mes, primeiroDiaSemana, primeiroMes) {
        this.mes = mes;
        this.primeiroDiaSemana = primeiroDiaSemana;
        this.primeiroMes = primeiroMes;
    }

    ePrimeiro() {
        return this.primeiroMes;
    }

    primeiraSemana() {
        return this.primeiroDiaSemana;
    }
}

var agMes = {
    "1": [],
    "2": [],
    "3": [],
    "4": [],
    "5": [],
    "6": [],
    "7": [],
    "8": [],
    "9": [],
    "10": [],
    "11": [],
    "12": []
};

var meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
]

var nomeSemana = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado"
]

var diasMaxMes = [
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
];

  function checarResposta(d){
    diaEscolhido = d;
    aparecerRecorder();
    let reference = "";
    if(userCurrent != null){
      hideTag('recordButton');
      hideTag('getStudentText');
      appearTag('teacherText');
      appearTag('studentText');
      reference = "Students/" + userCurrent.uid + '/' + ano + '/' + mes + '/' + d;
      getTeacherText(userCurrent.uid,d);
      getStudentText(userCurrent.uid,d);
    }else{
      reference = "Students/" + currentStudent.id + '/' + ano + '/' + mes + '/' + d;
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

/********************************************************
 * FUNCTION: colocarMes
 * DESCRIPTION: colocar o título do mês, colocando o nome
 * do mês e o número do ano.
 ********************************************************/
 function colocarMes() {
    document.getElementById("nomeMes").innerHTML = meses[mes] + " - " + ano;
}


/********************************************************
 * FUNCTION: checarBissexto
 * DESCRIPTION: checa se o ano é bissexto, para saber
 * se fevereiro tem 28 ou 29 dias
 ********************************************************/
function checarBissexto() {
    if (((ano % 4 == 0) && (ano % 100 != 0)) || (ano % 400 == 0)) {
        diasMaxMes[1] = 29;
    }
    else {
        diasMaxMes[1] = 28;
    }
}

/********************************************************
 * FUNCTION: tirarDiasAnterios
 * DESCRIPTION: tira dias anteriores do mes atual
 ********************************************************/
function tirarDiasAnteriores(uid) {
    var dias = 1;
    var semana = historico[0].primeiraSemana();
    var diasPassados = 0;
    for (dias; dias <= diaAtual[1]; dias++) {
        ++semana;
        if (semana> 7) {
            semana = 1;
        }

        if(semana != 1 && semana != 7){
            diasPassados += 1;
        }
    }

    var nota = (quantidadeDiasOcupados / diasPassados) * 10;
    document.getElementById("notaDoMes").innerHTML = "Nota Do Mês: " + Math.round(nota);

    if(userCurrent != null){
        let reference = "Students/" + uid + '/' + ano + '/' + mes +'/nota';
        firebase.database().ref(reference).set({nota });
    }
}

/********************************************************
 * FUNCTION: desenharCalendario
 * DESCRIPTION: Colocar as informações do calendário de 
 * acordo com o mês.
 ********************************************************/
function desenharCalendario() {
    var id = "ab";
    var dias = 1;
    var id2 = historico[historico.length - 1].primeiroDiaSemana;
    var diaClick = "diaClick(9, s)";
    var texto = "<a href=#horariosDia> $ </a>";
    primeiroDiaSemanaMes = historico[historico.length - 1].primeiroDiaSemana;
    var ocupado = "d";
    var checarResposta = "checarResposta(d)";

    for (dias; dias <= diasMaxMes[mes]; dias++) {
        ocupado = "d";
        id = "ab";
        diaClick = "diaClick(9, s)";
        texto = "<a href=#horariosDia> $ </a>";
        checarResposta = "checarResposta(d)";
        texto = texto.replace("$", dias);
        id = id.replace("a", primeiroDiaSemanaMes)
        id = id.replace("b", id2);
        diaClick = diaClick.replace("9", dias);
        diaClick = diaClick.replace("s", primeiroDiaSemanaMes);

        document.getElementById(id).innerHTML = texto;
        if (primeiroDiaSemanaMes == 1 || primeiroDiaSemanaMes == 7) {
            document.getElementById(id).innerHTML = dias;
            document.getElementById(id).classList.remove("agendaLivre");
            document.getElementById(id).classList.remove("clicavel");
            document.getElementById(id).classList.add("agendaCheia");
            document.getElementById(id).removeAttribute("onclick");
        }
        else {
            document.getElementById(id).classList.add("agendaLivre");
            document.getElementById(id).classList.add("clicavel");
            document.getElementById(id).setAttribute("onclick", diaClick);
        }

        ocupado = ocupado.replace("d", dias);

        if (diaOcupado[ocupado] != null && diaOcupado[ocupado] == 1) {
            document.getElementById(id).innerHTML = dias;
            checarResposta = checarResposta.replace("d", dias);
            document.getElementById(id).classList.remove("agendaLivre");
            document.getElementById(id).classList.add("clicavel");
            document.getElementById(id).classList.add("agendaCheia");
            document.getElementById(id).removeAttribute("onclick");
            document.getElementById(id).setAttribute("onclick", checarResposta);
        } else if (diaOcupado[ocupado] != null && diaOcupado[ocupado] == 2){
            checarResposta = checarResposta.replace("d", dias);
            document.getElementById(id).classList.remove("agendaLivre");
            document.getElementById(id).classList.remove("agendaCheia");
            document.getElementById(id).classList.add("clicavel");
            document.getElementById(id).classList.add("respostaDada");
            document.getElementById(id).removeAttribute("onclick");
            document.getElementById(id).setAttribute("onclick", checarResposta);
        }


        ++primeiroDiaSemanaMes;
        ++id2;
        if (primeiroDiaSemanaMes > 7) {
            primeiroDiaSemanaMes = 1;
        }
    }

    appearTag('calendario');
}

/********************************************************
 * FUNCTION: criarCalendario
 * DESCRIPTION: atualizar as informações do calendário
 * e tirando os dias já passados do mês
 *********************************************************/
 function criarCalendario(uid) {
    colocarMes();
    checarBissexto();

    while (dia > 1) {
        --dia;
        --diaSemana;
        if (diaSemana <= 0) {
            diaSemana = 7
        }
    }
    primeiroDiaSemanaMes = diaSemana;

    if (historico.length == 0) {
        historico[0] = new HistoricoMes(mes, primeiroDiaSemanaMes, true);

    }
    
    desenharCalendario();
    if (mes == historico[0].mes) {
        tirarDiasAnteriores(uid);
    }
}

function apagarCalendario() {
    var apagar = document.getElementsByClassName("dias");
    for (var id = 0; id < apagar.length; id++) {
        apagar[id].innerHTML = " ";
        apagar[id].classList.remove("agendaLivre");
        apagar[id].classList.remove("agendaCheia");
        apagar[id].classList.remove("clicavel");
        apagar[id].classList.remove("respostaDada");
        
    } 
}

/*function proximoMes(uid) {
    apagarCalendario();
    ++mes;
    if (mes > 11) {
        mes = 0;
        ++ano;
    }

    historico[historico.length] = new HistoricoMes(mes, primeiroDiaSemanaMes, false);
   // horariosAgendados();
    diasOcupado(uid);
    document.getElementById("notaDoMes").classList.add('hide');
}*/

/*function voltarMes(uid) {
    if (historico[historico.length - 1].ePrimeiro() != true) {
        historico.pop();
        apagarCalendario();
        --mes;
        if (mes < 0) {
            mes = 11
            --ano;
        }
        primeiroDiaSemanaMes = historico[historico.length - 1].primeiraSemana();

       // horariosAgendados();
       diasOcupado(uid);
    }else{
        document.getElementById("notaDoMes").classList.remove('hide');
    }
     
}*/

/***********************************************
 * FUNCTION: diaClick
 * DESCRIPTION: Chama todas as funções necessárias
 * para abrir e mostrar os horarios disponíveis 
 * do dia escolhido pelo cliente.
 **********************************************/
 function diaClick(dia, semana) {

    diaEscolhido = dia;
    aparecerRecorder();
}

/********************************************************
 * FUNCTION: horariosAgendados
 * DESCRIPTION: Salvar todos os horarios agendados na
 * variavel agMes.
 ********************************************************/
 function diasOcupado(uid) {
    colocarDiaOcupado(uid);
}
