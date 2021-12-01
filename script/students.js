class Student{
    constructor(name, id, newAudio){
        this.name = name;
        this.id = id;
        this.newAudio = newAudio;
    }

    createStudentCalendar(){
        colocarDiaOcupado(this.id);
    }
}