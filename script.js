// Global Variables
let currentSongIndex = 0;
let isPlaying = false;
let audioPlayer = null;
let currentSection = "home";
let autoRotateInterval = null;
let isAutoRotating = false;
let hasUserInteracted = false;
let pendingSongIndex = null;

// Environment detection
const isLocal =
	window.location.hostname === "localhost" ||
	window.location.hostname === "127.0.0.1" ||
	window.location.hostname === "";

// Console logging function - only logs in local development
function log(...args) {
	if (isLocal) {
		console.log(...args);
	}
}

// Dynamic Songs Playlist - Auto-discovered from static/songs folder
let playlist = [];
let isLoadingSongs = false;

// Special feature: Start with Saiyaara for one day
let SPECIAL_DAY_MODE = true; // Set to false to return to normal behavior

// Function to handle special day mode - starts with Saiyaara
function handleSpecialDayMode(playlist) {
	if (!SPECIAL_DAY_MODE) {
		log('🎵 Special Day Mode: DISABLED');
		return playlist;
	}
	
	log('🎵 Special Day Mode: ENABLED - Processing playlist...');
	log('🎵 Playlist before special mode:', playlist.map(s => s.title).slice(0, 5));
	
	// Find Saiyaara in the playlist
	const saiyaaraIndex = playlist.findIndex(song => 
		song.title.toLowerCase().includes('saiyaara')
	);
	
	log('🎵 Saiyaara found at index:', saiyaaraIndex);
	
	if (saiyaaraIndex !== -1) {
		// Move Saiyaara to the beginning
		const saiyaaraSong = playlist.splice(saiyaaraIndex, 1)[0];
		playlist.unshift(saiyaaraSong);
		log('🎵 Special Day Mode: Starting with Saiyaara!');
		log('🎵 Playlist after special mode:', playlist.map(s => s.title).slice(0, 5));
	} else {
		log('🎵 WARNING: Saiyaara not found in playlist - disabling special day mode');
		log('🎵 Available songs:', playlist.map(s => s.title).slice(0, 5));
		SPECIAL_DAY_MODE = false; // Disable special mode if Saiyaara is not available
	}
	
	return playlist;
}

// Function to generate playlist from available MP3 files
async function generatePlaylist() {
	if (isLoadingSongs) return playlist;
	
	isLoadingSongs = true;
	
	try {
		// Try to fetch songs list from PHP script first
		const response = await fetch('get-songs.php');
		if (response.ok) {
			const songFiles = await response.json();
			log('Successfully loaded songs from PHP:', songFiles);
			playlist = createPlaylistFromFiles(songFiles);
		} else {
			throw new Error('PHP script not available');
		}
	} catch (error) {
		log('PHP script not available, using fallback method:', error);
		// Fallback: try to discover songs by attempting to load them
		playlist = await discoverSongsFallback();
	}
	
	isLoadingSongs = false;
	
		// Apply special day mode if enabled
		playlist = handleSpecialDayMode(playlist);
		
		log(
			`Generated playlist with ${playlist.length} songs:`,
			playlist.map((s) => s.title)
		);
		return playlist;
}

// Function to toggle special day mode (for easy switching)
function toggleSpecialDayMode() {
	SPECIAL_DAY_MODE = !SPECIAL_DAY_MODE;
	log(`🎵 Special Day Mode: ${SPECIAL_DAY_MODE ? 'ENABLED' : 'DISABLED'}`);
	
	// Regenerate playlist with new mode
	if (playlist.length > 0) {
		generatePlaylist().then(() => {
			// Restart with first song
			currentSongIndex = 0;
			playSong(currentSongIndex);
		});
	}
}

