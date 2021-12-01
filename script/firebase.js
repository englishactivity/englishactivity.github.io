const firebaseConfig = {
    apiKey: "AIzaSyBXPl-CN7YbwiRWwlFoNQrPGopE2x-WFSs",
    authDomain: "english-class-deca9.firebaseapp.com",
    projectId: "english-class-deca9",
    storageBucket: "english-class-deca9.appspot.com",
    messagingSenderId: "537487313873",
    appId: "1:537487313873:web:f0c398be515c10b8726ef0",
    measurementId: "G-CE8N6HD98L"
};

var didNotInitialize = true;

if (didNotInitialize) {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    didNotInitialize = false;
}