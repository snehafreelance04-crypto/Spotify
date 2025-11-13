

let audio = new Audio();
let songs = [];
let currentSong = "";
let currentIndex = 0;
const play = document.getElementById("play");

// ✅ Convert seconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ✅ Time Update (while playing)
audio.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
        `${secondsToMinutesSeconds(audio.currentTime)} / ${secondsToMinutesSeconds(audio.duration)}`;

    const circle = document.querySelector(".circle");
    if (audio.duration > 0) {
        circle.style.left = (audio.currentTime / audio.duration) * 100 + "%";
    }
});

// ✅ SEEKING (CLICK + DRAG)
const seekbar = document.querySelector(".seekbar");
const circle = document.querySelector(".circle");
let isDragging = false;

// ✅ CLICK to seek
seekbar.addEventListener("click", (e) => {
    let percent = e.offsetX / seekbar.clientWidth;
    circle.style.left = (percent * 100) + "%";
    audio.currentTime = percent * audio.duration;
});

// ✅ DRAG start
circle.addEventListener("mousedown", () => {
    isDragging = true;
});

// ✅ DRAG move
document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    let rect = seekbar.getBoundingClientRect();
    let offset = e.clientX - rect.left;
    let percent = Math.max(0, Math.min(offset / rect.width, 1));

    circle.style.left = (percent * 100) + "%";
});

// ✅ DRAG end → update audio time
document.addEventListener("mouseup", (e) => {
    if (!isDragging) return;
    isDragging = false;

    let rect = seekbar.getBoundingClientRect();
    let offset = e.clientX - rect.left;
    let percent = Math.max(0, Math.min(offset / rect.width, 1));

    audio.currentTime = percent * audio.duration;
});

// ✅ Load + Show Song (without playing)
function loadSong(track, index) {
    currentSong = track;
    currentIndex = index;
    audio.src = track; // ✅ Full path use karenge

    // Extract clean song name from path
    let songName = track.split('/').pop().replace(".mp3", "").replaceAll("%20", " ");
    document.querySelector(".songinfo").innerHTML = songName;

    audio.addEventListener("loadedmetadata", () => {
        document.querySelector(".songtime").innerHTML =
            `00:00 / ${secondsToMinutesSeconds(audio.duration)}`;
    }, { once: true }); // ✅ Prevent multiple listeners
}

// ✅ Play Song
function playMusic(track, index) {
    loadSong(track, index);
    audio.play();
    play.src = "pause.svg";
}

// ✅ GET SONGS FROM SERVER - DYNAMICALLY
async function getSongs(folder = "songs") {
    try {
        // ✅ Fetch songs from server directory
        let response = await fetch(`/songs/arijitsingh`);
        let text = await response.text();

        let div = document.createElement("div");
        div.innerHTML = text;

        let anchors = div.getElementsByTagName("a");
        songs = [];

        // ✅ Extract all .mp3 files
        for (let anchor of anchors) {
            if (anchor.href.endsWith(".mp3")) {
                songs.push(anchor.href);
            }
        }



        // ✅ If no songs found, show message
        if (songs.length === 0) {
            document.querySelector(".songList ul").innerHTML =
                '<li style="padding: 20px; text-align: center;">No songs found in folder</li>';
            return;
        }

        // ✅ Display songs in list
        let songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";

        songs.forEach((song, index) => {
            // Extract clean name from URL
            let songName = song.split('/').pop().replace(".mp3", "").replaceAll("%20", " ");

            songUL.innerHTML += `
              <li data-index="${index}">
                <div class="songItemLeft" style="display:flex; align-items:center; gap:15px;">
                  <img src="https://img.icons8.com/?size=100&id=exZQ2JREpjz0&format=png&color=FFFFFF" width="28">
                  <div class="info">
                    <div class="songTitle">${songName}</div>
                   
                  </div>
                </div>

                <div class="playnow">
                  <span>Play Now</span>
                  <img class="invert" src="play.svg" width="22">
                </div>
              </li>
            `;
        });

        // ✅ Make clickable list
        Array.from(document.querySelectorAll(".songList li")).forEach(li => {
            li.addEventListener("click", () => {
                let index = parseInt(li.getAttribute("data-index"));
                if (index >= 0 && songs[index]) {
                    playMusic(songs[index], index);
                }
            });
        });

        // ✅ Load first song (don't autoplay)
        if (songs.length > 0) {
            loadSong(songs[0], 0);
        }

    } catch (error) {
        console.error("Error loading songs:", error);
        document.querySelector(".songList ul").innerHTML =
            '<li style="padding: 20px; text-align: center; color: red;">Error loading songs. Make sure songs folder exists!</li>';
    }
}

// ✅ Play / Pause button
play.addEventListener("click", () => {
    if (audio.paused) {
        if (songs.length > 0 && !audio.src) {
            playMusic(songs[0], 0);
        } else {
            audio.play();
            play.src = "pause.svg";
        }
    } else {
        audio.pause();
        play.src = "play.svg";
    }
});

// Add an event listener for hamburger
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
})

// Add an event listener for close button
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%"
})

// Buttons
const previous = document.getElementById("previous");
const next = document.getElementById("next");

// ✅ Previous - FIXED
previous.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        playMusic(songs[currentIndex], currentIndex);
    }
});

// ✅ Next - FIXED
next.addEventListener("click", () => {
    if (currentIndex < songs.length - 1) {
        currentIndex++;
        playMusic(songs[currentIndex], currentIndex);
    }
});

// ✅ Auto play next song when current ends
audio.addEventListener("ended", () => {
    if (currentIndex < songs.length - 1) {
        currentIndex++;
        playMusic(songs[currentIndex], currentIndex);
    }
});

// ✅ NAYA
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
    console.log("Setting volume to", e.target.value, "/100")
    audio.volume = parseInt(e.target.value) / 100
})

// ✅ CARD CLICK - Play specific song by name
document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", async () => {
        const songNameFromCard = card.querySelector(".musicContent h2").textContent.trim();

        // Load all songs if not loaded yet
        if (songs.length === 0) {
            await getSongs("songs");
        }

        // Find the song that matches card name
        let foundIndex = -1;
        for (let i = 0; i < songs.length; i++) {
            let songName = songs[i].split('/').pop().replace(".mp3", "").replaceAll("%20", " ");

            // Check if song name contains the card name (case insensitive)
            if (songName.toLowerCase().includes(songNameFromCard.toLowerCase())) {
                foundIndex = i;
                break;
            }
        }

        // If song found, play it
        if (foundIndex !== -1) {
            currentIndex = foundIndex;
            playMusic(songs[foundIndex], foundIndex);
        } else {
            alert(`Song "${songNameFromCard}" not found in songs folder!`);
            console.log("Available songs:", songs.map(s => s.split('/').pop()));
        }
    });
});


getSongs("songs");

// Add event listener to mute the track
document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else {
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }

})
