// Import Firestore functions using the modern initialization for persistence
import {
    initializeFirestore, persistentLocalCache, collection, doc, setDoc, addDoc, getDoc, getDocs, deleteDoc, onSnapshot, query, where, writeBatch, updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Import Authentication functions
import {
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';


document.addEventListener('DOMContentLoaded', function () {
    console.log("App DOMContentLoaded: Initializing with Firebase Auth & Firestore...");

    // --- HAMBURGER MENU LOGIC ---
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinksContainer = document.getElementById('nav-links-container');//This will need changed on some devices, however it will be somewhat operational wherever you use it.
    const navLinksForMenu = document.querySelectorAll('#nav-links-container .nav-link');

    if (hamburgerMenu && navLinksContainer) {
        hamburgerMenu.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            
        });
    }
    
    // Add event listener to each nav link to close the menu on click (for mobile view)
    navLinksForMenu.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 960 && navLinksContainer.classList.contains('active')) {
                navLinksContainer.classList.remove('active');
            }
        });
    });

    // Optional: Close menu when clicking outside of it on mobile. This woudn't be a waste when performing a similar action on PC, but this is the standard system.
    document.addEventListener('click', (event) => {
        const isClickInsideNav = navLinksContainer.contains(event.target);
        const isClickOnHamburger = hamburgerMenu.contains(event.target);

        if (!isClickInsideNav && !isClickOnHamburger && navLinksContainer.classList.contains('active')) {
            navLinksContainer.classList.remove('active');
        }
    });


    // --- INITIALIZE FIREBASE SERVICES ---
    const app = window.firebaseApp;
    const auth = getAuth(app);
    // Initialize Firestore with offline persistence enabled
    const db = initializeFirestore(app, {
        localCache: persistentLocalCache(/*{ tabManager: 'firestore-tab-manager' }*/)
    });

    // --- GLOBAL DOM ELEMENTS ---
    // App and Login Containers
    const loginView = document.getElementById('LoginView');
    const appContainer = document.getElementById('AppContainer');
    const loginForm = document.getElementById('loginForm');
    const loginFeedback = document.getElementById('loginFeedback');
    const registerView = document.getElementById('RegisterView');
    const registerForm = document.getElementById('registerForm');
    const registerFeedback = document.getElementById('registerFeedback');
    const passwordResetView = document.getElementById('PasswordResetView');
    const passwordResetForm = document.getElementById('passwordResetForm');
    const resetFeedback = document.getElementById('resetFeedback');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginFromReset = document.getElementById('backToLoginFromReset');
    
    // NEW: Loading Overlay Elements
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingMessage = document.getElementById('loadingMessage');

    // Navigation elements
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view-section');
    const addEditRoomTitle = document.getElementById('addEditRoomTitle');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const signOutBtn = document.getElementById('signOutBtn');
    const adminNavLi = document.getElementById('adminNavLi');
    const pendingUsersContainer = document.getElementById('pendingUsersContainer');
    const adminFeedback = document.getElementById('adminFeedback');


    // Room Form elements
    const roomForm = document.getElementById('roomForm');
    const editingRoomIdInput = document.getElementById('editingRoomId');
    const isResolvingAttemptedDataInput = document.getElementById('isResolvingAttemptedData');
    const buildingNameSelect = document.getElementById('buildingName');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const doorsContainer = document.getElementById('doorsContainer');
    const addDoorBtn = document.getElementById('addDoorBtn');
    const saveRoomBtn = document.getElementById('saveRoomBtn');
    const copyCurrentRoomJsonBtn = document.getElementById('copyCurrentRoomJsonBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const backToFilterBtn = document.getElementById('backToFilterBtn'); // New button
    const lightFixturesContainer = document.getElementById('lightFixturesContainer');
    const addLightFixtureBtn = document.getElementById('addLightFixtureBtn');
    const otherFixturesCheckboxes = document.querySelectorAll('.fixture-present-checkbox');
    // New: Asbestos radio buttons
    const asbestosInRoomRadios = document.querySelectorAll('input[name="asbestosInRoom"]');

    // View Rooms elements
    const roomListContainer = document.getElementById('roomListContainer');
    const roomDetailModal = document.getElementById('roomDetailModal');
    const roomDetailContent = document.getElementById('roomDetailContent');
    const closeModalBtn = document.querySelector('#roomDetailModal .close-modal-btn');

    // Data Management elements
    const jsonImportFile = document.getElementById('jsonImportFile');
    const importJsonFileBtn = document.getElementById('importJsonFileBtn');
    const jsonPasteArea = document.getElementById('jsonPasteArea');
    const importJsonPasteBtn = document.getElementById('importJsonPasteBtn');
    const importFeedback = document.getElementById('importFeedback');
    const jsonDisplayArea = document.getElementById('jsonDisplayArea');
    const copyJsonBtn = document.getElementById('copyJsonBtn');
    const exportAllBtn = document.getElementById('exportAllBtn');
    const exportAllCsvBtn = document.getElementById('exportAllCsvBtn'); // New CSV Export Button
    const exportFeedback = document.getElementById('exportFeedback');
    const massUpdateOldBuildingNameSelect = document.getElementById('massUpdateOldBuildingNameSelect');
    const massUpdateNewBuildingNameInput = document.getElementById('massUpdateNewBuildingNameInput');
    const massUpdateBuildingNameBtn = document.getElementById('massUpdateBuildingNameBtn');
    const massUpdateFeedback = document.getElementById('massUpdateFeedback');
    const newBuildingNameInput = document.getElementById('newBuildingNameInput');
    const addBuildingBtn = document.getElementById('addBuildingBtn');
    const renameOldBuildingNameSelect = document.getElementById('renameOldBuildingNameSelect');
    const renameNewBuildingNameInput = document.getElementById('renameNewBuildingNameInput');
    const renameBuildingBtn = document.getElementById('renameBuildingBtn');
    const buildingManagementFeedback = document.getElementById('buildingManagementFeedback');
    // NEW: Building Deletion Elements
    const deleteBuildingNameSelect = document.getElementById('deleteBuildingNameSelect');
    const deleteBuildingBtn = document.getElementById('deleteBuildingBtn');


    // Import Conflict Modal elements
    const conflictModal = document.getElementById('conflictModal');
    const closeConflictModalBtn = document.getElementById('closeConflictModalBtn');
    const importingRoomDetailsPreview = document.getElementById('importingRoomDetailsPreview');
    const existingRoomDetailsPreview = document.getElementById('existingRoomDetailsPreview');
    const conflictBuildingNew = document.getElementById('conflictBuildingNew');
    const conflictRoomIDNew = document.getElementById('conflictRoomIDNew');
    const skipConflictBtn = document.getElementById('skipConflictBtn');
    const replaceConflictBtn = document.getElementById('replaceConflictBtn');
    const saveModifiedConflictBtn = document.getElementById('saveModifiedConflictBtn');
    const modifyConflictFeedback = document.getElementById('modifyConflictFeedback');
    const massReplaceAllConflictBtn = document.getElementById('massReplaceAllConflictBtn');
    const massSkipAllConflictBtn = document.getElementById('massSkipAllConflictBtn');


    // Duplicate Save Conflict Resolution View elements
    const duplicateResolutionView = document.getElementById('duplicateResolutionView');
    const attemptedDataPreview = document.getElementById('attemptedDataPreview');
    const editAttemptedBtn = document.getElementById('editAttemptedBtn');
    const discardAttemptedBtn = document.getElementById('discardAttemptedBtn');
    const editExistingConflictBtn = document.getElementById('editExistingConflictBtn');
    const deleteExistingConflictBtn = document.getElementById('deleteExistingConflictBtn');
    const duplicateResolutionFeedback = document.getElementById('duplicateResolutionFeedback');
    const cancelDuplicateResolutionBtn = document.getElementById('cancelDuplicateResolutionBtn');


    // Filter View elements
    const filterForm = document.getElementById('filterForm');
    const filterBuildingNameInput = document.getElementById('filterBuildingName');
    const filterRoomIdentifierInput = document.getElementById('filterRoomIdentifier');
    const globalQueryInput = document.getElementById('globalQuery');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    const filterResultsContainer = document.getElementById('filterResultsContainer');
    const filterFeedback = document.getElementById('filterFeedback');

    // --- Mass Edit Logic (NEW) ---
    const enableMassEditCheckbox = document.getElementById('enableMassEditCheckbox');
    const massEditFields = document.getElementById('massEditFields');
    const massEditPropertySelect = document.getElementById('massEditPropertySelect');
    const previousLabelInput = document.getElementById('previousLabelInput');
    const newLabelInput = document.getElementById('newLabelInput');
    const applyMassEditBtn = document.getElementById('applyMassEditBtn');
    const massEditFeedback = document.getElementById('massEditFeedback');


    // LocalStorage keys (for non-critical, client-side data)
    const LAST_USED_BUILDING_KEY = 'roomAppData_lastUsedBuilding';
    const LAST_INPUT_VALUES_KEY = 'roomAppData_lastInputValues';

    // Firestore Collection Names
    const ROOMS_COLLECTION = 'rooms';
    const BUILDINGS_DOC = 'buildings/buildingList'; // Storing buildings as a single document
    const USERS_COLLECTION = 'users';

    // --- STATE VARIABLES --- 
    let allRoomsCache = []; 
    let allBuildingsCache = []; 
    let lastInputValues = {};
    let importedRoomsQueue = [];
    let currentImportIndex = 0;
    let successfullyImportedCount = 0;
    let skippedCount = 0;
    let replacedCount = 0;
    let currentConflictingRoom = null;
    let currentExistingRoom = null;
    let importConflictResolutionMode = 'manual';
    let currentAttemptedSaveData = null;
    let currentExistingRoomForSaveConflict = null;
    let cameFromDuplicateResolutionView = false;
    let cameFromFilterView = false;
    let lastFilterState = { building: '', identifier: '', global: '' }; 
    let focusedButtonBeforeModal = null;
    let unsubscribeRooms = null; 
    let unsubscribeBuildings = null;
    let currentFilteredRooms = []; //Indiana

/*
If I were to unite these state variables, they would be the united states variables...
there would be 19 of them, correlating to america in The Year Of Our Lord 1816.
And everyone knows what happened in 1816:
    The establishment of the Second Bank of the United States
    Indiana's admission as the 19th U.S. state
    And of course it was... THE YEAR WITHOUT A SUMMER
    
*/
    
    // Default buildings list - Used to initialize the database if it's empty
    const DEFAULT_BUILDINGS = [
        "Boyd Science Center", "Brown Chapel", "Cambridge Hall", "Montgomery Hall", "MOT House",
        "Neptune Center", "Palmer Art Gallery", "Paul Hall", "Philip and Betsey Caldwell Hall",
        "Quad Center and Bookstore", "Roberta A. Smith University Library", "Walter Hall",
        "Anne C. Steele Recreation Center", "Chess Center", "Henry D. Bullock Health and Wellness Complex", "John Glenn Gym",
        "Circle 240", "Finney Hall", "Kelley Hall", "Memorial Hall", "Moore Hall", "Patton Hall", "Stadium Heights", "Thomas Hall",
        "Student health center", "University Police",
        "Lakeside 101", "Lakeside 103", "Lakeside 105", "Lakeside 107", "Lakeside 109", "Lakeside 111",
        "Lakeside 115 (Kappa Sig)", "Lakeside 117 (Kappa Sig)", "Lakeside 125 (DELTA House)", "Lakeside 127 (Mace)",
        "Lakeside 133 (Phi Tau)", "Lakeside 135", "Lakeside 137 (RA Housing)", 'Lakeside 141 (Phi Psi)', "Lakeside 151 (Ulster)"
    ];

    // Initially hide all main views and ensure loading overlay is visible
    loginView.style.display = 'none';
    registerView.style.display = 'none';
    passwordResetView.style.display = 'none';
    appContainer.style.display = 'none';
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');


    // --- AUTHENTICATION LOGIC ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in, now check their status in Firestore
            // Show a message that credentials are being applied
            if (loadingOverlay) {
                loadingOverlay.classList.remove('hidden'); // Ensure visible if it was hidden by a quick state change
                loadingMessage.textContent = 'Credentials found. Applying...';
            }

            const userDocRef = doc(db, USERS_COLLECTION, user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (loadingOverlay) loadingOverlay.classList.add('hidden'); // Hide after Firestore check

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                if (userData.status === 'approved') {
                    // User is approved, let them in
                    loginView.style.display = 'none';
                    loginView.classList.remove('active-view');
                    registerView.style.display = 'none';
                    registerView.classList.remove('active-view');
                    passwordResetView.style.display = 'none';
                    passwordResetView.classList.remove('active-view');
                    appContainer.style.display = 'flex';
                    appContainer.classList.add('active-view');
                    
                    userEmailDisplay.textContent = user.email;
                    signOutBtn.style.display = 'inline-flex';

                    // Check if the user is an admin
                    if (userData.role === 'admin') {
                        adminNavLi.style.display = 'list-item';
                        listenForPendingUsers();
                    } else {
                        adminNavLi.style.display = 'none';
                    }

                    initializeAppLogic(); // Your existing function
                } else {
                    // User is pending or another status
                    loginFeedback.textContent = 'Your account is awaiting approval. Please check back later.';
                    loginFeedback.className = 'feedback info';
                    signOut(auth); // Log them out
                    loginView.style.display = 'flex'; // Show login view after sign out
                    loginView.classList.add('active-view');
                }
            } else {
                // User exists in Auth but not in our users collection (edge case)
                loginFeedback.textContent = 'Your account is not fully configured. Please contact an administrator.';
                loginFeedback.className = 'feedback error';
                signOut(auth);
                loginView.style.display = 'flex'; // Show login view after sign out
                loginView.classList.add('active-view');
            }
        } else {
            // User is signed out
            if (loadingOverlay) loadingOverlay.classList.add('hidden'); // Hide loading overlay
            appContainer.style.display = 'none';
            appContainer.classList.remove('active-view');
            registerView.style.display = 'none';
            registerView.classList.remove('active-view');
            passwordResetView.style.display = 'none';
            passwordResetView.classList.remove('active-view');
            loginView.style.display = 'flex';
            loginView.classList.add('active-view');
            adminNavLi.style.display = 'none';

            userEmailDisplay.textContent = '';
            signOutBtn.style.display = 'none';

            if (unsubscribeRooms) unsubscribeRooms();
            if (unsubscribeBuildings) unsubscribeBuildings();
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Add explicit check for offline status
            if (!navigator.onLine) {
                loginFeedback.textContent = 'A network connection is required to sign in.';
                loginFeedback.className = 'feedback error';
                return;
            }

            const email = loginForm.loginEmail.value;
            const password = loginForm.loginPassword.value;
            loginFeedback.textContent = '';
            loginFeedback.className = 'feedback';

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in - onAuthStateChanged will handle the rest
                    console.log("Login successful for:", userCredential.user.email);
                })
                .catch((error) => {
                    console.error("Login error:", error.code, error.message);
                    loginFeedback.textContent = 'Error: Invalid email or password.';
                    loginFeedback.className = 'feedback error';
                });
        });
    }

    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            signOut(auth).catch(error => {
                console.error("Sign out error", error);
            });
        });
    }

    // --- View Switching for Login/Register/Reset ---
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginView.style.display = 'none';
            passwordResetView.style.display = 'none';
            registerView.style.display = 'flex';
            registerView.classList.add('active-view');
            loginView.classList.remove('active-view');
            passwordResetView.classList.remove('active-view');
        });
    }

    const showLoginView = (e) => {
        if(e) e.preventDefault();
        registerView.style.display = 'none';
        passwordResetView.style.display = 'none';
        loginView.style.display = 'flex';
        loginView.classList.add('active-view');
        registerView.classList.remove('active-view');
        passwordResetView.classList.remove('active-view');
    };

    if (switchToLogin) {
        switchToLogin.addEventListener('click', showLoginView);
    }
    if (backToLoginFromReset) {
        backToLoginFromReset.addEventListener('click', showLoginView);
    }
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginView.style.display = 'none';
            registerView.style.display = 'none';
            passwordResetView.style.display = 'flex';
            passwordResetView.classList.add('active-view');
            loginView.classList.remove('active-view');
            registerView.classList.remove('active-view');
        });
    }

    // --- Password Reset Logic ---
    if (passwordResetForm) {
        passwordResetForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Add explicit check for offline status
            if (!navigator.onLine) {
                resetFeedback.textContent = 'A network connection is required to reset a password.';
                resetFeedback.className = 'feedback error';
                return;
            }

            const email = passwordResetForm.resetEmail.value;
            resetFeedback.textContent = '';
            resetFeedback.className = 'feedback';

            sendPasswordResetEmail(auth, email)
                .then(() => {
                    resetFeedback.textContent = 'Success! If an account exists for this email, a password reset link has been sent.';
                    resetFeedback.className = 'feedback success';
                    passwordResetForm.reset();
                })
                .catch((error) => {
                    console.error("Password reset error:", error);
                    // We show a generic message for security reasons (don't reveal which emails are registered)
                    resetFeedback.textContent = 'Success! If an account exists for this email, a password reset link has been sent.';
                    resetFeedback.className = 'feedback success';
                });
        });
    }

    // --- New Registration Logic ---
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Add explicit check for offline status
            if (!navigator.onLine) {
                registerFeedback.textContent = 'A network connection is required to request an account.';
                registerFeedback.className = 'feedback error';
                return;
            }

            const email = registerForm.registerEmail.value;
            const password = registerForm.registerPassword.value;
            registerFeedback.textContent = '';
            registerFeedback.className = 'feedback';

            if (!email.endsWith('@muskingum.edu')) {
                registerFeedback.textContent = 'Error: Email must be a valid @muskingum.edu address.';
                registerFeedback.className = 'feedback error';
                return;
            }

            createUserWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    const user = userCredential.user;
                    // Now, create a document in the 'users' collection
                    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
                    await setDoc(userDocRef, {
                        email: user.email,
                        status: 'pending',
                        role: 'pending',
                        requestedAt: new Date().toISOString()
                    });

                    registerFeedback.textContent = 'Success! Your request has been submitted and is awaiting approval.';
                    registerFeedback.className = 'feedback success';
                    registerForm.reset();
                    signOut(auth); // Sign the user out immediately after they request an account
                })
                .catch((error) => {
                    if (error.code === 'auth/email-already-in-use') {
                        registerFeedback.textContent = 'This email address has already been registered or requested.';
                    } else if (error.code === 'auth/weak-password') {
                        registerFeedback.textContent = 'Password should be at least 6 characters.';
                    }
                    else {
                        registerFeedback.textContent = 'An error occurred during registration.';
                    }
                    registerFeedback.className = 'feedback error';
                    console.error("Registration error:", error);
                });
        });
    }

    // --- Admin Panel Functions ---
    function listenForPendingUsers() {
        const q = query(collection(db, USERS_COLLECTION), where("status", "==", "pending"));
        onSnapshot(q, (querySnapshot) => {
            if (!pendingUsersContainer) return;
            pendingUsersContainer.innerHTML = ''; // Clear previous list
            if (querySnapshot.empty) {
                pendingUsersContainer.innerHTML = '<p class="empty-list-message">No pending user requests.</p>';
                return;
            }
            querySnapshot.forEach((docSnap) => {
                const userData = docSnap.data();
                const userDiv = document.createElement('div');
                userDiv.classList.add('room-card'); // Reuse existing style
                userDiv.innerHTML = `
                    <h3>${escapeHtml(userData.email)}</h3>
                    <p><small>Requested: ${new Date(userData.requestedAt).toLocaleString()}</small></p>
                    <div class="actions">
                        <button class="action-button primary-button approve-user-btn" data-uid="${docSnap.id}">Approve</button>
                    </div>
                `;
                pendingUsersContainer.appendChild(userDiv);
            });
        });
    }

    // Add event listener for the approve button
    if (pendingUsersContainer) {
        pendingUsersContainer.addEventListener('click', async (e) => {
            const approveButton = e.target.closest('.approve-user-btn');
            if (approveButton) {
                const uidToApprove = approveButton.dataset.uid;
                const userToUpdateRef = doc(db, USERS_COLLECTION, uidToApprove);
                
                try {
                    await updateDoc(userToUpdateRef, {
                        status: 'approved',
                        role: 'member' // Assign a general member role
                    });
                    if (adminFeedback) {
                        adminFeedback.textContent = 'User approved successfully.';
                        adminFeedback.className = 'feedback success';
                    }
                } catch (error) {
                    if (adminFeedback) {
                        adminFeedback.textContent = 'Error approving user.';
                        adminFeedback.className = 'feedback error';
                    }
                    console.error("Approval error: ", error);
                }
            }
        });
    }


    // --- MAIN APP INITIALIZATION (Called after successful login) ---
    function initializeAppLogic() {
        console.log("Initializing main app logic (post-login).");
        loadLastInputValues();
        initializeRealtimeListeners(); // This will start fetching data
        if (roomForm) {
            initializeFormConditionalLogic(roomForm);
        }
        // Don't call populateBuildingDropdowns or setActiveView here, 
        // the listeners will handle updating the UI once data arrives.
        setActiveView('ViewRoomsView'); 
    }


    // --- Real-time Data Listeners ---
    function initializeRealtimeListeners() {
        // Detach old listeners if they exist, to prevent duplicates
        if (unsubscribeRooms) unsubscribeRooms();
        if (unsubscribeBuildings) unsubscribeBuildings();

        const roomsQuery = query(collection(db, ROOMS_COLLECTION));
        unsubscribeRooms = onSnapshot(roomsQuery, (snapshot) => {
            console.log("Firestore: Rooms snapshot updated.");
            allRoomsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Only re-render if the corresponding view is active
            if (document.getElementById('ViewRoomsView').classList.contains('active-view')) {
                renderRoomList();
            }
            if (document.getElementById('FilterView').classList.contains('active-view')) {
                applyFilters();
            }
            if (document.getElementById('DataView').classList.contains('active-view')) {
                displayFullJsonForExport();
            }
        }, (error) => {
            console.error("Firestore: Error listening to room changes: ", error);
            feedbackMessage.textContent = "Error: Could not connect to the room database.";
            feedbackMessage.className = 'feedback error';
        });

        const buildingsDocRef = doc(db, BUILDINGS_DOC);
        unsubscribeBuildings = onSnapshot(buildingsDocRef, (docSnap) => {
            console.log("Firestore: Buildings snapshot updated.");
            if (docSnap.exists()) {
                allBuildingsCache = docSnap.data().names || [];
            } else {
                console.log("Firestore: Buildings document not found, creating with defaults.");
                setDoc(buildingsDocRef, { names: DEFAULT_BUILDINGS.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())) });
                allBuildingsCache = [...DEFAULT_BUILDINGS];
            }
            populateBuildingDropdowns();
        }, (error) => {
            console.error("Firestore: Error listening to building changes: ", error);
            buildingManagementFeedback.textContent = "Error: Could not connect to the building database.";
            buildingManagementFeedback.className = 'feedback error';
        });
    }

    // --- "Remember Last Input" Feature (Uses LocalStorage) ---
    function loadLastInputValues() {
        const stored = localStorage.getItem(LAST_INPUT_VALUES_KEY);
        if (stored) {
            lastInputValues = JSON.parse(stored);
        } else {
            // Default values for a brand new start
            lastInputValues = {
                roomPurpose: 'Lab',
                walls: 'Drywall',
                ceilingType: 'Drop Ceiling',
                floorType: 'Carpet',
                heatingCooling: 'Forced Air',
                lightFixtures: [{ type: 'LED', quantity: 1, style: 'Flat Panel' }],
                doors: [{ identifier: 'Main Entry', type: 'Wood', lockType: 'Key' }],
                asbestosInRoom: 'No' // Default for new independent asbestos field
            };
        }
    }

    function saveLastInputValues() {
        try {
            const currentData = getCurrentRoomDataFromForm(); // Get all current form data

            // Create a deep copy to modify for storage
            const dataToStore = JSON.parse(JSON.stringify(currentData));

            // Exclude specific fields as per user request
            delete dataToStore.roomIdentifier; // Room number
            // Exclude comment fields
            if (dataToStore.conditionValues) {
                delete dataToStore.conditionValues.ceilingComment;
                delete dataToStore.conditionValues.wallsComment;
                delete dataToStore.conditionValues.furnitureComment;
                delete dataToStore.conditionValues.floorComment;
                delete dataToStore.conditionValues.overallComment;
            }

            // Special handling for doors: only remember if it's the default 'Main Entry' and no other doors
            if (dataToStore.doors && dataToStore.doors.length === 1 &&
                dataToStore.doors[0].identifier === 'Main Entry' &&
                dataToStore.doors[0].type === 'Wood' &&
                dataToStore.doors[0].lockType === 'Key' &&
                !dataToStore.doors[0].typeOther &&
                !dataToStore.doors[0].lockTypeOther) {
                // Keep the default door for remembering
            } else {
                // If there are multiple doors or the single door is not the default, clear it for remembering
                // A new room will then get a fresh default 'Main Entry'
                dataToStore.doors = [];
            }

            // Light fixtures: only remember the first one
            if (dataToStore.lightFixtures && dataToStore.lightFixtures.length > 0) {
                dataToStore.lightFixtures = [dataToStore.lightFixtures[0]];
            } else {
                dataToStore.lightFixtures = [];
            }


            localStorage.setItem(LAST_INPUT_VALUES_KEY, JSON.stringify(dataToStore));
        } catch (e) {
            console.error("Could not save last input values, storage might be full.", e);
        }
    }

    // Helper to get a nested property from an object using a string path
    function getNestedProperty(obj, path) {
        return path.split('.').reduce((acc, part) => {
            return acc && typeof acc === 'object' ? acc[part] : undefined;
        }, obj);
    }

    // Helper to set a nested property on an object using a string path
    function setNestedProperty(obj, path, value) {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!current[part] || typeof current[part] !== 'object') {
                current[part] = {}; // Create nested object if it doesn't exist
            }
            current = current[part];
        }
        current[parts[parts.length - 1]] = value;
    }

    // Recursive function to apply values from a data object to a form
    function applyValuesToFormElements(data, formElement) {
        if (!data || typeof data !== 'object' || !formElement) return;

        for (const key in data) {
            if (!data.hasOwnProperty(key)) continue;

            const value = data[key];
            const element = formElement.querySelector(`[name="${key}"], #${key}`);

            if (element) {
                if (element.tagName === 'SELECT' || element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    // Skip roomIdentifier and comment fields
                    if (key === 'roomIdentifier' || key.endsWith('Comment')) {
                        continue;
                    }
                    if (element.tagName === 'SELECT') {
                        const optionExists = Array.from(element.options).some(opt => opt.value === value);
                        if (!optionExists) continue; // Don't set if option doesn't exist
                    }
                    element.value = value;
                    element.classList.add('remembered-input');
                } else if (element.type === 'radio') {
                    // For radio buttons, find the one with the matching value
                    const radio = formElement.querySelector(`input[name="${key}"][value="${value}"]`);
                    if (radio) {
                        radio.checked = true;
                        radio.classList.add('remembered-input');
                    }
                } else if (element.type === 'checkbox') {
                    // For single checkboxes, check if the value is truthy
                    if (value) {
                        element.checked = true;
                        element.classList.add('remembered-input');
                    }
                }
            } else if (typeof value === 'object' && value !== null) {
                // Handle nested objects (e.g., roomMakeup, conditionValues, safety)
                // For nested properties, we need to target elements by their full name or ID path if available
                // This part requires more specific handling based on your HTML structure
                // For now, let's assume direct mapping for simple inputs within nested structures
                // and handle checkboxes/radios for groups.

                // Example for nested properties like roomMakeup.walls
                // This requires iterating through the nested data and finding elements by their direct name/ID
                // For simplicity, the current `applyLastInputsToForm` below will handle the top-level fields
                // and then specific logic for complex parts like otherFixtures, lightFixtures, doors.
                // A more robust recursive approach would need a way to map data path to DOM elements.
                // Given the current form structure, explicit handling per section is more practical.
            }
        }
    }


    function applyLastInputsToForm(form) {
        if (!form || !lastInputValues) return;

        // Clear remembered-input class from all elements first
        form.querySelectorAll('.remembered-input, .default-value-input').forEach(el => el.classList.remove('remembered-input', 'default-value-input'));

        // Apply values for simple direct inputs and selects
        const fieldsToApply = [
            'roomPurpose', 'roomPurposeOther',
            'walls', 'wallsOther',
            'ceilingType', 'ceilingTypeOther',
            'heatingCooling', 'heatingCoolingOther',
            'smokeDetectors', 'maxOccupancy',
            'ceilingCondition', 'wallsCondition', 'furnitureCondition', 'floorCondition', 'overallCondition',
            'floorType', 'floorTypeOther' // Added floorType and its other
        ];

        fieldsToApply.forEach(fieldName => {
            const value = getNestedProperty(lastInputValues, fieldName);
            if (value !== undefined && value !== null && (typeof value === 'number' || value !== '')) {
                const element = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
                if (element) {
                    if (element.tagName === 'SELECT') {
                        const optionExists = Array.from(element.options).some(opt => opt.value === value);
                        if (!optionExists) return;
                    }
                    element.value = value;
                    element.classList.add('remembered-input');
                    // Explicitly dispatch change event for selects to trigger conditional logic
                    if (element.tagName === 'SELECT') {
                        element.dispatchEvent(new Event('change'));
                    }
                }
            }
        });

        // Handle independent asbestosInRoom
        if (lastInputValues.asbestosInRoom) {
            const radio = form.querySelector(`input[name="asbestosInRoom"][value="${lastInputValues.asbestosInRoom}"]`);
            if (radio) {
                radio.checked = true;
                radio.classList.add('remembered-input');
                radio.dispatchEvent(new Event('change')); // Explicitly dispatch change event for radio
            }
        }

        // Handle specific nested structures like roomMakeup.floor.tileSize
        if (lastInputValues.roomMakeup?.floor?.tileSize) {
            const radio = form.querySelector(`input[name="floorTileSize"][value="${lastInputValues.roomMakeup.floor.tileSize}"]`);
            if (radio) {
                radio.checked = true;
                radio.classList.add('remembered-input');
                radio.dispatchEvent(new Event('change')); // Explicitly dispatch change event for radio
            }
            if (lastInputValues.roomMakeup.floor.tileSize === 'Other' && lastInputValues.roomMakeup.floor.tileSizeOther) {
                const otherInput = form.querySelector('#floorTileSizeOther');
                if (otherInput) {
                    otherInput.value = lastInputValues.roomMakeup.floor.tileSizeOther;
                    otherInput.classList.add('remembered-input');
                }
            }
        }

        // Handle checkboxes for otherFixtures, furniture, technology
        const checkboxGroups = [
            { dataKey: 'otherFixtures', checkboxName: 'otherFixturePresent', isOtherGroup: true },
            { dataKey: 'furniture', checkboxName: 'furniture', specialtySpecifyKey: 'furnitureSpecialtySpecify', otherSpecifyKey: 'furnitureOtherSpecify' },
            { dataKey: 'technology', checkboxName: 'technology', otherSpecifyKey: 'technologyOtherSpecify' }
        ];

        checkboxGroups.forEach(group => {
            if (lastInputValues[group.dataKey] && Array.isArray(lastInputValues[group.dataKey])) {
                // Uncheck all related checkboxes first
                form.querySelectorAll(`input[name="${group.checkboxName}"]`).forEach(cb => cb.checked = false);

                lastInputValues[group.dataKey].forEach(item => {
                    let checkboxValue;
                    let count = 1;
                    let specifyText = '';

                    if (group.isOtherGroup) { // For otherFixtures
                        checkboxValue = item.type;
                        count = item.count;
                        specifyText = item.specify;
                    } else { // For furniture, technology (simple string arrays)
                        checkboxValue = item;
                    }

                    const checkbox = form.querySelector(`input[name="${group.checkboxName}"][value="${checkboxValue}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        checkbox.classList.add('remembered-input');

                        if (group.isOtherGroup) {
                            // Handle count and specify for otherFixtures
                            const idSuffix = checkboxValue.replace(/[^a-zA-Z0-9]/g, '');
                            let countInputId = `otherFixture${idSuffix}Count`;
                            if (checkboxValue === "Other") {
                                const specifyInput = document.getElementById('otherFixturesSpecifyText');
                                if (specifyInput) {
                                    specifyInput.value = specifyText || '';
                                    specifyInput.classList.add('remembered-input');
                                }
                                countInputId = 'otherFixturesOtherCount';
                            }
                            const countInput = document.getElementById(countInputId);
                            if (countInput) {
                                countInput.value = count || '1';
                                countInput.classList.add('remembered-input');
                            }
                        }
                    }
                });

                // Handle specific "Other" text inputs for furniture and technology
                if (group.specialtySpecifyKey && lastInputValues[group.specialtySpecifyKey]) {
                    const input = form.querySelector('#furnitureSpecialtySpecifyText');
                    if (input) {
                        input.value = lastInputValues[group.specialtySpecifyKey];
                        input.classList.add('remembered-input');
                    }
                }
                if (group.otherSpecifyKey && lastInputValues[group.otherSpecifyKey]) {
                    const input = form.querySelector(`#${group.checkboxName}OtherSpecifyText`);
                    if (input) {
                        input.value = lastInputValues[group.otherSpecifyKey];
                        input.classList.add('remembered-input');
                    }
                }
            }
        });

        // Trigger change events for checkboxes to update conditional displays
        form.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.dispatchEvent(new Event('change')));
        
        // Handle lightFixtures: clear existing and append the remembered one
        if (lightFixturesContainer) lightFixturesContainer.innerHTML = '';
        if (lastInputValues.lightFixtures && lastInputValues.lightFixtures.length > 0) {
            appendNewLightFixtureEntry(lastInputValues.lightFixtures[0], true);
        } else {
            appendNewLightFixtureEntry({}, false); // Add a default if none remembered
        }

        // Handle doors: clear existing and append the remembered one or default
        if (doorsContainer) doorsContainer.innerHTML = '';
        if (lastInputValues.doors && lastInputValues.doors.length > 0) {
            appendNewDoorEntry(lastInputValues.doors[0], true); // Only remember the first door
        } else {
            appendNewDoorEntry({ identifier: 'Main Entry' }, true); // Add a default if none remembered
        }

        refreshConditionalFormUI(form);
    }

    function handleRememberedInputInteraction(event) {
        const target = event.target;
        if (target.classList.contains('remembered-input')) {
            target.classList.remove('remembered-input');
        }
    }

    if (roomForm) {
        ['focus', 'input', 'change'].forEach(eventType => {
            roomForm.addEventListener(eventType, handleRememberedInputInteraction, true);
        });
    }

    function getStoredBuildings() {
        return allBuildingsCache;
    }

    async function storeBuildings(buildingsArray) {
        try {
            const sortedBuildings = buildingsArray.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
            const buildingsDocRef = doc(db, BUILDINGS_DOC);
            await setDoc(buildingsDocRef, { names: sortedBuildings });
        } catch (e) {
            console.error("Firestore: Error storing buildings", e);
            throw new Error('Storage Full');
        }
    }
    
    function getLastUsedBuilding() {
        return localStorage.getItem(LAST_USED_BUILDING_KEY);
    }

    function setLastUsedBuilding(buildingName) {
        try {
            localStorage.setItem(LAST_USED_BUILDING_KEY, buildingName);
        } catch(e) {
            console.error("Could not set last used building, local storage might be full.", e);
        }
    }

    function populateBuildingDropdowns(selectedBuildingForForm = null) {
        const buildings = getStoredBuildings();
        const lastUsed = getLastUsedBuilding();
        const selectsToUpdate = [
            { el: buildingNameSelect, defaultOpt: "-- Select Building --", selectedVal: selectedBuildingForForm || lastUsed || (lastInputValues ? lastInputValues.buildingName : null) },
            { el: massUpdateOldBuildingNameSelect, defaultOpt: "-- Select Building to Reassign From --" },
            { el: renameOldBuildingNameSelect, defaultOpt: "-- Select Building to Rename --" },
            { el: deleteBuildingNameSelect, defaultOpt: "-- Select Building --" }, // NEW: Added for delete building dropdown
            { el: filterBuildingNameInput, defaultOpt: "-- Any Building --" }
        ];
        selectsToUpdate.forEach(item => {
            if (!item.el) return;
            const currentSelect = item.el;
            const previouslySelectedValue = currentSelect.value;
            currentSelect.innerHTML = `<option value="">${item.defaultOpt}</option>`;
            let optionsHtml = "";
            const sortedBuildings = [...buildings];
            let valueToSelect = item.selectedVal;
            if (item.el.id === 'filterBuildingName' && previouslySelectedValue && buildings.includes(previouslySelectedValue)) {
                valueToSelect = previouslySelectedValue;
            } else if (!valueToSelect && previouslySelectedValue && buildings.includes(previouslySelectedValue) && item.el.id !== 'filterBuildingName') {
                 valueToSelect = previouslySelectedValue;
            }
            if (valueToSelect && sortedBuildings.includes(valueToSelect)) {
                optionsHtml += `<option value="${escapeHtml(valueToSelect)}" selected>${escapeHtml(valueToSelect)}</option>`;
                const index = sortedBuildings.indexOf(valueToSelect);
                if (index > -1) sortedBuildings.splice(index, 1);
                if (item.el.id === 'buildingName' && !selectedBuildingForForm && !lastUsed && lastInputValues.buildingName === valueToSelect) {
                    currentSelect.classList.add('remembered-input');
                }
            }
            sortedBuildings.forEach(bName => {
                optionsHtml += `<option value="${escapeHtml(bName)}">${escapeHtml(bName)}</option>`;
            });
            currentSelect.innerHTML += optionsHtml;
        });
    }

    function setActiveView(targetViewId, options = {}) {
        views.forEach(view => view.classList.remove('active-view'));
        const targetElement = document.getElementById(targetViewId);

        if (targetElement) {
            targetElement.classList.add('active-view');
            if (!options.preserveScroll) {
                 targetElement.scrollTop = 0;
            }
        } else {
             console.error(`[setActiveView] CRITICAL: Target element with ID '${targetViewId}' NOT FOUND.`);
            return;
        }

        navLinks.forEach(link => {
            link.classList.remove('active-link');
            if (link.id === `nav${targetViewId.replace('View', '')}`) {
                link.classList.add('active-link');
            }
        });

        if (targetViewId === 'ViewRoomsView') {
            renderRoomList();
        } else if (targetViewId === 'DataView') {
            displayFullJsonForExport();
            if(importFeedback) {importFeedback.textContent = ''; importFeedback.className = 'feedback';}
            if(exportFeedback) {exportFeedback.textContent = ''; exportFeedback.className = 'feedback';}
            if(massUpdateFeedback) {massUpdateFeedback.textContent = ''; massUpdateFeedback.className = 'feedback';}
            if(buildingManagementFeedback) {buildingManagementFeedback.textContent = ''; buildingManagementFeedback.className = 'feedback';}
            if(jsonImportFile) jsonImportFile.value = '';
            if(jsonPasteArea) jsonPasteArea.value = '';
            if(massUpdateNewBuildingNameInput) massUpdateNewBuildingNameInput.value = '';
            if(newBuildingNameInput) newBuildingNameInput.value = '';
            if(renameNewBuildingNameInput) renameNewBuildingNameInput.value = '';
            if(deleteBuildingNameSelect) deleteBuildingNameSelect.value = ''; // Clear delete dropdown
        } else if (targetViewId === 'AddRoomView') {
            if (!editingRoomIdInput.value && isResolvingAttemptedDataInput.value !== 'true') {
                resetRoomFormToDefault();
            }
             isResolvingAttemptedDataInput.value = 'false';
        } else if (targetViewId === 'FilterView') {
            if(filterForm) filterForm.reset();
            // Reset mass edit fields when navigating to filter view normally
            if (enableMassEditCheckbox) enableMassEditCheckbox.checked = false;
            if (massEditFields) massEditFields.style.display = 'none';
            if (massEditPropertySelect) massEditPropertySelect.value = '';
            if (previousLabelInput) previousLabelInput.value = '';
            if (newLabelInput) newLabelInput.value = '';
            if (massEditFeedback) { massEditFeedback.textContent = ''; massEditFeedback.className = 'feedback'; }

            if(filterResultsContainer) filterResultsContainer.innerHTML = '<p class="empty-list-message">Enter filter criteria and click "Apply Filters".</p>';
            if(filterFeedback) {filterFeedback.textContent = ''; filterFeedback.className = 'feedback';}
        } else if (targetViewId === 'duplicateResolutionView') {
            if(duplicateResolutionFeedback) {duplicateResolutionFeedback.textContent = ''; duplicateResolutionFeedback.className = 'feedback';}
        }
    }


    function resetRoomFormToDefault() {
        if (!roomForm) return;

        clearFormAndDynamicElements(roomForm);
        editingRoomIdInput.value = '';
        isResolvingAttemptedDataInput.value = 'false';
        cameFromDuplicateResolutionView = false; 

        if(addEditRoomTitle) addEditRoomTitle.innerHTML = '<i class="fas fa-pencil-alt"></i> Add New Room Information';
        if(saveRoomBtn) saveRoomBtn.innerHTML = '<i class="fas fa-save"></i> Save Room Information';
        if(cancelEditBtn) cancelEditBtn.style.display = 'none';

        if (feedbackMessage && (feedbackMessage.classList.contains('success') || feedbackMessage.classList.contains('error'))) {
            feedbackMessage.textContent = '';
            feedbackMessage.className = 'feedback';
        }

        populateBuildingDropdowns(); // Populates with last used building

        // Apply all remembered inputs
        applyLastInputsToForm(roomForm);

        // Ensure roomIdentifier and comments are always clear for a new room
        const roomIdentifierEl = roomForm.querySelector('#roomIdentifier');
        if(roomIdentifierEl) roomIdentifierEl.value = '';
        
        const commentFields = ['ceilingConditionComment', 'wallsConditionComment', 'furnitureConditionComment', 'floorConditionComment', 'overallConditionComment'];
        commentFields.forEach(id => {
            const textarea = document.getElementById(id);
            if (textarea) textarea.value = '';
        });

        // Ensure default door and light fixture are present if not remembered
        if (doorsContainer && doorsContainer.children.length === 0) {
            appendNewDoorEntry({ identifier: 'Main Entry' }, true);
        }
        if (lightFixturesContainer && lightFixturesContainer.children.length === 0) {
            appendNewLightFixtureEntry({}, false);
        }

        const overallConditionSelect = document.getElementById('overallCondition');
        if (overallConditionSelect) overallConditionSelect.value = ''; // Always reset overall condition to N/A for new entry

        // Set default for asbestos to "No" for new rooms
        const defaultAsbestosRadio = roomForm.querySelector('input[name="asbestosInRoom"][value="No"]');
        if (defaultAsbestosRadio) {
            defaultAsbestosRadio.checked = true;
            defaultAsbestosRadio.classList.add('default-value-input'); // Add a class for default styling
        }

        refreshConditionalFormUI(roomForm);
        
        // Scroll to the top of the page to make filling a new form efficient.
        window.scrollTo(0, 0);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (eventArgument) {
            eventArgument.preventDefault();
            const targetViewId = this.id.replace('nav', '') + 'View';
            if (editingRoomIdInput.value && targetViewId !== 'AddRoomView' && !document.getElementById('AddRoomView').contains(eventArgument.target)) {
                if (!confirm("You have unsaved changes in the room editor. Are you sure you want to leave?")) {
                    return;
                }
                editingRoomIdInput.value = '';
                isResolvingAttemptedDataInput.value = 'false';
                cameFromDuplicateResolutionView = false; 
                resetRoomFormToDefault();
            }
            setActiveView(targetViewId);
        });
    });

    function setupConditionalInput(selectElement, otherInputElement) {
        if (selectElement && otherInputElement) {
            const update = () => {
                const shouldBeVisible = selectElement.value === 'Other';
                otherInputElement.style.display = shouldBeVisible ? 'block' : 'none';
                if (!shouldBeVisible) {
                    otherInputElement.value = '';
                    otherInputElement.classList.remove('remembered-input');
                }
            };
            selectElement.addEventListener('change', update);
            // Initial call to set correct display based on current value
            update();
        }
    }

    function initializeGeneralConditionalLogic(formElement) {
        if (!formElement) return;
        const generalConditionalMap = {
            'walls': 'wallsOther', 'ceilingType': 'ceilingTypeOther',
            'floorType': 'floorTypeOther', 'heatingCooling': 'heatingCoolingOther',
            'roomPurpose': 'roomPurposeOther'
        };
        for (const selectId in generalConditionalMap) {
            const selectEl = formElement.querySelector(`#${selectId}`);
            const otherEl = formElement.querySelector(`#${generalConditionalMap[selectId]}`);
            if (selectEl && otherEl) setupConditionalInput(selectEl, otherEl);
        }
    }

    function setupConditionalOtherField(controlCheckboxValue, otherTextInputId, groupName, parentElement = document) {
        const specificCheckbox = parentElement.querySelector(`input[name="${groupName}"][value="${controlCheckboxValue}"].other-checkbox`);
        const otherTextInput = parentElement.querySelector(`#${otherTextInputId}`);

        if (specificCheckbox && otherTextInput) {
            const updateVisibility = () => {
                const shouldBeVisible = specificCheckbox.checked;
                otherTextInput.style.display = shouldBeVisible ? (otherTextInput.classList.contains('inline-other') ? 'inline-block' : 'block') : 'none';
                if (!shouldBeVisible) otherTextInput.value = '';
            };
            specificCheckbox.addEventListener('change', updateVisibility);
            // Initial call to set correct display based on current value
            updateVisibility();
        }
    }

    function initializeFormConditionalLogic(formElement) {
        if (!formElement) return;
        initializeGeneralConditionalLogic(formElement);

        // Asbestos is now independent, so no conditional logic for it based on ceiling type.
        // const ceilingTypeSelect = formElement.querySelector('#ceilingType');
        // const dropCeilingOptionsDiv = formElement.querySelector('#dropCeilingOptions');
        // if (ceilingTypeSelect && dropCeilingOptionsDiv) {
        //     const updateCeilingOptions = () => {
        //         const show = ceilingTypeSelect.value === 'Drop Ceiling';
        //          dropCeilingOptionsDiv.style.display = show ? 'block' : 'none';
        //          if (!show) {
        //             formElement.querySelectorAll('input[name="ceilingAsbestos"]').forEach(radio => radio.checked = false);
        //          }
        //     }
        //     ceilingTypeSelect.addEventListener('change', updateCeilingOptions);
        //     updateCeilingOptions(); // Initial call
        // }

        const floorTypeSelect = formElement.querySelector('#floorType');
        const floorTileOptionsDiv = formElement.querySelector('#floorTileOptions');
        if (floorTypeSelect && floorTileOptionsDiv) {
            const updateFloorOptionsVisibility = () => {
                const show = floorTypeSelect.value === 'Tile';
                floorTileOptionsDiv.style.display = show ? 'block' : 'none';
                let floorTileSizeOtherEl = formElement.querySelector('#floorTileSizeOther');

                if (!show) {
                    formElement.querySelectorAll('input[name="floorTileSize"]').forEach(radio => radio.checked = false);
                    if (floorTileSizeOtherEl) {
                         floorTileSizeOtherEl.value = '';
                         floorTileSizeOtherEl.style.display = 'none';
                    }
                } else {
                    const floorTileSizeOtherInput = formElement.querySelector('#floorTileSizeOther');
                     if (floorTileSizeOtherInput) {
                         let selectedRadio = formElement.querySelector('input[name="floorTileSize"]:checked');
                         const showOtherInput = selectedRadio && selectedRadio.value === 'Other';
                         floorTileSizeOtherInput.style.display = showOtherInput ? 'block' : 'none';
                         if (!showOtherInput) floorTileSizeOtherInput.value = '';
                     }
                }
            };
            floorTypeSelect.addEventListener('change', updateFloorOptionsVisibility);
            updateFloorOptionsVisibility(); // Initial call

            const floorTileSizeRadios = formElement.querySelectorAll('input[name="floorTileSize"]');
            const floorTileSizeOtherInput = formElement.querySelector('#floorTileSizeOther');
            if (floorTileSizeRadios.length > 0 && floorTileSizeOtherInput) {
                const updateFloorTileSizeOtherTextVisibility = () => {
                    let selectedRadio = formElement.querySelector('input[name="floorTileSize"]:checked');
                    const showOtherInput = selectedRadio && selectedRadio.value === 'Other';
                    floorTileSizeOtherInput.style.display = showOtherInput ? 'block' : 'none';
                    if (!showOtherInput) floorTileSizeOtherInput.value = '';
                };
                floorTileSizeRadios.forEach(radio => radio.addEventListener('change', updateFloorTileSizeOtherTextVisibility));
                updateFloorTileSizeOtherTextVisibility(); // Initial call
            }
        }

        setupConditionalOtherField("Specialty Equipment", "furnitureSpecialtySpecifyText", "furniture", formElement);
        setupConditionalOtherField("Other", "furnitureOtherSpecifyText", "furniture", formElement);
        setupConditionalOtherField("Other", "technologyOtherSpecifyText", "technology", formElement);
        refreshConditionalFormUI(formElement);
    }

    function refreshConditionalFormUI(formElement) {
        if (!formElement) return;
        const generalConditionalMap = {
            'walls': 'wallsOther', 'ceilingType': 'ceilingTypeOther',
            'floorType': 'floorTypeOther', 'heatingCooling': 'heatingCoolingOther',
            'roomPurpose': 'roomPurposeOther'
        };
        for (const selectId in generalConditionalMap) {
            const selectEl = formElement.querySelector(`#${selectId}`);
            const otherEl = formElement.querySelector(`#${generalConditionalMap[selectId]}`);
            if (selectEl && otherEl) {
                const shouldBeVisible = selectEl.value === 'Other';
                otherEl.style.display = shouldBeVisible ? 'block' : 'none';
            }
        }

        // Asbestos is now independent, no conditional refresh needed based on ceiling type.
        // const ceilingTypeSelect = formElement.querySelector('#ceilingType');
        // const dropCeilingOptionsDiv = formElement.querySelector('#dropCeilingOptions');
        // if (ceilingTypeSelect && dropCeilingOptionsDiv) {
        //     const show = ceilingTypeSelect.value === 'Drop Ceiling';
        //     dropCeilingOptionsDiv.style.display = show ? 'block' : 'none';
        //     if (!show) {
        //         formElement.querySelectorAll('input[name="ceilingAsbestos"]').forEach(radio => radio.checked = false);
        //     }
        // }

        const floorTypeSelect = formElement.querySelector('#floorType');
        const floorTileOptionsDiv = formElement.querySelector('#floorTileOptions');
        if (floorTypeSelect && floorTileOptionsDiv) {
            const showFloorTileOptions = floorTypeSelect.value === 'Tile';
            floorTileOptionsDiv.style.display = showFloorTileOptions ? 'block' : 'none';
            let floorTileSizeOtherEl = formElement.querySelector('#floorTileSizeOther');
            if (!showFloorTileOptions) {
                formElement.querySelectorAll('input[name="floorTileSize"]').forEach(radio => radio.checked = false);
                if (floorTileSizeOtherEl) {
                    floorTileSizeOtherEl.style.display = 'none';
                }
            } else {
                const floorTileSizeOtherInput = formElement.querySelector('#floorTileSizeOther');
                if (floorTileSizeOtherInput) {
                    let selectedRadio = formElement.querySelector('input[name="floorTileSize"]:checked');
                    const showOtherInput = selectedRadio && selectedRadio.value === 'Other';
                    floorTileSizeOtherInput.style.display = showOtherInput ? 'block' : 'none';
                }
            }
        }

        const conditionalCheckboxFields = [
            { checkboxValue: "Specialty Equipment", textInputId: "furnitureSpecialtySpecifyText", groupName: "furniture" },
            { checkboxValue: "Other", textInputId: "furnitureOtherSpecifyText", groupName: "furniture" },
            { checkboxValue: "Other", textInputId: "technologyOtherSpecifyText", groupName: "technology" }
        ];
        conditionalCheckboxFields.forEach(field => {
            const specificCheckbox = formElement.querySelector(`input[name="${field.groupName}"][value="${field.checkboxValue}"].other-checkbox`);
            const otherTextInput = formElement.querySelector(`#${field.textInputId}`);
            if (specificCheckbox && otherTextInput) {
                const shouldBeVisible = specificCheckbox.checked;
                otherTextInput.style.display = shouldBeVisible ? (otherTextInput.classList.contains('inline-other') ? 'inline-block' : 'block') : 'none';
            }
        });
    }

    function appendNewDoorEntry(doorData = {}, isDefault = false) {
        if (!doorsContainer) return;
        const id = `doorInstance_${Date.now()}`;
        const div = document.createElement('div');
        div.classList.add('door-entry');
        div.id = id;

        const identifierValue = escapeHtml(doorData.identifier || '');
        const defaultClass = isDefault ? 'default-value-input' : '';

        div.innerHTML = `
            <button type="button" class="remove-door-btn" aria-label="Remove this door entry"><i class="fas fa-times"></i></button>
            <h4>Door Details</h4>
            <div class="input-group">
                <label for="doorIdentifier-${id}">Identifier/Location:</label>
                <input type="text" id="doorIdentifier-${id}" name="doorIdentifier" class="${defaultClass}" placeholder="e.g., Main Entry, Closet" value="${identifierValue}">
            </div>
            <div class="input-group">
                <label for="doorType-${id}">Type:</label>
                <select id="doorType-${id}" name="doorType">
                    <option value="Wood">Wood</option>
                    <option value="Metal">Metal</option>
                    <option value="Glass">Glass</option>
                    <option value="Other">Other</option>
                </select>
                <input type="text" id="doorTypeOther-${id}" name="doorTypeOther" class="conditional-other" placeholder="Specify other door type" style="display:none;" value="${escapeHtml(doorData.typeOther || '')}">
            </div>
            <div class="input-group">
                <label for="doorLockType-${id}">Lock Type:</label>
                <select id="doorLockType-${id}" name="doorLockType">
                    <option value="Key">Key</option>
                    <option value="Keypad">Keypad</option>
                    <option value="Card Reader">Card Reader</option>
                    <option value="None">None</option>
                    <option value="Other">Other</option>
                </select>
                <input type="text" id="doorLockTypeOther-${id}" name="doorLockTypeOther" class="conditional-other" placeholder="Specify other lock type" style="display:none;" value="${escapeHtml(doorData.lockTypeOther || '')}">
            </div>`;
            
        const identifierInput = div.querySelector(`#doorIdentifier-${id}`);
        if (isDefault) {
            identifierInput.addEventListener('focus', function() {
                if (this.classList.contains('default-value-input')) {
                    this.value = '';
                    this.classList.remove('default-value-input');
                }
            }, { once: true });
        }

        const doorTypeSelect = div.querySelector(`#doorType-${id}`);
        const doorTypeOtherInput = div.querySelector(`#doorTypeOther-${id}`);
        if(doorData.type) doorTypeSelect.value = doorData.type;
        setupConditionalInput(doorTypeSelect, doorTypeOtherInput);
        if (doorTypeSelect && doorTypeOtherInput) {
            const shouldShow = doorTypeSelect.value === 'Other';
            doorTypeOtherInput.style.display = shouldShow ? 'block' : 'none';
            if (shouldShow) doorTypeOtherInput.value = doorData.typeOther || ''; else doorTypeOtherInput.value = '';
        }

        const doorLockTypeSelect = div.querySelector(`#doorLockType-${id}`);
        const doorLockTypeOtherInput = div.querySelector(`#doorLockTypeOther-${id}`);
        if(doorData.lockType) doorLockTypeSelect.value = doorData.lockType;
        setupConditionalInput(doorLockTypeSelect, doorLockTypeOtherInput);
        if (doorLockTypeSelect && doorLockTypeOtherInput) {
            const shouldShow = doorLockTypeSelect.value === 'Other';
            doorLockTypeOtherInput.style.display = shouldShow ? 'block' : 'none';
            if (shouldShow) doorLockTypeOtherInput.value = doorData.lockTypeOther || ''; else doorLockTypeOtherInput.value = '';
        }

        doorsContainer.appendChild(div);
        div.querySelector('.remove-door-btn').addEventListener('click', () => div.remove());
    }

    if (addDoorBtn && doorsContainer) {
        addDoorBtn.addEventListener('click', function () {
            appendNewDoorEntry({}, false);
        });
    }

    function appendNewLightFixtureEntry(fixtureData = {}, isRememberedSource = false) {
        if (!lightFixturesContainer) return;
        const id = `lightFixture_${Date.now()}`;
        const div = document.createElement('div');
        div.classList.add('light-fixture-entry'); div.id = id;
        const typeValue = fixtureData.type || 'LED';
        const quantityValue = fixtureData.quantity || 1;
        const styleValue = fixtureData.style || 'Flat Panel';
        const typeOtherValue = fixtureData.typeOtherSpecify || '';
        const styleOtherValue = fixtureData.styleOtherSpecify || '';

        div.innerHTML = `
            <button type="button" class="remove-light-fixture-btn" aria-label="Remove this light fixture entry"><i class="fas fa-times"></i></button>
            <h4>Light Fixture</h4>
            <div class="input-group">
                <label for="lightType-${id}">Type:</label>
                <select id="lightType-${id}" name="lightFixtureType">
                    <option value="Fluorescent T5">Fluorescent T5</option>
                    <option value="Fluorescent T8">Fluorescent T8</option>
                    <option value="Fluorescent T12">Fluorescent T12</option>
                    <option value="Incandescent">Incandescent</option>
                    <option value="LED">LED</option><option value="Sodium">Sodium</option>
                    <option value="Metal Halide">Metal Halide</option><option value="Other">Other</option>
                </select>
                <input type="text" id="lightTypeOther-${id}" name="lightFixtureTypeOtherSpecify" class="light-fixture-other-specify conditional-other" placeholder="Specify other light type" value="${escapeHtml(typeOtherValue)}" style="display:none;">
            </div>
            <div class="input-group">
                <label for="lightQuantity-${id}">Quantity:</label>
                <input type="number" id="lightQuantity-${id}" name="lightFixtureQuantity" min="1" value="${quantityValue}" class="light-fixture-quantity" required>
            </div>
            <div class="input-group">
                <label for="lightStyle-${id}">Style:</label>
                <select id="lightStyle-${id}" name="lightFixtureStyle">
                    <option value="Parabolic with Bulbs">Parabolic w/ Bulbs</option><option value="Flat Panel">Flat Panel</option>
                    <option value="Other">Other</option>
                </select>
                <input type="text" id="lightStyleOther-${id}" name="lightFixtureStyleOtherSpecify" class="light-fixture-other-specify conditional-other" placeholder="Specify other light style" value="${escapeHtml(styleOtherValue)}" style="display:none;">
            </div>`;

        const lightTypeSelect = div.querySelector(`#lightType-${id}`);
        const lightTypeOtherInput = div.querySelector(`#lightTypeOther-${id}`);
        lightTypeSelect.value = typeValue;
        if (isRememberedSource && fixtureData.type) lightTypeSelect.classList.add('remembered-input');
        setupConditionalInput(lightTypeSelect, lightTypeOtherInput);
        if (lightTypeSelect.value === 'Other') {
            lightTypeOtherInput.style.display = 'block';
            if (isRememberedSource && fixtureData.typeOtherSpecify) lightTypeOtherInput.classList.add('remembered-input');
        }

        const lightStyleSelect = div.querySelector(`#lightStyle-${id}`);
        const lightStyleOtherInput = div.querySelector(`#lightStyleOther-${id}`);
        lightStyleSelect.value = styleValue;
        if (isRememberedSource && fixtureData.style) lightStyleSelect.classList.add('remembered-input');
        setupConditionalInput(lightStyleSelect, lightStyleOtherInput);
         if (lightStyleSelect.value === 'Other') {
            lightStyleOtherInput.style.display = 'block';
            if (isRememberedSource && fixtureData.styleOtherSpecify) lightStyleOtherInput.classList.add('remembered-input');
        }

        const quantityInputEl = div.querySelector(`#lightQuantity-${id}`);
        if (isRememberedSource && fixtureData.quantity) {
            quantityInputEl.classList.add('remembered-input');
            // Explicitly dispatch change event for the quantity input to ensure UI updates
            quantityInputEl.dispatchEvent(new Event('change')); 
        }

        lightFixturesContainer.appendChild(div);
        div.querySelector('.remove-light-fixture-btn').addEventListener('click', () => div.remove());
    }


    if (addLightFixtureBtn) {
        addLightFixtureBtn.addEventListener('click', () => {
            appendNewLightFixtureEntry({}, false);
        });
    }

    otherFixturesCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const value = this.value;
            let countInput = null;
            let otherDetailsContainer = null;
            if (value === "Other") {
                otherDetailsContainer = this.closest('.fixture-item-group').querySelector('.other-details-container');
                if (otherDetailsContainer) {
                    otherDetailsContainer.style.display = this.checked ? 'flex' : 'none';
                    countInput = otherDetailsContainer.querySelector('.fixture-count-input');
                    const specifyInput = otherDetailsContainer.querySelector('input[type="text"].conditional-other');
                    if (!this.checked && specifyInput) specifyInput.value = '';
                }
            } else {
                const parentGroup = this.closest('.fixture-item-group');
                if (parentGroup) countInput = parentGroup.querySelector('.fixture-count-input');
                if (countInput) countInput.style.display = this.checked ? 'inline-block' : 'none';
            }
            if (countInput) {
                if (this.checked && !countInput.value) countInput.value = '1';
                else if (!this.checked) countInput.value = '';
            }
        });
        // Initial call to set correct display based on current value (for remembered inputs)
        checkbox.dispatchEvent(new Event('change'));
    });

    function getStoredRooms() { return allRoomsCache; }
    function findRoom(bName, rId) { return (!bName||!rId)?null:getStoredRooms().find(r=>r.buildingName?.toLowerCase()===bName.toLowerCase()&&r.roomIdentifier?.toLowerCase()===rId.toLowerCase());}
    function findRoomById(roomId) { return getStoredRooms().find(r => r.id === roomId); }

    function clearFormAndDynamicElements(form) {
        if (!form) return;
        form.reset();
        form.querySelectorAll('.remembered-input, .default-value-input').forEach(el => {
            el.classList.remove('remembered-input');
            el.classList.remove('default-value-input');
        });
        if (doorsContainer) doorsContainer.innerHTML = '';
        if (lightFixturesContainer) lightFixturesContainer.innerHTML = '';
        otherFixturesCheckboxes.forEach(cb => { cb.checked = false; cb.dispatchEvent(new Event('change')); });
        const otherFixturesSpecifyText = document.getElementById('otherFixturesSpecifyText');
        if (otherFixturesSpecifyText) {
            otherFixturesSpecifyText.value = '';
            const otherDetailsContainer = otherFixturesSpecifyText.closest('.other-details-container');
            if (otherDetailsContainer) otherDetailsContainer.style.display = 'none';
        }
        const floorTileOptionsDiv = form.querySelector('#floorTileOptions');
        if (floorTileOptionsDiv) floorTileOptionsDiv.style.display = 'none';
        const floorTileSizeOtherInput = form.querySelector('#floorTileSizeOther');
        if (floorTileSizeOtherInput) {
            floorTileSizeOtherInput.value = '';
            floorTileSizeOtherInput.style.display = 'none';
        }
        form.querySelectorAll('input[name="floorTileSize"]').forEach(radio => radio.checked = false);
        // Asbestos radio buttons are now independent, so clear them directly
        form.querySelectorAll('input[name="asbestosInRoom"]').forEach(radio => radio.checked = false);

        ['ceilingConditionComment', 'wallsConditionComment', 'furnitureConditionComment', 'floorConditionComment', 'overallConditionComment'].forEach(id => {
            const textarea = document.getElementById(id);
            if (textarea) textarea.value = '';
        });
        const overallConditionSelect = document.getElementById('overallCondition');
        if (overallConditionSelect) overallConditionSelect.value = '';
        if (feedbackMessage) { feedbackMessage.textContent = ''; feedbackMessage.className = 'feedback'; }
    }

    function conditionStringToValue(conditionString) {
        if (!conditionString || typeof conditionString !== 'string') return null;
        const match = conditionString.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : null;
    }

    function conditionValueToString(value) {
        if (value === null || typeof value !== 'number') return '';
        const roundedValue = Math.round(value);
        switch (roundedValue) {
            case 1: return "1 - Excellent";
            case 2: return "2 - Good";
            case 3: return "3 - Fair";
            case 4: return "4 - Poor";
            case 5: return "5 - Needs Replacement";
            default:
                if (roundedValue < 1) return "1 - Excellent";
                if (roundedValue > 5) return "5 - Needs Replacement";
                return "";
        }
    }

    function getCurrentRoomDataFromForm() {
        const formData = new FormData(roomForm);
        const buildingNameVal = buildingNameSelect.value;
        const roomIdentifierVal = roomForm.querySelector('#roomIdentifier').value.trim();

        const newRoomData = { buildingName: buildingNameVal, roomIdentifier: roomIdentifierVal };

        newRoomData.roomPurpose = formData.get('roomPurpose');
        newRoomData.roomPurposeOther = (newRoomData.roomPurpose === 'Other') ? formData.get('roomPurposeOther').trim() : '';
        newRoomData.roomMakeup = {
            walls: formData.get('walls'),
            wallsOther: formData.get('walls') === 'Other' ? formData.get('wallsOther').trim() : '',
            ceiling: {
                type: formData.get('ceilingType'),
                typeOther: formData.get('ceilingType') === 'Other' ? formData.get('ceilingTypeOther').trim() : ''
            },
            floor: {
                type: formData.get('floorType'),
                typeOther: formData.get('floorType') === 'Other' ? formData.get('floorTypeOther').trim() : ''
            }
        };
        // Asbestos is now an independent field, not tied to ceiling type
        newRoomData.asbestosInRoom = formData.get('asbestosInRoom');
        
        if (newRoomData.roomMakeup.floor.type === 'Tile') {
            newRoomData.roomMakeup.floor.tileSize = formData.get('floorTileSize');
            if (formData.get('floorTileSize') === 'Other') {
                newRoomData.roomMakeup.floor.tileSizeOther = formData.get('floorTileSizeOther').trim();
            }
        }

        let overallConditionFromForm = formData.get('overallCondition');
        let overallConditionComment = formData.get('overallConditionComment').trim();
        if (!overallConditionFromForm || overallConditionFromForm === "") {
            const conditionsToAverage = [
                conditionStringToValue(formData.get('ceilingCondition')),
                conditionStringToValue(formData.get('wallsCondition')),
                conditionStringToValue(formData.get('furnitureCondition')),
                conditionStringToValue(formData.get('floorCondition'))
            ].filter(val => val !== null);
            if (conditionsToAverage.length > 0) {
                const sum = conditionsToAverage.reduce((acc, curr) => acc + curr, 0);
                const averageValue = sum / conditionsToAverage.length;
                overallConditionFromForm = conditionValueToString(averageValue);
            } else {
                overallConditionFromForm = '';
            }
        }
        newRoomData.conditionValues = {
            ceiling: formData.get('ceilingCondition'),
            ceilingComment: formData.get('ceilingConditionComment').trim(),
            walls: formData.get('wallsCondition'),
            wallsComment: formData.get('wallsConditionComment').trim(),
            furniture: formData.get('furnitureCondition'),
            furnitureComment: formData.get('furnitureConditionComment').trim(),
            floor: formData.get('floorCondition'),
            floorComment: formData.get('floorConditionComment').trim(),
            overall: overallConditionFromForm,
            overallComment: overallConditionComment
        };

        newRoomData.lightFixtures = [];
        if (lightFixturesContainer) {
            lightFixturesContainer.querySelectorAll('.light-fixture-entry').forEach(entry => {
                const typeSel = entry.querySelector('select[name="lightFixtureType"]');
                const quantityInput = entry.querySelector('input[name="lightFixtureQuantity"]');
                const styleSel = entry.querySelector('select[name="lightFixtureStyle"]');
                const typeOtherIn = entry.querySelector('input[name="lightFixtureTypeOtherSpecify"]');
                const styleOtherIn = entry.querySelector('input[name="lightFixtureStyleOtherSpecify"]');
                if (typeSel && quantityInput && styleSel) {
                    newRoomData.lightFixtures.push({
                        type: typeSel.value,
                        quantity: parseInt(quantityInput.value, 10) || 1,
                        style: styleSel.value,
                        typeOtherSpecify: (typeSel.value === 'Other' && typeOtherIn) ? typeOtherIn.value.trim() : '',
                        styleOtherSpecify: (styleSel.value === 'Other' && styleOtherIn) ? styleOtherIn.value.trim() : ''
                    });
                }
            });
        }

        newRoomData.otherFixtures = [];
        document.querySelectorAll('.fixture-present-checkbox:checked').forEach(cb => {
            const type = cb.value;
            let count = 1;
            let specify = '';
            if (type === "Other") {
                const countInput = document.getElementById('otherFixturesOtherCount');
                const specifyInput = document.getElementById('otherFixturesSpecifyText');
                if (countInput && countInput.value) {
                    count = parseInt(countInput.value, 10);
                    if (isNaN(count) || count < 1) count = 1;
                }
                if (specifyInput) specify = specifyInput.value.trim();
                if (specify) newRoomData.otherFixtures.push({ type, count, specify });
            } else {
                const idSuffix = type.replace(/[^a-zA-Z0-9]/g, '');
                const countInput = document.getElementById(`otherFixture${idSuffix}Count`);
                if (countInput && countInput.value) {
                    count = parseInt(countInput.value, 10);
                    if (isNaN(count) || count < 1) count = 1;
                }
                newRoomData.otherFixtures.push({ type, count });
            }
        });

        const getCbVal = name => Array.from(roomForm.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
        newRoomData.furniture = getCbVal('furniture');
        newRoomData.furnitureSpecialtySpecify = newRoomData.furniture.includes('Specialty Equipment') ? (formData.get('furnitureSpecialtySpecify') || '').trim() : '';
        newRoomData.furnitureOtherSpecify = newRoomData.furniture.includes('Other') ? (formData.get('furnitureOtherSpecify') || '').trim() : '';

        newRoomData.heatingCooling = formData.get('heatingCooling');
        newRoomData.heatingCoolingOther = formData.get('heatingCooling') === 'Other' ? (formData.get('heatingCoolingOther') || '').trim() : '';

        newRoomData.safety = {
            smokeDetectors: formData.get('smokeDetectors') ? parseInt(formData.get('smokeDetectors'), 10) : 0,
            maxOccupancy: formData.get('maxOccupancy') ? parseInt(formData.get('maxOccupancy'), 10) : 0
        };

        newRoomData.doors = [];
        if (doorsContainer) {
            doorsContainer.querySelectorAll('.door-entry').forEach(entry => {
                const doorIdInput = entry.querySelector('input[name="doorIdentifier"]');
                const doorIdVal = doorIdInput.value.trim();
                const doorTypeSel = entry.querySelector('select[name="doorType"]');
                const lockTypeSel = entry.querySelector('select[name="doorLockType"]');
                const doorTypeOtherIn = entry.querySelector('input[name="doorTypeOther"]');
                const lockTypeOtherIn = entry.querySelector('input[name="doorLockTypeOther"]');
                
                if (doorIdInput.classList.contains('default-value-input') && doorIdVal === 'Main Entry') {
                     if(doorTypeSel.value === 'Wood' && lockTypeSel.value === 'Key' && !doorTypeOtherIn.value && !lockTypeOtherIn.value) {
                        return;
                     }
                }
                 
                if (doorIdVal || doorTypeSel.value !== 'Wood' || lockTypeSel.value !== 'Key' ||
                    (doorTypeSel.value === 'Other' && doorTypeOtherIn?.value.trim() !== '') ||
                    (lockTypeSel.value === 'Other' && lockTypeOtherIn?.value.trim() !== '')) {
                    newRoomData.doors.push({
                        identifier: doorIdVal, type: doorTypeSel.value, lockType: lockTypeSel.value,
                        typeOther: (doorTypeSel.value === 'Other' && doorTypeOtherIn) ? doorTypeOtherIn.value.trim() : '',
                        lockTypeOther: (lockTypeSel.value === 'Other' && lockTypeOtherIn) ? lockTypeOtherIn.value.trim() : ''
                    });
                }
            });
        }
        newRoomData.technology = getCbVal('technology');
        newRoomData.technologyOtherSpecify = newRoomData.technology.includes('Other') ? (formData.get('technologyOtherSpecify') || '').trim() : '';

        return newRoomData;
    }

    function validateConditionalFields() {
        const otherSelects = [
            { selectId: 'roomPurpose', otherId: 'roomPurposeOther', name: 'Room Purpose' },
            { selectId: 'walls', otherId: 'wallsOther', name: 'Walls Type' },
            { selectId: 'ceilingType', otherId: 'ceilingTypeOther', name: 'Ceiling Type' },
            { selectId: 'floorType', otherId: 'floorTypeOther', name: 'Floor Type' },
            { selectId: 'heatingCooling', otherId: 'heatingCoolingOther', name: 'Heating/Cooling' }
        ];
        for (const item of otherSelects) {
            const select = document.getElementById(item.selectId);
            const other = document.getElementById(item.otherId);
            if (select && other && select.value === 'Other' && !other.value.trim()) {
                other.focus();
                return `When selecting "Other" for ${item.name}, you must provide a specific description.`;
            }
        }
        const otherCheckboxes = [
            { checkboxValue: 'Specialty Equipment', textInputId: 'furnitureSpecialtySpecifyText', groupName: 'furniture', name: 'Specialty Equipment' },
            { checkboxValue: 'Other', textInputId: 'furnitureOtherSpecifyText', groupName: 'furniture', name: 'Other Furniture' },
            { checkboxValue: 'Other', textInputId: 'technologyOtherSpecifyText', groupName: 'technology', name: 'Other Technology' },
            { checkboxValue: 'Other', textInputId: 'otherFixturesSpecifyText', groupName: 'otherFixturePresent', name: 'Other Fixture' }
        ];
        for (const item of otherCheckboxes) {
            const checkbox = document.querySelector(`input[name="${item.groupName}"][value="${item.checkboxValue}"]`);
            const textInput = document.getElementById(item.textInputId);
            if (checkbox && textInput && checkbox.checked && !textInput.value.trim()) {
                textInput.focus();
                return `When checking "${item.name}", you must provide a specific description.`;
            }
        }
        const lightFixtureEntries = lightFixturesContainer.querySelectorAll('.light-fixture-entry');
        for (const entry of lightFixtureEntries) {
            const typeSelect = entry.querySelector('select[name="lightFixtureType"]');
            const typeOther = entry.querySelector('input[name="lightFixtureTypeOtherSpecify"]');
            const styleSelect = entry.querySelector('select[name="lightFixtureStyle"]');
            const styleOther = entry.querySelector('input[name="lightFixtureStyleOtherSpecify"]');
            if (typeSelect.value === 'Other' && !typeOther.value.trim()) {
                typeOther.focus();
                return 'For light fixtures with type "Other", you must specify the type.';
            }
            if (styleSelect.value === 'Other' && !styleOther.value.trim()) {
                styleOther.focus();
                return 'For light fixtures with style "Other", you must specify the style.';
            }
        }
        return null;
    }
    
    if (roomForm) {
        roomForm.addEventListener('submit', function (event) {
            event.preventDefault();
            console.log("[RoomFormSubmit] Form submission initiated.");

            const currentAddRoomView = document.getElementById('AddRoomView');
            if (currentAddRoomView) currentAddRoomView.scrollTop = 0;

            if (feedbackMessage) {
                feedbackMessage.textContent = '';
                feedbackMessage.className = 'feedback';
            }

            const buildingNameVal = buildingNameSelect.value;
            const roomIdentifierVal = roomForm.querySelector('#roomIdentifier').value.trim();
            if (!buildingNameVal || !roomIdentifierVal) {
                feedbackMessage.textContent = 'Building Name and Room Identifier are required.';
                feedbackMessage.className = 'feedback error';
                return;
            }
            const validationError = validateConditionalFields();
            if (validationError) {
                feedbackMessage.textContent = validationError;
                feedbackMessage.className = 'feedback error';
                return;
            }

            const currentRoomId = editingRoomIdInput.value;
            const newRoomDataFromForm = getCurrentRoomDataFromForm();
            const existingRoomWithSameIdentifiers = findRoom(newRoomDataFromForm.buildingName, newRoomDataFromForm.roomIdentifier);

            if (existingRoomWithSameIdentifiers && existingRoomWithSameIdentifiers.id !== currentRoomId) {
                feedbackMessage.textContent = 'Conflict found. Redirecting to resolve duplicate room...';
                feedbackMessage.className = 'feedback info';
                setTimeout(() => {
                    presentDuplicateRoomResolution(newRoomDataFromForm, existingRoomWithSameIdentifiers);
                }, 1000);
                return;
            }

            const isOffline = !navigator.onLine;
            const isEditing = !!currentRoomId;

            if (isOffline) {
                feedbackMessage.textContent = isEditing ? 'Offline: Room updated locally. Will sync when online.' : 'Offline: Room saved locally. Will sync when online.';
            } else {
                feedbackMessage.textContent = isEditing ? 'Room information updated successfully!' : 'Room information saved successfully!';
            }
            feedbackMessage.className = 'feedback success';
            
            // For a new room, reset the form immediately for quick entry of the next room.
            // For an edit, we will navigate away shortly.
            if (!isEditing) {
                saveLastInputValues(); // Save current form state before resetting for next entry
                resetRoomFormToDefault();
            }

            addRoomToFirestore(newRoomDataFromForm, currentRoomId)
                .then(() => {
                    console.log(`[RoomFormSubmit] Firestore operation successful.`);
                    setLastUsedBuilding(newRoomDataFromForm.buildingName);
                    
                    if (isEditing) {
                        setTimeout(() => {
                            resetRoomFormToDefault(); // Clear form data
                            // Navigate back to the correct view
                            if (cameFromFilterView) {
                                navigateToFilterView();
                            } else {
                                setActiveView('ViewRoomsView');
                            }
                        }, 1500);
                    }
                })
                .catch((error) => {
                    console.error('[RoomFormSubmit] CRITICAL ERROR during room save process:', error);
                    feedbackMessage.textContent = 'A critical error occurred. The entry may not have been saved correctly.';
                    feedbackMessage.className = 'feedback error';
                });
        });
    }

    if (copyCurrentRoomJsonBtn) {
        copyCurrentRoomJsonBtn.addEventListener('click', function() {
            if (feedbackMessage) {
                feedbackMessage.textContent = '';
                feedbackMessage.className = 'feedback';
            }
            try {
                const roomData = getCurrentRoomDataFromForm(false);
                const jsonString = JSON.stringify(roomData, null, 4);
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(jsonString).then(() => {
                        if (feedbackMessage) {
                            feedbackMessage.textContent = 'Room data (JSON) copied to clipboard!';
                            feedbackMessage.className = 'feedback success';
                        } else {
                            alert('Room data (JSON) copied to clipboard!');
                        }
                    }).catch(err => {
                        console.error('Async clipboard copy failed:', err);
                        fallbackCopyTextToClipboard(jsonString);
                    });
                } else {
                    fallbackCopyTextToClipboard(jsonString);
                }
            } catch (error) {
                console.error('Error preparing JSON for copying:', error);
                if (feedbackMessage) {
                    feedbackMessage.textContent = 'Error copying room data. See console.';
                    feedbackMessage.className = 'feedback error';
                } else {
                    alert('Error copying room data. See console.');
                }
            }
        });
    }

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            const msg = successful ? 'Room data (JSON) copied to clipboard! (fallback)' : 'Fallback copy failed.';
            if (feedbackMessage) {
                feedbackMessage.textContent = msg;
                feedbackMessage.className = successful ? 'feedback success' : 'feedback error';
            } else {
                alert(msg);
            }
        } catch (err) {
            console.error('Fallback copy execCommand failed:', err);
            if (feedbackMessage) {
                feedbackMessage.textContent = 'Fallback copy failed. See console.';
                feedbackMessage.className = 'feedback error';
            } else {
                alert('Fallback copy failed. See console.');
            }
        }
        document.body.removeChild(textArea);
    }

    function handleNavigateBack() {
        if (confirm("Are you sure you want to go back? Any unsaved changes will be lost.")) {
            resetRoomFormToDefault(); // Clear form data
            if (cameFromFilterView) {
                navigateToFilterView();
            } else if (cameFromDuplicateResolutionView) {
                setActiveView('duplicateResolutionView', { preserveScroll: true });
            } else {
                setActiveView('ViewRoomsView');
            }
        }
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', handleNavigateBack);
    }

    if (backToFilterBtn) {
        backToFilterBtn.addEventListener('click', handleNavigateBack);
    }


    async function addRoomToFirestore(roomData, existingId = null) {
        roomData.savedAt = new Date().toISOString();
        const user = auth.currentUser;
        if(user) {
            roomData.lastModifiedBy = user.email; // Stamp the user's email
        }
        
        const buildings = getStoredBuildings();
        if (roomData.buildingName && !buildings.includes(roomData.buildingName)) {
            const newBuildingList = [...buildings, roomData.buildingName];
            await storeBuildings(newBuildingList);
        }

        if (existingId) {
            const roomRef = doc(db, ROOMS_COLLECTION, existingId);
            await setDoc(roomRef, roomData, { merge: true }); // Use merge to avoid overwriting fields not in form
        } else {
            await addDoc(collection(db, ROOMS_COLLECTION), roomData);
        }
    }


    function populateFormWithData(room, isEditingExisting = true) {
        if (!room) {
            if(feedbackMessage) {
                feedbackMessage.textContent = "Error: Could not find room data to populate form.";
                feedbackMessage.className = "feedback error";
            }
            return;
        }

        clearFormAndDynamicElements(roomForm);

        if (isEditingExisting && room.id) {
            editingRoomIdInput.value = room.id;
            isResolvingAttemptedDataInput.value = 'false';
            if(addEditRoomTitle) addEditRoomTitle.innerHTML = `<i class="fas fa-edit"></i> Edit Room: ${escapeHtml(room.buildingName)} - ${escapeHtml(room.roomIdentifier)}`;
            if(saveRoomBtn) saveRoomBtn.innerHTML = '<i class="fas fa-save"></i> Update Room Information';
            if(cancelEditBtn) cancelEditBtn.style.display = 'inline-flex';
        } else {
            editingRoomIdInput.value = '';
            isResolvingAttemptedDataInput.value = 'true';
            if(addEditRoomTitle) addEditRoomTitle.innerHTML = `<i class="fas fa-pencil-alt"></i> Edit Data for New Room`;
            if(saveRoomBtn) saveRoomBtn.innerHTML = '<i class="fas fa-save"></i> Save Room Information';
            if(cancelEditBtn) cancelEditBtn.style.display = 'inline-flex';
        }

        // Show/hide the "Back to Filter" button
        if (backToFilterBtn) {
            backToFilterBtn.style.display = cameFromFilterView ? 'inline-flex' : 'none';
        }

        populateBuildingDropdowns(room.buildingName);
        
        const roomIdentifierEl = roomForm.querySelector('#roomIdentifier');
        if(roomIdentifierEl) roomIdentifierEl.value = room.roomIdentifier || '';

        const roomPurposeSelectEl = roomForm.querySelector('#roomPurpose');
        const roomPurposeOtherInputEl = roomForm.querySelector('#roomPurposeOther');
        if (roomPurposeSelectEl) {
            roomPurposeSelectEl.value = room.roomPurpose || 'Lab';
            roomPurposeSelectEl.dispatchEvent(new Event('change')); // Trigger change
        }
        if (roomPurposeOtherInputEl && room.roomPurpose === 'Other') {
            roomPurposeOtherInputEl.value = room.roomPurposeOther || '';
        }

         if (room.roomMakeup) {
            const makeup = room.roomMakeup;
            const wallsEl = roomForm.querySelector('#walls');
            if(wallsEl) {
                wallsEl.value = makeup.walls || 'Drywall';
                wallsEl.dispatchEvent(new Event('change')); // Trigger change
            }
            if (makeup.walls === 'Other') {
                const wallsOtherEl = roomForm.querySelector('#wallsOther');
                if(wallsOtherEl) wallsOtherEl.value = makeup.wallsOther || '';
            }
            if (makeup.ceiling) {
                const ceilingTypeEl = roomForm.querySelector('#ceilingType');
                if(ceilingTypeEl) {
                    ceilingTypeEl.value = makeup.ceiling.type || 'Drop Ceiling';
                    ceilingTypeEl.dispatchEvent(new Event('change')); // Trigger change
                }
                if (makeup.ceiling.type === 'Other') {
                    const ceilingTypeOtherEl = roomForm.querySelector('#ceilingTypeOther');
                    if(ceilingTypeOtherEl) ceilingTypeOtherEl.value = makeup.ceiling.typeOther || '';
                }
                // Asbestos is now independent, remove conditional check for ceiling type
                // if (makeup.ceiling.type === 'Drop Ceiling' && makeup.ceiling.asbestosInCeiling) {
                //     const ceilingAsbestosInput = roomForm.querySelector(`input[name="ceilingAsbestos"][value="${makeup.ceiling.asbestosInCeiling}"]`);
                //     if (ceilingAsbestosInput) {
                //         ceilingAsbestosInput.checked = true;
                //         ceilingAsbestosInput.dispatchEvent(new Event('change')); // Trigger change
                //     } else {
                //         const defaultCeilingAsbestos = roomForm.querySelector(`input[name="ceilingAsbestos"][value="No"]`);
                //         if (defaultCeilingAsbestos) {
                //             defaultCeilingAsbestos.checked = true;
                //             defaultCeilingAsbestos.dispatchEvent(new Event('change'));
                //         }
                //     }
                // }
            }
            if (makeup.floor) {
                const floorTypeEl = roomForm.querySelector('#floorType');
                if(floorTypeEl) {
                    floorTypeEl.value = makeup.floor.type || 'Carpet';
                    floorTypeEl.dispatchEvent(new Event('change')); // Trigger change
                }
                if (makeup.floor.type === 'Other') {
                    const floorTypeOtherEl = roomForm.querySelector('#floorTypeOther');
                    if(floorTypeOtherEl) floorTypeOtherEl.value = makeup.floor.typeOther || '';
                }
                if (makeup.floor.type === 'Tile') {
                    let targetFloorTileSize = null;
                    let targetFloorTileSizeOther = null;
                    if (makeup.floor.tileSize) {
                        targetFloorTileSize = makeup.floor.tileSize;
                        if (makeup.floor.tileSize === 'Other' && makeup.floor.tileSizeOther) {
                            targetFloorTileSizeOther = makeup.floor.tileSizeOther;
                        }
                    }
                    if (targetFloorTileSize) {
                        const floorTileSizeRadio = roomForm.querySelector(`input[name="floorTileSize"][value="${targetFloorTileSize}"]`);
                        if (floorTileSizeRadio) {
                            floorTileSizeRadio.checked = true;
                            floorTileSizeRadio.dispatchEvent(new Event('change')); // Trigger change
                        } else {
                             const defaultFloorTileSize = roomForm.querySelector(`input[name="floorTileSize"][value="12x12"]`);
                             if(defaultFloorTileSize) {
                                defaultFloorTileSize.checked = true;
                                defaultFloorTileSize.dispatchEvent(new Event('change'));
                             }
                        }
                        if (targetFloorTileSize === 'Other' && targetFloorTileSizeOther) {
                            const floorTileSizeOtherEl = roomForm.querySelector('#floorTileSizeOther');
                            if (floorTileSizeOtherEl) floorTileSizeOtherEl.value = targetFloorTileSizeOther;
                        }
                    } else {
                        const defaultFloorTileSize = roomForm.querySelector(`input[name="floorTileSize"][value="12x12"]`);
                        if(defaultFloorTileSize) {
                            defaultFloorTileSize.checked = true;
                            defaultFloorTileSize.dispatchEvent(new Event('change'));
                        }
                    }
                }
            }
        }
        // Populate independent asbestos field
        if (room.asbestosInRoom) {
            const asbestosRadio = roomForm.querySelector(`input[name="asbestosInRoom"][value="${room.asbestosInRoom}"]`);
            if (asbestosRadio) {
                asbestosRadio.checked = true;
                asbestosRadio.dispatchEvent(new Event('change'));
            }
        } else {
            // Default to 'No' if not present in data
            const defaultAsbestosRadio = roomForm.querySelector(`input[name="asbestosInRoom"][value="No"]`);
            if (defaultAsbestosRadio) {
                defaultAsbestosRadio.checked = true;
                defaultAsbestosRadio.dispatchEvent(new Event('change'));
            }
        }


        if (room.conditionValues) {
            const cv = room.conditionValues;
            const ceilingConditionEl = roomForm.querySelector('#ceilingCondition');
            if(ceilingConditionEl) ceilingConditionEl.value = cv.ceiling || '1 - Excellent';
            const ceilingConditionCommentEl = roomForm.querySelector('#ceilingConditionComment');
            if(ceilingConditionCommentEl) ceilingConditionCommentEl.value = cv.ceilingComment || '';
            const wallsConditionEl = roomForm.querySelector('#wallsCondition');
            if(wallsConditionEl) wallsConditionEl.value = cv.walls || '1 - Excellent';
            const wallsConditionCommentEl = roomForm.querySelector('#wallsConditionComment');
            if(wallsConditionCommentEl) wallsConditionCommentEl.value = cv.wallsComment || '';
            const furnitureConditionEl = roomForm.querySelector('#furnitureCondition');
            if(furnitureConditionEl) furnitureConditionEl.value = cv.furniture || '1 - Excellent';
            const furnitureConditionCommentEl = roomForm.querySelector('#furnitureConditionComment');
            if(furnitureConditionCommentEl) furnitureConditionCommentEl.value = cv.furnitureComment || '';
            const floorConditionEl = roomForm.querySelector('#floorCondition');
            if(floorConditionEl) floorConditionEl.value = cv.floor || '1 - Excellent';
            const floorConditionCommentEl = roomForm.querySelector('#floorConditionComment');
            if(floorConditionCommentEl) floorConditionCommentEl.value = cv.floorComment || '';
            const overallConditionEl = roomForm.querySelector('#overallCondition');
            if(overallConditionEl) overallConditionEl.value = cv.overall || '';
            const overallConditionCommentEl = roomForm.querySelector('#overallConditionComment');
            if(overallConditionCommentEl) overallConditionCommentEl.value = cv.overallComment || '';
        }
        
        if (room.safety) {
            const smokeDetectorsEl = roomForm.querySelector('#smokeDetectors');
            if(smokeDetectorsEl) smokeDetectorsEl.value = room.safety.smokeDetectors || '';
            const maxOccupancyEl = roomForm.querySelector('#maxOccupancy');
            if(maxOccupancyEl) maxOccupancyEl.value = room.safety.maxOccupancy || '';
        }

        if (lightFixturesContainer) lightFixturesContainer.innerHTML = '';
        if (room.lightFixtures && room.lightFixtures.length > 0) {
            room.lightFixtures.forEach(fixture => appendNewLightFixtureEntry(fixture, false));
        } else {
            appendNewLightFixtureEntry({}, false);
        }
        otherFixturesCheckboxes.forEach(cb => cb.checked = false);
        if (room.otherFixtures && room.otherFixtures.length > 0) {
            room.otherFixtures.forEach(fixture => {
                const checkbox = roomForm.querySelector(`.fixture-present-checkbox[value="${fixture.type}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    const idSuffix = fixture.type.replace(/[^a-zA-Z0-9]/g, '');
                    let countInputId = `otherFixture${idSuffix}Count`;
                    if (fixture.type === "Other") {
                        countInputId = 'otherFixturesOtherCount';
                        const specifyInput = document.getElementById('otherFixturesSpecifyText');
                        if (specifyInput) specifyInput.value = fixture.specify || '';
                    }
                    const countInput = document.getElementById(countInputId);
                    if (countInput) countInput.value = fixture.count || '1';
                }
            });
        }
        otherFixturesCheckboxes.forEach(cb => cb.dispatchEvent(new Event('change')));
        roomForm.querySelectorAll('input[name="furniture"]').forEach(cb => cb.checked = false);
        if (room.furniture && room.furniture.length > 0) {
            room.furniture.forEach(fItem => {
                const cb = roomForm.querySelector(`input[name="furniture"][value="${fItem}"]`);
                if (cb) cb.checked = true;
            });
            if (room.furniture.includes('Specialty Equipment')) {
                const specialtyText = roomForm.querySelector('#furnitureSpecialtySpecifyText');
                if(specialtyText) specialtyText.value = room.furnitureSpecialtySpecify || '';
            }
            if (room.furniture.includes('Other')) {
                const otherText = roomForm.querySelector('#furnitureOtherSpecifyText');
                if(otherText) otherText.value = room.furnitureOtherSpecify || '';
            }
        }
        const heatingCoolingEl = roomForm.querySelector('#heatingCooling');
        if(heatingCoolingEl) {
            heatingCoolingEl.value = room.heatingCooling || 'Forced Air';
            heatingCoolingEl.dispatchEvent(new Event('change')); // Trigger change
        }
        if (room.heatingCooling === 'Other') {
            const heatingCoolingOtherEl = roomForm.querySelector('#heatingCoolingOther');
            if(heatingCoolingOtherEl) heatingCoolingOtherEl.value = room.heatingCoolingOther || '';
        }
        if (doorsContainer) doorsContainer.innerHTML = '';
        if (room.doors && room.doors.length > 0) {
            room.doors.forEach(door => appendNewDoorEntry(door));
        } else {
            appendNewDoorEntry({ identifier: 'Main Entry' }, true);
        }
        roomForm.querySelectorAll('input[name="technology"]').forEach(cb => cb.checked = false);
        if (room.technology && room.technology.length > 0) {
            room.technology.forEach(tItem => {
                const cb = roomForm.querySelector(`input[name="technology"][value="${tItem}"]`);
                if (cb) cb.checked = true;
            });
            if (room.technologyOtherSpecify) {
                const techOtherText = roomForm.querySelector('#technologyOtherSpecifyText');
                if(techOtherText) techOtherText.value = room.technologyOtherSpecify || '';
            }
        }

        refreshConditionalFormUI(roomForm);
        setActiveView('AddRoomView', { preserveScroll: true });
        roomForm.querySelector('#roomIdentifier').focus();
    }
    
    function populateFormForEditing(roomId) {
        const room = findRoomById(roomId);
        populateFormWithData(room, true);
    }

    function renderRoomList(roomsToRender = null, targetContainer = roomListContainer, isFilterResults = false) {
        if (!targetContainer) return;
        targetContainer.innerHTML = '';
        const rooms = roomsToRender === null ? getStoredRooms() : roomsToRender;

        if (rooms.length === 0) {
            if (isFilterResults) {
                targetContainer.innerHTML = '<p class="empty-list-message">No rooms match your filter criteria.</p>';
            } else {
                targetContainer.innerHTML = '<p class="empty-list-message">No rooms saved yet. Go to "Add Room" or "Data Management" to get started!</p>';
            }
            return;
        }

        if (isFilterResults) {
            rooms.sort((a,b) => {
                const buildingCompare = (a.buildingName || '').toLowerCase().localeCompare((b.buildingName || '').toLowerCase());
                if (buildingCompare !== 0) return buildingCompare;
                return (a.roomIdentifier || '').toLowerCase().localeCompare((b.roomIdentifier || '').toLowerCase());
            }).forEach(room => {
                targetContainer.appendChild(createRoomCard(room, true));
            });
        } else {
            const roomsByBuilding = rooms.reduce((acc, room) => {
                const building = room.buildingName || 'Unspecified Building';
                if (!acc[building]) acc[building] = [];
                acc[building].push(room);
                return acc;
            }, {});
            const sortedBuildingNames = Object.keys(roomsByBuilding).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
            sortedBuildingNames.forEach(buildingNameVal => {
                const buildingGroupDiv = document.createElement('div');
                buildingGroupDiv.classList.add('building-group');
                const buildingHeader = document.createElement('div');
                buildingHeader.classList.add('building-header');
                buildingHeader.setAttribute('role', 'button');
                buildingHeader.setAttribute('tabindex', '0');
                buildingHeader.setAttribute('aria-expanded', 'false');
                buildingHeader.setAttribute('aria-controls', `building-rooms-${buildingNameVal.replace(/\s+/g, '-')}`);
                buildingHeader.innerHTML = `
                    <span>${escapeHtml(buildingNameVal)} (${roomsByBuilding[buildingNameVal].length} room${roomsByBuilding[buildingNameVal].length === 1 ? '' : 's'})</span>
                    <i class="fas fa-chevron-right toggle-icon"></i>`;
                const roomsContainerElement = document.createElement('div');
                roomsContainerElement.classList.add('rooms-in-building-container');
                roomsContainerElement.id = `building-rooms-${buildingNameVal.replace(/\s+/g, '-')}`;
                roomsByBuilding[buildingNameVal].sort((a,b) => (a.roomIdentifier || '').toLowerCase().localeCompare((b.roomIdentifier || '').toLowerCase()))
                    .forEach(room => {
                    roomsContainerElement.appendChild(createRoomCard(room, false));
                });
                const toggleExpansion = () => {
                    const isExpanded = buildingHeader.classList.toggle('expanded');
                    buildingHeader.setAttribute('aria-expanded', isExpanded.toString());
                };
                buildingHeader.addEventListener('click', toggleExpansion);
                buildingHeader.addEventListener('keydown', (eventArgument) => {
                    if (eventArgument.key === 'Enter' || eventArgument.key === ' ') { eventArgument.preventDefault(); toggleExpansion(); }
                });
                buildingGroupDiv.appendChild(buildingHeader);
                buildingGroupDiv.appendChild(roomsContainerElement);
                targetContainer.appendChild(buildingGroupDiv);
            });
        }
    }

    function createRoomCard(room, isFilterResultCard = false) {
        const card = document.createElement('div');
        card.classList.add('room-card'); card.dataset.roomId = room.id;
        card.setAttribute('aria-label', `Room ${escapeHtml(room.roomIdentifier || 'N/A')} in ${escapeHtml(room.buildingName || 'N/A')}`);

        let purposeText = escapeHtml(room.roomPurpose) || 'N/A';
        if (room.roomPurpose === 'Other' && room.roomPurposeOther) {
            purposeText = `${escapeHtml(room.roomPurpose)} (${escapeHtml(room.roomPurposeOther)})`;
        } else if (!room.roomPurpose) {
            purposeText = 'N/A';
        }
        const buildingNamePrefix = isFilterResultCard ? `<strong>${escapeHtml(room.buildingName || 'N/A')}</strong> - ` : '';
        card.innerHTML = `
            <h3>${buildingNamePrefix}<i class="fas fa-door-closed"></i> ${escapeHtml(room.roomIdentifier)}</h3>
            <p><small>Purpose: ${purposeText}</small></p>
            <p><small>Overall Condition: ${escapeHtml(room.conditionValues?.overall || 'N/A')}</small></p>
            <div class="actions">
                <button type="button" class="action-button secondary-button view-details-btn" data-room-id="${room.id}" aria-label="View details for room ${escapeHtml(room.roomIdentifier)}"><i class="fas fa-eye"></i> View</button>
                <button type="button" class="action-button warning-button edit-room-btn" data-room-id="${room.id}" aria-label="Edit room ${escapeHtml(room.roomIdentifier)}"><i class="fas fa-edit"></i> Edit</button>
                <button type="button" class="action-button danger-button delete-room-btn" data-room-id="${room.id}" aria-label="Delete room ${escapeHtml(room.roomIdentifier)}"><i class="fas fa-trash-alt"></i> Delete</button>
            </div>`;
        return card;
    }

    document.querySelector('.content-area').addEventListener('click', async function(event) {
        const targetButton = event.target.closest('button.action-button');
        if (!targetButton) return;
        const roomId = targetButton.dataset.roomId;

        if (targetButton.classList.contains('edit-room-btn')) {
            // Determine if the edit came from the filter view or the main list view
            cameFromFilterView = !!event.target.closest('#filterResultsContainer');
            populateFormForEditing(roomId);
        } 
        else if (targetButton.classList.contains('view-details-btn')) {
            focusedButtonBeforeModal = targetButton;
            displayRoomDetails(roomId);
        } else if (targetButton.classList.contains('delete-room-btn')) {
            const room = findRoomById(roomId);
            if (confirm(`Are you sure you want to delete room: ${escapeHtml(room?.roomIdentifier)} in ${escapeHtml(room?.buildingName)}? This action cannot be undone.`)) {
                await deleteRoom(roomId);
            }
        }
    });

    function escapeHtml(unsafe) {return unsafe==null?'':String(unsafe).replace(/[&<"'>]/g,m=>({'&':'&amp;','<':'&lt;','"':'&quot;',"'":'&#039;','>':'&gt;'})[m]);}

    function formatRoomDataForPreview(room) {
        if (!room) return '<p>N/A</p>';
        let html = `<p><strong>Building:</strong> ${escapeHtml(room.buildingName)}</p><p><strong>Room ID:</strong> ${escapeHtml(room.roomIdentifier)}</p>`;
        let purposeDisplay = escapeHtml(room.roomPurpose) || 'N/A';
        if (room.roomPurpose === 'Other' && room.roomPurposeOther) {
            purposeDisplay = `${escapeHtml(room.roomPurpose)} (${escapeHtml(room.roomPurposeOther)})`;
        } else if (!room.roomPurpose) purposeDisplay = 'N/A';
        html += `<p><strong>Purpose:</strong> ${purposeDisplay}</p>`;
        html += `<p><strong>Overall Condition:</strong> ${escapeHtml(room.conditionValues?.overall || 'N/A')}</p>`;
        if(room.safety) {
            html += `<p><strong>Smoke Detectors:</strong> ${escapeHtml(room.safety.smokeDetectors ?? 'N/A')}</p>`;
            html += `<p><strong>Max Occupancy:</strong> ${escapeHtml(room.safety.maxOccupancy ?? 'N/A')}</p>`;
        }
        // Always display asbestos status
        html += `<p><strong>Asbestos in Room:</strong> ${escapeHtml(room.asbestosInRoom || 'Unknown')}</p>`;

        if (room.savedAt) {
            const date = new Date(room.savedAt);
            if (!isNaN(date)) {
                html += `<p><small>Last Saved: ${date.toLocaleString()}</small></p>`;
            }
        }
        return html;
    }

    function displayRoomDetails(roomId) {
        if(!roomDetailModal || !roomDetailContent) {
            console.error("Room detail modal elements not found!");
            return;
        }
        const room = findRoomById(roomId);
        if (!room) {
            roomDetailContent.innerHTML = '<p>Error: Room not found.</p>';
            roomDetailModal.style.display = 'block';
            if(closeModalBtn) closeModalBtn.focus();
            return;
        }
        
        const savedDate = new Date(room.savedAt);
        const savedAtDisplay = !isNaN(savedDate) ? savedDate.toLocaleString() : 'N/A';

        let html = `<h2>${escapeHtml(room.buildingName)} - ${escapeHtml(room.roomIdentifier)}</h2>`;
        html += `<p><strong>Saved At:</strong> ${savedAtDisplay}</p>`;
        
        let purposeDisplay = escapeHtml(room.roomPurpose) || 'N/A';
        if (room.roomPurpose === 'Other' && room.roomPurposeOther) purposeDisplay = `${escapeHtml(room.roomPurpose)} (${escapeHtml(room.roomPurposeOther)})`;
        else if (!room.roomPurpose) purposeDisplay = 'N/A';
        html += `<h3><i class="fas fa-id-card"></i> Identification</h3><p><strong>Purpose:</strong> ${purposeDisplay}</p>`;

        html += `<h3><i class="fas fa-ruler-combined"></i> Structural Components</h3>`;
        if (room.roomMakeup) {
            html += `<p><strong>Walls:</strong> ${escapeHtml(room.roomMakeup.walls)} ${room.roomMakeup.wallsOther ? `(${escapeHtml(room.roomMakeup.wallsOther)})` : ''}</p>`;
            html += `<p><strong>Walls Condition:</strong> ${escapeHtml(room.conditionValues?.walls) || 'N/A'}</p>`;
            if(room.conditionValues?.wallsComment) html += `<p class="condition-comment">${escapeHtml(room.conditionValues.wallsComment)}</p>`;
            
            let floorText = `<strong>Floor Type:</strong> ${escapeHtml(room.roomMakeup.floor.type)}`;
            if (room.roomMakeup.floor.type === 'Other' && room.roomMakeup.floor.typeOther) { floorText += ` (${escapeHtml(room.roomMakeup.floor.typeOther)})`; }
            html += `<p>${floorText}</p>`;
            if (room.roomMakeup.floor.type === 'Tile' && room.roomMakeup.floor.tileSize) {
                let tileSizeText = `<strong>Floor Tile Size:</strong> ${escapeHtml(room.roomMakeup.floor.tileSize)}`;
                if (room.roomMakeup.floor.tileSize === 'Other' && room.roomMakeup.floor.tileSizeOther) { tileSizeText += ` (${escapeHtml(room.roomMakeup.floor.tileSizeOther)})`; }
                html += `<p>${tileSizeText}</p>`;
            }
            html += `<p><strong>Floor Condition:</strong> ${escapeHtml(room.conditionValues?.floor) || 'N/A'}</p>`;
            if(room.conditionValues?.floorComment) html += `<p class="condition-comment">${escapeHtml(room.conditionValues.floorComment)}</p>`;
            
            html += `<p><strong>Ceiling Type:</strong> ${escapeHtml(room.roomMakeup.ceiling.type)} ${room.roomMakeup.ceiling.typeOther ? `(${escapeHtml(room.roomMakeup.ceiling.typeOther)})` : ''}</p>`;
            html += `<p><strong>Ceiling Condition:</strong> ${escapeHtml(room.conditionValues?.ceiling) || 'N/A'}</p>`;
            if(room.conditionValues?.ceilingComment) html += `<p class="condition-comment">${escapeHtml(room.conditionValues.ceilingComment)}</p>`;
        }
        if (room.doors?.length > 0) {
            html += `<p><strong>Doors:</strong></p><ul>${room.doors.map(d => `<li>ID: ${escapeHtml(d.identifier||'N/A')}, Type: ${escapeHtml(d.type)}${d.typeOther?` (${escapeHtml(d.typeOther)})`:''}, Lock: ${escapeHtml(d.lockType)}${d.lockTypeOther?` (${escapeHtml(d.lockTypeOther)})`:''}</li>`).join('')}</ul>`;
        } else html += `<p><strong>Doors:</strong> N/A</p>`;

        html += `<h3><i class="fas fa-cogs"></i> Systems & Utilities</h3>`;
        if (room.lightFixtures && room.lightFixtures.length > 0) {
            html += `<p><strong>Light Fixtures:</strong></p><ul>`;
            room.lightFixtures.forEach(lf => {
                let entry = `<li>${escapeHtml(lf.quantity)} x ${escapeHtml(lf.type)}`;
                if (lf.type === 'Other' && lf.typeOtherSpecify) entry += ` (${escapeHtml(lf.typeOtherSpecify)})`;
                entry += ` - Style: ${escapeHtml(lf.style)}`;
                if (lf.style === 'Other' && lf.styleOtherSpecify) entry += ` (${escapeHtml(lf.styleOtherSpecify)})`;
                entry += `</li>`;
            });
            html += `</ul>`;
        } else html += `<p><strong>Light Fixtures:</strong> N/A</p>`;
        if (room.otherFixtures && room.otherFixtures.length > 0) {
            html += `<p><strong>Other Fixtures:</strong></p><ul>`;
            room.otherFixtures.forEach(of => {
                let entry = `<li>${escapeHtml(of.count)} x ${escapeHtml(of.type)}`;
                if (of.type === 'Other' && of.specify) entry += ` (${escapeHtml(of.specify)})`;
                entry += `</li>`;
            });
            html += `</ul>`;
        } else html += `<p><strong>Other Fixtures:</strong> N/A</p>`;
        html += `<p><strong>Heating/Cooling:</strong> ${escapeHtml(room.heatingCooling) || 'N/A'} ${room.heatingCoolingOther ? `(${escapeHtml(room.heatingCoolingOther)})` : ''}</p>`;
        if (room.technology && room.technology.length > 0) {
            html += `<p><strong>Technology:</strong></p><ul>${room.technology.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`;
            if (room.technologyOtherSpecify) html += `<p><em>Other:</em> ${escapeHtml(room.technologyOtherSpecify)}</p>`;
        } else html += '<p><strong>Technology:</strong> N/A</p>';

        html += `<h3><i class="fas fa-couch"></i> Furnishings & Equipment</h3>`;
        if (room.furniture && room.furniture.length > 0) {
            html += `<p><strong>Furniture Types:</strong></p><ul>${room.furniture.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>`;
            if (room.furnitureSpecialtySpecify) html += `<p><em>Specialty:</em> ${escapeHtml(room.furnitureSpecialtySpecify)}</p>`;
            if (room.furnitureOtherSpecify) html += `<p><em>Other:</em> ${escapeHtml(room.furnitureOtherSpecify)}</p>`;
        } else html += '<p><strong>Furniture Types:</strong> N/A</p>';
        html += `<p><strong>Furniture Condition:</strong> ${escapeHtml(room.conditionValues?.furniture) || 'N/A'}</p>`;
        if(room.conditionValues?.furnitureComment) html += `<p class="condition-comment">${escapeHtml(room.conditionValues.furnitureComment)}</p>`;
        
        html += `<h3><i class="fas fa-shield-alt"></i> Safety & Compliance</h3>`;
        if (room.safety) {
            html += `<p><strong>Smoke Detectors:</strong> ${escapeHtml(room.safety.smokeDetectors ?? 'N/A')}</p>`;
            html += `<p><strong>Max Occupancy:</strong> ${escapeHtml(room.safety.maxOccupancy ?? 'N/A')}</p>`;
        }
        // Always display asbestos status, now from top-level `asbestosInRoom`
        html += `<p><strong>Asbestos in Room:</strong> ${escapeHtml(room.asbestosInRoom || 'Unknown')}</p>`;
        
        html += `<h3><i class="fas fa-clipboard-check"></i> Overall Room Condition</h3>`;
        html += `<p><strong>Overall:</strong> ${escapeHtml(room.conditionValues?.overall) || 'N/A (Not Set/Calculated)'}</p>`;
        if(room.conditionValues?.overallComment) html += `<p class="condition-comment">${escapeHtml(room.conditionValues.overallComment)}</p>`;

        roomDetailContent.innerHTML = html;
        roomDetailModal.style.display = 'block';
        if(closeModalBtn) closeModalBtn.focus();
    }

  async function deleteRoom(roomId, fromConflictResolution = false) {
    console.log("[Delete Room] Attempting to delete with ID:", roomId); // DEBUG LOG 1

    // Validate the roomId before proceeding
    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
        console.error("[Delete Room] Aborting: Invalid or empty roomId provided.");
        const feedback = fromConflictResolution ? duplicateResolutionFeedback : feedbackMessage;
        if (feedback) {
            feedback.textContent = "Error: Cannot delete room due to an invalid ID.";
            feedback.className = 'feedback error';
        }
        return;
    }

    const room = findRoomById(roomId);
    try {
        const roomRef = doc(db, ROOMS_COLLECTION, roomId);
        console.log("[Delete Room] Generated document reference path:", roomRef.path); // DEBUG LOG 2

        await deleteDoc(roomRef);
        console.log("[Delete Room] Successfully deleted document from Firestore.");

        if (fromConflictResolution) {
            if (duplicateResolutionFeedback) {
                duplicateResolutionFeedback.textContent = `Room "${escapeHtml(room?.buildingName)} - ${escapeHtml(room?.roomIdentifier)}" deleted successfully.`;
                duplicateResolutionFeedback.className = 'feedback success';
            }
            setTimeout(() => {
                setActiveView('ViewRoomsView');
            }, 1500);

        } else {
            if (roomDetailModal?.style.display === 'block') closeModal();
            const firstBuildingHeader = roomListContainer?.querySelector('.building-header');
            if (firstBuildingHeader) {
                firstBuildingHeader.focus();
            } else {
                navLinks[0]?.focus();
            }
        }
    } catch (error) {
        // Log the specific error from Firestore
        console.error("Firestore: Error deleting room", error);
        const feedback = fromConflictResolution ? duplicateResolutionFeedback : feedbackMessage;
        if (feedback) {
            feedback.textContent = "Error deleting room from the database. See console for details.";
            feedback.className = 'feedback error';
        }
    }
}

    function closeModal() {
        if(roomDetailModal) roomDetailModal.style.display = 'none';
        if (focusedButtonBeforeModal) {
            focusedButtonBeforeModal.focus();
            focusedButtonBeforeModal = null;
        } else {
            (roomListContainer?.querySelector('.building-header:first-child') ||
             filterResultsContainer?.querySelector('.room-card .view-details-btn') ||
             roomListContainer ||
             navLinks[0])?.focus();
        }
    }

    if(closeModalBtn) {
        closeModalBtn.onclick = closeModal;
        closeModalBtn.onkeydown = eventArgument => { if (eventArgument.key==='Enter'||eventArgument.key===' ') {eventArgument.preventDefault();closeModal();}};
    }
    
    function presentDuplicateRoomResolution(attemptedData, existingRoom) {
        currentAttemptedSaveData = attemptedData;
        currentExistingRoomForSaveConflict = existingRoom;

        if (attemptedDataPreview) attemptedDataPreview.innerHTML = formatRoomDataForPreview(attemptedData);
        const existingDataPreviewElem = document.querySelector('#duplicateResolutionView #existingDataPreview');
        if (existingDataPreviewElem) existingDataPreviewElem.innerHTML = formatRoomDataForPreview(existingRoom);

        if(duplicateResolutionFeedback) {
            duplicateResolutionFeedback.textContent = '';
            duplicateResolutionFeedback.className = 'feedback';
        }
        setActiveView('duplicateResolutionView');
    }

    if (editAttemptedBtn) {
        editAttemptedBtn.addEventListener('click', () => {
            if (currentAttemptedSaveData) {
                cameFromDuplicateResolutionView = true;
                populateFormWithData(currentAttemptedSaveData, false);
            }
        });
    }
    if (discardAttemptedBtn) {
        discardAttemptedBtn.addEventListener('click', () => {
            currentAttemptedSaveData = null;
            currentExistingRoomForSaveConflict = null;
            cameFromDuplicateResolutionView = false;
            setActiveView('ViewRoomsView');
            if (feedbackMessage) {
                feedbackMessage.textContent = 'Discarded unsaved data.';
                feedbackMessage.className = 'feedback info';
            }
        });
    }
    if (editExistingConflictBtn) {
        editExistingConflictBtn.addEventListener('click', () => {
            if (currentExistingRoomForSaveConflict) {
                cameFromDuplicateResolutionView = true;
                populateFormForEditing(currentExistingRoomForSaveConflict.id);
            }
        });
    }

    if (deleteExistingConflictBtn) {
        deleteExistingConflictBtn.addEventListener('click', () => { 
            if (currentExistingRoomForSaveConflict && currentAttemptedSaveData) {
                if (confirm(`Are you sure you want to DELETE the existing room and REPLACE it with your new data? This action cannot be undone.`)) {
                    
                    if (duplicateResolutionFeedback) {
                        const isOffline = !navigator.onLine;
                        duplicateResolutionFeedback.textContent = isOffline 
                            ? 'Replacement queued successfully. Will sync when online.' 
                            : 'Successfully replaced room with new data.';
                        duplicateResolutionFeedback.className = 'feedback success';
                    }
                    
                    setTimeout(() => {
                        setActiveView('ViewRoomsView');
                        resetRoomFormToDefault();
                    }, 1500);

                    addRoomToFirestore(currentAttemptedSaveData, currentExistingRoomForSaveConflict.id)
                        .then(() => {
                            console.log("Background replacement of room succeeded.");
                            currentAttemptedSaveData = null;
                            currentExistingRoomForSaveConflict = null;
                            cameFromDuplicateResolutionView = false;
                        })
                        .catch(error => {
                            console.error("CRITICAL: Background delete-and-replace operation failed:", error);
                        });
                }
            }
        });
    }
    
    if (cancelDuplicateResolutionBtn) {
        cancelDuplicateResolutionBtn.addEventListener('click', () => {
            currentAttemptedSaveData = null;
            currentExistingRoomForSaveConflict = null;
            cameFromDuplicateResolutionView = false; 
            setActiveView('ViewRoomsView');
        });
    }
    
    function displayFullJsonForExport() {
        if (!jsonDisplayArea) return;
        const rooms = getStoredRooms();
        // When exporting, if the old `asbestosInCeiling` exists, migrate it to `asbestosInRoom`
        const dataToExport = rooms.map(({ id, ...rest }) => {
            const roomData = { ...rest };
            if (roomData.roomMakeup?.ceiling?.asbestosInCeiling && !roomData.asbestosInRoom) {
                roomData.asbestosInRoom = roomData.roomMakeup.ceiling.asbestosInCeiling;
                // Optionally delete the old field if you want to clean up the export
                // delete roomData.roomMakeup.ceiling.asbestosInCeiling; 
            }
            return roomData;
        });
        jsonDisplayArea.value = dataToExport.length > 0 ? JSON.stringify(dataToExport, null, 4) : 'No data to display.';
        if (exportFeedback) {exportFeedback.className = 'feedback'; exportFeedback.textContent = '';}
    }

    if (addBuildingBtn) {
        addBuildingBtn.addEventListener('click', async () => {
            if (buildingManagementFeedback) { buildingManagementFeedback.textContent = ''; buildingManagementFeedback.className = 'feedback'; }
            const newName = newBuildingNameInput.value.trim();
            if (!newName) {
                buildingManagementFeedback.textContent = 'Please enter a name for the new building.';
                buildingManagementFeedback.className = 'feedback error'; return;
            }
            const buildings = getStoredBuildings();
            if (buildings.some(b => b.toLowerCase() === newName.toLowerCase())) {
                buildingManagementFeedback.textContent = `Building "${escapeHtml(newName)}" already exists.`;
                buildingManagementFeedback.className = 'feedback error'; return;
            }
            try {
                const newBuildingList = [...buildings, newName];
                await storeBuildings(newBuildingList);
                newBuildingNameInput.value = '';
                buildingManagementFeedback.textContent = `Building "${escapeHtml(newName)}" added successfully.`;
                buildingManagementFeedback.className = 'feedback success';
            } catch (error) {
                buildingManagementFeedback.textContent = 'An unexpected error occurred.';
                buildingManagementFeedback.className = 'feedback error';
            }
        });
    }

    if (renameBuildingBtn) {
        renameBuildingBtn.addEventListener('click', async () => {
            if (buildingManagementFeedback) { buildingManagementFeedback.textContent = ''; buildingManagementFeedback.className = 'feedback'; }
            const oldName = renameOldBuildingNameSelect.value;
            const newName = renameNewBuildingNameInput.value.trim();
            if (!oldName || !newName) {
                buildingManagementFeedback.textContent = 'Please select a building to rename and provide a new name.';
                buildingManagementFeedback.className = 'feedback error'; return;
            }
            if (oldName.toLowerCase() === newName.toLowerCase()) {
                buildingManagementFeedback.textContent = 'New name is the same. No changes made.';
                buildingManagementFeedback.className = 'feedback info'; return;
            }
            let buildings = getStoredBuildings();
            if (buildings.some(b => b.toLowerCase() === newName.toLowerCase())) {
                buildingManagementFeedback.textContent = `A building named "${escapeHtml(newName)}" already exists.`;
                buildingManagementFeedback.className = 'feedback error'; return;
            }

            if (confirm(`Are you sure you want to rename "${escapeHtml(oldName)}" to "${escapeHtml(newName)}"? This will update all associated rooms.`)) {
                try {
                    const buildingIndex = buildings.findIndex(b => b === oldName);
                    if (buildingIndex > -1) {
                        buildings[buildingIndex] = newName;
                        await storeBuildings(buildings);
                    }
                    
                    const roomsToUpdateQuery = query(collection(db, ROOMS_COLLECTION), where("buildingName", "==", oldName));
                    const querySnapshot = await getDocs(roomsToUpdateQuery);
                    
                    if (querySnapshot.empty) {
                        buildingManagementFeedback.textContent = `Building renamed, but no rooms were assigned to "${escapeHtml(oldName)}".`;
                        buildingManagementFeedback.className = 'feedback success';
                        return;
                    }

                    const batch = writeBatch(db);
                    querySnapshot.forEach(docSnap => {
                        const roomRef = doc(db, ROOMS_COLLECTION, docSnap.id);
                        batch.update(roomRef, { 
                            buildingName: newName,
                            savedAt: new Date().toISOString()
                        });
                    });
                    
                    await batch.commit();

                    if (getLastUsedBuilding() === oldName) setLastUsedBuilding(newName);
                    renameOldBuildingNameSelect.value = '';
                    renameNewBuildingNameInput.value = '';
                    buildingManagementFeedback.textContent = `Building renamed to "${escapeHtml(newName)}". ${querySnapshot.size} room(s) updated.`;
                    buildingManagementFeedback.className = 'feedback success';
                } catch (error) {
                    console.error("Firestore: Error renaming building", error);
                    buildingManagementFeedback.textContent = 'An unexpected error occurred during rename.';
                    buildingManagementFeedback.className = 'feedback error';
                }
            }
        });
    }

    // NEW: Delete Building Logic
    if (deleteBuildingBtn) {
        deleteBuildingBtn.addEventListener('click', async () => {
            if (buildingManagementFeedback) { buildingManagementFeedback.textContent = ''; buildingManagementFeedback.className = 'feedback'; }
            const buildingToDelete = deleteBuildingNameSelect.value;

            if (!buildingToDelete) {
                buildingManagementFeedback.textContent = 'Please select a building to delete.';
                buildingManagementFeedback.className = 'feedback error';
                return;
            }

            // Check if there are any rooms associated with this building
            const roomsInBuildingQuery = query(collection(db, ROOMS_COLLECTION), where("buildingName", "==", buildingToDelete));
            const querySnapshot = await getDocs(roomsInBuildingQuery);

            if (!querySnapshot.empty) {
                buildingManagementFeedback.textContent = `Cannot delete "${escapeHtml(buildingToDelete)}". It still contains ${querySnapshot.size} room(s). Please reassign or delete all rooms in this building first.`;
                buildingManagementFeedback.className = 'feedback error';
                return;
            }

            if (confirm(`Are you sure you want to permanently delete the building "${escapeHtml(buildingToDelete)}"? This action cannot be undone.`)) {
                try {
                    let buildings = getStoredBuildings();
                    const updatedBuildings = buildings.filter(b => b !== buildingToDelete);
                    await storeBuildings(updatedBuildings);
                    
                    deleteBuildingNameSelect.value = ''; // Clear selection
                    buildingManagementFeedback.textContent = `Building "${escapeHtml(buildingToDelete)}" deleted successfully.`;
                    buildingManagementFeedback.className = 'feedback success';

                    // If the deleted building was the last used, clear that setting
                    if (getLastUsedBuilding() === buildingToDelete) {
                        setLastUsedBuilding('');
                    }
                } catch (error) {
                    console.error("Firestore: Error deleting building", error);
                    buildingManagementFeedback.textContent = 'An unexpected error occurred during building deletion.';
                    buildingManagementFeedback.className = 'feedback error';
                }
            }
        });
    }


    if (massUpdateBuildingNameBtn) {
        massUpdateBuildingNameBtn.addEventListener('click', async () => {
            if (massUpdateFeedback) { massUpdateFeedback.textContent = ''; massUpdateFeedback.className = 'feedback'; }
            const oldName = massUpdateOldBuildingNameSelect.value;
            const newName = massUpdateNewBuildingNameInput.value.trim();

            if (!oldName || !newName) {
                 massUpdateFeedback.textContent = 'Please select a building to reassign from and provide a new building name.';
                 massUpdateFeedback.className = 'feedback error'; return;
            }
             if (oldName === newName) {
                 massUpdateFeedback.textContent = 'New building name is the same. No changes made.';
                 massUpdateFeedback.className = 'feedback info'; return;
             }

             let buildings = getStoredBuildings();
             if (!buildings.includes(newName)) {
                 if (!confirm(`Building "${escapeHtml(newName)}" does not exist. Add it and reassign rooms?`)) {
                     massUpdateFeedback.textContent = 'Update cancelled.';
                     massUpdateFeedback.className = 'feedback info'; return;
                 }
                 await storeBuildings([...buildings, newName]);
             }
             
            const rooms = getStoredRooms();
            const roomsToMove = rooms.filter(r => r.buildingName === oldName);
            if (roomsToMove.length === 0) {
                 massUpdateFeedback.textContent = `No rooms found in building "${escapeHtml(oldName)}".`;
                 massUpdateFeedback.className = 'feedback info'; return;
            }
            for (const room of roomsToMove) {
                 if (findRoom(newName, room.roomIdentifier)) {
                     massUpdateFeedback.textContent = `Error: Reassigning rooms would create a duplicate for room "${escapeHtml(room.roomIdentifier)}" in building "${escapeHtml(newName)}". Operation cancelled.`;
                     massUpdateFeedback.className = 'feedback error'; return;
                 }
            }
            
            if (!confirm(`Reassign ${roomsToMove.length} room(s) from "${escapeHtml(oldName)}" to "${escapeHtml(newName)}"?`)) {
                 massUpdateFeedback.textContent = 'Mass update cancelled.';
                 massUpdateFeedback.className = 'feedback info'; return;
            }
            
            try {
                const batch = writeBatch(db);
                roomsToMove.forEach(room => {
                    const roomRef = doc(db, ROOMS_COLLECTION, room.id);
                    batch.update(roomRef, {
                        buildingName: newName,
                        savedAt: new Date().toISOString()
                    });
                });
                await batch.commit();

                massUpdateFeedback.textContent = `Successfully reassigned ${roomsToMove.length} room(s).`;
                massUpdateFeedback.className = 'feedback success';
                massUpdateOldBuildingNameSelect.value = '';
                massUpdateNewBuildingNameInput.value = '';
            } catch (error) {
                console.error("Firestore: Mass update failed", error);
                massUpdateFeedback.textContent = 'An unexpected error occurred during mass update.';
                massUpdateFeedback.className = 'feedback error';
            }
        });
    }

    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', async function() {
             if (!jsonDisplayArea || !exportFeedback) return;
            const jsonData = jsonDisplayArea.value;
            if (jsonData === 'No data to display.' || jsonData.trim() === '') {
                exportFeedback.textContent = 'No data to export.';
                exportFeedback.className = 'feedback error';
                return;
            }
            try {
                const filename = `room_data_export_${new Date().toISOString().slice(0,10)}.json`;
                if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem) {
                    const { Filesystem, Directory, Encoding } = window.Capacitor.Plugins;
                    await Filesystem.writeFile({
                        path: filename, data: jsonData, directory: Directory.Documents, encoding: Encoding.UTF8,
                    });
                     exportFeedback.textContent = `Data exported to ${filename} in Documents.`;
                     exportFeedback.className = 'feedback success';
                } else {
                    const blob = new Blob([jsonData], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                    exportFeedback.textContent = 'Data export started for web.';
                    exportFeedback.className = 'feedback success';
                }
            } catch (error) {
                console.error('Export error:', error);
                exportFeedback.textContent = `Export failed: ${error.message || 'Unknown error'}`;
                exportFeedback.className = 'feedback error';
            }
        });
    }

    // --- NEW: CSV Export Logic ---
    if (exportAllCsvBtn) {
        exportAllCsvBtn.addEventListener('click', async function() {
            if (!exportFeedback) return;
            const rooms = getStoredRooms();
            if (rooms.length === 0) {
                exportFeedback.textContent = 'No data to export.';
                exportFeedback.className = 'feedback error';
                return;
            }

            try {
                const csvData = convertToCSV(rooms);
                const filename = `room_data_export_${new Date().toISOString().slice(0,10)}.csv`;

                if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem) {
                    const { Filesystem, Directory, Encoding } = window.Capacitor.Plugins;
                    await Filesystem.writeFile({
                        path: filename,
                        data: csvData,
                        directory: Directory.Documents,
                        encoding: Encoding.UTF8,
                    });
                    exportFeedback.textContent = `Data exported to ${filename} in Documents.`;
                    exportFeedback.className = 'feedback success';
                } else {
                    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    exportFeedback.textContent = 'CSV data export started for web.';
                    exportFeedback.className = 'feedback success';
                }
            } catch (error) {
                console.error('CSV Export error:', error);
                exportFeedback.textContent = `CSV Export failed: ${error.message || 'Unknown error'}`;
                exportFeedback.className = 'feedback error';
            }
        });
    }

    function convertToCSV(data) {
        const headers = [
            'id', 'buildingName', 'roomIdentifier', 'roomPurpose', 'roomPurposeOther',
            'walls', 'wallsOther', 'ceilingType', 'ceilingTypeOther', 'asbestosInRoom', // Changed from asbestosInCeiling
            'floorType', 'floorTypeOther', 'tileSize', 'tileSizeOther',
            'ceilingCondition', 'ceilingComment', 'wallsCondition', 'wallsComment',
            'furnitureCondition', 'furnitureComment', 'floorCondition', 'floorComment',
            'overallCondition', 'overallComment', 'lightFixtures_JSON', 'otherFixtures_JSON',
            'furniture_JSON', 'furnitureSpecialtySpecify', 'furnitureOtherSpecify',
            'heatingCooling', 'heatingCoolingOther', 'smokeDetectors', 'maxOccupancy',
            'doors_JSON', 'technology_JSON', 'technologyOtherSpecify',
            'lastModifiedBy', 'savedAt'
        ];

        const escapeCSV = (str) => {
            if (str === null || str === undefined) return '';
            const string = String(str);
            if (string.includes('"') || string.includes(',') || string.includes('\n')) {
                return `"${string.replace(/"/g, '""')}"`;
            }
            return string;
        };
        
        const rows = data.map(room => {
            const row = {
                id: room.id || '',
                buildingName: room.buildingName || '',
                roomIdentifier: room.roomIdentifier || '',
                roomPurpose: room.roomPurpose || '',
                roomPurposeOther: room.roomPurposeOther || '',
                walls: room.roomMakeup?.walls || '',
                wallsOther: room.roomMakeup?.wallsOther || '',
                ceilingType: room.roomMakeup?.ceiling?.type || '',
                ceilingTypeOther: room.roomMakeup?.ceiling?.typeOther || '',
                // Prioritize new asbestosInRoom, fallback to old asbestosInCeiling if it exists
                asbestosInRoom: room.asbestosInRoom || room.roomMakeup?.ceiling?.asbestosInCeiling || '',
                floorType: room.roomMakeup?.floor?.type || '',
                floorTypeOther: room.roomMakeup?.floor?.typeOther || '',
                tileSize: room.roomMakeup?.floor?.tileSize || '',
                tileSizeOther: room.roomMakeup?.floor?.tileSizeOther || '',
                ceilingCondition: room.conditionValues?.ceiling || '',
                ceilingComment: room.conditionValues?.ceilingComment || '',
                wallsCondition: room.conditionValues?.walls || '',
                wallsComment: room.conditionValues?.wallsComment || '',
                furnitureCondition: room.conditionValues?.furniture || '',
                furnitureComment: room.conditionValues?.furnitureComment || '',
                floorCondition: room.conditionValues?.floor || '',
                floorComment: room.conditionValues?.floorComment || '',
                overallCondition: room.conditionValues?.overall || '',
                overallComment: room.conditionValues?.overallComment || '',
                lightFixtures_JSON: JSON.stringify(room.lightFixtures || []),
                otherFixtures_JSON: JSON.stringify(room.otherFixtures || []),
                furniture_JSON: JSON.stringify(room.furniture || []),
                furnitureSpecialtySpecify: room.furnitureSpecialtySpecify || '',
                furnitureOtherSpecify: room.furnitureOtherSpecify || '',
                heatingCooling: room.heatingCooling || '',
                heatingCoolingOther: room.heatingCoolingOther || '',
                smokeDetectors: room.safety?.smokeDetectors ?? '',
                maxOccupancy: room.safety?.maxOccupancy ?? '',
                doors_JSON: JSON.stringify(room.doors || []),
                technology_JSON: JSON.stringify(room.technology || []),
                technologyOtherSpecify: room.technologyOtherSpecify || '',
                lastModifiedBy: room.lastModifiedBy || '',
                savedAt: room.savedAt || ''
            };
            return headers.map(header => escapeCSV(row[header])).join(',');
        });

        return [headers.join(','), ...rows].join('\n');
    }


    if (copyJsonBtn) {
        copyJsonBtn.addEventListener('click', function() {
            if (!jsonDisplayArea || !exportFeedback) return;
            if (jsonDisplayArea.value === 'No data to display.' || jsonDisplayArea.value.trim() === '') {
                exportFeedback.textContent = 'No data to copy.';
                exportFeedback.className = 'feedback error'; return;
            }
            jsonDisplayArea.select();
            try {
                const successful = document.execCommand('copy');
                const msg = successful ? 'JSON copied to clipboard!' : 'Copying JSON failed.';
                exportFeedback.textContent = msg;
                exportFeedback.className = successful ? 'feedback success' : 'feedback error';
            } catch (err) {
                console.error('Fallback copy error:', err);
                exportFeedback.textContent = 'Copying JSON failed. See console.';
                exportFeedback.className = 'feedback error';
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(jsonDisplayArea.value).then(() => {
                        exportFeedback.textContent = 'JSON copied to clipboard! (using fallback)';
                        exportFeedback.className = 'feedback success';
                    }).catch(eventArgument => {
                        console.error('Navigator.clipboard error:', eventArgument);
                        exportFeedback.textContent = 'Copying JSON failed completely. See console.';
                        exportFeedback.className = 'feedback error';
                    });
                }
            }
            if (window.getSelection) { 
                window.getSelection().removeAllRanges();
            } else if (document.selection) { 
                document.selection.empty();
            }
        });
    }
    
    if (importJsonFileBtn && jsonImportFile) {
        importJsonFileBtn.addEventListener('click', () => {
            if (jsonImportFile.files.length === 0) {
                if(importFeedback){ importFeedback.textContent = 'Please select a JSON or TXT file.'; importFeedback.className = 'feedback error'; }
                return;
            }
            const file = jsonImportFile.files[0];
            const reader = new FileReader();
            reader.onload = function(eventArgument) { processImportedJsonString(eventArgument.target.result); };
            reader.onerror = function(eventArgument) {
                console.error("File reading error:", eventArgument);
                if(importFeedback){ importFeedback.textContent = 'Error reading file.'; importFeedback.className = 'feedback error';}
            };
            reader.readAsText(file);
        });
    }

    if (importJsonPasteBtn && jsonPasteArea) {
        importJsonPasteBtn.addEventListener('click', () => {
            const jsonString = jsonPasteArea.value.trim();
            if (!jsonString) {
                 if(importFeedback){ importFeedback.textContent = 'Please paste JSON content.'; importFeedback.className = 'feedback error';}
                return;
            }
            processImportedJsonString(jsonString);
        });
    }

    function tryMigrateRoomTileData(roomObject) {
        if (roomObject && roomObject.roomMakeup && roomObject.roomMakeup.floor && roomObject.roomMakeup.floor.type === 'Tile' &&
            !roomObject.roomMakeup.floor.tileSize && 
            roomObject.roomMakeup.ceiling && roomObject.roomMakeup.ceiling.tileSize) { 
            const oldCeilingTileSize = String(roomObject.roomMakeup.ceiling.tileSize);
            if (oldCeilingTileSize === "9") roomObject.roomMakeup.floor.tileSize = "9x9";
            else if (oldCeilingTileSize === "12") roomObject.roomMakeup.floor.tileSize = "12x12";
            console.log("Migrated tile data for room:", roomObject.roomIdentifier);
        }
    }

    async function processImportedJsonString(jsonString) {
        if(importFeedback) {importFeedback.className = 'feedback'; importFeedback.textContent = '';}
        importConflictResolutionMode = 'manual'; 
        try {
            const data = JSON.parse(jsonString);
            if (!Array.isArray(data)) throw new Error('JSON must be an array of room objects.');

            const currentBuildings = getStoredBuildings();
            const newBuildings = new Set();

            data.forEach(room => {
                if (room && typeof room === 'object') {
                    if (room.buildingName && !currentBuildings.includes(room.buildingName)) {
                        newBuildings.add(room.buildingName);
                    }
                    tryMigrateRoomTileData(room); 
                    // Migrate old asbestosInCeiling to new asbestosInRoom if it exists and new field doesn't
                    if (room.roomMakeup?.ceiling?.asbestosInCeiling && room.asbestosInRoom === undefined) {
                        room.asbestosInRoom = room.roomMakeup.ceiling.asbestosInCeiling;
                        // Optionally remove the old field from the imported object
                        // delete room.roomMakeup.ceiling.asbestosInCeiling;
                    }
                }
            });

            if (newBuildings.size > 0) {
                await storeBuildings([...currentBuildings, ...Array.from(newBuildings)]);
            }

            importedRoomsQueue = data.filter(r => r && typeof r === 'object' && r.buildingName && r.roomIdentifier);

            if (importedRoomsQueue.length === 0) {
                importFeedback.textContent = 'No valid room objects with buildingName and roomIdentifier found in JSON.';
                importFeedback.className = 'feedback error'; return;
            }
            currentImportIndex = 0; successfullyImportedCount = 0; skippedCount = 0; replacedCount = 0;
            importFeedback.textContent = `Starting import of ${importedRoomsQueue.length} room(s)...`;
            importFeedback.className = 'feedback info';
            processImportQueue();
        } catch (eventArgument) {
            console.error('Error processing JSON for import:', eventArgument);
            importFeedback.textContent = `Error: ${eventArgument.message}`;
            importFeedback.className = 'feedback error';
        }
    }

    async function processImportQueue() {
        if(modifyConflictFeedback){modifyConflictFeedback.className='feedback';modifyConflictFeedback.textContent='';}

        if (currentImportIndex >= importedRoomsQueue.length) {
            let summary = `Import complete. Successfully imported: ${successfullyImportedCount}. Replaced: ${replacedCount}. Skipped: ${skippedCount}.`;
            if(importFeedback) {
                importFeedback.textContent = summary;
                importFeedback.className = (successfullyImportedCount > 0 || replacedCount > 0) ? 'feedback success' : 'feedback info';
            }
            console.log('Import Complete:', summary);
            if (jsonImportFile) jsonImportFile.value = ''; if (jsonPasteArea) jsonPasteArea.value = '';
            importConflictResolutionMode = 'manual'; 
            return;
        }

        const roomToImport = { ...importedRoomsQueue[currentImportIndex] };
        delete roomToImport.id; delete roomToImport.savedAt;
        currentExistingRoom = findRoom(roomToImport.buildingName, roomToImport.roomIdentifier);

        if (currentExistingRoom) {
            if (importConflictResolutionMode === 'replaceAll') {
                try {
                    tryMigrateRoomTileData(roomToImport); 
                    await addRoomToFirestore(roomToImport, currentExistingRoom.id);
                    replacedCount++; currentImportIndex++;
                    processImportQueue();
                } catch(e) {
                     importFeedback.textContent = `Import stopped due to an error.`;
                     importFeedback.className = 'feedback error'; return;
                }
            } else if (importConflictResolutionMode === 'skipAll') {
                skippedCount++; currentImportIndex++; processImportQueue();
            } else { 
                currentConflictingRoom = roomToImport;
                showConflictModal(currentConflictingRoom, currentExistingRoom);
            }
        } else { 
            try {
                await addRoomToFirestore(roomToImport);
                successfullyImportedCount++; currentImportIndex++;
                processImportQueue();
            }
            catch(e) {
                importFeedback.textContent = `Import stopped due to an error.`;
                importFeedback.className = 'feedback error'; return;
            }
        }
    }

    function showConflictModal(newRoom, existingRoom) {
        if (!conflictModal || !importingRoomDetailsPreview || !existingRoomDetailsPreview || !conflictBuildingNew || !conflictRoomIDNew) return;
        importingRoomDetailsPreview.innerHTML = formatRoomDataForPreview(newRoom);
        existingRoomDetailsPreview.innerHTML = formatRoomDataForPreview(existingRoom);
        conflictBuildingNew.value = newRoom.buildingName; conflictRoomIDNew.value = newRoom.roomIdentifier;
        conflictModal.style.display = 'block';
        if(massReplaceAllConflictBtn) massReplaceAllConflictBtn.focus(); else conflictBuildingNew.focus();
    }

    function closeConflictModal() {
        if (conflictModal) conflictModal.style.display = 'none';
        currentConflictingRoom = null; currentExistingRoom = null;
        if (modifyConflictFeedback) {modifyConflictFeedback.className='feedback';modifyConflictFeedback.textContent='';}
    }

    if(closeConflictModalBtn) {
        closeConflictModalBtn.onclick = () => {
            skippedCount++; currentImportIndex++; closeConflictModal(); processImportQueue();
        };
    }
    if(skipConflictBtn) {
        skipConflictBtn.onclick = () => {
            skippedCount++; currentImportIndex++; closeConflictModal(); processImportQueue();
        };
    }
    if(replaceConflictBtn) {
        replaceConflictBtn.onclick = async () => {
            if (currentConflictingRoom && currentExistingRoom) {
                try {
                    tryMigrateRoomTileData(currentConflictingRoom);
                    await addRoomToFirestore(currentConflictingRoom, currentExistingRoom.id);
                    replacedCount++;
                } catch (e) {
                    modifyConflictFeedback.textContent = 'Replacement failed. Please try again.';
                    modifyConflictFeedback.className = 'feedback error'; return;
                }
            }
            currentImportIndex++; closeConflictModal(); processImportQueue();
        };
    }

    if (massReplaceAllConflictBtn) {
        massReplaceAllConflictBtn.addEventListener('click', async () => {
            importConflictResolutionMode = 'replaceAll';
            if (modifyConflictFeedback) {
                modifyConflictFeedback.textContent = 'Mass Replace All Subsequent selected. Current conflict will be replaced.';
                modifyConflictFeedback.className = 'feedback info';
            }
            if (currentConflictingRoom && currentExistingRoom) {
                 try {
                    tryMigrateRoomTileData(currentConflictingRoom);
                    await addRoomToFirestore(currentConflictingRoom, currentExistingRoom.id);
                    replacedCount++;
                } catch (e) {
                    modifyConflictFeedback.textContent = 'Replacement failed.';
                    modifyConflictFeedback.className = 'feedback error'; return;
                }
            }
            currentImportIndex++; closeConflictModal(); processImportQueue();
        });
    }

    if (massSkipAllConflictBtn) {
        massSkipAllConflictBtn.addEventListener('click', () => {
            importConflictResolutionMode = 'skipAll';
            if (modifyConflictFeedback) {
                modifyConflictFeedback.textContent = 'Mass Skip All Subsequent selected. Current conflict will be skipped.';
                modifyConflictFeedback.className = 'feedback info';
            }
            skippedCount++; currentImportIndex++; closeConflictModal(); processImportQueue();
        });
    }

    if(saveModifiedConflictBtn) {
        saveModifiedConflictBtn.onclick = async () => {
            if (!currentConflictingRoom || !conflictBuildingNew || !conflictRoomIDNew || !modifyConflictFeedback) return;
            const newBuilding = conflictBuildingNew.value.trim(); const newRoomIdVal = conflictRoomIDNew.value.trim();
            if (!newBuilding || !newRoomIdVal) { modifyConflictFeedback.textContent = 'Building Name and Room ID cannot be empty.'; modifyConflictFeedback.className = 'feedback error'; return; }

            const stillExisting = findRoom(newBuilding, newRoomIdVal);

            if (stillExisting && stillExisting.id !== currentExistingRoom?.id) {
                modifyConflictFeedback.textContent = 'Conflict: Modified identifiers match another existing room.';
                modifyConflictFeedback.className = 'feedback error';
                const existingPreviewInImportModal = document.querySelector('#conflictModal #existingRoomDetailsPreview');
                if (existingPreviewInImportModal) existingPreviewInImportModal.innerHTML = formatRoomDataForPreview(stillExisting);
                return;
            } else if (currentExistingRoom &&
                       newBuilding.toLowerCase() === currentExistingRoom.buildingName.toLowerCase() &&
                       newRoomIdVal.toLowerCase() === currentExistingRoom.roomIdentifier.toLowerCase()) {
                 if (stillExisting && stillExisting.id === currentExistingRoom?.id) {
                     modifyConflictFeedback.textContent = 'Identifiers are the same as the original conflicting room. Change them to save as new, or choose "Replace".';
                     modifyConflictFeedback.className = 'feedback error';
                     return;
                 }
            }

            currentConflictingRoom.buildingName = newBuilding;
            currentConflictingRoom.roomIdentifier = newRoomIdVal;
            
            try {
                tryMigrateRoomTileData(currentConflictingRoom);
                await addRoomToFirestore(currentConflictingRoom); 
                successfullyImportedCount++; currentImportIndex++; closeConflictModal(); processImportQueue();
            } catch(e) {
                modifyConflictFeedback.textContent = 'Save failed.';
                modifyConflictFeedback.className = 'feedback error';
            }
        };
    }
    
    function getProperty(obj, path) {
        return path.split('.').reduce((o, key) => (o && o[key] !== undefined && o[key] !== null) ? o[key] : undefined, obj);
    }

    // Helper to set a nested property on an object using a string path
    function setNestedProperty(obj, path, value) {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!current[part] || typeof current[part] !== 'object') {
                current[part] = {}; // Create nested object if it doesn't exist
            }
            current = current[part];
        }
        current[parts[parts.length - 1]] = value;
    }

    const filterFieldMap = {
        'purpose': 'roomPurpose', 'wallstype': 'roomMakeup.walls', 'ceilingtype': 'roomMakeup.ceiling.type',
        'asbestos': 'asbestosInRoom', // Changed path for asbestos
        'floortype': 'roomMakeup.floor.type',
        'wallscondition': 'conditionValues.walls', 'ceilingcondition': 'conditionValues.ceiling',
        'floorcondition': 'conditionValues.floor', 'furniturecondition': 'conditionValues.furniture',
        'overallcondition': 'conditionValues.overall', 'smokedetectors': 'safety.smokeDetectors', 'maxoccupancy': 'safety.maxOccupancy'
    };
    
    function getRoomTextContent(room) {
        let content = [];
        const processValue = (value) => {
            if (value !== undefined && value !== null) { 
                if (Array.isArray(value)) {
                    content.push(value.join(' ').toLowerCase());
                } else {
                    content.push(String(value).toLowerCase());
                }
            }
        };
        const simpleSearchPaths = [
            'roomIdentifier', 'roomPurpose', 'roomPurposeOther', 'roomMakeup.walls', 'roomMakeup.wallsOther',
            'roomMakeup.ceiling.type', 'roomMakeup.ceiling.typeOther', 'asbestosInRoom', // Changed from roomMakeup.ceiling.asbestosInCeiling
            'roomMakeup.floor.type', 'roomMakeup.floor.typeOther', 'roomMakeup.floor.tileSize', 'roomMakeup.floor.tileSizeOther',
            'conditionValues.walls', 'conditionValues.ceiling', 'conditionValues.floor', 'conditionValues.furniture', 'conditionValues.overall',
            'conditionValues.wallsComment', 'conditionValues.ceilingComment', 'conditionValues.floorComment', 'conditionValues.furnitureComment', 'conditionValues.overallComment',
            'furniture', 'furnitureSpecialtySpecify', 'furnitureOtherSpecify', 'technology', 'technologyOtherSpecify',
            'heatingCooling', 'heatingCoolingOther', 'safety.smokeDetectors', 'safety.maxOccupancy'
        ];
        simpleSearchPaths.forEach(path => { processValue(getProperty(room, path)); });
        room.otherFixtures?.forEach(f => { processValue(f.type); processValue(f.specify); });
        room.lightFixtures?.forEach(f => { processValue(f.type); processValue(f.style); processValue(f.typeOtherSpecify); processValue(f.styleOtherSpecify); });
        room.doors?.forEach(d => { processValue(d.identifier); processValue(d.type); processValue(d.lockType); processValue(d.typeOther); processValue(d.lockTypeOther); });
        return content.filter(s => s && s.trim() !== "").join(' '); 
    }

    function checkCondition(condition, room, roomTextContent) {
        condition = condition.trim();
        let [key, ...valueParts] = condition.split(':');
        let value = valueParts.join(':').trim();
    
        if (condition.includes(':') && !value) return false;
    
        if (value) {
            key = key.trim().toLowerCase().replace(/\s/g, '');
            const propertyPath = filterFieldMap[key];
    
            if (propertyPath) {
                const roomValue = getProperty(room, propertyPath);
                if (roomValue === undefined || roomValue === null) return false;
    
                const conditionKeys = ['wallscondition', 'ceilingcondition', 'floorcondition', 'furniturecondition', 'overallcondition'];
                const userValueAsNumber = parseInt(value, 10);
    
                if (conditionKeys.includes(key) && !isNaN(userValueAsNumber) && String(userValueAsNumber) === value) {
                    const roomConditionAsNumber = conditionStringToValue(roomValue);
                    return roomConditionAsNumber === userValueAsNumber;
                }
    
                const searchTerm = value.replace(/^"|"$/g, '').toLowerCase();
                return String(roomValue).toLowerCase().includes(searchTerm);
            }
            return false;
        }
        else { 
            const term = key.replace(/^"|"$/g, '').toLowerCase();
            return roomTextContent.includes(term);
        }
    }
    
    function evaluateQuery(query, room, precomputedRoomTextContent = null) {
        const roomTextContent = precomputedRoomTextContent || getRoomTextContent(room);
        while (query.includes('(')) {
            let startIndex = query.lastIndexOf('(');
            let endIndex = query.indexOf(')', startIndex);
            if (endIndex === -1) { throw new Error("Mismatched parentheses in query."); }
            let subQuery = query.substring(startIndex + 1, endIndex);
            let subQueryResult = evaluateQuery(subQuery, room, roomTextContent); 
            query = query.substring(0, startIndex) + subQueryResult + query.substring(endIndex + 1);
        }
        const andParts = query.split(/ AND /i);
        for (const andPart of andParts) {
            if (!andPart.trim()) continue;
            const orParts = andPart.split(/ OR /i);
            let orClauseIsTrue = false;
            for (const orPart of orParts) {
                if (!orPart.trim()) continue;
                let term = orPart.trim();
                let negate = false;
                const notMatch = term.match(/^\s*NOT\s+(.+)/i);
                if (notMatch) {
                    negate = true;
                    term = notMatch[1].trim();
                }
                let currentTermResult;
                if (term === 'true') { currentTermResult = true; } 
                else if (term === 'false') { currentTermResult = false; } 
                else { currentTermResult = checkCondition(term, room, roomTextContent); }
                if (negate) { currentTermResult = !currentTermResult; }
                if (currentTermResult) { orClauseIsTrue = true; break; }
            }
            if (!orClauseIsTrue) return false; 
        }
        return true; 
    }

    function applyFilters() {
        if (!filterResultsContainer || !filterFeedback) return;
        filterFeedback.textContent = '';
        filterFeedback.className = 'feedback';

        // Save the current filter state
        lastFilterState = {
            building: filterBuildingNameInput.value,
            identifier: filterRoomIdentifierInput.value,
            global: globalQueryInput.value
        };

        const buildingNameFilter = lastFilterState.building;
        const roomIdentifierFilter = lastFilterState.identifier.trim().toLowerCase();
        const globalQuery = lastFilterState.global.trim();

        currentFilteredRooms = []; // Clear previous results
        try {
            const allRooms = getStoredRooms(); // Read from cache
            currentFilteredRooms = allRooms.filter(room => {
                if (buildingNameFilter && room.buildingName !== buildingNameFilter) return false;
                if (roomIdentifierFilter && (!room.roomIdentifier || !room.roomIdentifier.toLowerCase().startsWith(roomIdentifierFilter))) return false;
                if (globalQuery && !evaluateQuery(globalQuery, room)) return false;
                return true; 
            });
            
             if (currentFilteredRooms.length > 0) {
                filterFeedback.textContent = `Found ${currentFilteredRooms.length} room(s) matching your criteria.`;
                filterFeedback.className = 'feedback success';
            } else {
                filterFeedback.textContent = 'No rooms found matching your criteria.';
                filterFeedback.className = 'feedback info';
            }
        } catch (e) {
            console.error("Filter query parsing error:", e);
            filterFeedback.textContent = `Error in filter query syntax: ${e.message}`;
            filterFeedback.className = 'feedback error';
            currentFilteredRooms = []; 
        }
        renderRoomList(currentFilteredRooms, filterResultsContainer, true);
    }    
    
    // This new function handles restoring the filter view
    function navigateToFilterView() {
        setActiveView('FilterView');
        // Restore filter inputs from saved state
        filterBuildingNameInput.value = lastFilterState.building;
        filterRoomIdentifierInput.value = lastFilterState.identifier;
        globalQueryInput.value = lastFilterState.global;
        // Re-run the search
        applyFilters();
    }

    // --- Mass Edit Logic (NEW FUNCTIONS & LISTENERS) ---
    if (enableMassEditCheckbox) {
        enableMassEditCheckbox.addEventListener('change', () => {
            if (massEditFields) {
                massEditFields.style.display = enableMassEditCheckbox.checked ? 'block' : 'none';
                if (!enableMassEditCheckbox.checked) {
                    massEditPropertySelect.value = '';
                    previousLabelInput.value = '';
                    newLabelInput.value = '';
                    if (massEditFeedback) {
                        massEditFeedback.textContent = '';
                        massEditFeedback.className = 'feedback';
                    }
                }
            }
        });
    }

    if (applyMassEditBtn) {
        applyMassEditBtn.addEventListener('click', async () => {
            if (massEditFeedback) {
                massEditFeedback.textContent = '';
                massEditFeedback.className = 'feedback';
            }

            if (!enableMassEditCheckbox.checked) {
                massEditFeedback.textContent = 'Please enable Mass Edit first.';
                massEditFeedback.className = 'feedback error';
                return;
            }
            
            if (currentFilteredRooms.length === 0) {
                massEditFeedback.textContent = 'No rooms are currently filtered. Apply filters above before using mass edit.';
                massEditFeedback.className = 'feedback error';
                return;
            }

            const propertyPath = massEditPropertySelect.value;
            const previousLabel = previousLabelInput.value.trim();
            const newLabel = newLabelInput.value.trim();

            if (!propertyPath) {
                massEditFeedback.textContent = 'Please select a property to edit.';
                massEditFeedback.className = 'feedback error';
                return;
            }
            if (!previousLabel) {
                massEditFeedback.textContent = 'Please enter the "Previous Label" to replace.';
                massEditFeedback.className = 'feedback error';
                return;
            }
            // newLabel can be empty if the user wants to clear a field

            if (!navigator.onLine) {
                massEditFeedback.textContent = 'A network connection is required to perform mass updates.';
                massEditFeedback.className = 'feedback error';
                return;
            }

            if (!confirm(`Are you sure you want to change "${propertyPath}" from "${previousLabel}" to "${newLabel}" for all ${currentFilteredRooms.length} filtered rooms? This action cannot be undone.`)) {
                massEditFeedback.textContent = 'Mass edit cancelled.';
                massEditFeedback.className = 'feedback info';
                return;
            }

            massEditFeedback.textContent = 'Applying mass edit... Please wait.';
            massEditFeedback.className = 'feedback info';

            const batch = writeBatch(db);
            let updatesCount = 0;

            currentFilteredRooms.forEach(room => {
                const currentValue = getNestedProperty(room, propertyPath);
                
                // Special handling for condition strings to match their numerical part for comparison
                let compareValue = String(currentValue).toLowerCase();
                let comparePreviousLabel = previousLabel.toLowerCase();

                const conditionRegex = /^(\d+) - /;
                const currentConditionMatch = String(currentValue).match(conditionRegex);
                const previousLabelConditionMatch = previousLabel.match(conditionRegex);

                if (currentConditionMatch && previousLabelConditionMatch) {
                    // Compare only the numerical part if both are condition strings
                    compareValue = currentConditionMatch[1];
                    comparePreviousLabel = previousLabelConditionMatch[1];
                }

                // If a property like 'safety.smokeDetectors' is a number, ensure type consistency
                if (typeof currentValue === 'number') {
                    if (Number(currentValue) === Number(previousLabel)) {
                        setNestedProperty(room, propertyPath, Number(newLabel));
                        const roomRef = doc(db, ROOMS_COLLECTION, room.id);
                        batch.update(roomRef, {
                            [propertyPath.replace(/\./g, '_')]: Number(newLabel), // Flatten the path for Firestore update object
                            savedAt: new Date().toISOString(),
                            lastModifiedBy: auth.currentUser ? auth.currentUser.email : 'system (mass edit)'
                        });
                        updatesCount++;
                    }
                } else if (compareValue === comparePreviousLabel) {
                    setNestedProperty(room, propertyPath, newLabel);
                    const roomRef = doc(db, ROOMS_COLLECTION, room.id);
                    // Firestore needs dot notation for nested fields but it expects object properties.
                    // This way we build the update object dynamically for nested properties.
                    let updateObject = {};
                    setNestedProperty(updateObject, propertyPath, newLabel); // Set the value in a temporary object
                    updateObject.savedAt = new Date().toISOString();
                    updateObject.lastModifiedBy = auth.currentUser ? auth.currentUser.email : 'system (mass edit)';
                    batch.update(roomRef, updateObject);
                    updatesCount++;
                }
            });

            if (updatesCount === 0) {
                massEditFeedback.textContent = 'No rooms found with the specified "Previous Label" for the selected property among the filtered rooms. No changes applied.';
                massEditFeedback.className = 'feedback info';
                return;
            }

            try {
                await batch.commit();
                massEditFeedback.textContent = `Successfully updated ${updatesCount} room(s).`;
                massEditFeedback.className = 'feedback success';
                previousLabelInput.value = '';
                newLabelInput.value = '';
                // Re-apply filters to reflect changes
                applyFilters();
            } catch (error) {
                console.error("Firestore: Mass edit batch failed", error);
                massEditFeedback.textContent = `Error applying mass edit: ${error.message}`;
                massEditFeedback.className = 'feedback error';
            }
        });
    }
    
    if (filterForm) {
        filterForm.addEventListener('submit', function(event) {
            event.preventDefault(); applyFilters();
        });
    }

    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', function() {
            if (filterForm) filterForm.reset();
            // Clear the saved filter state as well
            lastFilterState = { building: '', identifier: '', global: '' };
            if (filterResultsContainer) filterResultsContainer.innerHTML = '<p class="empty-list-message">Enter filter criteria and click "Apply Filters".</p>';
            if (filterFeedback) { filterFeedback.textContent = ''; filterFeedback.className = 'feedback'; }
            // Reset mass edit fields when filters are cleared
            if (enableMassEditCheckbox) enableMassEditCheckbox.checked = false;
            if (massEditFields) massEditFields.style.display = 'none';
            if (massEditPropertySelect) massEditPropertySelect.value = '';
            if (previousLabelInput) previousLabelInput.value = '';
            if (newLabelInput) newLabelInput.value = '';
            if (massEditFeedback) { massEditFeedback.textContent = ''; massEditFeedback.className = 'feedback'; }
        });
    }
    
    window.addEventListener('online', () => {
        const banner = document.createElement('div');
        banner.innerHTML = '<i class="fas fa-wifi"></i> Connected. Syncing offline changes...';
        // Basic styling for the banner
        banner.style.position = 'fixed';
        banner.style.bottom = '20px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.padding = '12px 20px';
        banner.style.backgroundColor = 'var(--success-color)';
        banner.style.color = 'white';
        banner.style.borderRadius = 'var(--border-radius)';
        banner.style.boxShadow = 'var(--box-shadow)';
        banner.style.zIndex = '2000';
        banner.style.fontSize = '0.95rem';
        banner.style.display = 'flex';
        banner.style.alignItems = 'center';
        banner.style.gap = '10px';
        
        document.body.appendChild(banner);
        setTimeout(() => {
            banner.style.transition = 'opacity 0.5s ease';
            banner.style.opacity = '0';
            setTimeout(() => banner.remove(), 500);
        }, 3000);
    });

    window.onkeydown = eventArgument => {
        if (eventArgument.key==='Escape') {
            if (conflictModal?.style.display==='block' && importConflictResolutionMode === 'manual') {
                skippedCount++; currentImportIndex++; closeConflictModal(); processImportQueue();
            } else if (roomDetailModal?.style.display==='block') {
                closeModal();
            } else if (duplicateResolutionView?.classList.contains('active-view')) {
                cameFromDuplicateResolutionView = false;
                setActiveView('ViewRoomsView');
            } else if (editingRoomIdInput.value && document.getElementById('AddRoomView')?.classList.contains('active-view')) {
                handleNavigateBack(); 
            }
        }
    };
    window.onclick = eventArgument => {
        if (eventArgument.target==roomDetailModal) closeModal();
        else if (eventArgument.target==conflictModal && importConflictResolutionMode === 'manual') {
            skippedCount++; currentImportIndex++; closeConflictModal(); processImportQueue();
        }
    };

});
