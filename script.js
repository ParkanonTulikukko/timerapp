const timerDisplay = document.querySelector('.timer-display');
const decreaseButton = document.getElementById('decrease-time');
const increaseButton = document.getElementById('increase-time');
const toggleButton = document.getElementById('toggle-timer');
const testAlarmButton = document.getElementById('test-alarm');

let timeLeft = 0;
let intervalLength = 0;
let longPressTimeout = null;  // Muuttuja pitkän painalluksen ajalle
let extraLongPressTimeout = null;  // Muuttuja erittäin pitkän painalluksen ajalle
let hyperLongPressTimeout = null;
let longPressInterval = null;  // Kiihdytyksen intervalleille
let pressStartedTime = null;  // Tallennetaan aika, jolloin painaminen alkoi
let currentSpeed = 100;  // Alkuperäinen päivitysnopeus (100ms)
let speed = 200;  // Kiihdytetty päivitysnopeus (50ms)
let longPressThreshold = 1000;  // Pitkän painalluksen aikaraja (1 sekunti)

let timerInterval = null;
let timerRunning = false;

// Ajan muotoilu minuutteina ja sekunteina
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Päivitetään ajastimen näyttö
function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
}

// Aikamuutoksen säätäminen
function adjustTime(amount) {
  timeLeft = Math.max(0, timeLeft + amount);
  updateTimerDisplay();
}

// Kiihdytys (päivitysnopeuden kasvattaminen ajan kuluessa)
function startLongPressAdjustment(amount) {
  longPressInterval = setInterval(() => {
    console.log("speed: " + speed);
    adjustTime(amount);  // Lisää tai vähentää aikaa jatkuvasti
  }, speed);  // Päivitysnopeus (voi vaihdella)
}

// Pitkän painalluksen käsittely
function handleLongPressStart(amount) {
  adjustTime(amount);  // Aluksi lisätään tai vähennetään aikaa yhdellä painalluksella

  // Käynnistetään ajastus, joka tarkistaa, onko painallus kestänyt pitkään.
  longPressTimeout = setTimeout(() => {
    // Jos painallus kestää yli 'longPressThreshold' ajan (1 sekunti),
    // käynnistetään jatkuva aika-arvon säätäminen 1 sekunnin välein
    speed = 50;
    startLongPressAdjustment(amount);  // Kiihdytetty päivitysnopeus (50ms)
    console.log("Pitkä painallus: Painoit nappia yli 1 sekunnin!");
  }, longPressThreshold);  // 1 sekunnin kynnys

  extraLongPressTimeout = setTimeout(() => {
    // Jos painallus kestää yli 3 sekunti,
    console.log("Pitkä painallus: Painoit nappia yli kolmen sekunnin!");
    clearInterval(longPressInterval);  // Lopetetaan edellinen longPressInterval
    //ja tehdään uusi ja nopeempi
    speed = 25;
    startLongPressAdjustment(amount);  
  }, 3000);  // 3 sekunnin kynnys

  hyperLongPressTimeout = setTimeout(() => {
    // Jos painallus kestää yli 6 sekunti,
    console.log("Hyper pitkä painallus: Painoit nappia yli kuusi sekunnin!");
    clearInterval(longPressInterval);  // Lopetetaan edellinen longPressInterval
    //ja tehdään uusi ja nopeempi
    speed = 1;
    startLongPressAdjustment(amount);  
  }, 6000);  // 6 sekunnin kynnys

}

// Liitetään tapahtumankuuntelijat painikkeille
decreaseButton.addEventListener('mousedown', () => {
  handleLongPressStart(-1);  // Kutsutaan yhteistä funktiota, joka hoitaa pitkän painalluksen
});

increaseButton.addEventListener('mousedown', () => {
  handleLongPressStart(1);  // Kutsutaan yhteistä funktiota, joka hoitaa pitkän painalluksen
});

// Lopetetaan pitkä painallus heti, kun painike vapautetaan
decreaseButton.addEventListener('mouseup', () => {
  clearTimersAndIntervals()
  console.log("Painaminen lopetettu. Kiihdytys pysäytetty.");
  pressStartedTime = null;  // Nollataan painamisen aloitusaika
});

increaseButton.addEventListener('mouseup', () => {
  clearTimersAndIntervals()
  console.log("Painaminen lopetettu. Kiihdytys pysäytetty.");
  pressStartedTime = null;  // Nollataan painamisen aloitusaika
});

function clearTimersAndIntervals() {
  clearTimeout(longPressTimeout);  // Estetään kiihdytys, jos painike irrotetaan ennen 1 sekunnin täyttymistä
  clearInterval(longPressInterval);  // Lopetetaan nopea vauhti
  clearInterval(extraLongPressTimeout);
  clearInterval(hyperLongPressTimeout);
  }

// Alustetaan näyttö
updateTimerDisplay();

function playAlarmSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const playRing = (startTime, frequency, duration, repeatCount) => {
    for (let i = 0; i < repeatCount; i++) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Set up the oscillator and frequency
      oscillator.type = 'square'; // Square wave for a more "telephone-like" tone
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

      // Connect oscillator to gain and gain to audio context destination
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Start and stop times for each ring segment
      const ringStartTime = startTime + i * (duration * 2); // Alternating on/off cycle
      const ringEndTime = ringStartTime + duration;

      // Set volume to 1 for the tone, then silence after the duration
      gainNode.gain.setValueAtTime(1, ringStartTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ringEndTime);

      // Start and stop the oscillator
      oscillator.start(ringStartTime);
      oscillator.stop(ringEndTime);
    }
  };

  const now = audioContext.currentTime;

  // Parameters for the "ringing" sound
  const ringFrequency = 650; // Frequency in Hz, adjusted for a ringing tone
  const ringDuration = 0.2; // Duration of each tone in seconds
  const repeatCount = 8; // Number of tones in a single "ringing" sequence

  playRing(now, ringFrequency, ringDuration, repeatCount); // First "ring"
}



function formatTime(seconds) {
const minutes = Math.floor(seconds / 60);
const secs = seconds % 60;
return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateDisplay() {
timerDisplay.textContent = `${formatTime(timeLeft)}`;
}

function startTimer() {
intervalLength = timeLeft;
timerRunning = true;
toggleButton.textContent = 'Stop Timer';

timerInterval = setInterval(() => {
  if (timeLeft > 0) {
    timeLeft--;
    updateDisplay();
  } else {
    playAlarmSound(); // Play sound
    timeLeft = intervalLength; // Reset the timer
    updateDisplay();
  }
}, 1000);
}

function stopTimer() {
timerRunning = false;
toggleButton.textContent = 'Start Timer';
clearInterval(timerInterval);
timeLeft = intervalLength; // Reset the timer
updateDisplay();
}

toggleButton.addEventListener('click', () => {
if (timerRunning) {
  stopTimer();
} else {
  startTimer();
}
});

testAlarmButton.addEventListener('click', () => {
playAlarmSound();
});

// Initialize the display
updateDisplay();