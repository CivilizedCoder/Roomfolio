document.addEventListener('DOMContentLoaded', function () {
    console.log("App DOMContentLoaded: Initializing...");

    // Navigation elements
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view-section');
    const addEditRoomTitle = document.getElementById('addEditRoomTitle');

    // Room Form elements
    const roomForm = document.getElementById('roomForm');
    const editingRoomIdInput = document.getElementById('editingRoomId');
    const buildingNameSelect = document.getElementById('buildingName');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const doorsContainer = document.getElementById('doorsContainer');
    const addDoorBtn = document.getElementById('addDoorBtn');
    const saveRoomBtn = document.getElementById('saveRoomBtn');
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
    // const dataView = document.getElementById('DataView'); // Not strictly needed if only for nav
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

    // Conflict Modal elements
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

    // Filter View elements
    const filterForm = document.getElementById('filterForm');
    const filterBuildingNameInput = document.getElementById('filterBuildingName');
    const filterRoomIdentifierInput = document.getElementById('filterRoomIdentifier');
    const filterRoomPurposeSelect = document.getElementById('filterRoomPurpose');
    const filterRoomPurposeOther = document.getElementById('filterRoomPurposeOther'); // New
    const filterLightFixtureTypeSelect = document.getElementById('filterLightFixtureType');
    const filterLightFixtureTypeOther = document.getElementById('filterLightFixtureTypeOther'); // New
    const filterOverallConditionSelect = document.getElementById('filterOverallCondition');
    const filterHasAsbestosCeilingSelect = document.getElementById('filterHasAsbestosCeiling');
    const filterFloorTypeSelect = document.getElementById('filterFloorType');
    const filterFloorTypeOther = document.getElementById('filterFloorTypeOther'); // New
    // const applyFilterBtn = document.getElementById('applyFilterBtn'); // Already captured by filterForm submit
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    const filterResultsContainer = document.getElementById('filterResultsContainer');
    const filterFeedback = document.getElementById('filterFeedback');

    // LocalStorage keys
    const ROOM_DATA_KEY = 'roomAppData_rooms';
    const BUILDING_DATA_KEY = 'roomAppData_buildings';
    const LAST_USED_BUILDING_KEY = 'roomAppData_lastUsedBuilding';

    // Default buildings list
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

    // Import process variables
    let importedRoomsQueue = [];
    let currentImportIndex = 0;
    let successfullyImportedCount = 0;
    let skippedCount = 0;
    let replacedCount = 0;
    let currentConflictingRoom = null;
    let currentExistingRoom = null;

    // For modal focus restoration
    let focusedButtonBeforeModal = null;

    // Capacitor diagnostics (optional)
    setTimeout(() => {
        if (window.Capacitor) {
            if (window.Capacitor.Plugins) {
                if (!window.Capacitor.Plugins.Filesystem) console.error("DIAGNOSTIC: Capacitor.Plugins.Filesystem IS UNDEFINED.");
            } else console.error("DIAGNOSTIC: window.Capacitor.Plugins IS UNDEFINED.");
        } else console.warn("DIAGNOSTIC: window.Capacitor object NOT found. Assuming web environment for export.");
    }, 3000);

    // --- Building Data Management ---
    function getStoredBuildings() {
        const stored = localStorage.getItem(BUILDING_DATA_KEY);
        if (stored) {
            return JSON.parse(stored);
        } else {
            storeBuildings(DEFAULT_BUILDINGS);
            return [...DEFAULT_BUILDINGS];
        }
    }

    function storeBuildings(buildingsArray) {
        localStorage.setItem(BUILDING_DATA_KEY, JSON.stringify(buildingsArray.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))));
    }

    function getLastUsedBuilding() {
        return localStorage.getItem(LAST_USED_BUILDING_KEY);
    }

    function setLastUsedBuilding(buildingName) {
        localStorage.setItem(LAST_USED_BUILDING_KEY, buildingName);
    }

    function populateBuildingDropdowns(selectedBuildingForForm = null) {
        const buildings = getStoredBuildings();
        const lastUsed = getLastUsedBuilding();

        // Add filterBuildingNameInput to the list of selects to update
        const selectsToUpdate = [
            { el: buildingNameSelect, defaultOpt: "-- Select Building --", selectedVal: selectedBuildingForForm || lastUsed },
            { el: massUpdateOldBuildingNameSelect, defaultOpt: "-- Select Building to Reassign From --" },
            { el: renameOldBuildingNameSelect, defaultOpt: "-- Select Building to Rename --" },
            { el: filterBuildingNameInput, defaultOpt: "-- Any Building --" } // Added for filter
        ];

        selectsToUpdate.forEach(item => {
            if (!item.el) return;
            const currentSelect = item.el;
            const previouslySelectedValue = currentSelect.value;
            currentSelect.innerHTML = `<option value="">${item.defaultOpt}</option>`;

            let optionsHtml = "";
            const sortedBuildings = [...buildings]; // Create a mutable copy for sorting

            let valueToSelect = item.selectedVal;

            // Preserve selection for filter dropdown if it's not the main form dropdown
            if (item.el.id === 'filterBuildingName' && previouslySelectedValue && buildings.includes(previouslySelectedValue)) {
                valueToSelect = previouslySelectedValue;
            } else if (!valueToSelect && previouslySelectedValue && buildings.includes(previouslySelectedValue) && item.el.id !== 'filterBuildingName') {
                 valueToSelect = previouslySelectedValue;
            }


            if (valueToSelect && sortedBuildings.includes(valueToSelect)) {
                optionsHtml += `<option value="${escapeHtml(valueToSelect)}" selected>${escapeHtml(valueToSelect)}</option>`;
                const index = sortedBuildings.indexOf(valueToSelect);
                if (index > -1) {
                    sortedBuildings.splice(index, 1);
                }
            }

            sortedBuildings.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
            sortedBuildings.forEach(bName => {
                optionsHtml += `<option value="${escapeHtml(bName)}">${escapeHtml(bName)}</option>`;
            });
            currentSelect.innerHTML += optionsHtml;
        });
    }

    // --- Navigation and View Management ---
    function setActiveView(targetViewId) {
        views.forEach(view => view.classList.remove('active-view'));
        const targetElement = document.getElementById(targetViewId);

        if (targetElement) {
            targetElement.classList.add('active-view');
            targetElement.scrollTop = 0;
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
            populateBuildingDropdowns(); // Also populates filterBuildingNameInput
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
            if (!editingRoomIdInput.value) {
                resetRoomFormToDefault();
            }
        } else if (targetViewId === 'FilterView') {
            if(filterForm) filterForm.reset();
            if(filterRoomPurposeOther) { filterRoomPurposeOther.style.display = 'none'; filterRoomPurposeOther.value = ''; }
            if(filterLightFixtureTypeOther) { filterLightFixtureTypeOther.style.display = 'none'; filterLightFixtureTypeOther.value = ''; }
            if(filterFloorTypeOther) { filterFloorTypeOther.style.display = 'none'; filterFloorTypeOther.value = ''; }
            if(filterResultsContainer) filterResultsContainer.innerHTML = '<p class="empty-list-message">Enter filter criteria and click "Apply Filters".</p>';
            if(filterFeedback) {filterFeedback.textContent = ''; filterFeedback.className = 'feedback';}
            populateBuildingDropdowns(); // Ensure filter building dropdown is also populated
        }
    }

    function resetRoomFormToDefault() {
        if (!roomForm) return;
        clearFormAndDynamicElements(roomForm);
        editingRoomIdInput.value = '';

        const roomPurposeSelect = roomForm.querySelector('#roomPurpose');
        if (roomPurposeSelect) roomPurposeSelect.value = 'Lab';
        const roomPurposeOtherInput = roomForm.querySelector('#roomPurposeOther');
        if (roomPurposeOtherInput) roomPurposeOtherInput.value = '';

        populateBuildingDropdowns();
        if(addEditRoomTitle) addEditRoomTitle.innerHTML = '<i class="fas fa-pencil-alt"></i> Add New Room Information';
        if(saveRoomBtn) saveRoomBtn.innerHTML = '<i class="fas fa-save"></i> Save Room Information';
        if(cancelEditBtn) cancelEditBtn.style.display = 'none';
        if (feedbackMessage && (feedbackMessage.classList.contains('success') || feedbackMessage.classList.contains('error'))) {
            feedbackMessage.textContent = '';
            feedbackMessage.className = 'feedback';
        }
        if (lightFixturesContainer && lightFixturesContainer.children.length === 0) {
            appendNewLightFixtureEntry();
        }
        const overallConditionSelect = document.getElementById('overallCondition');
        if (overallConditionSelect) overallConditionSelect.value = '';

        const currentAddRoomView = document.getElementById('AddRoomView');
        if (currentAddRoomView) {
            currentAddRoomView.scrollTop = 0;
        }
        refreshConditionalFormUI(roomForm);
        window.scrollTo(0, 0); // Scroll to the top of the screen
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetViewId = this.id.replace('nav', '') + 'View';
            if (editingRoomIdInput.value && targetViewId !== 'AddRoomView' && !document.getElementById('AddRoomView').contains(e.target)) {
                if (!confirm("You have unsaved changes in the room editor. Are you sure you want to leave?")) {
                    return;
                }
                resetRoomFormToDefault();
            }
            setActiveView(targetViewId);
        });
    });

    // --- Conditional Form Logic ---
    function setupConditionalInput(selectElement, otherInputElement) {
        if (selectElement && otherInputElement) {
            const update = () => {
                const shouldBeVisible = selectElement.value === 'Other';
                otherInputElement.style.display = shouldBeVisible ? 'block' : 'none';
                if (!shouldBeVisible) otherInputElement.value = '';
            };
            selectElement.addEventListener('change', update);
            // update(); // Initial call to set correct state on load, if needed for pre-filled forms
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
            // updateVisibility(); // Initial call
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
            // updateCeilingOptions(); // Initial call
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
            // updateFloorOptionsVisibility(); // Initial call

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
                // updateFloorTileSizeOtherTextVisibility(); // Initial call
            }
        }

        setupConditionalOtherField("Specialty Equipment", "furnitureSpecialtySpecifyText", "furniture", formElement);
        setupConditionalOtherField("Other", "furnitureOtherSpecifyText", "furniture", formElement);
        setupConditionalOtherField("Other", "technologyOtherSpecifyText", "technology", formElement);
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
                if (!shouldBeVisible) otherEl.value = '';
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
                if (!shouldBeVisible) otherTextInput.value = '';
            }
        });
    }

    // --- Dynamic Form Element Appending ---
    function appendNewDoorEntry(doorData = {}) {
        if (!doorsContainer) return;
        const id = `doorInstance_${Date.now()}`;
        const div = document.createElement('div');
        div.classList.add('door-entry'); div.id = id;
        div.innerHTML = `
            <button type="button" class="remove-door-btn" aria-label="Remove this door entry"><i class="fas fa-times"></i></button>
            <h4>Door Details</h4>
            <div class="input-group"><label for="doorIdentifier-${id}">Identifier/Location:</label><input type="text" id="doorIdentifier-${id}" name="doorIdentifier" placeholder="e.g., Main Entry, Closet" value="${escapeHtml(doorData.identifier || '')}"></div>
            <div class="input-group"><label for="doorType-${id}">Type:</label><select id="doorType-${id}" name="doorType"><option value="Wood">Wood</option><option value="Metal">Metal</option><option value="Glass">Glass</option><option value="Other">Other</option></select><input type="text" id="doorTypeOther-${id}" name="doorTypeOther" class="conditional-other" placeholder="Specify other door type" style="display:none;" value="${escapeHtml(doorData.typeOther || '')}"></div>
            <div class="input-group"><label for="doorLockType-${id}">Lock Type:</label><select id="doorLockType-${id}" name="doorLockType"><option value="Key">Key</option><option value="Keypad">Keypad</option><option value="Card Reader">Card Reader</option><option value="None">None</option><option value="Other">Other</option></select><input type="text" id="doorLockTypeOther-${id}" name="doorLockTypeOther" class="conditional-other" placeholder="Specify other lock type" style="display:none;" value="${escapeHtml(doorData.lockTypeOther || '')}"></div>`;

        const doorTypeSelect = div.querySelector(`#doorType-${id}`);
        const doorTypeOtherInput = div.querySelector(`#doorTypeOther-${id}`);
        if(doorData.type) doorTypeSelect.value = doorData.type;
        setupConditionalInput(doorTypeSelect, doorTypeOtherInput);
        if (doorTypeSelect && doorTypeOtherInput) { // Ensure elements exist before setting display/value
            const shouldShow = doorTypeSelect.value === 'Other';
            doorTypeOtherInput.style.display = shouldShow ? 'block' : 'none';
            doorTypeOtherInput.value = doorData.typeOther || ''; // Set value regardless of display for prefill
        }


        const doorLockTypeSelect = div.querySelector(`#doorLockType-${id}`);
        const doorLockTypeOtherInput = div.querySelector(`#doorLockTypeOther-${id}`);
        if(doorData.lockType) doorLockTypeSelect.value = doorData.lockType;
        setupConditionalInput(doorLockTypeSelect, doorLockTypeOtherInput);
        if (doorLockTypeSelect && doorLockTypeOtherInput) { // Ensure elements exist
            const shouldShow = doorLockTypeSelect.value === 'Other';
            doorLockTypeOtherInput.style.display = shouldShow ? 'block' : 'none';
            doorLockTypeOtherInput.value = doorData.lockTypeOther || ''; // Set value regardless
        }

        doorsContainer.appendChild(div);
        div.querySelector('.remove-door-btn').addEventListener('click', () => div.remove());
    }

    if (addDoorBtn && doorsContainer) {
        addDoorBtn.addEventListener('click', function () {
            appendNewDoorEntry();
        });
    }

    function appendNewLightFixtureEntry(fixtureData = {}) {
        if (!lightFixturesContainer) return;
        const id = `lightFixture_${Date.now()}`;
        const div = document.createElement('div');
        div.classList.add('light-fixture-entry'); div.id = id;
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
                <input type="text" id="lightTypeOther-${id}" name="lightFixtureTypeOtherSpecify" class="light-fixture-other-specify" placeholder="Specify other light type" value="${escapeHtml(fixtureData.typeOtherSpecify || '')}" style="display:none;">
            </div>
            <div class="input-group">
                <label for="lightQuantity-${id}">Quantity:</label>
                <input type="number" id="lightQuantity-${id}" name="lightFixtureQuantity" min="1" value="${fixtureData.quantity || 1}" class="light-fixture-quantity" required>
            </div>
            <div class="input-group">
                <label for="lightStyle-${id}">Style:</label>
                <select id="lightStyle-${id}" name="lightFixtureStyle">
                    <option value="Parabolic with Bulbs">Parabolic w/ Bulbs</option><option value="Flat Panel">Flat Panel</option>
                    <option value="Other">Other</option>
                </select>
                <input type="text" id="lightStyleOther-${id}" name="lightFixtureStyleOtherSpecify" class="light-fixture-other-specify" placeholder="Specify other light style" value="${escapeHtml(fixtureData.styleOtherSpecify || '')}" style="display:none;">
            </div>`;

        const lightTypeSelect = div.querySelector(`#lightType-${id}`);
        const lightTypeOtherInput = div.querySelector(`#lightTypeOther-${id}`);
        if(fixtureData.type) lightTypeSelect.value = fixtureData.type;
        setupConditionalInput(lightTypeSelect, lightTypeOtherInput);
        if(lightTypeSelect && lightTypeOtherInput){ // Ensure elements exist
            const shouldShow = lightTypeSelect.value === 'Other';
            lightTypeOtherInput.style.display = shouldShow ? 'block' : 'none';
            lightTypeOtherInput.value = fixtureData.typeOtherSpecify || '';
        }


        const lightStyleSelect = div.querySelector(`#lightStyle-${id}`);
        const lightStyleOtherInput = div.querySelector(`#lightStyleOther-${id}`);
        if(fixtureData.style) lightStyleSelect.value = fixtureData.style;
        setupConditionalInput(lightStyleSelect, lightStyleOtherInput);
        if(lightStyleSelect && lightStyleOtherInput){ // Ensure elements exist
            const shouldShow = lightStyleSelect.value === 'Other';
            lightStyleOtherInput.style.display = shouldShow ? 'block' : 'none';
            lightStyleOtherInput.value = fixtureData.styleOtherSpecify || '';
        }

        lightFixturesContainer.appendChild(div);
        div.querySelector('.remove-light-fixture-btn').addEventListener('click', () => div.remove());
    }

    if (addLightFixtureBtn) {
        addLightFixtureBtn.addEventListener('click', () => {
            appendNewLightFixtureEntry();
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

    // --- Room Data Storage and Retrieval ---
    function getStoredRooms() { return JSON.parse(localStorage.getItem(ROOM_DATA_KEY) || '[]'); }
    function storeRooms(rooms) { localStorage.setItem(ROOM_DATA_KEY, JSON.stringify(rooms)); }
    function findRoom(bName, rId) { return (!bName||!rId)?null:getStoredRooms().find(r=>r.buildingName?.toLowerCase()===bName.toLowerCase()&&r.roomIdentifier?.toLowerCase()===rId.toLowerCase());}
    function findRoomById(roomId) { return getStoredRooms().find(r => r.id === roomId); }

    // --- Form Clearing and Reset ---
    function clearFormAndDynamicElements(form) {
        if (!form) return;
        form.reset();
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

    // --- Condition Value Helpers ---
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

    // --- Room Form Submission ---
    if (roomForm) {
    roomForm.addEventListener('submit', function (event) {
        event.preventDefault();
        console.log("[RoomFormSubmit] Form submission initiated.");

        if (feedbackMessage) {
            feedbackMessage.textContent = '';
            feedbackMessage.className = 'feedback';
        } else {
            console.warn("[RoomFormSubmit] feedbackMessage element not found. User feedback might be limited to alerts/console.");
        }

        const buildingNameVal = buildingNameSelect.value;
        const roomIdentifierVal = roomForm.querySelector('#roomIdentifier').value.trim();
        const currentRoomId = editingRoomIdInput.value;

        if (!buildingNameVal || !roomIdentifierVal) {
            const msg = 'Building Name and Room Identifier are required.';
            console.warn("[RoomFormSubmit] Validation failed:", msg);
            if (feedbackMessage) {
                feedbackMessage.textContent = msg;
                feedbackMessage.className = 'feedback error';
            } else {
                alert(msg);
            }
            const currentAddRoomView = document.getElementById('AddRoomView');
            if (currentAddRoomView) currentAddRoomView.scrollTop = 0;
            return;
        }

        const existingRoomWithSameIdentifiers = findRoom(buildingNameVal, roomIdentifierVal);
        if (existingRoomWithSameIdentifiers && existingRoomWithSameIdentifiers.id !== currentRoomId) {
            const msg = `Error: Room "${escapeHtml(buildingNameVal)} - ${escapeHtml(roomIdentifierVal)}" already exists.`;
            console.warn("[RoomFormSubmit] Validation failed: Duplicate room.", { buildingNameVal, roomIdentifierVal });
            if (feedbackMessage) {
                feedbackMessage.textContent = msg;
                feedbackMessage.className = 'feedback error';
            } else {
                alert(msg);
            }
            const currentAddRoomView = document.getElementById('AddRoomView');
            if (currentAddRoomView) currentAddRoomView.scrollTop = 0;
            return;
        }

        try {
            console.log("[RoomFormSubmit] Starting data collection and save operation for room:", { buildingNameVal, roomIdentifierVal, currentRoomId });
            const formData = new FormData(roomForm);
            const newRoomData = { buildingName: buildingNameVal, roomIdentifier: roomIdentifierVal };

            // Room Purpose
            newRoomData.roomPurpose = formData.get('roomPurpose');
            newRoomData.roomPurposeOther = (newRoomData.roomPurpose === 'Other') ? formData.get('roomPurposeOther').trim() : '';

            // Room Makeup
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

            // Light Fixtures
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

            // Other Fixtures
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
            // Furniture
            newRoomData.furniture = getCbVal('furniture');
            newRoomData.furnitureSpecialtySpecify = newRoomData.furniture.includes('Specialty Equipment') ? (formData.get('furnitureSpecialtySpecify') || '').trim() : '';
            newRoomData.furnitureOtherSpecify = newRoomData.furniture.includes('Other') ? (formData.get('furnitureOtherSpecify') || '').trim() : '';

            // Heating/Cooling
            newRoomData.heatingCooling = formData.get('heatingCooling');
            newRoomData.heatingCoolingOther = formData.get('heatingCooling') === 'Other' ? formData.get('heatingCoolingOther').trim() : '';

            // Doors
            newRoomData.doors = [];
            if (doorsContainer) {
                doorsContainer.querySelectorAll('.door-entry').forEach(entry => {
                    const doorIdVal = entry.querySelector('input[name="doorIdentifier"]').value.trim();
                    const doorTypeSel = entry.querySelector('select[name="doorType"]');
                    const lockTypeSel = entry.querySelector('select[name="doorLockType"]');
                    const doorTypeOtherIn = entry.querySelector('input[name="doorTypeOther"]');
                    const lockTypeOtherIn = entry.querySelector('input[name="doorLockTypeOther"]');
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

            // Technology
            newRoomData.technology = getCbVal('technology');
            newRoomData.technologyOtherSpecify = newRoomData.technology.includes('Other') ? (formData.get('technologyOtherSpecify') || '').trim() : '';

            // Condition Values
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

            console.log("[RoomFormSubmit] Data collection complete. Room data object:", newRoomData);

            addRoomToStorageInternal(newRoomData, currentRoomId);
            console.log("[RoomFormSubmit] addRoomToStorageInternal completed successfully.");

            setLastUsedBuilding(buildingNameVal);
            console.log("[RoomFormSubmit] setLastUsedBuilding completed successfully.");

            if (feedbackMessage) {
                feedbackMessage.textContent = currentRoomId ? 'Room information updated successfully!' : 'Room information saved successfully!';
                feedbackMessage.className = 'feedback success';
                console.log("[RoomFormSubmit] Success feedback displayed to user.");
            } else {
                console.warn("[RoomFormSubmit] feedbackMessage element not found, but operation was successful.");
                alert(currentRoomId ? 'Room information updated successfully! (Feedback area not found)' : 'Room information saved successfully! (Feedback area not found)');
            }

            const isEditing = !!currentRoomId;
            // Post-save UI updates
            try {
                resetRoomFormToDefault();
                console.log("[RoomFormSubmit] resetRoomFormToDefault completed.");
                if (isEditing) {
                    setTimeout(() => {
                        if (feedbackMessage?.classList.contains('success')) setActiveView('ViewRoomsView');
                        console.log("[RoomFormSubmit] Navigated to ViewRoomsView (after edit).");
                    }, 1500);
                } else {
                    setTimeout(() => {
                        if (feedbackMessage?.classList.contains('success')) setActiveView('ViewRoomsView');
                        console.log("[RoomFormSubmit] Navigated to ViewRoomsView (after add).");
                    }, 1500);
                }
            } catch (uiError) {
                console.error("[RoomFormSubmit] Error during post-save UI updates (reset/navigation):", uiError);
                // Data was saved, but UI update failed. The success message for saving is already shown.
                // Optionally, inform the user about the UI glitch if critical.
                if (feedbackMessage) {
                    // Append to existing success message or add a new one if appropriate
                    // For now, just log, as primary save was successful.
                }
            }

        } catch (error) {
            console.error('[RoomFormSubmit] CRITICAL ERROR during room save process:', error);
            const errorMsg = 'Failed to save room information. An unexpected error occurred. Please try again. If the problem persists, check the console for more details.';
            if (feedbackMessage) {
                feedbackMessage.textContent = errorMsg;
                feedbackMessage.className = 'feedback error';
            } else {
                alert(errorMsg); // Fallback if feedbackMessage element is somehow missing
            }
            // Scroll to the top of the form to make feedback visible
            const currentAddRoomView = document.getElementById('AddRoomView');
            if (currentAddRoomView) currentAddRoomView.scrollTop = 0;
        }
    });
}

    if(cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to cancel editing? Any unsaved changes will be lost.")) {
                resetRoomFormToDefault();
                setActiveView('ViewRoomsView');
            }
        });
    }

    function addRoomToStorageInternal(roomData, replaceId = null) {
        let rooms = getStoredRooms();
        if (replaceId) {
            const roomIndex = rooms.findIndex(r => r.id === replaceId);
            if (roomIndex > -1) {
                roomData.id = replaceId;
                roomData.savedAt = new Date().toISOString();
                rooms[roomIndex] = roomData;
            } else {
                roomData.id = `room_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
                roomData.savedAt = new Date().toISOString();
                rooms.push(roomData);
            }
        } else {
            roomData.id = `room_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
            roomData.savedAt = new Date().toISOString();
            rooms.push(roomData);
        }
        storeRooms(rooms);
        const buildings = getStoredBuildings();
        if (roomData.buildingName && !buildings.includes(roomData.buildingName)) {
            buildings.push(roomData.buildingName);
            storeBuildings(buildings);
            populateBuildingDropdowns();
        }
    }

    // --- Populate Form for Editing ---
    function populateFormForEditing(roomId) {
        const room = findRoomById(roomId);
        if (!room) {
            // Using a less intrusive feedback for "room not found"
            if(feedbackMessage) {
                feedbackMessage.textContent = "Error: Could not find room to edit.";
                feedbackMessage.className = "feedback error";
            } else {
                console.error("Error: Could not find room to edit and feedbackMessage element is not available.");
            }
            return;
        }
        resetRoomFormToDefault();
        editingRoomIdInput.value = room.id;
        if(addEditRoomTitle) addEditRoomTitle.innerHTML = `<i class="fas fa-edit"></i> Edit Room: ${escapeHtml(room.buildingName)} - ${escapeHtml(room.roomIdentifier)}`;
        if(saveRoomBtn) saveRoomBtn.innerHTML = '<i class="fas fa-save"></i> Update Room Information';
        if(cancelEditBtn) cancelEditBtn.style.display = 'inline-flex';
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
                    } else if (makeup.ceiling && makeup.ceiling.tileSize) { // Legacy data migration attempt
                        const oldCeilingTileSize = String(makeup.ceiling.tileSize);
                        if (oldCeilingTileSize === "9") {
                            targetFloorTileSize = "9x9";
                        } else if (oldCeilingTileSize === "12") {
                            targetFloorTileSize = "12x12";
                        }
                    }
                    if (targetFloorTileSize) {
                        const floorTileSizeRadio = roomForm.querySelector(`input[name="floorTileSize"][value="${targetFloorTileSize}"]`);
                        if (floorTileSizeRadio) floorTileSizeRadio.checked = true;
                        else { // Default if value not found (e.g. old data)
                             const defaultFloorTileSize = roomForm.querySelector(`input[name="floorTileSize"][value="12x12"]`);
                             if(defaultFloorTileSize) defaultFloorTileSize.checked = true;
                        }
                        if (targetFloorTileSize === 'Other' && targetFloorTileSizeOther) {
                            const floorTileSizeOtherEl = roomForm.querySelector('#floorTileSizeOther');
                            if (floorTileSizeOtherEl) floorTileSizeOtherEl.value = targetFloorTileSizeOther;
                        }
                    } else { // Default if no tile size info
                        const defaultFloorTileSize = roomForm.querySelector(`input[name="floorTileSize"][value="12x12"]`);
                        if(defaultFloorTileSize) defaultFloorTileSize.checked = true;
                    }
                }
            }
        }
        if (lightFixturesContainer) lightFixturesContainer.innerHTML = '';
        if (room.lightFixtures && room.lightFixtures.length > 0) {
            room.lightFixtures.forEach(fixture => appendNewLightFixtureEntry(fixture));
        } else {
            appendNewLightFixtureEntry();
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
        }
        roomForm.querySelectorAll('input[name="technology"]').forEach(cb => cb.checked = false);
        if (room.technology && room.technology.length > 0) {
            room.technology.forEach(tItem => {
                const cb = roomForm.querySelector(`input[name="technology"][value="${tItem}"]`);
                if (cb) cb.checked = true;
            });
            if (room.technology.includes('Other')) {
                const techOtherText = roomForm.querySelector('#technologyOtherSpecifyText');
                if(techOtherText) techOtherText.value = room.technologyOtherSpecify || '';
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
        refreshConditionalFormUI(roomForm);
        setActiveView('AddRoomView');
    }

    // --- Render Room List (for ViewRoomsView and FilterResults) ---
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
                targetContainer.appendChild(createRoomCard(room, true)); // Pass true for filter results
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
                    roomsContainerElement.appendChild(createRoomCard(room, false)); // Pass false for regular view
                });
                const toggleExpansion = () => {
                    const isExpanded = buildingHeader.classList.toggle('expanded');
                    buildingHeader.setAttribute('aria-expanded', isExpanded.toString());
                };
                buildingHeader.addEventListener('click', toggleExpansion);
                buildingHeader.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpansion(); }
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

    // Event delegation for room card actions
    document.querySelector('.content-area').addEventListener('click', function(event) {
        const targetButton = event.target.closest('button.action-button');
        if (!targetButton) return;
        const roomId = targetButton.dataset.roomId;
        if (targetButton.classList.contains('view-details-btn')) {
            focusedButtonBeforeModal = targetButton; // Store button for focus restoration
            displayRoomDetails(roomId);
        } else if (targetButton.classList.contains('edit-room-btn')) {
            populateFormForEditing(roomId);
        } else if (targetButton.classList.contains('delete-room-btn')) {
            const room = findRoomById(roomId);
            if (confirm(`Are you sure you want to delete room: ${escapeHtml(room?.roomIdentifier)} in ${escapeHtml(room?.buildingName)}? This action cannot be undone.`)) {
                deleteRoom(roomId);
            }
        }
    });

    function escapeHtml(unsafe) {return unsafe==null?'':String(unsafe).replace(/[&<"'>]/g,m=>({'&':'&amp;','<':'&lt;','"':'&quot;',"'":'&#039;','>':'&gt;'})[m]);}

    // --- Room Details Modal ---
    function formatRoomDataForPreview(room) {
        if (!room) return '<p>N/A</p>';
        let html = `<p><strong>Building:</strong> ${escapeHtml(room.buildingName)}</p><p><strong>Room ID:</strong> ${escapeHtml(room.roomIdentifier)}</p>`;
        let purposeDisplay = escapeHtml(room.roomPurpose) || 'N/A';
        if (room.roomPurpose === 'Other' && room.roomPurposeOther) {
            purposeDisplay = `${escapeHtml(room.roomPurpose)} (${escapeHtml(room.roomPurposeOther)})`;
        } else if (!room.roomPurpose) purposeDisplay = 'N/A';
        html += `<p><strong>Purpose:</strong> ${purposeDisplay}</p>`;
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
        let html = `<h2>${escapeHtml(room.buildingName)} - ${escapeHtml(room.roomIdentifier)}</h2>`;
        html += `<p><strong>Saved At:</strong> ${new Date(room.savedAt).toLocaleString()}</p>`;
        let purposeDisplay = escapeHtml(room.roomPurpose) || 'N/A';
        if (room.roomPurpose === 'Other' && room.roomPurposeOther) purposeDisplay = `${escapeHtml(room.roomPurpose)} (${escapeHtml(room.roomPurposeOther)})`;
        else if (!room.roomPurpose) purposeDisplay = 'N/A';
        html += `<h3><i class="fas fa-map-pin"></i> Purpose</h3><p>${purposeDisplay}</p>`;
        html += `<h3><i class="fas fa-paint-roller"></i> Room Makeup</h3>`;
        if (room.roomMakeup) {
            html += `<p><strong>Walls:</strong> ${escapeHtml(room.roomMakeup.walls)} ${room.roomMakeup.wallsOther ? `(${escapeHtml(room.roomMakeup.wallsOther)})` : ''}</p>`;
            if (room.roomMakeup.ceiling) {
                html += `<p><strong>Ceiling Type:</strong> ${escapeHtml(room.roomMakeup.ceiling.type)} ${room.roomMakeup.ceiling.typeOther ? `(${escapeHtml(room.roomMakeup.ceiling.typeOther)})` : ''}`;
                if (room.roomMakeup.ceiling.type === 'Drop Ceiling') {
                     html += ` (Asbestos: ${escapeHtml(room.roomMakeup.ceiling.asbestosInCeiling||'N/A')})`;
                }
                html += `</p>`;
            }
            if (room.roomMakeup.floor) {
                let floorText = `<strong>Floor Type:</strong> ${escapeHtml(room.roomMakeup.floor.type)}`;
                if (room.roomMakeup.floor.type === 'Other' && room.roomMakeup.floor.typeOther) {
                    floorText += ` (${escapeHtml(room.roomMakeup.floor.typeOther)})`;
                }
                html += `<p>${floorText}</p>`;
                if (room.roomMakeup.floor.type === 'Tile' && room.roomMakeup.floor.tileSize) {
                    let tileSizeText = `<strong>Floor Tile Size:</strong> ${escapeHtml(room.roomMakeup.floor.tileSize)}`;
                    if (room.roomMakeup.floor.tileSize === 'Other' && room.roomMakeup.floor.tileSizeOther) {
                        tileSizeText += ` (${escapeHtml(room.roomMakeup.floor.tileSizeOther)})`;
                    }
                    html += `<p>${tileSizeText}</p>`;
                }
            } else {  html += '<p><strong>Floor Type:</strong> N/A</p>'; }
        } else html += '<p>N/A</p>';
        html += `<h3><i class="fas fa-lightbulb"></i> Room Fixtures</h3>`;
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
        html += `<h3><i class="fas fa-couch"></i> Furniture</h3>`;
        if (room.furniture && room.furniture.length > 0) {
            html += `<ul>${room.furniture.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>`;
            if (room.furnitureSpecialtySpecify) html += `<p><em>Specialty:</em> ${escapeHtml(room.furnitureSpecialtySpecify)}</p>`;
            if (room.furnitureOtherSpecify) html += `<p><em>Other:</em> ${escapeHtml(room.furnitureOtherSpecify)}</p>`;
        } else html += '<p>N/A</p>';
        html += `<h3><i class="fas fa-thermometer-half"></i> Heating/Cooling</h3><p>${escapeHtml(room.heatingCooling) || 'N/A'} ${room.heatingCoolingOther ? `(${escapeHtml(room.heatingCoolingOther)})` : ''}</p>`;
        html += `<h3><i class="fas fa-door-open"></i> Doors</h3>`;
        if (room.doors?.length > 0) {
            html += `<ul>${room.doors.map(d => `<li>ID: ${escapeHtml(d.identifier||'N/A')}, Type: ${escapeHtml(d.type)}${d.typeOther?` (${escapeHtml(d.typeOther)})`:''}, Lock: ${escapeHtml(d.lockType)}${d.lockTypeOther?` (${escapeHtml(d.lockTypeOther)})`:''}</li>`).join('')}</ul>`;
        } else html += `<p>N/A</p>`;
        html += `<h3><i class="fas fa-tv"></i> Technology</h3>`;
        if (room.technology && room.technology.length > 0) {
            html += `<ul>${room.technology.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`;
             if (room.technologyOtherSpecify) html += `<p><em>Other:</em> ${escapeHtml(room.technologyOtherSpecify)}</p>`;
        } else html += '<p>N/A</p>';
        html += `<h3><i class="fas fa-star-half-alt"></i> Condition Values</h3>`;
        if (room.conditionValues) {
            const cv = room.conditionValues;
            html += `<p><strong>Ceiling:</strong> ${escapeHtml(cv.ceiling) || 'N/A'}</p>`;
            if(cv.ceilingComment) html += `<p class="condition-comment">${escapeHtml(cv.ceilingComment)}</p>`;
            html += `<p><strong>Walls:</strong> ${escapeHtml(cv.walls) || 'N/A'}</p>`;
            if(cv.wallsComment) html += `<p class="condition-comment">${escapeHtml(cv.wallsComment)}</p>`;
            html += `<p><strong>Furniture:</strong> ${escapeHtml(cv.furniture) || 'N/A'}</p>`;
            if(cv.furnitureComment) html += `<p class="condition-comment">${escapeHtml(cv.furnitureComment)}</p>`;
            html += `<p><strong>Floor:</strong> ${escapeHtml(cv.floor) || 'N/A'}</p>`;
            if(cv.floorComment) html += `<p class="condition-comment">${escapeHtml(cv.floorComment)}</p>`;
            html += `<p><strong>Overall Room:</strong> ${escapeHtml(cv.overall) || 'N/A (Not Set/Calculated)'}</p>`;
            if(cv.overallComment) html += `<p class="condition-comment">${escapeHtml(cv.overallComment)}</p>`;
        } else html += '<p>N/A</p>';
        roomDetailContent.innerHTML = html;
        roomDetailModal.style.display = 'block';
        if(closeModalBtn) closeModalBtn.focus();
    }

    function deleteRoom(roomId) {
        const room = findRoomById(roomId);
        storeRooms(getStoredRooms().filter(r => r.id !== roomId));
        renderRoomList();
        if (document.getElementById('FilterView').classList.contains('active-view')) {
            applyFilters();
        }
        populateBuildingDropdowns();
        const firstBuildingHeader = roomListContainer?.querySelector('.building-header');
        if (firstBuildingHeader) firstBuildingHeader.focus(); else navLinks[0]?.focus();
        if (roomDetailModal?.style.display === 'block') closeModal();
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
        closeModalBtn.onkeydown = e => { if (e.key==='Enter'||e.key===' ') {e.preventDefault();closeModal();}};
    }

    // --- Data Management ---
    function displayFullJsonForExport() {
        if (!jsonDisplayArea) return;
        const rooms = getStoredRooms();
        jsonDisplayArea.value = rooms.length > 0 ? JSON.stringify(rooms, null, 4) : 'No data to display.';
        if (exportFeedback) {exportFeedback.className = 'feedback'; exportFeedback.textContent = '';}
    }

    if (addBuildingBtn) {
        addBuildingBtn.addEventListener('click', () => {
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
            buildings.push(newName);
            storeBuildings(buildings);
            populateBuildingDropdowns();
            newBuildingNameInput.value = '';
            buildingManagementFeedback.textContent = `Building "${escapeHtml(newName)}" added successfully.`;
            buildingManagementFeedback.className = 'feedback success';
        });
    }

    if (renameBuildingBtn) {
        renameBuildingBtn.addEventListener('click', () => {
            if (buildingManagementFeedback) { buildingManagementFeedback.textContent = ''; buildingManagementFeedback.className = 'feedback'; }
            const oldName = renameOldBuildingNameSelect.value;
            const newName = renameNewBuildingNameInput.value.trim();
            if (!oldName) {
                buildingManagementFeedback.textContent = 'Please select the building you want to rename.';
                buildingManagementFeedback.className = 'feedback error'; return;
            }
            if (!newName) {
                buildingManagementFeedback.textContent = 'Please enter the new name for the building.';
                buildingManagementFeedback.className = 'feedback error'; return;
            }
            if (oldName.toLowerCase() === newName.toLowerCase()) {
                buildingManagementFeedback.textContent = 'New name is the same as the current one. No changes made.';
                buildingManagementFeedback.className = 'feedback info'; return;
            }
            let buildings = getStoredBuildings();
            if (buildings.some(b => b.toLowerCase() === newName.toLowerCase())) {
                buildingManagementFeedback.textContent = `A building named "${escapeHtml(newName)}" already exists. Cannot rename.`;
                buildingManagementFeedback.className = 'feedback error'; return;
            }
            if (confirm(`Are you sure you want to rename building "${escapeHtml(oldName)}" to "${escapeHtml(newName)}"? This will update the building name in all associated rooms.`)) {
                const buildingIndex = buildings.findIndex(b => b === oldName);
                if (buildingIndex > -1) {
                    buildings[buildingIndex] = newName;
                    storeBuildings(buildings);
                }
                let rooms = getStoredRooms();
                let roomsUpdatedCount = 0;
                rooms = rooms.map(room => {
                    if (room.buildingName === oldName) {
                        room.buildingName = newName;
                        room.savedAt = new Date().toISOString();
                        roomsUpdatedCount++;
                    }
                    return room;
                });
                storeRooms(rooms);
                populateBuildingDropdowns();
                renderRoomList();
                if (getLastUsedBuilding() === oldName) setLastUsedBuilding(newName);
                renameOldBuildingNameSelect.value = '';
                renameNewBuildingNameInput.value = '';
                buildingManagementFeedback.textContent = `Building "${escapeHtml(oldName)}" successfully renamed to "${escapeHtml(newName)}". ${roomsUpdatedCount} room(s) updated.`;
                buildingManagementFeedback.className = 'feedback success';
            } else {
                buildingManagementFeedback.textContent = 'Rename operation cancelled.';
                buildingManagementFeedback.className = 'feedback info';
            }
        });
    }

    if (massUpdateBuildingNameBtn) {
        massUpdateBuildingNameBtn.addEventListener('click', () => {
            if (massUpdateFeedback) { massUpdateFeedback.textContent = ''; massUpdateFeedback.className = 'feedback'; }
            const oldName = massUpdateOldBuildingNameSelect.value;
            const newName = massUpdateNewBuildingNameInput.value.trim();
            if (!oldName) {
                massUpdateFeedback.textContent = 'Please select the current building name to reassign rooms from.';
                massUpdateFeedback.className = 'feedback error'; return;
            }
            if (!newName) {
                massUpdateFeedback.textContent = 'Please enter the new building name for these rooms.';
                massUpdateFeedback.className = 'feedback error'; return;
            }
            if (oldName === newName) {
                massUpdateFeedback.textContent = 'New building name is the same as the current one. No changes made to rooms.';
                massUpdateFeedback.className = 'feedback info'; return;
            }
            let buildings = getStoredBuildings();
            if (!buildings.some(b => b.toLowerCase() === newName.toLowerCase())) {
                if (!confirm(`The building "${escapeHtml(newName)}" does not exist. Do you want to add it and then reassign rooms?`)) {
                    massUpdateFeedback.textContent = 'Mass update cancelled. Target building does not exist.';
                    massUpdateFeedback.className = 'feedback info'; return;
                }
                buildings.push(newName);
                storeBuildings(buildings);
                populateBuildingDropdowns();
            }
            const rooms = getStoredRooms();
            const roomsInSelectedBuilding = rooms.filter(room => room.buildingName === oldName);
            if (roomsInSelectedBuilding.length === 0) {
                massUpdateFeedback.textContent = `No rooms currently assigned to building "${escapeHtml(oldName)}".`;
                massUpdateFeedback.className = 'feedback info'; return;
            }
            for (const room of roomsInSelectedBuilding) {
                if (findRoom(newName, room.roomIdentifier)) {
                     massUpdateFeedback.textContent = `Error: Reassigning rooms to "${escapeHtml(newName)}" would cause a conflict for room "${escapeHtml(room.roomIdentifier)}", which already exists with that identifier in the target building. Please resolve conflicts first or choose a different new name.`;
                     massUpdateFeedback.className = 'feedback error'; return;
                }
            }
            if (confirm(`Are you sure you want to reassign ${roomsInSelectedBuilding.length} room(s) from building "${escapeHtml(oldName)}" to "${escapeHtml(newName)}"?`)) {
                let updatedCount = 0;
                const updatedRooms = rooms.map(room => {
                    if (room.buildingName === oldName) {
                        room.buildingName = newName;
                        room.savedAt = new Date().toISOString();
                        updatedCount++;
                    }
                    return room;
                });
                storeRooms(updatedRooms);
                massUpdateFeedback.textContent = `Successfully reassigned ${updatedCount} room(s) from "${escapeHtml(oldName)}" to "${escapeHtml(newName)}".`;
                massUpdateFeedback.className = 'feedback success';
                massUpdateOldBuildingNameSelect.value = '';
                massUpdateNewBuildingNameInput.value = '';
                populateBuildingDropdowns();
                renderRoomList();
            } else {
                massUpdateFeedback.textContent = 'Mass update cancelled.';
                massUpdateFeedback.className = 'feedback info';
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
                    }).catch(e => {
                        console.error('Navigator.clipboard error:', e);
                        exportFeedback.textContent = 'Copying JSON failed completely. See console.';
                        exportFeedback.className = 'feedback error';
                    });
                }
            }
            window.getSelection().removeAllRanges();
        });
    }

    if (importJsonFileBtn && jsonImportFile) {
        importJsonFileBtn.addEventListener('click', () => {
            if (jsonImportFile.files.length === 0) {
                if(importFeedback){ importFeedback.textContent = 'Please select a JSON file.'; importFeedback.className = 'feedback error'; }
                return;
            }
            const file = jsonImportFile.files[0];
            const reader = new FileReader();
            reader.onload = function(e) { processImportedJsonString(e.target.result); };
            reader.onerror = function(e) {
                console.error("File reading error:", e);
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
            roomObject.roomMakeup.ceiling && roomObject.roomMakeup.ceiling.tileSize) { // Check for old ceiling tile size data
            const oldCeilingTileSize = String(roomObject.roomMakeup.ceiling.tileSize);
            if (oldCeilingTileSize === "9") roomObject.roomMakeup.floor.tileSize = "9x9";
            else if (oldCeilingTileSize === "12") roomObject.roomMakeup.floor.tileSize = "12x12";
            // delete roomObject.roomMakeup.ceiling.tileSize; // Optionally remove old field
        }
    }

    function processImportedJsonString(jsonString) {
        if(importFeedback) {importFeedback.className = 'feedback'; importFeedback.textContent = '';}
        try {
            const data = JSON.parse(jsonString);
            if (!Array.isArray(data)) throw new Error('JSON must be an array.');
            const currentBuildings = getStoredBuildings();
            let newBuildingsFound = false;
            data.forEach(room => {
                if (room && room.buildingName && !currentBuildings.includes(room.buildingName)) {
                    currentBuildings.push(room.buildingName);
                    newBuildingsFound = true;
                }
                tryMigrateRoomTileData(room); // Attempt to migrate old tile data
            });
            if (newBuildingsFound) storeBuildings(currentBuildings);
            importedRoomsQueue = data.filter(r => r && typeof r === 'object' && r.buildingName && r.roomIdentifier);
            if (importedRoomsQueue.length === 0) {
                importFeedback.textContent = 'No valid room objects with buildingName and roomIdentifier found in JSON.';
                importFeedback.className = 'feedback error'; return;
            }
            currentImportIndex = 0; successfullyImportedCount = 0; skippedCount = 0; replacedCount = 0;
            importFeedback.textContent = `Starting import of ${importedRoomsQueue.length} room(s)...`;
            importFeedback.className = 'feedback info';
            processImportQueue();
        } catch (e) {
            console.error('Error processing JSON for import:', e);
            importFeedback.textContent = `Error: ${e.message}`; importFeedback.className = 'feedback error';
        }
    }

    function processImportQueue() {
        if(modifyConflictFeedback){modifyConflictFeedback.className='feedback';modifyConflictFeedback.textContent='';}
        if (currentImportIndex >= importedRoomsQueue.length) {
            let summary = `Import complete. Successfully imported: ${successfullyImportedCount}. Replaced: ${replacedCount}. Skipped: ${skippedCount}.`;
            importFeedback.textContent = summary;
            importFeedback.className = (successfullyImportedCount > 0 || replacedCount > 0) ? 'feedback success' : 'feedback info';
            renderRoomList(); populateBuildingDropdowns();
            if (jsonImportFile) jsonImportFile.value = ''; if (jsonPasteArea) jsonPasteArea.value = '';
            return;
        }
        const roomToImport = { ...importedRoomsQueue[currentImportIndex] }; // Shallow copy to avoid modifying original queue item
        delete roomToImport.id; delete roomToImport.savedAt; // Remove existing ID and savedAt if present
        currentExistingRoom = findRoom(roomToImport.buildingName, roomToImport.roomIdentifier);
        if (currentExistingRoom) {
            currentConflictingRoom = roomToImport;
            showConflictModal(currentConflictingRoom, currentExistingRoom);
        } else {
            addRoomToStorageInternal(roomToImport);
            successfullyImportedCount++; currentImportIndex++; processImportQueue();
        }
    }

    function showConflictModal(newRoom, existingRoom) {
        if (!conflictModal || !importingRoomDetailsPreview || !existingRoomDetailsPreview || !conflictBuildingNew || !conflictRoomIDNew) return;
        importingRoomDetailsPreview.innerHTML = formatRoomDataForPreview(newRoom);
        existingRoomDetailsPreview.innerHTML = formatRoomDataForPreview(existingRoom);
        conflictBuildingNew.value = newRoom.buildingName; conflictRoomIDNew.value = newRoom.roomIdentifier;
        conflictModal.style.display = 'block'; conflictBuildingNew.focus();
    }

    function closeConflictModal() {
        if (conflictModal) conflictModal.style.display = 'none';
        currentConflictingRoom = null; currentExistingRoom = null;
        if (modifyConflictFeedback) {modifyConflictFeedback.className='feedback';modifyConflictFeedback.textContent='';}
    }

    if(closeConflictModalBtn) closeConflictModalBtn.onclick = () => { skippedCount++; currentImportIndex++; closeConflictModal(); processImportQueue(); };
    if(skipConflictBtn) skipConflictBtn.onclick = () => { skippedCount++; currentImportIndex++; closeConflictModal(); processImportQueue(); };
    if(replaceConflictBtn) replaceConflictBtn.onclick = () => {
        if (currentConflictingRoom && currentExistingRoom) {
            tryMigrateRoomTileData(currentConflictingRoom); // Ensure data migration for replacement too
            currentConflictingRoom.id = currentExistingRoom.id; // Use existing ID for replacement
            addRoomToStorageInternal(currentConflictingRoom, currentExistingRoom.id); // Pass ID to ensure replacement
            replacedCount++;
        }
        currentImportIndex++; closeConflictModal(); processImportQueue();
    };
    if(saveModifiedConflictBtn) {
        saveModifiedConflictBtn.onclick = () => {
            if (!currentConflictingRoom || !conflictBuildingNew || !conflictRoomIDNew || !modifyConflictFeedback) return;
            const newBuilding = conflictBuildingNew.value.trim(); const newRoomIdVal = conflictRoomIDNew.value.trim();
            if (!newBuilding || !newRoomIdVal) { modifyConflictFeedback.textContent = 'Building Name and Room ID cannot be empty.'; modifyConflictFeedback.className = 'feedback error'; return; }
            const stillExisting = findRoom(newBuilding, newRoomIdVal);
            if (stillExisting && stillExisting.id !== currentExistingRoom?.id) { // Check if new identifiers conflict with *another* existing room
                modifyConflictFeedback.textContent = 'Conflict: Modified identifiers match another existing room.';
                modifyConflictFeedback.className = 'feedback error';
                existingRoomDetailsPreview.innerHTML = formatRoomDataForPreview(stillExisting); // Show the *other* conflicting room
                return;
            } else if (currentExistingRoom && // Check if identifiers still match the *original* conflicting room
                       newBuilding.toLowerCase() === currentExistingRoom.buildingName.toLowerCase() &&
                       newRoomIdVal.toLowerCase() === currentExistingRoom.roomIdentifier.toLowerCase()) {
                modifyConflictFeedback.textContent = 'Identifiers still match the original conflicting room. Please change them or choose another option.';
                modifyConflictFeedback.className = 'feedback error'; return;
            }
            currentConflictingRoom.buildingName = newBuilding;
            currentConflictingRoom.roomIdentifier = newRoomIdVal;
            delete currentConflictingRoom.id; // Ensure it's treated as a new entry if identifiers changed
            tryMigrateRoomTileData(currentConflictingRoom); // Ensure data migration
            addRoomToStorageInternal(currentConflictingRoom);
            successfullyImportedCount++; currentImportIndex++; closeConflictModal(); processImportQueue();
        };
    }

    // --- Conditional Input Logic for Filter "Other" fields ---
    function setupFilterConditionalInput(selectElement, otherInputElement) {
        if (selectElement && otherInputElement) {
            const update = () => {
                const shouldBeVisible = selectElement.value === 'Other';
                otherInputElement.style.display = shouldBeVisible ? 'block' : 'none';
                if (!shouldBeVisible) otherInputElement.value = '';
            };
            selectElement.addEventListener('change', update);
            update(); // Initial check to set correct state on load
        }
    }

    // Initialize conditional inputs for the filter form
    if (filterRoomPurposeSelect && filterRoomPurposeOther) {
        setupFilterConditionalInput(filterRoomPurposeSelect, filterRoomPurposeOther);
    }
    if (filterLightFixtureTypeSelect && filterLightFixtureTypeOther) {
        setupFilterConditionalInput(filterLightFixtureTypeSelect, filterLightFixtureTypeOther);
    }
    if (filterFloorTypeSelect && filterFloorTypeOther) {
        setupFilterConditionalInput(filterFloorTypeSelect, filterFloorTypeOther);
    }


    // --- Filter Logic ---
    function applyFilters() {
        if (!filterResultsContainer || !filterFeedback) return;
        filterFeedback.textContent = '';
        filterFeedback.className = 'feedback';

        const buildingNameFilter = filterBuildingNameInput.value.trim().toLowerCase();
        const roomIdentifierFilter = filterRoomIdentifierInput.value.trim().toLowerCase();
        const roomPurposeFilter = filterRoomPurposeSelect.value;
        const roomPurposeOtherFilter = filterRoomPurposeOther.value.trim().toLowerCase();
        const lightFixtureTypeFilter = filterLightFixtureTypeSelect.value;
        const lightFixtureTypeOtherFilter = filterLightFixtureTypeOther.value.trim().toLowerCase();
        const overallConditionFilter = filterOverallConditionSelect.value;
        const asbestosCeilingFilter = filterHasAsbestosCeilingSelect.value;
        const floorTypeFilter = filterFloorTypeSelect.value;
        const floorTypeOtherFilter = filterFloorTypeOther.value.trim().toLowerCase();


        const allRooms = getStoredRooms();
        const filteredRooms = allRooms.filter(room => {
            let match = true;

            if (buildingNameFilter && (!room.buildingName || !room.buildingName.toLowerCase().includes(buildingNameFilter))) {
                match = false;
            }
            if (match && roomIdentifierFilter && (!room.roomIdentifier || !room.roomIdentifier.toLowerCase().startsWith(roomIdentifierFilter))) {
                match = false;
            }
            // Room Purpose Filter
            if (match && roomPurposeFilter) {
                if (roomPurposeFilter === 'Other') {
                    // Match if roomPurpose is 'Other' AND roomPurposeOther contains the filter text
                    if (!(room.roomPurpose === 'Other' && room.roomPurposeOther && room.roomPurposeOther.toLowerCase().includes(roomPurposeOtherFilter))) {
                        match = false;
                    }
                } else if (room.roomPurpose !== roomPurposeFilter) {
                    match = false;
                }
            }
            // Light Fixture Type Filter
            if (match && lightFixtureTypeFilter) {
                if (lightFixtureTypeFilter === 'Other') {
                    // Match if any light fixture is 'Other' AND its typeOtherSpecify contains the filter text
                    if (!room.lightFixtures || !room.lightFixtures.some(fixture =>
                        fixture.type === 'Other' && fixture.typeOtherSpecify && fixture.typeOtherSpecify.toLowerCase().includes(lightFixtureTypeOtherFilter))) {
                        match = false;
                    }
                } else {
                    if (!room.lightFixtures || !room.lightFixtures.some(fixture => fixture.type === lightFixtureTypeFilter)) {
                        match = false;
                    }
                }
            }
            if (match && overallConditionFilter && (!room.conditionValues || room.conditionValues.overall !== overallConditionFilter)) {
                match = false;
            }
            if (match && asbestosCeilingFilter) {
                if (room.roomMakeup?.ceiling?.type === 'Drop Ceiling') {
                    if (room.roomMakeup.ceiling.asbestosInCeiling !== asbestosCeilingFilter) {
                        match = false;
                    }
                } else { // If it's not a drop ceiling, it cannot match a specific asbestos filter value
                    match = false;
                }
            }
            // Floor Type Filter
            if (match && floorTypeFilter) {
                if (floorTypeFilter === 'Other') {
                    // Match if floor.type is 'Other' AND floor.typeOther contains the filter text
                    if (!(room.roomMakeup?.floor?.type === 'Other' && room.roomMakeup.floor.typeOther && room.roomMakeup.floor.typeOther.toLowerCase().includes(floorTypeOtherFilter))) {
                        match = false;
                    }
                } else if (!room.roomMakeup?.floor || room.roomMakeup.floor.type !== floorTypeFilter) {
                    match = false;
                }
            }
            return match;
        });

        renderRoomList(filteredRooms, filterResultsContainer, true);
        if (filteredRooms.length > 0) {
            filterFeedback.textContent = `Found ${filteredRooms.length} room(s) matching your criteria.`;
            filterFeedback.className = 'feedback success';
        } else {
            filterFeedback.textContent = 'No rooms found matching your criteria.';
            filterFeedback.className = 'feedback info';
        }
    }

    if (filterForm) {
        filterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            applyFilters();
        });
    }

    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', function() {
            if (filterForm) filterForm.reset();
            // Explicitly hide and clear "Other" text fields for filters
            if (filterRoomPurposeOther) { filterRoomPurposeOther.style.display = 'none'; filterRoomPurposeOther.value = ''; }
            if (filterLightFixtureTypeOther) { filterLightFixtureTypeOther.style.display = 'none'; filterLightFixtureTypeOther.value = ''; }
            if (filterFloorTypeOther) { filterFloorTypeOther.style.display = 'none'; filterFloorTypeOther.value = ''; }

            if (filterResultsContainer) filterResultsContainer.innerHTML = '<p class="empty-list-message">Enter filter criteria and click "Apply Filters".</p>';
            if (filterFeedback) {
                filterFeedback.textContent = '';
                filterFeedback.className = 'feedback';
            }
        });
    }

    // --- Global Event Listeners ---
    window.onkeydown = e => {
        if (e.key==='Escape') {
            if (conflictModal?.style.display==='block') {
                skippedCount++; currentImportIndex++; closeConflictModal(); processImportQueue();
            } else if (roomDetailModal?.style.display==='block') {
                closeModal();
            } else if (editingRoomIdInput.value && document.getElementById('AddRoomView')?.classList.contains('active-view')) {
                if(cancelEditBtn) cancelEditBtn.click();
            }
        }
    };
    window.onclick = e => {
        if (e.target==roomDetailModal) closeModal();
        else if (e.target==conflictModal) {
            skippedCount++; currentImportIndex++; closeConflictModal(); processImportQueue();
        }
    };

    // --- Initial App Setup ---
    if (roomForm) {
        initializeFormConditionalLogic(roomForm);
        refreshConditionalFormUI(roomForm); // Call refresh to ensure UI is correct on load
    }
    if (lightFixturesContainer && lightFixturesContainer.children.length === 0) {
        appendNewLightFixtureEntry();
    }

    populateBuildingDropdowns();
    setActiveView('ViewRoomsView'); // Or your preferred default view
    console.log("App Initial Setup: Complete.");
});