// Fallback method to discover songs
async function discoverSongsFallback() {
	const knownSongs = [
		"aafreen_aafreen_unplug.mp3",
		"akhiyan_gulab2.mp3",
		"apna_bana_le.mp3",
		"atif_aslam_new.mp3",
		"dil_diyan_gallan.mp3",
		"dil_tu_jaan.mp3",
		"ek_din_teri_raho_me.mp3",
		"falak_tak.mp3",
		"gerua_reverb.mp3",
		"girl_i_need_you.mp3",
		"ha_ham_badalna_laga.mp3",
		"hua_mai_x_finding_her.mp3",
		"Iktara Wake Up Sid 128 Kbps.mp3",
		"ishq_bulaava_bollywood.mp3",
		"jab_jab_tere_pass.mp3",
		"jana_samjho_na.mp3",
		"khairiyat_puchho.mp3",
		"kon_tujhe_peyar_kare.mp3",
		"lut_gaya.mp3",
		"main_shaas_bhi_lu.mp3",
		"malang_sajna.mp3",
		"man_mera.mp3",
		"mehram_animal_2023.mp3",
		"old-town-girl.mp3",
		"paniyon_sa.mp3",
		"ride_it_hindi.mp3",
		"sahiba_aditya_r.mp3",
		"tera_ban_jaunga.mp3",
		"tere_hawaale_arijit.mp3",
		"teri_ban_jaungi.mp3",
		"todhi_jagah_marjava.mp3",
		"tu_hain_toh_main_hoon.mp3",
		"tu_hi_yaar_mera.mp3",
		"tuhi_haqeeqat.mp3",
		"tujhe_kitna_chahne.mp3",
		"tum_hi_aana.mp3",
		"tum_jo_aaye.mp3",
	];
	
	return createPlaylistFromFiles(knownSongs);
}

// Helper function to create playlist from file list
function createPlaylistFromFiles(songFiles) {
	return songFiles.map((filename) => {
		// Extract song title from filename
		let title = filename.replace(".mp3", "").replace("_", " ").replace(" (1)", "");

		// Clean up title formatting
		title = title
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(" ");

		// Handle special cases
		if (title.includes("Iktara")) title = "Iktara - Wake Up Sid";
		if (title.includes("Mehram")) title = "Mehram - Animal 2023";
		if (title.includes("Sahiba")) title = "Sahiba - Aditya R";
		if (title.includes("Hua Mai")) title = "Hua Mai - Finding Her";
		if (title.includes("Old Town Girl")) title = "Old Town Girl";
		if (title.includes("Girl I Need You")) title = "Girl I Need You";
		if (title.includes("Ride It Hindi")) title = "Ride It - Hindi Version";
		if (title.includes("Tuhi Haqeeqat")) title = "Tuhi Haqeeqat";
		if (title.includes("Teri Ban Jaungi")) title = "Teri Ban Jaungi";
		if (title.includes("Ek Din Teri Raho Me")) title = "Ek Din Teri Raho Me";

		return {
			title: title,
			artist: "Bollywood",
			duration: "4:00", // Default duration
			url: `static/songs/${filename}`,
		};
	});
}

// Initialize the application
document.addEventListener("DOMContentLoaded", async function () {
	await initializeApp();
	setupEventListeners();
	createFloatingElements();
	startAutoRotate();
	// Don't start music automatically - wait for user interaction
	showMusicPrompt();
});

// Initialize the application
async function initializeApp() {
	audioPlayer = document.getElementById("audioPlayer");
	if (audioPlayer) {
		audioPlayer.volume = 1; // Set initial volume
	}
	await generatePlaylist(); // Generate playlist from available songs
	preloadAudio(); // Preload audio files
	showSection("home");
}

// Preload audio files
function preloadAudio() {
	playlist.forEach((song) => {
		const audio = new Audio();
		audio.preload = "auto";
		audio.src = song.url;
	});
}

