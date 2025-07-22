let songs;
let currentFolder;
let currentIndex = 0;

async function getSongs(folder) {
	currentFolder = folder;
	// Fetch the JSON file and parse it into an array of song objects.
	let response = await fetch(`./songs/${folder}/songs.json`);
	songs = await response.json();

	// Clear the current playlist and show all the new songs.
	let songUL = document.querySelector(".songList ul");
	songUL.innerHTML = "";

	// Loop through the array of song objects from your JSON file.
	for (const song of songs) {
		songUL.innerHTML += `<li>
                                <img class="invert music" src="img/music.svg" alt="music">
                                <div class="info">
                                    <div>${song.title}</div>
                                    <div>${song.artist}</div>
                                </div>
                                <div class="playnow">
                                    <img src="img/playbutton.svg" alt="playbutton">
                                </div>
                            </li>`;
	}

	// <span>Play Now</span>

	// Attach an event listener to each new song in the list.
	Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e, index) => {
		e.addEventListener("click", () => {
			// When a song is clicked, play the corresponding song object from the array.
			playMusic(songs[index], false, index);
		});
	});

	// Returning the fully populated songs array.
	return songs;
}

function formatTime(seconds) {
	if (isNaN(seconds)) return "00:00";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}

let currentSong = new Audio()

const playMusic = (songObject, pause = false, index = null) => {
	// Exit the function if no valid song object is provided to prevent errors.
	if (!songObject) {
		return;
	}
	if (index !== null) {
		currentIndex = currentIndex = index
	}

	// Set the current song's source using the global folder and the song's file name.
	currentSong.src = `songs/${currentFolder}/${songObject.file}`;

	// Update the "Now Playing" information on the screen.
	document.querySelector(".songinfo").innerHTML = songObject.title;
	document.querySelector(".songtime").innerHTML = "00:00 / 00:00"; // Reset time display

	// Play the song only if pause is false.
	if (!pause) {
		currentSong.play();
		play.src = "img/pause.svg"; // Update the main play button to show the pause icon.
	} else {
		play.src = "img/playbutton.svg"; // If paused, ensure the main button shows the play icon.
	}
};

async function displayAlbums() {
	// Define the list of all your album folders manually.
	let albumFolders = ["Chill", "Gym", "Hindi", "Metal"];
	let cardContainer = document.querySelector(".cardContainer");
	cardContainer.innerHTML = ""; // Clear existing cards

	// Loop through each album folder name.
	for (const folder of albumFolders) {
		try {
			// Fetch the specific info.json for that album.
			let response = await fetch(`./songs/${folder}/info.json`);
			if (!response.ok) continue; // Skip if info.json is not found
			let info = await response.json();

			// Create the HTML for the album card using the fetched info.
			cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
						<div class="imageContainer">
							<img src="/songs/${folder}/cover.jpg" alt="${info.title} cover">
							<div class="playbutton">
								<img src="/img/playbutton.svg" alt="playbutton">
							</div>
						</div>
						<h2>${info.title}</h2>
						<p>${info.description}</p>
					</div>`;
		} catch (error) {
			console.error(`Could not load album info for: ${folder}`, error);
		}
	}

	// Add event listeners to the new album cards AFTER they have all been created.
	Array.from(document.querySelectorAll(".card")).forEach(card => {
		card.addEventListener("click", async () => {
			const folder = card.dataset.folder;
			await getSongs(folder); // This will load and display the songs for the clicked album
		});
	});
}

async function main() {
	// display all albums
	displayAlbums()

	// get the list of all the songs
	await getSongs("Chill")
	playMusic(songs[0], true)


	// Atach an event listener to play, next and previous
	play.addEventListener("click", () => {
		if (currentSong.paused) {
			currentSong.play()
			play.src = "img/pause.svg"

		}
		else {
			currentSong.pause()
			play.src = "img/playbutton.svg"
		}
	})

	// Listen for time update event
	currentSong.addEventListener("timeupdate", () => {
		// console.log(currentSong.currentTime, currentSong.duration);
		document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
		document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
	})

	// adding an event listener to seekbar to make it skip to the part where its clicked
	document.querySelector(".seekbar").addEventListener("click", e => {
		let percent = e.offsetX / e.target.getBoundingClientRect().width * 100
		document.querySelector(".circle").style.left = (percent) + "%" // getBoundingClientRect() gives you where you are on the page
		currentSong.currentTime = (currentSong.duration * percent) / 100
	})

	// adding an event listener for hamburger (bringing out Your Library)
	document.querySelector(".hamburger").addEventListener("click", () => {
		document.querySelector(".left").style.left = "0"
	})

	// adding an event listener for cross (closing Your Library)
	document.querySelector(".close").addEventListener("click", () => {
		document.querySelector(".left").style.left = "-100%"
	})

	// adding event listener for previous and next
	previous.addEventListener("click", () => {
		if (currentIndex > 0) {
        currentIndex--;
        playMusic(songs[currentIndex], false, currentIndex);
    }
	})
	next.addEventListener("click", () => {
		if (currentIndex < songs.length - 1) {
        currentIndex++;
        playMusic(songs[currentIndex], false, currentIndex);
    }
	})

	// adding an event listener to volume
	document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
		// console.log(e.target.value);
		let volumeValue = parseInt(e.target.value) / 100
		currentSong.volume = volumeValue
		if (volumeValue > 0.6) {
			volume.src = "img/volume.svg"
		}
		else {
			volume.src = "img/lowvolume.svg"
		}
		if (volumeValue == 0) {
			volume.src = "img/mute.svg"
		}
	})

	// muting when clicked on volume image
	volume.addEventListener("click", () => {
		if (currentSong.volume > 0) {
			volume.src = "img/mute.svg"
			currentSong.volume = 0
			document.querySelector(".range").getElementsByTagName("input")[0].value = 0
		}
		else if (currentSong.volume == 0) {
			volume.src = "img/lowvolume.svg"
			currentSong.volume = 0.2
			document.querySelector(".range").getElementsByTagName("input")[0].value = 20
		}
	})

	// event listener to login and signup button
	document.getElementById("signupbtn").addEventListener("click", () => {
		window.open("https://www.spotify.com/in-en/signup?forward_url=https%3A%2F%2Fopen.spotify.com%2F")
	})
	document.getElementById("loginbtn").addEventListener("click", () => {
		window.open("https://accounts.spotify.com/en/login?continue=https%3A%2F%2Fopen.spotify.com%2F")
	})
}

main()