// AudioContext 공유
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const plus = 20;
// 탭별 음계 데이터 (주파수로 변환된 값)
const tabNotes = {
    BossaNova: [
        440.00+plus,   // A
        493.88+plus,   // B
        554.37+plus,   // C#
        587.33+plus,   // D
        659.25+plus,   // E
        739.99+plus,   // F#
        830.61+plus,   // G#
        880.00+plus,   // *A
        987.77+plus,   // *B
        1108.73+plus,  // *C#
        1174.66+plus,  // *D
        1318.51+plus   // *E
    ]
    ,
    CityPop: [
        440.00,   // A
        493.88,   // B
        554.37,   // C#
        587.33,   // D
        659.25,   // E
        739.99,   // F#
        830.61,   // G#
        880.00,   // *A
        987.77,   // *B
        1108.73,  // *C#
        1174.66,  // *D
        1318.51   // *E
    ]
    ,
    Debussy: [
        440.00,   // A
        493.88,   // B
        554.37,   // C#
        587.33,   // D
        659.25,   // E
        739.99,   // F#
        830.61,   // G#
        880.00,   // *A
        987.77,   // *B
        1108.73,  // *C#
        1174.66,  // *D
        1318.51   // *E
    ]
    
};

// 탭별 음 이름 데이터
const tabNotesLabels = {
    BossaNova: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#', '*A', '*B', '*C#', '*D', '*E'],
    CityPop: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#', '*A', '*B', '*C#', '*D', '*E'],
    Debussy: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#', '*A', '*B', '*C#', '*D', '*E']
};

// 탭별 음색 설정
const tabWaveforms = {
    BossaNova: 'sine',       // 부드러운 피아노 소리
    CityPop: 'square',       // 기계음 느낌
    Debussy: 'triangle'      // 부드럽고 따뜻한 소리
};

// 현재 활성화된 탭
let currentTab = 'BossaNova';

// 키보드 키 매핑 (QWERTY)
const keyMapping = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];

// 슬라이더 값 초기화
let reverbTime = 0.5;

// 음 이름 업데이트 함수
function updateNoteLabels() {
    const notes = tabNotesLabels[currentTab];
    document.querySelectorAll('.mushroom').forEach((mushroom, index) => {
        const noteLabel = mushroom.querySelector('.note-label');
        if (noteLabel) {
            noteLabel.textContent = notes[index] || ''; // 음 이름 설정
        }
    });
}

// 탭 버튼 클릭 이벤트
document.querySelectorAll('.tab-button').forEach((button) => {
    button.addEventListener('click', () => {
        currentTab = button.getAttribute('data-tab'); // 활성화된 탭 변경
        document.getElementById('tab-title').textContent = `${currentTab} 🎵`; // 제목 변경
        updateNoteLabels(); // 음 이름 업데이트
        document.querySelectorAll('.tab-button').forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// 초기 음 이름 업데이트
updateNoteLabels();

// 슬라이더 이벤트
const reverbSlider = document.getElementById("reverb-slider");
if (reverbSlider) {
    reverbSlider.addEventListener("input", (event) => {
        reverbTime = parseFloat(event.target.value); // 슬라이더 값 업데이트
    });
} else {
    console.error("슬라이더를 찾을 수 없습니다. HTML에서 확인해주세요.");
}

// 활성화된 키 추적
const activeKeys = {};

// Web Audio API로 음 생성 (페이드 아웃 포함)
function playToneWithFadeOut(frequency, key) {
    if (activeKeys[key]) {
        activeKeys[key].oscillator.stop();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = tabWaveforms[currentTab]; // 현재 탭의 음색 설정
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const duration = reverbTime;
    const fadeOutTime = duration / 4;
    const startFadeOutTime = audioCtx.currentTime + (duration - fadeOutTime);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, startFadeOutTime + fadeOutTime);

    activeKeys[key] = { oscillator, gainNode };

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);

    oscillator.onended = () => {
        delete activeKeys[key];
    };
}

// 키 입력 처리
document.addEventListener('keydown', (event) => {
    const keyIndex = keyMapping.indexOf(event.key);
    if (keyIndex !== -1) {
        handleMushroomAction(keyIndex + 1); // 키 인덱스에 맞는 버섯 실행
    }
});

// 버섯 클릭 이벤트
document.querySelectorAll('.mushroom').forEach((mushroom, index) => {
    mushroom.addEventListener('click', () => {
        handleMushroomAction(index + 1);
    });
});

// 공통 동작 함수
function handleMushroomAction(key) {
    const mushroom = document.querySelector(`.mushroom[data-sound="${key}"]`);
    if (!mushroom) {
        console.error(`Mushroom not found for key: ${key}`);
        return;
    }

    const frequency = tabNotes[currentTab][key - 1];
    if (frequency) {
        playToneWithFadeOut(frequency, key); // 소리 재생
        animateMushroom(mushroom); // 버섯 애니메이션 실행
    } else {
        console.error(`Frequency not found for key: ${key}`);
    }
}

// 클릭 시 애니메이션 효과 추가
function animateMushroom(mushroom) {
    if (mushroom) {
        mushroom.classList.add('clicked');
        setTimeout(() => mushroom.classList.remove('clicked'), 150); // 클래스 제거 (0.15초 후)
    }
}