// Setup event listeners
function setupEventListeners() {
	// Navigation
	const navLinks = document.querySelectorAll(".nav-link");
	navLinks.forEach((link) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();
			const sectionId = link.getAttribute("href").substring(1);
			showSection(sectionId);
			updateActiveNavLink(link);
			// Stop auto-rotation when manually navigating
			stopAutoRotate();
			// Start music on first user interaction
			handleFirstUserInteraction();
		});
	});

	// Hamburger menu
	const hamburger = document.querySelector(".hamburger");
	const navMenu = document.querySelector(".nav-menu");

	hamburger.addEventListener("click", () => {
		hamburger.classList.toggle("active");
		navMenu.classList.toggle("active");
		// Start music on first user interaction
		handleFirstUserInteraction();
	});

	// Memory cards - removed click functionality for details

	// Add click listener to document for first interaction
	document.addEventListener("click", handleFirstUserInteraction, { once: true });
	document.addEventListener("keydown", handleFirstUserInteraction, { once: true });
	document.addEventListener("touchstart", handleFirstUserInteraction, { once: true });

	// Audio player events
	if (audioPlayer) {
		audioPlayer.addEventListener("ended", nextSong);
		audioPlayer.addEventListener("timeupdate", updateProgress);
	}

	// Keyboard shortcuts
	document.addEventListener("keydown", handleKeyboardShortcuts);
}

// Show specific section with smooth animations
function showSection(sectionId) {
	// Don't transition if already on the same section
	if (currentSection === sectionId) return;

	// Scroll to top first
	window.scrollTo({ top: 0, behavior: "smooth" });

	// Add leaving animation to current section
	const currentActiveSection = document.querySelector(".section.active");
	if (currentActiveSection) {
		currentActiveSection.classList.add("leaving");
	}

	// Wait for leaving animation to complete
	setTimeout(() => {
		// Hide all sections
		const sections = document.querySelectorAll(".section");
		sections.forEach((section) => {
			section.classList.remove("active", "leaving");
		});

		// Show target section
		const targetSection = document.getElementById(sectionId);
		if (targetSection) {
			targetSection.classList.add("active");
			currentSection = sectionId;

			// Add entrance animation
			targetSection.style.animation = "none";
			targetSection.offsetHeight; // Trigger reflow
			targetSection.style.animation = null;

			// Special effects for different sections
			if (sectionId === "home") {
				createConfetti();
			} else if (sectionId === "memories") {
				animateMemoryCards();
			} else if (sectionId === "trip") {
				animateTimelineItems();
			} else if (sectionId === "wishes") {
				animateWishCards();
			} else if (sectionId === "madeby") {
				animateMadeBySection();
			}
		}
	}, 150); // Ultra short transition time
}

// Update active navigation link
function updateActiveNavLink(activeLink) {
	const navLinks = document.querySelectorAll(".nav-link");
	navLinks.forEach((link) => {
		link.classList.remove("active");
	});
	activeLink.classList.add("active");
}

// Music Player Functions
function togglePlayPause() {
	if (isPlaying) {
		pauseSong();
	} else {
		playSong(currentSongIndex);
	}
}

function playSong(index) {
	if (index >= 0 && index < playlist.length) {
		currentSongIndex = index;
		const song = playlist[index];

		// Set audio source and play
		if (audioPlayer) {
			audioPlayer.src = song.url;

			if (hasUserInteracted) {
				// User has interacted, we can play audio
				audioPlayer
					.play()
					.then(() => {
						isPlaying = true;
						updatePlayButton();
						showMusicNotification();
						log("Successfully playing:", song.title);

						// Set up 13-second timer to advance to next song
						setTimeout(() => {
							if (isPlaying) {
								nextSong();
							}
						}, 13000); // 13 seconds
					})
					.catch((error) => {
						log("Audio play failed:", error);
						// Try to play again after a short delay
						setTimeout(() => {
							audioPlayer
								.play()
								.then(() => {
									isPlaying = true;
									updatePlayButton();
									showMusicNotification();

									// Set up 20-second timer to advance to next song
									setTimeout(() => {
										if (isPlaying) {
											nextSong();
										}
									}, 20000); // 20 seconds
								})
								.catch((err) => {
									log("Retry failed:", err);
									showMusicNotification();
								});
						}, 500);
					});
			} else {
				// Store the song to play after user interaction
				pendingSongIndex = index;
				log("Music queued for after user interaction:", song.title);
			}
		}
	}
}

function pauseSong() {
	if (audioPlayer) {
		audioPlayer.pause();
		isPlaying = false;
		updatePlayButton();
	}
}

