// AudioContext 공유
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 탭별 음계 데이터 (주파수로 변환된 값)
const tabNotes = {
    BossaNova: [
        246.94, // B
        287.18, // C#
        293.66, // D
        329.63, // E
        369.99, // F#
        392.00, // G
        440.00, // A
        493.88, // B (옥타브)
        543.25, // C#
        587.33, // D
        659.25,  // E
        466.16 // Bb
    ],
    CityPop: [
        392.00, // G
        466.16, // Bb
        293.66, // D
        349.23, // F
        329.63, // E
        440.00, // A
        261.63, // C
        369.99, // Gb
        392.00, // G (옥타브)
        440.00, // A
        493.88, // B
        523.25  // C
    ],
    Debussy: [
        277.18, // C#
        329.63, // E
        440.00, // A
        311.13, // D#
        369.99, // F#
        415.30, // G#
        440.00, // A
        466.16, // Bb
        493.88, // B
        523.25, // C#
        587.33, // D
        659.25  // E
    ]
};





// QWERTY 키 배열 매핑
const keyMapping = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];

// 현재 활성화된 탭
let currentTab = 'BossaNova';
const tabNotesLabels = {
    BossaNova: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A', 'B♭', '*B', '*C#', '*D', '*E'],
    CityPop: ['G', 'B♭', 'D', 'F', 'E', 'A', 'C', 'G♭', '*G', '*A', '*B', '*C'],
    Debussy: ['C#', 'E', 'A', 'D#', 'F#', 'G#', 'A', 'B♭', '*B', '*C#', '*D', '*E']
};
function updateNoteLabels() {
    const notes = tabNotesLabels[currentTab];
    document.querySelectorAll('.mushroom').forEach((mushroom, index) => {
        const noteLabel = mushroom.querySelector('.note-label');
        if (noteLabel) {
            noteLabel.textContent = notes[index] || ''; // 음 이름 설정
        }
    });
}

// 탭 버튼 클릭 이벤트 (음 이름 업데이트 추가)
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
// 슬라이더 값 초기화
let reverbTime = 0.5;

// 슬라이더 요소 가져오기
const reverbSlider = document.getElementById("reverb-slider");
if (reverbSlider) {
    reverbSlider.addEventListener("input", (event) => {
        reverbTime = parseFloat(event.target.value); // 슬라이더 값 업데이트
    });
} else {
    console.error("슬라이더를 찾을 수 없습니다. HTML에서 확인해주세요.");
}

// 탭 버튼 클릭 이벤트
document.querySelectorAll('.tab-button').forEach((button) => {
    button.addEventListener('click', () => {
        // 활성화된 탭 변경
        currentTab = button.getAttribute('data-tab');

        // 탭 제목 변경
        document.getElementById('tab-title').textContent = `${currentTab} 🎵`;

        // 활성화 상태 업데이트
        document.querySelectorAll('.tab-button').forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// 활성화된 키 추적
const activeKeys = {};

// Web Audio API로 음 생성 (페이드 아웃 포함)
function playToneWithFadeOut(frequency, key) {
    if (activeKeys[key]) {
        activeKeys[key].oscillator.stop();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
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

// 공통으로 동작하는 함수
function handleMushroomAction(key) {
    const mushroom = document.querySelector(`.mushroom[data-sound="${key}"]`);
    if (!mushroom) {
        console.error(`Mushroom not found for key: ${key}`);
        return;
    }

    // 현재 탭의 음계에서 주파수 가져오기
    const frequency = tabNotes[currentTab][key - 1];
    if (frequency) {
        playToneWithFadeOut(frequency, key); // 소리 재생
        animateMushroom(mushroom); // 버섯 애니메이션 실행
    } else {
        console.error(`Frequency not found for key: ${key}`);
    }
}

// QWERTY 키 입력 이벤트
document.addEventListener('keydown', (event) => {
    const keyIndex = keyMapping.indexOf(event.key);
    if (keyIndex !== -1) {
        handleMushroomAction(keyIndex + 1); // 키 인덱스에 맞는 버섯 실행
    }
});

// 버섯 클릭 이벤트 (1~12)
document.querySelectorAll('.mushroom').forEach((mushroom, index) => {
    mushroom.addEventListener('click', () => {
        handleMushroomAction(index + 1);
    });
});

// 클릭 시 애니메이션 효과 추가
function animateMushroom(mushroom) {
    if (mushroom) {
        mushroom.classList.add('clicked');
        setTimeout(() => mushroom.classList.remove('clicked'), 150); // 클래스 제거 (0.15초 후)
    }
}
