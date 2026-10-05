/* =====================================================
   HANDTALK JAVASCRIPT
===================================================== */


/* =====================================================
   TEXT TO SPEECH
===================================================== */

function speakWord(text) {

    if (!("speechSynthesis" in window)) {

        alert("Speech synthesis is not supported in this browser.");

        return;
    }

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.rate = 0.9;

    speech.pitch = 1;

    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(speech);
}


/* =====================================================
   LEARNING PAGE
===================================================== */

function playLesson(word) {

    const message =
        document.getElementById("aiMessage");

    if (message) {

        message.innerText =
            "Let's learn the sign for " + word + " 🤟";

    }

    speakWord(
        "This lesson teaches the sign for " + word
    );
}


/* =====================================================
   TRANSLATOR
===================================================== */

let video =
    document.getElementById("camera");

let canvas =
    document.getElementById("output");

let ctx =
    canvas ? canvas.getContext("2d") : null;

let startButton =
    document.getElementById("startCamera");

let stopButton =
    document.getElementById("stopCamera");

let translatedText =
    document.getElementById("translatedText");

let subtitle =
    document.getElementById("subtitle");

let cameraStatus =
    document.getElementById("cameraStatus");

let speakButton =
    document.getElementById("speakButton");


let currentTranslation = "";

let cameraStream = null;

let cameraObject = null;


/* =====================================================
   MEDIAPIPE HANDS
===================================================== */

let hands = null;


if (typeof Hands !== "undefined") {

    hands = new Hands({

        locateFile: (file) => {

            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;

        }

    });


    hands.setOptions({

        maxNumHands: 1,

        modelComplexity: 1,

        minDetectionConfidence: 0.6,

        minTrackingConfidence: 0.6

    });


    hands.onResults(processHandResults);

}


/* =====================================================
   START CAMERA
===================================================== */

if (startButton) {

    startButton.addEventListener(
        "click",
        startCamera
    );

}


async function startCamera() {

    if (!video) return;


    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    width: 1280,

                    height: 720,

                    facingMode: "user"

                },

                audio: false

            });


        video.srcObject =
            cameraStream;


        await video.play();


        cameraStatus.innerText =
            "🟢 Camera is running";

        cameraStatus.style.background =
            "rgba(16,185,129,0.85)";


        canvas.width =
            video.videoWidth || 1280;

        canvas.height =
            video.videoHeight || 720;


        processVideo();


    } catch (error) {

        console.error(error);

        cameraStatus.innerText =
            "❌ Camera permission denied";

        alert(
            "Please allow camera permission in your browser."
        );

    }

}


/* =====================================================
   PROCESS VIDEO
===================================================== */

async function processVideo() {

    if (!video ||
        !cameraStream ||
        video.readyState < 2) {

        return;

    }


    if (hands) {

        await hands.send({
            image: video
        });

    }


    if (cameraStream) {

        requestAnimationFrame(
            processVideo
        );

    }

}


/* =====================================================
   STOP CAMERA
===================================================== */

if (stopButton) {

    stopButton.addEventListener(
        "click",
        stopCamera
    );

}


function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(track => track.stop());

        cameraStream = null;

    }


    if (video) {

        video.srcObject = null;

    }


    if (cameraStatus) {

        cameraStatus.innerText =
            "Camera stopped";

        cameraStatus.style.background =
            "rgba(0,0,0,0.7)";

    }


    if (ctx) {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }

}


/* =====================================================
   MEDIAPIPE RESULT
===================================================== */

function processHandResults(results) {

    if (!ctx || !canvas) return;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (!results.multiHandLandmarks ||
        results.multiHandLandmarks.length === 0) {

        updateTranslation(
            "Show your hand"
        );

        return;

    }


    const landmarks =
        results.multiHandLandmarks[0];


    /* Draw hand */

    if (typeof drawConnectors !== "undefined") {

        drawConnectors(
            ctx,
            landmarks,
            HAND_CONNECTIONS,
            {
                color: "#7c6cff",
                lineWidth: 4
            }
        );


        drawLandmarks(
            ctx,
            landmarks,
            {
                color: "#ffffff",
                lineWidth: 2,
                radius: 4
            }
        );

    }


    /* Detect gesture */

    const gesture =
        detectGesture(landmarks);


    updateTranslation(gesture);

}


/* =====================================================
   FINGER DETECTION
===================================================== */

function fingerExtended(
    landmarks,
    tip,
    pip
) {

    return (
        landmarks[tip].y <
        landmarks[pip].y
    );

}


function thumbExtended(landmarks) {

    return (
        landmarks[4].x <
        landmarks[3].x
    );

}


/* =====================================================
   GESTURE DETECTION
===================================================== */