function nextSong() {
	if (playlist.length === 0) return;

	// Fade out current song smoothly
	if (audioPlayer && isPlaying) {
		const fadeOutInterval = setInterval(() => {
			if (audioPlayer.volume > 0.1) {
				audioPlayer.volume -= 0.1;
			} else {
				audioPlayer.volume = 0;
				clearInterval(fadeOutInterval);

				// Reset volume for next song
				audioPlayer.volume = 1;

				// Play next random song with equal probability
				const randomIndex = Math.floor(Math.random() * playlist.length);
				playSong(randomIndex);

				log(`Next random song: ${playlist[randomIndex].title}`);
			}
		}, 50);
	} else {
		// If no audio player or not playing, just advance
		const randomIndex = Math.floor(Math.random() * playlist.length);
		playSong(randomIndex);

		log(`Next random song: ${playlist[randomIndex].title}`);
	}
}

function previousSong() {
	if (playlist.length === 0) return;

	// Play previous random song with equal probability
	const randomIndex = Math.floor(Math.random() * playlist.length);
	playSong(randomIndex);

	log(`Previous random song: ${playlist[randomIndex].title}`);
}

function shufflePlaylist() {
	if (playlist.length === 0) return;

	// Select a completely random song with equal probability
	const randomIndex = Math.floor(Math.random() * playlist.length);
	playSong(randomIndex);

	log(`Shuffled to random song: ${playlist[randomIndex].title}`);

	// Visual feedback
	const shuffleBtn = document.querySelector(".shuffle-btn");
	if (shuffleBtn) {
		shuffleBtn.style.transform = "scale(1.2)";
		setTimeout(() => {
			shuffleBtn.style.transform = "scale(1)";
		}, 200);
	}
}

function updatePlayButton() {
	const playBtn = document.querySelector(".play-btn i");
	if (playBtn) {
		playBtn.className = isPlaying ? "fas fa-pause" : "fas fa-play";
	}
}

// Special Effects
function createConfetti() {
	const confettiContainer = document.querySelector(".confetti-container");
	if (!confettiContainer) return;

	// Clear existing confetti
	confettiContainer.innerHTML = "";

	// Create confetti pieces
	for (let i = 0; i < 50; i++) {
		const confetti = document.createElement("div");
		confetti.className = "confetti";
		confetti.style.left = Math.random() * 100 + "%";
		confetti.style.animationDelay = Math.random() * 3 + "s";
		confetti.style.animationDuration = Math.random() * 3 + 2 + "s";

		// Random colors
		const colors = ["#ff6b6b", "#4ecdc4", "#ffe66d", "#ff8e8e", "#95e1d3"];
		confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

		confettiContainer.appendChild(confetti);

		// Remove confetti after animation
		setTimeout(() => {
			if (confetti.parentNode) {
				confetti.parentNode.removeChild(confetti);
			}
		}, 5000);
	}
}

function createFloatingElements() {
	const bgElements = document.querySelector(".bg-elements");
	if (!bgElements) return;

	// Create floating hearts
	for (let i = 0; i < 5; i++) {
		const heart = document.createElement("div");
		heart.innerHTML = "💖";
		heart.style.position = "absolute";
		heart.style.fontSize = "20px";
		heart.style.left = Math.random() * 100 + "%";
		heart.style.top = Math.random() * 100 + "%";
		heart.style.animation = `float ${Math.random() * 3 + 4}s ease-in-out infinite`;
		heart.style.animationDelay = Math.random() * 2 + "s";
		heart.style.opacity = "0.7";
		heart.style.pointerEvents = "none";

		bgElements.appendChild(heart);
	}

	// Create sparkles
	for (let i = 0; i < 8; i++) {
		const sparkle = document.createElement("div");
		sparkle.innerHTML = "✨";
		sparkle.style.position = "absolute";
		sparkle.style.fontSize = "16px";
		sparkle.style.left = Math.random() * 100 + "%";
		sparkle.style.top = Math.random() * 100 + "%";
		sparkle.style.animation = `sparkle ${Math.random() * 2 + 3}s ease-in-out infinite`;
		sparkle.style.animationDelay = Math.random() * 2 + "s";
		sparkle.style.opacity = "0.8";
		sparkle.style.pointerEvents = "none";

		bgElements.appendChild(sparkle);
	}
}

