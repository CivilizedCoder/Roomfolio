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
    const filterRoomPurposeOther = document.getElementById('filterRoomPurposeOther');
    const filterLightFixtureTypeSelect = document.getElementById('filterLightFixtureType');
    const filterLightFixtureTypeOther = document.getElementById('filterLightFixtureTypeOther');
    const filterOverallConditionSelect = document.getElementById('filterOverallCondition');
    const filterHasAsbestosCeilingSelect = document.getElementById('filterHasAsbestosCeiling');
    const filterFloorTypeSelect = document.getElementById('filterFloorType');
    const filterFloorTypeOther = document.getElementById('filterFloorTypeOther');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    const filterResultsContainer = document.getElementById('filterResultsContainer');
    const filterFeedback = document.getElementById('filterFeedback');

    // LocalStorage keys
    const ROOM_DATA_KEY = 'roomAppData_rooms';
    const BUILDING_DATA_KEY = 'roomAppData_buildings';
    const LAST_USED_BUILDING_KEY = 'roomAppData_lastUsedBuilding';
    const LAST_ROOM_INPUTS_KEY = 'roomAppData_lastRoomInputs'; // Key for sticky fields

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

    // --- Sticky Fields: Helper Functions ---
    function getStoredLastRoomInputs() {
        const stored = localStorage.getItem(LAST_ROOM_INPUTS_KEY);
        return stored ? JSON.parse(stored) : {};
    }

    function storeLastRoomInputs(inputs) {
        localStorage.setItem(LAST_ROOM_INPUTS_KEY, JSON.stringify(inputs));
    }

    function applyStickyInputStyle(element) {
        if (element) {
            element.classList.add('sticky-input-unconfirmed');
        }
    }

    function removeStickyInputStyle(element) {
        if (element) {
            element.classList.remove('sticky-input-unconfirmed');
        }
    }

    function addStickyFieldListeners(formElement) {
        if (!formElement) return;
        const fieldsToMonitor = formElement.querySelectorAll('input:not([type="hidden"]):not([type="button"]):not([type="submit"]), select, textarea');
        fieldsToMonitor.forEach(field => {
            const handleInteraction = () => {
                removeStickyInputStyle(field);
                // For radio buttons, remove from all in the group if one is changed
                if (field.type === 'radio' && field.name) {
                    formElement.querySelectorAll(`input[name="${field.name}"]`).forEach(rb => removeStickyInputStyle(rb));
                }
                // For checkboxes, if it's part of a group, we might only remove from the specific one.
                // Or, if any interaction "confirms" the group, this is fine.
            };
            field.addEventListener('input', handleInteraction); // For text inputs, textareas
            field.addEventListener('change', handleInteraction); // For selects, checkboxes, radios
            field.addEventListener('focus', handleInteraction); // Also remove on focus
        });
    }


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

        const selectsToUpdate = [
            { el: buildingNameSelect, defaultOpt: "-- Select Building --", selectedVal: selectedBuildingForForm || lastUsed },
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
            populateBuildingDropdowns();
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
            if (!editingRoomIdInput.value) { // Only apply sticky if it's a new room
                resetRoomFormToDefault(true); // Pass true to apply sticky fields
            } else {
                resetRoomFormToDefault(false); // Don't apply sticky if editing (will be populated by edit data)
            }
        } else if (targetViewId === 'FilterView') {
            if(filterForm) filterForm.reset();
            if(filterRoomPurposeOther) { filterRoomPurposeOther.style.display = 'none'; filterRoomPurposeOther.value = ''; }
            if(filterLightFixtureTypeOther) { filterLightFixtureTypeOther.style.display = 'none'; filterLightFixtureTypeOther.value = ''; }
            if(filterFloorTypeOther) { filterFloorTypeOther.style.display = 'none'; filterFloorTypeOther.value = ''; }
            if(filterResultsContainer) filterResultsContainer.innerHTML = '<p class="empty-list-message">Enter filter criteria and click "Apply Filters".</p>';
            if(filterFeedback) {filterFeedback.textContent = ''; filterFeedback.className = 'feedback';}
            populateBuildingDropdowns();
        }
    }

    function resetRoomFormToDefault(applySticky = false) {
        if (!roomForm) return;
        clearFormAndDynamicElements(roomForm); // Clears values and dynamic parts
        editingRoomIdInput.value = '';

        // Set default building based on last used or first in list
        populateBuildingDropdowns(); // This will try to set last used building by default

        if(addEditRoomTitle) addEditRoomTitle.innerHTML = '<i class="fas fa-pencil-alt"></i> Add New Room Information';
        if(saveRoomBtn) saveRoomBtn.innerHTML = '<i class="fas fa-save"></i> Save Room Information';
        if(cancelEditBtn) cancelEditBtn.style.display = 'none';

        if (feedbackMessage && (feedbackMessage.classList.contains('success') || feedbackMessage.classList.contains('error'))) {
            feedbackMessage.textContent = '';
            feedbackMessage.className = 'feedback';
        }

        // Add one default light fixture entry if none exist
        if (lightFixturesContainer && lightFixturesContainer.children.length === 0) {
            appendNewLightFixtureEntry();
        }
        // Add one default door entry if none exist (optional, can be empty by default)
        // if (doorsContainer && doorsContainer.children.length === 0) {
        //     appendNewDoorEntry();
        // }

        const overallConditionSelect = document.getElementById('overallCondition');
        if (overallConditionSelect) overallConditionSelect.value = ''; // Default to auto-calculate

        if (applySticky) {
            applyLastUsedInputs();
        }

        refreshConditionalFormUI(roomForm); // Refresh visibility of conditional fields
        addStickyFieldListeners(roomForm); // Re-add listeners after potentially applying sticky values

        const currentAddRoomView = document.getElementById('AddRoomView');
        if (currentAddRoomView) {
            currentAddRoomView.scrollTop = 0; // Scroll to top of form
        }
        window.scrollTo(0, 0);
    }


    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetViewId = this.id.replace('nav', '') + 'View';
            if (editingRoomIdInput.value && targetViewId !== 'AddRoomView' && !document.getElementById('AddRoomView').contains(e.target)) {
                if (!confirm("You have unsaved changes in the room editor. Are you sure you want to leave?")) {
                    return;
                }
                editingRoomIdInput.value = ''; // Clear editing state
            }
            // If leaving AddRoomView and not saving, reset it (which might apply sticky for next time)
            if (document.getElementById('AddRoomView').classList.contains('active-view') && targetViewId !== 'AddRoomView') {
                 resetRoomFormToDefault(false); // Reset without applying sticky, as we are navigating away
            }
            setActiveView(targetViewId);
        });
    });

    // --- Sticky Fields: Application ---
    function applyLastUsedInputs() {
        const lastInputs = getStoredLastRoomInputs();
        if (Object.keys(lastInputs).length === 0) return;

        // Helper to set value and style
        const setStickyValue = (element, value) => {
            if (element && value !== undefined && value !== null) {
                element.value = value;
                applyStickyInputStyle(element);
            }
        };
        const setStickyCheckbox = (element, checked) => {
            if (element && checked !== undefined) {
                element.checked = Boolean(checked);
                if (element.checked) applyStickyInputStyle(element); // Or its label
            }
        };
        const setStickyRadio = (groupName, value) => {
            if (value !== undefined && value !== null) {
                const radio = roomForm.querySelector(`input[name="${groupName}"][value="${value}"]`);
                if (radio) {
                    radio.checked = true;
                    // Style all radios in the group or just the selected one's label
                    roomForm.querySelectorAll(`input[name="${groupName}"]`).forEach(rb => {
                        if (rb.value === value) applyStickyInputStyle(rb); else removeStickyInputStyle(rb);
                    });
                }
            }
        };

        // Basic fields
        setStickyValue(roomForm.querySelector('#roomIdentifier'), lastInputs.roomIdentifier); // Keep room ID blank
        setStickyValue(roomForm.querySelector('#roomPurpose'), lastInputs.roomPurpose);
        setStickyValue(roomForm.querySelector('#roomPurposeOther'), lastInputs.roomPurposeOther);

        // Room Makeup
        if (lastInputs.roomMakeup) {
            setStickyValue(roomForm.querySelector('#walls'), lastInputs.roomMakeup.walls);
            setStickyValue(roomForm.querySelector('#wallsOther'), lastInputs.roomMakeup.wallsOther);
            if (lastInputs.roomMakeup.ceiling) {
                setStickyValue(roomForm.querySelector('#ceilingType'), lastInputs.roomMakeup.ceiling.type);
                setStickyValue(roomForm.querySelector('#ceilingTypeOther'), lastInputs.roomMakeup.ceiling.typeOther);
                setStickyRadio('ceilingAsbestos', lastInputs.roomMakeup.ceiling.asbestosInCeiling);
            }
            if (lastInputs.roomMakeup.floor) {
                setStickyValue(roomForm.querySelector('#floorType'), lastInputs.roomMakeup.floor.type);
                setStickyValue(roomForm.querySelector('#floorTypeOther'), lastInputs.roomMakeup.floor.typeOther);
                setStickyRadio('floorTileSize', lastInputs.roomMakeup.floor.tileSize);
                setStickyValue(roomForm.querySelector('#floorTileSizeOther'), lastInputs.roomMakeup.floor.tileSizeOther);
            }
        }

        // Light Fixtures (apply to the first one if it exists)
        if (lastInputs.lightFixtures && lastInputs.lightFixtures.length > 0 && lightFixturesContainer.children.length > 0) {
            const firstFixtureData = lastInputs.lightFixtures[0];
            const firstFixtureEntry = lightFixturesContainer.children[0];
            if (firstFixtureEntry && firstFixtureData) {
                setStickyValue(firstFixtureEntry.querySelector('select[name="lightFixtureType"]'), firstFixtureData.type);
                setStickyValue(firstFixtureEntry.querySelector('input[name="lightFixtureTypeOtherSpecify"]'), firstFixtureData.typeOtherSpecify);
                setStickyValue(firstFixtureEntry.querySelector('input[name="lightFixtureQuantity"]'), firstFixtureData.quantity);
                setStickyValue(firstFixtureEntry.querySelector('select[name="lightFixtureStyle"]'), firstFixtureData.style);
                setStickyValue(firstFixtureEntry.querySelector('input[name="lightFixtureStyleOtherSpecify"]'), firstFixtureData.styleOtherSpecify);
            }
        }

        // Other Fixtures
        if (lastInputs.otherFixtures) {
            lastInputs.otherFixtures.forEach(fixture => {
                const checkbox = roomForm.querySelector(`.fixture-present-checkbox[value="${fixture.type}"]`);
                if (checkbox) {
                    setStickyCheckbox(checkbox, true);
                    const idSuffix = fixture.type.replace(/[^a-zA-Z0-9]/g, '');
                    let countInputId = `otherFixture${idSuffix}Count`;
                    if (fixture.type === "Other") {
                        countInputId = 'otherFixturesOtherCount';
                        setStickyValue(document.getElementById('otherFixturesSpecifyText'), fixture.specify);
                    }
                    setStickyValue(document.getElementById(countInputId), fixture.count);
                    // Trigger change to show/hide count input if checkbox is checked by sticky
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }


        // Furniture
        if (lastInputs.furniture) {
            roomForm.querySelectorAll('input[name="furniture"]').forEach(cb => {
                const isSticky = lastInputs.furniture.includes(cb.value);
                setStickyCheckbox(cb, isSticky);
                if (isSticky) cb.dispatchEvent(new Event('change')); // To show "other" text field if needed
            });
            setStickyValue(roomForm.querySelector('#furnitureSpecialtySpecifyText'), lastInputs.furnitureSpecialtySpecify);
            setStickyValue(roomForm.querySelector('#furnitureOtherSpecifyText'), lastInputs.furnitureOtherSpecify);
        }

        // Heating/Cooling
        setStickyValue(roomForm.querySelector('#heatingCooling'), lastInputs.heatingCooling);
        setStickyValue(roomForm.querySelector('#heatingCoolingOther'), lastInputs.heatingCoolingOther);

        // Doors (apply to the first one if it exists)
        if (lastInputs.doors && lastInputs.doors.length > 0 && doorsContainer.children.length > 0) {
            const firstDoorData = lastInputs.doors[0];
            const firstDoorEntry = doorsContainer.children[0];
             if (firstDoorEntry && firstDoorData) { // Check if a door entry was added by resetRoomFormToDefault
                setStickyValue(firstDoorEntry.querySelector('input[name="doorIdentifier"]'), firstDoorData.identifier);
                setStickyValue(firstDoorEntry.querySelector('select[name="doorType"]'), firstDoorData.type);
                setStickyValue(firstDoorEntry.querySelector('input[name="doorTypeOther"]'), firstDoorData.typeOther);
                setStickyValue(firstDoorEntry.querySelector('select[name="doorLockType"]'), firstDoorData.lockType);
                setStickyValue(firstDoorEntry.querySelector('input[name="doorLockTypeOther"]'), firstDoorData.lockTypeOther);
            }
        }


        // Technology
        if (lastInputs.technology) {
            roomForm.querySelectorAll('input[name="technology"]').forEach(cb => {
                const isSticky = lastInputs.technology.includes(cb.value);
                setStickyCheckbox(cb, isSticky);
                if (isSticky) cb.dispatchEvent(new Event('change')); // To show "other" text field
            });
            setStickyValue(roomForm.querySelector('#technologyOtherSpecifyText'), lastInputs.technologyOtherSpecify);
        }

        // Condition Values
        if (lastInputs.conditionValues) {
            setStickyValue(roomForm.querySelector('#ceilingCondition'), lastInputs.conditionValues.ceiling);
            setStickyValue(roomForm.querySelector('#ceilingConditionComment'), lastInputs.conditionValues.ceilingComment);
            setStickyValue(roomForm.querySelector('#wallsCondition'), lastInputs.conditionValues.walls);
            setStickyValue(roomForm.querySelector('#wallsConditionComment'), lastInputs.conditionValues.wallsComment);
            setStickyValue(roomForm.querySelector('#furnitureCondition'), lastInputs.conditionValues.furniture);
            setStickyValue(roomForm.querySelector('#furnitureConditionComment'), lastInputs.conditionValues.furnitureComment);
            setStickyValue(roomForm.querySelector('#floorCondition'), lastInputs.conditionValues.floor);
            setStickyValue(roomForm.querySelector('#floorConditionComment'), lastInputs.conditionValues.floorComment);
            // Overall condition is usually calculated or N/A, so maybe don't make it sticky or handle carefully
            // setStickyValue(roomForm.querySelector('#overallCondition'), lastInputs.conditionValues.overall);
            setStickyValue(roomForm.querySelector('#overallConditionComment'), lastInputs.conditionValues.overallComment);
        }
        refreshConditionalFormUI(roomForm); // Ensure conditional fields visibility is correct after sticky
    }


    // --- Conditional Form Logic ---
    function setupConditionalInput(selectElement, otherInputElement) {
        if (selectElement && otherInputElement) {
            const update = () => {
                const shouldBeVisible = selectElement.value === 'Other';
                otherInputElement.style.display = shouldBeVisible ? 'block' : 'none';
                if (!shouldBeVisible) otherInputElement.value = '';
                // If made visible, and it was sticky, remove sticky style as user might type
                if (shouldBeVisible) removeStickyInputStyle(otherInputElement);
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
                if (shouldBeVisible) removeStickyInputStyle(otherTextInput);
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
                    formElement.querySelectorAll('input[name="ceilingAsbestos"]').forEach(radio => {
                        radio.checked = false;
                        removeStickyInputStyle(radio);
                    });
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
                    formElement.querySelectorAll('input[name="floorTileSize"]').forEach(radio => {
                        radio.checked = false;
                        removeStickyInputStyle(radio);
                    });
                    if (floorTileSizeOtherEl) {
                         floorTileSizeOtherEl.value = '';
                         floorTileSizeOtherEl.style.display = 'none';
                         removeStickyInputStyle(floorTileSizeOtherEl);
                    }
                } else {
                    const floorTileSizeOtherInput = formElement.querySelector('#floorTileSizeOther');
                     if (floorTileSizeOtherInput) {
                         let selectedRadio = formElement.querySelector('input[name="floorTileSize"]:checked');
                         const showOtherInput = selectedRadio && selectedRadio.value === 'Other';
                         floorTileSizeOtherInput.style.display = showOtherInput ? 'block' : 'none';
                         if (!showOtherInput) {
                            floorTileSizeOtherInput.value = '';
                            removeStickyInputStyle(floorTileSizeOtherInput);
                         } else {
                            if (floorTileSizeOtherInput.classList.contains('sticky-input-unconfirmed')) {
                                // If it's sticky and shown, keep it sticky until interaction
                            }
                         }
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
                    if (!showOtherInput) {
                        floorTileSizeOtherInput.value = '';
                        removeStickyInputStyle(floorTileSizeOtherInput);
                    }
                };
                floorTileSizeRadios.forEach(radio => radio.addEventListener('change', updateFloorTileSizeOtherTextVisibility));
            }
        }

        setupConditionalOtherField("Specialty Equipment", "furnitureSpecialtySpecifyText", "furniture", formElement);
        setupConditionalOtherField("Other", "furnitureOtherSpecifyText", "furniture", formElement);
        setupConditionalOtherField("Other", "technologyOtherSpecifyText", "technology", formElement);
    }

    function refreshConditionalFormUI(formElement) {
        if (!formElement) return;
        // General "Other" selects
        ['roomPurpose', 'walls', 'ceilingType', 'floorType', 'heatingCooling'].forEach(selectId => {
            const selectEl = formElement.querySelector(`#${selectId}`);
            const otherEl = formElement.querySelector(`#${selectId}Other`);
            if (selectEl && otherEl) {
                const shouldBeVisible = selectEl.value === 'Other';
                otherEl.style.display = shouldBeVisible ? 'block' : 'none';
                if (!shouldBeVisible && !otherEl.classList.contains('sticky-input-unconfirmed')) otherEl.value = '';
            }
        });

        // Ceiling specific
        const ceilingTypeSelect = formElement.querySelector('#ceilingType');
        const dropCeilingOptionsDiv = formElement.querySelector('#dropCeilingOptions');
        if (ceilingTypeSelect && dropCeilingOptionsDiv) {
            const showDropOptions = ceilingTypeSelect.value === 'Drop Ceiling';
            dropCeilingOptionsDiv.style.display = showDropOptions ? 'block' : 'none';
            if (!showDropOptions) {
                formElement.querySelectorAll('input[name="ceilingAsbestos"]').forEach(radio => {
                    if (!radio.classList.contains('sticky-input-unconfirmed')) radio.checked = false;
                });
            }
        }

        // Floor specific
        const floorTypeSelect = formElement.querySelector('#floorType');
        const floorTileOptionsDiv = formElement.querySelector('#floorTileOptions');
        const floorTileSizeOtherInput = formElement.querySelector('#floorTileSizeOther');
        if (floorTypeSelect && floorTileOptionsDiv) {
            const showTileOptions = floorTypeSelect.value === 'Tile';
            floorTileOptionsDiv.style.display = showTileOptions ? 'block' : 'none';
            if (!showTileOptions) {
                formElement.querySelectorAll('input[name="floorTileSize"]').forEach(radio => {
                     if (!radio.classList.contains('sticky-input-unconfirmed')) radio.checked = false;
                });
                if (floorTileSizeOtherInput && !floorTileSizeOtherInput.classList.contains('sticky-input-unconfirmed')) {
                    floorTileSizeOtherInput.value = '';
                    floorTileSizeOtherInput.style.display = 'none';
                }
            } else { // Tile is selected
                const selectedTileSizeRadio = formElement.querySelector('input[name="floorTileSize"]:checked');
                const showTileSizeOther = selectedTileSizeRadio && selectedTileSizeRadio.value === 'Other';
                if (floorTileSizeOtherInput) {
                    floorTileSizeOtherInput.style.display = showTileSizeOther ? 'block' : 'none';
                    if (!showTileSizeOther && !floorTileSizeOtherInput.classList.contains('sticky-input-unconfirmed')) floorTileSizeOtherInput.value = '';
                }
            }
        }

        // Checkbox-driven "Other" text fields
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
                if (!shouldBeVisible && !otherTextInput.classList.contains('sticky-input-unconfirmed')) otherTextInput.value = '';
            }
        });

        // Other Fixtures "Other" details container
        const otherFixtureCheckbox = formElement.querySelector('#otherFixturesOtherPresent');
        const otherFixtureDetailsContainer = formElement.querySelector('#otherFixturesOtherPresent')?.closest('.fixture-item-group-other')?.querySelector('.other-details-container');
        if (otherFixtureCheckbox && otherFixtureDetailsContainer) {
            otherFixtureDetailsContainer.style.display = otherFixtureCheckbox.checked ? 'flex' : 'none';
            if (!otherFixtureCheckbox.checked) {
                const specifyText = otherFixtureDetailsContainer.querySelector('#otherFixturesSpecifyText');
                const countInput = otherFixtureDetailsContainer.querySelector('#otherFixturesOtherCount');
                if (specifyText && !specifyText.classList.contains('sticky-input-unconfirmed')) specifyText.value = '';
                if (countInput && !countInput.classList.contains('sticky-input-unconfirmed')) countInput.value = '';
            }
        }
         // General fixture count inputs
        formElement.querySelectorAll('.fixture-present-checkbox').forEach(cb => {
            const parentGroup = cb.closest('.fixture-item-group');
            if (parentGroup && cb.value !== "Other") { // "Other" is handled above
                const countInput = parentGroup.querySelector('.fixture-count-input');
                if (countInput) {
                    countInput.style.display = cb.checked ? 'inline-block' : 'none';
                    if (!cb.checked && !countInput.classList.contains('sticky-input-unconfirmed')) countInput.value = '';
                }
            }
        });
    }

    // --- Dynamic Form Element Appending ---
    function appendNewDoorEntry(doorData = {}, isSticky = false) {
        if (!doorsContainer) return;
        const id = `doorInstance_${Date.now()}_${Math.random().toString(36).substr(2,5)}`;
        const div = document.createElement('div');
        div.classList.add('door-entry'); div.id = id;
        div.innerHTML = `
            <button type="button" class="remove-door-btn" aria-label="Remove this door entry"><i class="fas fa-times"></i></button>
            <h4>Door Details</h4>
            <div class="input-group"><label for="doorIdentifier-${id}">Identifier/Location:</label><input type="text" id="doorIdentifier-${id}" name="doorIdentifier" placeholder="e.g., Main Entry, Closet"></div>
            <div class="input-group"><label for="doorType-${id}">Type:</label><select id="doorType-${id}" name="doorType"><option value="Wood">Wood</option><option value="Metal">Metal</option><option value="Glass">Glass</option><option value="Other">Other</option></select><input type="text" id="doorTypeOther-${id}" name="doorTypeOther" class="conditional-other" placeholder="Specify other door type" style="display:none;"></div>
            <div class="input-group"><label for="doorLockType-${id}">Lock Type:</label><select id="doorLockType-${id}" name="doorLockType"><option value="Key">Key</option><option value="Keypad">Keypad</option><option value="Card Reader">Card Reader</option><option value="None">None</option><option value="Other">Other</option></select><input type="text" id="doorLockTypeOther-${id}" name="doorLockTypeOther" class="conditional-other" placeholder="Specify other lock type" style="display:none;"></div>`;

        const doorIdentifierInput = div.querySelector(`#doorIdentifier-${id}`);
        const doorTypeSelect = div.querySelector(`#doorType-${id}`);
        const doorTypeOtherInput = div.querySelector(`#doorTypeOther-${id}`);
        const doorLockTypeSelect = div.querySelector(`#doorLockType-${id}`);
        const doorLockTypeOtherInput = div.querySelector(`#doorLockTypeOther-${id}`);

        if (doorData.identifier) doorIdentifierInput.value = doorData.identifier;
        if (doorData.type) doorTypeSelect.value = doorData.type;
        if (doorData.typeOther) doorTypeOtherInput.value = doorData.typeOther;
        if (doorData.lockType) doorLockTypeSelect.value = doorData.lockType;
        if (doorData.lockTypeOther) doorLockTypeOtherInput.value = doorData.lockTypeOther;

        if (isSticky) {
            if(doorData.identifier) applyStickyInputStyle(doorIdentifierInput);
            if(doorData.type) applyStickyInputStyle(doorTypeSelect);
            if(doorData.typeOther) applyStickyInputStyle(doorTypeOtherInput);
            if(doorData.lockType) applyStickyInputStyle(doorLockTypeSelect);
            if(doorData.lockTypeOther) applyStickyInputStyle(doorLockTypeOtherInput);
        }

        setupConditionalInput(doorTypeSelect, doorTypeOtherInput);
        setupConditionalInput(doorLockTypeSelect, doorLockTypeOtherInput);
        refreshConditionalFormUI(div); // Refresh for the new entry

        doorsContainer.appendChild(div);
        div.querySelector('.remove-door-btn').addEventListener('click', () => div.remove());
        addStickyFieldListeners(div); // Add listeners for fields within this new entry
    }


    if (addDoorBtn && doorsContainer) {
        addDoorBtn.addEventListener('click', function () {
            appendNewDoorEntry({}, false); // Not sticky by default when manually adding
        });
    }

    function appendNewLightFixtureEntry(fixtureData = {}, isSticky = false) {
        if (!lightFixturesContainer) return;
        const id = `lightFixture_${Date.now()}_${Math.random().toString(36).substr(2,5)}`;
        const div = document.createElement('div');
        div.classList.add('light-fixture-entry'); div.id = id;
        div.innerHTML = `
            <button type="button" class="remove-light-fixture-btn" aria-label="Remove this light fixture entry"><i class="fas fa-times"></i></button>
            <h4>Light Fixture</h4>
            <div class="input-group">
                <label for="lightType-${id}">Type:</label>
                <select id="lightType-${id}" name="lightFixtureType">
                    <option value="Fluorescent T5">Fluorescent T5</option><option value="Fluorescent T8">Fluorescent T8</option>
                    <option value="Fluorescent T12">Fluorescent T12</option><option value="Incandescent">Incandescent</option>
                    <option value="LED">LED</option><option value="Sodium">Sodium</option>
                    <option value="Metal Halide">Metal Halide</option><option value="Other">Other</option>
                </select>
                <input type="text" id="lightTypeOther-${id}" name="lightFixtureTypeOtherSpecify" class="light-fixture-other-specify conditional-other" placeholder="Specify other light type" style="display:none;">
            </div>
            <div class="input-group">
                <label for="lightQuantity-${id}">Quantity:</label>
                <input type="number" id="lightQuantity-${id}" name="lightFixtureQuantity" min="1" value="1" class="light-fixture-quantity" required>
            </div>
            <div class="input-group">
                <label for="lightStyle-${id}">Style:</label>
                <select id="lightStyle-${id}" name="lightFixtureStyle">
                    <option value="Parabolic with Bulbs">Parabolic w/ Bulbs</option><option value="Flat Panel">Flat Panel</option>
                    <option value="Other">Other</option>
                </select>
                <input type="text" id="lightStyleOther-${id}" name="lightFixtureStyleOtherSpecify" class="light-fixture-other-specify conditional-other" placeholder="Specify other light style" style="display:none;">
            </div>`;

        const typeSel = div.querySelector(`#lightType-${id}`);
        const typeOtherIn = div.querySelector(`#lightTypeOther-${id}`);
        const quantityInput = div.querySelector(`#lightQuantity-${id}`);
        const styleSel = div.querySelector(`#lightStyle-${id}`);
        const styleOtherIn = div.querySelector(`#lightStyleOther-${id}`);

        if (fixtureData.type) typeSel.value = fixtureData.type;
        if (fixtureData.typeOtherSpecify) typeOtherIn.value = fixtureData.typeOtherSpecify;
        if (fixtureData.quantity) quantityInput.value = fixtureData.quantity;
        if (fixtureData.style) styleSel.value = fixtureData.style;
        if (fixtureData.styleOtherSpecify) styleOtherIn.value = fixtureData.styleOtherSpecify;

        if (isSticky) {
            if(fixtureData.type) applyStickyInputStyle(typeSel);
            if(fixtureData.typeOtherSpecify) applyStickyInputStyle(typeOtherIn);
            if(fixtureData.quantity) applyStickyInputStyle(quantityInput);
            if(fixtureData.style) applyStickyInputStyle(styleSel);
            if(fixtureData.styleOtherSpecify) applyStickyInputStyle(styleOtherIn);
        }

        setupConditionalInput(typeSel, typeOtherIn);
        setupConditionalInput(styleSel, styleOtherIn);
        refreshConditionalFormUI(div); // Refresh for the new entry

        lightFixturesContainer.appendChild(div);
        div.querySelector('.remove-light-fixture-btn').addEventListener('click', () => div.remove());
        addStickyFieldListeners(div); // Add listeners for fields within this new entry
    }


    if (addLightFixtureBtn) {
        addLightFixtureBtn.addEventListener('click', () => {
            appendNewLightFixtureEntry({}, false); // Not sticky by default
        });
    }

    otherFixturesCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const value = this.value;
            let countInput = null;
            let otherDetailsContainer = null;
            const parentGroup = this.closest('.fixture-item-group');

            if (value === "Other") {
                otherDetailsContainer = parentGroup.querySelector('.other-details-container');
                if (otherDetailsContainer) {
                    otherDetailsContainer.style.display = this.checked ? 'flex' : 'none';
                    countInput = otherDetailsContainer.querySelector('.fixture-count-input');
                    const specifyInput = otherDetailsContainer.querySelector('input[type="text"].conditional-other');
                    if (!this.checked) {
                        if(specifyInput && !specifyInput.classList.contains('sticky-input-unconfirmed')) specifyInput.value = '';
                        if(countInput && !countInput.classList.contains('sticky-input-unconfirmed')) countInput.value = '';
                    }
                }
            } else {
                if (parentGroup) countInput = parentGroup.querySelector('.fixture-count-input');
                if (countInput) {
                    countInput.style.display = this.checked ? 'inline-block' : 'none';
                     if (!this.checked && !countInput.classList.contains('sticky-input-unconfirmed')) countInput.value = '';
                }
            }
            if (this.checked && countInput && !countInput.value && !countInput.classList.contains('sticky-input-unconfirmed')) {
                 countInput.value = '1'; // Default to 1 if checked and empty (and not sticky)
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
        form.reset(); // Resets to HTML defaults
        // Remove sticky styles from all elements before potentially reapplying
        form.querySelectorAll('.sticky-input-unconfirmed').forEach(el => removeStickyInputStyle(el));

        if (doorsContainer) doorsContainer.innerHTML = '';
        if (lightFixturesContainer) lightFixturesContainer.innerHTML = '';

        // Reset "Other Fixtures" checkboxes and their count/specify inputs
        otherFixturesCheckboxes.forEach(cb => {
            cb.checked = false;
            const parentGroup = cb.closest('.fixture-item-group');
            if (parentGroup) {
                const countInput = parentGroup.querySelector('.fixture-count-input');
                if (countInput) { countInput.value = ''; countInput.style.display = 'none';}
                if (cb.value === "Other") {
                    const detailsContainer = parentGroup.querySelector('.other-details-container');
                    if (detailsContainer) {
                        detailsContainer.style.display = 'none';
                        const specifyText = detailsContainer.querySelector('#otherFixturesSpecifyText');
                        const otherCountInput = detailsContainer.querySelector('#otherFixturesOtherCount');
                        if(specifyText) specifyText.value = '';
                        if(otherCountInput) otherCountInput.value = '';
                    }
                }
            }
        });


        // Clear conditional "Other" text inputs that are not part of dynamic groups
        form.querySelectorAll('input.conditional-other, input.light-fixture-other-specify').forEach(input => {
            if (!input.closest('.door-entry') && !input.closest('.light-fixture-entry') && !input.closest('.other-details-container')) {
                input.value = '';
                input.style.display = 'none';
            }
        });

        // Reset specific conditional sections
        const dropCeilingOpts = form.querySelector('#dropCeilingOptions');
        if (dropCeilingOpts) dropCeilingOpts.style.display = 'none';
        form.querySelectorAll('input[name="ceilingAsbestos"]').forEach(radio => radio.checked = (radio.value === "No")); // Default to No

        const floorTileOptionsDiv = form.querySelector('#floorTileOptions');
        if (floorTileOptionsDiv) floorTileOptionsDiv.style.display = 'none';
        form.querySelectorAll('input[name="floorTileSize"]').forEach(radio => radio.checked = (radio.value === "12x12")); // Default to 12x12
        const floorTileSizeOtherInput = form.querySelector('#floorTileSizeOther');
        if (floorTileSizeOtherInput) {
            floorTileSizeOtherInput.value = '';
            floorTileSizeOtherInput.style.display = 'none';
        }


        // Clear condition comments
        ['ceilingConditionComment', 'wallsConditionComment', 'furnitureConditionComment', 'floorConditionComment', 'overallConditionComment'].forEach(id => {
            const textarea = document.getElementById(id);
            if (textarea) textarea.value = '';
        });
        const overallConditionSelect = document.getElementById('overallCondition');
        if(overallConditionSelect) overallConditionSelect.value = ''; // Default to auto-calculate

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
        }

        const buildingNameVal = buildingNameSelect.value;
        const roomIdentifierVal = roomForm.querySelector('#roomIdentifier').value.trim();
        const currentRoomId = editingRoomIdInput.value;

        if (!buildingNameVal || !roomIdentifierVal) {
            const msg = 'Building Name and Room Identifier are required.';
            if (feedbackMessage) { feedbackMessage.textContent = msg; feedbackMessage.className = 'feedback error';}
            else { alert(msg); }
            document.getElementById('AddRoomView')?.scrollTop = 0;
            return;
        }

        const existingRoomWithSameIdentifiers = findRoom(buildingNameVal, roomIdentifierVal);
        if (existingRoomWithSameIdentifiers && existingRoomWithSameIdentifiers.id !== currentRoomId) {
            const msg = `Error: Room "${escapeHtml(buildingNameVal)} - ${escapeHtml(roomIdentifierVal)}" already exists.`;
            if (feedbackMessage) { feedbackMessage.textContent = msg; feedbackMessage.className = 'feedback error';}
            else { alert(msg); }
            document.getElementById('AddRoomView')?.scrollTop = 0;
            return;
        }

        try {
            const formData = new FormData(roomForm);
            const newRoomData = { buildingName: buildingNameVal, roomIdentifier: roomIdentifierVal };

            // Collect all data (same as before)
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
                            type: typeSel.value, quantity: parseInt(quantityInput.value, 10) || 1, style: styleSel.value,
                            typeOtherSpecify: (typeSel.value === 'Other' && typeOtherIn) ? typeOtherIn.value.trim() : '',
                            styleOtherSpecify: (styleSel.value === 'Other' && styleOtherIn) ? styleOtherIn.value.trim() : ''
                        });
                    }
                });
            }
            newRoomData.otherFixtures = [];
            document.querySelectorAll('.fixture-present-checkbox:checked').forEach(cb => {
                const type = cb.value; let count = 1; let specify = '';
                if (type === "Other") {
                    const countInput = document.getElementById('otherFixturesOtherCount');
                    const specifyInput = document.getElementById('otherFixturesSpecifyText');
                    if (countInput?.value) count = parseInt(countInput.value, 10) || 1;
                    if (specifyInput) specify = specifyInput.value.trim();
                    if (specify) newRoomData.otherFixtures.push({ type, count, specify });
                } else {
                    const idSuffix = type.replace(/[^a-zA-Z0-9]/g, '');
                    const countInput = document.getElementById(`otherFixture${idSuffix}Count`);
                    if (countInput?.value) count = parseInt(countInput.value, 10) || 1;
                    newRoomData.otherFixtures.push({ type, count });
                }
            });
            const getCbVal = name => Array.from(roomForm.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
            newRoomData.furniture = getCbVal('furniture');
            newRoomData.furnitureSpecialtySpecify = newRoomData.furniture.includes('Specialty Equipment') ? (formData.get('furnitureSpecialtySpecify') || '').trim() : '';
            newRoomData.furnitureOtherSpecify = newRoomData.furniture.includes('Other') ? (formData.get('furnitureOtherSpecify') || '').trim() : '';
            newRoomData.heatingCooling = formData.get('heatingCooling');
            newRoomData.heatingCoolingOther = formData.get('heatingCooling') === 'Other' ? formData.get('heatingCoolingOther').trim() : '';
            newRoomData.doors = [];
            if (doorsContainer) {
                doorsContainer.querySelectorAll('.door-entry').forEach(entry => {
                    const doorIdVal = entry.querySelector('input[name="doorIdentifier"]').value.trim();
                    const doorTypeSel = entry.querySelector('select[name="doorType"]');
                    const lockTypeSel = entry.querySelector('select[name="doorLockType"]');
                    const doorTypeOtherIn = entry.querySelector('input[name="doorTypeOther"]');
                    const lockTypeOtherIn = entry.querySelector('input[name="doorLockTypeOther"]');
                    if (doorIdVal || doorTypeSel.value !== 'Wood' || lockTypeSel.value !== 'Key' || (doorTypeSel.value === 'Other' && doorTypeOtherIn?.value.trim() !== '') || (lockTypeSel.value === 'Other' && lockTypeOtherIn?.value.trim() !== '')) {
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
            let overallConditionFromForm = formData.get('overallCondition');
            let overallConditionComment = formData.get('overallConditionComment').trim();
            if (!overallConditionFromForm || overallConditionFromForm === "") {
                const conditionsToAverage = [
                    conditionStringToValue(formData.get('ceilingCondition')), conditionStringToValue(formData.get('wallsCondition')),
                    conditionStringToValue(formData.get('furnitureCondition')), conditionStringToValue(formData.get('floorCondition'))
                ].filter(val => val !== null);
                if (conditionsToAverage.length > 0) {
                    const sum = conditionsToAverage.reduce((acc, curr) => acc + curr, 0);
                    overallConditionFromForm = conditionValueToString(sum / conditionsToAverage.length);
                } else { overallConditionFromForm = ''; }
            }
            newRoomData.conditionValues = {
                ceiling: formData.get('ceilingCondition'), ceilingComment: formData.get('ceilingConditionComment').trim(),
                walls: formData.get('wallsCondition'), wallsComment: formData.get('wallsConditionComment').trim(),
                furniture: formData.get('furnitureCondition'), furnitureComment: formData.get('furnitureConditionComment').trim(),
                floor: formData.get('floorCondition'), floorComment: formData.get('floorConditionComment').trim(),
                overall: overallConditionFromForm, overallComment: overallConditionComment
            };
            // END OF DATA COLLECTION

            addRoomToStorageInternal(newRoomData, currentRoomId); // Save/update room
            storeLastRoomInputs(newRoomData); // Store these inputs as the "last used" for sticky fields
            setLastUsedBuilding(buildingNameVal);

            if (feedbackMessage) {
                feedbackMessage.textContent = currentRoomId ? 'Room information updated successfully!' : 'Room information saved successfully!';
                feedbackMessage.className = 'feedback success';
            }

            const isEditing = !!currentRoomId;
            resetRoomFormToDefault(!isEditing); // Apply sticky if it was a new add, not if it was an edit

            if (isEditing) { // If editing, navigate to view rooms after a delay
                setTimeout(() => {
                    if (feedbackMessage?.classList.contains('success')) setActiveView('ViewRoomsView');
                }, 1500);
            } else { // If adding new, form is reset with sticky, user can add another or navigate
                 // No automatic navigation, allow user to add more rooms quickly
            }

        } catch (error) {
            console.error('[RoomFormSubmit] CRITICAL ERROR during room save process:', error);
            const errorMsg = 'Failed to save room information. An unexpected error occurred.';
            if (feedbackMessage) { feedbackMessage.textContent = errorMsg; feedbackMessage.className = 'feedback error';}
            else { alert(errorMsg); }
            document.getElementById('AddRoomView')?.scrollTop = 0;
        }
    });
}


    if(cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to cancel editing? Any unsaved changes will be lost.")) {
                editingRoomIdInput.value = ''; // Clear editing state
                resetRoomFormToDefault(true); // Reset form and apply sticky fields for a new entry
                setActiveView('ViewRoomsView'); // Then navigate away
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
            } else { // Should not happen if replaceId is valid, but as fallback:
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
            populateBuildingDropdowns(); // Update all building dropdowns
        }
    }

    // --- Populate Form for Editing ---
    function populateFormForEditing(roomId) {
        const room = findRoomById(roomId);
        if (!room) {
            if(feedbackMessage) { feedbackMessage.textContent = "Error: Could not find room to edit."; feedbackMessage.className = "feedback error"; }
            return;
        }
        // Clear form WITHOUT applying sticky, then populate with room data
        resetRoomFormToDefault(false);
        editingRoomIdInput.value = room.id;

        if(addEditRoomTitle) addEditRoomTitle.innerHTML = `<i class="fas fa-edit"></i> Edit Room: ${escapeHtml(room.buildingName)} - ${escapeHtml(room.roomIdentifier)}`;
        if(saveRoomBtn) saveRoomBtn.innerHTML = '<i class="fas fa-save"></i> Update Room Information';
        if(cancelEditBtn) cancelEditBtn.style.display = 'inline-flex';

        populateBuildingDropdowns(room.buildingName); // Set building select
        const roomIdentifierEl = roomForm.querySelector('#roomIdentifier');
        if(roomIdentifierEl) roomIdentifierEl.value = room.roomIdentifier || '';

        // Populate all other fields from 'room' object...
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
                    let targetFloorTileSize = makeup.floor.tileSize;
                     if (targetFloorTileSize) {
                        const floorTileSizeRadio = roomForm.querySelector(`input[name="floorTileSize"][value="${targetFloorTileSize}"]`);
                        if (floorTileSizeRadio) floorTileSizeRadio.checked = true;
                        if (targetFloorTileSize === 'Other' && makeup.floor.tileSizeOther) {
                            const floorTileSizeOtherEl = roomForm.querySelector('#floorTileSizeOther');
                            if (floorTileSizeOtherEl) floorTileSizeOtherEl.value = makeup.floor.tileSizeOther;
                        }
                    }
                }
            }
        }
        if (lightFixturesContainer) lightFixturesContainer.innerHTML = ''; // Clear before adding
        if (room.lightFixtures && room.lightFixtures.length > 0) {
            room.lightFixtures.forEach(fixture => appendNewLightFixtureEntry(fixture, false)); // false for isSticky
        } else {
            appendNewLightFixtureEntry({}, false); // Add a blank one if none exist
        }
        otherFixturesCheckboxes.forEach(cb => cb.checked = false); // Reset first
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
                    checkbox.dispatchEvent(new Event('change')); // Trigger visibility of count input
                }
            });
        }
        roomForm.querySelectorAll('input[name="furniture"]').forEach(cb => cb.checked = false);
        if (room.furniture && room.furniture.length > 0) {
            room.furniture.forEach(fItem => {
                const cb = roomForm.querySelector(`input[name="furniture"][value="${fItem}"]`);
                if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change'));}
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
        if (doorsContainer) doorsContainer.innerHTML = ''; // Clear before adding
        if (room.doors && room.doors.length > 0) {
            room.doors.forEach(door => appendNewDoorEntry(door, false)); // false for isSticky
        }
        roomForm.querySelectorAll('input[name="technology"]').forEach(cb => cb.checked = false);
        if (room.technology && room.technology.length > 0) {
            room.technology.forEach(tItem => {
                const cb = roomForm.querySelector(`input[name="technology"][value="${tItem}"]`);
                if (cb) {cb.checked = true; cb.dispatchEvent(new Event('change'));}
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
        // END POPULATING FIELDS

        refreshConditionalFormUI(roomForm); // Crucial to show/hide "Other" fields correctly
        addStickyFieldListeners(roomForm); // Add listeners to remove sticky style on interaction
        setActiveView('AddRoomView');
        document.getElementById('AddRoomView')?.scrollTop = 0;
    }

    // --- Render Room List (for ViewRoomsView and FilterResults) ---
    function renderRoomList(roomsToRender = null, targetContainer = roomListContainer, isFilterResults = false) {
        if (!targetContainer) return;
        targetContainer.innerHTML = '';
        const rooms = roomsToRender === null ? getStoredRooms() : roomsToRender;

        if (rooms.length === 0) {
            targetContainer.innerHTML = `<p class="empty-list-message">${isFilterResults ? 'No rooms match your filter criteria.' : 'No rooms saved yet. Go to "Add Room" or "Data Management" to get started!'}</p>`;
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
            Object.keys(roomsByBuilding).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).forEach(buildingNameVal => {
                const buildingGroupDiv = document.createElement('div');
                buildingGroupDiv.classList.add('building-group');
                const buildingHeader = document.createElement('div');
                buildingHeader.classList.add('building-header');
                buildingHeader.setAttribute('role', 'button'); buildingHeader.setAttribute('tabindex', '0');
                buildingHeader.setAttribute('aria-expanded', 'false');
                buildingHeader.setAttribute('aria-controls', `building-rooms-${buildingNameVal.replace(/\s+/g, '-')}`);
                buildingHeader.innerHTML = `<span>${escapeHtml(buildingNameVal)} (${roomsByBuilding[buildingNameVal].length} room${roomsByBuilding[buildingNameVal].length === 1 ? '' : 's'})</span><i class="fas fa-chevron-right toggle-icon"></i>`;

                const roomsContainerElement = document.createElement('div');
                roomsContainerElement.classList.add('rooms-in-building-container');
                roomsContainerElement.id = `building-rooms-${buildingNameVal.replace(/\s+/g, '-')}`;
                roomsByBuilding[buildingNameVal].sort((a,b) => (a.roomIdentifier || '').toLowerCase().localeCompare((b.roomIdentifier || '').toLowerCase()))
                    .forEach(room => roomsContainerElement.appendChild(createRoomCard(room, false)));

                buildingHeader.addEventListener('click', () => {
                    const isExpanded = buildingHeader.classList.toggle('expanded');
                    buildingHeader.setAttribute('aria-expanded', isExpanded.toString());
                });
                buildingHeader.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); buildingHeader.click(); }});
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
        if (room.roomPurpose === 'Other' && room.roomPurposeOther) purposeText = `${escapeHtml(room.roomPurpose)} (${escapeHtml(room.roomPurposeOther)})`;
        const buildingNamePrefix = isFilterResultCard ? `<strong>${escapeHtml(room.buildingName || 'N/A')}</strong> - ` : '';
        card.innerHTML = `
            <h3>${buildingNamePrefix}<i class="fas fa-door-closed"></i> ${escapeHtml(room.roomIdentifier)}</h3>
            <p><small>Purpose: ${purposeText}</small></p>
            <p><small>Overall Condition: ${escapeHtml(room.conditionValues?.overall || 'N/A')}</small></p>
            <div class="actions">
                <button type="button" class="action-button secondary-button view-details-btn" data-room-id="${room.id}" aria-label="View details"><i class="fas fa-eye"></i> View</button>
                <button type="button" class="action-button warning-button edit-room-btn" data-room-id="${room.id}" aria-label="Edit room"><i class="fas fa-edit"></i> Edit</button>
                <button type="button" class="action-button danger-button delete-room-btn" data-room-id="${room.id}" aria-label="Delete room"><i class="fas fa-trash-alt"></i> Delete</button>
            </div>`;
        return card;
    }

    document.querySelector('.content-area').addEventListener('click', function(event) {
        const targetButton = event.target.closest('button.action-button');
        if (!targetButton) return;
        const roomId = targetButton.dataset.roomId;
        if (targetButton.classList.contains('view-details-btn')) {
            focusedButtonBeforeModal = targetButton; displayRoomDetails(roomId);
        } else if (targetButton.classList.contains('edit-room-btn')) {
            populateFormForEditing(roomId);
        } else if (targetButton.classList.contains('delete-room-btn')) {
            const room = findRoomById(roomId);
            if (confirm(`Are you sure you want to delete room: ${escapeHtml(room?.roomIdentifier)} in ${escapeHtml(room?.buildingName)}?`)) {
                deleteRoom(roomId);
            }
        }
    });

    function escapeHtml(unsafe) {return unsafe==null?'':String(unsafe).replace(/[&<"'>]/g,m=>({'&':'&amp;','<':'&lt;','"':'&quot;',"'":'&#039;','>':'&gt;'})[m]);}

    function displayRoomDetails(roomId) {
        if(!roomDetailModal || !roomDetailContent) return;
        const room = findRoomById(roomId);
        if (!room) { roomDetailContent.innerHTML = '<p>Error: Room not found.</p>'; roomDetailModal.style.display = 'block'; closeModalBtn?.focus(); return; }
        let html = `<h2>${escapeHtml(room.buildingName)} - ${escapeHtml(room.roomIdentifier)}</h2>`;
        html += `<p><strong>Saved At:</strong> ${new Date(room.savedAt).toLocaleString()}</p>`;
        let purposeDisplay = escapeHtml(room.roomPurpose) || 'N/A';
        if (room.roomPurpose === 'Other' && room.roomPurposeOther) purposeDisplay = `${escapeHtml(room.roomPurpose)} (${escapeHtml(room.roomPurposeOther)})`;
        html += `<h3><i class="fas fa-map-pin"></i> Purpose</h3><p>${purposeDisplay}</p>`;
        html += `<h3><i class="fas fa-paint-roller"></i> Room Makeup</h3>`;
        if (room.roomMakeup) {
            html += `<p><strong>Walls:</strong> ${escapeHtml(room.roomMakeup.walls)} ${room.roomMakeup.wallsOther ? `(${escapeHtml(room.roomMakeup.wallsOther)})` : ''}</p>`;
            if (room.roomMakeup.ceiling) {
                html += `<p><strong>Ceiling Type:</strong> ${escapeHtml(room.roomMakeup.ceiling.type)} ${room.roomMakeup.ceiling.typeOther ? `(${escapeHtml(room.roomMakeup.ceiling.typeOther)})` : ''}`;
                if (room.roomMakeup.ceiling.type === 'Drop Ceiling') html += ` (Asbestos: ${escapeHtml(room.roomMakeup.ceiling.asbestosInCeiling||'N/A')})`;
                html += `</p>`;
            }
            if (room.roomMakeup.floor) {
                let floorText = `<strong>Floor Type:</strong> ${escapeHtml(room.roomMakeup.floor.type)}`;
                if (room.roomMakeup.floor.type === 'Other' && room.roomMakeup.floor.typeOther) floorText += ` (${escapeHtml(room.roomMakeup.floor.typeOther)})`;
                html += `<p>${floorText}</p>`;
                if (room.roomMakeup.floor.type === 'Tile' && room.roomMakeup.floor.tileSize) {
                    let tileSizeText = `<strong>Floor Tile Size:</strong> ${escapeHtml(room.roomMakeup.floor.tileSize)}`;
                    if (room.roomMakeup.floor.tileSize === 'Other' && room.roomMakeup.floor.tileSizeOther) tileSizeText += ` (${escapeHtml(room.roomMakeup.floor.tileSizeOther)})`;
                    html += `<p>${tileSizeText}</p>`;
                }
            }
        }
        html += `<h3><i class="fas fa-lightbulb"></i> Room Fixtures</h3>`;
        if (room.lightFixtures?.length > 0) {
            html += `<p><strong>Light Fixtures:</strong></p><ul>`;
            room.lightFixtures.forEach(lf => {
                let entry = `<li>${escapeHtml(lf.quantity)} x ${escapeHtml(lf.type)}`;
                if (lf.type === 'Other' && lf.typeOtherSpecify) entry += ` (${escapeHtml(lf.typeOtherSpecify)})`;
                entry += ` - Style: ${escapeHtml(lf.style)}`;
                if (lf.style === 'Other' && lf.styleOtherSpecify) entry += ` (${escapeHtml(lf.styleOtherSpecify)})`;
                html += `${entry}</li>`;
            });
            html += `</ul>`;
        } else html += `<p><strong>Light Fixtures:</strong> N/A</p>`;
        if (room.otherFixtures?.length > 0) {
            html += `<p><strong>Other Fixtures:</strong></p><ul>`;
            room.otherFixtures.forEach(of => {
                let entry = `<li>${escapeHtml(of.count)} x ${escapeHtml(of.type)}`;
                if (of.type === 'Other' && of.specify) entry += ` (${escapeHtml(of.specify)})`;
                html += `${entry}</li>`;
            });
            html += `</ul>`;
        } else html += `<p><strong>Other Fixtures:</strong> N/A</p>`;
        html += `<h3><i class="fas fa-couch"></i> Furniture</h3>`;
        if (room.furniture?.length > 0) {
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
        if (room.technology?.length > 0) {
            html += `<ul>${room.technology.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`;
             if (room.technologyOtherSpecify) html += `<p><em>Other:</em> ${escapeHtml(room.technologyOtherSpecify)}</p>`;
        } else html += '<p>N/A</p>';
        html += `<h3><i class="fas fa-star-half-alt"></i> Condition Values</h3>`;
        if (room.conditionValues) {
            const cv = room.conditionValues;
            html += `<p><strong>Ceiling:</strong> ${escapeHtml(cv.ceiling) || 'N/A'}</p>${cv.ceilingComment ? `<p class="condition-comment">${escapeHtml(cv.ceilingComment)}</p>` : ''}`;
            html += `<p><strong>Walls:</strong> ${escapeHtml(cv.walls) || 'N/A'}</p>${cv.wallsComment ? `<p class="condition-comment">${escapeHtml(cv.wallsComment)}</p>` : ''}`;
            html += `<p><strong>Furniture:</strong> ${escapeHtml(cv.furniture) || 'N/A'}</p>${cv.furnitureComment ? `<p class="condition-comment">${escapeHtml(cv.furnitureComment)}</p>` : ''}`;
            html += `<p><strong>Floor:</strong> ${escapeHtml(cv.floor) || 'N/A'}</p>${cv.floorComment ? `<p class="condition-comment">${escapeHtml(cv.floorComment)}</p>` : ''}`;
            html += `<p><strong>Overall Room:</strong> ${escapeHtml(cv.overall) || 'N/A'}</p>${cv.overallComment ? `<p class="condition-comment">${escapeHtml(cv.overallComment)}</p>` : ''}`;
        } else html += '<p>N/A</p>';
        roomDetailContent.innerHTML = html;
        roomDetailModal.style.display = 'block';
        closeModalBtn?.focus();
    }

    function deleteRoom(roomId) {
        storeRooms(getStoredRooms().filter(r => r.id !== roomId));
        renderRoomList();
        if (document.getElementById('FilterView').classList.contains('active-view')) applyFilters();
        populateBuildingDropdowns();
        (roomListContainer?.querySelector('.building-header:first-child') || navLinks[0])?.focus();
        if (roomDetailModal?.style.display === 'block') closeModal();
    }

    function closeModal() {
        if(roomDetailModal) roomDetailModal.style.display = 'none';
        if (focusedButtonBeforeModal) { focusedButtonBeforeModal.focus(); focusedButtonBeforeModal = null; }
        else { (roomListContainer?.querySelector('.building-header:first-child') || navLinks[0])?.focus(); }
    }
    if(closeModalBtn) { closeModalBtn.onclick = closeModal; closeModalBtn.onkeydown = e => { if (e.key==='Enter'||e.key===' ') {e.preventDefault();closeModal();}};}

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
            if (!newName) { buildingManagementFeedback.textContent = 'Please enter a name.'; buildingManagementFeedback.className = 'feedback error'; return; }
            const buildings = getStoredBuildings();
            if (buildings.some(b => b.toLowerCase() === newName.toLowerCase())) { buildingManagementFeedback.textContent = `Building "${escapeHtml(newName)}" already exists.`; buildingManagementFeedback.className = 'feedback error'; return; }
            buildings.push(newName); storeBuildings(buildings); populateBuildingDropdowns(); newBuildingNameInput.value = '';
            buildingManagementFeedback.textContent = `Building "${escapeHtml(newName)}" added.`; buildingManagementFeedback.className = 'feedback success';
        });
    }
    if (renameBuildingBtn) {
        renameBuildingBtn.addEventListener('click', () => {
            if (buildingManagementFeedback) { buildingManagementFeedback.textContent = ''; buildingManagementFeedback.className = 'feedback'; }
            const oldName = renameOldBuildingNameSelect.value; const newName = renameNewBuildingNameInput.value.trim();
            if (!oldName || !newName) { buildingManagementFeedback.textContent = 'Select building and enter new name.'; buildingManagementFeedback.className = 'feedback error'; return; }
            if (oldName.toLowerCase() === newName.toLowerCase()) { buildingManagementFeedback.textContent = 'Names are the same.'; buildingManagementFeedback.className = 'feedback info'; return; }
            let buildings = getStoredBuildings();
            if (buildings.some(b => b.toLowerCase() === newName.toLowerCase())) { buildingManagementFeedback.textContent = `Building "${escapeHtml(newName)}" already exists.`; buildingManagementFeedback.className = 'feedback error'; return; }
            if (confirm(`Rename "${escapeHtml(oldName)}" to "${escapeHtml(newName)}"? This updates all rooms.`)) {
                const buildingIndex = buildings.findIndex(b => b === oldName);
                if (buildingIndex > -1) { buildings[buildingIndex] = newName; storeBuildings(buildings); }
                let rooms = getStoredRooms(); let roomsUpdatedCount = 0;
                rooms = rooms.map(room => { if (room.buildingName === oldName) { room.buildingName = newName; room.savedAt = new Date().toISOString(); roomsUpdatedCount++; } return room; });
                storeRooms(rooms); populateBuildingDropdowns(); renderRoomList();
                if (getLastUsedBuilding() === oldName) setLastUsedBuilding(newName);
                renameOldBuildingNameSelect.value = ''; renameNewBuildingNameInput.value = '';
                buildingManagementFeedback.textContent = `Renamed "${escapeHtml(oldName)}" to "${escapeHtml(newName)}". ${roomsUpdatedCount} room(s) updated.`; buildingManagementFeedback.className = 'feedback success';
            } else { buildingManagementFeedback.textContent = 'Rename cancelled.'; buildingManagementFeedback.className = 'feedback info'; }
        });
    }
    if (massUpdateBuildingNameBtn) {
        massUpdateBuildingNameBtn.addEventListener('click', () => {
            if (massUpdateFeedback) { massUpdateFeedback.textContent = ''; massUpdateFeedback.className = 'feedback'; }
            const oldName = massUpdateOldBuildingNameSelect.value; const newName = massUpdateNewBuildingNameInput.value.trim();
            if (!oldName || !newName) { massUpdateFeedback.textContent = 'Select old and enter new building name.'; massUpdateFeedback.className = 'feedback error'; return; }
            if (oldName === newName) { massUpdateFeedback.textContent = 'Names are the same.'; massUpdateFeedback.className = 'feedback info'; return; }
            let buildings = getStoredBuildings();
            if (!buildings.some(b => b.toLowerCase() === newName.toLowerCase())) {
                if (!confirm(`Building "${escapeHtml(newName)}" doesn't exist. Add it and reassign rooms?`)) { massUpdateFeedback.textContent = 'Update cancelled.'; massUpdateFeedback.className = 'feedback info'; return; }
                buildings.push(newName); storeBuildings(buildings); populateBuildingDropdowns();
            }
            const rooms = getStoredRooms(); const roomsInSelectedBuilding = rooms.filter(room => room.buildingName === oldName);
            if (roomsInSelectedBuilding.length === 0) { massUpdateFeedback.textContent = `No rooms in "${escapeHtml(oldName)}".`; massUpdateFeedback.className = 'feedback info'; return; }
            for (const room of roomsInSelectedBuilding) { if (findRoom(newName, room.roomIdentifier)) { massUpdateFeedback.textContent = `Error: Room "${escapeHtml(room.roomIdentifier)}" already exists in "${escapeHtml(newName)}".`; massUpdateFeedback.className = 'feedback error'; return; } }
            if (confirm(`Reassign ${roomsInSelectedBuilding.length} room(s) from "${escapeHtml(oldName)}" to "${escapeHtml(newName)}"?`)) {
                let updatedCount = 0;
                const updatedRooms = rooms.map(room => { if (room.buildingName === oldName) { room.buildingName = newName; room.savedAt = new Date().toISOString(); updatedCount++; } return room; });
                storeRooms(updatedRooms);
                massUpdateFeedback.textContent = `Reassigned ${updatedCount} room(s) to "${escapeHtml(newName)}".`; massUpdateFeedback.className = 'feedback success';
                massUpdateOldBuildingNameSelect.value = ''; massUpdateNewBuildingNameInput.value = '';
                populateBuildingDropdowns(); renderRoomList();
            } else { massUpdateFeedback.textContent = 'Update cancelled.'; massUpdateFeedback.className = 'feedback info'; }
        });
    }
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', async function() {
             if (!jsonDisplayArea || !exportFeedback) return;
            const jsonData = jsonDisplayArea.value;
            if (jsonData === 'No data to display.' || jsonData.trim() === '') { exportFeedback.textContent = 'No data to export.'; exportFeedback.className = 'feedback error'; return; }
            try {
                const filename = `room_data_export_${new Date().toISOString().slice(0,10)}.json`;
                if (window.Capacitor?.isNativePlatform && window.Capacitor?.Plugins?.Filesystem) {
                    const { Filesystem, Directory, Encoding } = window.Capacitor.Plugins;
                    await Filesystem.writeFile({ path: filename, data: jsonData, directory: Directory.Documents, encoding: Encoding.UTF8 });
                    exportFeedback.textContent = `Exported to ${filename} in Documents.`; exportFeedback.className = 'feedback success';
                } else {
                    const blob = new Blob([jsonData], { type: 'application/json' }); const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                    exportFeedback.textContent = 'Export started for web.'; exportFeedback.className = 'feedback success';
                }
            } catch (error) { console.error('Export error:', error); exportFeedback.textContent = `Export failed: ${error.message || 'Unknown'}`; exportFeedback.className = 'feedback error'; }
        });
    }
    if (copyJsonBtn) {
        copyJsonBtn.addEventListener('click', function() {
            if (!jsonDisplayArea || !exportFeedback) return;
            if (jsonDisplayArea.value === 'No data to display.' || jsonDisplayArea.value.trim() === '') { exportFeedback.textContent = 'No data to copy.'; exportFeedback.className = 'feedback error'; return; }
            jsonDisplayArea.select();
            try {
                const successful = document.execCommand('copy');
                exportFeedback.textContent = successful ? 'JSON copied!' : 'Copy failed.'; exportFeedback.className = successful ? 'feedback success' : 'feedback error';
            } catch (err) {
                console.error('Copy error:', err); exportFeedback.textContent = 'Copy failed. See console.'; exportFeedback.className = 'feedback error';
                if (navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(jsonDisplayArea.value)
                        .then(() => { exportFeedback.textContent = 'JSON copied! (fallback)'; exportFeedback.className = 'feedback success'; })
                        .catch(e => { console.error('Fallback copy error:', e); exportFeedback.textContent = 'Copy failed completely.'; exportFeedback.className = 'feedback error'; });
                }
            }
            window.getSelection()?.removeAllRanges();
        });
    }
    if (importJsonFileBtn && jsonImportFile) {
        importJsonFileBtn.addEventListener('click', () => {
            if (jsonImportFile.files.length === 0) { if(importFeedback){ importFeedback.textContent = 'Select a JSON file.'; importFeedback.className = 'feedback error'; } return; }
            const reader = new FileReader();
            reader.onload = e => processImportedJsonString(e.target.result);
            reader.onerror = e => { console.error("File error:", e); if(importFeedback){ importFeedback.textContent = 'Error reading file.'; importFeedback.className = 'feedback error';}};
            reader.readAsText(jsonImportFile.files[0]);
        });
    }
    if (importJsonPasteBtn && jsonPasteArea) {
        importJsonPasteBtn.addEventListener('click', () => {
            const jsonString = jsonPasteArea.value.trim();
            if (!jsonString) { if(importFeedback){ importFeedback.textContent = 'Paste JSON content.'; importFeedback.className = 'feedback error';} return; }
            processImportedJsonString(jsonString);
        });
    }
    function tryMigrateRoomTileData(roomObject) { /* ... (migration logic as before) ... */ }
    function processImportedJsonString(jsonString) {
        if(importFeedback) {importFeedback.className = 'feedback'; importFeedback.textContent = '';}
        try {
            const data = JSON.parse(jsonString); if (!Array.isArray(data)) throw new Error('JSON must be an array.');
            const currentBuildings = getStoredBuildings(); let newBuildingsFound = false;
            data.forEach(room => { if (room?.buildingName && !currentBuildings.includes(room.buildingName)) { currentBuildings.push(room.buildingName); newBuildingsFound = true; } tryMigrateRoomTileData(room); });
            if (newBuildingsFound) storeBuildings(currentBuildings);
            importedRoomsQueue = data.filter(r => r && typeof r === 'object' && r.buildingName && r.roomIdentifier);
            if (importedRoomsQueue.length === 0) { importFeedback.textContent = 'No valid rooms in JSON.'; importFeedback.className = 'feedback error'; return; }
            currentImportIndex = 0; successfullyImportedCount = 0; skippedCount = 0; replacedCount = 0;
            importFeedback.textContent = `Starting import of ${importedRoomsQueue.length} room(s)...`; importFeedback.className = 'feedback info';
            processImportQueue();
        } catch (e) { console.error('Import JSON error:', e); importFeedback.textContent = `Error: ${e.message}`; importFeedback.className = 'feedback error'; }
    }
    function processImportQueue() {
        if(modifyConflictFeedback){modifyConflictFeedback.className='feedback';modifyConflictFeedback.textContent='';}
        if (currentImportIndex >= importedRoomsQueue.length) {
            importFeedback.textContent = `Import complete. Imported: ${successfullyImportedCount}. Replaced: ${replacedCount}. Skipped: ${skippedCount}.`;
            importFeedback.className = (successfullyImportedCount > 0 || replacedCount > 0) ? 'feedback success' : 'feedback info';
            renderRoomList(); populateBuildingDropdowns();
            if (jsonImportFile) jsonImportFile.value = ''; if (jsonPasteArea) jsonPasteArea.value = '';
            return;
        }
        const roomToImport = { ...importedRoomsQueue[currentImportIndex] };
        delete roomToImport.id; delete roomToImport.savedAt;
        currentExistingRoom = findRoom(roomToImport.buildingName, roomToImport.roomIdentifier);
        if (currentExistingRoom) { currentConflictingRoom = roomToImport; showConflictModal(currentConflictingRoom, currentExistingRoom); }
        else { addRoomToStorageInternal(roomToImport); successfullyImportedCount++; currentImportIndex++; processImportQueue(); }
    }
    function formatRoomDataForPreview(room) { /* ... (as before) ... */ return `<p><strong>Building:</strong> ${escapeHtml(room?.buildingName)}</p><p><strong>Room ID:</strong> ${escapeHtml(room?.roomIdentifier)}</p><p><strong>Purpose:</strong> ${escapeHtml(room?.roomPurpose)}</p>`; }
    function showConflictModal(newRoom, existingRoom) {
        if (!conflictModal || !importingRoomDetailsPreview || !existingRoomDetailsPreview || !conflictBuildingNew || !conflictRoomIDNew) return;
        importingRoomDetailsPreview.innerHTML = formatRoomDataForPreview(newRoom);
        existingRoomDetailsPreview.innerHTML = formatRoomDataForPreview(existingRoom);
        conflictBuildingNew.value = newRoom.buildingName; conflictRoomIDNew.value = newRoom.roomIdentifier;
        conflictModal.style.display = 'block'; conflictBuildingNew.focus();
    }
    function closeConflictModal() { if (conflictModal) conflictModal.style.display = 'none'; currentConflictingRoom = null; currentExistingRoom = null; if(modifyConflictFeedback){modifyConflictFeedback.className='feedback';modifyConflictFeedback.textContent='';}}
    if(closeConflictModalBtn) closeConflictModalBtn.onclick = () => { skippedCount++; currentImportIndex++; closeConflictModal(); processImportQueue(); };
    if(skipConflictBtn) skipConflictBtn.onclick = () => { skippedCount++; currentImportIndex++; closeConflictModal(); processImportQueue(); };
    if(replaceConflictBtn) replaceConflictBtn.onclick = () => {
        if (currentConflictingRoom && currentExistingRoom) { tryMigrateRoomTileData(currentConflictingRoom); currentConflictingRoom.id = currentExistingRoom.id; addRoomToStorageInternal(currentConflictingRoom, currentExistingRoom.id); replacedCount++; }
        currentImportIndex++; closeConflictModal(); processImportQueue();
    };
    if(saveModifiedConflictBtn) {
        saveModifiedConflictBtn.onclick = () => {
            if (!currentConflictingRoom || !conflictBuildingNew || !conflictRoomIDNew || !modifyConflictFeedback) return;
            const newBuilding = conflictBuildingNew.value.trim(); const newRoomIdVal = conflictRoomIDNew.value.trim();
            if (!newBuilding || !newRoomIdVal) { modifyConflictFeedback.textContent = 'Building & Room ID required.'; modifyConflictFeedback.className = 'feedback error'; return; }
            const stillExisting = findRoom(newBuilding, newRoomIdVal);
            if (stillExisting && stillExisting.id !== currentExistingRoom?.id) { modifyConflictFeedback.textContent = 'Modified ID conflicts with another room.'; modifyConflictFeedback.className = 'feedback error'; existingRoomDetailsPreview.innerHTML = formatRoomDataForPreview(stillExisting); return; }
            else if (currentExistingRoom && newBuilding.toLowerCase() === currentExistingRoom.buildingName.toLowerCase() && newRoomIdVal.toLowerCase() === currentExistingRoom.roomIdentifier.toLowerCase()) { modifyConflictFeedback.textContent = 'IDs still match original conflict.'; modifyConflictFeedback.className = 'feedback error'; return; }
            currentConflictingRoom.buildingName = newBuilding; currentConflictingRoom.roomIdentifier = newRoomIdVal;
            delete currentConflictingRoom.id; tryMigrateRoomTileData(currentConflictingRoom); addRoomToStorageInternal(currentConflictingRoom);
            successfullyImportedCount++; currentImportIndex++; closeConflictModal(); processImportQueue();
        };
    }
    function setupFilterConditionalInput(selectElement, otherInputElement) {
        if (selectElement && otherInputElement) {
            const update = () => { const show = selectElement.value === 'Other'; otherInputElement.style.display = show ? 'block' : 'none'; if (!show) otherInputElement.value = ''; };
            selectElement.addEventListener('change', update); update();
        }
    }
    if (filterRoomPurposeSelect && filterRoomPurposeOther) setupFilterConditionalInput(filterRoomPurposeSelect, filterRoomPurposeOther);
    if (filterLightFixtureTypeSelect && filterLightFixtureTypeOther) setupFilterConditionalInput(filterLightFixtureTypeSelect, filterLightFixtureTypeOther);
    if (filterFloorTypeSelect && filterFloorTypeOther) setupFilterConditionalInput(filterFloorTypeSelect, filterFloorTypeOther);
    function applyFilters() {
        if (!filterResultsContainer || !filterFeedback) return;
        filterFeedback.textContent = ''; filterFeedback.className = 'feedback';
        const filters = {
            buildingName: filterBuildingNameInput.value.trim().toLowerCase(), roomIdentifier: filterRoomIdentifierInput.value.trim().toLowerCase(),
            roomPurpose: filterRoomPurposeSelect.value, roomPurposeOther: filterRoomPurposeOther.value.trim().toLowerCase(),
            lightFixtureType: filterLightFixtureTypeSelect.value, lightFixtureTypeOther: filterLightFixtureTypeOther.value.trim().toLowerCase(),
            overallCondition: filterOverallConditionSelect.value, asbestosCeiling: filterHasAsbestosCeilingSelect.value,
            floorType: filterFloorTypeSelect.value, floorTypeOther: filterFloorTypeOther.value.trim().toLowerCase()
        };
        const filteredRooms = getStoredRooms().filter(room => {
            let match = true;
            if (filters.buildingName && (!room.buildingName || !room.buildingName.toLowerCase().includes(filters.buildingName))) match = false;
            if (match && filters.roomIdentifier && (!room.roomIdentifier || !room.roomIdentifier.toLowerCase().startsWith(filters.roomIdentifier))) match = false;
            if (match && filters.roomPurpose) {
                if (filters.roomPurpose === 'Other') { if (!(room.roomPurpose === 'Other' && room.roomPurposeOther?.toLowerCase().includes(filters.roomPurposeOther))) match = false; }
                else if (room.roomPurpose !== filters.roomPurpose) match = false;
            }
            if (match && filters.lightFixtureType) {
                if (filters.lightFixtureType === 'Other') { if (!room.lightFixtures?.some(f => f.type === 'Other' && f.typeOtherSpecify?.toLowerCase().includes(filters.lightFixtureTypeOther))) match = false; }
                else if (!room.lightFixtures?.some(f => f.type === filters.lightFixtureType)) match = false;
            }
            if (match && filters.overallCondition && room.conditionValues?.overall !== filters.overallCondition) match = false;
            if (match && filters.asbestosCeiling) {
                if (room.roomMakeup?.ceiling?.type === 'Drop Ceiling') { if (room.roomMakeup.ceiling.asbestosInCeiling !== filters.asbestosCeiling) match = false; }
                else match = false;
            }
            if (match && filters.floorType) {
                if (filters.floorType === 'Other') { if (!(room.roomMakeup?.floor?.type === 'Other' && room.roomMakeup.floor.typeOther?.toLowerCase().includes(filters.floorTypeOther))) match = false; }
                else if (room.roomMakeup?.floor?.type !== filters.floorType) match = false;
            }
            return match;
        });
        renderRoomList(filteredRooms, filterResultsContainer, true);
        filterFeedback.textContent = `Found ${filteredRooms.length} room(s).`;
        filterFeedback.className = filteredRooms.length > 0 ? 'feedback success' : 'feedback info';
    }
    if (filterForm) filterForm.addEventListener('submit', e => { e.preventDefault(); applyFilters(); });
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
            if (filterForm) filterForm.reset();
            if (filterRoomPurposeOther) { filterRoomPurposeOther.style.display = 'none'; filterRoomPurposeOther.value = ''; }
            if (filterLightFixtureTypeOther) { filterLightFixtureTypeOther.style.display = 'none'; filterLightFixtureTypeOther.value = ''; }
            if (filterFloorTypeOther) { filterFloorTypeOther.style.display = 'none'; filterFloorTypeOther.value = ''; }
            if (filterResultsContainer) filterResultsContainer.innerHTML = '<p class="empty-list-message">Enter filter criteria and click "Apply Filters".</p>';
            if (filterFeedback) { filterFeedback.textContent = ''; filterFeedback.className = 'feedback'; }
        });
    }
    window.onkeydown = e => {
        if (e.key==='Escape') {
            if (conflictModal?.style.display==='block') { skippedCount++; currentImportIndex++; closeConflictModal(); processImportQueue(); }
            else if (roomDetailModal?.style.display==='block') closeModal();
            else if (editingRoomIdInput.value && document.getElementById('AddRoomView')?.classList.contains('active-view')) cancelEditBtn?.click();
        }
    };
    window.onclick = e => {
        if (e.target==roomDetailModal) closeModal();
        else if (e.target==conflictModal) { skippedCount++; currentImportIndex++; closeConflictModal(); processImportQueue(); }
    };

    // Initial App Setup
    if (roomForm) {
        initializeFormConditionalLogic(roomForm); // Initialize conditional logic for the main form
        addStickyFieldListeners(roomForm); // Add listeners for sticky behavior
    }
    if (filterForm) {
        // Conditional logic for filter form is already initialized via setupFilterConditionalInput calls
    }

    populateBuildingDropdowns();
    setActiveView('ViewRoomsView');
    console.log("App Initial Setup: Complete.");
});
