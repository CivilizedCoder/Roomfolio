// Import Firestore functions using the modern initialization for persistence
import {
    initializeFirestore, persistentLocalCache, collection, doc, setDoc, addDoc, getDoc, getDocs, deleteDoc, onSnapshot, query, where, writeBatch, updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Import Authentication functions
import {
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';


document.addEventListener('DOMContentLoaded', function () {
    console.log("App DOMContentLoaded: Initializing with Firebase Auth & Firestore...");

    // --- HAMBURGER MENU LOGIC ---
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinksContainer = document.getElementById('nav-links-container');
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

    // Optional: Close menu when clicking outside of it on mobile
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
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    
    // Navigation elements
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view-section');
    const addEditRoomTitle = document.getElementById('addEditRoomTitle');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const signOutBtn = document.getElementById('signOutBtn');
    const navAdmin = document.getElementById('navAdmin');
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
    const lightFixturesContainer = document.getElementById('lightFixturesContainer');
    const addLightFixtureBtn = document.getElementById('addLightFixtureBtn');
    const otherFixturesCheckboxes = document.querySelectorAll('.fixture-present-checkbox');

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
    let focusedButtonBeforeModal = null;
    let unsubscribeRooms = null; // To hold the rooms listener detachment function
    let unsubscribeBuildings = null; // To hold the buildings listener detachment function
    
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

    
    // --- AUTHENTICATION LOGIC ---

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in, now check their status in Firestore
            const userDocRef = doc(db, USERS_COLLECTION, user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                if (userData.status === 'approved') {
                    // User is approved, let them in
                    loginView.style.display = 'none';
                    loginView.classList.remove('active-view');
                    registerView.style.display = 'none';
                    registerView.classList.remove('active-view');
                    appContainer.style.display = 'flex';
                    appContainer.classList.add('active-view');
                    
                    userEmailDisplay.textContent = user.email;
                    signOutBtn.style.display = 'inline-flex';

                    // Check if the user is an admin
                    if (userData.role === 'admin') {
                        navAdmin.style.display = 'list-item';
                        listenForPendingUsers();
                    } else {
                        navAdmin.style.display = 'none';
                    }

                    initializeAppLogic(); // Your existing function
                } else {
                    // User is pending or another status
                    loginFeedback.textContent = 'Your account is awaiting approval. Please check back later.';
                    loginFeedback.className = 'feedback info';
                    signOut(auth); // Log them out
                }
            } else {
                // User exists in Auth but not in our users collection (edge case)
                loginFeedback.textContent = 'Your account is not fully configured. Please contact an administrator.';
                loginFeedback.className = 'feedback error';
                signOut(auth);
            }
        } else {
            // User is signed out
            appContainer.style.display = 'none';
            appContainer.classList.remove('active-view');
            registerView.style.display = 'none';
            registerView.classList.remove('active-view');
            loginView.style.display = 'flex';
            loginView.classList.add('active-view');
            navAdmin.style.display = 'none';

            userEmailDisplay.textContent = '';
            signOutBtn.style.display = 'none';

            if (unsubscribeRooms) unsubscribeRooms();
            if (unsubscribeBuildings) unsubscribeBuildings();
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
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

    // --- View Switching for Login/Register ---
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginView.style.display = 'none';
            registerView.style.display = 'flex';
            registerView.classList.add('active-view');
            loginView.classList.remove('active-view');
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerView.style.display = 'none';
            loginView.style.display = 'flex';
            loginView.classList.add('active-view');
            registerView.classList.remove('active-view');
        });
    }

    // --- New Registration Logic ---
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
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
            lastInputValues = {
                roomPurpose: 'Lab',
                walls: 'Drywall',
                ceilingType: 'Drop Ceiling',
                floorType: 'Carpet',
                heatingCooling: 'Forced Air',
                lightFixtures: [{ type: 'LED', quantity: 1, style: 'Flat Panel' }]
            };
        }
    }

    function saveLastInputValues() {
        try {
            localStorage.setItem(LAST_INPUT_VALUES_KEY, JSON.stringify(lastInputValues));
        } catch (e) {
            console.error("Could not save last input values, storage might be full.", e);
        }
    }

    function applyLastInputsToForm(form) {
        if (!form) return;
        form.querySelectorAll('.remembered-input, .default-value-input').forEach(el => el.classList.remove('remembered-input', 'default-value-input'));
        const fieldsToRemember = [
            'roomPurpose', 'roomPurposeOther',
            'walls', 'wallsOther',
            'ceilingType', 'ceilingTypeOther',
            'floorType', 'floorTypeOther',
            'heatingCooling', 'heatingCoolingOther'
        ];
        fieldsToRemember.forEach(fieldName => {
            const element = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (element && lastInputValues.hasOwnProperty(fieldName)) {
                const value = lastInputValues[fieldName];
                if (value !== undefined && value !== null && (typeof value === 'number' || value !== '')) {
                    if (element.tagName === 'SELECT') {
                        const optionExists = Array.from(element.options).some(opt => opt.value === value);
                        if (!optionExists) return;
                    }
                    element.value = value;
                    element.classList.add('remembered-input');
                }
            }
        });
        if (lastInputValues.lightFixtures && lastInputValues.lightFixtures.length > 0 && lightFixturesContainer.children.length > 0) {
            const firstFixtureTemplate = lastInputValues.lightFixtures[0];
            const firstEntry = lightFixturesContainer.children[0];
            if (firstEntry) {
                const typeSelect = firstEntry.querySelector('select[name="lightFixtureType"]');
                const typeOther = firstEntry.querySelector('input[name="lightFixtureTypeOtherSpecify"]');
                const styleSelect = firstEntry.querySelector('select[name="lightFixtureStyle"]');
                const styleOther = firstEntry.querySelector('input[name="lightFixtureStyleOtherSpecify"]');
                if (typeSelect && firstFixtureTemplate.type) {
                     if (Array.from(typeSelect.options).some(opt => opt.value === firstFixtureTemplate.type)) {
                        typeSelect.value = firstFixtureTemplate.type;
                        typeSelect.classList.add('remembered-input');
                        if (typeSelect.value === 'Other' && typeOther && firstFixtureTemplate.typeOtherSpecify) {
                            typeOther.value = firstFixtureTemplate.typeOtherSpecify;
                            typeOther.classList.add('remembered-input');
                        }
                    }
                }
                if (styleSelect && firstFixtureTemplate.style) {
                     if (Array.from(styleSelect.options).some(opt => opt.value === firstFixtureTemplate.style)) {
                        styleSelect.value = firstFixtureTemplate.style;
                        styleSelect.classList.add('remembered-input');
                         if (styleSelect.value === 'Other' && styleOther && firstFixtureTemplate.styleOtherSpecify) {
                            styleOther.value = firstFixtureTemplate.styleOtherSpecify;
                            styleOther.classList.add('remembered-input');
                        }
                    }
                }
            }
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
        } else if (targetViewId === 'AddRoomView') {
            if (!editingRoomIdInput.value && isResolvingAttemptedDataInput.value !== 'true') {
                resetRoomFormToDefault();
            }
             isResolvingAttemptedDataInput.value = 'false';
        } else if (targetViewId === 'FilterView') {
            if(filterForm) filterForm.reset();
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

        populateBuildingDropdowns();

        if (lightFixturesContainer && lightFixturesContainer.children.length === 0) {
            const rememberedFixtureTemplate = (lastInputValues.lightFixtures && lastInputValues.lightFixtures.length > 0) ? lastInputValues.lightFixtures[0] : {};
            appendNewLightFixtureEntry(rememberedFixtureTemplate, !!(lastInputValues.lightFixtures && lastInputValues.lightFixtures.length > 0));
        }

        if (doorsContainer && doorsContainer.children.length === 0) {
            appendNewDoorEntry({ identifier: 'Main Entry' }, true);
        }

        applyLastInputsToForm(roomForm);

        const overallConditionSelect = document.getElementById('overallCondition');
        if (overallConditionSelect) overallConditionSelect.value = '';

        refreshConditionalFormUI(roomForm);

        const currentAddRoomView = document.getElementById('AddRoomView');
        if (currentAddRoomView) currentAddRoomView.scrollTop = 0;
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
        }
    }

    function initializeFormConditionalLogic(formElement) {
        if (!formElement) return;
        initializeGeneralConditionalLogic(formElement);

        const ceilingTypeSelect = formElement.querySelector('#ceilingType');
        const dropCeilingOptionsDiv = formElement.querySelector('#dropCeilingOptions');
        if (ceilingTypeSelect && dropCeilingOptionsDiv) {
            const updateCeilingOptions = () => {
                const show = ceilingTypeSelect.value === 'Drop Ceiling';
                 dropCeilingOptionsDiv.style.display = show ? 'block' : 'none';
                 if (!show) {
                    formElement.querySelectorAll('input[name="ceilingAsbestos"]').forEach(radio => radio.checked = false);
                 }
            }
            ceilingTypeSelect.addEventListener('change', updateCeilingOptions);
        }

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

        const ceilingTypeSelect = formElement.querySelector('#ceilingType');
        const dropCeilingOptionsDiv = formElement.querySelector('#dropCeilingOptions');
        if (ceilingTypeSelect && dropCeilingOptionsDiv) {
            const show = ceilingTypeSelect.value === 'Drop Ceiling';
            dropCeilingOptionsDiv.style.display = show ? 'block' : 'none';
            if (!show) {
                formElement.querySelectorAll('input[name="ceilingAsbestos"]').forEach(radio => radio.checked = false);
            }
        }

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
        if (isRememberedSource && fixtureData.quantity) quantityInputEl.classList.add('remembered-input');

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
        if (formData.get('ceilingType') === 'Drop Ceiling') {
            newRoomData.roomMakeup.ceiling.asbestosInCeiling = formData.get('ceilingAsbestos');
        }
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
        roomForm.addEventListener('submit', async function (event) {
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
            const currentRoomId = editingRoomIdInput.value;

            if (!buildingNameVal || !roomIdentifierVal) {
                const msg = 'Building Name and Room Identifier are required.';
                feedbackMessage.textContent = msg;
                feedbackMessage.className = 'feedback error';
                console.error(msg);
                return;
            }
            
            const validationError = validateConditionalFields();
            if (validationError) {
                feedbackMessage.textContent = validationError;
                feedbackMessage.className = 'feedback error';
                return;
            }

            const newRoomDataFromForm = getCurrentRoomDataFromForm();
            const existingRoomWithSameIdentifiers = findRoom(newRoomDataFromForm.buildingName, newRoomDataFromForm.roomIdentifier);

            if (existingRoomWithSameIdentifiers && existingRoomWithSameIdentifiers.id !== currentRoomId) {
                feedbackMessage.textContent = 'Conflict found. Redirecting to resolve duplicate room...';
                feedbackMessage.className = 'feedback info';
                console.warn("[RoomFormSubmit] Duplicate room detected. Presenting resolution options.");
                setTimeout(() => {
                    presentDuplicateRoomResolution(newRoomDataFromForm, existingRoomWithSameIdentifiers);
                }, 1000);
                return;
            }

            try {
                console.log("[RoomFormSubmit] Starting save operation for room:", { buildingNameVal, roomIdentifierVal, currentRoomId });
                await addRoomToFirestore(newRoomDataFromForm, currentRoomId);
                console.log("[RoomFormSubmit] addRoomToFirestore completed successfully.");
                setLastUsedBuilding(newRoomDataFromForm.buildingName);
                saveLastInputValues();

                feedbackMessage.textContent = currentRoomId ? 'Room information updated successfully!' : 'Room information saved successfully!';
                feedbackMessage.className = 'feedback success';

                const isEditing = !!currentRoomId;
                editingRoomIdInput.value = '';
                isResolvingAttemptedDataInput.value = 'false';
                cameFromDuplicateResolutionView = false;
                resetRoomFormToDefault();

                if (isEditing) {
                    setTimeout(() => {
                        if (feedbackMessage?.classList.contains('success')) setActiveView('ViewRoomsView');
                    }, 1500);
                }

            } catch (error) {
                console.error('[RoomFormSubmit] CRITICAL ERROR during room save process:', error);
                feedbackMessage.textContent = 'Failed to save room to the database. Check console for details.';
                feedbackMessage.className = 'feedback error';
            }
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


    if(cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to cancel editing? Any unsaved changes will be lost.")) {
                const returnToConflictView = cameFromDuplicateResolutionView;

                editingRoomIdInput.value = '';
                resetRoomFormToDefault();

                if (returnToConflictView) {
                    cameFromDuplicateResolutionView = false;
                    setActiveView('duplicateResolutionView', { preserveScroll: true });
                } else {
                    cameFromDuplicateResolutionView = false;
                    setActiveView('ViewRoomsView');
                }
            }
        });
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

        populateBuildingDropdowns(room.buildingName);
        
        const roomIdentifierEl = roomForm.querySelector('#roomIdentifier');
        if(roomIdentifierEl) roomIdentifierEl.value = room.roomIdentifier || '';

        const roomPurposeSelectEl = roomForm.querySelector('#roomPurpose');
        const roomPurposeOtherInputEl = roomForm.querySelector('#roomPurposeOther');
        if (roomPurposeSelectEl) roomPurposeSelectEl.value = room.roomPurpose || 'Lab';
        if (roomPurposeOtherInputEl && room.roomPurpose === 'Other') {
            roomPurposeOtherInputEl.value = room.roomPurposeOther || '';
        }

         if (room.roomMakeup) {
            const makeup = room.roomMakeup;
            const wallsEl = roomForm.querySelector('#walls');
            if(wallsEl) wallsEl.value = makeup.walls || 'Drywall';
            if (makeup.walls === 'Other') {
                const wallsOtherEl = roomForm.querySelector('#wallsOther');
                if(wallsOtherEl) wallsOtherEl.value = makeup.wallsOther || '';
            }
            if (makeup.ceiling) {
                const ceilingTypeEl = roomForm.querySelector('#ceilingType');
                if(ceilingTypeEl) ceilingTypeEl.value = makeup.ceiling.type || 'Drop Ceiling';
                if (makeup.ceiling.type === 'Other') {
                    const ceilingTypeOtherEl = roomForm.querySelector('#ceilingTypeOther');
                    if(ceilingTypeOtherEl) ceilingTypeOtherEl.value = makeup.ceiling.typeOther || '';
                }
                if (makeup.ceiling.type === 'Drop Ceiling' && makeup.ceiling.asbestosInCeiling) {
                    const ceilingAsbestosInput = roomForm.querySelector(`input[name="ceilingAsbestos"][value="${makeup.ceiling.asbestosInCeiling}"]`);
                    if (ceilingAsbestosInput) ceilingAsbestosInput.checked = true;
                    else {
                        const defaultCeilingAsbestos = roomForm.querySelector(`input[name="ceilingAsbestos"][value="No"]`);
                        if (defaultCeilingAsbestos) defaultCeilingAsbestos.checked = true;
                    }
                }
            }
            if (makeup.floor) {
                const floorTypeEl = roomForm.querySelector('#floorType');
                if(floorTypeEl) floorTypeEl.value = makeup.floor.type || 'Carpet';
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
                        if (floorTileSizeRadio) floorTileSizeRadio.checked = true;
                        else {
                             const defaultFloorTileSize = roomForm.querySelector(`input[name="floorTileSize"][value="12x12"]`);
                             if(defaultFloorTileSize) defaultFloorTileSize.checked = true;
                        }
                        if (targetFloorTileSize === 'Other' && targetFloorTileSizeOther) {
                            const floorTileSizeOtherEl = roomForm.querySelector('#floorTileSizeOther');
                            if (floorTileSizeOtherEl) floorTileSizeOtherEl.value = targetFloorTileSizeOther;
                        }
                    } else {
                        const defaultFloorTileSize = roomForm.querySelector(`input[name="floorTileSize"][value="12x12"]`);
                        if(defaultFloorTileSize) defaultFloorTileSize.checked = true;
                    }
                }
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
        if(heatingCoolingEl) heatingCoolingEl.value = room.heatingCooling || 'Forced Air';
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
        if (targetButton.classList.contains('view-details-btn')) {
            focusedButtonBeforeModal = targetButton;
            displayRoomDetails(roomId);
        } else if (targetButton.classList.contains('edit-room-btn')) {
            populateFormForEditing(roomId);
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
                html += entry;
            });
            html += `</ul>`;
        } else html += `<p><strong>Light Fixtures:</strong> N/A</p>`;
        if (room.otherFixtures && room.otherFixtures.length > 0) {
            html += `<p><strong>Other Fixtures:</strong></p><ul>`;
            room.otherFixtures.forEach(of => {
                let entry = `<li>${escapeHtml(of.count)} x ${escapeHtml(of.type)}`;
                if (of.type === 'Other' && of.specify) entry += ` (${escapeHtml(of.specify)})`;
                entry += `</li>`;
                html += entry;
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
        if (room.roomMakeup?.ceiling?.type === 'Drop Ceiling') {
            html += `<p><strong>Asbestos in Ceiling:</strong> ${escapeHtml(room.roomMakeup.ceiling.asbestosInCeiling||'Unknown')}</p>`;
        }
        
        html += `<h3><i class="fas fa-clipboard-check"></i> Overall Room Condition</h3>`;
        html += `<p><strong>Overall:</strong> ${escapeHtml(room.conditionValues?.overall) || 'N/A (Not Set/Calculated)'}</p>`;
        if(room.conditionValues?.overallComment) html += `<p class="condition-comment">${escapeHtml(room.conditionValues.overallComment)}</p>`;

        roomDetailContent.innerHTML = html;
        roomDetailModal.style.display = 'block';
        if(closeModalBtn) closeModalBtn.focus();
    }

    async function deleteRoom(roomId, fromConflictResolution = false) {
        const room = findRoomById(roomId);
        try {
            const roomRef = doc(db, ROOMS_COLLECTION, roomId);
            await deleteDoc(roomRef);

            if (fromConflictResolution) {
                if(duplicateResolutionFeedback) {
                    duplicateResolutionFeedback.textContent = `Room "${escapeHtml(room?.buildingName)} - ${escapeHtml(room?.roomIdentifier)}" deleted successfully.`;
                    duplicateResolutionFeedback.className = 'feedback success';
                }
                 setTimeout(() => {
                    setActiveView('ViewRoomsView');
                }, 1500);

            } else {
                 if (roomDetailModal?.style.display === 'block') closeModal();
                 const firstBuildingHeader = roomListContainer?.querySelector('.building-header');
                 if (firstBuildingHeader) firstBuildingHeader.focus(); else navLinks[0]?.focus();
            }
        } catch (error) {
            console.error("Firestore: Error deleting room", error);
            const feedback = fromConflictResolution ? duplicateResolutionFeedback : feedbackMessage;
            if (feedback) {
                feedback.textContent = "Error deleting room from the database.";
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
        currentAttemptedSaveData.id = existingRoom.id;
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
        deleteExistingConflictBtn.addEventListener('click', async () => {
            if (currentExistingRoomForSaveConflict && currentAttemptedSaveData) {
                const room = currentExistingRoomForSaveConflict;
                if (confirm(`Are you sure you want to DELETE the existing room and REPLACE it with your new data? This action cannot be undone.`)) {
                    try {
                        await addRoomToFirestore(currentAttemptedSaveData, room.id);
                        
                        if (duplicateResolutionFeedback) {
                            duplicateResolutionFeedback.textContent = `Successfully replaced room with new data.`;
                            duplicateResolutionFeedback.className = 'feedback success';
                        }
                        
                        currentAttemptedSaveData = null;
                        currentExistingRoomForSaveConflict = null;
                        cameFromDuplicateResolutionView = false;
                        setTimeout(() => {
                            setActiveView('ViewRoomsView');
                            resetRoomFormToDefault();
                        }, 1500);

                    } catch(error) {
                        console.error("Error during delete-and-replace operation:", error);
                        if (duplicateResolutionFeedback) {
                           duplicateResolutionFeedback.textContent = 'An unexpected error occurred during replacement.';
                           duplicateResolutionFeedback.className = 'feedback error';
                       }
                    }
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
        const dataToExport = rooms.map(({ id, ...rest }) => rest);
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
                    console.log(`[ImportQueue] Mass Replacing: ${roomToImport.buildingName} - ${roomToImport.roomIdentifier}`);
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
            } catch(e) {
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

    const filterFieldMap = {
        'purpose': 'roomPurpose', 'wallstype': 'roomMakeup.walls', 'ceilingtype': 'roomMakeup.ceiling.type',
        'asbestos': 'roomMakeup.ceiling.asbestosInCeiling', 'floortype': 'roomMakeup.floor.type',
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
            'roomMakeup.ceiling.type', 'roomMakeup.ceiling.typeOther', 'roomMakeup.ceiling.asbestosInCeiling',
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
                const searchTerm = value.replace(/^"|"$/g, '').toLowerCase(); 
                return roomValue !== undefined && String(roomValue).toLowerCase().includes(searchTerm);
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

        const buildingNameFilter = filterBuildingNameInput.value;
        const roomIdentifierFilter = filterRoomIdentifierInput.value.trim().toLowerCase();
        const globalQuery = globalQueryInput.value.trim();

        let filteredRooms = [];
        try {
            const allRooms = getStoredRooms(); // Read from cache
            filteredRooms = allRooms.filter(room => {
                if (buildingNameFilter && room.buildingName !== buildingNameFilter) return false;
                if (roomIdentifierFilter && (!room.roomIdentifier || !room.roomIdentifier.toLowerCase().startsWith(roomIdentifierFilter))) return false;
                if (globalQuery && !evaluateQuery(globalQuery, room)) return false;
                return true; 
            });
            
             if (filteredRooms.length > 0) {
                filterFeedback.textContent = `Found ${filteredRooms.length} room(s) matching your criteria.`;
                filterFeedback.className = 'feedback success';
            } else {
                filterFeedback.textContent = 'No rooms found matching your criteria.';
                filterFeedback.className = 'feedback info';
            }
        } catch (e) {
            console.error("Filter query parsing error:", e);
            filterFeedback.textContent = `Error in filter query syntax: ${e.message}`;
            filterFeedback.className = 'feedback error';
            filteredRooms = []; 
        }
        renderRoomList(filteredRooms, filterResultsContainer, true);
    }    
    
    if (filterForm) {
        filterForm.addEventListener('submit', function(event) {
            event.preventDefault(); applyFilters();
        });
    }

    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', function() {
            if (filterForm) filterForm.reset();
            if (filterResultsContainer) filterResultsContainer.innerHTML = '<p class="empty-list-message">Enter filter criteria and click "Apply Filters".</p>';
            if (filterFeedback) { filterFeedback.textContent = ''; filterFeedback.className = 'feedback'; }
        });
    }
    
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
                if(cancelEditBtn) cancelEditBtn.click(); 
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