function startCelebration() {
	// Create massive confetti
	createConfetti();

	// Play celebration sound (if available)
	if (audioPlayer) {
		audioPlayer.src = "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";
		audioPlayer.play().catch(() => {
			console.log("Celebration sound not available");
		});
	}

	// Show celebration message
	showCelebrationMessage();

	// Create more confetti
	setTimeout(() => {
		createConfetti();
	}, 1000);
}

function showCelebrationMessage() {
	const message = document.createElement("div");
	message.innerHTML = "🎉 Let's Party! 🎉";
	message.style.position = "fixed";
	message.style.top = "50%";
	message.style.left = "50%";
	message.style.transform = "translate(-50%, -50%)";
	message.style.fontSize = "3rem";
	message.style.color = "#ff6b6b";
	message.style.fontWeight = "bold";
	message.style.zIndex = "9999";
	message.style.animation = "bounce 1s ease-in-out";
	message.style.textShadow = "2px 2px 4px rgba(0,0,0,0.3)";

	document.body.appendChild(message);

	setTimeout(() => {
		if (message.parentNode) {
			message.parentNode.removeChild(message);
		}
	}, 3000);
}

// Back button function
function goBack() {
	if (currentSection !== "home") {
		showSection("home");
		updateActiveNavLink(document.querySelector('.nav-link[href="#home"]'));
	}
}

// Auto-rotation functions
function startAutoRotate() {
	isAutoRotating = true;
	const autoBtn = document.querySelector(".auto-rotate-btn");
	if (autoBtn) {
		autoBtn.classList.add("active");
	}

	autoRotateInterval = setInterval(() => {
		if (currentSection === "home") {
			showSection("memories");
			updateActiveNavLink(document.querySelector('.nav-link[href="#memories"]'));
		} else if (currentSection === "memories") {
			showSection("trip");
			updateActiveNavLink(document.querySelector('.nav-link[href="#trip"]'));
		} else if (currentSection === "trip") {
			showSection("wishes");
			updateActiveNavLink(document.querySelector('.nav-link[href="#wishes"]'));
		} else if (currentSection === "wishes") {
			showSection("madeby");
			updateActiveNavLink(document.querySelector('.nav-link[href="#madeby"]'));
		} else if (currentSection === "madeby") {
			showSection("home");
			updateActiveNavLink(document.querySelector('.nav-link[href="#home"]'));
		}
	}, 6000); // 6 seconds
}

function stopAutoRotate() {
	isAutoRotating = false;
	const autoBtn = document.querySelector(".auto-rotate-btn");
	if (autoBtn) {
		autoBtn.classList.remove("active");
	}

	if (autoRotateInterval) {
		clearInterval(autoRotateInterval);
		autoRotateInterval = null;
	}
}

function toggleAutoRotate() {
	if (isAutoRotating) {
		stopAutoRotate();
	} else {
		startAutoRotate();
	}
}

// Animation Functions
function animateMemoryCards() {
	const memoryCards = document.querySelectorAll(".memory-card");
	memoryCards.forEach((card, index) => {
		card.style.animation = `slideInUp 0.6s ease ${index * 0.1}s both`;
	});
}

function animateWishCards() {
	const wishCards = document.querySelectorAll(".wish-card");
	wishCards.forEach((card, index) => {
		card.style.animation = `slideInUp 0.6s ease ${index * 0.2}s both`;
	});
}

function animateTimelineItems() {
	const timelineItems = document.querySelectorAll(".timeline-item");
	timelineItems.forEach((item, index) => {
		item.style.animation = `slideInUp 0.6s ease ${index * 0.1}s both`;
	});
}

