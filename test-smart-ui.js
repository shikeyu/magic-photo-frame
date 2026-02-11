
const SmartUIManager = require('./smart-ui.js');

function runTests() {
    console.log('Running SmartUIManager Tests...');

    let showCalled = 0;
    let hideCalled = 0;
    let isMobile = false;

    const mockView = {
        showButtons: () => { showCalled++; console.log('View: showButtons'); },
        hideButtons: () => { hideCalled++; console.log('View: hideButtons'); },
        isMobile: () => isMobile
    };

    // Mock setTimeout
    const originalSetTimeout = setTimeout;
    const originalClearTimeout = clearTimeout;
    let timers = {};
    let timerIdCounter = 0;

    global.setTimeout = (cb, delay) => {
        const id = ++timerIdCounter;
        timers[id] = { cb, delay, start: Date.now() };
        return id;
    };
    global.clearTimeout = (id) => {
        delete timers[id];
    };

    // Helper to fast forward time
    function advanceTime(ms) {
        // Simple mock: just execute callbacks that would have fired
        // This is not perfect but enough for logic check
        for (const id in timers) {
            timers[id].delay -= ms;
            if (timers[id].delay <= 0) {
                const cb = timers[id].cb;
                delete timers[id];
                cb();
            }
        }
    }

    try {
        // Test 1: Initialization
        console.log('\nTest 1: Initialization');
        const ui = new SmartUIManager({ hideDelay: 1000 }, mockView);
        ui.start();
        assert(showCalled === 1, 'Should call showButtons on start');
        assert(ui.isVisible === true, 'Should be visible initially');

        // Test 2: Auto Hide
        console.log('\nTest 2: Auto Hide');
        advanceTime(1100);
        assert(hideCalled === 1, 'Should call hideButtons after delay');
        assert(ui.isVisible === false, 'Should be invisible after delay');

        // Test 3: Interaction wakes up
        console.log('\nTest 3: Interaction Wake Up');
        ui.onInteraction();
        assert(showCalled === 2, 'Should call showButtons on interaction');
        assert(ui.isVisible === true, 'Should be visible again');

        // Test 4: Mouse Move (Desktop)
        console.log('\nTest 4: Mouse Move (Desktop)');
        isMobile = false;
        ui.hide(); // Force hide
        hideCalled = 2; // update count
        ui.onMouseMove();
        assert(showCalled === 3, 'Should show on mouse move (Desktop)');

        // Test 5: Mouse Move (Mobile) - Should NOT show
        console.log('\nTest 5: Mouse Move (Mobile)');
        isMobile = true;
        ui.hide();
        const prevShow = showCalled;
        ui.onMouseMove();
        assert(showCalled === prevShow, 'Should NOT show on mouse move (Mobile)');

        // Test 6: Double Tap (Mobile)
        console.log('\nTest 6: Double Tap (Mobile)');
        ui.onDoubleTap();
        assert(showCalled === prevShow + 1, 'Should show on double tap');

        console.log('\nALL TESTS PASSED');

    } catch (e) {
        console.error('\nTEST FAILED:', e.message);
        process.exit(1);
    } finally {
        global.setTimeout = originalSetTimeout;
        global.clearTimeout = originalClearTimeout;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
    console.log('PASS:', message);
}

runTests();