function detectGesture(landmarks) {

    const index =
        fingerExtended(
            landmarks,
            8,
            6
        );

    const middle =
        fingerExtended(
            landmarks,
            12,
            10
        );

    const ring =
        fingerExtended(
            landmarks,
            16,
            14
        );

    const pinky =
        fingerExtended(
            landmarks,
            20,
            18
        );


    const thumb =
        thumbExtended(
            landmarks
        );


    const count =
        [index, middle, ring, pinky]
        .filter(Boolean)
        .length;


    /*
       I LOVE YOU

       Approximation:
       thumb + index + pinky extended,
       middle + ring folded.
    */

    if (
        thumb &&
        index &&
        !middle &&
        !ring &&
        pinky
    ) {

        return "I LOVE YOU 🤟";

    }


    /* Open palm */

    if (
        thumb &&
        index &&
        middle &&
        ring &&
        pinky
    ) {

        return "HELLO 👋";

    }


    /* Two fingers */

    if (
        index &&
        middle &&
        !ring &&
        !pinky
    ) {

        return "PEACE ✌️";

    }


    /* One finger */

    if (
        index &&
        !middle &&
        !ring &&
        !pinky
    ) {

        return "ONE ☝️";

    }


    /* Fist */

    if (
        !index &&
        !middle &&
        !ring &&
        !pinky
    ) {

        return "STOP ✊";

    }


    /* Thumbs up */

    if (
        thumb &&
        !index &&
        !middle &&
        !ring &&
        !pinky
    ) {

        return "GOOD 👍";

    }


    return "Gesture detected 🤟";

}


/* =====================================================
   UPDATE TRANSLATION
===================================================== */

function updateTranslation(text) {

    if (!translatedText ||
        !subtitle) return;


    translatedText.innerText =
        text;


    subtitle.innerText =
        text;


    currentTranslation =
        text;

}


/* =====================================================
   SPEAK TRANSLATION
===================================================== */

if (speakButton) {

    speakButton.addEventListener(
        "click",
        function () {

            if (!currentTranslation) {

                alert(
                    "No translation available."
                );

                return;

            }


            speakWord(
                currentTranslation
            );

        }
    );

}


/* =====================================================
   DICTIONARY SEARCH
===================================================== */

const dictionarySearch =
    document.getElementById(
        "dictionarySearch"
    );


if (dictionarySearch) {

    dictionarySearch.addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .toLowerCase()
                    .trim();


            const cards =
                document.querySelectorAll(
                    ".dictionary-card"
                );


            cards.forEach(card => {

                const text =
                    card.innerText
                        .toLowerCase();


                if (
                    text.includes(search)
                ) {

                    card.style.display =
                        "block";

                } else {

                    card.style.display =
                        "none";

                }

            });

        }
    );

}


/* =====================================================
   SETTINGS
===================================================== */

const voiceToggle =
    document.getElementById(
        "voiceToggle"
    );


const subtitleToggle =
    document.getElementById(
        "subtitleToggle"
    );


if (voiceToggle) {

    voiceToggle.addEventListener(
        "change",
        function () {

            localStorage.setItem(
                "voiceEnabled",
                this.checked
            );

        }
    );

}


if (subtitleToggle) {

    subtitleToggle.addEventListener(
        "change",
        function () {

            localStorage.setItem(
                "subtitleEnabled",
                this.checked
            );


            const box =
                document.querySelector(
                    ".subtitle-box"
                );


            if (box) {

                box.style.display =
                    this.checked
                        ? "block"
                        : "none";

            }

        }
    );

}


/* =====================================================
   LOAD SETTINGS
===================================================== */

window.addEventListener(
    "load",
    function () {

        const voice =
            localStorage.getItem(
                "voiceEnabled"
            );


        const subtitles =
            localStorage.getItem(
                "subtitleEnabled"
            );


        if (
            voice !== null &&
            voiceToggle
        ) {

            voiceToggle.checked =
                voice === "true";

        }


        if (
            subtitles !== null &&
            subtitleToggle
        ) {

            subtitleToggle.checked =
                subtitles === "true";

        }

    }
);
// function speakWord(text) {

//     const speech =
//         new SpeechSynthesisUtterance(text);

//     speech.lang = "en-US";

//     speech.rate = 0.9;

//     window.speechSynthesis.cancel();

//     window.speechSynthesis.speak(speech);
// }


/* ==========================================
   ANIMATED ISL ALPHABET
========================================== */

let selectedAlphabet = "A";


function selectLetter(letter) {

    selectedAlphabet = letter;


    /* Change main letter */

    const selectedLetter =
        document.getElementById("selectedLetter");

    if (selectedLetter) {

        selectedLetter.innerText = letter;

    }


    /* Change description */

    const selectedText =
        document.getElementById("selectedText");

    if (selectedText) {

        selectedText.innerText =
            "This is the sign for the letter " +
            letter + ".";

    }


    /* Change hand sign image */

    const selectedSign =
        document.getElementById("selectedSign");

    if (selectedSign) {

        selectedSign.src =
            "images/alphabet/" +
            letter +
            ".png";

        selectedSign.alt =
            "Indian Sign Language " +
            letter;

        /*
           Restart animation
        */

        selectedSign.style.animation = "none";

        selectedSign.offsetHeight;

        selectedSign.style.animation =
            "signAnimation 2s infinite ease-in-out";

    }


    /* Remove active class */

    const cards =
        document.querySelectorAll(
            ".alphabet-card"
        );


    cards.forEach(card => {

        card.classList.remove("active");

    });


    /* Make clicked card active */

    cards.forEach(card => {

        const heading =
            card.querySelector("h3");

        if (
            heading &&
            heading.innerText === letter
        ) {

            card.classList.add("active");

        }

    });


    /* Voice */

    speakWord(letter);

}


/* ==========================================
   SPEAK SELECTED LETTER
========================================== */

function speakSelectedLetter() {

    speakWord(selectedAlphabet);

}
// function showSign(letter) {
//     document.getElementById("selectedLetter").src =
//         "signs/" + letter + ".gif";
// }