function animateMadeBySection() {
	const madeByCard = document.querySelector(".made-by-card");
	const loveItems = document.querySelectorAll(".love-item");
	const floatingHearts = document.querySelectorAll(".floating-hearts-small i");

	if (madeByCard) {
		madeByCard.style.animation = "slideInUp 0.8s ease";
	}

	loveItems.forEach((item, index) => {
		item.style.animation = `slideInLeft 0.6s ease ${index * 0.2}s both`;
	});

	floatingHearts.forEach((heart, index) => {
		heart.style.animation = `float 3s ease-in-out infinite ${index * 0.6}s`;
	});
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
	switch (e.key) {
		case " ":
			e.preventDefault();
			if (currentSection === "music") {
				togglePlayPause();
			}
			break;
		case "ArrowRight":
			if (currentSection === "music") {
				nextSong();
			}
			break;
		case "ArrowLeft":
			if (currentSection === "music") {
				previousSong();
			}
			break;
		case "s":
			if (currentSection === "music") {
				shufflePlaylist();
			}
			break;
		case "m":
			toggleSpecialDayMode();
			break;
	}
}

// Handle first user interaction to start music
function handleFirstUserInteraction() {
	if (!hasUserInteracted) {
		hasUserInteracted = true;
		log("User interaction detected - starting music");

		// Remove the birthday prompt with animation
		const prompt = document.querySelector(".birthday-prompt");
		if (prompt) {
			prompt.style.animation = "fadeOut 0.8s ease";
			setTimeout(() => {
				if (prompt.parentNode) {
					prompt.remove();
				}
			}, 800);
		}

		// Add entrance animation to homepage
		const homeSection = document.getElementById("home");
		if (homeSection) {
			homeSection.style.animation = "slideInUp 1s ease";
		}

		// Start random music after a short delay
		setTimeout(() => {
			startRandomMusic();
		}, 1000);
	}
}

// Auto-play random music with equal probability
function startRandomMusic() {
	if (playlist.length === 0) {
		log("No songs available in playlist");
		return;
	}

	// In special day mode, start with the first song (Saiyaara)
	// Otherwise, select a random song
	let songIndex;
	if (SPECIAL_DAY_MODE) {
		songIndex = 0; // Start with first song (Saiyaara)
		log("🎵 Special Day Mode: Starting with first song (Saiyaara)");
	} else {
		songIndex = Math.floor(Math.random() * playlist.length);
		log("🎵 Normal Mode: Playing random song");
	}
	
	currentSongIndex = songIndex;

	log(
		`Playing song ${currentSongIndex + 1}/${playlist.length}: ${
			playlist[currentSongIndex].title
		}`
	);

	// Start playing
	playSong(currentSongIndex);

	// Show a subtle notification
	showMusicNotification();

	// Set up auto-advance to next song
	if (audioPlayer) {
		audioPlayer.addEventListener("ended", () => {
			nextSong();
		});
	}
}

// Show birthday card prompt for user interaction
function showMusicPrompt() {
	const prompt = document.createElement("div");
	prompt.className = "birthday-prompt";
	prompt.innerHTML = `
        <div class="prompt-content">
            <div class="prompt-icon">🎁</div>
            <h3>Click here to open your birthday card!</h3>
            <p>A special surprise is waiting for you</p>
            <div class="sparkle-effect">✨</div>
        </div>
    `;

	prompt.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.8s ease;
        cursor: pointer;
    `;

	const promptContent = prompt.querySelector(".prompt-content");
	promptContent.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        color: white;
        padding: 4rem;
        border-radius: 30px;
        text-align: center;
        max-width: 500px;
        animation: slideInUp 0.8s ease;
        border: 2px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        position: relative;
        overflow: hidden;
    `;

	const promptIcon = prompt.querySelector(".prompt-icon");
	promptIcon.style.cssText = `
        font-size: 5rem;
        margin-bottom: 1.5rem;
        animation: bounce 2s infinite;
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    `;

	const sparkleEffect = prompt.querySelector(".sparkle-effect");
	sparkleEffect.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 2rem;
        animation: sparkle 1.5s ease-in-out infinite;
    `;

	// Add click handler to the entire prompt
	prompt.addEventListener("click", () => {
		handleFirstUserInteraction();
	});

	document.body.appendChild(prompt);

	// Auto-remove after 8 seconds if no interaction
	setTimeout(() => {
		if (prompt.parentNode && !hasUserInteracted) {
			prompt.style.animation = "fadeOut 0.5s ease";
			setTimeout(() => {
				if (prompt.parentNode) {
					prompt.remove();
				}
			}, 500);
		}
	}, 8000);
}

function showMusicNotification() {
	const notification = document.createElement("div");
	notification.innerHTML = "🎵 Now Playing: " + playlist[currentSongIndex].title;
	notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 25px;
        z-index: 9999;
        font-size: 0.9rem;
        animation: slideInRight 0.5s ease;
        text-align: center;
        max-width: 300px;
    `;

	document.body.appendChild(notification);

	setTimeout(() => {
		if (notification.parentNode) {
			notification.style.animation = "slideOutRight 0.5s ease";
			setTimeout(() => {
				if (notification.parentNode) {
					notification.parentNode.removeChild(notification);
				}
			}, 500);
		}
	}, 3000);
}

function updateProgress() {
	// This would update a progress bar if we had one
	// For now, just a placeholder
}

// Add some interactive elements
document.addEventListener("click", function (e) {
	// Create ripple effect on click
	if (
		e.target.classList.contains("action-btn") ||
		e.target.classList.contains("memory-card") ||
		e.target.classList.contains("wish-card")
	) {
		createRippleEffect(e);
	}
});

function createRippleEffect(e) {
	const ripple = document.createElement("div");
	const rect = e.target.getBoundingClientRect();
	const size = Math.max(rect.width, rect.height);
	const x = e.clientX - rect.left - size / 2;
	const y = e.clientY - rect.top - size / 2;

	ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;

	e.target.style.position = "relative";
	e.target.style.overflow = "hidden";
	e.target.appendChild(ripple);

	setTimeout(() => {
		if (ripple.parentNode) {
			ripple.parentNode.removeChild(ripple);
		}
	}, 600);
}

// Trip functionality
function showAddTripModal() {
	const modal = document.createElement("div");
	modal.className = "trip-modal";
	modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Trip</h3>
                <button class="close-btn" onclick="closeTripModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="tripDate" class="form-input">
                </div>
                <div class="form-group">
                    <label>Trip Title</label>
                    <input type="text" id="tripTitle" class="form-input" placeholder="e.g., Beach Paradise">
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" id="tripLocation" class="form-input" placeholder="e.g., Maldives">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="tripDescription" class="form-textarea" placeholder="Tell us about this amazing trip..."></textarea>
                </div>
                <div class="form-group">
                    <label>Trip Type</label>
                    <select id="tripType" class="form-select">
                        <option value="plane">✈️ Flight Trip</option>
                        <option value="car">🚗 Road Trip</option>
                        <option value="train">🚂 Train Journey</option>
                        <option value="ship">🚢 Cruise</option>
                        <option value="mountain">🏔️ Mountain Trek</option>
                        <option value="beach">🏖️ Beach Holiday</option>
                        <option value="city">🏙️ City Break</option>
                        <option value="heart">💕 Romantic Getaway</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeTripModal()">Cancel</button>
                <button class="btn-add" onclick="addNewTrip()">Add Trip</button>
            </div>
        </div>
    `;

	modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

	const modalContent = modal.querySelector(".modal-content");
	modalContent.style.cssText = `
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 20px;
        padding: 0;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideInUp 0.3s ease;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    `;

	document.body.appendChild(modal);

	// Add form styles
	const formStyle = document.createElement("style");
	formStyle.textContent = `
        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-header h3 {
            color: white;
            margin: 0;
            font-size: 1.5rem;
        }
        .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        .close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        .modal-body {
            padding: 1.5rem;
        }
        .form-group {
            margin-bottom: 1.5rem;
        }
        .form-group label {
            display: block;
            color: white;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        .form-input, .form-textarea, .form-select {
            width: 100%;
            padding: 0.8rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 1rem;
            backdrop-filter: blur(10px);
        }
        .form-input::placeholder, .form-textarea::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }
        .form-textarea {
            height: 100px;
            resize: vertical;
        }
        .modal-footer {
            padding: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }
        .btn-cancel, .btn-add {
            padding: 0.8rem 1.5rem;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .btn-cancel {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }
        .btn-cancel:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        .btn-add {
            background: #ff6b6b;
            color: white;
        }
        .btn-add:hover {
            background: #ff5252;
            transform: translateY(-2px);
        }
    `;
	document.head.appendChild(formStyle);
}

function closeTripModal() {
	const modal = document.querySelector(".trip-modal");
	if (modal) {
		modal.style.animation = "fadeOut 0.3s ease";
		setTimeout(() => {
			if (modal.parentNode) {
				modal.parentNode.removeChild(modal);
			}
		}, 300);
	}
}

function addNewTrip() {
	const date = document.getElementById("tripDate").value;
	const title = document.getElementById("tripTitle").value;
	const location = document.getElementById("tripLocation").value;
	const description = document.getElementById("tripDescription").value;
	const type = document.getElementById("tripType").value;

	if (!date || !title || !location || !description) {
		alert("Please fill in all fields!");
		return;
	}

	// Create new timeline item
	const timeline = document.querySelector(".timeline");
	const newTripItem = document.createElement("div");
	newTripItem.className = "timeline-item future";
	newTripItem.setAttribute("data-date", date);

	// Get icon based on type
	const iconMap = {
		plane: "fas fa-plane",
		car: "fas fa-car",
		train: "fas fa-train",
		ship: "fas fa-ship",
		mountain: "fas fa-mountain",
		beach: "fas fa-umbrella-beach",
		city: "fas fa-city",
		heart: "fas fa-heart"
	};

	const iconClass = iconMap[type] || "fas fa-heart";

	newTripItem.innerHTML = `
        <div class="timeline-marker">
            <i class="${iconClass}"></i>
        </div>
        <div class="timeline-content">
            <div class="timeline-date">${formatDate(date)}</div>
            <h3 class="timeline-title">${title}</h3>
            <div class="timeline-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${location}</span>
            </div>
            <p class="timeline-description">${description}</p>
            <div class="timeline-photos">
                <div class="photo-placeholder future">
                    <i class="fas fa-calendar-plus"></i>
                    <span>Planning in progress...</span>
                </div>
            </div>
        </div>
    `;

	// Insert at the end of timeline
	timeline.insertBefore(newTripItem, timeline.querySelector(".timeline-footer"));

	// Animate the new item
	newTripItem.style.animation = "slideInUp 0.6s ease";
	newTripItem.scrollIntoView({ behavior: "smooth", block: "center" });

	// Close modal
	closeTripModal();

	// Show success message
	showTripAddedNotification(title);
}

function formatDate(dateString) {
	const date = new Date(dateString);
	const options = { year: 'numeric', month: 'long', day: 'numeric' };
	return date.toLocaleDateString('en-US', options);
}

function showTripAddedNotification(tripTitle) {
	const notification = document.createElement("div");
	notification.innerHTML = `🎉 Added "${tripTitle}" to our timeline!`;
	notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 25px;
        z-index: 9999;
        font-size: 0.9rem;
        animation: slideInRight 0.5s ease;
        text-align: center;
        max-width: 300px;
    `;

	document.body.appendChild(notification);

	setTimeout(() => {
		if (notification.parentNode) {
			notification.style.animation = "slideOutRight 0.5s ease";
			setTimeout(() => {
				if (notification.parentNode) {
					notification.parentNode.removeChild(notification);
				}
			}, 500);
		}
	}, 3000);
}

// Add ripple animation to CSS
const style = document.createElement("style");
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-20px);
        }
        60% {
            transform: translateY(-10px);
        }
    }
    
    @keyframes sparkle {
        0%, 100% {
            opacity: 0.5;
            transform: scale(1);
        }
        50% {
            opacity: 1;
            transform: scale(1.2);
        }
    }
`;
document.head.appendChild(style);
